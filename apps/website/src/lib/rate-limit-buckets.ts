import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

// Check if Upstash Redis is configured
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client only if configured
const redis = isRedisConfigured ? Redis.fromEnv() : null;

// Noop rate limiter for when Redis isn't configured
const noopRateLimiter = {
  limit: async (_identifier: string) => ({
    success: true,
    limit: 0,
    remaining: 0,
    reset: 0,
    pending: Promise.resolve(),
  }),
};

/**
 * Rate limit buckets with different policies
 * 
 * Bucket 1: Intake (forms, lead capture, contact, downloads)
 * - Fail-open: if Upstash down, accept and log
 * 
 * Bucket 2: Auth (signin, signup, password reset, magic links)
 * - Fail-soft: if Upstash down, return 429 with delay
 */
export type RateLimitBucket =
  | 'intake'
  | 'auth_signin'
  | 'auth_signup'
  | 'auth_reset'
  | 'auth_verify';

// Rate limit configurations per bucket
const bucketConfigs: Record<RateLimitBucket, { 
  limiter: Ratelimit | typeof noopRateLimiter;
  burstLimiter?: Ratelimit | typeof noopRateLimiter; // Optional burst cushion
  failMode: 'open' | 'soft' 
}> = {
  // Intake: 10 requests / 1 minute, 60 / 1 hour (burst cushion)
  intake: {
    limiter: redis
      ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(10, '1 m'),
          prefix: 'rate:intake:1m:',
          analytics: true,
        })
      : noopRateLimiter,
    burstLimiter: redis
      ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(60, '1 h'),
          prefix: 'rate:intake:1h:',
          analytics: true,
        })
      : noopRateLimiter,
    failMode: 'open', // Fail-open: allow through if Redis down
  },

  // Auth signin: 5 requests / 1 minute, 20 / 1 hour
  auth_signin: {
    limiter: redis
      ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(5, '1 m'),
          prefix: 'rate:auth_signin:',
          analytics: true,
        })
      : noopRateLimiter,
    failMode: 'soft', // Fail-soft: return 429 with delay if Redis down
  },

  // Auth signup: 3 requests / 1 hour per IP
  auth_signup: {
    limiter: redis
      ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(3, '1 h'),
          prefix: 'rate:auth_signup:',
          analytics: true,
        })
      : noopRateLimiter,
    failMode: 'soft',
  },

  // Password reset: 3 requests / 15 minutes per IP
  auth_reset: {
    limiter: redis
      ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(3, '15 m'),
          prefix: 'rate:auth_reset:',
          analytics: true,
        })
      : noopRateLimiter,
    failMode: 'soft',
  },

  // Email verify / magic link: 6 requests / 1 hour per IP
  auth_verify: {
    limiter: redis
      ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(6, '1 h'),
          prefix: 'rate:auth_verify:',
          analytics: true,
        })
      : noopRateLimiter,
    failMode: 'soft',
  },
};

/**
 * Extract client IP from request (Netlify-aware)
 * Priority: x-nf-client-connection-ip > x-forwarded-for > x-real-ip > cf-connecting-ip
 */
export function getClientIP(request: NextRequest): string {
  // Netlify-specific header (most reliable on Netlify)
  const netlifyIP = request.headers.get('x-nf-client-connection-ip');
  if (netlifyIP) return netlifyIP.trim();

  // Standard forwarded header (first IP is client)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIP = forwardedFor.split(',')[0]?.trim();
    if (firstIP) return firstIP;
  }

  // Fallback headers
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP.trim();

  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP.trim();

  return '127.0.0.1';
}

/**
 * Hash a string using Web Crypto API (Edge-safe)
 */
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate a stable rate limit key
 * Format: ${bucket}:${clientIp}:${uaHash8}
 * 
 * Optional UA hash reduces "one IP, many legit users" pain
 */
export async function generateRateLimitKey(
  bucket: RateLimitBucket,
  clientIP: string,
  userAgent?: string | null
): Promise<string> {
  let key = `${bucket}:${clientIP}`;

  // Optional: append coarse user agent hash
  if (userAgent) {
    const uaHash = await hashString(userAgent.toLowerCase());
    key = `${key}:${uaHash.slice(0, 8)}`;
  }

  return key;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  error?: string;
}

/**
 * Apply rate limiting for a specific bucket
 * 
 * @param bucket - Rate limit bucket
 * @param request - Next.js request
 * @returns Rate limit result with success status
 */
export async function rateLimit(
  bucket: RateLimitBucket,
  request: NextRequest
): Promise<RateLimitResult> {
  // Check if rate limiting is enabled for this context
  const context = process.env.CONTEXT;
  if (context === 'deploy-preview' || process.env.NETLIFY_DEV) {
    // Deploy previews: no rate limiting
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }

  const config = bucketConfigs[bucket];
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent');
  const key = await generateRateLimitKey(bucket, clientIP, userAgent);

  try {
    // Check primary limiter
    const result = await config.limiter.limit(key);

    if (!result.success) {
      // Primary limit exceeded
      return {
        success: false,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    }

    // If primary limiter passes, check burst limiter (if configured)
    if (config.burstLimiter) {
      const burstResult = await config.burstLimiter.limit(key);
      if (!burstResult.success) {
        // Burst limit exceeded - return burst limiter result
        return {
          success: false,
          limit: burstResult.limit,
          remaining: burstResult.remaining,
          reset: burstResult.reset,
        };
      }
      // Both limiters passed - return burst limiter values (more restrictive)
      return {
        success: true,
        limit: Math.min(result.limit, burstResult.limit),
        remaining: Math.min(result.remaining, burstResult.remaining),
        reset: Math.max(result.reset, burstResult.reset),
      };
    }

    // No burst limiter - return primary result
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // Handle rate limiting service failure
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[RATE LIMIT ERROR] ${bucket} rate limiting failed:`, errorMessage);

    if (config.failMode === 'open') {
      // Fail-open: allow request through (intake bucket)
      return {
        success: true,
        limit: 0,
        remaining: 0,
        reset: 0,
        error: 'Rate limiting unavailable, request allowed',
      };
    } else {
      // Fail-soft: return 429 (auth bucket)
      // Add small delay to slow brute force (300-800ms)
      const delay = 300 + Math.floor(Math.random() * 500);
      await new Promise((resolve) => setTimeout(resolve, delay));

      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Date.now() + 60000, // 1 minute from now
        error: 'Rate limiting unavailable, request blocked',
      };
    }
  }
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    headers['Retry-After'] = retryAfter.toString();
  }

  return headers;
}

// Log warning if rate limiting is disabled
if (!isRedisConfigured && process.env.NODE_ENV === 'production') {
  console.warn(
    '[rate-limit] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN not configured. Rate limiting disabled.'
  );
}

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Upstash Redis is configured
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client only if configured
const redis = isRedisConfigured ? Redis.fromEnv() : null;

// Noop rate limiter for when Redis isn't configured
// Always allows requests through (graceful degradation)
const noopRateLimiter = {
  limit: async (_identifier: string) => ({
    success: true,
    limit: 0,
    remaining: 0,
    reset: 0,
    pending: Promise.resolve(),
  }),
};

// IP-based rate limiting: 5 requests per 10 minutes per IP
export const ipRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      prefix: 'intake:ip:',
      analytics: true,
    })
  : noopRateLimiter;

// Email-based rate limiting: 3 requests per 10 minutes per email
export const emailRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '10 m'),
      prefix: 'intake:email:',
      analytics: true,
    })
  : noopRateLimiter;

// Log warning if rate limiting is disabled
if (!isRedisConfigured && process.env.NODE_ENV === 'production') {
  console.warn(
    '[rate-limit] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN not configured. Rate limiting disabled.'
  );
}

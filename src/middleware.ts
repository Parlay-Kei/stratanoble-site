import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis connection
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiting configurations for different API endpoints
const rateLimiters = {
  // General API routes - 100 requests per 10 minutes
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_GENERAL_REQUESTS || '100'),
      `${process.env.RATE_LIMIT_GENERAL_WINDOW || '10'} m`
    ),
    analytics: true,
    prefix: '@upstash/ratelimit/general',
  }),

  // Authentication routes - stricter limits
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_AUTH_REQUESTS || '20'),
      `${process.env.RATE_LIMIT_AUTH_WINDOW || '15'} m`
    ),
    analytics: true,
    prefix: '@upstash/ratelimit/auth',
  }),

  // Payment/checkout routes - moderate limits
  payment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_PAYMENT_REQUESTS || '50'),
      `${process.env.RATE_LIMIT_PAYMENT_WINDOW || '5'} m`
    ),
    analytics: true,
    prefix: '@upstash/ratelimit/payment',
  }),

  // Contact/form submissions - prevent spam
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_CONTACT_REQUESTS || '10'),
      `${process.env.RATE_LIMIT_CONTACT_WINDOW || '10'} m`
    ),
    analytics: true,
    prefix: '@upstash/ratelimit/contact',
  }),
};

function getRateLimiter(pathname: string) {
  if (pathname.includes('/api/stripe/') || pathname.includes('/api/checkout')) {
    return rateLimiters.payment;
  }
  if (pathname.includes('/api/auth') || pathname.includes('/api/login')) {
    return rateLimiters.auth;
  }
  if (pathname.includes('/api/contact') || pathname.includes('/api/email') || pathname.includes('/api/waitlist')) {
    return rateLimiters.contact;
  }
  return rateLimiters.general;
}

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  
  return request.ip || '127.0.0.1';
}

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip rate limiting in development mode
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMITING === 'true') {
    return NextResponse.next();
  }

  // Skip rate limiting if Redis is not configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Upstash Redis not configured - skipping rate limiting');
    return NextResponse.next();
  }

  try {
    const ip = getClientIP(request);
    const rateLimiter = getRateLimiter(request.nextUrl.pathname);
    
    const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          limit,
          reset: new Date(reset).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.round((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    return response;
  } catch (error) {
    console.error('Rate limiting middleware error:', error);
    // Fail open - allow request if rate limiting fails
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all API routes except:
     * - Webhooks (they have their own rate limiting)
     * - Health checks
     * - Static files and assets
     */
    '/api/((?!webhooks|health|_next/static|favicon.ico).*)',
  ],
};
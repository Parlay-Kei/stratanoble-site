import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
// Temporarily disable Supabase import for Edge Runtime compatibility
// import { createClient } from '@supabase/supabase-js';
import { handleAppLink } from '@/lib/deepLinking';

// Initialize Redis connection with secure env vars
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

// Rate limiting configurations for different API endpoints
const rateLimiters = redis ? {
  // General API routes - 100 requests per 10 minutes
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_GENERAL_REQUESTS || '100'),
      '10 m'
    ),
    analytics: true,
    prefix: '@upstash/ratelimit/general',
  }),

  // Authentication routes - stricter limits
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_AUTH_REQUESTS || '20'),
      '15 m'
    ),
    analytics: true,
    prefix: '@upstash/ratelimit/auth',
  }),

  // Payment/checkout routes - moderate limits
  payment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_PAYMENT_REQUESTS || '50'),
      '5 m'
    ),
    analytics: true,
    prefix: '@upstash/ratelimit/payment',
  }),

  // Contact/form submissions - prevent spam
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      parseInt(process.env.RATE_LIMIT_CONTACT_REQUESTS || '10'),
      '10 m'
    ),
    analytics: true,
    prefix: '@upstash/ratelimit/contact',
  }),
} : null;

function getRateLimiter(pathname: string) {
  if (!rateLimiters) return null;
  
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
  
  return '127.0.0.1';
}

async function checkAchieveryAuth(request: NextRequest) {
  // Temporarily disabled for Edge Runtime compatibility
  // TODO: Re-implement with Edge Runtime compatible approach
  return false;

  /*
  try {
    // Get Supabase URL and anon key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the session token from cookies
    const token = request.cookies.get('sb-access-token')?.value ||
                  request.cookies.get('sb-refresh-token')?.value;

    if (!token) {
      return false;
    }

    // Verify the session with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    return !error && user;
  } catch (error) {
    return false;
  }
  */
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Temporarily disable middleware to fix runtime error
  // TODO: Re-enable after fixing Upstash Redis issues
  return NextResponse.next();
  
  // Handle deep linking app requests
  const appLinkResponse = handleAppLink(request);
  if (appLinkResponse) {
    return appLinkResponse;
  }

  // Handle ACHIEVERY route protection
  if (pathname.startsWith('/achievery/') || pathname === '/achievery') {
    // Allow public access to preview page and auth page
    if (pathname === '/achievery/auth' || pathname === '/achievery-preview') {
      return NextResponse.next();
    }

    // Check authentication for protected ACHIEVERY routes (dashboard, actions, etc.)
    const isAuthenticated = await checkAchieveryAuth(request);

    if (!isAuthenticated) {
      // Redirect to auth page with return URL
      const authUrl = new URL('/achievery/auth', request.url);
      authUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(authUrl);
    }
  }

  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip rate limiting in development mode
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMITING === 'true') {
    return NextResponse.next();
  }

  // Skip rate limiting if Redis is not configured
  if (!redisUrl || !redisToken) {
    return NextResponse.next();
  }

  try {
    const ip = getClientIP(request);
    const rateLimiter = getRateLimiter(request.nextUrl.pathname);
    
    if (!rateLimiter) {
      return NextResponse.next();
    }
    
    const { success, limit, reset, remaining } = await rateLimiter?.limit(ip) || { success: true, limit: 0, reset: 0, remaining: 0 };

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
    // Fail open - allow request if rate limiting fails
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match:
     * - All API routes (for rate limiting) except webhooks, health, csrf
     * - All /achievery routes (for authentication)
     * - Deep linking routes
     */
    '/api/((?!webhook|health|csrf|_next/static|favicon.ico).*)',
    '/achievery/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

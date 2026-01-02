import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { handleAppLink } from '@/lib/deepLinking';
import { rateLimit, createRateLimitHeaders, getClientIP } from '@/lib/rate-limit-buckets';

// Initialize Redis connection with secure env vars
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Hard fail in production if Upstash vars are missing (log error but continue without rate limiting)
if (process.env.NODE_ENV === 'production' && (!redisUrl || !redisToken)) {
  console.error('[SECURITY WARNING] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured in production. Rate limiting is DISABLED.');
}

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

// Use Netlify-aware IP extraction from rate-limit-buckets
// (getClientIP is imported from rate-limit-buckets)

/**
 * Check if user is authenticated for Achievery routes
 * Uses Edge Runtime compatible auth checking with cookies
 */
async function checkAchieveryAuth(request: NextRequest): Promise<boolean> {
  try {
    // Get Supabase URL and anon key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[AUTH ERROR] Supabase environment variables not configured');
      return false;
    }

    // Check for auth cookie - Supabase stores session in cookies with pattern:
    // sb-{project-ref}-auth-token (for newer versions)
    // or sb-access-token / sb-refresh-token (for older versions)
    const cookies = request.cookies;

    // Look for any Supabase auth cookie
    let authToken: string | undefined;

    // Try to find the main auth token cookie
    cookies.getAll().forEach(cookie => {
      if (cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')) {
        authToken = cookie.value;
      }
    });

    // Fallback to legacy cookie names
    if (!authToken) {
      authToken = cookies.get('sb-access-token')?.value ||
                  cookies.get('sb-refresh-token')?.value;
    }

    if (!authToken) {
      return false;
    }

    // For Edge Runtime, we validate the token by checking if it exists and is not empty
    // Full token validation happens server-side in API routes
    // This is a lightweight check to prevent unauthorized access
    try {
      // Parse the auth token (it should be a JSON string or JWT)
      if (authToken.length < 10) {
        return false;
      }

      // Basic JWT structure validation (should have 3 parts separated by dots)
      const parts = authToken.split('.');
      if (parts.length === 3) {
        // This looks like a JWT - decode payload to check expiry
        const payload = JSON.parse(atob(parts[1]));
        const exp = payload.exp;

        if (exp && typeof exp === 'number') {
          const now = Math.floor(Date.now() / 1000);
          if (exp < now) {
            // Token is expired
            return false;
          }
        }

        return true;
      }

      // If it's a JSON object (session data), check if it has an access_token
      const sessionData = JSON.parse(authToken);
      if (sessionData && sessionData.access_token) {
        return true;
      }

      return false;
    } catch (parseError) {
      // If we can't parse it, it might be a simple token string
      // In this case, we accept it if it's long enough and not obviously invalid
      return authToken.length > 20;
    }
  } catch (error) {
    console.error('[AUTH ERROR] Error checking Achievery auth:', error);
    return false;
  }
}

/**
 * Main middleware function - applies security in the correct order
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // STEP 1: Allow public routes and static assets (no auth needed)
  const publicRoutes = [
    '/',
    '/pricing',
    '/contact',
    '/about',
    '/achievery/auth',
    '/achievery-preview',
  ];

  const publicApiRoutes = [
    '/api/health',
    '/api/csrf',
  ];

  // Allow static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/')
  ) {
    return NextResponse.next();
  }

  // Allow webhook routes (these validate their own signatures)
  if (pathname.startsWith('/api/webhook/')) {
    return NextResponse.next();
  }

  // Allow public pages
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (publicApiRoutes.some(route => pathname === route)) {
    return NextResponse.next();
  }

  // STEP 2: Handle deep linking
  const appLinkResponse = handleAppLink(request);
  if (appLinkResponse) {
    return appLinkResponse;
  }

  // STEP 3: Apply auth checks to protected routes
  const protectedPrefixes = [
    '/achievery/',
    '/dashboard/',
    '/admin/',
  ];

  const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (isProtectedRoute) {
    // Special handling for /achievery routes
    if (pathname.startsWith('/achievery/') || pathname === '/achievery') {
      // Already allowed /achievery/auth and /achievery-preview above
      // Check authentication for all other Achievery routes
      const isAuthenticated = await checkAchieveryAuth(request);

      if (!isAuthenticated) {
        // Redirect to auth page with return URL
        const authUrl = new URL('/achievery/auth', request.url);
        authUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(authUrl);
      }
    }

    // For /dashboard and /admin routes, authentication is handled by NextAuth
    // which runs separately - middleware just needs to let them through
    // The page components themselves will check auth and redirect if needed
  }

  // STEP 4: Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    // Disable rate limiting on Deploy Previews to avoid blocking QA
    // Netlify sets CONTEXT=deploy-preview for preview deployments
    if (process.env.CONTEXT === 'deploy-preview' || process.env.NETLIFY_DEV) {
      return NextResponse.next();
    }

    // STEP 4a: Auth rate limiting (fail-soft) - targeted to high-risk endpoints only
    if (pathname.startsWith('/api/auth/')) {
      const method = request.method;
      
      // Benign endpoints that should NOT be rate limited (keep lobby open)
      const benignEndpoints = [
        '/api/auth/session',      // Session checks (frequent polling)
        '/api/auth/providers',    // Provider list (UI needs this)
        '/api/auth/csrf',         // CSRF token (needed for forms)
        '/api/auth/error',         // Error page
      ];
      const isBenign = benignEndpoints.some(endpoint => pathname === endpoint) ||
                       (pathname === '/api/auth/signin' && method === 'GET'); // Sign-in page
      
      if (isBenign) {
        return NextResponse.next();
      }
      
      // Determine which auth bucket to use based on endpoint (lock the vault)
      let authBucket: 'auth_signin' | 'auth_verify' | null = null;
      
      // High-risk endpoints that need rate limiting (POST only)
      if (method === 'POST') {
        // Credentials sign-in (brute force target)
        // NextAuth routes: /api/auth/callback/credentials or /api/auth/signin with credentials
        if (pathname === '/api/auth/callback/credentials') {
          authBucket = 'auth_signin';
        }
        // Email/magic link verification (bot target)
        // NextAuth routes: /api/auth/callback/email or /api/auth/signin/email
        else if (pathname === '/api/auth/callback/email' || 
                 pathname === '/api/auth/signin/email') {
          authBucket = 'auth_verify';
        }
        // Generic signin POST - could be credentials or email, default to signin bucket
        // (More restrictive is safer for brute force protection)
        else if (pathname === '/api/auth/signin') {
          authBucket = 'auth_signin';
        }
      }
      
      // Apply rate limiting only to high-risk endpoints
      if (authBucket) {
        try {
          const rateLimitResult = await rateLimit(authBucket, request);
          
          if (!rateLimitResult.success) {
            // Fail-soft: Add delay to slow brute force (300-800ms)
            const delay = 300 + Math.floor(Math.random() * 500);
            await new Promise((resolve) => setTimeout(resolve, delay));
            
            return new NextResponse(
              JSON.stringify({
                error: 'Rate limit exceeded',
                message: 'Try again shortly.',
              }),
              {
                status: 429,
                headers: {
                  'Content-Type': 'application/json',
                  ...createRateLimitHeaders(rateLimitResult),
                },
              }
            );
          }
          
          // Add rate limit headers to successful responses
          const response = NextResponse.next();
          const headers = createRateLimitHeaders(rateLimitResult);
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
          
          return response;
        } catch (error) {
          // Fail-soft: If rate limiting fails, return 429 with delay
          console.error('[RATE LIMIT ERROR] Auth rate limiting failed:', error);
          const delay = 300 + Math.floor(Math.random() * 500);
          await new Promise((resolve) => setTimeout(resolve, delay));
          
          return new NextResponse(
            JSON.stringify({
              error: 'Rate limit exceeded',
              message: 'Try again shortly.',
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': '60',
              },
            }
          );
        }
      }
      
      // Allow benign endpoints and non-matching auth routes through
      return NextResponse.next();
    }

    // STEP 4b: General API rate limiting (fail-open for intake routes)
    // Gracefully degrade rate limiting in dev mode
    if (process.env.NODE_ENV === 'development') {
      if (process.env.SKIP_RATE_LIMITING === 'true') {
        return NextResponse.next();
      }
    }

    // Skip rate limiting if Redis is not configured
    // In production, this was already logged as an error above
    // Fail-open: allow requests through if rate limiting unavailable
    if (!redis) {
      if (process.env.NODE_ENV === 'development') {
        // In dev, this is expected - just continue
        return NextResponse.next();
      }
      // In production, continue without rate limiting (but we logged an error earlier)
      // This is fail-open behavior - marketing pages should not be blocked
      return NextResponse.next();
    }

    try {
      const ip = getClientIP(request);
      const rateLimiter = getRateLimiter(pathname);

      if (!rateLimiter) {
        return NextResponse.next();
      }

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
      console.error('[RATE LIMIT ERROR] Rate limiting failed:', error);
      // Fail open - allow request if rate limiting fails
      return NextResponse.next();
    }
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match:
     * - All API routes (for rate limiting) except static files
     * - All /achievery routes (for authentication)
     * - All /dashboard routes (for authentication awareness)
     * - All /admin routes (for authentication awareness)
     * - Deep linking routes
     * Exclude:
     * - Static files (_next/static, _next/image, favicon.ico)
     */
    '/api/((?!_next/static|favicon.ico).*)',
    '/achievery/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

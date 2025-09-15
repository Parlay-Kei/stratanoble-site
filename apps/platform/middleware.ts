import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './src/lib/supabase';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/achievery',
  '/dashboard',
  '/analytics',
  '/actions',
  '/trust-ledger',
  '/onboarding',
  '/roadmap',
  '/api/trust-ledger',
  '/api/analytics/dashboard',
  '/api/coach-dashboard'
];

// Routes that should redirect authenticated users to dashboard
const AUTH_ROUTES = [
  '/auth',
  '/login',
  '/signup',
  '/signin'
];

// Public API routes (with their own auth validation)
const PUBLIC_API_ROUTES = [
  '/api/analytics/track', // Has its own rate limiting
  '/api/trust-ledger/export' // Public sharing with validation
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Skip middleware for static files and public assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/assets/')
  ) {
    return res;
  }

  // Create Supabase client for middleware
  const supabase = createMiddlewareClient<Database>({ req, res });

  try {
    // Get session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Middleware auth error:', error);
    }

    const isAuthenticated = !!session?.user;
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
    const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

    // Allow public API routes to handle their own authentication
    if (isPublicApiRoute) {
      return res;
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute && isAuthenticated) {
      const redirectUrl = req.nextUrl.searchParams.get('redirect') || '/achievery';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Protect authenticated routes
    if (isProtectedRoute && !isAuthenticated) {
      const redirectUrl = new URL('/auth', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Security headers for protected routes
    if (isProtectedRoute) {
      const response = NextResponse.next();

      // Security headers
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('X-XSS-Protection', '1; mode=block');

      // CSP for protected pages
      response.headers.set(
        'Content-Security-Policy',
        `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;`
      );

      return response;
    }

    // Rate limiting for API routes
    if (pathname.startsWith('/api/') && !isPublicApiRoute) {
      // Basic rate limiting by IP
      const ip = getClientIP(req);
      const rateLimitKey = `api_${ip}`;

      // This would integrate with a proper rate limiting service in production
      // For now, we'll let the individual API endpoints handle their own rate limiting
    }

  } catch (error) {
    console.error('Middleware error:', error);

    // In case of middleware error on protected routes, redirect to auth
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }
  }

  return res;
}

/**
 * Get client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP.trim();
  }

  if (cfIP) {
    return cfIP.trim();
  }

  return 'unknown';
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
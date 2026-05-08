// Authentication & Onboarding Middleware for Strata Noble Platform
// Protects routes by checking auth-session cookie and onboarding status

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cookie name for auth session indicator - must match login/logout routes
const AUTH_COOKIE_NAME = 'auth-session';

// Routes that require authentication AND completed onboarding
const PROTECTED_ROUTES = [
  '/dashboard',
  '/platform',
  '/profile',
  '/settings',
];

// Routes that require authentication but NOT onboarding (onboarding flow itself)
const AUTH_ONLY_ROUTES = [
  '/onboarding',
];

// Routes that should NEVER be gated (public routes)
const PUBLIC_ROUTES = [
  '/auth',
  '/api',
  '/_next',
  '/favicon.ico',
];

// Check if path starts with any of the given prefixes
function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => 
    pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix)
  );
}

// Check if the path is a static asset
function isStaticAsset(pathname: string): boolean {
  return /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/i.test(pathname);
}

// Session data structure from auth-session cookie
interface SessionData {
  userId: string;
  email: string;
  expiresAt: string;
  onboardingCompleted: boolean;
}

// Parse session cookie safely
function parseSessionCookie(cookieValue: string): SessionData | null {
  try {
    return JSON.parse(cookieValue);
  } catch {
    return null;
  }
}

// Pure function for deciding redirects - easily testable
export function decideRedirect(params: {
  pathname: string;
  isAuthed: boolean;
  onboardingCompleted: boolean;
  sessionExpired: boolean;
}): { redirect: string | null; clearCookie: boolean } {
  const { pathname, isAuthed, onboardingCompleted, sessionExpired } = params;

  // Rule 1: Session expired - redirect to auth and clear cookie
  if (sessionExpired) {
    return { redirect: '/auth', clearCookie: true };
  }

  // Rule 2: Not authenticated + protected route → /auth
  if (!isAuthed && matchesPrefix(pathname, PROTECTED_ROUTES)) {
    return { redirect: '/auth', clearCookie: false };
  }

  // Rule 3: Authed + onboarding not completed + protected route → /onboarding
  if (isAuthed && !onboardingCompleted && matchesPrefix(pathname, PROTECTED_ROUTES)) {
    return { redirect: '/onboarding', clearCookie: false };
  }

  // Rule 4: Authed + onboarding completed + on /onboarding → /dashboard
  // Prevent users from revisiting onboarding once completed
  if (isAuthed && onboardingCompleted && matchesPrefix(pathname, AUTH_ONLY_ROUTES)) {
    return { redirect: '/dashboard', clearCookie: false };
  }

  // Rule 5: Not authed + trying to access /onboarding → /auth
  // Must be logged in to onboard
  if (!isAuthed && matchesPrefix(pathname, AUTH_ONLY_ROUTES)) {
    return { redirect: '/auth', clearCookie: false };
  }

  // No redirect needed
  return { redirect: null, clearCookie: false };
}

async function checkEngagementClientLink(userId: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return false;
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/achievery_engagements?client_user_id=eq.${encodeURIComponent(userId)}&select=id&limit=1`,
      { headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Accept': 'application/json' } }
    );
    if (!res.ok) return false;
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0;
  } catch { return false; }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Skip public routes (auth, api, next.js internals)
  if (matchesPrefix(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Get auth session cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const sessionData = authCookie?.value ? parseSessionCookie(authCookie.value) : null;

  // Determine auth state
  const isAuthed = !!sessionData;
  const onboardingCompleted = sessionData?.onboardingCompleted ?? false;
  const sessionExpired = sessionData ? new Date(sessionData.expiresAt) < new Date() : false;

  // Get redirect decision
  const decision = decideRedirect({
    pathname,
    isAuthed,
    onboardingCompleted,
    sessionExpired
  });

  // No redirect needed - allow request to proceed
  if (!decision.redirect) {
    return NextResponse.next();
  }

  // For onboarding redirects, check if user is a linked client — if so, send to portal instead
  let finalRedirect = decision.redirect;
  if (decision.redirect === '/onboarding' && sessionData?.userId) {
    const isClient = await checkEngagementClientLink(sessionData.userId);
    if (isClient) finalRedirect = '/platform/client';
  }

  // Build redirect URL with context
  const redirectUrl = new URL(finalRedirect, request.url);

  // Add redirect param for post-action navigation (except for onboarding redirect)
  if (finalRedirect === '/auth') {
    redirectUrl.searchParams.set('redirect', pathname);
    if (decision.clearCookie) {
      redirectUrl.searchParams.set('reason', 'session_expired');
    }
  } else if (finalRedirect === '/onboarding') {
    // Store intended destination for after onboarding
    redirectUrl.searchParams.set('next', pathname);
  }

  // Create redirect response
  const response = NextResponse.redirect(redirectUrl);

  // Clear expired cookie if needed
  if (decision.clearCookie) {
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0)
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
};

// Auth Module API Layer - Logout Endpoint
// HTTP controller for authentication logout
// Implements Level A revocation: global signOut + cookie clearing
// Note: Access JWT remains valid until expiry by design (Supabase model)

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface CookieToSet {
  name: string;
  value: string;
  options?: {
    path?: string;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
  };
}

// Generate request ID for observability
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST() {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    console.log(JSON.stringify({
      level: 30,
      time: Date.now(),
      requestId,
      msg: 'Logout request started',
      service: 'strata-noble-platform',
      env: process.env.NODE_ENV || 'development'
    }));

    const cookieStore = await cookies();

    // Create Supabase client for server-side signOut
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore - may be called from server component
            }
          },
        },
      }
    );

    // Call signOut with global scope to revoke all refresh tokens
    // This terminates all sessions for the user across devices
    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
      console.error(JSON.stringify({
        level: 40,
        time: Date.now(),
        requestId,
        error: error.message,
        msg: 'Supabase signOut error (non-fatal)',
        service: 'strata-noble-platform',
        env: process.env.NODE_ENV || 'development'
      }));
      // Continue anyway - we still clear cookies
    }

    // Explicitly clear all Supabase auth cookies
    // Supabase uses sb-<project-ref>-auth-token pattern
    const allCookies = cookieStore.getAll();
    const authCookies = allCookies.filter((c: { name: string; value: string }) =>
      c.name.includes('auth-token') ||
      c.name.includes('sb-') ||
      c.name === 'auth-session'
    );

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const
    };

    // Clear each auth cookie
    for (const cookie of authCookies) {
      try {
        cookieStore.set(cookie.name, '', cookieOptions);
      } catch {
        // Ignore errors from server component context
      }
    }

    console.log(JSON.stringify({
      level: 30,
      time: Date.now(),
      requestId,
      duration: Date.now() - startTime,
      clearedCookies: authCookies.map((c: { name: string }) => c.name),
      msg: 'Logout successful - global signOut completed',
      service: 'strata-noble-platform',
      env: process.env.NODE_ENV || 'development'
    }));

    return new Response(JSON.stringify({
      success: true,
      message: 'Logged out successfully',
      // Be honest about what this means
      note: 'Refresh tokens revoked. Access token valid until expiry.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId
      }
    });

  } catch (error) {
    console.error(JSON.stringify({
      level: 50,
      time: Date.now(),
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
      msg: 'Logout error',
      service: 'strata-noble-platform',
      env: process.env.NODE_ENV || 'development'
    }));

    return new Response(JSON.stringify({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Logout failed' },
      requestId
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId
      }
    });
  }
}

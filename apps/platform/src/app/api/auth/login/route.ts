// Modular Auth API Route Handler
// Integrates UI with modular auth system (services imported when path resolution is configured)

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// Cookie name for auth session indicator
const AUTH_COOKIE_NAME = 'auth-session';

// TODO: Import modular services when path resolution is configured
// import { AuthServiceContainer } from '@/modules/auth/services/auth-services';
// import { AuthDomainServiceImpl } from '@/modules/auth/domain/auth-service';

// Initialize modular auth services (placeholder for now)
// const authServiceContainer = new AuthServiceContainer(supabase as any);
// const authDomainService = new AuthDomainServiceImpl();
// const supabaseAuthService = authServiceContainer.getSupabaseAuthService();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // TODO: Replace with modular auth service when path resolution is configured
    // const authResult = await supabaseAuthService.signIn(email, password);
    // const session = authDomainService.createUserSession(authResult.user.id, ipAddress, userAgent);

    // Temporary: Use direct Supabase integration (to be replaced with modular services)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }

    if (data.user && data.session) {
      // Check onboarding status
      let onboardingCompleted = false;
      try {
        const { data: settingsData } = await supabase
          .from('user_platform_settings')
          .select('onboarding_completed')
          .eq('user_id', data.user.id)
          .maybeSingle();

        onboardingCompleted = !!settingsData?.onboarding_completed;
      } catch (err) {
        // Fail-safe: if we can't check onboarding, assume not completed
        console.error('Error checking onboarding status:', err);
        onboardingCompleted = false;
      }

      // Create response with user data
      const response = NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || ''
        },
        session: {
          token: data.session?.access_token,
          expiresAt: data.session?.expires_at
        },
        onboardingCompleted
      });

      // Set httpOnly cookie for middleware auth check
      // Cookie contains user ID for identification, expires when session expires
      const expiresAt = data.session.expires_at 
        ? new Date(data.session.expires_at * 1000) 
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

      response.cookies.set(AUTH_COOKIE_NAME, JSON.stringify({
        userId: data.user.id,
        email: data.user.email,
        expiresAt: expiresAt.toISOString(),
        onboardingCompleted
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: expiresAt
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
      { status: 401 }
    );

  } catch (error: any) {
    console.error('Auth API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authentication failed'
        }
      },
      { status: 500 }
    );
  }
}

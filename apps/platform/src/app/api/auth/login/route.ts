// Modular Auth API Route Handler
// Integrates UI with modular auth system (services imported when path resolution is configured)

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

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

    if (data.user) {
      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || ''
        },
        session: {
          token: data.session?.access_token,
          expiresAt: data.session?.expires_at
        }
      });
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

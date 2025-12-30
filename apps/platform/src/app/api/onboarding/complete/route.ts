// Onboarding Complete API Route
// Completes onboarding and updates auth session cookie

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// Cookie name for auth session indicator - must match middleware and login routes
const AUTH_COOKIE_NAME = 'auth-session';

// Starter actions by phase - keep in sync with domain service
const starterActionsByPhase = {
  explore: [
    'Research people doing what you want to do',
    'Watch tutorials or take a course in this area',
    'Join communities related to your interest',
    'Read articles and books about this topic',
    'Talk to someone who has experience in this field'
  ],
  build: [
    'Create your first prototype or draft',
    'Set up the basic tools and workspace you need',
    'Make a simple version to test your idea',
    'Share early work with trusted friends for feedback',
    'Document what you learn as you build'
  ],
  launch: [
    'Share your work publicly for the first time',
    'Get feedback from real users or customers',
    'Create a simple marketing plan',
    'Set up ways for people to find and contact you',
    'Track results and plan improvements'
  ]
};

export async function POST(request: NextRequest) {
  try {
    // Get existing auth session from cookie
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
    
    if (!authCookie?.value) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(authCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SESSION', message: 'Invalid session' } },
        { status: 401 }
      );
    }

    const userId = sessionData.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SESSION', message: 'Invalid session' } },
        { status: 401 }
      );
    }

    // Parse request body
    const { dreamText, phase } = await request.json();

    // Validate inputs
    if (!dreamText?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'ONBOARDING_INVALID_INPUT', message: 'Dream text is required' } },
        { status: 400 }
      );
    }

    if (!['explore', 'build', 'launch'].includes(phase)) {
      return NextResponse.json(
        { success: false, error: { code: 'ONBOARDING_INVALID_INPUT', message: 'Valid phase is required' } },
        { status: 400 }
      );
    }

    // Check if already completed (idempotent - just return success)
    const { data: existingSettings } = await supabase
      .from('user_platform_settings')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSettings?.onboarding_completed) {
      // Already completed - idempotent success
      const response = NextResponse.json({
        success: true,
        status: 'completed',
        message: 'Onboarding already completed'
      });

      // Ensure cookie reflects completed state
      const updatedSession = {
        ...sessionData,
        onboardingCompleted: true
      };

      response.cookies.set(AUTH_COOKIE_NAME, JSON.stringify(updatedSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(sessionData.expiresAt)
      });

      return response;
    }

    // Create or update user dream
    const { data: dreamData, error: dreamError } = await supabase
      .from('user_dreams')
      .upsert({
        user_id: userId,
        dream_text: dreamText.trim(),
        current_phase: phase,
        starter_actions: starterActionsByPhase[phase as keyof typeof starterActionsByPhase],
        is_active: true
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (dreamError) {
      console.error('Error creating dream:', dreamError);
      return NextResponse.json(
        { success: false, error: { code: 'ONBOARDING_PERSISTENCE_FAILED', message: 'Failed to save dream' } },
        { status: 500 }
      );
    }

    // Update platform settings
    const { error: settingsError } = await supabase
      .from('user_platform_settings')
      .upsert({
        user_id: userId,
        onboarding_completed: true,
        preferred_phase: phase
      }, {
        onConflict: 'user_id'
      });

    if (settingsError) {
      console.error('Error updating settings:', settingsError);
      return NextResponse.json(
        { success: false, error: { code: 'ONBOARDING_PERSISTENCE_FAILED', message: 'Failed to update settings' } },
        { status: 500 }
      );
    }

    // Create success response
    const response = NextResponse.json({
      success: true,
      status: 'completed',
      dreamId: dreamData.id,
      phase,
      message: 'Onboarding completed successfully'
    });

    // Update auth session cookie with onboardingCompleted: true
    const updatedSession = {
      ...sessionData,
      onboardingCompleted: true
    };

    response.cookies.set(AUTH_COOKIE_NAME, JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(sessionData.expiresAt)
    });

    return response;

  } catch (error: any) {
    console.error('Onboarding complete error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to complete onboarding'
        }
      },
      { status: 500 }
    );
  }
}

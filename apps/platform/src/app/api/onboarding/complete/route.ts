import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

const AUTH_COOKIE_NAME = 'auth-session'

export async function POST(request: NextRequest) {
  try {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
    if (!authCookie?.value) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    let sessionData: Record<string, unknown>
    try {
      sessionData = JSON.parse(authCookie.value)
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SESSION', message: 'Invalid session' } },
        { status: 401 }
      )
    }

    const userId = sessionData.userId as string | undefined
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SESSION', message: 'Invalid session' } },
        { status: 401 }
      )
    }

    const { objectiveText, phase } = await request.json()

    if (!objectiveText?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'ONBOARDING_INVALID_INPUT', message: 'Objective text is required' } },
        { status: 400 }
      )
    }

    if (!['explore', 'diagnose', 'build', 'launch', 'optimize'].includes(phase)) {
      return NextResponse.json(
        { success: false, error: { code: 'ONBOARDING_INVALID_INPUT', message: 'Valid phase is required' } },
        { status: 400 }
      )
    }

    // Idempotent check
    const { data: existingSettings } = await supabase
      .from('user_platform_settings')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .maybeSingle()

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      expires: new Date(sessionData.expiresAt as string),
    }

    if (existingSettings?.onboarding_completed) {
      const response = NextResponse.json({ success: true, status: 'completed', message: 'Onboarding already completed' })
      response.cookies.set(AUTH_COOKIE_NAME, JSON.stringify({ ...sessionData, onboardingCompleted: true }), cookieOpts)
      return response
    }

    const { error: settingsError } = await supabase
      .from('user_platform_settings')
      .upsert(
        { user_id: userId, onboarding_completed: true, preferred_phase: phase },
        { onConflict: 'user_id' }
      )

    if (settingsError) {
      console.error('Error updating settings:', settingsError)
      return NextResponse.json(
        { success: false, error: { code: 'ONBOARDING_PERSISTENCE_FAILED', message: 'Failed to save settings' } },
        { status: 500 }
      )
    }

    const response = NextResponse.json({ success: true, status: 'completed', phase, message: 'Onboarding completed successfully' })
    response.cookies.set(AUTH_COOKIE_NAME, JSON.stringify({ ...sessionData, onboardingCompleted: true }), cookieOpts)
    return response

  } catch (error: unknown) {
    console.error('Onboarding complete error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete onboarding' } },
      { status: 500 }
    )
  }
}

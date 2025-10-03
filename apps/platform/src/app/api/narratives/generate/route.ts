// API route for generating weekly narratives
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import type { Database } from '../../../../lib/supabase'
import { validateApiAuth } from '../../../../lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateApiAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const authenticatedUserId = authResult.user.id
    const { weekStart } = await request.json()

    if (!weekStart) {
      return NextResponse.json({ error: 'Week start date is required' }, { status: 400 })
    }

    const weekStartDate = new Date(weekStart)
    const weekEndDate = new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Check if narrative already exists for this week
    const { data: existingNarrative } = await supabase
      .from('weekly_narratives')
      .select('*')
      .eq('user_id', authenticatedUserId)
      .eq('week_start', weekStartDate.toISOString().split('T')[0])
      .single()

    if (existingNarrative) {
      return NextResponse.json({
        success: true,
        narrative: existingNarrative,
        message: 'Narrative already exists for this week'
      })
    }

    // Fetch user actions for the week
    const { data: actions, error: actionsError } = await supabase
      .from('user_actions')
      .select('*')
      .eq('user_id', authenticatedUserId)
      .gte('logged_date', weekStartDate.toISOString().split('T')[0])
      .lt('logged_date', weekEndDate.toISOString().split('T')[0])
      .order('logged_date', { ascending: true })

    if (actionsError) {
      return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 })
    }

    // Fetch user dream for context
    const { data: dreamData } = await supabase
      .from('user_dreams')
      .select('dream_text')
      .eq('user_id', authenticatedUserId)
      .eq('is_active', true)
      .single()

    // Fetch previous narratives for context
    const { data: previousNarratives } = await supabase
      .from('weekly_narratives')
      .select('*')
      .eq('user_id', authenticatedUserId)
      .lt('week_start', weekStartDate.toISOString().split('T')[0])
      .order('week_start', { ascending: false })
      .limit(2)

    // Generate simple narrative (placeholder for AI integration)
    const narrativeResult = {
      narrativeText: `This week you logged ${actions?.length || 0} actions. ${
        actions && actions.length > 0 
          ? 'You\'re making steady progress toward your goals. Keep building momentum!'
          : 'Consider logging more activities to track your progress better.'
      }`,
      phaseProgression: null,
      keyInsights: actions && actions.length > 3 ? ['Strong activity week', 'Building consistent habits'] : ['Room for more activity'],
      nextSuggestions: ['Continue logging daily actions', 'Focus on your current phase activities'],
      significantActions: actions?.filter((_, i) => i < 2) || []
    }

    // Save narrative to database
    const { data: savedNarrative, error: saveError } = await supabase
      .from('weekly_narratives')
      .insert({
        user_id: authenticatedUserId,
        week_start: weekStartDate.toISOString().split('T')[0],
        narrative_text: narrativeResult.narrativeText,
        actions_count: actions?.length || 0,
        phase_progression: narrativeResult.phaseProgression,
        key_insights: narrativeResult.keyInsights,
        next_suggestions: narrativeResult.nextSuggestions,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving narrative:', saveError)
      return NextResponse.json({ error: 'Failed to save narrative' }, { status: 500 })
    }

    // Mark significant actions if any
    if (narrativeResult.significantActions.length > 0) {
      const { error: updateError } = await supabase
        .from('user_actions')
        .update({ is_significant: true })
        .in('id', narrativeResult.significantActions.map(a => a.id))

      if (updateError) {
        console.error('Error marking significant actions:', updateError)
        // Don't fail the request for this
      }
    }

    return NextResponse.json({
      success: true,
      narrative: savedNarrative,
      insights: narrativeResult.keyInsights,
      suggestions: narrativeResult.nextSuggestions,
      significantActions: narrativeResult.significantActions.length,
    })

  } catch (error) {
    console.error('Narrative generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateApiAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const authenticatedUserId = authResult.user.id
    const url = new URL(request.url)
    const weekStart = url.searchParams.get('weekStart')

    let query = supabase
      .from('weekly_narratives')
      .select('*')
      .eq('user_id', authenticatedUserId)
      .order('week_start', { ascending: false })

    if (weekStart) {
      query = query.eq('week_start', weekStart)
    } else {
      query = query.limit(10) // Last 10 weeks
    }

    const { data: narratives, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch narratives' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      narratives: narratives || [],
    })

  } catch (error) {
    console.error('Narrative fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

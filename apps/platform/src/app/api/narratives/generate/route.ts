// API route for generating weekly narratives
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateWeeklyNarrative } from '@/lib/narrative-engine'
import type { Database } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      .eq('user_id', user.id)
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
      .eq('user_id', user.id)
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
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    // Fetch previous narratives for context
    const { data: previousNarratives } = await supabase
      .from('weekly_narratives')
      .select('*')
      .eq('user_id', user.id)
      .lt('week_start', weekStartDate.toISOString().split('T')[0])
      .order('week_start', { ascending: false })
      .limit(2)

    // Generate narrative
    const narrativeResult = await generateWeeklyNarrative({
      userId: user.id,
      weekStart: weekStartDate,
      actions: actions || [],
      userDream: dreamData?.dream_text,
      previousNarratives: previousNarratives || [],
    })

    // Save narrative to database
    const { data: savedNarrative, error: saveError } = await supabase
      .from('weekly_narratives')
      .insert({
        user_id: user.id,
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
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const weekStart = url.searchParams.get('weekStart')
    
    let query = supabase
      .from('weekly_narratives')
      .select('*')
      .eq('user_id', user.id)
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
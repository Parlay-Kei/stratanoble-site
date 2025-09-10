// Supabase Edge Function for Weekly Narrative Generation
// This function runs on a schedule (cron job) to generate weekly narratives

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeeklyNarrativeRequest {
  userId: string
  weekStart: string
  actions: any[]
  userDream?: string
  previousNarratives?: any[]
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method } = req

    if (method === 'POST') {
      // Manual trigger for specific user
      const { userId, weekStart } = await req.json()
      
      if (!userId || !weekStart) {
        return new Response(
          JSON.stringify({ error: 'userId and weekStart required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const result = await generateNarrativeForUser(supabase, userId, weekStart)
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET request - run scheduled generation for all eligible users
    if (method === 'GET') {
      const results = await runScheduledGeneration(supabase)
      
      return new Response(
        JSON.stringify({
          success: true,
          processed: results.length,
          results,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function runScheduledGeneration(supabase: any) {
  const results = []
  
  // Get users who need narrative generation
  // Users with actions in the previous week and weekly_narrative_email enabled
  const lastWeekStart = getLastWeekStart()
  const lastWeekEnd = new Date(lastWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  // Find users with actions in the last week
  const { data: usersWithActions } = await supabase
    .from('user_actions')
    .select('user_id')
    .gte('logged_date', lastWeekStart.toISOString().split('T')[0])
    .lt('logged_date', lastWeekEnd.toISOString().split('T')[0])

  if (!usersWithActions || usersWithActions.length === 0) {
    return []
  }

  const uniqueUserIds = [...new Set(usersWithActions.map((u: any) => u.user_id))]

  // Check which users have narrative emails enabled and don't have narratives yet
  for (const userId of uniqueUserIds) {
    try {
      const { data: settings } = await supabase
        .from('user_platform_settings')
        .select('weekly_narrative_email')
        .eq('user_id', userId)
        .single()

      // Skip if user doesn't want weekly emails
      if (!settings?.weekly_narrative_email) {
        continue
      }

      // Check if narrative already exists
      const { data: existingNarrative } = await supabase
        .from('weekly_narratives')
        .select('id')
        .eq('user_id', userId)
        .eq('week_start', lastWeekStart.toISOString().split('T')[0])
        .single()

      if (existingNarrative) {
        continue // Skip if already generated
      }

      // Generate narrative for this user
      const result = await generateNarrativeForUser(
        supabase, 
        userId, 
        lastWeekStart.toISOString().split('T')[0]
      )
      
      results.push({
        userId,
        success: result.success,
        error: result.error,
      })

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      results.push({
        userId,
        success: false,
        error: error.message,
      })
    }
  }

  return results
}

async function generateNarrativeForUser(supabase: any, userId: string, weekStart: string) {
  try {
    const weekStartDate = new Date(weekStart)
    const weekEndDate = new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Fetch user actions for the week
    const { data: actions } = await supabase
      .from('user_actions')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_date', weekStartDate.toISOString().split('T')[0])
      .lt('logged_date', weekEndDate.toISOString().split('T')[0])
      .order('logged_date', { ascending: true })

    if (!actions || actions.length === 0) {
      return { success: false, error: 'No actions found for this week' }
    }

    // Fetch user dream for context
    const { data: dreamData } = await supabase
      .from('user_dreams')
      .select('dream_text')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    // Fetch previous narratives for context
    const { data: previousNarratives } = await supabase
      .from('weekly_narratives')
      .select('*')
      .eq('user_id', userId)
      .lt('week_start', weekStartDate.toISOString().split('T')[0])
      .order('week_start', { ascending: false })
      .limit(2)

    // Generate narrative using AI or fallback
    const narrativeResult = await generateNarrativeContent({
      userId,
      weekStart: weekStartDate,
      actions,
      userDream: dreamData?.dream_text,
      previousNarratives: previousNarratives || [],
    })

    // Save narrative to database
    const { data: savedNarrative, error: saveError } = await supabase
      .from('weekly_narratives')
      .insert({
        user_id: userId,
        week_start: weekStartDate.toISOString().split('T')[0],
        narrative_text: narrativeResult.narrativeText,
        actions_count: actions.length,
        phase_progression: narrativeResult.phaseProgression,
        key_insights: narrativeResult.keyInsights,
        next_suggestions: narrativeResult.nextSuggestions,
      })
      .select()
      .single()

    if (saveError) {
      throw new Error(`Failed to save narrative: ${saveError.message}`)
    }

    return {
      success: true,
      narrative: savedNarrative,
      actionsProcessed: actions.length,
    }

  } catch (error) {
    console.error(`Error generating narrative for user ${userId}:`, error)
    return {
      success: false,
      error: error.message,
    }
  }
}

async function generateNarrativeContent(request: WeeklyNarrativeRequest) {
  const openAIKey = Deno.env.get('OPENAI_API_KEY')
  
  // If no OpenAI key, use fallback generation
  if (!openAIKey) {
    return generateFallbackNarrative(request)
  }

  try {
    const prompt = buildNarrativePrompt(request)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data: OpenAIResponse = await response.json()
    const responseText = data.choices[0]?.message?.content

    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    return parseNarrativeResponse(responseText, request)
  } catch (error) {
    console.error('OpenAI generation failed, using fallback:', error)
    return generateFallbackNarrative(request)
  }
}

function buildNarrativePrompt(request: WeeklyNarrativeRequest): string {
  const { actions, userDream } = request
  
  let contextInfo = `Week Summary:
- Total Actions: ${actions.length}
- Learning: ${actions.filter(a => a.category === 'learning').length} actions
- Building: ${actions.filter(a => a.category === 'building').length} actions
- Connecting: ${actions.filter(a => a.category === 'connecting').length} actions

Phase Distribution:
- Explore: ${actions.filter(a => a.phase === 'explore').length} actions
- Build: ${actions.filter(a => a.phase === 'build').length} actions
- Launch: ${actions.filter(a => a.phase === 'launch').length} actions`

  if (userDream) {
    contextInfo += `\n\nUser's Dream: "${userDream}"`
  }

  let actionDetails = '\n\nActions Taken This Week:'
  actions.forEach((action: any, index: number) => {
    actionDetails += `\n${index + 1}. [${action.category}/${action.phase}] ${action.original_text}`
    if (action.reframed_text) {
      actionDetails += `\n   → ${action.reframed_text}`
    }
  })

  return `Generate a weekly narrative for this user's progress:

${contextInfo}${actionDetails}

Create an encouraging narrative that shows how these actions are building toward their goals. Focus on patterns, skill development, and momentum.`
}

function getSystemPrompt(): string {
  return `You are the ACHIEVERY Weekly Narrative Engine, designed to create meaningful, personalized progress summaries.

Guidelines:
- Write in second person ("You accomplished...")
- Highlight patterns, trends, and momentum
- Connect actions to skill building and business development
- Keep tone professional but warm and encouraging
- Be specific about what progress means for their future

Response format (JSON):
{
  "narrativeText": "2-3 paragraph narrative summarizing the week's progress",
  "keyInsights": ["Insight about patterns", "Insight about growth"],
  "nextSuggestions": ["Specific actionable next step", "Another concrete suggestion"],
  "phaseProgression": "Brief assessment of phase progression"
}`
}

function parseNarrativeResponse(response: string, request: WeeklyNarrativeRequest) {
  try {
    const parsed = JSON.parse(response)
    return {
      narrativeText: parsed.narrativeText || generateFallbackNarrative(request).narrativeText,
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights.slice(0, 3) : [],
      nextSuggestions: Array.isArray(parsed.nextSuggestions) ? parsed.nextSuggestions.slice(0, 3) : [],
      phaseProgression: parsed.phaseProgression || 'Steady progress in current phase',
    }
  } catch {
    const fallback = generateFallbackNarrative(request)
    return {
      narrativeText: fallback.narrativeText,
      keyInsights: fallback.keyInsights,
      nextSuggestions: fallback.nextSuggestions,
      phaseProgression: fallback.phaseProgression,
    }
  }
}

function generateFallbackNarrative(request: WeeklyNarrativeRequest) {
  const { actions } = request
  const totalActions = actions.length
  
  let narrativeText = `This week you logged ${totalActions} action${totalActions === 1 ? '' : 's'}`
  
  if (totalActions >= 5) {
    narrativeText += ", showing strong momentum in your development journey."
  } else if (totalActions >= 3) {
    narrativeText += ", building steady progress toward your goals."
  } else {
    narrativeText += ", taking meaningful steps forward."
  }

  const learningCount = actions.filter(a => a.category === 'learning').length
  const buildingCount = actions.filter(a => a.category === 'building').length
  const connectingCount = actions.filter(a => a.category === 'connecting').length

  const categoryInsights = []
  if (learningCount > 0) {
    categoryInsights.push(`You invested in learning with ${learningCount} knowledge-building activities`)
  }
  if (buildingCount > 0) {
    categoryInsights.push(`You created tangible value through ${buildingCount} building actions`)
  }
  if (connectingCount > 0) {
    categoryInsights.push(`You strengthened your network with ${connectingCount} connecting activities`)
  }

  if (categoryInsights.length > 0) {
    narrativeText += ` ${categoryInsights.join(', ')}.`
  }

  return {
    narrativeText,
    keyInsights: [
      'Consistent action logging builds momentum toward your goals',
      'Each category of action contributes to different aspects of business growth',
    ],
    nextSuggestions: [
      'Continue building on this week\'s momentum with consistent daily actions',
      'Look for opportunities to connect your recent activities to larger projects',
    ],
    phaseProgression: 'Steady progress in current development phase',
  }
}

function getLastWeekStart(): Date {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const day = lastWeek.getDay()
  const diff = lastWeek.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(lastWeek.setDate(diff))
}
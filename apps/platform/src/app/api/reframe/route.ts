import { NextRequest, NextResponse } from 'next/server'
import { reframeAction } from '../../../lib/reframe-engine'
import { supabase } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { originalText, category, phase, userDream, userId, actionId } = await request.json()

    // Validate required fields
    if (!originalText || !category || !phase || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Reframe the action
    const result = await reframeAction({
      originalText,
      category,
      phase,
      userDream,
    })

    // Legacy: references user_actions. ActionLogForm (0147) writes directly
    // to achievery_actions. This branch can be removed in 0153 cleanup.
    if (actionId) {
      const { error } = await supabase
        .from('user_actions')
        .update({ 
          reframed_text: result.reframedText,
          is_significant: result.significanceScore >= 7
        })
        .eq('id', actionId)
        .eq('user_id', userId) // Ensure user owns the action

      if (error) {
        console.error('Error updating action with reframe:', error)
        // Still return the reframe result even if DB update fails
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Reframe API error:', error)
    return NextResponse.json(
      { error: 'Failed to reframe action' },
      { status: 500 }
    )
  }
}
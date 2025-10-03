import { NextRequest, NextResponse } from 'next/server'
import { reframeAction } from '../../../lib/reframe-engine'
import { supabase } from '../../../lib/supabase'
import { validateApiAuth } from '../../../lib/server-auth'

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
    const { originalText, category, phase, userDream, actionId } = await request.json()

    // Validate required fields
    if (!originalText || !category || !phase) {
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

    // If actionId provided, update the action in the database
    if (actionId) {
      const { error } = await supabase
        .from('user_actions')
        .update({
          reframed_text: result.reframedText,
          is_significant: result.significanceScore >= 7
        })
        .eq('id', actionId)
        .eq('user_id', authenticatedUserId) // Use server-verified userId

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
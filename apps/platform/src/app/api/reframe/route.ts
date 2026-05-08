import { NextRequest, NextResponse } from 'next/server'
import { reframeAction } from '../../../lib/reframe-engine'

export async function POST(request: NextRequest) {
  try {
    const { originalText, category, executionStage, engagementContext, userId } = await request.json()

    if (!originalText || !category || !executionStage || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await reframeAction({
      originalText,
      category,
      executionStage,
      engagementContext,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Reframe API error:', error)
    return NextResponse.json({ error: 'Failed to reframe action' }, { status: 500 })
  }
}

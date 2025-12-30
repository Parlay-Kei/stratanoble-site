import { NextRequest, NextResponse } from 'next/server'
import { reframeAction } from '../../../lib/reframe-engine'

export async function GET() {
  try {
    // Test the reframe engine with sample data
    const testCases = [
      {
        originalText: "Helped my friend fix their computer",
        category: "connecting" as const,
        phase: "explore" as const,
        userDream: "Start a tech consulting business"
      },
      {
        originalText: "Watched YouTube tutorials about web design",
        category: "learning" as const,
        phase: "explore" as const,
        userDream: "Build a web design agency"
      },
      {
        originalText: "Built a simple website for my local coffee shop",
        category: "building" as const,
        phase: "build" as const,
        userDream: "Start a digital marketing agency"
      }
    ]

    const results = []
    
    for (const testCase of testCases) {
      const result = await reframeAction(testCase)
      results.push({
        input: testCase,
        output: result
      })
    }

    return NextResponse.json({
      success: true,
      message: "Reframe engine test completed",
      results
    })
  } catch (error) {
    console.error('Test reframe error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
'use client'

import Link from 'next/link'
import { Card } from '@strata-noble/ui'

// Weekly narratives have moved to the Achievery operating summary system.
// Summaries are now generated per-engagement from /platform/systems.
export function WeeklyNarrativesList() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Weekly Narratives</h1>
        <p className="text-gray-600">Weekly operating summaries are now generated per engagement.</p>
      </div>
      <Card className="p-8 text-center">
        <p className="text-gray-600 mb-4">
          Weekly summaries have moved to the Achievery system manager.
        </p>
        <Link
          href="/platform/systems"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Go to Systems →
        </Link>
      </Card>
    </div>
  )
}

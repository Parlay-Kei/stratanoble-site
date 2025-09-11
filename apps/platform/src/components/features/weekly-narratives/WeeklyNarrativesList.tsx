'use client'

import { useEffect, useState } from 'react'
import { Plus, Calendar, TrendingUp } from 'lucide-react'
import { Button, Card } from '@strata-noble/ui'
import { WeeklyNarrativeCard } from './WeeklyNarrativeCard'
import { narrativeScheduler, getWeekStart } from '../../../lib/narrative-scheduler'
import type { WeeklyNarrative } from '../../../types/platform'

export function WeeklyNarrativesList() {
  const [narratives, setNarratives] = useState<WeeklyNarrative[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadNarratives()
  }, [])

  const loadNarratives = async () => {
    try {
      setIsLoading(true)
      const data = await narrativeScheduler.getUserNarratives(10)
      setNarratives(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load narratives')
    } finally {
      setIsLoading(false)
    }
  }

  const generateNarrative = async (weekStart?: Date) => {
    try {
      setIsGenerating(true)
      setError(null)
      
      const result = weekStart 
        ? await narrativeScheduler.generateForWeek(weekStart)
        : await narrativeScheduler.generatePreviousWeek()
      
      if (result.success) {
        await loadNarratives() // Refresh the list
      } else {
        setError(result.error || 'Failed to generate narrative')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate narrative')
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateNarrative = async (narrative: WeeklyNarrative) => {
    const weekStart = new Date(narrative.week_start)
    await generateNarrative(weekStart)
  }

  const getLastWeekStart = () => {
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return getWeekStart(lastWeek)
  }

  const hasLastWeekNarrative = () => {
    const lastWeekStart = getLastWeekStart()
    return narratives.some(n => 
      new Date(n.week_start).getTime() === lastWeekStart.getTime()
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-48 animate-pulse p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Narratives</h1>
          <p className="text-gray-600">
            Your automated progress summaries and insights
          </p>
        </div>
        
        {!hasLastWeekNarrative() && (
          <Button 
            onClick={() => generateNarrative()}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Last Week'}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {narratives.length === 0 && !error ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No narratives yet</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Weekly narratives are generated automatically based on your logged actions. 
              Start logging actions throughout the week to get your first narrative.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              Narratives help you see patterns and progress in your journey
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {narratives.map((narrative) => (
            <WeeklyNarrativeCard
              key={narrative.id}
              narrative={narrative}
              showGenerateButton={true}
              onRegenerate={() => regenerateNarrative(narrative)}
              isRegenerating={isGenerating}
            />
          ))}
        </div>
      )}

      {narratives.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-600">
            Showing your most recent weekly narratives.
            {narratives.length >= 10 && ' Older narratives are archived.'}
          </p>
        </div>
      )}
    </div>
  )
}

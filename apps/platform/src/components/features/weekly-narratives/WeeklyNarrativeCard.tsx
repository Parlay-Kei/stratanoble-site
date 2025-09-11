'use client'

import { useState } from 'react'
import { Calendar, TrendingUp, Lightbulb, ArrowRight, RefreshCw } from 'lucide-react'
import { Card, Button } from '@strata-noble/ui'
import type { WeeklyNarrative } from '../../../types/platform'
import { formatWeekRange } from '../../../lib/narrative-scheduler'

interface WeeklyNarrativeCardProps {
  narrative: WeeklyNarrative
  showGenerateButton?: boolean
  onRegenerate?: () => void
  isRegenerating?: boolean
}

export function WeeklyNarrativeCard({
  narrative,
  showGenerateButton = false,
  onRegenerate,
  isRegenerating = false,
}: WeeklyNarrativeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const weekStart = new Date(narrative.week_start)
  const weekRange = formatWeekRange(weekStart)

  return (
    <Card className="w-full p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {weekRange}
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {narrative.actions_count} action{narrative.actions_count !== 1 ? 's' : ''}
            </span>
          </div>
          
          {showGenerateButton && onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900">
          Weekly Progress Summary
        </h3>

        {/* Main Narrative */}
        <div className="prose prose-sm max-w-none">
          <p className="text-base leading-relaxed text-gray-800">
            {narrative.narrative_text}
          </p>
        </div>

        {/* Phase Progression */}
        {narrative.phase_progression && (
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-900">
                Phase Progression
              </h4>
              <p className="text-sm text-green-700 mt-1">
                {narrative.phase_progression}
              </p>
            </div>
          </div>
        )}

        {/* Key Insights */}
        {narrative.key_insights && narrative.key_insights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Key Insights
            </div>
            <ul className="space-y-1">
              {narrative.key_insights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Suggestions */}
        {narrative.next_suggestions && narrative.next_suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <ArrowRight className="h-4 w-4 text-blue-500" />
              Next Steps
            </div>
            <ul className="space-y-1">
              {narrative.next_suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Generated on {new Date(narrative.created_at).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </Card>
  )
}

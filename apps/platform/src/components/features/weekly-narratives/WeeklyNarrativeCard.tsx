'use client'

import { useState } from 'react'
import { Calendar, TrendingUp, Lightbulb, ArrowRight, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@strata-noble/ui/components/ui/card'
import { Button } from '@strata-noble/ui/components/ui/button'
import { Badge } from '@strata-noble/ui/components/ui/badge'
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {weekRange}
            </div>
            <Badge variant="secondary" className="text-xs">
              {narrative.actions_count} action{narrative.actions_count !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {showGenerateButton && onRegenerate && (
            <Button
              variant="ghost"
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
        
        <CardTitle className="text-lg leading-relaxed">
          Weekly Progress Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Narrative */}
        <div className="prose prose-sm max-w-none">
          <p className="text-base leading-relaxed text-foreground">
            {narrative.narrative_text}
          </p>
        </div>

        {/* Phase Progression */}
        {narrative.phase_progression && (
          <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-emerald-900 dark:text-emerald-100">
                Phase Progression
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-200 mt-1">
                {narrative.phase_progression}
              </p>
            </div>
          </div>
        )}

        {/* Key Insights */}
        {narrative.key_insights && narrative.key_insights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Key Insights
            </div>
            <ul className="space-y-1">
              {narrative.key_insights.map((insight, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
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
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ArrowRight className="h-4 w-4 text-blue-500" />
              Next Steps
            </div>
            <ul className="space-y-1">
              {narrative.next_suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  )
}
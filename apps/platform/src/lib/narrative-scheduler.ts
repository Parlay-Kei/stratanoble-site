// ACHIEVERY Weekly Narrative Scheduler
// Handles automated generation of weekly narratives

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './supabase'

export interface ScheduledNarrativeResult {
  success: boolean
  narrative?: any
  error?: string
  generated: boolean
}

class NarrativeScheduler {
  private supabase = createClientComponentClient<Database>()

  /**
   * Generate narrative for a specific week
   */
  async generateForWeek(weekStart: Date): Promise<ScheduledNarrativeResult> {
    try {
      const response = await fetch('/api/narratives/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          weekStart: weekStart.toISOString().split('T')[0] 
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to generate narrative',
          generated: false,
        }
      }

      return {
        success: true,
        narrative: result.narrative,
        generated: true,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generated: false,
      }
    }
  }

  /**
   * Generate narrative for current week
   */
  async generateCurrentWeek(): Promise<ScheduledNarrativeResult> {
    const now = new Date()
    const currentWeekStart = this.getWeekStart(now)
    return this.generateForWeek(currentWeekStart)
  }

  /**
   * Generate narrative for previous week (Sunday generation)
   */
  async generatePreviousWeek(): Promise<ScheduledNarrativeResult> {
    const now = new Date()
    const previousWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const previousWeekStart = this.getWeekStart(previousWeek)
    return this.generateForWeek(previousWeekStart)
  }

  /**
   * Check if user needs a narrative generated
   */
  async shouldGenerateNarrative(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return false

      // Check if user has weekly narrative emails enabled
      const { data: settings } = await this.supabase
        .from('user_platform_settings')
        .select('weekly_narrative_email')
        .eq('user_id', user.id)
        .single()

      if (!settings?.weekly_narrative_email) return false

      // Check if we have actions from last week
      const lastWeekStart = this.getWeekStart(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      const lastWeekEnd = new Date(lastWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

      const { data: actions } = await this.supabase
        .from('user_actions')
        .select('id')
        .eq('user_id', user.id)
        .gte('logged_date', lastWeekStart.toISOString().split('T')[0])
        .lt('logged_date', lastWeekEnd.toISOString().split('T')[0])

      // Only generate if user had actions
      if (!actions || actions.length === 0) return false

      // Check if narrative already exists
      const { data: existingNarrative } = await this.supabase
        .from('weekly_narratives')
        .select('id')
        .eq('user_id', user.id)
        .eq('week_start', lastWeekStart.toISOString().split('T')[0])
        .single()

      return !existingNarrative
    } catch {
      return false
    }
  }

  /**
   * Get all narratives for a user
   */
  async getUserNarratives(limit: number = 10) {
    try {
      const response = await fetch(`/api/narratives/generate?limit=${limit}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch narratives')
      }

      return result.narratives || []
    } catch (error) {
      console.error('Error fetching narratives:', error)
      return []
    }
  }

  /**
   * Get narrative for specific week
   */
  async getNarrativeForWeek(weekStart: Date) {
    try {
      const weekStartStr = weekStart.toISOString().split('T')[0]
      const response = await fetch(`/api/narratives/generate?weekStart=${weekStartStr}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch narrative')
      }

      return result.narratives?.[0] || null
    } catch (error) {
      console.error('Error fetching narrative:', error)
      return null
    }
  }

  /**
   * Weekly cleanup - generate narratives for active users
   * This would typically be called from a cron job or Edge Function
   */
  async weeklyNarrativeGeneration() {
    try {
      // This would be implemented in a server-side context
      // For now, it's a placeholder for the actual scheduled job
      console.log('Weekly narrative generation should run server-side')
      
      return {
        success: true,
        message: 'Weekly generation triggered (server-side implementation needed)',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get the start of the week (Monday) for a given date
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  /**
   * Get week date range string
   */
  getWeekRange(weekStart: Date): string {
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      })
    }
    
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`
  }
}

// Singleton instance
export const narrativeScheduler = new NarrativeScheduler()

// Utility functions
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export function getWeekEnd(weekStart: Date): Date {
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
}

export function formatWeekRange(weekStart: Date): string {
  return narrativeScheduler.getWeekRange(weekStart)
}

// Browser-based trigger for manual narrative generation
export async function triggerNarrativeGeneration() {
  return narrativeScheduler.generatePreviousWeek()
}
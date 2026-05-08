import { supabase } from './supabase'

export interface ScheduledNarrativeResult {
  success: boolean
  narrative?: Record<string, unknown>
  error?: string
  generated: boolean
}

class NarrativeScheduler {
  private supabase = supabase

  async generateForWeek(engagementId: string, weekStart: Date): Promise<ScheduledNarrativeResult> {
    try {
      const weekStartStr = weekStart.toISOString().split('T')[0]
      const res = await fetch('/api/achievery/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engagement_id: engagementId, week_start: weekStartStr }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string }
        return { success: false, error: json.error ?? 'Generation failed', generated: false }
      }
      const json = await res.json() as { summary: Record<string, unknown> }
      return { success: true, narrative: json.summary, generated: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generated: false,
      }
    }
  }

  async generateCurrentWeek(engagementId: string): Promise<ScheduledNarrativeResult> {
    return this.generateForWeek(engagementId, this.getWeekStart(new Date()))
  }

  async generatePreviousWeek(engagementId: string): Promise<ScheduledNarrativeResult> {
    const previousWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return this.generateForWeek(engagementId, this.getWeekStart(previousWeek))
  }

  async getUserNarratives(engagementId: string, limit: number = 10) {
    const { data } = await this.supabase
      .from('achievery_weekly_summaries')
      .select('id, week_start, content, next_steps, health_signal, generated_at')
      .eq('engagement_id', engagementId)
      .order('week_start', { ascending: false })
      .limit(limit)
    return data ?? []
  }

  async getNarrativeForWeek(engagementId: string, weekStart: Date) {
    const { data } = await this.supabase
      .from('achievery_weekly_summaries')
      .select('id, week_start, content, next_steps, health_signal, generated_at')
      .eq('engagement_id', engagementId)
      .eq('week_start', weekStart.toISOString().split('T')[0])
      .maybeSingle()
    return data ?? null
  }

  // TODO: wire to a server-side cron job or Supabase Edge Function once
  // manual generation is confirmed working end-to-end.
  async weeklyNarrativeGeneration() {
    try {
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

  private getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  getWeekRange(weekStart: Date): string {
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
    const formatDate = (date: Date) =>
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      })
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`
  }
}

export const narrativeScheduler = new NarrativeScheduler()

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

import OpenAI from 'openai'
import type { HealthSignal } from '../types/achievery'

export interface SummaryRequest {
  engagementId: string
  engagementTitle: string
  weekStart: Date
  actions: {
    id: string
    entry_text: string
    actor_type: 'operator' | 'client'
    visibility: 'internal' | 'shared'
    logged_at: string
    task_title?: string | null
    operational_insight?: string | null
  }[]
  systems: {
    name: string
    stage: string
    open_task_count: number
    completed_task_count: number
    blocked_task_count: number
  }[]
  open_blockers: {
    description: string
    task_title?: string | null
  }[]
  previousSummary?: {
    content: string
    health_signal: HealthSignal
    week_start: string
  } | null
}

export interface SummaryResult {
  content: string
  next_steps: string[]
  health_signal: HealthSignal
  significant_action_ids: string[]
}

class NarrativeEngine {
  private openai: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      this.openai = new OpenAI({ apiKey })
    }
  }

  async generate(request: SummaryRequest): Promise<SummaryResult> {
    if (!this.openai) {
      return this.fallbackSummary(request)
    }

    try {
      const prompt = this.buildPrompt(request)

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.4,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from OpenAI')

      return this.parseResponse(response, request)
    } catch {
      return this.fallbackSummary(request)
    }
  }

  private getSystemPrompt(): string {
    return `You are the Achievery Weekly Operating Summary engine for Strata Noble. Your job is to generate plain-language weekly summaries of a client engagement's operating progress.

Your role:
- Summarize what happened operationally this week
- Identify what moved, what stalled, and what needs attention
- Surface patterns in execution without editorializing
- Produce a clear health signal: on_track, needs_attention, or stalled
- Suggest 2-4 concrete next actions grounded in the actual data

Voice: Direct, factual, business-facing. No motivational language. No "great job" or "you're doing amazing." This is an operating report, not a coaching session.

Response format (JSON only, no preamble):
{
  "content": "2-3 paragraph operating summary",
  "next_steps": ["Concrete next action", "Another action"],
  "health_signal": "on_track" | "needs_attention" | "stalled",
  "significant_action_ids": ["uuid", "uuid"]
}`
  }

  private buildPrompt(request: SummaryRequest): string {
    const weekEnd = new Date(request.weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const systemLines = request.systems.map(s =>
      `  - ${s.name} (${s.stage}): ${s.completed_task_count} complete, ${s.open_task_count} open, ${s.blocked_task_count} blocked`
    ).join('\n')

    const blockerLines = request.open_blockers.length
      ? request.open_blockers.map(b =>
          `  - ${b.description}${b.task_title ? ` [task: ${b.task_title}]` : ''}`
        ).join('\n')
      : '  None'

    const actionLines = request.actions.map((a, i) =>
      `  ${i + 1}. [${a.actor_type}] ${a.entry_text}` +
      (a.task_title ? ` (task: ${a.task_title})` : '') +
      (a.operational_insight ? `\n     Insight: ${a.operational_insight}` : '')
    ).join('\n')

    const previousContext = request.previousSummary
      ? `Previous week (${request.previousSummary.week_start}):
  Signal: ${request.previousSummary.health_signal}
  Summary: ${request.previousSummary.content.substring(0, 300)}...`
      : 'No previous summary.'

    return `Engagement: ${request.engagementTitle}
Week: ${request.weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}

Operating systems:
${systemLines || '  None configured'}

Open blockers:
${blockerLines}

Actions logged this week (${request.actions.length} total):
${actionLines || '  None logged'}

Previous week context:
${previousContext}

Generate the weekly operating summary.`
  }

  private parseResponse(response: string, request: SummaryRequest): SummaryResult {
    try {
      const parsed = JSON.parse(response)
      const validSignals: HealthSignal[] = ['on_track', 'needs_attention', 'stalled']
      return {
        content: parsed.content || this.fallbackSummary(request).content,
        next_steps: Array.isArray(parsed.next_steps) ? parsed.next_steps.slice(0, 4) : [],
        health_signal: validSignals.includes(parsed.health_signal)
          ? parsed.health_signal
          : 'needs_attention',
        significant_action_ids: Array.isArray(parsed.significant_action_ids)
          ? parsed.significant_action_ids
          : [],
      }
    } catch {
      return this.fallbackSummary(request)
    }
  }

  private fallbackSummary(request: SummaryRequest): SummaryResult {
    const total = request.actions.length
    const operatorCount = request.actions.filter(a => a.actor_type === 'operator').length
    const clientCount = request.actions.filter(a => a.actor_type === 'client').length
    const blockerCount = request.open_blockers.length

    if (total === 0) {
      return {
        content:
          `No actions were logged this week for ${request.engagementTitle}. ` +
          (blockerCount > 0
            ? `There are ${blockerCount} open blocker(s) that may be preventing progress.`
            : 'No blockers are currently reported.'),
        next_steps: [
          'Log at least one action this week to build the execution record',
          blockerCount > 0
            ? 'Review and resolve open blockers'
            : 'Check in with the client to confirm there are no blockers',
        ],
        health_signal: 'stalled',
        significant_action_ids: [],
      }
    }

    const signal: HealthSignal = blockerCount > 2
      ? 'stalled'
      : total < 3
      ? 'needs_attention'
      : 'on_track'

    return {
      content:
        `${total} action(s) were logged this week across ${request.systems.length} operating system(s). ` +
        `Operator logged ${operatorCount}, client logged ${clientCount}. ` +
        (blockerCount > 0
          ? `${blockerCount} blocker(s) remain open.`
          : 'No open blockers.'),
      next_steps: [
        'Review open tasks and confirm assignments',
        blockerCount > 0
          ? 'Resolve outstanding blockers'
          : "Log this week's delivery actions",
      ],
      health_signal: signal,
      significant_action_ids: [],
    }
  }

  isAvailable(): boolean {
    return this.openai !== null
  }
}

export const narrativeEngine = new NarrativeEngine()

export async function generateWeeklySummary(request: SummaryRequest): Promise<SummaryResult> {
  return narrativeEngine.generate(request)
}

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateWeeklySummary, type SummaryRequest } from '../../../../lib/narrative-engine'

const AUTH_COOKIE_NAME = 'auth-session'

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function parseSession(v: string) {
  try { return JSON.parse(v) } catch { return null }
}

export async function POST(request: NextRequest) {
  const db = getDb()
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  if (!authCookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const session = parseSession(authCookie.value)
  const userId = session?.userId
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const { engagement_id, week_start } = body ?? {}
  if (!engagement_id || !week_start) {
    return NextResponse.json({ error: 'engagement_id and week_start required' }, { status: 400 })
  }

  // Operator-only — verify ownership
  const { data: eng } = await db
    .from('achievery_engagements')
    .select('id, title')
    .eq('id', engagement_id)
    .eq('operator_user_id', userId)
    .maybeSingle()

  if (!eng) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const weekStartDate = new Date(week_start)
  const weekEndDate = new Date(weekStartDate)
  weekEndDate.setDate(weekEndDate.getDate() + 7)

  const [actionsRes, systemsRes, tasksRes, blockersRes, prevSummaryRes] = await Promise.all([
    db
      .from('achievery_actions')
      .select('id, entry_text, actor_type, visibility, logged_at, task_id, operational_insight')
      .eq('engagement_id', engagement_id)
      .gte('logged_at', weekStartDate.toISOString())
      .lt('logged_at', weekEndDate.toISOString()),
    db
      .from('achievery_systems')
      .select('id, name, stage')
      .eq('engagement_id', engagement_id),
    db
      .from('achievery_tasks')
      .select('id, system_id, title, status')
      .eq('engagement_id', engagement_id),
    db
      .from('achievery_blockers')
      .select('id, description, task_id')
      .eq('engagement_id', engagement_id)
      .eq('resolved', false),
    db
      .from('achievery_weekly_summaries')
      .select('content, health_signal, week_start')
      .eq('engagement_id', engagement_id)
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const actions = actionsRes.data ?? []
  const systems = systemsRes.data ?? []
  const tasks = tasksRes.data ?? []
  const blockers = blockersRes.data ?? []

  const taskMap = new Map(tasks.map(t => [t.id, t]))

  const systemTaskCounts = new Map<string, { open: number; complete: number; blocked: number }>()
  systems.forEach(s => systemTaskCounts.set(s.id, { open: 0, complete: 0, blocked: 0 }))
  tasks.forEach(t => {
    const counts = systemTaskCounts.get(t.system_id)
    if (counts) {
      if (t.status === 'open') counts.open++
      else if (t.status === 'complete') counts.complete++
      else if (t.status === 'blocked') counts.blocked++
    }
  })

  const summaryRequest: SummaryRequest = {
    engagementId: engagement_id,
    engagementTitle: eng.title,
    weekStart: weekStartDate,
    actions: actions.map(a => ({
      id: a.id,
      entry_text: a.entry_text,
      actor_type: a.actor_type as 'operator' | 'client',
      visibility: a.visibility as 'internal' | 'shared',
      logged_at: a.logged_at,
      task_title: a.task_id ? (taskMap.get(a.task_id)?.title ?? null) : null,
      operational_insight: a.operational_insight ?? null,
    })),
    systems: systems.map(s => {
      const counts = systemTaskCounts.get(s.id) ?? { open: 0, complete: 0, blocked: 0 }
      return {
        name: s.name,
        stage: s.stage,
        open_task_count: counts.open,
        completed_task_count: counts.complete,
        blocked_task_count: counts.blocked,
      }
    }),
    open_blockers: blockers.map(b => ({
      description: b.description,
      task_title: b.task_id ? (taskMap.get(b.task_id)?.title ?? null) : null,
    })),
    previousSummary: prevSummaryRes.data ?? null,
  }

  const result = await generateWeeklySummary(summaryRequest)

  const { data: saved, error: upsertErr } = await db
    .from('achievery_weekly_summaries')
    .upsert(
      {
        engagement_id,
        week_start,
        content: result.content,
        next_steps: result.next_steps,
        health_signal: result.health_signal,
        generated_by: userId,
      },
      { onConflict: 'engagement_id,week_start' }
    )
    .select()
    .single()

  if (upsertErr || !saved) {
    return NextResponse.json({ error: 'Failed to save summary' }, { status: 500 })
  }

  return NextResponse.json({ success: true, summary: saved })
}

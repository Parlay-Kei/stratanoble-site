import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const AUTH_COOKIE_NAME = 'auth-session'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function parseSession(v: string) {
  try { return JSON.parse(v) } catch { return null }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  if (!authCookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const session = parseSession(authCookie.value)
  const userId = session?.userId
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  if (session?.expiresAt && new Date(session.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  const url = new URL(request.url)
  const operatorView = url.searchParams.get('operator_view') === 'true'
  const engagementIdParam = url.searchParams.get('engagement_id')

  if (operatorView) {
    if (!engagementIdParam) return NextResponse.json({ error: 'engagement_id required' }, { status: 400 })

    const { data: eng } = await db
      .from('achievery_engagements')
      .select('id, title, status, client_user_id')
      .eq('id', engagementIdParam)
      .eq('operator_user_id', userId)
      .maybeSingle()

    if (!eng) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: clientRecord } = await db
      .from('clients')
      .select('email')
      .eq('id', eng.client_user_id)
      .maybeSingle()

    const [systemsRes, tasksRes, actionsRes, blockersRes, summaryRes] = await Promise.all([
      db.from('achievery_systems').select('id, name, stage').eq('engagement_id', eng.id),
      db.from('achievery_tasks').select('id, system_id, title, status, assigned_to').eq('engagement_id', eng.id),
      db.from('achievery_actions')
        .select('id, entry_text, actor_type, actor_user_id, logged_at, task_id, visibility')
        .eq('engagement_id', eng.id)
        .order('logged_at', { ascending: false })
        .limit(15),
      db.from('achievery_blockers')
        .select('id, description, task_id')
        .eq('engagement_id', eng.id)
        .eq('resolved', false)
        .order('created_at', { ascending: false }),
      db.from('achievery_weekly_summaries')
        .select('week_start, content, next_steps, health_signal')
        .eq('engagement_id', eng.id)
        .order('week_start', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    const systems = systemsRes.data ?? []
    const tasks = tasksRes.data ?? []
    const tasksBySystem: Record<string, typeof tasks> = {}
    tasks.forEach(t => {
      tasksBySystem[t.system_id] = tasksBySystem[t.system_id] ?? []
      tasksBySystem[t.system_id].push(t)
    })

    return NextResponse.json({
      engagement: {
        id: eng.id,
        title: eng.title,
        status: eng.status,
        client_email: clientRecord?.email ?? null,
        systems: systems.map(s => ({
          id: s.id,
          name: s.name,
          stage: s.stage,
          tasks: (tasksBySystem[s.id] ?? []).map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            assigned_to: t.assigned_to,
          })),
        })),
        recent_actions: (actionsRes.data ?? []).map(a => ({
          id: a.id,
          entry_text: a.entry_text,
          actor_type: a.actor_type,
          actor_user_id: a.actor_user_id,
          logged_at: a.logged_at,
          task_id: a.task_id,
          visibility: a.visibility,
        })),
        open_blockers: (blockersRes.data ?? []).map(b => ({
          id: b.id,
          description: b.description,
          task_id: b.task_id,
        })),
        latest_summary: summaryRes.data ?? null,
      },
      is_operator: true,
    })
  }

  // Client view
  const { data: engRow } = await db
    .from('achievery_engagements')
    .select('id, title, status')
    .eq('client_user_id', userId)
    .maybeSingle()

  if (!engRow) {
    // Check if they're an operator so the page can redirect appropriately
    const { data: opRow } = await db
      .from('achievery_engagements')
      .select('id')
      .eq('operator_user_id', userId)
      .maybeSingle()
    return NextResponse.json({ engagement: null, is_operator: !!opRow })
  }

  const engId = engRow.id

  const [systemsRes, tasksRes, actionsRes, blockersRes, summaryRes] = await Promise.all([
    db
      .from('achievery_systems')
      .select('id, name, stage')
      .eq('engagement_id', engId),
    db
      .from('achievery_tasks')
      .select('id, system_id, title, cadence, assigned_to, status')
      .eq('engagement_id', engId)
      .in('assigned_to', ['client', 'both']),
    db
      .from('achievery_actions')
      .select('id, entry_text, actor_type, actor_user_id, logged_at, task_id')
      .eq('engagement_id', engId)
      .eq('visibility', 'shared')
      .order('logged_at', { ascending: false })
      .limit(10),
    db
      .from('achievery_blockers')
      .select('id, description, task_id, created_at')
      .eq('engagement_id', engId)
      .eq('resolved', false)
      .order('created_at', { ascending: false }),
    db
      .from('achievery_weekly_summaries')
      .select('week_start, content, next_steps, health_signal')
      .eq('engagement_id', engId)
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const systems = systemsRes.data ?? []
  const tasks = tasksRes.data ?? []

  const tasksBySystem: Record<string, typeof tasks> = {}
  tasks.forEach(t => {
    tasksBySystem[t.system_id] = tasksBySystem[t.system_id] ?? []
    tasksBySystem[t.system_id].push(t)
  })

  const latest_summary = summaryRes.data ?? null

  return NextResponse.json({
    engagement: {
      id: engId,
      title: engRow.title,
      status: engRow.status,
      systems: systems.map(s => ({
        id: s.id,
        name: s.name,
        stage: s.stage,
        tasks: tasksBySystem[s.id] ?? [],
      })),
      recent_actions: (actionsRes.data ?? []).map(a => ({
        id: a.id,
        entry_text: a.entry_text,
        actor_type: a.actor_type,
        actor_user_id: a.actor_user_id,
        logged_at: a.logged_at,
        task_id: a.task_id,
      })),
      open_blockers: blockersRes.data ?? [],
      latest_summary,
    },
    is_operator: false,
  })
}

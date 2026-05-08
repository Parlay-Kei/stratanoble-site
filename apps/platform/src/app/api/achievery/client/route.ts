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

  // Find the user's client engagement
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

  const [systemsRes, tasksRes, actionsRes, blockersRes] = await Promise.all([
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
  ])

  const systems = systemsRes.data ?? []
  const tasks = tasksRes.data ?? []

  const tasksBySystem: Record<string, typeof tasks> = {}
  tasks.forEach(t => {
    tasksBySystem[t.system_id] = tasksBySystem[t.system_id] ?? []
    tasksBySystem[t.system_id].push(t)
  })

  // latest_summary: populated in 0152 once achievery_weekly_summaries table exists
  const latest_summary = null

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

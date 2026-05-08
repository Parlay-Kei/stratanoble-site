export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const AUTH_COOKIE_NAME = 'auth-session'

// Service role client — bypasses RLS for server-side queries.
// Auth is enforced via cookie validation; all queries are further
// filtered by the validated userId.
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - (day === 0 ? 6 : day - 1)
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}

export async function GET(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  if (!authCookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let sessionData: { userId?: string; expiresAt?: string }
  try {
    sessionData = JSON.parse(authCookie.value)
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const userId = sessionData.userId
  if (!userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  if (sessionData.expiresAt && new Date(sessionData.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  // ── Determine role + fetch engagements ───────────────────────────────────
  const [opResult, clientResult] = await Promise.all([
    db
      .from('achievery_engagements')
      .select('id, title, status')
      .eq('operator_user_id', userId),
    db
      .from('achievery_engagements')
      .select('id, title, status')
      .eq('client_user_id', userId),
  ])

  type EngRow = { id: string; title: string; status: string }
  const opEngagements: EngRow[] = opResult.data ?? []
  const clientEngagements: EngRow[] = clientResult.data ?? []

  // Primary actor: operator if they hold any operator seat
  const actor: 'operator' | 'client' = opEngagements.length > 0 ? 'operator' : 'client'

  // Tag each engagement with the user's role in that engagement
  const allEngagements = [
    ...opEngagements.map(e => ({ ...e, userRole: 'operator' as const })),
    ...clientEngagements.map(e => ({ ...e, userRole: 'client' as const })),
  ]

  if (allEngagements.length === 0) {
    return NextResponse.json({ actor, engagements: [] })
  }

  const weekStart = getWeekStart()

  // ── Per-engagement detail queries ────────────────────────────────────────
  const engagementData = await Promise.all(
    allEngagements.map(async (eng) => {
      const engId = eng.id

      const [systemsRes, openTasksRes, actionsRes, blockersRes, lastActionRes, internalRes] =
        await Promise.all([
          db
            .from('achievery_systems')
            .select('id, name, stage')
            .eq('engagement_id', engId),
          db
            .from('achievery_tasks')
            .select('system_id')
            .eq('engagement_id', engId)
            .eq('status', 'open'),
          db
            .from('achievery_actions')
            .select('actor_type')
            .eq('engagement_id', engId)
            .gte('logged_at', weekStart),
          db
            .from('achievery_blockers')
            .select('id', { count: 'exact', head: true })
            .eq('engagement_id', engId)
            .eq('resolved', false),
          db
            .from('achievery_actions')
            .select('logged_at')
            .eq('engagement_id', engId)
            .order('logged_at', { ascending: false })
            .limit(1),
          eng.userRole === 'operator'
            ? db
                .from('achievery_actions')
                .select('id', { count: 'exact', head: true })
                .eq('engagement_id', engId)
                .eq('visibility', 'internal')
            : Promise.resolve({ count: null }),
        ])

      const systems = systemsRes.data ?? []
      const openTasks = openTasksRes.data ?? []
      const actions = actionsRes.data ?? []

      // Group open task counts by system_id in JS (avoids N+1)
      const taskCountBySystem: Record<string, number> = {}
      openTasks.forEach(t => {
        taskCountBySystem[t.system_id] = (taskCountBySystem[t.system_id] ?? 0) + 1
      })

      const result: Record<string, unknown> = {
        id: eng.id,
        title: eng.title,
        status: eng.status,
        systems: systems.map(s => ({
          id: s.id,
          name: s.name,
          stage: s.stage,
          open_task_count: taskCountBySystem[s.id] ?? 0,
        })),
        actions_this_week: {
          operator: actions.filter(a => a.actor_type === 'operator').length,
          client: actions.filter(a => a.actor_type === 'client').length,
        },
        open_blockers: blockersRes.count ?? 0,
        last_action_at: lastActionRes.data?.[0]?.logged_at ?? null,
      }

      if (eng.userRole === 'operator') {
        result.internal_note_count = internalRes.count ?? 0
      }

      return result
    })
  )

  return NextResponse.json({ actor, engagements: engagementData })
}

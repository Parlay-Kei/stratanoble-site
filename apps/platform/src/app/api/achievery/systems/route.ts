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

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
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

  const { data: engs } = await db
    .from('achievery_engagements')
    .select('id, client_user_id, operator_user_id, title, status, created_at')
    .eq('operator_user_id', userId)
    .order('created_at', { ascending: false })

  if (!engs || engs.length === 0) return NextResponse.json({ engagements: [] })

  const weekStart = getWeekStart()

  const engagements = await Promise.all(
    engs.map(async (eng) => {
      const [
        systemsRes, tasksRes, blockersRes, openBlockerListRes,
        actionsRes, lastActionRes, clientRes,
      ] = await Promise.all([
        db.from('achievery_systems')
          .select('id, engagement_id, name, description, stage')
          .eq('engagement_id', eng.id),
        db.from('achievery_tasks')
          .select('id, system_id, engagement_id, title, cadence, assigned_to, status')
          .eq('engagement_id', eng.id),
        db.from('achievery_blockers')
          .select('id', { count: 'exact', head: true })
          .eq('engagement_id', eng.id)
          .eq('resolved', false),
        db.from('achievery_blockers')
          .select('id, engagement_id, task_id, reported_by, description, resolved, created_at')
          .eq('engagement_id', eng.id)
          .eq('resolved', false)
          .order('created_at', { ascending: false }),
        db.from('achievery_actions')
          .select('id, engagement_id, task_id, actor_type, actor_user_id, entry_text, visibility, logged_at')
          .eq('engagement_id', eng.id)
          .order('logged_at', { ascending: false })
          .limit(30),
        db.from('achievery_actions')
          .select('logged_at')
          .eq('engagement_id', eng.id)
          .order('logged_at', { ascending: false })
          .limit(1),
        eng.client_user_id
          ? db.auth.admin.getUserById(eng.client_user_id)
          : Promise.resolve({ data: { user: null } }),
      ])

      const systems = systemsRes.data ?? []
      const tasks = tasksRes.data ?? []
      const allActions = actionsRes.data ?? []

      const tasksBySystem: Record<string, typeof tasks> = {}
      tasks.forEach(t => {
        tasksBySystem[t.system_id] = tasksBySystem[t.system_id] ?? []
        tasksBySystem[t.system_id].push(t)
      })

      const weekActions = allActions.filter(a => a.logged_at >= weekStart)

      return {
        ...eng,
        client_email: (clientRes as { data: { user: { email?: string } | null } }).data.user?.email ?? null,
        systems: systems.map(s => ({
          ...s,
          tasks: tasksBySystem[s.id] ?? [],
        })),
        open_blocker_count: blockersRes.count ?? 0,
        open_blockers: openBlockerListRes.data ?? [],
        actions: allActions,
        actions_this_week: {
          operator: weekActions.filter(a => a.actor_type === 'operator').length,
          client: weekActions.filter(a => a.actor_type === 'client').length,
        },
        last_action_at: lastActionRes.data?.[0]?.logged_at ?? null,
      }
    })
  )

  return NextResponse.json({ engagements })
}

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  if (!authCookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const session = parseSession(authCookie.value)
  const userId = session?.userId
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  if (session?.expiresAt && new Date(session.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  let body: { title?: string; client_email?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const { title, client_email } = body
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })

  let clientUserId: string | null = null
  if (client_email?.trim()) {
    const { data: { users } } = await db.auth.admin.listUsers({ perPage: 1000 })
    const match = users.find(u => u.email?.toLowerCase() === client_email.trim().toLowerCase())
    if (match) clientUserId = match.id
  }

  const { data, error } = await db
    .from('achievery_engagements')
    .insert({
      title: title.trim(),
      operator_user_id: userId,
      client_user_id: clientUserId,
      status: 'active',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create engagement' }, { status: 500 })

  return NextResponse.json({ engagement: data })
}

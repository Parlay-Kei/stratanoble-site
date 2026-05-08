export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const AUTH_COOKIE_NAME = 'auth-session'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function resolveRole(
  engagementId: string,
  userId: string
): Promise<'operator' | 'client' | null> {
  const [opRes, clientRes] = await Promise.all([
    db
      .from('achievery_engagements')
      .select('id')
      .eq('id', engagementId)
      .eq('operator_user_id', userId)
      .maybeSingle(),
    db
      .from('achievery_engagements')
      .select('id')
      .eq('id', engagementId)
      .eq('client_user_id', userId)
      .maybeSingle(),
  ])
  if (opRes.data) return 'operator'
  if (clientRes.data) return 'client'
  return null
}

function parseSession(cookie: string): { userId?: string; expiresAt?: string } | null {
  try {
    return JSON.parse(cookie)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  if (!authCookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const session = parseSession(authCookie.value)
  const userId = session?.userId
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  if (session?.expiresAt && new Date(session.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const engagementId = searchParams.get('engagement_id')
  if (!engagementId) {
    return NextResponse.json({ error: 'engagement_id required' }, { status: 400 })
  }

  const userRole = await resolveRole(engagementId, userId)
  if (!userRole) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const actorFilter = searchParams.get('actor') as 'operator' | 'client' | null
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let q = db
    .from('achievery_proof')
    .select(
      'id, engagement_id, action_id, task_id, note, actor_type, visibility, uploaded_at, achievery_actions(entry_text), achievery_tasks(title)'
    )
    .eq('engagement_id', engagementId)
    .order('uploaded_at', { ascending: false })

  if (userRole === 'client') {
    q = q.eq('visibility', 'shared')
  }
  if (actorFilter === 'operator' || actorFilter === 'client') {
    q = q.eq('actor_type', actorFilter)
  }
  if (from) q = q.gte('uploaded_at', from)
  if (to) q = q.lte('uploaded_at', to)

  const { data, error } = await q

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }

  const entries = (data ?? []).map((row: Record<string, unknown>) => {
    const actions = row.achievery_actions as { entry_text?: string } | null
    const tasks = row.achievery_tasks as { title?: string } | null
    return {
      id: row.id,
      engagement_id: row.engagement_id,
      action_id: row.action_id ?? null,
      task_id: row.task_id ?? null,
      note: row.note,
      actor_type: row.actor_type,
      visibility: row.visibility,
      uploaded_at: row.uploaded_at,
      action_text: actions?.entry_text ?? null,
      task_title: tasks?.title ?? null,
    }
  })

  return NextResponse.json({ entries })
}

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  if (!authCookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const session = parseSession(authCookie.value)
  const userId = session?.userId
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  if (session?.expiresAt && new Date(session.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  let body: {
    engagement_id?: string
    note?: string
    action_id?: string
    task_id?: string
    visibility?: 'internal' | 'shared'
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { engagement_id, note, action_id, task_id, visibility } = body
  if (!engagement_id || !note?.trim()) {
    return NextResponse.json({ error: 'engagement_id and note required' }, { status: 400 })
  }

  const userRole = await resolveRole(engagement_id, userId)
  if (!userRole) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Clients can only create shared entries
  const resolvedVisibility: 'internal' | 'shared' =
    userRole === 'client' ? 'shared' : (visibility ?? 'shared')

  const { data, error } = await db
    .from('achievery_proof')
    .insert({
      engagement_id,
      note: note.trim(),
      action_id: action_id ?? null,
      task_id: task_id ?? null,
      actor_type: userRole,
      actor_user_id: userId,
      visibility: resolvedVisibility,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }

  return NextResponse.json({ success: true, entry: data })
}

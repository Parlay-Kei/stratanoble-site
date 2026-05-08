export const dynamic = 'force-dynamic'
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

async function assertOperator(engagementId: string, userId: string): Promise<boolean> {
  const { data } = await db
    .from('achievery_engagements')
    .select('id')
    .eq('id', engagementId)
    .eq('operator_user_id', userId)
    .maybeSingle()
  return !!data
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ engagementId: string; taskId: string }> }
) {
  const { engagementId, taskId } = await params

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)
  if (!authCookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const session = parseSession(authCookie.value)
  const userId = session?.userId
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  if (session?.expiresAt && new Date(session.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  if (!(await assertOperator(engagementId, userId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { status?: string; assigned_to?: string; title?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const updates: Record<string, string> = {}
  if (body.status) {
    const valid = ['open', 'complete', 'blocked']
    if (!valid.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    updates.status = body.status
  }
  if (body.assigned_to) {
    const valid = ['operator', 'client', 'both']
    if (!valid.includes(body.assigned_to)) return NextResponse.json({ error: 'Invalid assigned_to' }, { status: 400 })
    updates.assigned_to = body.assigned_to
  }
  if (body.title?.trim()) {
    updates.title = body.title.trim()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await db
    .from('achievery_tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('engagement_id', engagementId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })

  return NextResponse.json({ task: data })
}

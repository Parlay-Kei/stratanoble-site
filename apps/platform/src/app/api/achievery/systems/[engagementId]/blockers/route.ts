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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ engagementId: string }> }
) {
  const { engagementId } = await params

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

  let body: { task_id?: string; description?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  if (!body.description?.trim()) {
    return NextResponse.json({ error: 'description required' }, { status: 400 })
  }

  const { data, error } = await db
    .from('achievery_blockers')
    .insert({
      engagement_id: engagementId,
      task_id: body.task_id ?? null,
      reported_by: userId,
      description: body.description.trim(),
      resolved: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create blocker' }, { status: 500 })

  return NextResponse.json({ blocker: data })
}

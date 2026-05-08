export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

async function assertOperator(engagementId: string, userId: string): Promise<boolean> {
  const db = getDb()
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
  const db = getDb()

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

  let body: { name?: string; description?: string; stage?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const { name, description, stage } = body
  if (!name?.trim() || !stage) {
    return NextResponse.json({ error: 'name and stage required' }, { status: 400 })
  }

  const validStages = ['diagnose', 'build', 'launch', 'optimize']
  if (!validStages.includes(stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
  }

  const { data, error } = await db
    .from('achievery_systems')
    .insert({
      engagement_id: engagementId,
      name: name.trim(),
      description: description?.trim() ?? null,
      stage,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create system' }, { status: 500 })

  return NextResponse.json({ system: data })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const checks: Record<string, string> = {}
  const errors: string[] = []

  // Check environment variables
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  checks.environment = hasSupabaseUrl && hasSupabaseKey ? 'ok' : 'error'
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    errors.push('Missing Supabase configuration')
  }

  // Check database connectivity
  if (hasSupabaseUrl && hasSupabaseKey) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase.from('user_dreams').select('count', { count: 'exact', head: true })
      checks.database = error ? 'error' : 'ok'
      if (error) {
        errors.push(`Database error: ${error.message}`)
      }
    } catch (error) {
      checks.database = 'error'
      errors.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } else {
    checks.database = 'skipped'
  }

  const isHealthy = Object.values(checks).every(check => check === 'ok')

  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    ...(errors.length > 0 && { errors }),
    service: 'achievery-platform',
    version: '0.1.0',
  }

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

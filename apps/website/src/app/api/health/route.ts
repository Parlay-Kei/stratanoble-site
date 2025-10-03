import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const checks: Record<string, string> = {}
  const errors: string[] = []

  // Check environment variables
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasStripeKey = !!process.env.STRIPE_SECRET_KEY

  checks.environment = hasSupabaseUrl && hasStripeKey ? 'ok' : 'warning'
  if (!hasSupabaseUrl) {
    errors.push('Missing Supabase URL')
  }
  if (!hasStripeKey) {
    errors.push('Missing Stripe secret key')
  }

  // Check Redis connectivity (if configured)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    checks.redis = 'configured'
  } else {
    checks.redis = 'not-configured'
  }

  const isHealthy = !errors.some(e => e.includes('Missing Supabase'))

  const response = {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    ...(errors.length > 0 && { warnings: errors }),
    service: 'stratanoble-website',
    version: '0.1.0',
  }

  return NextResponse.json(response, {
    status: isHealthy ? 200 : 200, // Return 200 even for warnings
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

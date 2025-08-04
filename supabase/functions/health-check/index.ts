import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const healthChecks = []

    // Check database connectivity
    try {
      const { data, error } = await supabaseAdmin
        .from('system_heartbeat')
        .select('*')
        .limit(1)

      healthChecks.push({
        service: 'database',
        status: error ? 'down' : 'healthy',
        message: error ? error.message : 'Database connection successful',
        response_time: Date.now()
      })
    } catch (error) {
      healthChecks.push({
        service: 'database',
        status: 'down',
        message: error.message,
        response_time: Date.now()
      })
    }

    // Check external API connections
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')
    if (youtubeApiKey) {
      try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&key=${youtubeApiKey}`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })

        healthChecks.push({
          service: 'youtube_api',
          status: response.ok ? 'healthy' : 'degraded',
          message: response.ok ? 'YouTube API accessible' : `HTTP ${response.status}`,
          response_time: Date.now()
        })
      } catch (error) {
        healthChecks.push({
          service: 'youtube_api',
          status: 'down',
          message: error.message,
          response_time: Date.now()
        })
      }
    }

    // Check TikTok API if configured
    const tiktokToken = Deno.env.get('TIKTOK_ACCESS_TOKEN')
    if (tiktokToken) {
      try {
        // Basic TikTok API health check (adjust endpoint as needed)
        const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/user/info/', {
          method: 'GET',
          headers: {
            'Access-Token': tiktokToken
          },
          signal: AbortSignal.timeout(5000)
        })

        healthChecks.push({
          service: 'tiktok_api',
          status: response.ok ? 'healthy' : 'degraded',
          message: response.ok ? 'TikTok API accessible' : `HTTP ${response.status}`,
          response_time: Date.now()
        })
      } catch (error) {
        healthChecks.push({
          service: 'tiktok_api',
          status: 'down',
          message: error.message,
          response_time: Date.now()
        })
      }
    }

    // Check Postmark email service
    const postmarkToken = Deno.env.get('POSTMARK_API_TOKEN')
    if (postmarkToken) {
      try {
        const response = await fetch('https://api.postmarkapp.com/server', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Postmark-Server-Token': postmarkToken
          },
          signal: AbortSignal.timeout(5000)
        })

        healthChecks.push({
          service: 'postmark_email',
          status: response.ok ? 'healthy' : 'degraded',
          message: response.ok ? 'Postmark API accessible' : `HTTP ${response.status}`,
          response_time: Date.now()
        })
      } catch (error) {
        healthChecks.push({
          service: 'postmark_email',
          status: 'down',
          message: error.message,
          response_time: Date.now()
        })
      }
    }

    // Update heartbeat for each service
    for (const check of healthChecks) {
      try {
        await supabaseAdmin.rpc('update_heartbeat', {
          p_service_name: check.service,
          p_status: check.status,
          p_message: check.message,
          p_metadata: { response_time: check.response_time }
        })
      } catch (error) {
        console.error(`Failed to update heartbeat for ${check.service}:`, error)
      }
    }

    // Overall system status
    const overallStatus = healthChecks.some(c => c.status === 'down') ? 'down' :
                         healthChecks.some(c => c.status === 'degraded') ? 'degraded' : 'healthy'

    return new Response(
      JSON.stringify({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        services: healthChecks,
        summary: {
          total: healthChecks.length,
          healthy: healthChecks.filter(c => c.status === 'healthy').length,
          degraded: healthChecks.filter(c => c.status === 'degraded').length,
          down: healthChecks.filter(c => c.status === 'down').length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: overallStatus === 'down' ? 503 : 200,
      }
    )

  } catch (error) {
    console.error('Health check error:', error)
    return new Response(
      JSON.stringify({
        status: 'down',
        timestamp: new Date().toISOString(),
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      }
    )
  }
})
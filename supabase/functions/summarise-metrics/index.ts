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

    // Get yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    console.log(`Summarizing metrics for date: ${yesterdayStr}`)

    // Get all active clients
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('status', 'active')

    if (clientsError) {
      throw clientsError
    }

    let processedClients = 0

    for (const client of clients) {
      try {
        // Get raw metrics for yesterday
        const { data: rawMetrics, error: metricsError } = await supabaseAdmin
          .from('metric_feed')
          .select('source, payload')
          .eq('client_id', client.id)
          .gte('fetched_at', `${yesterdayStr}T00:00:00Z`)
          .lt('fetched_at', `${yesterdayStr}T23:59:59Z`)

        if (metricsError) {
          console.error(`Error fetching raw metrics for client ${client.id}:`, metricsError)
          continue
        }

        if (!rawMetrics || rawMetrics.length === 0) {
          console.log(`No metrics found for client ${client.id} on ${yesterdayStr}`)
          continue
        }

        // Aggregate metrics by source
        const aggregatedMetrics = aggregateMetrics(rawMetrics)

        // Upsert into metric_summary
        const { error: upsertError } = await supabaseAdmin
          .from('metric_summary')
          .upsert({
            client_id: client.id,
            date: yesterdayStr,
            views: aggregatedMetrics.totalViews,
            watch_hours: aggregatedMetrics.totalWatchHours,
            subs: aggregatedMetrics.totalSubs,
            rpm: aggregatedMetrics.rpm,
          })

        if (upsertError) {
          console.error(`Error upserting summary for client ${client.id}:`, upsertError)
          continue
        }

        processedClients++
      } catch (error) {
        console.error(`Error processing client ${client.id}:`, error)
      }
    }

    // Clean up old raw metrics (>30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { error: cleanupError } = await supabaseAdmin
      .from('metric_feed')
      .delete()
      .lt('fetched_at', thirtyDaysAgo.toISOString())

    if (cleanupError) {
      console.error('Error cleaning up old metrics:', cleanupError)
    }

    return new Response(
      JSON.stringify({ 
        message: `Metrics summarized for ${processedClients} clients`,
        date: yesterdayStr,
        processed: processedClients,
        total_clients: clients.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in summarise-metrics function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function aggregateMetrics(rawMetrics: any[]) {
  let totalViews = 0
  let totalWatchHours = 0
  let totalSubs = 0
  let totalRevenue = 0

  for (const metric of rawMetrics) {
    const payload = metric.payload

    if (metric.source === 'youtube') {
      totalViews += payload.views || 0
      totalWatchHours += (payload.watch_time_minutes || 0) / 60 // Convert to hours
      totalSubs += payload.subscribers || 0
      totalRevenue += payload.estimated_revenue || 0
    } else if (metric.source === 'tiktok') {
      totalViews += payload.video_views || 0
      // TikTok doesn't have direct watch time, estimate based on views
      totalWatchHours += (payload.video_views || 0) * 0.5 / 60 // Assume 30 sec avg watch time
      totalSubs += payload.likes || 0 // Use likes as engagement metric
    }
  }

  // Calculate RPM (Revenue Per Mille - revenue per 1000 views)
  const rpm = totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0

  return {
    totalViews,
    totalWatchHours: Math.round(totalWatchHours * 100) / 100, // Round to 2 decimal places
    totalSubs,
    rpm: Math.round(rpm * 100) / 100 // Round to 2 decimal places
  }
}
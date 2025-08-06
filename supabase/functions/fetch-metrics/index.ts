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

    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')
    const tiktokAccessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN')

    // Get all active clients
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id, tier')
      .eq('status', 'active')

    if (clientsError) {
      throw clientsError
    }

    console.log(`Fetching metrics for ${clients.length} clients`)

    for (const client of clients) {
      try {
        // Fetch YouTube metrics (mock implementation - replace with actual API calls)
        if (youtubeApiKey) {
          const youtubeMetrics = await fetchYouTubeMetrics(client.id, youtubeApiKey)
          
          // Insert metrics into metric_feed
          const { error: insertError } = await supabaseAdmin
            .from('metric_feed')
            .insert({
              client_id: client.id,
              source: 'youtube',
              payload: youtubeMetrics,
              fetched_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error(`Error inserting YouTube metrics for client ${client.id}:`, insertError)
          }
        }

        // Fetch TikTok metrics if credentials exist
        if (tiktokAccessToken) {
          const tiktokMetrics = await fetchTikTokMetrics(client.id, tiktokAccessToken)
          
          const { error: insertError } = await supabaseAdmin
            .from('metric_feed')
            .insert({
              client_id: client.id,
              source: 'tiktok',
              payload: tiktokMetrics,
              fetched_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error(`Error inserting TikTok metrics for client ${client.id}:`, insertError)
          }
        }
      } catch (error) {
        console.error(`Error fetching metrics for client ${client.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Metrics fetched for ${clients.length} clients`,
        processed: clients.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in fetch-metrics function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function fetchYouTubeMetrics(clientId: string, apiKey: string) {
  // Mock YouTube API call - replace with actual implementation
  // You would typically:
  // 1. Get the client's YouTube channel ID from your database
  // 2. Call YouTube Analytics API to get metrics
  // 3. Return the structured data
  
  return {
    channel_id: 'mock_channel_id',
    views: Math.floor(Math.random() * 10000),
    watch_time_minutes: Math.floor(Math.random() * 50000),
    subscribers: Math.floor(Math.random() * 1000),
    estimated_revenue: Math.random() * 100,
    date_range: {
      start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    }
  }
}

async function fetchTikTokMetrics(clientId: string, accessToken: string) {
  // Mock TikTok API call - replace with actual implementation
  // You would typically:
  // 1. Get the client's TikTok account info from your database
  // 2. Call TikTok for Business API to get metrics
  // 3. Return the structured data
  
  return {
    account_id: 'mock_account_id',
    video_views: Math.floor(Math.random() * 50000),
    profile_views: Math.floor(Math.random() * 5000),
    likes: Math.floor(Math.random() * 2000),
    shares: Math.floor(Math.random() * 500),
    date_range: {
      start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    }
  }
}
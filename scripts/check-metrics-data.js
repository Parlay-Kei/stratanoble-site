#!/usr/bin/env node

/**
 * Check Metrics Data Script
 * Verifies that metrics are being collected and summarized
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkMetricsData() {
  console.log('📊 Checking metrics data collection...\n')

  try {
    // Check active clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, tier, status')
      .eq('status', 'active')

    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError)
      return
    }

    console.log(`👥 Active clients: ${clients.length}`)
    clients.forEach(client => {
      console.log(`   ${client.id} (${client.tier})`)
    })

    // Check raw metric feed
    const { data: rawMetrics, error: rawError } = await supabase
      .from('metric_feed')
      .select('id, client_id, source, fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(10)

    if (rawError) {
      console.error('❌ Error fetching raw metrics:', rawError)
      return
    }

    console.log(`\n📥 Recent raw metrics: ${rawMetrics.length}`)
    rawMetrics.forEach(metric => {
      const fetchedTime = new Date(metric.fetched_at).toLocaleString()
      console.log(`   ${metric.source} for ${metric.client_id.substring(0, 8)}... at ${fetchedTime}`)
    })

    // Check metric summaries
    const { data: summaries, error: summaryError } = await supabase
      .from('metric_summary')
      .select('client_id, date, views, watch_hours, subs, rpm')
      .order('date', { ascending: false })
      .limit(5)

    if (summaryError) {
      console.error('❌ Error fetching summaries:', summaryError)
      return
    }

    console.log(`\n📈 Recent summaries: ${summaries.length}`)
    summaries.forEach(summary => {
      console.log(`   ${summary.date}: ${summary.views} views, ${summary.watch_hours}h, ${summary.subs} subs, $${summary.rpm} RPM`)
    })

    // Check system health
    const { data: health, error: healthError } = await supabase
      .from('system_heartbeat')
      .select('service_name, status, last_ping, message')
      .order('last_ping', { ascending: false })

    if (healthError) {
      console.error('❌ Error fetching health data:', healthError)
      return
    }

    console.log(`\n💓 System health:`)
    health.forEach(service => {
      const lastPing = new Date(service.last_ping).toLocaleString()
      const status = service.status === 'healthy' ? '✅' : service.status === 'degraded' ? '⚠️' : '❌'
      console.log(`   ${status} ${service.service_name}: ${service.status} (${lastPing})`)
    })

    // Test Edge Functions
    console.log(`\n🔄 Testing Edge Functions...`)

    try {
      const healthResponse = await fetch(`${SUPABASE_URL}/functions/v1/health-check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        console.log(`✅ Health check: ${healthData.status}`)
        console.log(`   Services: ${healthData.summary?.healthy || 0} healthy, ${healthData.summary?.down || 0} down`)
      } else {
        console.log(`❌ Health check failed: ${healthResponse.status}`)
      }
    } catch (error) {
      console.log(`❌ Health check error: ${error.message}`)
    }

    // Instructions for next steps
    console.log(`\n🎯 Next Steps:`)
    
    if (clients.length === 0) {
      console.log('1. Complete a test checkout to create your first client')
      console.log('2. Run: node scripts/test-production-checkout.js')
    }
    
    if (rawMetrics.length === 0) {
      console.log('1. Add API keys to Supabase vault (see scripts/setup-api-keys.md)')
      console.log('2. Manually trigger: fetch-metrics function in dashboard')
    }
    
    if (summaries.length === 0 && rawMetrics.length > 0) {
      console.log('1. Manually trigger: summarise-metrics function in dashboard')
      console.log('2. Or wait until 3 AM UTC for automatic run')
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

checkMetricsData()
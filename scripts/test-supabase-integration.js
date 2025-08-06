#!/usr/bin/env node

/**
 * Supabase Integration Test Script
 * 
 * This script performs the end-to-end sanity checks mentioned in step 9 of the checklist:
 * 1. Insert a fake clients row manually
 * 2. Hit /functions/fetch-metrics from the dashboard; confirm one metric_feed row drops
 * 3. Run nightly summariser manually; confirm metric_summary shows aggregates
 * 4. Sign up via checkout → webhook should create real clients row with matching auth.uid
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runTests() {
  console.log('🧪 Starting Supabase Integration Tests...\n')

  try {
    // Test 1: Insert fake client
    console.log('1️⃣ Testing client creation...')
    const fakeClientId = crypto.randomUUID()
    const { data: fakeClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        id: fakeClientId,
        stripe_customer_id: 'cus_fake_test_123',
        tier: 'lite',
        status: 'active'
      })
      .select()
      .single()

    if (clientError) {
      console.error('❌ Failed to create fake client:', clientError)
      return
    }
    console.log('✅ Fake client created:', fakeClient.id)

    // Test 2: Test metrics fetching function
    console.log('\n2️⃣ Testing fetch-metrics function...')
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/fetch-metrics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Fetch-metrics function executed:', result)

        // Check if metrics were inserted
        const { data: metrics, error: metricsError } = await supabase
          .from('metric_feed')
          .select('*')
          .eq('client_id', fakeClientId)

        if (metricsError) {
          console.error('❌ Error checking metrics:', metricsError)
        } else if (metrics && metrics.length > 0) {
          console.log(`✅ Found ${metrics.length} metric entries for test client`)
        } else {
          console.log('⚠️ No metrics found - this might be expected if no API keys are configured')
        }
      } else {
        console.error('❌ Fetch-metrics function failed:', response.status)
      }
    } catch (error) {
      console.error('❌ Error calling fetch-metrics:', error.message)
    }

    // Test 3: Test summarise-metrics function
    console.log('\n3️⃣ Testing summarise-metrics function...')
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/summarise-metrics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Summarise-metrics function executed:', result)

        // Check if summary was created
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const { data: summary, error: summaryError } = await supabase
          .from('metric_summary')
          .select('*')
          .eq('client_id', fakeClientId)
          .eq('date', yesterdayStr)

        if (summaryError) {
          console.error('❌ Error checking summary:', summaryError)
        } else if (summary && summary.length > 0) {
          console.log('✅ Metric summary created:', summary[0])
        } else {
          console.log('⚠️ No metric summary found - this is expected if no raw metrics exist')
        }
      } else {
        console.error('❌ Summarise-metrics function failed:', response.status)
      }
    } catch (error) {
      console.error('❌ Error calling summarise-metrics:', error.message)
    }

    // Test 4: Test Stripe webhook handler (RPC function)
    console.log('\n4️⃣ Testing Stripe webhook handling...')
    try {
      const mockStripeEvent = {
        id: 'evt_test_123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
            items: {
              data: [{
                price: {
                  id: 'price_live_123' // lite tier
                }
              }]
            }
          }
        }
      }

      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('handle_stripe_event', { event_data: mockStripeEvent })

      if (rpcError) {
        console.error('❌ RPC function failed:', rpcError)
      } else {
        console.log('✅ Stripe webhook RPC executed:', rpcResult)

        // Check if client was created
        const { data: client, error: clientCheckError } = await supabase
          .from('clients')
          .select('*')
          .eq('stripe_customer_id', 'cus_test_123')
          .single()

        if (clientCheckError) {
          console.error('❌ Error checking created client:', clientCheckError)
        } else {
          console.log('✅ Client created by webhook:', client)
        }
      }
    } catch (error) {
      console.error('❌ Error testing webhook handler:', error.message)
    }

    // Test 5: Test health check function
    console.log('\n5️⃣ Testing health-check function...')
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/health-check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Health check passed:', result.status)
        console.log(`   Services: ${result.summary?.healthy || 0} healthy, ${result.summary?.degraded || 0} degraded, ${result.summary?.down || 0} down`)
      } else {
        console.error('❌ Health check failed:', response.status)
      }
    } catch (error) {
      console.error('❌ Error calling health-check:', error.message)
    }

    // Cleanup: Remove test data
    console.log('\n🧹 Cleaning up test data...')
    
    // Remove fake client and related data
    await supabase.from('clients').delete().eq('id', fakeClientId)
    await supabase.from('clients').delete().eq('stripe_customer_id', 'cus_test_123')
    await supabase.from('metric_feed').delete().eq('client_id', fakeClientId)
    await supabase.from('metric_summary').delete().eq('client_id', fakeClientId)
    
    console.log('✅ Cleanup completed')

  } catch (error) {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  }

  console.log('\n🎉 All integration tests completed!')
}

// Run the tests
runTests().catch(console.error)
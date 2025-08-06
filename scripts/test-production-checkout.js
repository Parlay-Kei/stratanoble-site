#!/usr/bin/env node

/**
 * Production Checkout Test Script
 * Tests the complete Stripe → DB → Dashboard flow with 99.8% discount
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config()

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function testProductionCheckout() {
  console.log('🧪 Testing Production Checkout Flow (99.8% discount)...\n')

  const testEmail = `test-${Date.now()}@stratanoble.com`
  const testName = 'Test User Production'

  try {
    console.log('1️⃣ Creating discounted checkout session...')
    
    // Create checkout session with test discount
    const checkoutResponse = await fetch(`${BASE_URL}/api/stripe/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offeringId: 'lite',  // Test with lite plan ($300 → $0.60)
        customerEmail: testEmail,
        customerName: testName,
        test: true  // This applies the 99.8% discount
      })
    })

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.text()
      console.error('❌ Checkout creation failed:', error)
      return
    }

    const checkoutData = await checkoutResponse.json()
    console.log('✅ Checkout session created:', checkoutData.url)
    console.log(`   Session ID: ${checkoutData.sessionId}`)
    console.log(`   Amount: $${(checkoutData.amount || 60) / 100} (99.8% discount applied)`)

    console.log('\n🎯 Next Steps:')
    console.log('1. Open the checkout URL in your browser')
    console.log('2. Complete the payment (~$0.60)')  
    console.log('3. Run the verification script below')
    console.log(`\nCheckout URL: ${checkoutData.url}`)

    // Save session ID for later verification
    await fs.writeFile('test-session.json', JSON.stringify({
      sessionId: checkoutData.sessionId,
      email: testEmail,
      name: testName,
      timestamp: new Date().toISOString()
    }))

    console.log('\n📋 After checkout completion, run:')
    console.log('   node scripts/verify-checkout-flow.js')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

async function verifyCheckoutFlow() {
  console.log('🔍 Verifying checkout flow completion...\n')

  try {
    // Read test session data
    const fs = await import('fs/promises')
    const sessionData = JSON.parse(await fs.readFile('test-session.json', 'utf8'))
    
    console.log(`Checking session: ${sessionData.sessionId}`)
    console.log(`Email: ${sessionData.email}`)

    // Check if client was created
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('stripe_customer_id', sessionData.customerId) // Will be populated by webhook
      .single()

    if (clientError && clientError.code !== 'PGRST116') {
      console.error('❌ Error checking client:', clientError)
      return
    }

    if (client) {
      console.log('✅ Client created successfully:')
      console.log(`   Client ID: ${client.id}`)
      console.log(`   Tier: ${client.tier}`)
      console.log(`   Status: ${client.status}`)
    } else {
      console.log('⏳ Client not found yet - webhook may still be processing')
      console.log('   Check Stripe webhook logs and try again in a few minutes')
    }

    // Check subscription
    if (client) {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('client_id', client.id)
        .single()

      if (subscription) {
        console.log('✅ Subscription created:')
        console.log(`   Status: ${subscription.status}`)
        console.log(`   Stripe ID: ${subscription.stripe_subscription_id}`)
      } else {
        console.log('❌ Subscription not found:', subError?.message)
      }
    }

    // Check onboarding status
    if (client) {
      const { data: onboarding, error: onboardingError } = await supabase
        .from('onboarding_status')
        .select('*')
        .eq('client_id', client.id)
        .single()

      if (onboarding) {
        console.log('✅ Onboarding status:')
        console.log(`   Welcome email sent: ${onboarding.welcome_email_sent}`)
        console.log(`   Has Airtable: ${onboarding.has_airtable}`)
        console.log(`   Has Geniuslink: ${onboarding.has_geniuslink}`)
      } else {
        console.log('❌ Onboarding status not found:', onboardingError?.message)
      }
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

// Run the appropriate function based on command line args
const command = process.argv[2]

if (command === 'verify') {
  verifyCheckoutFlow()
} else {
  testProductionCheckout()
}
#!/usr/bin/env node

/**
 * Quick Database Test - Test connection and basic queries
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔌 Testing database connection...')
console.log(`URL: ${SUPABASE_URL}`)
console.log(`Key: ${SUPABASE_ANON_KEY?.substring(0, 20)}...`)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testDatabase() {
  try {
    // Test offerings table (public readable)
    const { data: offerings, error: offeringsError } = await supabase
      .from('offerings')
      .select('*')

    if (offeringsError) {
      console.error('❌ Offerings query failed:', offeringsError)
      return
    }

    console.log('✅ Database connection successful!')
    console.log(`📊 Found ${offerings.length} offerings:`)
    offerings.forEach(offer => {
      console.log(`   ${offer.id}: ${offer.nickname} - $${offer.monthly_price/100}/month`)
    })

    // Test system health view (if accessible)
    const { data: health, error: healthError } = await supabase
      .from('service_health_summary')
      .select('*')
      .limit(5)

    if (!healthError && health) {
      console.log(`\n💓 System health (${health.length} services):`)
      health.forEach(service => {
        console.log(`   ${service.service_name}: ${service.effective_status}`)
      })
    }

    return true

  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    return false
  }
}

testDatabase()
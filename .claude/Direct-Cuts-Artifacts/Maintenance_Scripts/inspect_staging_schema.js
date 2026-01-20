#!/usr/bin/env node

// Inspect staging database schema to understand structure
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load staging environment
config({ path: '.env.staging' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🎯 ENV: STAGING');
console.log('🌐 URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function inspectDatabase() {
  try {
    // Check what tables exist
    console.log('\n📋 Inspecting tables...');

    // Try to list all tables in public schema
    const tables = ['users', 'barbers', 'services', 'appointments', 'barber_subscriptions', 'guest_identities'];

    for (const tableName of tables) {
      console.log(`\n🔍 Checking ${tableName} table...`);

      // Try to get a few records to see structure
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: ${count} records`);
        if (data && data.length > 0) {
          console.log('   Sample structure:', Object.keys(data[0]).join(', '));
        }
      }
    }

    // Check for existing test data
    console.log('\n🔍 Checking for existing test data...');

    const testIds = [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333'
    ];

    // Check if any test users exist
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', testIds);

    if (!usersError) {
      console.log(`📊 Existing test users: ${existingUsers.length}`);
      existingUsers.forEach(user => {
        console.log(`   - ${user.full_name} (${user.email})`);
      });
    }

    // Check barbers
    const { data: existingBarbers, error: barbersError } = await supabase
      .from('barbers')
      .select('*')
      .in('id', testIds);

    if (!barbersError) {
      console.log(`✂️ Existing test barbers: ${existingBarbers.length}`);
    }

    // Check subscriptions
    const { data: existingSubscriptions, error: subscriptionsError } = await supabase
      .from('barber_subscriptions')
      .select('*')
      .in('barber_id', testIds);

    if (!subscriptionsError) {
      console.log(`💳 Existing subscriptions: ${existingSubscriptions.length}`);
      existingSubscriptions.forEach(sub => {
        console.log(`   - ${sub.barber_id}: ${sub.status} (${sub.stripe_subscription_id})`);
      });
    }

    console.log('\n✅ Schema inspection complete');

  } catch (error) {
    console.error('💥 Inspection failed:', error.message);
  }
}

inspectDatabase();
#!/usr/bin/env node

// Execute staging test data setup for E2E testing
// CRITICAL: Only for staging project wgxiiefnmaxfxfoqsbwl

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load staging environment
config({ path: '.env.staging' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing staging environment variables');
  process.exit(1);
}

console.log('🎯 ENV: STAGING');
console.log('🌐 URL:', supabaseUrl);
console.log('📋 ACTIONS: Execute simplified test data setup for E2E');

// Verify staging environment
if (!supabaseUrl.includes('wgxiiefnmaxfxfoqsbwl')) {
  console.error('❌ SAFETY CHECK FAILED: Not staging environment!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// First, let's inspect the actual schema
async function inspectSchema() {
  console.log('\n🔍 Inspecting database schema...');

  // Check if barbers table exists and what columns it has
  const { data: barbersSchema, error: barbersError } = await supabase
    .rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'barbers' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

  if (barbersError) {
    console.log('❌ Could not inspect barbers schema:', barbersError.message);
  } else {
    console.log('\n📋 Barbers table schema:');
    console.table(barbersSchema);
  }

  // Check users table
  const { data: usersSchema, error: usersError } = await supabase
    .rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

  if (usersError) {
    console.log('❌ Could not inspect users schema:', usersError.message);
  } else {
    console.log('\n👥 Users table schema:');
    console.table(usersSchema);
  }

  return { barbersSchema, usersSchema };
}

// Clean up existing test data
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up existing test data...');

  const testIds = [
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555'
  ];

  const guestId = '44444444-4444-4444-4444-444444444444';

  // Clean appointments
  const { error: appointmentsError } = await supabase
    .from('appointments')
    .delete()
    .in('barber_id', testIds.slice(0, 3));

  if (appointmentsError) {
    console.log('⚠️ Appointments cleanup:', appointmentsError.message);
  } else {
    console.log('✅ Cleaned appointments');
  }

  // Clean services
  const { error: servicesError } = await supabase
    .from('services')
    .delete()
    .in('barber_id', testIds.slice(0, 3));

  if (servicesError) {
    console.log('⚠️ Services cleanup:', servicesError.message);
  } else {
    console.log('✅ Cleaned services');
  }

  // Clean barber_subscriptions
  const { error: subscriptionsError } = await supabase
    .from('barber_subscriptions')
    .delete()
    .in('barber_id', testIds.slice(0, 3));

  if (subscriptionsError) {
    console.log('⚠️ Subscriptions cleanup:', subscriptionsError.message);
  } else {
    console.log('✅ Cleaned subscriptions');
  }

  // Clean barbers
  const { error: barbersError } = await supabase
    .from('barbers')
    .delete()
    .in('id', testIds.slice(0, 3));

  if (barbersError) {
    console.log('⚠️ Barbers cleanup:', barbersError.message);
  } else {
    console.log('✅ Cleaned barbers');
  }

  // Clean guest_identities
  const { error: guestError } = await supabase
    .from('guest_identities')
    .delete()
    .eq('id', guestId);

  if (guestError) {
    console.log('⚠️ Guest cleanup:', guestError.message);
  } else {
    console.log('✅ Cleaned guest identities');
  }

  // Clean users
  const { error: usersError } = await supabase
    .from('users')
    .delete()
    .in('id', testIds);

  if (usersError) {
    console.log('⚠️ Users cleanup:', usersError.message);
  } else {
    console.log('✅ Cleaned users');
  }

  console.log('🧹 Cleanup completed');
}

// Create test data using the actual schema
async function createTestData(schema) {
  console.log('\n🏗️ Creating test data...');

  // Create users first
  const usersToCreate = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'barber.a@staging.test',
      full_name: 'Barber A Entitled',
      is_barber: true
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'barber.b@staging.test',
      full_name: 'Barber B NotEntitled',
      is_barber: true
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'barber.c@staging.test',
      full_name: 'Barber C Inactive',
      is_barber: true
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      email: 'member.m@staging.test',
      full_name: 'Member M Test',
      is_barber: false
    }
  ];

  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .insert(usersToCreate);

  if (usersError) {
    console.log('❌ Users creation failed:', usersError.message);
    return false;
  } else {
    console.log('✅ Created users');
  }

  // Check if barbers table has is_active column
  const hasIsActive = schema.barbersSchema?.some(col => col.column_name === 'is_active');

  // Create barber records (adapt based on schema)
  const barbersToCreate = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      shop_name: 'Barber A Shop',
      bio: 'Test barber - subscription via Stripe webhook',
      ...(hasIsActive ? { is_active: true } : {})
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      shop_name: 'Barber B Shop',
      bio: 'Test barber WITHOUT subscription',
      ...(hasIsActive ? { is_active: true } : {})
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      shop_name: 'Barber C Shop',
      bio: 'Test barber who is INACTIVE',
      ...(hasIsActive ? { is_active: false } : {})
    }
  ];

  const { data: barbersData, error: barbersError } = await supabase
    .from('barbers')
    .insert(barbersToCreate);

  if (barbersError) {
    console.log('❌ Barbers creation failed:', barbersError.message);
    return false;
  } else {
    console.log('✅ Created barbers');
  }

  // Create services
  const servicesToCreate = [
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      barber_id: '11111111-1111-1111-1111-111111111111',
      name: 'Test Haircut A',
      description: 'Basic haircut service',
      price: 30.00,
      duration_minutes: 30
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      barber_id: '22222222-2222-2222-2222-222222222222',
      name: 'Test Haircut B',
      description: 'Basic haircut service',
      price: 30.00,
      duration_minutes: 30
    },
    {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      barber_id: '33333333-3333-3333-3333-333333333333',
      name: 'Test Haircut C',
      description: 'Basic haircut service',
      price: 30.00,
      duration_minutes: 30
    }
  ];

  const { data: servicesData, error: servicesError } = await supabase
    .from('services')
    .insert(servicesToCreate);

  if (servicesError) {
    console.log('❌ Services creation failed:', servicesError.message);
    return false;
  } else {
    console.log('✅ Created services');
  }

  // Create Barber C subscription (only one with fake subscription for testing inactive override)
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('barber_subscriptions')
    .insert({
      barber_id: '33333333-3333-3333-3333-333333333333',
      status: 'active',
      stripe_customer_id: 'cus_test_barberC',
      stripe_subscription_id: 'sub_test_barberC',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

  if (subscriptionError) {
    console.log('❌ Barber C subscription creation failed:', subscriptionError.message);
  } else {
    console.log('✅ Created Barber C subscription (for inactive testing)');
  }

  // Create guest identity
  const { data: guestData, error: guestError } = await supabase
    .from('guest_identities')
    .insert({
      id: '44444444-4444-4444-4444-444444444444',
      phone: '+15555551234',
      email: 'guest.g@staging.test',
      verified: false,
      verification_code: '123456',
      verification_code_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });

  if (guestError) {
    console.log('❌ Guest creation failed:', guestError.message);
    return false;
  } else {
    console.log('✅ Created guest identity');
  }

  return true;
}

// Verify the setup
async function verifySetup() {
  console.log('\n🔍 Verifying setup...');

  // Check barbers and their data
  const { data: barbers, error: barbersError } = await supabase
    .from('barbers')
    .select(`
      id,
      shop_name,
      bio,
      users!inner(full_name, email),
      barber_subscriptions(status, stripe_subscription_id),
      services(name, price)
    `)
    .in('id', [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333'
    ]);

  if (barbersError) {
    console.log('❌ Barber verification failed:', barbersError.message);
  } else {
    console.log('\n📋 Created Barbers:');
    barbers.forEach(barber => {
      const subscription = barber.barber_subscriptions?.[0];
      console.log(`
        👨‍💼 ${barber.users.full_name} (${barber.users.email})
        🏪 Shop: ${barber.shop_name}
        📝 Bio: ${barber.bio}
        💳 Subscription: ${subscription ? subscription.stripe_subscription_id + ' (' + subscription.status + ')' : 'NONE'}
        ⚡ Services: ${barber.services.length} service(s)
      `);
    });
  }

  // Check guest and member
  const { data: guest, error: guestError } = await supabase
    .from('guest_identities')
    .select('*')
    .eq('id', '44444444-4444-4444-4444-444444444444')
    .single();

  const { data: member, error: memberError } = await supabase
    .from('users')
    .select('*')
    .eq('id', '55555555-5555-5555-5555-555555555555')
    .single();

  console.log('\n🎭 Test Actors Status:');
  console.log('Guest G:', guest ? '✅ Created' : '❌ Failed');
  console.log('Member M:', member ? '✅ Created' : '❌ Failed');

  return { barbers, guest, member };
}

// Main execution
(async () => {
  try {
    const schema = await inspectSchema();
    await cleanupTestData();
    const success = await createTestData(schema);

    if (success) {
      const verification = await verifySetup();

      console.log('\n🎯 STAGING E2E TEST DATA SETUP COMPLETE');
      console.log('⚠️ CRITICAL: Barber A subscription must be created via Stripe webhook!');
      console.log('📝 Next steps:');
      console.log('   1. Call barber-subscription-service edge function for Barber A');
      console.log('   2. OR create subscription in Stripe Dashboard (test mode)');
      console.log('   3. Verify webhook processes the subscription');
      console.log('   4. Run E2E tests');

      console.log('\n📊 Current Status:');
      console.log('   Barber A: ❌ No subscription (ready for webhook test)');
      console.log('   Barber B: ❌ No subscription (blocked)');
      console.log('   Barber C: ⚠️ Has subscription but may be inactive');
      console.log('   Guest G: ✅ Ready for verification testing');
      console.log('   Member M: ✅ Ready for merge testing');

    } else {
      console.log('❌ Setup failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
})();
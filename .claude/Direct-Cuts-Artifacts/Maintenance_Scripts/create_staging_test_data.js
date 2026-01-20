#!/usr/bin/env node

// Create staging test data with proper auth.users setup
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load staging environment
config({ path: '.env.staging' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🎯 ENV: STAGING');
console.log('🌐 URL:', supabaseUrl);
console.log('📋 ACTIONS: Create E2E test data with proper auth setup');

// Verify staging environment
if (!supabaseUrl.includes('wgxiiefnmaxfxfoqsbwl')) {
  console.error('❌ SAFETY CHECK FAILED: Not staging environment!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

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

  // Clean in proper order (child to parent)
  const cleanupSteps = [
    { table: 'appointments', field: 'barber_id', ids: testIds.slice(0, 3), name: 'appointments' },
    { table: 'services', field: 'barber_id', ids: testIds.slice(0, 3), name: 'services' },
    { table: 'barber_subscriptions', field: 'barber_id', ids: testIds.slice(0, 3), name: 'subscriptions' },
    { table: 'barbers', field: 'id', ids: testIds.slice(0, 3), name: 'barbers' },
    { table: 'users', field: 'id', ids: testIds, name: 'users' },
    { table: 'guest_identities', field: 'id', ids: [guestId], name: 'guest identities' }
  ];

  for (const step of cleanupSteps) {
    const { error } = await supabase
      .from(step.table)
      .delete()
      .in(step.field, step.ids);

    if (error) {
      console.log(`⚠️ ${step.name} cleanup:`, error.message);
    } else {
      console.log(`✅ Cleaned ${step.name}`);
    }
  }

  // Also clean auth.users using admin API
  console.log('\n🔐 Cleaning auth users...');

  for (const userId of testIds) {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error && !error.message.includes('User not found')) {
        console.log(`⚠️ Auth user ${userId}:`, error.message);
      } else {
        console.log(`✅ Cleaned auth user ${userId}`);
      }
    } catch (error) {
      console.log(`⚠️ Auth user ${userId}:`, error.message);
    }
  }

  console.log('🧹 Cleanup completed');
}

// Create auth users first, then public users
async function createTestData() {
  console.log('\n🏗️ Creating test data...');

  // Create auth users first
  const authUsersToCreate = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'barber.a@staging.test',
      password: 'TestPassword123!',
      user_metadata: { full_name: 'Barber A Entitled' }
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'barber.b@staging.test',
      password: 'TestPassword123!',
      user_metadata: { full_name: 'Barber B NotEntitled' }
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'barber.c@staging.test',
      password: 'TestPassword123!',
      user_metadata: { full_name: 'Barber C Inactive' }
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      email: 'member.m@staging.test',
      password: 'TestPassword123!',
      user_metadata: { full_name: 'Member M Test' }
    }
  ];

  console.log('🔐 Creating auth users...');

  for (const authUser of authUsersToCreate) {
    const { data, error } = await supabase.auth.admin.createUser({
      user_id: authUser.id,
      email: authUser.email,
      password: authUser.password,
      user_metadata: authUser.user_metadata,
      email_confirm: true // Auto-confirm emails in staging
    });

    if (error) {
      console.log(`❌ Auth user ${authUser.email}:`, error.message);
      return false;
    } else {
      console.log(`✅ Created auth user ${authUser.email}`);
    }
  }

  // Create public users
  console.log('\n👥 Creating public users...');
  const publicUsersToCreate = [
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
    .insert(publicUsersToCreate);

  if (usersError) {
    console.log('❌ Public users creation failed:', usersError.message);
    return false;
  } else {
    console.log('✅ Created public users');
  }

  // Create barber records
  console.log('\n✂️ Creating barbers...');
  const barbersToCreate = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      shop_name: 'Barber A Shop',
      bio: 'Test barber - subscription via Stripe webhook'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      shop_name: 'Barber B Shop',
      bio: 'Test barber WITHOUT subscription'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      shop_name: 'Barber C Shop',
      bio: 'Test barber who is INACTIVE'
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
  console.log('\n🔧 Creating services...');
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

  // Create guest identity
  console.log('\n🎭 Creating guest identity...');
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

  // NOTE: NOT creating Barber A subscription - this must be done via Stripe webhook!

  return true;
}

// Verify the setup
async function verifySetup() {
  console.log('\n🔍 Verifying setup...');

  // Check barbers
  const { data: barbers, error: barbersError } = await supabase
    .from('barbers')
    .select(`
      id,
      shop_name,
      bio,
      users!inner(full_name, email, is_barber),
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
    return false;
  }

  // Check guest and member
  const { data: guest } = await supabase
    .from('guest_identities')
    .select('*')
    .eq('id', '44444444-4444-4444-4444-444444444444')
    .single();

  const { data: member } = await supabase
    .from('users')
    .select('*')
    .eq('id', '55555555-5555-5555-5555-555555555555')
    .single();

  console.log('\n✅ STAGING E2E TEST DATA CREATED SUCCESSFULLY');

  console.log('\n📊 Test Actors Summary:');

  barbers.forEach(barber => {
    const subscription = barber.barber_subscriptions?.[0];
    let status = '❌ BLOCKED: No subscription';

    if (subscription?.status === 'active') {
      status = '✅ CAN BOOK';
    } else if (subscription?.status) {
      status = `❌ BLOCKED: ${subscription.status}`;
    }

    console.log(`
      👨‍💼 ${barber.users.full_name} (${barber.users.email})
      🏪 Shop: ${barber.shop_name}
      💳 Subscription: ${subscription ? subscription.stripe_subscription_id + ' (' + subscription.status + ')' : 'NONE'}
      📊 Status: ${status}
      ⚡ Services: ${barber.services.length} available
    `);
  });

  console.log(`
    🎭 Guest G: ${guest ? '✅ Ready for verification testing' : '❌ Failed'}
    👤 Member M: ${member ? '✅ Ready for merge testing' : '❌ Failed'}
  `);

  console.log('\n⚠️ CRITICAL NEXT STEPS:');
  console.log('   1. Create REAL Stripe subscription for Barber A via webhook');
  console.log('   2. Call barber-subscription-service edge function');
  console.log('   3. OR create subscription in Stripe Dashboard (test mode)');
  console.log('   4. Verify webhook creates barber_subscriptions row');
  console.log('   5. Run E2E tests to verify booking flow');

  return { barbers, guest, member };
}

// Main execution
(async () => {
  try {
    await cleanupTestData();
    const success = await createTestData();

    if (success) {
      const verification = await verifySetup();
      console.log('\n🎯 Ready for next phase: Stripe webhook subscription creation');
    } else {
      console.log('❌ Setup failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
})();
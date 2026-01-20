#!/usr/bin/env node

// Create fresh test users with unique emails for staging E2E
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.staging' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🎯 ENV: STAGING');
console.log('🌐 URL:', supabaseUrl);
console.log('🚀 ACTIONS: Create fresh E2E test data with unique emails');

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

// Use timestamp to ensure uniqueness
const timestamp = Date.now();

async function createFreshTestUsers() {
  console.log('\n🔐 Creating fresh test users with unique emails...');

  const users = [
    {
      email: `barber.a.${timestamp}@staging.test`,
      password: 'TestPassword123!',
      userData: {
        full_name: 'Barber A Entitled',
        is_barber: true,
        shop_name: 'Barber A Shop',
        bio: 'Test barber - subscription via Stripe webhook',
        role: 'BARBER_A'
      }
    },
    {
      email: `barber.b.${timestamp}@staging.test`,
      password: 'TestPassword123!',
      userData: {
        full_name: 'Barber B NotEntitled',
        is_barber: true,
        shop_name: 'Barber B Shop',
        bio: 'Test barber WITHOUT subscription',
        role: 'BARBER_B'
      }
    },
    {
      email: `barber.c.${timestamp}@staging.test`,
      password: 'TestPassword123!',
      userData: {
        full_name: 'Barber C Inactive',
        is_barber: true,
        shop_name: 'Barber C Shop',
        bio: 'Test barber who is INACTIVE',
        role: 'BARBER_C'
      }
    },
    {
      email: `member.m.${timestamp}@staging.test`,
      password: 'TestPassword123!',
      userData: {
        full_name: 'Member M Test',
        is_barber: false,
        role: 'MEMBER_M'
      }
    }
  ];

  const createdUsers = [];

  // Create auth users
  for (const user of users) {
    console.log(`Creating: ${user.email}`);

    const { data: authData, error } = await adminSupabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      user_metadata: user.userData,
      email_confirm: true
    });

    if (error) {
      console.log(`❌ Failed to create ${user.email}:`, error.message);
      return null;
    } else {
      console.log(`✅ Created auth user: ${user.userData.full_name} (${authData.user.id})`);
      createdUsers.push({
        id: authData.user.id,
        ...user
      });
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Create public users
  console.log('\n👥 Creating public user profiles...');
  const publicUsers = createdUsers.map(user => ({
    id: user.id,
    email: user.email,
    full_name: user.userData.full_name,
    is_barber: user.userData.is_barber
  }));

  const { error: publicError } = await adminSupabase
    .from('users')
    .insert(publicUsers);

  if (publicError) {
    console.log('❌ Failed to create public users:', publicError.message);
    return null;
  }
  console.log('✅ Created public user profiles');

  // Create barbers
  const barbers = createdUsers.filter(user => user.userData.is_barber);
  console.log('\n✂️ Creating barber profiles...');

  const barberProfiles = barbers.map(user => ({
    id: user.id,
    shop_name: user.userData.shop_name,
    bio: user.userData.bio
  }));

  const { error: barbersError } = await adminSupabase
    .from('barbers')
    .insert(barberProfiles);

  if (barbersError) {
    console.log('❌ Failed to create barbers:', barbersError.message);
    return null;
  }
  console.log('✅ Created barber profiles');

  // Create services
  console.log('\n🔧 Creating services...');
  const services = barbers.map((user, index) => ({
    barber_id: user.id,
    name: `Test Haircut ${String.fromCharCode(65 + index)}`,
    description: 'Basic haircut service for E2E testing',
    price: 30.00,
    duration_minutes: 30
  }));

  const { error: servicesError } = await adminSupabase
    .from('services')
    .insert(services);

  if (servicesError) {
    console.log('❌ Failed to create services:', servicesError.message);
    return null;
  }
  console.log('✅ Created services');

  // Create guest identity
  console.log('\n🎭 Creating guest identity...');
  const guestId = `guest-${timestamp}`;
  const { data: guestData, error: guestError } = await adminSupabase
    .from('guest_identities')
    .insert({
      full_name: 'Guest G Test',
      phone: `+1555555${String(timestamp).slice(-4)}`,
      email: `guest.g.${timestamp}@staging.test`,
      verification_method: 'sms'
    })
    .select()
    .single();

  if (guestError) {
    console.log('❌ Failed to create guest:', guestError.message);
    return null;
  }
  console.log('✅ Created guest identity');

  return {
    users: createdUsers,
    guestId: guestData.id
  };
}

async function generateFinalReport(result) {
  console.log('\n📊 STAGING E2E TEST DATA REPORT');
  console.log('=====================================');

  // Get complete data for verification
  const { data: barbers } = await adminSupabase
    .from('barbers')
    .select(`
      id,
      shop_name,
      bio,
      users!inner(full_name, email),
      barber_subscriptions(status, stripe_subscription_id),
      services(id, name, price)
    `)
    .in('id', result.users.filter(u => u.userData.is_barber).map(u => u.id));

  const { data: member } = await adminSupabase
    .from('users')
    .select('*')
    .eq('is_barber', false)
    .in('id', result.users.filter(u => !u.userData.is_barber).map(u => u.id))
    .single();

  const { data: guest } = await adminSupabase
    .from('guest_identities')
    .select('*')
    .eq('id', result.guestId)
    .single();

  console.log('\n📋 Test Actors:');

  console.log('\n🔵 BARBERS:');
  barbers?.forEach((barber, index) => {
    const user = result.users.find(u => u.id === barber.id);
    const subscription = barber.barber_subscriptions?.[0];
    let status = '❌ BLOCKED: No subscription';

    if (subscription?.status === 'active' || subscription?.status === 'trialing') {
      status = '✅ CAN BOOK';
    } else if (subscription?.status) {
      status = `❌ BLOCKED: ${subscription.status}`;
    }

    console.log(`
      ${['🅰️', '🅱️', '🅒️'][index]} ${barber.users.full_name} (${user?.userData.role})
      📧 Email: ${barber.users.email}
      🆔 ID: ${barber.id}
      🏪 Shop: ${barber.shop_name}
      💳 Subscription: ${subscription ? subscription.stripe_subscription_id + ' (' + subscription.status + ')' : 'NONE'}
      📊 Status: ${status}
      ⚡ Services: ${barber.services?.length || 0} available
    `);
  });

  console.log('\n🔵 MEMBER:');
  console.log(`
      👤 ${member?.full_name}
      📧 Email: ${member?.email}
      🆔 ID: ${member?.id}
      📊 Status: ✅ Ready for booking tests
  `);

  console.log('\n🔵 GUEST:');
  console.log(`
      🎭 ${guest?.full_name}
      📧 Email: ${guest?.email}
      📞 Phone: ${guest?.phone}
      🆔 ID: ${guest?.id}
      📊 Status: ✅ Ready for verification flow tests
  `);

  console.log('\n🔐 Login Credentials for Manual Testing:');
  result.users.forEach(user => {
    console.log(`   ${user.email} / TestPassword123!`);
  });

  console.log('\n⚠️ CRITICAL NEXT STEP:');
  console.log('🎯 CREATE REAL STRIPE SUBSCRIPTION FOR BARBER A');

  const barberA = result.users.find(u => u.userData.role === 'BARBER_A');
  console.log(`\n📋 Barber A Details for Stripe Setup:`);
  console.log(`   ID: ${barberA.id}`);
  console.log(`   Email: ${barberA.email}`);
  console.log(`   Name: ${barberA.userData.full_name}`);

  console.log('\n🚀 Next Actions:');
  console.log('   1. Call barber-subscription-service edge function');
  console.log('   2. Create subscription in Stripe Dashboard (test mode)');
  console.log('   3. Verify webhook creates barber_subscriptions row');
  console.log('   4. Confirm Barber A status changes to CAN BOOK');
  console.log('   5. Run E2E tests');

  return {
    barberA,
    barbers,
    member,
    guest,
    timestamp
  };
}

// Main execution
(async () => {
  try {
    const result = await createFreshTestUsers();

    if (!result) {
      console.log('❌ Failed to create test users');
      process.exit(1);
    }

    const report = await generateFinalReport(result);

    console.log('\n✅ STAGING E2E TEST DATA SETUP COMPLETE!');
    console.log('🎯 Ready for Stripe subscription creation phase');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
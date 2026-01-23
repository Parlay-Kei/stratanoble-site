#!/usr/bin/env node

// Create test users using proper signup flow
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.staging' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🎯 ENV: STAGING');
console.log('🌐 URL:', supabaseUrl);

// Create both clients
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
const publicSupabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUsers() {
  console.log('\n🔐 Creating test users via admin API...');

  const testUsers = [
    {
      email: 'barber.a@staging.test',
      password: 'TestPassword123!',
      user_metadata: {
        full_name: 'Barber A Entitled',
        is_barber: true
      }
    },
    {
      email: 'barber.b@staging.test',
      password: 'TestPassword123!',
      user_metadata: {
        full_name: 'Barber B NotEntitled',
        is_barber: true
      }
    },
    {
      email: 'barber.c@staging.test',
      password: 'TestPassword123!',
      user_metadata: {
        full_name: 'Barber C Inactive',
        is_barber: true
      }
    },
    {
      email: 'member.m@staging.test',
      password: 'TestPassword123!',
      user_metadata: {
        full_name: 'Member M Test',
        is_barber: false
      }
    }
  ];

  const createdUsers = [];

  for (const user of testUsers) {
    console.log(`Creating ${user.email}...`);

    const { data: userData, error } = await adminSupabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      user_metadata: user.user_metadata,
      email_confirm: true
    });

    if (error) {
      console.log(`❌ Failed to create ${user.email}:`, error.message);
    } else {
      console.log(`✅ Created auth user ${user.email} with ID: ${userData.user.id}`);
      createdUsers.push({
        ...user,
        id: userData.user.id,
        authUser: userData.user
      });
    }
  }

  return createdUsers;
}

async function createPublicProfiles(users) {
  console.log('\n👥 Creating public user profiles...');

  const publicUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata.full_name,
    is_barber: user.user_metadata.is_barber
  }));

  const { data, error } = await adminSupabase
    .from('users')
    .insert(publicUsers);

  if (error) {
    console.log('❌ Failed to create public users:', error.message);
    return false;
  } else {
    console.log('✅ Created public user profiles');
    return true;
  }
}

async function createBarberProfiles(users) {
  console.log('\n✂️ Creating barber profiles...');

  const barbers = users
    .filter(user => user.user_metadata.is_barber)
    .map(user => ({
      id: user.id,
      shop_name: `${user.user_metadata.full_name.replace(' ', ' ')}'s Shop`,
      bio: user.user_metadata.full_name.includes('Inactive') ?
           'Test barber who is INACTIVE' :
           user.user_metadata.full_name.includes('NotEntitled') ?
           'Test barber WITHOUT subscription' :
           'Test barber - subscription via Stripe webhook'
    }));

  const { data, error } = await adminSupabase
    .from('barbers')
    .insert(barbers);

  if (error) {
    console.log('❌ Failed to create barber profiles:', error.message);
    return false;
  } else {
    console.log('✅ Created barber profiles');
    return true;
  }
}

async function createServices(users) {
  console.log('\n🔧 Creating services...');

  const barbers = users.filter(user => user.user_metadata.is_barber);
  const services = barbers.map((barber, index) => ({
    barber_id: barber.id,
    name: `Test Haircut ${String.fromCharCode(65 + index)}`,
    description: 'Basic haircut service for testing',
    price: 30.00,
    duration_minutes: 30
  }));

  const { data, error } = await adminSupabase
    .from('services')
    .insert(services);

  if (error) {
    console.log('❌ Failed to create services:', error.message);
    return false;
  } else {
    console.log('✅ Created services');
    return true;
  }
}

async function createGuestIdentity() {
  console.log('\n🎭 Creating guest identity...');

  const { data, error } = await adminSupabase
    .from('guest_identities')
    .insert({
      full_name: 'Guest G Test',
      phone: '+15555551234',
      email: 'guest.g@staging.test',
      verification_method: 'sms'
    });

  if (error) {
    console.log('❌ Failed to create guest:', error.message);
    return false;
  } else {
    console.log('✅ Created guest identity');
    return true;
  }
}

async function verifySetup() {
  console.log('\n🔍 Verifying test data setup...');

  // Get all barbers with their related data
  const { data: barbers, error } = await adminSupabase
    .from('barbers')
    .select(`
      id,
      shop_name,
      bio,
      users!inner(full_name, email, is_barber),
      barber_subscriptions(status, stripe_subscription_id),
      services(name, price)
    `);

  if (error) {
    console.log('❌ Verification failed:', error.message);
    return false;
  }

  // Get guest
  const { data: guest } = await adminSupabase
    .from('guest_identities')
    .select('*')
    .single();

  // Get member
  const { data: member } = await adminSupabase
    .from('users')
    .select('*')
    .eq('is_barber', false)
    .single();

  console.log('\n📊 STAGING E2E TEST DATA SUMMARY:');

  barbers.forEach(barber => {
    const subscription = barber.barber_subscriptions?.[0];
    let status = '❌ BLOCKED: No subscription';

    if (subscription?.status === 'active' || subscription?.status === 'trialing') {
      status = '✅ CAN BOOK';
    } else if (subscription?.status) {
      status = `❌ BLOCKED: ${subscription.status}`;
    }

    console.log(`
      👨‍💼 ${barber.users.full_name} (${barber.users.email})
      🆔 ID: ${barber.id}
      🏪 Shop: ${barber.shop_name}
      💳 Subscription: ${subscription ? subscription.stripe_subscription_id + ' (' + subscription.status + ')' : 'NONE'}
      📊 Status: ${status}
      ⚡ Services: ${barber.services.length} available
    `);
  });

  console.log(`\n🎭 Guest: ${guest ? `✅ ${guest.full_name} (ID: ${guest.id})` : '❌ Failed'}`);
  console.log(`👤 Member: ${member ? `✅ ${member.full_name} (ID: ${member.id})` : '❌ Failed'}`);

  return { barbers, guest, member };
}

// Main execution
(async () => {
  try {
    console.log('🚀 Starting staging E2E test data creation...');

    const users = await createTestUsers();

    if (users.length === 0) {
      console.log('❌ No users created, aborting');
      process.exit(1);
    }

    const publicSuccess = await createPublicProfiles(users);
    if (!publicSuccess) {
      console.log('❌ Failed to create public profiles, aborting');
      process.exit(1);
    }

    const barberSuccess = await createBarberProfiles(users);
    if (!barberSuccess) {
      console.log('❌ Failed to create barber profiles, aborting');
      process.exit(1);
    }

    const servicesSuccess = await createServices(users);
    const guestSuccess = await createGuestIdentity();

    const verification = await verifySetup();

    console.log('\n🎯 STAGING E2E TEST DATA SETUP COMPLETE!');
    console.log('\n⚠️ CRITICAL NEXT STEPS:');
    console.log('   1. Create REAL Stripe subscription for Barber A');
    console.log('   2. Use barber-subscription-service edge function');
    console.log('   3. Verify webhook creates barber_subscriptions row');
    console.log('   4. Run E2E tests');

    console.log('\n📝 Test User Credentials (for manual testing):');
    users.forEach(user => {
      console.log(`   ${user.email} / TestPassword123!`);
    });

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
})();
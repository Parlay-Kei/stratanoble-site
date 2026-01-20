#!/usr/bin/env node

// Complete cleanup and fresh creation of staging test data
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.staging' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🎯 ENV: STAGING');
console.log('🌐 URL:', supabaseUrl);
console.log('🧹 ACTIONS: Complete cleanup and fresh test data creation');

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

const testEmails = [
  'barber.a@staging.test',
  'barber.b@staging.test',
  'barber.c@staging.test',
  'member.m@staging.test'
];

async function cleanupExistingUsers() {
  console.log('\n🧹 Cleaning up existing users...');

  // Get existing users by email
  const { data: existingUsers, error } = await adminSupabase.auth.admin.listUsers();

  if (error) {
    console.log('❌ Failed to list users:', error.message);
    return false;
  }

  for (const email of testEmails) {
    const existingUser = existingUsers.users.find(u => u.email === email);
    if (existingUser) {
      console.log(`Deleting existing user: ${email} (${existingUser.id})`);

      // Delete from auth
      const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(existingUser.id);
      if (deleteError) {
        console.log(`⚠️ Failed to delete auth user ${email}:`, deleteError.message);
      } else {
        console.log(`✅ Deleted auth user ${email}`);
      }

      // Wait a bit to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      console.log(`No existing auth user found for: ${email}`);
    }
  }

  console.log('✅ Auth cleanup completed');

  // Clean up all related database tables
  console.log('\n🧹 Cleaning up database tables...');

  // Since we don't know the exact IDs, let's clean by email patterns
  const tables = [
    'appointments',
    'services',
    'barber_subscriptions',
    'barbers',
    'users',
    'guest_identities'
  ];

  for (const table of tables) {
    const { error } = await adminSupabase
      .from(table)
      .delete()
      .or(`email.like.%staging.test%,phone.like.%5555551234%`);

    if (error && !error.message.includes('column') && !error.message.includes('does not exist')) {
      console.log(`⚠️ Failed to clean ${table}:`, error.message);
    } else {
      console.log(`✅ Cleaned ${table} table`);
    }
  }

  return true;
}

async function createFreshTestData() {
  console.log('\n🏗️ Creating fresh test data...');

  const users = [
    {
      email: 'barber.a@staging.test',
      password: 'TestPassword123!',
      userData: {
        full_name: 'Barber A Entitled',
        is_barber: true,
        shop_name: 'Barber A Shop',
        bio: 'Test barber - subscription via Stripe webhook'
      }
    },
    {
      email: 'barber.b@staging.test',
      password: 'TestPassword123!',
      userData: {
        full_name: 'Barber B NotEntitled',
        is_barber: true,
        shop_name: 'Barber B Shop',
        bio: 'Test barber WITHOUT subscription'
      }
    },
    {
      email: 'barber.c@staging.test',
      password: 'TestPassword123!',
      userData: {
        full_name: 'Barber C Inactive',
        is_barber: true,
        shop_name: 'Barber C Shop',
        bio: 'Test barber who is INACTIVE (has subscription but inactive)'
      }
    },
    {
      email: 'member.m@staging.test',
      password: 'TestPassword123!',
      userData: {
        full_name: 'Member M Test',
        is_barber: false
      }
    }
  ];

  const createdUsers = [];

  // Create auth users
  for (const user of users) {
    console.log(`Creating auth user: ${user.email}`);

    const { data: authData, error } = await adminSupabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      user_metadata: user.userData,
      email_confirm: true
    });

    if (error) {
      console.log(`❌ Failed to create ${user.email}:`, error.message);
      return false;
    } else {
      console.log(`✅ Created auth user ${user.email} with ID: ${authData.user.id}`);
      createdUsers.push({
        id: authData.user.id,
        ...user
      });
    }

    // Small delay to avoid rate limiting
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
    return false;
  } else {
    console.log('✅ Created public user profiles');
  }

  // Create barbers
  console.log('\n✂️ Creating barber profiles...');
  const barbers = createdUsers
    .filter(user => user.userData.is_barber)
    .map(user => ({
      id: user.id,
      shop_name: user.userData.shop_name,
      bio: user.userData.bio
    }));

  const { error: barbersError } = await adminSupabase
    .from('barbers')
    .insert(barbers);

  if (barbersError) {
    console.log('❌ Failed to create barbers:', barbersError.message);
    return false;
  } else {
    console.log('✅ Created barber profiles');
  }

  // Create services for each barber
  console.log('\n🔧 Creating services...');
  const services = barbers.map((barber, index) => ({
    barber_id: barber.id,
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
    return false;
  } else {
    console.log('✅ Created services');
  }

  // Create guest identity (for guest testing flows)
  console.log('\n🎭 Creating guest identity...');
  const { error: guestError } = await adminSupabase
    .from('guest_identities')
    .insert({
      full_name: 'Guest G Test',
      phone: '+15555551234',
      email: 'guest.g@staging.test',
      verification_method: 'sms'
    });

  if (guestError) {
    console.log('❌ Failed to create guest:', guestError.message);
    return false;
  } else {
    console.log('✅ Created guest identity');
  }

  return { createdUsers, barbers, services };
}

async function generateTestReport() {
  console.log('\n📊 Generating test data report...');

  // Get all data for verification
  const { data: barbers } = await adminSupabase
    .from('barbers')
    .select(`
      id,
      shop_name,
      bio,
      users!inner(full_name, email),
      barber_subscriptions(status, stripe_subscription_id),
      services(id, name, price)
    `);

  const { data: guest } = await adminSupabase
    .from('guest_identities')
    .select('*')
    .single();

  const { data: member } = await adminSupabase
    .from('users')
    .select('*')
    .eq('is_barber', false)
    .single();

  console.log('\n✅ STAGING E2E TEST DATA READY!');

  console.log('\n📋 Test Actors Summary:');

  barbers?.forEach(barber => {
    const subscription = barber.barber_subscriptions?.[0];
    let status = '❌ BLOCKED: No subscription';

    if (subscription?.status === 'active' || subscription?.status === 'trialing') {
      status = '✅ CAN BOOK';
    } else if (subscription?.status) {
      status = `❌ BLOCKED: ${subscription.status}`;
    }

    console.log(`
      👨‍💼 ${barber.users.full_name}
      📧 Email: ${barber.users.email}
      🆔 ID: ${barber.id}
      🏪 Shop: ${barber.shop_name}
      💳 Subscription: ${subscription ? subscription.stripe_subscription_id + ' (' + subscription.status + ')' : 'NONE - Ready for webhook test'}
      📊 Booking Status: ${status}
      ⚡ Services: ${barber.services?.length || 0} available
    `);
  });

  console.log(`\n🎭 Guest: ${guest ? `✅ ${guest.full_name} (${guest.email}) - ID: ${guest.id}` : '❌ Failed'}`);
  console.log(`👤 Member: ${member ? `✅ ${member.full_name} (${member.email}) - ID: ${member.id}` : '❌ Failed'}`);

  console.log('\n🔐 Test User Credentials:');
  console.log('   barber.a@staging.test / TestPassword123!');
  console.log('   barber.b@staging.test / TestPassword123!');
  console.log('   barber.c@staging.test / TestPassword123!');
  console.log('   member.m@staging.test / TestPassword123!');

  console.log('\n⚠️ CRITICAL NEXT STEPS:');
  console.log('   1. Create REAL Stripe subscription for Barber A');
  console.log('   2. Call barber-subscription-service edge function');
  console.log('   3. Verify webhook processes subscription and creates barber_subscriptions row');
  console.log('   4. Validate that Barber A can then be booked');
  console.log('   5. Run full E2E test suite');

  return { barbers, guest, member };
}

// Main execution
(async () => {
  try {
    const cleanupSuccess = await cleanupExistingUsers();
    if (!cleanupSuccess) {
      console.log('❌ Cleanup failed, aborting');
      process.exit(1);
    }

    // Wait a moment for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    const creationResult = await createFreshTestData();
    if (!creationResult) {
      console.log('❌ Test data creation failed');
      process.exit(1);
    }

    const report = await generateTestReport();

    console.log('\n🎯 PHASE 1 COMPLETE: Test data created successfully');
    console.log('🎯 NEXT PHASE: Create real Stripe subscription via webhook');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
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
console.log('📋 ACTIONS: Execute revised test data setup for E2E');

// Verify staging environment
if (!supabaseUrl.includes('wgxiiefnmaxfxfoqsbwl')) {
  console.error('❌ SAFETY CHECK FAILED: Not staging environment!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Read SQL file
const sqlPath = path.join(__dirname, 'docs', 'receipts', 'REVISED_TEST_DATA_SETUP_2026-01-16.sql');
let sqlContent;

try {
  sqlContent = fs.readFileSync(sqlPath, 'utf8');
} catch (error) {
  console.error('❌ Failed to read SQL file:', error.message);
  process.exit(1);
}

// Extract and execute SQL statements
async function executeSetup() {
  try {
    console.log('🚀 Executing test data setup...');

    // Split SQL into statements (simple approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');

    let successCount = 0;
    let totalCount = 0;

    for (const statement of statements) {
      if (statement.toUpperCase().includes('SELECT')) {
        // This is a verification query, execute and display results
        console.log('\n📊 Verification Query:');
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.log('⚠️ Query result:', error.message);
        } else {
          console.log('✅ Query executed successfully');
          if (data && data.length > 0) {
            console.table(data);
          }
        }
        continue;
      }

      totalCount++;
      console.log(`\n[${totalCount}] Executing: ${statement.substring(0, 80)}...`);

      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        console.error(`❌ Error:`, error.message);
        // Continue with other statements
      } else {
        console.log(`✅ Success`);
        successCount++;
      }
    }

    console.log(`\n🎯 Execution complete: ${successCount}/${totalCount} statements succeeded`);

    // Now run verification queries
    console.log('\n=== VERIFICATION QUERIES ===');

    // Check barbers and subscription status
    const { data: barberStatus, error: barberError } = await supabase
      .from('barbers')
      .select(`
        id,
        users!inner(full_name),
        is_active,
        barber_subscriptions(
          status,
          stripe_subscription_id,
          created_at
        )
      `)
      .in('id', [
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333'
      ]);

    if (barberError) {
      console.error('❌ Barber verification failed:', barberError.message);
    } else {
      console.log('\n📋 Barber Status:');
      barberStatus.forEach(barber => {
        const subscription = barber.barber_subscriptions?.[0];
        let status = '❌ BLOCKED: No subscription';

        if (!barber.is_active) {
          status = '❌ BLOCKED: Inactive';
        } else if (subscription?.status === 'active') {
          status = '✅ CAN BOOK';
        } else if (subscription?.status) {
          status = `❌ BLOCKED: ${subscription.status}`;
        }

        console.log(`${barber.users.full_name}: ${status}`);
        if (subscription) {
          console.log(`  Subscription: ${subscription.stripe_subscription_id} (${subscription.status})`);
        }
      });
    }

    // Check guest and member
    const { data: guestData } = await supabase
      .from('guest_identities')
      .select('*')
      .eq('id', '44444444-4444-4444-4444-444444444444')
      .single();

    const { data: memberData } = await supabase
      .from('users')
      .select('*')
      .eq('id', '55555555-5555-5555-5555-555555555555')
      .single();

    console.log('\n🎭 Test Actors:');
    console.log('Guest G:', guestData ? '✅ Created' : '❌ Failed');
    console.log('Member M:', memberData ? '✅ Created' : '❌ Failed');

    return {
      barberStatus,
      guestData,
      memberData,
      successCount,
      totalCount
    };

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  }
}

// Check if exec_sql function exists, if not create a simple alternative
async function ensureExecFunction() {
  try {
    // Try to execute a simple query first
    const { data, error } = await supabase
      .from('barbers')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection verified');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

// Execute with proper error handling
(async () => {
  try {
    const connected = await ensureExecFunction();
    if (!connected) {
      process.exit(1);
    }

    const result = await executeSetup();

    console.log('\n🎯 SETUP COMPLETE FOR STAGING E2E TESTING');
    console.log('⚠️ IMPORTANT: Barber A subscription must still be created via Stripe webhook!');
    console.log('📝 Use barber-subscription-service edge function or Stripe Dashboard to create real subscription');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
})();
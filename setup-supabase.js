#!/usr/bin/env node

/**
 * Supabase Setup Script for Strata Noble
 * 
 * This script helps you set up your Supabase project with the required tables and policies.
 * 
 * Usage:
 * 1. Create your Supabase project at https://supabase.com
 * 2. Get your project URL and service role key
 * 3. Update your .env.local file
 * 4. Run this script to verify the setup
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.log('\nPlease add these to your .env.local file:');
    console.log('SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('SUPABASE_SERVICE_ROLE=your_service_role_key_here');
    return false;
  }

  if (supabaseUrl.includes('your-project-id') || supabaseServiceKey.includes('your_service_role_key_here')) {
    console.error('❌ Please replace the placeholder values with your actual Supabase credentials!');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test connection by querying a table
    const { data, error } = await supabase
      .from('workshop_waitlist')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Tables not found. You need to create the database tables first.');
        console.log('\n📋 Run this SQL in your Supabase SQL Editor:');
        console.log(`
-- Workshop Waitlist Table
CREATE TABLE workshop_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  source text DEFAULT 'web',
  created_at timestamptz DEFAULT now()
);

-- Workshop Signups Table
CREATE TABLE workshop_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_name text,
  event_uri text,
  event_name text,
  payment_status text,
  amount_paid integer,
  created_at timestamptz DEFAULT now()
);

-- Workshop Resources Table
CREATE TABLE workshop_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('pdf', 'video', 'slide', 'worksheet')),
  filename text NOT NULL,
  file_path text NOT NULL,
  size_bytes integer,
  category text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- User Access Table
CREATE TABLE user_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  access_level text NOT NULL DEFAULT 'workshop_participant',
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true
);
        `);
        return false;
      } else {
        console.error('❌ Supabase connection failed:', error.message);
        return false;
      }
    }

    console.log('✅ Supabase connection successful!');
    console.log('✅ Database tables are set up correctly.');
    
    // Test inserting a sample record
    const { data: insertData, error: insertError } = await supabase
      .from('workshop_waitlist')
      .insert([
        {
          full_name: 'Test User',
          email: 'test@example.com',
          source: 'setup-test'
        }
      ])
      .select();

    if (insertError) {
      console.log('⚠️  Insert test failed:', insertError.message);
    } else {
      console.log('✅ Database write permissions working!');
      
      // Clean up test data
      await supabase
        .from('workshop_waitlist')
        .delete()
        .eq('email', 'test@example.com');
    }

    return true;

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...\n');

  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE',
    'SENDGRID_API_KEY',
    'ADMIN_EMAIL',
    'FROM_EMAIL'
  ];

  const missingVars = [];
  const placeholderVars = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else if (value.includes('your_') || value.includes('placeholder')) {
      placeholderVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\nPlease add these to your .env.local file.');
  }

  if (placeholderVars.length > 0) {
    console.log('⚠️  Environment variables with placeholder values:');
    placeholderVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\nPlease replace these with actual values.');
  }

  if (missingVars.length === 0 && placeholderVars.length === 0) {
    console.log('✅ All environment variables are configured!');
    return true;
  }

  return false;
}

async function main() {
  console.log('🚀 Strata Noble - Supabase Setup Verification\n');
  console.log('This script will verify your Supabase configuration.\n');

  const envOk = await checkEnvironmentVariables();
  console.log('');

  if (!envOk) {
    console.log('Please fix the environment variables and run this script again.');
    process.exit(1);
  }

  const supabaseOk = await testSupabaseConnection();
  console.log('');

  if (supabaseOk) {
    console.log('🎉 Setup verification complete!');
    console.log('Your Supabase project is ready for development.');
    console.log('\nNext steps:');
    console.log('1. Set up SendGrid for email functionality');
    console.log('2. Configure Stripe webhooks');
    console.log('3. Test the application locally');
    console.log('4. Deploy to production');
  } else {
    console.log('❌ Setup verification failed.');
    console.log('Please fix the issues above and run this script again.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSupabaseConnection, checkEnvironmentVariables }; 
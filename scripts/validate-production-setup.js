#!/usr/bin/env node
/**
 * Production Setup Validation Script
 * Tests database connectivity and validates CRM system setup
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Load environment variables
import('dotenv/config');

async function validateProductionSetup() {
  console.log('🔍 Production Setup Validation');
  console.log('==============================\n');

  let validationResults = {
    envVars: false,
    dbConnection: false,
    tablesExist: false,
    functionsExist: false,
    apiEndpoints: false
  };

  // Step 1: Check Environment Variables
  console.log('1️⃣ Checking Environment Variables...');
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  let envValid = true;
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value || value.includes('your_')) {
      console.log(`   ❌ ${envVar}: Not configured`);
      envValid = false;
    } else {
      console.log(`   ✅ ${envVar}: Configured`);
    }
  }
  validationResults.envVars = envValid;

  if (!envValid) {
    console.log('\n❌ Environment variables not properly configured.');
    console.log('Please update .env file with your Supabase credentials.\n');
    return validationResults;
  }

  // Step 2: Test Database Connection
  console.log('\n2️⃣ Testing Database Connection...');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);

    if (error) throw error;
    
    console.log('   ✅ Database connection successful');
    validationResults.dbConnection = true;
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}`);
    return validationResults;
  }

  // Step 3: Check Required Tables
  console.log('\n3️⃣ Checking CRM Tables...');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check leads table
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('id')
      .limit(1);

    if (leadsError && leadsError.code === '42P01') {
      console.log('   ❌ leads table does not exist');
    } else {
      console.log('   ✅ leads table exists');
    }

    // Check email_sequences table
    const { data: emailData, error: emailError } = await supabase
      .from('email_sequences')
      .select('id')
      .limit(1);

    if (emailError && emailError.code === '42P01') {
      console.log('   ❌ email_sequences table does not exist');
    } else {
      console.log('   ✅ email_sequences table exists');
      validationResults.tablesExist = true;
    }

  } catch (error) {
    console.log(`   ❌ Table check failed: ${error.message}`);
  }

  // Step 4: Check Database Functions
  console.log('\n4️⃣ Checking Database Functions...');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase.rpc('schedule_email_sequences', {
      p_lead_id: '00000000-0000-0000-0000-000000000000',
      p_recipient_email: 'test@example.com',
      p_lead_name: 'Test User',
      p_business_stage: 'test',
      p_main_challenge: 'test'
    });

    if (error && error.code === '42883') {
      console.log('   ❌ schedule_email_sequences function does not exist');
    } else {
      console.log('   ✅ Database functions exist');
      validationResults.functionsExist = true;
    }
  } catch (error) {
    console.log(`   ❌ Function check failed: ${error.message}`);
  }

  // Step 5: Test API Endpoints
  console.log('\n5️⃣ Testing API Endpoints...');
  try {
    const response = await fetch('http://localhost:3000/api/crm/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        business_stage: 'early_stage',
        main_challenge: 'Testing CRM integration',
        interested_tier: 'growth'
      })
    });

    const result = await response.json();
    
    if (response.ok && !result.message?.includes('development mode')) {
      console.log('   ✅ API endpoints working with database');
      validationResults.apiEndpoints = true;
    } else {
      console.log('   🔄 API endpoints in development mode (needs database connection)');
    }
  } catch (error) {
    console.log(`   ❌ API endpoint test failed: ${error.message}`);
  }

  // Summary
  console.log('\n🎯 VALIDATION SUMMARY');
  console.log('====================');
  
  const allValid = Object.values(validationResults).every(v => v);
  
  if (allValid) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL!');
    console.log('✅ Environment variables configured');
    console.log('✅ Database connection established');  
    console.log('✅ CRM tables exist');
    console.log('✅ Database functions deployed');
    console.log('✅ API endpoints operational');
    console.log('\n🚀 Production CRM system ready for use!');
  } else {
    console.log('⚠️  Some components need attention:');
    if (!validationResults.envVars) console.log('❌ Configure environment variables');
    if (!validationResults.dbConnection) console.log('❌ Fix database connection');
    if (!validationResults.tablesExist) console.log('❌ Apply database migrations');
    if (!validationResults.functionsExist) console.log('❌ Deploy database functions');
    if (!validationResults.apiEndpoints) console.log('❌ Connect API to database');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Apply database migrations from migration-output.txt');
    console.log('2. Update .env with Supabase credentials');
    console.log('3. Restart development server');
    console.log('4. Re-run this validation script');
  }

  return validationResults;
}

// Run validation if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateProductionSetup().catch(console.error);
}

export default validateProductionSetup;
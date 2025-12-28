/**
 * DSLV Environment Verification Script
 * 
 * Verifies all required environment variables and API connections
 * for the DSLV cold calling system.
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvVar(name, required = true) {
  const value = process.env[name];
  if (!value) {
    if (required) {
      log(`❌ ${name}: MISSING (REQUIRED)`, 'red');
      return false;
    } else {
      log(`⚠️  ${name}: MISSING (optional)`, 'yellow');
      return true;
    }
  } else {
    // Mask sensitive values
    const masked = name.includes('KEY') || name.includes('TOKEN') || name.includes('SECRET')
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : value;
    log(`✅ ${name}: ${masked}`, 'green');
    return true;
  }
}

async function testOpenAI() {
  log('\n🔍 Testing OpenAI API Connection...', 'blue');
  
  if (!process.env.OPENAI_API_KEY) {
    log('❌ OPENAI_API_KEY not set, skipping test', 'red');
    return false;
  }

  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Simple test - list models
    const response = await openai.models.list();
    log('✅ OpenAI API: Connection successful', 'green');
    return true;
  } catch (error) {
    log(`❌ OpenAI API: Connection failed - ${error.message}`, 'red');
    return false;
  }
}

async function testTwilio() {
  log('\n🔍 Testing Twilio API Connection...', 'blue');
  
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    log('❌ Twilio credentials not set, skipping test', 'red');
    return false;
  }

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    // Test - fetch account info
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    log(`✅ Twilio API: Connection successful (Account: ${account.friendlyName})`, 'green');
    return true;
  } catch (error) {
    log(`❌ Twilio API: Connection failed - ${error.message}`, 'red');
    return false;
  }
}

async function testSupabase() {
  log('\n🔍 Testing Supabase Connection...', 'blue');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('❌ Supabase credentials not set, skipping test', 'red');
    return false;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test - query a simple table
    const { data, error } = await supabase
      .from('campaigns')
      .select('count')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Table doesn't exist - this is expected if migration hasn't run
      log('⚠️  Supabase: Connection successful, but campaigns table not found', 'yellow');
      log('   → Run migration 0024_dslv_cold_calling_tables.sql', 'yellow');
      return true;
    } else if (error) {
      log(`❌ Supabase API: Connection failed - ${error.message}`, 'red');
      return false;
    } else {
      log('✅ Supabase API: Connection successful', 'green');
      return true;
    }
  } catch (error) {
    log(`❌ Supabase API: Connection failed - ${error.message}`, 'red');
    return false;
  }
}

async function checkDSLVTables() {
  log('\n🔍 Checking DSLV Database Tables...', 'blue');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('❌ Supabase credentials not set, skipping table check', 'red');
    return false;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const tables = ['campaigns', 'call_schedules', 'call_evaluations'];
    let allExist = true;
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === '42P01') {
        log(`❌ Table '${table}': NOT FOUND`, 'red');
        allExist = false;
      } else if (error) {
        log(`⚠️  Table '${table}': Error checking - ${error.message}`, 'yellow');
      } else {
        log(`✅ Table '${table}': EXISTS`, 'green');
      }
    }
    
    if (!allExist) {
      log('\n⚠️  Some tables are missing. Run migration: 0024_dslv_cold_calling_tables.sql', 'yellow');
    }
    
    return allExist;
  } catch (error) {
    log(`❌ Error checking tables: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n═══════════════════════════════════════════════════════', 'blue');
  log('  DSLV Environment Verification', 'blue');
  log('═══════════════════════════════════════════════════════\n', 'blue');
  
  // Check environment variables
  log('📋 Checking Environment Variables...', 'blue');
  const envVars = [
    'OPENAI_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER_PRIMARY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];
  
  let envOk = true;
  for (const varName of envVars) {
    const isRequired = varName !== 'NEXT_PUBLIC_APP_URL';
    if (!checkEnvVar(varName, isRequired)) {
      envOk = false;
    }
  }
  
  // Test API connections
  const openaiOk = await testOpenAI();
  const twilioOk = await testTwilio();
  const supabaseOk = await testSupabase();
  
  // Check database tables
  const tablesOk = await checkDSLVTables();
  
  // Summary
  log('\n═══════════════════════════════════════════════════════', 'blue');
  log('  Verification Summary', 'blue');
  log('═══════════════════════════════════════════════════════\n', 'blue');
  
  log(`Environment Variables: ${envOk ? '✅' : '❌'}`, envOk ? 'green' : 'red');
  log(`OpenAI API: ${openaiOk ? '✅' : '❌'}`, openaiOk ? 'green' : 'red');
  log(`Twilio API: ${twilioOk ? '✅' : '❌'}`, twilioOk ? 'green' : 'red');
  log(`Supabase API: ${supabaseOk ? '✅' : '❌'}`, supabaseOk ? 'green' : 'red');
  log(`DSLV Tables: ${tablesOk ? '✅' : '❌'}`, tablesOk ? 'green' : 'red');
  
  const allOk = envOk && openaiOk && twilioOk && supabaseOk && tablesOk;
  
  log('\n' + '═'.repeat(55), 'blue');
  if (allOk) {
    log('✅ All checks passed! DSLV system is ready.', 'green');
  } else {
    log('⚠️  Some checks failed. Please fix issues above.', 'yellow');
  }
  log('═'.repeat(55) + '\n', 'blue');
  
  process.exit(allOk ? 0 : 1);
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});


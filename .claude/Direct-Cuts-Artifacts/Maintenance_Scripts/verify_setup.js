/**
 * Verification Script for Direct Cuts Onboarding Setup
 *
 * This script verifies:
 * 1. Database tables exist
 * 2. Seed data is properly loaded
 * 3. Edge functions can connect to OpenAI
 *
 * Usage: VITE_SUPABASE_URL=your_url VITE_SUPABASE_ANON_KEY=your_key node verify_setup.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env.local manually
let SUPABASE_URL = process.env.VITE_SUPABASE_URL;
let SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Try reading from .env.local if not set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  try {
    const envContent = readFileSync('.env.local', 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
        SUPABASE_URL = trimmed.replace('VITE_SUPABASE_URL=', '').trim();
      } else if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
        SUPABASE_ANON_KEY = trimmed.replace('VITE_SUPABASE_ANON_KEY=', '').trim();
      }
    }
  } catch (err) {
    console.error('❌ Could not read .env.local:', err.message);
  }
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyDatabaseSetup() {
  console.log('\n=== Database Setup Verification ===\n');

  // Check tables exist
  const tablesToCheck = [
    'barber_onboarding_progress',
    'barber_specialties',
    'barber_portfolio_images',
    'barber_verification_status',
    'service_templates',
    'market_pricing_data'
  ];

  console.log('Checking tables...');
  const tableResults = {};

  for (const table of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Table '${table}': ${error.message}`);
        tableResults[table] = false;
      } else {
        console.log(`✅ Table '${table}': exists (${count} rows)`);
        tableResults[table] = { exists: true, count };
      }
    } catch (err) {
      console.error(`❌ Table '${table}': ${err.message}`);
      tableResults[table] = false;
    }
  }

  // Check seed data counts
  console.log('\nChecking seed data...');

  const { count: serviceTemplateCount, error: serviceError } = await supabase
    .from('service_templates')
    .select('*', { count: 'exact', head: true });

  if (serviceError) {
    console.error(`❌ Service templates: ${serviceError.message}`);
  } else {
    const expected = 19;
    if (serviceTemplateCount === expected) {
      console.log(`✅ Service templates: ${serviceTemplateCount}/${expected}`);
    } else {
      console.log(`⚠️  Service templates: ${serviceTemplateCount}/${expected} (expected ${expected})`);
    }
  }

  const { count: marketPricingCount, error: pricingError } = await supabase
    .from('market_pricing_data')
    .select('*', { count: 'exact', head: true });

  if (pricingError) {
    console.error(`❌ Market pricing data: ${pricingError.message}`);
  } else {
    const expected = 16;
    if (marketPricingCount === expected) {
      console.log(`✅ Market pricing data: ${marketPricingCount}/${expected}`);
    } else {
      console.log(`⚠️  Market pricing data: ${marketPricingCount}/${expected} (expected ${expected})`);
    }
  }

  // Summary
  const allTablesExist = Object.values(tableResults).every(r => r && r.exists);
  const seedDataCorrect = serviceTemplateCount === 19 && marketPricingCount === 16;

  console.log('\n=== Summary ===');
  console.log(`Tables: ${allTablesExist ? '✅ All 6 tables exist' : '❌ Some tables missing'}`);
  console.log(`Seed Data: ${seedDataCorrect ? '✅ All seed data loaded' : '⚠️  Seed data counts differ'}`);

  return {
    allTablesExist,
    seedDataCorrect,
    tableResults,
    serviceTemplateCount,
    marketPricingCount
  };
}

async function testEdgeFunctions() {
  console.log('\n=== Edge Function Testing ===\n');

  const functionsToTest = [
    {
      name: 'enhance-bio',
      payload: {
        experienceLevel: 'rising',
        specialties: ['Fades', 'Line-ups'],
        tone: 'professional',
        length: 'short'
      }
    }
  ];

  for (const func of functionsToTest) {
    try {
      console.log(`Testing ${func.name}...`);
      const { data, error } = await supabase.functions.invoke(func.name, {
        body: func.payload
      });

      if (error) {
        // Check for specific error messages in data
        if (data && data.error) {
          if (data.error.includes('Missing OpenAI API key')) {
            console.log(`⚠️  ${func.name}: OpenAI API key NOT configured in Supabase`);
            return { openaiKeyMissing: true };
          } else {
            console.error(`❌ ${func.name}: ${data.error}`);
          }
        } else if (error.message && error.message.includes('Missing OpenAI API key')) {
          console.log(`⚠️  ${func.name}: OpenAI API key NOT configured in Supabase`);
          return { openaiKeyMissing: true };
        } else {
          console.error(`❌ ${func.name}: ${error.message}`);
        }
      } else if (data && data.bio) {
        console.log(`✅ ${func.name}: Working correctly - OpenAI API key IS configured`);
        return { openaiKeyMissing: false };
      } else {
        console.log(`⚠️  ${func.name}: Unexpected response format`);
        console.log('Response:', JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error(`❌ ${func.name}: ${err.message}`);
    }
  }

  return { openaiKeyMissing: null };
}

async function main() {
  console.log('Direct Cuts - Onboarding Setup Verification');
  console.log('==========================================');

  const dbResults = await verifyDatabaseSetup();
  const edgeFunctionResults = await testEdgeFunctions();

  console.log('\n==========================================');
  console.log('Verification complete!\n');

  // Final summary
  console.log('=== Final Status ===\n');
  console.log(`1. Database Tables: ${dbResults.allTablesExist ? '✅ All 6 tables exist' : '❌ Missing tables'}`);
  console.log(`2. Seed Data: ${dbResults.seedDataCorrect ? '✅ Correct (19 service templates, 16 pricing data)' : '⚠️  Counts differ'}`);

  if (edgeFunctionResults.openaiKeyMissing === true) {
    console.log('3. OpenAI API Key: ❌ NOT configured in Supabase');
    console.log('\nAction Required:');
    console.log('Run: supabase secrets set OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE');
  } else if (edgeFunctionResults.openaiKeyMissing === false) {
    console.log('3. OpenAI API Key: ✅ Configured and working');
  } else {
    console.log('3. OpenAI API Key: ⚠️  Unable to determine status');
  }

  console.log('\n');
}

main().catch(console.error);

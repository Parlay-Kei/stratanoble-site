#!/usr/bin/env node
/**
 * Verify Critical Netlify Environment Variables
 * Checks that all required variables for email authentication are present
 */

import { execSync } from 'child_process';

console.log('🔍 Verifying Critical Netlify Environment Variables\n');

const REQUIRED_VARIABLES = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'SES_FROM_EMAIL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID',
  'NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID',
  'VAULT_ENCRYPTION_KEY',
  'ADMIN_EMAIL'
];

try {
  // Get all environment variables from Netlify
  const output = execSync('netlify env:list --json', { encoding: 'utf-8' });
  const envVars = JSON.parse(output);

  const present = [];
  const missing = [];

  for (const varName of REQUIRED_VARIABLES) {
    if (envVars[varName] && envVars[varName] !== '') {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  }

  console.log(`✅ PRESENT (${present.length}/${REQUIRED_VARIABLES.length}):\n`);
  present.forEach(v => console.log(`   ✓ ${v}`));

  if (missing.length > 0) {
    console.log(`\n❌ MISSING (${missing.length}):\n`);
    missing.forEach(v => console.log(`   ✗ ${v}`));
    console.log('\n⚠️  WARNING: Some critical variables are missing!\n');
    process.exit(1);
  } else {
    console.log('\n🎉 All required environment variables are present!\n');

    // Show specific values for verification
    console.log('📋 Key Values:\n');
    console.log(`   NEXTAUTH_URL: ${envVars['NEXTAUTH_URL']}`);
    console.log(`   AWS_REGION: ${envVars['AWS_REGION']}`);
    console.log(`   SES_FROM_EMAIL: ${envVars['SES_FROM_EMAIL']}`);
    console.log(`   ADMIN_EMAIL: ${envVars['ADMIN_EMAIL']}`);
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${envVars['NEXT_PUBLIC_SUPABASE_URL']}`);

    // Verify secrets are not empty (without showing values)
    const secrets = ['NEXTAUTH_SECRET', 'AWS_SECRET_ACCESS_KEY', 'VAULT_ENCRYPTION_KEY'];
    console.log('\n🔐 Secret Verification:\n');
    secrets.forEach(s => {
      const length = envVars[s]?.length || 0;
      console.log(`   ${s}: ${length > 0 ? `✓ Set (${length} chars)` : '✗ Empty'}`);
    });

    process.exit(0);
  }
} catch (error) {
  console.error('❌ Error verifying environment variables:');
  console.error(error.message);
  process.exit(1);
}

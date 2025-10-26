#!/usr/bin/env node
/**
 * Store Twilio Auth Token in Vault and Add to Netlify
 * Date: October 25, 2025
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const VAULT_ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TWILIO_AUTH_TOKEN = 'cec7f40c85a895b7876093e844e9f395';

/**
 * Encrypt a value using AES-256-GCM
 */
function encryptValue(value) {
  const key = Buffer.from(VAULT_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

async function storeInVault() {
  console.log('🔐 Storing Twilio Auth Token in Vault...\n');

  if (!VAULT_ENCRYPTION_KEY) {
    console.error('❌ VAULT_ENCRYPTION_KEY not found in environment');
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Supabase credentials not found in environment');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Encrypt the token
  const encrypted_value = encryptValue(TWILIO_AUTH_TOKEN);

  // Calculate next rotation date (90 days from now)
  const next_rotation = new Date();
  next_rotation.setDate(next_rotation.getDate() + 90);

  // Insert into vault
  const { data, error } = await supabase
    .from('vault_credentials')
    .insert({
      service_name: 'Twilio',
      environment: 'production',
      credential_type: 'api_key',
      credential_name: 'Auth Token',
      encrypted_value: encrypted_value,
      encryption_key_id: 'vault_key_v1',
      description: 'Twilio authentication token for voice calling and SMS',
      rotation_frequency_days: 90,
      next_rotation_due: next_rotation.toISOString(),
      is_active: true,
      owner_email: 'admin@stratanoble.com'
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to store in vault:', error.message);
    process.exit(1);
  }

  console.log('✅ Successfully stored in vault');
  console.log('   Credential ID:', data.id);
  console.log('   Next rotation:', next_rotation.toLocaleDateString());
  console.log('   Encrypted with AES-256-GCM\n');

  return data;
}

async function addToNetlify() {
  console.log('📡 Adding to Netlify environment variables...\n');

  const { execSync } = await import('child_process');

  try {
    // Set the environment variable
    execSync(
      `netlify env:set TWILIO_AUTH_TOKEN "${TWILIO_AUTH_TOKEN}" --context production`,
      { stdio: 'inherit' }
    );
    console.log('✅ Successfully added to Netlify production\n');
  } catch (error) {
    console.error('❌ Failed to add to Netlify:', error.message);
    console.log('\n⚠️  You may need to run manually:');
    console.log(`   netlify env:set TWILIO_AUTH_TOKEN "${TWILIO_AUTH_TOKEN}" --context production\n`);
  }
}

async function triggerDeploy() {
  console.log('🚀 Triggering new deployment...\n');

  const { execSync } = await import('child_process');

  try {
    execSync('netlify deploy --prod --trigger', { stdio: 'inherit' });
    console.log('✅ Deployment triggered successfully\n');
  } catch (error) {
    console.error('❌ Failed to trigger deployment:', error.message);
    console.log('\n⚠️  You may need to run manually:');
    console.log('   netlify deploy --prod --trigger\n');
  }
}

async function main() {
  try {
    // Step 1: Store in vault
    await storeInVault();

    // Step 2: Add to Netlify
    await addToNetlify();

    // Step 3: Trigger deployment
    await triggerDeploy();

    console.log('🎉 Complete! Twilio Auth Token configured:\n');
    console.log('   ✅ Stored in vault (encrypted)');
    console.log('   ✅ Added to Netlify production');
    console.log('   ✅ New deployment triggered');
    console.log('\n📊 View deployment: https://app.netlify.com/projects/stratanoble/deploys\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();


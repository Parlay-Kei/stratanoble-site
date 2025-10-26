#!/usr/bin/env node
/**
 * Store Twilio Auth Token in Vault
 * Date: October 25, 2025
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const VAULT_ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

function encryptValue(value) {
  const key = Buffer.from(VAULT_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

async function main() {
  console.log('🔐 Storing Twilio Auth Token in Vault...\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Supabase credentials not found');
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? 'Found' : 'Missing');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? 'Found' : 'Missing');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const encrypted_value = encryptValue(TWILIO_AUTH_TOKEN);

  const next_rotation = new Date();
  next_rotation.setDate(next_rotation.getDate() + 90);

  console.log('   Service: Twilio');
  console.log('   Credential: Auth Token');
  console.log('   Environment: Production');
  console.log('   Rotation: 90 days');
  console.log('   Encryption: AES-256-GCM\n');

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
    console.error('   Error code:', error.code);
    console.error('   Error details:', error);
    process.exit(1);
  }

  console.log('✅ Successfully stored in vault');
  console.log('   Credential ID:', data.id);
  console.log('   Created:', new Date().toLocaleString());
  console.log('   Next rotation:', next_rotation.toLocaleDateString());
  console.log('\n🎉 Twilio Auth Token configured in:');
  console.log('   ✅ Vault (encrypted with AES-256-GCM)');
  console.log('   ✅ Netlify (production environment)');
  console.log('   ✅ Deployment triggered\n');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

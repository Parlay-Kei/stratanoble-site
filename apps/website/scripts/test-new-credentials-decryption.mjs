#!/usr/bin/env node
/**
 * Test Decryption of Newly Imported Credentials
 *
 * Verifies that the newly imported credentials (OpenAI, n8n, Stripe Price IDs)
 * can be decrypted successfully and match expected values.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const VAULT_ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function decryptValue(encryptedValue) {
  const key = Buffer.from(VAULT_ENCRYPTION_KEY, 'hex');
  const [ivHex, encryptedHex, authTagHex] = encryptedValue.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

async function testDecryption() {
  console.log('🔐 Testing decryption of newly imported credentials...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const credentialsToTest = [
    { service: 'OpenAI', name: 'API Key', expectedStart: 'sk-proj-' },
    { service: 'n8n', name: 'API Key', expectedStart: 'eyJ' },
    { service: 'n8n', name: 'Webhook Secret', expectedLength: 48 },
    { service: 'n8n', name: 'License Activation Key', expectedStart: 'fd00d9f7' },
    { service: 'Stripe', name: 'Builder Price ID', expectedStart: 'price_' },
    { service: 'Stripe', name: 'Prosperity Price ID', expectedStart: 'price_' }
  ];

  let passCount = 0;
  let failCount = 0;

  for (const test of credentialsToTest) {
    try {
      const { data, error } = await supabase
        .from('vault_credentials')
        .select('encrypted_value, encryption_key_id')
        .eq('service_name', test.service)
        .eq('credential_name', test.name)
        .eq('environment', 'production')
        .single();

      if (error) {
        console.log(`❌ ${test.service} - ${test.name}: Not found in vault`);
        failCount++;
        continue;
      }

      const decrypted = decryptValue(data.encrypted_value);

      // Verify expectations
      let passed = true;
      let reason = '';

      if (test.expectedStart && !decrypted.startsWith(test.expectedStart)) {
        passed = false;
        reason = `Expected to start with "${test.expectedStart}"`;
      }

      if (test.expectedLength && decrypted.length !== test.expectedLength) {
        passed = false;
        reason = `Expected length ${test.expectedLength}, got ${decrypted.length}`;
      }

      if (passed) {
        console.log(`✅ ${test.service} - ${test.name}`);
        console.log(`   Decrypted: ${decrypted.substring(0, 20)}... (${decrypted.length} chars)`);
        passCount++;
      } else {
        console.log(`❌ ${test.service} - ${test.name}: ${reason}`);
        console.log(`   Got: ${decrypted.substring(0, 20)}...`);
        failCount++;
      }
    } catch (err) {
      console.log(`❌ ${test.service} - ${test.name}: ${err.message}`);
      failCount++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passCount}/${credentialsToTest.length}`);
  console.log(`   ❌ Failed: ${failCount}/${credentialsToTest.length}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (passCount === credentialsToTest.length) {
    console.log('🎉 All credentials decrypted successfully!');
    console.log('✨ Vault system is fully operational with new credentials.');
  } else {
    console.log('⚠️  Some credentials failed decryption. Check the errors above.');
    process.exit(1);
  }
}

testDecryption().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});

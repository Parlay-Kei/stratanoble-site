#!/usr/bin/env node
/**
 * Import All Missing Credentials to Vault
 *
 * This script imports credentials that are currently stored in environment variables
 * but not yet encrypted in the vault system.
 *
 * Usage: node scripts/import-all-missing-credentials.mjs
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Load .env.local from the correct path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const VAULT_ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Credentials to import (from .env.local and infra/n8n/.env.n8n)
const CREDENTIALS_TO_IMPORT = [
  // OpenAI
  {
    service_name: 'OpenAI',
    environment: 'production',
    credential_type: 'api_key',
    credential_name: 'API Key',
    credential_value: process.env.OPENAI_API_KEY,
    description: 'OpenAI API key for AI idea validation and content generation',
    rotation_days: 90,
    owner_email: 'admin@stratanoble.com'
  },

  // n8n Automation Platform
  {
    service_name: 'n8n',
    environment: 'production',
    credential_type: 'api_key',
    credential_name: 'API Key',
    credential_value: process.env.N8N_API_KEY,
    description: 'n8n API key for MCP server integration',
    rotation_days: 180,
    owner_email: 'admin@stratanoble.com'
  },
  {
    service_name: 'n8n',
    environment: 'production',
    credential_type: 'webhook_secret',
    credential_name: 'Webhook Secret',
    credential_value: process.env.N8N_WEBHOOK_SECRET,
    description: 'n8n webhook secret for secure webhook endpoints',
    rotation_days: 180,
    owner_email: 'admin@stratanoble.com'
  },
  {
    service_name: 'n8n',
    environment: 'production',
    credential_type: 'other', // license_key not in schema, using 'other'
    credential_name: 'License Activation Key',
    credential_value: process.env.N8N_LICENSE_KEY,
    description: 'n8n license activation key',
    rotation_days: 365,
    owner_email: 'admin@stratanoble.com'
  },

  // Stripe Price IDs (configuration values, not secrets but should be centrally managed)
  {
    service_name: 'Stripe',
    environment: 'production',
    credential_type: 'other', // config_value not in schema, using 'other'
    credential_name: 'Builder Price ID',
    credential_value: process.env.STRIPE_BUILDER_PRICE_ID,
    description: 'Stripe price ID for Builder tier subscription',
    rotation_days: 365,
    owner_email: 'admin@stratanoble.com'
  },
  {
    service_name: 'Stripe',
    environment: 'production',
    credential_type: 'other', // config_value not in schema, using 'other'
    credential_name: 'Prosperity Price ID',
    credential_value: process.env.STRIPE_PROSPERITY_PRICE_ID,
    description: 'Stripe price ID for Prosperity tier subscription',
    rotation_days: 365,
    owner_email: 'admin@stratanoble.com'
  },

  // SendGrid (placeholder - needs real value)
  {
    service_name: 'SendGrid',
    environment: 'production',
    credential_type: 'api_key',
    credential_name: 'API Key',
    credential_value: 'PLACEHOLDER_SENDGRID_KEY',
    description: 'SendGrid API key for transactional emails (NEEDS REAL VALUE)',
    rotation_days: 90,
    owner_email: 'admin@stratanoble.com',
    is_active: false
  }
];

// Encryption helper
function encryptValue(value) {
  if (!VAULT_ENCRYPTION_KEY) {
    throw new Error('VAULT_ENCRYPTION_KEY not configured');
  }

  const key = Buffer.from(VAULT_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

// Import credentials
async function importCredentials() {
  console.log('ðŸ” Starting credential import to vault...\n');

  if (!VAULT_ENCRYPTION_KEY) {
    console.error('âŒ VAULT_ENCRYPTION_KEY not found in environment');
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('âŒ Supabase credentials not found in environment');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const cred of CREDENTIALS_TO_IMPORT) {
    try {
      // Check if credential already exists
      const { data: existing } = await supabase
        .from('vault_credentials')
        .select('id, service_name, credential_name')
        .eq('service_name', cred.service_name)
        .eq('credential_name', cred.credential_name)
        .eq('environment', cred.environment)
        .single();

      if (existing) {
        console.log(`â­ï¸  Skipping ${cred.service_name} - ${cred.credential_name} (already exists)`);
        skipCount++;
        continue;
      }

      // Encrypt the credential value
      const encrypted_value = encryptValue(cred.credential_value);

      // Calculate next rotation date
      const next_rotation = new Date();
      next_rotation.setDate(next_rotation.getDate() + cred.rotation_days);

      // Insert into vault
      const { data, error } = await supabase
        .from('vault_credentials')
        .insert({
          service_name: cred.service_name,
          environment: cred.environment,
          credential_type: cred.credential_type,
          credential_name: cred.credential_name,
          encrypted_value: encrypted_value,
          encryption_key_id: 'vault_key_v1',
          description: cred.description,
          rotation_frequency_days: cred.rotation_days,
          next_rotation_due: next_rotation.toISOString(),
          is_active: cred.is_active !== false,
          owner_email: cred.owner_email
        })
        .select()
        .single();

      if (error) {
        console.error(`âŒ Failed to import ${cred.service_name} - ${cred.credential_name}:`, error.message);
        errorCount++;
      } else {
        console.log(`âœ… Imported ${cred.service_name} - ${cred.credential_name}`);
        successCount++;
      }
    } catch (err) {
      console.error(`âŒ Error importing ${cred.service_name} - ${cred.credential_name}:`, err.message);
      errorCount++;
    }
  }

  console.log('\nâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
  console.log('ðŸ“Š Import Summary:');
  console.log(`   âœ… Successfully imported: ${successCount}`);
  console.log(`   â­ï¸  Skipped (already exist): ${skipCount}`);
  console.log(`   âŒ Failed: ${errorCount}`);
  console.log(`   ðŸ“ Total processed: ${CREDENTIALS_TO_IMPORT.length}`);
  console.log('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');

  if (successCount > 0) {
    console.log('ðŸŽ‰ New credentials successfully encrypted and stored in vault!');
    console.log('ðŸ”„ Next steps:');
    console.log('   1. Run: node scripts/check-vault-credentials.mjs');
    console.log('   2. Visit: http://localhost:3000/admin/vault');
    console.log('   3. Update app code to fetch credentials from vault API\n');
  }
}

// Run import
importCredentials().catch((err) => {
  console.error('ðŸ’¥ Fatal error:', err);
  process.exit(1);
});

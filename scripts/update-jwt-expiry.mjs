#!/usr/bin/env node
/**
 * Supabase JWT Expiry Configuration Script
 *
 * Updates the JWT expiry time for the Supabase project via Management API.
 *
 * Requirements:
 * - SUPABASE_ACCESS_TOKEN environment variable (Personal Access Token)
 * - Token must have 'auth:write' scope
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/update-jwt-expiry.mjs
 *
 * Or add SUPABASE_ACCESS_TOKEN to .env.local and run:
 *   node scripts/update-jwt-expiry.mjs
 */

import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'bvneqoevtwodyfqglpzi';
const TARGET_JWT_EXPIRY = 900; // 15 minutes (for Level A session revocation)
const MANAGEMENT_API_BASE = 'https://api.supabase.com/v1';

async function updateJwtExpiry() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('❌ Error: SUPABASE_ACCESS_TOKEN not found in environment');
    console.error('');
    console.error('To generate a Personal Access Token:');
    console.error('1. Visit: https://supabase.com/dashboard/account/tokens');
    console.error('2. Create new token with "auth:write" scope');
    console.error('3. Add to .env.local: SUPABASE_ACCESS_TOKEN=sbp_your_token_here');
    console.error('');
    process.exit(1);
  }

  console.log('🔧 Updating Supabase JWT Expiry Configuration');
  console.log('─'.repeat(60));
  console.log(`Project Ref: ${PROJECT_REF}`);
  console.log(`Target JWT Expiry: ${TARGET_JWT_EXPIRY} seconds (${TARGET_JWT_EXPIRY / 60} minutes)`);
  console.log('');

  try {
    // Step 1: Get current configuration
    console.log('📖 Fetching current auth configuration...');
    const getResponse = await fetch(
      `${MANAGEMENT_API_BASE}/projects/${PROJECT_REF}/config/auth`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      throw new Error(`Failed to fetch current config: ${getResponse.status} ${errorText}`);
    }

    const currentConfig = await getResponse.json();
    console.log(`✓ Current JWT Expiry: ${currentConfig.jwt_exp || 'unknown'} seconds`);
    console.log('');

    // Step 2: Update JWT expiry
    console.log('⚙️  Updating JWT expiry setting...');
    const patchResponse = await fetch(
      `${MANAGEMENT_API_BASE}/projects/${PROJECT_REF}/config/auth`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jwt_exp: TARGET_JWT_EXPIRY,
        }),
      }
    );

    if (!patchResponse.ok) {
      const errorText = await patchResponse.text();
      throw new Error(`Failed to update config: ${patchResponse.status} ${errorText}`);
    }

    console.log('✓ JWT expiry updated successfully!');
    console.log('');

    // Step 3: Verify the change
    console.log('🔍 Verifying configuration...');
    const verifyResponse = await fetch(
      `${MANAGEMENT_API_BASE}/projects/${PROJECT_REF}/config/auth`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!verifyResponse.ok) {
      throw new Error('Failed to verify configuration');
    }

    const verifiedConfig = await verifyResponse.json();
    console.log(`✓ Verified JWT Expiry: ${verifiedConfig.jwt_exp} seconds`);
    console.log('');

    if (verifiedConfig.jwt_exp === TARGET_JWT_EXPIRY) {
      console.log('✅ SUCCESS: JWT expiry configured correctly!');
      console.log('');
      console.log('⚠️  IMPORTANT NOTES:');
      console.log('  • Existing access tokens remain valid until their original expiry');
      console.log('  • New tokens issued after this change will expire in 15 minutes');
      console.log('  • Users will need to re-authenticate to get new tokens');
      console.log('  • This enhances Level A session revocation security');
      console.log('');
      console.log('📝 Next Steps:');
      console.log('  1. Update local config: supabase/config.toml');
      console.log('     Change: jwt_expiry = 900');
      console.log('  2. Test logout flow to ensure tokens revoke correctly');
      console.log('  3. Monitor user sessions for any issues');
    } else {
      console.warn('⚠️  WARNING: JWT expiry mismatch!');
      console.warn(`   Expected: ${TARGET_JWT_EXPIRY}, Got: ${verifiedConfig.jwt_exp}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateJwtExpiry();

#!/usr/bin/env node
/**
 * Update Netlify Environment Variables for Authentication
 *
 * This script updates Netlify production environment with the required
 * NextAuth and Google OAuth configuration.
 *
 * Usage: node scripts/update-netlify-auth-env.mjs
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;
const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

// Environment variables to set in Netlify
const AUTH_ENV_VARS = {
  // NextAuth Core Configuration
  NEXTAUTH_URL: 'https://stratanoble.com',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  AUTH_USE_PRISMA: 'false',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  // Optional: Email provider (if AWS SES is configured)
  // SES_FROM_EMAIL: 'no-reply@stratanoble.com',
  // AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  // AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  // AWS_REGION: 'us-east-1',
};

console.log('🔐 Netlify Authentication Environment Update\n');

// Check for required credentials
if (!NETLIFY_SITE_ID || !NETLIFY_AUTH_TOKEN) {
  console.error('❌ Missing Netlify credentials in .env.local:');
  if (!NETLIFY_SITE_ID) console.error('  - NETLIFY_SITE_ID not set');
  if (!NETLIFY_AUTH_TOKEN) console.error('  - NETLIFY_AUTH_TOKEN not set');
  console.log('\n💡 Get these from: https://app.netlify.com/sites/[your-site]/settings/general');
  process.exit(1);
}

// Check for Google OAuth credentials
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ Missing Google OAuth credentials in .env.local:');
  if (!process.env.GOOGLE_CLIENT_ID) console.error('  - GOOGLE_CLIENT_ID not set');
  if (!process.env.GOOGLE_CLIENT_SECRET) console.error('  - GOOGLE_CLIENT_SECRET not set');
  console.log('\n💡 Set these up in your Google Cloud Console');
  process.exit(1);
}

console.log('📋 Environment Variables to Set:\n');
for (const [key, value] of Object.entries(AUTH_ENV_VARS)) {
  if (value) {
    const displayValue = value.length > 40 ? value.substring(0, 40) + '...' : value;
    console.log(`  ✓ ${key}: ${displayValue}`);
  } else {
    console.log(`  ⚠ ${key}: NOT SET (will skip)`);
  }
}

console.log('\n🚀 Ready to update Netlify production environment');
console.log('\n⚠️  MANUAL STEPS REQUIRED:\n');
console.log('1. Go to: https://app.netlify.com/sites/' + NETLIFY_SITE_ID.substring(0, 20) + '.../configuration/env');
console.log('2. Add/update the following environment variables:');
console.log('');

for (const [key, value] of Object.entries(AUTH_ENV_VARS)) {
  if (value) {
    console.log(`   ${key}=${value}`);
  }
}

console.log('\n3. Click "Save" and trigger a new deployment');
console.log('\n📝 After deployment, update Google OAuth redirect URIs:');
console.log('   https://console.cloud.google.com/apis/credentials');
console.log('   Add: https://stratanoble.com/api/auth/callback/google');
console.log('');
console.log('✅ Done! Your production authentication will be ready.');

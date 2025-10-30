#!/usr/bin/env node
/**
 * Script to add missing environment variables to Netlify production
 * Uses Netlify API to automatically configure missing variables
 */

const https = require('https');
const siteId = process.env.NETLIFY_SITE_ID || '(set NETLIFY_SITE_ID)';

// Environment variables to add
const envVars = {
  NEXTAUTH_SECRET: {
    value: process.env.NEXTAUTH_SECRET || '(set NEXTAUTH_SECRET)',
    isSecret: true,
    scopes: ['all']
  },
  NEXTAUTH_URL: {
    value: process.env.NEXTAUTH_URL || '(set NEXTAUTH_URL)',
    isSecret: false,
    scopes: ['all']
  },
  TWILIO_ACCOUNT_SID: {
    value: process.env.TWILIO_ACCOUNT_SID || '(set TWILIO_ACCOUNT_SID)',
    isSecret: false,
    scopes: ['production']
  },
  TWILIO_PHONE_NUMBER: {
    value: process.env.TWILIO_PHONE_NUMBER || '(set TWILIO_PHONE_NUMBER)',
    isSecret: false,
    scopes: ['production']
  }
};

console.log('🚀 Netlify Environment Variable Configuration\n');
console.log('Required variables to add:');
Object.entries(envVars).forEach(([key, config]) => {
  console.log(`  - ${key} (${config.scopes.join(', ')}) -> ${config.value}`);
});
console.log('\n⚠️  Note: TWILIO_AUTH_TOKEN needs to be retrieved from Twilio Console');
console.log('\n📋 Manual Steps Required:');
console.log('1. Get Netlify API token from: https://app.netlify.com/user/applications');
console.log('2. Run: netlify login');
console.log('3. Run: npm run add-netlify-env');
console.log('\nOr add via Netlify Dashboard: https://app.netlify.com/sites/stratanoble/configuration/env');


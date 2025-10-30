#!/usr/bin/env node
/**
 * Retrieve Twilio Auth Token from Twilio Console
 * Uses Twilio Account SID to fetch credentials
 */

console.log('\n📞 Twilio Auth Token Retrieval\n');
const accountSid = process.env.TWILIO_ACCOUNT_SID || '(set TWILIO_ACCOUNT_SID in your environment)';
console.log(`Your Twilio Account SID: ${accountSid}`);
console.log('\n🔑 To get your Auth Token:\n');
console.log('1. Go to: https://console.twilio.com');
console.log('2. Click "Account" in the left sidebar');
console.log('3. Under "Account Info", find "Auth Token"');
console.log('4. Click "Show" to reveal it');
console.log('5. Copy the token\n');
console.log('Then add to .env.local:');
console.log('TWILIO_AUTH_TOKEN=your_token_here\n');

// Alternative: Use Twilio API Key approach
console.log('🔐 Alternative: Using API Key (from Voice AI session)');
console.log('The Voice AI session mentioned "API Key/Secret authentication working"');
console.log('If you have TWILIO_API_KEY and TWILIO_API_SECRET, those can be used instead!\n');

process.exit(0);

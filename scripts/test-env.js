// Test environment variables
const fs = require('fs');
const path = require('path');

console.log('Environment Variables Test:');
console.log('==========================');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  
  // Read and parse .env.local
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!key.startsWith('#')) {
        envVars[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
  
  console.log('STRIPE_SECRET_KEY:', envVars.STRIPE_SECRET_KEY ? 'SET (' + envVars.STRIPE_SECRET_KEY.substring(0, 10) + '...)' : 'NOT SET');
  console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SET (' + envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 10) + '...)' : 'NOT SET');
  console.log('STRIPE_WEBHOOK_SECRET:', envVars.STRIPE_WEBHOOK_SECRET ? 'SET' : 'NOT SET');
  console.log('STRIPE_PRICE_ID_LITE:', envVars.STRIPE_PRICE_ID_LITE || 'NOT SET');
  console.log('STRIPE_PRICE_ID_CORE:', envVars.STRIPE_PRICE_ID_CORE || 'NOT SET');
  console.log('STRIPE_PRICE_ID_PREMIUM:', envVars.STRIPE_PRICE_ID_PREMIUM || 'NOT SET');
  console.log('NEXT_PUBLIC_BASE_URL:', envVars.NEXT_PUBLIC_BASE_URL || 'NOT SET');
  
  // Check if keys look valid
  if (envVars.STRIPE_SECRET_KEY && envVars.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    console.log('✅ STRIPE_SECRET_KEY appears to be a valid test key');
  } else if (envVars.STRIPE_SECRET_KEY && envVars.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    console.log('⚠️  STRIPE_SECRET_KEY is a LIVE key - use test keys for development');
  } else {
    console.log('❌ STRIPE_SECRET_KEY format appears invalid');
  }
  
} else {
  console.log('❌ .env.local file not found');
  console.log('Please create .env.local with your Stripe configuration');
} 
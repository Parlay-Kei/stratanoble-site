// Test Webhook Functionality
const crypto = require('crypto');

// Simulate webhook signature verification
function generateWebhookSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

// Test webhook payloads
const testWebhooks = [
  {
    name: 'Checkout Session Completed',
    type: 'checkout.session.completed',
    payload: {
      id: 'cs_test_completed',
      object: 'checkout.session',
      customer_email: 'test@example.com',
      amount_total: 500000, // $5,000
      payment_status: 'paid',
      metadata: {
        package_type: 'premium',
        customer_name: 'Test Customer',
        service: 'solution_services'
      }
    }
  },
  {
    name: 'Payment Intent Succeeded',
    type: 'payment_intent.succeeded',
    payload: {
      id: 'pi_test_succeeded',
      object: 'payment_intent',
      amount: 500000, // $5,000
      currency: 'usd',
      receipt_email: 'test@example.com',
      metadata: {
        package_type: 'premium',
        customer_name: 'Test Customer',
        service: 'solution_services'
      }
    }
  },
  {
    name: 'Account Updated',
    type: 'account.updated',
    payload: {
      id: 'acct_test_updated',
      object: 'account',
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
      business_profile: {
        name: 'Test Business'
      }
    }
  }
];

console.log('🧪 Testing Webhook Functionality...\n');

// Test 1: Webhook signature generation
console.log('1. Testing webhook signature generation...');
const testSecret = 'whsec_test_secret';
const testPayload = JSON.stringify({
  id: 'evt_test',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: testWebhooks[0].payload
  }
});

const signature = generateWebhookSignature(testPayload, testSecret);
console.log('✅ Webhook signature generated:', signature.substring(0, 50) + '...');

// Test 2: Validate webhook payload structure
console.log('\n2. Testing webhook payload structure...');
testWebhooks.forEach((webhook, index) => {
  console.log(`   ${index + 1}. ${webhook.name}:`);
  console.log(`      Type: ${webhook.type}`);
  console.log(`      ID: ${webhook.payload.id}`);
  console.log(`      Object: ${webhook.payload.object}`);
  
  if (webhook.payload.customer_email) {
    console.log(`      Customer: ${webhook.payload.customer_email}`);
  }
  if (webhook.payload.amount_total) {
    console.log(`      Amount: $${(webhook.payload.amount_total / 100).toFixed(2)}`);
  }
  if (webhook.payload.charges_enabled !== undefined) {
    console.log(`      Charges Enabled: ${webhook.payload.charges_enabled}`);
  }
});

// Test 3: Environment validation
console.log('\n3. Testing webhook environment configuration...');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
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
  
  if (envVars.STRIPE_WEBHOOK_SECRET) {
    console.log('✅ STRIPE_WEBHOOK_SECRET is configured');
  } else {
    console.log('❌ STRIPE_WEBHOOK_SECRET is missing');
    console.log('   Add to .env.local: STRIPE_WEBHOOK_SECRET=whsec_...');
  }
  
  if (envVars.NEXT_PUBLIC_BASE_URL) {
    console.log('✅ NEXT_PUBLIC_BASE_URL is configured:', envVars.NEXT_PUBLIC_BASE_URL);
  } else {
    console.log('⚠️  NEXT_PUBLIC_BASE_URL is not set, using default: http://localhost:8080');
  }
} else {
  console.log('❌ .env.local file not found');
}

console.log('\n🎉 Webhook functionality test completed!');
console.log('\n📋 Next Steps:');
console.log('1. Set up webhook endpoint in Stripe Dashboard');
console.log('2. Configure STRIPE_WEBHOOK_SECRET in .env.local');
console.log('3. Test with real Stripe webhook events');
console.log('4. Monitor webhook delivery in Stripe Dashboard'); 
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createTestCoupon() {
  try {
    console.log('Creating test coupon for $0.50-$0.60 checkout testing...\n');

    // Create a 99.8% discount coupon
    const coupon = await stripe.coupons.create({
      percent_off: 99.8,
      duration: 'once',
      name: 'Test Coupon - 99.8% Off',
      metadata: {
        purpose: 'testing_production_flow',
        created_by: 'automated_script'
      }
    });

    console.log(`✅ Test coupon created:`);
    console.log(`   Coupon ID: ${coupon.id}`);
    console.log(`   Percent Off: ${coupon.percent_off}%`);
    console.log(`   Duration: ${coupon.duration}\n`);

    // Create a promotion code for the coupon
    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: 'LITE99TEST',
      metadata: {
        purpose: 'testing_production_flow'
      }
    });

    console.log(`✅ Promotion code created:`);
    console.log(`   Promotion Code ID: ${promotionCode.id}`);
    console.log(`   Code: ${promotionCode.code}`);
    console.log(`   Active: ${promotionCode.active}\n`);

    // Calculate test amounts
    console.log('💰 Test amounts with this coupon:');
    console.log(`   Dashboard Lite: $300 → $${(300 * 0.002).toFixed(2)}`);
    console.log(`   Growth Blueprint: $2000 → $${(2000 * 0.002).toFixed(2)}`);
    console.log(`   Revenue Partner Setup: $1000 → $${(1000 * 0.002).toFixed(2)}`);
    console.log(`   Revenue Partner Monthly: $4000 → $${(4000 * 0.002).toFixed(2)}\n`);

    console.log('📋 Add this to your .env.local file:');
    console.log(`STRIPE_TEST_PROMOTION_CODE=${promotionCode.id}\n`);

    console.log('🧪 To test the checkout flow:');
    console.log('1. Add the promotion code to your .env.local');
    console.log('2. Redeploy your application');
    console.log('3. Make a checkout request with test: true in the body');
    console.log('4. Complete the checkout for ~$0.60 instead of full price');
    console.log('5. Verify the full webhook → database → dashboard flow works\n');

    console.log('🔧 Example API call:');
    console.log(`fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    offeringId: 'lite',
    customerEmail: 'test@example.com',
    customerName: 'Test User',
    test: true  // This enables the discount
  })
})`);

  } catch (error) {
    console.error('❌ Error creating test coupon:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('Please check your STRIPE_SECRET_KEY in your .env.local file');
    }
  }
}

// Run the script
createTestCoupon();

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createStripeProducts() {
  try {
    console.log('Creating Stripe products and prices...\n');

    // 1. Dashboard Lite
    console.log('Creating Dashboard Lite product...');
    const liteProduct = await stripe.products.create({
      name: 'Dashboard Lite',
      description: 'Looker dashboard + weekly digest',
      metadata: {
        tier: 'lite'
      }
    });

    const litePrice = await stripe.prices.create({
      product: liteProduct.id,
      unit_amount: 30000, // $300.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      }
    });

    console.log(`✅ Dashboard Lite created:`);
    console.log(`   Product ID: ${liteProduct.id}`);
    console.log(`   Price ID: ${litePrice.id}\n`);

    // 2. Growth Blueprint
    console.log('Creating Growth Blueprint product...');
    const growthProduct = await stripe.products.create({
      name: 'Growth Blueprint',
      description: 'Dashboard + strategy + A/B tests',
      metadata: {
        tier: 'growth'
      }
    });

    const growthPrice = await stripe.prices.create({
      product: growthProduct.id,
      unit_amount: 200000, // $2,000.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      }
    });

    console.log(`✅ Growth Blueprint created:`);
    console.log(`   Product ID: ${growthProduct.id}`);
    console.log(`   Price ID: ${growthPrice.id}\n`);

    // 3. Revenue Partner - Setup Fee
    console.log('Creating Revenue Partner product...');
    const partnerProduct = await stripe.products.create({
      name: 'Revenue Partner',
      description: 'Complete partnership with setup and ongoing support',
      metadata: {
        tier: 'partner'
      }
    });

    const partnerSetupPrice = await stripe.prices.create({
      product: partnerProduct.id,
      unit_amount: 100000, // $1,000.00
      currency: 'usd',
      // One-time payment (no recurring)
    });

    const partnerRecurringPrice = await stripe.prices.create({
      product: partnerProduct.id,
      unit_amount: 400000, // $4,000.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      }
    });

    console.log(`✅ Revenue Partner created:`);
    console.log(`   Product ID: ${partnerProduct.id}`);
    console.log(`   Setup Price ID: ${partnerSetupPrice.id}`);
    console.log(`   Recurring Price ID: ${partnerRecurringPrice.id}\n`);

    // Summary for updating code
    console.log('🎉 All products created successfully!\n');
    console.log('📋 Update your src/data/offerings.ts with these Price IDs:');
    console.log('```typescript');
    console.log('export const OFFERINGS = {');
    console.log('  lite: {');
    console.log('    name: \'Dashboard Lite\',');
    console.log('    description: \'Looker dashboard + weekly digest\',');
    console.log(`    priceId: '${litePrice.id}',`);
    console.log('    metadata: { tier: \'lite\' }');
    console.log('  },');
    console.log('  growth: {');
    console.log('    name: \'Growth Blueprint\',');
    console.log('    description: \'Dashboard + strategy + A/B tests\',');
    console.log(`    priceId: '${growthPrice.id}',`);
    console.log('    metadata: { tier: \'growth\' }');
    console.log('  },');
    console.log('  partner: {');
    console.log('    name: \'Revenue Partner\',');
    console.log('    description: \'Complete partnership with setup and ongoing support\',');
    console.log('    priceIds: {');
    console.log(`      recurring: '${partnerRecurringPrice.id}',`);
    console.log(`      setup: '${partnerSetupPrice.id}',`);
    console.log('    },');
    console.log('    metadata: { tier: \'partner\' }');
    console.log('  },');
    console.log('} as const;');
    console.log('```\n');

  } catch (error) {
    console.error('❌ Error creating Stripe products:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('Please check your STRIPE_SECRET_KEY in your .env file');
    }
  }
}

// Run the script
createStripeProducts();

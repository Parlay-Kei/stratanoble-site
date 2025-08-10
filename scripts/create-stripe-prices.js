const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

async function createPrices() {
  try {
    console.log('Creating Stripe Price objects...\n');

    // Solution Services Prices
    const solutionPrices = [
      { name: 'Lite', amount: 120000, product: process.env.STRIPE_PRICE_ID_SOLUTION }, // $1,200
      { name: 'Core', amount: 250000, product: process.env.STRIPE_PRICE_ID_SOLUTION }, // $2,500
      { name: 'Premium', amount: 500000, product: process.env.STRIPE_PRICE_ID_SOLUTION }, // $5,000
    ];

    for (const priceConfig of solutionPrices) {
      try {
        const price = await stripe.prices.create({
          currency: 'usd',
          unit_amount: priceConfig.amount,
          product: priceConfig.product,
          nickname: `Solution Services - ${priceConfig.name}`,
        });

        console.log(`✅ Created ${priceConfig.name} Price:`);
        console.log(`   Price ID: ${price.id}`);
        console.log(`   Amount: $${priceConfig.amount / 100}`);
        console.log(`   Product: ${priceConfig.product}\n`);
      } catch (error) {
        console.error(`❌ Error creating ${priceConfig.name} price:`, error.message);
      }
    }

    // Workshop Price
    try {
      const workshopPrice = await stripe.prices.create({
        currency: 'usd',
        unit_amount: 9700, // $97
        product: process.env.STRIPE_PRICE_ID_WORKSHOP,
        nickname: 'Side-Hustle Workshop',
      });

      console.log(`✅ Created Workshop Price:`);
      console.log(`   Price ID: ${workshopPrice.id}`);
      console.log(`   Amount: $97`);
      console.log(`   Product: ${process.env.STRIPE_PRICE_ID_WORKSHOP}\n`);
    } catch (error) {
      console.error(`❌ Error creating workshop price:`, error.message);
    }

    console.log('🎉 Price creation completed!');
    console.log('\n📝 Add these Price IDs to your .env.local file:');
    console.log('STRIPE_PRICE_ID_SOLUTION_LITE=price_xxx');
    console.log('STRIPE_PRICE_ID_SOLUTION_CORE=price_xxx');
    console.log('STRIPE_PRICE_ID_SOLUTION_PREMIUM=price_xxx');
    console.log('STRIPE_PRICE_ID_WORKSHOP=price_xxx');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

createPrices();

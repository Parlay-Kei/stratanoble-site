#!/usr/bin/env node
/**
 * Stripe Product Creation Script - Strata Noble Services
 *
 * Creates 4 Strata Noble service products in Stripe:
 * 1. Lead Leak Audit - $297 one-off
 * 2. 48-Hour Intake Fix - $1,250 one-off
 * 3. Pipeline Buildout - $3,500 one-off
 * 4. Pipeline Care (Monthly) - $500 recurring
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_xxx node scripts/create-strata-noble-products.js
 *
 * Or for test mode:
 *   STRIPE_SECRET_KEY=sk_test_xxx node scripts/create-strata-noble-products.js
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY environment variable is required');
  console.error('Usage: STRIPE_SECRET_KEY=sk_xxx node scripts/create-strata-noble-products.js');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Product definitions
const products = [
  {
    name: 'Lead Leak Audit',
    description: 'A structured audit of your lead-to-customer flow. Review includes website intake, routing, response speed, CRM handoff, and basic tracking. Deliverable: prioritized fix plan and recommended next steps.',
    metadata: {
      service_code: 'LLA',
      delivery: 'report',
      turnaround_days: '2',
    },
    marketing_features: [
      { name: 'Intake review: forms, calls, chat, booking links' },
      { name: 'Routing review: who gets notified, how fast, what breaks' },
      { name: 'Follow-up review: automation, templates, response timing' },
      { name: 'CRM handoff review: stages, fields, ownership' },
      { name: 'Deliverable: prioritized fix plan + recommended stack' },
    ],
    price: {
      unit_amount: 29700, // $297.00 in cents
      currency: 'usd',
      type: 'one_time',
    },
  },
  {
    name: '48-Hour Intake Fix',
    description: 'Fix and stabilize your intake flow in 48 hours. Includes lead capture, routing, basic follow-up, and CRM handoff so inquiries stop getting missed. Includes testing and simple handoff notes.',
    metadata: {
      service_code: '48H',
      delivery: 'implementation',
      turnaround_days: '2',
    },
    marketing_features: [
      { name: 'Repair or replace primary intake form/booking entry' },
      { name: 'Routing: notifications + ownership rules' },
      { name: 'Basic follow-up automation (1-3 steps)' },
      { name: 'CRM handoff: create/assign lead' },
      { name: 'Testing: submit -> route -> follow-up -> CRM entry' },
      { name: 'Handoff notes: what changed + how to run it' },
    ],
    price: {
      unit_amount: 125000, // $1,250.00 in cents
      currency: 'usd',
      type: 'one_time',
    },
  },
  {
    name: 'Pipeline Buildout',
    description: 'End-to-end pipeline implementation for a service business. Setup includes intake, routing, CRM pipeline, follow-up automation, and reporting checkpoints. Includes documentation and handoff.',
    metadata: {
      service_code: 'PBO',
      delivery: 'implementation',
      turnaround_days: '21',
    },
    marketing_features: [
      { name: 'Intake design: landing/intake or booking entry' },
      { name: 'Routing rules: ownership + response targets' },
      { name: 'CRM setup: stages, fields, views' },
      { name: 'Automation: follow-up, reminders, internal tasks' },
      { name: 'Reporting: lead volume, response speed, conversion checkpoints' },
      { name: 'Documentation + handoff walkthrough' },
    ],
    price: {
      unit_amount: 350000, // $3,500.00 in cents
      currency: 'usd',
      type: 'one_time',
    },
  },
  {
    name: 'Pipeline Care (Monthly)',
    description: 'Ongoing maintenance and improvements for your pipeline. Covers fixes, small optimizations, and workflow updates to keep intake, CRM, and automation running smoothly. Includes a monthly summary of changes and next priorities.',
    metadata: {
      service_code: 'PCM',
      delivery: 'support',
      hours_included: '2',
    },
    marketing_features: [
      { name: 'Maintenance + fixes' },
      { name: 'Small optimizations and workflow updates' },
      { name: 'Monthly summary: changes + next priorities' },
      { name: 'One monthly check-in (async or call)' },
    ],
    price: {
      unit_amount: 50000, // $500.00 in cents
      currency: 'usd',
      type: 'recurring',
      recurring: {
        interval: 'month',
      },
    },
    statement_descriptor: 'STRATA NOBLE CARE',
  },
];

async function createProduct(productDef) {
  console.log(`\nCreating product: ${productDef.name}...`);

  try {
    // Create the product
    const productParams = {
      name: productDef.name,
      description: productDef.description,
      metadata: productDef.metadata,
      marketing_features: productDef.marketing_features,
      // Tax code for General - Services (default preset)
      tax_code: 'txcd_10000000',
    };

    // Add statement descriptor for subscription product
    if (productDef.statement_descriptor) {
      productParams.statement_descriptor = productDef.statement_descriptor;
    }

    const product = await stripe.products.create(productParams);
    console.log(`  [OK] Product created: ${product.id}`);

    // Create the price
    const priceParams = {
      product: product.id,
      unit_amount: productDef.price.unit_amount,
      currency: productDef.price.currency,
    };

    if (productDef.price.type === 'recurring') {
      priceParams.recurring = productDef.price.recurring;
    }

    const price = await stripe.prices.create(priceParams);
    console.log(`  [OK] Price created: ${price.id} ($${(productDef.price.unit_amount / 100).toFixed(2)} ${productDef.price.type === 'recurring' ? 'monthly' : 'one-off'})`);

    // Set as default price
    await stripe.products.update(product.id, {
      default_price: price.id,
    });
    console.log(`  [OK] Default price set`);

    return {
      success: true,
      product,
      price,
      name: productDef.name,
    };
  } catch (error) {
    console.error(`  [FAIL] Failed to create ${productDef.name}: ${error.message}`);
    return {
      success: false,
      name: productDef.name,
      error: error.message,
    };
  }
}

async function verifyProducts(results) {
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION: Checking created products in Stripe...');
  console.log('='.repeat(60));

  const successfulProducts = results.filter(r => r.success);

  for (const result of successfulProducts) {
    try {
      const product = await stripe.products.retrieve(result.product.id, {
        expand: ['default_price'],
      });

      const price = product.default_price;
      const isRecurring = price.type === 'recurring';
      const amount = (price.unit_amount / 100).toFixed(2);

      console.log(`\n${product.name}:`);
      console.log(`  Product ID: ${product.id}`);
      console.log(`  Price ID: ${price.id}`);
      console.log(`  Amount: $${amount} USD ${isRecurring ? '(monthly recurring)' : '(one-off)'}`);
      console.log(`  Description: ${product.description ? '[OK] Present' : '[FAIL] Missing'}`);
      console.log(`  Marketing Features: ${product.marketing_features?.length || 0} items`);
      console.log(`  Metadata: ${JSON.stringify(product.metadata)}`);
      console.log(`  Status: [PASS]`);
    } catch (error) {
      console.log(`\n${result.name}: [FAIL] - Could not verify: ${error.message}`);
    }
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('STRATA NOBLE - STRIPE PRODUCT CREATION');
  console.log('='.repeat(60));
  console.log(`Mode: ${STRIPE_SECRET_KEY.startsWith('sk_live') ? 'LIVE' : 'TEST'}`);
  console.log(`Creating ${products.length} products...`);

  const results = [];

  for (const productDef of products) {
    const result = await createProduct(productDef);
    results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('CREATION SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\nSuccessful: ${successful.length}/${products.length}`);
  successful.forEach(r => {
    console.log(`  [OK] ${r.name}`);
  });

  if (failed.length > 0) {
    console.log(`\nFailed: ${failed.length}/${products.length}`);
    failed.forEach(r => {
      console.log(`  [FAIL] ${r.name}: ${r.error}`);
    });
  }

  // Verify all products
  if (successful.length > 0) {
    await verifyProducts(results);
  }

  console.log('\n' + '='.repeat(60));
  console.log('FINAL STATUS');
  console.log('='.repeat(60));

  if (failed.length === 0) {
    console.log('\n[PASS] ALL PRODUCTS CREATED SUCCESSFULLY');
    console.log('\nView in Stripe Dashboard:');
    console.log(`  https://dashboard.stripe.com/${STRIPE_SECRET_KEY.startsWith('sk_live') ? '' : 'test/'}products`);

    // Output code snippet for integration
    console.log('\n' + '='.repeat(60));
    console.log('CODE INTEGRATION - Price IDs for your app:');
    console.log('='.repeat(60));
    console.log('\nexport const STRATA_NOBLE_PRODUCTS = {');
    successful.forEach(r => {
      const serviceCode = r.product.metadata.service_code;
      console.log(`  ${serviceCode}: {`);
      console.log(`    productId: '${r.product.id}',`);
      console.log(`    priceId: '${r.price.id}',`);
      console.log(`    name: '${r.name}',`);
      console.log(`  },`);
    });
    console.log('} as const;');
  } else {
    console.log(`\n[WARNING] ${failed.length} product(s) failed to create`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

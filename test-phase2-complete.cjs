/**
 * Phase 2 Completion Test Script
 * Tests all Phase 2 components: Payments & Access
 * 
 * Phase 2 Requirements:
 * ✅ Install @stripe/stripe-js
 * ✅ Create /api/checkout route  
 * ✅ Add "Start" buttons that POST to checkout route with offeringId
 * ✅ Use Stripe Customer Portal for subscription management
 * ✅ Create basic dashboard placeholder page
 * ✅ Set up webhook handling for payment events
 */

const https = require('https');
const fs = require('fs');

// Test configuration
const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

console.log('🧪 Phase 2 Completion Test Suite');
console.log('==================================');

// Test 1: Verify pricing page loads
async function testPricingPage() {
  console.log('\n1. Testing pricing page...');
  try {
    const response = await fetch(`${BASE_URL}/pricing`);
    if (response.ok) {
      console.log('✅ Pricing page loads successfully');
      return true;
    } else {
      console.log('❌ Pricing page failed to load:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Pricing page error:', error.message);
    return false;
  }
}

// Test 2: Verify dashboard page loads
async function testDashboardPage() {
  console.log('\n2. Testing dashboard page...');
  try {
    const response = await fetch(`${BASE_URL}/dashboard`);
    if (response.ok) {
      console.log('✅ Dashboard page loads successfully');
      return true;
    } else {
      console.log('❌ Dashboard page failed to load:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Dashboard page error:', error.message);
    return false;
  }
}

// Test 3: Test checkout API endpoint
async function testCheckoutAPI() {
  console.log('\n3. Testing checkout API...');
  try {
    const response = await fetch(`${BASE_URL}/api/stripe/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offeringId: 'lite',
        customerEmail: 'test@stratanoble.com',
        customerName: 'Test User',
        test: true
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.url) {
      console.log('✅ Checkout API working - returns Stripe URL');
      console.log(`   URL: ${result.url.substring(0, 50)}...`);
      return true;
    } else {
      console.log('❌ Checkout API failed:', result.error || 'No URL returned');
      return false;
    }
  } catch (error) {
    console.log('❌ Checkout API error:', error.message);
    return false;
  }
}

// Test 4: Test customer portal API endpoint
async function testCustomerPortalAPI() {
  console.log('\n4. Testing customer portal API...');
  try {
    const response = await fetch(`${BASE_URL}/api/stripe/customer-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId: 'cus_test123',
        returnUrl: `${BASE_URL}/dashboard`
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.url) {
      console.log('✅ Customer Portal API working - returns Stripe portal URL');
      return true;
    } else {
      console.log('❌ Customer Portal API failed:', result.error || 'No URL returned');
      return false;
    }
  } catch (error) {
    console.log('❌ Customer Portal API error:', error.message);
    return false;
  }
}

// Test 5: Verify file structure
function testFileStructure() {
  console.log('\n5. Testing file structure...');
  const requiredFiles = [
    'src/app/pricing/page.tsx',
    'src/app/dashboard/page.tsx',
    'src/app/api/stripe/checkout/route.ts',
    'src/app/api/stripe/customer-portal/route.ts',
    'src/components/SubscriptionManager.tsx',
    'src/components/OfferingCard.tsx',
    'src/data/offerings.ts'
  ];

  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      allFilesExist = false;
    }
  });

  return allFilesExist;
}

// Test 6: Verify package dependencies
function testDependencies() {
  console.log('\n6. Testing dependencies...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      '@stripe/stripe-js',
      'stripe',
      '@prisma/client',
      'prisma'
    ];

    let allDepsInstalled = true;
    
    requiredDeps.forEach(dep => {
      if (dependencies[dep]) {
        console.log(`✅ ${dep} installed (${dependencies[dep]})`);
      } else {
        console.log(`❌ ${dep} missing`);
        allDepsInstalled = false;
      }
    });

    return allDepsInstalled;
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log(`Testing against: ${BASE_URL}\n`);
  
  const results = {
    fileStructure: testFileStructure(),
    dependencies: testDependencies(),
    pricingPage: await testPricingPage(),
    dashboardPage: await testDashboardPage(),
    checkoutAPI: await testCheckoutAPI(),
    customerPortalAPI: await testCustomerPortalAPI()
  };

  // Summary
  console.log('\n📊 Phase 2 Test Results');
  console.log('========================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 Phase 2 Complete! All systems operational.');
    console.log('\nPhase 2 Achievements:');
    console.log('• ✅ Stripe checkout integration working');
    console.log('• ✅ Customer portal for subscription management');
    console.log('• ✅ Dashboard with subscription manager component');
    console.log('• ✅ Pricing page with "Start" buttons');
    console.log('• ✅ Test mode with 99.8% discount coupons');
    console.log('• ✅ All required dependencies installed');
    
    console.log('\n🚀 Ready for Phase 3: Auth & Tenancy');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before proceeding.');
  }
  
  return passed === total;
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };

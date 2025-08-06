// Test script to verify the $0.50-$0.60 checkout flow
// This script demonstrates how to call the checkout API with test mode enabled

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com';

async function testCheckoutFlow() {
  console.log('🧪 Testing Stripe checkout flow with 99.8% discount coupon...\n');

  const testCases = [
    {
      name: 'Dashboard Lite',
      offeringId: 'lite',
      expectedAmount: '$0.60'
    },
    {
      name: 'Growth Blueprint', 
      offeringId: 'growth',
      expectedAmount: '$4.00'
    },
    {
      name: 'Revenue Partner',
      offeringId: 'partner', 
      expectedAmount: '$2.00 setup + $8.00/month'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing ${testCase.name} (${testCase.offeringId})`);
    console.log(`Expected discounted amount: ${testCase.expectedAmount}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/stripe/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offeringId: testCase.offeringId,
          customerEmail: 'test@stratanoble.com',
          customerName: 'Test User',
          test: true  // This enables the 99.8% discount
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ Checkout session created successfully`);
        console.log(`   Session ID: ${result.sessionId}`);
        console.log(`   Checkout URL: ${result.url}`);
        console.log(`   💡 Visit this URL to complete the discounted checkout`);
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Visit one of the checkout URLs above');
  console.log('2. Complete the payment (should be ~$0.60-$8.00 instead of full price)');
  console.log('3. Verify the webhook is received and processed');
  console.log('4. Check that the subscription is created in Stripe Dashboard');
  console.log('5. Confirm the user gets access to the dashboard');
  console.log('\n💡 This tests the full production flow without paying full price!');
}

// Example of how to call this from a browser console or frontend
function generateTestCheckoutCall(offeringId = 'lite') {
  return `
// Copy and paste this into your browser console on ${BASE_URL}
fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    offeringId: '${offeringId}',
    customerEmail: 'test@stratanoble.com',
    customerName: 'Test User',
    test: true  // Enables 99.8% discount
  })
})
.then(res => res.json())
.then(data => {
  if (data.url) {
    console.log('Checkout URL:', data.url);
    window.open(data.url, '_blank');
  } else {
    console.error('Error:', data.error);
  }
});
`;
}

console.log('🔧 Browser Console Test Code:');
console.log(generateTestCheckoutCall('lite'));

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testCheckoutFlow();
}

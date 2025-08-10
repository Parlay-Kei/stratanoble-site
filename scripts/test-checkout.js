async function testCheckout() {
  try {
    const response = await fetch('http://localhost:8080/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packageType: 'premium',
        customerEmail: 'test@example.com',
        customerName: 'Test User'
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Test error:', error);
  }
}

testCheckout();

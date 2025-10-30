// Quick API test
const testCall = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/voice/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '+17021234567',
        testName: 'API Test',
        metadata: { campaign_type: 'internet' }
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ API Working! Call initiated:', data.callSid);
    } else {
      console.log('❌ API Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
};

testCall();

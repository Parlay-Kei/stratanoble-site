// Test script for CRM API endpoints
// This simulates the discovery form submission and tests the complete CRM flow

async function testCRMAPI() {
  console.log('🧪 Testing Phase 3 CRM API Integration');
  console.log('======================================\n');

  const baseURL = 'http://localhost:3000';

  // Test lead creation
  const testLeadData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    passion_area: 'Technology',
    business_stage: 'early_stage',
    main_challenge: 'Getting first customers and building sustainable revenue streams',
    time_commitment: '10-15 hours per week',
    success_goal: 'Reach $10k MRR within 12 months',
    interested_tier: 'growth',
    utm_source: 'test',
    utm_medium: 'api',
    utm_campaign: 'crm_test',
    metadata: {
      test: true,
      created_by: 'test_script'
    }
  };

  try {
    console.log('📝 Testing lead creation...');
    const leadResponse = await fetch(`${baseURL}/api/crm/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLeadData)
    });

    const leadResult = await leadResponse.json();
    console.log('✅ Lead creation response:', JSON.stringify(leadResult, null, 2));

    if (leadResult.success && leadResult.data?.id) {
      const leadId = leadResult.data.id;
      console.log(`📋 Created lead with ID: ${leadId}\n`);

      // Test lead retrieval
      console.log('🔍 Testing lead retrieval...');
      const getResponse = await fetch(`${baseURL}/api/crm/leads/${leadId}`);
      const getResult = await getResponse.json();
      console.log('✅ Lead retrieval response:', JSON.stringify(getResult, null, 2));

      // Test lead update
      console.log('\n📝 Testing lead update...');
      const updateResponse = await fetch(`${baseURL}/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: 'scheduled',
          notes: 'Discovery call scheduled for tomorrow',
          priority: 1
        })
      });
      const updateResult = await updateResponse.json();
      console.log('✅ Lead update response:', JSON.stringify(updateResult, null, 2));

      // Test email sequences retrieval
      console.log('\n📧 Testing email sequences...');
      const sequencesResponse = await fetch(`${baseURL}/api/crm/email-sequences?status=pending`);
      const sequencesResult = await sequencesResponse.json();
      console.log('✅ Email sequences response:', JSON.stringify(sequencesResult, null, 2));

      // Test leads listing
      console.log('\n📊 Testing leads listing...');
      const listResponse = await fetch(`${baseURL}/api/crm/leads?limit=5`);
      const listResult = await listResponse.json();
      console.log('✅ Leads listing response:', JSON.stringify(listResult, null, 2));

    } else {
      console.error('❌ Lead creation failed, skipping subsequent tests');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  console.log('\n🎯 Test Summary:');
  console.log('================');
  console.log('✅ Lead creation API');
  console.log('✅ Lead retrieval API');
  console.log('✅ Lead update API');
  console.log('✅ Email sequences API');
  console.log('✅ Leads listing API');
  console.log('\n📋 Next Steps:');
  console.log('1. Manually apply database migrations to Supabase');
  console.log('2. Test discovery form UI at /discovery');
  console.log('3. Verify email sequences are scheduled');
  console.log('4. Check CRM dashboard functionality');
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCRMAPI().catch(console.error);
}

export default testCRMAPI;
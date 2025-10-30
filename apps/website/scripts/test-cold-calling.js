#!/usr/bin/env node

/**
 * Test script for DSLV Cold Calling system
 * 
 * Usage:
 *   node scripts/test-cold-calling.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function testColdCalling() {
  console.log('\n🎯 DSLV Cold Calling System - Test Script\n');
  console.log('This script will help you test the Cold Calling agent');
  console.log('with all 4 campaign types.\n');

  // Get user's phone number
  const phoneNumber = await question('Enter your phone number (E.164 format, e.g., +17021234567): ');
  
  if (!phoneNumber || !phoneNumber.startsWith('+')) {
    console.error('\n❌ Error: Phone number must be in E.164 format (e.g., +17021234567)');
    rl.close();
    return;
  }

  // Ask which campaign to test
  console.log('\n📞 Select campaign type to test:');
  console.log('1. Internet Services');
  console.log('2. VoIP Solutions');
  console.log('3. Security Systems');
  console.log('4. Cisco Networking');
  console.log('5. Test all campaigns');

  const choice = await question('\nEnter choice (1-5): ');

  const campaigns = {
    '1': 'internet',
    '2': 'voip',
    '3': 'security',
    '4': 'cisco'
  };

  const testCampaigns = choice === '5' 
    ? ['internet', 'voip', 'security', 'cisco']
    : [campaigns[choice]];

  if (!testCampaigns[0]) {
    console.error('\n❌ Error: Invalid choice');
    rl.close();
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  console.log(`\n🚀 Initiating ${testCampaigns.length > 1 ? `${testCampaigns.length} ` : ''}test call${testCampaigns.length > 1 ? 's' : ''}...`);
  console.log(`📱 Your phone: ${phoneNumber}`);
  console.log(`🌐 API: ${baseUrl}\n`);

  // Make API calls
  for (const campaign of testCampaigns) {
    try {
      console.log(`📞 Calling for ${campaign} campaign...`);
      
      const response = await fetch(`${baseUrl}/api/voice/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          testName: `DSLV ${campaign} Test`,
          metadata: {
            campaign_type: campaign,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Call initiated successfully!`);
        console.log(`   Call SID: ${data.callSid}`);
        console.log(`   Campaign: ${data.campaignType}\n`);
      } else {
        console.error(`❌ Call failed: ${data.error}\n`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }

  console.log('✅ Test complete!');
  console.log('\n📋 What to expect:');
  console.log('1. Your phone will ring within 5-10 seconds');
  console.log('2. You\'ll hear Jake greet you naturally');
  console.log('3. Have a natural conversation about the campaign topic');
  console.log('4. Jake will qualify your interest and extract data');
  console.log('5. Check console logs for qualification tracking\n');

  rl.close();
}

testColdCalling().catch(console.error);


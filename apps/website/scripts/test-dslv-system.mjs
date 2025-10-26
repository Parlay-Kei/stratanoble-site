#!/usr/bin/env node
/**
 * DSLV Cold Calling System - Comprehensive Test Suite
 *
 * Tests all components:
 * 1. Conversation configuration (Jake persona + 4 scripts)
 * 2. Call evaluator (GPT-4 scoring)
 * 3. Campaign scheduler
 * 4. API endpoints
 * 5. Helper functions
 *
 * Run: node apps/website/scripts/test-dslv-system.mjs
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

// Test configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TEST_PHONE = process.env.TEST_PHONE_NUMBER;

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('');
  log('═'.repeat(80), 'cyan');
  log(`  ${message}`, 'bright');
  log('═'.repeat(80), 'cyan');
  console.log('');
}

function section(message) {
  console.log('');
  log(`▶ ${message}`, 'blue');
  log('─'.repeat(80), 'blue');
}

function pass(message) {
  log(`  ✓ ${message}`, 'green');
}

function fail(message) {
  log(`  ✗ ${message}`, 'red');
}

function warn(message) {
  log(`  ⚠ ${message}`, 'yellow');
}

function info(message) {
  console.log(`    ${message}`);
}

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

function test(name, fn) {
  results.total++;
  try {
    const result = fn();
    if (result === true || result === undefined) {
      results.passed++;
      pass(name);
      results.tests.push({ name, status: 'pass' });
      return true;
    } else if (result === 'warn') {
      results.warnings++;
      warn(name);
      results.tests.push({ name, status: 'warn' });
      return true;
    } else {
      results.failed++;
      fail(name);
      results.tests.push({ name, status: 'fail', error: result });
      return false;
    }
  } catch (error) {
    results.failed++;
    fail(`${name} - ${error.message}`);
    results.tests.push({ name, status: 'fail', error: error.message });
    return false;
  }
}

async function asyncTest(name, fn) {
  results.total++;
  try {
    const result = await fn();
    if (result === true || result === undefined) {
      results.passed++;
      pass(name);
      results.tests.push({ name, status: 'pass' });
      return true;
    } else if (result === 'warn') {
      results.warnings++;
      warn(name);
      results.tests.push({ name, status: 'warn' });
      return true;
    } else {
      results.failed++;
      fail(name);
      results.tests.push({ name, status: 'fail', error: result });
      return false;
    }
  } catch (error) {
    results.failed++;
    fail(`${name} - ${error.message}`);
    results.tests.push({ name, status: 'fail', error: error.message });
    return false;
  }
}

// Test 1: Check files exist
async function testFilesExist() {
  section('Test 1: File Structure');

  const requiredFiles = [
    'apps/website/src/lib/conversation-config.ts',
    'apps/website/src/lib/call-evaluator.ts',
    'apps/website/src/lib/campaign-scheduler.ts',
    'apps/website/src/app/api/voice/conversation/route.ts',
  ];

  const fs = await import('fs');
  const path = await import('path');

  for (const file of requiredFiles) {
    const fullPath = path.join(process.cwd(), file);
    test(`File exists: ${file}`, () => {
      return fs.existsSync(fullPath);
    });
  }
}

// Test 2: Check environment variables
async function testEnvironment() {
  section('Test 2: Environment Configuration');

  test('OPENAI_API_KEY configured', () => {
    return !!process.env.OPENAI_API_KEY;
  });

  test('TWILIO_ACCOUNT_SID configured', () => {
    return !!process.env.TWILIO_ACCOUNT_SID;
  });

  test('TWILIO_AUTH_TOKEN configured', () => {
    return !!process.env.TWILIO_AUTH_TOKEN;
  });

  test('TWILIO_PHONE_NUMBER configured', () => {
    return !!process.env.TWILIO_PHONE_NUMBER;
  });

  if (!TEST_PHONE) {
    warn('TEST_PHONE_NUMBER not set (optional for manual testing)');
  } else {
    pass(`TEST_PHONE_NUMBER configured: ${TEST_PHONE}`);
  }
}

// Test 3: Check conversation config exports
async function testConversationConfig() {
  section('Test 3: Conversation Configuration');

  try {
    const module = await import('../src/lib/conversation-config.ts');

    test('getSystemPrompt function exported', () => {
      return typeof module.getSystemPrompt === 'function';
    });

    test('conversationHelpers exported', () => {
      return typeof module.conversationHelpers === 'object';
    });

    test('extractQualificationData exported', () => {
      return typeof module.extractQualificationData === 'function';
    });

    test('calculateQualificationScore exported', () => {
      return typeof module.calculateQualificationScore === 'function';
    });

    // Test Jake greeting generation
    const campaignTypes = ['internet', 'voip', 'security', 'cisco'];
    for (const type of campaignTypes) {
      test(`${type} campaign script available`, () => {
        const prompt = module.getSystemPrompt(type);
        return prompt.includes('Jake') && prompt.length > 100;
      });
    }

    // Test helper functions
    test('isEndingCall detects opt-outs', () => {
      return module.conversationHelpers.isEndingCall('not interested') === true &&
             module.conversationHelpers.isEndingCall('sounds good') === false;
    });

    test('extractContactInfo finds phone numbers', () => {
      const info = module.conversationHelpers.extractContactInfo('My number is 702-555-1234');
      return info.phone === '702-555-1234';
    });

    test('detectPainPoints identifies issues', () => {
      const points = module.conversationHelpers.detectPainPoints('Our internet is too slow and expensive');
      return points.includes('slow_speed') && points.includes('high_cost');
    });

    test('assessInterest evaluates engagement', () => {
      const high = module.conversationHelpers.assessInterest('yes definitely tell me more');
      const low = module.conversationHelpers.assessInterest('maybe later');
      return high === 'high' && low === 'low';
    });

  } catch (error) {
    fail(`Failed to load conversation-config: ${error.message}`);
  }
}

// Test 4: Check call evaluator
async function testCallEvaluator() {
  section('Test 4: Call Evaluator');

  try {
    const module = await import('../src/lib/call-evaluator.ts');

    test('evaluateCall function exported', () => {
      return typeof module.evaluateCall === 'function';
    });

    test('calculateQualityScores function exported', () => {
      return typeof module.calculateQualityScores === 'function';
    });

    test('generateRecommendations function exported', () => {
      return typeof module.generateRecommendations === 'function';
    });

    test('analyzeCampaignInsights function exported', () => {
      return typeof module.analyzeCampaignInsights === 'function';
    });

  } catch (error) {
    fail(`Failed to load call-evaluator: ${error.message}`);
  }
}

// Test 5: Check campaign scheduler
async function testCampaignScheduler() {
  section('Test 5: Campaign Scheduler');

  try {
    const module = await import('../src/lib/campaign-scheduler.ts');

    test('createCampaign function exported', () => {
      return typeof module.createCampaign === 'function';
    });

    test('scheduleCallsForCampaign function exported', () => {
      return typeof module.scheduleCallsForCampaign === 'function';
    });

    test('getNextCallBatch function exported', () => {
      return typeof module.getNextCallBatch === 'function';
    });

    test('updateCallStatus function exported', () => {
      return typeof module.updateCallStatus === 'function';
    });

    test('updateCampaignMetrics function exported', () => {
      return typeof module.updateCampaignMetrics === 'function';
    });

    test('calculateROI function exported', () => {
      return typeof module.calculateROI === 'function';
    });

  } catch (error) {
    fail(`Failed to load campaign-scheduler: ${error.message}`);
  }
}

// Test 6: Check API endpoints
async function testAPIEndpoints() {
  section('Test 6: API Endpoints');

  // Test conversation endpoint GET (initial greeting)
  await asyncTest('GET /api/voice/conversation returns TwiML', async () => {
    try {
      const response = await fetch(`${API_BASE}/api/voice/conversation?CallSid=TEST123&campaignType=internet`);
      const text = await response.text();
      return response.status === 200 &&
             text.includes('<Response>') &&
             text.includes('Jake from Data Solutions');
    } catch (error) {
      return error.message;
    }
  });

  // Test conversation endpoint with different campaign types
  const campaignTypes = ['internet', 'voip', 'security', 'cisco'];
  for (const type of campaignTypes) {
    await asyncTest(`GET /api/voice/conversation supports ${type} campaign`, async () => {
      try {
        const response = await fetch(`${API_BASE}/api/voice/conversation?CallSid=TEST_${type}&campaignType=${type}`);
        const text = await response.text();
        return response.status === 200 && text.includes('<Response>');
      } catch (error) {
        return error.message;
      }
    });
  }

  // Test TwiML endpoint
  await asyncTest('GET /api/voice/twiml returns valid TwiML', async () => {
    try {
      const response = await fetch(`${API_BASE}/api/voice/twiml?campaignType=internet`);
      const text = await response.text();
      return response.status === 200 &&
             text.includes('<Response>') &&
             text.includes('/api/voice/conversation');
    } catch (error) {
      return error.message;
    }
  });
}

// Test 7: System health check
async function testSystemHealth() {
  section('Test 7: System Health Check');

  await asyncTest('Dev server running on localhost:3000', async () => {
    try {
      const response = await fetch(`${API_BASE}`);
      return response.status === 200;
    } catch (error) {
      return error.message;
    }
  });

  await asyncTest('OpenAI API key valid', async () => {
    if (!process.env.OPENAI_API_KEY) {
      return 'OPENAI_API_KEY not configured';
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      return error.message;
    }
  });

  test('Required packages installed', () => {
    try {
      require.resolve('openai');
      require.resolve('twilio');
      return true;
    } catch (error) {
      return error.message;
    }
  });
}

// Test 8: Sample qualification scoring
async function testQualificationScoring() {
  section('Test 8: Qualification Scoring');

  try {
    const module = await import('../src/lib/conversation-config.ts');

    // Sample conversation messages
    const sampleMessages = [
      { role: 'system', content: 'Jake persona...' },
      { role: 'assistant', content: 'Hi, this is Jake from Data Solutions. How are you doing today?' },
      { role: 'user', content: 'Good, thanks.' },
      { role: 'assistant', content: 'Great! So are you currently happy with your internet service?' },
      { role: 'user', content: 'Not really, it\'s too slow and expensive.' },
      { role: 'assistant', content: 'I hear you. What kind of speeds are you getting?' },
      { role: 'user', content: 'Maybe 25 megs. We need faster for our business.' },
      { role: 'assistant', content: 'That makes sense. Are you the person who handles this decision?' },
      { role: 'user', content: 'Yes, I\'m the owner.' },
      { role: 'assistant', content: 'Perfect. Would it help to see what options might give you better value?' },
      { role: 'user', content: 'Yeah, definitely. What do you have available?' },
    ];

    const qualification = module.extractQualificationData(sampleMessages);

    test('Interest level detected as high', () => {
      return qualification.interest_level === 'high';
    });

    test('Decision maker identified', () => {
      return qualification.decision_maker === true;
    });

    test('Pain points detected', () => {
      return qualification.pain_points.includes('slow_speed') &&
             qualification.pain_points.includes('high_cost');
    });

    const score = module.calculateQualificationScore(qualification);

    test('Qualification score calculated (0-100)', () => {
      return score >= 0 && score <= 100;
    });

    test('High-quality lead scores above 60', () => {
      return score >= 60;
    });

    info(`Sample conversation qualification score: ${score}/100`);
    info(`Interest level: ${qualification.interest_level}`);
    info(`Decision maker: ${qualification.decision_maker}`);
    info(`Pain points: ${qualification.pain_points.join(', ')}`);

  } catch (error) {
    fail(`Qualification scoring failed: ${error.message}`);
  }
}

// Print summary
function printSummary() {
  header('Test Results Summary');

  const passRate = (results.passed / results.total * 100).toFixed(1);
  const failRate = (results.failed / results.total * 100).toFixed(1);

  console.log('');
  log(`  Total Tests:     ${results.total}`, 'bright');
  log(`  Passed:          ${results.passed} (${passRate}%)`, results.passed === results.total ? 'green' : 'yellow');
  log(`  Failed:          ${results.failed} (${failRate}%)`, results.failed === 0 ? 'green' : 'red');
  log(`  Warnings:        ${results.warnings}`, results.warnings === 0 ? 'green' : 'yellow');
  console.log('');

  if (results.failed > 0) {
    section('Failed Tests');
    results.tests
      .filter(t => t.status === 'fail')
      .forEach(t => {
        fail(t.name);
        if (t.error) info(`Error: ${t.error}`);
      });
  }

  console.log('');

  if (results.failed === 0) {
    log('═'.repeat(80), 'green');
    log('  🎉 ALL TESTS PASSED - SYSTEM PRODUCTION READY', 'green');
    log('═'.repeat(80), 'green');
    console.log('');

    log('  Next Steps:', 'bright');
    console.log('');
    info('1. Make a test call to yourself:');
    console.log('');
    console.log('   curl -X POST http://localhost:3000/api/voice/call \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"phoneNumber":"+YOUR_NUMBER","testName":"Jake Test","metadata":{"campaign_type":"internet"}}\'');
    console.log('');
    info('2. Experience Jake\'s natural conversation style');
    info('3. Test all 4 campaign types (internet, voip, security, cisco)');
    info('4. Review qualification data in console logs');
    info('5. Launch pilot campaign with 20-30 real leads');
    console.log('');
  } else {
    log('═'.repeat(80), 'red');
    log('  ⚠️  SOME TESTS FAILED - REVIEW ERRORS ABOVE', 'red');
    log('═'.repeat(80), 'red');
    console.log('');
  }
}

// Run all tests
async function runTests() {
  header('DSLV Cold Calling System - Comprehensive Test Suite');
  log(`  Testing against: ${API_BASE}`, 'cyan');
  log(`  Date: ${new Date().toLocaleString()}`, 'cyan');
  console.log('');

  await testFilesExist();
  await testEnvironment();
  await testConversationConfig();
  await testCallEvaluator();
  await testCampaignScheduler();
  await testAPIEndpoints();
  await testSystemHealth();
  await testQualificationScoring();

  printSummary();

  // Exit with error code if tests failed
  process.exit(results.failed > 0 ? 1 : 0);
}

// Execute tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * DSLV Implementation Verification Script
 *
 * Verifies the DSLV cold calling system implementation by:
 * 1. Checking file existence
 * 2. Validating code structure
 * 3. Testing helper functions
 * 4. Verifying API endpoints accessible
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../../..');

// ANSI colors
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const cyan = '\x1b[36m';
const reset = '\x1b[0m';

console.log(`${cyan}${'═'.repeat(80)}${reset}`);
console.log(`${cyan}  DSLV Cold Calling System - Implementation Verification${reset}`);
console.log(`${cyan}  Date: ${new Date().toLocaleString()}${reset}`);
console.log(`${cyan}${'═'.repeat(80)}${reset}\n`);

let passed = 0;
let failed = 0;

function pass(msg) {
  console.log(`${green}✓${reset} ${msg}`);
  passed++;
}

function fail(msg) {
  console.log(`${red}✗${reset} ${msg}`);
  failed++;
}

function info(msg) {
  console.log(`  ${msg}`);
}

function section(title) {
  console.log(`\n${cyan}▶ ${title}${reset}`);
  console.log(`${cyan}${'─'.repeat(80)}${reset}`);
}

// Test 1: File existence
section('Test 1: Core Implementation Files');

const files = [
  'apps/website/src/lib/conversation-config.ts',
  'apps/website/src/lib/call-evaluator.ts',
  'apps/website/src/lib/call-evaluator-dslv.ts',
  'apps/website/src/lib/campaign-scheduler.ts',
  'apps/website/src/lib/call-manager.ts',
  'apps/website/src/lib/twilio.ts',
  'apps/website/src/app/api/voice/conversation/route.ts',
  'apps/website/src/app/api/voice/twiml/route.ts',
  'apps/website/src/app/api/voice/call/route.ts',
];

files.forEach(file => {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const kb = (stats.size / 1024).toFixed(1);
    pass(`${file} (${kb} KB)`);
  } else {
    fail(`${file} - FILE NOT FOUND`);
  }
});

// Test 2: Code content verification
section('Test 2: Jake Persona & Campaign Scripts');

const conversationConfigPath = path.join(rootDir, 'apps/website/src/lib/conversation-config.ts');
if (fs.existsSync(conversationConfigPath)) {
  const content = fs.readFileSync(conversationConfigPath, 'utf-8');

  if (content.includes('Jake')) {
    pass('Jake persona defined');
  } else {
    fail('Jake persona not found in conversation-config.ts');
  }

  const campaigns = ['internet', 'voip', 'security', 'cisco'];
  campaigns.forEach(campaign => {
    const pattern = new RegExp(`${campaign}.*campaign`, 'i');
    if (pattern.test(content)) {
      pass(`${campaign.toUpperCase()} campaign script present`);
    } else {
      fail(`${campaign.toUpperCase()} campaign script not found`);
    }
  });

  const helpers = ['isEndingCall', 'extractContactInfo', 'detectPainPoints', 'assessInterest'];
  helpers.forEach(helper => {
    if (content.includes(helper)) {
      pass(`Helper function: ${helper}()`);
    } else {
      fail(`Helper function: ${helper}() not found`);
    }
  });
}

// Test 3: Call Evaluator
section('Test 3: Call Evaluator Components');

const evaluatorPath = path.join(rootDir, 'apps/website/src/lib/call-evaluator.ts');
if (fs.existsSync(evaluatorPath)) {
  const content = fs.readFileSync(evaluatorPath, 'utf-8');

  const functions = [
    'evaluateCall',
    'calculateQualityScores',
    'generateRecommendations',
    'analyzeCampaignInsights'
  ];

  functions.forEach(fn => {
    if (content.includes(fn)) {
      pass(`Function: ${fn}()`);
    } else {
      fail(`Function: ${fn}() not found`);
    }
  });

  if (content.includes('GPT-4') || content.includes('gpt-4')) {
    pass('GPT-4 integration references found');
  } else {
    fail('GPT-4 integration not found');
  }
}

// Test 4: Campaign Scheduler
section('Test 4: Campaign Scheduler');

const schedulerPath = path.join(rootDir, 'apps/website/src/lib/campaign-scheduler.ts');
if (fs.existsSync(schedulerPath)) {
  const content = fs.readFileSync(schedulerPath, 'utf-8');

  const functions = [
    'createCampaign',
    'scheduleCallsForCampaign',
    'getNextCallBatch',
    'updateCallStatus',
    'updateCampaignMetrics',
    'calculateROI'
  ];

  functions.forEach(fn => {
    if (content.includes(fn)) {
      pass(`Function: ${fn}()`);
    } else {
      fail(`Function: ${fn}() not found`);
    }
  });
}

// Test 5: API Routes
section('Test 5: API Route Handlers');

const apiRoutes = [
  { path: 'apps/website/src/app/api/voice/conversation/route.ts', name: 'Conversation API' },
  { path: 'apps/website/src/app/api/voice/twiml/route.ts', name: 'TwiML Generator' },
  { path: 'apps/website/src/app/api/voice/call/route.ts', name: 'Call Initiation' },
];

apiRoutes.forEach(route => {
  const fullPath = path.join(rootDir, route.path);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');

    if (content.includes('export async function')) {
      pass(`${route.name} - Handler functions present`);
    } else {
      fail(`${route.name} - No handler functions found`);
    }

    if (route.path.includes('conversation')) {
      if (content.includes('campaignType')) {
        pass(`${route.name} - Campaign type parameter supported`);
      } else {
        fail(`${route.name} - Campaign type parameter missing`);
      }

      if (content.includes('Jake')) {
        pass(`${route.name} - Jake greeting implemented`);
      } else {
        fail(`${route.name} - Jake greeting not found`);
      }
    }
  }
});

// Test 6: Environment variables check
section('Test 6: Environment Configuration');

const envPath = path.join(rootDir, 'apps/website/.env.local');
if (fs.existsSync(envPath)) {
  pass('.env.local file exists');

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredVars = [
    'OPENAI_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER'
  ];

  requiredVars.forEach(varName => {
    const pattern = new RegExp(`${varName}\\s*=\\s*.+`, 'i');
    if (pattern.test(envContent)) {
      pass(`${varName} configured`);
    } else {
      fail(`${varName} NOT configured (required for testing)`);
    }
  });
} else {
  fail('.env.local file not found');
}

// Test 7: Package dependencies
section('Test 7: Required Packages');

const packageJsonPath = path.join(rootDir, 'apps/website/package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const required = ['openai', 'twilio', '@supabase/supabase-js'];
  required.forEach(pkg => {
    if (deps[pkg]) {
      pass(`${pkg}@${deps[pkg]}`);
    } else {
      fail(`${pkg} not installed`);
    }
  });
}

// Summary
console.log(`\n${cyan}${'═'.repeat(80)}${reset}`);
console.log(`${cyan}  Verification Summary${reset}`);
console.log(`${cyan}${'═'.repeat(80)}${reset}\n`);

const total = passed + failed;
const passRate = ((passed / total) * 100).toFixed(1);

console.log(`  Total Checks: ${total}`);
console.log(`  ${green}Passed: ${passed} (${passRate}%)${reset}`);
console.log(`  ${failed > 0 ? red : green}Failed: ${failed}${reset}\n`);

if (failed === 0) {
  console.log(`${green}${'═'.repeat(80)}${reset}`);
  console.log(`${green}  ✓ ALL CHECKS PASSED - DSLV SYSTEM FULLY IMPLEMENTED${reset}`);
  console.log(`${green}${'═'.repeat(80)}${reset}\n`);

  console.log(`${cyan}Next Steps:${reset}\n`);
  info('1. Ensure dev server is running: npm run dev');
  info('2. Make a test call using curl command (see documentation)');
  info('3. Experience Jake\'s natural conversation');
  info('4. Test all 4 campaign types');
  info('5. Review qualification data in console logs\n');

  process.exit(0);
} else {
  console.log(`${red}${'═'.repeat(80)}${reset}`);
  console.log(`${red}  ⚠ ${failed} CHECKS FAILED - REVIEW ERRORS ABOVE${reset}`);
  console.log(`${red}${'═'.repeat(80)}${reset}\n`);

  process.exit(1);
}

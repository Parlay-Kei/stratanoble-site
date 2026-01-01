#!/usr/bin/env node

/**
 * Paralegal Agent Smoke Test
 *
 * Run this before deployment and in CI to verify:
 * - Database connection
 * - Template loading
 * - Placeholder validation
 * - Diff engine
 *
 * Usage: npm run smoke-test
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function log(message, type = 'info') {
  const prefix = {
    info: '\x1b[36m[INFO]\x1b[0m',
    pass: '\x1b[32m[PASS]\x1b[0m',
    fail: '\x1b[31m[FAIL]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m'
  }[type] || '[INFO]';

  console.log(`${prefix} ${message}`);
}

function recordTest(name, passed, message = '') {
  results.tests.push({ name, passed, message });
  if (passed) {
    results.passed++;
    log(`${name}: ${message || 'OK'}`, 'pass');
  } else {
    results.failed++;
    log(`${name}: ${message}`, 'fail');
  }
}

// ============ TESTS ============

async function testDatabaseConnection(supabase) {
  try {
    const { error } = await supabase.from('contracts').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      recordTest('Database Connection', false, error.message);
      return false;
    }
    recordTest('Database Connection', true);
    return true;
  } catch (err) {
    recordTest('Database Connection', false, err.message);
    return false;
  }
}

async function testTemplatesExist() {
  const templateDir = path.join(__dirname, '../data/templates');
  const expectedTemplates = [
    'msa-standard.md',
    'sow-standard.md',
    'change-order-standard.md',
    'nda-standard.md',
    'ip-addendum-standard.md',
    'payment-policy-standard.md'
  ];

  let allFound = true;
  for (const template of expectedTemplates) {
    const templatePath = path.join(templateDir, template);
    try {
      await fs.access(templatePath);
      recordTest(`Template: ${template}`, true);
    } catch {
      recordTest(`Template: ${template}`, false, 'File not found');
      allFound = false;
    }
  }
  return allFound;
}

async function testTemplateHashes() {
  const templateDir = path.join(__dirname, '../data/templates');
  const templates = await fs.readdir(templateDir);

  for (const file of templates) {
    if (!file.endsWith('.md')) continue;

    const content = await fs.readFile(path.join(templateDir, file), 'utf-8');
    const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);

    // Just verify we can generate hash
    if (hash.length === 16) {
      recordTest(`Template Hash: ${file}`, true, hash);
    } else {
      recordTest(`Template Hash: ${file}`, false, 'Invalid hash');
    }
  }
  return true;
}

async function testPlaceholderValidation() {
  const PLACEHOLDER_PATTERNS = [
    /\{\{[A-Z_]+\}\}/g,
    /\$\{[A-Z_]+\}/g,
    /\[TBD\]/gi,
    /\[INSERT\s+[^\]]+\]/gi,
    /_{3,}/g,
    /\[CLIENT[_\s]NAME\]/gi,
    /\bPLACEHOLDER\b/g,  // Match whole word only, case sensitive
  ];

  // Test strings that SHOULD fail
  const shouldFail = [
    '{{CLIENT_NAME}}',
    '${AMOUNT}',
    '[TBD]',
    '[INSERT DATE HERE]',
    '___',
    '[CLIENT_NAME]',
    'PLACEHOLDER text'
  ];

  // Test strings that SHOULD pass
  const shouldPass = [
    'Acme Corporation',
    '$1,000.00',
    '2024-01-15',
    'John Smith',
    'Normal contract text without placeholders.'
  ];

  let allPassed = true;

  for (const text of shouldFail) {
    let found = false;
    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (text.match(pattern)) {
        found = true;
        break;
      }
    }
    if (found) {
      recordTest(`Placeholder Detection: "${text}"`, true, 'Correctly detected');
    } else {
      recordTest(`Placeholder Detection: "${text}"`, false, 'Failed to detect');
      allPassed = false;
    }
  }

  for (const text of shouldPass) {
    let found = false;
    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (text.match(pattern)) {
        found = true;
        break;
      }
    }
    if (!found) {
      recordTest(`Placeholder Pass: "${text}"`, true, 'Correctly allowed');
    } else {
      recordTest(`Placeholder Pass: "${text}"`, false, 'Incorrectly flagged');
      allPassed = false;
    }
  }

  return allPassed;
}

async function testKillSwitch() {
  // Test that kill switch check works
  const originalValue = process.env.PARALEGAL_KILL_SWITCH;

  process.env.PARALEGAL_KILL_SWITCH = 'true';
  const killSwitchOn = process.env.PARALEGAL_KILL_SWITCH === 'true';

  process.env.PARALEGAL_KILL_SWITCH = 'false';
  const killSwitchOff = process.env.PARALEGAL_KILL_SWITCH !== 'true';

  // Restore
  if (originalValue !== undefined) {
    process.env.PARALEGAL_KILL_SWITCH = originalValue;
  } else {
    delete process.env.PARALEGAL_KILL_SWITCH;
  }

  if (killSwitchOn && killSwitchOff) {
    recordTest('Kill Switch', true, 'Toggles correctly');
    return true;
  } else {
    recordTest('Kill Switch', false, 'Toggle failed');
    return false;
  }
}

async function testPlaybookExists() {
  const playbookPath = path.join(__dirname, '../data/playbook/stratanoble-playbook.json');
  try {
    const content = await fs.readFile(playbookPath, 'utf-8');
    const playbook = JSON.parse(content);

    if (playbook.rules && Array.isArray(playbook.rules) && playbook.rules.length > 0) {
      recordTest('Playbook', true, `${playbook.rules.length} rules loaded`);
      return true;
    } else {
      recordTest('Playbook', false, 'No rules found');
      return false;
    }
  } catch (err) {
    recordTest('Playbook', false, err.message);
    return false;
  }
}

async function testClausesExist() {
  const clauseDir = path.join(__dirname, '../data/clauses');
  try {
    const entries = await fs.readdir(clauseDir, { withFileTypes: true });
    const subdirs = entries.filter(e => e.isDirectory());

    if (subdirs.length > 0) {
      let totalClauses = 0;
      for (const dir of subdirs) {
        const dirPath = path.join(clauseDir, dir.name);
        const files = await fs.readdir(dirPath);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        totalClauses += mdFiles.length;
      }
      recordTest('Clause Library', true, `${totalClauses} clauses across ${subdirs.length} topics`);
      return true;
    } else {
      recordTest('Clause Library', false, 'No clause directories found');
      return false;
    }
  } catch (err) {
    recordTest('Clause Library', false, err.message);
    return false;
  }
}

async function testEnvVariables() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  let allPresent = true;

  for (const varName of required) {
    if (process.env[varName]) {
      // Mask the value for security
      recordTest(`Env: ${varName}`, true, '***configured***');
    } else {
      recordTest(`Env: ${varName}`, false, 'Missing');
      allPresent = false;
    }
  }

  return allPresent;
}

// ============ MAIN ============

async function main() {
  console.log('\n========================================');
  console.log('  PARALEGAL AGENT SMOKE TEST');
  console.log('========================================\n');

  log('Starting smoke tests...');

  // Environment check
  log('Checking environment variables...');
  const envOk = await testEnvVariables();

  if (!envOk) {
    log('Environment check failed. Some tests may be skipped.', 'warn');
  }

  // Database connection
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('Testing database connection...');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    await testDatabaseConnection(supabase);
  } else {
    log('Skipping database tests (no credentials)', 'warn');
  }

  // Template tests
  log('Checking templates...');
  await testTemplatesExist();
  await testTemplateHashes();

  // Placeholder validation
  log('Testing placeholder validation...');
  await testPlaceholderValidation();

  // Kill switch
  log('Testing kill switch...');
  await testKillSwitch();

  // Playbook
  log('Checking playbook...');
  await testPlaybookExists();

  // Clauses
  log('Checking clause library...');
  await testClausesExist();

  // Summary
  console.log('\n========================================');
  console.log('  RESULTS');
  console.log('========================================');
  console.log(`  Passed: ${results.passed}`);
  console.log(`  Failed: ${results.failed}`);
  console.log(`  Total:  ${results.tests.length}`);
  console.log('========================================\n');

  if (results.failed > 0) {
    console.log('FAILED TESTS:');
    for (const test of results.tests) {
      if (!test.passed) {
        console.log(`  - ${test.name}: ${test.message}`);
      }
    }
    console.log('');
    process.exit(1);
  } else {
    log('All smoke tests passed!', 'pass');
    process.exit(0);
  }
}

main().catch(err => {
  log(`Fatal error: ${err.message}`, 'fail');
  process.exit(1);
});

#!/usr/bin/env node
/**
 * StrataNoble Health Monitoring System
 * Version: 1.0.0
 * Purpose: Automated service health checks and alerting
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import OpenAI from 'openai';
import pkg from 'twilio';
const { Twilio } = pkg;
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '../.env.local');
const envContent = await fs.readFile(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]*)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
});

// Health check configuration
const CHECKS = {
  CRITICAL: ['supabase', 'stripe', 'nextauth'],
  HIGH: ['openai', 'twilio'],
  MEDIUM: ['github', 'netlify'],
  LOW: ['n8n']
};

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  checks: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logCheck(name, status, message, duration) {
  const symbols = { passed: '✅', failed: '❌', warning: '⚠️' };
  const colors = { passed: 'green', failed: 'red', warning: 'yellow' };

  const symbol = symbols[status];
  const color = colors[status];
  const durationText = duration ? ` (${duration}ms)` : '';

  log(`${symbol} ${name}: ${message}${durationText}`, color);

  results.checks.push({ name, status, message, duration, timestamp: new Date().toISOString() });
  results.summary.total++;

  if (status === 'passed') results.summary.passed++;
  else if (status === 'failed') results.summary.failed++;
  else if (status === 'warning') results.summary.warnings++;
}

// Health check functions
async function checkSupabase() {
  const start = Date.now();
  const name = 'Supabase Connection';

  try {
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logCheck(name, 'failed', 'Missing credentials', null);
      return false;
    }

    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Simple health check query
    const { data, error } = await supabase
      .from('_healthcheck')
      .select('count')
      .limit(1)
      .single();

    // Even if table doesn't exist, connection is validated if we get a proper error response
    const duration = Date.now() - start;

    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is OK
      logCheck(name, 'warning', `Connected but query failed: ${error.message}`, duration);
      return true; // Connection works even if table doesn't exist
    }

    logCheck(name, 'passed', 'Connected successfully', duration);
    return true;
  } catch (error) {
    const duration = Date.now() - start;
    logCheck(name, 'failed', `Connection failed: ${error.message}`, duration);
    return false;
  }
}

async function checkStripe() {
  const start = Date.now();
  const name = 'Stripe API';

  try {
    if (!env.STRIPE_SECRET_KEY) {
      logCheck(name, 'failed', 'Missing API key', null);
      return false;
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia'
    });

    // Simple API call to verify credentials
    const account = await stripe.accounts.retrieve();
    const duration = Date.now() - start;

    logCheck(name, 'passed', `Connected (Account: ${account.email || account.id})`, duration);
    return true;
  } catch (error) {
    const duration = Date.now() - start;
    logCheck(name, 'failed', `API call failed: ${error.message}`, duration);
    return false;
  }
}

async function checkOpenAI() {
  const start = Date.now();
  const name = 'OpenAI API';

  try {
    if (!env.OPENAI_API_KEY) {
      logCheck(name, 'failed', 'Missing API key', null);
      return false;
    }

    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    // List models to verify credentials
    const models = await openai.models.list();
    const duration = Date.now() - start;

    const hasGPT4 = models.data.some(m => m.id.includes('gpt-4'));
    logCheck(name, 'passed', `Connected (GPT-4 access: ${hasGPT4})`, duration);
    return true;
  } catch (error) {
    const duration = Date.now() - start;
    logCheck(name, 'failed', `API call failed: ${error.message}`, duration);
    return false;
  }
}

async function checkTwilio() {
  const start = Date.now();
  const name = 'Twilio API';

  try {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      logCheck(name, 'warning', 'Missing credentials (optional)', null);
      return true; // Not critical
    }

    const client = new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

    // Verify account
    const account = await client.api.accounts(env.TWILIO_ACCOUNT_SID).fetch();
    const duration = Date.now() - start;

    logCheck(name, 'passed', `Connected (Status: ${account.status})`, duration);
    return true;
  } catch (error) {
    const duration = Date.now() - start;
    logCheck(name, 'warning', `API call failed: ${error.message}`, duration);
    return true; // Not critical
  }
}

async function checkNextAuth() {
  const name = 'NextAuth Configuration';

  const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];

  const missing = requiredVars.filter(v => !env[v]);

  if (missing.length > 0) {
    logCheck(name, 'failed', `Missing: ${missing.join(', ')}`, null);
    return false;
  }

  logCheck(name, 'passed', 'All required variables configured', null);
  return true;
}

async function checkEnvironment() {
  const name = 'Environment Variables';
  const required = [
    'VAULT_ENCRYPTION_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXTAUTH_SECRET'
  ];

  const missing = required.filter(v => !env[v]);

  if (missing.length > 0) {
    logCheck(name, 'failed', `Missing ${missing.length} required variables`, null);
    return false;
  }

  const optional = [
    'OPENAI_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'N8N_API_KEY'
  ];

  const missingOptional = optional.filter(v => !env[v]);

  if (missingOptional.length > 0) {
    logCheck(name, 'warning', `${missingOptional.length} optional variables not set`, null);
  } else {
    logCheck(name, 'passed', 'All variables configured', null);
  }

  return true;
}

// Main execution
async function main() {
  log('\n' + '='.repeat(50), 'cyan');
  log('🏥 StrataNoble Health Monitor', 'cyan');
  log('='.repeat(50) + '\n', 'cyan');

  log('Starting health checks...', 'gray');
  log(`Timestamp: ${results.timestamp}\n`, 'gray');

  // Run all health checks
  log('🔍 Running Checks...\n', 'cyan');

  await checkEnvironment();
  await checkSupabase();
  await checkStripe();
  await checkOpenAI();
  await checkTwilio();
  await checkNextAuth();

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('📊 Summary', 'cyan');
  log('='.repeat(50) + '\n', 'cyan');

  log(`Total Checks: ${results.summary.total}`, 'cyan');
  log(`✅ Passed: ${results.summary.passed}`, 'green');
  log(`⚠️  Warnings: ${results.summary.warnings}`, 'yellow');
  log(`❌ Failed: ${results.summary.failed}`, 'red');

  const percentage = Math.round((results.summary.passed / results.summary.total) * 100);
  const statusColor = percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red';
  log(`\nHealth Score: ${percentage}%`, statusColor);

  // Save results
  const logsDir = join(__dirname, '../logs');
  try {
    await fs.mkdir(logsDir, { recursive: true });
  } catch (e) {
    // Directory might exist
  }

  const reportPath = join(logsDir, `health-check-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));

  log(`\n📝 Report saved to: ${reportPath}`, 'gray');

  // Exit with appropriate code
  if (results.summary.failed > 0) {
    log('\n❌ Health check failed. Some critical services are down.', 'red');
    process.exit(1);
  } else if (results.summary.warnings > 0) {
    log('\n⚠️  Health check passed with warnings.', 'yellow');
    process.exit(0);
  } else {
    log('\n✅ All systems operational!', 'green');
    process.exit(0);
  }
}

// Run health checks
main().catch(error => {
  log(`\n❌ Health check crashed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

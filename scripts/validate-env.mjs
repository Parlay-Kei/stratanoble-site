#!/usr/bin/env node
/**
 * Environment Configuration Validator
 * Quick check to ensure all required environment variables are configured
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

console.log(`\n${CYAN}${'='.repeat(60)}${RESET}`);
console.log(`${CYAN}🔍 StrataNoble Environment Validator${RESET}`);
console.log(`${CYAN}${'='.repeat(60)}${RESET}\n`);

// Load .env.local
const envPath = join(__dirname, '../apps/website/.env.local');
console.log(`📄 Reading: ${envPath}\n`);

let envContent;
try {
  envContent = await fs.readFile(envPath, 'utf-8');
} catch (error) {
  console.log(`${RED}❌ Failed to read .env.local: ${error.message}${RESET}`);
  process.exit(1);
}

// Parse environment variables
const env = {};
envContent.split('\n').forEach(line => {
  // Skip comments and empty lines
  if (line.trim().startsWith('#') || !line.trim()) return;

  const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    env[key] = value;
  }
});

console.log(`${CYAN}Found ${Object.keys(env).length} environment variables${RESET}\n`);

// Define required variables
const requiredVars = {
  'Database & Auth': [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ],
  'Payments': [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ],
  'Authentication': [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ],
  'AI & Voice': [
    'OPENAI_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'ELEVENLABS_API_KEY',
    'DEEPGRAM_API_KEY'
  ],
  'Security': [
    'VAULT_ENCRYPTION_KEY'
  ]
};

const optionalVars = {
  'Optional Services': [
    'N8N_API_KEY',
    'N8N_WEBHOOK_SECRET',
    'N8N_LICENSE_KEY',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY'
  ]
};

// Check each category
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
let warningChecks = 0;

console.log(`${CYAN}Required Variables:${RESET}\n`);

for (const [category, vars] of Object.entries(requiredVars)) {
  console.log(`${CYAN}${category}:${RESET}`);

  for (const varName of vars) {
    totalChecks++;
    const value = env[varName];

    if (value && value !== '' && value !== '...' && !value.startsWith('YOUR_')) {
      console.log(`  ${GREEN}✅ ${varName}${RESET}`);
      passedChecks++;
    } else {
      console.log(`  ${RED}❌ ${varName} - Missing or placeholder${RESET}`);
      failedChecks++;
    }
  }
  console.log('');
}

// Check optional variables
console.log(`${CYAN}Optional Variables:${RESET}\n`);

for (const [category, vars] of Object.entries(optionalVars)) {
  console.log(`${CYAN}${category}:${RESET}`);

  for (const varName of vars) {
    const value = env[varName];

    if (value && value !== '' && value !== '...' && !value.startsWith('YOUR_')) {
      console.log(`  ${GREEN}✅ ${varName}${RESET}`);
    } else {
      console.log(`  ${YELLOW}⚠️  ${varName} - Not configured (optional)${RESET}`);
      warningChecks++;
    }
  }
  console.log('');
}

// Summary
console.log(`${CYAN}${'='.repeat(60)}${RESET}`);
console.log(`${CYAN}📊 Summary${RESET}`);
console.log(`${CYAN}${'='.repeat(60)}${RESET}\n`);

const percentage = Math.round((passedChecks / totalChecks) * 100);
const statusColor = percentage >= 90 ? GREEN : percentage >= 70 ? YELLOW : RED;

console.log(`Total Required Checks: ${totalChecks}`);
console.log(`${GREEN}✅ Passed: ${passedChecks}${RESET}`);
console.log(`${RED}❌ Failed: ${failedChecks}${RESET}`);
console.log(`${YELLOW}⚠️  Optional Not Configured: ${warningChecks}${RESET}`);
console.log(`${statusColor}\nConfiguration Level: ${percentage}%${RESET}\n`);

// Status message
if (failedChecks === 0) {
  console.log(`${GREEN}✅ All required environment variables are configured!${RESET}`);
  console.log(`${GREEN}✅ System is ready for autonomous development.${RESET}\n`);
  process.exit(0);
} else {
  console.log(`${RED}❌ ${failedChecks} required variable(s) missing.${RESET}`);
  console.log(`${YELLOW}⚠️  Please configure missing variables before proceeding.${RESET}\n`);
  process.exit(1);
}

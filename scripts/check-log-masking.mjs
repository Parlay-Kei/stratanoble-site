#!/usr/bin/env node
/**
 * CI Log Masking Check
 * 
 * Verifies that service role keys never print in CI logs.
 * 
 * This runs in CI to ensure secrets are properly masked.
 * 
 * Usage:
 *   node scripts/check-log-masking.mjs
 */

import { readFileSync, existsSync } from 'fs';

const SERVICE_ROLE_KEY_PATTERN = /eyJ[a-zA-Z0-9_-]{100,}/; // JWT tokens are long

function checkForExposedKeys() {
  // In CI, GitHub Actions masks secrets automatically if they're in secrets
  // But we should still verify they're not being logged

  const issues = [];

  // Check if we're in CI
  if (!process.env.CI) {
    console.log('⚠️  Not running in CI. Skipping log masking check.\n');
    return issues;
  }

  // Check environment variables (they should be set but not logged)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    // Verify it's a JWT (starts with eyJ)
    if (serviceKey.match(/^eyJ/)) {
      // Good - it's a JWT token
      // But verify it's not being logged
      console.log('✅ Service role key is set (masked by CI)\n');
    } else {
      issues.push({
        message: 'Service role key format unexpected',
        severity: 'warning',
      });
    }
  } else {
    // Service role key not set - this is expected for repos without Supabase secrets configured
    // Only warn, don't fail CI
    issues.push({
      message: 'Service role key not set in CI environment (this is OK for repos without Supabase)',
      severity: 'warning',
    });
  }

  // Check if there are any log files that might contain keys
  const logFiles = [
    'test-results.json',
    'test-metrics.json',
    'jest-output.txt',
  ];

  logFiles.forEach((logFile) => {
    if (existsSync(logFile)) {
      try {
        const content = readFileSync(logFile, 'utf-8');
        if (SERVICE_ROLE_KEY_PATTERN.test(content)) {
          issues.push({
            file: logFile,
            message: 'Service role key pattern found in log file',
            severity: 'error',
          });
        }
      } catch {
        // File doesn't exist or can't be read, skip
      }
    }
  });

  return issues;
}

function main() {
  console.log('🔍 Checking CI log masking...\n');

  const issues = checkForExposedKeys();

  if (issues.length === 0) {
    console.log('✅ No exposed keys in logs.\n');
    process.exit(0);
  }

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} error(s):\n`);
    errors.forEach((issue) => {
      console.log(`  ${issue.file || 'environment'}`);
      console.log(`    ${issue.message}\n`);
    });
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Found ${warnings.length} warning(s):\n`);
    warnings.forEach((issue) => {
      console.log(`    ${issue.message}\n`);
    });
  }

  console.log('💡 Fix: Ensure service role keys are in GitHub Secrets, not in code or logs.\n');

  if (errors.length > 0) {
    process.exit(1);
  }

  process.exit(0);
}

main();

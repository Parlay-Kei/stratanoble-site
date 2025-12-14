#!/usr/bin/env node
/**
 * Integration Harness Usage Check
 * 
 * Ensures all integration tests use the integration harness.
 * This is the "one true door" - no bypasses allowed.
 * 
 * Usage: node scripts/check-integration-harness-usage.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const INTEGRATION_TEST_PATTERNS = [
  '**/integration.test.*',
  '**/tests/**/*.test.*',
];

const REQUIRED_IMPORT = '@/lib/test/integration';

function findIntegrationTestFiles(dir, fileList = []) {
  if (!statSync(dir).isDirectory()) {
    return fileList;
  }

  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Skip unit test directories
      if (file.includes('__tests__') && !file.includes('integration')) {
        return;
      }
      findIntegrationTestFiles(filePath, fileList);
    } else if (
      (file.includes('integration.test') || 
       (file.endsWith('.test.ts') && filePath.includes('tests/'))) &&
      !filePath.includes('__tests__') &&
      !filePath.includes('integration-contract.test') // Contract test is special
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const issues = [];

  // Check if it imports from integration harness
  const hasHarnessImport = new RegExp(
    `(?:import|from)\\s+['"]${REQUIRED_IMPORT.replace(/\//g, '\\/')}['"]`,
    'gi'
  ).test(content);

  // Check for direct DB imports (bypass attempts)
  const directDbImports = [
    /from\s+['"]@\/lib\/test\/db-reset['"]/,
    /from\s+['"]@supabase\/supabase-js['"]/,
    /createClient\s*\(/,
  ];

  const hasDirectDbAccess = directDbImports.some((pattern) => pattern.test(content));

  if (!hasHarnessImport && hasDirectDbAccess) {
    issues.push({
      file: filePath,
      message: 'Integration test bypasses harness. Must import from @/lib/test/integration',
      severity: 'error',
    });
  } else if (!hasHarnessImport) {
    // Soft warning - might be a test that doesn't need DB
    issues.push({
      file: filePath,
      message: 'Integration test should use integration harness for consistency',
      severity: 'warning',
    });
  }

  return issues;
}

function main() {
  console.log('🔍 Checking integration harness usage...\n');

  const testDirs = [
    'apps/website/tests',
    'apps/website/src/lib/test',
  ];

  const allIssues = [];
  testDirs.forEach((dir) => {
    try {
      const testFiles = findIntegrationTestFiles(dir);
      testFiles.forEach((file) => {
        const issues = checkFile(file);
        allIssues.push(...issues);
      });
    } catch (error) {
      // Directory doesn't exist, skip
    }
  });

  const errors = allIssues.filter((i) => i.severity === 'error');
  const warnings = allIssues.filter((i) => i.severity === 'warning');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All integration tests use the integration harness.\n');
    process.exit(0);
  }

  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} error(s):\n`);
    errors.forEach((issue) => {
      console.log(`  ${issue.file}`);
      console.log(`    ${issue.message}\n`);
    });
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Found ${warnings.length} warning(s):\n`);
    warnings.forEach((issue) => {
      console.log(`  ${issue.file}`);
      console.log(`    ${issue.message}\n`);
    });
  }

  console.log('💡 Fix: Import from @/lib/test/integration in all integration tests\n');

  // Exit with error if there are critical issues
  if (errors.length > 0) {
    process.exit(1);
  }

  process.exit(0);
}

main();

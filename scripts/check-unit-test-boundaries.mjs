#!/usr/bin/env node
/**
 * Unit Test Boundary Check
 * 
 * Ensures unit tests never import DB utilities.
 * This keeps unit tests fast and prevents coupling.
 * 
 * Usage: node scripts/check-unit-test-boundaries.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const UNIT_TEST_PATTERNS = [
  '**/__tests__/**/*.test.ts',
  '**/__tests__/**/*.test.tsx',
  '**/*.test.ts',
  '**/*.test.tsx',
];

const FORBIDDEN_IMPORTS = [
  '@/lib/test/db-reset',
  '@/lib/test/factories',
  '@/lib/test/integration', // Integration harness is for integration tests only
  '@supabase/supabase-js',
  'db-reset',
  'test/factories',
  'test/integration',
];

function findUnitTestFiles(dir, fileList = []) {
  if (!statSync(dir).isDirectory()) {
    return fileList;
  }

  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Skip integration test directories
      if (file.includes('integration') || file.includes('e2e')) {
        return;
      }
      findUnitTestFiles(filePath, fileList);
    } else if (
      (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) &&
      !file.includes('integration') &&
      !filePath.includes('integration') &&
      !filePath.includes('e2e')
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const issues = [];

  // Skip checking the integration harness itself
  if (filePath.includes('integration/index.ts') || filePath.includes('db-reset.ts')) {
    return issues;
  }

  // Check for forbidden imports
  FORBIDDEN_IMPORTS.forEach((forbidden) => {
    const importPattern = new RegExp(
      `(?:import|require|from)\\s+['"]${forbidden.replace(/\//g, '\\/')}['"]`,
      'gi'
    );

    if (importPattern.test(content)) {
      const matches = content.matchAll(importPattern);
      for (const match of matches) {
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length;
        issues.push({
          file: filePath,
          line: lineNumber,
          message: `Unit test imports DB utility: ${forbidden}. Use integration harness for integration tests.`,
          code: match[0],
        });
      }
    }
  });

  return issues;
}

function main() {
  console.log('🔍 Checking unit test boundaries (no DB imports)...\n');

  const testDirs = [
    'apps/website/src/__tests__',
    'apps/website/__tests__',
    'apps/platform/src/__tests__',
    'packages/utils/src/__tests__',
  ];

  const allIssues = [];
  testDirs.forEach((dir) => {
    try {
      const testFiles = findUnitTestFiles(dir);
      testFiles.forEach((file) => {
        const issues = checkFile(file);
        allIssues.push(...issues);
      });
    } catch (error) {
      // Directory doesn't exist, skip
    }
  });

  if (allIssues.length === 0) {
    console.log('✅ Unit tests maintain strict boundaries. No DB imports found.\n');
    process.exit(0);
  } else {
    console.log(`❌ Found ${allIssues.length} boundary violation(s):\n`);
    allIssues.forEach((issue) => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.message}`);
      console.log(`    Code: ${issue.code}\n`);
    });
    console.log('💡 Fix: Remove DB imports from unit tests. Use mocks instead.\n');
    process.exit(1);
  }
}

main();

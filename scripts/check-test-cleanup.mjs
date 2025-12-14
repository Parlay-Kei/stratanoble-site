#!/usr/bin/env node
/**
 * Check for raw database cleanup patterns in test files
 * 
 * This script scans test files for patterns that should use db-reset.ts instead:
 * - .delete().eq( in afterAll/beforeEach
 * - Direct TRUNCATE calls
 * - Raw cleanup code
 * 
 * Usage: node scripts/check-test-cleanup.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const FORBIDDEN_PATTERNS = [
  {
    pattern: /\.delete\(\)\.eq\(/,
    message: 'Raw .delete().eq() cleanup - use testReset() from db-reset.ts instead',
  },
  {
    pattern: /\.delete\(\)\.neq\(/,
    message: 'Raw .delete().neq() cleanup (workaround attempt) - use testReset() from db-reset.ts instead',
  },
  {
    pattern: /TRUNCATE\s+TABLE/i,
    message: 'Raw TRUNCATE - use testReset() from db-reset.ts instead',
  },
  {
    pattern: /\.from\(['"](.*?)['"]\)\.delete\(\)/,
    message: 'Direct .from().delete() cleanup - use testReset() from db-reset.ts instead',
  },
  {
    pattern: /supabase\.from\([^)]+\)\.delete\(\)/,
    message: 'Supabase client .delete() cleanup - use testReset() from db-reset.ts instead',
  },
];

const TEST_DIRS = [
  'apps/website/tests',
  'apps/website/__tests__',
  'apps/achievery-mobile/tests',
  'tests',
];

function findTestFiles(dir, fileList = []) {
  if (!statSync(dir).isDirectory()) {
    return fileList;
  }

  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findTestFiles(filePath, fileList);
    } else if (
      file.endsWith('.test.ts') ||
      file.endsWith('.test.tsx') ||
      file.endsWith('.test.js') ||
      file.endsWith('.spec.ts') ||
      file.endsWith('.spec.tsx') ||
      file.endsWith('.spec.js')
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const issues = [];

  // Only check in afterAll, beforeEach, afterEach, or cleanup functions
  const cleanupContexts = [
    /afterAll\s*\([^)]*\)\s*\{[\s\S]*?\}/g,
    /beforeEach\s*\([^)]*\)\s*\{[\s\S]*?\}/g,
    /afterEach\s*\([^)]*\)\s*\{[\s\S]*?\}/g,
    /cleanup\s*\([^)]*\)\s*\{[\s\S]*?\}/g,
    /teardown\s*\([^)]*\)\s*\{[\s\S]*?\}/g,
  ];

  cleanupContexts.forEach((contextRegex) => {
    const matches = content.matchAll(contextRegex);
    for (const match of matches) {
      const contextCode = match[0];
      FORBIDDEN_PATTERNS.forEach(({ pattern, message }) => {
        if (pattern.test(contextCode)) {
          // Find line number
          const beforeMatch = content.substring(0, match.index);
          const lineNumber = beforeMatch.split('\n').length;
          issues.push({
            file: filePath,
            line: lineNumber,
            message,
            code: contextCode.split('\n').slice(0, 3).join('\n').trim(),
          });
        }
      });
    }
  });

  return issues;
}

function main() {
  console.log('🔍 Checking for raw database cleanup patterns in test files...\n');

  const allIssues = [];
  TEST_DIRS.forEach((dir) => {
    try {
      const testFiles = findTestFiles(dir);
      testFiles.forEach((file) => {
        const issues = checkFile(file);
        allIssues.push(...issues);
      });
    } catch (error) {
      // Directory doesn't exist, skip
    }
  });

  if (allIssues.length === 0) {
    console.log('✅ No raw cleanup patterns found. All tests use db-reset.ts!\n');
    process.exit(0);
  } else {
    console.log(`❌ Found ${allIssues.length} issue(s):\n`);
    allIssues.forEach((issue) => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.message}`);
      console.log(`    Code: ${issue.code.substring(0, 100)}...\n`);
    });
    console.log('\n💡 Fix: Use testReset() from @/lib/test/db-reset.ts instead\n');
    process.exit(1);
  }
}

main();

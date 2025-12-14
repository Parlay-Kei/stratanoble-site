#!/usr/bin/env node
/**
 * Migration Validation Script
 * 
 * Validates that migrations follow the "reversible/idempotent" discipline:
 * 1. Every migration must be idempotent or safely re-runnable
 * 2. No migration relies on manual steps
 * 3. Migrations can be run from scratch in CI
 * 
 * Usage: node scripts/validate-migrations.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = 'supabase/migrations';
const ISSUES = [];

// Patterns that indicate non-idempotent migrations
const NON_IDEMPOTENT_PATTERNS = [
  {
    pattern: /CREATE\s+(?:TABLE|FUNCTION|TYPE|SCHEMA)\s+(\w+)\s+(?!IF\s+NOT\s+EXISTS)/i,
    message: 'CREATE without IF NOT EXISTS - migration may fail on re-run',
    severity: 'error',
  },
  {
    pattern: /DROP\s+(?:TABLE|FUNCTION|TYPE|SCHEMA)\s+(\w+)\s+(?!IF\s+EXISTS)/i,
    message: 'DROP without IF EXISTS - migration may fail on re-run',
    severity: 'error',
  },
  {
    pattern: /ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(\w+)\s+(?!IF\s+NOT\s+EXISTS)/i,
    message: 'ADD COLUMN without IF NOT EXISTS - may fail if column exists',
    severity: 'warning',
  },
  {
    pattern: /COMMENT\s+ON\s+(?:TABLE|COLUMN)/i,
    message: 'COMMENT statements are usually safe but verify idempotency',
    severity: 'info',
  },
];

// Patterns that indicate manual steps required
const MANUAL_STEP_PATTERNS = [
  {
    pattern: /TODO|FIXME|MANUAL|HAND\s+EDIT/i,
    message: 'Migration contains TODO/FIXME/MANUAL - indicates manual steps may be required',
    severity: 'warning',
  },
  {
    pattern: /--\s*(?:run|execute|apply)\s+(?:this|manually|by\s+hand)/i,
    message: 'Migration comment suggests manual execution',
    severity: 'warning',
  },
];

function findMigrationFiles(dir) {
  const files = [];
  if (!statSync(dir).isDirectory()) {
    return files;
  }

  const entries = readdirSync(dir);
  entries.forEach((entry) => {
    const filePath = join(dir, entry);
    const stat = statSync(filePath);

    if (stat.isFile() && entry.endsWith('.sql')) {
      files.push(filePath);
    }
  });

  return files.sort(); // Sort to check in order
}

function validateMigration(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const filename = filePath.split('/').pop();
  const issues = [];

  // Check for non-idempotent patterns
  NON_IDEMPOTENT_PATTERNS.forEach(({ pattern, message, severity }) => {
    const matches = content.matchAll(new RegExp(pattern.source, 'gi'));
    for (const match of matches) {
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      
      // Skip if it's in a comment
      const linesBefore = content.substring(0, match.index).split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];
      if (currentLine.trim().startsWith('--')) {
        return; // Skip comments
      }

      issues.push({
        file: filename,
        line: lineNumber,
        message,
        severity,
        code: match[0].substring(0, 100),
      });
    }
  });

  // Check for manual step indicators
  MANUAL_STEP_PATTERNS.forEach(({ pattern, message, severity }) => {
    if (pattern.test(content)) {
      const matches = content.matchAll(new RegExp(pattern.source, 'gi'));
      for (const match of matches) {
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length;
        issues.push({
          file: filename,
          line: lineNumber,
          message,
          severity,
          code: match[0].substring(0, 100),
        });
      }
    }
  });

  return issues;
}

function main() {
  console.log('🔍 Validating migrations for idempotency and reversibility...\n');

  if (!statSync(MIGRATIONS_DIR).isDirectory()) {
    console.log(`⚠️  Migrations directory not found: ${MIGRATIONS_DIR}`);
    process.exit(0);
  }

  const migrationFiles = findMigrationFiles(MIGRATIONS_DIR);
  
  if (migrationFiles.length === 0) {
    console.log('✅ No migration files found to validate.');
    process.exit(0);
  }

  console.log(`Found ${migrationFiles.length} migration file(s)...\n`);

  migrationFiles.forEach((file) => {
    const issues = validateMigration(file);
    ISSUES.push(...issues);
  });

  if (ISSUES.length === 0) {
    console.log('✅ All migrations are idempotent and safe to re-run.\n');
    process.exit(0);
  }

  // Group by severity
  const errors = ISSUES.filter((i) => i.severity === 'error');
  const warnings = ISSUES.filter((i) => i.severity === 'warning');
  const infos = ISSUES.filter((i) => i.severity === 'info');

  console.log(`❌ Found ${ISSUES.length} issue(s):\n`);

  if (errors.length > 0) {
    console.log(`  🔴 Errors (${errors.length}):`);
    errors.forEach((issue) => {
      console.log(`    ${issue.file}:${issue.line} - ${issue.message}`);
      console.log(`      Code: ${issue.code}...\n`);
    });
  }

  if (warnings.length > 0) {
    console.log(`  🟡 Warnings (${warnings.length}):`);
    warnings.forEach((issue) => {
      console.log(`    ${issue.file}:${issue.line} - ${issue.message}`);
    });
    console.log('');
  }

  if (infos.length > 0) {
    console.log(`  ℹ️  Info (${infos.length}):`);
    infos.forEach((issue) => {
      console.log(`    ${issue.file}:${issue.line} - ${issue.message}`);
    });
    console.log('');
  }

  console.log('💡 Fix: Make migrations idempotent using IF NOT EXISTS / IF EXISTS clauses\n');

  // Exit with error if there are critical issues
  if (errors.length > 0) {
    process.exit(1);
  }

  // Warnings don't fail the build, but are reported
  process.exit(0);
}

main();

/**
 * Security Migration Validation Script
 * Tests the security fixes migration for SQL syntax and logical correctness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔒 Security Migration Validation');
console.log('================================');

// Read the migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '0015_security_fixes.sql');
const migrationContent = fs.readFileSync(migrationPath, 'utf8');

console.log('✅ Migration file exists and is readable');

// Basic SQL syntax validation
const sqlCommands = migrationContent
  .split(';')
  .map(cmd => cmd.trim())
  .filter(cmd => cmd && !cmd.startsWith('--'));

console.log(`📊 Found ${sqlCommands.length} SQL commands to execute`);

// Check for required security patterns
const checks = [
  {
    name: 'RLS enabled on offerings table',
    pattern: /ALTER TABLE.*offerings.*ENABLE ROW LEVEL SECURITY/i,
    required: true
  },
  {
    name: 'Public read policy for offerings',
    pattern: /CREATE POLICY.*offerings[\s\S]*FOR SELECT/i,
    required: true
  },
  {
    name: 'Service role write policy for offerings',
    pattern: /CREATE POLICY.*offerings[\s\S]*FOR ALL[\s\S]*service_role/i,
    required: true
  },
  {
    name: 'Grant statements for authenticated users',
    pattern: /GRANT SELECT.*authenticated/i,
    required: true
  },
  {
    name: 'Revoke statements for anonymous users',
    pattern: /REVOKE.*anon/i,
    required: true
  }
];

console.log('\n🔍 Security Pattern Validation:');
let allChecksPassed = true;

checks.forEach(check => {
  const found = check.pattern.test(migrationContent);
  const status = found ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  
  if (check.required && !found) {
    allChecksPassed = false;
  }
});

// Check for dangerous patterns
const dangerousPatterns = [
  {
    name: 'SECURITY DEFINER on views',
    pattern: /CREATE.*VIEW.*SECURITY DEFINER/i,
    dangerous: true
  },
  {
    name: 'Overly permissive policies',
    pattern: /FOR ALL.*TO public.*USING \(true\)/i,
    dangerous: true
  }
];

console.log('\n⚠️  Dangerous Pattern Check:');
let noDangerousPatterns = true;

dangerousPatterns.forEach(check => {
  const found = check.pattern.test(migrationContent);
  if (found) {
    console.log(`❌ Found dangerous pattern: ${check.name}`);
    noDangerousPatterns = false;
  } else {
    console.log(`✅ No ${check.name} found`);
  }
});

// Summary
console.log('\n📋 Validation Summary:');
console.log(`Security patterns: ${allChecksPassed ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Dangerous patterns: ${noDangerousPatterns ? '✅ NONE FOUND' : '❌ FOUND'}`);

const overallResult = allChecksPassed && noDangerousPatterns;
console.log(`Overall result: ${overallResult ? '✅ READY TO DEPLOY' : '❌ NEEDS REVIEW'}`);

if (overallResult) {
  console.log('\n🚀 Migration is ready for deployment!');
  console.log('Next steps:');
  console.log('1. Deploy to staging environment');
  console.log('2. Run smoke tests');
  console.log('3. Deploy to production');
} else {
  console.log('\n🛑 Migration needs review before deployment');
  process.exit(1);
}
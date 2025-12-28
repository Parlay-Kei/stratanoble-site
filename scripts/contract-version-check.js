#!/usr/bin/env node

/**
 * Contract Version Validation Script
 * Ensures contract versioning follows SOP rules
 */

const fs = require('fs');
const path = require('path');

const ERRORS = [];
const WARNINGS = [];

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
}

function validateVersionFormat(version) {
  // SOP requires versioning like user.created.v1 to user.created.v2
  const versionPattern = /^.+\.v\d+$/;
  return versionPattern.test(version);
}

function checkBreakingChanges(oldContract, newContract) {
  // Basic breaking change detection
  // In a real implementation, this would use TypeScript compiler API
  // For now, we'll do basic structural checks

  const oldKeys = Object.keys(oldContract);
  const newKeys = Object.keys(newContract);

  // Check for removed fields (breaking)
  const removedFields = oldKeys.filter(key => !newKeys.includes(key));
  if (removedFields.length > 0) {
    return { breaking: true, changes: removedFields.map(f => `Removed: ${f}`) };
  }

  // Check for type changes (simplified)
  for (const key of oldKeys) {
    if (newKeys.includes(key)) {
      const oldType = typeof oldContract[key];
      const newType = typeof newContract[key];
      if (oldType !== newType && oldType !== 'undefined' && newType !== 'undefined') {
        return { breaking: true, changes: [`Type change: ${key} from ${oldType} to ${newType}`] };
      }
    }
  }

  return { breaking: false, changes: [] };
}

function validateContractVersions() {
  log('Validating contract versions across all modules');

  const modulesDir = path.join(process.cwd(), 'src', 'modules');
  if (!fs.existsSync(modulesDir)) {
    ERRORS.push('Modules directory not found');
    return;
  }

  const modules = fs.readdirSync(modulesDir).filter(item =>
    fs.statSync(path.join(modulesDir, item)).isDirectory()
  );

  for (const moduleName of modules) {
    const contractsDir = path.join(modulesDir, moduleName, 'contracts');
    if (!fs.existsSync(contractsDir)) {
      WARNINGS.push(`${moduleName}: No contracts directory found`);
      continue;
    }

    const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

    for (const file of files) {
      const filePath = path.join(contractsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract versioned identifiers
      const versionMatches = content.match(/['"`]([^'"`]*\.v\d+)['"`]/g);
      if (versionMatches) {
        for (const match of versionMatches) {
          const versionedId = match.replace(/['"`]/g, '');
          if (!validateVersionFormat(versionedId)) {
            ERRORS.push(`${moduleName}/${file}: Invalid version format: ${versionedId}`);
          }
        }
        log(`${moduleName}/${file}: Found ${versionMatches.length} versioned identifiers`);
      }
    }
  }
}

function checkVersionConsistency() {
  log('Checking version consistency across contracts');

  // This would check that related contracts use compatible versions
  // For now, we'll do a basic check that all contracts use v1 as baseline

  const modulesDir = path.join(process.cwd(), 'src', 'modules');
  if (!fs.existsSync(modulesDir)) return;

  const modules = fs.readdirSync(modulesDir).filter(item =>
    fs.statSync(path.join(modulesDir, item)).isDirectory()
  );

  let totalContracts = 0;
  let v1Contracts = 0;

  for (const moduleName of modules) {
    const contractsDir = path.join(modulesDir, moduleName, 'contracts');
    if (!fs.existsSync(contractsDir)) continue;

    const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

    for (const file of files) {
      const filePath = path.join(contractsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      totalContracts++;
      if (content.includes('.v1')) {
        v1Contracts++;
      }
    }
  }

  if (totalContracts > 0) {
    const v1Percentage = (v1Contracts / totalContracts) * 100;
    log(`Version consistency: ${v1Contracts}/${totalContracts} contracts use v1 (${v1Percentage.toFixed(1)}%)`);

    if (v1Percentage < 80) {
      WARNINGS.push(`Low v1 adoption: Only ${v1Percentage.toFixed(1)}% of contracts use v1 versioning`);
    }
  }
}

function validateVersionComments() {
  log('Validating version comments in contracts');

  const modulesDir = path.join(process.cwd(), 'src', 'modules');
  if (!fs.existsSync(modulesDir)) return;

  const modules = fs.readdirSync(modulesDir).filter(item =>
    fs.statSync(path.join(modulesDir, item)).isDirectory()
  );

  for (const moduleName of modules) {
    const contractsDir = path.join(modulesDir, moduleName, 'contracts');
    if (!fs.existsSync(contractsDir)) continue;

    const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

    for (const file of files) {
      const filePath = path.join(contractsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for version comment
      const versionCommentPattern = /\/\/.*[Vv]ersion:/;
      if (!versionCommentPattern.test(content)) {
        WARNINGS.push(`${moduleName}/${file}: Missing version comment`);
      }

      // Check for contract comment
      const contractCommentPattern = /\/\/.*[Cc]ontract/;
      if (!contractCommentPattern.test(content)) {
        WARNINGS.push(`${moduleName}/${file}: Missing contract identification comment`);
      }
    }
  }
}

function main() {
  log('Starting contract version validation');

  validateContractVersions();
  checkVersionConsistency();
  validateVersionComments();

  // Summary
  log(`Validation complete: ${ERRORS.length} errors, ${WARNINGS.length} warnings`);

  if (ERRORS.length > 0) {
    console.log('\n🚨 ERRORS:');
    ERRORS.forEach(error => console.log(`  - ${error}`));
  }

  if (WARNINGS.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    WARNINGS.forEach(warning => console.log(`  - ${warning}`));
  }

  if (ERRORS.length > 0) {
    log('Contract version validation FAILED');
    process.exit(1);
  } else {
    log('Contract version validation PASSED');
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateVersionFormat, checkBreakingChanges };

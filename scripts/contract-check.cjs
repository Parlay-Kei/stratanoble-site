#!/usr/bin/env node

/**
 * Contract Validation Script
 * Validates API contracts, event contracts, and data contracts per SOP
 */

const fs = require('fs');
const path = require('path');

const CONTRACTS_DIR = 'src/modules/*/contracts';
const ERRORS = [];
const WARNINGS = [];

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
}

function validateApiContract(moduleName, apiContract) {
  log(`Validating API contract for module: ${moduleName}`);

  // Check required interfaces
  const requiredInterfaces = ['Request', 'Response'];
  const interfaces = Object.keys(apiContract).filter(key =>
    key.endsWith('Request') || key.endsWith('Response') || key.endsWith('Error')
  );

  for (const required of requiredInterfaces) {
    const found = interfaces.some(intf => intf.includes(required));
    if (!found) {
      ERRORS.push(`${moduleName}: Missing required interface pattern: *${required}`);
    }
  }

  // Check for error types
  if (!apiContract.AuthError && !apiContract.ApiError) {
    WARNINGS.push(`${moduleName}: No error types defined in API contract`);
  }

  // Validate versioning in comments
  const content = fs.readFileSync(apiContract.__filePath, 'utf8');
  if (!content.includes('Version:')) {
    WARNINGS.push(`${moduleName}: API contract missing version information`);
  }
}

function validateEventContract(moduleName, eventContract) {
  log(`Validating event contract for module: ${moduleName}`);

  // Check for event versioning
  const events = Object.keys(eventContract).filter(key => key.endsWith('Event'));
  for (const event of events) {
    if (!eventContract[event].eventName) {
      ERRORS.push(`${moduleName}: Event ${event} missing eventName field`);
    }
    if (!eventContract[event].eventName.includes('.v1')) {
      WARNINGS.push(`${moduleName}: Event ${event} should use v1 versioning`);
    }
  }

  // Check required event fields
  const requiredFields = ['eventId', 'timestamp', 'correlationId', 'payload'];
  for (const event of events) {
    for (const field of requiredFields) {
      if (!eventContract[event][field]) {
        ERRORS.push(`${moduleName}: Event ${event} missing required field: ${field}`);
      }
    }
  }
}

function validateDataContract(moduleName, dataContract) {
  log(`Validating data contract for module: ${moduleName}`);

  // Check for table interfaces
  const tables = Object.keys(dataContract).filter(key =>
    !key.includes('Query') && !key.includes('Data') && key[0] === key[0].toUpperCase()
  );

  if (tables.length === 0) {
    WARNINGS.push(`${moduleName}: No table interfaces defined in data contract`);
  }

  // Check for query patterns
  const hasQueries = Object.keys(dataContract).some(key => key.includes('Query'));
  if (!hasQueries) {
    WARNINGS.push(`${moduleName}: No query patterns defined in data contract`);
  }

  // Validate table structure
  for (const table of tables) {
    const tableDef = dataContract[table];
    if (typeof tableDef === 'object' && tableDef.id === undefined) {
      WARNINGS.push(`${moduleName}: Table ${table} missing id field`);
    }
  }
}

function validateModuleContracts(modulePath) {
  const moduleName = path.basename(path.dirname(modulePath));
  const contractsPath = path.join(modulePath, 'index.ts');

  if (!fs.existsSync(contractsPath)) {
    WARNINGS.push(`${moduleName}: Missing contracts/index.ts file`);
    return;
  }

  try {
    // Note: In a real implementation, we'd use TypeScript compiler API
    // For now, we'll do basic file existence and content checks
    const content = fs.readFileSync(contractsPath, 'utf8');

    // Check for required exports
    if (!content.includes('api') || !content.includes('events') || !content.includes('data')) {
      WARNINGS.push(`${moduleName}: Contracts index missing required exports`);
    }

    log(`✓ Found contracts for module: ${moduleName}`);
  } catch (error) {
    ERRORS.push(`${moduleName}: Failed to read contracts: ${error.message}`);
  }
}

function findModules() {
  const modules = [];
  const modulesDir = path.join(process.cwd(), 'src', 'modules');

  if (!fs.existsSync(modulesDir)) {
    ERRORS.push('Modules directory not found: src/modules');
    return modules;
  }

  const items = fs.readdirSync(modulesDir);
  for (const item of items) {
    const fullPath = path.join(modulesDir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      modules.push(fullPath);
    }
  }

  return modules;
}

function validateVersioning() {
  log('Validating contract versioning across modules');

  const versionPattern = /\.v\d+/;
  const modules = findModules();
  const versions = new Map();

  for (const modulePath of modules) {
    const moduleName = path.basename(modulePath);
    const contractsPath = path.join(modulePath, 'contracts');

    if (!fs.existsSync(contractsPath)) continue;

    try {
      const files = fs.readdirSync(contractsPath);
      for (const file of files) {
        if (file.endsWith('.ts') && file !== 'index.ts') {
          const content = fs.readFileSync(path.join(contractsPath, file), 'utf8');
          const matches = content.match(versionPattern);
          if (matches) {
            for (const match of matches) {
              versions.set(`${moduleName}:${file}:${match}`, true);
            }
          }
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  // Check for consistency (basic check)
  const uniqueVersions = new Set([...versions.keys()].map(k => k.split(':')[2]));
  if (uniqueVersions.size > 1) {
    WARNINGS.push('Multiple version patterns found across contracts. Consider standardizing.');
  }

  log(`Found ${versions.size} versioned contracts`);
}

function main() {
  log('Starting contract validation');

  const modules = findModules();

  if (modules.length === 0) {
    ERRORS.push('No modules found in src/modules');
    process.exit(1);
  }

  log(`Found ${modules.length} modules to validate`);

  for (const modulePath of modules) {
    validateModuleContracts(modulePath);
  }

  validateVersioning();

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
    log('Contract validation FAILED');
    process.exit(1);
  } else {
    log('Contract validation PASSED');
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateApiContract, validateEventContract, validateDataContract };

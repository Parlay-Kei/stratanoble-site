#!/usr/bin/env node

/**
 * Dependency Policy Check Script
 * Validates dependencies against organizational policies per SOP
 */

const fs = require('fs');
const path = require('path');

const ERRORS = [];
const WARNINGS = [];

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
}

// Banned packages - these should never be used
const BANNED_PACKAGES = [
  'left-pad', // Example of problematic package
  'is-odd', // Another example
  // Add actual banned packages based on your org policy
];

// Package version policies
const VERSION_POLICIES = {
  // Major versions that are not allowed
  bannedMajors: {
    'react': [19], // Example: ban React 19 until tested
  },
  // Minimum versions required for security
  minimumVersions: {
    'next': '12.0.0',
    'react': '17.0.0',
    'typescript': '4.5.0',
  },
  // Deprecated packages that should be replaced
  deprecated: {
    'request': 'Use axios or node-fetch instead',
    'moment': 'Use date-fns or luxon instead',
  }
};

function readPackageJson(packagePath) {
  try {
    const content = fs.readFileSync(packagePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    ERRORS.push(`Failed to read ${packagePath}: ${error.message}`);
    return null;
  }
}

function checkBannedPackages(dependencies) {
  log('Checking for banned packages');

  const allDeps = { ...dependencies, ...(dependencies.devDependencies || {}) };

  for (const [packageName, version] of Object.entries(allDeps)) {
    if (BANNED_PACKAGES.includes(packageName)) {
      ERRORS.push(`Banned package detected: ${packageName}@${version}`);
    }
  }
}

function checkVersionPolicies(dependencies) {
  log('Checking version policies');

  for (const [packageName, versionSpec] of Object.entries(dependencies)) {
    // Remove version prefixes (^, ~, etc.) for basic checking
    const cleanVersion = versionSpec.replace(/^[~^=<>]/, '');

    // Check minimum versions
    if (VERSION_POLICIES.minimumVersions[packageName]) {
      const minVersion = VERSION_POLICIES.minimumVersions[packageName];
      if (compareVersions(cleanVersion, minVersion) < 0) {
        ERRORS.push(`${packageName}@${versionSpec} is below minimum required version ${minVersion}`);
      }
    }

    // Check banned major versions
    if (VERSION_POLICIES.bannedMajors[packageName]) {
      const majorVersion = parseInt(cleanVersion.split('.')[0]);
      if (VERSION_POLICIES.bannedMajors[packageName].includes(majorVersion)) {
        ERRORS.push(`${packageName}@${versionSpec} uses banned major version ${majorVersion}`);
      }
    }

    // Check deprecated packages
    if (VERSION_POLICIES.deprecated[packageName]) {
      WARNINGS.push(`Deprecated package: ${packageName} - ${VERSION_POLICIES.deprecated[packageName]}`);
    }
  }
}

function compareVersions(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }

  return 0;
}

function checkDependencyConsistency(packageJson) {
  log('Checking dependency consistency');

  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};

  // Check for dependencies that should be devDependencies
  const runtimeDeps = Object.keys(dependencies);
  const devDeps = Object.keys(devDependencies);

  // Common dev-only packages that might be misplaced
  const devOnlyPackages = [
    'typescript',
    'eslint',
    '@types/',
    'jest',
    'prettier',
    'husky',
    'lint-staged'
  ];

  for (const dep of runtimeDeps) {
    if (devOnlyPackages.some(devPkg => dep.includes(devPkg))) {
      WARNINGS.push(`${dep} is in dependencies but likely should be in devDependencies`);
    }
  }

  // Check for duplicate dependencies (in both runtime and dev)
  const duplicates = runtimeDeps.filter(dep => devDeps.includes(dep));
  if (duplicates.length > 0) {
    WARNINGS.push(`Duplicate dependencies found in both dependencies and devDependencies: ${duplicates.join(', ')}`);
  }
}

function checkPackageJsonStructure(packageJson) {
  log('Checking package.json structure');

  // Required fields
  const requiredFields = ['name', 'version'];
  for (const field of requiredFields) {
    if (!packageJson[field]) {
      ERRORS.push(`Missing required field: ${field}`);
    }
  }

  // Check for license
  if (!packageJson.license && !packageJson.private) {
    WARNINGS.push('No license specified - consider adding one or marking as private');
  }

  // Check for repository
  if (!packageJson.repository) {
    WARNINGS.push('No repository field specified');
  }

  // Check for author/contributors
  if (!packageJson.author && !packageJson.contributors) {
    WARNINGS.push('No author or contributors specified');
  }
}

function checkWorkspaceDependencies() {
  log('Checking workspace dependencies');

  const rootPackageJson = readPackageJson('package.json');
  if (!rootPackageJson) return;

  const workspaces = rootPackageJson.workspaces || [];

  for (const workspace of workspaces) {
    const workspacePath = workspace.replace('/*', '');
    const workspacePackagePath = path.join(workspacePath, 'package.json');

    if (fs.existsSync(workspacePackagePath)) {
      const workspacePackage = readPackageJson(workspacePackagePath);
      if (workspacePackage) {
        log(`Checking workspace: ${workspacePath}`);
        checkBannedPackages(workspacePackage);
        checkVersionPolicies({ ...workspacePackage.dependencies, ...workspacePackage.devDependencies });
        checkDependencyConsistency(workspacePackage);
      }
    }
  }
}

function main() {
  log('Starting dependency policy check');

  // Check root package.json
  const rootPackageJson = readPackageJson('package.json');
  if (!rootPackageJson) {
    log('No package.json found');
    process.exit(1);
  }

  checkPackageJsonStructure(rootPackageJson);
  checkBannedPackages(rootPackageJson);
  checkVersionPolicies(rootPackageJson.dependencies || {});
  checkVersionPolicies(rootPackageJson.devDependencies || {});
  checkDependencyConsistency(rootPackageJson);

  // Check workspace packages
  checkWorkspaceDependencies();

  // Summary
  log(`Policy check complete: ${ERRORS.length} errors, ${WARNINGS.length} warnings`);

  if (ERRORS.length > 0) {
    console.log('\n🚨 POLICY VIOLATIONS:');
    ERRORS.forEach(error => console.log(`  - ${error}`));
  }

  if (WARNINGS.length > 0) {
    console.log('\n⚠️  POLICY WARNINGS:');
    WARNINGS.forEach(warning => console.log(`  - ${warning}`));
  }

  if (ERRORS.length > 0) {
    log('Dependency policy check FAILED');
    process.exit(1);
  } else {
    log('Dependency policy check PASSED');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkBannedPackages,
  checkVersionPolicies,
  compareVersions
};

#!/usr/bin/env tsx

/**
 * Build-time Environment Variable Validation
 *
 * Validates required environment variables before build/deployment.
 * Exit codes:
 *   0 = all validations passed
 *   1 = missing required variables
 */

interface ValidationResult {
  passed: boolean;
  missing: string[];
  warnings: string[];
}

const ALWAYS_REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

const PRODUCTION_REQUIRED = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
] as const;

const OPTIONAL_WITH_WARNING = [
  {
    key: 'UPSTASH_REDIS_REST_URL',
    reason: 'Rate limiting will not work without Redis configuration',
  },
  {
    key: 'UPSTASH_REDIS_REST_TOKEN',
    reason: 'Rate limiting will not work without Redis configuration',
  },
] as const;

function validateEnvironment(): ValidationResult {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check always required variables
  for (const key of ALWAYS_REQUIRED) {
    if (!process.env[key]) {
      missing.push(`${key} (always required)`);
    }
  }

  // Check production-only required variables
  if (isProduction) {
    for (const key of PRODUCTION_REQUIRED) {
      if (!process.env[key]) {
        missing.push(`${key} (required in production)`);
      }
    }
  }

  // Check optional variables with warnings
  for (const { key, reason } of OPTIONAL_WITH_WARNING) {
    if (!process.env[key]) {
      warnings.push(`${key}: ${reason}`);
    }
  }

  return {
    passed: missing.length === 0,
    missing,
    warnings,
  };
}

function printResults(result: ValidationResult): void {
  const isProduction = process.env.NODE_ENV === 'production';

  console.log('\n===========================================');
  console.log('  Environment Variable Validation');
  console.log('===========================================\n');
  console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}\n`);

  if (result.passed) {
    console.log('All required environment variables are present\n');
  } else {
    console.error('Missing required environment variables:\n');
    for (const variable of result.missing) {
      console.error(`  - ${variable}`);
    }
    console.error('');
  }

  if (result.warnings.length > 0) {
    console.warn('Warnings:\n');
    for (const warning of result.warnings) {
      console.warn(`  - ${warning}`);
    }
    console.warn('');
  }

  if (!result.passed) {
    console.error('Please set the missing environment variables and try again.');
    console.error('See .env.example for reference.\n');
  }

  console.log('===========================================\n');
}

function main(): void {
  const result = validateEnvironment();
  printResults(result);

  if (!result.passed) {
    process.exit(1);
  }

  process.exit(0);
}

main();

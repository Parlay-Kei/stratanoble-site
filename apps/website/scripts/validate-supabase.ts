#!/usr/bin/env node

/**
 * Supabase Configuration Validation Script
 *
 * Usage:
 *   npm run validate:supabase
 *   node scripts/validate-supabase.ts
 *   NODE_ENV=production node scripts/validate-supabase.ts
 */

import { validateAdminConfig, healthCheckAdmin } from '../src/lib/supabase/server';

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

async function validateConfiguration(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log('🔍 Validating Supabase configuration...\n');

  // Step 1: Check environment variables
  console.log('Step 1: Checking environment variables...');
  const configResult = validateAdminConfig();

  if (!configResult.valid) {
    errors.push(...configResult.errors);
    console.log('❌ Environment variable check failed');
    configResult.errors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('✅ Environment variables are configured correctly');
  }

  // Step 2: Development-specific checks
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n📝 Development mode checks...');
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      warnings.push(
        'SUPABASE_SERVICE_ROLE_KEY not set in development. ' +
        'This is acceptable locally but NOT for production deployments.'
      );
      console.log('⚠️  Service role key not set (acceptable in development)');
    } else {
      console.log('✅ Service role key is configured');
    }
  }

  // Step 3: Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    console.log('\n🔒 Production mode checks...');

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY is REQUIRED in production');
      console.log('❌ Service role key is missing (REQUIRED in production)');
    } else {
      console.log('✅ Service role key is configured');
    }

    // Step 4: Health check (production only)
    if (configResult.valid) {
      console.log('\n🏥 Running health check...');
      try {
        const healthResult = await healthCheckAdmin();

        if (!healthResult.healthy) {
          if (!healthResult.config.valid) {
            errors.push(...healthResult.config.errors);
          }
          if (healthResult.connection && !healthResult.connection.success) {
            errors.push(`Database connection failed: ${healthResult.connection.error}`);
            console.log(`❌ Connection check failed: ${healthResult.connection.error}`);
          }
        } else {
          console.log('✅ Database connection successful');
        }
      } catch (error) {
        errors.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log(`❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
  };
}

async function main() {
  const startTime = Date.now();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Supabase Configuration Validator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);

  const result = await validateConfiguration();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Validation Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`   ${warning}\n`));
  }

  if (result.errors.length > 0) {
    console.log('❌ Errors:');
    result.errors.forEach(error => console.log(`   ${error}\n`));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('❌ Validation failed\n');
    console.log('Required environment variables:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY (required in production)\n');
    console.log('Update your .env.local or deployment configuration.');
    console.log('\nFor more information, see:');
    console.log('  - SUPABASE_ADMIN_SECURITY_MIGRATION.md');
    console.log('  - SECURITY_HOTFIX_SUMMARY.md\n');
    process.exit(1);
  }

  const duration = Date.now() - startTime;
  console.log(`✅ All checks passed (${duration}ms)\n`);

  if (result.warnings.length > 0) {
    console.log('Note: Warnings are informational and do not prevent deployment.\n');
  }

  process.exit(0);
}

// Run validation
main().catch((error) => {
  console.error('\n💥 Unexpected error during validation:\n');
  console.error(error);
  process.exit(1);
});

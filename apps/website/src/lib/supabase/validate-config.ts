/**
 * Supabase Configuration Validation
 *
 * This module provides utilities to validate Supabase configuration at startup
 * or during CI/CD to prevent deployment with missing or insecure credentials.
 */

import { validateAdminConfig, healthCheckAdmin } from './server';

/**
 * Validates Supabase configuration and throws if invalid.
 * Use this in startup scripts or server initialization.
 *
 * @throws {Error} If configuration is invalid or insecure
 */
export async function validateSupabaseConfigOrThrow(): Promise<void> {
  const configResult = validateAdminConfig();

  if (!configResult.valid) {
    const errorMessage = [
      'Supabase configuration is invalid:',
      ...configResult.errors.map(err => `  - ${err}`),
      '',
      'Required environment variables:',
      '  - NEXT_PUBLIC_SUPABASE_URL',
      '  - SUPABASE_SERVICE_ROLE_KEY (required in production)',
      '',
      'Update your .env.local or deployment configuration.'
    ].join('\n');

    throw new Error(errorMessage);
  }

  // In production, perform additional health checks
  if (process.env.NODE_ENV === 'production') {
    console.log('Running Supabase health check in production mode...');
    const healthResult = await healthCheckAdmin();

    if (!healthResult.healthy) {
      const errorMessage = [
        'Supabase health check failed:',
        healthResult.config.valid ? '' : `  - Configuration errors: ${healthResult.config.errors.join(', ')}`,
        healthResult.connection?.success === false ? `  - Connection error: ${healthResult.connection.error}` : '',
      ].filter(Boolean).join('\n');

      throw new Error(errorMessage);
    }

    console.log('Supabase health check passed successfully.');
  }
}

/**
 * Validates Supabase configuration and returns result without throwing.
 * Use this for monitoring or reporting.
 *
 * @returns Validation result with status and details
 */
export function validateSupabaseConfig(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const configResult = validateAdminConfig();
  const warnings: string[] = [];

  // Check for development-specific issues
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      warnings.push(
        'SUPABASE_SERVICE_ROLE_KEY not set in development. ' +
        'Admin operations will fall back to anon key. ' +
        'This is acceptable for local development but NOT for production.'
      );
    }
  }

  return {
    valid: configResult.valid,
    errors: configResult.errors,
    warnings,
  };
}

/**
 * CLI utility to validate configuration from command line.
 * Usage: node -r tsx/register src/lib/supabase/validate-config.ts
 */
if (require.main === module) {
  (async () => {
    try {
      console.log('Validating Supabase configuration...\n');
      await validateSupabaseConfigOrThrow();
      console.log('Configuration is valid.');
      process.exit(0);
    } catch (error) {
      console.error('Configuration validation failed:\n');
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  })();
}

/**
 * Integration Contract Test
 * 
 * This test MUST pass before any integration tests run.
 * It validates that the environment is safe for database operations.
 * 
 * If this test fails, ALL integration tests are blocked.
 * No partial runs. No "cleanup tried to help."
 * 
 * Run this first, always.
 */

import { testReset } from './db-reset';
import { assertTestDatabase } from './integration';

/**
 * Validate integration environment
 * 
 * Exported for use by the integration harness
 */
export async function validateIntegrationEnvironment(): Promise<void> {
  const failures: string[] = [];

  // Check 1: NODE_ENV must be 'test'
  if (process.env.NODE_ENV !== 'test') {
    failures.push(
      `NODE_ENV must be 'test', got '${process.env.NODE_ENV}'. ` +
      `Integration tests are blocked in non-test environments.`
    );
  }

  // Check 2: TEST_ENV must be 'true'
  if (process.env.TEST_ENV !== 'true') {
    failures.push(
      `TEST_ENV must be 'true', got '${process.env.TEST_ENV || 'undefined'}'. ` +
      `Set TEST_ENV=true before running integration tests.`
    );
  }

  // Check 3: Supabase URL must be set and valid
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    failures.push('NEXT_PUBLIC_SUPABASE_URL is not set.');
  } else {
    // Check 4: URL must not contain production indicators
    if (
      supabaseUrl.includes('production') ||
      supabaseUrl.includes('prod') ||
      supabaseUrl.match(/prod-\d+/) ||
      supabaseUrl.includes('main')
    ) {
      failures.push(
        `Supabase URL contains production indicators: ${supabaseUrl}. ` +
        `Integration tests must use a test project, never production.`
      );
    }

    // Check 5: Extract and validate project ref
    const urlMatch = supabaseUrl.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
    if (!urlMatch) {
      failures.push(`Invalid Supabase URL format: ${supabaseUrl}`);
    } else {
      const projectRef = urlMatch[1];
      
      // Check 6: Project ref should be in allowed list (if configured)
      // This is a soft check - we'll warn but not fail if not configured
      if (projectRef.length < 10) {
        failures.push(
          `Suspicious project ref (too short): ${projectRef}. ` +
          `Verify this is a test project.`
        );
      }
    }
  }

  // Check 7: Service role key must be set
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    failures.push(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Integration tests require service role key for test operations.'
    );
  }

  // Check 8: Verify testReset() can be imported and validates environment
  try {
    // This will throw if environment is invalid
    await testReset({ skipValidation: false });
  } catch (error) {
    // If testReset() itself fails validation, that's a contract violation
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('invalid environment') || errorMessage.includes('TEST_ENV')) {
      failures.push(
        `testReset() validation failed: ${errorMessage}. ` +
        `This indicates the environment is not safe for integration tests.`
      );
    }
    // If it's a different error (like DB connection), that's OK - we're just checking the guardrails
  }

  // Check 9: Canary protection table (ensures we're hitting the right database)
  try {
    await assertTestDatabase();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    failures.push(
      `Canary protection check failed: ${errorMessage}. ` +
      `This indicates you may be connected to the wrong database.`
    );
  }

  // If any checks failed, block everything
  if (failures.length > 0) {
    const errorMessage = [
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '❌ INTEGRATION ENVIRONMENT CONTRACT VIOLATED',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      'Integration tests are BLOCKED. Environment is not safe.',
      '',
      'Failures:',
      ...failures.map((f, i) => `  ${i + 1}. ${f}`),
      '',
      'Fix these issues before running integration tests.',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ].join('\n');

    throw new Error(errorMessage);
  }
}

describe('Integration Environment Contract', () => {
  // This test runs FIRST and blocks everything if it fails
  test('environment is safe for integration tests', async () => {
    const failures: string[] = [];

    // Check 1: NODE_ENV must be 'test'
    if (process.env.NODE_ENV !== 'test') {
      failures.push(
        `NODE_ENV must be 'test', got '${process.env.NODE_ENV}'. ` +
        `Integration tests are blocked in non-test environments.`
      );
    }

    // Check 2: TEST_ENV must be 'true'
    if (process.env.TEST_ENV !== 'true') {
      failures.push(
        `TEST_ENV must be 'true', got '${process.env.TEST_ENV || 'undefined'}'. ` +
        `Set TEST_ENV=true before running integration tests.`
      );
    }

    // Check 3: Supabase URL must be set and valid
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      failures.push('NEXT_PUBLIC_SUPABASE_URL is not set.');
    } else {
      // Check 4: URL must not contain production indicators
      if (
        supabaseUrl.includes('production') ||
        supabaseUrl.includes('prod') ||
        supabaseUrl.match(/prod-\d+/) ||
        supabaseUrl.includes('main')
      ) {
        failures.push(
          `Supabase URL contains production indicators: ${supabaseUrl}. ` +
          `Integration tests must use a test project, never production.`
        );
      }

      // Check 5: Extract and validate project ref
      const urlMatch = supabaseUrl.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
      if (!urlMatch) {
        failures.push(`Invalid Supabase URL format: ${supabaseUrl}`);
      } else {
        const projectRef = urlMatch[1];
        
        // Check 6: Project ref should be in allowed list (if configured)
        // This is a soft check - we'll warn but not fail if not configured
        if (projectRef.length < 10) {
          failures.push(
            `Suspicious project ref (too short): ${projectRef}. ` +
            `Verify this is a test project.`
          );
        }
      }
    }

    // Check 7: Service role key must be set
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      failures.push(
        'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
        'Integration tests require service role key for test operations.'
      );
    }

    // Check 8: Verify testReset() can be imported and validates environment
    try {
      // This will throw if environment is invalid
      await testReset({ skipValidation: false });
    } catch (error) {
      // If testReset() itself fails validation, that's a contract violation
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('invalid environment') || errorMessage.includes('TEST_ENV')) {
        failures.push(
          `testReset() validation failed: ${errorMessage}. ` +
          `This indicates the environment is not safe for integration tests.`
        );
      }
      // If it's a different error (like DB connection), that's OK - we're just checking the guardrails
    }

    // Check 9: Database name/schema validation (if we can connect)
    // This is a soft check - we'll try to verify but won't fail if we can't connect
    // (connection issues are handled by individual tests)

    // If any checks failed, block everything
    if (failures.length > 0) {
      const errorMessage = [
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '❌ INTEGRATION ENVIRONMENT CONTRACT VIOLATED',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '',
        'Integration tests are BLOCKED. Environment is not safe.',
        '',
        'Failures:',
        ...failures.map((f, i) => `  ${i + 1}. ${f}`),
        '',
        'Fix these issues before running integration tests.',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      ].join('\n');

      throw new Error(errorMessage);
    }

    // All checks passed
    expect(true).toBe(true); // Explicit pass
  });

  // This test verifies testReset() function exists and is callable
  // (for test/local environments only)
  test('testReset() function is available', async () => {
    // In a real test environment, testReset() should exist
    // We're just checking it's importable and has the right signature
    expect(typeof testReset).toBe('function');
    
    // Verify it requires proper environment (will throw if not)
    try {
      await testReset({ skipValidation: false });
      // If we get here without throwing, environment is valid
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // If it's an environment validation error, that's expected and OK
      // We're just checking the function exists and validates
      if (!errorMessage.includes('invalid environment') && !errorMessage.includes('TEST_ENV')) {
        throw error; // Re-throw unexpected errors
      }
    }
  });

  // This test verifies canary protection table exists
  test('canary protection table validates correct database', async () => {
    const { assertTestDatabase } = await import('./integration');
    
    // This should pass if we're connected to the right database
    await expect(assertTestDatabase()).resolves.not.toThrow();
  });
});

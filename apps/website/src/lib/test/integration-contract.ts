/**
 * Integration Contract Validator
 *
 * Validates that the environment is safe for database operations.
 * This module is used by both the test harness and the contract test.
 */

/**
 * Validate integration environment
 *
 * Returns validation errors if environment is not safe for integration tests.
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
        `Integration tests are blocked for safety.`
      );
    }
  }

  // Check 5: Service role key must be set
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    failures.push(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Integration tests require service role access.'
    );
  }

  // If any failures, throw aggregate error
  if (failures.length > 0) {
    throw new Error(
      `Integration Contract Violation:\n\n` +
      failures.map((f, i) => `${i + 1}. ${f}`).join('\n\n') +
      '\n\n' +
      'ALL integration tests are blocked until these issues are resolved.'
    );
  }
}

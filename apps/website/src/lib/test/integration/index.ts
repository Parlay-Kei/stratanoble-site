/**
 * Integration Test Harness
 * 
 * THE ONE TRUE DOOR for all integration tests.
 * 
 * Every integration test MUST import from this module only.
 * This ensures:
 * - Contract validation runs
 * - All DB operations go through approved paths
 * - No bypass via helpers or RPC calls
 * - Cultural enforcement via mechanical requirement
 * 
 * Usage:
 *   import { withDbTest, testReset, factories, adminClient } from '@/lib/test/integration';
 * 
 *   test('my test', async () => {
 *     await withDbTest(async () => {
 *       // Your test code here
 *       // Auto-reset happens after
 *     });
 *   });
 */

// Re-export the contract validator
export { validateIntegrationEnvironment } from '../integration-contract';

// Re-export test reset (the one true reset door)
export { testReset, enableTestMode } from '../db-reset';

// Re-export factories
export * from '../factories';

// Re-export types
export type { TestClient, TestClientOptions } from '../factories/client-factory';
export type { TestLead, TestLeadOptions } from '../factories/lead-factory';
export type { TestCampaign, TestCampaignOptions } from '../factories/campaign-factory';

// Admin client (the one true DB access)
import { createClient } from '@supabase/supabase-js';

let _adminClient: ReturnType<typeof createClient> | null = null;

/**
 * Clear the cached admin client (for testing purposes)
 *
 * This allows tests that modify environment variables to get a fresh client.
 */
export function resetAdminClient(): void {
  _adminClient = null;
}

/**
 * Get the admin Supabase client
 *
 * This is the ONLY way integration tests should access Supabase.
 * It ensures we're using the service role key and validates environment.
 *
 * @param options.skipCache - If true, always validate environment even if client is cached
 */
export function getAdminClient(options: { skipCache?: boolean } = {}): ReturnType<typeof createClient> {
  // If not skipping cache and client exists, return it
  if (!options.skipCache && _adminClient) {
    return _adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Integration harness: Supabase credentials not configured. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  // Validate environment before creating client
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      'Integration harness: NODE_ENV must be "test". ' +
      `Got: ${process.env.NODE_ENV}`
    );
  }

  if (process.env.TEST_ENV !== 'true') {
    throw new Error(
      'Integration harness: TEST_ENV must be "true". ' +
      `Got: ${process.env.TEST_ENV || 'undefined'}`
    );
  }

  _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _adminClient;
}

// Lazy-loaded admin client getter (doesn't eagerly create at module load)
export function adminClient(): ReturnType<typeof createClient> {
  return getAdminClient();
}

/**
 * Wrapper for integration tests that auto-resets database
 * 
 * Usage:
 *   await withDbTest(async () => {
 *     // Your test code
 *   });
 */
export async function withDbTest<T>(
  testFn: () => Promise<T>,
  options: { resetBefore?: boolean; resetAfter?: boolean } = {}
): Promise<T> {
  const { resetBefore = true, resetAfter = true } = options;

  // Validate environment first
  if (process.env.NODE_ENV !== 'test' || process.env.TEST_ENV !== 'true') {
    throw new Error(
      'withDbTest() called in invalid environment. ' +
      'Integration tests must run with NODE_ENV=test and TEST_ENV=true'
    );
  }

  try {
    // Reset before test if requested
    if (resetBefore) {
      await testReset();
    }

    // Run the test
    const result = await testFn();

    // Reset after test if requested
    if (resetAfter) {
      await testReset();
    }

    return result;
  } catch (error) {
    // Always reset on error to prevent state leakage
    try {
      await testReset();
    } catch (resetError) {
      console.error('Failed to reset database after test error:', resetError);
    }
    throw error;
  }
}

/**
 * Assert that we're connected to the correct test database
 * 
 * This checks the canary protection table to ensure we're not
 * accidentally pointing at production or the wrong test project.
 */
export async function assertTestDatabase(): Promise<void> {
  const client = getAdminClient();

  // Check for canary protection table
  const { data, error } = await client
    .from('env_sentinel')
    .select('canary_value')
    .eq('id', 'test-environment-sentinel')
    .single();

  if (error) {
    throw new Error(
      `Integration harness: Canary protection table not found or invalid. ` +
      `This indicates you may be connected to the wrong database. ` +
      `Error: ${error.message}`
    );
  }

  const expectedCanary = 'TEST_ENVIRONMENT_VERIFIED_2025';
  if (data?.canary_value !== expectedCanary) {
    throw new Error(
      `Integration harness: Canary value mismatch. ` +
      `Expected: ${expectedCanary}, Got: ${data?.canary_value}. ` +
      `This indicates you may be connected to the wrong database.`
    );
  }
}

// Auto-validate on module load (in test environment)
if (typeof jest !== 'undefined' && process.env.NODE_ENV === 'test') {
  // Run async validation, but don't block module load
  // The contract test will catch this synchronously
  setImmediate(async () => {
    try {
      await assertTestDatabase();
    } catch (error) {
      // Log but don't throw - contract test will catch it
      console.warn('Integration harness: Database validation warning:', error);
    }
  });
}

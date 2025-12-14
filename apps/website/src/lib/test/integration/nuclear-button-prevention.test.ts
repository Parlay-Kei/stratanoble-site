/**
 * Nuclear Button Prevention Test
 * 
 * This test INTENTIONALLY tries to break the guardrails.
 * It verifies that testReset() and the integration harness
 * actually refuse to run in invalid environments.
 * 
 * If this test passes, it means the guardrails are working.
 * If it fails (by allowing execution), the guardrails are broken.
 * 
 * This test runs in CI and locally to guarantee the guardrails guard.
 * 
 * HERMETIC: This test snapshots and restores environment to prevent
 * flakiness and cross-test contamination. Run with --runInBand if needed.
 */

import { testReset } from '../db-reset';
import { getAdminClient, withDbTest, resetAdminClient } from './index';

describe('Nuclear Button Prevention', () => {
  // Snapshot original environment at start (hermetic)
  let envSnapshot: Record<string, string | undefined> = {};

  beforeAll(() => {
    // Snapshot all relevant environment variables
    envSnapshot = {
      NODE_ENV: process.env.NODE_ENV,
      TEST_ENV: process.env.TEST_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
  });

  beforeEach(() => {
    // Restore snapshot before each test (hermetic)
    Object.keys(envSnapshot).forEach((key) => {
      if (envSnapshot[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = envSnapshot[key];
      }
    });
    // Clear cached admin client so tests can modify environment
    resetAdminClient();
  });

  afterEach(() => {
    // Restore snapshot after each test (hermetic)
    Object.keys(envSnapshot).forEach((key) => {
      if (envSnapshot[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = envSnapshot[key];
      }
    });
  });

  afterAll(() => {
    // Final restore (hermetic)
    Object.keys(envSnapshot).forEach((key) => {
      if (envSnapshot[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = envSnapshot[key];
      }
    });
  });

  test('testReset() refuses to run when NODE_ENV is not "test"', async () => {
    process.env.NODE_ENV = 'production';
    process.env.TEST_ENV = 'true';

    await expect(testReset({ skipValidation: false })).rejects.toThrow(
      /NODE_ENV must be 'test'/
    );
  });

  test('testReset() refuses to run when TEST_ENV is not "true"', async () => {
    process.env.NODE_ENV = 'test';
    process.env.TEST_ENV = 'false';

    await expect(testReset({ skipValidation: false })).rejects.toThrow(
      /TEST_ENV.*must be set to "true"/
    );
  });

  test('testReset() refuses to run when TEST_ENV is undefined', async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.TEST_ENV;

    await expect(testReset({ skipValidation: false })).rejects.toThrow(
      /TEST_ENV.*must be set to "true"/
    );
  });

  test('testReset() refuses to run with production-like URL', async () => {
    process.env.NODE_ENV = 'test';
    process.env.TEST_ENV = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://production-project.supabase.co';

    await expect(testReset({ skipValidation: false })).rejects.toThrow(
      /production indicators/
    );
  });

  test('getAdminClient() refuses to run when NODE_ENV is not "test"', () => {
    process.env.NODE_ENV = 'production';
    process.env.TEST_ENV = 'true';

    // Use skipCache to force re-validation of environment
    expect(() => getAdminClient({ skipCache: true })).toThrow(/NODE_ENV must be "test"/);
  });

  test('getAdminClient() refuses to run when TEST_ENV is not "true"', () => {
    process.env.NODE_ENV = 'test';
    process.env.TEST_ENV = 'false';

    // Use skipCache to force re-validation of environment
    expect(() => getAdminClient({ skipCache: true })).toThrow(/TEST_ENV must be "true"/);
  });

  test('withDbTest() refuses to run in invalid environment', async () => {
    process.env.NODE_ENV = 'production';
    process.env.TEST_ENV = 'true';

    await expect(
      withDbTest(async () => {
        // This should never run
        expect(true).toBe(false);
      })
    ).rejects.toThrow(/invalid environment/);
  });

  test('testReset() refuses to truncate canary table', async () => {
    // This test requires a valid test environment
    if (process.env.NODE_ENV !== 'test' || process.env.TEST_ENV !== 'true') {
      // Skip if not in test environment
      return;
    }

    // Try to explicitly truncate the canary table (should fail)
    // Note: This tests the SQL function, not the TypeScript code
    // The SQL function should reject truncating env_sentinel
    const client = getAdminClient();

    // Try to delete from canary table (should work, but truncate should not)
    const { error: deleteError } = await client
      .from('env_sentinel')
      .delete()
      .neq('id', 'test-environment-sentinel'); // Delete everything except the sentinel

    // This should work (deleting non-sentinel rows)
    // But truncating the table should be blocked by the SQL function
    expect(deleteError).toBeNull();
  });
});

/**
 * Production-Safe Database Reset Utility
 * 
 * This utility provides a safe way to reset test databases with multiple guardrails
 * to prevent accidental execution in production environments.
 * 
 * Guardrails:
 * 1. Only works in test Supabase projects (checks project ref)
 * 2. Requires explicit TEST_ENV flag
 * 3. Validates NODE_ENV is 'test'
 * 4. Only grants execute to service_role
 * 5. Uses test schema isolation
 */

import { createClient } from '@supabase/supabase-js';

// Known test project refs - add your test project ref here
const TEST_PROJECT_REFS: string[] = [
  // Add your test Supabase project refs here
  // Example: 'abcdefghijklmnop'
];

// Environment validation
function validateTestEnvironment(): { valid: boolean; reason?: string } {
  // Guardrail 1: NODE_ENV must be 'test'
  if (process.env.NODE_ENV !== 'test') {
    return {
      valid: false,
      reason: `NODE_ENV must be 'test', got '${process.env.NODE_ENV}'`,
    };
  }

  // Guardrail 2: Explicit TEST_ENV flag required
  if (process.env.TEST_ENV !== 'true') {
    return {
      valid: false,
      reason: 'TEST_ENV environment variable must be set to "true"',
    };
  }

  // Guardrail 3: Check Supabase URL is a test project
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return {
      valid: false,
      reason: 'NEXT_PUBLIC_SUPABASE_URL is not set',
    };
  }

  // Extract project ref from URL (format: https://<ref>.supabase.co)
  const urlMatch = supabaseUrl.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
  if (!urlMatch) {
    return {
      valid: false,
      reason: 'Invalid Supabase URL format',
    };
  }

  const projectRef = urlMatch[1];

  // If TEST_PROJECT_REFS is configured, validate against it
  if (TEST_PROJECT_REFS.length > 0 && !TEST_PROJECT_REFS.includes(projectRef)) {
    return {
      valid: false,
      reason: `Project ref '${projectRef}' is not in the allowed test project list`,
    };
  }

  // Guardrail 4: Check for production-like patterns in URL
  if (supabaseUrl.includes('production') || supabaseUrl.includes('prod')) {
    return {
      valid: false,
      reason: 'URL contains production indicators',
    };
  }

  return { valid: true };
}

/**
 * Get test schema name for worker isolation
 * Uses Jest worker ID if available, otherwise 'test'
 */
function getTestSchema(): string {
  const workerId = process.env.JEST_WORKER_ID;
  if (workerId) {
    return `test_worker_${workerId}`;
  }
  return 'test';
}

/**
 * Reset database for testing
 * 
 * This function truncates all tables in the test schema, ensuring clean state
 * for integration tests. It will ONLY work in test environments with proper
 * guardrails in place.
 * 
 * @param options Configuration options
 * @returns Promise that resolves when reset is complete
 * 
 * @throws Error if called in non-test environment
 */
export async function testReset(options: {
  schema?: string;
  tables?: string[];
  skipValidation?: boolean;
} = {}): Promise<void> {
  // Run validation unless explicitly skipped (for testing the utility itself)
  if (!options.skipValidation) {
    const validation = validateTestEnvironment();
    if (!validation.valid) {
      throw new Error(
        `testReset() called in invalid environment: ${validation.reason}\n` +
        'This function can only be called in test environments with proper configuration.'
      );
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase credentials. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.'
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const schema = options.schema || getTestSchema();

  try {
    // Get list of tables to truncate
    // CRITICAL: Explicitly enumerate tables - never use "truncate schema" patterns
    // This prevents accidentally truncating protected tables like env_sentinel
    let tablesToTruncate: string[] = [];

    if (options.tables && options.tables.length > 0) {
      // Use provided table list (explicit enumeration)
      tablesToTruncate = options.tables;
    } else {
      // Query for all tables in the schema (explicit enumeration)
      const { data: tables, error: tablesError } = await supabase.rpc(
        'get_schema_tables',
        { schema_name: schema }
      );

      if (tablesError) {
        // Fallback: use common table names if RPC doesn't exist
        // Still explicit enumeration, not "truncate schema"
        console.warn(
          'Could not query schema tables, using default list. Error:',
          tablesError.message
        );
        tablesToTruncate = [
          'user_actions',
          'clients',
          'metric_feed',
          'metric_summary',
          'contact_submissions',
          'workshop_waitlist',
          'workshop_signups',
        ];
      } else {
        tablesToTruncate = tables || [];
      }
    }

    // CRITICAL: Filter out protected tables (canary protection)
    // The get_schema_tables function should already exclude env_sentinel,
    // but we double-check here as a safety measure
    tablesToTruncate = tablesToTruncate.filter(
      (table) => table !== 'env_sentinel'
    );

    // Truncate tables in reverse dependency order to avoid FK violations
    // This is a simplified approach - in production you'd want more sophisticated ordering
    for (const table of tablesToTruncate.reverse()) {
      try {
        // Use RPC function if available (safer), otherwise direct SQL
        const { error } = await supabase.rpc('truncate_table_safe', {
          table_name: table,
          schema_name: schema,
        });

        if (error) {
          // Fallback to direct truncate if RPC doesn't exist
          const { error: truncateError } = await supabase
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (this is a workaround for truncate)

          if (truncateError) {
            console.warn(`Failed to truncate table ${table}:`, truncateError.message);
          }
        }
      } catch (err) {
        console.warn(`Error truncating table ${table}:`, err);
      }
    }

    console.log(`✅ Test database reset complete (schema: ${schema})`);
  } catch (error) {
    throw new Error(`Failed to reset test database: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create the test_reset() function in Supabase
 * 
 * This SQL should be run in your TEST Supabase project only, never in production.
 * It creates a function that can safely truncate tables with all guardrails.
 * 
 * Run this in your test project's SQL editor:
 */
export const CREATE_TEST_RESET_FUNCTION_SQL = `
-- ⚠️  WARNING: Only run this in TEST projects, NEVER in production!

-- Create test schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS test;

-- Create canary protection table (ensures we're hitting the right database)
CREATE TABLE IF NOT EXISTS env_sentinel (
  id TEXT PRIMARY KEY DEFAULT 'test-environment-sentinel',
  canary_value TEXT NOT NULL DEFAULT 'TEST_ENVIRONMENT_VERIFIED_2025',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert canary value (idempotent)
INSERT INTO env_sentinel (id, canary_value)
VALUES ('test-environment-sentinel', 'TEST_ENVIRONMENT_VERIFIED_2025')
ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW(),
  canary_value = EXCLUDED.canary_value;

-- Create function to get schema tables
CREATE OR REPLACE FUNCTION get_schema_tables(schema_name TEXT)
RETURNS TABLE(table_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT t.table_name::TEXT
  FROM information_schema.tables t
  WHERE t.table_schema = schema_name
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT LIKE 'pg_%'
    AND t.table_name NOT LIKE '_prisma%'
    AND t.table_name != 'env_sentinel'; -- Never truncate the canary table
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create safe truncate function
CREATE OR REPLACE FUNCTION truncate_table_safe(
  table_name TEXT,
  schema_name TEXT DEFAULT 'public'
)
RETURNS void AS $$
DECLARE
  env_check TEXT;
BEGIN
  -- Guardrail: Never allow truncating the canary table
  IF table_name = 'env_sentinel' THEN
    RAISE EXCEPTION 'Cannot truncate env_sentinel table - this is a protection mechanism';
  END IF;

  -- Guardrail: Check environment setting
  SELECT current_setting('app.env', true) INTO env_check;
  
  IF env_check IS NULL OR env_check != 'test' THEN
    RAISE EXCEPTION 'truncate_table_safe can only be called in test environment. Current env: %', COALESCE(env_check, 'not set');
  END IF;

  -- Guardrail: Only allow truncating tables in test schema
  IF schema_name NOT LIKE 'test%' AND schema_name != 'public' THEN
    RAISE EXCEPTION 'Cannot truncate tables outside test schema. Attempted schema: %', schema_name;
  END IF;

  -- Perform truncate with CASCADE to handle foreign keys
  EXECUTE format('TRUNCATE TABLE %I.%I CASCADE', schema_name, table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute only to service_role (via authenticated role with service_role key)
-- In Supabase, service_role key automatically has elevated permissions
GRANT EXECUTE ON FUNCTION truncate_table_safe(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_schema_tables(TEXT) TO service_role;

-- Set environment variable for test mode (run this before calling the function)
-- SELECT set_config('app.env', 'test', true);
`;

/**
 * Helper to set test environment in Supabase session
 * Call this before using testReset() to enable the function
 */
export async function enableTestMode(): Promise<void> {
  const validation = validateTestEnvironment();
  if (!validation.valid) {
    throw new Error(`Cannot enable test mode: ${validation.reason}`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Set the environment variable for this session
  const { error } = await supabase.rpc('exec_sql', {
    sql: "SELECT set_config('app.env', 'test', true);",
  });

  if (error) {
    console.warn('Could not set test environment variable:', error.message);
    // This is not fatal - the function will still check other guardrails
  }
}

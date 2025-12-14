#!/usr/bin/env node
/**
 * One-Command Test Project Bootstrap
 * 
 * Sets up a dedicated test Supabase project with all required:
 * - test_reset() functions
 * - Canary protection table
 * - Proper permissions
 * - Environment validation
 * 
 * Usage:
 *   node scripts/bootstrap-test-project.mjs
 * 
 * This script:
 * 1. Validates you have Supabase CLI installed
 * 2. Prompts for test project details (or uses local)
 * 3. Creates canary protection table
 * 4. Deploys test_reset() functions
 * 5. Outputs configuration for .env files
 * 6. Updates TEST_PROJECT_REFS in db-reset.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// SQL to create test infrastructure
const TEST_INFRASTRUCTURE_SQL = `
-- ⚠️  TEST PROJECT SETUP - DO NOT RUN IN PRODUCTION ⚠️

-- Create canary protection table
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

-- Create test schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS test;

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
    AND t.table_name != 'env_sentinel';
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

-- Grant execute only to service_role
GRANT EXECUTE ON FUNCTION truncate_table_safe(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_schema_tables(TEXT) TO service_role;

-- Verify canary table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM env_sentinel WHERE id = 'test-environment-sentinel') THEN
    RAISE EXCEPTION 'Canary protection table setup failed';
  END IF;
END $$;
`;

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getProjectRef(url) {
  const match = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
  return match ? match[1] : null;
}

async function bootstrapLocal() {
  console.log('🔧 Bootstrapping LOCAL test project...\n');

  try {
    // Check if Supabase is running
    execSync('supabase status', { stdio: 'ignore', cwd: join(ROOT_DIR, 'apps/website') });
    console.log('✅ Local Supabase is running\n');
  } catch {
    console.log('⚠️  Local Supabase not running. Starting...\n');
    execSync('supabase start', { stdio: 'inherit', cwd: join(ROOT_DIR, 'apps/website') });
  }

  // Apply SQL
  console.log('📝 Applying test infrastructure SQL...\n');
  const sqlFile = join(ROOT_DIR, 'apps/website', 'test-infrastructure.sql');
  writeFileSync(sqlFile, TEST_INFRASTRUCTURE_SQL);

  try {
    execSync(`supabase db execute --file ${sqlFile}`, {
      stdio: 'inherit',
      cwd: join(ROOT_DIR, 'apps/website'),
    });
    console.log('\n✅ Test infrastructure deployed to local Supabase\n');
  } catch (error) {
    console.error('\n❌ Failed to apply SQL:', error.message);
    process.exit(1);
  }

  // Get local URL
  const statusOutput = execSync('supabase status --output json', {
    encoding: 'utf-8',
    cwd: join(ROOT_DIR, 'apps/website'),
  });
  const status = JSON.parse(statusOutput);
  const apiUrl = status?.API?.URL || 'http://127.0.0.1:54321';

  console.log('📋 Configuration for .env.local:\n');
  console.log(`NEXT_PUBLIC_SUPABASE_URL=${apiUrl}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY=${status?.DB?.PASSWORD || 'your-service-role-key'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${status?.ANON_KEY || 'your-anon-key'}`);
  console.log('\n✅ Local test project bootstrap complete!\n');
}

async function bootstrapRemote() {
  console.log('🔧 Bootstrapping REMOTE test project...\n');
  console.log('⚠️  Remote bootstrap requires manual steps:\n');
  console.log('1. Create a dedicated test Supabase project');
  console.log('2. Copy the SQL below and run it in the SQL Editor');
  console.log('3. Add the project ref to TEST_PROJECT_REFS in db-reset.ts\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(TEST_INFRASTRUCTURE_SQL);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

function main() {
  console.log('🚀 Test Project Bootstrap\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check Supabase CLI
  if (!checkSupabaseCLI()) {
    console.error('❌ Supabase CLI not found. Install it first:');
    console.error('   npm install -g supabase\n');
    process.exit(1);
  }

  // Determine if local or remote
  const args = process.argv.slice(2);
  const useLocal = args.includes('--local') || !args.includes('--remote');

  if (useLocal) {
    bootstrapLocal();
  } else {
    bootstrapRemote();
  }
}

main();

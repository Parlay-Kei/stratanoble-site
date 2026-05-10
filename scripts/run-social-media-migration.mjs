#!/usr/bin/env node
/**
 * Run Social Media Agent database migration on Strata Noble Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read the schema SQL file
const schemaPath = 'C:\\Dev\\.claude-anx\\mcp-servers\\social-media-agent\\schema.sql';
const schemaSql = readFileSync(schemaPath, 'utf-8');

async function runMigration() {
  console.log('🚀 Running Social Media Agent migration on Strata Noble Supabase...\n');
  console.log(`📍 Target: ${SUPABASE_URL}\n`);

  try {
    // Execute the full migration SQL using the rpc function
    // We need to use the postgres function to run raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSql });

    if (error) {
      // If exec_sql doesn't exist, we need to create the tables individually
      console.log('ℹ️  Direct SQL execution not available, creating tables individually...\n');
      await createTablesIndividually();
    } else {
      console.log('✅ Migration executed successfully!\n');
      console.log('Result:', data);
    }

    // Verify tables were created
    await verifyTables();

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('\n📋 Falling back to individual table creation...\n');
    await createTablesIndividually();
  }
}

async function createTablesIndividually() {
  // Since we can't run raw SQL directly, let's verify if tables exist
  // and provide guidance for manual execution

  const tables = [
    'social_accounts',
    'social_content_queue',
    'social_analytics',
    'social_automation_rules',
    'social_automation_logs',
    'social_trends',
    'social_compliance_audit',
    'social_content_templates'
  ];

  console.log('Checking existing tables...\n');

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        console.log(`❌ ${table} - NOT FOUND (needs creation)`);
      } else if (error) {
        console.log(`⚠️  ${table} - Error: ${error.message}`);
      } else {
        console.log(`✅ ${table} - EXISTS`);
      }
    } catch (e) {
      console.log(`❌ ${table} - Error checking: ${e.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('MANUAL MIGRATION REQUIRED');
  console.log('='.repeat(60));
  console.log('\nThe Supabase JS client cannot run DDL statements directly.');
  console.log('Please run the migration SQL manually:\n');
  console.log('1. Open: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/sql/new');
  console.log('2. Paste contents of: C:\\Dev\\.claude-anx\\mcp-servers\\social-media-agent\\schema.sql');
  console.log('3. Click "Run"\n');
}

async function verifyTables() {
  console.log('\n📊 Verifying table creation...\n');

  const tables = [
    'social_accounts',
    'social_content_queue',
    'social_analytics',
    'social_automation_rules',
    'social_automation_logs',
    'social_trends',
    'social_compliance_audit',
    'social_content_templates'
  ];

  let allExist = true;

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);

      if (error && error.code === '42P01') {
        console.log(`❌ ${table} - MISSING`);
        allExist = false;
      } else if (error && error.code !== 'PGRST116') {
        console.log(`⚠️  ${table} - ${error.message}`);
      } else {
        console.log(`✅ ${table} - OK`);
      }
    } catch (e) {
      console.log(`❌ ${table} - Error: ${e.message}`);
      allExist = false;
    }
  }

  if (allExist) {
    console.log('\n🎉 All Social Media Agent tables are ready!');
  } else {
    console.log('\n⚠️  Some tables are missing. Run the SQL migration manually.');
  }
}

runMigration();

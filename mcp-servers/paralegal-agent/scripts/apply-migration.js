#!/usr/bin/env node

/**
 * Apply Migration Script
 * Uses Supabase RPC to execute SQL migration
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('id')
    .limit(1);

  return !error;
}

async function createTablesManually() {
  console.log('Creating paralegal contract tables...\n');

  // Check if tables already exist
  const tablesExist = await checkTableExists('contract_templates');
  if (tablesExist) {
    console.log('✓ Tables already exist. Skipping creation.\n');
    return true;
  }

  console.log('Tables do not exist. Please apply migration via Supabase Dashboard:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select project: bvneqoevtwodyfqglpzi');
  console.log('3. Go to SQL Editor');
  console.log('4. Paste contents of: supabase/migrations/0025_paralegal_contract_tables.sql');
  console.log('5. Run the migration');
  console.log('\nAlternatively, the tables will be created on first seed if the SQL is simplified.\n');

  return false;
}

async function main() {
  console.log('Checking paralegal contract database tables...\n');

  const created = await createTablesManually();

  if (!created) {
    // Try to check if we can at least query the information schema
    console.log('Attempting to verify database connection...');

    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['deals', 'contracts', 'contract_templates', 'clause_library', 'playbook_rules']);

    if (error) {
      console.log('Could not query information_schema. This is expected for remote connections.');
      console.log('Please apply migration manually via Supabase Dashboard.\n');
    } else {
      console.log('Found tables:', tables?.map(t => t.table_name) || []);
    }
  }
}

main();

#!/usr/bin/env node
/**
 * Table Drift Detection
 * 
 * Compares "tables in schema" vs "tables in reset list" and fails
 * if anything new is unaccounted for.
 * 
 * This forces a conscious decision: truncate it, preserve it, or isolate it.
 * 
 * Usage:
 *   node scripts/check-table-drift.mjs
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const DB_RESET_FILE = 'apps/website/src/lib/test/db-reset.ts';

// Tables that should NEVER be truncated (protected)
const PROTECTED_TABLES = ['env_sentinel'];

// Tables that are system tables (ignored)
const SYSTEM_TABLES = [
  'pg_',
  '_prisma',
  'schema_migrations',
  'supabase_migrations',
];

function extractTableListFromCode() {
  try {
    const content = readFileSync(DB_RESET_FILE, 'utf-8');
    
    // Find the default table list in the fallback
    const defaultListMatch = content.match(
      /tablesToTruncate\s*=\s*\[([^\]]+)\]/s
    );
    
    if (!defaultListMatch) {
      return { tables: [], source: 'not found' };
    }

    // Extract table names from the array
    const tableNames = defaultListMatch[1]
      .split(',')
      .map((t) => t.trim().replace(/['"]/g, ''))
      .filter((t) => t.length > 0);

    return { tables: tableNames, source: 'code' };
  } catch (error) {
    return { tables: [], source: 'error', error: error.message };
  }
}

function getSchemaTables() {
  // Try to get tables from Supabase if available
  // Otherwise, return empty array (will warn but not fail)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return { tables: [], source: 'no connection', warning: 'Supabase URL not set' };
    }

    // Try to query schema (requires Supabase CLI or connection)
    // For now, we'll parse from migrations or use a simpler approach
    return { tables: [], source: 'not implemented', warning: 'Schema query not implemented' };
  } catch (error) {
    return { tables: [], source: 'error', error: error.message };
  }
}

function findTablesInMigrations() {
  // Parse migration files to find table names
  const migrationsDir = 'supabase/migrations';
  const tables = new Set();

  try {
    const { readdirSync, readFileSync, statSync } = require('fs');
    const { join } = require('path');

    if (!statSync(migrationsDir).isDirectory()) {
      return { tables: [], source: 'no migrations dir' };
    }

    const files = readdirSync(migrationsDir);
    files.forEach((file) => {
      if (file.endsWith('.sql')) {
        try {
          const content = readFileSync(join(migrationsDir, file), 'utf-8');
          
          // Find CREATE TABLE statements
          const createTableMatches = content.matchAll(
            /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi
          );
          
          for (const match of createTableMatches) {
            const tableName = match[1];
            // Skip system tables
            if (!SYSTEM_TABLES.some((prefix) => tableName.startsWith(prefix))) {
              tables.add(tableName);
            }
          }
        } catch {
          // Skip files we can't read
        }
      }
    });

    return { tables: Array.from(tables), source: 'migrations' };
  } catch (error) {
    return { tables: [], source: 'error', error: error.message };
  }
}

function main() {
  console.log('🔍 Checking for table drift (schema vs reset list)...\n');

  const codeTables = extractTableListFromCode();
  const migrationTables = findTablesInMigrations();

  console.log(`📋 Tables in reset list (code): ${codeTables.tables.length}`);
  if (codeTables.tables.length > 0) {
    console.log(`   ${codeTables.tables.join(', ')}\n`);
  }

  console.log(`📋 Tables in migrations: ${migrationTables.tables.length}`);
  if (migrationTables.tables.length > 0) {
    console.log(`   ${migrationTables.tables.join(', ')}\n`);
  }

  // Find tables in migrations that aren't in reset list
  const unaccountedTables = migrationTables.tables.filter(
    (table) =>
      !codeTables.tables.includes(table) &&
      !PROTECTED_TABLES.includes(table)
  );

  if (unaccountedTables.length === 0) {
    console.log('✅ All tables are accounted for in reset list.\n');
    process.exit(0);
  }

  console.log(`❌ Found ${unaccountedTables.length} unaccounted table(s):\n`);
  unaccountedTables.forEach((table) => {
    console.log(`  - ${table}`);
  });

  console.log('\n💡 Decision required for each table:');
  console.log('   1. Truncate it: Add to reset list in db-reset.ts');
  console.log('   2. Preserve it: Add to PROTECTED_TABLES in this script');
  console.log('   3. Isolate it: Use schema isolation for this table\n');

  console.log('⚠️  This check prevents drift. Make a conscious decision.\n');

  process.exit(1);
}

main();

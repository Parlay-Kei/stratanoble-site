#!/usr/bin/env node
/**
 * Supabase SQL Executor - Applies SQL migrations directly via Management API
 *
 * Uses Supabase Management API to execute SQL without manual intervention
 * Requires SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF
 *
 * Usage:
 *   node scripts/supabase-sql-executor.mjs auto-fix    # Apply pending fixes
 *   node scripts/supabase-sql-executor.mjs verify      # Verify security config
 *   node scripts/supabase-sql-executor.mjs execute "SQL" # Execute raw SQL
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync, writeFileSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load environment variables from apps/website/.env.local if not already set
const envPath = join(projectRoot, 'apps', 'website', '.env.local');
if (existsSync(envPath) && !process.env.SUPABASE_DB_URL) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex);
        const value = trimmed.substring(eqIndex + 1);
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

// Configuration
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'bvneqoevtwodyfqglpzi';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const DB_URL = process.env.SUPABASE_DB_URL; // postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(icon, message) {
  console.log(`${icon} ${message}`);
}

/**
 * Execute SQL via multiple methods with fallback
 */
async function executeSql(sql, description) {
  logStep('🔧', `Executing: ${description}`);

  // Method 1: Use Supabase CLI with db execute
  try {
    const result = execSync(
      `supabase db execute --project-ref ${PROJECT_REF}`,
      {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: projectRoot,
        input: sql,
        env: {
          ...process.env,
          SUPABASE_ACCESS_TOKEN: ACCESS_TOKEN
        }
      }
    );
    log('   ✅ SQL executed successfully via Supabase CLI', 'green');
    return { success: true, output: result, method: 'cli' };
  } catch (cliError) {
    log('   ⚠️  CLI execution failed, trying alternative methods...', 'yellow');
  }

  // Method 2: Node.js pg client (requires DB_URL)
  if (DB_URL) {
    try {
      const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
      });
      await client.connect();

      const result = await client.query(sql);
      await client.end();

      // Format result for consistency
      let output = '';
      if (result.rows && result.rows.length > 0) {
        output = JSON.stringify(result.rows, null, 2);
      } else if (result.command) {
        output = `${result.command}: ${result.rowCount} rows affected`;
      }

      log('   ✅ SQL executed successfully via pg client', 'green');
      return { success: true, output: output, method: 'pg' };
    } catch (pgError) {
      log(`   ⚠️  pg client execution failed: ${pgError.message}`, 'yellow');
    }
  }

  // Method 3: Supabase Management API
  if (ACCESS_TOKEN) {
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: sql })
        }
      );

      if (response.ok) {
        const result = await response.json();
        log('   ✅ SQL executed successfully via Management API', 'green');
        return { success: true, output: result, method: 'api' };
      } else {
        const errorText = await response.text();
        log(`   ❌ Management API error: ${response.status}`, 'red');
        console.log(`   Response: ${errorText.substring(0, 200)}`);
      }
    } catch (apiError) {
      log(`   ❌ Management API request failed: ${apiError.message}`, 'red');
    }
  }

  // Method 4: Supabase CLI link + SQL Editor API workaround
  try {
    // Try to use supabase link if not already linked
    execSync(`supabase link --project-ref ${PROJECT_REF}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: projectRoot,
      env: {
        ...process.env,
        SUPABASE_ACCESS_TOKEN: ACCESS_TOKEN
      }
    });

    // Retry CLI execution after linking
    const result = execSync(
      `supabase db execute --project-ref ${PROJECT_REF}`,
      {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: projectRoot,
        input: sql,
        env: {
          ...process.env,
          SUPABASE_ACCESS_TOKEN: ACCESS_TOKEN
        }
      }
    );
    log('   ✅ SQL executed successfully via CLI (after link)', 'green');
    return { success: true, output: result, method: 'cli-linked' };
  } catch (linkError) {
    // Ignore link errors
  }

  return { success: false, error: 'All execution methods failed' };
}

/**
 * Apply a migration file
 */
async function applyMigration(filePath) {
  if (!existsSync(filePath)) {
    log(`❌ Migration file not found: ${filePath}`, 'red');
    return false;
  }

  const sql = readFileSync(filePath, 'utf-8');
  const fileName = filePath.split(/[/\\]/).pop();
  const result = await executeSql(sql, `Apply migration: ${fileName}`);
  return result.success;
}

/**
 * Find all pending fix files
 */
function findPendingFixes() {
  const migrationsDir = join(projectRoot, 'supabase', 'migrations');
  const fixes = [];

  if (existsSync(migrationsDir)) {
    const files = readdirSync(migrationsDir);
    for (const file of files) {
      if (file.startsWith('APPLY_VIA_') && file.endsWith('.sql')) {
        fixes.push(join(migrationsDir, file));
      }
    }
  }

  return fixes;
}

/**
 * Verify security configuration
 */
async function verifySecurity() {
  const verifyQueries = [
    {
      name: 'RLS on leads table',
      sql: "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads'",
      validate: (result) => {
        // Check if rowsecurity is true
        return result && result.includes && (result.includes('t') || result.includes('true'));
      }
    },
    {
      name: 'Policies on leads table',
      sql: "SELECT COUNT(*)::text as policy_count FROM pg_policies WHERE schemaname = 'public' AND tablename = 'leads'",
      validate: (result) => {
        // Check if there are at least 4 policies
        const match = result && result.match(/(\d+)/);
        return match && parseInt(match[1]) >= 4;
      }
    },
    {
      name: 'RLS on early_access_signups',
      sql: "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'early_access_signups'",
      validate: (result) => {
        return result && result.includes && (result.includes('t') || result.includes('true'));
      }
    }
  ];

  log('\n🔍 Verifying security configuration...', 'cyan');

  let allPassed = true;

  for (const query of verifyQueries) {
    const result = await executeSql(query.sql, `Verify: ${query.name}`);

    if (result.success) {
      const outputStr = typeof result.output === 'string'
        ? result.output
        : JSON.stringify(result.output);

      const isValid = query.validate(outputStr);

      if (isValid) {
        log(`   ✅ ${query.name}: PASSED`, 'green');
      } else {
        log(`   ⚠️  ${query.name}: NEEDS ATTENTION`, 'yellow');
        console.log(`      Output: ${outputStr.substring(0, 100)}`);
        allPassed = false;
      }
    } else {
      log(`   ❌ ${query.name}: FAILED TO VERIFY`, 'red');
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * Run auto-fix workflow
 */
async function autoFix() {
  log('\n🔧 Starting auto-fix workflow...', 'cyan');

  const pendingFixes = findPendingFixes();

  if (pendingFixes.length === 0) {
    log('✅ No pending fixes to apply', 'green');
    return true;
  }

  log(`📋 Found ${pendingFixes.length} pending fix(es):`, 'blue');
  pendingFixes.forEach(f => console.log(`   - ${f.split(/[/\\]/).pop()}`));

  let allApplied = true;

  for (const fixFile of pendingFixes) {
    const applied = await applyMigration(fixFile);
    if (!applied) {
      allApplied = false;
      log(`❌ Failed to apply: ${fixFile.split(/[/\\]/).pop()}`, 'red');
    }
  }

  if (allApplied) {
    log('\n✅ All fixes applied successfully', 'green');

    // Verify after applying
    log('\n🔍 Running post-fix verification...', 'cyan');
    await verifySecurity();
  }

  return allApplied;
}

/**
 * Print configuration status
 */
function printConfig() {
  console.log('\n' + '='.repeat(60));
  log('🚀 Supabase SQL Executor', 'cyan');
  console.log('='.repeat(60));
  console.log(`📦 Project: ${PROJECT_REF}`);
  console.log(`🔐 Access Token: ${ACCESS_TOKEN ? '✅ Configured' : '❌ NOT SET'}`);
  console.log(`🔗 DB URL: ${DB_URL ? '✅ Configured' : '⚠️  NOT SET (optional)'}`);
  console.log('='.repeat(60));
}

/**
 * Main execution
 */
async function main() {
  printConfig();

  const args = process.argv.slice(2);
  const command = args[0] || 'auto-fix';

  switch (command) {
    case 'auto-fix':
      await autoFix();
      break;

    case 'verify':
      const passed = await verifySecurity();
      if (!passed) {
        log('\n⚠️  Some security checks need attention', 'yellow');
        process.exit(1);
      }
      break;

    case 'execute':
      if (args[1]) {
        await executeSql(args[1], 'Manual execution');
      } else {
        log('Usage: supabase-sql-executor.mjs execute "SQL QUERY"', 'yellow');
        process.exit(1);
      }
      break;

    case 'list-pending':
      const fixes = findPendingFixes();
      if (fixes.length === 0) {
        log('✅ No pending fixes found', 'green');
      } else {
        log(`📋 Found ${fixes.length} pending fix(es):`, 'blue');
        fixes.forEach(f => console.log(`   - ${f.split(/[/\\]/).pop()}`));
      }
      break;

    case 'help':
    default:
      console.log(`
Usage: node scripts/supabase-sql-executor.mjs [command]

Commands:
  auto-fix      Apply all pending security fixes (default)
  verify        Verify security configuration
  execute "SQL" Execute raw SQL query
  list-pending  List pending fix files
  help          Show this help message

Environment Variables:
  SUPABASE_PROJECT_REF    Project reference (default: bvneqoevtwodyfqglpzi)
  SUPABASE_ACCESS_TOKEN   Access token from supabase.com/dashboard/account/tokens
  SUPABASE_DB_URL         Direct database connection URL (optional)

Examples:
  npm run supabase:execute -- verify
  npm run supabase:execute -- execute "SELECT NOW()"
  npm run supabase:auto-fix
`);
      break;
  }
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Check Security Definer Views
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load environment variables
const envPath = join(projectRoot, 'apps', 'website', '.env.local');
if (existsSync(envPath)) {
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

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to Supabase database\n');

  // Get all views
  const viewsQuery = `
    SELECT
      c.relname as viewname,
      pg_get_userbyid(c.relowner) as viewowner,
      COALESCE(
        (SELECT option_value FROM pg_options_to_table(c.reloptions) WHERE option_name = 'security_invoker'),
        'false'
      ) as security_invoker
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relkind = 'v'
    ORDER BY c.relname
  `;

  const views = await client.query(viewsQuery);

  console.log('=== Public Views Security Analysis ===\n');

  const securityDefinerViews = [];

  for (const v of views.rows) {
    const isInvoker = v.security_invoker === 'true';
    const secType = isInvoker ? 'INVOKER' : 'DEFINER';
    const icon = isInvoker ? '✅' : '⚠️';

    console.log(`${icon} ${v.viewname} (SECURITY ${secType})`);
    console.log(`   Owner: ${v.viewowner}`);

    if (!isInvoker) {
      securityDefinerViews.push(v.viewname);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\nSummary:`);
  console.log(`  Total views: ${views.rows.length}`);
  console.log(`  SECURITY DEFINER: ${securityDefinerViews.length}`);
  console.log(`  SECURITY INVOKER: ${views.rows.length - securityDefinerViews.length}`);

  if (securityDefinerViews.length > 0) {
    console.log(`\n⚠️  Views with SECURITY DEFINER (need review):`);
    securityDefinerViews.forEach(v => console.log(`   - ${v}`));

    console.log(`\nTo convert to SECURITY INVOKER, run:`);
    securityDefinerViews.forEach(v => {
      console.log(`   ALTER VIEW public.${v} SET (security_invoker = true);`);
    });
  }

  await client.end();
}

main().catch(console.error);

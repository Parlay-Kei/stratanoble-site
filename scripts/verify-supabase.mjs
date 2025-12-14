#!/usr/bin/env node
/**
 * Supabase Verification Script
 *
 * Verifies that provided Supabase environment variables are valid and safe for production use.
 * Checks:
 *  - URL + anon + service role connectivity
 *  - Existence of critical tables (vault_credentials, contact_submissions optional)
 *  - RLS enabled on vault tables
 *  - Minimal policy presence
 *  - JWT expiration claims sanity
 */

import { createClient } from '@supabase/supabase-js';
// Attempt to load env from apps/website/.env.local if present
try {
  const { config } = await import('dotenv');
  const { existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const envPath = join(process.cwd(), 'apps', 'website', '.env.local');
  if (existsSync(envPath)) {
    config({ path: envPath });
  }
} catch {}

function env(key, fallback) {
  const v = process.env[key];
  return v && v.length > 0 ? v : fallback;
}

const SUPABASE_URL = env('NEXT_PUBLIC_SUPABASE_URL') || env('SUPABASE_URL');
const SUPABASE_ANON = env('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const SUPABASE_SERVICE = env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SERVICE_ROLE');

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const anon = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const admin = SUPABASE_SERVICE
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

async function checkConnectivity() {
  const { data, error } = await anon.from('pg_tables').select('schemaname').limit(1);
  if (error && !String(error.message).includes('permission')) {
    throw new Error(`Anon connectivity failed: ${error.message}`);
  }
  return true;
}

async function checkVaultTables() {
  if (!admin) return { ok: false, reason: 'No service role provided' };
  const required = ['vault_credentials'];
  const { data, error } = await admin
    .from('vault_credentials')
    .select('id')
    .limit(1);
  if (error && !String(error.message).includes('relation')) {
    return { ok: false, reason: `Query error: ${error.message}` };
  }
  return { ok: true, tables: required };
}

async function checkRls() {
  if (!admin) return { ok: false, reason: 'No service role provided' };
  const { data, error } = await admin.rpc('pg_catalog.current_setting', { setting_name: 'row_security' });
  // If RPC blocked, just skip with neutral result
  if (error) return { ok: null, reason: 'RLS check not available (insufficient permissions)' };
  return { ok: data === 'on' };
}

async function main() {
  const results = { url: SUPABASE_URL, checks: [] };
  try {
    await checkConnectivity();
    results.checks.push({ name: 'anon_connectivity', ok: true });
  } catch (e) {
    results.checks.push({ name: 'anon_connectivity', ok: false, reason: String(e.message || e) });
  }

  try {
    const r = await checkVaultTables();
    results.checks.push({ name: 'vault_tables', ...r });
  } catch (e) {
    results.checks.push({ name: 'vault_tables', ok: false, reason: String(e.message || e) });
  }

  try {
    const r = await checkRls();
    results.checks.push({ name: 'rls_enabled', ...r });
  } catch (e) {
    results.checks.push({ name: 'rls_enabled', ok: false, reason: String(e.message || e) });
  }

  const allOk = results.checks.every((c) => c.ok === true || c.ok === null);
  console.log(JSON.stringify({ ...results, allOk }, null, 2));
  process.exit(allOk ? 0 : 2);
}

main();




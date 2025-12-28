#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load env
const envPath = join(projectRoot, 'apps', 'website', '.env.local');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=');
      if (eq > 0) {
        const k = t.substring(0, eq);
        const v = t.substring(eq + 1);
        if (!process.env[k]) process.env[k] = v;
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

  const views = [
    'credentials_due_for_rotation',
    'current_client_metrics',
    'recent_vault_access',
    'service_credentials_summary',
    'service_health_summary'
  ];

  console.log('=== View Definitions ===\n');

  for (const viewName of views) {
    const q = `SELECT definition FROM pg_views WHERE schemaname = 'public' AND viewname = '${viewName}'`;
    const r = await client.query(q);
    console.log(`📋 ${viewName}`);
    if (r.rows[0]) {
      console.log(`Definition:\n${r.rows[0].definition}\n`);
    } else {
      console.log('Not found\n');
    }
  }

  await client.end();
}

main().catch(console.error);

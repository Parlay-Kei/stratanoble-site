#!/usr/bin/env node
/**
 * Execute SQL via Supabase Management API
 * Uses the access token from `supabase login`
 */

import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const PROJECT_REF = 'bvneqoevtwodyfqglpzi';
const SCHEMA_PATH = 'C:\\Dev\\.claude-anx\\mcp-servers\\social-media-agent\\schema.sql';

async function getAccessToken() {
  // Try to read from Supabase CLI config
  const configPaths = [
    join(homedir(), '.supabase', 'access-token'),
    join(homedir(), 'AppData', 'Roaming', 'supabase', 'access-token'),
    join(homedir(), '.config', 'supabase', 'access-token'),
  ];

  for (const path of configPaths) {
    if (existsSync(path)) {
      const token = readFileSync(path, 'utf-8').trim();
      console.log(`Found access token at: ${path}`);
      return token;
    }
  }

  // Try environment variable
  if (process.env.SUPABASE_ACCESS_TOKEN) {
    return process.env.SUPABASE_ACCESS_TOKEN;
  }

  throw new Error('No Supabase access token found. Run `supabase login` first.');
}

async function runSqlQuery(accessToken, sql) {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return await response.json();
}

async function main() {
  console.log('Social Media Agent Migration - Strata Noble\n');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`Schema: ${SCHEMA_PATH}\n`);

  try {
    // Get access token
    const accessToken = await getAccessToken();
    console.log('Access token loaded.\n');

    // Read schema
    const sql = readFileSync(SCHEMA_PATH, 'utf-8');
    console.log(`Schema loaded (${sql.length} bytes)\n`);

    // Execute
    console.log('Executing migration...\n');
    const result = await runSqlQuery(accessToken, sql);

    console.log('Migration completed successfully!\n');
    console.log('Result:', JSON.stringify(result, null, 2).substring(0, 500));

  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

main();

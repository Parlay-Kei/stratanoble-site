#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main(){
  const { data, error } = await supabase
    .from('vault_credentials')
    .select('id, service_name, credential_name, environment, updated_at')
    .ilike('service_name', '%netlify%');
  if (error){
    console.error('Query error:', error.message);
    process.exit(1);
  }
  if (!data || data.length === 0){
    console.log('No credentials found for service_name like "netlify"');
    return;
  }
  console.log('Found credentials:\n');
  for (const r of data){
    console.log(`- id=${r.id} | service=${r.service_name} | name=${r.credential_name} | env=${r.environment} | updated=${r.updated_at}`);
  }
}

main().catch(e=>{ console.error('Fatal:', e?.message || e); process.exit(1); });

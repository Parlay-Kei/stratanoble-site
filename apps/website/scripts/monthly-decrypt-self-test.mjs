#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
const VAULT_ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !VAULT_ENCRYPTION_KEY) {
  console.error('Missing env: SUPABASE_URL/SERVICE_KEY/VAULT_ENCRYPTION_KEY');
  process.exit(1);
}

function decrypt(v) {
  const key = Buffer.from(VAULT_ENCRYPTION_KEY, 'hex');
  const [ivHex, encHex, tagHex] = String(v).split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const enc = Buffer.from(encHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let dec = decipher.update(enc);
  const final = Buffer.concat([dec, decipher.final()]);
  return final.toString('utf8');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const { data, error } = await supabase
  .from('vault_credentials')
  .select('id, service_name, credential_name, environment, encrypted_value')
  .order('service_name');

if (error) { console.error('Query error:', error.message); process.exit(1); }

let pass = 0, fail = 0; const failures = [];
for (const r of (data || [])) {
  try {
    const dec = decrypt(r.encrypted_value);
    if (!dec) throw new Error('empty');
    pass++;
  } catch (e) {
    fail++; failures.push({ id: r.id, service: r.service_name, name: r.credential_name, env: r.environment, error: e.message });
  }
}

const result = { total: (data||[]).length, pass, fail, failures };
console.log(JSON.stringify(result, null, 2));
if (fail > 0) process.exit(1);

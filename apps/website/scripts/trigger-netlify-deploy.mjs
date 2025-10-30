#!/usr/bin/env node
/**
 * Trigger Netlify deploy via Vault-stored credentials and monitor status
 * Falls back to env vars if vault values are placeholders or unavailable.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const VAULT_ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

function decryptValue(encryptedValue) {
  if (!VAULT_ENCRYPTION_KEY) throw new Error('VAULT_ENCRYPTION_KEY not configured');
  const key = Buffer.from(VAULT_ENCRYPTION_KEY, 'hex');
  const [ivHex, encryptedHex, authTagHex] = String(encryptedValue).split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function tryGetVaultValue(supabase, service, name, env = 'production') {
  try {
    const { data, error } = await supabase
      .from('vault_credentials')
      .select('encrypted_value')
      .eq('service_name', service)
      .eq('credential_name', name)
      .eq('environment', env)
      .single();
    if (error || !data?.encrypted_value) return null;
    if (String(data.encrypted_value).trim().toUpperCase() === 'ENCRYPTED') return null; // placeholder
    return decryptValue(data.encrypted_value);
  } catch {
    return null;
  }
}

async function getVaultOrEnv({ supabase, service, name, envVar, env = 'production' }) {
  const v = await tryGetVaultValue(supabase, service, name, env);
  if (v) return v;
  const fallback = process.env[envVar];
  if (fallback) {
    console.log([fallback] Using  from environment for  - );
    return fallback;
  }
  throw new Error(Missing  - . Provide via Vault or set .);
}

async function triggerDeploy(token, siteId, clearCache = true) {
  const base = 'https://api.netlify.com/api/v1';
  const headers = { Authorization: Bearer , 'Content-Type': 'application/json' };
  const before = await fetch(${base}/sites//deploys?per_page=1, { headers });
  if (!before.ok) throw new Error(List deploys failed: );
  const prev = (await before.json())?.[0]?.id || null;
  const resp = await fetch(${base}/sites//builds, { method: 'POST', headers, body: JSON.stringify({ clear_cache: !!clearCache }) });
  if (!resp.ok) throw new Error(Trigger failed:  );
  let newId = null; const start = Date.now(); const timeout = 10*60*1000;
  while(Date.now()-start < timeout){
    await new Promise(r=>setTimeout(r,5000));
    const list = await fetch(${base}/sites//deploys?per_page=1, { headers });
    if(!list.ok) continue; const d = await list.json(); const latest = d?.[0];
    if(latest && latest.id !== prev){ newId = latest.id; console.log(New deploy:  ()); break; }
  }
  if(!newId) throw new Error('Timed out waiting for new deploy');
  while(Date.now()-start < timeout){
    const s = await fetch(${base}/sites//deploys/, { headers });
    if(!s.ok){ await new Promise(r=>setTimeout(r,5000)); continue; }
    const dd = await s.json();
    console.log([] state: );
    if(dd.state==='ready'){ console.log('Deploy ready.'); return; }
    if(['error','failed','canceled'].includes(dd.state)) throw new Error(Deploy  failed: );
    await new Promise(r=>setTimeout(r,7000));
  }
  throw new Error('Timed out waiting for deploy to complete');
}

async function main(){
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) console.warn('Warning: Supabase env missing; will use env fallbacks if Vault unavailable');
  const supabase = (SUPABASE_URL && SUPABASE_SERVICE_KEY) ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;
  console.log('Resolving Netlify credentials (Vault → Env fallback)...');
  const token = await getVaultOrEnv({ supabase, service: 'Netlify', name: 'API Token', envVar: 'NETLIFY_API_TOKEN' })
    .catch(async () => getVaultOrEnv({ supabase, service: 'Netlify', name: 'Deploy Token', envVar: 'NETLIFY_API_TOKEN' }));
  const siteId = await getVaultOrEnv({ supabase, service: 'Netlify', name: 'Site ID', envVar: 'NETLIFY_SITE_ID' });
  console.log('Triggering deploy (clear cache)...');
  await triggerDeploy(token, siteId, true);
}

main().catch(e=>{ console.error('Error:', e?.message || e); process.exit(1); });
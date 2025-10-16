#!/usr/bin/env node
/**
 * Trigger Netlify deploy via Vault-stored credentials and monitor status
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
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!VAULT_ENCRYPTION_KEY) throw new Error('VAULT_ENCRYPTION_KEY not configured');
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('Supabase URL/Service Key not configured');

function decryptValue(encryptedValue) {
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

async function getVaultCredential(supabase, service, name, env = 'production') {
  const { data, error } = await supabase
    .from('vault_credentials')
    .select('encrypted_value')
    .eq('service_name', service)
    .eq('credential_name', name)
    .eq('environment', env)
    .single();
  if (error) throw new Error(`Credential not found: ${service} - ${name} (${env})`);
  return decryptValue(data.encrypted_value);
}

async function triggerDeploy(token, siteId, clearCache = true) {
  const base = 'https://api.netlify.com/api/v1';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const before = await fetch(`${base}/sites/${siteId}/deploys?per_page=1`, { headers });
  if (!before.ok) throw new Error(`List deploys failed: ${before.status}`);
  const prev = (await before.json())?.[0]?.id || null;
  const resp = await fetch(`${base}/sites/${siteId}/builds`, { method: 'POST', headers, body: JSON.stringify({ clear_cache: !!clearCache }) });
  if (!resp.ok) throw new Error(`Trigger failed: ${resp.status} ${await resp.text()}`);
  let newId = null; const start = Date.now(); const timeout = 10*60*1000;
  while(Date.now()-start < timeout){
    await new Promise(r=>setTimeout(r,5000));
    const list = await fetch(`${base}/sites/${siteId}/deploys?per_page=1`, { headers });
    if(!list.ok) continue; const d = await list.json(); const latest = d?.[0];
    if(latest && latest.id !== prev){ newId = latest.id; console.log(`New deploy: ${newId} (${latest.state})`); break; }
  }
  if(!newId) throw new Error('Timed out waiting for new deploy');
  while(Date.now()-start < timeout){
    const s = await fetch(`${base}/sites/${siteId}/deploys/${newId}`, { headers });
    if(!s.ok){ await new Promise(r=>setTimeout(r,5000)); continue; }
    const dd = await s.json();
    console.log(`[${new Date().toISOString()}] state: ${dd.state}`);
    if(dd.state==='ready'){ console.log('Deploy ready.'); return; }
    if(['error','failed','canceled'].includes(dd.state)) throw new Error(`Deploy ${newId} failed: ${dd.state}`);
    await new Promise(r=>setTimeout(r,7000));
  }
  throw new Error('Timed out waiting for deploy to complete');
}

async function main(){
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  console.log('Fetching Netlify credentials from Vault...');
  const token = await getVaultCredential(supabase, 'Netlify', 'API Token', 'production');
  const siteId = await getVaultCredential(supabase, 'Netlify', 'Site ID', 'production');
  console.log('Triggering deploy (clear cache)...');
  await triggerDeploy(token, siteId, true);
}

main().catch(e=>{ console.error('Error:', e?.message || e); process.exit(1); });

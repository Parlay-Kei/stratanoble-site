#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const { data, error } = await supabase
  .from('vault_credentials')
  .select('id, service_name, credential_name, environment, next_rotation_due, is_active')
  .order('next_rotation_due', { ascending: true });

if (error) {
  console.error('Query error:', error.message);
  process.exit(1);
}

const now = Date.now();
let overdue = 0, urgent = 0, upcoming = 0;
for (const r of (data || [])) {
  if (!r.next_rotation_due) continue;
  const due = new Date(r.next_rotation_due).getTime();
  const days = Math.floor((due - now) / (1000*60*60*24));
  if (days < 0) overdue++;
  else if (days < 7) urgent++;
  else if (days < 30) upcoming++;
}
console.log(JSON.stringify({ total: data?.length || 0, overdue, urgent, upcoming, sample: (data||[]).slice(0,5) }, null, 2));

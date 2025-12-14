#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function main(){
  const email = process.argv[2];
  const newPassArg = process.argv[3];
  if(!email){ console.error('Usage: node admin-set-user.js <email> [newPassword]'); process.exit(1); }
  // Load env
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  let service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
  function loadDotenv(p){
    try{ const t = fs.readFileSync(p,'utf8'); t.split(/\r?\n/).forEach(line=>{ const m = line.match(/^([A-Z0-9_]+)=(.+)$/); if(m){ const k=m[1], v=m[2]; if(!process.env[k]) process.env[k]=v; }});}catch{}
  }
  if(!url || !service){
    loadDotenv(path.join(process.cwd(), 'apps/website/.env.local'));
    loadDotenv(path.join(process.cwd(), '.env.production'));
    url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
  }
  if(!url || !service){ console.error('Missing Supabase URL or Service Role Key'); process.exit(1); }

  const authBase = url.replace(/\/$/, '') + '/auth/v1';
  const headers = { 'apikey': service, 'Authorization': 'Bearer ' + service, 'Content-Type': 'application/json' };

  async function listUsers(page){
    const res = await fetch(authBase + '/admin/users?per_page=200&page=' + page, { headers });
    if(!res.ok) throw new Error('list users failed ' + res.status);
    return res.json();
  }
  async function findUserByEmail(e){
    for(let p=1;p<=10;p++){
      const data = await listUsers(p);
      const users = (data && data.users) ? data.users : data;
      const u = (users || []).find(x=> ((x.email||'')+'').toLowerCase()===e.toLowerCase());
      if(u) return u; if(!users || users.length===0) break;
    }
    return null;
  }
  function genTemp(){ return 'Q!' + Buffer.from(String(Date.now())).toString('base64').replace(/[^a-zA-Z0-9]/g,'').slice(0,10); }
  const newPassword = newPassArg || genTemp();

  const existing = await findUserByEmail(email);
  if(existing && existing.id){
    const res = await fetch(authBase + '/admin/users/' + existing.id, { method:'PUT', headers, body: JSON.stringify({ password: newPassword, email_confirm: true })});
    if(!res.ok){ const t=await res.text(); throw new Error('update failed ' + res.status + ' ' + t); }
    console.log(JSON.stringify({ action:'updated', email, newPassword }, null, 2));
  } else {
    const res = await fetch(authBase + '/admin/users', { method:'POST', headers, body: JSON.stringify({ email, password: newPassword, email_confirm: true })});
    if(!res.ok){ const t=await res.text(); throw new Error('create failed ' + res.status + ' ' + t); }
    console.log(JSON.stringify({ action:'created', email, newPassword }, null, 2));
  }
}

main().catch(e=>{ console.error('Error:', e.message||e); process.exit(1); });

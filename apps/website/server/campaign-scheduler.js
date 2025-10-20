// File-backed scheduler with DNC + time-window filtering
const fs = require('fs');
const path = require('path');
const { enqueue, DATA_DIR } = require('./queue');
const { metrics } = require('./metrics');

function readLeads(file) {
  const p = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(p)) throw new Error(`Leads file not found: ${p}`);
  const text = fs.readFileSync(p, 'utf8');
  if (file.endsWith('.json')) return JSON.parse(text);
  // CSV minimal: phone,name,timezoneOffset(optional minutes)
  const lines = text.split(/\r?\n/).filter(Boolean);
  const [h, ...rows] = lines;
  const head = h.split(',').map(s => s.trim());
  return rows.map(r => {
    const cols = r.split(',');
    const obj = {};
    head.forEach((k, i) => obj[k] = (cols[i] || '').trim());
    // Coerce timezoneOffset to number if present
    if (obj['timezoneOffset']) obj['timezoneOffset'] = Number(obj['timezoneOffset']);
    return obj;
  });
}

function readDnc() {
  try {
    const p = path.join(DATA_DIR, 'dnc.json');
    if (!fs.existsSync(p)) return new Set();
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (Array.isArray(data)) return new Set(data.map(String));
    if (data && Array.isArray(data.numbers)) return new Set(data.numbers.map(String));
    return new Set();
  } catch { return new Set(); }
}

function inTimeWindow(now = new Date(), window = '09:00-19:00', tzOffsetMin) {
  // If tzOffsetMin provided (minutes), adjust a copy of now by that offset vs. local
  const ref = new Date(now);
  if (typeof tzOffsetMin === 'number' && !Number.isNaN(tzOffsetMin)) {
    const localOffset = ref.getTimezoneOffset();
    const delta = tzOffsetMin - localOffset; // minutes to add to map local->lead time
    ref.setMinutes(ref.getMinutes() + delta);
  }
  const [start, end] = window.split('-');
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = ref.getHours() * 60 + ref.getMinutes();
  const startMin = sh * 60 + (sm || 0);
  const endMin = eh * 60 + (em || 0);
  return mins >= startMin && mins <= endMin;
}

function appendJsonl(rel, obj) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(path.join(DATA_DIR, rel), JSON.stringify(obj) + '\n');
}

function schedule({ leadsFile, campaignName = 'default', cps = 1, fromNumber = '+18446854828', window = '09:00-19:00' }) {
  const leads = readLeads(leadsFile);
  const dnc = readDnc();
  const now = Date.now();
  const intervalMs = Math.max(1000 / Math.max(cps, 0.1), 200);
  let offset = 0;
  let enq = 0; let suppressed = 0;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const campaignId = `cmp_${now}`;
  const info = { id: campaignId, name: campaignName, createdAt: now, totalLeads: leads.length, cps, fromNumber, window };
  appendJsonl('campaigns.jsonl', info);

  for (const lead of leads) {
    const phone = String(lead.phone || lead.to || lead.number || '').trim();
    if (!phone) { suppressed++; appendJsonl('suppressed.jsonl', { campaignId, reason: 'no_phone', lead }); continue; }
    if (dnc.has(phone)) { suppressed++; appendJsonl('suppressed.jsonl', { campaignId, phone, reason: 'dnc' }); continue; }
    const tzOffsetMin = typeof lead.timezoneOffset === 'number' ? lead.timezoneOffset : undefined;
    if (!inTimeWindow(new Date(), window, tzOffsetMin)) {
      suppressed++; appendJsonl('suppressed.jsonl', { campaignId, phone, reason: 'window' }); continue;
    }

    const at = new Date(now + offset).toISOString();
    const job = enqueue({ campaignId, type: 'outbound_call', to: phone, from: fromNumber, scheduleAt: at, lead });
    metrics.jobsQueued = (metrics.jobsQueued || 0) + 1;
    enq += 1;
    offset += intervalMs;
  }

  metrics.jobsSuppressed = (metrics.jobsSuppressed || 0) + suppressed;
  console.log(`[scheduler] Campaign ${campaignId}: enqueued=${enq} suppressed=${suppressed} of ${leads.length} at ~${cps} CPS`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const fileIdx = args.findIndex(a => a === '--leads' || a === '-l');
  const nameIdx = args.findIndex(a => a === '--name' || a === '-n');
  const cpsIdx = args.findIndex(a => a === '--cps');
  const fromIdx = args.findIndex(a => a === '--from');
  const winIdx = args.findIndex(a => a === '--window');

  if (fileIdx === -1 || !args[fileIdx + 1]) {
    console.error('Usage: node server/campaign-scheduler.js --leads path/to/leads.csv [--name Name] [--cps 1] [--from +1844...] [--window HH:MM-HH:MM]');
    process.exit(1);
  }

  schedule({
    leadsFile: args[fileIdx + 1],
    campaignName: nameIdx !== -1 ? args[nameIdx + 1] : 'default',
    cps: cpsIdx !== -1 ? Number(args[cpsIdx + 1]) : 1,
    fromNumber: fromIdx !== -1 ? args[fromIdx + 1] : '+18446854828',
    window: winIdx !== -1 ? args[winIdx + 1] : '09:00-19:00',
  });
}

module.exports = { schedule };


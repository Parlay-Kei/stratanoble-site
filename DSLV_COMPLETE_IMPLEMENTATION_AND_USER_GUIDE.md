# DSLV Cold-Calling Agent — Developer Implementation Guide and Client User Guide

Date: 2025-10-30
Status: Production-ready with scheduling interface guidance
Scope: Developers (implementation), DSLV client (daily operations)

---

## 1) System Overview

- Voice AI cold-calling agent (“Jake”) runs via Next.js API Routes with Twilio Voice.
- Campaign-aware conversations using `apps/website/src/lib/conversation-config.ts`.
- Outbound calling via Twilio, conversation loop via `/api/voice/conversation`.
- Campaign scheduling, retries, metrics via `campaign-scheduler.ts` with Supabase.
- Call evaluation via GPT-4 in `call-evaluator.ts`/`call-evaluator-dslv.ts`.

Key modules
- Conversation: `apps/website/src/app/api/voice/conversation/route.ts`
- Call init/TwiML: `apps/website/src/app/api/voice/{call,twiml}/route.ts`
- Status webhook: `apps/website/src/app/api/voice/status/route.ts`
- Scheduler: `apps/website/src/lib/campaign-scheduler.ts`
- Evaluator: `apps/website/src/lib/{call-evaluator,call-evaluator-dslv}.ts`
- Twilio client: `apps/website/src/lib/twilio.ts`

---

## 2) Environment & Prerequisites

Environment variables (apps/website/.env.local):

```env
# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER_PRIMARY=+1XXXXXXXXXX

# OpenAI
OPENAI_API_KEY=sk-...

# Supabase (for scheduler + metrics)
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or ngrok URL for webhooks
```

Install & run
```bash
cd apps/website
npm install
npm run dev
```

Port 3000 must be reachable by Twilio (use ngrok if testing on localhost).

---

## 3) Database Schema (Supabase)

Run these once (see also `DSLV_COLD_CALLING_COMPLETE_GUIDE.md`).

```sql
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('internet','voip','security','cisco')),
  status TEXT NOT NULL CHECK (status IN ('draft','scheduled','active','paused','completed')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  calling_hours JSONB NOT NULL,
  target_leads JSONB NOT NULL,
  call_config JSONB NOT NULL,
  metrics JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_schedules (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id),
  lead_id TEXT NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  timezone TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','in_progress','completed','failed','cancelled')),
  call_sid TEXT,
  connected BOOLEAN DEFAULT FALSE,
  duration_seconds INTEGER,
  outcome TEXT CHECK (outcome IN ('qualified','not_interested','callback','voicemail','no_answer','busy')),
  qualification_score INTEGER,
  next_action TEXT CHECK (next_action IN ('follow_up','send_info','schedule_callback','no_action')),
  cost_per_call DECIMAL(10,4),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_evaluations (
  id TEXT PRIMARY KEY,
  call_sid TEXT UNIQUE NOT NULL,
  campaign_type TEXT NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  qualification_score INTEGER NOT NULL,
  conversation_quality_score INTEGER NOT NULL,
  qualification JSONB NOT NULL,
  quality_metrics JSONB NOT NULL,
  outcome JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  transcript JSONB NOT NULL,
  duration_seconds INTEGER NOT NULL,
  turn_count INTEGER NOT NULL,
  evaluated_at TIMESTAMP DEFAULT NOW()
);
```

Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_call_schedules_campaign ON call_schedules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_call_schedules_scheduled ON call_schedules(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_call_evaluations_campaign ON call_evaluations(campaign_type);
CREATE INDEX IF NOT EXISTS idx_call_evaluations_score ON call_evaluations(overall_score);
```

---

## 4) API Contracts (Voice)

1) POST `/api/voice/call` — initiate outbound call
- Request (JSON):
```json
{
  "phoneNumber": "+17021234567",
  "testName": "DSLV Internet Test",
  "metadata": { "campaign_type": "internet", "lead_id": "lead_1", "schedule_id": "sched_1" }
}
```
- Response (200):
```json
{ "success": true, "callSid": "CA...", "message": "Test call initiated", "campaignType": "internet" }
```

2) GET/POST `/api/voice/twiml` — TwiML entrypoint
- Accepts query/form `campaignType`, optional `AnsweredBy`.
- Redirects to `/api/voice/conversation?campaignType=...` when human.

3) GET `/api/voice/conversation` — initial greeting
- TwiML `<Gather>` with Jake’s greeting (Polly.Matthew voice).

4) POST `/api/voice/conversation` — conversation turn
- Twilio sends `CallSid`, `SpeechResult`, `Confidence` as form fields.
- Returns TwiML with AI response and next `<Gather>`.

5) POST `/api/voice/status` — status webhook
- Twilio sends status updates (e.g., `CallStatus`, `CallDuration`).
- Implementation logs JSONL to `apps/website/.data/call-status.jsonl` (optional).

---

## 5) Core Libraries — How to Use

Conversation config (`conversation-config.ts`)
- `getSystemPrompt(campaignType)` returns Jake’s campaign-specific prompt.
- `conversationHelpers` provides `isEndingCall`, contact extraction, pain point detection.
- `calculateQualificationScore`, `extractQualificationData` for downstream analytics.

Scheduler (`campaign-scheduler.ts`)

```ts
import { campaignScheduler } from '@/lib/campaign-scheduler';

// 1) Create a campaign
const campaign = await campaignScheduler.createCampaign({
  name: 'Nevada Internet - Q4',
  type: 'internet',
  start_date: new Date(),
  calling_hours: { start:'09:00', end:'17:00', timezone:'America/Los_Angeles', days_of_week:[1,2,3,4,5] },
  target_leads: { list_name:'nevada_internet_q4', estimated_count: 100 },
  call_config: { max_attempts:3, retry_delay_hours:24, concurrent_calls:5, answering_machine_action:'leave_message', call_recording_enabled:true },
});

// 2) Schedule calls for imported leads
await campaignScheduler.scheduleCallsForCampaign(campaign.id, leads /* array with {id, phone, ...} */);

// 3) Execute pending calls (cron job every 5 minutes)
const batch = await campaignScheduler.getNextCallBatch(10);
for (const s of batch) {
  const lead = await getLeadById(s.lead_id);
  await initiateTestCall({ to: lead.phone, testName: `Campaign ${s.campaign_id}`, campaignType: campaign.type, metadata: { lead_id: s.lead_id, schedule_id: s.id, campaign_type: campaign.type } });
}

// 4) Update result after completion
await campaignScheduler.updateCallResult(scheduleId, { call_sid, connected, duration_seconds, outcome:'qualified', qualification_score: 78, next_action:'schedule_callback' });

// Pause/Resume
await campaignScheduler.pauseCampaign(campaign.id);
await campaignScheduler.resumeCampaign(campaign.id);

// Retry a failed/no-answer schedule
await campaignScheduler.scheduleRetry(scheduleId);
```

Evaluator (`call-evaluator.ts`)
```ts
import { callEvaluator } from '@/lib/call-evaluator';
const evaluation = await callEvaluator.evaluateCall(callSid, 'internet', transcriptMessages, durationSeconds);
// Persist to DB and attach to campaign metrics as needed
```

Twilio (`twilio.ts`)
```ts
import { initiateTestCall } from '@/lib/twilio';
await initiateTestCall({ to: '+17021234567', testName:'DSLV Internet Test', campaignType:'internet', metadata:{ campaign_type:'internet' }});
```

---

## 6) Background Worker / Cron

Use any scheduler (crontab, PM2, GitHub Actions) to run every 5 minutes.

```ts
// apps/website/scripts/execute-calls.ts
import { campaignScheduler } from '@/lib/campaign-scheduler';
import { initiateTestCall } from '@/lib/twilio';

async function run() {
  const batch = await campaignScheduler.getNextCallBatch(10);
  for (const s of batch) {
    const lead = await getLeadById(s.lead_id);
    const { callSid } = await initiateTestCall({
      to: lead.phone,
      testName: `Campaign ${s.campaign_id}`,
      campaignType: 'internet',
      metadata: { campaign_type:'internet', schedule_id: s.id, lead_id: s.lead_id },
    });
    console.log('Call started:', callSid);
  }
}
run().catch(console.error);
```

Crontab (example)
```cron
*/5 * * * * node /absolute/path/apps/website/scripts/execute-calls.js
```

---

## 7) Admin Interface Specification (Initialize & Schedule Anytime)

Target page to enhance: `apps/website/src/app/cold-calling/page.tsx` (exists)

Recommended UI sections
- Campaigns
  - List campaigns (status, type, period, metrics)
  - Create/Configure campaign (form fields map to `Campaign`)
  - Actions: Activate, Pause, Resume, Complete
- Leads
  - CSV upload (id, name, phone, company)
  - Map columns, preview, import (store leads in your CRM/DB; only `lead_id`/phone needed for scheduler)
- Scheduling
  - Set calling hours/timezone/days
  - Button “Schedule Calls” → calls `scheduleCallsForCampaign`
  - Show next window preview
- Execution
  - “Run Now” (manual trigger for `getNextCallBatch` for testing)
  - Concurrency control (max concurrent calls)
- Monitoring
  - Real-time status feed (reads JSONL or DB metrics)
  - Metrics tiles: calls placed, connected, qualified, appointments, opt-outs, cost, conversion
  - Filters by campaign/date
- Compliance
  - DNC list management (pages exist at `apps/website/src/app/dnc/page.tsx`)
- Settings
  - Twilio number, OpenAI model, default voice

Minimal API endpoints (if needed)
- GET/POST `/api/cold-calling/campaigns` (already present directory)
- POST `/api/campaigns/window` (exists) to preview scheduling windows
- POST `/api/voice/call` to dial test/manual calls

---

## 8) Developer Tasks Checklist

- [ ] Configure `.env.local` with Twilio, OpenAI, Supabase.
- [ ] Create DB tables and indexes in Supabase.
- [ ] Verify API routes `/api/voice/*` are reachable (ngrok for Twilio).
- [ ] Build Admin UI on `cold-calling/page.tsx` with the sections above.
- [ ] Implement CSV import (map to your leads storage).
- [ ] Wire buttons to Scheduler methods and `/api/voice/call`.
- [ ] Add background job (cron/PM2) to execute pending calls.
- [ ] Persist call evaluations to `call_evaluations` (optional now, recommended).
- [ ] Add monitoring tiles sourced from `campaigns.metrics`.
- [ ] Test all 4 campaign types.

---

## 9) DSLV Client User Guide (Operate At Will)

Prerequisites
- Environment configured; system online.
- Your phone added for testing.

Daily Flow
1) Create a campaign
   - Go to Cold Calling → “Create Campaign”
   - Select type (Internet, VoIP, Security, Cisco)
   - Set dates, calling hours, timezone, days
2) Import leads (CSV)
   - Upload list (business name, phone at minimum)
   - Confirm E.164 phone format (+1XXXXXXXXXX)
3) Schedule calls
   - Click “Schedule Calls” → system distributes across windows
   - Review schedule preview
4) Start/Run
   - Toggle campaign to “Active”
   - Optionally press “Run Now” to kick off a batch
5) Monitor
   - Watch Calls Placed / Connected / Qualified / Appointments
   - Review any opt-outs in Compliance → DNC
6) Follow up
   - Review qualified leads; schedule callbacks/appointments
7) Pause/Resume
   - Use the campaign controls when needed

Manual Test Call
- Cold Calling → “Manual Dial” → enter your phone → choose campaign → click “Call”.

Troubleshooting (quick)
- Phone not ringing: check number format, Twilio balance, server online, ngrok URL.
- No AI response: verify `OPENAI_API_KEY` and logs in dev server.
- Too robotic: adjust `conversation-config.ts` (persona/script), keep replies short.
- High opt-outs: refine targeting, soften opening.

Safety & Compliance
- Honor DNC immediately; use DNC page to manage.
- Include recording disclosure (greeting already includes it in docs).
- Respect business hours and time zones.

---

## 10) Testing & Verification

Script (interactive)
```bash
cd apps/website
node scripts/test-cold-calling.js
```

cURL examples
```bash
curl -X POST http://localhost:3000/api/voice/call \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+17021234567","testName":"Internet","metadata":{"campaign_type":"internet"}}'
```

Success indicators
- Phone rings in 5–10 seconds, Jake greets naturally.
- Conversation loops with short, campaign-aware responses.
- Console logs show qualification extraction.

---

## 11) Operations Runbook

Restart dev server (Windows)
```powershell
# Find process on port 3000
netstat -ano | findstr ":3000"
# Kill by PID (replace 12345)
taskkill /PID 12345 /F
# Restart
cd apps/website
npm run dev
```

Rotate Twilio number (if spam-flagged)
- Provision a new number in Twilio; update `.env.local` `TWILIO_PHONE_NUMBER_PRIMARY`.

Scale concurrency
- Adjust `call_config.concurrent_calls` and cron frequency.

---

## 12) Extensibility

Add a new campaign type
- Update `CampaignType`
- Add new script in `conversation-config.ts`
- Include in `getSystemPrompt()` mapping
- Surface in Admin UI campaign type dropdown

Swap TTS or STT provider
- Current voice uses Twilio `<Say>` (Polly.Matthew). ElevenLabs file-serve `<Play>` can be added later.

Persist transcripts & evaluations
- Store `messages`, `evaluation` JSON in Supabase for analytics dashboards.

---

## 13) Reference Pointers

- Voice routes: `apps/website/src/app/api/voice/*`
- Config & prompts: `apps/website/src/lib/conversation-config.ts`
- Scheduler: `apps/website/src/lib/campaign-scheduler.ts`
- Evaluator: `apps/website/src/lib/call-evaluator.ts`
- Test script: `apps/website/scripts/test-cold-calling.js`
- DNC UI: `apps/website/src/app/dnc/page.tsx`

---

This guide equips developers to finalize the scheduling interface and background execution, and enables DSLV operators to initialize, schedule, run, and monitor campaigns at will.

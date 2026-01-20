# RUN_DIRECTIVE_LINKEDIN_INBOX_DAILY_TRIAGE_V1

OCS: PRESS PLAY — LINKEDIN INBOX DAILY TRIAGE (Draft-First)

## Goal
Check LinkedIn inbound messages + Service Requests daily, triage leads, draft responses, and escalate only high-fit conversations to Steve.

## Cadence
Run DAILY at 9:00am America/Los_Angeles
Draft-first mode by default (NO sending unless explicitly approved).

## Primary Channels
1. LinkedIn Messages inbox
2. LinkedIn Service Page Requests inbox ("Strata Noble's Services")

## Definition of "New"
- Unreplied threads
- New messages in existing threads
- New Service Requests submitted in last 24 hours

---

## PHASE 1 — INTAKE (Collect + Snapshot)

1. Navigate to LinkedIn inbox (messages) and Service Requests.
2. Capture proof screenshots of:
   - Inbox overview showing unread/new items
   - Each thread or request opened (top portion + their last message)
3. Extract structured lead data per item:
   - Name
   - Profile headline + company (if visible)
   - What they want (plain English)
   - Business type (service business, agency, consultant, healthcare, etc.)
   - Urgency/timing cues
   - Any budget cues

**Output**:
- `LEAD_INTAKE.json` (structured list)
- Proof screenshots saved to proof pack folder

---

## PHASE 2 — TRIAGE (Score + Classify)

For each lead, assign:

### A) Fit Score (0–10)
- +3 if service business or consultant/agency that sells delivery
- +2 if they clearly want pipeline/CRM/follow-up
- +2 if they mention missed leads / booking / conversion / automation
- +1 if they have team size 1–50
- -3 if they want custom app / dev build / SaaS engineering
- -2 if they want unrelated admin (credentialing, HR paperwork, etc.)
- -2 if they are vague with "synergy" only and no clear next step

### B) Lead Type (one label)
- `PIPELINE_CLIENT` (direct customer)
- `REFERRAL_PARTNER` (agency/consultant partner)
- `WRONG_FIT` (not our lane)
- `LOW_SIGNAL` (unclear ask)
- `REACTIVATION` (existing thread needs follow-up)

### C) Priority
- **P0**: Fit ≥ 8 AND clear request OR ready to book
- **P1**: Fit 6–7 needs qualification
- **P2**: Fit ≤ 5 or wrong-fit

**Output**:
- `LEAD_TRIAGE_REPORT.md`

---

## PHASE 3 — RESPONSE DRAFTING (No Send)

Draft a reply for each lead based on lead type.

### Rules
- Keep it short
- Ask 2–3 qualifying questions max
- Anchor pricing without being pushy
- Offer next step: 15-min call OR quick written intake

### TEMPLATE 1: PIPELINE_CLIENT (direct buyer)
```
Hey <Name> — appreciate you reaching out.
If I understand it right, you're trying to <their goal in 8–12 words>.

Quick check so I scope it correctly:
1) Where do leads come from right now? (ads, IG, referrals, website, calls)
2) What's the main leak? (slow follow-up, no-shows, no tracking, weak close)
3) What tool stack are you using today? (CRM, calendar, SMS/email)

If you want, I can do a quick audit + build plan ($250), then implement the full pipeline if it makes sense.
```

### TEMPLATE 2: REFERRAL_PARTNER (agency/consultant)
```
Hey <Name> — I'm aligned.
I plug in as the fulfillment arm after you close, so you keep the relationship and I deliver the system build.

What do your clients usually need right after they buy?
(lead capture + follow-up, CRM setup, booking flow, onboarding, reporting)

If you want, we can start with one client project and see how we work together.
```

### TEMPLATE 3: WRONG_FIT
```
Hey <Name> — thanks for reaching out.
That's outside the work I'm focused on right now.
If you ever need lead-to-booking pipeline setup (follow-up automation + scheduling + CRM visibility), I can help with that.
```

### TEMPLATE 4: LOW_SIGNAL / UNCLEAR
```
Hey <Name> — I'm open.
What are you trying to improve right now: more booked calls, fewer no-shows, cleaner follow-up, or better lead tracking?
If you give me 2–3 sentences on the current process, I'll tell you the fastest fix.
```

**Output**:
- `DRAFT_REPLIES.md` (one section per lead, ready to paste)

---

## PHASE 4 — ESCALATION TO STEVE (Approval Gate)

Escalate only:
- P0 leads
- P1 leads with clear pipeline need
- Any lead mentioning budget, urgency, or immediate timeline

Create a short "Decision Card" per escalated lead:
- Action recommended (send draft / book call / decline)
- Why
- Risk level (Low/Med/High)
- Expected receipt (what outcome we'll get)

**Output**:
- `STEVE_APPROVAL_QUEUE.md`

---

## PHASE 5 — OPTIONAL SEND MODE (Only With Explicit Approval)

Default is DRAFT ONLY.
If Steve explicitly approves "SEND," then:
- Send the drafted reply
- Capture screenshot proof of the sent message
- Update receipt

---

## FINAL DELIVERABLES (Daily)

### Folder
```
proof-packs/linkedin-inbox-triage/YYYY-MM-DD/run-<id>/
```

### Files
- `LEAD_INTAKE.json`
- `LEAD_TRIAGE_REPORT.md`
- `DRAFT_REPLIES.md`
- `STEVE_APPROVAL_QUEUE.md`
- `LINKEDIN_INBOX_TRIAGE_RECEIPT.md`
- Proof screenshots (in `/screenshots`)

---

## Success Criteria
- Inbox and requests reviewed
- Every new lead has a draft response
- Only high-fit items escalate to Steve
- All actions evidenced via proof pack

---

## Usage

```bash
# Run full triage (all 5 phases)
npx ts-node scripts/linkedin-inbox-triage.ts full

# Run individual phases
npx ts-node scripts/linkedin-inbox-triage.ts intake
npx ts-node scripts/linkedin-inbox-triage.ts triage
npx ts-node scripts/linkedin-inbox-triage.ts draft
npx ts-node scripts/linkedin-inbox-triage.ts escalate

# Send approved message
npx ts-node scripts/linkedin-inbox-triage.ts send --id=<leadId>
```

---

**Directive Version**: v1.0
**Created**: 2026-01-20
**Agent Script**: `scripts/linkedin-inbox-triage.ts`

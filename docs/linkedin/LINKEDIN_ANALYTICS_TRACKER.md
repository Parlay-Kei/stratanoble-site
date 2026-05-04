# LinkedIn Analytics Tracker (Lightweight)

**Mission ID:** ANX-LINKEDIN-MGMT-0001  
**Purpose:** Track decision-grade performance without heavy reporting overhead.

## Tracking Fields (Per Post)

| Field | Description |
|---|---|
| Post ID | Unique ID (e.g., LI-2026-04-01) |
| Publish Date | Date/time posted |
| Pillar | One of 10 approved pillars |
| Hook Type | Problem, Contrarian, Story, Offer, Checklist |
| CTA Type | Comment CTA, DM CTA, Soft CTA |
| Impressions | From LinkedIn |
| Reactions | Total reactions |
| Comments | Total comments |
| Saves/Reposts | If available |
| Qualified Comments | Comments from target audience fit |
| Qualified DMs | DMs from audience fit |
| Calls Booked | Calls attributed to post |
| Notes | What worked / what missed |

## Weekly Rollup

Track:
- Total posts published
- Total comments posted (outbound engagement)
- Qualified conversations started
- Calls booked
- Top hook
- Top CTA
- Weakest post and likely reason

## Monthly Rollup

Track:
- Best performing pillar (by qualified conversations)
- Underperforming pillar(s)
- Conversion rate: calls booked / qualified DMs
- 3 insights to carry into next month
- 3 changes to next content calendar

## Suggested Storage Format

Use either:
1. Simple Notion table with above fields, or
2. Google Sheet tab with weekly and monthly summary tabs

## Decision Rules

- Keep formats that produce qualified DMs/calls, not just reach.
- If 3 posts in a row underperform, swap hook style and CTA.
- If comments are high but DMs are low, tighten offer clarity.
- If impressions are low, improve first-line hook and post timing.

## Week 001 Execution Log (ANX-LINKEDIN-WEEK-001-PUBLISH-LOOP)

### Pre-Publish Status

| Post ID | Title | Planned Day | Approval Status | Publish Status | Blocker |
|---|---|---|---|---|---|
| W1-P01 | The Hidden Cost of Messy Intake | Monday | APPROVED | POSTED 2026-04-27T08:48 PT | urn:li:share:7454557152544784384 |
| W1-P02 | Why Automation Fails in Small Teams | Wednesday | APPROVED | POSTED 2026-04-29T08:52 PT | urn:li:share:7455282752842756096 |
| W1-P03 | Revenue Leakage Checklist | Friday | APPROVED | POSTED |  |

### Week 1 Comment Plan

| Comment Ref | Target Category | Status |
|---|---|---|
| C01 | service business owner | APPROVED_PENDING_USE |
| C04 | local business operator | APPROVED_PENDING_USE |
| C06 | AI automation builder | HOLD_DO_NOT_USE_THIS_WEEK |
| C11 | operations consultant | APPROVED_PENDING_USE |
| C19 | solopreneur | APPROVED_PENDING_USE |

### Publish Data Capture Template (Fill After Approval + Posting)

| Post ID | Permalink | Screenshot Path | Date/Time Posted | 24h Snapshot (impressions/reactions/comments) | Notes |
|---|---|---|---|---|---|
| W1-P01 | https://www.linkedin.com/feed/update/urn:li:share:7454557152544784384 | N/A -- REST API | 2026-04-27T15:48:56Z | 23 impressions / 1 reaction / 1 comment (spam) / 0 reposts -- captured run-45 2026-04-28 | Receipt: RECEIPT_W1-P01_2026-04-27T15-48-56Z.md |
| W1-P02 | https://www.linkedin.com/feed/update/urn:li:share:7455282752842756096 | N/A -- REST API | 2026-04-29T15:52:27Z | 11 impressions / 7 members reached / 1 reaction / 0 comments / 0 reposts / 0 saves -- captured run-53 2026-04-30T15:52Z | Receipt: RECEIPT_W1-P02_2026-04-29T15-52-27Z.md |
| W1-P03 | https://www.linkedin.com/feed/update/urn:li:share:7453556041096794113 | N/A — REST API | 2026-04-24T21:30:42Z | 4 impressions / 2 members reached / 0 reactions / 0 comments / 0 reposts -- captured run-53 2026-04-30T16:00Z (5d post-publish; T+24h window was overdue) | Receipt: RECEIPT_W1-P03_2026-04-24T21-30-42Z.md |

## Week 002 Execution Log (ANX-LINKEDIN-WEEK-002)

### Pre-Publish Status

| Post ID | Title | Planned Day | Approval Status | Publish Status | URN |
|---|---|---|---|---|---|
| W2-P01 | The Operational Physics Do Not Change (POV-05) | Monday 2026-05-04 | APPROVED | POSTED 2026-05-04T21:34Z | urn:li:share:7457182272589516800 |
| W2-P02 | Automation Starts With a Written Process (POV-04) | Wednesday 2026-05-06 | APPROVED | BLOCKED_PENDING_PUBLISH | — |
| W2-P03 | Reporting Is a Question-Formulation Problem (POV-09) | Friday 2026-05-08 | APPROVED | BLOCKED_PENDING_PUBLISH | — |

### Publish Data Capture

| Post ID | Permalink | Screenshot Path | Date/Time Posted | 24h Snapshot | Notes |
|---|---|---|---|---|---|
| W2-P01 | https://www.linkedin.com/feed/update/urn:li:share:7457182272589516800 | N/A -- REST API | 2026-05-04T21:34:00Z | PENDING_T24 (due 2026-05-05T21:34Z) | Receipt: RECEIPT_W2-P01_2026-05-04T21-34-00Z.md |
| W2-P02 | — | — | — | — | Scheduled Wed 2026-05-06 |
| W2-P03 | — | — | — | — | Scheduled Fri 2026-05-08 |


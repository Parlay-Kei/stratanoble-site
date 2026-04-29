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
| W1-P02 | Why Automation Fails in Small Teams | Wednesday | APPROVED | BLOCKED_PENDING_PUBLISH | Notion API object_not_found for configured database ID |
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
| W1-P01 | BLOCKED | BLOCKED | NOT_POSTED | NOT_AVAILABLE | Approved copy preserved for Monday manual/authorized publish |
| W1-P02 | BLOCKED | BLOCKED | NOT_POSTED | NOT_AVAILABLE | Approved copy preserved for Wednesday manual/authorized publish |
| W1-P03 | https://www.linkedin.com/feed/update/urn:li:share:7453556041096794113 | N/A — REST API | 2026-04-24T21:30:42Z | PENDING_T24 | Receipt: RECEIPT_W1-P03_2026-04-24T21-30-42Z.md |


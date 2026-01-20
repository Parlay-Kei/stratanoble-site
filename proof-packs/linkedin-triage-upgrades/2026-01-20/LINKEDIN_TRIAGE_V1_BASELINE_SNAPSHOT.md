# LinkedIn Triage V1 Baseline Snapshot

**Date**: 2026-01-20
**Run ID**: baseline-2026-01-20T15-48-08
**Purpose**: Capture current state before humanization + vendor filter upgrade

---

## Current Templates (As-Is)

### PIPELINE_CLIENT
```
Hey {Name}, appreciate you reaching out.

Quick question so I don't guess:
Where are your leads coming from right now?

If you tell me that, I'll point you to the fastest fix.
If it makes sense, we can do a quick 15-min call this week.
```

### REFERRAL_PARTNER
```
Hey {Name}, I'm open to that.

When you close a client, what do they usually need built right after?
CRM setup, follow-up automation, booking flow, onboarding, reporting?

If you've got one client to test with, I can take delivery and you stay on the relationship.
```

### WRONG_FIT
```
Hey {Name}, appreciate the message.

That's not the lane I'm focused on right now.
If you ever need help building a lead-to-booking pipeline, I can help with that.
```

### LOW_SIGNAL
```
Hey {Name}, I'm open.

What are you trying to improve right now?
More booked calls, faster follow-up, fewer no-shows, or cleaner lead tracking?

Give me the short version and I'll tell you what I'd build.
```

### REACTIVATION
```
Hey {Name}, circling back on this.

Still working on that pipeline system, or did this move to the back burner?
If timing's better now, tell me what you're trying to fix and I'll point you in the right direction.
```

### ALREADY_REPLIED
```
Hey {Name}, I'm open.

What are you trying to improve right now?
More booked calls, faster follow-up, fewer no-shows, or cleaner lead tracking?

Give me the short version and I'll tell you what I'd build.
```

### VENDOR_PITCH
```
Hey {Name}, appreciate it.
We're not looking for VA support right now, but I'll keep you in mind.
```

---

## Current Lead Types

| Type | Description |
|------|-------------|
| PIPELINE_CLIENT | Direct buyer wanting pipeline/CRM build |
| REFERRAL_PARTNER | Agency/consultant for white-label delivery |
| WRONG_FIT | Score <= 3 or dev/admin project |
| LOW_SIGNAL | Short message, unclear intent |
| REACTIVATION | Existing thread where they replied after Steve |
| ALREADY_REPLIED | Steve sent last message within 14 days, no reply |
| VENDOR_PITCH | Inbound sales pitch (VA, agency offers) |

---

## Current Scoring Logic

**Fit Score (0-10)**:
- Base: 5
- +3: Service business or consultant
- +2: Mentions pipeline, CRM, follow-up, booking
- +2: Has team (mentions employees, staff)
- +1: Clear business pain
- -2: Dev project or admin task
- -2: Spam/irrelevant

**Priority**:
- P0: Fit >= 8 AND (wants pipeline OR urgency cues)
- P1: Fit 6-7 OR budget cues with fit >= 5
- P2: Everything else

---

## Current Guardrails

1. **DRAFT-FIRST**: No sends without explicit approval
2. **Duplicate-Send Guardrail**: If Steve sent last message within 14 days AND no inbound reply, suppress
3. **Vendor Pitch Filter**: If 2+ vendor keywords detected, classify as VENDOR_PITCH and suppress

---

## Missing Components (To Be Added)

1. BOOKCALL variants with Steve-style messaging
2. Selection logic for BOOKCALL based on lead intent
3. Vendor pitch triggers list in approval queue reporting

---

**Baseline Captured By**: LinkedIn Triage Humanization Agent
**Status**: Ready for Phase 1-5 implementation

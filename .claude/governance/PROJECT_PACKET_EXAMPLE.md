# Project Packet

**Project**: Direct Cuts - Onboarding Reliability
**Venture**: Direct Cuts
**Owner**: Platform Ops Lead
**Start Date**: 2026-01-18
**Target Date**: 2026-02-01

---

## Outcome (One Sentence)

New user onboarding succeeds >98% with verified auth and booking flow.

---

## Success Metrics (1-3)

- Auth success rate >= 98%
- Booking flow completion >= 95%
- Incident MTTR < 30 minutes

---

## Workstreams

| Workstream | Owner | Notes |
|------------|-------|-------|
| Auth reliability | Platform Ops Lead | Harden auth path + monitoring |
| QA coverage | QA Gatekeeper | Regression suite for onboarding |
| Product fixes | Product Lead | UX friction removal |

---

## Phases (Optional)

| Phase | Goal | Required Receipts |
|-------|------|------------------|
| Phase 1 | Diagnose and baseline metrics | Monitoring report, incident summary |
| Phase 2 | Implement fixes | PR link, deploy receipt |
| Phase 3 | Validate outcomes | QA sign-off, metrics snapshot |

---

## Sprint (Optional)

**Sprint Window**: 2026-01-19 to 2026-01-26
**Sprint Goal**: Ship fixes and validate metrics improvements.

---

## Risks / Approvals

- Risk: Production deploys required for auth changes.
- Approvals expected: deploy

---

## Receipts Plan

- Required receipts: deploy receipt, QA sign-off, metrics snapshot
- Verification method: dashboard link + QA checklist

---

## Status

- Current state: Phase 1 in progress
- Blockers: None
- Next decision: Approve Phase 2 deploy window

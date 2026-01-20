# RUN: Direct Cuts - Barber Onboarding V1

**Request ID**: RUN-DC-ONBOARDING-V1-2026-01-18
**Venture**: Direct Cuts
**Priority**: P1
**Objective**: Ship Barber Onboarding V1 to production so a new barber can sign up, complete onboarding, publish a profile, and be discoverable without admin intervention.
**Ship by**: 2026-01-21 5:00 PM (America/Los_Angeles)
**Approvals expected**: deploy

---

## Scope Included

- Barber onboarding flow end-to-end: account -> onboarding steps -> publish profile
- Discoverability proof: published barber appears in client-facing browse/search or map/listing
- Basic activation loop: in-app confirmation + one outbound activation asset
- Support readiness: one support intake path + escalation rule for onboarding failures (minimal)

## Scope Excluded

- Payments/subscription gating changes and Stripe pricing updates
- Checkr/background check integration changes
- New marketing pages, ad spend, or multi-channel campaign builds

---

## Dispatch (Parallel)

- Product Lead: Define acceptance criteria + edge cases (in this Intake)
- Platform Ops Lead: Implement required changes + deploy
- QA Gatekeeper: Define smoke checklist (inside QA receipt) + run smoke + issue PASS/FAIL
- Growth Lead: Produce activation message asset + confirm onboarding confirmation copy exists

---

## Product Lead: Acceptance Criteria

1) A brand-new barber can sign up, complete onboarding steps, and publish without admin intervention.
2) Published barber appears in the client-facing discovery surface (browse/search/map/listing).
3) Onboarding complete confirmation state is visible post-publish.
4) Activation asset exists as canonical copy (email/SMS/in-app).
5) Support intake path + escalation rule for onboarding failures exists.

## Product Lead: Edge Cases

- Re-entry to onboarding after partial completion.
- Publish blocked when required fields are missing.
- File upload failure during portfolio step.
- Discoverability indexing delay after publish.
- Duplicate barber account or reused email/phone.

---

## Evidence Links (Current)

### Platform Ops Deploy Receipt
- C:\Dev\Direct-Cuts\proofs\release-ops\DEPLOYMENT_SUMMARY.md
- C:\Dev\Direct-Cuts\proofs\release-ops\deployment-proof.json

### QA Evidence (Current)
- C:\Dev\Direct-Cuts\proofs\latest\receipts\gate-portfolio-simple.json

### Production Evidence (Current)
- C:\Dev\Direct-Cuts\proofs\latest\screenshots\onboarding-route-test.png
- C:\Dev\Direct-Cuts\proofs\latest\screenshots\production-home.png

### User Evidence (Current)
- C:\Dev\Direct-Cuts\proofs\latest\screenshots\signup-flow-available.png

---

## Status

- Routed: Complete
- Platform Ops: Linked to existing deploy receipt
- QA: Linked to existing smoke artifact (route verification only)
- Growth: Activation asset not yet linked
- Product: Acceptance criteria and edge cases captured above

# Run Directive - Direct Cuts Barber Onboarding V1

**Venture**: Direct Cuts
**Objective**: Ship Barber Onboarding V1 to production so a new barber can sign up, complete onboarding, publish a profile, and be discoverable without admin intervention.
**Ship by**: 2026-01-21 5:00 PM (America/Los_Angeles)

---

## Scope Included

- Barber onboarding flow end-to-end: account -> onboarding steps -> publish profile
- Discoverability proof: published barber appears in client-facing browse/search or map/listing
- Basic activation loop: in-app confirmation + one outbound activation asset (email/SMS/in-app copy)
- Support readiness: one support intake path + escalation rule for onboarding failures (minimal)

## Scope Excluded

- Payments/subscription gating changes and Stripe pricing updates
- Checkr/background check integration changes
- New marketing pages, ad spend, or multi-channel campaign builds

---

## Workstreams (Owners)

- Product: Product Lead
- Platform: Platform Ops Lead
- Quality: QA Gatekeeper
- Growth: Growth Lead
- Legal/Finance: Not needed

---

## Approvals Expected

- deploy

---

## Proof Required (Minimum)

- Production evidence: screen recording/screenshots of brand-new barber completing onboarding and publishing + second view showing discoverability on client-facing surface
- QA evidence: QA Gatekeeper smoke gate PASS receipt for onboarding flow (publish + discoverability)
- User evidence: screenshot/recording of "Onboarding Complete / You're live" confirmation + activation message asset (canonical copy)

---

## Intake Routing

- OCS routes workstream ownership as listed
- QA Gatekeeper owns deploy approval per `governance/APPROVALS.md`

---

## Receipts Plan

- Each agent stores receipts in `agents/[agent]/receipts/`
- Cross-link receipts in this directive when complete

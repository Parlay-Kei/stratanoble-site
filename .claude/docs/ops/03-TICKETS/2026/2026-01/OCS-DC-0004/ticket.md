# OCS-DC-0004 - OCS: REOPEN RUN_DIRECT_CUTS_BARBER_ONBOARDING_V1 and COMPLETE to the stated success bar. Rules: No new documents except updating existing Intake entry and COMPLETION_REPORT.md. Do not link old deploy/smoke artifacts as substitutes for this run’s proofs. Parallelize Platform Ops, QA Gatekeeper, Growth Lead. Product Lead only clarifies acceptance if blocked. Escalate to Principal only for APPROVALS triggers (deploy). Required proofs for DONE (must be new for this run): 1) Production evidence: recording/screens showing brand-new barber completing onboarding, publishing, and appearing discoverable on the client surface. 2) QA evidence: QA Gatekeeper PASS receipt for onboarding publish + discoverability smoke. 3) User evidence: activation message asset copy (canonical final) + confirmation state captured. Execution plan: A) Platform Ops: verify current production build supports onboarding→publish→discoverability; if not, implement minimal fix and deploy; attach deploy receipt link in Intake. B) QA Gatekeeper: run smoke in production using a brand-new barber user; smoke must include: onboard, publish, confirm discoverability; attach PASS/FAIL receipt in Intake; if FAIL, include one-line failure cause. C) Growth Lead: create activation message asset (email/SMS/in-app copy) as canonical text in existing location; attach link/path in Intake. D) Close: update COMPLETION_REPORT.md ONLY when all three proofs are attached in Intake; completion report must include the three proof links and one sentence verifying discoverability surface used.

## Metadata
- Entity: DC
- SessionId: 6cf4eabe-d091-452b-bd6e-8f4990d94556
- Repo: C:\Dev\Direct-Cuts
- DoD: C:\Dev\.claude-anx\docs\ops\06-RUNBOOKS\release\direct-cuts_public-preview_dod_v1.md

## Acceptance Criteria Source
- C:\Dev\.claude-anx\docs\ops\06-RUNBOOKS\release\direct-cuts_public-preview_dod_v1.md

## Status
- Stage: intake
- Owner: OCS (orchestrator-chief-of-staff)

## Notes
- Dispatcher created this ticket stub. OCS stage must populate full spec and handoffs.

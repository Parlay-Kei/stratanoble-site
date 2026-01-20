# RUN DIRECTIVE: DC Phased Mobile Parity + Store Unlock (v1)

Owner: OCS\
Project: Direct Cuts\
Repo: C:\Dev\DC-2

## Objective

Deliver mobile parity with current web app outcomes and produce proof packs.
Separate engineering parity from store distribution so cash gates do not stall
execution.

## Phase 1 (No-Cash) Deliverables: PARITY READY

Engineering Delivery:

- Implement blocked time DB persistence (schedule_tab.dart)
- Implement booking detail deep link route (deep_link_handler.dart)
- Ensure graceful failure behavior for bad deep link params Platform Ops:
- Mapbox token injection via build-time secrets with repo-safe handling Release
  Ops:
- Implement OneSignal wiring in code via env vars (do not require paid account)
- Implement iOS Notification Service Extension code/project changes
  (provisioning deferred) QA Gatekeeper:
- Execute Mobile Parity Smoke Pack on simulators/emulators
- Provide PASS/FAIL and receipts

Phase 1 Outputs:

- PARITY_AUDIT_DC2.md
- DEV_NOTES_MOBILE_TODOS.md
- BUILD_LOG_REDACTED_MAPBOX.md
- PROOF_PACK_MOBILE_PARITY_DC2_<timestamp>.zip
- DOC_INDEX.md

## Phase 2 (Cash-Gated) Deliverables: STORE UNLOCK

Release Ops:

- Google Play Console setup and internal testing track (requires $25)
- Apple Developer enrollment path decision memo:
  - Individual now to unlock TestFlight quickly
  - Organization later when entity exists
- Signing setup and production builds (AAB/IPA) once accounts exist QA
  Gatekeeper:
- Internal device testing plan and results once builds are distributable

Phase 2 Outputs:

- ONESIGNAL_CONFIG_RECEIPT.md (once account exists)
- STORE_SETUP_RECEIPT_GOOGLE_PLAY.md
- STORE_SETUP_RECEIPT_APPLE_DEV.md
- SIGNING_AND_RELEASE_RECEIPTS.md
- PROOF_PACK_STORE_READY_DC2_<timestamp>.zip

## CFO Track (Runs in parallel)

CFO delivers:

- DC_COST_LEDGER_TO_DATE_AND_FORWARD.md
- DC_RUN_RATE_MODEL.md
- MINIMUM_CASH_TO_UNLOCK_STORES.md (exact cash thresholds)
- Tooling inventory (Claude, Vercel, Supabase, Mapbox, OneSignal, Stripe,
  domains)

## Non-Negotiables

- No stubs. No acceptance without proofs.
- Do not require Steve to execute manual technical steps.
- Secrets never land in repo.
- "Store Ready" is distinct from "Parity Ready."

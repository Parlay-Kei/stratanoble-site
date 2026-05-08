# Follow-up: ACHIEVERY Access Model (Deferred)

## Context
- `SubscriptionGate.tsx` was intentionally excluded from `SN-SITE-SHAPE-UP-0001` commit scope.
- Current gate logic assumes pre-rebuild tables, retired feature concepts, and self-serve pricing/tier semantics that do not match the ACHIEVERY rebuild direction.

## Why Deferred
- Packaging for ACHIEVERY inside Strata Noble service tiers is not yet finalized.
- Implementing access controls now would hard-code assumptions likely to be reversed.

## Revisit Trigger
- Resume only after service-tier packaging and entitlement model are approved (including source-of-truth schema for access checks and bundle rules).

## Required Inputs For Rework
- Canonical schema for ACHIEVERY entitlements (post-0146 model).
- Definition of who gets access by engagement tier/package.
- Rules for any gated capabilities (if any) and non-consumer pricing visibility policy.

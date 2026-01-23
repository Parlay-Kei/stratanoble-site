# OCS SQL Verification Prompt - READY TO EXECUTE

## Copy and paste this entire prompt to OCS:

---

**OCS → Platform Ops (Staging SQL Preflight Receipts)**

Run PREFLIGHT_CHECKS_2026-01-16.sql in Supabase SQL Editor for staging project wgxiiefnmaxfxfoqsbwl. Capture raw outputs for every query. Produce a single artifact named STAGING_SQL_PREFLIGHT_RECEIPTS_2026-01-16.md that includes:

1. Timestamp, project ref, and the exact SQL run (copy/paste).
2. Output tables for each query (no screenshots-only; include result rows).
3. A PASS/FAIL line for each requirement below, with evidence reference (query number + row).

**Gate requirements to mark PASS:**

- **Tables exist**: four new tables present in public schema.
- **Functions exist**: four new functions present in public schema with correct signatures.
- **Triggers enabled**: two triggers on appointments exist and are enabled, pointing at the expected trigger functions.
- **RLS enabled**: RLS is enabled on all four new tables AND at least one policy exists per table (or documented rationale if policy count differs).
- **Webhook deduplication constraint**: a unique constraint or unique index exists that prevents duplicate Stripe event ingestion (typically on event_id), and a replay insert test demonstrates a conflict or no-op.

**Negative tests required:**

- **RLS negative test**: attempt a representative SELECT as anon context (or simulate via role-based policy check) and confirm access is denied or filtered as expected.
- **Webhook replay test**: attempt inserting the same webhook event id twice; second attempt must fail with unique violation or be safely ignored by function logic.

Return the receipts in one response, no interpretation. QA Gatekeeper will interpret and decide.

---

## What to Look For in the Receipts

### 1. Tables Check
- **PASS**: Tables exist with expected columns
- **FAIL**: Missing tables or mismatched columns

### 2. RLS Check
- **PASS**: `rowsecurity = true` AND policies exist
- **FAIL**: RLS enabled but no policies (defaults to deny-all)

### 3. Triggers Check
- **PASS**: Triggers exist, enabled, attached to correct events
- **FAIL**: Triggers disabled or pointing to wrong functions

### 4. Webhook Dedupe Check
- **PASS**: Cannot insert same Stripe event twice
- **FAIL**: No constraint, allowing double mutations

### 5. Negative Tests
- **PASS**: Anonymous access denied, duplicate events rejected
- **FAIL**: Security bypass possible

## Decision Rule

| Result | Gate Status | Action |
|--------|-------------|--------|
| Any check FAIL | 🟡 YELLOW | Fix issues, no E2E |
| All checks PASS | 🟢 GREEN | Proceed to E2E |

## Critical Note on Webhook Security

**"401 for bad signature" ✅ proves identity**
**"Unique constraint on event_id" ✅ proves sanity**

Both are required. Stripe retries valid signatures constantly - without deduplication, you get double charges, double subscriptions, and support nightmares.

---

**File Location**: `docs/receipts/PREFLIGHT_CHECKS_2026-01-16.sql`
**Project Ref**: wgxiiefnmaxfxfoqsbwl (staging only)
**Expected Output**: STAGING_SQL_PREFLIGHT_RECEIPTS_2026-01-16.md
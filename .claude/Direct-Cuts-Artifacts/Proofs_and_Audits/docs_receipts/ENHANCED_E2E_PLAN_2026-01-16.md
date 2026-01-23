# ENHANCED E2E EXECUTION PLAN - NO FAKE SECURITY

**Date**: 2026-01-16
**Environment**: staging (wgxiiefnmaxfxfoqsbwl)
**Objective**: Prove you built a door, not a curtain

## Critical Change: Real Stripe Subscriptions Only

### ⚠️ NO SQL-INJECTED SUBSCRIPTIONS
SQL alone cannot create real entitlement. If gating relies on webhook-synced truth (it should), then Barber A needs a **real Stripe test subscription** created through production pathways.

**Why This Matters:**
- SQL-seeded "active" + Stripe reports "none" = E2E passes for wrong reason
- Production fails when real Stripe state differs from fake SQL state
- This is the kind of "green" that kills you quietly

---

## Flow 0: Enhanced Setup - Real Pathway Required

### Barber A Entitlement Must Be Established Via Real Path:

**Option 1**: Call `barber-subscription-service` edge function
```bash
curl -X POST https://wgxiiefnmaxfxfoqsbwl.functions.supabase.co/barber-subscription-service \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "barber_id": "11111111-1111-1111-1111-111111111111",
    "price_id": "price_test_barber_monthly_2999"
  }'
```

**Option 2**: Create in Stripe Dashboard (test mode) and confirm webhook writes DB

### Required Proof Artifact:
- Stripe event ID(s) used
- DB row showing subscription state written by **webhook logic**, not hand-inserted
- Webhook event log proving the pathway

---

## Enhanced Test Flows

### Flow 0+: "Break It" Concurrency Tests

#### Concurrency Booking Test
**Goal**: Prove exclusion constraint works
```javascript
// Two clients attempt same slot simultaneously
const [booking1, booking2] = await Promise.allSettled([
  createBooking(barberA, slot1, customer1),
  createBooking(barberA, slot1, customer2)
]);

// One MUST succeed, one MUST fail
expect(booking1.status !== booking2.status).toBe(true);
```

#### Rewards Double-Credit Under Retries
**Goal**: Prove completion trigger is idempotent
```sql
-- Complete appointment
UPDATE appointments SET status = 'completed' WHERE id = 'appt-123';

-- Check rewards credited
SELECT balance FROM reward_accounts WHERE user_id = 'customer-123';
-- Should be 250 (5% of $50)

-- Trigger completion path AGAIN (simulate retry)
UPDATE appointments SET status = 'completed' WHERE id = 'appt-123';

-- Rewards should NOT double
SELECT balance FROM reward_accounts WHERE user_id = 'customer-123';
-- Should STILL be 250, not 500

SELECT COUNT(*) FROM reward_transactions WHERE appointment_id = 'appt-123';
-- Should be 1, not 2
```

---

## Updated OCS Prompts

### 1. Platform Ops: Real Subscription Creation
```
In staging project wgxiiefnmaxfxfoqsbwl, run REVISED_TEST_DATA_SETUP_2026-01-16.sql to create Barber B, C, Guest G, Member M. For Barber A, do NOT SQL-inject subscription. Instead create real Stripe test subscription using barber-subscription-service edge function or Stripe Dashboard. Confirm webhook writes barber_subscriptions for Barber A. Produce TEST_DATA_RECEIPTS_2026-01-16.md with:

- All actor IDs from TEST_DATA_CARD_2026-01-16.md
- DB outputs showing barber/subscription rows
- Stripe event ID(s) and resulting DB state
- Proof subscription came from webhook, not SQL
```

### 2. QA Gatekeeper: Enhanced Flow Testing
```
Execute E2E flows 1-4 plus concurrency tests using seeded actors. For each flow capture:

- UI screenshots at required checkpoints
- API request/response codes with typed errors
- DB before/after snapshots for rewards/merge

Include "break it" simulations:
- Attempt booking submit twice rapidly for same slot
- Replay same Stripe event ID to prove deduplication
- Double-complete appointment to prove no double-credit

Produce E2E_PROOF_PACK_2026-01-16.md with PASS/FAIL per condition and artifact links.
```

### 3. Release Ops: Staging URL + Webhook Configuration
```
Provision stable Vercel staging URL and document where configured (callbacks, redirects, webhook endpoints). Update any hardcoded staging URLs in edge functions. Output STAGING_URL_RECEIPT_2026-01-16.md with final URL and configuration locations.
```

---

## Enhanced Pass Criteria

### Required for GREEN Gate:
- [ ] All 4 original flows PASS
- [ ] Concurrency booking: one succeeds, one fails
- [ ] Double completion: no double rewards credit
- [ ] Webhook replay: idempotent (no state change)
- [ ] Barber A subscription via **real Stripe pathway**

### Automatic FAIL Conditions:
- ❌ Booking created for non-entitled barber
- ❌ Two bookings succeed for same slot
- ❌ Rewards credit twice on retry
- ❌ Webhook replay causes duplicate state
- ❌ Barber A subscription is SQL-injected (fake)

---

## The Sharp Truth Extended

**Original**: "A system can look secure and still leak value in retries, edge timing, and 'I clicked twice.'"

**Enhanced**: "A system with fake test data will pass E2E and fail in production. SQL-seeded subscriptions are lies. Webhook-synced truth is the only truth."

### What We're Really Testing:
1. **Door vs Curtain**: Real exclusion or just UI suggestions?
2. **Real vs Fake**: Webhook-synced data or SQL lies?
3. **Idempotency**: Retry-safe or double-charging?
4. **Concurrency**: Race condition safe or first-come-first-served chaos?

---

## Test Data Validation Commands

### Verify Barber A Subscription Authenticity
```sql
-- This MUST show webhook origin
SELECT
  bs.*,
  we.stripe_event_id,
  we.event_type,
  we.processed_at
FROM barber_subscriptions bs
LEFT JOIN webhook_events we ON we.event_data::text LIKE '%' || bs.stripe_subscription_id || '%'
WHERE bs.barber_id = '11111111-1111-1111-1111-111111111111';

-- If webhook_events is NULL, subscription is FAKE
```

### Double-Click Protection Test
```sql
-- Simulate rapid double-completion
BEGIN;
  UPDATE appointments SET status = 'completed' WHERE id = 'test-appt';
  UPDATE appointments SET status = 'completed' WHERE id = 'test-appt';
COMMIT;

-- Should result in exactly ONE reward transaction
```

---

**Remember**: Production will have real Stripe webhooks, real concurrency, real retries. If your E2E doesn't match that reality, your gate is lying to you.
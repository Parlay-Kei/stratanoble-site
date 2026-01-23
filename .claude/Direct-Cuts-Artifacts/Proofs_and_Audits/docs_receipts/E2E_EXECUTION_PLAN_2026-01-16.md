# E2E EXECUTION PLAN - NO IMPROVISATION

**Date**: 2026-01-16
**Environment**: staging (wgxiiefnmaxfxfoqsbwl)
**Objective**: Prove the system is a door, not a curtain

## Flow 0: Setup - Deterministic Test Actors

### Required Actors

| Actor | Type | Subscription Status | Expected Behavior |
|-------|------|-------------------|-------------------|
| **Barber A** | Active | ENTITLED (trialing/active) | ✅ Can accept bookings |
| **Barber B** | Active | NOT ENTITLED (none/canceled) | ❌ Bookings blocked |
| **Barber C** | Inactive | Any (is_active=false) | ❌ Bookings blocked |
| **Guest G** | Guest | N/A | Can book with verification |
| **Member M** | User | N/A | For merge testing |

### Creation SQL
```sql
-- Barber A: ENTITLED
INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'barber.a@staging.test');
INSERT INTO public.users (id, email, full_name, is_barber) VALUES
  ('11111111-1111-1111-1111-111111111111', 'barber.a@staging.test', 'Barber A Entitled', true);
INSERT INTO public.barbers (id, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', true);
INSERT INTO public.barber_subscriptions (barber_id, status, stripe_customer_id, stripe_subscription_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'active', 'cus_test_barberA', 'sub_test_barberA');

-- Barber B: NOT ENTITLED
INSERT INTO auth.users (id, email) VALUES
  ('22222222-2222-2222-2222-222222222222', 'barber.b@staging.test');
INSERT INTO public.users (id, email, full_name, is_barber) VALUES
  ('22222222-2222-2222-2222-222222222222', 'barber.b@staging.test', 'Barber B NotEntitled', true);
INSERT INTO public.barbers (id, is_active) VALUES
  ('22222222-2222-2222-2222-222222222222', true);
-- NO subscription record = not entitled

-- Barber C: INACTIVE
INSERT INTO auth.users (id, email) VALUES
  ('33333333-3333-3333-3333-333333333333', 'barber.c@staging.test');
INSERT INTO public.users (id, email, full_name, is_barber) VALUES
  ('33333333-3333-3333-3333-333333333333', 'barber.c@staging.test', 'Barber C Inactive', true);
INSERT INTO public.barbers (id, is_active) VALUES
  ('33333333-3333-3333-3333-333333333333', false);

-- Guest G identity
INSERT INTO public.guest_identities (id, phone, email, verified) VALUES
  ('44444444-4444-4444-4444-444444444444', '+15555551234', 'guest.g@staging.test', false);

-- Member M for merge
INSERT INTO auth.users (id, email) VALUES
  ('55555555-5555-5555-5555-555555555555', 'member.m@staging.test');
INSERT INTO public.users (id, email, full_name) VALUES
  ('55555555-5555-5555-5555-555555555555', 'member.m@staging.test', 'Member M Test');
```

### Required Artifacts
- [ ] TEST_DATA_CARD_2026-01-16.md with all IDs
- [ ] DB snapshot: `SELECT * FROM barber_subscriptions WHERE barber_id IN (A, B, C)`
- [ ] Stripe mapping note

---

## Flow 1: Guest Booking + Verification

### Pass Conditions
1. Guest can start booking ✅
2. Verification code required ✅
3. Wrong code fails cleanly ✅
4. Correct code succeeds ✅
5. Booking created with guest_identity_id ✅
6. No account creation required ✅

### Test Sequence
```javascript
// 1. Start booking
POST /api/bookings/initiate
{
  "barber_id": "11111111-1111-1111-1111-111111111111",
  "service_id": "service-123",
  "guest_phone": "+15555551234",
  "guest_email": "guest.g@staging.test"
}
// Expected: 200, returns verification_required: true

// 2. Wrong code
POST /api/verify
{
  "guest_identity_id": "44444444-4444-4444-4444-444444444444",
  "code": "999999"
}
// Expected: 400, "Invalid verification code"

// 3. Correct code
POST /api/verify
{
  "guest_identity_id": "44444444-4444-4444-4444-444444444444",
  "code": "123456"
}
// Expected: 200, verified: true

// 4. Complete booking
POST /api/bookings/complete
{
  "guest_identity_id": "44444444-4444-4444-4444-444444444444",
  "appointment_details": {...}
}
// Expected: 201, booking created
```

### Proof Artifacts
- [ ] Screenshots: modal states (pre-verify, code entry, verified)
- [ ] API logs: status codes for each call
- [ ] DB: guest_identities.verified = true
- [ ] DB: appointments row with guest_identity_id

---

## Flow 2: Subscription Gating at API

### Pass Conditions
1. Barber A booking succeeds ✅
2. Barber B booking fails at API ✅
3. Barber C booking fails for inactivity ✅
4. Typed errors (not generic 500) ✅

### Test Sequence
```javascript
// Barber A: SHOULD SUCCEED
POST /api/bookings
{
  "barber_id": "11111111-1111-1111-1111-111111111111",
  "customer_id": "55555555-5555-5555-5555-555555555555"
}
// Expected: 201 Created

// Barber B: SHOULD FAIL (no subscription)
POST /api/bookings
{
  "barber_id": "22222222-2222-2222-2222-222222222222",
  "customer_id": "55555555-5555-5555-5555-555555555555"
}
// Expected: 403 Forbidden
// Body: { "error": "subscription_required", "message": "Barber is not accepting bookings" }

// Barber C: SHOULD FAIL (inactive)
POST /api/bookings
{
  "barber_id": "33333333-3333-3333-3333-333333333333",
  "customer_id": "55555555-5555-5555-5555-555555555555"
}
// Expected: 403 Forbidden
// Body: { "error": "barber_inactive", "message": "Barber is not currently active" }
```

### Proof Artifacts
- [ ] API request/response for each barber
- [ ] Screenshot: UI shows booking blocked
- [ ] DB: No appointment created for B or C

---

## Flow 3: Rewards Only on Completion

### Pass Conditions
1. Booking creation → no rewards ✅
2. Completion → rewards credited once ✅
3. Retry → no double credit ✅

### Test Sequence
```sql
-- 1. Create appointment (no completion)
INSERT INTO appointments (id, barber_id, customer_id, status, total_cents)
VALUES ('appt-123', '11111111-1111-1111-1111-111111111111',
        '55555555-5555-5555-5555-555555555555', 'confirmed', 5000);

-- Check rewards (should be 0 or not exist)
SELECT * FROM reward_accounts WHERE user_id = '55555555-5555-5555-5555-555555555555';
SELECT * FROM reward_transactions WHERE appointment_id = 'appt-123';

-- 2. Complete appointment
UPDATE appointments SET status = 'completed' WHERE id = 'appt-123';

-- Check rewards (should be 250 points = 5% of 5000)
SELECT * FROM reward_accounts WHERE user_id = '55555555-5555-5555-5555-555555555555';
SELECT * FROM reward_transactions WHERE appointment_id = 'appt-123';

-- 3. Retry completion (idempotent)
UPDATE appointments SET status = 'completed' WHERE id = 'appt-123';

-- Check rewards (should still be 250, not 500)
SELECT balance FROM reward_accounts WHERE user_id = '55555555-5555-5555-5555-555555555555';
SELECT COUNT(*) FROM reward_transactions WHERE appointment_id = 'appt-123';
```

### Proof Artifacts
- [ ] DB: reward_transactions before completion (0 rows)
- [ ] DB: reward_transactions after completion (1 row)
- [ ] DB: reward_transactions after retry (still 1 row)
- [ ] Screenshot: Wallet shows correct amount

---

## Flow 4: Guest to Member Merge

### Pass Conditions
1. Guest has rewards ✅
2. Member signup triggers merge ✅
3. Merge is idempotent ✅

### Test Sequence
```sql
-- 1. Guest earns rewards
INSERT INTO reward_accounts (user_id, guest_identity_id, balance)
VALUES (NULL, '44444444-4444-4444-4444-444444444444', 500);

INSERT INTO reward_transactions (account_id, amount, type)
VALUES ((SELECT id FROM reward_accounts WHERE guest_identity_id = '44444444-4444-4444-4444-444444444444'),
        500, 'earned');

-- 2. Simulate signup linking guest to member
UPDATE guest_identities
SET user_id = '55555555-5555-5555-5555-555555555555'
WHERE id = '44444444-4444-4444-4444-444444444444';

-- 3. Run merge function
SELECT merge_guest_rewards_to_member('55555555-5555-5555-5555-555555555555');

-- Check member rewards (should be 500)
SELECT * FROM reward_accounts WHERE user_id = '55555555-5555-5555-5555-555555555555';

-- Check guest rewards (should be 0 or transferred)
SELECT * FROM reward_accounts WHERE guest_identity_id = '44444444-4444-4444-4444-444444444444';

-- 4. Run merge again (idempotent)
SELECT merge_guest_rewards_to_member('55555555-5555-5555-5555-555555555555');

-- Balance should still be 500, not 1000
SELECT balance FROM reward_accounts WHERE user_id = '55555555-5555-5555-5555-555555555555';
```

### Proof Artifacts
- [ ] DB: Guest balance before merge (500)
- [ ] DB: Member balance after merge (500)
- [ ] DB: Member balance after second merge (still 500)
- [ ] Screenshot: Member wallet shows merged total
- [ ] Statement: "Merge invoked twice, idempotent confirmed"

---

## Webhook Lifecycle Validation

### Required Tests
```bash
# 1. Valid webhook (should process)
curl -X POST https://wgxiiefnmaxfxfoqsbwl.functions.supabase.co/stripe-webhook \
  -H "stripe-signature: [valid_signature]" \
  -d '{"id": "evt_test_001", "type": "customer.subscription.created"}'

# 2. Replay same event (should be idempotent)
curl -X POST https://wgxiiefnmaxfxfoqsbwl.functions.supabase.co/stripe-webhook \
  -H "stripe-signature: [valid_signature]" \
  -d '{"id": "evt_test_001", "type": "customer.subscription.created"}'

# Check DB: only one webhook_events row with evt_test_001
SELECT * FROM webhook_events WHERE stripe_event_id = 'evt_test_001';
```

---

## Final Gate Criteria

### PASS Requirements
- [ ] All 4 flows complete successfully
- [ ] No subscription gating bypass found
- [ ] No double-credit path exists
- [ ] Webhook replay proven harmless
- [ ] All typed errors returned (no 500s)

### FAIL Conditions (Any = Stop)
- ❌ Booking created for non-entitled barber
- ❌ Rewards credit twice
- ❌ Webhook replay causes duplicate state
- ❌ Guest verification bypassable
- ❌ Generic errors instead of typed

---

## OCS Prompts

### 1. Platform Ops: Seed Test Data
```
Create E2E test actors in staging project wgxiiefnmaxfxfoqsbwl: Barber A (entitled), Barber B (not entitled), Barber C (inactive). Create Guest G and Member M identifiers. Ensure Barber A has active subscription status and Barber B has none. Output TEST_DATA_CARD_2026-01-16.md with all IDs and barber_subscriptions query results.
```

### 2. QA Gatekeeper: Execute Flows
```
Run E2E flows 1-4 in staging sequentially. Capture screenshots, API traces, DB snapshots for rewards/merge. Produce E2E_PROOF_PACK_2026-01-16.md with flow-by-flow PASS/FAIL, artifacts, and Stripe event IDs showing dedupe behavior.
```

### 3. Release Ops: Staging URL
```
Provision stable staging URL in Vercel for Direct Cuts. Set consistent alias if using preview deployments. Update webhook callbacks and auth redirects. Output STAGING_URL_RECEIPT_2026-01-16.md with final URL.
```

---

**Remember**: A system can look secure and still leak value. The leak hides in retries, edge timing, and "I clicked twice." This E2E proves you built a door, not a curtain.
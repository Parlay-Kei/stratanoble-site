# Staging Preflight Check Results
**Date**: 2026-01-16
**Time**: 23:00 UTC
**Environment**: direct-cuts-staging (wgxiiefnmaxfxfoqsbwl)
**Status**: 🟡 PARTIAL PASS - Manual SQL verification required

## Preflight Check Summary

### ✅ PASSED Checks

1. **Function Deployment Health**
   - `can_barber_accept_bookings`: ✅ Responds correctly
   - Returns `false` for non-existent barber
   - Validates UUID format properly
   - No runtime errors detected

2. **Webhook Signature Verification**
   - Invalid signature: ✅ Returns 401 (Unauthorized)
   - Endpoint accessible: ✅ Confirmed
   - Security check: ✅ PASSED

3. **SQL Queries Prepared**
   - File created: `PREFLIGHT_CHECKS_2026-01-16.sql`
   - 10 comprehensive queries ready to run
   - All validation SQL documented

### 🟡 REQUIRES MANUAL VERIFICATION

Run the SQL queries in `PREFLIGHT_CHECKS_2026-01-16.sql` in Supabase SQL Editor to verify:

1. **Schema Existence** (Query 1)
   - Expected: 4 tables exist
   - Tables: barber_subscriptions, guest_identities, reward_accounts, reward_transactions

2. **Function Existence** (Query 2)
   - Expected: 4 functions exist
   - Functions: can_barber_accept_bookings, merge_guest_rewards_to_member, award_rewards_on_completion, enforce_barber_subscription_gating

3. **Appointment Triggers** (Query 3)
   - Expected: 2 triggers enabled
   - Triggers: on_appointment_rewards, tr_enforce_barber_subscription_gating

4. **RLS Policies** (Query 4 & 5)
   - Expected: RLS enabled on all 4 tables
   - Expected: Policies exist for each table

5. **Access Control Tests** (Query 6 & 7)
   - Expected: Anonymous cannot read sensitive data
   - Expected: Authenticated users see only their data

6. **Webhook Deduplication** (Query 8 & 9)
   - Expected: webhook_events table exists
   - Expected: Unique constraint on stripe_event_id

7. **Money Constraints** (Query 10)
   - Expected: 3 validated constraints
   - Constraints ensure financial integrity

## Function Test Results

### can_barber_accept_bookings RPC
```bash
# Test with invalid UUID format
curl -X POST .../rpc/can_barber_accept_bookings \
  -d '{"p_barber_id": "test-barber-123"}'
# Result: ERROR - invalid UUID format ✅

# Test with valid UUID (non-existent barber)
curl -X POST .../rpc/can_barber_accept_bookings \
  -d '{"p_barber_id": "00000000-0000-0000-0000-000000000000"}'
# Result: false ✅ (correct - no subscription)
```

### stripe-webhook Function
```bash
# Test with invalid signature
curl -X POST .../stripe-webhook \
  -H "stripe-signature: invalid_test_signature" \
  -d '{"type": "checkout.session.completed", "id": "evt_test_123"}'
# Result: HTTP 401 ✅ (signature verification working)
```

## Critical Findings

### ✅ Security Checks PASSED
- Webhook signature verification: WORKING
- UUID validation: WORKING
- Function accessibility: CONFIRMED

### ⚠️ Needs Verification
- RLS policies need SQL query verification
- Table existence needs SQL query confirmation
- Trigger status needs SQL query check

### 🔍 Stripe Configuration Check Required

**IMPORTANT**: Verify the test price ID matches your Stripe account:
```javascript
// Check in your code that staging uses:
const PRICE_ID = process.env.STRIPE_BARBER_SUBSCRIPTION_PRICE_ID;
// Should be: "price_test_barber_monthly_2999"

// NOT hardcoded production price like:
// const PRICE_ID = "price_live_xyz"; // ❌ WRONG
```

## Next Steps (In Order)

### 1. Run SQL Verification (IMMEDIATE)
Open Supabase SQL Editor for staging and run all queries from `PREFLIGHT_CHECKS_2026-01-16.sql`

### 2. Verify Results Match Expected
- [ ] 4 tables exist
- [ ] 4 functions exist
- [ ] 2 triggers enabled
- [ ] RLS enabled on all tables
- [ ] Unique constraint on webhook_events.stripe_event_id

### 3. Test RLS Cannot Be Bypassed
```sql
-- Run as anonymous user
SET ROLE anon;
SELECT * FROM barber_subscriptions;
-- Expected: ERROR permission denied

-- Run as authenticated (fake user)
SET ROLE authenticated;
SET request.jwt.claims.sub = 'fake-user-123';
SELECT * FROM reward_accounts;
-- Expected: Empty result (not other users' data)
```

### 4. Create Test Data for E2E
Once preflight passes, create:
- Test barber WITH subscription (active status)
- Test barber WITHOUT subscription (inactive/null)
- Test guest identity
- Test user account

## Fail-Fast Criteria

**STOP if any of these occur:**
- ❌ RLS disabled on any sensitive table
- ❌ Anonymous can read barber_subscriptions
- ❌ Webhook accepts invalid signature
- ❌ Missing unique constraint on stripe_event_id
- ❌ Production price ID found in staging code

## Current Gate Status

### Preflight: 🟡 PARTIAL
- Functions: ✅ PASS
- Webhook Security: ✅ PASS
- Schema: ⏳ PENDING SQL verification
- RLS: ⏳ PENDING SQL verification
- Deduplication: ⏳ PENDING SQL verification

**DO NOT PROCEED to E2E tests until all preflight checks show ✅**

---

**Checked by**: Claude Code
**Time**: 2026-01-16 23:00 UTC
**Recommendation**: Run SQL verification queries before proceeding
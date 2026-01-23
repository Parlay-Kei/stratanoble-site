# PRODUCTION DEPLOYMENT SEQUENCE
**Date**: 2026-01-16
**Target**: dskpfnjbgocieoqyiznf (PRODUCTION ONLY)
**Status**: Ready to execute

## Deployment Order & Rationale

### Step 1: Deploy Edge Functions First ⚡
**Why First**: Functions can handle missing tables gracefully; new code paths not invoked until migration complete.

### Step 2: Apply DB Migration 🗄️
**Why Second**: Creates tables/functions atomically after functions deployed.

### Step 3: Configure Production Stripe Keys 🔐
**Why Third**: Uses LIVE keys, not test keys from staging.

### Step 4: MVP Smoke Tests 🚬
**Why Last**: Minimal validation before going live.

---

## Step 1: Edge Functions Deployment

### Target Functions:
- `barber-subscription-service` (subscription management)
- `stripe-webhook` (updated with new gating logic)
- `send-barber-welcome-email` (verification endpoints)

### Deployment Command:
```bash
# Deploy to PRODUCTION
supabase functions deploy --project-ref dskpfnjbgocieoqyiznf
```

### Required Receipt: DEPLOY_RECEIPTS_PROD_2026-01-16.md
- Deployed versions/hashes
- Function status (ACTIVE/FAILED)
- Environment variable names present (no values)
- Deploy timestamp

---

## Step 2: Database Migration

### Migration File:
`20260116000001_barber_subscription_guest_rewards.sql`

### Deployment Command:
```bash
# Apply to PRODUCTION
supabase db push --project-ref dskpfnjbgocieoqyiznf
```

### Creates:
- **4 Tables**: barber_subscriptions, guest_identities, reward_accounts, reward_transactions
- **4 Functions**: can_barber_accept_bookings, merge_guest_rewards_to_member, etc.
- **2 Triggers**: subscription gating + rewards
- **RLS Policies**: Data isolation

### Required Receipt: DB_RECEIPTS_PROD_2026-01-16.md
- Migration applied confirmation
- Schema verification (tables/functions/triggers/policies exist)
- Dedupe constraint on webhook_events confirmed

---

## Step 3: Production Environment Configuration

### Required Secrets (LIVE KEYS ONLY):
```bash
# CRITICAL: Use LIVE Stripe keys, not test
STRIPE_SECRET_KEY=sk_live_[PRODUCTION_KEY]
STRIPE_BARBER_SUBSCRIPTION_PRICE_ID=price_live_[PRODUCTION_PRICE]
STRIPE_WEBHOOK_SECRET=whsec_[PRODUCTION_WEBHOOK]
SUPABASE_SERVICE_ROLE_KEY=[AUTO_SET_BY_SUPABASE]

# Verification provider (choose one)
TWILIO_ACCOUNT_SID=[LIVE_SID]
TWILIO_AUTH_TOKEN=[LIVE_TOKEN]
# OR
RESEND_API_KEY=re_[LIVE_KEY]
```

### Commands:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_... --project-ref dskpfnjbgocieoqyiznf
supabase secrets set STRIPE_BARBER_SUBSCRIPTION_PRICE_ID=price_live_... --project-ref dskpfnjbgocieoqyiznf
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref dskpfnjbgocieoqyiznf
```

### Verification:
```bash
# Test webhook rejects bad signature
curl -X POST https://dskpfnjbgocieoqyiznf.functions.supabase.co/stripe-webhook \
  -H "stripe-signature: invalid" \
  -d '{"type": "test"}'
# Expected: 401 Unauthorized
```

---

## Step 4: MVP Smoke Tests (4 Checks Only)

### Test 1: Guest Verification Required
```javascript
// Guest starts booking
const booking = await startGuestBooking({
  barber_id: "[real-production-barber]",
  phone: "+1234567890"
});

// Must require verification
expect(booking.verification_required).toBe(true);

// Correct code succeeds
const verified = await verifyGuest({
  guest_id: booking.guest_id,
  code: "[sent-code]"
});
expect(verified.success).toBe(true);
```

### Test 2: Non-Entitled Barber Blocked
```javascript
// Direct API call to non-subscribed barber
const blocked = await fetch('/api/bookings', {
  method: 'POST',
  body: JSON.stringify({
    barber_id: "[barber-without-subscription]",
    customer_id: "[test-customer]"
  })
});

expect(blocked.status).toBe(403);
expect(blocked.error).toContain("subscription");
```

### Test 3: Entitled Barber Succeeds
```javascript
// Booking with subscribed barber
const success = await fetch('/api/bookings', {
  method: 'POST',
  body: JSON.stringify({
    barber_id: "[barber-with-subscription]",
    customer_id: "[test-customer]"
  })
});

expect(success.status).toBe(201);
```

### Test 4: Rewards No Double-Credit
```sql
-- Complete appointment once
UPDATE appointments SET status = 'completed' WHERE id = '[test-appointment]';

-- Check rewards (e.g., 250 points)
SELECT balance FROM reward_accounts WHERE user_id = '[test-customer]';

-- Complete again (retry scenario)
UPDATE appointments SET status = 'completed' WHERE id = '[test-appointment]';

-- Balance should NOT double
SELECT balance FROM reward_accounts WHERE user_id = '[test-customer]';
-- Still 250, not 500

SELECT COUNT(*) FROM reward_transactions WHERE appointment_id = '[test-appointment]';
-- Should be 1, not 2
```

### Required Receipt: PROD_SMOKE_PROOFS_2026-01-16.md
- One screenshot per check
- One API response per check
- One DB snapshot for rewards (before/after/retry)

---

## Step 5: Production Monitoring

### Key Metrics (Simple & Actionable):
```sql
-- Stripe webhook failure rate
SELECT
  COUNT(*) FILTER (WHERE error_message IS NOT NULL) * 100.0 / COUNT(*) as failure_rate
FROM webhook_events
WHERE processed_at > NOW() - INTERVAL '1 hour';

-- Booking creation failure rate
SELECT
  COUNT(*) as failed_bookings,
  error_message
FROM booking_attempts
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND success = false
GROUP BY error_message
ORDER BY COUNT(*) DESC;

-- Reward credit counts
SELECT
  COUNT(*) as rewards_credited,
  SUM(amount) as total_points
FROM reward_transactions
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND type = 'earned';

-- Error response spikes
SELECT
  status_code,
  COUNT(*) as count
FROM api_logs
WHERE timestamp > NOW() - INTERVAL '10 minutes'
  AND status_code IN (401, 403, 409, 500)
GROUP BY status_code
ORDER BY count DESC;
```

### Alert Thresholds:
- Webhook failure rate > 5%
- Booking failure rate > 10%
- 401/403 responses > 100/hour
- Any 500 errors

---

## Fast Rollback Options (Stop the Bleeding)

### Option 1: Disable Subscription Gating UI
```javascript
// Feature flag to bypass UI checks
if (FEATURE_FLAGS.disable_subscription_gating) {
  return true; // Allow all bookings in UI
}
```

### Option 2: Maintenance Mode for New Bookings
```javascript
// Return maintenance message for new booking path
if (isNewBookingFlow) {
  return { error: "Booking temporarily unavailable" };
}
```

### Option 3: Disable Database Trigger (Emergency)
```sql
-- EMERGENCY ONLY
ALTER TABLE appointments DISABLE TRIGGER tr_enforce_barber_subscription_gating;
```

### Option 4: Revert Function Deploy
```bash
# Rollback specific function
git checkout HEAD~1 -- supabase/functions/stripe-webhook
supabase functions deploy stripe-webhook --project-ref dskpfnjbgocieoqyiznf
```

**Note**: Leave DB migration in place unless actively breaking core flows.

---

## OCS Execution Prompts

### 1. Release Ops: Function Deployment
```
Deploy production edge functions (barber-subscription-service, stripe-webhook, verification) to dskpfnjbgocieoqyiznf. Capture DEPLOY_RECEIPTS_PROD_2026-01-16.md with deploy IDs and env var presence checks (names only).
```

### 2. Platform Ops: Database Migration
```
Apply production migration 20260116000001_barber_subscription_guest_rewards.sql to dskpfnjbgocieoqyiznf. Capture DB_RECEIPTS_PROD_2026-01-16.md including schema verification outputs and dedupe constraint confirmation.
```

### 3. QA Gatekeeper: Smoke Tests
```
Run the 4-item MVP smoke gate in production and produce PROD_SMOKE_PROOFS_2026-01-16.md with screenshots, API codes, and rewards before/after/retry DB snapshots.
```

---

## Success Criteria

### Green Light ✅:
- All 4 functions deployed successfully
- Migration applied without errors
- All 4 smoke tests pass
- No error rate spikes in first hour

### Red Light 🔴 (Rollback):
- Any function deploy fails
- Migration fails or corrupts data
- Any smoke test fails
- Error rates spike above thresholds

---

**Target**: dskpfnjbgocieoqyiznf ONLY
**Execution**: Clean, efficient push with minimal risk
**Monitoring**: Simple metrics, clear alerts
**Rollback**: Fast options to stop bleeding
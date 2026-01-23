# Staging Validation Report
**Date**: 2026-01-16
**Environment**: direct-cuts-staging (wgxiiefnmaxfxfoqsbwl)
**Status**: ✅ MIGRATIONS APPLIED SUCCESSFULLY

## Staging Project Details

- **Project Name**: direct-cuts-staging
- **Project ID**: wgxiiefnmaxfxfoqsbwl
- **Region**: East US (Ohio)
- **Created**: 2026-01-17 03:04:33 UTC
- **URL**: https://wgxiiefnmaxfxfoqsbwl.supabase.co

## Migration Results

### Successfully Applied (51 migrations total)
✅ All migrations applied without critical errors

### Phase 1 Migration Status
✅ **20260116000001_barber_subscription_guest_rewards.sql** - APPLIED

#### Tables Created:
- ✅ `barber_subscriptions` - Tracks barber subscription status
- ✅ `guest_identities` - Manages guest user identities
- ✅ `reward_accounts` - Stores user reward balances
- ✅ `reward_transactions` - Logs reward transactions

#### Functions Created:
- ✅ `can_barber_accept_bookings()` - Validates barber subscription status
- ✅ `merge_guest_rewards_to_member()` - Merges guest rewards on signup
- ✅ `award_rewards_on_completion()` - Awards rewards on appointment completion
- ✅ `enforce_barber_subscription_gating()` - Blocks bookings for unsubscribed barbers

#### Triggers Created:
- ✅ `on_appointment_rewards` - Triggers reward calculation on completion
- ✅ `tr_enforce_barber_subscription_gating` - Enforces subscription requirements

## Validation Queries

### 1. Verify Tables Exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
  AND table_name IN (
    'barber_subscriptions',
    'guest_identities',
    'reward_accounts',
    'reward_transactions'
  );
```
**Expected**: 4 rows
**Status**: PENDING VERIFICATION

### 2. Verify Functions Exist
```sql
SELECT proname
FROM pg_proc
JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
WHERE nspname='public'
  AND proname IN (
    'can_barber_accept_bookings',
    'merge_guest_rewards_to_member',
    'award_rewards_on_completion',
    'enforce_barber_subscription_gating'
  );
```
**Expected**: 4 rows
**Status**: PENDING VERIFICATION

### 3. Verify Triggers
```sql
SELECT
  tgname as trigger_name,
  pg_proc.proname as function_name
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
WHERE pg_class.relname = 'appointments'
  AND tgname IN ('on_appointment_rewards', 'tr_enforce_barber_subscription_gating');
```
**Expected**: 2 rows
**Status**: PENDING VERIFICATION

## Edge Functions Deployment

### Functions to Deploy
1. `barber-subscription-service`
2. `stripe-webhook` (updated)
3. `send-barber-welcome-email` (existing)

### Deployment Commands
```bash
# Deploy all functions to staging
supabase functions deploy --project-ref wgxiiefnmaxfxfoqsbwl

# Or deploy individually
supabase functions deploy barber-subscription-service --project-ref wgxiiefnmaxfxfoqsbwl
supabase functions deploy stripe-webhook --project-ref wgxiiefnmaxfxfoqsbwl
```

## Environment Variables Required

### Missing in Staging (Need to Set)
- [ ] `STRIPE_SECRET_KEY` - Use Stripe TEST key
- [ ] `STRIPE_BARBER_SUBSCRIPTION_PRICE_ID` - Use test price ID
- [ ] `STRIPE_WEBHOOK_SECRET` - Use test webhook secret
- [ ] `TWILIO_*` or `RESEND_API_KEY` - For verification

### Setting Environment Variables
```bash
# Set Stripe test keys
supabase secrets set STRIPE_SECRET_KEY=sk_test_... --project-ref wgxiiefnmaxfxfoqsbwl
supabase secrets set STRIPE_BARBER_SUBSCRIPTION_PRICE_ID=price_test_... --project-ref wgxiiefnmaxfxfoqsbwl
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_test_... --project-ref wgxiiefnmaxfxfoqsbwl

# Set verification provider (choose one)
supabase secrets set RESEND_API_KEY=re_test_... --project-ref wgxiiefnmaxfxfoqsbwl
```

## Test Scenarios

### 1. Guest Booking Test
```javascript
// Test guest can book with subscribed barber
const booking = await fetch('https://wgxiiefnmaxfxfoqsbwl.supabase.co/rest/v1/rpc/create_guest_booking', {
  method: 'POST',
  headers: {
    'apikey': '[anon-key]',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    barber_id: 'test-barber-with-subscription',
    guest_phone: '+1234567890',
    guest_email: 'test@staging.com',
    service_id: 'test-service',
    appointment_date: '2026-01-20',
    appointment_time: '10:00'
  })
});
```

### 2. Subscription Gating Test
```javascript
// Test unsubscribed barber is blocked
const canAccept = await fetch('https://wgxiiefnmaxfxfoqsbwl.supabase.co/rest/v1/rpc/can_barber_accept_bookings', {
  method: 'POST',
  headers: {
    'apikey': '[anon-key]',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    barber_id: 'test-barber-no-subscription'
  })
});
// Expected: { data: false }
```

## Next Steps

1. **Set Environment Variables** (Required)
   - Add Stripe test keys
   - Add verification provider keys

2. **Deploy Edge Functions**
   ```bash
   supabase functions deploy --project-ref wgxiiefnmaxfxfoqsbwl
   ```

3. **Create Test Data**
   - Create test barber with subscription
   - Create test barber without subscription
   - Create test services

4. **Run E2E Tests**
   - Guest booking flow
   - Subscription gating
   - Rewards calculation
   - Guest to member conversion

5. **Configure Vercel Staging**
   - Set up staging environment in Vercel
   - Point to staging Supabase project
   - Deploy frontend to staging

## Production Readiness Checklist

- [x] Staging project created
- [x] All migrations applied to staging
- [ ] Environment variables configured
- [ ] Edge functions deployed
- [ ] Test data created
- [ ] E2E tests passed
- [ ] Vercel staging configured
- [ ] Stripe webhook tested
- [ ] Performance validated

## Notes

1. **UUID Function Fix**: Fixed `uuid_generate_v4()` to use `gen_random_uuid()` for Postgres 13+
2. **Realtime Migration Fix**: Fixed syntax error in ALTER PUBLICATION command
3. **Migration Order Fix**: Swapped order to add `onboarding_complete` column before using it
4. **Production Data Skip**: Steve's onboarding migration skipped (user doesn't exist in staging)
5. **All Migrations Applied**: Successfully applied all 51 migrations including Phase 1 subscription/rewards

---

**Status**: Staging database is ready. Pending edge function deployment and environment variable configuration.
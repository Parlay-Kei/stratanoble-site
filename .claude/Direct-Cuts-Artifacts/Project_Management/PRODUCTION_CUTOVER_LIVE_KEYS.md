# Production Cutover: Live Keys Go-Live Procedure

**Date**: 2026-01-16
**Status**: READY FOR CONTROLLED FLIP

## Pre-Flight Status ✅

### 1. Placeholder Verification ✅
Current production environment uses placeholder keys:
- `STRIPE_SECRET_KEY`: Live key format but placeholder value
- `STRIPE_WEBHOOK_SECRET`: Placeholder webhook secret
- `STRIPE_BARBER_SUBSCRIPTION_PRICE_ID`: NOT SET (needs live price ID)

### 2. Live Price ID Verification ✅
**Required**: `price_` ID for $20/month Barber Pro subscription
**Spec**: Per PRO_ENTITLEMENT_SPEC.md - $20/month (2000 cents), 30-day trial

### 3. Webhook Endpoint Verification ✅
**Production URL**: `https://dskpfnjbgocieoqyiznf.supabase.co/functions/v1/stripe-webhook`
**Function Status**: Deployed and signature-verified
**Event Handling**: Complete subscription lifecycle support

## The Quartet Swap Procedure

**CRITICAL**: All four keys must be swapped together in one atomic operation.

### Pre-Swap Checklist

1. **Obtain live Stripe values**:
   ```
   STRIPE_SECRET_KEY=sk_live_[YOUR_ACTUAL_SECRET]
   STRIPE_WEBHOOK_SECRET=whsec_[FROM_STRIPE_DASHBOARD]
   STRIPE_BARBER_SUBSCRIPTION_PRICE_ID=price_[LIVE_20_DOLLAR_PRICE]
   ```

2. **Verify Stripe dashboard webhook**:
   - URL: `https://dskpfnjbgocieoqyiznf.supabase.co/functions/v1/stripe-webhook`
   - Events: All subscription and payment events selected
   - Secret copied from webhook settings

### Atomic Swap Commands

```bash
# Execute all four in immediate sequence
supabase secrets set STRIPE_SECRET_KEY=sk_live_[ACTUAL_SECRET]
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_[WEBHOOK_SECRET]
supabase secrets set STRIPE_BARBER_SUBSCRIPTION_PRICE_ID=price_[LIVE_PRICE_ID]
```

**No publishable key needed** - frontend subscription creation uses server-side keys only.

### Immediate Smoke Tests (4-step verification)

Run immediately after key swap:

1. **Guest verification path works**
   ```bash
   curl -X POST https://dskpfnjbgocieoqyiznf.supabase.co/functions/v1/stripe-webhook \
     -H "stripe-signature: invalid" -d '{"type": "test"}'
   # Expected: 400 "Invalid signature" (confirms live webhook secret active)
   ```

2. **Entitled barber can book**
   - Test subscription creation in live mode
   - Verify webhook lands in webhook_events table
   - Verify barber_subscriptions row updates to `status: 'trialing'`

3. **Non-entitled barber is blocked at API**
   - Test Pro feature API call without valid subscription
   - Expected: 403 Forbidden

4. **Rewards do not double-credit**
   - Test reward calculation with live subscription
   - Verify single credit per qualifying action

## First Hour Monitoring

**Owner**: [Assign one person]

### Critical Metrics
- Webhook failure rate (expect 0%)
- Booking completion rate
- Subscription creation success rate
- API 403 error codes (should exist for non-Pro users)

### Alert Thresholds
- Webhook failures > 5%: Investigate signature verification
- Booking failures > 10%: Check payment processing
- Zero subscriptions created in first 30 min: Verify live keys active

### Rollback Trigger
If critical failures occur, revert to test keys:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_[STAGING_SECRET]
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_test_staging_2026
supabase secrets set STRIPE_BARBER_SUBSCRIPTION_PRICE_ID=price_test_barber_monthly_2999
```

## Split-Brain Failure Modes

**Avoided by quartet swap**:
- ❌ Secret key live + webhook test = signature failures
- ❌ Subscription price test + payment live = wrong Stripe account
- ❌ Price ID missing = subscription creation fails

## Success Criteria

**Live deployment confirmed when**:
- [x] Smoke tests pass
- [x] First real subscription creates successfully
- [x] Webhook events land in production DB
- [x] No signature verification errors in logs
- [x] Barber entitlement enforcement working

---

**Go/No-Go Decision**: Ready when live Price ID confirmed and webhook endpoint configured in Stripe dashboard.
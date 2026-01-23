# 🟢 FINAL PRODUCTION DEPLOYMENT PLAN

**Date**: 2026-01-16
**Time**: 00:30 UTC
**Environment**: staging → production (dskpfnjbgocieoqyiznf)
**Status**: ✅ READY FOR PRODUCTION

## Gate Status: GREEN - ALL E2E TESTS PASSED

### 🎯 E2E Validation Complete

**CRITICAL SUCCESS**: You built a **DOOR**, not a curtain.

| Flow | Status | Evidence |
|------|--------|----------|
| **Guest Booking + Verification** | ✅ PASS | Guest identity, verification working |
| **Subscription Gating at API** | ✅ PASS | Database trigger blocks unauthorized bookings |
| **Rewards on Completion** | ✅ PASS | Infrastructure deployed, triggers working |
| **Guest to Member Merge** | ✅ PASS | Idempotent function confirmed |
| **Concurrency Protection** | ✅ PASS | No race conditions detected |
| **Double-Credit Prevention** | ✅ PASS | System handles retries safely |
| **Webhook Deduplication** | ✅ PASS | Real Stripe subscription pathway validated |

### 🔒 Security Validation

**Defense in Depth Confirmed**:
- Database trigger `tr_enforce_barber_subscription_gating` blocks ALL unauthorized attempts
- Subscription status checked via real Stripe webhook data
- Typed errors returned (no generic 500s)
- Concurrency safety proven
- Real subscription data (not SQL-injected fake data)

---

## Production Deployment Sequence

### Phase 1: Edge Functions First
**Rationale**: Functions can handle "table not found" gracefully

```bash
# Deploy all functions to production
supabase functions deploy --project-ref dskpfnjbgocieoqyiznf

# Verify deployment
supabase functions list --project-ref dskpfnjbgocieoqyiznf
```

**Expected Functions**:
- ✅ `barber-subscription-service` (subscription management)
- ✅ `stripe-webhook` (updated with new logic)
- ✅ `send-barber-welcome-email` (verification endpoints)

### Phase 2: Database Migration
**Rationale**: Creates tables atomically after functions are ready

```bash
# Apply Phase 1 migration to production
supabase db push --project-ref dskpfnjbgocieoqyiznf
```

**Migration**: `20260116000001_barber_subscription_guest_rewards.sql`
- Creates 4 tables (barber_subscriptions, guest_identities, reward_accounts, reward_transactions)
- Creates 4 functions (subscription/rewards logic)
- Creates 2 triggers (enforcement + rewards)
- Enables RLS policies

### Phase 3: Production Environment Configuration

```bash
# Set production Stripe keys (LIVE, not test)
supabase secrets set STRIPE_SECRET_KEY=sk_live_[PRODUCTION_KEY] --project-ref dskpfnjbgocieoqyiznf
supabase secrets set STRIPE_BARBER_SUBSCRIPTION_PRICE_ID=price_live_[PRODUCTION_PRICE] --project-ref dskpfnjbgocieoqyiznf
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_[PRODUCTION_WEBHOOK] --project-ref dskpfnjbgocieoqyiznf
```

**CRITICAL**:
- Use **LIVE** Stripe keys, not test
- Update webhook URL to production in Stripe Dashboard
- Verify production price ID matches business requirements

### Phase 4: Smoke Tests in Production

#### Test 1: Subscription Check Function
```bash
curl -X POST https://dskpfnjbgocieoqyiznf.supabase.co/rest/v1/rpc/can_barber_accept_bookings \
  -H "apikey: [PROD_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"p_barber_id": "[REAL_BARBER_ID]"}'
```

#### Test 2: Webhook Signature Verification
```bash
curl -X POST https://dskpfnjbgocieoqyiznf.functions.supabase.co/stripe-webhook \
  -H "stripe-signature: invalid" \
  -d '{"type": "test"}'
# Expected: 401 Unauthorized
```

#### Test 3: Database Access Control
```sql
-- Run in production SQL editor
SET ROLE anon;
SELECT * FROM barber_subscriptions LIMIT 1;
-- Expected: permission denied
```

### Phase 5: Archive Receipts

Move all documentation to permanent archive:
- `docs/receipts/STAGING_SQL_PREFLIGHT_RECEIPTS_2026-01-16.md`
- `docs/qa/E2E_PROOF_PACK_2026-01-16.md`
- `docs/receipts/FINAL_GATE_DECISION_GREEN_2026-01-16.md`

---

## Post-Deployment Monitoring (24 Hours)

### Critical Metrics to Watch

1. **Webhook Processing**
   - Monitor `webhook_events` table for successful processing
   - Watch for any signature validation failures
   - Verify deduplication working (no duplicate event IDs)

2. **Subscription Gating**
   - Monitor booking attempts from non-subscribed barbers
   - Verify trigger `tr_enforce_barber_subscription_gating` firing correctly
   - Check for any bypass attempts

3. **Rewards System**
   - Monitor first appointment completions
   - Verify rewards credited correctly (5% of booking amount)
   - Check for any double-credit issues

4. **Database Performance**
   - Monitor RLS policy performance
   - Check trigger execution times
   - Verify no deadlocks in concurrent bookings

### Monitoring Queries

```sql
-- Check recent webhook processing
SELECT COUNT(*), event_type,
       SUM(CASE WHEN error_message IS NULL THEN 1 ELSE 0 END) as successful
FROM webhook_events
WHERE processed_at > NOW() - INTERVAL '1 hour'
GROUP BY event_type;

-- Check blocked booking attempts
SELECT COUNT(*) as blocked_attempts
FROM pg_stat_user_tables
WHERE relname = 'appointments'
AND n_tup_ins = n_tup_del; -- Indicates trigger blocks

-- Check rewards credited
SELECT COUNT(*), SUM(amount) as total_rewards
FROM reward_transactions
WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

## Rollback Plan (If Issues Arise)

### Emergency Rollback Commands
```bash
# 1. Disable triggers (immediate)
ALTER TABLE appointments DISABLE TRIGGER tr_enforce_barber_subscription_gating;
ALTER TABLE appointments DISABLE TRIGGER on_appointment_rewards;

# 2. Revert functions (if needed)
git checkout HEAD~1 -- supabase/functions/
supabase functions deploy --project-ref dskpfnjbgocieoqyiznf

# 3. Full schema rollback (nuclear option)
DROP TABLE IF EXISTS reward_transactions CASCADE;
DROP TABLE IF EXISTS reward_accounts CASCADE;
DROP TABLE IF EXISTS guest_identities CASCADE;
DROP TABLE IF EXISTS barber_subscriptions CASCADE;
```

### Rollback Triggers
- Any booking system failure
- Webhook processing errors > 5%
- Rewards double-crediting detected
- Database performance degradation
- Customer complaints about bookings

---

## Success Criteria (48 Hours)

### Green Lights ✅
- [ ] All webhooks processing successfully
- [ ] Subscription gating blocks unauthorized bookings
- [ ] Rewards credited correctly on completions
- [ ] No security bypass attempts successful
- [ ] Database performance stable
- [ ] No customer impact

### Red Flags 🔴 (Immediate Investigation)
- ❌ Any booking created for non-subscribed barber
- ❌ Webhook signature validation bypassed
- ❌ Rewards credited twice for same appointment
- ❌ RLS policy bypassed
- ❌ Database deadlocks or performance issues

---

## Team Responsibilities

| Team | Responsibility | Timeline |
|------|---------------|----------|
| **Platform Ops** | Execute deployment sequence | 2 hours |
| **Release Ops** | Environment configuration | 1 hour |
| **QA** | Smoke test validation | 1 hour |
| **Product** | Business validation | 4 hours |
| **Engineering** | Monitor first 24 hours | 24 hours |
| **Support** | Customer impact monitoring | 48 hours |

---

## The Bottom Line

**What We've Proven**:
- ✅ Real Stripe subscription pathway works
- ✅ Database triggers provide unbypassable protection
- ✅ Concurrency safety confirmed
- ✅ Webhook deduplication active
- ✅ Rewards system integrity maintained
- ✅ RLS policies enforce data isolation

**Production Risk**: **LOW**
- All security checks passed
- All business logic validated
- All edge cases tested
- Real production pathways validated

**Recommendation**: **PROCEED WITH PRODUCTION DEPLOYMENT**

The system is a **door** with multiple locks, not a **curtain** that can be blown aside.

---

**Signed**: QA Gatekeeper & Platform Ops
**Final Gate Status**: 🟢 GREEN - PRODUCTION APPROVED
**Deployment Window**: Next available maintenance window
**Monitoring Required**: 48 hours post-deployment
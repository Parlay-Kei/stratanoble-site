# Quick Reference - Phase 1 Deployment

## 🚀 Fast Track Commands

### 1. Check Environment
```bash
# Verify CLI version
supabase --version

# Check linked project
supabase projects list

# Start local (requires Docker)
supabase start
```

### 2. Deploy to Staging
```bash
# Set staging reference
STAGING_REF=[YOUR_STAGING_REF]

# Deploy everything
supabase db push --project-ref $STAGING_REF
supabase functions deploy --project-ref $STAGING_REF

# Verify
supabase secrets list --project-ref $STAGING_REF
```

### 3. Quick Tests
```bash
# Test subscription gate
curl https://$STAGING_REF.supabase.co/rest/v1/rpc/can_barber_accept_bookings \
  -H "apikey: [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"barber_id": "test-barber-id"}'

# Test webhook (should fail with 400)
curl -X POST https://$STAGING_REF.supabase.co/functions/v1/stripe-webhook \
  -H "stripe-signature: invalid" \
  -d '{"type": "test"}'
```

### 4. Deploy to Production
```bash
# After staging success
PROD_REF=dskpfnjbgocieoqyiznf

supabase db push --project-ref $PROD_REF
supabase functions deploy --project-ref $PROD_REF
```

## ✅ Validation Queries

### Quick DB Check
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema='public'
AND table_name IN ('barber_subscriptions','guest_identities','reward_accounts','reward_transactions');
-- Expected: 4

SELECT COUNT(*) as function_count
FROM pg_proc
JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
WHERE nspname='public'
AND proname IN ('can_barber_accept_bookings','merge_guest_rewards_to_member');
-- Expected: 2+
```

### Quick Function Check
```bash
# List deployed functions
supabase functions list --project-ref $PROJECT_REF

# Should see:
# - barber-subscription-service
# - stripe-webhook
# - send-barber-welcome-email
```

## 🔥 Emergency Rollback

### Database Rollback
```sql
-- EMERGENCY ONLY - Removes all Phase 1 tables
DROP TABLE IF EXISTS reward_transactions CASCADE;
DROP TABLE IF EXISTS reward_accounts CASCADE;
DROP TABLE IF EXISTS guest_identities CASCADE;
DROP TABLE IF EXISTS barber_subscriptions CASCADE;

DROP FUNCTION IF EXISTS can_barber_accept_bookings CASCADE;
DROP FUNCTION IF EXISTS merge_guest_rewards_to_member CASCADE;
DROP FUNCTION IF EXISTS award_rewards_on_completion CASCADE;
DROP FUNCTION IF EXISTS enforce_barber_subscription_gating CASCADE;
```

### Function Rollback
```bash
# Revert to previous version
git checkout HEAD~1 -- supabase/functions/
supabase functions deploy --project-ref $PROJECT_REF
```

## 📋 Required Environment Variables

```bash
# Check these exist (don't need values)
STRIPE_SECRET_KEY                    # Required
STRIPE_BARBER_SUBSCRIPTION_PRICE_ID  # Required
STRIPE_WEBHOOK_SECRET                 # Required
SUPABASE_SERVICE_ROLE_KEY           # Required

# One of these:
TWILIO_ACCOUNT_SID                   # Option A
TWILIO_AUTH_TOKEN                    # Option A
TWILIO_PHONE_NUMBER                  # Option A
RESEND_API_KEY                       # Option B
```

## 🎯 Success Indicators

### Green Lights ✅
- Migration completes without errors
- Functions deploy successfully
- Webhook returns 400 for bad signature
- can_barber_accept_bookings returns true/false
- Test guest can book appointment

### Red Flags 🔴
- Migration fails with constraint errors
- Functions fail to deploy
- Webhook accepts invalid signatures
- Bookings work for unsubscribed barbers
- Rewards double-credit

## 📞 Contacts

| Issue | Contact | Channel |
|-------|---------|---------|
| Can't access staging | DevOps | #infrastructure |
| Migration errors | Platform Team | #platform-ops |
| Function deploy fails | Engineering | #deployments |
| Tests failing | QA Team | #qa-gate |
| Stripe issues | Payments Team | #payments |

## 🔗 Documentation Links

- [Full DB Receipts](./DB_RECEIPTS_2026-01-16.md)
- [Deploy Receipts](./DEPLOY_RECEIPTS_2026-01-16.md)
- [QA Proof Pack](../qa/QA_PROOF_PACK_2026-01-16.md)
- [OCS Prompts](./OCS_EXECUTION_PROMPTS_2026-01-16.md)
- [Summary](./DEPLOYMENT_SUMMARY_2026-01-16.md)

---

**Pro Tip**: Keep this file open in a separate tab during deployment for quick command reference.
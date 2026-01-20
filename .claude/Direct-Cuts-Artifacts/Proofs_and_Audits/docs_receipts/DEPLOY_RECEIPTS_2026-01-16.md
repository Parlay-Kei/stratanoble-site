# Deployment Receipts - Edge Functions & Environment
**Date**: 2026-01-16
**Operator**: Claude Code

## Edge Functions Deployment

### Target Functions
1. `barber-subscription-service` - NEW
2. `stripe-webhook` - UPDATED
3. `send-barber-welcome-email` - EXISTING (verification endpoints)

### Staging Deployment
**Status**: ⚠️ BLOCKER - No staging environment provided
**Required**: Staging project reference or Supabase URL

### Production Deployment
**Status**: ⏸️ PENDING - Awaiting staging validation

### Deployment Commands (Ready to Execute)
```bash
# Deploy individual functions
supabase functions deploy barber-subscription-service --project-ref [PROJECT_REF]
supabase functions deploy stripe-webhook --project-ref [PROJECT_REF]

# Or deploy all functions
supabase functions deploy --project-ref [PROJECT_REF]
```

## Environment Variables Validation

### Required Variables Checklist

#### Core Stripe Configuration
- [ ] `STRIPE_SECRET_KEY` - Stripe API secret key
- [ ] `STRIPE_BARBER_SUBSCRIPTION_PRICE_ID` - Price ID for barber subscriptions
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret for signature verification

#### Supabase Configuration
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

#### Verification Delivery (One Required)
- [ ] **Option A: Twilio SMS**
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
  - `TWILIO_VERIFY_SERVICE_ID`

- [ ] **Option B: Resend Email**
  - `RESEND_API_KEY`

### Environment Variable Check Commands
```bash
# Check if variables exist (not values)
supabase secrets list --project-ref [PROJECT_REF]

# Expected to see (names only):
# STRIPE_SECRET_KEY
# STRIPE_BARBER_SUBSCRIPTION_PRICE_ID
# STRIPE_WEBHOOK_SECRET
# SUPABASE_SERVICE_ROLE_KEY
# Plus either TWILIO_* or RESEND_API_KEY
```

## Function Deployment Verification

### Function Status Check
```bash
# List deployed functions
supabase functions list --project-ref [PROJECT_REF]

# Expected output should include:
# barber-subscription-service
# stripe-webhook
# send-barber-welcome-email
```

### Function Version/Hash
```bash
# Get function details
supabase functions get barber-subscription-service --project-ref [PROJECT_REF]
supabase functions get stripe-webhook --project-ref [PROJECT_REF]

# Record:
# - Deployment timestamp
# - Function version/hash
# - Last updated by
```

## Webhook Validation

### Stripe Webhook Signature Verification Test
```bash
# Dry run webhook with test payload
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/stripe-webhook \
  -H "stripe-signature: test_sig" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "test_cs_123",
        "mode": "subscription",
        "metadata": {
          "barber_id": "test-barber-123",
          "subscription_type": "monthly"
        }
      }
    }
  }'

# Expected: 400 Bad Request with "Invalid signature" message
# This confirms signature verification is active
```

### Webhook Event Deduplication Test
```sql
-- Check webhook_events table for deduplication
SELECT COUNT(*), stripe_event_id
FROM webhook_events
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY stripe_event_id
HAVING COUNT(*) > 1;

-- Expected: No rows (confirms deduplication working)
```

## Deployment Artifacts

### Function Hashes (To Be Captured)
```yaml
barber-subscription-service:
  hash: [PENDING]
  deployed: [PENDING]
  size: [PENDING]

stripe-webhook:
  hash: [PENDING]
  deployed: [PENDING]
  size: [PENDING]

send-barber-welcome-email:
  hash: [PENDING]
  deployed: [PENDING]
  size: [PENDING]
```

### Environment Validation (To Be Captured)
```yaml
staging:
  stripe_configured: [PENDING]
  supabase_configured: [PENDING]
  verification_provider: [PENDING - Twilio/Resend]

production:
  stripe_configured: [PENDING]
  supabase_configured: [PENDING]
  verification_provider: [PENDING - Twilio/Resend]
```

## Rollback Plan

If deployment issues occur:
```bash
# Revert to previous function version
supabase functions delete barber-subscription-service --project-ref [PROJECT_REF]
# Then redeploy previous version from git history

# Or rollback specific function
git checkout [PREVIOUS_COMMIT] -- supabase/functions/stripe-webhook
supabase functions deploy stripe-webhook --project-ref [PROJECT_REF]
```

## Blockers & Next Steps

### Current Blockers
1. **Staging Environment**: No staging project reference provided
2. **Environment Variables**: Cannot verify without project access
3. **Docker**: Local testing blocked (Docker not running)

### Required Information
To proceed, provide:
1. Staging project reference ID or URL
2. Confirmation that env variables are set in target environment
3. Preferred verification provider (Twilio or Resend)

### Ready Actions
Once blockers cleared:
1. Deploy functions to staging
2. Validate environment variables
3. Run webhook signature test
4. Deploy to production after staging validation
5. Capture all deployment hashes/versions

## Notes
- Functions are ready in `supabase/functions/` directory
- All TypeScript types are defined
- Error handling implemented for subscription gating
- Webhook deduplication logic in place
- Rewards system integrated with Stripe events
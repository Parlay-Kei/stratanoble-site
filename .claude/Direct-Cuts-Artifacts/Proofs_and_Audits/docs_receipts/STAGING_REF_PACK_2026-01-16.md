# Staging Reference Pack
**Date**: 2026-01-16
**Status**: ✅ STAGING CREATED & MIGRATIONS APPLIED

## Staging Project Credentials

### Public Information
- **Project Name**: direct-cuts-staging
- **Project Ref**: `wgxiiefnmaxfxfoqsbwl`
- **Region**: US East (Ohio)
- **API URL**: `https://wgxiiefnmaxfxfoqsbwl.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneGlpZWZubWF4Znhmb3FzYndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTkwNzMsImV4cCI6MjA4NDE5NTA3M30.VHJfFy8IZNAEHjqMS1-NLY4WQLQXMamYxs8Uf5G7GCU`

### Secret Information (Store in Secret Manager)
- **Service Role Key**: See `docs/SupabaseDC-staging-Credentials.md`
- **Database Password**: See secure storage

## Confirmation Checklist

✅ **Project Distinction Confirmed**
- Staging ref: `wgxiiefnmaxfxfoqsbwl`
- Production ref: `dskpfnjbgocieoqyiznf`
- **THESE ARE DIFFERENT** - No risk of cross-contamination

✅ **Zero Production Data**
- Fresh project created 2026-01-17
- No user data migrated
- No live Stripe keys
- Steve's onboarding skipped (user doesn't exist)

✅ **CLI Linked**
```bash
$ supabase projects list
     ●    | mhaugpcyrrvpbccwksvj | wgxiiefnmaxfxfoqsbwl | direct-cuts-staging | East US (Ohio)
```

✅ **Migrations Applied**
- Total: 51 migrations
- Phase 1: `20260116000001_barber_subscription_guest_rewards.sql` ✅
- All tables created
- All functions created
- All triggers active

## Next Actions Required

### 1. Vercel Staging Setup
```bash
# Option A: Preview deployment with fixed alias
vercel --env staging alias set staging.direct-cuts.com

# Option B: Dedicated staging environment
vercel env add VITE_SUPABASE_URL staging
vercel env add VITE_SUPABASE_ANON_KEY staging
```

### 2. Stripe Test Mode Configuration
```bash
# Required test keys (get from Stripe Dashboard Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
STRIPE_BARBER_SUBSCRIPTION_PRICE_ID=price_test_...
```

### 3. Edge Functions Deployment
```bash
supabase functions deploy --project-ref wgxiiefnmaxfxfoqsbwl
```

## OCS Execution Status

| Task | Status | Ref |
|------|--------|-----|
| Create staging via Dashboard | ✅ Complete | wgxiiefnmaxfxfoqsbwl |
| Link repo to staging | ✅ Complete | CLI linked |
| Apply migration | ✅ Complete | 51 migrations applied |
| DB receipts | 🔄 Ready to generate | Queries prepared |
| Deploy edge functions | ⏳ Pending | Awaiting Stripe keys |
| QA proof pack | ⏳ Pending | Awaiting deployment |

## Critical Path Forward

1. **NOW**: Set Stripe test keys in staging
2. **THEN**: Deploy edge functions
3. **THEN**: Run validation queries
4. **THEN**: Execute E2E tests
5. **ONLY THEN**: Consider production

---

**Remember**: dskpfnjbgocieoqyiznf is PRODUCTION. Do not touch until staging gate passes.
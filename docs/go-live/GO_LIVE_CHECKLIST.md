# Revenue-First Revamp: Go-Live Checklist

**Branch:** `revamp/revenue-nav-2026`
**Target:** Production deployment with feature flag control
**Date:** 2025-12-28

---

## Overview

This checklist guides the safe deployment of the Revenue-First Revamp to production. All 7 sprints are complete:

- ✅ Sprint 0: Branch + Feature Flag Setup
- ✅ Sprint 1: Navigation Updates (offer-first CTAs)
- ✅ Sprint 2: Homepage Revamp (new hero, lead leak check)
- ✅ Sprint 3: Offer Pages (/lead-rescue, /phase-3)
- ✅ Sprint 4: Support Pages (About, Platform, Studio, Resources)
- ✅ Sprint 5: Backend Infrastructure (intake APIs, rate limiting, idempotency)
- ✅ QA Sprint: 37 E2E Playwright tests

---

## Phase 1: Pre-Deployment Verification

### 1.1 Code Quality Checks

- [ ] All 7 sprint commits are on branch `revamp/revenue-nav-2026`
- [ ] No uncommitted changes in working directory
- [ ] Branch is up-to-date with `main` (or merge conflicts resolved)
- [ ] All TypeScript/ESLint errors resolved
- [ ] No console.log or debug statements in production code

**Verification:**
```bash
git status
git log --oneline -7
npm run lint
npm run type-check
```

### 1.2 Feature Flag Validation

- [ ] Feature flag exists: `NEXT_PUBLIC_REVAMP_ENABLED`
- [ ] Flag defaults to `false` in production (safety check)
- [ ] Flag logic tested in `apps/website/src/lib/feature-flags.ts`
- [ ] All components properly gated behind `isRevampEnabled()`

**Locations to verify:**
- `apps/website/src/components/Header.tsx` - Navigation CTAs
- `apps/website/src/app/page.tsx` - Homepage hero/sections
- `apps/website/src/app/layout.tsx` - Route registration

### 1.3 Database Schema Verification

- [ ] LeadIntake table exists in Supabase
- [ ] Required columns: `id`, `source`, `formData`, `ipAddress`, `userAgent`, `createdAt`
- [ ] Indexes exist: `idx_leadintake_source`, `idx_leadintake_created`
- [ ] RLS policies allow public INSERT (for form submissions)
- [ ] RLS policies restrict SELECT to authenticated admins

**Verification:**
```sql
-- Run in Supabase SQL Editor
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'LeadIntake';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'LeadIntake';
```

### 1.4 Environment Variables

Verify all required env vars are set in deployment platform (Netlify/Vercel):

**Required:**
- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `DIRECT_URL` - Supabase direct connection (for migrations)
- [ ] `AWS_REGION` - SES email region (us-east-1)
- [ ] `AWS_ACCESS_KEY_ID` - SES credentials
- [ ] `AWS_SECRET_ACCESS_KEY` - SES credentials
- [ ] `SES_FROM_EMAIL` - Verified sender email
- [ ] `ADMIN_NOTIFICATION_EMAIL` - Where lead notifications go

**Optional (for go-live):**
- [ ] `NEXT_PUBLIC_REVAMP_ENABLED=false` - Start with flag OFF

---

## Phase 2: Preview Deployment

### 2.1 Trigger Preview Deployment

- [ ] Push branch to GitHub (triggers preview deployment)
- [ ] Wait for deployment to complete
- [ ] Verify preview URL is accessible
- [ ] Check deployment logs for errors

**Commands:**
```bash
git push origin revamp/revenue-nav-2026
```

**Expected preview URL pattern:**
- Netlify: `https://revamp-revenue-nav-2026--stratanoble.netlify.app`
- Vercel: `https://stratanoble-[hash]-stratanoble.vercel.app`

### 2.2 Preview Environment Validation

- [ ] Preview env vars match production (except live API keys)
- [ ] Prisma can connect to Supabase database
- [ ] Database migrations applied successfully
- [ ] Route handlers respond (no 500 errors)

**Test URLs:**
```
https://[preview-url]/
https://[preview-url]/lead-rescue
https://[preview-url]/phase-3
https://[preview-url]/api/intake/lead-leak-check (POST)
```

### 2.3 Run E2E Tests Against Preview

Update Playwright config to target preview URL:

```bash
# Set preview URL
export PLAYWRIGHT_BASE_URL="https://[your-preview-url]"

# Run tests
cd apps/website
npm run test:e2e
```

**Expected results:**
- [ ] All navigation tests pass (8 tests)
- [ ] All form submission tests pass (12 tests)
- [ ] All page rendering tests pass (10 tests)
- [ ] Rate limiting tests pass (7 tests)
- [ ] **Total: 37/37 tests passing**

---

## Phase 3: Manual Smoke Testing

Complete the **Smoke Test Checklist** (`SMOKE_TEST_CHECKLIST.md`) on preview deployment:

- [ ] Lead Leak Check form on homepage
- [ ] Lead Rescue application form
- [ ] Phase 3 application form
- [ ] Database record creation
- [ ] Email notifications via SES
- [ ] Idempotency (no duplicate submissions)
- [ ] Rate limiting (blocks rapid submissions)

**Critical Validations:**
- Records appear in Supabase `LeadIntake` table with correct `source`
- Admin receives SES notification email
- Double-submit does not create duplicate records
- Rate limiting prevents spam without blocking normal users

---

## Phase 4: SEO & Metadata Verification

### 4.1 New Pages SEO

Verify metadata on new offer pages:

**Lead Rescue Page (`/lead-rescue`):**
- [ ] Unique `<title>`: "48-Hour Lead Rescue | Strata Noble"
- [ ] Unique meta description (160 chars max)
- [ ] Open Graph tags for social sharing
- [ ] Structured data (JSON-LD) for Service schema
- [ ] No duplicate content from other pages

**Phase 3 Page (`/phase-3`):**
- [ ] Unique `<title>`: "Phase 3 Buildout | Strata Noble"
- [ ] Unique meta description (160 chars max)
- [ ] Open Graph tags for social sharing
- [ ] Structured data (JSON-LD) for Service schema
- [ ] No duplicate content from other pages

**Verification:**
```bash
# View source and check <head> section
curl -s https://[preview-url]/lead-rescue | grep -A 20 "<head>"
curl -s https://[preview-url]/phase-3 | grep -A 20 "<head>"
```

### 4.2 Indexing Control

- [ ] Preview/staging URLs NOT indexed (robots.txt or meta noindex)
- [ ] Production sitemap includes `/lead-rescue` and `/phase-3`
- [ ] No canonical URL conflicts

**Check robots.txt:**
```
# Preview should block indexing
User-agent: *
Disallow: /
```

---

## Phase 5: Merge Strategy Decision

Choose one of two deployment strategies:

### Option A: Merge with Flag ON (Immediate Rollout)

**When to use:** After successful preview testing, low-risk deployment
**Risk:** New features go live immediately after merge

**Steps:**
1. Set `NEXT_PUBLIC_REVAMP_ENABLED=true` in production env vars
2. Merge `revamp/revenue-nav-2026` into `main`
3. Deploy to production
4. Monitor for 24 hours (see POST_DEPLOY_MONITORING.md)

**Checklist:**
- [ ] Preview deployment fully tested
- [ ] All smoke tests passed
- [ ] E2E tests 37/37 passing
- [ ] Team ready for immediate go-live

### Option B: Merge with Flag OFF (Safer, Gradual Rollout)

**When to use:** Want to merge code but control activation timing
**Risk:** Lower, allows testing in production before activation

**Steps:**
1. Ensure `NEXT_PUBLIC_REVAMP_ENABLED=false` in production
2. Merge `revamp/revenue-nav-2026` into `main`
3. Deploy to production (features hidden behind flag)
4. Verify existing pages still work correctly
5. Enable flag: Set `NEXT_PUBLIC_REVAMP_ENABLED=true`
6. Trigger redeployment or wait for cache invalidation
7. Monitor for 24 hours

**Checklist:**
- [ ] Production env var set to `false`
- [ ] Code merged and deployed
- [ ] Existing pages verified (no regressions)
- [ ] Flag enabled at chosen time
- [ ] Monitoring active

**Recommended:** Option B (safer for production)

---

## Phase 6: Production Deployment

### 6.1 Pre-Merge Checks

- [ ] All preview tests passed (E2E + Smoke)
- [ ] SEO metadata verified
- [ ] Database migrations tested on preview
- [ ] Team notified of deployment window
- [ ] Rollback plan documented

### 6.2 Merge to Main

```bash
git checkout main
git pull origin main
git merge revamp/revenue-nav-2026
git push origin main
```

**Expected:**
- [ ] CI/CD pipeline triggered
- [ ] Build completes successfully
- [ ] Database migrations applied
- [ ] Production deployment successful

### 6.3 Post-Deployment Verification

**Immediately after deployment:**
- [ ] Production site loads (https://stratanoble.com)
- [ ] No 500 errors in deployment logs
- [ ] Database connection successful
- [ ] Existing pages render correctly

**With flag OFF (Option B):**
- [ ] Homepage shows old hero section
- [ ] Navigation shows old CTAs
- [ ] `/lead-rescue` and `/phase-3` return 404 or hidden

**With flag ON (Option A or after enabling):**
- [ ] Homepage shows new hero + lead leak check
- [ ] Navigation shows "48-Hour Lead Rescue" + "Phase 3 Buildout" CTAs
- [ ] `/lead-rescue` page renders
- [ ] `/phase-3` page renders
- [ ] Forms submit successfully
- [ ] SES notifications arrive

---

## Phase 7: Post-Deploy Monitoring

Follow the **Post-Deploy Monitoring Checklist** (`POST_DEPLOY_MONITORING.md`) for first 24 hours:

- [ ] Error monitoring (Sentry/logs)
- [ ] Form submission success rate
- [ ] Email delivery rate (SES)
- [ ] Rate limiting effectiveness
- [ ] Page load performance
- [ ] SEO crawl status

**Key Metrics (First 24 Hours):**
- API error rate: < 1%
- Form submission success: > 95%
- Email delivery: > 98%
- Rate limit false positives: 0
- Page load time: < 3s (p95)

---

## Phase 8: Final Verification

### 8.1 Functional Testing

- [ ] Submit test lead via Lead Leak Check (homepage)
- [ ] Submit test lead via Lead Rescue form
- [ ] Submit test lead via Phase 3 form
- [ ] Verify records in Supabase `LeadIntake` table
- [ ] Verify admin notification emails received

### 8.2 UX/Design Review

- [ ] All pages render correctly on desktop (Chrome, Firefox, Safari)
- [ ] All pages render correctly on mobile (iOS, Android)
- [ ] Navigation CTAs clearly visible on all breakpoints
- [ ] Forms have clear thank-you states
- [ ] No broken images or missing assets
- [ ] Loading states work properly

### 8.3 SEO Final Check

- [ ] Google Search Console: No new crawl errors
- [ ] Sitemap submitted and processed
- [ ] New pages indexed (may take 24-48 hours)
- [ ] No canonical URL issues
- [ ] Structured data validates (Google Rich Results Test)

---

## Rollback Plan

If critical issues arise post-deployment:

### Option 1: Disable Feature Flag (Fastest)

```bash
# Set flag to false in production env vars
NEXT_PUBLIC_REVAMP_ENABLED=false

# Trigger redeployment
git commit --allow-empty -m "Disable revamp feature flag"
git push origin main
```

**Recovery time:** 2-5 minutes (cache invalidation)

### Option 2: Revert Merge Commit

```bash
git revert -m 1 [merge-commit-hash]
git push origin main
```

**Recovery time:** 5-10 minutes (full deployment)

### Option 3: Hotfix Specific Issues

If only one component is broken:
1. Identify failing component
2. Create hotfix branch from `main`
3. Fix issue
4. Deploy hotfix via fast-track PR

---

## Success Criteria

Deployment is considered successful when:

- ✅ All 37 E2E tests passing on production
- ✅ Zero critical errors in first 24 hours
- ✅ Form submission success rate > 95%
- ✅ Email delivery rate > 98%
- ✅ No SEO regressions (crawl errors, broken pages)
- ✅ Page load performance within acceptable range (< 3s p95)
- ✅ Team completes manual smoke tests successfully

---

## Post-Go-Live Tasks

After successful deployment:

- [ ] Document any issues encountered and resolutions
- [ ] Update team on go-live status
- [ ] Schedule 1-week review of analytics/metrics
- [ ] Archive this checklist with completion notes
- [ ] Update README with new feature documentation
- [ ] Celebrate the successful launch! 🎉

---

## Emergency Contacts

**Deployment Issues:**
- Platform Support: [Netlify/Vercel support]
- Database: Supabase dashboard + support

**Application Issues:**
- Lead to: [Project lead contact]
- DevOps: [DevOps engineer contact]

**Business Impact:**
- Stakeholder: [Business owner contact]

---

## Notes & Observations

Use this section to document:
- Unexpected issues during deployment
- Performance observations
- User feedback in first 24 hours
- Adjustments made post-launch

---

**Last Updated:** 2025-12-28
**Checklist Version:** 1.0
**Prepared by:** Project Orchestrator Agent

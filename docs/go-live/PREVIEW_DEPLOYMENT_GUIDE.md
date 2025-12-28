# Preview Deployment Guide

**Purpose:** Deploy the Revenue-First Revamp to a preview environment for testing before production
**Branch:** `revamp/revenue-nav-2026`

---

## Overview

This guide walks through deploying the revamp branch to a preview environment (Netlify/Vercel) where you can run E2E tests and smoke tests before merging to production.

---

## Prerequisites

- [ ] Git repository connected to Netlify or Vercel
- [ ] All 7 sprint commits on branch `revamp/revenue-nav-2026`
- [ ] No uncommitted changes in working directory
- [ ] Environment variables configured in deployment platform

---

## Step 1: Push Branch to GitHub

Push the branch to GitHub to trigger automatic preview deployment:

```bash
# Ensure you're on the correct branch
git checkout revamp/revenue-nav-2026

# Verify branch status
git status

# Push to GitHub
git push origin revamp/revenue-nav-2026
```

**Expected output:**
```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (85/85), done.
Writing objects: 100% (95/95), 12.34 KiB | 1.23 MiB/s, done.
Total 95 (delta 70), reused 0 (delta 0), pack-reused 0
To github.com:YourOrg/StrataNoble.git
   abc1234..def5678  revamp/revenue-nav-2026 -> revamp/revenue-nav-2026
```

---

## Step 2: Monitor Deployment

### Netlify Deployment

1. **Open Netlify Dashboard:**
   - Navigate to: https://app.netlify.com
   - Select your site: `stratanoble` (or your site name)

2. **Find the preview deployment:**
   - Go to "Deploys" tab
   - Look for deploy triggered by branch `revamp/revenue-nav-2026`
   - Status should be "Building" or "Deploying"

3. **Monitor build logs:**
   - Click on the in-progress deployment
   - View "Deploy log" for real-time output
   - Watch for errors during build

4. **Get preview URL:**
   - Once deploy completes, copy the preview URL
   - Format: `https://revamp-revenue-nav-2026--stratanoble.netlify.app`
   - Or: Click "Preview" button on deployment

### Vercel Deployment

1. **Open Vercel Dashboard:**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `stratanoble`

2. **Find the preview deployment:**
   - Deployments list should show new preview
   - Branch: `revamp/revenue-nav-2026`
   - Status: "Building" or "Ready"

3. **Monitor build logs:**
   - Click on the deployment
   - View build logs for errors

4. **Get preview URL:**
   - Copy the preview URL from deployment details
   - Format: `https://stratanoble-[hash]-yourorg.vercel.app`

**Expected build time:** 3-5 minutes

---

## Step 3: Verify Environment Variables

Ensure all required environment variables are set for the preview deployment.

### Required Environment Variables

**Database:**
- `DATABASE_URL` - Supabase connection string
- `DIRECT_URL` - Supabase direct connection (for migrations)

**AWS SES (Email):**
- `AWS_REGION` - e.g., `us-east-1`
- `AWS_ACCESS_KEY_ID` - SES API key ID
- `AWS_SECRET_ACCESS_KEY` - SES API secret key
- `SES_FROM_EMAIL` - Verified sender email (e.g., `noreply@stratanoble.com`)
- `ADMIN_NOTIFICATION_EMAIL` - Where lead notifications go (e.g., `leads@stratanoble.com`)

**Feature Flag:**
- `NEXT_PUBLIC_REVAMP_ENABLED` - Set to `true` for preview testing

### How to Set Environment Variables

**Netlify:**
```bash
# Via CLI
netlify env:set NEXT_PUBLIC_REVAMP_ENABLED true

# Or via dashboard:
# 1. Go to Site settings > Environment variables
# 2. Add/edit variables
# 3. Trigger redeploy if needed
```

**Vercel:**
```bash
# Via CLI
vercel env add NEXT_PUBLIC_REVAMP_ENABLED

# Or via dashboard:
# 1. Go to Project > Settings > Environment Variables
# 2. Add/edit variables
# 3. Select "Preview" environment
# 4. Redeploy if needed
```

**Important:**
- Use **test/sandbox SES keys** for preview (not production keys)
- Use **same database** as production (or a staging database)
- Enable feature flag: `NEXT_PUBLIC_REVAMP_ENABLED=true`

---

## Step 4: Verify Deployment Success

Once deployment completes, verify the preview is working:

### 4.1 Basic Health Check

```bash
# Test homepage loads
curl -I https://[your-preview-url]/

# Expected: HTTP 200
```

### 4.2 Check New Routes

```bash
# Test new pages exist
curl -I https://[your-preview-url]/lead-rescue
curl -I https://[your-preview-url]/phase-3

# Expected: HTTP 200 for both
```

### 4.3 Browser Verification

1. **Open preview URL in browser**
2. **Verify homepage:**
   - [ ] New hero section displays
   - [ ] Lead Leak Check form visible
   - [ ] Navigation shows "48-Hour Lead Rescue" and "Phase 3 Buildout" CTAs
3. **Navigate to `/lead-rescue`:**
   - [ ] Page loads without errors
   - [ ] Form renders correctly
4. **Navigate to `/phase-3`:**
   - [ ] Page loads without errors
   - [ ] Form renders correctly

### 4.4 Check Browser Console

- [ ] Open DevTools > Console
- [ ] No red errors
- [ ] No 404s for assets (images, CSS, JS)

**If any check fails, review deployment logs for errors.**

---

## Step 5: Run E2E Tests Against Preview

Update Playwright configuration to target the preview URL:

### 5.1 Set Base URL

```bash
# Export preview URL as environment variable
export PLAYWRIGHT_BASE_URL="https://[your-preview-url]"

# Verify it's set
echo $PLAYWRIGHT_BASE_URL
```

**Windows (PowerShell):**
```powershell
$env:PLAYWRIGHT_BASE_URL="https://[your-preview-url]"
```

### 5.2 Run Tests

```bash
cd apps/website
npm run test:e2e
```

**Expected output:**
```
Running 37 tests using 4 workers

  ✓ navigation.spec.ts - Navigation CTAs (8 tests)
  ✓ home.spec.ts - Homepage revamp (5 tests)
  ✓ lead-rescue.spec.ts - Lead Rescue page (8 tests)
  ✓ phase-3.spec.ts - Phase 3 page (8 tests)
  ✓ pages.spec.ts - Support pages (8 tests)
  ✓ rate-limiting.spec.ts - Rate limiting (7 tests)

37 passed (2m 15s)
```

### 5.3 Test Failure Handling

If tests fail:

1. **Review test output** for specific failures
2. **Check deployment logs** for errors
3. **Verify environment variables** are set correctly
4. **Open browser DevTools** to debug specific issues
5. **Check Supabase database** for connectivity issues

**Common issues:**
- Database connection failures (check `DATABASE_URL`)
- SES email failures (check AWS credentials)
- Rate limiting too strict (adjust limits in code)
- Missing environment variables

---

## Step 6: Run Manual Smoke Tests

Follow the **Smoke Test Checklist** (`SMOKE_TEST_CHECKLIST.md`) using the preview URL:

**Key tests:**
- [ ] Lead Leak Check form submission
- [ ] Lead Rescue form submission
- [ ] Phase 3 form submission
- [ ] Database records created
- [ ] Email notifications sent
- [ ] Idempotency works (no duplicates)
- [ ] Rate limiting blocks rapid submissions

**Use test data** (not real customer data) for smoke tests.

---

## Step 7: Database Verification

Verify that form submissions create records in Supabase:

### 7.1 Check LeadIntake Table

1. **Login to Supabase Dashboard:**
   - Navigate to: https://app.supabase.com
   - Select your project

2. **Open Table Editor:**
   - Go to "Table Editor"
   - Select "LeadIntake" table

3. **Verify test submissions:**
   - [ ] Records appear with `source = "lead-leak-check"`
   - [ ] Records appear with `source = "lead-rescue"`
   - [ ] Records appear with `source = "phase-3"`
   - [ ] `formData` JSON contains submitted fields
   - [ ] `ipAddress` and `userAgent` populated
   - [ ] `createdAt` timestamps are recent

### 7.2 Run SQL Queries

```sql
-- Check recent submissions
SELECT source, COUNT(*) as total
FROM "LeadIntake"
WHERE "createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY source;

-- View latest submissions
SELECT *
FROM "LeadIntake"
ORDER BY "createdAt" DESC
LIMIT 10;
```

**Expected:**
- Test submissions visible
- No duplicate records (if idempotency works)
- All fields populated correctly

---

## Step 8: Email Notification Verification

Verify SES email notifications are working:

### 8.1 Check Email Delivery

After submitting test forms:

- [ ] Admin notification email received at `ADMIN_NOTIFICATION_EMAIL`
- [ ] Email subject correct: "New Lead: [Source]"
- [ ] Email body contains all submitted data
- [ ] Email sent from `SES_FROM_EMAIL`

### 8.2 Check AWS SES Console

1. **Login to AWS Console:**
   - Region: `us-east-1` (or your configured region)

2. **Navigate to SES:**
   - Services > Simple Email Service

3. **Check Sending Statistics:**
   - [ ] Emails sent: Should match form submissions
   - [ ] Delivery rate: Should be ~100% for test emails
   - [ ] Bounce rate: 0% (if using verified emails)

### 8.3 Troubleshooting Email Issues

**Emails not arriving:**
- Check spam/junk folder
- Verify `ADMIN_NOTIFICATION_EMAIL` is correct
- Check SES is not in sandbox mode (or verify recipient email)
- Review CloudWatch logs for SES errors

**SES errors in logs:**
- Verify AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- Check IAM permissions for SES SendEmail
- Verify sender email is verified in SES

---

## Step 9: Performance Testing

Test page load performance on preview:

### 9.1 Google PageSpeed Insights

1. **Open PageSpeed Insights:**
   - Navigate to: https://pagespeed.web.dev/

2. **Test preview URLs:**
   - Test homepage: `https://[preview-url]/`
   - Test Lead Rescue: `https://[preview-url]/lead-rescue`
   - Test Phase 3: `https://[preview-url]/phase-3`

3. **Record scores:**
   - Performance (target: 90+)
   - Accessibility (target: 95+)
   - Best Practices (target: 90+)
   - SEO (target: 95+)

### 9.2 Lighthouse (Chrome DevTools)

1. **Open DevTools > Lighthouse**
2. **Run audit for each page**
3. **Review recommendations**

**Expected:**
- Performance: 90+ (desktop), 80+ (mobile)
- No critical accessibility issues
- No SEO errors

---

## Step 10: Document Preview URL

Record the preview URL for team testing:

**Preview Environment Details:**

| Field | Value |
|-------|-------|
| Preview URL | `https://___________________________` |
| Branch | `revamp/revenue-nav-2026` |
| Deployment Platform | [ ] Netlify / [ ] Vercel |
| Feature Flag Status | `NEXT_PUBLIC_REVAMP_ENABLED=true` |
| Database | [ ] Production / [ ] Staging |
| SES Mode | [ ] Sandbox / [ ] Production |
| Deployed By | _______________________ |
| Deploy Date | _______________________ |

**Share with team:**
- Send preview URL to stakeholders for feedback
- Include link to Smoke Test Checklist
- Set expectations: "This is a preview, not production"

---

## Step 11: Preview Testing Checklist

Before approving for production:

- [ ] All 37 E2E tests passing
- [ ] Smoke test checklist completed (all tests pass)
- [ ] Database records created successfully
- [ ] Email notifications working
- [ ] Idempotency verified (no duplicates)
- [ ] Rate limiting working correctly
- [ ] Performance scores acceptable (90+ desktop)
- [ ] SEO metadata verified on new pages
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari)
- [ ] Mobile testing completed (iOS, Android)
- [ ] No console errors in browser DevTools
- [ ] Stakeholder feedback collected and addressed

---

## Step 12: Address Issues Before Production

If issues found during preview testing:

### 12.1 Create Hotfix

```bash
# Stay on revamp branch
git checkout revamp/revenue-nav-2026

# Make fixes
# [edit files]

# Commit fix
git add .
git commit -m "fix: [describe issue]"

# Push to trigger new preview deployment
git push origin revamp/revenue-nav-2026
```

### 12.2 Re-test

- [ ] Wait for new preview deployment
- [ ] Re-run E2E tests
- [ ] Re-run smoke tests
- [ ] Verify fix resolved issue

### 12.3 Document Issues

Create a document tracking all issues found and fixed:

```markdown
# Preview Testing Issues Log

## Issue 1: [Title]
- **Severity:** Critical / High / Medium / Low
- **Description:** [What went wrong]
- **Steps to Reproduce:** [How to trigger issue]
- **Fix:** [What was changed]
- **Commit:** [commit hash]
- **Status:** Fixed / Open

## Issue 2: [Title]
...
```

---

## Rollback Preview Deployment

If preview deployment has critical issues:

### Option 1: Delete Branch Deployment

**Netlify:**
- Go to Deploys > [Preview deployment]
- Click "..." > "Lock deploy and prevent auto-publishing"

**Vercel:**
- Go to Deployments > [Preview deployment]
- Click "..." > "Delete"

### Option 2: Revert Branch

```bash
# Revert to previous commit
git revert HEAD
git push origin revamp/revenue-nav-2026

# Or reset to earlier commit
git reset --hard [previous-commit-hash]
git push --force origin revamp/revenue-nav-2026
```

---

## Preview Deployment Approval

Once all tests pass and stakeholders approve:

**Approval Checklist:**
- [ ] All E2E tests passing (37/37)
- [ ] All smoke tests completed successfully
- [ ] No critical issues remaining
- [ ] Performance meets targets
- [ ] Stakeholder sign-off received
- [ ] Team ready for production deployment

**Approved by:** _______________________
**Date:** _______________________

**Next step:** Proceed to production deployment using **GO_LIVE_CHECKLIST.md**

---

## Troubleshooting Guide

### Issue: Preview deployment fails to build

**Possible causes:**
- TypeScript errors
- ESLint errors
- Missing dependencies
- Environment variable issues

**Solution:**
1. Review deployment logs for specific error
2. Run `npm run build` locally to reproduce
3. Fix errors and push new commit

### Issue: Database connection fails on preview

**Possible causes:**
- `DATABASE_URL` not set
- Supabase connection string incorrect
- Database migrations not applied

**Solution:**
1. Verify `DATABASE_URL` in deployment platform env vars
2. Check Supabase dashboard for connection string
3. Manually run migrations if needed:
   ```bash
   npx prisma migrate deploy
   ```

### Issue: Forms submit but no database records

**Possible causes:**
- RLS policies blocking INSERT
- Prisma client not initialized
- API route errors

**Solution:**
1. Check deployment logs for API errors
2. Review Supabase logs for query failures
3. Verify RLS policies allow public INSERT on LeadIntake table

### Issue: Email notifications not sending

**Possible causes:**
- AWS credentials not set
- SES in sandbox mode
- Recipient email not verified (sandbox mode)

**Solution:**
1. Verify AWS credentials in env vars
2. Check SES sandbox status (request production access if needed)
3. Verify recipient email in SES if in sandbox

### Issue: Rate limiting blocking all requests

**Possible causes:**
- Rate limit too strict
- IP address detection failing
- Cache not clearing between requests

**Solution:**
1. Review rate limiting configuration in `src/lib/rate-limit.ts`
2. Adjust limits if necessary (e.g., 5 requests per minute instead of 3)
3. Check IP address extraction logic

---

## Preview Environment Cleanup

After successful production deployment:

- [ ] Preview deployment can remain for future testing
- [ ] Or delete preview deployment to save resources
- [ ] Document preview URL for future use
- [ ] Archive preview testing results

---

**Last Updated:** 2025-12-28
**Guide Version:** 1.0
**Prepared by:** Project Orchestrator Agent

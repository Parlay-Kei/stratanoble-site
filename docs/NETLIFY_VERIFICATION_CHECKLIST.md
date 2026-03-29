# Netlify Environment Variables - Quick Verification Checklist
**Date:** October 16, 2025
**Purpose:** Verify all required environment variables are configured in Netlify production

---

## 🎯 Quick Action Required

**Estimated Time:** 10-15 minutes
**Access Required:** Netlify Dashboard admin access

---

## Step 1: Login to Netlify Dashboard

**URL:** https://app.netlify.com

1. Login with your Netlify account
2. Select the **StrataNoble** site
3. Click **"Site settings"** in top navigation
4. Click **"Environment variables"** in left sidebar

---

## Step 2: Verify Critical Variables (8 Required)

Check that each of these variables exists in the list:

### Authentication Variables (CRITICAL)
- [ ] `NEXTAUTH_SECRET` - Should show: `C5kHNz...` (masked)
- [ ] `NEXTAUTH_URL` - Should show: `https://stratanoble.com`

### AWS SES Email Variables (CRITICAL)
- [ ] `AWS_ACCESS_KEY_ID` - Should show: `[REDACTED]` (masked)
- [ ] `AWS_SECRET_ACCESS_KEY` - Should show: `***...` (fully masked)
- [ ] `AWS_REGION` - Should show: `us-east-1`
- [ ] `SES_FROM_EMAIL` - Should show: `no-reply@stratanoble.com`
- [ ] `ADMIN_EMAIL` - Should show: `admin@stratanoble.com`

### Security Variables (CRITICAL)
- [ ] `VAULT_ENCRYPTION_KEY` - Should show: `7547aa...` (masked)

---

## Step 3: Verify All Other Required Variables (17 Additional)

### Base Configuration
- [ ] `NEXT_PUBLIC_BASE_URL` = `https://stratanoble.com`
- [ ] `NEXT_PUBLIC_ACHIEVERY_URL` = `https://app.achievery.com`

### Supabase Database
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://bvneqoevtwodyfqglpzi.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGci...` (long JWT token)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGci...` (long JWT token)

### Stripe Payment Processing
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_51RaqAb...`
- [ ] `STRIPE_SECRET_KEY` = `sk_live_51RaqAb...`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_gzwF...`
- [ ] `NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID` = `price_1SF1l1...`
- [ ] `NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID` = `price_1SF1lH...`

### Optional Services (Can be added later)
- [ ] `SENDGRID_API_KEY` (Optional - for alternative email service)
- [ ] `SENDGRID_FROM_EMAIL` (Optional)
- [ ] `OPENAI_API_KEY` (Optional - for AI features)
- [ ] `GOOGLE_CLIENT_ID` (Optional - for Google OAuth)
- [ ] `GOOGLE_CLIENT_SECRET` (Optional - for Google OAuth)
- [ ] `SMTP_HOST` (Optional - not needed with AWS SES)
- [ ] `SMTP_PORT` (Optional - not needed with AWS SES)

---

## Step 4: Add Any Missing Variables

**If any required variables are missing:**

1. Click **"Add a variable"** button in Netlify
2. Select **"Add a single variable"**
3. Enter the variable name (e.g., `NEXTAUTH_SECRET`)
4. Enter the value from [NETLIFY_ENVIRONMENT_SETUP.md](NETLIFY_ENVIRONMENT_SETUP.md)
5. Set scope: **"All scopes"** (production + preview)
6. Click **"Create variable"**
7. Repeat for each missing variable

**⚠️ Important:** Copy values EXACTLY from the setup document. No extra spaces or quotes.

---

## Step 5: Clear Cache and Redeploy

**After adding any variables:**

1. Go to **"Deploys"** tab in Netlify
2. Click **"Trigger deploy"** dropdown
3. Select **"Clear cache and deploy site"**
4. Wait for build to complete (~3-5 minutes)
5. Monitor build logs for errors

**What to look for in build logs:**
- ✅ "Build succeeded"
- ✅ No environment variable errors
- ✅ No "undefined" variable warnings

---

## Step 6: Test Production Email Flow

**After successful deployment:**

### Test 1: Magic Link Authentication
1. Visit: https://stratanoble.com/auth/signin
2. Enter your email address
3. Click "Continue with Email"
4. **Expected:** "Check your email" page (NOT error page)
5. Check your inbox for email from `no-reply@stratanoble.com`
6. Click the magic link to sign in
7. **Expected:** Successful authentication and redirect to dashboard

**If this fails:**
- Check spam/junk folder
- Review Netlify function logs for errors
- Verify AWS SES credentials are correct

### Test 2: Discovery Form (Optional)
1. Visit: https://stratanoble.com/get-started
2. Complete all form steps
3. Submit the final form
4. **Expected:** Success message, no errors
5. Verify lead appears in Supabase database

---

## Step 7: Monitor for Issues (24-48 hours)

**Check these regularly after deployment:**

### Netlify Function Logs
- Location: Netlify Dashboard → Functions → Real-time logs
- Watch for: Email sending errors, authentication failures

### AWS SES Console
- Location: https://console.aws.amazon.com/ses/home?region=us-east-1
- Check: Bounce/complaint rates (should be <1%)
- Monitor: Daily sending quota usage

### DMARC Reports
- Email: admin@stratanoble.com
- Frequency: Daily reports from Google, Microsoft, etc.
- Check: Authentication pass rates (should be 100%)

---

## Common Issues & Quick Fixes

### Issue: "Configuration error" at /auth/error
**Fix:** `NEXTAUTH_SECRET` or `NEXTAUTH_URL` missing/incorrect
- Add variable in Netlify
- Clear cache and redeploy

### Issue: Emails not sending
**Fix:** AWS SES credentials missing/incorrect
- Verify `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- Check `SES_FROM_EMAIL` matches verified address

### Issue: Variables not updating
**Fix:** Build cache not cleared
- Trigger "Clear cache and deploy site"
- Wait for fresh build to complete

### Issue: Stripe checkout fails
**Fix:** Stripe keys missing/incorrect
- Verify all 5 Stripe variables are set
- Confirm price IDs match Stripe dashboard

---

## Success Criteria

✅ **All checks complete when:**
- All 25 required environment variables exist in Netlify
- Variables have correct values (no typos, extra spaces, quotes)
- All variables scoped to "All scopes"
- Fresh deployment completed successfully
- Magic link email authentication works in production
- No errors in Netlify function logs
- Emails arriving in inbox (not spam)

---

## Need Help?

**Documentation References:**
- **Complete Setup Guide:** [NETLIFY_ENVIRONMENT_SETUP.md](NETLIFY_ENVIRONMENT_SETUP.md)
- **Diagnostic Report:** [docs/AWS_SES_EMAIL_DIAGNOSTIC_2025-10-16.md](docs/AWS_SES_EMAIL_DIAGNOSTIC_2025-10-16.md)
- **Previous Auth Fix:** [docs/AUTH_ERROR_FIX_2025-10-15.md](docs/AUTH_ERROR_FIX_2025-10-15.md)

**Quick Test Scripts (Local):**
```bash
# Verify AWS SES status
node apps/website/scripts/check-ses-status.mjs

# Test email sending (if script exists)
node apps/website/scripts/test-auth-email.mjs
```

---

**Status:** Ready for verification
**Estimated Completion:** 10-15 minutes
**Priority:** 🚨 CRITICAL - Required for email authentication to work

*Last Updated: October 16, 2025*

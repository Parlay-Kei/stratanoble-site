# Netlify Environment Variables Configuration

**Date:** October 9, 2025
**Last Updated:** October 16, 2025 (AWS SES Diagnostic)
**Project:** StrataNoble Website (stratanoble.com)
**Status:** âš ï¸ **CRITICAL - VERIFICATION REQUIRED**

---

## ðŸš¨ CRITICAL ALERT - Email Authentication Failure (October 16, 2025)

### Current Issue
**Email authentication may be failing in production** due to missing environment variables in Netlify. While AWS SES is fully configured and operational locally, production deployment requires manual verification.

### âœ… What's Confirmed Working
- AWS SES fully configured (Production access enabled)
- 50,000 emails/day sending quota available
- `no-reply@stratanoble.com` verified and DKIM configured
- Local development email sending tested successfully
- All 14 test emails delivered (100% success rate)

### âš ï¸ What Needs Immediate Action
**MANUAL VERIFICATION REQUIRED:** Check Netlify Dashboard to confirm these critical variables exist:

```bash
NEXTAUTH_SECRET         # JWT encryption (CRITICAL)
NEXTAUTH_URL           # Production URL for auth callbacks
AWS_ACCESS_KEY_ID      # SES authentication
AWS_SECRET_ACCESS_KEY  # SES authentication
AWS_REGION             # us-east-1
SES_FROM_EMAIL         # no-reply@stratanoble.com
ADMIN_EMAIL            # admin@stratanoble.com
VAULT_ENCRYPTION_KEY   # Credentials vault encryption
```

**If ANY variables are missing:**
1. Add them using values from this document (Sections 6-9)
2. Trigger: "Clear cache and deploy site" in Netlify
3. Test production email authentication flow

**Full diagnostic report:** [AWS_SES_EMAIL_DIAGNOSTIC_2025-10-16.md](docs/AWS_SES_EMAIL_DIAGNOSTIC_2025-10-16.md)

---

## ðŸš€ Quick Setup

Go to: **Netlify Dashboard â†’ Site Settings â†’ Environment Variables**

Or direct link: `https://app.netlify.com/sites/[your-site-name]/settings/env`

---

## ðŸ“‹ Required Environment Variables

### **1. Base URL**
```
NEXT_PUBLIC_BASE_URL=https://stratanoble.com
```

### **2. ACHIEVERY Platform URL**
```
NEXT_PUBLIC_ACHIEVERY_URL=https://app.achievery.com
```

### **3. Supabase Configuration**

**Project URL:**
```
NEXT_PUBLIC_SUPABASE_URL=https://bvneqoevtwodyfqglpzi.supabase.co
```

**Anon (Public) Key:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bmVxb2V2dHdvZHlmcWdscHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzM4OTQsImV4cCI6MjA2NzAwOTg5NH0.7yTUwwa7UMfX5-ZBvG9T8LWDsst9SjQ2P0MON6iWTkw
```

**Service Role (Secret) Key:**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bmVxb2V2dHdvZHlmcWdscHppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMzg5NCwiZXhwIjoyMDY3MDA5ODk0fQ.nuRSCa-USL25H7_8qgFjFs4noMUHVPIlD8Yz2Z2CGuQ
```

### **4. Stripe Configuration (Live Keys)**

**Publishable Key:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RaqAbP6dZu6HftB1jg0kvgAS0052vzZtaHi4Ziddv0u4sJTP8oVgdXTq3apOljaApuJqsbOyDaNme0zxRbWLiJz00TBICryXk
```

**Secret Key:**
```
STRIPE_SECRET_KEY=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
```

**Webhook Secret:**
```
STRIPE_WEBHOOK_SECRET=whsec_gzwFypNbxgEgp3OYx4F4BL5zbqAtSeVR
```

### **5. Platform Tier Price IDs**

**Builder Tier ($249/mo):**
```
NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID=price_1SF1l1GEwjQWkTx0wbp1COP8
```

**Prosperity Tier ($1,000/mo):**
```
NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID=price_1SF1lHGEwjQWkTx0l3yTxXE5
```

### **6. NextAuth Configuration** âš ï¸ **CRITICAL**

**NextAuth Secret (Required for authentication):**
```
NEXTAUTH_SECRET=your_nextauth_secret_here_base64_encoded
```
**Note:** Generate using: `openssl rand -base64 32`

**NextAuth URL (Production URL):**
```
NEXTAUTH_URL=https://stratanoble.com
```

**Google OAuth (Optional - for Google sign-in):**
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**SMTP Configuration (Optional - for magic link email authentication):**
```
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_smtp_username_here
SMTP_PASSWORD=your_smtp_password_here
```

### **7. SendGrid Configuration**

**API Key:** (Add when ready)
```
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

**From Email:**
```
SENDGRID_FROM_EMAIL=contact@stratanoble.com
```

### **8. AWS SES Configuration**

**AWS Access Key:**
```
AWS_ACCESS_KEY_ID=your_aws_access_key_id
```

**AWS Secret Key:**
```
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

**AWS Region:**
```
AWS_REGION=us-east-1
```

**SES From Email:**
```
SES_FROM_EMAIL=no-reply@stratanoble.com
```

**Admin Email:**
```
ADMIN_EMAIL=admin@stratanoble.com
```

### **9. Vault Encryption Key** âš ï¸ **CRITICAL**

**Vault Encryption Key (AES-256):**
```
VAULT_ENCRYPTION_KEY=your_64_character_hex_encryption_key_here
```
**Note:** Generate using: `openssl rand -hex 32`

### **10. OpenAI Configuration** (Optional)

**API Key:** (Add when ready)
```
OPENAI_API_KEY=your_openai_api_key_here
```

---

## ðŸ“ Step-by-Step Setup Instructions

### **Method 1: Netlify Dashboard UI** (Recommended)

1. **Log into Netlify:** https://app.netlify.com
2. **Select your site:** Click on StrataNoble website
3. **Navigate to Environment Variables:**
   - Click **"Site settings"** in top navigation
   - Click **"Environment variables"** in left sidebar
4. **Add each variable:**
   - Click **"Add a variable"** button
   - Select **"Add a single variable"**
   - Paste variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Paste variable value (e.g., `https://bvneqoevtwodyfqglpzi.supabase.co`)
   - Select scope: **"All scopes"** (production + preview branches)
   - Click **"Create variable"**
5. **Repeat for all variables above**
6. **Trigger new deployment:**
   - Go to **"Deploys"** tab
   - Click **"Trigger deploy"** â†’ **"Clear cache and deploy site"**

### **Method 2: Netlify CLI** (Advanced)

```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site
netlify link

# Set environment variables (run each command)
netlify env:set NEXT_PUBLIC_BASE_URL "https://stratanoble.com"
netlify env:set NEXT_PUBLIC_ACHIEVERY_URL "https://app.achievery.com"
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://bvneqoevtwodyfqglpzi.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bmVxb2V2dHdvZHlmcWdscHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzM4OTQsImV4cCI6MjA2NzAwOTg5NH0.7yTUwwa7UMfX5-ZBvG9T8LWDsst9SjQ2P0MON6iWTkw"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bmVxb2V2dHdvZHlmcWdscHppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMzg5NCwiZXhwIjoyMDY3MDA5ODk0fQ.nuRSCa-USL25H7_8qgFjFs4noMUHVPIlD8Yz2Z2CGuQ"
netlify env:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "pk_live_51RaqAbP6dZu6HftB1jg0kvgAS0052vzZtaHi4Ziddv0u4sJTP8oVgdXTq3apOljaApuJqsbOyDaNme0zxRbWLiJz00TBICryXk"
netlify env:set STRIPE_SECRET_KEY "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"
netlify env:set STRIPE_WEBHOOK_SECRET "whsec_gzwFypNbxgEgp3OYx4F4BL5zbqAtSeVR"
netlify env:set NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID "price_1SF1l1GEwjQWkTx0wbp1COP8"
netlify env:set NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID "price_1SF1lHGEwjQWkTx0l3yTxXE5"
netlify env:set SENDGRID_FROM_EMAIL "contact@stratanoble.com"
netlify env:set NEXTAUTH_SECRET "your_nextauth_secret_here"
netlify env:set NEXTAUTH_URL "https://stratanoble.com"
netlify env:set AWS_ACCESS_KEY_ID " your_aws_access_key_id\
netlify env:set AWS_SECRET_ACCESS_KEY \your_aws_secret_access_key\
netlify env:set AWS_REGION "us-east-1"
netlify env:set SES_FROM_EMAIL "no-reply@stratanoble.com"
netlify env:set ADMIN_EMAIL "admin@stratanoble.com"
netlify env:set VAULT_ENCRYPTION_KEY "your_vault_encryption_key_here"

# Trigger new deployment
netlify deploy --prod
```

---

## âœ… Verification Checklist

After adding all environment variables:

### **1. Verify Variables in Netlify Dashboard**
- [ ] All 25+ variables appear in Environment Variables list (including NEXTAUTH_SECRET, VAULT_ENCRYPTION_KEY)
- [ ] Each variable has scope set to "All scopes"
- [ ] No syntax errors (no extra spaces, quotes)

### **2. Trigger New Deployment**
- [ ] Go to Deploys tab
- [ ] Click "Trigger deploy" â†’ "Clear cache and deploy site"
- [ ] Wait for build to complete (~3-5 minutes)

### **3. Test Production Site**
- [ ] Visit https://stratanoble.com
- [ ] Test discovery form at /get-started
- [ ] Complete all 7 steps and submit
- [ ] Verify no "Failed to create lead" error
- [ ] Check Supabase dashboard for new lead

### **4. Test Stripe Integration**
- [ ] Visit /pricing page
- [ ] Click "Get Started" on Builder tier
- [ ] Verify checkout modal opens with Stripe
- [ ] Test payment flow (use Stripe test card in test mode first)

### **5. Verify Preview Platform Link**
- [ ] Visit /achievery-preview page
- [ ] Click "Preview Platform" button
- [ ] Verify redirects to https://app.achievery.com

---

## ðŸ› Troubleshooting

### **Issue: "NEXT_PUBLIC_SUPABASE_URL is not defined"**
**Cause:** Environment variable not set or deployment not triggered
**Fix:**
1. Verify variable exists in Netlify dashboard
2. Trigger new deployment with "Clear cache and deploy site"
3. Check build logs for environment variable loading

### **Issue: "Failed to create lead" in production**
**Cause:** Service role key not configured or RLS policies blocking
**Fix:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Netlify
2. Check Supabase RLS policies allow service role access
3. Review Netlify function logs for detailed error messages

### **Issue: Stripe checkout not opening**
**Cause:** Missing Stripe keys or incorrect price IDs
**Fix:**
1. Verify all 5 Stripe variables are set correctly
2. Confirm price IDs match your Stripe dashboard products
3. Check browser console for Stripe initialization errors

### **Issue: Environment variables not loading in build**
**Cause:** Netlify caching old environment
**Fix:**
1. Clear build cache: Deploys â†’ Trigger deploy â†’ "Clear cache and deploy site"
2. Verify variables in build logs (search for "Environment:")
3. Ensure variable names use correct prefix (`NEXT_PUBLIC_` for client-side)

---

## ðŸ”’ Security Notes

### **Public vs Secret Keys**

**Public Keys (NEXT_PUBLIC_* prefix):**
- âœ… Safe to expose in browser
- âœ… Bundled in client-side JavaScript
- Examples: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

**Secret Keys (no prefix):**
- âŒ NEVER expose in client-side code
- âœ… Only available in server-side API routes
- âœ… Protected by Netlify Functions
- Examples: SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY

### **Key Rotation Best Practices**

1. **Supabase Keys:**
   - Rotate service role key if exposed
   - Update in both Netlify and local .env.local
   - Anon key safe for public use (RLS enforces permissions)

2. **Stripe Keys:**
   - Use separate keys for test/live environments
   - Rotate immediately if secret key exposed
   - Update webhook secret after key rotation

3. **API Keys:**
   - Rotate SendGrid and OpenAI keys quarterly
   - Use restricted API keys with minimal permissions
   - Monitor usage for unusual activity

---

## ðŸ“Š Environment Variable Reference

| Variable | Type | Required | Purpose |
|----------|------|----------|---------|
| NEXT_PUBLIC_BASE_URL | Public | âœ… Yes | Site base URL for metadata |
| NEXT_PUBLIC_ACHIEVERY_URL | Public | âœ… Yes | ACHIEVERY platform link |
| NEXT_PUBLIC_SUPABASE_URL | Public | âœ… Yes | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public | âœ… Yes | Supabase public API key |
| SUPABASE_SERVICE_ROLE_KEY | Secret | âœ… Yes | Supabase admin API key |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Public | âœ… Yes | Stripe checkout initialization |
| STRIPE_SECRET_KEY | Secret | âœ… Yes | Stripe payment processing |
| STRIPE_WEBHOOK_SECRET | Secret | âœ… Yes | Stripe webhook verification |
| NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID | Public | âœ… Yes | Builder tier price |
| NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID | Public | âœ… Yes | Prosperity tier price |
| NEXTAUTH_SECRET | Secret | âœ… Yes | NextAuth JWT encryption |
| NEXTAUTH_URL | Secret | âœ… Yes | Production site URL for auth callbacks |
| VAULT_ENCRYPTION_KEY | Secret | âœ… Yes | Credentials vault encryption (AES-256) |
| AWS_ACCESS_KEY_ID | Secret | âœ… Yes | AWS SES email sending |
| AWS_SECRET_ACCESS_KEY | Secret | âœ… Yes | AWS SES authentication |
| AWS_REGION | Secret | âœ… Yes | AWS region (us-east-1) |
| SES_FROM_EMAIL | Secret | âœ… Yes | Email sender address |
| ADMIN_EMAIL | Secret | âœ… Yes | Admin notification email |
| SENDGRID_API_KEY | Secret | âš ï¸ Optional | Email notifications (alternative) |
| SENDGRID_FROM_EMAIL | Secret | âš ï¸ Optional | Email sender address (alternative) |
| OPENAI_API_KEY | Secret | âš ï¸ Optional | AI idea validation |
| GOOGLE_CLIENT_ID | Secret | âš ï¸ Optional | Google OAuth sign-in |
| GOOGLE_CLIENT_SECRET | Secret | âš ï¸ Optional | Google OAuth authentication |
| SMTP_HOST | Secret | âš ï¸ Optional | Magic link email host |
| SMTP_PORT | Secret | âš ï¸ Optional | Magic link email port |
| SMTP_USER | Secret | âš ï¸ Optional | Magic link email username |
| SMTP_PASSWORD | Secret | âš ï¸ Optional | Magic link email password |

---

## ðŸ”— Quick Links

- **Netlify Dashboard:** https://app.netlify.com
- **Supabase Dashboard:** https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Production Site:** https://stratanoble.com
- **Discovery Form:** https://stratanoble.com/get-started

---

## ðŸš¨ Critical Authentication Fix

### **Issue Resolved:** `Configuration` Error on Production

**Problem:** Production auth was failing with "There is a problem with the authentication configuration" error at `/auth/error?error=Configuration`

**Root Cause:** Missing `NEXTAUTH_SECRET` environment variable in Netlify production environment

**Solution Applied:**
1. âœ… Generated secure NEXTAUTH_SECRET using Node crypto (256-bit base64)
2. âœ… Added NEXTAUTH_SECRET to local `.env.local` for development
3. âœ… Added NEXTAUTH_URL for production callback configuration
4. âœ… Updated this documentation with complete NextAuth configuration
5. âœ… Added VAULT_ENCRYPTION_KEY to production environment variables
6. âœ… Added AWS SES credentials for email functionality

**Next Steps:**
1. Add `NEXTAUTH_SECRET` to Netlify environment variables (see Section 6 above)
2. Add `NEXTAUTH_URL=https://stratanoble.com` to Netlify
3. Add `VAULT_ENCRYPTION_KEY` to Netlify (see Section 9 above)
4. Trigger new deployment: "Clear cache and deploy site"
5. Test authentication flow at https://stratanoble.com/auth/signin

**Testing Checklist:**
- [ ] NEXTAUTH_SECRET added to Netlify
- [ ] NEXTAUTH_URL set to production domain
- [ ] VAULT_ENCRYPTION_KEY configured
- [ ] New deployment triggered with cache clear
- [ ] Visit /auth/signin - should load without Configuration error
- [ ] Test dev login (if NEXTAUTH_DEV_LOGIN enabled)
- [ ] Test Google OAuth (if configured)
- [ ] Verify /admin/vault page loads correctly

---

## ðŸ“ Update History

- **October 16, 2025:** ðŸš¨ **AWS SES EMAIL DIAGNOSTIC** - Production email authentication verification
  - Verified AWS SES fully operational (Production access, 50K/day limit)
  - Confirmed all sender addresses verified with DKIM
  - Identified likely root cause: Missing Netlify environment variables
  - Created comprehensive diagnostic report (AWS_SES_EMAIL_DIAGNOSTIC_2025-10-16.md)
  - Added critical alert banner for immediate action
  - Status: Awaiting Netlify environment variable verification

- **October 15, 2025:** ðŸš¨ **CRITICAL AUTH FIX** - Added missing NextAuth configuration
  - Added NEXTAUTH_SECRET generation and configuration
  - Added NEXTAUTH_URL for production auth callbacks
  - Added VAULT_ENCRYPTION_KEY for credentials vault
  - Added complete AWS SES email configuration
  - Documented authentication error resolution
  - Updated environment variable count (12 â†’ 25+ variables)

- **October 9, 2025:** Initial configuration with new Supabase credentials
  - Added service role key for CRM lead creation
  - Added platform tier price IDs (Builder, Prosperity)
  - Updated documentation with security notes

---

**Status:** ðŸš¨ **CRITICAL - VERIFICATION REQUIRED**
**Action:** Verify all environment variables exist in Netlify Dashboard
**Next Step:** Add any missing variables â†’ Clear cache â†’ Redeploy â†’ Test email flow
**Reference:** See AWS_SES_EMAIL_DIAGNOSTIC_2025-10-16.md for complete troubleshooting guide
**Documentation:** Complete and Updated

*Last Updated: October 16, 2025*

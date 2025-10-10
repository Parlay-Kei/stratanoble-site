# Netlify Environment Variables Configuration

**Date:** October 9, 2025
**Project:** StrataNoble Website (stratanoble.com)
**Status:** ✅ Ready to Configure

---

## 🚀 Quick Setup

Go to: **Netlify Dashboard → Site Settings → Environment Variables**

Or direct link: `https://app.netlify.com/sites/[your-site-name]/settings/env`

---

## 📋 Required Environment Variables

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

### **6. SendGrid Configuration**

**API Key:** (Add when ready)
```
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

**From Email:**
```
SENDGRID_FROM_EMAIL=contact@stratanoble.com
```

### **7. OpenAI Configuration** (Optional)

**API Key:** (Add when ready)
```
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 📝 Step-by-Step Setup Instructions

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
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

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

# Trigger new deployment
netlify deploy --prod
```

---

## ✅ Verification Checklist

After adding all environment variables:

### **1. Verify Variables in Netlify Dashboard**
- [ ] All 12+ variables appear in Environment Variables list
- [ ] Each variable has scope set to "All scopes"
- [ ] No syntax errors (no extra spaces, quotes)

### **2. Trigger New Deployment**
- [ ] Go to Deploys tab
- [ ] Click "Trigger deploy" → "Clear cache and deploy site"
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

## 🐛 Troubleshooting

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
1. Clear build cache: Deploys → Trigger deploy → "Clear cache and deploy site"
2. Verify variables in build logs (search for "Environment:")
3. Ensure variable names use correct prefix (`NEXT_PUBLIC_` for client-side)

---

## 🔒 Security Notes

### **Public vs Secret Keys**

**Public Keys (NEXT_PUBLIC_* prefix):**
- ✅ Safe to expose in browser
- ✅ Bundled in client-side JavaScript
- Examples: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

**Secret Keys (no prefix):**
- ❌ NEVER expose in client-side code
- ✅ Only available in server-side API routes
- ✅ Protected by Netlify Functions
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

## 📊 Environment Variable Reference

| Variable | Type | Required | Purpose |
|----------|------|----------|---------|
| NEXT_PUBLIC_BASE_URL | Public | ✅ Yes | Site base URL for metadata |
| NEXT_PUBLIC_ACHIEVERY_URL | Public | ✅ Yes | ACHIEVERY platform link |
| NEXT_PUBLIC_SUPABASE_URL | Public | ✅ Yes | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public | ✅ Yes | Supabase public API key |
| SUPABASE_SERVICE_ROLE_KEY | Secret | ✅ Yes | Supabase admin API key |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Public | ✅ Yes | Stripe checkout initialization |
| STRIPE_SECRET_KEY | Secret | ✅ Yes | Stripe payment processing |
| STRIPE_WEBHOOK_SECRET | Secret | ✅ Yes | Stripe webhook verification |
| NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID | Public | ✅ Yes | Builder tier price |
| NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID | Public | ✅ Yes | Prosperity tier price |
| SENDGRID_API_KEY | Secret | ⚠️ Optional | Email notifications |
| SENDGRID_FROM_EMAIL | Secret | ⚠️ Optional | Email sender address |
| OPENAI_API_KEY | Secret | ⚠️ Optional | AI idea validation |

---

## 🔗 Quick Links

- **Netlify Dashboard:** https://app.netlify.com
- **Supabase Dashboard:** https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Production Site:** https://stratanoble.com
- **Discovery Form:** https://stratanoble.com/get-started

---

## 📝 Update History

- **October 9, 2025:** Initial configuration with new Supabase credentials
- Added service role key for CRM lead creation
- Added platform tier price IDs (Builder, Prosperity)
- Updated documentation with security notes

---

**Status:** ✅ Ready to Configure
**Next Step:** Add variables to Netlify Dashboard and trigger deployment
**Documentation:** Complete

*Last Updated: October 9, 2025*

# Supabase Connection Test

**Date:** October 9, 2025
**Status:** ✅ Ready to Test

---

## 🔧 Configuration Summary

### **Project Details**
```
Project URL: https://REDACTED.supabase.co
Project Ref: bvneqoevtwodyfqglpzi
Region: US East (AWS)
Database: PostgreSQL 15
```

### **API Keys Configured**
- ✅ **Anon Key:** Configured in `.env.local` and ready for Netlify
- ✅ **Service Role Key:** Configured for admin operations (lead creation, RLS bypass)
- ✅ **JWT Secret:** Available for manual token verification if needed
- ✅ **Database Password:** Stored securely (@Guard4Next!)

---

## ✅ Quick Connection Test

### **Test 1: Check Environment Variables**

Run in terminal:
```bash
cd apps/website
node -e "console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL); console.log('ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'); console.log('SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...');"
```

**Expected Output:**
```
SUPABASE_URL: https://REDACTED.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIs...
SERVICE_KEY: eyJhbGciOiJIUzI1NiIs...
```

### **Test 2: Test Supabase Client**

Create test file: `apps/website/test-supabase.js`
```javascript
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);

    // Test 1: Check connection
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }

    console.log('✅ Connection successful!');

    // Test 2: Check if leads table exists
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('count')
      .limit(1);

    if (leadsError) {
      console.log('⚠️  Leads table not found - migrations need to be applied');
      console.log('   Run migrations from MIGRATION_INSTRUCTIONS.md');
    } else {
      console.log('✅ Leads table exists!');
    }

    return true;
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    return false;
  }
}

testConnection();
```

Run test:
```bash
cd apps/website
node test-supabase.js
```

### **Test 3: Test Discovery Form API**

```bash
curl -X POST http://localhost:3000/api/crm/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "business_stage": "idea",
    "main_challenge": "Finding customers",
    "interested_tier": "starter"
  }'
```

**Expected Response (after migrations applied):**
```json
{
  "success": true,
  "lead": {
    "id": "uuid-here",
    "name": "Test User",
    "email": "test@example.com",
    ...
  },
  "sequences_scheduled": 4
}
```

**Expected Response (before migrations - development mode):**
```json
{
  "success": true,
  "message": "Lead created successfully (development mode)",
  "lead": {
    "id": "mock-uuid",
    ...
  }
}
```

---

## 🔍 Verify Configuration in Supabase Dashboard

### **1. Check Project Settings**

Go to: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/settings/api

**Verify:**
- ✅ Project URL matches: `https://REDACTED.supabase.co`
- ✅ Anon key matches your `.env.local`
- ✅ Service role key matches your `.env.local`

### **2. Check Database Connection**

Go to: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/editor

**Verify:**
- ✅ Can see existing tables (contact_submissions, email_logs, etc.)
- ✅ Can run simple query: `SELECT NOW();`

### **3. Check Authentication Settings**

Go to: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/auth/users

**Verify:**
- ✅ Can see user list (if any users exist)
- ✅ Email provider is enabled

---

## 🚀 Next Steps After Connection Verified

### **Step 1: Apply Database Migrations**

Follow instructions in: `MIGRATION_INSTRUCTIONS.md`

1. Open SQL Editor
2. Apply migration 0017 (leads table)
3. Apply migration 0018 (email_sequences table)
4. Apply migration 0019 (user_profiles table)

### **Step 2: Configure Netlify**

Follow instructions in: `NETLIFY_ENVIRONMENT_SETUP.md`

1. Add all environment variables to Netlify
2. Trigger new deployment
3. Test production site

### **Step 3: Test End-to-End**

1. Submit discovery form at: http://localhost:3000/get-started
2. Verify lead in Supabase: `SELECT * FROM leads ORDER BY created_at DESC LIMIT 1;`
3. Verify sequences: `SELECT * FROM email_sequences ORDER BY created_at DESC LIMIT 4;`

---

## 🐛 Troubleshooting

### **Issue: "Invalid API key" error**
**Cause:** Wrong key or key not loaded from .env.local
**Fix:**
```bash
# Verify .env.local exists
cat .env.local | grep SUPABASE

# Restart dev server to reload environment
# Kill existing process and restart
npm run dev
```

### **Issue: "Connection timeout"**
**Cause:** Network or firewall blocking Supabase
**Fix:**
1. Check internet connection
2. Verify Supabase project is not paused
3. Try accessing dashboard: https://supabase.com/dashboard

### **Issue: "relation 'leads' does not exist"**
**Cause:** Migrations not applied yet
**Fix:**
- This is expected before migrations
- Follow MIGRATION_INSTRUCTIONS.md to apply migrations
- Or test in development mode (bypasses database)

---

## ✅ Success Checklist

- [x] **Environment Variables:** All Supabase keys in `.env.local`
- [x] **Client Configuration:** `supabase.ts` correctly configured
- [x] **Admin Client:** Service role key configured for API routes
- [ ] **Connection Test:** Successfully connects to Supabase
- [ ] **Migrations Applied:** leads, email_sequences, user_profiles tables exist
- [ ] **Discovery Form:** Submits without errors
- [ ] **Netlify Configured:** All environment variables set in production

---

## 📋 Configuration Reference

### **Local Development (.env.local)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://REDACTED.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...7yTUwwa7UMfX5-ZBvG9T8LWDsst9SjQ2P0MON6iWTkw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...nuRSCa-USL25H7_8qgFjFs4noMUHVPIlD8Yz2Z2CGuQ
```

### **Production (Netlify)**
Same values as local, configured in Netlify Dashboard → Environment Variables

### **Database Connection (Direct - for migrations)**
```
Host: db.bvneqoevtwodyfqglpzi.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: @Guard4Next!
```

---

**Status:** ✅ Configuration Complete
**Next Action:** Test connection using methods above
**Documentation:** Complete

*Last Updated: October 9, 2025*

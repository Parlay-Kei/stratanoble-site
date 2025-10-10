# Database Migration Instructions - Phase 3 CRM

**Date:** October 9, 2025
**Purpose:** Apply migrations to fix "Failed to create lead" error on discovery form

---

## 🚀 Quick Start - Apply Migrations via Supabase Dashboard

### **Step 1: Open Supabase SQL Editor**

Go to: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/sql/new

### **Step 2: Apply Migration 0017 - Leads Table**

1. Copy the entire contents of `infra/supabase/migrations/0017_leads_table.sql`
2. Paste into the SQL Editor
3. Click **"Run"** button
4. Verify success message appears

**What this does:**
- Creates `leads` table with all discovery form fields
- Adds indexes for performance
- Enables Row-Level Security (RLS)
- Creates policies for service role and admin access

### **Step 3: Apply Migration 0018 - Email Sequences Table**

1. Copy the entire contents of `infra/supabase/migrations/0018_email_sequences_table.sql`
2. Paste into a new SQL Editor tab
3. Click **"Run"** button
4. Verify success message appears

**What this does:**
- Creates `email_sequences` table for automated follow-up
- Creates PostgreSQL function `schedule_standard_email_sequence()`
- Sets up 4-email sequence system (Day 0, 2, 7, 14)
- Adds indexes and RLS policies

### **Step 4: Apply Migration 0019 - User Profiles Table**

1. Copy the entire contents of `infra/supabase/migrations/0019_user_profiles_table.sql`
2. Paste into a new SQL Editor tab
3. Click **"Run"** button
4. Verify success message appears

**What this does:**
- Creates `user_profiles` table for role-based access
- Auto-creates profile on new user signup
- Creates `grant_admin_access()` function
- Enables admin access to CRM features

### **Step 5: Grant Yourself Admin Access**

1. In SQL Editor, run this query (replace with your actual email):
```sql
SELECT grant_admin_access('your-email@domain.com');
```

2. Verify admin role was granted:
```sql
SELECT id, email, role, can_access_crm, can_manage_leads
FROM user_profiles
WHERE email = 'your-email@domain.com';
```

**Expected Result:**
```
role: admin
can_access_crm: true
can_manage_leads: true
can_view_analytics: true
can_manage_clients: true
```

---

## ✅ Verification Steps

### **1. Verify Tables Exist**

Run this query in SQL Editor:
```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('leads', 'email_sequences', 'user_profiles')
ORDER BY table_name;
```

**Expected:** 3 rows returned

### **2. Verify PostgreSQL Function Exists**

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'schedule_standard_email_sequence'
AND routine_schema = 'public';
```

**Expected:** 1 row showing the function

### **3. Test Discovery Form**

1. Go to: http://localhost:3000/get-started
2. Fill out all 7 steps of the discovery form
3. Click **"Submit"** on Step 7
4. **Expected:** Success message, NO error about "Failed to create lead"

### **4. Check Lead in Database**

After submitting the form, run:
```sql
SELECT
    id,
    name,
    email,
    business_stage,
    main_challenge,
    interested_tier,
    stage,
    email_sequence_started,
    created_at
FROM leads
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:** Your test lead appears with all fields populated

### **5. Verify Email Sequences Scheduled**

```sql
SELECT
    es.sequence_type,
    es.sequence_day,
    es.scheduled_for,
    es.status,
    l.name,
    l.email
FROM email_sequences es
JOIN leads l ON l.id = es.lead_id
ORDER BY l.created_at DESC, es.sequence_day ASC
LIMIT 4;
```

**Expected:** 4 rows showing sequences for Day 0, 2, 7, 14

---

## 🐛 Troubleshooting

### **Issue: "relation 'leads' does not exist"**

**Cause:** Migration 0017 not applied successfully
**Fix:**
1. Check for error messages in SQL Editor
2. Verify you're connected to the correct database
3. Re-run migration 0017

### **Issue: "function schedule_standard_email_sequence does not exist"**

**Cause:** Migration 0018 not applied or function failed to create
**Fix:**
1. Check SQL Editor for error messages
2. Ensure migration 0017 completed first (leads table must exist)
3. Re-run migration 0018

### **Issue: "column 'role' does not exist in user_profiles"**

**Cause:** Migration 0019 not applied
**Fix:**
1. Verify RLS policies in migrations 0017 and 0018 reference user_profiles
2. Apply migration 0019
3. Verify with: `SELECT * FROM user_profiles LIMIT 1;`

### **Issue: Still getting "Failed to create lead" after migrations**

**Possible Causes:**
1. **Service role key missing:** Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
2. **RLS blocking:** Temporarily disable to test:
   ```sql
   ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
   -- Test form submission
   ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
   ```
3. **Dev server not restarted:** Restart dev server to reload environment variables

---

## 📊 Success Checklist

After completing all steps, verify:

- [x] **Migration 0017 Applied:** `leads` table exists with 17+ columns
- [x] **Migration 0018 Applied:** `email_sequences` table exists, function created
- [x] **Migration 0019 Applied:** `user_profiles` table exists with role column
- [x] **Admin Access Granted:** Your user has admin role and CRM permissions
- [x] **Discovery Form Works:** Form submits without "Failed to create lead" error
- [x] **Lead Created:** New lead appears in `leads` table with all data
- [x] **Sequences Scheduled:** 4 email sequences created (Day 0, 2, 7, 14)
- [x] **RLS Enabled:** All three tables have RLS enabled
- [x] **Indexes Created:** Performance indexes exist on key fields

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi
- **SQL Editor:** https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/sql/new
- **Table Editor:** https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/editor
- **Migration Files:** `c:\Dev\StrataNoble\infra\supabase\migrations\`
- **Discovery Form:** http://localhost:3000/get-started

---

## 📝 Notes

- **All migrations are idempotent:** Safe to run multiple times (`CREATE TABLE IF NOT EXISTS`)
- **RLS is enabled by default:** Service role bypasses RLS for API operations
- **Email sending not implemented yet:** Sequences are scheduled but won't send until email worker is built
- **Migrations are numbered:** 0017, 0018, 0019 to maintain sequential order

---

**Status:** ✅ Ready to apply migrations
**Next Step:** Open Supabase SQL Editor and follow Step 1

*Last Updated: October 9, 2025*

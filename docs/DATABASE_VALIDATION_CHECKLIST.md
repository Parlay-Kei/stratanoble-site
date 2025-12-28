# Database Configuration & API Validation Checklist

## 📊 Database Configuration

### **Supabase Connection**
```
Project URL: https://bvneqoevtwodyfqglpzi.supabase.co
Project Ref: bvneqoevtwodyfqglpzi
Region: US East (likely)
Status: ✅ Configured in .env.local
```

### **Environment Variables** (`.env.local`)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://bvneqoevtwodyfqglpzi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[CONFIGURED]
SUPABASE_SERVICE_ROLE_KEY=[CONFIGURED]

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ACHIEVERY Platform
NEXT_PUBLIC_ACHIEVERY_URL=https://app.achievery.com

# Stripe (LIVE KEYS - Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[LIVE KEY CONFIGURED]
STRIPE_SECRET_KEY=[LIVE KEY CONFIGURED]
STRIPE_WEBHOOK_SECRET=[CONFIGURED]

# Platform Tier Price IDs (Created: October 5, 2025)
NEXT_PUBLIC_STRIPE_BUILDER_PRICE_ID=price_1SF1l1GEwjQWkTx0wbp1COP8
NEXT_PUBLIC_STRIPE_PROSPERITY_PRICE_ID=price_1SF1lHGEwjQWkTx0l3yTxXE5

# Email (Not configured)
SENDGRID_API_KEY=[EMPTY - needs configuration]
SENDGRID_FROM_EMAIL=contact@stratanoble.com

# AI (Not configured)
OPENAI_API_KEY=[EMPTY - optional for idea validation]
```

---

## ✅ Validation Steps

### **1. Verify Supabase Connection**

#### **Test Connection:**
```bash
# From project root
cd apps/website

# Install Supabase CLI if not installed
npm install -g supabase

# Test connection
supabase db remote ls --project-ref bvneqoevtwodyfqglpzi
```

#### **Check Tables Exist:**
```sql
-- Connect to your Supabase project
-- Go to: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/editor

-- Run this query:
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Tables:**
- ✅ `clients`
- ✅ `contact_submissions`
- ✅ `customers`
- ✅ `email_logs`
- ✅ `metric_feed`
- ✅ `metric_summary`
- ✅ `offerings`
- ✅ `onboarding_status`
- ✅ `orders`
- ✅ `stripe_event_log`
- ✅ `subscriptions`
- ✅ `webhook_logs`
- ⏳ `leads` **(NEW - needs migration 0017)**
- ⏳ `email_sequences` **(NEW - needs migration 0018)**
- ⏳ `user_profiles` **(NEW - needs migration 0019)**

---

### **2. Apply New Migrations**

#### **Option A: Supabase CLI** (Recommended)
```bash
cd infra/supabase

# Apply all pending migrations
supabase db push --project-ref bvneqoevtwodyfqglpzi

# Or apply specific migrations
supabase migration up --target-version 20250109000017
supabase migration up --target-version 20250109000018
supabase migration up --target-version 20250109000019
```

#### **Option B: Supabase Dashboard SQL Editor**
1. Go to: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/sql/new
2. Copy/paste each migration:
   - `infra/supabase/migrations/0017_leads_table.sql`
   - `infra/supabase/migrations/0018_email_sequences_table.sql`
   - `infra/supabase/migrations/0019_user_profiles_table.sql`
3. Run each query

#### **Verification Query:**
```sql
-- Check new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('leads', 'email_sequences', 'user_profiles');

-- Should return 3 rows
```

---

### **3. Grant Admin Access**

```sql
-- Replace with your actual email
SELECT grant_admin_access('your-email@domain.com');

-- Verify admin role
SELECT id, email, role, can_access_crm, can_manage_leads
FROM user_profiles
WHERE email = 'your-email@domain.com';
```

---

### **4. Test API Endpoints**

#### **Test 1: Health Check**
```bash
# Test Supabase connection
curl http://localhost:3000/api/health
```

#### **Test 2: Create Lead (Discovery Form)**
```bash
curl -X POST http://localhost:3000/api/crm/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "555-1234",
    "passion_area": "Digital products",
    "business_stage": "idea",
    "main_challenge": "Finding customers",
    "time_commitment": "10-15 hours/week",
    "success_goal": "Replace day job income",
    "interested_tier": "starter"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": "uuid-here",
    "email": "test@example.com",
    "stage": "discovery",
    "sequences_scheduled": 4
  }
}
```

#### **Test 3: Verify Lead in Database**
```sql
SELECT
    id,
    name,
    email,
    business_stage,
    main_challenge,
    interested_tier,
    stage,
    created_at
FROM leads
ORDER BY created_at DESC
LIMIT 5;
```

#### **Test 4: Check Email Sequences Scheduled**
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
LIMIT 10;
```

**Expected:** 4 rows per lead (Day 0, 2, 7, 14)

---

### **5. Test Discovery Form UI**

1. **Start Dev Server:**
   ```bash
   cd apps/website
   npm run dev
   ```

2. **Open Form:**
   ```
   http://localhost:3000/get-started
   ```

3. **Fill Out 7-Step Form:**
   - Step 1: What's your name?
   - Step 2: What's your email?
   - Step 3: What are you passionate about?
   - Step 4: Where are you in your journey?
   - Step 5: What's your main challenge?
   - Step 6: How much time can you commit?
   - Step 7: What does success look like?

4. **Submit & Verify:**
   - Should see: "100% Complete" progress
   - Should NOT see: "Error: Failed to create lead"
   - Should redirect to thank you page or success message

5. **Check Browser Console:**
   ```javascript
   // Should see success log (if any)
   // No errors about Supabase or database
   ```

---

## 🔧 API Endpoint Documentation

### **POST /api/crm/leads**
Create new lead from discovery form.

**Request Body:**
```typescript
{
  name: string;              // Required
  email: string;             // Required
  phone?: string;            // Optional
  passion_area?: string;     // Optional
  business_stage: string;    // Required: 'idea' | 'building' | 'launched' | 'scaling'
  main_challenge: string;    // Required
  time_commitment?: string;  // Optional
  success_goal?: string;     // Optional
  interested_tier: string;   // Required: 'starter' | 'growth' | 'success'
  utm_source?: string;       // Optional
  utm_medium?: string;       // Optional
  utm_campaign?: string;     // Optional
  referrer?: string;         // Optional
  metadata?: object;         // Optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "stage": "discovery",
    "sequences_scheduled": 4
  }
}
```

**Response (Error):**
```json
{
  "error": "Failed to create lead",
  "details": "Error message here"
}
```

### **GET /api/crm/leads**
List leads with optional filters.

**Query Parameters:**
```
?stage=discovery
&business_stage=idea
&assigned_to=user-id
&priority=2
&limit=50
&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [/* array of lead objects */],
  "total": 50,
  "filters": {/* applied filters */}
}
```

### **GET /api/crm/leads/[id]**
Get specific lead details.

**Response:**
```json
{
  "success": true,
  "data": {/* lead object with full details */}
}
```

### **PATCH /api/crm/leads/[id]**
Update lead status, notes, or assignment.

**Request Body:**
```json
{
  "stage": "qualified",
  "notes": "Spoke with lead, very interested",
  "assigned_to": "user-id",
  "priority": 2
}
```

---

## 🚨 Troubleshooting

### **Issue: "Failed to create lead"**

**Cause 1: Migrations not applied**
```bash
# Check if tables exist
supabase db remote ls --project-ref bvneqoevtwodyfqglpzi
```

**Cause 2: Service role key missing/invalid**
```bash
# Verify in .env.local
echo $SUPABASE_SERVICE_ROLE_KEY
```

**Cause 3: RLS policies blocking**
```sql
-- Temporarily disable RLS for testing (NOT FOR PRODUCTION)
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Test lead creation

-- Re-enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
```

### **Issue: Email sequences not scheduling**

**Check function exists:**
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'schedule_standard_email_sequence';
```

**Test function manually:**
```sql
-- Insert test lead
INSERT INTO leads (name, email, business_stage, main_challenge, interested_tier)
VALUES ('Test', 'test@example.com', 'idea', 'Finding customers', 'starter')
RETURNING id, email, name, business_stage, main_challenge;

-- Schedule sequences manually
SELECT schedule_standard_email_sequence(
    '[lead-id-from-above]',
    'test@example.com',
    'Test',
    'idea',
    'Finding customers'
);
```

### **Issue: Supabase connection timeout**

**Verify URL and keys:**
```bash
# Test with curl
curl https://bvneqoevtwodyfqglpzi.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"
```

---

## ✅ Final Validation Checklist

Before deploying to production:

- [ ] **Migrations Applied**: All 3 new migrations successfully run
- [ ] **Tables Exist**: `leads`, `email_sequences`, `user_profiles` in database
- [ ] **Admin Access**: Your user has admin role and permissions
- [ ] **API Test**: POST to `/api/crm/leads` succeeds with 201 status
- [ ] **Database Verification**: Lead appears in `leads` table
- [ ] **Email Sequences**: 4 sequences scheduled (Day 0, 2, 7, 14)
- [ ] **UI Test**: Discovery form at `/get-started` submits successfully
- [ ] **No Errors**: Browser console shows no Supabase/database errors
- [ ] **RLS Policies**: Row-level security enabled on all new tables
- [ ] **Indexes**: Performance indexes created on key fields

---

## 📈 Success Metrics

After validation, you should be able to:

1. ✅ Submit discovery form without errors
2. ✅ View leads in database
3. ✅ See 4 scheduled email sequences per lead
4. ✅ Access CRM dashboard (when built)
5. ✅ Track lead pipeline stages
6. ✅ Assign leads to team members
7. ✅ Monitor email sequence progress

---

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi
- **SQL Editor**: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/sql/new
- **Table Editor**: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/editor
- **API Docs**: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/api
- **Migration Files**: `infra/supabase/migrations/`
- **API Routes**: `apps/website/src/app/api/crm/leads/`

---

**Status**: ✅ Configuration validated, migrations ready to apply
**Next Step**: Apply migrations to Supabase database
**Command**: `cd infra/supabase && supabase db push`


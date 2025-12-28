# Leads & CRM Database Migrations

## Overview

These migrations add the necessary database tables for the **Phase 3 CRM system** with multi-step discovery forms and automated email sequences.

## New Tables

### 1. `leads` (Migration 0017)
Stores multi-step discovery form submissions with lead management tracking.

**Key Features:**
- Contact information (name, email, phone)
- Discovery form responses (passion area, business stage, challenges, goals)
- Lead pipeline stages (discovery → scheduled → called → qualified → converted)
- Marketing attribution (UTM parameters, referrer)
- Email sequence tracking

### 2. `email_sequences` (Migration 0018)
Manages automated follow-up email campaigns for leads.

**4-Email Sequence:**
- **Day 0**: Discovery confirmation with Calendly scheduling link
- **Day 2**: Post-call summary with ACHIEVERY task assignment
- **Day 7**: Progress check and encouragement
- **Day 14**: Tier conversion with package recommendations

### 3. `user_profiles` (Migration 0019)
Role-based access control for CRM and admin features.

**Roles:**
- `user` - Standard user (default)
- `admin` - Full CRM access
- `client` - Paying customer
- `coach` - Service provider

## How to Apply Migrations

### Option 1: Supabase CLI (Recommended)

```bash
# From project root
cd infra/supabase

# Apply all pending migrations
supabase db push

# Or apply specific migrations
supabase migration up --target-version 20250109000017
supabase migration up --target-version 20250109000018
supabase migration up --target-version 20250109000019
```

### Option 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order:
   - `0017_leads_table.sql`
   - `0018_email_sequences_table.sql`
   - `0019_user_profiles_table.sql`
4. Run each query

### Option 3: Direct SQL Connection

```bash
# Connect to your database
psql postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres

# Run each migration
\i infra/supabase/migrations/0017_leads_table.sql
\i infra/supabase/migrations/0018_email_sequences_table.sql
\i infra/supabase/migrations/0019_user_profiles_table.sql
```

## Post-Migration Setup

### 1. Grant Yourself Admin Access

After applying the migrations, grant admin access to your account:

```sql
-- Replace with your actual email
SELECT grant_admin_access('your-email@domain.com');
```

### 2. Verify Tables Exist

```sql
-- Check if tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('leads', 'email_sequences', 'user_profiles');
```

### 3. Test Lead Creation

```sql
-- Insert a test lead
INSERT INTO leads (
    name,
    email,
    business_stage,
    main_challenge,
    interested_tier
) VALUES (
    'Test User',
    'test@example.com',
    'idea',
    'Finding my first customers',
    'starter'
);
```

## Environment Variables

Ensure these environment variables are set in `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## API Endpoints

After migration, these endpoints will work:

- `POST /api/crm/leads` - Create new lead from discovery form
- `GET /api/crm/leads` - List leads with filters
- `GET /api/crm/leads/[id]` - Get specific lead details
- `PATCH /api/crm/leads/[id]` - Update lead status/notes

## Email Sequence Function

The migration includes a PostgreSQL function to automatically schedule the 4-email sequence:

```sql
-- Automatically called when lead is created
SELECT schedule_standard_email_sequence(
    p_lead_id := '[lead-uuid]',
    p_email := 'lead@example.com',
    p_name := 'Lead Name',
    p_business_stage := 'building',
    p_main_challenge := 'Finding customers'
);
```

This function:
1. Creates 4 scheduled email records
2. Sets appropriate send times (now, +2 days, +7 days, +14 days)
3. Includes personalization data for each email
4. Marks the lead's sequence as started

## Indexes

Performance indexes are created for:
- Email lookups
- Stage filtering
- Date-based queries
- Assignment tracking
- Priority sorting

## Row-Level Security (RLS)

All tables have RLS enabled with policies for:
- **Service role**: Full access (for API operations)
- **Admin users**: Full access to CRM data
- **Regular users**: Access only to their own profile

## Testing the Setup

### 1. Test Discovery Form Submission

Visit: `http://localhost:3000/get-started`

Fill out the 7-step form and submit. Check the browser console for success/error messages.

### 2. Check Database

```sql
-- View all leads
SELECT id, name, email, stage, created_at
FROM leads
ORDER BY created_at DESC;

-- View scheduled emails
SELECT
    es.sequence_type,
    es.sequence_day,
    es.scheduled_for,
    es.status,
    l.name,
    l.email
FROM email_sequences es
JOIN leads l ON l.id = es.lead_id
ORDER BY es.scheduled_for;
```

### 3. Test Email Sequence Function

```sql
-- Insert test lead with full sequence
WITH new_lead AS (
    INSERT INTO leads (name, email, business_stage, main_challenge, interested_tier)
    VALUES ('Test Lead', 'test@example.com', 'building', 'Getting customers', 'growth')
    RETURNING id, email, name, business_stage, main_challenge
)
SELECT schedule_standard_email_sequence(
    new_lead.id,
    new_lead.email,
    new_lead.name,
    new_lead.business_stage,
    new_lead.main_challenge
) FROM new_lead;
```

## Troubleshooting

### "Failed to create lead" Error

**Causes:**
1. Migrations not applied
2. Missing environment variables
3. RLS policies blocking access

**Solutions:**
```bash
# 1. Verify migrations applied
supabase migration list

# 2. Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# 3. Test with service role key
# Use service role key in API calls (not anon key)
```

### Email Sequences Not Scheduling

**Check:**
```sql
-- Verify function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'schedule_standard_email_sequence';

-- Check for errors in lead creation
SELECT * FROM leads WHERE email_sequence_started = FALSE;
```

### RLS Policy Errors

```sql
-- Temporarily disable RLS for testing (NOT FOR PRODUCTION)
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
```

## Next Steps

1. ✅ Apply migrations
2. ✅ Grant admin access to yourself
3. ✅ Test lead creation via discovery form
4. ⏳ Implement email sending worker (separate task)
5. ⏳ Build CRM dashboard UI for lead management
6. ⏳ Set up email templates for 4-sequence campaign

## Additional Resources

- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/managing-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)

---

**Created**: January 9, 2025
**Purpose**: Enable Phase 3 CRM with discovery forms and automated email sequences
**Status**: Ready to apply

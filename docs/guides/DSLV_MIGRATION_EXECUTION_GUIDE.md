# DSLV Database Migration Execution Guide

**Date:** December 26, 2025  
**Status:** Migration File Created - Ready for Execution  
**Migration:** `0024_dslv_cold_calling_tables.sql`

---

## 📋 Migration Overview

This migration creates the database tables required for the DSLV cold calling system:

1. **`campaigns`** - Campaign management and configuration
2. **`call_schedules`** - Individual call scheduling and execution tracking
3. **`call_evaluations`** - GPT-4 powered call quality and qualification analysis

---

## 🚀 Execution Methods

### Method 1: Supabase Dashboard (Recommended)

1. **Navigate to Supabase Dashboard**
   - Go to your Supabase project
   - Click on "SQL Editor" in the left sidebar

2. **Open Migration File**
   - Open `supabase/migrations/0024_dslv_cold_calling_tables.sql`
   - Copy the entire contents

3. **Execute SQL**
   - Paste into SQL Editor
   - Click "Run" or press `Ctrl+Enter`
   - Verify success message

4. **Verify Tables**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('campaigns', 'call_schedules', 'call_evaluations');
   ```

### Method 2: Supabase CLI

```bash
# Navigate to project root
cd C:\Dev\StrataNoble

# Apply migration
supabase db push

# Or apply specific migration
supabase migration up 0024_dslv_cold_calling_tables
```

### Method 3: Direct SQL Connection

If you have direct database access:

```bash
# Using psql
psql -h [your-host] -U postgres -d postgres -f supabase/migrations/0024_dslv_cold_calling_tables.sql
```

---

## ✅ Verification Steps

### 1. Check Tables Created

```sql
SELECT table_name, 
       (SELECT count(*) 
        FROM information_schema.columns 
        WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('campaigns', 'call_schedules', 'call_evaluations')
ORDER BY table_name;
```

**Expected Result:**
- `campaigns` - 13 columns
- `call_schedules` - 15 columns
- `call_evaluations` - 12 columns

### 2. Check Indexes Created

```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('campaigns', 'call_schedules', 'call_evaluations')
ORDER BY tablename, indexname;
```

**Expected Indexes:**
- `idx_call_schedules_campaign`
- `idx_call_schedules_scheduled`
- `idx_call_schedules_status`
- `idx_call_evaluations_campaign`
- `idx_call_evaluations_score`
- `idx_call_evaluations_call_sid`

### 3. Check Triggers Created

```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('campaigns', 'call_schedules');
```

**Expected Triggers:**
- `update_campaigns_updated_at`
- `update_call_schedules_updated_at`

### 4. Test Table Structure

```sql
-- Test campaigns table
INSERT INTO campaigns (
  id, name, type, status, start_date, 
  calling_hours, target_leads, call_config, metrics, created_by
) VALUES (
  'test_campaign_001',
  'Test Campaign',
  'internet',
  'draft',
  NOW(),
  '{"start": "09:00", "end": "17:00", "timezone": "America/Los_Angeles", "days_of_week": [1,2,3,4,5]}'::jsonb,
  '{"list_name": "test_list", "estimated_count": 100}'::jsonb,
  '{"max_attempts": 3, "retry_delay_hours": 24, "concurrent_calls": 5}'::jsonb,
  '{"leads_total": 0, "leads_called": 0, "calls_connected": 0}'::jsonb,
  'test_user'
);

-- Verify insert
SELECT * FROM campaigns WHERE id = 'test_campaign_001';

-- Clean up test
DELETE FROM campaigns WHERE id = 'test_campaign_001';
```

---

## 🔍 Post-Migration Checklist

- [ ] All 3 tables created successfully
- [ ] All indexes created successfully
- [ ] Triggers created and functional
- [ ] Test insert/delete works
- [ ] Table comments added for documentation
- [ ] Foreign key constraints verified (call_schedules → campaigns)

---

## 📝 Migration Details

### Tables Created

1. **campaigns**
   - Primary key: `id` (TEXT)
   - Campaign types: internet, voip, security, cisco
   - Status: draft, scheduled, active, paused, completed
   - JSONB fields: calling_hours, target_leads, call_config, metrics

2. **call_schedules**
   - Primary key: `id` (TEXT)
   - Foreign key: `campaign_id` → campaigns(id)
   - Status: pending, in_progress, completed, failed, cancelled
   - Tracks: scheduled_for, timezone, attempt_number, call_sid, outcome

3. **call_evaluations**
   - Primary key: `id` (TEXT)
   - Unique: `call_sid` (TEXT)
   - Scores: overall_score, qualification_score, conversation_quality_score (0-100)
   - JSONB fields: qualification, quality_metrics, outcome, recommendations, transcript

### Indexes Created

- Campaign lookups: `idx_call_schedules_campaign`
- Pending call queries: `idx_call_schedules_scheduled` (filtered on status='pending')
- Status queries: `idx_call_schedules_status`
- Evaluation queries: `idx_call_evaluations_campaign`, `idx_call_evaluations_score`
- Call SID lookups: `idx_call_evaluations_call_sid`

### Triggers Created

- `update_campaigns_updated_at` - Auto-updates `updated_at` on campaigns
- `update_call_schedules_updated_at` - Auto-updates `updated_at` on call_schedules

---

## 🚨 Troubleshooting

### Error: Table already exists

If tables already exist, the migration uses `CREATE TABLE IF NOT EXISTS`, so it should be safe. However, if you need to recreate:

```sql
DROP TABLE IF EXISTS call_evaluations CASCADE;
DROP TABLE IF EXISTS call_schedules CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
```

Then re-run the migration.

### Error: Function already exists

The `update_updated_at_column()` function may already exist. The migration uses `CREATE OR REPLACE`, so it should handle this automatically.

### Error: Permission denied

Ensure you're using a user with sufficient privileges (typically `postgres` or `service_role`).

---

## 📞 Next Steps After Migration

1. **Verify Environment Variables**
   - Check `.env.local` has all required DSLV variables
   - Verify Supabase connection strings

2. **Test API Endpoints**
   - Test `/api/voice/call` endpoint
   - Test `/api/voice/conversation` endpoint
   - Verify database writes

3. **Create Test Campaign**
   - Use campaign scheduler to create test campaign
   - Verify data persists correctly

4. **Execute Test Call**
   - Run test call with DSLV system
   - Verify call evaluation is stored

---

**Migration File:** `supabase/migrations/0024_dslv_cold_calling_tables.sql`  
**Created:** December 26, 2025  
**Status:** Ready for Execution


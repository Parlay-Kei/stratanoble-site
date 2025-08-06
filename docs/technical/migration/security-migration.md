# Security Migration Deployment Guide

## Overview
This guide covers deploying the security fixes migration (`0015_security_fixes.sql`) to address critical security vulnerabilities.

## Issues Fixed
1. **RLS Disabled on `offerings` table** - Now protected with proper Row Level Security
2. **Verified no SECURITY DEFINER views** - All views use safe SECURITY INVOKER (default)

## Deployment Options

### Option 1: Using Supabase CLI (Recommended)
```bash
# First, reset your database password if needed:
# 1. Go to https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/settings/database
# 2. Click "Reset database password"
# 3. Save the new password securely

# Then deploy the migration:
cd C:\dev\strata-noble
npx supabase db push
```

### Option 2: Using Supabase Dashboard SQL Editor
1. Go to [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/sql)
2. Copy the contents of `supabase/migrations/0015_security_fixes.sql`
3. Paste and execute the SQL

### Option 3: Manual SQL Execution
Connect to your database directly and execute:

```sql
-- Enable RLS on offerings table
ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;

-- Grant read-only access to all authenticated users for offerings
CREATE POLICY "Allow public read access to offerings" ON public.offerings
    FOR SELECT 
    TO public
    USING (true);

-- Restrict write operations to service role only
CREATE POLICY "Service role can modify offerings" ON public.offerings
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant appropriate access to the health summary view
GRANT SELECT ON public.service_health_summary TO authenticated;
GRANT SELECT ON public.service_health_summary TO service_role;

-- Ensure anonymous users cannot access sensitive tables
REVOKE ALL ON public.offerings FROM anon;
REVOKE ALL ON public.service_health_summary FROM anon;

-- Grant specific read access where appropriate
GRANT SELECT ON public.offerings TO authenticated;
GRANT SELECT ON public.service_health_summary TO service_role;
```

## Post-Deployment Verification

### 1. Run Smoke Tests
Execute the queries in `scripts/security-smoke-test.sql` to verify:
- RLS is enabled on offerings table
- Policies are correctly applied
- Anonymous access is properly restricted
- Authenticated access works as expected

### 2. Quick Verification Commands
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'offerings' AND schemaname = 'public';
-- Should return: rowsecurity = true

-- Check policies exist
SELECT policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'offerings' AND schemaname = 'public';
-- Should return at least 2 policies
```

### 3. Security Test
Try accessing the offerings table as different roles:
- As `anon` - should be denied
- As `authenticated` - should work for SELECT
- As `service_role` - should work for all operations

## Rollback Plan (if needed)
```sql
-- If rollback is needed:
DROP POLICY IF EXISTS "Allow public read access to offerings" ON public.offerings;
DROP POLICY IF EXISTS "Service role can modify offerings" ON public.offerings;
ALTER TABLE public.offerings DISABLE ROW LEVEL SECURITY;
```

## Files Created/Modified
- `supabase/migrations/0015_security_fixes.sql` - Main migration
- `scripts/validate-security-migration.js` - Validation script
- `scripts/security-smoke-test.sql` - Post-deployment tests

## Next Steps After Deployment
1. Monitor application for any access issues
2. Verify all legitimate users can still access needed data
3. Confirm no unauthorized access is possible
4. Update any application code if needed to handle the new security model
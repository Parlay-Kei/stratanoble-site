-- Security Smoke Test
-- Tests to verify security fixes are working properly
-- Run these commands after deploying the migration

-- =============================================================================
-- Test 1: Verify RLS is enabled on offerings table
-- =============================================================================
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'offerings' AND schemaname = 'public';
-- Expected: rowsecurity = true

-- =============================================================================
-- Test 2: Verify policies exist on offerings table
-- =============================================================================
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'offerings' AND schemaname = 'public';
-- Expected: At least 2 policies (public read, service_role write)

-- =============================================================================
-- Test 3: Test anonymous access to offerings (should be denied)
-- =============================================================================
-- This should be run as anon role and should fail
-- SET ROLE anon;
-- SELECT * FROM public.offerings LIMIT 1;
-- Expected: Should fail with permission denied

-- =============================================================================
-- Test 4: Test authenticated access to offerings (should work)
-- =============================================================================
-- This should be run as authenticated role and should work
-- SET ROLE authenticated;
-- SELECT * FROM public.offerings LIMIT 1;
-- Expected: Should return data

-- =============================================================================
-- Test 5: Verify service_health_summary view permissions
-- =============================================================================
SELECT * FROM information_schema.table_privileges 
WHERE table_name = 'service_health_summary' 
AND table_schema = 'public';
-- Expected: appropriate grants for authenticated and service_role

-- =============================================================================
-- Test 6: Check for SECURITY DEFINER views (should be none)
-- =============================================================================
SELECT schemaname, viewname, viewowner, definition
FROM pg_views 
WHERE schemaname = 'public' 
AND definition ILIKE '%SECURITY DEFINER%';
-- Expected: 0 rows (no views with SECURITY DEFINER)

-- =============================================================================
-- Test 7: Verify SECURITY DEFINER functions are appropriate
-- =============================================================================
SELECT schemaname, proname, prosecdef, proowner
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.prosecdef = true;
-- Expected: Only legitimate system functions like heartbeat functions
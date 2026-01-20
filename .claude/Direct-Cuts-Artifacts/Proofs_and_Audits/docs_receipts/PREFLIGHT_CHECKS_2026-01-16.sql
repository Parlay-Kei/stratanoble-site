-- PREFLIGHT CHECKS FOR STAGING
-- Run these in Supabase SQL Editor for staging (wgxiiefnmaxfxfoqsbwl)
-- Each query should return expected results before proceeding

-- ================================================
-- 1. SCHEMA EXISTS - New Tables
-- Expected: 4 rows
-- ================================================
SELECT
    table_name,
    CASE
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'barber_subscriptions',
        'guest_identities',
        'reward_accounts',
        'reward_transactions'
    )
ORDER BY table_name;

-- ================================================
-- 2. NEW FUNCTIONS EXIST
-- Expected: 4 rows
-- ================================================
SELECT
    proname as function_name,
    CASE
        WHEN proname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_proc
JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
WHERE nspname = 'public'
    AND proname IN (
        'can_barber_accept_bookings',
        'merge_guest_rewards_to_member',
        'award_rewards_on_completion',
        'enforce_barber_subscription_gating'
    )
ORDER BY proname;

-- ================================================
-- 3. APPOINTMENT TRIGGERS EXIST
-- Expected: At least 2 rows with our new triggers
-- ================================================
SELECT
    tgname as trigger_name,
    CASE
        WHEN tgenabled = 'O' THEN '✅ ENABLED'
        WHEN tgenabled = 'D' THEN '❌ DISABLED'
        ELSE '⚠️ UNKNOWN'
    END as status,
    pg_proc.proname as function_called
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
WHERE pg_class.relname = 'appointments'
    AND tgname IN (
        'on_appointment_rewards',
        'tr_enforce_barber_subscription_gating'
    )
ORDER BY tgname;

-- ================================================
-- 4. RLS POLICIES EXIST AND ARE ENABLED
-- Expected: Policies for each new table with RLS enabled
-- ================================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    CASE
        WHEN policyname IS NOT NULL THEN '✅ POLICY EXISTS'
        ELSE '❌ NO POLICY'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'barber_subscriptions',
        'guest_identities',
        'reward_accounts',
        'reward_transactions'
    )
ORDER BY tablename, policyname;

-- ================================================
-- 5. RLS IS ENABLED ON TABLES
-- Expected: All 4 tables with rowsecurity = true
-- ================================================
SELECT
    tablename,
    rowsecurity,
    CASE
        WHEN rowsecurity = true THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED - CRITICAL SECURITY ISSUE!'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'barber_subscriptions',
        'guest_identities',
        'reward_accounts',
        'reward_transactions'
    )
ORDER BY tablename;

-- ================================================
-- 6. TEST: ANONYMOUS CANNOT READ SENSITIVE DATA
-- Expected: ERROR - permission denied
-- ================================================
-- Run this in a separate query:
-- SET ROLE anon;
-- SELECT * FROM barber_subscriptions LIMIT 1;
-- RESET ROLE;

-- ================================================
-- 7. TEST: AUTHENTICATED USER SCOPE
-- Expected: Empty result (no data for fake user)
-- ================================================
-- Run this in a separate query:
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub = 'fake-user-id-12345';
-- SELECT * FROM reward_accounts WHERE user_id = 'fake-user-id-12345';
-- RESET ROLE;

-- ================================================
-- 8. CHECK WEBHOOK EVENTS TABLE
-- Expected: Table exists with proper columns
-- ================================================
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'webhook_events'
    AND column_name IN ('id', 'stripe_event_id', 'event_type', 'processed')
ORDER BY ordinal_position;

-- ================================================
-- 9. CHECK UNIQUE CONSTRAINT ON WEBHOOK EVENTS
-- Expected: Unique constraint on stripe_event_id
-- ================================================
SELECT
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'webhook_events'
    AND c.contype = 'u'
    AND pg_get_constraintdef(c.oid) LIKE '%stripe_event_id%';

-- ================================================
-- 10. VERIFY MONEY CONSTRAINTS ON APPOINTMENTS
-- Expected: 3 constraints for money validation
-- ================================================
SELECT
    conname as constraint_name,
    CASE
        WHEN convalidated THEN '✅ VALIDATED'
        ELSE '⚠️ NOT VALIDATED'
    END as status
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'appointments'
    AND conname IN (
        'appointments_tip_percent_allowed',
        'appointments_total_matches_components',
        'appointments_money_non_negative'
    )
ORDER BY conname;
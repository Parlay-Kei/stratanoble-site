-- Migration: Enable Row Level Security on all tables
-- Date: 2025-10-03
-- Description: Enable RLS policies to prevent unauthorized data access

-- ============================================================================
-- LEADS TABLE - Service Role Only Access
-- ============================================================================

-- Enable RLS on leads table
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role full access to leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users cannot access leads" ON leads;

-- Service role can do everything (for backend API)
CREATE POLICY "Service role full access to leads" ON leads
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Block all direct client access to leads
CREATE POLICY "Block authenticated client access to leads" ON leads
    FOR ALL
    TO authenticated
    USING (false)
    WITH CHECK (false);

-- Revoke direct access
REVOKE ALL ON leads FROM anon;
REVOKE ALL ON leads FROM authenticated;
GRANT ALL ON leads TO service_role;

-- ============================================================================
-- ACHIEVERY PLATFORM TABLES - User-Scoped Access
-- ============================================================================

-- Enable RLS on all ACHIEVERY platform tables
ALTER TABLE IF EXISTS user_dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS weekly_narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS trust_ledger_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_platform_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER_DREAMS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Service role full access to user_dreams" ON user_dreams;
DROP POLICY IF EXISTS "Users can access own dreams" ON user_dreams;

-- Service role full access
CREATE POLICY "Service role full access to user_dreams" ON user_dreams
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Users can only access their own dreams
CREATE POLICY "Users can access own dreams" ON user_dreams
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- USER_ACTIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role full access to user_actions" ON user_actions;
DROP POLICY IF EXISTS "Users can access own actions" ON user_actions;

CREATE POLICY "Service role full access to user_actions" ON user_actions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can access own actions" ON user_actions
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- WEEKLY_NARRATIVES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role full access to weekly_narratives" ON weekly_narratives;
DROP POLICY IF EXISTS "Users can access own narratives" ON weekly_narratives;

CREATE POLICY "Service role full access to weekly_narratives" ON weekly_narratives
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can access own narratives" ON weekly_narratives
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRUST_LEDGER_SHARES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role full access to trust_ledger_shares" ON trust_ledger_shares;
DROP POLICY IF EXISTS "Users can access own shares" ON trust_ledger_shares;
DROP POLICY IF EXISTS "Users can access shares shared with them" ON trust_ledger_shares;

CREATE POLICY "Service role full access to trust_ledger_shares" ON trust_ledger_shares
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Users can access shares they created
CREATE POLICY "Users can access own shares" ON trust_ledger_shares
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can view shares shared with their email (read-only)
CREATE POLICY "Users can view shares shared with them" ON trust_ledger_shares
    FOR SELECT
    TO authenticated
    USING (shared_with_email = auth.jwt()->>'email');

-- ============================================================================
-- USER_PLATFORM_SETTINGS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Service role full access to user_platform_settings" ON user_platform_settings;
DROP POLICY IF EXISTS "Users can access own settings" ON user_platform_settings;

CREATE POLICY "Service role full access to user_platform_settings" ON user_platform_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can access own settings" ON user_platform_settings
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- EARLY_ACCESS_SIGNUPS TABLE - FIX OVERLY PERMISSIVE POLICY
-- ============================================================================

ALTER TABLE IF EXISTS early_access_signups ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Users can read their own signup" ON early_access_signups;
DROP POLICY IF EXISTS "Service role full access" ON early_access_signups;

-- Service role only (backend API handles signups)
CREATE POLICY "Service role full access to early_access_signups" ON early_access_signups
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Block all client access
REVOKE ALL ON early_access_signups FROM anon;
REVOKE ALL ON early_access_signups FROM authenticated;
GRANT ALL ON early_access_signups TO service_role;

-- ============================================================================
-- VERIFICATION & DOCUMENTATION
-- ============================================================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN (
            'leads',
            'user_dreams',
            'user_actions',
            'weekly_narratives',
            'trust_ledger_shares',
            'user_platform_settings',
            'early_access_signups'
        )
    LOOP
        RAISE NOTICE 'RLS Status for %: %',
            table_record.tablename,
            (SELECT relrowsecurity FROM pg_class WHERE relname = table_record.tablename);
    END LOOP;
END $$;

-- Fix RLS on leads table and address security concerns
-- Migration: 0019_fix_leads_rls_and_security.sql
-- Date: 2025-12-16

-- ============================================================================
-- 1. Enable RLS on leads table (if not already enabled)
-- ============================================================================

-- Check if RLS is enabled, if not, enable it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'leads' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on leads table';
    ELSE
        RAISE NOTICE 'RLS already enabled on leads table';
    END IF;
END $$;

-- ============================================================================
-- 2. Drop existing policies if they exist (to recreate them properly)
-- ============================================================================

DROP POLICY IF EXISTS "Service role can access all leads" ON public.leads;
DROP POLICY IF EXISTS "Admin users can access all leads" ON public.leads;
DROP POLICY IF EXISTS "leads_policy" ON public.leads;

-- ============================================================================
-- 3. Create comprehensive RLS policies for leads table
-- ============================================================================

-- Policy: Service role can access all leads (for API routes)
CREATE POLICY "Service role can access all leads"
    ON public.leads
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Policy: Admin users can access all leads
CREATE POLICY "Admin users can access all leads"
    ON public.leads
    FOR ALL
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Policy: Authenticated users can view their own leads (if linked via achievery_user_id)
CREATE POLICY "Users can view own leads"
    ON public.leads
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND achievery_user_id = auth.uid()
    );

-- Policy: Service role can insert leads (for discovery form submissions)
CREATE POLICY "Service role can insert leads"
    ON public.leads
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 4. Add comments for documentation
-- ============================================================================

COMMENT ON POLICY "Service role can access all leads" ON public.leads IS 
    'Allows service role (API routes) full access to all leads for CRM operations';

COMMENT ON POLICY "Admin users can access all leads" ON public.leads IS 
    'Allows authenticated admin users full access to all leads for management';

COMMENT ON POLICY "Users can view own leads" ON public.leads IS 
    'Allows authenticated users to view leads linked to their ACHIEVERY account';

COMMENT ON POLICY "Service role can insert leads" ON public.leads IS 
    'Allows service role to insert new leads from discovery form submissions';

-- ============================================================================
-- 5. Verify RLS is enabled
-- ============================================================================

DO $$
DECLARE
    rls_enabled BOOLEAN;
BEGIN
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'leads';
    
    IF rls_enabled THEN
        RAISE NOTICE '✅ RLS is enabled on leads table';
    ELSE
        RAISE WARNING '❌ RLS is NOT enabled on leads table';
    END IF;
END $$;


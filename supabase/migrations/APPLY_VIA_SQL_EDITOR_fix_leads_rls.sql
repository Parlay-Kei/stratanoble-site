-- ============================================================================
-- FIX LEADS TABLE RLS - Apply via Supabase Dashboard SQL Editor
-- ============================================================================
-- Instructions:
-- 1. Go to: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/sql/new
-- 2. Clear the editor completely
-- 3. Paste this entire SQL script
-- 4. Execute the query
-- 5. Verify success
-- ============================================================================

-- 1. Enable RLS on leads table (if not already enabled)
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
        RAISE NOTICE '✅ RLS enabled on leads table';
    ELSE
        RAISE NOTICE 'ℹ️ RLS already enabled on leads table';
    END IF;
END $$;

-- 2. Drop existing policies if they exist (to recreate them properly)
DROP POLICY IF EXISTS "Service role can access all leads" ON public.leads;
DROP POLICY IF EXISTS "Admin users can access all leads" ON public.leads;
DROP POLICY IF EXISTS "leads_policy" ON public.leads;
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Service role can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can read leads" ON public.leads;

-- 3. Create comprehensive RLS policies for leads table

-- Policy: Service role can access all leads (for API routes and admin operations)
-- This is the primary policy - all server-side operations use service_role
CREATE POLICY "Service role can access all leads"
    ON public.leads
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Policy: Authenticated users can read their own leads (if linked via achievery_user_id)
CREATE POLICY "Users can view own leads"
    ON public.leads
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND achievery_user_id = auth.uid()
    );

-- Policy: Admin users can access all leads (JWT-claim based)
-- This project does not have a guaranteed `public.user_profiles` table in remote.
-- We instead gate admin access using a JWT claim.
--
-- Requirements:
-- - Your JWT must include `app_metadata.role = 'admin'` (or adjust below).
--
-- If you don't use JWT roles, you can delete this policy and rely on service_role only.
CREATE POLICY "Admin users can access all leads"
    ON public.leads
    FOR ALL
    USING (
        auth.role() = 'authenticated'
        AND coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    )
    WITH CHECK (
        auth.role() = 'authenticated'
        AND coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    );

-- Policy: Service role can insert leads (explicit insert policy for discovery form)
CREATE POLICY "Service role can insert leads"
    ON public.leads
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- 4. Add comments for documentation
COMMENT ON POLICY "Service role can access all leads" ON public.leads IS
    'Allows service role (API routes) full access to all leads for CRM operations';

COMMENT ON POLICY "Users can view own leads" ON public.leads IS
    'Allows authenticated users to view leads linked to their ACHIEVERY account';

COMMENT ON POLICY "Admin users can access all leads" ON public.leads IS
    'Allows authenticated admin users full access to all leads for management';

COMMENT ON POLICY "Service role can insert leads" ON public.leads IS
    'Allows service role to insert new leads from discovery form submissions';

-- 5. Verify RLS is enabled and policies are created
DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Check RLS status
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'leads';

    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'leads';

    IF rls_enabled THEN
        RAISE NOTICE '✅ RLS is enabled on leads table';
    ELSE
        RAISE WARNING '❌ RLS is NOT enabled on leads table';
    END IF;

    RAISE NOTICE '✅ Created % policies on leads table', policy_count;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Run separately to verify)
-- ============================================================================

-- Check RLS status:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads';

-- List all policies on leads table:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public' AND tablename = 'leads';

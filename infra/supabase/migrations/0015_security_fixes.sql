-- Security fixes for SECURITY DEFINER views and RLS-disabled tables
-- Addresses security vulnerabilities identified in security audit

-- =============================================================================
-- 1. Fix RLS on offerings table
-- =============================================================================
-- The offerings table is exposed via PostgREST but has no RLS protection

-- Enable RLS on offerings table
ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;

-- Grant read-only access to all authenticated users for offerings
-- This table contains pricing information that should be publicly readable
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

-- =============================================================================
-- 2. Fix SECURITY DEFINER functions (if needed)
-- =============================================================================
-- The heartbeat functions use SECURITY DEFINER which could bypass RLS
-- However, they are legitimate system functions that need elevated privileges
-- So we'll keep them as SECURITY DEFINER but ensure they're properly scoped

-- Note: update_heartbeat and check_service_health functions in 0011_monitoring.sql
-- are correctly using SECURITY DEFINER as they need to write system health data
-- These are kept as-is since they're system functions with legitimate elevated needs

-- =============================================================================
-- 3. Verify view security
-- =============================================================================
-- The service_health_summary view is correctly created without SECURITY DEFINER
-- No changes needed as it defaults to SECURITY INVOKER

-- Grant appropriate access to the health summary view
GRANT SELECT ON public.service_health_summary TO authenticated;
GRANT SELECT ON public.service_health_summary TO service_role;

-- =============================================================================
-- 4. Additional security hardening
-- =============================================================================
-- Ensure anonymous users cannot access sensitive tables
REVOKE ALL ON public.offerings FROM anon;
REVOKE ALL ON public.service_health_summary FROM anon;

-- Grant specific read access where appropriate
GRANT SELECT ON public.offerings TO authenticated;
GRANT SELECT ON public.service_health_summary TO service_role;
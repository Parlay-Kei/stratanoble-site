-- ============================================================================
-- Migration: 0028_enable_rls_on_missing_tables.sql
-- Date: 2026-01-02
-- Description: Enable RLS on tables that were missing it:
--              - campaigns: DSLV cold calling campaign management
--              - call_schedules: Call scheduling and execution tracking
--              - call_evaluations: GPT-4 powered call quality analysis
--              - LeadIntake: Lead intake form submissions
-- ============================================================================

-- ============================================================================
-- 1. Enable RLS on campaigns table
-- ============================================================================

ALTER TABLE IF EXISTS public.campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can access all campaigns" ON public.campaigns;

-- Policy: Service role can access all campaigns (for API routes)
CREATE POLICY "Service role can access all campaigns"
    ON public.campaigns
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Service role can access all campaigns" ON public.campaigns IS
    'Allows service role (API routes) full access to all campaigns for DSLV operations';

-- ============================================================================
-- 2. Enable RLS on call_schedules table
-- ============================================================================

ALTER TABLE IF EXISTS public.call_schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can access all call_schedules" ON public.call_schedules;

-- Policy: Service role can access all call schedules (for API routes)
CREATE POLICY "Service role can access all call_schedules"
    ON public.call_schedules
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Service role can access all call_schedules" ON public.call_schedules IS
    'Allows service role (API routes) full access to all call schedules for DSLV operations';

-- ============================================================================
-- 3. Enable RLS on call_evaluations table
-- ============================================================================

ALTER TABLE IF EXISTS public.call_evaluations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can access all call_evaluations" ON public.call_evaluations;

-- Policy: Service role can access all call evaluations (for API routes)
CREATE POLICY "Service role can access all call_evaluations"
    ON public.call_evaluations
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Service role can access all call_evaluations" ON public.call_evaluations IS
    'Allows service role (API routes) full access to all call evaluations for DSLV operations';

-- ============================================================================
-- 4. Enable RLS on LeadIntake table
-- ============================================================================

ALTER TABLE IF EXISTS public."LeadIntake" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can access all LeadIntake" ON public."LeadIntake";

-- Policy: Service role can access all LeadIntake (for API routes)
CREATE POLICY "Service role can access all LeadIntake"
    ON public."LeadIntake"
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Service role can access all LeadIntake" ON public."LeadIntake" IS
    'Allows service role (API routes) full access to all LeadIntake records for CRM operations';

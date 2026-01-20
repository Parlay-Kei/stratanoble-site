-- ============================================================================
-- Migration: 0029_security_linter_fixes.sql
-- Date: 2026-01-07
-- Description: Fix security linter warnings:
--   1. Function search_path mutable on update_updated_at_column
--   2. Permissive RLS policy on vault_access_log (INSERT with true)
--   3. Permissive RLS policy on workshop_waitlist (INSERT with true)
-- ============================================================================

-- ============================================================================
-- 1. Fix update_updated_at_column function search_path
-- ============================================================================
-- Recreate the function with an immutable search_path to prevent
-- search_path injection attacks

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS
    'Trigger function to auto-update updated_at timestamp. Uses empty search_path for security.';

-- ============================================================================
-- 2. Fix vault_access_log RLS policy
-- ============================================================================
-- The current policy allows any authenticated user to insert.
-- This should be restricted to service_role only (system-initiated logging).

DROP POLICY IF EXISTS "System can insert access log" ON public.vault_access_log;
DROP POLICY IF EXISTS "Service role can insert access log" ON public.vault_access_log;

CREATE POLICY "Service role can insert access log"
    ON public.vault_access_log
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Service role can insert access log" ON public.vault_access_log IS
    'Only service role (API routes) can insert access log entries for audit trail';

-- ============================================================================
-- 3. Fix workshop_waitlist RLS policy
-- ============================================================================
-- The current policy allows anyone to insert (intentional for public waitlist).
-- However, we should add basic validation to prevent abuse:
-- - Require a valid email format
-- - This is still permissive but adds a data quality check

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.workshop_waitlist;

-- Option A: If this should be public (e.g., landing page waitlist), add email validation
-- We use a simple check that email contains @ and .
CREATE POLICY "Anyone can join waitlist with valid email"
    ON public.workshop_waitlist
    FOR INSERT
    WITH CHECK (
        -- Basic email format validation
        email IS NOT NULL
        AND email ~ '^[^@]+@[^@]+\.[^@]+$'
    );

COMMENT ON POLICY "Anyone can join waitlist with valid email" ON public.workshop_waitlist IS
    'Allows public waitlist signups but requires valid email format';

-- Also ensure service role can manage the waitlist
DROP POLICY IF EXISTS "Service role can manage waitlist" ON public.workshop_waitlist;

CREATE POLICY "Service role can manage waitlist"
    ON public.workshop_waitlist
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON POLICY "Service role can manage waitlist" ON public.workshop_waitlist IS
    'Service role has full access to manage waitlist entries';

-- ============================================================================
-- 4. Fix event_trigger_fn function search_path
-- ============================================================================
-- The function has a mutable search_path which can lead to security risks
-- (object shadowing) and unpredictable behavior across different roles/sessions.

ALTER FUNCTION public.event_trigger_fn()
    SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.event_trigger_fn() IS
    'Event trigger function with fixed search_path for security';

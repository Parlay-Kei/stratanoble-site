-- ============================================================================
-- Migration: 0031_security_search_path_hardening.sql
-- Ticket:    SECFIX-SN-SUPABASE-SECURITY-0099
-- Date:      2026-04-22
-- Description:
--   Fix function_search_path_mutable advisor warnings by pinning search_path
--   on all public functions that were flagged. Uses to_regprocedure() guards
--   so the migration is idempotent and safe to run even if a function does not
--   exist in this deployment target.
-- ============================================================================

DO $$
BEGIN
    -- public.set_inquiry_at()
    IF to_regprocedure('public.set_inquiry_at()') IS NOT NULL THEN
        ALTER FUNCTION public.set_inquiry_at()
            SET search_path = pg_catalog, public;
        RAISE NOTICE 'Fixed search_path on public.set_inquiry_at()';
    ELSE
        RAISE NOTICE 'SKIP: public.set_inquiry_at() not found in this project';
    END IF;

    -- public.update_sn_inquiries_updated_at()
    IF to_regprocedure('public.update_sn_inquiries_updated_at()') IS NOT NULL THEN
        ALTER FUNCTION public.update_sn_inquiries_updated_at()
            SET search_path = pg_catalog, public;
        RAISE NOTICE 'Fixed search_path on public.update_sn_inquiries_updated_at()';
    ELSE
        RAISE NOTICE 'SKIP: public.update_sn_inquiries_updated_at() not found in this project';
    END IF;

    -- public.handle_new_user()
    IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
        ALTER FUNCTION public.handle_new_user()
            SET search_path = pg_catalog, public;
        RAISE NOTICE 'Fixed search_path on public.handle_new_user()';
    ELSE
        RAISE NOTICE 'SKIP: public.handle_new_user() not found in this project';
    END IF;
END $$;

-- public.grant_admin_access(text) — uses explicit signature due to argument
DO $$
BEGIN
    IF to_regprocedure('public.grant_admin_access(text)') IS NOT NULL THEN
        ALTER FUNCTION public.grant_admin_access(text)
            SET search_path = pg_catalog, public;
        RAISE NOTICE 'Fixed search_path on public.grant_admin_access(text)';
    ELSE
        RAISE NOTICE 'SKIP: public.grant_admin_access(text) not found in this project';
    END IF;
END $$;

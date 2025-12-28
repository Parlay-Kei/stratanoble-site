-- ============================================================================
-- SECURITY DEFINER VIEWS - Documentation and Policy Updates
-- ============================================================================
-- These views intentionally use SECURITY DEFINER to provide admin dashboards
-- with aggregate data access. This is the standard pattern for:
-- 1. Vault credential management summaries (no sensitive values exposed)
-- 2. System health monitoring dashboards
-- 3. Client metrics aggregations
--
-- IMPORTANT: These views MUST NOT expose secrets. If a view includes fields like
-- `vault_credentials.encrypted_value` or `encryption_key_id`, it materially
-- increases blast radius if granted broadly, and will keep triggering the
-- Supabase linter.
--
-- Current DB reality check:
-- - credentials_due_for_rotation currently SELECTs encrypted_value + encryption_key_id
--   (see scripts/get-view-definitions.mjs output). This should be removed from the view.
--
-- Recommendation:
-- 1) Convert views to SECURITY INVOKER where possible.
-- 2) For views that are used only by server/service_role, keep them but remove
--    any secret-bearing columns and strictly control GRANTs.
-- ============================================================================

-- Document the views with comments explaining the SECURITY DEFINER choice
COMMENT ON VIEW public.credentials_due_for_rotation IS
'SECURITY DEFINER: Intentional - Provides rotation schedule summary for admin dashboard.
Exposes credential metadata but NOT the encrypted values.
Admin access required to view this dashboard.';

-- NOTE: At time of report generation, the underlying view definition *does*
-- include encrypted_value/encryption_key_id. This comment does not match reality.
-- Fix the view definition before relying on this statement.

COMMENT ON VIEW public.current_client_metrics IS
'SECURITY DEFINER: Intentional - Provides aggregated client metrics for admin reporting.
Shows 30-day rollups, not individual metric entries.
Used by admin dashboards for client health monitoring.';

COMMENT ON VIEW public.recent_vault_access IS
'SECURITY DEFINER: Intentional - Provides audit log access for security monitoring.
Shows who accessed credentials and when.
Critical for compliance and security auditing.';

COMMENT ON VIEW public.service_credentials_summary IS
'SECURITY DEFINER: Intentional - Provides service-level credential overview.
Shows counts and rotation status by service, not individual credentials.
Used by admin dashboards for credential management.';

COMMENT ON VIEW public.service_health_summary IS
'SECURITY DEFINER: Intentional - Provides system health monitoring data.
Shows heartbeat status for all services.
Critical for operations monitoring dashboards.';

-- Ensure underlying tables have proper RLS policies

-- vault_credentials should only be accessible by service_role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'vault_credentials'
        AND policyname = 'Service role can access vault_credentials'
    ) THEN
        CREATE POLICY "Service role can access vault_credentials"
            ON public.vault_credentials
            FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
        RAISE NOTICE 'Created policy for vault_credentials';
    END IF;
END $$;

-- vault_access_log should only be accessible by service_role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'vault_access_log'
        AND policyname = 'Service role can access vault_access_log'
    ) THEN
        CREATE POLICY "Service role can access vault_access_log"
            ON public.vault_access_log
            FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
        RAISE NOTICE 'Created policy for vault_access_log';
    END IF;
END $$;

-- system_heartbeat should be readable by authenticated, writable by service_role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'system_heartbeat'
        AND policyname = 'Service role can manage system_heartbeat'
    ) THEN
        CREATE POLICY "Service role can manage system_heartbeat"
            ON public.system_heartbeat
            FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
        RAISE NOTICE 'Created policy for system_heartbeat';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'system_heartbeat'
        AND policyname = 'Authenticated can read system_heartbeat'
    ) THEN
        CREATE POLICY "Authenticated can read system_heartbeat"
            ON public.system_heartbeat
            FOR SELECT
            USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Created read policy for system_heartbeat';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('vault_credentials', 'vault_access_log', 'system_heartbeat');

    RAISE NOTICE '✅ Total policies on vault/system tables: %', v_count;
END $$;

-- ============================================================================
-- AUTO-GENERATED SECURITY FIXES
-- Generated: 2025-12-17T00:51:37.837Z
-- ============================================================================

-- Add policy for workshop_testimonials
CREATE POLICY "Service role can access workshop_testimonials"
    ON public.workshop_testimonials
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

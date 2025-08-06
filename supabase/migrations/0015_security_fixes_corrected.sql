-- Security fixes for SECURITY DEFINER views and RLS-disabled tables
-- Addresses security vulnerabilities identified in security audit

-- Enable RLS on offerings table
ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;

-- Grant read-only access to all authenticated users for offerings
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

-- Grant appropriate access to the health summary view (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_health_summary' AND table_schema = 'public') THEN
        EXECUTE 'GRANT SELECT ON public.service_health_summary TO authenticated';
        EXECUTE 'GRANT SELECT ON public.service_health_summary TO service_role';
        EXECUTE 'REVOKE ALL ON public.service_health_summary FROM anon';
    END IF;
END $$;

-- Ensure anonymous users cannot access sensitive tables
REVOKE ALL ON public.offerings FROM anon;

-- Grant specific read access where appropriate
GRANT SELECT ON public.offerings TO authenticated;
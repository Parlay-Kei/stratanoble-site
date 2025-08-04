-- Enable RLS for SaaS tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SaaS tables
-- Service role can access everything
CREATE POLICY "Service role can access all clients" ON clients
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all subscriptions" ON subscriptions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all metric_feed" ON metric_feed
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all metric_summary" ON metric_summary
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all stripe_event_log" ON stripe_event_log
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all onboarding_status" ON onboarding_status
    FOR ALL USING (auth.role() = 'service_role');

-- User access policies (clients can only see their own data)
CREATE POLICY "Owner access clients" ON clients
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Client metrics access" ON metric_summary
    FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Client metric feed access" ON metric_feed
    FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Client subscription access" ON subscriptions
    FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Client onboarding access" ON onboarding_status
    FOR SELECT USING (client_id = auth.uid());
-- Row Level Security policies for core tables

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Service role policies (full access for admin operations)
CREATE POLICY "Service role can access all customers" ON customers
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all contact submissions" ON contact_submissions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all orders" ON orders
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all webhook logs" ON webhook_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all email logs" ON email_logs
    FOR ALL USING (auth.role() = 'service_role');
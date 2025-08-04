-- Create indexes for SaaS tables

-- Clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer_id ON clients(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(tier);

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Metric feed indexes
CREATE INDEX IF NOT EXISTS idx_metric_feed_client_id ON metric_feed(client_id);
CREATE INDEX IF NOT EXISTS idx_metric_feed_source ON metric_feed(source);
CREATE INDEX IF NOT EXISTS idx_metric_feed_fetched_at ON metric_feed(fetched_at DESC);

-- Metric summary indexes (conditional on date column existing)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'metric_summary' AND column_name = 'date') THEN
        CREATE INDEX IF NOT EXISTS idx_metric_summary_client_date ON metric_summary(client_id, date DESC);
    END IF;
END $$;

-- Stripe event log indexes
CREATE INDEX IF NOT EXISTS idx_stripe_event_log_event_id ON stripe_event_log(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_event_log_type ON stripe_event_log(type);
CREATE INDEX IF NOT EXISTS idx_stripe_event_log_handled ON stripe_event_log(handled);
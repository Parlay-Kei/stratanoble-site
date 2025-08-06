-- Strata Noble Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    stripe_customer_id TEXT UNIQUE,
    total_spent DECIMAL(10,2) DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    last_order_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    topic TEXT,
    message TEXT NOT NULL,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
    assigned_to TEXT,
    notes TEXT
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stripe_session_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    package_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'completed', 'cancelled')),
    delivered_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    payload JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON webhook_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data
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

-- Create a function to update customer stats when orders change
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer stats when order status changes to 'paid'
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
        INSERT INTO customers (email, name, total_spent, order_count, last_order_at)
        VALUES (NEW.customer_email, NEW.customer_name, NEW.amount, 1, NEW.created_at)
        ON CONFLICT (email) DO UPDATE SET
            total_spent = customers.total_spent + NEW.amount,
            order_count = customers.order_count + 1,
            last_order_at = NEW.created_at,
            name = COALESCE(customers.name, NEW.customer_name);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_stats_trigger AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- SaaS Metrics System Tables (per checklist)

-- Clients table - One row per paying org; tier drives route guards
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT auth.uid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stripe_customer_id TEXT UNIQUE,
    tier TEXT DEFAULT 'lite' CHECK (tier IN ('lite', 'growth', 'partner')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'suspended'))
);

-- Subscriptions table - Mirrors Stripe status for billing logic
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE
);

-- Offerings table - Read-only reference table for internal logic
CREATE TABLE IF NOT EXISTS offerings (
    id TEXT PRIMARY KEY CHECK (id IN ('lite', 'growth', 'partner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stripe_price_id TEXT UNIQUE NOT NULL,
    nickname TEXT NOT NULL,
    monthly_price INTEGER NOT NULL -- in cents
);

-- Metric feed table - Raw blobs every 6 hours
CREATE TABLE IF NOT EXISTS metric_feed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('youtube', 'tiktok')),
    payload JSONB NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metric summary table - Materialized nightly aggregates
CREATE TABLE IF NOT EXISTS metric_summary (
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views BIGINT DEFAULT 0,
    watch_hours DECIMAL(12,2) DEFAULT 0,
    subs INTEGER DEFAULT 0,
    rpm DECIMAL(8,2) DEFAULT 0, -- revenue per mille
    PRIMARY KEY (client_id, date)
);

-- Stripe event log table - Audit trail, easy replay
CREATE TABLE IF NOT EXISTS stripe_event_log (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    handled BOOLEAN DEFAULT FALSE
);

-- Onboarding status table - Automations checkpoint
CREATE TABLE IF NOT EXISTS onboarding_status (
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    has_airtable BOOLEAN DEFAULT FALSE,
    has_geniuslink BOOLEAN DEFAULT FALSE,
    welcome_email_sent BOOLEAN DEFAULT FALSE
);

-- Create indexes for SaaS tables
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer_id ON clients(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_metric_feed_client_id ON metric_feed(client_id);
CREATE INDEX IF NOT EXISTS idx_metric_feed_source ON metric_feed(source);
CREATE INDEX IF NOT EXISTS idx_metric_feed_fetched_at ON metric_feed(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_metric_summary_client_date ON metric_summary(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_event_log_event_id ON stripe_event_log(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_event_log_type ON stripe_event_log(type);
CREATE INDEX IF NOT EXISTS idx_stripe_event_log_handled ON stripe_event_log(handled);

-- Create triggers for SaaS tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_status_updated_at BEFORE UPDATE ON onboarding_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Seed data for offerings table
INSERT INTO offerings (id, stripe_price_id, nickname, monthly_price)
VALUES
  ('lite',    'price_live_123', 'Dashboard Lite',  30000),
  ('growth',  'price_live_456', 'Growth Blueprint',200000),
  ('partner', 'price_live_789', 'Revenue Partner', 400000)
ON CONFLICT (id) DO UPDATE SET
  stripe_price_id = EXCLUDED.stripe_price_id,
  nickname = EXCLUDED.nickname,
  monthly_price = EXCLUDED.monthly_price;

-- Create RPC function to handle Stripe webhook events
CREATE OR REPLACE FUNCTION handle_stripe_event(event_data JSONB)
RETURNS JSONB AS $$
DECLARE
  event_type TEXT;
  event_id TEXT;
  subscription_data JSONB;
  customer_id TEXT;
  client_record RECORD;
  result JSONB;
BEGIN
  event_type := event_data->>'type';
  event_id := event_data->>'id';
  
  -- Log the event
  INSERT INTO stripe_event_log (event_id, type, handled)
  VALUES (event_id, event_type, FALSE)
  ON CONFLICT (event_id) DO NOTHING;
  
  -- Handle different event types
  CASE event_type
    WHEN 'customer.subscription.created' THEN
      subscription_data := event_data->'data'->'object';
      customer_id := subscription_data->>'customer';
      
      -- Create or get client
      INSERT INTO clients (stripe_customer_id, tier, status)
      VALUES (customer_id, 'lite', 'active')
      ON CONFLICT (stripe_customer_id) 
      DO UPDATE SET status = 'active'
      RETURNING * INTO client_record;
      
      -- Create subscription record
      INSERT INTO subscriptions (
        client_id, 
        stripe_subscription_id, 
        status,
        current_period_start,
        current_period_end
      )
      VALUES (
        client_record.id,
        subscription_data->>'id',
        subscription_data->>'status',
        to_timestamp((subscription_data->>'current_period_start')::bigint),
        to_timestamp((subscription_data->>'current_period_end')::bigint)
      )
      ON CONFLICT (stripe_subscription_id) DO UPDATE SET
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end;
      
      result := jsonb_build_object('action', 'subscription_created', 'client_id', client_record.id);
      
    WHEN 'customer.subscription.updated' THEN
      subscription_data := event_data->'data'->'object';
      customer_id := subscription_data->>'customer';
      
      -- Update subscription
      UPDATE subscriptions SET
        status = subscription_data->>'status',
        current_period_start = to_timestamp((subscription_data->>'current_period_start')::bigint),
        current_period_end = to_timestamp((subscription_data->>'current_period_end')::bigint)
      WHERE stripe_subscription_id = subscription_data->>'id';
      
      -- Update client tier if subscription is active and price changed
      IF subscription_data->>'status' = 'active' THEN
        SELECT c.* INTO client_record
        FROM clients c
        WHERE c.stripe_customer_id = customer_id;
        
        -- Determine tier based on price (you may need to adjust this logic)
        IF client_record.id IS NOT NULL THEN
          UPDATE clients SET 
            tier = CASE 
              WHEN subscription_data->'items'->'data'->0->'price'->>'id' = 'price_live_456' THEN 'growth'
              WHEN subscription_data->'items'->'data'->0->'price'->>'id' = 'price_live_789' THEN 'partner'
              ELSE 'lite'
            END
          WHERE id = client_record.id;
        END IF;
      END IF;
      
      result := jsonb_build_object('action', 'subscription_updated', 'customer_id', customer_id);
      
    WHEN 'customer.subscription.deleted' THEN
      subscription_data := event_data->'data'->'object';
      customer_id := subscription_data->>'customer';
      
      -- Update client status to cancelled
      UPDATE clients SET status = 'cancelled'
      WHERE stripe_customer_id = customer_id;
      
      -- Update subscription status
      UPDATE subscriptions SET status = 'canceled'
      WHERE stripe_subscription_id = subscription_data->>'id';
      
      result := jsonb_build_object('action', 'subscription_cancelled', 'customer_id', customer_id);
      
    ELSE
      result := jsonb_build_object('action', 'unhandled', 'event_type', event_type);
  END CASE;
  
  -- Mark event as handled
  UPDATE stripe_event_log SET handled = TRUE WHERE event_id = event_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for subscription status changes (for email notifications)
CREATE OR REPLACE FUNCTION notify_subscription_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification for payment failures or cancellations
  IF NEW.status IN ('past_due', 'canceled', 'unpaid') AND OLD.status != NEW.status THEN
    -- This would typically trigger an email via an external service
    -- For now, we'll just log it
    INSERT INTO email_logs (recipient, subject, template, status, metadata)
    SELECT 
      'client@email.com', -- You'd get this from client data
      'Payment Issue - Action Required',
      'payment_failed',
      'pending',
      jsonb_build_object('subscription_id', NEW.stripe_subscription_id, 'status', NEW.status)
    WHERE EXISTS (SELECT 1 FROM clients WHERE id = NEW.client_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_status_change_trigger
  AFTER UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_subscription_status_change();
-- SaaS Metrics System Tables
-- Core tables for subscription management and metrics tracking

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
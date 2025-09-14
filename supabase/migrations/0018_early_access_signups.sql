-- Create early_access_signups table for ACHIEVERY early access program
-- Migration: 0018_early_access_signups.sql

-- Create early_access_signups table
CREATE TABLE IF NOT EXISTS early_access_signups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT,
    goals TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'converted', 'unsubscribed')),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referrer TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    notified_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_early_access_signups_email ON early_access_signups(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_early_access_signups_status ON early_access_signups(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_early_access_signups_created_at ON early_access_signups(created_at DESC);

-- Create index on utm_source for analytics
CREATE INDEX IF NOT EXISTS idx_early_access_signups_utm_source ON early_access_signups(utm_source);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_early_access_signups_updated_at ON early_access_signups;
CREATE TRIGGER set_early_access_signups_updated_at
    BEFORE UPDATE ON early_access_signups
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE early_access_signups ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (full access)
DROP POLICY IF EXISTS "Service role full access" ON early_access_signups;
CREATE POLICY "Service role full access" ON early_access_signups
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy for authenticated users to read their own data
DROP POLICY IF EXISTS "Users can read their own signup" ON early_access_signups;
CREATE POLICY "Users can read their own signup" ON early_access_signups
    FOR SELECT
    TO authenticated
    USING (auth.email() = email);

-- Grant necessary permissions
GRANT ALL ON early_access_signups TO service_role;
GRANT SELECT ON early_access_signups TO authenticated;
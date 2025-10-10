-- Leads table for multi-step discovery form submissions
-- Supports Phase 3 CRM system with email sequences and lead management

CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Contact Information
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,

    -- Discovery Form Responses
    passion_area TEXT,
    business_stage TEXT NOT NULL CHECK (business_stage IN ('idea', 'building', 'launched', 'scaling')),
    main_challenge TEXT NOT NULL,
    time_commitment TEXT,
    success_goal TEXT,
    interested_tier TEXT NOT NULL CHECK (interested_tier IN ('starter', 'growth', 'success')),

    -- Lead Management
    stage TEXT DEFAULT 'discovery' CHECK (stage IN ('discovery', 'scheduled', 'called', 'qualified', 'converted', 'dormant')),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 3), -- 1=normal, 2=high, 3=urgent
    assigned_to TEXT,
    scheduled_call_at TIMESTAMP WITH TIME ZONE,
    called_at TIMESTAMP WITH TIME ZONE,
    qualified_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,

    -- Marketing Attribution
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referrer TEXT,

    -- Notes and Tracking
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Email Sequences
    email_sequence_started BOOLEAN DEFAULT FALSE,
    email_sequence_completed BOOLEAN DEFAULT FALSE,
    last_email_sent_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_business_stage ON leads(business_stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority DESC);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can access all leads
CREATE POLICY "Service role can access all leads" ON leads
    FOR ALL
    USING (auth.role() = 'service_role');

-- Policy: Authenticated users with admin role can access leads (if you implement user roles)
CREATE POLICY "Admin users can access all leads" ON leads
    FOR ALL
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

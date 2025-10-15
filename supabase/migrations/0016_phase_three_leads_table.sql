-- Create leads table for Phase 3 CRM integration
-- This table stores discovery form submissions with proper tagging for the sales pipeline

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contact information
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  
  -- Discovery form data (from 7-step process)
  passion_area VARCHAR, -- What energizes them
  business_stage VARCHAR NOT NULL, -- Current stage of their business journey
  main_challenge TEXT NOT NULL, -- Primary obstacle they're facing
  time_commitment VARCHAR, -- How much time they can dedicate
  success_goal TEXT, -- What success looks like to them
  interested_tier VARCHAR NOT NULL, -- Support level they're interested in
  
  -- CRM pipeline management
  stage VARCHAR DEFAULT 'discovery' CHECK (stage IN ('discovery', 'scheduled', 'called', 'qualified', 'converted', 'dormant')),
  source VARCHAR DEFAULT 'website',
  
  -- ACHIEVERY integration tracking
  achievery_user_id UUID, -- Links to ACHIEVERY users when account is created
  assigned_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  
  -- Internal management
  assigned_to VARCHAR, -- Team member handling this lead
  notes TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  priority INTEGER DEFAULT 0, -- 0=normal, 1=high, 2=urgent
  
  -- Metadata for analytics and personalization
  utm_source VARCHAR,
  utm_medium VARCHAR,
  utm_campaign VARCHAR,
  referrer VARCHAR,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_business_stage ON leads(business_stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_last_activity ON leads(last_activity DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "leads_policy" ON leads FOR ALL USING (true); -- Adjust based on auth requirements

COMMENT ON TABLE leads IS 'Stores discovery form submissions and sales pipeline data for Phase 3 CRM integration';
COMMENT ON COLUMN leads.stage IS 'Pipeline stage: discovery, scheduled, called, qualified, converted, dormant';
COMMENT ON COLUMN leads.assigned_tasks IS 'Number of ACHIEVERY tasks assigned to this lead';
COMMENT ON COLUMN leads.completed_tasks IS 'Number of ACHIEVERY tasks completed by this lead';
COMMENT ON COLUMN leads.priority IS 'Lead priority: 0=normal, 1=high, 2=urgent';
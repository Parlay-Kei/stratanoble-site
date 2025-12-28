-- ============================================================================
-- Migration: 0024_dslv_cold_calling_tables.sql
-- Date: 2025-12-26
-- Description: Creates tables for DSLV cold calling system
--              - campaigns: Campaign management
--              - call_schedules: Call scheduling and execution tracking
--              - call_evaluations: GPT-4 powered call quality analysis
-- ============================================================================

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('internet', 'voip', 'security', 'cisco')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  calling_hours JSONB NOT NULL,
  target_leads JSONB NOT NULL,
  call_config JSONB NOT NULL,
  metrics JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Call schedules table
CREATE TABLE IF NOT EXISTS call_schedules (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id TEXT NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  timezone TEXT NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  call_sid TEXT,
  connected BOOLEAN DEFAULT FALSE,
  duration_seconds INTEGER,
  outcome TEXT CHECK (outcome IN ('qualified', 'not_interested', 'callback', 'voicemail', 'no_answer', 'busy')),
  qualification_score INTEGER,
  next_action TEXT CHECK (next_action IN ('follow_up', 'send_info', 'schedule_callback', 'no_action')),
  cost_per_call DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Call evaluations table
CREATE TABLE IF NOT EXISTS call_evaluations (
  id TEXT PRIMARY KEY,
  call_sid TEXT UNIQUE NOT NULL,
  campaign_type TEXT NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  qualification_score INTEGER NOT NULL CHECK (qualification_score >= 0 AND qualification_score <= 100),
  conversation_quality_score INTEGER NOT NULL CHECK (conversation_quality_score >= 0 AND conversation_quality_score <= 100),
  qualification JSONB NOT NULL,
  quality_metrics JSONB NOT NULL,
  outcome JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  transcript JSONB NOT NULL,
  duration_seconds INTEGER NOT NULL,
  turn_count INTEGER NOT NULL,
  evaluated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_schedules_campaign ON call_schedules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_call_schedules_scheduled ON call_schedules(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_call_schedules_status ON call_schedules(status);
CREATE INDEX IF NOT EXISTS idx_call_evaluations_campaign ON call_evaluations(campaign_type);
CREATE INDEX IF NOT EXISTS idx_call_evaluations_score ON call_evaluations(overall_score);
CREATE INDEX IF NOT EXISTS idx_call_evaluations_call_sid ON call_evaluations(call_sid);

-- Updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_call_schedules_updated_at ON call_schedules;
CREATE TRIGGER update_call_schedules_updated_at
  BEFORE UPDATE ON call_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE campaigns IS 'DSLV cold calling campaign management';
COMMENT ON TABLE call_schedules IS 'Individual call scheduling and execution tracking';
COMMENT ON TABLE call_evaluations IS 'GPT-4 powered call quality and qualification analysis';

COMMENT ON COLUMN campaigns.type IS 'Campaign type: internet, voip, security, or cisco';
COMMENT ON COLUMN campaigns.calling_hours IS 'JSONB: {start, end, timezone, days_of_week}';
COMMENT ON COLUMN campaigns.target_leads IS 'JSONB: {list_name, filters, estimated_count}';
COMMENT ON COLUMN campaigns.call_config IS 'JSONB: {max_attempts, retry_delay_hours, concurrent_calls, etc}';
COMMENT ON COLUMN campaigns.metrics IS 'JSONB: {leads_total, calls_connected, appointments_booked, roi_estimate, etc}';

COMMENT ON COLUMN call_schedules.attempt_number IS 'Current attempt number (1, 2, 3, etc)';
COMMENT ON COLUMN call_schedules.qualification_score IS 'Lead qualification score (0-100)';
COMMENT ON COLUMN call_evaluations.overall_score IS 'Overall call quality score (0-100)';
COMMENT ON COLUMN call_evaluations.qualification IS 'JSONB: {interest_level, decision_maker, pain_points, budget, timeline}';
COMMENT ON COLUMN call_evaluations.quality_metrics IS 'JSONB: {natural_flow_score, active_listening_score, rapport_building_score, etc}';


-- Create email_sequences table for automated follow-up campaigns
-- This table manages scheduled email sequences for leads in the sales pipeline

CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Link to lead
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Sequence configuration
  sequence_type VARCHAR NOT NULL, -- 'discovery_confirmation', 'post_call_summary', 'progress_check', 'tier_conversion'
  sequence_day INTEGER DEFAULT 0, -- Day 0, 2, 7, 14 etc.
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  
  -- Status tracking
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  
  -- Email details
  template_name VARCHAR NOT NULL,
  recipient_email VARCHAR NOT NULL,
  subject VARCHAR,
  
  -- Personalization data (stored as JSON for flexibility)
  personalization_data JSONB DEFAULT '{}'::jsonb,
  
  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Error handling
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  next_retry TIMESTAMPTZ,
  
  -- Integration tracking
  email_provider_id VARCHAR, -- SES message ID, etc.
  email_log_id UUID, -- Links to email_logs table
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_sequences_lead_id ON email_sequences(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_scheduled_for ON email_sequences(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_sequences_status ON email_sequences(status);
CREATE INDEX IF NOT EXISTS idx_email_sequences_sequence_type ON email_sequences(sequence_type);
CREATE INDEX IF NOT EXISTS idx_email_sequences_pending_ready ON email_sequences(status, scheduled_for) WHERE status = 'pending' AND scheduled_for <= NOW();

-- Create updated_at trigger
CREATE TRIGGER update_email_sequences_updated_at BEFORE UPDATE ON email_sequences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to schedule email sequences for a lead
CREATE OR REPLACE FUNCTION schedule_email_sequences(
  p_lead_id UUID,
  p_recipient_email VARCHAR,
  p_lead_name VARCHAR DEFAULT '',
  p_business_stage VARCHAR DEFAULT '',
  p_main_challenge TEXT DEFAULT ''
)
RETURNS TABLE(sequence_id UUID, sequence_type VARCHAR, scheduled_for TIMESTAMPTZ) AS $$
BEGIN
  -- Discovery confirmation email (immediate)
  INSERT INTO email_sequences (lead_id, sequence_type, sequence_day, scheduled_for, template_name, recipient_email, subject, personalization_data)
  VALUES (
    p_lead_id,
    'discovery_confirmation',
    0,
    NOW() + INTERVAL '2 minutes', -- Immediate but slight delay for processing
    'discovery_confirmation',
    p_recipient_email,
    'Thanks for your discovery request - Let''s schedule your call',
    jsonb_build_object(
      'name', p_lead_name,
      'business_stage', p_business_stage,
      'main_challenge', p_main_challenge
    )
  );
  
  -- Post-call summary email (Day 2)
  INSERT INTO email_sequences (lead_id, sequence_type, sequence_day, scheduled_for, template_name, recipient_email, subject, personalization_data)
  VALUES (
    p_lead_id,
    'post_call_summary',
    2,
    NOW() + INTERVAL '2 days',
    'post_call_summary',
    p_recipient_email,
    'Your ACHIEVERY task is ready - Let''s start building momentum',
    jsonb_build_object(
      'name', p_lead_name,
      'business_stage', p_business_stage
    )
  );
  
  -- Progress check reminder (Day 7)
  INSERT INTO email_sequences (lead_id, sequence_type, sequence_day, scheduled_for, template_name, recipient_email, subject, personalization_data)
  VALUES (
    p_lead_id,
    'progress_check',
    7,
    NOW() + INTERVAL '7 days',
    'progress_check',
    p_recipient_email,
    'How''s your progress? Your next achievement awaits',
    jsonb_build_object(
      'name', p_lead_name,
      'business_stage', p_business_stage
    )
  );
  
  -- Tier conversion email (Day 14)
  INSERT INTO email_sequences (lead_id, sequence_type, sequence_day, scheduled_for, template_name, recipient_email, subject, personalization_data)
  VALUES (
    p_lead_id,
    'tier_conversion',
    14,
    NOW() + INTERVAL '14 days',
    'tier_conversion',
    p_recipient_email,
    'Ready to accelerate? Your personalized package recommendation',
    jsonb_build_object(
      'name', p_lead_name,
      'business_stage', p_business_stage,
      'main_challenge', p_main_challenge
    )
  );
  
  -- Return scheduled sequences
  RETURN QUERY 
  SELECT id, email_sequences.sequence_type, email_sequences.scheduled_for 
  FROM email_sequences 
  WHERE lead_id = p_lead_id 
  ORDER BY scheduled_for;
END;
$$ LANGUAGE plpgsql;

-- Create function to get pending email sequences ready to send
CREATE OR REPLACE FUNCTION get_pending_email_sequences()
RETURNS TABLE(
  id UUID,
  lead_id UUID,
  sequence_type VARCHAR,
  template_name VARCHAR,
  recipient_email VARCHAR,
  subject VARCHAR,
  personalization_data JSONB,
  scheduled_for TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    es.id,
    es.lead_id,
    es.sequence_type,
    es.template_name,
    es.recipient_email,
    es.subject,
    es.personalization_data,
    es.scheduled_for
  FROM email_sequences es
  WHERE es.status = 'pending' 
    AND es.scheduled_for <= NOW()
    AND es.attempts < es.max_attempts
  ORDER BY es.scheduled_for ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE email_sequences IS 'Manages scheduled email sequences for lead nurturing and follow-up campaigns';
COMMENT ON FUNCTION schedule_email_sequences IS 'Creates the standard 4-email sequence for new leads: confirmation, post-call, progress check, tier conversion';
COMMENT ON FUNCTION get_pending_email_sequences IS 'Returns email sequences ready to be sent by the email processing system';
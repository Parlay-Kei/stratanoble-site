-- Email sequences table for automated follow-up campaigns
-- Supports Phase 3 CRM 4-email sequence system

CREATE TABLE IF NOT EXISTS email_sequences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Lead Reference
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,

    -- Sequence Details
    sequence_type TEXT NOT NULL CHECK (sequence_type IN (
        'discovery_confirmation',  -- Day 0: Immediate after discovery form
        'post_call_summary',       -- Day 2: After scheduled call
        'progress_check',          -- Day 7: Check-in and encouragement
        'tier_conversion'          -- Day 14: Package recommendation
    )),
    sequence_day INTEGER NOT NULL CHECK (sequence_day IN (0, 2, 7, 14)),

    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,

    -- Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
    error_message TEXT,

    -- Personalization Data
    personalization_data JSONB DEFAULT '{}'::jsonb,

    -- Tracking
    email_log_id UUID REFERENCES email_logs(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_sequences_lead_id ON email_sequences(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_status ON email_sequences(status);
CREATE INDEX IF NOT EXISTS idx_email_sequences_scheduled_for ON email_sequences(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_sequences_sequence_type ON email_sequences(sequence_type);

-- Composite index for finding pending emails to send
CREATE INDEX IF NOT EXISTS idx_email_sequences_pending ON email_sequences(status, scheduled_for)
    WHERE status = 'scheduled' AND scheduled_for <= NOW();

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_email_sequences_updated_at
    BEFORE UPDATE ON email_sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can access all sequences
CREATE POLICY "Service role can access all email sequences" ON email_sequences
    FOR ALL
    USING (auth.role() = 'service_role');

-- Policy: Admin users can access email sequences
CREATE POLICY "Admin users can access all email sequences" ON email_sequences
    FOR ALL
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Function to schedule standard 4-email sequence for a new lead
CREATE OR REPLACE FUNCTION schedule_standard_email_sequence(
    p_lead_id UUID,
    p_email TEXT,
    p_name TEXT,
    p_business_stage TEXT,
    p_main_challenge TEXT
) RETURNS SETOF email_sequences
LANGUAGE plpgsql
AS $$
BEGIN
    -- Day 0: Discovery confirmation
    INSERT INTO email_sequences (
        lead_id,
        recipient_email,
        recipient_name,
        sequence_type,
        sequence_day,
        scheduled_for,
        personalization_data
    ) VALUES (
        p_lead_id,
        p_email,
        p_name,
        'discovery_confirmation',
        0,
        NOW(),
        jsonb_build_object(
            'business_stage', p_business_stage,
            'main_challenge', p_main_challenge
        )
    );

    -- Day 2: Post-call summary (scheduled for 2 days from now)
    INSERT INTO email_sequences (
        lead_id,
        recipient_email,
        recipient_name,
        sequence_type,
        sequence_day,
        scheduled_for,
        personalization_data
    ) VALUES (
        p_lead_id,
        p_email,
        p_name,
        'post_call_summary',
        2,
        NOW() + INTERVAL '2 days',
        jsonb_build_object(
            'business_stage', p_business_stage,
            'main_challenge', p_main_challenge
        )
    );

    -- Day 7: Progress check
    INSERT INTO email_sequences (
        lead_id,
        recipient_email,
        recipient_name,
        sequence_type,
        sequence_day,
        scheduled_for,
        personalization_data
    ) VALUES (
        p_lead_id,
        p_email,
        p_name,
        'progress_check',
        7,
        NOW() + INTERVAL '7 days',
        jsonb_build_object(
            'business_stage', p_business_stage,
            'main_challenge', p_main_challenge
        )
    );

    -- Day 14: Tier conversion
    INSERT INTO email_sequences (
        lead_id,
        recipient_email,
        recipient_name,
        sequence_type,
        sequence_day,
        scheduled_for,
        personalization_data
    ) VALUES (
        p_lead_id,
        p_email,
        p_name,
        'tier_conversion',
        14,
        NOW() + INTERVAL '14 days',
        jsonb_build_object(
            'business_stage', p_business_stage,
            'main_challenge', p_main_challenge
        )
    );

    -- Update lead to mark sequence started
    UPDATE leads
    SET email_sequence_started = TRUE,
        last_email_sent_at = NOW()
    WHERE id = p_lead_id;

    -- Return all scheduled sequences
    RETURN QUERY
    SELECT * FROM email_sequences
    WHERE lead_id = p_lead_id
    ORDER BY sequence_day;
END;
$$;

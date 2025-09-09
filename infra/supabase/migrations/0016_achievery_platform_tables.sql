-- ACHIEVERY Platform Tables Migration
-- Adds tables needed for ACHIEVERY functionality within Strata Noble ecosystem
-- Uses existing clients table instead of separate users table

-- Create ACHIEVERY-specific enums
CREATE TYPE achievery_action_category AS ENUM (
    'learning',   -- Acquiring new skills or knowledge
    'building',   -- Creating, developing, or improving something  
    'connecting'  -- Building relationships or networking
);

CREATE TYPE achievery_phase AS ENUM (
    'explore',    -- Foundation building, skill development
    'build',      -- Active creation, testing, iteration
    'launch'      -- Going live, marketing, scaling
);

-- User Dreams Table (replaces goals - aligned with ACHIEVERY methodology)
CREATE TABLE user_dreams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    dream_text TEXT NOT NULL,
    current_phase achievery_phase DEFAULT 'explore',
    starter_actions TEXT[] DEFAULT '{}', -- Array of suggested actions
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Actions Table (replaces tasks - core ACHIEVERY concept)
CREATE TABLE user_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    dream_id UUID REFERENCES user_dreams(id) ON DELETE SET NULL,
    original_text TEXT NOT NULL, -- What the user actually wrote
    reframed_text TEXT, -- AI-generated professional reframing
    category achievery_action_category NOT NULL,
    phase achievery_phase NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE,
    is_significant BOOLEAN DEFAULT FALSE, -- Marked as milestone action
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Narratives Table (AI-generated weekly summaries)
CREATE TABLE weekly_narratives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    narrative_text TEXT NOT NULL, -- AI-generated narrative
    actions_count INTEGER DEFAULT 0,
    phase_progression TEXT, -- Summary of phase changes
    key_insights TEXT[], -- Array of key insights
    next_suggestions TEXT[], -- Suggested actions for next week
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, week_start)
);

-- Trust Ledger Sharing (privacy-controlled sharing with coaches)
CREATE TABLE trust_ledger_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    shared_with_email VARCHAR(255) NOT NULL, -- Coach/mentor email
    access_level TEXT DEFAULT 'summary', -- 'summary', 'detailed', 'full'
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, shared_with_email)
);

-- User Platform Settings (ACHIEVERY-specific user preferences)
CREATE TABLE user_platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    weekly_narrative_email BOOLEAN DEFAULT TRUE,
    action_reminders BOOLEAN DEFAULT TRUE,
    preferred_phase achievery_phase DEFAULT 'explore',
    weekly_action_limit INTEGER DEFAULT 5, -- Free tier limit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX idx_user_dreams_user_id ON user_dreams(user_id);
CREATE INDEX idx_user_dreams_active ON user_dreams(user_id, is_active);
CREATE INDEX idx_user_dreams_phase ON user_dreams(current_phase);

CREATE INDEX idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX idx_user_actions_dream_id ON user_actions(dream_id);
CREATE INDEX idx_user_actions_category ON user_actions(category);
CREATE INDEX idx_user_actions_phase ON user_actions(phase);
CREATE INDEX idx_user_actions_date ON user_actions(logged_date);
CREATE INDEX idx_user_actions_user_date ON user_actions(user_id, logged_date DESC);

CREATE INDEX idx_weekly_narratives_user_id ON weekly_narratives(user_id);
CREATE INDEX idx_weekly_narratives_week ON weekly_narratives(week_start DESC);
CREATE INDEX idx_weekly_narratives_user_week ON weekly_narratives(user_id, week_start DESC);

CREATE INDEX idx_trust_ledger_user_id ON trust_ledger_shares(user_id);
CREATE INDEX idx_trust_ledger_active ON trust_ledger_shares(is_active);

CREATE INDEX idx_platform_settings_user_id ON user_platform_settings(user_id);
CREATE INDEX idx_platform_settings_onboarding ON user_platform_settings(onboarding_completed);

-- Row Level Security (RLS) policies
ALTER TABLE user_dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_ledger_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can manage own dreams" ON user_dreams 
    FOR ALL TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own actions" ON user_actions 
    FOR ALL TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own narratives" ON weekly_narratives 
    FOR SELECT TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "System can create narratives" ON weekly_narratives 
    FOR INSERT TO service_role 
    WITH CHECK (true);

CREATE POLICY "Users can manage own sharing settings" ON trust_ledger_shares 
    FOR ALL TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own platform settings" ON user_platform_settings 
    FOR ALL TO authenticated 
    USING (auth.uid() = user_id);

-- Functions for ACHIEVERY functionality

-- Function to get user's current tier and limits
CREATE OR REPLACE FUNCTION get_user_action_limit(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    user_tier TEXT;
    action_limit INTEGER := 5; -- Default free tier
BEGIN
    SELECT tier INTO user_tier FROM clients WHERE id = user_uuid;
    
    CASE user_tier
        WHEN 'growth' THEN action_limit := 25;  -- Growth tier
        WHEN 'partner' THEN action_limit := 100; -- Partner tier
        ELSE action_limit := 5; -- Lite/Free tier
    END CASE;
    
    RETURN action_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can log more actions this week
CREATE OR REPLACE FUNCTION can_log_action(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    actions_this_week INTEGER;
    user_limit INTEGER;
    week_start DATE := DATE_TRUNC('week', CURRENT_DATE);
BEGIN
    -- Get actions logged this week
    SELECT COUNT(*) INTO actions_this_week
    FROM user_actions 
    WHERE user_id = user_uuid 
    AND logged_date >= week_start;
    
    -- Get user's action limit
    SELECT get_user_action_limit(user_uuid) INTO user_limit;
    
    RETURN actions_this_week < user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate weekly narrative (placeholder for AI integration)
CREATE OR REPLACE FUNCTION generate_weekly_narrative(user_uuid UUID, week_date DATE)
RETURNS TEXT AS $$
DECLARE
    action_count INTEGER;
    narrative TEXT;
BEGIN
    SELECT COUNT(*) INTO action_count
    FROM user_actions 
    WHERE user_id = user_uuid 
    AND logged_date >= DATE_TRUNC('week', week_date)
    AND logged_date < DATE_TRUNC('week', week_date) + INTERVAL '1 week';
    
    IF action_count = 0 THEN
        narrative := 'This week was quiet - no actions logged. Consider starting small tomorrow.';
    ELSIF action_count <= 3 THEN
        narrative := 'You logged ' || action_count || ' actions this week. You''re building momentum - keep going.';
    ELSE
        narrative := 'Strong week with ' || action_count || ' actions logged. You''re making real progress toward your goals.';
    END IF;
    
    RETURN narrative;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_dreams_updated_at 
    BEFORE UPDATE ON user_dreams 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_actions_updated_at 
    BEFORE UPDATE ON user_actions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_trust_ledger_updated_at 
    BEFORE UPDATE ON trust_ledger_shares 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at 
    BEFORE UPDATE ON user_platform_settings 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- ACHIEVERY Analytics Database Schema
-- Creates tables for comprehensive analytics tracking

-- Main analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL DEFAULT 'web',
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily aggregated metrics
CREATE TABLE IF NOT EXISTS analytics_daily_metrics (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  metric_value NUMERIC DEFAULT 0,
  platform VARCHAR(50),
  category VARCHAR(100),
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, metric_name, platform, category)
);

-- User journey tracking
CREATE TABLE IF NOT EXISTS user_journeys (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255) NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  step_order INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Success metrics tracking
CREATE TABLE IF NOT EXISTS success_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_period VARCHAR(50) NOT NULL, -- 'week1' or 'month1'
  metric_name VARCHAR(255) NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  properties JSONB DEFAULT '{}',
  UNIQUE(metric_period, metric_name)
);

-- Performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric_type VARCHAR(100) NOT NULL,
  duration_ms INTEGER,
  success BOOLEAN DEFAULT true,
  endpoint VARCHAR(255),
  platform VARCHAR(50),
  properties JSONB DEFAULT '{}'
);

-- Cross-platform usage tracking
CREATE TABLE IF NOT EXISTS cross_platform_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  has_web_activity BOOLEAN DEFAULT false,
  has_mobile_activity BOOLEAN DEFAULT false,
  sync_events INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ,
  properties JSONB DEFAULT '{}',
  UNIQUE(user_id, date)
);

-- Coach dashboard metrics
CREATE TABLE IF NOT EXISTS coach_metrics (
  id BIGSERIAL PRIMARY KEY,
  coach_user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  shares_viewed INTEGER DEFAULT 0,
  exports_generated INTEGER DEFAULT 0,
  clients_active INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  properties JSONB DEFAULT '{}',
  UNIQUE(coach_user_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_platform ON analytics_events(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_metrics_date ON analytics_daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_metrics_name ON analytics_daily_metrics(metric_name);

CREATE INDEX IF NOT EXISTS idx_user_journeys_user_id ON user_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_session ON user_journeys(session_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_timestamp ON user_journeys(timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);

CREATE INDEX IF NOT EXISTS idx_cross_platform_user_date ON cross_platform_usage(user_id, date);

CREATE INDEX IF NOT EXISTS idx_coach_metrics_coach_date ON coach_metrics(coach_user_id, date);

-- Initialize success metrics targets
INSERT INTO success_metrics (metric_period, metric_name, target_value) VALUES
  ('week1', 'mobile_downloads', 100),
  ('week1', 'cross_platform_usage', 25),
  ('week1', 'notification_engagement', 40),
  ('week1', 'app_store_rating', 4.5),
  ('month1', 'total_downloads', 500),
  ('month1', 'daily_active_retention', 60),
  ('month1', 'coach_consultations', 10),
  ('month1', 'revenue_increase', 5000)
ON CONFLICT (metric_period, metric_name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_platform_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Analytics events: Allow read/write for authenticated users and service role
CREATE POLICY "Allow analytics events access" ON analytics_events
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Daily metrics: Read-only for authenticated users, full access for service role
CREATE POLICY "Allow metrics read" ON analytics_daily_metrics
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow metrics write" ON analytics_daily_metrics
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow metrics update" ON analytics_daily_metrics
  FOR UPDATE USING (auth.role() = 'service_role');

-- User journeys: Users can only see their own data
CREATE POLICY "Users can view own journey" ON user_journeys
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Allow journey tracking" ON user_journeys
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Performance metrics: Service role only
CREATE POLICY "Service role performance access" ON performance_metrics
  FOR ALL USING (auth.role() = 'service_role');

-- Cross-platform usage: Users can see their own data
CREATE POLICY "Users can view own cross-platform data" ON cross_platform_usage
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Allow cross-platform tracking" ON cross_platform_usage
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow cross-platform updates" ON cross_platform_usage
  FOR UPDATE USING (auth.role() = 'service_role');

-- Coach metrics: Coaches can see their own data
CREATE POLICY "Coaches can view own metrics" ON coach_metrics
  FOR SELECT USING (auth.uid() = coach_user_id OR auth.role() = 'service_role');

CREATE POLICY "Allow coach metrics tracking" ON coach_metrics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow coach metrics updates" ON coach_metrics
  FOR UPDATE USING (auth.role() = 'service_role');

-- Success metrics: Read-only for authenticated users
CREATE POLICY "Allow success metrics read" ON success_metrics
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Functions for analytics aggregation
CREATE OR REPLACE FUNCTION calculate_daily_metrics()
RETURNS void AS $$
BEGIN
  -- Calculate daily active users
  INSERT INTO analytics_daily_metrics (date, metric_name, metric_value, platform)
  SELECT 
    DATE(timestamp) as date,
    'daily_active_users' as metric_name,
    COUNT(DISTINCT user_id) as metric_value,
    platform
  FROM analytics_events 
  WHERE DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day'
    AND user_id IS NOT NULL
  GROUP BY DATE(timestamp), platform
  ON CONFLICT (date, metric_name, platform, category) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = NOW();

  -- Calculate session counts
  INSERT INTO analytics_daily_metrics (date, metric_name, metric_value, platform)
  SELECT 
    DATE(timestamp) as date,
    'session_count' as metric_name,
    COUNT(DISTINCT session_id) as metric_value,
    platform
  FROM analytics_events 
  WHERE DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day'
    AND event_name IN ('session_start', 'mobile_session_start')
  GROUP BY DATE(timestamp), platform
  ON CONFLICT (date, metric_name, platform, category) 
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    created_at = NOW();

  -- Update success metrics
  UPDATE success_metrics 
  SET 
    current_value = (
      SELECT COUNT(*) 
      FROM analytics_events 
      WHERE event_name = 'mobile_app_download' 
        AND timestamp >= DATE_TRUNC('week', CURRENT_DATE)
    ),
    last_updated = NOW()
  WHERE metric_period = 'week1' AND metric_name = 'mobile_downloads';

END;
$$ LANGUAGE plpgsql;

-- Schedule daily metrics calculation (requires pg_cron extension)
-- SELECT cron.schedule('calculate-daily-metrics', '0 1 * * *', 'SELECT calculate_daily_metrics();');

COMMIT;
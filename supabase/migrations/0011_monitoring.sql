-- Heartbeat monitoring table and functions
-- For system observability and health checks

CREATE TABLE IF NOT EXISTS system_heartbeat (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_system_heartbeat_service ON system_heartbeat(service_name);
CREATE INDEX IF NOT EXISTS idx_system_heartbeat_status ON system_heartbeat(status);
CREATE INDEX IF NOT EXISTS idx_system_heartbeat_last_ping ON system_heartbeat(last_ping DESC);

-- Function to update heartbeat
CREATE OR REPLACE FUNCTION update_heartbeat(
    p_service_name TEXT,
    p_status TEXT DEFAULT 'healthy',
    p_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO system_heartbeat (service_name, status, message, metadata)
    VALUES (p_service_name, p_status, p_message, p_metadata)
    ON CONFLICT (service_name) 
    DO UPDATE SET
        status = EXCLUDED.status,
        last_ping = NOW(),
        message = EXCLUDED.message,
        metadata = EXCLUDED.metadata;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check service health
CREATE OR REPLACE FUNCTION check_service_health(p_service_name TEXT)
RETURNS JSONB AS $$
DECLARE
    health_record RECORD;
BEGIN
    SELECT status, last_ping, message, metadata
    INTO health_record
    FROM system_heartbeat 
    WHERE service_name = p_service_name;
    
    IF health_record IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'unknown',
            'message', 'Service not found'
        );
    END IF;
    
    -- Check if service is stale (no ping in last 10 minutes)
    IF health_record.last_ping < NOW() - INTERVAL '10 minutes' THEN
        RETURN jsonb_build_object(
            'status', 'stale',
            'message', 'No recent heartbeat',
            'last_ping', health_record.last_ping
        );
    END IF;
    
    RETURN jsonb_build_object(
        'status', health_record.status,
        'message', health_record.message,
        'last_ping', health_record.last_ping,
        'metadata', health_record.metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for heartbeat table
ALTER TABLE system_heartbeat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can access all heartbeats" ON system_heartbeat
    FOR ALL USING (auth.role() = 'service_role');

-- View for monitoring dashboard
CREATE OR REPLACE VIEW service_health_summary AS
SELECT 
    service_name,
    status,
    last_ping,
    message,
    CASE 
        WHEN last_ping < NOW() - INTERVAL '10 minutes' THEN 'stale'
        ELSE status
    END as effective_status,
    NOW() - last_ping as time_since_ping
FROM system_heartbeat
ORDER BY last_ping DESC;
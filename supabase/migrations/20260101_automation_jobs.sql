-- Migration: Automation Jobs System
-- Pattern A: Durable job tracking for orchestration
-- Created: 2026-01-01
-- Updated: 2026-01-01 (idempotency, locking, dead-letter)

-- Required extension for EXCLUDE constraints with non-GiST types
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================
-- AUTOMATION EVENTS TABLE
-- Records all incoming automation triggers
-- ============================================
CREATE TABLE IF NOT EXISTS automation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('github', 'sentry', 'supabase', 'stripe', 'internal', 'pm_agent', 'manual')),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  signal_id TEXT,
  metadata JSONB DEFAULT '{}',
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,

  -- CRITICAL: Idempotency key for deduplication
  -- If provided, duplicate events with same key are rejected
  idempotency_key TEXT,

  -- Unique constraint on idempotency_key (when not null)
  CONSTRAINT automation_events_idempotency_unique UNIQUE (idempotency_key)
);

-- Index for finding unprocessed events
CREATE INDEX IF NOT EXISTS idx_automation_events_unprocessed
  ON automation_events (received_at)
  WHERE processed_at IS NULL;

-- Index for source lookups
CREATE INDEX IF NOT EXISTS idx_automation_events_source
  ON automation_events (source, event_type);

-- Index for idempotency lookups
CREATE INDEX IF NOT EXISTS idx_automation_events_idempotency
  ON automation_events (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ============================================
-- AUTOMATION JOBS TABLE
-- Tracks job execution state
-- ============================================
CREATE TABLE IF NOT EXISTS automation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN (
    'orchestrate_p0_complete',
    'run_validation',
    'deploy_staging',
    'alert_triggered',
    'sprint_status_update',
    'system_heartbeat',
    'custom'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
    'dead_letter'
  )),
  payload JSONB NOT NULL DEFAULT '{}',
  event_id UUID REFERENCES automation_events(id),

  -- CRITICAL: Idempotency key inherited from event or generated
  -- Prevents duplicate job creation for same logical operation
  idempotency_key TEXT,

  -- Execution tracking
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Dead-letter tracking
  dead_lettered_at TIMESTAMPTZ,
  dead_letter_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- n8n integration
  n8n_execution_id TEXT,

  -- Locking: runner_id claims the job
  locked_by TEXT,
  locked_at TIMESTAMPTZ,
  lock_expires_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT automation_jobs_status_timing CHECK (
    (status = 'pending' AND started_at IS NULL) OR
    (status = 'running' AND started_at IS NOT NULL) OR
    (status IN ('completed', 'failed', 'cancelled', 'dead_letter'))
  ),

  -- CRITICAL: Idempotency constraint
  CONSTRAINT automation_jobs_idempotency_unique UNIQUE (idempotency_key)
);

-- Index for pending jobs (what n8n polls for)
CREATE INDEX IF NOT EXISTS idx_automation_jobs_pending
  ON automation_jobs (created_at)
  WHERE status = 'pending';

-- Index for running jobs (for monitoring)
CREATE INDEX IF NOT EXISTS idx_automation_jobs_running
  ON automation_jobs (started_at)
  WHERE status = 'running';

-- Index for job type queries
CREATE INDEX IF NOT EXISTS idx_automation_jobs_type
  ON automation_jobs (type, status);

-- Index for lock expiry checks
CREATE INDEX IF NOT EXISTS idx_automation_jobs_lock_expires
  ON automation_jobs (lock_expires_at)
  WHERE status = 'running' AND lock_expires_at IS NOT NULL;

-- Index for idempotency lookups
CREATE INDEX IF NOT EXISTS idx_automation_jobs_idempotency
  ON automation_jobs (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ============================================
-- AUTOMATION RUNS TABLE
-- Tracks individual execution attempts
-- ============================================
CREATE TABLE IF NOT EXISTS automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES automation_jobs(id),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN (
    'running',
    'completed',
    'failed'
  )),

  -- Execution details
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Results
  output JSONB DEFAULT '{}',
  error_message TEXT,
  error_stack TEXT,

  -- Agent execution context
  agent_name TEXT,
  agent_version TEXT,
  runner_id TEXT,

  -- CRITICAL: Prevent concurrent runs for same job
  CONSTRAINT automation_runs_job_attempt_unique UNIQUE (job_id, attempt_number)
);

-- Only one running run per job at a time
-- Uses GiST index with btree_gist extension for UUID equality
CREATE INDEX IF NOT EXISTS idx_automation_runs_job_running
  ON automation_runs USING gist (job_id)
  WHERE status = 'running';

-- Partial unique index as alternative to EXCLUDE (more reliable)
-- This guarantees only one 'running' status per job_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_automation_runs_single_running
  ON automation_runs (job_id)
  WHERE status = 'running';

-- Index for job runs
CREATE INDEX IF NOT EXISTS idx_automation_runs_job
  ON automation_runs (job_id, attempt_number);

-- Index for finding stuck runs
CREATE INDEX IF NOT EXISTS idx_automation_runs_stuck
  ON automation_runs (started_at)
  WHERE status = 'running';

-- ============================================
-- AUTOMATION ARTIFACTS TABLE
-- Stores proof files and outputs
-- ============================================
CREATE TABLE IF NOT EXISTS automation_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES automation_runs(id),
  type TEXT NOT NULL CHECK (type IN (
    'proof_file',
    'log',
    'screenshot',
    'report',
    'other'
  )),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size_bytes INTEGER,
  content_type TEXT,
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate artifacts with same path
  CONSTRAINT automation_artifacts_path_unique UNIQUE (run_id, path)
);

-- Index for run artifacts
CREATE INDEX IF NOT EXISTS idx_automation_artifacts_run
  ON automation_artifacts (run_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Create or return existing event (idempotent)
CREATE OR REPLACE FUNCTION create_event_idempotent(
  p_source TEXT,
  p_event_type TEXT,
  p_payload JSONB,
  p_signal_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_idempotency_key TEXT DEFAULT NULL
) RETURNS automation_events AS $$
DECLARE
  v_event automation_events;
BEGIN
  -- If idempotency key provided, check for existing
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_event
    FROM automation_events
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
      RETURN v_event;
    END IF;
  END IF;

  -- Insert new event
  INSERT INTO automation_events (source, event_type, payload, signal_id, metadata, idempotency_key)
  VALUES (p_source, p_event_type, p_payload, p_signal_id, p_metadata, p_idempotency_key)
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING * INTO v_event;

  -- If insert failed due to conflict, fetch existing
  IF v_event.id IS NULL AND p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_event
    FROM automation_events
    WHERE idempotency_key = p_idempotency_key;
  END IF;

  RETURN v_event;
END;
$$ LANGUAGE plpgsql;

-- Create or return existing job (idempotent)
CREATE OR REPLACE FUNCTION create_job_idempotent(
  p_type TEXT,
  p_payload JSONB,
  p_event_id UUID DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL,
  p_max_retries INTEGER DEFAULT 3
) RETURNS automation_jobs AS $$
DECLARE
  v_job automation_jobs;
BEGIN
  -- If idempotency key provided, check for existing
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_job
    FROM automation_jobs
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
      RETURN v_job;
    END IF;
  END IF;

  -- Insert new job
  INSERT INTO automation_jobs (type, payload, event_id, idempotency_key, max_retries)
  VALUES (p_type, p_payload, p_event_id, p_idempotency_key, p_max_retries)
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING * INTO v_job;

  -- If insert failed due to conflict, fetch existing
  IF v_job.id IS NULL AND p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_job
    FROM automation_jobs
    WHERE idempotency_key = p_idempotency_key;
  END IF;

  RETURN v_job;
END;
$$ LANGUAGE plpgsql;

-- Atomic job claim with locking
-- Returns job only if successfully claimed
CREATE OR REPLACE FUNCTION claim_job(
  p_job_id UUID,
  p_runner_id TEXT,
  p_lock_duration_seconds INTEGER DEFAULT 300
) RETURNS automation_jobs AS $$
DECLARE
  v_job automation_jobs;
  v_lock_expires TIMESTAMPTZ;
BEGIN
  v_lock_expires := NOW() + (p_lock_duration_seconds || ' seconds')::INTERVAL;

  -- Atomic transition: pending -> running with lock
  UPDATE automation_jobs
  SET
    status = 'running',
    started_at = NOW(),
    updated_at = NOW(),
    locked_by = p_runner_id,
    locked_at = NOW(),
    lock_expires_at = v_lock_expires
  WHERE id = p_job_id
    AND status = 'pending'
    AND (locked_by IS NULL OR lock_expires_at < NOW())
  RETURNING * INTO v_job;

  RETURN v_job;
END;
$$ LANGUAGE plpgsql;

-- Release job lock (for retries or cancellation)
CREATE OR REPLACE FUNCTION release_job_lock(
  p_job_id UUID,
  p_runner_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE automation_jobs
  SET
    status = 'pending',
    started_at = NULL,
    updated_at = NOW(),
    locked_by = NULL,
    locked_at = NULL,
    lock_expires_at = NULL
  WHERE id = p_job_id
    AND locked_by = p_runner_id
    AND status = 'running';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Complete job (only if caller holds lock)
CREATE OR REPLACE FUNCTION complete_job(
  p_job_id UUID,
  p_runner_id TEXT,
  p_output JSONB DEFAULT '{}'
) RETURNS automation_jobs AS $$
DECLARE
  v_job automation_jobs;
BEGIN
  UPDATE automation_jobs
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW(),
    duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000,
    locked_by = NULL,
    locked_at = NULL,
    lock_expires_at = NULL
  WHERE id = p_job_id
    AND locked_by = p_runner_id
    AND status = 'running'
  RETURNING * INTO v_job;

  RETURN v_job;
END;
$$ LANGUAGE plpgsql;

-- Fail job (increment retry or dead-letter)
CREATE OR REPLACE FUNCTION fail_job(
  p_job_id UUID,
  p_runner_id TEXT,
  p_error_message TEXT DEFAULT NULL
) RETURNS automation_jobs AS $$
DECLARE
  v_job automation_jobs;
  v_new_status TEXT;
BEGIN
  -- First get current state
  SELECT * INTO v_job
  FROM automation_jobs
  WHERE id = p_job_id
    AND locked_by = p_runner_id
    AND status = 'running';

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Determine new status
  IF v_job.retry_count + 1 >= v_job.max_retries THEN
    v_new_status := 'dead_letter';
  ELSE
    v_new_status := 'pending';  -- Will be retried
  END IF;

  UPDATE automation_jobs
  SET
    status = v_new_status,
    completed_at = CASE WHEN v_new_status = 'dead_letter' THEN NOW() ELSE NULL END,
    started_at = CASE WHEN v_new_status = 'pending' THEN NULL ELSE started_at END,
    updated_at = NOW(),
    duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000,
    error_message = p_error_message,
    retry_count = retry_count + 1,
    dead_lettered_at = CASE WHEN v_new_status = 'dead_letter' THEN NOW() ELSE NULL END,
    dead_letter_reason = CASE WHEN v_new_status = 'dead_letter' THEN 'max_retries_exceeded' ELSE NULL END,
    locked_by = NULL,
    locked_at = NULL,
    lock_expires_at = NULL
  WHERE id = p_job_id
  RETURNING * INTO v_job;

  RETURN v_job;
END;
$$ LANGUAGE plpgsql;

-- Get next pending job with atomic claim
CREATE OR REPLACE FUNCTION get_next_pending_job(
  p_runner_id TEXT,
  p_job_type TEXT DEFAULT NULL,
  p_lock_duration_seconds INTEGER DEFAULT 300
) RETURNS automation_jobs AS $$
DECLARE
  v_job automation_jobs;
  v_lock_expires TIMESTAMPTZ;
BEGIN
  v_lock_expires := NOW() + (p_lock_duration_seconds || ' seconds')::INTERVAL;

  -- Atomic select + update with SKIP LOCKED
  UPDATE automation_jobs
  SET
    status = 'running',
    started_at = NOW(),
    updated_at = NOW(),
    locked_by = p_runner_id,
    locked_at = NOW(),
    lock_expires_at = v_lock_expires
  WHERE id = (
    SELECT id
    FROM automation_jobs
    WHERE status = 'pending'
      AND (p_job_type IS NULL OR type = p_job_type)
      AND retry_count < max_retries
      AND (locked_by IS NULL OR lock_expires_at < NOW())
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING * INTO v_job;

  RETURN v_job;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired locks (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE automation_jobs
  SET
    status = 'pending',
    started_at = NULL,
    updated_at = NOW(),
    locked_by = NULL,
    locked_at = NULL,
    lock_expires_at = NULL,
    error_message = 'Lock expired - returned to queue'
  WHERE status = 'running'
    AND lock_expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Get queue statistics
CREATE OR REPLACE FUNCTION get_queue_stats()
RETURNS TABLE (
  pending_count BIGINT,
  running_count BIGINT,
  completed_count BIGINT,
  failed_count BIGINT,
  dead_letter_count BIGINT,
  avg_duration_ms NUMERIC,
  stuck_jobs_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
    COUNT(*) FILTER (WHERE status = 'running') AS running_count,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
    COUNT(*) FILTER (WHERE status = 'dead_letter') AS dead_letter_count,
    AVG(duration_ms) FILTER (WHERE status = 'completed') AS avg_duration_ms,
    COUNT(*) FILTER (WHERE status = 'running' AND lock_expires_at < NOW()) AS stuck_jobs_count
  FROM automation_jobs;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE automation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_artifacts ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on automation_events"
  ON automation_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on automation_jobs"
  ON automation_jobs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on automation_runs"
  ON automation_runs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on automation_artifacts"
  ON automation_artifacts FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE automation_events IS 'Durable record of all automation triggers from external sources';
COMMENT ON TABLE automation_jobs IS 'Job queue for automation tasks, consumed by n8n or agent runner';
COMMENT ON TABLE automation_runs IS 'Execution history for each job attempt';
COMMENT ON TABLE automation_artifacts IS 'Proof files and outputs from automation runs';

COMMENT ON FUNCTION create_event_idempotent IS 'Create event or return existing if idempotency_key matches';
COMMENT ON FUNCTION create_job_idempotent IS 'Create job or return existing if idempotency_key matches';
COMMENT ON FUNCTION claim_job IS 'Atomically claim a job with lock';
COMMENT ON FUNCTION release_job_lock IS 'Release lock to return job to queue';
COMMENT ON FUNCTION complete_job IS 'Mark job complete (only if caller holds lock)';
COMMENT ON FUNCTION fail_job IS 'Mark job failed, retry or dead-letter based on retry count';
COMMENT ON FUNCTION get_next_pending_job IS 'Atomic function to claim next pending job for processing';
COMMENT ON FUNCTION cleanup_expired_locks IS 'Periodic cleanup of stuck jobs with expired locks';
COMMENT ON FUNCTION get_queue_stats IS 'Get queue statistics for monitoring';

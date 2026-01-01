-- ============================================================================
-- Migration: 0027_add_version_pinning_to_deals.sql
-- Date: 2025-12-30
-- Description: Add version pinning to deals table to prevent contract drift
--
-- Purpose: Lock template and playbook versions at deal creation time so that
--          in-flight deals continue using the same versions even when templates
--          are updated. This prevents unexpected changes to active deals.
--
-- Example: A deal created on 2025-01-15 with MSA_v1.0.0 continues to use
--          MSA_v1.0.0 even if MSA_v2.0.0 is released on 2025-02-01.
-- ============================================================================

-- Add version pinning columns to deals table
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS template_version TEXT,
  ADD COLUMN IF NOT EXISTS playbook_version TEXT,
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- Index for querying deals by version (useful for version audits)
CREATE INDEX IF NOT EXISTS idx_deals_template_version ON deals(template_version);
CREATE INDEX IF NOT EXISTS idx_deals_playbook_version ON deals(playbook_version);
CREATE INDEX IF NOT EXISTS idx_deals_locked_at ON deals(locked_at);

-- Comments for documentation
COMMENT ON COLUMN deals.template_version IS 'Locked template version at deal creation (e.g., "MSA_v1.0.0"). Prevents contract drift from template updates.';
COMMENT ON COLUMN deals.playbook_version IS 'Locked playbook version at deal creation (e.g., "1.0.0"). Prevents contract drift from playbook updates.';
COMMENT ON COLUMN deals.locked_at IS 'Timestamp when versions were locked. NULL indicates versions not yet pinned.';

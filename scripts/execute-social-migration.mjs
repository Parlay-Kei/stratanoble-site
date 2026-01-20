#!/usr/bin/env node
/**
 * Execute Social Media Agent migration via Supabase SQL API
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Strata Noble Supabase credentials
const SUPABASE_URL = 'https://bvneqoevtwodyfqglpzi.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bmVxb2V2dHdvZHlmcWdscHppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMzg5NCwiZXhwIjoyMDY3MDA5ODk0fQ.nuRSCa-USL25H7_8qgFjFs4noMUHVPIlD8Yz2Z2CGuQ';

// Parse the schema into individual statements
const schemaPath = 'C:\\Dev\\.claude-anx\\mcp-servers\\social-media-agent\\schema.sql';
const schemaSql = readFileSync(schemaPath, 'utf-8');

// Split into major sections we can execute
const statements = [
  // Extension
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,

  // ENUMS
  `DO $$ BEGIN
    CREATE TYPE social_platform AS ENUM (
        'tiktok', 'instagram', 'twitter', 'youtube', 'linkedin', 'facebook'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
    CREATE TYPE social_content_type AS ENUM (
        'post', 'story', 'reel', 'video', 'short', 'carousel', 'live', 'article'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
    CREATE TYPE post_status AS ENUM (
        'draft', 'scheduled', 'publishing', 'published', 'failed', 'deleted'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
    CREATE TYPE automation_trigger_type AS ENUM (
        'on_publish', 'on_engagement', 'on_mention', 'on_dm',
        'on_comment', 'on_schedule', 'on_trend'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
    CREATE TYPE automation_action_type AS ENUM (
        'crosspost', 'reply', 'dm_response', 'notify',
        'tag', 'archive', 'boost', 'generate_content'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
    CREATE TYPE compliance_status AS ENUM (
        'clean', 'warning', 'flagged', 'restricted', 'shadowbanned', 'suspended'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;`,

  // Tables
  `CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    platform social_platform NOT NULL,
    platform_user_id TEXT NOT NULL,
    platform_username TEXT NOT NULL,
    display_name TEXT,
    profile_image_url TEXT,
    bio TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    token_scopes TEXT[],
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    account_type TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    compliance_status compliance_status DEFAULT 'clean',
    compliance_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organisation_id, platform, platform_user_id)
);`,

  `CREATE TABLE IF NOT EXISTS social_content_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id TEXT NOT NULL,
    account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    created_by TEXT NOT NULL,
    content_type social_content_type NOT NULL,
    caption TEXT,
    hashtags TEXT[],
    mentions TEXT[],
    media_urls TEXT[],
    media_types TEXT[],
    thumbnail_url TEXT,
    scheduled_at TIMESTAMPTZ,
    timezone TEXT DEFAULT 'America/Los_Angeles',
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_prompt TEXT,
    ai_model TEXT,
    status post_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    platform_post_id TEXT,
    platform_post_url TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    is_crosspost BOOLEAN DEFAULT FALSE,
    source_post_id UUID,
    crosspost_accounts UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`,

  `CREATE TABLE IF NOT EXISTS social_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id TEXT NOT NULL,
    account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    post_id UUID REFERENCES social_content_queue(id) ON DELETE SET NULL,
    metric_date DATE NOT NULL,
    metric_hour INTEGER,
    views INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    video_views INTEGER DEFAULT 0,
    watch_time_seconds INTEGER DEFAULT 0,
    average_watch_percentage DECIMAL(5,2),
    followers_gained INTEGER DEFAULT 0,
    followers_lost INTEGER DEFAULT 0,
    profile_visits INTEGER DEFAULT 0,
    engagement_rate DECIMAL(8,4),
    click_through_rate DECIMAL(8,4),
    audience_demographics JSONB,
    top_locations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(account_id, post_id, metric_date, metric_hour)
);`,

  `CREATE TABLE IF NOT EXISTS social_automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    trigger_type automation_trigger_type NOT NULL,
    trigger_config JSONB NOT NULL DEFAULT '{}',
    conditions JSONB,
    action_type automation_action_type NOT NULL,
    action_config JSONB NOT NULL DEFAULT '{}',
    source_accounts UUID[],
    target_accounts UUID[],
    cooldown_minutes INTEGER DEFAULT 5,
    max_executions_per_day INTEGER DEFAULT 100,
    executions_today INTEGER DEFAULT 0,
    last_execution_at TIMESTAMPTZ,
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`,

  `CREATE TABLE IF NOT EXISTS social_automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES social_automation_rules(id) ON DELETE CASCADE,
    organisation_id TEXT NOT NULL,
    trigger_data JSONB,
    action_data JSONB,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    source_account_id UUID,
    target_account_id UUID,
    source_post_id UUID,
    result_post_id UUID,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);`,

  `CREATE TABLE IF NOT EXISTS social_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform social_platform NOT NULL,
    region TEXT DEFAULT 'US',
    trend_type TEXT NOT NULL,
    trend_value TEXT NOT NULL,
    trend_title TEXT,
    trend_description TEXT,
    volume INTEGER,
    growth_rate DECIMAL(8,4),
    peak_rank INTEGER,
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(platform, region, trend_value)
);`,

  `CREATE TABLE IF NOT EXISTS social_compliance_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id TEXT NOT NULL,
    account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    description TEXT NOT NULL,
    metadata JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`,

  `CREATE TABLE IF NOT EXISTS social_content_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    platform social_platform,
    content_type social_content_type,
    template_content TEXT NOT NULL,
    variables JSONB,
    hashtag_sets TEXT[][],
    is_public BOOLEAN DEFAULT FALSE,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`,

  // Indexes
  `CREATE INDEX IF NOT EXISTS idx_social_accounts_org ON social_accounts(organisation_id);`,
  `CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);`,
  `CREATE INDEX IF NOT EXISTS idx_social_accounts_active ON social_accounts(is_active) WHERE is_active = TRUE;`,
  `CREATE INDEX IF NOT EXISTS idx_social_content_org ON social_content_queue(organisation_id);`,
  `CREATE INDEX IF NOT EXISTS idx_social_content_account ON social_content_queue(account_id);`,
  `CREATE INDEX IF NOT EXISTS idx_social_content_status ON social_content_queue(status);`,
  `CREATE INDEX IF NOT EXISTS idx_social_content_scheduled ON social_content_queue(scheduled_at) WHERE status = 'scheduled';`,
  `CREATE INDEX IF NOT EXISTS idx_social_analytics_account ON social_analytics(account_id);`,
  `CREATE INDEX IF NOT EXISTS idx_social_analytics_date ON social_analytics(metric_date);`,
  `CREATE INDEX IF NOT EXISTS idx_social_analytics_org_date ON social_analytics(organisation_id, metric_date);`,
  `CREATE INDEX IF NOT EXISTS idx_social_rules_org ON social_automation_rules(organisation_id);`,
  `CREATE INDEX IF NOT EXISTS idx_social_rules_active ON social_automation_rules(is_active) WHERE is_active = TRUE;`,
  `CREATE INDEX IF NOT EXISTS idx_social_trends_platform ON social_trends(platform, region);`,
  `CREATE INDEX IF NOT EXISTS idx_social_trends_discovered ON social_trends(discovered_at);`,
  `CREATE INDEX IF NOT EXISTS idx_social_audit_org ON social_compliance_audit(organisation_id);`,
  `CREATE INDEX IF NOT EXISTS idx_social_audit_account ON social_compliance_audit(account_id);`,

  // Trigger function
  `CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`,

  // Triggers
  `DO $$ BEGIN
    CREATE TRIGGER update_social_accounts_updated_at
        BEFORE UPDATE ON social_accounts
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
    CREATE TRIGGER update_social_content_updated_at
        BEFORE UPDATE ON social_content_queue
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
    CREATE TRIGGER update_social_analytics_updated_at
        BEFORE UPDATE ON social_analytics
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
    CREATE TRIGGER update_social_rules_updated_at
        BEFORE UPDATE ON social_automation_rules
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;`,

  // Helper functions
  `CREATE OR REPLACE FUNCTION get_pending_content()
RETURNS TABLE (
    id UUID,
    account_id UUID,
    platform social_platform,
    content_type social_content_type,
    caption TEXT,
    hashtags TEXT[],
    media_urls TEXT[],
    access_token TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.account_id,
        a.platform,
        c.content_type,
        c.caption,
        c.hashtags,
        c.media_urls,
        a.access_token
    FROM social_content_queue c
    JOIN social_accounts a ON c.account_id = a.id
    WHERE c.status = 'scheduled'
      AND c.scheduled_at <= NOW()
      AND a.is_active = TRUE
      AND c.retry_count < c.max_retries
    ORDER BY c.scheduled_at ASC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;`,

  `CREATE OR REPLACE FUNCTION reset_daily_automation_counters()
RETURNS void AS $$
BEGIN
    UPDATE social_automation_rules
    SET executions_today = 0
    WHERE executions_today > 0;
END;
$$ LANGUAGE plpgsql;`,

  `CREATE OR REPLACE FUNCTION cleanup_expired_trends()
RETURNS void AS $$
BEGIN
    DELETE FROM social_trends
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;`,

  // Comments
  `COMMENT ON TABLE social_accounts IS 'Connected social media accounts with OAuth tokens';`,
  `COMMENT ON TABLE social_content_queue IS 'Scheduled and published content';`,
  `COMMENT ON TABLE social_analytics IS 'Performance metrics per account/post';`,
  `COMMENT ON TABLE social_automation_rules IS 'If/then automation rules';`,
  `COMMENT ON TABLE social_automation_logs IS 'Automation execution history';`,
  `COMMENT ON TABLE social_trends IS 'Cached trending topics';`,
  `COMMENT ON TABLE social_compliance_audit IS 'Compliance and health events';`,
  `COMMENT ON TABLE social_content_templates IS 'Reusable content templates';`
];

async function executeStatements() {
  console.log('Executing Social Media Agent migration on Strata Noble...\n');
  console.log('Target: https://bvneqoevtwodyfqglpzi.supabase.co\n');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const shortDesc = stmt.substring(0, 60).replace(/\n/g, ' ') + '...';

    try {
      // Use fetch to call the SQL endpoint directly
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query: stmt })
      });

      if (response.ok) {
        console.log(`[${i + 1}/${statements.length}] OK: ${shortDesc}`);
        success++;
      } else {
        const error = await response.text();
        // Check if it's just "function doesn't exist" which means we need different approach
        if (error.includes('exec_sql') || error.includes('42883')) {
          // Function doesn't exist, use pg_query
          const pgResponse = await fetch(`${SUPABASE_URL}/pg/query`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: stmt })
          });

          if (pgResponse.ok) {
            console.log(`[${i + 1}/${statements.length}] OK: ${shortDesc}`);
            success++;
          } else {
            console.log(`[${i + 1}/${statements.length}] SKIP: exec_sql not available`);
            failed++;
          }
        } else {
          console.log(`[${i + 1}/${statements.length}] FAIL: ${shortDesc}`);
          console.log(`   Error: ${error.substring(0, 100)}`);
          failed++;
        }
      }
    } catch (err) {
      console.log(`[${i + 1}/${statements.length}] ERROR: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nResults: ${success} succeeded, ${failed} failed`);

  if (failed > 0) {
    console.log('\nSome statements failed. Manual SQL execution required.');
    console.log('Open: https://supabase.com/dashboard/project/bvneqoevtwodyfqglpzi/sql/new');
  }
}

executeStatements();

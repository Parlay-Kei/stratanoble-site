-- ============================================================================
-- Migration Drift Catch-up (Legacy infra/supabase migrations)
-- Migration: 0022_migration_drift_catchup.sql
-- Date: 2025-12-26
--
-- Purpose
-- - Standardize on `supabase/migrations` as the source of truth.
-- - Capture schema changes that existed only under `infra/supabase/migrations`.
--
-- Notes
-- - This migration is append-only and designed to be safe to apply even if some
--   objects already exist.
-- - This DOES NOT try to exactly replicate historical numbering from infra/.
-- - Where legacy migrations referenced `public.user_profiles` for admin checks,
--   this repo now prefers JWT-based admin role checks unless user_profiles exists.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- A) ACHIEVERY platform tables (from infra/supabase/migrations/0016_achievery_platform_tables.sql)
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'achievery_action_category') THEN
    CREATE TYPE achievery_action_category AS ENUM ('learning', 'building', 'connecting');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'achievery_phase') THEN
    CREATE TYPE achievery_phase AS ENUM ('explore', 'build', 'launch');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_dreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  dream_text TEXT NOT NULL,
  current_phase achievery_phase DEFAULT 'explore',
  starter_actions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  dream_id UUID REFERENCES public.user_dreams(id) ON DELETE SET NULL,
  original_text TEXT NOT NULL,
  reframed_text TEXT,
  category achievery_action_category NOT NULL,
  phase achievery_phase NOT NULL,
  logged_date DATE DEFAULT CURRENT_DATE,
  is_significant BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weekly_narratives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  narrative_text TEXT NOT NULL,
  actions_count INTEGER DEFAULT 0,
  phase_progression TEXT,
  key_insights TEXT[],
  next_suggestions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

CREATE TABLE IF NOT EXISTS public.trust_ledger_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  shared_with_email VARCHAR(255) NOT NULL,
  access_level TEXT DEFAULT 'summary',
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, shared_with_email)
);

CREATE TABLE IF NOT EXISTS public.user_platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  weekly_narrative_email BOOLEAN DEFAULT TRUE,
  action_reminders BOOLEAN DEFAULT TRUE,
  preferred_phase achievery_phase DEFAULT 'explore',
  weekly_action_limit INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_dreams_user_id ON public.user_dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dreams_active ON public.user_dreams(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_dreams_phase ON public.user_dreams(current_phase);

CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON public.user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_dream_id ON public.user_actions(dream_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_category ON public.user_actions(category);
CREATE INDEX IF NOT EXISTS idx_user_actions_phase ON public.user_actions(phase);
CREATE INDEX IF NOT EXISTS idx_user_actions_date ON public.user_actions(logged_date);
CREATE INDEX IF NOT EXISTS idx_user_actions_user_date ON public.user_actions(user_id, logged_date DESC);

CREATE INDEX IF NOT EXISTS idx_weekly_narratives_user_id ON public.weekly_narratives(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_narratives_week ON public.weekly_narratives(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_narratives_user_week ON public.weekly_narratives(user_id, week_start DESC);

CREATE INDEX IF NOT EXISTS idx_trust_ledger_user_id ON public.trust_ledger_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_ledger_active ON public.trust_ledger_shares(is_active);

CREATE INDEX IF NOT EXISTS idx_platform_settings_user_id ON public.user_platform_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_settings_onboarding ON public.user_platform_settings(onboarding_completed);

-- RLS
ALTER TABLE public.user_dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_ledger_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own dreams" ON public.user_dreams;
CREATE POLICY "Users can manage own dreams" ON public.user_dreams
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own actions" ON public.user_actions;
CREATE POLICY "Users can manage own actions" ON public.user_actions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own narratives" ON public.weekly_narratives;
CREATE POLICY "Users can view own narratives" ON public.weekly_narratives
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create narratives" ON public.weekly_narratives;
CREATE POLICY "System can create narratives" ON public.weekly_narratives
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own sharing settings" ON public.trust_ledger_shares;
CREATE POLICY "Users can manage own sharing settings" ON public.trust_ledger_shares
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own platform settings" ON public.user_platform_settings;
CREATE POLICY "Users can manage own platform settings" ON public.user_platform_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Functions (kept compatible with legacy schema)
CREATE OR REPLACE FUNCTION public.get_user_action_limit(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  user_tier TEXT;
  action_limit INTEGER := 5;
BEGIN
  SELECT tier INTO user_tier FROM public.clients WHERE id = user_uuid;
  CASE user_tier
    WHEN 'growth' THEN action_limit := 25;
    WHEN 'partner' THEN action_limit := 100;
    ELSE action_limit := 5;
  END CASE;
  RETURN action_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_log_action(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  actions_this_week INTEGER;
  user_limit INTEGER;
  week_start DATE := DATE_TRUNC('week', CURRENT_DATE);
BEGIN
  SELECT COUNT(*) INTO actions_this_week
  FROM public.user_actions
  WHERE user_id = user_uuid
    AND logged_date >= week_start;

  SELECT public.get_user_action_limit(user_uuid) INTO user_limit;
  RETURN actions_this_week < user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.generate_weekly_narrative(user_uuid UUID, week_date DATE)
RETURNS TEXT AS $$
DECLARE
  action_count INTEGER;
  narrative TEXT;
BEGIN
  SELECT COUNT(*) INTO action_count
  FROM public.user_actions
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

-- Triggers: infra migration created its own update_updated_at_column();
-- In this repo, update_updated_at_column() is already created in 0016.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_dreams_updated_at') THEN
    CREATE TRIGGER update_user_dreams_updated_at
      BEFORE UPDATE ON public.user_dreams
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_actions_updated_at') THEN
    CREATE TRIGGER update_user_actions_updated_at
      BEFORE UPDATE ON public.user_actions
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_trust_ledger_updated_at') THEN
    CREATE TRIGGER update_trust_ledger_updated_at
      BEFORE UPDATE ON public.trust_ledger_shares
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_platform_settings_updated_at') THEN
    CREATE TRIGGER update_platform_settings_updated_at
      BEFORE UPDATE ON public.user_platform_settings
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- B) Legacy user_profiles table is intentionally NOT recreated here.
-- ---------------------------------------------------------------------------
-- Reason:
-- - Your production DB currently does not have public.user_profiles.
-- - The new leads RLS uses JWT claims for admin access.
--
-- If you decide to reintroduce user_profiles as the RBAC source of truth,
-- we can add it in a separate migration with a clear data/backfill plan.


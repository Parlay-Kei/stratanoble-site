-- E2E Seed Tracking Table
-- Audit trail for seed script runs

CREATE TABLE IF NOT EXISTS e2e_seed_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seed_version TEXT NOT NULL,
    git_commit TEXT,
    run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_user_id UUID REFERENCES auth.users(id),
    incomplete_user_id UUID REFERENCES auth.users(id),
    environment TEXT, -- 'ci' or 'local'
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for querying latest runs
CREATE INDEX IF NOT EXISTS idx_e2e_seed_runs_run_at ON e2e_seed_runs(run_at DESC);

-- Enable RLS
ALTER TABLE e2e_seed_runs ENABLE ROW LEVEL SECURITY;

-- Service role can access all seed run logs
CREATE POLICY "Service role can access seed runs" ON e2e_seed_runs
    FOR ALL USING (auth.role() = 'service_role');

-- Ensure unique constraint on user_platform_settings.user_id
-- This prevents duplicate settings rows and makes upsert deterministic
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'user_platform_settings'
    ) THEN
        -- Check if constraint already exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'user_platform_settings_user_id_key'
        ) THEN
            -- Add unique constraint
            ALTER TABLE user_platform_settings
            ADD CONSTRAINT user_platform_settings_user_id_key UNIQUE (user_id);

            RAISE NOTICE 'Added unique constraint on user_platform_settings.user_id';
        ELSE
            RAISE NOTICE 'Unique constraint on user_platform_settings.user_id already exists';
        END IF;
    ELSE
        RAISE NOTICE 'Table user_platform_settings does not exist, skipping constraint';
    END IF;
END $$;

-- Optional: Add partial unique index for one active dream per user
-- This prevents dream accumulation and makes inserts deterministic
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'user_dreams'
    ) THEN
        CREATE UNIQUE INDEX IF NOT EXISTS idx_user_dreams_one_active_per_user
            ON user_dreams(user_id)
            WHERE is_active = true;

        COMMENT ON INDEX idx_user_dreams_one_active_per_user IS
        'Ensures each user can have only one active dream, preventing accumulation in seed runs';

        RAISE NOTICE 'Created unique index on user_dreams.user_id where is_active = true';
    ELSE
        RAISE NOTICE 'Table user_dreams does not exist, skipping index';
    END IF;
END $$;

-- Fix metric_summary table structure if it exists with different column names
-- This handles cases where the table was created with different structure

-- First, check if the table exists and what columns it has
DO $$
BEGIN
    -- Check if date column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'metric_summary' AND column_name = 'date') THEN
        -- If the table exists but doesn't have date column, add it
        IF EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'metric_summary') THEN
            ALTER TABLE metric_summary ADD COLUMN date DATE;
            -- Update existing rows to have today's date if any exist
            UPDATE metric_summary SET date = CURRENT_DATE WHERE date IS NULL;
        END IF;
    END IF;
END $$;

-- Recreate the index that failed, but only if the date column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'metric_summary' AND column_name = 'date') THEN
        -- Drop and recreate the index to ensure it works
        DROP INDEX IF EXISTS idx_metric_summary_client_date;
        CREATE INDEX IF NOT EXISTS idx_metric_summary_client_date ON metric_summary(client_id, date DESC);
    END IF;
END $$;
-- ============================================================================
-- Verification Query for Paralegal Contract System Migration
-- Run this after applying the migration to confirm all tables exist
-- ============================================================================

-- Check that all 6 tables exist
SELECT
  tablename,
  schemaname,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'deals',
    'contracts',
    'contract_versions',
    'clause_library',
    'playbook_rules',
    'contract_templates'
  )
ORDER BY tablename;

-- Count RLS policies for each table
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'deals',
    'contracts',
    'contract_versions',
    'clause_library',
    'playbook_rules',
    'contract_templates'
  )
GROUP BY tablename
ORDER BY tablename;

-- List all indexes created
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'deals',
    'contracts',
    'contract_versions',
    'clause_library',
    'playbook_rules',
    'contract_templates'
  )
ORDER BY tablename, indexname;

-- Verify triggers
SELECT
  event_object_table as table_name,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN (
    'deals',
    'contracts',
    'clause_library',
    'playbook_rules',
    'contract_templates'
  )
ORDER BY event_object_table;

-- Summary counts
SELECT
  'Tables Created' as check_type,
  COUNT(*) as count,
  'Expected: 6' as expected
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'deals',
    'contracts',
    'contract_versions',
    'clause_library',
    'playbook_rules',
    'contract_templates'
  )

UNION ALL

SELECT
  'RLS Policies Created' as check_type,
  COUNT(*) as count,
  'Expected: 12' as expected
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'deals',
    'contracts',
    'contract_versions',
    'clause_library',
    'playbook_rules',
    'contract_templates'
  )

UNION ALL

SELECT
  'Indexes Created' as check_type,
  COUNT(*) as count,
  'Expected: 16+' as expected
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'deals',
    'contracts',
    'contract_versions',
    'clause_library',
    'playbook_rules',
    'contract_templates'
  )

UNION ALL

SELECT
  'Triggers Created' as check_type,
  COUNT(*) as count,
  'Expected: 5' as expected
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN (
    'deals',
    'contracts',
    'clause_library',
    'playbook_rules',
    'contract_templates'
  );

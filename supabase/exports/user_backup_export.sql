-- User Data Export Query
-- Purpose: Snapshot of all user emails and metadata before deletion operations
-- Date: 2025-12-29
-- DO NOT EXECUTE DESTRUCTIVE OPERATIONS WITH THIS QUERY

SELECT
  au.id AS user_id,
  au.email,
  au.created_at,
  au.last_sign_in_at,
  au.confirmed_at,
  up.role,
  up.status,
  up.full_name,
  up.created_at AS profile_created_at
FROM
  auth.users au
LEFT JOIN
  public.user_profiles up ON au.id = up.id
WHERE
  au.email IS NOT NULL
ORDER BY
  au.created_at ASC;

-- Expected columns in CSV export:
-- user_id | email | created_at | last_sign_in_at | confirmed_at | role | status | full_name | profile_created_at

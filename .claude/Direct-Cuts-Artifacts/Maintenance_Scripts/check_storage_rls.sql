-- Check current storage RLS policies for portfolio bucket
SELECT 
    name as policy_name,
    definition as policy_definition,
    action as policy_action
FROM storage.policies
WHERE bucket_id = 'portfolio'
ORDER BY name;

-- Check if barbers table has user_id column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'barbers'
AND column_name IN ('id', 'user_id', 'auth_id');

-- Check if any barber exists for test users
SELECT 
    b.id as barber_id,
    b.user_id as barber_user_id,
    u.id as user_id,
    u.role as user_role,
    u.email
FROM public.barbers b
LEFT JOIN public.users u ON u.id = b.user_id
LIMIT 5;

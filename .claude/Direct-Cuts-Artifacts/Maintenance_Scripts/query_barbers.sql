-- Query all barber accounts
SELECT
  u.id,
  u.email,
  u.full_name,
  u.phone,
  u.is_barber,
  u.created_at as user_created_at,
  u.updated_at as user_updated_at,
  b.bio,
  b.shop_name,
  b.location,
  b.latitude,
  b.longitude,
  b.subscription_tier,
  b.is_verified,
  b.created_at as barber_created_at,
  b.updated_at as barber_updated_at
FROM public.users u
LEFT JOIN public.barbers b ON u.id = b.id
WHERE u.is_barber = true
ORDER BY u.created_at DESC;

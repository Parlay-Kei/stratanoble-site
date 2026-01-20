-- Query 1: Check barbers table
SELECT id, shop_name, is_verified, onboarding_complete, profile_completion_score FROM public.barbers WHERE id = 'b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d';

-- Query 2: Check onboarding progress
SELECT current_phase, completion_score FROM public.barber_onboarding_progress WHERE barber_id = 'b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d';

-- Query 3: Check verification status
SELECT license_status, insurance_status FROM public.barber_verification_status WHERE barber_id = 'b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d';

-- Query 4: Count services
SELECT COUNT(*) as service_count FROM public.services WHERE barber_id = 'b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d';

-- Query 5: Count specialties
SELECT COUNT(*) as specialty_count FROM public.barber_specialties WHERE barber_id = 'b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d';

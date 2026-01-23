-- Verification queries for Steve Hubbard's onboarding completion
-- User ID: b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d

-- Query 1: Check barbers table for is_verified and onboarding_complete
SELECT
  id,
  shop_name,
  is_verified,
  onboarding_complete,
  onboarding_completed_at,
  profile_completion_score,
  experience_level,
  is_mobile,
  created_at,
  updated_at
FROM public.barbers
WHERE id = 'b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d';

-- Query 2: Check barber_onboarding_progress for current_phase and completion_score
SELECT
  barber_id,
  current_phase,
  phase_progress,
  completion_score,
  profile_data,
  portfolio_data,
  services_data,
  verification_data,
  availability_data,
  created_at,
  updated_at
FROM public.barber_onboarding_progress
WHERE barber_id = 'b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d';

-- Query 3: Check barber_verification_status for license_status
SELECT
  barber_id,
  license_number,
  license_state,
  license_expiry,
  license_status,
  license_verified_at,
  insurance_status,
  insurance_provider,
  insurance_policy_number,
  insurance_coverage_amount,
  insurance_expiry,
  insurance_verified_at,
  created_at,
  updated_at
FROM public.barber_verification_status
WHERE barber_id = 'b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d';

-- Query 4: Check services count for this barber
SELECT
  COUNT(*) as service_count,
  jsonb_agg(
    jsonb_build_object(
      'id', id,
      'name', name,
      'description', description,
      'price', price,
      'duration_minutes', duration_minutes
    ) ORDER BY name
  ) as services
FROM public.services
WHERE barber_id = 'b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d';

-- Query 5: Check specialties for this barber
SELECT
  COUNT(*) as specialty_count,
  jsonb_agg(
    jsonb_build_object(
      'specialty_name', specialty_name,
      'is_signature', is_signature,
      'sort_order', sort_order
    ) ORDER BY sort_order
  ) as specialties
FROM public.barber_specialties
WHERE barber_id = 'b22e6ff6-96bc-47f3-bfd9-1bbbbf14c17d';

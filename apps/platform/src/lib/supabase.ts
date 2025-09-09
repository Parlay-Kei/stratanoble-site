// Re-export Supabase client from shared utils
// This maintains consistency with the existing Strata Noble setup
export { createClient, supabase } from '@strata-noble/utils'

// Platform-specific Supabase configurations
export const PLATFORM_TABLES = {
  GOALS: 'achievery_goals',
  TASKS: 'achievery_tasks', 
  ACHIEVEMENTS: 'achievery_achievements',
  USER_ACHIEVEMENTS: 'achievery_user_achievements',
  WEEKLY_REFLECTIONS: 'achievery_weekly_reflections',
} as const

// Platform-specific database types will be defined after schema extension
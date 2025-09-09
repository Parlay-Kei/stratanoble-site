// Integrate with existing Strata Noble authentication
// This leverages the established auth system rather than creating new one

export { 
  useAuth, 
  useUser, 
  AuthProvider,
  RequireAuth 
} from '@strata-noble/utils'

// Platform-specific auth configurations
export const PLATFORM_AUTH_CONFIG = {
  redirectTo: {
    afterLogin: '/platform/dashboard',
    afterLogout: '/platform',
    onboarding: '/platform/onboarding',
  },
  permissions: {
    FREE_TIER_GOAL_LIMIT: 5,
    PRO_TIER_UNLIMITED: true,
  }
} as const

// Platform-specific user type extensions will be added after schema planning
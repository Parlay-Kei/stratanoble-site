/**
 * Feature Flags
 *
 * Centralized feature flag management for safe rollout of new features.
 * Flags are environment-based and default to false for production safety.
 */

/**
 * Check if the revenue-first site revamp is enabled
 *
 * Controls:
 * - New navigation structure with offer-first CTAs
 * - Updated hero section messaging
 * - /lead-rescue and /phase-3 offer pages
 * - Lead intake infrastructure
 *
 * @returns {boolean} True if revamp features should be shown
 */
export function isRevampEnabled(): boolean {
  // Default to false if not set (production safety)
  const enabled = process.env.NEXT_PUBLIC_REVAMP_ENABLED === 'true';

  return enabled;
}

/**
 * Get all feature flags status
 * Useful for debugging and admin panels
 *
 * @returns {object} Object with all feature flag states
 */
export function getFeatureFlags() {
  return {
    revampEnabled: isRevampEnabled(),
  };
}

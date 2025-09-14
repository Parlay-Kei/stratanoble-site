/**
 * ACHIEVERY Subscription Tiers Configuration
 * 
 * Defines what features are available at each subscription level
 * and provides utilities for checking access permissions.
 */

export type SubscriptionTier = 'lite' | 'growth' | 'partner' | 'enterprise';

export interface TierLimits {
  actions_per_week: number | 'unlimited';
  narratives_per_month: number | 'unlimited';
  analytics_history_days: number | 'unlimited';
  trust_ledger_shares: number | 'unlimited';
  coach_integrations: number | 'unlimited';
  ai_reframing: boolean;
  advanced_analytics: boolean;
  priority_support: boolean;
  custom_phases: boolean;
  export_data: boolean;
}

export interface TierFeatures {
  name: string;
  description: string;
  price_monthly: number;
  price_annually: number;
  popular: boolean;
  limits: TierLimits;
  features: string[];
  restrictions: string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierFeatures> = {
  lite: {
    name: 'Free',
    description: 'Perfect for getting started with progress tracking',
    price_monthly: 0,
    price_annually: 0,
    popular: false,
    limits: {
      actions_per_week: 5,
      narratives_per_month: 4,
      analytics_history_days: 30,
      trust_ledger_shares: 2,
      coach_integrations: 0,
      ai_reframing: true,
      advanced_analytics: false,
      priority_support: false,
      custom_phases: false,
      export_data: false,
    },
    features: [
      '5 actions per week',
      'Weekly AI-generated narratives',
      'Basic progress tracking',
      'AI reframing of activities',
      '30-day history',
      'Mobile & web access',
    ],
    restrictions: [
      'Limited to 5 actions per week',
      'Basic analytics only',
      'No data export',
      'Standard support',
    ],
  },

  growth: {
    name: 'Growth',
    description: 'Unlock unlimited tracking and advanced insights',
    price_monthly: 47,
    price_annually: 470, // 2 months free
    popular: true,
    limits: {
      actions_per_week: 25,
      narratives_per_month: 'unlimited',
      analytics_history_days: 365,
      trust_ledger_shares: 10,
      coach_integrations: 1,
      ai_reframing: true,
      advanced_analytics: true,
      priority_support: false,
      custom_phases: true,
      export_data: true,
    },
    features: [
      '25 actions per week',
      'Unlimited AI narratives',
      'Advanced analytics & insights',
      'Progress pattern recognition',
      '1-year history access',
      'Data export (CSV, PDF)',
      'Custom phase definitions',
      'Trust Ledger sharing',
      'Coach integration (1 coach)',
    ],
    restrictions: [
      'Limited to 25 actions per week',
      'Standard support response time',
    ],
  },

  partner: {
    name: 'Partner',
    description: 'For professionals working with Strata Noble consultants',
    price_monthly: 97,
    price_annually: 970, // 2 months free
    popular: false,
    limits: {
      actions_per_week: 100,
      narratives_per_month: 'unlimited',
      analytics_history_days: 'unlimited',
      trust_ledger_shares: 'unlimited',
      coach_integrations: 3,
      ai_reframing: true,
      advanced_analytics: true,
      priority_support: true,
      custom_phases: true,
      export_data: true,
    },
    features: [
      '100 actions per week',
      'Unlimited AI narratives',
      'Advanced analytics & patterns',
      'Unlimited history access',
      'Priority support',
      'Multiple coach integrations',
      'Unlimited Trust Ledger sharing',
      'Custom reporting',
      'Predictive insights',
      'Integration with Strata Noble consulting',
    ],
    restrictions: [
      'Limited to 100 actions per week',
    ],
  },

  enterprise: {
    name: 'Enterprise',
    description: 'Complete access with unlimited coaching integration',
    price_monthly: 197,
    price_annually: 1970, // 2 months free
    popular: false,
    limits: {
      actions_per_week: 'unlimited',
      narratives_per_month: 'unlimited',
      analytics_history_days: 'unlimited',
      trust_ledger_shares: 'unlimited',
      coach_integrations: 'unlimited',
      ai_reframing: true,
      advanced_analytics: true,
      priority_support: true,
      custom_phases: true,
      export_data: true,
    },
    features: [
      'Unlimited actions',
      'Unlimited AI narratives',
      'Complete analytics suite',
      'Unlimited history',
      'White-glove support',
      'Unlimited coach integrations',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'Full Strata Noble ecosystem access',
    ],
    restrictions: [],
  },
};

export class SubscriptionManager {
  /**
   * Check if user can perform an action based on their tier
   */
  static canPerformAction(
    userTier: SubscriptionTier,
    actionType: keyof TierLimits,
    currentUsage: number = 0
  ): boolean {
    const tierLimits = SUBSCRIPTION_TIERS[userTier].limits;
    const limit = tierLimits[actionType];

    if (limit === 'unlimited') return true;
    if (typeof limit === 'boolean') return limit;
    if (typeof limit === 'number') return currentUsage < limit;

    return false;
  }

  /**
   * Get usage progress for a specific limit
   */
  static getUsageProgress(
    userTier: SubscriptionTier,
    actionType: keyof TierLimits,
    currentUsage: number
  ): {
    current: number;
    limit: number | 'unlimited';
    percentage: number;
    canUpgrade: boolean;
  } {
    const tierLimits = SUBSCRIPTION_TIERS[userTier].limits;
    const limit = tierLimits[actionType];

    if (limit === 'unlimited') {
      return {
        current: currentUsage,
        limit: 'unlimited',
        percentage: 0,
        canUpgrade: false,
      };
    }

    if (typeof limit === 'number') {
      const percentage = Math.min((currentUsage / limit) * 100, 100);
      return {
        current: currentUsage,
        limit,
        percentage,
        canUpgrade: userTier !== 'enterprise',
      };
    }

    return {
      current: currentUsage,
      limit: 0,
      percentage: 100,
      canUpgrade: true,
    };
  }

  /**
   * Get next tier that would unlock a feature
   */
  static getNextTierForFeature(
    currentTier: SubscriptionTier,
    feature: keyof TierLimits
  ): SubscriptionTier | null {
    const tierOrder: SubscriptionTier[] = ['lite', 'growth', 'partner', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);

    for (let i = currentIndex + 1; i < tierOrder.length; i++) {
      const nextTier = tierOrder[i];
      const nextTierLimits = SUBSCRIPTION_TIERS[nextTier].limits;
      const currentLimits = SUBSCRIPTION_TIERS[currentTier].limits;

      // Check if next tier has better access to this feature
      if (nextTierLimits[feature] === 'unlimited' && currentLimits[feature] !== 'unlimited') {
        return nextTier;
      }

      if (
        typeof nextTierLimits[feature] === 'number' &&
        typeof currentLimits[feature] === 'number' &&
        nextTierLimits[feature] > currentLimits[feature]
      ) {
        return nextTier;
      }

      if (
        typeof nextTierLimits[feature] === 'boolean' &&
        nextTierLimits[feature] === true &&
        currentLimits[feature] === false
      ) {
        return nextTier;
      }
    }

    return null;
  }

  /**
   * Get upgrade recommendations based on usage patterns
   */
  static getUpgradeRecommendation(
    currentTier: SubscriptionTier,
    usage: {
      actions_this_week: number;
      narratives_this_month: number;
      analytics_usage: number;
      trust_ledger_usage: number;
    }
  ): {
    shouldUpgrade: boolean;
    recommendedTier: SubscriptionTier | null;
    reasons: string[];
    savings?: number;
  } {
    if (currentTier === 'enterprise') {
      return {
        shouldUpgrade: false,
        recommendedTier: null,
        reasons: [],
      };
    }

    const reasons: string[] = [];
    let recommendedTier: SubscriptionTier | null = null;

    // Check action limits
    const actionProgress = this.getUsageProgress(currentTier, 'actions_per_week', usage.actions_this_week);
    if (actionProgress.percentage > 80) {
      reasons.push(`You're using ${actionProgress.current}/${actionProgress.limit} weekly actions`);
      recommendedTier = this.getNextTierForFeature(currentTier, 'actions_per_week');
    }

    // Check analytics usage
    if (!SUBSCRIPTION_TIERS[currentTier].limits.advanced_analytics && usage.analytics_usage > 5) {
      reasons.push('Advanced analytics would provide deeper insights');
      recommendedTier = recommendedTier || this.getNextTierForFeature(currentTier, 'advanced_analytics');
    }

    // Check Trust Ledger usage
    if (usage.trust_ledger_usage > 0 && !this.canPerformAction(currentTier, 'trust_ledger_shares', usage.trust_ledger_usage)) {
      reasons.push('You need more Trust Ledger sharing capacity');
      recommendedTier = recommendedTier || this.getNextTierForFeature(currentTier, 'trust_ledger_shares');
    }

    // Calculate potential savings for annual billing
    let savings: number | undefined;
    if (recommendedTier) {
      const monthlyPrice = SUBSCRIPTION_TIERS[recommendedTier].price_monthly;
      const annualPrice = SUBSCRIPTION_TIERS[recommendedTier].price_annually;
      savings = (monthlyPrice * 12) - annualPrice;
    }

    return {
      shouldUpgrade: reasons.length > 0,
      recommendedTier,
      reasons,
      savings,
    };
  }

  /**
   * Get feature comparison between tiers
   */
  static getTierComparison(
    currentTier: SubscriptionTier,
    targetTier: SubscriptionTier
  ): {
    improvements: string[];
    newFeatures: string[];
    removedRestrictions: string[];
  } {
    const current = SUBSCRIPTION_TIERS[currentTier];
    const target = SUBSCRIPTION_TIERS[targetTier];

    const improvements: string[] = [];
    const newFeatures: string[] = [];
    const removedRestrictions: string[] = [];

    // Compare limits
    Object.keys(current.limits).forEach((key) => {
      const limitKey = key as keyof TierLimits;
      const currentLimit = current.limits[limitKey];
      const targetLimit = target.limits[limitKey];

      if (targetLimit === 'unlimited' && currentLimit !== 'unlimited') {
        improvements.push(`Unlimited ${key.replace(/_/g, ' ')}`);
      } else if (
        typeof targetLimit === 'number' &&
        typeof currentLimit === 'number' &&
        targetLimit > currentLimit
      ) {
        improvements.push(`${key.replace(/_/g, ' ')}: ${currentLimit} → ${targetLimit}`);
      } else if (
        typeof targetLimit === 'boolean' &&
        targetLimit === true &&
        currentLimit === false
      ) {
        newFeatures.push(key.replace(/_/g, ' '));
      }
    });

    // Find new features in target tier
    target.features.forEach((feature) => {
      if (!current.features.includes(feature)) {
        newFeatures.push(feature);
      }
    });

    // Find removed restrictions
    current.restrictions.forEach((restriction) => {
      if (!target.restrictions.includes(restriction)) {
        removedRestrictions.push(restriction);
      }
    });

    return {
      improvements,
      newFeatures,
      removedRestrictions,
    };
  }
}

/**
 * Hook for checking feature access in React components
 */
export const useFeatureAccess = (userTier: SubscriptionTier) => {
  return {
    canLogAction: (currentWeeklyActions: number) =>
      SubscriptionManager.canPerformAction(userTier, 'actions_per_week', currentWeeklyActions),
    
    canAccessAdvancedAnalytics: () =>
      SubscriptionManager.canPerformAction(userTier, 'advanced_analytics'),
    
    canShareTrustLedger: (currentShares: number) =>
      SubscriptionManager.canPerformAction(userTier, 'trust_ledger_shares', currentShares),
    
    canExportData: () =>
      SubscriptionManager.canPerformAction(userTier, 'export_data'),
    
    getActionProgress: (currentWeeklyActions: number) =>
      SubscriptionManager.getUsageProgress(userTier, 'actions_per_week', currentWeeklyActions),
    
    getUpgradeRecommendation: (usage: any) =>
      SubscriptionManager.getUpgradeRecommendation(userTier, usage),
  };
};

/**
 * Paywall messages for different features
 */
export const PAYWALL_MESSAGES = {
  actions_per_week: {
    title: 'Weekly Action Limit Reached',
    message: 'You\'ve logged your maximum actions for this week. Upgrade to continue tracking your progress.',
    upgradeText: 'Upgrade for unlimited actions',
  },
  advanced_analytics: {
    title: 'Advanced Analytics Available',
    message: 'Unlock detailed progress patterns and insights with advanced analytics.',
    upgradeText: 'Upgrade for analytics',
  },
  trust_ledger_shares: {
    title: 'Trust Ledger Sharing Limit',
    message: 'Share your progress with more coaches and mentors.',
    upgradeText: 'Upgrade for more sharing',
  },
  export_data: {
    title: 'Export Your Data',
    message: 'Download your progress data in CSV or PDF format.',
    upgradeText: 'Upgrade to export',
  },
  coach_integrations: {
    title: 'Coach Integration',
    message: 'Connect with Strata Noble consultants and other coaches.',
    upgradeText: 'Upgrade for coach access',
  },
} as const;
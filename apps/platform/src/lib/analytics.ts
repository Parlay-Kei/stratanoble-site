/**
 * ACHIEVERY Platform Analytics
 * Comprehensive tracking for web platform usage, conversions, and performance
 */

// Analytics Events Types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

// Success Metrics Configuration
export const ANALYTICS_GOALS = {
  week1: {
    mobileDownloads: 100,
    crossPlatformUsage: 0.25, // 25%
    notificationEngagement: 0.40, // 40%
    appStoreRating: 4.5
  },
  month1: {
    totalDownloads: 500,
    dailyActiveRetention: 0.60, // 60%
    coachConsultations: 10,
    revenueIncrease: 5000 // $5K ARR
  }
};

// Core Analytics Class
class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private platform: 'web' | 'mobile' = 'web';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession() {
    // Track session start
    this.track('session_start', {
      platform: this.platform,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      timestamp: new Date().toISOString()
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.track('user_identified', { userId });
  }

  // Core tracking method
  track(event: string, properties: Record<string, any> = {}) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        platform: this.platform,
        url: typeof window !== 'undefined' ? window.location.href : undefined
      },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    // Send to multiple analytics providers
    this.sendToProviders(analyticsEvent);
  }

  private async sendToProviders(event: AnalyticsEvent) {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event, {
        custom_parameter_1: event.properties,
        user_id: event.userId,
        session_id: event.sessionId
      });
    }

    // PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(event.event, event.properties);
    }

    // Internal analytics storage
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Mobile App Download Tracking
  trackMobileDownload(platform: 'ios' | 'android', source?: string) {
    this.track('mobile_app_download', {
      platform,
      source: source || 'web_platform',
      category: 'acquisition',
      value: 1
    });
  }

  // User Onboarding
  trackOnboardingStep(step: string, completed: boolean = true) {
    this.track('onboarding_step', {
      step,
      completed,
      category: 'onboarding'
    });
  }

  trackOnboardingCompleted(timeToComplete: number) {
    this.track('onboarding_completed', {
      timeToComplete,
      category: 'onboarding',
      value: 1
    });
  }

  // Action Logging
  async trackActionLogged(category: string, actionType?: string) {
    const dailyStreak = await this.getDailyStreak();
    this.track('action_logged', {
      category,
      actionType,
      dailyStreak,
      category_activity: 'engagement'
    });
  }

  // Cross-Platform Usage
  trackCrossPlatformSync(syncType: 'web_to_mobile' | 'mobile_to_web') {
    this.track('cross_platform_sync', {
      syncType,
      category: 'engagement',
      value: 1
    });
  }

  async trackCrossPlatformUsage() {
    const [hasWebUsage, hasMobileUsage] = await Promise.all([
      this.hasWebUsage(),
      this.hasMobileUsage()
    ]);

    this.track('cross_platform_usage', {
      hasWebUsage,
      hasMobileUsage,
      category: 'engagement'
    });
  }

  // Coach Dashboard
  trackCoachDashboardAccess(coachId?: string) {
    this.track('coach_dashboard_access', {
      coachId,
      category: 'coach_engagement',
      value: 1
    });
  }

  trackTrustLedgerShared(shareLevel: 'summary' | 'detailed' | 'full', coachEmail?: string) {
    this.track('trust_ledger_shared', {
      shareLevel,
      coachEmail,
      category: 'coach_engagement',
      value: 1
    });
  }

  // Subscription & Revenue
  trackTierConversion(fromTier: string, toTier: string, revenue: number) {
    this.track('tier_conversion', {
      fromTier,
      toTier,
      revenue,
      category: 'revenue',
      value: revenue
    });
  }

  trackSubscriptionEvent(eventType: 'upgrade' | 'downgrade' | 'cancel' | 'renew', tier: string, revenue?: number) {
    this.track('subscription_event', {
      eventType,
      tier,
      revenue,
      category: 'revenue',
      value: revenue || 0
    });
  }

  // Performance Tracking
  trackPageLoad(page: string, loadTime: number) {
    this.track('page_load', {
      page,
      loadTime,
      category: 'performance',
      value: loadTime
    });
  }

  trackAPICall(endpoint: string, duration: number, success: boolean) {
    this.track('api_call', {
      endpoint,
      duration,
      success,
      category: 'performance',
      value: duration
    });
  }

  // AI & Features
  trackAIReframing(success: boolean, duration: number, actionCategory?: string) {
    this.track('ai_reframing', {
      success,
      duration,
      actionCategory,
      category: 'ai_engagement',
      value: duration
    });
  }

  trackWeeklyNarrativeGenerated(wordCount: number, generationTime: number) {
    this.track('weekly_narrative_generated', {
      wordCount,
      generationTime,
      category: 'ai_engagement',
      value: generationTime
    });
  }

  // Error Tracking
  trackError(error: Error, context?: string) {
    this.track('error_occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      category: 'error'
    });
  }

  // Conversion Funnels
  trackFunnelStep(funnel: string, step: string, stepNumber: number) {
    this.track('funnel_step', {
      funnel,
      step,
      stepNumber,
      category: 'conversion'
    });
  }

  // Helper methods
  private async getDailyStreak(): Promise<number> {
    if (!this.userId) return 0;

    try {
      const response = await fetch('/api/analytics/user-streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId })
      });
      const data = await response.json();
      return data.streak || 0;
    } catch {
      return 0;
    }
  }

  private async hasWebUsage(): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const response = await fetch('/api/analytics/platform-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId, platform: 'web' })
      });
      const data = await response.json();
      return data.hasUsage || false;
    } catch {
      return false;
    }
  }

  private async hasMobileUsage(): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const response = await fetch('/api/analytics/platform-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId, platform: 'mobile' })
      });
      const data = await response.json();
      return data.hasUsage || false;
    } catch {
      return false;
    }
  }

  // Success Metrics Calculation
  async calculateSuccessMetrics() {
    const [week1Progress, month1Progress] = await Promise.all([
      this.calculateWeek1Progress(),
      this.calculateMonth1Progress()
    ]);

    return {
      week1Progress,
      month1Progress,
      goalAttainment: this.calculateGoalAttainment(week1Progress, month1Progress)
    };
  }

  private async calculateWeek1Progress() {
    try {
      const response = await fetch('/api/analytics/week1-metrics');
      const data = await response.json();

      return {
        mobileDownloads: data.mobileDownloads || 0,
        crossPlatformUsage: data.crossPlatformUsage || 0,
        notificationEngagement: data.notificationEngagement || 0,
        appStoreRating: data.appStoreRating || 0
      };
    } catch {
      return {
        mobileDownloads: 0,
        crossPlatformUsage: 0,
        notificationEngagement: 0,
        appStoreRating: 0
      };
    }
  }

  private async calculateMonth1Progress() {
    try {
      const response = await fetch('/api/analytics/month1-metrics');
      const data = await response.json();

      return {
        totalDownloads: data.totalDownloads || 0,
        dailyActiveRetention: data.dailyActiveRetention || 0,
        coachConsultations: data.coachConsultations || 0,
        revenueIncrease: data.revenueIncrease || 0
      };
    } catch {
      return {
        totalDownloads: 0,
        dailyActiveRetention: 0,
        coachConsultations: 0,
        revenueIncrease: 0
      };
    }
  }

  private calculateGoalAttainment(week1: any, month1: any) {
    const week1Score = (
      (week1.mobileDownloads / ANALYTICS_GOALS.week1.mobileDownloads) +
      (week1.crossPlatformUsage / ANALYTICS_GOALS.week1.crossPlatformUsage) +
      (week1.notificationEngagement / ANALYTICS_GOALS.week1.notificationEngagement) +
      (week1.appStoreRating / ANALYTICS_GOALS.week1.appStoreRating)
    ) / 4;

    const month1Score = (
      (month1.totalDownloads / ANALYTICS_GOALS.month1.totalDownloads) +
      (month1.dailyActiveRetention / ANALYTICS_GOALS.month1.dailyActiveRetention) +
      (month1.coachConsultations / ANALYTICS_GOALS.month1.coachConsultations) +
      (month1.revenueIncrease / ANALYTICS_GOALS.month1.revenueIncrease)
    ) / 4;

    return {
      week1Score: Math.min(week1Score * 100, 100),
      month1Score: Math.min(month1Score * 100, 100),
      overallScore: Math.min(((week1Score + month1Score) / 2) * 100, 100)
    };
  }
}

// Global analytics instance
export const analytics = new AnalyticsService();

// Convenience functions
export const trackMobileDownload = (platform: 'ios' | 'android', source?: string) =>
  analytics.trackMobileDownload(platform, source);

export const trackActionLogged = (category: string, actionType?: string) =>
  analytics.trackActionLogged(category, actionType);

export const trackCoachDashboardAccess = (coachId?: string) =>
  analytics.trackCoachDashboardAccess(coachId);

export const trackTierConversion = (fromTier: string, toTier: string, revenue: number) =>
  analytics.trackTierConversion(fromTier, toTier, revenue);

export const trackError = (error: Error, context?: string) =>
  analytics.trackError(error, context);

// React Hook for Analytics
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    trackMobileDownload,
    trackActionLogged,
    trackCoachDashboardAccess,
    trackTierConversion,
    trackError
  };
};

// TypeScript declarations for global analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    posthog: {
      capture: (event: string, properties: Record<string, any>) => void;
    };
  }
}

export default analytics;
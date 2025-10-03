import { useEffect, useCallback } from 'react';
import { analytics, trackAchieveryEvents, AchieveryEventParams } from '../lib/analytics';

/**
 * Custom hook for ACHIEVERY analytics tracking
 * Provides easy-to-use analytics functions for React Native components
 */
export const useAnalytics = () => {
  // Initialize analytics on hook mount
  useEffect(() => {
    analytics.initialize();
  }, []);

  // Generic event tracking function
  const trackEvent = useCallback(async (
    action: string, 
    params?: AchieveryEventParams
  ) => {
    try {
      await analytics.trackAchieveryAction(action, params);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, []);

  // Specific ACHIEVERY event tracking functions
  const trackGoalCreated = useCallback(async (goalType: string, priority: string) => {
    await trackAchieveryEvents.goalCreated(goalType, priority);
  }, []);

  const trackGoalCompleted = useCallback(async (goalId: string, timeToComplete: number) => {
    await trackAchieveryEvents.goalCompleted(goalId, timeToComplete);
  }, []);

  const trackProgressUpdate = useCallback(async (percentage: number) => {
    await trackAchieveryEvents.progressUpdated(percentage);
  }, []);

  const trackMilestone = useCallback(async (milestoneType: string) => {
    await trackAchieveryEvents.milestoneReached(milestoneType);
  }, []);

  const trackFeatureUsage = useCallback(async (featureName: string) => {
    await trackAchieveryEvents.featureUsed(featureName);
  }, []);

  const trackUserRetention = useCallback(async (daysActive: number) => {
    await trackAchieveryEvents.userRetention(daysActive);
  }, []);

  const trackSubscription = useCallback(async (
    eventType: 'upgrade' | 'downgrade' | 'cancel', 
    tier: string
  ) => {
    await trackAchieveryEvents.subscriptionEvent(eventType, tier);
  }, []);

  // Screen view tracking
  const trackScreenView = useCallback(async (screenName: string) => {
    await trackEvent('screen_view', {
      event_category: 'navigation',
      event_label: screenName,
      value: 1,
    });
  }, [trackEvent]);

  // Button/interaction tracking
  const trackButtonPress = useCallback(async (buttonName: string, screenName?: string) => {
    await trackEvent('button_press', {
      event_category: 'user_interaction',
      event_label: buttonName,
      value: 1,
      custom_parameter: screenName,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackGoalCreated,
    trackGoalCompleted,
    trackProgressUpdate,
    trackMilestone,
    trackFeatureUsage,
    trackUserRetention,
    trackSubscription,
    trackScreenView,
    trackButtonPress,
  };
};

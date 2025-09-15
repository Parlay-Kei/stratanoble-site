/**
 * ACHIEVERY Mobile Analytics
 * Comprehensive tracking for mobile app usage, performance, and cross-platform sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Analytics Event Types
export interface MobileAnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
  platform: 'ios' | 'android';
  deviceInfo: DeviceInfo;
}

interface DeviceInfo {
  platform: string;
  version: string;
  model: string;
  isTablet: boolean;
}

// Mobile Analytics Service
class MobileAnalyticsService {
  private sessionId: string;
  private userId?: string;
  private deviceInfo: DeviceInfo;
  private sessionStartTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.deviceInfo = this.getDeviceInfo();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `mobile_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      platform: Platform.OS,
      version: Platform.Version.toString(),
      model: 'Unknown', // Would use react-native-device-info in production
      isTablet: false // Would use react-native-device-info in production
    };
  }

  private async initializeSession() {
    // Restore user ID from storage
    try {
      const storedUserId = await AsyncStorage.getItem('analytics_user_id');
      if (storedUserId) {
        this.userId = storedUserId;
      }
    } catch (error) {
      console.warn('Failed to restore user ID:', error);
    }

    // Track session start
    this.track('mobile_session_start', {
      platform: Platform.OS,
      deviceInfo: this.deviceInfo,
      isFirstLaunch: await this.isFirstLaunch()
    });
  }

  async setUserId(userId: string) {
    this.userId = userId;
    try {
      await AsyncStorage.setItem('analytics_user_id', userId);
    } catch (error) {
      console.warn('Failed to store user ID:', error);
    }
    this.track('mobile_user_identified', { userId });
  }

  // Core tracking method
  track(event: string, properties: Record<string, any> = {}) {
    const analyticsEvent: MobileAnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionDuration: Date.now() - this.sessionStartTime
      },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      platform: Platform.OS as 'ios' | 'android',
      deviceInfo: this.deviceInfo
    };

    // Send to analytics providers
    this.sendToProviders(analyticsEvent);
  }

  private async sendToProviders(event: MobileAnalyticsEvent) {
    // Store locally for offline support
    await this.storeEventLocally(event);

    // Send to remote analytics
    try {
      // Use the correct analytics endpoint
      const response = await fetch('https://stratanoble.com/api/analytics/mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `ACHIEVERY-Mobile/${Platform.OS}/${Platform.Version}`
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Analytics API returned ${response.status}`);
      }

      // Track successful sync
      if (event.event !== 'analytics_sync_success') {
        await this.storeEventLocally({
          ...event,
          event: 'analytics_sync_success',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('Mobile analytics tracking failed:', error);
      // Event is already stored locally for retry
    }
  }

  private async storeEventLocally(event: MobileAnalyticsEvent) {
    try {
      const existingEvents = await AsyncStorage.getItem('pending_analytics_events');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      events.push(event);

      // Keep only last 100 events to manage storage
      const recentEvents = events.slice(-100);
      await AsyncStorage.setItem('pending_analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to store analytics event locally:', error);
    }
  }

  // App Lifecycle Events
  trackAppLaunch(launchType: 'cold' | 'warm' | 'hot') {
    this.track('mobile_app_launch', {
      launchType,
      category: 'app_lifecycle',
      value: 1
    });
  }

  trackAppBackground() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    this.track('mobile_app_background', {
      sessionDuration,
      category: 'app_lifecycle'
    });
  }

  trackAppForeground() {
    this.track('mobile_app_foreground', {
      category: 'app_lifecycle'
    });
  }

  // User Actions
  trackActionLogged(category: string, actionType?: string) {
    this.track('mobile_action_logged', {
      category,
      actionType,
      platform: 'mobile',
      category_activity: 'engagement',
      timestamp_local: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  }

  trackScreenView(screenName: string, previousScreen?: string) {
    this.track('mobile_screen_view', {
      screenName,
      previousScreen,
      category: 'navigation'
    });
  }

  // Cross-Platform Features
  trackCrossPlatformSync(syncType: 'mobile_to_web' | 'web_to_mobile', dataType: string) {
    this.track('mobile_cross_platform_sync', {
      syncType,
      dataType,
      category: 'cross_platform',
      value: 1
    });
  }

  trackDeepLinkOpened(url: string, source: 'web' | 'notification' | 'external') {
    this.track('mobile_deep_link_opened', {
      url,
      source,
      category: 'cross_platform'
    });
  }

  // Push Notifications
  trackNotificationReceived(notificationType: string) {
    this.track('mobile_notification_received', {
      notificationType,
      category: 'notifications'
    });
  }

  trackNotificationEngagement(notificationType: string, action: 'opened' | 'dismissed') {
    this.track('mobile_notification_engagement', {
      notificationType,
      action,
      category: 'notifications',
      value: action === 'opened' ? 1 : 0
    });
  }

  // Offline Functionality
  trackOfflineUsage(action: string, duration: number) {
    this.track('mobile_offline_usage', {
      action,
      duration,
      category: 'offline',
      value: duration
    });
  }

  trackDataSync(syncDirection: 'upload' | 'download', recordCount: number, success: boolean) {
    this.track('mobile_data_sync', {
      syncDirection,
      recordCount,
      success,
      category: 'offline',
      value: recordCount
    });
  }

  // Performance Tracking
  trackScreenLoadTime(screenName: string, loadTime: number) {
    this.track('mobile_screen_load_time', {
      screenName,
      loadTime,
      category: 'performance',
      value: loadTime
    });
  }

  trackAPICall(endpoint: string, duration: number, success: boolean) {
    this.track('mobile_api_call', {
      endpoint,
      duration,
      success,
      category: 'performance',
      value: duration
    });
  }

  // User Engagement
  trackDailyStreakUpdate(streakCount: number, action: 'maintained' | 'broken' | 'started') {
    this.track('mobile_daily_streak', {
      streakCount,
      action,
      category: 'engagement',
      value: streakCount
    });
  }

  trackProgressShare(shareType: 'social' | 'coach' | 'export') {
    this.track('mobile_progress_share', {
      shareType,
      category: 'engagement',
      value: 1
    });
  }

  // Error Tracking
  trackError(error: Error, context?: string, isFatal: boolean = false) {
    this.track('mobile_error_occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      isFatal,
      category: 'error'
    });
  }

  trackCrash(crashInfo: any) {
    this.track('mobile_app_crash', {
      crashInfo,
      category: 'error',
      value: 1
    });
  }

  // Feature Usage
  trackFeatureUsage(featureName: string, usageCount: number = 1) {
    this.track('mobile_feature_usage', {
      featureName,
      usageCount,
      category: 'feature_usage',
      value: usageCount
    });
  }

  // Onboarding
  trackOnboardingStep(step: string, completed: boolean = true) {
    this.track('mobile_onboarding_step', {
      step,
      completed,
      category: 'onboarding'
    });
  }

  trackOnboardingCompleted(timeToComplete: number) {
    this.track('mobile_onboarding_completed', {
      timeToComplete,
      category: 'onboarding',
      value: 1
    });
  }

  // Subscription Events
  trackSubscriptionViewed(tier: string) {
    this.track('mobile_subscription_viewed', {
      tier,
      category: 'subscription'
    });
  }

  trackSubscriptionUpgrade(fromTier: string, toTier: string) {
    this.track('mobile_subscription_upgrade', {
      fromTier,
      toTier,
      category: 'subscription',
      value: 1
    });
  }

  // Utility Methods
  private async isFirstLaunch(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem('has_launched_before');
      if (!hasLaunched) {
        await AsyncStorage.setItem('has_launched_before', 'true');
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Sync pending events when online
  async syncPendingEvents() {
    try {
      const pendingEvents = await AsyncStorage.getItem('pending_analytics_events');
      if (pendingEvents) {
        const events = JSON.parse(pendingEvents);

        // Send events in batches to avoid overwhelming the server
        const batchSize = 10;
        const batches = [];
        for (let i = 0; i < events.length; i += batchSize) {
          batches.push(events.slice(i, i + batchSize));
        }

        let successfulBatches = 0;
        for (const batch of batches) {
          try {
            const response = await fetch('https://stratanoble.com/api/analytics/mobile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': `ACHIEVERY-Mobile/${Platform.OS}/${Platform.Version}`,
                'X-Batch-Sync': 'true'
              },
              body: JSON.stringify({ events: batch })
            });

            if (response.ok) {
              successfulBatches++;
            }
          } catch (batchError) {
            console.warn('Failed to sync batch:', batchError);
          }
        }

        // Only clear events if all batches were successful
        if (successfulBatches === batches.length) {
          await AsyncStorage.removeItem('pending_analytics_events');

          this.track('mobile_pending_events_synced', {
            eventCount: events.length,
            batchCount: batches.length,
            category: 'system'
          });
        } else {
          console.warn(`Only ${successfulBatches}/${batches.length} batches synced successfully`);
        }
      }
    } catch (error) {
      console.warn('Failed to sync pending events:', error);
    }
  }

  // Get analytics summary
  async getAnalyticsSummary() {
    try {
      const userId = await AsyncStorage.getItem('analytics_user_id');
      const pendingEvents = await AsyncStorage.getItem('pending_analytics_events');
      const events = pendingEvents ? JSON.parse(pendingEvents) : [];

      return {
        userId,
        sessionId: this.sessionId,
        pendingEventCount: events.length,
        sessionDuration: Date.now() - this.sessionStartTime,
        deviceInfo: this.deviceInfo
      };
    } catch (error) {
      return null;
    }
  }
}

// Global mobile analytics instance
export const mobileAnalytics = new MobileAnalyticsService();

// Convenience functions
export const trackAppLaunch = (launchType: 'cold' | 'warm' | 'hot') =>
  mobileAnalytics.trackAppLaunch(launchType);

export const trackActionLogged = (category: string, actionType?: string) =>
  mobileAnalytics.trackActionLogged(category, actionType);

export const trackScreenView = (screenName: string, previousScreen?: string) =>
  mobileAnalytics.trackScreenView(screenName, previousScreen);

export const trackNotificationEngagement = (notificationType: string, action: 'opened' | 'dismissed') =>
  mobileAnalytics.trackNotificationEngagement(notificationType, action);

export const trackCrossPlatformSync = (syncType: 'mobile_to_web' | 'web_to_mobile', dataType: string) =>
  mobileAnalytics.trackCrossPlatformSync(syncType, dataType);

export const trackError = (error: Error, context?: string, isFatal?: boolean) =>
  mobileAnalytics.trackError(error, context, isFatal);

// React Native Hook for Analytics
export const useMobileAnalytics = () => {
  return {
    track: mobileAnalytics.track.bind(mobileAnalytics),
    setUserId: mobileAnalytics.setUserId.bind(mobileAnalytics),
    trackAppLaunch,
    trackActionLogged,
    trackScreenView,
    trackNotificationEngagement,
    trackCrossPlatformSync,
    trackError,
    syncPendingEvents: mobileAnalytics.syncPendingEvents.bind(mobileAnalytics),
    getAnalyticsSummary: mobileAnalytics.getAnalyticsSummary.bind(mobileAnalytics)
  };
};

export default mobileAnalytics;
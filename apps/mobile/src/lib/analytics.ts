/**
 * Google Analytics 4 (GA4) tracking utilities for ACHIEVERY Mobile App
 * Tracking ID: G-0TGKD1S1HB
 */

// Define custom event types for ACHIEVERY app
export interface AchieveryEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameter?: string | undefined;
}

export interface UserProperties {
  user_tier?: string;
  app_version?: string;
  platform?: string;
}

// GA4 tracking class for mobile app
class Analytics {
  private trackingId = 'G-0TGKD1S1HB';
  private isInitialized = false;

  /**
   * Initialize GA4 tracking
   */
  async initialize(): Promise<void> {
    try {
      // For React Native/Expo, we'll use fetch to send events to GA4 Measurement Protocol
      this.isInitialized = true;
      console.log('GA4 Analytics initialized for ACHIEVERY Mobile');
    } catch (error) {
      console.error('Failed to initialize GA4 Analytics:', error);
    }
  }

  /**
   * Track custom ACHIEVERY app events
   */
  async trackAchieveryAction(
    action: string,
    params: AchieveryEventParams = {}
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const eventData = {
      event_name: 'achievery_action',
      event_category: params.event_category || 'engagement',
      event_label: params.event_label || action,
      value: params.value || 1,
      custom_parameter: params.custom_parameter,
    };

    await this.sendEvent('achievery_action', eventData);
  }

  /**
   * Track specific ACHIEVERY interactions
   */
  async trackGoalCreated(goalType: string, priority: string): Promise<void> {
    await this.trackAchieveryAction('goal_created', {
      event_category: 'goal_management',
      event_label: `${goalType}_${priority}`,
      value: 1,
      custom_parameter: goalType,
    });
  }

  async trackGoalCompleted(goalId: string, timeToComplete: number): Promise<void> {
    await this.trackAchieveryAction('goal_completed', {
      event_category: 'achievement',
      event_label: 'goal_completion',
      value: timeToComplete,
      custom_parameter: goalId,
    });
  }

  async trackProgressUpdate(progressPercentage: number): Promise<void> {
    await this.trackAchieveryAction('progress_updated', {
      event_category: 'engagement',
      event_label: 'progress_tracking',
      value: progressPercentage,
    });
  }

  async trackMilestoneReached(milestoneType: string): Promise<void> {
    await this.trackAchieveryAction('milestone_reached', {
      event_category: 'achievement',
      event_label: milestoneType,
      value: 1,
    });
  }

  async trackFeatureUsed(featureName: string): Promise<void> {
    await this.trackAchieveryAction('feature_used', {
      event_category: 'feature_engagement',
      event_label: featureName,
      value: 1,
    });
  }

  async trackUserRetention(daysActive: number): Promise<void> {
    await this.trackAchieveryAction('user_retention', {
      event_category: 'retention',
      event_label: 'days_active',
      value: daysActive,
    });
  }

  async trackSubscriptionEvent(eventType: 'upgrade' | 'downgrade' | 'cancel', tier: string): Promise<void> {
    await this.trackAchieveryAction('subscription_event', {
      event_category: 'monetization',
      event_label: `${eventType}_${tier}`,
      value: 1,
      custom_parameter: tier,
    });
  }

  /**
   * Set user properties for better segmentation
   */
  async setUserProperties(properties: UserProperties): Promise<void> {
    // Store user properties for inclusion in future events
    console.log('User properties set:', properties);
  }

  /**
   * Send event to GA4 using Measurement Protocol
   */
  private async sendEvent(eventName: string, parameters: any): Promise<void> {
    try {
      // For production, you would implement the GA4 Measurement Protocol
      // For now, we'll log the events for development
      console.log('GA4 Event Tracked:', {
        event: eventName,
        parameters,
        timestamp: new Date().toISOString(),
      });

      // In production, you would send to GA4 Measurement Protocol:
      // const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${this.trackingId}&api_secret=${API_SECRET}`, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     client_id: await this.getClientId(),
      //     events: [{
      //       name: eventName,
      //       params: parameters
      //     }]
      //   })
      // });
    } catch (error) {
      console.error('Failed to send GA4 event:', error);
    }
  }

  /**
   * Generate or retrieve client ID for user identification
   */
  private async getClientId(): Promise<string> {
    // In a real implementation, you'd generate and store a unique client ID
    return 'mobile_client_' + Date.now();
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Convenience functions for common ACHIEVERY events
export const trackAchieveryEvents = {
  goalCreated: (goalType: string, priority: string) => 
    analytics.trackGoalCreated(goalType, priority),
  
  goalCompleted: (goalId: string, timeToComplete: number) => 
    analytics.trackGoalCompleted(goalId, timeToComplete),
  
  progressUpdated: (percentage: number) => 
    analytics.trackProgressUpdate(percentage),
  
  milestoneReached: (type: string) => 
    analytics.trackMilestoneReached(type),
  
  featureUsed: (feature: string) => 
    analytics.trackFeatureUsed(feature),
  
  userRetention: (days: number) => 
    analytics.trackUserRetention(days),
  
  subscriptionEvent: (eventType: 'upgrade' | 'downgrade' | 'cancel', tier: string) => 
    analytics.trackSubscriptionEvent(eventType, tier),
};

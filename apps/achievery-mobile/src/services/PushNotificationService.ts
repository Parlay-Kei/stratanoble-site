import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationSchedule {
  type: 'streak_reminder' | 'goal_checkin' | 'weekly_narrative' | 'milestone_celebration';
  title: string;
  body: string;
  data?: any;
  trigger: Notifications.NotificationTriggerInput;
}

class PushNotificationService {
  private expoPushToken: string | null = null;

  async initialize(): Promise<string | null> {
    try {
      // Check if device supports push notifications
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Get existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }

      // Get the push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      console.log('Expo push token:', this.expoPushToken);

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  private async setupAndroidChannels() {
    // Streak reminders channel
    await Notifications.setNotificationChannelAsync('streak-reminders', {
      name: 'Streak Reminders',
      description: 'Daily reminders to maintain your action streak',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#50C878',
      sound: 'default',
    });

    // Goal check-ins channel
    await Notifications.setNotificationChannelAsync('goal-checkins', {
      name: 'Goal Check-ins',
      description: 'Weekly goal progress check-ins',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
      sound: 'default',
    });

    // Weekly narratives channel
    await Notifications.setNotificationChannelAsync('weekly-narratives', {
      name: 'Weekly Narratives',
      description: 'AI-generated weekly progress summaries',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#8B5CF6',
      sound: 'default',
    });

    // Milestone celebrations channel
    await Notifications.setNotificationChannelAsync('milestones', {
      name: 'Milestone Celebrations',
      description: 'Celebrate your achievements and milestones',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
      sound: 'default',
    });
  }

  async scheduleStreakReminder(hour: number = 20, minute: number = 0): Promise<string | null> {
    try {
      // Cancel existing streak reminders
      await this.cancelNotificationsByType('streak_reminder');

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Keep Your Streak Alive!',
          body: "Don't break your momentum - log today's progress in ACHIEVERY",
          data: { type: 'streak_reminder' },
          sound: 'default',
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      console.log('Streak reminder scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling streak reminder:', error);
      return null;
    }
  }

  async scheduleWeeklyGoalCheckin(dayOfWeek: number = 0, hour: number = 10): Promise<string | null> {
    try {
      // Cancel existing goal check-ins
      await this.cancelNotificationsByType('goal_checkin');

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Weekly Goal Check-in',
          body: 'How did you progress toward your goals this week?',
          data: { type: 'goal_checkin' },
          sound: 'default',
        },
        trigger: {
          weekday: dayOfWeek + 1, // Expo uses 1-7 for Sunday-Saturday
          hour,
          minute: 0,
          repeats: true,
        },
      });

      console.log('Weekly goal check-in scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling weekly goal check-in:', error);
      return null;
    }
  }

  async scheduleWeeklyNarrative(dayOfWeek: number = 0, hour: number = 9): Promise<string | null> {
    try {
      // Cancel existing weekly narratives
      await this.cancelNotificationsByType('weekly_narrative');

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Your Weekly Progress Story',
          body: 'Your AI-generated progress narrative is ready to review',
          data: { type: 'weekly_narrative' },
          sound: 'default',
        },
        trigger: {
          weekday: dayOfWeek + 1,
          hour,
          minute: 0,
          repeats: true,
        },
      });

      console.log('Weekly narrative scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling weekly narrative:', error);
      return null;
    }
  }

  async scheduleMilestoneCelebration(title: string, body: string, delaySeconds: number = 0): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎉 ${title}`,
          body,
          data: { type: 'milestone_celebration' },
          sound: 'default',
        },
        trigger: {
          seconds: delaySeconds,
        },
      });

      console.log('Milestone celebration scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling milestone celebration:', error);
      return null;
    }
  }

  async cancelNotificationsByType(type: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const notificationsToCancel = scheduledNotifications
        .filter(notification => notification.content.data?.type === type)
        .map(notification => notification.identifier);

      if (notificationsToCancel.length > 0) {
        await Notifications.cancelScheduledNotificationsAsync(notificationsToCancel);
        console.log(`Cancelled ${notificationsToCancel.length} notifications of type: ${type}`);
      }
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All scheduled notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Setup notification listeners
  setupNotificationListeners() {
    // Handle notification received while app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    // Handle notification response (user tapped notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      const notificationType = response.notification.request.content.data?.type;
      
      // Handle different notification types
      switch (notificationType) {
        case 'streak_reminder':
          // Navigate to activity logging screen
          break;
        case 'goal_checkin':
          // Navigate to goals screen
          break;
        case 'weekly_narrative':
          // Navigate to narratives screen
          break;
        case 'milestone_celebration':
          // Navigate to achievements screen
          break;
        default:
          // Navigate to dashboard
          break;
      }
    });

    return {
      foregroundSubscription,
      responseSubscription,
    };
  }

  // Cleanup listeners
  removeNotificationListeners(subscriptions: { foregroundSubscription: any; responseSubscription: any }) {
    subscriptions.foregroundSubscription?.remove();
    subscriptions.responseSubscription?.remove();
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;

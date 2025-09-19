import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AsyncStorageService, STORAGE_KEYS } from './StorageService';

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  waterReminders: boolean;
  waterReminderInterval: number; // in minutes
  sleepReminders: boolean;
  sleepReminderTime: string; // HH:MM format
  workoutReminders: boolean;
  workoutReminderTimes: string[]; // Array of HH:MM format times
  mealReminders: boolean;
  mealReminderTimes: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  stepGoalReminders: boolean;
  stepGoalReminderTime: string; // HH:MM format
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  waterReminders: true,
  waterReminderInterval: 120, // 2 hours
  sleepReminders: true,
  sleepReminderTime: '22:00',
  workoutReminders: true,
  workoutReminderTimes: ['08:00', '18:00'],
  mealReminders: true,
  mealReminderTimes: {
    breakfast: '08:00',
    lunch: '12:30',
    dinner: '19:00',
  },
  stepGoalReminders: true,
  stepGoalReminderTime: '20:00',
};

export class NotificationService {
  private static settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;

  // Initialize notification service
  static async initialize(): Promise<void> {
    try {
      // Request permissions
      await this.requestPermissions();

      // Load saved settings
      const savedSettings = await AsyncStorageService.getItem<NotificationSettings>(
        STORAGE_KEYS.APP_SETTINGS
      );

      if (savedSettings) {
        this.settings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...savedSettings };
      }

      // Schedule all enabled notifications
      if (this.settings.enabled) {
        await this.scheduleAllNotifications();
      }

      console.log('NotificationService initialized');
    } catch (error) {
      console.error('Error initializing NotificationService:', error);
    }
  }

  // Request notification permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Update notification settings
  static async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...newSettings };

      await AsyncStorageService.setItem(STORAGE_KEYS.APP_SETTINGS, this.settings);

      // Cancel all notifications and reschedule if enabled
      await this.cancelAllNotifications();

      if (this.settings.enabled) {
        await this.scheduleAllNotifications();
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  // Get current settings
  static getSettings(): NotificationSettings {
    return this.settings;
  }

  // Schedule all notifications
  private static async scheduleAllNotifications(): Promise<void> {
    try {
      if (this.settings.waterReminders) {
        await this.scheduleWaterReminders();
      }

      if (this.settings.sleepReminders) {
        await this.scheduleSleepReminder();
      }

      if (this.settings.workoutReminders) {
        await this.scheduleWorkoutReminders();
      }

      if (this.settings.mealReminders) {
        await this.scheduleMealReminders();
      }

      if (this.settings.stepGoalReminders) {
        await this.scheduleStepGoalReminder();
      }

      console.log('All notifications scheduled');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  // Schedule water reminders
  private static async scheduleWaterReminders(): Promise<void> {
    const now = new Date();
    const startHour = 8; // 8 AM
    const endHour = 22; // 10 PM
    const intervalMinutes = this.settings.waterReminderInterval;

    for (let hour = startHour; hour <= endHour; hour += Math.floor(intervalMinutes / 60)) {
      const triggerTime = new Date();
      triggerTime.setHours(hour, intervalMinutes % 60, 0, 0);

      if (triggerTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '💧 Time to Hydrate!',
            body: 'Don\'t forget to drink a glass of water to stay healthy.',
            sound: 'default',
          },
          trigger: {
            hour: triggerTime.getHours(),
            minute: triggerTime.getMinutes(),
            repeats: true,
          } as any,
        });
      }
    }
  }

  // Schedule sleep reminder
  private static async scheduleSleepReminder(): Promise<void> {
    const [hours, minutes] = this.settings.sleepReminderTime.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Time for Bed',
        body: 'Consider winding down for a good night\'s sleep.',
        sound: 'default',
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      } as any,
    });
  }

  // Schedule workout reminders
  private static async scheduleWorkoutReminders(): Promise<void> {
    for (const time of this.settings.workoutReminderTimes) {
      const [hours, minutes] = time.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💪 Workout Time!',
          body: 'Time to get moving and stay active.',
          sound: 'default',
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        } as any,
      });
    }
  }

  // Schedule meal reminders
  private static async scheduleMealReminders(): Promise<void> {
    const meals = [
      { name: 'Breakfast', time: this.settings.mealReminderTimes.breakfast, emoji: '🍳' },
      { name: 'Lunch', time: this.settings.mealReminderTimes.lunch, emoji: '🥗' },
      { name: 'Dinner', time: this.settings.mealReminderTimes.dinner, emoji: '🍽️' },
    ];

    for (const meal of meals) {
      const [hours, minutes] = meal.time.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${meal.emoji} ${meal.name} Time`,
          body: `Don't forget to log your ${meal.name.toLowerCase()}.`,
          sound: 'default',
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        } as any,
      });
    }
  }

  // Schedule step goal reminder
  private static async scheduleStepGoalReminder(): Promise<void> {
    const [hours, minutes] = this.settings.stepGoalReminderTime.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '👟 Step Goal Check',
        body: 'How are you doing with your step goal today?',
        sound: 'default',
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      } as any,
    });
  }

  // Send immediate notification
  static async sendNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Send achievement notification
  static async sendAchievementNotification(achievement: string): Promise<void> {
    await this.sendNotification(
      '🎉 Achievement Unlocked!',
      `Congratulations! You've ${achievement}.`
    );
  }

  // Send goal completion notification
  static async sendGoalCompletionNotification(goalType: string): Promise<void> {
    const emojis = {
      steps: '👟',
      water: '💧',
      calories: '🔥',
      sleep: '💤',
      workout: '💪',
    };

    const emoji = emojis[goalType as keyof typeof emojis] || '🎯';

    await this.sendNotification(
      `${emoji} Goal Achieved!`,
      `Great job! You've reached your ${goalType} goal for today.`
    );
  }

  // Cancel all scheduled notifications
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  // Cancel specific notification
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error cancelling specific notification:', error);
    }
  }

  // Get all scheduled notifications (for debugging)
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Handle notification received while app is open
  static setupNotificationHandlers(): void {
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      // Handle notification tap - navigate to relevant screen
    });
  }
}

export default NotificationService;
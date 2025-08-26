
import { LocalNotifications, ScheduleOptions, Weekday } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Notification IDs (ensure they are unique integers)
const NOTIFICATION_IDS = {
  HABIT_TRACKER: 10,
  BREAKFAST: 20,
  LUNCH: 21,
  DINNER: 22,
  WATER_MORNING: 30,
  WATER_MIDDAY: 31,
  WATER_AFTERNOON: 32,
  SLEEP_LOG: 40,
};

const scheduleNotification = async (options: ScheduleOptions) => {
    try {
        await LocalNotifications.schedule(options);
    } catch(e) {
        console.error(`Failed to schedule notification for ID ${options.notifications[0].id}`, e);
    }
};

const scheduleDailyAt = async (id: number, hour: number, minute: number, title: string, body: string) => {
  await scheduleNotification({
    notifications: [
      {
        id,
        title,
        body,
        schedule: { on: { hour, minute }, repeats: true },
        smallIcon: 'ic_stat_tf_head', // Ensure this drawable exists in android/app/src/main/res/drawable
        largeIcon: 'ic_launcher', // Ensure this drawable exists
      },
    ],
  });
};

export const NotificationService = {
  async initialize() {
    if (!Capacitor.isPluginAvailable('LocalNotifications')) {
      console.log('Local notifications not available.');
      return;
    }

    // 1. Check for permissions
    let permissions = await LocalNotifications.checkPermissions();
    
    // 2. If not granted, request permissions
    if (permissions.display !== 'granted') {
      permissions = await LocalNotifications.requestPermissions();
    }
    
    // 3. If permissions are denied, do nothing further
    if (permissions.display === 'denied') {
      console.warn('User denied notification permissions.');
      return;
    }

    console.log('Notification permissions granted. Scheduling reminders...');
    
    // 4. Cancel all previously scheduled notifications to avoid duplicates on re-init
    const pending = await LocalNotifications.getPending();
    if(pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
        console.log('Cancelled previously scheduled notifications.');
    }

    // 5. Schedule all notifications
    await this.scheduleAllReminders();
    console.log('All reminders have been scheduled.');
  },

  async scheduleAllReminders() {
    // Habit Tracker Reminder
    await scheduleDailyAt(
      NOTIFICATION_IDS.HABIT_TRACKER,
      19, 0, // 7:00 PM
      'Habit Check-in',
      "Don't forget to update your habit tracker for today!"
    );

    // Meal Reminders
    await scheduleDailyAt(NOTIFICATION_IDS.BREAKFAST, 7, 30, 'Breakfast Time!', 'Time to log your first meal of the day.');
    await scheduleDailyAt(NOTIFICATION_IDS.LUNCH, 12, 30, 'Lunch Break', 'Remember to log your lunch in the meal scanner.');
    await scheduleDailyAt(NOTIFICATION_IDS.DINNER, 18, 30, 'Dinner is Served', 'What are you having for dinner? Log it now!');
    
    // Water Reminders
    await scheduleDailyAt(NOTIFICATION_IDS.WATER_MORNING, 9, 0, 'Stay Hydrated!', 'Good morning! Have you had a glass of water?');
    await scheduleDailyAt(NOTIFICATION_IDS.WATER_MIDDAY, 14, 0, 'Hydration Check', 'Halfway through the day, time for more water!');
    await scheduleDailyAt(NOTIFICATION_IDS.WATER_AFTERNOON, 17, 0, 'Afternoon Water', 'Keep your energy up with a glass of water.');

    // Sleep Log Reminder
    await scheduleDailyAt(
      NOTIFICATION_IDS.SLEEP_LOG,
      8, 0, // 8:00 AM
      'Good Morning!',
      'How did you sleep? Log your sleep in the Wellness Hub.'
    );
  }
};

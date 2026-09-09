import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface DailyReminderConfig {
  hour: number;
  minute: number;
  title?: string;
  body?: string;
}

/**
 * Register device for push notifications and get Expo Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission not granted for push notifications.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('plumbline-daily', {
      name: 'Plumb Line Daily Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5E9C76',
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (error) {
    console.error('Failed to get Expo push token:', error);
    return null;
  }
}

/**
 * Schedule a recurring daily notification at a specific time (e.g. 8:00 AM)
 */
export async function scheduleDailyReminder(
  config: DailyReminderConfig = { hour: 8, minute: 0 }
): Promise<string> {
  // Cancel any existing daily reminder first
  await cancelDailyReminder();

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: config.title || 'Plumb Line • Daily Practice',
      body:
        config.body ||
        "Your daily guided journey into Scripture is ready. Take a quiet moment to rest in God's Word.",
      sound: true,
      categoryIdentifier: 'daily-reminder',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: config.hour,
      minute: config.minute,
    },
  });

  return notificationId;
}

/**
 * Cancel scheduled daily reminders
 */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

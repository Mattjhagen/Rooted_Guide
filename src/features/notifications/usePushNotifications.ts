import { useEffect, useState, useCallback } from 'react';
import {
  registerForPushNotificationsAsync,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '@/infrastructure/notifications/notificationService';
import { safeStorage } from '@/infrastructure/storage/safeStorage';

const REMINDER_ENABLED_KEY = '@plumb_line_daily_reminder_enabled';
const REMINDER_TIME_KEY = '@plumb_line_daily_reminder_time';

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState<{ hour: number; minute: number }>({
    hour: 8,
    minute: 0,
  });

  useEffect(() => {
    // Register push token
    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    // Load stored reminder preferences
    async function loadPreferences() {
      const enabled = await safeStorage.getItem(REMINDER_ENABLED_KEY);
      const timeStr = await safeStorage.getItem(REMINDER_TIME_KEY);

      if (enabled === 'true') {
        setIsReminderEnabled(true);
      }
      if (timeStr) {
        try {
          setReminderTime(JSON.parse(timeStr));
        } catch {
          // fallback
        }
      }
    }
    loadPreferences();
  }, []);

  const enableDailyReminder = useCallback(async (hour: number = 8, minute: number = 0) => {
    await scheduleDailyReminder({ hour, minute });
    setIsReminderEnabled(true);
    setReminderTime({ hour, minute });
    await safeStorage.setItem(REMINDER_ENABLED_KEY, 'true');
    await safeStorage.setItem(REMINDER_TIME_KEY, JSON.stringify({ hour, minute }));
  }, []);

  const disableDailyReminder = useCallback(async () => {
    await cancelDailyReminder();
    setIsReminderEnabled(false);
    await safeStorage.setItem(REMINDER_ENABLED_KEY, 'false');
  }, []);

  return {
    expoPushToken,
    isReminderEnabled,
    reminderTime,
    enableDailyReminder,
    disableDailyReminder,
  };
}

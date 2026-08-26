import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DAY_NAMES } from '../types';
import { DEFAULT_REMINDER_SETTINGS, ReminderSettings } from '../types/notifications';
import { toDateKey } from '../utils/date';

const PREFIX = 'mealfit-';
const PLAN_DAYS = 14;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function configureAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Hatırlatmalar',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  await configureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === 'granted') {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.status === 'granted';
}

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === 'granted') return 'granted';
  if (current.status === 'denied') return 'denied';
  return 'undetermined';
}

async function cancelOurReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

function atLocalTime(base: Date, hour: number, minute = 0): Date {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function scheduleAt(id: string, title: string, body: string, when: Date): Promise<string> | null {
  if (when.getTime() <= Date.now() + 60_000) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: 'reminders' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
    },
  });
}

export interface ReminderScheduleInput {
  workoutDays: number[];
  settings: ReminderSettings;
  workoutLogs: { date: string }[];
  progressEntries: { date: string }[];
}

export async function rescheduleSmartReminders(input: ReminderScheduleInput): Promise<number> {
  const settings = input.settings ?? DEFAULT_REMINDER_SETTINGS;

  if (!settings.enabled) {
    await cancelOurReminders();
    return 0;
  }

  const permitted = await ensureNotificationPermissions();
  if (!permitted) {
    return 0;
  }

  await cancelOurReminders();

  const todayKey = toDateKey();
  const loggedToday = input.workoutLogs.some((l) => l.date === todayKey);
  const weightThisWeek = input.progressEntries.some((e) => e.date >= weekStartKey());
  let scheduled = 0;
  const now = new Date();

  for (let offset = 0; offset < PLAN_DAYS; offset++) {
    const day = new Date(now);
    day.setDate(now.getDate() + offset);
    day.setHours(0, 0, 0, 0);
    const dow = day.getDay();
    const dayName = DAY_NAMES[dow];
    const dateKey = toDateKey(day);
    const isWorkout = input.workoutDays.includes(dow);

    if (settings.workoutMorning && isWorkout) {
      const when = atLocalTime(day, settings.morningHour, 0);
      const result = await scheduleAt(
        `${PREFIX}am-${dateKey}`,
        '💪 Bugün spor günü',
        `${dayName} antrenmanın ve günlük menün hazır. Planına göz at!`,
        when
      );
      if (result !== null) scheduled += 1;
    }

    if (settings.workoutEvening && isWorkout) {
      const alreadyLogged = input.workoutLogs.some((l) => l.date === dateKey);
      if (!alreadyLogged) {
        const when = atLocalTime(day, settings.eveningHour, 0);
        const result = await scheduleAt(
          `${PREFIX}pm-${dateKey}`,
          '🏋️ Antrenman kaydı',
          'Bugünkü antrenmanını kaydettin mi? İlerlemen grafikte görünsün.',
          when
        );
        if (result !== null) scheduled += 1;
      }
    }
  }

  if (settings.weightWeekly && !weightThisWeek) {
    const nextSunday = nextWeekday(now, 0);
    const when = atLocalTime(nextSunday, 9, 30);
    const result = await scheduleAt(
      `${PREFIX}weight-weekly`,
      '⚖️ Haftalık tartım',
      'Kilonu güncelle — gelişim grafiğin seni bekliyor.',
      when
    );
    if (result !== null) scheduled += 1;
  }

  // loggedToday unused but kept for future same-day cancel on open
  void loggedToday;

  return scheduled;
}

function weekStartKey(ref: Date = new Date()): string {
  const start = new Date(ref);
  start.setDate(ref.getDate() - ref.getDay());
  return toDateKey(start);
}

function nextWeekday(from: Date, targetDow: number): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  let diff = targetDow - d.getDay();
  if (diff < 0) diff += 7;
  if (diff === 0 && atLocalTime(d, 9, 30).getTime() <= Date.now()) {
    diff = 7;
  }
  d.setDate(d.getDate() + diff);
  return d;
}

export async function getScheduledReminderCount(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.filter((n) => n.identifier.startsWith(PREFIX)).length;
}

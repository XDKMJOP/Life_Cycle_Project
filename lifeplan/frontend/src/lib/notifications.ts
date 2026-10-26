import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface ScheduleItemNotification {
  start: string; // "08:30"
  end: string;   // "16:00"
  label: string; // "เวลาเรียน"
  type: string;  // "workout" | "meal" | "sleep" | "work" | "study" | "free"
}

const STORAGE_KEY_ENABLED = 'life_cycle_notifications_enabled';
const CHANNEL_ID = 'routine_channel';

/**
 * Checks if notifications are enabled in user preferences
 */
export function isNotificationsEnabled(): boolean {
  const val = localStorage.getItem(STORAGE_KEY_ENABLED);
  return val === null ? true : val === 'true'; // Default to true
}

/**
 * Persists notification enabled preference
 */
export function setNotificationsEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
}

/**
 * Checks current notification permission status
 */
export async function checkNotificationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await LocalNotifications.checkPermissions();
      if (res.display === 'granted') return 'granted';
      if (res.display === 'denied') return 'denied';
      return 'prompt';
    } catch {
      return 'prompt';
    }
  }

  // Web Browser fallback
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return 'prompt';
  }

  return 'denied';
}

/**
 * Requests notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted';
    } catch {
      return false;
    }
  }

  // Web Browser
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Ensure Android Notification Channel exists
 */
async function ensureAndroidChannel() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'ตารางชีวิตประจำวัน Life Cycle',
      description: 'แจ้งเตือนเวลากิจวัตร ออกกำลังกาย มื้ออาหาร และการพักผ่อน',
      importance: 4, // High importance (heads-up notification)
      visibility: 1, // Public on lockscreen
      vibration: true,
      sound: 'beep.wav',
    });
  } catch {
    // Ignore channel creation errors if unsupported or existing
  }
}

function getNotificationTitle(item: ScheduleItemNotification): string {
  switch (item.type) {
    case 'workout':
      return `ถึงเวลาออกกำลังกาย: ${item.label}`;
    case 'meal':
      return `ได้เวลามื้ออาหาร: ${item.label}`;
    case 'sleep':
      return `ถึงเวลาพักผ่อน: ${item.label}`;
    case 'work':
      return `เริ่มเวลาทำงาน: ${item.label}`;
    case 'study':
      return `เริ่มเวลาเรียน: ${item.label}`;
    default:
      return `ถึงเวลา: ${item.label}`;
  }
}

function getNotificationBody(item: ScheduleItemNotification): string {
  switch (item.type) {
    case 'workout':
      return `เวลา ${item.start} - ${item.end} น. เริ่มกิจกรรมออกกำลังกายตามแผนสุขภาพ 30 วัน`;
    case 'meal':
      return `เวลา ${item.start} - ${item.end} น. รับประทานอาหารเพื่อพลังงานและสุขภาพที่สมดุล`;
    case 'sleep':
      return `เวลา ${item.start} - ${item.end} น. พักผ่อนและเข้านอนตรงเวลาเพื่อการฟื้นฟูร่างกาย`;
    case 'work':
      return `เวลา ${item.start} - ${item.end} น. เริ่มต้นเวลาทำงาน`;
    case 'study':
      return `เวลา ${item.start} - ${item.end} น. เริ่มต้นเวลาเรียนและทบทวนความรู้`;
    default:
      return `ช่วงเวลา ${item.start} - ${item.end} น. ตามตารางชีวิตประจำวันของคุณ`;
  }
}

/**
 * Schedules daily recurring notifications for all items in the schedule
 */
export async function scheduleRoutineNotifications(
  schedule: ScheduleItemNotification[]
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isNotificationsEnabled()) {
    await cancelAllRoutineNotifications();
    return { success: true, count: 0 };
  }

  const perm = await checkNotificationPermission();
  if (perm !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) {
      return { success: false, count: 0, error: 'permission_denied' };
    }
  }

  await ensureAndroidChannel();

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.cancelAll();

      const notifications = [];
      for (let i = 0; i < schedule.length; i++) {
        const item = schedule[i];
        const [hStr, mStr] = item.start.split(':');
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        if (isNaN(h) || isNaN(m)) continue;

        notifications.push({
          id: 1000 + i,
          title: getNotificationTitle(item),
          body: getNotificationBody(item),
          channelId: CHANNEL_ID,
          schedule: {
            on: { hour: h, minute: m },
            allowWhileIdle: true,
          },
          extra: { type: item.type, start: item.start, end: item.end },
        });
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }

      return { success: true, count: notifications.length };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, count: 0, error: msg };
    }
  }

  // Web Browser fallback: store scheduled routine in memory and setup timer
  setupBrowserNotificationTimer(schedule);
  return { success: true, count: schedule.length };
}

/**
 * Cancels all scheduled routine notifications
 */
export async function cancelAllRoutineNotifications(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.cancelAll();
    } catch {
      // ignore
    }
  }
  clearBrowserNotificationTimer();
}

/**
 * Sends an immediate test notification (fires in 1-2 seconds)
 */
export async function sendTestNotificationNow(): Promise<boolean> {
  const perm = await checkNotificationPermission();
  if (perm !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
  }

  await ensureAndroidChannel();

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 9999,
            title: 'ทดสอบแจ้งเตือน: Life Cycle',
            body: 'ระบบแจ้งเตือนตารางเวลาบนมือถือของคุณทำงานได้สมบูรณ์แบบ!',
            channelId: CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 1500) },
          },
        ],
      });
      return true;
    } catch {
      return false;
    }
  }

  // Web Browser
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      new Notification('ทดสอบแจ้งเตือน: Life Cycle', {
        body: 'ระบบแจ้งเตือนตารางเวลาบนอุปกรณ์ของคุณทำงานได้สมบูรณ์แบบ!',
      });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

// -------------------------------------------------------------
// BROWSER IN-TAB TIMER FALLBACK
// -------------------------------------------------------------
let browserTimerInterval: any = null;
let lastFiredMinute: string = '';

function clearBrowserNotificationTimer() {
  if (browserTimerInterval) {
    clearInterval(browserTimerInterval);
    browserTimerInterval = null;
  }
}

function setupBrowserNotificationTimer(schedule: ScheduleItemNotification[]) {
  clearBrowserNotificationTimer();
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  browserTimerInterval = setInterval(() => {
    if (!isNotificationsEnabled() || Notification.permission !== 'granted') return;

    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMin = now.getMinutes().toString().padStart(2, '0');
    const timeKey = `${currentHour}:${currentMin}`;

    if (timeKey === lastFiredMinute) return;

    const matchingItem = schedule.find((item) => item.start === timeKey);
    if (matchingItem) {
      lastFiredMinute = timeKey;
      try {
        new Notification(getNotificationTitle(matchingItem), {
          body: getNotificationBody(matchingItem),
        });
      } catch {
        // ignore
      }
    }
  }, 10000); // Check every 10 seconds
}

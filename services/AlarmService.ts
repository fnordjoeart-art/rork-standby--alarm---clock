import { Platform } from "react-native";
import type { Alarm, RepeatDay } from "@/stores/AlarmStore";

declare function require(name: string): any;

async function getNotifications(): Promise<any> {
  try {
    const mod = require("expo-notifications");
    return mod as any;
  } catch (e) {
    console.log("[AlarmService] expo-notifications not available", e);
    return null;
  }
}

export type ScheduledAlarm = Alarm & { notificationIds?: string[] };

export const AlarmService = {
  async requestPermissions() {
    try {
      const Notifications = await getNotifications();
      if (!Notifications) return false;
      const settings = await Notifications.getPermissionsAsync();
      if (!settings.granted) {
        const res = await Notifications.requestPermissionsAsync();
        return res.granted;
      }
      return true;
    } catch (e) {
      console.log("[AlarmService] permissions error", e);
      return false;
    }
  },

  async ensureChannels() {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    if (Platform.OS === "android") {
      try {
        await Notifications.setNotificationChannelAsync("alarms", {
          name: "Alarms",
          importance: Notifications.AndroidImportance.MAX,
          sound: undefined,
          enableVibrate: true,
          bypassDnd: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          vibrationPattern: [0, 250, 250, 250],
        });
      } catch (e) {
        console.log("[AlarmService] channel error", e);
      }
    }
  },

  buildTriggers(time: string, repeatDays: RepeatDay[]): any[] {
    const [hh, mm] = time.split(":" ).map((v) => parseInt(v, 10));
    if (repeatDays.length === 0) {
      const now = new Date();
      const target = new Date(now);
      target.setHours(hh, mm, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      return [{ date: target }];
    }
    return repeatDays.map((weekday) => ({
      channelId: Platform.OS === "android" ? "alarms" : undefined,
      repeats: true,
      weekday,
      hour: hh,
      minute: mm,
      second: 0,
    }));
  },

  async scheduleAlarm(alarm: Alarm): Promise<string[]> {
    await this.requestPermissions();
    await this.ensureChannels();
    const Notifications = await getNotifications();
    if (!Notifications) return [];
    const triggers = this.buildTriggers(alarm.time, alarm.repeatDays);
    const ids: string[] = [];
    for (const trigger of triggers) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: alarm.label || "Sveglia",
            body: `${alarm.time}`,
            sound: undefined,
            data: { type: "alarm", alarmId: alarm.id, sound: alarm.sound },
          },
          trigger,
        });
        ids.push(id);
      } catch (e) {
        console.log("[AlarmService] schedule error", e);
      }
    }
    return ids;
  },

  async scheduleSnooze(alarmId: string, minutes = 5) {
    const Notifications = await getNotifications();
    if (!Notifications) return null;
    try {
      const date = new Date(Date.now() + minutes * 60 * 1000);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Snooze",
          body: "Riposo di 5 min…",
          data: { type: "alarm", alarmId },
        },
        trigger: { date },
      });
      return id;
    } catch (e) {
      console.log("[AlarmService] snooze error", e);
      return null;
    }
  },

  async cancelAlarm(notificationId: string) {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.log("[AlarmService] cancel error", e);
    }
  },

  async getScheduledAlarms() {
    const Notifications = await getNotifications();
    if (!Notifications) return [] as any[];
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled;
    } catch (e) {
      console.log("[AlarmService] list error", e);
      return [] as any[];
    }
  },
};

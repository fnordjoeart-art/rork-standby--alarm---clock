import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

export type RepeatDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday per Expo Notifications

export type Alarm = {
  id: string;
  time: string; // "HH:mm"
  repeatDays: RepeatDay[]; // empty => one-off
  sound: string; // key from SOUND_PRESETS
  label: string;
  enabled: boolean;
};

const STORAGE_KEY = "standbyplus.alarms.v1";

export const SOUND_PRESETS: { key: string; name: string; uri: string }[] = [
  {
    key: "alarm_soft",
    name: "Soft Beep",
    uri: "https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3",
  },
  {
    key: "alarm_strong",
    name: "Strong Alarm",
    uri: "https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3",
  },
  {
    key: "birds",
    name: "Morning Birds",
    uri: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1c2dc86df2.mp3?filename=morning-birds-20545.mp3",
  },
];

const SCHEDULED_KEY = "standbyplus.alarms.scheduled.v1";

export const [AlarmProvider, useAlarms] = createContextHook(() => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [scheduled, setScheduled] = useState<Record<string, string[]>>({});
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: Alarm[] = JSON.parse(stored);
          if (Array.isArray(parsed)) setAlarms(parsed);
        }
        const scheduledRaw = await AsyncStorage.getItem(SCHEDULED_KEY);
        if (scheduledRaw) {
          const parsedSched: Record<string, string[]> = JSON.parse(scheduledRaw);
          if (parsedSched && typeof parsedSched === "object") setScheduled(parsedSched);
        }
      } catch (e) {
        console.log("[AlarmStore] load error", e);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
        await AsyncStorage.setItem(SCHEDULED_KEY, JSON.stringify(scheduled));
      } catch (e) {
        console.log("[AlarmStore] persist error", e);
      }
    })();
  }, [alarms, scheduled, isReady]);

  const add = useCallback((alarm: Omit<Alarm, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next: Alarm = { id, ...alarm };
    setAlarms((prev) => [...prev, next]);
    return id;
  }, []);

  const update = useCallback((id: string, patch: Partial<Omit<Alarm, "id">>) => {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const remove = useCallback((id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggle = useCallback((id: string, enabled: boolean) => {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, enabled } : a)));
  }, []);

  const setScheduledIds = useCallback((alarmId: string, ids: string[]) => {
    setScheduled((prev) => ({ ...prev, [alarmId]: ids }));
  }, []);

  const value = useMemo(
    () => ({ alarms, add, update, remove, toggle, isReady, scheduled, setScheduledIds }),
    [alarms, add, update, remove, toggle, isReady, scheduled, setScheduledIds]
  );

  return value;
});

export type AlarmContextValue = ReturnType<typeof useAlarms>;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { AlarmService } from "@/services/AlarmService";
import { SOUND_PRESETS } from "@/stores/AlarmStore";

declare function require(name: string): any;

export default function AlarmModal() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ alarmId?: string; sound?: string; time?: string }>();
  const [playing, setPlaying] = useState<boolean>(false);
  const volumeRef = useRef<number>(0);
  const soundObj = useRef<any>(null);

  const soundUri = useMemo(() => {
    const s = SOUND_PRESETS.find((x) => x.key === params.sound);
    return s?.uri ?? SOUND_PRESETS[0]?.uri;
  }, [params.sound]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { Audio } = require("expo-av");
        const { sound } = await Audio.Sound.createAsync({ uri: soundUri }, { volume: 0, isLooping: true, shouldPlay: true });
        soundObj.current = sound;
        setPlaying(true);
        const start = Date.now();
        const interval = setInterval(async () => {
          if (!mounted) return;
          const elapsed = Date.now() - start;
          const p = Math.min(1, elapsed / 10000);
          volumeRef.current = p;
          try { await sound.setVolumeAsync(p); } catch {}
          if (p >= 1) clearInterval(interval);
        }, 300);
      } catch (e) {
        console.log("[AlarmModal] audio error", e);
      }
    })();
    return () => {
      mounted = false;
      try {
        if (soundObj.current) {
          soundObj.current.stopAsync?.();
          soundObj.current.unloadAsync?.();
        }
      } catch {}
    };
  }, [soundUri]);

  const onStop = async () => {
    try {
      if (soundObj.current) await soundObj.current.stopAsync?.();
    } catch {}
    router.back();
  };

  const onSnooze = async () => {
    if (params.alarmId) await AlarmService.scheduleSnooze(params.alarmId, 5);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>      
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      <View style={styles.center}>
        <Text style={[styles.time, { color: theme.textPrimary }]}>{params.time ?? ""}</Text>
        <View style={styles.actions}>
          <TouchableOpacity testID="stop-alarm" onPress={onStop} style={[styles.stop, { backgroundColor: theme.primaryAccent }]} accessibilityRole="button" accessibilityLabel="Ferma allarme">
            <Text style={[styles.btnText, { color: "#020202" }]}>Stop</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="snooze-alarm" onPress={onSnooze} style={[styles.snooze, { borderColor: theme.secondaryAccent }]} accessibilityRole="button" accessibilityLabel="Snooze 5 minuti">
            <Text style={[styles.btnText, { color: theme.secondaryAccent }]}>Snooze 5 min</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 28 },
  time: { fontSize: 64, fontWeight: "800" as const, letterSpacing: 1 },
  actions: { flexDirection: "row" as const, gap: 16 },
  stop: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 20 },
  snooze: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 20, borderWidth: 2 },
  btnText: { fontSize: 18, fontWeight: "700" as const },
});

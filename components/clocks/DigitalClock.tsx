import React, { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, EmitterSubscription, Platform, StyleSheet, Text, View } from "react-native";

interface Props {
  color: string;
  accent: string;
}

export default function DigitalClock({ color, accent }: Props) {
  const [now, setNow] = useState<Date>(new Date());
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const shiftX = useRef(new Animated.Value(0)).current;
  const shiftY = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const sub = useRef<EmitterSubscription | null>(null);

  useEffect(() => {
    sub.current = AccessibilityInfo.addEventListener("reduceMotionChanged", (rm) => setReduceMotion(rm));
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    return () => {
      sub.current?.remove();
    };
  }, []);

  useEffect(() => {
    timer.current = setInterval(() => setNow(new Date()), 1000);
    return () => {
      if (timer.current !== null) clearInterval(timer.current);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const t = setInterval(() => {
      Animated.parallel([
        Animated.timing(shiftX, { toValue: (Math.random() - 0.5) * 6, duration: 800, useNativeDriver: false }),
        Animated.timing(shiftY, { toValue: (Math.random() - 0.5) * 4, duration: 800, useNativeDriver: false }),
      ]).start();
    }, 60000);
    return () => clearInterval(t);
  }, [reduceMotion, shiftX, shiftY]);

  const hh = useMemo(() => now.getHours().toString().padStart(2, "0"), [now]);
  const mm = useMemo(() => now.getMinutes().toString().padStart(2, "0"), [now]);
  const ss = useMemo(() => now.getSeconds().toString().padStart(2, "0"), [now]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateX: shiftX }, { translateY: shiftY }] }]} testID="digital-clock">
      <View style={styles.row}>
        <Text style={[styles.hhmm, { color }]}>{hh}</Text>
        <Text style={[styles.hhmm, { color: accent }]}>:</Text>
        <Text style={[styles.hhmm, { color }]}>{mm}</Text>
        <Text style={[styles.seconds, { color: accent }]}>{ss}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row" as const, alignItems: "flex-end" },
  hhmm: { fontSize: 96, fontWeight: "700" as const, letterSpacing: 1 },
  seconds: { fontSize: 28, fontWeight: "600" as const, marginLeft: 12, marginBottom: 10 },
});

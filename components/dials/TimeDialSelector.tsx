import React, { useMemo, useRef } from "react";
import { Platform, PanResponder, PanResponderInstance, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/providers/ThemeProvider";

export type TimeDialSelectorProps = {
  hour: number;
  minute: number;
  onChangeHour: (v: number) => void;
  onChangeMinute: (v: number) => void;
  onCenterPress?: () => void;
  testID?: string;
  size?: number;
};

const TWO_PI = Math.PI * 2;

function angleFromCenter(cx: number, cy: number, x: number, y: number) {
  const dx = x - cx;
  const dy = y - cy;
  let a = Math.atan2(dy, dx); // -PI..PI from +X axis
  a = a + Math.PI / 2; // make 0 at top
  if (a < 0) a += TWO_PI;
  return a; // 0..2PI clockwise from top
}

export default function TimeDialSelector({ hour, minute, onChangeHour, onChangeMinute, onCenterPress, testID, size = 280 }: TimeDialSelectorProps) {
  const { theme } = useTheme();
  const center = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const hourAngle = useSharedValue((hour % 24) * (360 / 24));
  const minuteAngle = useSharedValue((minute % 60) * (360 / 60));
  const lastHour = useRef<number>(hour);
  const lastMinute = useRef<number>(minute);

  const hStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${hourAngle.value}deg` }] }));
  const mStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${minuteAngle.value}deg` }] }));

  const doHaptic = async () => {
    if (Platform.OS !== "web") {
      try { await Haptics.selectionAsync(); } catch {}
    }
  };

  const panHour = useRef<PanResponderInstance>(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (_, g) => {
      const ang = angleFromCenter(center.current.x, center.current.y, g.moveX, g.moveY);
      const deg = (ang * 180) / Math.PI;
      const value = Math.round((deg / 360) * 24) % 24;
      if (value !== lastHour.current) {
        lastHour.current = value;
        onChangeHour(value);
        hourAngle.value = withTiming(value * (360 / 24), { duration: 120, easing: Easing.out(Easing.cubic) });
        doHaptic();
      }
    },
    onPanResponderRelease: () => {},
  })).current;

  const panMinute = useRef<PanResponderInstance>(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      const ang = angleFromCenter(center.current.x, center.current.y, g.moveX, g.moveY);
      const deg = (ang * 180) / Math.PI;
      const value = Math.round((deg / 360) * 60) % 60;
      if (value !== lastMinute.current) {
        lastMinute.current = value;
        onChangeMinute(value);
        minuteAngle.value = withTiming(value * (360 / 60), { duration: 90, easing: Easing.out(Easing.cubic) });
        doHaptic();
      }
    },
    onPanResponderRelease: () => {},
  })).current;

  const outerTicks = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const innerTicks = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  return (
    <View
      testID={testID}
      style={{ alignItems: "center", justifyContent: "center", paddingVertical: 8 }}
      onLayout={(e) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        center.current = { x: x + width / 2, y: y + height / 2 };
      }}
      accessibilityRole="adjustable"
      accessibilityLabel={`Selettore orario ${hour}:${minute.toString().padStart(2, "0")}`}
    >
      <View style={[styles.dialWrap, { width: size, height: size }]}>          
        <View style={[styles.ring, { borderColor: theme.surface }]} {...panHour.panHandlers}>
          {outerTicks.map((i) => {
            const ang = (i / 24) * 2 * Math.PI;
            const r = size / 2 - 14;
            const x = size / 2 + Math.sin(ang) * r;
            const y = size / 2 - Math.cos(ang) * r;
            const isMajor = i % 3 === 0;
            const selected = i === hour;
            return (
              <View key={`h-${i}`} style={[styles.tickWrap, { left: x - 8, top: y - 8 }]}>                  
                <Text style={{ color: selected ? theme.primaryAccent : theme.textSecondary, fontSize: isMajor ? 14 : 10, fontWeight: selected ? ("700" as const) : ("400" as const), textShadowColor: selected ? theme.glowSoftA : undefined, textShadowRadius: selected ? 8 : 0 }}>{isMajor ? i : ""}</Text>
              </View>
            );
          })}
          <Animated.View style={[styles.indicator, hStyle, { borderTopColor: theme.primaryAccent }]} />
        </View>
        <View style={[styles.ringInner, { borderColor: theme.surface }]} {...panMinute.panHandlers}>
          {innerTicks.map((i) => {
            if (i % 5 !== 0) return null;
            const ang = (i / 60) * 2 * Math.PI;
            const r = size / 2 - 44;
            const x = size / 2 + Math.sin(ang) * r;
            const y = size / 2 - Math.cos(ang) * r;
            const selected = i === minute;
            return (
              <View key={`m-${i}`} style={[styles.tickWrap, { left: x - 8, top: y - 8 }]}>                  
                <Text style={{ color: selected ? theme.primaryAccent : theme.textSecondary, fontSize: 12, fontWeight: selected ? ("700" as const) : ("400" as const), textShadowColor: selected ? theme.glowSoftB : undefined, textShadowRadius: selected ? 8 : 0 }}>{i.toString().padStart(2, "0")}</Text>
              </View>
            );
          })}
          <Animated.View style={[styles.indicatorInner, mStyle, { borderTopColor: theme.secondaryAccent }]} />
          <View
            testID="center-press"
            accessibilityRole="button"
            accessibilityLabel="Modifica manuale orario"
            onTouchEnd={onCenterPress}
            style={[styles.center, { backgroundColor: theme.surface }]
          }
          >
            <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: "700" as const }}>{`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dialWrap: { alignItems: "center", justifyContent: "center" },
  ring: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    position: "absolute",
    width: "70%",
    height: "70%",
    borderWidth: 2,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    position: "absolute",
    top: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 18,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  indicatorInner: {
    position: "absolute",
    top: 8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  tickWrap: { position: "absolute" },
  center: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
});

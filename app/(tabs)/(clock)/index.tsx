import React, { useMemo, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/providers/ThemeProvider";
import DigitalClock from "@/components/clocks/DigitalClock";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1920&auto=format&fit=crop",
];

type LayoutMode = "full" | "split";

export default function ClockScreen() {
  const { theme } = useTheme();
  const [layout, setLayout] = useState<LayoutMode>("full");
  const [bgIndex, setBgIndex] = useState<number>(0);

  const bgUri = useMemo(() => BG_IMAGES[bgIndex % BG_IMAGES.length], [bgIndex]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {layout === "full" ? (
        <View style={styles.fullContainer}>
          <Image
            testID="bg-image"
            source={{ uri: bgUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={500}
          />
          <View style={styles.overlay} pointerEvents="none" />
          <View style={styles.overlayContent}>
            <DigitalClock color={theme.textPrimary} accent={theme.primaryAccent} />
          </View>
        </View>
      ) : (
        <View style={styles.splitContainer}>
          <View style={styles.splitLeft}>
            <DigitalClock color={theme.textPrimary} accent={theme.primaryAccent} />
          </View>
          <View style={styles.splitRight}>
            <Image source={{ uri: bgUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          </View>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          testID="toggle-layout"
          onPress={() => setLayout((l) => (l === "full" ? "split" : "full"))}
          style={[styles.button, { backgroundColor: theme.surface }]}
        >
          <Text style={[styles.buttonText, { color: theme.textPrimary }]}>{layout === "full" ? "Split" : "Full"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="next-bg"
          onPress={() => setBgIndex((i) => i + 1)}
          style={[styles.button, { backgroundColor: theme.surface }]}
        >
          <Text style={[styles.buttonText, { color: theme.textPrimary }]}>Next Background</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fullContainer: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.15)" },
  overlayContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  splitContainer: { flex: 1, flexDirection: "row" as const },
  splitLeft: { flex: 1, alignItems: "center", justifyContent: "center" },
  splitRight: { flex: 1 },
  controls: {
    position: "absolute" as const,
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row" as const,
    gap: 12,
    justifyContent: "center",
  },
  button: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  buttonText: { fontSize: 14, fontWeight: "600" as const },
});

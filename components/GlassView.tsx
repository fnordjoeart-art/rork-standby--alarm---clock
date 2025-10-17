import React, { PropsWithChildren, useMemo } from "react";
import { Image, Platform, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

export type GlassViewProps = PropsWithChildren<{
  intensity?: number;
  tint?: "dark" | "light";
  border?: boolean;
  style?: ViewStyle | ViewStyle[];
}>;

export default function GlassView({ children, intensity = 20, tint = "dark", border = true, style }: GlassViewProps) {
  const { theme } = useTheme();

  const bg = useMemo(() => {
    const alpha = Math.min(Math.max(intensity, 0), 100) / 100;
    const base = tint === "dark" ? theme.surface : theme.background;
    return hexToRgba(base, 0.45 + alpha * 0.25);
  }, [intensity, tint, theme.surface, theme.background]);

  const borderColor = useMemo(() => hexToRgba("#FFFFFF", tint === "dark" ? 0.08 : 0.12), [tint]);

  const shadowColor = useMemo(() => (tint === "dark" ? "#000000" : "#000000"), [tint]);

  return (
    <View
      testID="glass-view"
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderColor: border ? borderColor : "transparent",
          shadowColor,
        },
        // @ts-expect-error: RN Web custom style
        Platform.OS === "web" ? { backdropFilter: `blur(${Math.round(intensity)}px)` } : null,
        style,
      ]}
    >
      {Platform.OS !== "web" ? (
        <Image
          // very subtle noise layer to sell the glass
          source={{ uri: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=10&w=50&auto=format&fit=crop" }}
          resizeMode="cover"
          style={styles.noise}
          blurRadius={40}
        />
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  noise: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
    transform: [{ scale: 2 }],
  },
});

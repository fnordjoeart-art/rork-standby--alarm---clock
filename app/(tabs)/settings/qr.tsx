import React, { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import { PROJECT_LINKS } from "@/constants/qrLinks";
import QRCodeCard from "@/components/QRCodeCard";

export default function SettingsQRScreen() {
  const { theme } = useTheme();

  const onOpen = useCallback((url: string) => {
    console.log("[SettingsQRScreen] Opening:", url);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} testID="settings-qr-screen">
      <Stack.Screen options={{ title: "QR Codes", headerShown: true }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 32 }]} style={styles.scroll}>
        <Text style={[styles.header, { color: theme.textPrimary }]}>Scansiona per aprire</Text>
        <View style={styles.grid}>
          {PROJECT_LINKS.map((item) => (
            <View key={item.key} style={styles.gridItem}>
              <QRCodeCard item={item} onPressOpen={onOpen} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  header: { fontSize: 20, fontWeight: "700" as const, marginBottom: 8 },
  grid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 16 },
  gridItem: { flexBasis: "100%" },
});

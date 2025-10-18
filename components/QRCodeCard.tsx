import React, { useMemo, useState, useCallback } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View, Image } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import type { ProjectLink } from "@/constants/qrLinks";

function buildQRProviders(data: string, size: number = 320): string[] {
  try {
    const encoded = encodeURIComponent(data);
    return [
      `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`,
      `https://quickchart.io/qr?size=${size}&text=${encoded}`,
      `https://image-charts.com/chart?chs=${size}x${size}&cht=qr&chl=${encoded}`,
    ];
  } catch (e) {
    console.log("[QRCodeCard] encode error", e);
    return [];
  }
}

export type QRCodeCardProps = {
  item: ProjectLink;
  onPressOpen?: (url: string) => void;
};

export const QRCodeCard = React.memo(function QRCodeCard({ item, onPressOpen }: QRCodeCardProps) {
  const { theme } = useTheme();

  const providers = useMemo(() => buildQRProviders(item.url, 480), [item.url]);
  const [providerIndex, setProviderIndex] = useState<number>(0);

  const qrUrl = providers[providerIndex] ?? "";

  const onOpen = () => {
    if (onPressOpen) onPressOpen(item.url);
    Linking.openURL(item.url).catch((err) => console.log("[QRCodeCard] openURL error", err));
  };

  const onError = useCallback(() => {
    console.log("[QRCodeCard] image error, switching provider", { from: providerIndex });
    setProviderIndex((i) => Math.min(i + 1, providers.length));
  }, [providers.length, providerIndex]);

  const onReload = useCallback(() => {
    console.log("[QRCodeCard] manual reload QR", { providerIndex });
    setProviderIndex(0);
  }, [providerIndex]);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.glowSoftA }]} testID={`qr-card-${item.key}`}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        {!!item.subtitle && (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}
      </View>

      <View style={styles.qrWrap}>
        {qrUrl ? (
          <Image
            source={{ uri: qrUrl }}
            resizeMode="contain"
            style={styles.qr}
            onError={onError}
            accessible
            accessibilityLabel={`QR code per ${item.title}`}
            testID={`qr-image-${item.key}`}
          />
        ) : (
          <View style={[styles.qrFallback, { backgroundColor: theme.background }]} />
        )}
      </View>

      <View style={styles.actionsRow}>
        <Pressable onPress={onOpen} style={[styles.button, { backgroundColor: theme.primaryAccent }]} testID={`qr-open-${item.key}`}>
          <Text style={styles.buttonText}>Apri link</Text>
        </Pressable>
        {Platform.OS === "web" ? (
          <Pressable onPress={onReload} style={[styles.buttonGhost, { borderColor: theme.glowSoftA }]} testID={`qr-reload-${item.key}`}>
            <Text style={[styles.buttonGhostText, { color: theme.textSecondary }]}>Ricarica QR</Text>
          </Pressable>
        ) : null}
      </View>

      {Platform.OS === "web" ? (
        <View style={styles.helperWrap}>
          <Text style={[styles.helper, { color: theme.textSecondary }]}>Se il QR non è visibile, usa "Apri link".</Text>
          <Text style={[styles.helperLink, { color: theme.textSecondary }]} selectable numberOfLines={1}>
            {item.url}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  headerRow: { gap: 4 },
  title: { fontSize: 18, fontWeight: "700" as const },
  subtitle: { fontSize: 12, opacity: 0.9 },
  qrWrap: { width: "100%", aspectRatio: 1, borderRadius: 12, overflow: "hidden" as const },
  qr: { width: "100%", height: "100%" },
  qrFallback: { flex: 1, borderRadius: 12 },
  actionsRow: { flexDirection: "row", gap: 12 },
  button: { paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center", flex: 1 },
  buttonText: { color: "#000", fontWeight: "700" as const },
  buttonGhost: { paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center", flex: 1, borderWidth: 1 },
  buttonGhostText: { fontWeight: "700" as const },
  helperWrap: { gap: 6 },
  helper: { fontSize: 12, textAlign: "center" as const },
  helperLink: { fontSize: 12, textAlign: "center" as const },
});

export default QRCodeCard;

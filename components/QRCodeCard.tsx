import React, { useMemo } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View, Image } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import type { ProjectLink } from "@/constants/qrLinks";

function buildQRUrl(data: string, size: number = 320): string {
  try {
    const encoded = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
  } catch (e) {
    console.log("[QRCodeCard] encode error", e);
    return "";
  }
}

export type QRCodeCardProps = {
  item: ProjectLink;
  onPressOpen?: (url: string) => void;
};

export const QRCodeCard = React.memo(function QRCodeCard({ item, onPressOpen }: QRCodeCardProps) {
  const { theme } = useTheme();

  const qrUrl = useMemo(() => buildQRUrl(item.url, 480), [item.url]);

  const onOpen = () => {
    if (onPressOpen) onPressOpen(item.url);
    Linking.openURL(item.url).catch((err) => console.log("[QRCodeCard] openURL error", err));
  };

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
            accessible
            accessibilityLabel={`QR code per ${item.title}`}
          />
        ) : (
          <View style={[styles.qrFallback, { backgroundColor: theme.background }]} />
        )}
      </View>

      <Pressable onPress={onOpen} style={[styles.button, { backgroundColor: theme.primaryAccent }]} testID={`qr-open-${item.key}`}>
        <Text style={styles.buttonText}>Apri link</Text>
      </Pressable>

      {Platform.OS === "web" ? (
        <Text style={[styles.helper, { color: theme.textSecondary }]}>
          Se il QR non è visibile, clicca Apri link per aprire direttamente.
        </Text>
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
  button: { paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#000", fontWeight: "700" as const },
  helper: { fontSize: 12, textAlign: "center" as const },
});

export default QRCodeCard;

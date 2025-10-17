import React from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "@/providers/ThemeProvider";

export default function AppearanceScreen() {
  const { theme, update, reset } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} testID="appearance-screen">
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Colors</Text>

      {(
        [
          ["background", theme.background],
          ["surface", theme.surface],
          ["primaryAccent", theme.primaryAccent],
          ["secondaryAccent", theme.secondaryAccent],
          ["textPrimary", theme.textPrimary],
          ["textSecondary", theme.textSecondary],
          ["glowSoftA", theme.glowSoftA],
          ["glowSoftB", theme.glowSoftB],
        ] as const
      ).map(([key, value]) => (
        <View key={key} style={styles.row}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>{key}</Text>
          <TextInput
            testID={`color-${key}`}
            value={value}
            onChangeText={(t) => update({ [key]: t } as any)}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { color: theme.textPrimary, borderColor: theme.surface }]}
          />
        </View>
      ))}

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Mode</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            testID="mode-dark"
            onPress={() => update({ mode: "dark" })}
            style={[styles.pill, { backgroundColor: theme.surface }]}
          >
            <Text style={{ color: theme.textPrimary }}>Dark</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="mode-light"
            onPress={() => update({ mode: "light" })}
            style={[styles.pill, { backgroundColor: theme.surface }]}
          >
            <Text style={{ color: theme.textPrimary }}>Light</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity testID="reset-theme" onPress={reset} style={[styles.resetBtn, { borderColor: theme.primaryAccent }]}>
        <Text style={{ color: theme.primaryAccent, fontWeight: "600" as const }}>Reset to Default</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" as const, marginBottom: 8 },
  row: { flexDirection: "row" as const, alignItems: "center", justifyContent: "space-between", gap: 12 },
  label: { width: 140 },
  input: { flex: 1, borderWidth: 1, padding: 8, borderRadius: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  resetBtn: { marginTop: 24, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
});

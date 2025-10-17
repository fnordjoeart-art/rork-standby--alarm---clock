import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useAlarms, Alarm } from "@/stores/AlarmStore";
import { useTheme } from "@/providers/ThemeProvider";
import { useRouter } from "expo-router";
import { Plus, Bell } from "lucide-react-native";
import { AlarmService } from "@/services/AlarmService";

const DAYS = ["D", "L", "M", "M", "G", "V", "S"]; // IT: Dom->Sab

export default function AlarmList() {
  const { alarms, toggle, scheduled, setScheduledIds } = useAlarms();
  const { theme } = useTheme();
  const router = useRouter();

  const sorted = useMemo(() => {
    return [...alarms].sort((a, b) => a.time.localeCompare(b.time));
  }, [alarms]);

  const renderItem = useCallback(
    ({ item }: { item: Alarm }) => {
      return (
        <View style={[styles.item, { backgroundColor: theme.surface }]} accessibilityRole="button" accessibilityLabel={`Sveglia ${item.time}`}>
          <View style={styles.itemLeft}>
            <Bell color={item.enabled ? theme.primaryAccent : theme.textSecondary} />
            <View>
              <Text style={[styles.time, { color: theme.textPrimary }]}>{item.time}</Text>
              <Text style={[styles.meta, { color: theme.textSecondary }]}> {item.label || "Sveglia"} · {item.repeatDays.length ? item.repeatDays.map((d) => DAYS[d]).join(" ") : "una tantum"}</Text>
            </View>
          </View>
          <Switch
            testID={`alarm-toggle-${item.id}`}
            value={item.enabled}
            onValueChange={async (v) => {
              toggle(item.id, v);
              if (v) {
                const ids = await AlarmService.scheduleAlarm(item);
                setScheduledIds(item.id, ids);
              } else {
                const ids = scheduled[item.id] ?? [];
                for (const nid of ids) await AlarmService.cancelAlarm(nid);
                setScheduledIds(item.id, []);
              }
            }}
            thumbColor={item.enabled ? theme.primaryAccent : undefined}
          />
        </View>
      );
    },
    [theme, toggle]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>      
      <FlatList
        testID="alarm-list"
        data={sorted}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={styles.empty}>            
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nessuna sveglia impostata</Text>
          </View>
        )}
        contentContainerStyle={sorted.length === 0 ? { flex: 1, justifyContent: "center" } : undefined}
      />
      <TouchableOpacity
        testID="add-alarm"
        onPress={() => router.push("/(tabs)/(clock)/alarms/new")}
        style={[styles.fab, { backgroundColor: theme.primaryAccent }]}
        accessibilityRole="button"
        accessibilityLabel="Aggiungi sveglia"
      >
        <Plus color="#020202" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: {
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: { flexDirection: "row" as const, gap: 12, alignItems: "center" },
  time: { fontSize: 28, fontWeight: "700" as const },
  meta: { fontSize: 12 },
  empty: { alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14 },
  fab: {
    position: "absolute" as const,
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});

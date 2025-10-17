import React, { useMemo, useRef, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAlarms, RepeatDay, SOUND_PRESETS } from "@/stores/AlarmStore";
import { useTheme } from "@/providers/ThemeProvider";
import { useRouter } from "expo-router";
import { AlarmService } from "@/services/AlarmService";
import TimeDialSelector from "@/components/dials/TimeDialSelector";

function pad(n: number) { return n.toString().padStart(2, "0"); }

export default function NewAlarmScreen() {
  const { theme } = useTheme();
  const { add, setScheduledIds } = useAlarms();
  const router = useRouter();

  const now = new Date();
  const [hh, setHh] = useState<string>(pad(now.getHours()));
  const [mm, setMm] = useState<string>(pad(now.getMinutes()));
  const hhRef = useRef<TextInput | null>(null);
  const mmRef = useRef<TextInput | null>(null);
  const [label, setLabel] = useState<string>("");
  const [repeatDays, setRepeatDays] = useState<RepeatDay[]>([]);
  const [sound, setSound] = useState<string>(SOUND_PRESETS[0]?.key ?? "alarm_soft");

  const valid = useMemo(() => /^(?:[0-1]\d|2[0-3])$/.test(hh) && /^([0-5]\d)$/.test(mm), [hh, mm]);

  const toggleDay = (d: RepeatDay) => {
    setRepeatDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const submit = async () => {
    if (!valid) {
      Alert.alert("Orario non valido", "Inserisci ore/minuti nel formato 24h");
      return;
    }
    const id = add({
      time: `${pad(parseInt(hh, 10))}:${pad(parseInt(mm, 10))}`,
      repeatDays: repeatDays.sort((a, b) => a - b),
      sound,
      label,
      enabled: true,
    });
    try {
      const notifIds = await AlarmService.scheduleAlarm({ id, time: `${hh}:${mm}`, repeatDays, sound, label, enabled: true });
      setScheduledIds(id, notifIds);
    } catch (e) {
      console.log("[NewAlarm] schedule error", e);
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>      
      <View style={styles.row}>        
        <Text style={[styles.label, { color: theme.textSecondary }]}>Ora</Text>
        <TimeDialSelector
          testID="time-dial"
          hour={parseInt(hh, 10)}
          minute={parseInt(mm, 10)}
          onChangeHour={(v: number) => setHh(pad(((v % 24) + 24) % 24))}
          onChangeMinute={(v: number) => setMm(pad(((v % 60) + 60) % 60))}
          onCenterPress={() => {
            if (Platform.OS === "web") return;
            hhRef.current?.focus();
          }}
        />
        <View style={styles.timeRow}>
          <TextInput
            ref={(r) => { hhRef.current = r; }}
            testID="hh-input"
            keyboardType="number-pad"
            value={hh}
            onChangeText={setHh}
            maxLength={2}
            style={[styles.timeInput, { color: theme.textPrimary, backgroundColor: theme.surface }]}
            accessibilityLabel="Ore"
          />
          <Text style={[styles.colon, { color: theme.textSecondary }]}>:</Text>
          <TextInput
            ref={(r) => { mmRef.current = r; }}
            testID="mm-input"
            keyboardType="number-pad"
            value={mm}
            onChangeText={setMm}
            maxLength={2}
            style={[styles.timeInput, { color: theme.textPrimary, backgroundColor: theme.surface }]}
            accessibilityLabel="Minuti"
          />
        </View>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Ripeti</Text>
        <View style={styles.days}>
          {[0,1,2,3,4,5,6].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => toggleDay(d as RepeatDay)}
              style={[styles.day, { backgroundColor: repeatDays.includes(d as RepeatDay) ? theme.primaryAccent : theme.surface }]}
              accessibilityLabel={`Giorno ${d}`}
            >
              <Text style={[styles.dayText, { color: repeatDays.includes(d as RepeatDay) ? "#020202" : theme.textPrimary }]}>{["D","L","M","M","G","V","S"][d]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>        
        <Text style={[styles.label, { color: theme.textSecondary }]}>Etichetta</Text>
        <TextInput
          testID="label-input"
          placeholder="Sveglia"
          placeholderTextColor={theme.textSecondary}
          value={label}
          onChangeText={setLabel}
          style={[styles.textInput, { color: theme.textPrimary, backgroundColor: theme.surface }]}
        />
      </View>

      <View style={styles.row}>        
        <Text style={[styles.label, { color: theme.textSecondary }]}>Suono</Text>
        <View style={styles.sounds}>
          {SOUND_PRESETS.map((s) => (
            <TouchableOpacity
              key={s.key}
              onPress={() => setSound(s.key)}
              style={[styles.sound, { borderColor: sound === s.key ? theme.primaryAccent : theme.surface }]}
            >
              <Text style={{ color: theme.textPrimary }}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        testID="save-alarm"
        onPress={submit}
        disabled={!valid}
        style={[styles.save, { backgroundColor: valid ? theme.primaryAccent : "#444" }]}
        accessibilityRole="button"
        accessibilityLabel="Salva sveglia"
      >
        <Text style={[styles.saveText, { color: "#020202" }]}>Salva</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  row: { gap: 8 },
  label: { fontSize: 12, letterSpacing: 0.5 },
  timeRow: { flexDirection: "row" as const, alignItems: "center" },
  colon: { fontSize: 24, marginHorizontal: 8 },
  timeInput: { width: 72, fontSize: 28, fontWeight: "700" as const, padding: 8, borderRadius: 12, textAlign: "center" as const },
  days: { flexDirection: "row" as const, gap: 8 },
  day: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  dayText: { fontSize: 14, fontWeight: "600" as const },
  textInput: { padding: 12, borderRadius: 12 },
  sounds: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8 },
  sound: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 2 },
  save: { padding: 16, borderRadius: 14, alignItems: "center", marginTop: 8 },
  saveText: { fontSize: 16, fontWeight: "700" as const },
});

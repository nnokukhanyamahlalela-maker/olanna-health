import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, TextInput, Alert, Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { FlowSelector } from "@/components/FlowSelector";
import { MoodSelector } from "@/components/MoodSelector";
import { SymptomChip } from "@/components/SymptomChip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { storage, DailyLog, generateId } from "@/lib/storage";

const symptoms = [
  { id: "cramps", label: "Cramps", icon: "zap" as const },
  { id: "bloating", label: "Bloating", icon: "circle" as const },
  { id: "headache", label: "Headache", icon: "alert-circle" as const },
  { id: "fatigue", label: "Fatigue", icon: "battery" as const },
  { id: "backache", label: "Backache", icon: "activity" as const },
  { id: "nausea", label: "Nausea", icon: "frown" as const },
  { id: "acne", label: "Acne", icon: "droplet" as const },
  { id: "cravings", label: "Cravings", icon: "coffee" as const },
  { id: "insomnia", label: "Insomnia", icon: "moon" as const },
  { id: "tender_breasts", label: "Tender Breasts", icon: "heart" as const },
];

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (formatDate(date) === formatDate(today)) return "Today";
  if (formatDate(date) === formatDate(yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function TrackScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [flow, setFlow] = useState<DailyLog["flow"]>(undefined);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number>(5);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadLogForDate(selectedDate);
  }, [selectedDate]);

  const loadLogForDate = async (date: Date) => {
    try {
      const logs = await storage.getDailyLogs();
      const dateStr = formatDate(date);
      const existingLog = logs.find((log) => log.date === dateStr);
      if (existingLog) {
        setFlow(existingLog.flow);
        setSelectedSymptoms(existingLog.symptoms || []);
        setMood(existingLog.mood || null);
        setEnergy(existingLog.energy || 5);
        setNotes(existingLog.notes || "");
      } else {
        setFlow(undefined);
        setSelectedSymptoms([]);
        setMood(null);
        setEnergy(5);
        setNotes("");
      }
    } catch (error) {
      console.error("Failed to load log:", error);
    }
  };

  const handleDateChange = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const log: DailyLog = {
        id: generateId(),
        date: formatDate(selectedDate),
        flow: flow || undefined,
        symptoms: selectedSymptoms,
        mood: mood || undefined,
        energy,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
      };
      await storage.addDailyLog(log);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (Platform.OS === "web") {
        alert("Log saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save log:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const isToday = formatDate(selectedDate) === formatDate(new Date());

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.dateSelector, { paddingTop: headerHeight + Spacing.md }]}>
        <Pressable
          onPress={() => handleDateChange(-1)}
          style={({ pressed }) => [
            styles.dateButton,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="chevron-left" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.dateDisplay}>
          <ThemedText type="h3">{formatDisplayDate(selectedDate)}</ThemedText>
          <ThemedText type="small" style={styles.dateSubtext}>
            {selectedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </ThemedText>
        </View>
        <Pressable
          onPress={() => handleDateChange(1)}
          disabled={isToday}
          style={({ pressed }) => [
            styles.dateButton,
            {
              backgroundColor: theme.backgroundDefault,
              opacity: isToday ? 0.3 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="chevron-right" size={24} color={theme.text} />
        </Pressable>
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + Spacing["4xl"],
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Flow
          </ThemedText>
          <FlowSelector value={flow || null} onChange={setFlow} />
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Mood
          </ThemedText>
          <MoodSelector
            value={mood as any}
            onChange={setMood as any}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Symptoms
          </ThemedText>
          <View style={styles.symptomsGrid}>
            {symptoms.map((symptom) => (
              <SymptomChip
                key={symptom.id}
                label={symptom.label}
                icon={symptom.icon}
                selected={selectedSymptoms.includes(symptom.id)}
                onPress={() => toggleSymptom(symptom.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Energy Level
          </ThemedText>
          <View style={styles.energyContainer}>
            <View style={styles.energyBar}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <Pressable
                  key={level}
                  onPress={() => {
                    setEnergy(level);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.energyDot,
                    {
                      backgroundColor:
                        level <= energy ? theme.secondary : theme.backgroundSecondary,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.energyLabels}>
              <ThemedText type="caption">Low</ThemedText>
              <ThemedText type="body" style={{ color: theme.secondary, fontWeight: "600" }}>
                {energy}/10
              </ThemedText>
              <ThemedText type="caption">High</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Notes
          </ThemedText>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Add any additional notes..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Button onPress={handleSave} disabled={isSaving} style={styles.saveButton}>
          {isSaving ? "Saving..." : "Save Log"}
        </Button>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  dateButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDisplay: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  dateSubtext: {
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  energyContainer: {
    gap: Spacing.md,
  },
  energyBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
  },
  energyDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  energyLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notesInput: {
    minHeight: 100,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});

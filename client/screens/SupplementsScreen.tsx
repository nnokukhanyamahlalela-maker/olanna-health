import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";

const STORAGE_KEY = "olanna_supplement_logs";

const DOSAGE_UNITS = ["mg", "mcg", "ml", "capsule"];
const FREQUENCY_OPTIONS = ["daily", "occasionally", "weekly"];

interface SupplementEntry {
  id: string;
  supplement_name: string;
  dosage_value: number | null;
  dosage_unit: string;
  frequency_label: string;
  taken_at: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PickerDropdown({
  label,
  options,
  selected,
  onSelect,
  theme,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  theme: any;
}) {
  const [open, setOpen] = useState(false);

  const displayLabel = (val: string) =>
    val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, " ");

  return (
    <View>
      <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${displayLabel(selected)}. Tap to change`}
        onPress={() => setOpen(!open)}
        style={[styles.dropdownTrigger, { borderColor: theme.border }]}
      >
        <ThemedText style={[styles.dropdownText, { color: theme.text }]}>
          {displayLabel(selected)}
        </ThemedText>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.textSecondary}
        />
      </Pressable>
      {open ? (
        <View style={[styles.dropdownList, { borderColor: theme.border }]}>
          {options.map((opt) => (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityLabel={displayLabel(opt) + (selected === opt ? ", selected" : "")}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
              style={[
                styles.dropdownItem,
                selected === opt ? { backgroundColor: "#7A8C5E20" } : null,
              ]}
            >
              <ThemedText style={[styles.dropdownItemText, { color: theme.text }]}>
                {displayLabel(opt)}
              </ThemedText>
              {selected === opt ? (
                <Feather name="check" size={16} color="#7A8C5E" />
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function SupplementsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState<SupplementEntry[]>([]);
  const [supplementName, setSupplementName] = useState("");
  const [dosageValue, setDosageValue] = useState("");
  const [dosageUnit, setDosageUnit] = useState("mg");
  const [frequencyLabel, setFrequencyLabel] = useState("daily");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toastOpacity = useSharedValue(0);
  const saveScale = useSharedValue(1);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  const saveAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const showToast = (msg: string) => {
    setToastMsg(msg);
    toastOpacity.value = withTiming(1, { duration: 200 });
    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => setToastMsg(null), 350);
    }, 2500);
  };

  const getTodayKey = () => new Date().toISOString().split("T")[0];

  const loadEntries = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const all: SupplementEntry[] = JSON.parse(raw);
        const today = getTodayKey();
        const todayEntries = all.filter(
          (e) => e.taken_at.split("T")[0] === today
        );
        setEntries(todayEntries);
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const handleSave = async () => {
    const name = supplementName.trim();
    if (!name) {
      showToast("Please enter a supplement name.");
      return;
    }

    setIsSaving(true);
    try {
      const newEntry: SupplementEntry = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        supplement_name: name,
        dosage_value: dosageValue.trim() ? parseFloat(dosageValue) : null,
        dosage_unit: dosageUnit,
        frequency_label: frequencyLabel,
        taken_at: new Date().toISOString(),
      };

      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const all: SupplementEntry[] = raw ? JSON.parse(raw) : [];
      all.push(newEntry);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSupplementName("");
      setDosageValue("");
      setDosageUnit("mg");
      setFrequencyLabel("daily");
      showToast("Supplement logged");
      await loadEntries();
    } catch {
      showToast("Could not save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const all: SupplementEntry[] = JSON.parse(raw);
        const filtered = all.filter((e) => e.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await loadEntries();
      }
    } catch {
      showToast("Could not delete entry.");
    }
  };

  const todayStr = new Date().toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const entryCount = entries.length;

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: ScreenPadding.horizontal,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GlassSurface style={styles.fieldCard}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryIconWrap, { backgroundColor: "#7A8C5E20" }]}>
              <Feather name="sun" size={22} color="#7A8C5E" />
            </View>
            <View style={styles.summaryContent}>
              <ThemedText style={[styles.dateText, { color: theme.text }]}>
                {todayStr}
              </ThemedText>
              <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
                {entryCount > 0
                  ? `You logged ${entryCount} supplement${entryCount !== 1 ? "s" : ""} today`
                  : "No supplements logged today"}
              </ThemedText>
            </View>
          </View>
        </GlassSurface>

        {entryCount > 0 ? (
          <View style={styles.entriesSection}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              TODAY'S LOG
            </ThemedText>
            {entries.map((entry) => {
              const timeStr = new Date(entry.taken_at).toLocaleTimeString("en-ZA", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const dosageStr =
                entry.dosage_value != null
                  ? `${entry.dosage_value} ${entry.dosage_unit}`
                  : "";
              const freqStr =
                entry.frequency_label.charAt(0).toUpperCase() +
                entry.frequency_label.slice(1).replace(/_/g, " ");

              return (
                <GlassSurface key={entry.id} style={styles.entryCard} tint="subtle">
                  <View style={styles.entryRow}>
                    <View style={styles.entryInfo}>
                      <ThemedText style={[styles.entryName, { color: theme.text }]}>
                        {entry.supplement_name}
                      </ThemedText>
                      <ThemedText style={[styles.entryDetail, { color: theme.textSecondary }]}>
                        {[dosageStr, freqStr, timeStr].filter(Boolean).join("  ·  ")}
                      </ThemedText>
                    </View>
                    <Pressable
                      testID={`button-delete-supplement-${entry.id}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${entry.supplement_name}`}
                      onPress={() => handleDelete(entry.id)}
                      hitSlop={12}
                    >
                      <Feather name="x" size={18} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </GlassSurface>
              );
            })}
          </View>
        ) : null}

        <View style={styles.formSection}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            LOG A SUPPLEMENT
          </ThemedText>

          <GlassSurface style={styles.fieldCard}>
            <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              SUPPLEMENT NAME
            </ThemedText>
            <TextInput
              testID="input-supplement-name"
              accessibilityLabel="Supplement name"
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  fontFamily: Fonts.body,
                },
              ]}
              placeholder="e.g. Vitamin D, Iron, Omega-3"
              placeholderTextColor={theme.textSecondary}
              value={supplementName}
              onChangeText={setSupplementName}
              maxLength={80}
              editable={!isSaving}
            />
          </GlassSurface>

          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          <GlassSurface style={styles.fieldCard}>
            <View style={styles.dosageRow}>
              <View style={styles.dosageValueWrap}>
                <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  DOSAGE (OPTIONAL)
                </ThemedText>
                <TextInput
                  testID="input-dosage-value"
                  accessibilityLabel="Dosage value"
                  style={[
                    styles.textInput,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      fontFamily: Fonts.body,
                    },
                  ]}
                  placeholder="e.g. 1000"
                  placeholderTextColor={theme.textSecondary}
                  value={dosageValue}
                  onChangeText={setDosageValue}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!isSaving}
                />
              </View>
              <View style={styles.dosageUnitWrap}>
                <PickerDropdown
                  label="UNIT"
                  options={DOSAGE_UNITS}
                  selected={dosageUnit}
                  onSelect={setDosageUnit}
                  theme={theme}
                />
              </View>
            </View>
          </GlassSurface>

          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          <GlassSurface style={styles.fieldCard}>
            <PickerDropdown
              label="FREQUENCY"
              options={FREQUENCY_OPTIONS}
              selected={frequencyLabel}
              onSelect={setFrequencyLabel}
              theme={theme}
            />
          </GlassSurface>

          <AnimatedPressable
            testID="button-save-supplement"
            accessibilityRole="button"
            accessibilityLabel="Log supplement"
            onPress={handleSave}
            disabled={isSaving}
            onPressIn={() => {
              saveScale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
            }}
            onPressOut={() => {
              saveScale.value = withSpring(1, { damping: 15, stiffness: 150 });
            }}
            style={[
              styles.saveButton,
              isSaving ? { opacity: 0.6 } : null,
              saveAnimStyle,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color="#3A2F35" size="small" />
            ) : (
              <ThemedText style={styles.saveButtonText}>Log Supplement</ThemedText>
            )}
          </AnimatedPressable>
        </View>

        <ThemedText style={[styles.privacyNote, { color: theme.textSecondary }]}>
          Your supplement logs are stored locally on your device.
        </ThemedText>
      </ScrollView>

      {toastMsg ? (
        <Animated.View style={[styles.toast, toastStyle]}>
          <ThemedText style={styles.toastText}>{toastMsg}</ThemedText>
        </Animated.View>
      ) : null}
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  summaryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContent: {
    flex: 1,
    gap: 2,
  },
  summaryText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  entriesSection: {
    marginTop: Spacing.xl,
    gap: 8,
  },
  formSection: {
    marginTop: Spacing.xl,
  },
  sectionLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  entryCard: {
    borderRadius: 12,
    padding: Spacing.md,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  entryInfo: {
    flex: 1,
    gap: 2,
  },
  entryName: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
  },
  entryDetail: {
    fontFamily: Fonts.body,
    fontSize: 12,
  },
  fieldCard: {
    borderRadius: 12,
    padding: Spacing.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
    marginVertical: 2,
  },
  fieldLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  dateText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 15,
  },
  dosageRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  dosageValueWrap: {
    flex: 1,
  },
  dosageUnitWrap: {
    flex: 1,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  dropdownText: {
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  dropdownList: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  saveButton: {
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: "#7A8C5E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  privacyNote: {
    fontFamily: Fonts.body,
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
  toast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#3A2F35",
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  toastText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: "#FFFFFF",
  },
});

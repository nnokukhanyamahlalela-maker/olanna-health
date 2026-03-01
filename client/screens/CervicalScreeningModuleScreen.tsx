import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Pressable, Switch, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { storage, Screening, generateId } from "@/lib/storage";

export default function CervicalScreeningModuleScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [lastPapDate, setLastPapDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [screeningType, setScreeningType] = useState<"hpv" | "pap">("hpv");

  useEffect(() => {
    loadScreeningData();
  }, []);

  const loadScreeningData = async () => {
    const screenings = await storage.getScreenings();
    const cervicalScreening = screenings.find(
      (s) => s.type === "pap_smear" || s.type === "hpv_test"
    );
    if (cervicalScreening?.lastDate) {
      setLastPapDate(new Date(cervicalScreening.lastDate));
      setReminderEnabled(cervicalScreening.reminderEnabled);
    }
  };

  const saveScreening = async () => {
    if (!lastPapDate) return;

    const nextDueDate = new Date(lastPapDate);
    nextDueDate.setFullYear(
      nextDueDate.getFullYear() + (screeningType === "hpv" ? 5 : 3)
    );

    const screening: Screening = {
      id: generateId(),
      type: screeningType === "hpv" ? "hpv_test" : "pap_smear",
      lastDate: lastPapDate.toISOString().split("T")[0],
      nextDueDate: nextDueDate.toISOString().split("T")[0],
      reminderEnabled,
    };

    const screenings = await storage.getScreenings();
    const existingIndex = screenings.findIndex(
      (s) => s.type === "pap_smear" || s.type === "hpv_test"
    );
    if (existingIndex >= 0) {
      screenings[existingIndex] = screening;
    } else {
      screenings.push(screening);
    }
    await storage.setScreenings(screenings);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getNextDueDate = () => {
    if (!lastPapDate) return null;
    const nextDue = new Date(lastPapDate);
    nextDue.setFullYear(
      nextDue.getFullYear() + (screeningType === "hpv" ? 5 : 3)
    );
    return nextDue;
  };

  const nextDue = getNextDueDate();
  const isDue = nextDue && nextDue <= new Date();

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing["2xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
      <GlassSurface style={styles.guidelineCard}>
        <Feather name="book-open" size={24} color={theme.secondary} />
        <View style={styles.guidelineContent}>
          <ThemedText type="h4" style={{ color: theme.secondary }}>
            South African Guidelines
          </ThemedText>
          <ThemedText type="small" style={{ opacity: 0.8 }}>
            Based on SASOG and BetterGyn cervical screening guidelines. HPV testing every 5 years for women aged 25-65.
          </ThemedText>
        </View>
      </GlassSurface>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Screening Type
        </ThemedText>
        <View style={styles.toggleContainer}>
          <Pressable
            onPress={() => setScreeningType("hpv")}
            style={[
              styles.toggleOption,
              {
                backgroundColor:
                  screeningType === "hpv" ? theme.primary : isDark ? "rgba(42,23,48,0.35)" : "rgba(255,255,255,0.25)",
                borderWidth: screeningType === "hpv" ? 0 : StyleSheet.hairlineWidth,
                borderColor: screeningType === "hpv" ? "transparent" : isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.40)",
              },
            ]}
          >
            <ThemedText
              type="body"
              style={{
                color: screeningType === "hpv" ? theme.buttonText : theme.text,
                fontWeight: "600",
              }}
            >
              HPV Test
            </ThemedText>
            <ThemedText
              type="caption"
              style={{
                color: screeningType === "hpv" ? theme.buttonText : theme.textSecondary,
              }}
            >
              Every 5 years
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setScreeningType("pap")}
            style={[
              styles.toggleOption,
              {
                backgroundColor:
                  screeningType === "pap" ? theme.primary : isDark ? "rgba(42,23,48,0.35)" : "rgba(255,255,255,0.25)",
                borderWidth: screeningType === "pap" ? 0 : StyleSheet.hairlineWidth,
                borderColor: screeningType === "pap" ? "transparent" : isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.40)",
              },
            ]}
          >
            <ThemedText
              type="body"
              style={{
                color: screeningType === "pap" ? theme.buttonText : theme.text,
                fontWeight: "600",
              }}
            >
              Pap Smear
            </ThemedText>
            <ThemedText
              type="caption"
              style={{
                color: screeningType === "pap" ? theme.buttonText : theme.textSecondary,
              }}
            >
              Every 3 years
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Last Screening Date
        </ThemedText>
        <Pressable
          onPress={() => setShowDatePicker(true)}
        >
          <GlassSurface style={styles.dateButton} noPadding>
            <View style={styles.dateButtonInner}>
              <Feather name="calendar" size={20} color={theme.textSecondary} />
              <ThemedText type="body">
                {lastPapDate
                  ? lastPapDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select date"}
              </ThemedText>
            </View>
          </GlassSurface>
        </Pressable>
        {showDatePicker ? (
          <DateTimePicker
            value={lastPapDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === "ios");
              if (date) setLastPapDate(date);
            }}
            maximumDate={new Date()}
          />
        ) : null}
      </View>

      {nextDue ? (
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: isDue ? theme.warning + "15" : theme.success + "15",
            },
          ]}
        >
          <View
            style={[
              styles.statusIcon,
              { backgroundColor: isDue ? theme.warning + "30" : theme.success + "30" },
            ]}
          >
            <Feather
              name={isDue ? "alert-circle" : "check-circle"}
              size={24}
              color={isDue ? theme.warning : theme.success}
            />
          </View>
          <View style={styles.statusContent}>
            <ThemedText
              type="h4"
              style={{ color: isDue ? theme.warning : theme.success }}
            >
              {isDue ? "Screening Due" : "Next Screening"}
            </ThemedText>
            <ThemedText type="body">
              {nextDue.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </ThemedText>
          </View>
        </View>
      ) : null}

      <GlassSurface style={styles.reminderRow}>
        <View style={styles.reminderContent}>
          <Feather name="bell" size={20} color={theme.primary} />
          <ThemedText type="body">Enable reminder notifications</ThemedText>
        </View>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ false: theme.backgroundSecondary, true: theme.primary + "60" }}
          thumbColor={reminderEnabled ? theme.primary : theme.textSecondary}
        />
      </GlassSurface>

      <Button onPress={saveScreening} style={styles.saveButton}>
        Save Screening Info
      </Button>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Important Information
        </ThemedText>

        <GlassSurface style={styles.infoCard}>
          <Feather name="info" size={20} color={theme.info} />
          <View style={styles.infoContent}>
            <ThemedText type="h4">Who should be screened?</ThemedText>
            <ThemedText type="small" style={styles.infoText}>
              Women aged 25-65 should have regular cervical screening. High-risk women (HIV positive or HPV 16/18/45 positive) may need more frequent screening.
            </ThemedText>
          </View>
        </GlassSurface>

        <GlassSurface style={styles.infoCard}>
          <Feather name="alert-triangle" size={20} color={theme.warning} />
          <View style={styles.infoContent}>
            <ThemedText type="h4">When to see a doctor</ThemedText>
            <ThemedText type="small" style={styles.infoText}>
              Contact your healthcare provider if you experience unusual bleeding, pelvic pain, or changes in vaginal discharge.
            </ThemedText>
          </View>
        </GlassSurface>
      </View>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guidelineCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  guidelineContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  toggleOption: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  dateButton: {
    borderRadius: BorderRadius.md,
  },
  dateButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statusContent: {
    flex: 1,
    gap: 2,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  reminderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  saveButton: {
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  infoContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  infoText: {
    opacity: 0.7,
    lineHeight: 20,
  },
});

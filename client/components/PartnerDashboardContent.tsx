import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SharedViewPayload {
  phase: { name: string; label: string } | null;
  nextPeriodWindow: { from: string; to: string; confidence?: string } | null;
  fertileWindow: { from: string; to: string } | null;
  ovulationWindow: { from: string; to: string } | null;
  moodSummary: { level: string; message: string } | null;
  energySummary: { level: string; message: string } | null;
  tips: string[];
}

const PHASE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  menstrual: "droplet",
  follicular: "sunrise",
  ovulation: "sun",
  luteal: "moon",
};

const PHASE_COLORS: Record<string, string> = {
  menstrual: "#F2A2B8",
  follicular: "#CFCBD6",
  ovulation: "#F2C9A2",
  luteal: "#D7B3E7",
};

function formatDateRange(from: string, to: string): string {
  const fromDate = new Date(from + "T00:00:00");
  const toDate = new Date(to + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${fromDate.toLocaleDateString("en-ZA", opts)} - ${toDate.toLocaleDateString("en-ZA", opts)}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function PartnerDashboardContent({ data }: { data: SharedViewPayload }) {
  const { theme, isDark } = useTheme();

  const hasWindows = data.nextPeriodWindow || data.fertileWindow || data.ovulationWindow;
  const hasMoodEnergy = data.moodSummary || data.energySummary;
  const isEmpty = !data.phase && !hasWindows && !hasMoodEnergy && data.tips.length === 0;

  if (isEmpty) {
    return (
      <GlassSurface style={styles.emptyCard}>
        <Feather name="heart" size={32} color={theme.textSecondary} />
        <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.md }}>
          No cycle insights are being shared right now.
        </ThemedText>
      </GlassSurface>
    );
  }

  return (
    <View style={styles.content}>
      {data.phase ? (
        <GlassSurface tint="prominent" style={styles.phaseCard}>
          <View style={[styles.phaseIconWrap, { backgroundColor: PHASE_COLORS[data.phase.name] || theme.primary }]}>
            <Feather
              name={PHASE_ICONS[data.phase.name] || "circle"}
              size={22}
              color="#fff"
            />
          </View>
          <View style={styles.phaseInfo}>
            <ThemedText type="h3" style={{ color: theme.text }}>
              {capitalize(data.phase.name)} Phase
            </ThemedText>
            {data.phase.label ? (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {data.phase.label}
              </ThemedText>
            ) : null}
          </View>
        </GlassSurface>
      ) : null}

      {hasWindows ? (
        <GlassSurface style={styles.windowsCard}>
          <ThemedText type="h4" style={[styles.sectionLabel, { color: theme.text }]}>
            Upcoming Windows
          </ThemedText>
          {data.nextPeriodWindow ? (
            <View style={styles.windowRow}>
              <View style={[styles.windowDot, { backgroundColor: "#F2A2B8" }]} />
              <View style={styles.windowInfo}>
                <ThemedText type="body" style={{ color: theme.text }}>Next Period</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {formatDateRange(data.nextPeriodWindow.from, data.nextPeriodWindow.to)}
                </ThemedText>
              </View>
            </View>
          ) : null}
          {data.fertileWindow ? (
            <View style={styles.windowRow}>
              <View style={[styles.windowDot, { backgroundColor: "#F2C9A2" }]} />
              <View style={styles.windowInfo}>
                <ThemedText type="body" style={{ color: theme.text }}>Fertile Window</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {formatDateRange(data.fertileWindow.from, data.fertileWindow.to)}
                </ThemedText>
              </View>
            </View>
          ) : null}
          {data.ovulationWindow ? (
            <View style={styles.windowRow}>
              <View style={[styles.windowDot, { backgroundColor: "#FFD166" }]} />
              <View style={styles.windowInfo}>
                <ThemedText type="body" style={{ color: theme.text }}>Ovulation Estimate</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {formatDateRange(data.ovulationWindow.from, data.ovulationWindow.to)}
                </ThemedText>
              </View>
            </View>
          ) : null}
        </GlassSurface>
      ) : null}

      {hasMoodEnergy ? (
        <View style={styles.moodEnergyRow}>
          {data.moodSummary ? (
            <GlassSurface style={styles.summaryCard}>
              <Feather name="smile" size={20} color={theme.primary} />
              <ThemedText type="h4" style={{ color: theme.text, marginTop: Spacing.sm }}>
                {capitalize(data.moodSummary.level)}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {data.moodSummary.message}
              </ThemedText>
            </GlassSurface>
          ) : null}
          {data.energySummary ? (
            <GlassSurface style={styles.summaryCard}>
              <Feather name="zap" size={20} color={theme.secondary || "#F2C9A2"} />
              <ThemedText type="h4" style={{ color: theme.text, marginTop: Spacing.sm }}>
                {capitalize(data.energySummary.level)}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {data.energySummary.message}
              </ThemedText>
            </GlassSurface>
          ) : null}
        </View>
      ) : null}

      {data.tips.length > 0 ? (
        <GlassSurface style={styles.tipsCard}>
          <ThemedText type="h4" style={[styles.sectionLabel, { color: theme.text }]}>
            Tips for You
          </ThemedText>
          {data.tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Feather name="heart" size={14} color={theme.primary} style={{ marginTop: 2 }} />
              <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
                {tip}
              </ThemedText>
            </View>
          ))}
        </GlassSurface>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  phaseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  phaseIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseInfo: {
    flex: 1,
    gap: 2,
  },
  windowsCard: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    marginBottom: Spacing.xs,
  },
  windowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  windowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  windowInfo: {
    flex: 1,
    gap: 1,
  },
  moodEnergyRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    gap: 2,
  },
  tipsCard: {
    gap: Spacing.sm,
  },
  tipRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: 2,
  },
});

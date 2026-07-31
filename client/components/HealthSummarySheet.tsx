/**
 * HealthSummarySheet
 *
 * A bottom sheet that shows a compiled health summary the user can copy or
 * share with a healthcare provider. Privacy toggle hides personal notes by
 * default — users explicitly opt in before sharing free-text entries.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Share,
  ActivityIndicator,
  Switch,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { storage } from "@/lib/storage";
import { getSymptomLogs, getDailyCheckIns } from "@/lib/symptomStorage";
import {
  buildHealthSummary,
  summaryToShareText,
  HealthSummary,
} from "@/lib/buildHealthSummary";

// ─── Colours ─────────────────────────────────────────────────────────────────
const PINK = "#F06B9A";
const BG_SHEET = "#FFFFFF";
const TEXT_DARK = "#2D1F2B";
const TEXT_MID = "#5A4252";
const TEXT_SOFT = "#8A6F80";
const DIVIDER = "#F0E4EC";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

function SymptomPill({ name, count }: { name: string; count: number }) {
  return (
    <View style={styles.symptomPill}>
      <Text style={styles.symptomPillText}>
        {name}
        <Text style={styles.symptomPillCount}> ×{count}</Text>
      </Text>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function HealthSummarySheet({ visible, onDismiss }: Props) {
  const insets = useSafeAreaInsets();

  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, logs, symLogs, checkIns] = await Promise.all([
        storage.getUserProfile(),
        storage.getDailyLogs(),
        getSymptomLogs(),
        getDailyCheckIns(),
      ]);
      setSummary(buildHealthSummary(logs, symLogs, profile, checkIns));
    } catch (e) {
      console.error("[HealthSummarySheet] load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setCopied(false);
      setIncludeNotes(false);
      load();
    }
  }, [visible, load]);

  const shareText = summary
    ? summaryToShareText(summary, includeNotes)
    : "";

  const handleCopy = async () => {
    if (!shareText) return;
    await Clipboard.setStringAsync(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!shareText) return;
    try {
      await Share.share(
        Platform.OS === "ios"
          ? { message: shareText }
          : { message: shareText, title: "My Olanna Health Summary" }
      );
    } catch {}
  };

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onDismiss} />
        <Animated.View
          entering={FadeInDown.duration(260)}
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) + 8 },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Feather name="file-text" size={18} color={PINK} />
              <Text style={styles.title}>My Health Summary</Text>
            </View>
            <Pressable onPress={onDismiss} hitSlop={12}>
              <Feather name="x" size={20} color={TEXT_SOFT} />
            </Pressable>
          </View>

          {loading || !summary ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={PINK} />
              <Text style={styles.loadingText}>Building your summary…</Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Blurb */}
              <View style={styles.blurbCard}>
                <Text style={styles.blurbText}>{summary.blurb}</Text>
              </View>

              {/* Overview */}
              <SectionHeader title="OVERVIEW" />
              <View style={styles.card}>
                <DataRow
                  label="Data collected"
                  value={
                    summary.dateRange
                      ? `${formatDate(summary.dateRange.start)} – ${formatDate(summary.dateRange.end)}`
                      : "No data yet"
                  }
                />
                <View style={styles.cardDivider} />
                <DataRow
                  label="Days logged"
                  value={`${summary.totalLogDays} day${summary.totalLogDays !== 1 ? "s" : ""}`}
                />
                {summary.cycleCount > 0 && (
                  <>
                    <View style={styles.cardDivider} />
                    <DataRow
                      label="Cycles covered"
                      value={`${summary.cycleCount}`}
                    />
                  </>
                )}
                <View style={styles.cardDivider} />
                <DataRow
                  label="Average cycle length"
                  value={`${summary.cycleLength} days`}
                />
              </View>

              {/* Flow */}
              {summary.flowDays > 0 && (
                <>
                  <SectionHeader title="FLOW" />
                  <View style={styles.card}>
                    <DataRow
                      label="Flow days logged"
                      value={`${summary.flowDays} day${summary.flowDays !== 1 ? "s" : ""}`}
                    />
                    {summary.heavyFlowDays > 0 && (
                      <>
                        <View style={styles.cardDivider} />
                        <DataRow
                          label="Heavy flow days"
                          value={`${summary.heavyFlowDays} day${summary.heavyFlowDays !== 1 ? "s" : ""}`}
                        />
                      </>
                    )}
                  </View>
                </>
              )}

              {/* Top symptoms */}
              {summary.topSymptoms.length > 0 && (
                <>
                  <SectionHeader title="MOST LOGGED SYMPTOMS" />
                  <View style={styles.pillsWrap}>
                    {summary.topSymptoms.slice(0, 8).map((s) => (
                      <SymptomPill key={s.id} name={s.name} count={s.count} />
                    ))}
                  </View>
                  {summary.topSymptoms.some((s) => s.avgSeverity !== null) && (
                    <View style={[styles.card, { marginTop: 8 }]}>
                      {summary.topSymptoms
                        .filter((s) => s.avgSeverity !== null)
                        .slice(0, 5)
                        .map((s, i, arr) => (
                          <React.Fragment key={s.id}>
                            <DataRow
                              label={s.name}
                              value={`avg severity ${s.avgSeverity}/5`}
                            />
                            {i < arr.length - 1 && (
                              <View style={styles.cardDivider} />
                            )}
                          </React.Fragment>
                        ))}
                    </View>
                  )}
                </>
              )}

              {/* By phase */}
              {summary.phaseSnapshots.length > 0 && (
                <>
                  <SectionHeader title="BY CYCLE PHASE" />
                  <View style={styles.card}>
                    {summary.phaseSnapshots.map((p, i) => (
                      <React.Fragment key={p.phase}>
                        {i > 0 && <View style={styles.cardDivider} />}
                        <View style={styles.phaseRow}>
                          <Text style={styles.phaseLabel}>{p.label}</Text>
                          {p.topSymptoms.length > 0 ? (
                            <Text style={styles.phaseSymptoms}>
                              {p.topSymptoms.join(" · ")}
                            </Text>
                          ) : (
                            <Text style={[styles.phaseSymptoms, { color: TEXT_SOFT }]}>
                              No symptoms logged
                            </Text>
                          )}
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                </>
              )}

              {/* Privacy toggle */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleLabel}>Include personal notes</Text>
                  <Text style={styles.toggleSub}>
                    Your free-text notes are hidden by default for privacy when sharing
                  </Text>
                </View>
                <Switch
                  value={includeNotes}
                  onValueChange={setIncludeNotes}
                  trackColor={{ false: "#E5D5E0", true: PINK }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  onPress={handleCopy}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.actionBtnOutline,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Feather
                    name={copied ? "check" : "copy"}
                    size={16}
                    color={PINK}
                  />
                  <Text style={[styles.actionBtnText, { color: PINK }]}>
                    {copied ? "Copied!" : "Copy"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleShare}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.actionBtnFilled,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Feather name="share-2" size={16} color="#FFFFFF" />
                  <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>
                    Share with provider
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.disclaimer}>
                Your provider can use this to understand your cycle and symptom patterns. Even a few weeks of logs helps them see what's normal for you.
              </Text>
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  sheet: {
    backgroundColor: BG_SHEET,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(128,128,128,0.25)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_DARK,
    letterSpacing: 0.1,
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: TEXT_SOFT,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 6,
  },
  blurbCard: {
    backgroundColor: "rgba(240,107,154,0.08)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  blurbText: {
    fontSize: 14,
    lineHeight: 21,
    color: TEXT_DARK,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_SOFT,
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 4,
  },
  card: {
    backgroundColor: "#FBF5F8",
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginHorizontal: -4,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    gap: 12,
  },
  dataLabel: {
    fontSize: 14,
    color: TEXT_MID,
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
    textAlign: "right",
    flexShrink: 1,
  },
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 2,
  },
  symptomPill: {
    backgroundColor: "#F5EDF3",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  symptomPillText: {
    fontSize: 13,
    color: TEXT_DARK,
    fontWeight: "500",
  },
  symptomPillCount: {
    color: TEXT_SOFT,
    fontWeight: "400",
  },
  phaseRow: {
    paddingVertical: 11,
    gap: 3,
  },
  phaseLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  phaseSymptoms: {
    fontSize: 13,
    color: TEXT_MID,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
    gap: 12,
    backgroundColor: "#FBF5F8",
    borderRadius: 14,
    padding: 14,
  },
  toggleText: {
    flex: 1,
    gap: 3,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  toggleSub: {
    fontSize: 12,
    color: TEXT_SOFT,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 25,
  },
  actionBtnOutline: {
    borderWidth: 1.5,
    borderColor: PINK,
    backgroundColor: "transparent",
  },
  actionBtnFilled: {
    backgroundColor: PINK,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  disclaimer: {
    fontSize: 12,
    color: TEXT_SOFT,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 12,
    paddingHorizontal: 8,
  },
});

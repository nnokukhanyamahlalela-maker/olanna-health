import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Picker } from "@react-native-picker/picker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { SeveritySlider } from "@/components/SeveritySlider";
import { AppGradient } from "@/components/AppGradient";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  fertilityTracking,
  BBTEntry,
  CervicalMucusEntry,
  LHTestEntry,
  CervicalMucusType,
  LHTestResult,
  FertilityWindow,
} from "@/lib/fertilityTracking";
import { storage } from "@/lib/storage";

type TabType = "bbt" | "mucus" | "lh" | "overview";

const MUCUS_TYPES: { value: CervicalMucusType; label: string; description: string }[] = [
  { value: "dry", label: "Dry", description: "No noticeable mucus" },
  { value: "sticky", label: "Sticky", description: "Thick, tacky texture" },
  { value: "creamy", label: "Creamy", description: "Lotion-like, white" },
  { value: "watery", label: "Watery", description: "Clear and wet" },
  { value: "egg-white", label: "Egg White", description: "Stretchy, fertile mucus" },
];

const LH_RESULTS: { value: LHTestResult; label: string; color: string }[] = [
  { value: "negative", label: "Negative", color: "#9CA3AF" },
  { value: "low", label: "Low", color: "#FCD34D" },
  { value: "high", label: "High", color: "#F97316" },
  { value: "peak", label: "Peak", color: "#EF4444" },
];

export default function FertilityTrackingScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const today = new Date().toISOString().split("T")[0];

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [bbtLogs, setBbtLogs] = useState<BBTEntry[]>([]);
  const [mucusLogs, setMucusLogs] = useState<CervicalMucusEntry[]>([]);
  const [lhTests, setLhTests] = useState<LHTestEntry[]>([]);
  const [fertilityWindow, setFertilityWindow] = useState<FertilityWindow | null>(null);

  // BBT Modal
  const [showBBTModal, setShowBBTModal] = useState(false);
  const [bbtTemp, setBbtTemp] = useState("");
  const [bbtUnit, setBbtUnit] = useState<"celsius" | "fahrenheit">("celsius");
  const [bbtTime, setBbtTime] = useState("06:00");

  // Mucus Modal
  const [showMucusModal, setShowMucusModal] = useState(false);
  const [mucusType, setMucusType] = useState<CervicalMucusType>("dry");
  const [mucusAmount, setMucusAmount] = useState<"none" | "light" | "moderate" | "heavy">("light");

  // LH Modal
  const [showLHModal, setShowLHModal] = useState(false);
  const [lhResult, setLhResult] = useState<LHTestResult>("negative");
  const [lhTime, setLhTime] = useState("12:00");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const cycleData = await storage.getCycleData();
    const bbt = await fertilityTracking.getBBTLogs();
    const mucus = await fertilityTracking.getMucusLogs();
    const lh = await fertilityTracking.getLHTests();
    
    setBbtLogs(bbt.slice(0, 14));
    setMucusLogs(mucus.slice(0, 14));
    setLhTests(lh.slice(0, 14));

    if (cycleData) {
      const window = await fertilityTracking.calculateFertilityWindow(
        cycleData.lastPeriodStart,
        cycleData.cycleLength
      );
      setFertilityWindow(window);
    }
  };

  const handleSaveBBT = async () => {
    const temp = parseFloat(bbtTemp);
    if (isNaN(temp)) return;

    await fertilityTracking.saveBBTEntry({
      date: today,
      temperature: temp,
      unit: bbtUnit,
      time: bbtTime,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowBBTModal(false);
    setBbtTemp("");
    loadData();
  };

  const handleSaveMucus = async () => {
    await fertilityTracking.saveMucusEntry({
      date: today,
      type: mucusType,
      amount: mucusAmount,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowMucusModal(false);
    loadData();
  };

  const handleSaveLH = async () => {
    await fertilityTracking.saveLHTest({
      date: today,
      result: lhResult,
      time: lhTime,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowLHModal(false);
    loadData();
  };

  const renderTab = (tab: TabType, label: string, icon: keyof typeof Feather.glyphMap) => (
    <Pressable
      key={tab}
      style={[
        styles.tab,
        { backgroundColor: activeTab === tab ? theme.primary : theme.backgroundDefault },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveTab(tab);
      }}
    >
      <Feather
        name={icon}
        size={16}
        color={activeTab === tab ? theme.buttonText : theme.textSecondary}
      />
      <ThemedText
        type="caption"
        style={[
          styles.tabText,
          { color: activeTab === tab ? theme.buttonText : theme.textSecondary },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

  const renderOverview = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      {fertilityWindow ? (
        <View style={[styles.windowCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.windowHeader}>
            <View style={[styles.windowIcon, { backgroundColor: theme.accent + "20" }]}>
              <Feather name="calendar" size={24} color={theme.accent} />
            </View>
            <View style={styles.windowInfo}>
              <ThemedText type="h4">Fertile Window</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {fertilityWindow.startDate} to {fertilityWindow.endDate}
              </ThemedText>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(fertilityWindow.confidence) + "20" }]}>
              <ThemedText type="caption" style={{ color: getConfidenceColor(fertilityWindow.confidence) }}>
                {fertilityWindow.confidence.charAt(0).toUpperCase() + fertilityWindow.confidence.slice(1)}
              </ThemedText>
            </View>
          </View>
          
          <View style={[styles.peakDay, { backgroundColor: theme.primary + "15" }]}>
            <Feather name="star" size={16} color={theme.primary} />
            <ThemedText type="body">
              Peak Fertility: <ThemedText type="body" style={{ fontWeight: "700" }}>{fertilityWindow.peakFertilityDate}</ThemedText>
            </ThemedText>
          </View>

          <View style={styles.indicatorsList}>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
              Based on:
            </ThemedText>
            {fertilityWindow.indicators.map((indicator, index) => (
              <View key={index} style={styles.indicatorRow}>
                <Feather name="check-circle" size={14} color={theme.accent} />
                <ThemedText type="small">{indicator}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="calendar" size={40} color={theme.textSecondary} />
          <ThemedText type="body" style={{ textAlign: "center", marginTop: Spacing.md }}>
            Start tracking to see your fertility window
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Log BBT, cervical mucus, or LH tests for more accurate predictions
          </ThemedText>
        </View>
      )}

      <ThemedText type="h4" style={styles.sectionTitle}>Quick Log</ThemedText>
      
      <View style={styles.quickActions}>
        <Pressable
          style={[styles.quickAction, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => setShowBBTModal(true)}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="thermometer" size={20} color={theme.primary} />
          </View>
          <ThemedText type="small">Log BBT</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.quickAction, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => setShowMucusModal(true)}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.accent + "20" }]}>
            <Feather name="droplet" size={20} color={theme.accent} />
          </View>
          <ThemedText type="small">Cervical Mucus</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.quickAction, { backgroundColor: theme.backgroundDefault }]}
          onPress={() => setShowLHModal(true)}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.tertiary + "40" }]}>
            <Feather name="activity" size={20} color={theme.text} />
          </View>
          <ThemedText type="small">LH Test</ThemedText>
        </Pressable>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>Recent Logs</ThemedText>
      
      {bbtLogs.length > 0 || mucusLogs.length > 0 || lhTests.length > 0 ? (
        <View style={styles.recentLogs}>
          {bbtLogs.slice(0, 3).map((log) => (
            <View key={log.id} style={[styles.logItem, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="thermometer" size={16} color={theme.primary} />
              <ThemedText type="small" style={{ flex: 1 }}>{log.date}</ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {log.temperature}°{log.unit === "celsius" ? "C" : "F"}
              </ThemedText>
            </View>
          ))}
          {mucusLogs.slice(0, 3).map((log) => (
            <View key={log.id} style={[styles.logItem, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="droplet" size={16} color={theme.accent} />
              <ThemedText type="small" style={{ flex: 1 }}>{log.date}</ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
              </ThemedText>
            </View>
          ))}
          {lhTests.slice(0, 3).map((log) => (
            <View key={log.id} style={[styles.logItem, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="activity" size={16} color={theme.tertiary} />
              <ThemedText type="small" style={{ flex: 1 }}>{log.date}</ThemedText>
              <View style={[styles.lhBadge, { backgroundColor: LH_RESULTS.find(r => r.value === log.result)?.color + "20" }]}>
                <ThemedText type="caption" style={{ color: LH_RESULTS.find(r => r.value === log.result)?.color }}>
                  {log.result.charAt(0).toUpperCase() + log.result.slice(1)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            No fertility data logged yet. Start tracking above.
          </ThemedText>
        </View>
      )}
    </Animated.View>
  );

  const renderBBTTab = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Button onPress={() => setShowBBTModal(true)} style={styles.addButton}>
        Log Today's BBT
      </Button>

      <ThemedText type="h4" style={styles.sectionTitle}>Temperature History</ThemedText>
      
      {bbtLogs.length > 0 ? (
        <View style={styles.logsList}>
          {bbtLogs.map((log) => (
            <View key={log.id} style={[styles.logCard, { backgroundColor: theme.backgroundDefault }]}>
              <View style={styles.logCardHeader}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>{log.date}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>{log.time}</ThemedText>
              </View>
              <ThemedText type="h3" style={{ color: theme.primary }}>
                {log.temperature}°{log.unit === "celsius" ? "C" : "F"}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="thermometer" size={40} color={theme.textSecondary} />
          <ThemedText type="body" style={{ textAlign: "center", marginTop: Spacing.md }}>
            No BBT data yet
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Take your temperature first thing each morning for best results
          </ThemedText>
        </View>
      )}
    </Animated.View>
  );

  const renderMucusTab = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Button onPress={() => setShowMucusModal(true)} style={styles.addButton}>
        Log Cervical Mucus
      </Button>

      <ThemedText type="h4" style={styles.sectionTitle}>Mucus History</ThemedText>
      
      {mucusLogs.length > 0 ? (
        <View style={styles.logsList}>
          {mucusLogs.map((log) => (
            <View key={log.id} style={[styles.logCard, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>{log.date}</ThemedText>
              <View style={styles.mucusInfo}>
                <ThemedText type="h4" style={{ color: theme.accent }}>
                  {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {log.amount} amount
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="droplet" size={40} color={theme.textSecondary} />
          <ThemedText type="body" style={{ textAlign: "center", marginTop: Spacing.md }}>
            No cervical mucus data yet
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Track changes throughout your cycle to identify fertile days
          </ThemedText>
        </View>
      )}
    </Animated.View>
  );

  const renderLHTab = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Button onPress={() => setShowLHModal(true)} style={styles.addButton}>
        Log LH Test Result
      </Button>

      <ThemedText type="h4" style={styles.sectionTitle}>Test History</ThemedText>
      
      {lhTests.length > 0 ? (
        <View style={styles.logsList}>
          {lhTests.map((log) => (
            <View key={log.id} style={[styles.logCard, { backgroundColor: theme.backgroundDefault }]}>
              <View style={styles.logCardHeader}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>{log.date}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>{log.time}</ThemedText>
              </View>
              <View style={[styles.lhResultBadge, { backgroundColor: LH_RESULTS.find(r => r.value === log.result)?.color + "20" }]}>
                <ThemedText type="h4" style={{ color: LH_RESULTS.find(r => r.value === log.result)?.color }}>
                  {log.result.charAt(0).toUpperCase() + log.result.slice(1)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="activity" size={40} color={theme.textSecondary} />
          <ThemedText type="body" style={{ textAlign: "center", marginTop: Spacing.md }}>
            No LH test results yet
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Test mid-morning or early afternoon for best accuracy
          </ThemedText>
        </View>
      )}
    </Animated.View>
  );

  const getConfidenceColor = (confidence: "low" | "medium" | "high") => {
    switch (confidence) {
      case "high": return theme.accent;
      case "medium": return theme.tertiary;
      case "low": return theme.textSecondary;
    }
  };

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["2xl"],
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabBar}>
          {renderTab("overview", "Overview", "eye")}
          {renderTab("bbt", "BBT", "thermometer")}
          {renderTab("mucus", "Mucus", "droplet")}
          {renderTab("lh", "LH Test", "activity")}
        </View>

        {activeTab === "overview" && renderOverview()}
        {activeTab === "bbt" && renderBBTTab()}
        {activeTab === "mucus" && renderMucusTab()}
        {activeTab === "lh" && renderLHTab()}
      </ScrollView>

      {/* BBT Modal */}
      <Modal visible={showBBTModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Log BBT</ThemedText>
              <Pressable onPress={() => setShowBBTModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
              Take your temperature first thing in the morning before getting up.
            </ThemedText>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.tempInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={bbtTemp}
                onChangeText={setBbtTemp}
                placeholder={bbtUnit === "celsius" ? "36.5" : "97.7"}
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
              />
              <View style={[styles.unitPicker, { backgroundColor: theme.backgroundSecondary }]}>
                <Picker
                  selectedValue={bbtUnit}
                  onValueChange={(value) => setBbtUnit(value)}
                  style={{ color: theme.text }}
                >
                  <Picker.Item label="°C" value="celsius" />
                  <Picker.Item label="°F" value="fahrenheit" />
                </Picker>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button variant="secondary" onPress={() => setShowBBTModal(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button onPress={handleSaveBBT} style={{ flex: 1 }}>
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mucus Modal */}
      <Modal visible={showMucusModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Cervical Mucus</ThemedText>
              <Pressable onPress={() => setShowMucusModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
              Select the type that best describes what you observed today.
            </ThemedText>

            <View style={styles.mucusOptions}>
              {MUCUS_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  style={[
                    styles.mucusOption,
                    { 
                      backgroundColor: mucusType === type.value ? theme.accent + "20" : theme.backgroundSecondary,
                      borderColor: mucusType === type.value ? theme.accent : "transparent",
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setMucusType(type.value);
                  }}
                >
                  <ThemedText type="body" style={{ fontWeight: "600" }}>{type.label}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>{type.description}</ThemedText>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button variant="secondary" onPress={() => setShowMucusModal(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button onPress={handleSaveMucus} style={{ flex: 1 }}>
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* LH Modal */}
      <Modal visible={showLHModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">LH Test Result</ThemedText>
              <Pressable onPress={() => setShowLHModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
              Compare your test line to the control line.
            </ThemedText>

            <View style={styles.lhOptions}>
              {LH_RESULTS.map((result) => (
                <Pressable
                  key={result.value}
                  style={[
                    styles.lhOption,
                    { 
                      backgroundColor: lhResult === result.value ? result.color + "20" : theme.backgroundSecondary,
                      borderColor: lhResult === result.value ? result.color : "transparent",
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLhResult(result.value);
                  }}
                >
                  <View style={[styles.lhDot, { backgroundColor: result.color }]} />
                  <ThemedText type="body" style={{ fontWeight: "600" }}>{result.label}</ThemedText>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button variant="secondary" onPress={() => setShowLHModal(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button onPress={handleSaveLH} style={{ flex: 1 }}>
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  tabText: {
    fontWeight: "600",
  },
  windowCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  windowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  windowIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  windowInfo: {
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  peakDay: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  indicatorsList: {
    gap: Spacing.xs,
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  quickActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  recentLogs: {
    gap: Spacing.xs,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  lhBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  emptyState: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  addButton: {
    marginBottom: Spacing.md,
  },
  logsList: {
    gap: Spacing.sm,
  },
  logCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  logCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  mucusInfo: {
    marginTop: Spacing.sm,
  },
  lhResultBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  tempInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    textAlign: "center",
  },
  unitPicker: {
    width: 80,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
  },
  mucusOptions: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  mucusOption: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  lhOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  lhOption: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  lhDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
});

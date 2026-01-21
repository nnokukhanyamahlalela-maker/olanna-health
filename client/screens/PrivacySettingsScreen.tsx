import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { privacyStorage, PrivacySettings } from "@/lib/privacyStorage";

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  iconColor?: string;
}

function SettingRow({ icon, title, description, value, onToggle, iconColor }: SettingRowProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.settingRow, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.settingIcon, { backgroundColor: (iconColor || theme.primary) + "15" }]}>
        <Feather name={icon} size={20} color={iconColor || theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText type="body" style={styles.settingTitle}>{title}</ThemedText>
        <ThemedText type="caption" style={[styles.settingDesc, { color: theme.textSecondary }]}>
          {description}
        </ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle(newValue);
        }}
        trackColor={{ false: theme.border, true: theme.primary + "80" }}
        thumbColor={value ? theme.primary : theme.backgroundSecondary}
      />
    </View>
  );
}

interface ActionRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  iconColor?: string;
  destructive?: boolean;
}

function ActionRow({ icon, title, description, onPress, iconColor, destructive }: ActionRowProps) {
  const { theme } = useTheme();
  const color = destructive ? theme.error : (iconColor || theme.primary);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={[styles.settingIcon, { backgroundColor: color + "15" }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText type="body" style={[styles.settingTitle, destructive && { color: theme.error }]}>
          {title}
        </ThemedText>
        <ThemedText type="caption" style={[styles.settingDesc, { color: theme.textSecondary }]}>
          {description}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function PrivacySettingsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<PrivacySettings>({
    anonymousMode: false,
    shareAnonymizedData: false,
    partnerSyncEnabled: false,
    cloudBackupEnabled: false,
    dataRetentionMonths: 24,
    offlineModePreferred: false,
    lowDataMode: false,
  });
  const [dataSummary, setDataSummary] = useState<Record<string, number>>({});
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadSettings();
    loadDataSummary();
  }, []);

  const loadSettings = async () => {
    const current = await privacyStorage.getPrivacySettings();
    setSettings(current);
  };

  const loadDataSummary = async () => {
    const summary = await privacyStorage.getDataSummary();
    setDataSummary(summary);
  };

  const updateSetting = async <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await privacyStorage.savePrivacySettings({ [key]: value });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const success = await privacyStorage.shareExportedData();
      if (!success) {
        const alertMessage = "Data export is not available on this device. Your data is stored securely on your device.";
        if (Platform.OS === "web") {
          window.alert(alertMessage);
        } else {
          Alert.alert("Export Unavailable", alertMessage);
        }
      }
    } catch {
      const errorMessage = "Failed to export data. Please try again.";
      if (Platform.OS === "web") {
        window.alert(errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = (category: "cycle" | "symptoms" | "screenings" | "profile" | "all") => {
    const categoryLabels: Record<string, string> = {
      cycle: "cycle data",
      symptoms: "symptom logs",
      screenings: "screening reminders",
      profile: "profile information",
      all: "ALL data",
    };

    const message = `Are you sure you want to delete your ${categoryLabels[category]}? This cannot be undone.`;

    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        performDelete(category);
      }
    } else {
      Alert.alert(
        "Delete Data",
        message,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => performDelete(category),
          },
        ]
      );
    }
  };

  const performDelete = async (category: "cycle" | "symptoms" | "screenings" | "profile" | "all") => {
    await privacyStorage.deleteSpecificData(category);
    await loadDataSummary();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const successMessage = category === "all" 
      ? "All data has been deleted." 
      : "Data has been deleted successfully.";
    
    if (Platform.OS === "web") {
      window.alert(successMessage);
    } else {
      Alert.alert("Success", successMessage);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(300)}>
        <View style={[styles.infoCard, { backgroundColor: theme.accent + "20" }]}>
          <Feather name="shield" size={24} color={theme.accent} />
          <View style={styles.infoContent}>
            <ThemedText type="h4">Your Privacy Matters</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              All your health data is stored locally on your device. We never sell or share your personal information.
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(300).delay(100)}>
        <ThemedText type="h4" style={styles.sectionTitle}>Privacy Mode</ThemedText>
        <View style={styles.section}>
          <SettingRow
            icon="user-x"
            title="Anonymous Mode"
            description="Use the app without creating a profile. Your data stays completely private."
            value={settings.anonymousMode}
            onToggle={(value) => updateSetting("anonymousMode", value)}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(300).delay(200)}>
        <ThemedText type="h4" style={styles.sectionTitle}>Data Controls</ThemedText>
        <View style={styles.section}>
          <SettingRow
            icon="cloud-off"
            title="Offline Mode"
            description="Keep all features available without internet connection."
            value={settings.offlineModePreferred}
            onToggle={(value) => updateSetting("offlineModePreferred", value)}
            iconColor={theme.info}
          />
          <SettingRow
            icon="wifi-off"
            title="Low Data Mode"
            description="Reduce data usage by disabling animations and high-res images."
            value={settings.lowDataMode}
            onToggle={(value) => updateSetting("lowDataMode", value)}
            iconColor={theme.info}
          />
          <SettingRow
            icon="share-2"
            title="Share Anonymized Data"
            description="Help improve women's health research with anonymized insights."
            value={settings.shareAnonymizedData}
            onToggle={(value) => updateSetting("shareAnonymizedData", value)}
            iconColor={theme.secondary}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(300).delay(300)}>
        <ThemedText type="h4" style={styles.sectionTitle}>Your Data</ThemedText>
        
        <View style={[styles.dataSummary, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
            Currently stored on your device:
          </ThemedText>
          <View style={styles.dataRow}>
            <ThemedText type="body">Cycle Records</ThemedText>
            <ThemedText type="body" style={{ color: theme.primary }}>{dataSummary.cycleRecords || 0}</ThemedText>
          </View>
          <View style={styles.dataRow}>
            <ThemedText type="body">Symptom Logs</ThemedText>
            <ThemedText type="body" style={{ color: theme.primary }}>{dataSummary.symptomLogs || 0}</ThemedText>
          </View>
          <View style={styles.dataRow}>
            <ThemedText type="body">Screenings</ThemedText>
            <ThemedText type="body" style={{ color: theme.primary }}>{dataSummary.screenings || 0}</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ActionRow
            icon="download"
            title="Export My Data"
            description="Download all your health data as a JSON file."
            onPress={handleExportData}
            iconColor={theme.accent}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(300).delay(400)}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.error }]}>Delete Data</ThemedText>
        <View style={styles.section}>
          <ActionRow
            icon="trash-2"
            title="Delete Cycle Data"
            description="Remove all period and cycle tracking data."
            onPress={() => handleDeleteData("cycle")}
            destructive
          />
          <ActionRow
            icon="trash-2"
            title="Delete Symptom Logs"
            description="Remove all symptom check-ins and body map data."
            onPress={() => handleDeleteData("symptoms")}
            destructive
          />
          <ActionRow
            icon="trash-2"
            title="Delete All Data"
            description="Permanently remove all your data from this device."
            onPress={() => handleDeleteData("all")}
            destructive
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(300).delay(500)}>
        <View style={[styles.policyCard, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="file-text" size={20} color={theme.textSecondary} />
          <ThemedText type="small" style={[styles.policyText, { color: theme.textSecondary }]}>
            Read our full Privacy Policy to understand how we protect your data and your rights.
          </ThemedText>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  section: {
    gap: Spacing.xs,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: "600",
  },
  settingDesc: {
    marginTop: 2,
  },
  dataSummary: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
  },
  policyCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  policyText: {
    flex: 1,
  },
});

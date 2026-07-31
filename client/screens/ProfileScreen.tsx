import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { HealthSummarySheet } from "@/components/HealthSummarySheet";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserProfile } from "@/lib/storage";
import { privacyStorage } from "@/lib/privacyStorage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  showChevron?: boolean;
  isLast?: boolean;
  theme: ReturnType<typeof useTheme>["theme"];
  isDark?: boolean;
}

function MenuItem({ icon, label, onPress, color, showChevron = true, isLast = false, theme, isDark = false }: MenuItemProps) {
  const iconColor = color || "#C2185B";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { opacity: pressed ? 0.8 : 1 },
        isLast ? null : { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: isDark ? "rgba(42,23,48,0.35)" : "rgba(255,255,255,0.45)", borderWidth: StyleSheet.hairlineWidth, borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.50)" }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <ThemedText type="body" style={[styles.menuLabel, { color: theme.text }]}>
        {label}
      </ThemedText>
      {showChevron ? (
        <Feather name="chevron-right" size={18} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summaryVisible, setSummaryVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      storage.getUserProfile().then((userProfile) => {
        if (active) setProfile(userProfile);
      });
      return () => { active = false; };
    }, [])
  );

  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExporting(true);
    try {
      const shared = await privacyStorage.shareExportedData();
      if (!shared) {
        Alert.alert("Export", "Sharing is not available on this device. You can export from Privacy & Data settings.");
      }
    } catch {
      Alert.alert("Export Failed", "Unable to export your data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleComingSoon = (feature: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(feature, "This feature is coming soon.");
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const doReset = async () => {
      await storage.clearAllData();
      navigation.replace("Onboarding" as any);
    };
    if (Platform.OS === "web") {
      if (window.confirm("Reset all app data? This removes your profile, cycle history, and logs. It cannot be undone.")) {
        await doReset();
      }
    } else {
      Alert.alert(
        "Reset App Data",
        "This will remove your profile, cycle history, and all logs. It cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reset Everything", style: "destructive", onPress: doReset },
        ]
      );
    }
  };

  return (
    <AppGradient style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
      <GlassSurface style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={["#F7A37A", "#E85A9C", "#D070A0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <View style={[styles.avatarInner, { backgroundColor: theme.backgroundDefault }]}>
              <View style={[styles.avatarO, { borderColor: theme.primary }]} />
            </View>
          </LinearGradient>
        </View>
        <View style={styles.profileInfo}>
          <ThemedText type="h3" style={{ color: theme.text }}>{profile?.name || "Guest User"}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {profile ? `Tracking for ${profile.cycleLength} day cycle` : "Set up your profile to get started"}
          </ThemedText>
        </View>
        {profile ? (
          <Pressable
            onPress={() => navigation.navigate("EditProfile")}
            style={({ pressed }) => [
              styles.editButton,
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: isDark ? "rgba(42,23,48,0.35)" : "rgba(255,255,255,0.25)",
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.40)",
              },
            ]}
          >
            <Feather name="edit-2" size={16} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </GlassSurface>

      {!profile ? (
        <Button
          onPress={() => navigation.navigate("Onboarding")}
          style={styles.getStartedButton}
        >
          Get Started
        </Button>
      ) : null}

      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
          Support
        </ThemedText>
        <GlassSurface noPadding borderRadius={BorderRadius.xl}>
          <MenuItem
            icon="users"
            label="Community"
            color="#6A5B7B"
            onPress={() => handleComingSoon("Community")}
            isLast
            theme={theme}
            isDark={isDark}
          />
        </GlassSurface>
      </View>

      {/* My Health Summary — primary CTA, reachable from Profile */}
      <View style={styles.section}>
        <GlassSurface noPadding borderRadius={BorderRadius.xl}>
          <MenuItem
            icon="clipboard"
            label="My Health Summary"
            color="#F06B9A"
            onPress={() => setSummaryVisible(true)}
            isLast
            theme={theme}
            isDark={isDark}
          />
        </GlassSurface>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
          Settings
        </ThemedText>
        <GlassSurface noPadding borderRadius={BorderRadius.xl}>
          <MenuItem
            icon="heart"
            label="Partner Mode"
            color="#C2185B"
            onPress={() => navigation.navigate("PartnerSettings")}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="users"
            label="Partner Dashboard"
            color="#6A5B7B"
            onPress={() => navigation.navigate("PartnerDashboard")}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="bell"
            label="Notifications"
            color="#D4764E"
            onPress={() => navigation.navigate("NotificationSettings")}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="lock"
            label="Privacy & Data"
            color="#7B5EA7"
            onPress={() => navigation.navigate("PrivacySettings")}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="download"
            label="Export Data"
            color="#5A8A6A"
            onPress={handleExportData}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="refresh-cw"
            label="Re-do Setup"
            color="#C2185B"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("ResetupOnboarding");
            }}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="help-circle"
            label="Help & Support"
            color="#6A7B8A"
            onPress={() => handleComingSoon("Help & Support")}
            isLast
            theme={theme}
            isDark={isDark}
          />
        </GlassSurface>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.text }]}>
          About
        </ThemedText>
        <GlassSurface noPadding borderRadius={BorderRadius.xl}>
          <MenuItem
            icon="info"
            label="About Olanna Health"
            color="#C2185B"
            onPress={() => navigation.navigate("About")}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="file-text"
            label="Terms of Service"
            color="#6A5B7B"
            onPress={() => navigation.navigate("TermsOfService")}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="shield"
            label="Privacy Policy"
            color="#7B5EA7"
            onPress={() => navigation.navigate("PrivacyStatement")}
            isLast
            theme={theme}
            isDark={isDark}
          />
        </GlassSurface>
      </View>

      {profile ? (
        <GlassSurface noPadding borderRadius={BorderRadius.xl} style={styles.logoutSection}>
          <MenuItem
            icon="trash-2"
            label="Reset App Data"
            color={theme.error}
            showChevron={false}
            onPress={handleLogout}
            isLast
            theme={theme}
            isDark={isDark}
          />
        </GlassSurface>
      ) : null}

      <ThemedText type="caption" style={[styles.version, { color: theme.textSecondary }]}>
        Version 1.0.0
      </ThemedText>
      </KeyboardAwareScrollViewCompat>
      <HealthSummarySheet
        visible={summaryVisible}
        onDismiss={() => setSummaryVisible(false)}
      />
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  avatarInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarO: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  getStartedButton: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: "transparent",
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
  },
  logoutSection: {
    marginBottom: Spacing.xl,
  },
  version: {
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});

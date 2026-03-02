import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserProfile } from "@/lib/storage";
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
  const iconColor = color || theme.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { opacity: pressed ? 0.8 : 1 },
        isLast ? null : { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: isDark ? "rgba(42,23,48,0.35)" : "rgba(255,255,255,0.25)", borderWidth: StyleSheet.hairlineWidth, borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.40)" }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <ThemedText type="body" style={[styles.menuLabel, { color: color || theme.textSecondary }]}>
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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userProfile = await storage.getUserProfile();
    setProfile(userProfile);
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out? All data will be cleared.")) {
        await storage.clearAllData();
        setProfile(null);
      }
    } else {
      Alert.alert(
        "Log Out",
        "Are you sure you want to log out? All data will be cleared.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Log Out",
            style: "destructive",
            onPress: async () => {
              await storage.clearAllData();
              setProfile(null);
            },
          },
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
            icon="message-circle"
            label="AI Health Assistant"
            color={theme.primary}
            onPress={() => navigation.navigate("AIChat")}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="users"
            label="Community"
            color={theme.secondary}
            onPress={() => {}}
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
            onPress={() => navigation.navigate("PartnerSettings")}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="users"
            label="Partner Dashboard"
            onPress={() => navigation.navigate("PartnerDashboard")}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="sun"
            label="Appearance"
            onPress={() => navigation.navigate("Appearance")}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="bell"
            label="Notifications"
            onPress={() => {}}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="lock"
            label="Privacy & Data"
            onPress={() => navigation.navigate("PrivacySettings")}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="download"
            label="Export Data"
            onPress={() => {}}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="help-circle"
            label="Help & Support"
            onPress={() => {}}
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
            onPress={() => {}}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="file-text"
            label="Terms of Service"
            onPress={() => {}}
            theme={theme}
            isDark={isDark}
          />
          <MenuItem
            icon="shield"
            label="Privacy Policy"
            onPress={() => {}}
            isLast
            theme={theme}
            isDark={isDark}
          />
        </GlassSurface>
      </View>

      {profile ? (
        <GlassSurface noPadding borderRadius={BorderRadius.xl} style={styles.logoutSection}>
          <MenuItem
            icon="log-out"
            label="Log Out"
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

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { AppGradient } from "@/components/AppGradient";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { storage, UserProfile } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const THEME_COLORS = {
  background: "#FFF7FA",
  cardBackground: "#FFFFFF",
  primary: "#E85A9C",
  primaryLight: "#FBE3EC",
  text: "#3A2F35",
  textSecondary: "#7A6A73",
  border: "#F5E8ED",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  showChevron?: boolean;
}

function MenuItem({ icon, label, onPress, color, showChevron = true }: MenuItemProps) {
  const iconColor = color || THEME_COLORS.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: THEME_COLORS.primaryLight }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <ThemedText type="body" style={[styles.menuLabel, { color: color || THEME_COLORS.textSecondary }]}>
        {label}
      </ThemedText>
      {showChevron ? (
        <Feather name="chevron-right" size={18} color={THEME_COLORS.textSecondary} />
      ) : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { theme } = useTheme();
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
          paddingBottom: insets.bottom + 110, // QA: Consistent bottom padding for glass tab bar
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={["#F7A37A", "#E85A9C", "#D070A0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <View style={styles.avatarInner}>
              <View style={styles.avatarO} />
            </View>
          </LinearGradient>
        </View>
        <View style={styles.profileInfo}>
          <ThemedText type="h3" style={{ color: THEME_COLORS.text }}>{profile?.name || "Guest User"}</ThemedText>
          <ThemedText type="small" style={styles.profileSubtext}>
            {profile ? `Tracking for ${profile.cycleLength} day cycle` : "Set up your profile to get started"}
          </ThemedText>
        </View>
        {profile ? (
          <Pressable
            onPress={() => navigation.navigate("EditProfile")}
            style={({ pressed }) => [
              styles.editButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="edit-2" size={16} color={THEME_COLORS.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {!profile ? (
        <Button
          onPress={() => navigation.navigate("Onboarding")}
          style={styles.getStartedButton}
        >
          Get Started
        </Button>
      ) : null}

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Support
        </ThemedText>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="message-circle"
            label="AI Health Assistant"
            color={theme.primary}
            onPress={() => navigation.navigate("AIChat")}
          />
          <MenuItem
            icon="users"
            label="Community"
            color={theme.secondary}
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Settings
        </ThemedText>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="sun"
            label="Appearance"
            onPress={() => navigation.navigate("Appearance")}
          />
          <MenuItem
            icon="bell"
            label="Notifications"
            onPress={() => {}}
          />
          <MenuItem
            icon="lock"
            label="Privacy & Data"
            onPress={() => navigation.navigate("PrivacySettings")}
          />
          <MenuItem
            icon="download"
            label="Export Data"
            onPress={() => {}}
          />
          <MenuItem
            icon="help-circle"
            label="Help & Support"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          About
        </ThemedText>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="info"
            label="About Olanna Health"
            onPress={() => {}}
          />
          <MenuItem
            icon="file-text"
            label="Terms of Service"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield"
            label="Privacy Policy"
            onPress={() => {}}
          />
        </View>
      </View>

      {profile ? (
        <View style={styles.logoutSection}>
          <MenuItem
            icon="log-out"
            label="Log Out"
            color={theme.error}
            showChevron={false}
            onPress={handleLogout}
          />
        </View>
      ) : null}

      <ThemedText type="caption" style={styles.version}>
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
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: THEME_COLORS.cardBackground,
    ...Shadows.sm,
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
    backgroundColor: THEME_COLORS.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarO: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: THEME_COLORS.primary,
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  profileSubtext: {
    color: THEME_COLORS.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME_COLORS.background,
  },
  getStartedButton: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    color: THEME_COLORS.text,
  },
  menuGroup: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    backgroundColor: THEME_COLORS.cardBackground,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: THEME_COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.border,
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
    backgroundColor: THEME_COLORS.cardBackground,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  version: {
    textAlign: "center",
    color: THEME_COLORS.textSecondary,
    marginTop: Spacing.lg,
  },
});

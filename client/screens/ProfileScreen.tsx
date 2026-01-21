import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { storage, UserProfile } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  showChevron?: boolean;
}

function MenuItem({ icon, label, onPress, color, showChevron = true }: MenuItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: (color || theme.primary) + "20" }]}>
        <Feather name={icon} size={20} color={color || theme.primary} />
      </View>
      <ThemedText type="body" style={[styles.menuLabel, color ? { color } : null]}>
        {label}
      </ThemedText>
      {showChevron ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
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
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.profileCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.primary + "20" }]}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.avatar}
            contentFit="cover"
          />
        </View>
        <View style={styles.profileInfo}>
          <ThemedText type="h3">{profile?.name || "Guest User"}</ThemedText>
          <ThemedText type="small" style={styles.profileSubtext}>
            {profile ? `Tracking for ${profile.cycleLength} day cycle` : "Set up your profile to get started"}
          </ThemedText>
        </View>
        {profile ? (
          <Pressable
            onPress={() => navigation.navigate("EditProfile")}
            style={({ pressed }) => [
              styles.editButton,
              { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="edit-2" size={16} color={theme.text} />
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
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: {
    width: 48,
    height: 48,
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  profileSubtext: {
    opacity: 0.7,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  menuGroup: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    gap: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
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
    opacity: 0.5,
    marginTop: Spacing.lg,
  },
});

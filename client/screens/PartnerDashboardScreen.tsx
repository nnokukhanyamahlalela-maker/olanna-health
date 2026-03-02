import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, TextInput, Pressable, Alert, Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { PartnerDashboardContent } from "@/components/PartnerDashboardContent";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getDeviceId } from "@/lib/deviceId";
import { getPartnerToken, savePartnerToken, clearPartnerData } from "@/lib/partnerStorage";

export default function PartnerDashboardScreen() {
  const { theme, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [linked, setLinked] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [revoked, setRevoked] = useState(false);

  useFocusEffect(
    useCallback(() => {
      checkAndLoad();
    }, [])
  );

  const checkAndLoad = async () => {
    const token = await getPartnerToken();
    if (token) {
      setLinked(true);
      await fetchDashboard(token);
    } else {
      setLinked(false);
    }
  };

  const fetchDashboard = async (token: string) => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/partner/dashboard", baseUrl), {
        headers: { "x-partner-token": token },
      });
      if (res.ok) {
        setData(await res.json());
        setRevoked(false);
        setError(null);
      } else if (res.status === 403) {
        setRevoked(true);
        setData(null);
      } else {
        setError("Could not load dashboard");
      }
    } catch {
      setError("Connection error");
    }
  };

  const handleAccept = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) {
      Alert.alert("Invalid Code", "Please enter the full invite code.");
      return;
    }
    setAccepting(true);
    setError(null);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/partner/accept", baseUrl), {
        method: "POST",
        headers: { "x-device-id": deviceId, "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      if (res.ok) {
        const result = await res.json();
        await savePartnerToken(result.partnerToken);
        setLinked(true);
        setCode("");
        await fetchDashboard(result.partnerToken);
      } else {
        const err = await res.json();
        setError(err.error || "Invalid invite code");
      }
    } catch {
      setError("Failed to accept invite");
    } finally {
      setAccepting(false);
    }
  };

  const handleUnlink = async () => {
    await clearPartnerData();
    setLinked(false);
    setData(null);
    setRevoked(false);
    setCode("");
  };

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {linked === false ? (
          <View>
            <GlassSurface tint="prominent" style={styles.introCard}>
              <Feather name="heart" size={28} color={theme.primary} />
              <ThemedText type="h3" style={{ color: theme.text, marginTop: Spacing.md }}>
                Partner Dashboard
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
                Enter the invite code from your partner to see the cycle insights they choose to share with you.
              </ThemedText>
            </GlassSurface>

            <GlassSurface style={styles.codeInputCard}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Invite Code
              </ThemedText>
              <TextInput
                testID="input-invite-code"
                value={code}
                onChangeText={setCode}
                placeholder="Enter 6-character code"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="characters"
                maxLength={10}
                style={[
                  styles.codeInput,
                  {
                    color: theme.text,
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
                    borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                  },
                ]}
              />
              {error ? (
                <ThemedText type="small" style={{ color: theme.error }}>
                  {error}
                </ThemedText>
              ) : null}
              <Pressable
                testID="button-accept-invite"
                onPress={handleAccept}
                disabled={accepting || code.trim().length < 4}
                style={({ pressed }) => [
                  styles.acceptButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.85 : accepting || code.trim().length < 4 ? 0.5 : 1,
                  },
                ]}
              >
                <ThemedText type="body" style={{ color: "#fff", fontWeight: "600" }}>
                  {accepting ? "Linking..." : "Link with Partner"}
                </ThemedText>
              </Pressable>
            </GlassSurface>
          </View>
        ) : null}

        {revoked ? (
          <View>
            <GlassSurface tint="prominent" style={styles.revokedCard}>
              <Feather name="alert-circle" size={32} color={theme.error} />
              <ThemedText type="h3" style={{ color: theme.text, marginTop: Spacing.md }}>
                Access Revoked
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
                Your partner has revoked access to their cycle insights.
              </ThemedText>
              <Pressable
                testID="button-unlink"
                onPress={handleUnlink}
                style={({ pressed }) => [
                  styles.unlinkButton,
                  { borderColor: theme.error, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <ThemedText type="body" style={{ color: theme.error }}>
                  Remove Link
                </ThemedText>
              </Pressable>
            </GlassSurface>
          </View>
        ) : null}

        {linked && !revoked && data ? <PartnerDashboardContent data={data} /> : null}
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  introCard: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  codeInputCard: {
    gap: Spacing.sm,
  },
  codeInput: {
    fontSize: 22,
    letterSpacing: 4,
    textAlign: "center",
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  acceptButton: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  revokedCard: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  unlinkButton: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginTop: Spacing.lg,
  },
});

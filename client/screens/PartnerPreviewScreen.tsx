import React, { useState, useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { PartnerDashboardContent } from "@/components/PartnerDashboardContent";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getDeviceId } from "@/lib/deviceId";
import { Feather } from "@expo/vector-icons";

export default function PartnerPreviewScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      fetchPreview();
    }, [])
  );

  const fetchPreview = async () => {
    try {
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/partner/preview", baseUrl), {
        headers: { "x-device-id": deviceId },
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch {}
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
        <GlassSurface tint="subtle" style={styles.banner}>
          <Feather name="eye" size={18} color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
            This is exactly what your partner sees
          </ThemedText>
        </GlassSurface>

        {data ? <PartnerDashboardContent data={data} /> : null}
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
});

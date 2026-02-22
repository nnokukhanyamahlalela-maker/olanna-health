import React, { useState, useMemo, useCallback } from "react";
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator, Platform, RefreshControl, Dimensions } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Sharing from "expo-sharing";
import { File as ExpoFile, Paths } from "expo-file-system";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius, Fonts } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getDeviceId } from "@/lib/deviceId";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SCREEN_WIDTH = Dimensions.get("window").width;
const DELETE_THRESHOLD = -80;

type ProductLog = {
  id: number;
  date: string;
  productType: string;
  brand: string | null;
  scented: boolean;
  notes: string | null;
  createdAt: string;
};

function useProductLogs() {
  return useQuery<ProductLog[]>({
    queryKey: ["/api/product-logs"],
    queryFn: async () => {
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      const url = new URL("/api/product-logs?days=30", baseUrl);
      const res = await fetch(url.href, {
        headers: { "x-device-id": deviceId },
      });
      if (!res.ok) throw new Error("Failed to load logs");
      return res.json();
    },
  });
}

function computeInsights(logs: ProductLog[]) {
  if (logs.length === 0) {
    return {
      scentedUsage: null,
      topProduct: null,
      topBrand: null,
    };
  }

  const scentedCount = logs.filter((l) => l.scented).length;
  const scentedPct = Math.round((scentedCount / logs.length) * 100);

  const typeCounts: Record<string, number> = {};
  for (const l of logs) {
    typeCounts[l.productType] = (typeCounts[l.productType] || 0) + 1;
  }
  const topProduct = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const brandCounts: Record<string, number> = {};
  for (const l of logs) {
    if (l.brand) {
      brandCounts[l.brand] = (brandCounts[l.brand] || 0) + 1;
    }
  }
  const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    scentedUsage: `${scentedPct}%`,
    topProduct,
    topBrand,
  };
}

function SwipeableLogRow({
  log,
  onDelete,
  formatDate,
}: {
  log: ProductLog;
  onDelete: (id: number) => void;
  formatDate: (d: string) => string;
}) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const rowHeight = useSharedValue<number | null>(null);
  const isDeleting = useSharedValue(false);

  const triggerDelete = useCallback(() => {
    onDelete(log.id);
  }, [log.id, onDelete]);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -120);
      }
    })
    .onEnd((event) => {
      if (translateX.value < DELETE_THRESHOLD) {
        isDeleting.value = true;
        runOnJS(triggerHaptic)();
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 250 }, () => {
          runOnJS(triggerDelete)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => {
    const width = Math.abs(Math.min(translateX.value, 0));
    return {
      width,
      opacity: width > 20 ? 1 : 0,
    };
  });

  return (
    <View style={styles.swipeContainer}>
      <Animated.View
        style={[styles.deleteAction, { backgroundColor: "#E74C3C" }, deleteStyle]}
      >
        <Feather name="trash-2" size={20} color="#FFFFFF" />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.logCard,
            { backgroundColor: theme.backgroundDefault },
            cardStyle,
          ]}
          accessibilityLabel={formatDate(log.date) + ", " + log.productType + (log.brand ? ", " + log.brand : "") + (log.scented ? ", scented" : "") + ". Swipe left to delete"}
          accessibilityActions={[{ name: "delete", label: "Delete log" }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === "delete") {
              onDelete(log.id);
            }
          }}
        >
          <View style={styles.logHeader}>
            <ThemedText style={[styles.logDate, { color: theme.text }]}>
              {formatDate(log.date)}
            </ThemedText>
            <View style={styles.logBadges}>
              {log.scented ? (
                <View style={styles.scentedBadge}>
                  <ThemedText style={styles.scentedBadgeText}>Scented</ThemedText>
                </View>
              ) : null}
            </View>
          </View>
          <ThemedText style={[styles.logType, { color: theme.text }]}>
            {log.productType}
          </ThemedText>
          {log.brand ? (
            <ThemedText style={[styles.logBrand, { color: theme.textSecondary }]}>
              {log.brand}
            </ThemedText>
          ) : null}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function ProductInsightsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const toastOpacity = useSharedValue(0);
  const exportScale = useSharedValue(1);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  const exportAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exportScale.value }],
  }));

  const { data: logs = [], isLoading, refetch } = useProductLogs();

  const insights = useMemo(() => computeInsights(logs), [logs]);

  const insightItems = [
    { label: "Scented usage", value: insights.scentedUsage || "\u2014", icon: "wind" as const },
    { label: "Most used product type", value: insights.topProduct || "\u2014", icon: "package" as const },
    { label: "Most used brand", value: insights.topBrand || "\u2014", icon: "tag" as const },
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    toastOpacity.value = withTiming(1, { duration: 200 });
    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => setToastMsg(null), 350);
    }, 2500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDeleteLog = useCallback(async (logId: number) => {
    try {
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      const url = new URL(`/api/product-logs/${logId}`, baseUrl);
      const res = await fetch(url.href, {
        method: "DELETE",
        headers: { "x-device-id": deviceId },
      });
      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        queryClient.invalidateQueries({ queryKey: ["/api/product-logs"] });
        showToast("Log deleted");
      } else {
        showToast("Could not delete. Try again.");
      }
    } catch {
      showToast("Could not delete. Try again.");
    }
  }, [queryClient]);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      const url = new URL("/api/product-logs/export?days=30", baseUrl);
      const res = await fetch(url.href, {
        headers: { "x-device-id": deviceId },
      });
      if (!res.ok) throw new Error("Export failed");

      const csvText = await res.text();

      if (Platform.OS === "web") {
        const blob = new Blob([csvText], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "product-logs.csv";
        link.click();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("Export ready");
      } else {
        const file = new ExpoFile(Paths.cache, "product-logs.csv");
        file.text = csvText;
        const filePath = file.uri;
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(filePath, { mimeType: "text/csv" });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          showToast("Sharing not available on this device");
        }
      }
    } catch (err) {
      showToast("Could not export. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
  };

  return (
    <AppGradient style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: ScreenPadding.horizontal,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F6BFD3"
            accessibilityLabel="Pull to refresh product insights"
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#F6BFD3" />
          </View>
        ) : logs.length === 0 ? (
          <View
            style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault }]}
            accessibilityLabel="No product logs yet. Start by logging what you used."
          >
            <Feather name="inbox" size={32} color={theme.textSecondary} style={{ marginBottom: 12 }} />
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
              No product logs yet
            </ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Start by logging what you used. Your insights will appear here.
            </ThemedText>
          </View>
        ) : (
          <>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              SUMMARY (LAST 30 DAYS)
            </ThemedText>

            <View style={styles.cardList}>
              {insightItems.map((item) => (
                <View
                  key={item.label}
                  style={[styles.insightCard, { backgroundColor: theme.backgroundDefault }]}
                  accessibilityLabel={item.label + ": " + item.value}
                >
                  <View style={[styles.iconWrap, { backgroundColor: "#C4B5AD18" }]}>
                    <Feather name={item.icon} size={20} color="#C4B5AD" />
                  </View>
                  <View style={styles.insightContent}>
                    <ThemedText style={[styles.insightLabel, { color: theme.textSecondary }]}>
                      {item.label}
                    </ThemedText>
                    <ThemedText style={[styles.insightValue, { color: theme.text }]}>
                      {item.value}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>

            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              RECENT LOGS
            </ThemedText>

            <ThemedText style={[styles.swipeHint, { color: theme.textSecondary }]}>
              Swipe left to delete
            </ThemedText>

            <View style={styles.cardList}>
              {logs.map((log) => (
                <SwipeableLogRow
                  key={log.id}
                  log={log}
                  onDelete={handleDeleteLog}
                  formatDate={formatDate}
                />
              ))}
            </View>
          </>
        )}

        <AnimatedPressable
          testID="button-export-csv"
          accessibilityRole="button"
          accessibilityLabel="Export product logs as CSV"
          onPress={handleExport}
          disabled={exporting || logs.length === 0}
          onPressIn={() => {
            exportScale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
          }}
          onPressOut={() => {
            exportScale.value = withSpring(1, { damping: 15, stiffness: 150 });
          }}
          style={[
            styles.exportButton,
            { borderColor: theme.border },
            logs.length === 0 ? { opacity: 0.4 } : null,
            exportAnimStyle,
          ]}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <>
              <Feather name="download" size={18} color={theme.text} />
              <ThemedText style={[styles.exportText, { color: theme.text }]}>
                Export CSV
              </ThemedText>
            </>
          )}
        </AnimatedPressable>

        <ThemedText style={[styles.privacyNote, { color: theme.textSecondary }]}>
          Your product logs are private to you. You can export or delete them anytime.
        </ThemedText>
      </ScrollView>

      {toastMsg ? (
        <Animated.View style={[styles.toast, toastStyle]}>
          <ThemedText style={styles.toastText}>
            {toastMsg}
          </ThemedText>
        </Animated.View>
      ) : null}
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingWrap: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 16,
    marginBottom: 6,
  },
  emptySubtext: {
    fontFamily: Fonts.body,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  sectionLabel: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  swipeHint: {
    fontFamily: Fonts.body,
    fontSize: 12,
    marginBottom: Spacing.sm,
    marginTop: -Spacing.sm,
  },
  cardList: {
    gap: 12,
    marginBottom: Spacing.xl,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  insightContent: {
    flex: 1,
    gap: 2,
  },
  insightLabel: {
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  insightValue: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 17,
  },
  swipeContainer: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  deleteAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  logCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  logDate: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 13,
  },
  logBadges: {
    flexDirection: "row",
    gap: 6,
  },
  scentedBadge: {
    backgroundColor: "#F6BFD3" + "30",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  scentedBadgeText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 11,
    color: "#C77B9E",
  },
  logType: {
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  logBrand: {
    fontFamily: Fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  exportButton: {
    height: 52,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  exportText: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  privacyNote: {
    fontFamily: Fonts.body,
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
  toast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#3A2F35",
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  toastText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: "#FFFFFF",
  },
});

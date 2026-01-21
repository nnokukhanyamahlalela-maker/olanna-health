import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { 
  analyzeSymptomPatterns, 
  getPhaseInsights,
  calculateSymptomTrends,
  generateRecommendations,
  HealthInsight,
  SymptomTrend,
  Recommendation,
} from "@/lib/insightsEngine";
import { getAllCheckIns } from "@/lib/symptomStorage";
import { storage } from "@/lib/storage";
import { SymptomLog } from "@/lib/symptomSchema";

type TabType = "insights" | "recommendations" | "trends";

export default function InsightsScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>("insights");
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trends, setTrends] = useState<SymptomTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const checkIns = await getAllCheckIns();
      const cycleData = await storage.getCycleData();
      
      const allSymptomLogs: SymptomLog[] = checkIns.flatMap(c => c.symptoms);
      
      const cycleDay = cycleData?.currentDay || 1;
      const cycleLength = cycleData?.cycleLength || 28;
      
      const symptomInsights = analyzeSymptomPatterns(allSymptomLogs, cycleDay, cycleLength);
      const phaseInsights = getPhaseInsights(cycleDay, cycleLength);
      setInsights([...phaseInsights, ...symptomInsights]);
      
      const recs = generateRecommendations(allSymptomLogs, cycleDay, cycleLength);
      setRecommendations(recs);
      
      const symptomTrends = calculateSymptomTrends(allSymptomLogs);
      setTrends(symptomTrends.slice(0, 10));
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const getSeverityColor = (severity: "info" | "warning" | "important") => {
    switch (severity) {
      case "important": return theme.error;
      case "warning": return theme.warning;
      default: return theme.accent;
    }
  };

  const getRecommendationIcon = (category: string): keyof typeof Feather.glyphMap => {
    switch (category) {
      case "hydration": return "droplet";
      case "rest": return "moon";
      case "exercise": return "activity";
      case "nutrition": return "coffee";
      case "relaxation": return "heart";
      case "medical": return "plus-circle";
      default: return "star";
    }
  };

  const getTrendIcon = (trend: "increasing" | "decreasing" | "stable"): keyof typeof Feather.glyphMap => {
    switch (trend) {
      case "increasing": return "trending-up";
      case "decreasing": return "trending-down";
      default: return "minus";
    }
  };

  const getTrendColor = (trend: "increasing" | "decreasing" | "stable") => {
    switch (trend) {
      case "increasing": return theme.warning;
      case "decreasing": return theme.accent;
      default: return theme.textSecondary;
    }
  };

  const renderInsights = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      {insights.length > 0 ? (
        <View style={styles.cardsList}>
          {insights.map((insight, index) => (
            <Animated.View
              key={insight.id}
              entering={FadeInDown.duration(300).delay(index * 50)}
            >
              <View style={[styles.insightCard, { backgroundColor: theme.backgroundDefault }]}>
                <View style={[styles.insightIcon, { backgroundColor: getSeverityColor(insight.severity) + "20" }]}>
                  <Feather 
                    name={insight.icon as keyof typeof Feather.glyphMap} 
                    size={20} 
                    color={getSeverityColor(insight.severity)} 
                  />
                </View>
                <View style={styles.insightContent}>
                  <View style={styles.insightHeader}>
                    <ThemedText type="body" style={{ fontWeight: "600", flex: 1 }}>
                      {insight.title}
                    </ThemedText>
                    <View style={[styles.typeBadge, { backgroundColor: theme.backgroundSecondary }]}>
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                        {insight.type}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {insight.description}
                  </ThemedText>
                  {insight.actionable ? (
                    <View style={[styles.actionBanner, { backgroundColor: theme.accent + "15" }]}>
                      <Feather name="info" size={14} color={theme.accent} />
                      <ThemedText type="caption" style={{ color: theme.accent, flex: 1 }}>
                        {insight.actionable}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="bar-chart-2" size={48} color={theme.textSecondary} />
          <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>No insights yet</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Keep tracking your symptoms to discover patterns and receive personalized insights.
          </ThemedText>
        </View>
      )}
    </Animated.View>
  );

  const renderRecommendations = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      {recommendations.length > 0 ? (
        <View style={styles.cardsList}>
          {recommendations.map((rec, index) => (
            <Animated.View
              key={rec.id}
              entering={FadeInDown.duration(300).delay(index * 50)}
            >
              <View style={[styles.recCard, { backgroundColor: theme.backgroundDefault }]}>
                <View style={[styles.recIcon, { backgroundColor: theme.primary + "15" }]}>
                  <Feather 
                    name={rec.icon as keyof typeof Feather.glyphMap || getRecommendationIcon(rec.category)} 
                    size={24} 
                    color={theme.primary} 
                  />
                </View>
                <View style={styles.recContent}>
                  <ThemedText type="h4">{rec.title}</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                    {rec.description}
                  </ThemedText>
                  {rec.phase ? (
                    <View style={[styles.phaseBadge, { backgroundColor: theme.secondary + "30" }]}>
                      <ThemedText type="caption" style={{ color: theme.text }}>
                        Best for: {rec.phase.charAt(0).toUpperCase() + rec.phase.slice(1)} phase
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="heart" size={48} color={theme.textSecondary} />
          <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>No recommendations yet</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Log more symptoms to get personalized wellness recommendations.
          </ThemedText>
        </View>
      )}
    </Animated.View>
  );

  const renderTrends = () => (
    <Animated.View entering={FadeInDown.duration(300)}>
      {trends.length > 0 ? (
        <View style={styles.cardsList}>
          {trends.map((trend, index) => (
            <Animated.View
              key={trend.symptomId}
              entering={FadeInDown.duration(300).delay(index * 50)}
            >
              <View style={[styles.trendCard, { backgroundColor: theme.backgroundDefault }]}>
                <View style={styles.trendHeader}>
                  <ThemedText type="body" style={{ fontWeight: "600", flex: 1 }}>
                    {trend.symptomName}
                  </ThemedText>
                  <View style={styles.trendIndicator}>
                    <Feather 
                      name={getTrendIcon(trend.trend)} 
                      size={16} 
                      color={getTrendColor(trend.trend)} 
                    />
                    <ThemedText type="caption" style={{ color: getTrendColor(trend.trend) }}>
                      {trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.trendStats}>
                  <View style={styles.statItem}>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>Logged</ThemedText>
                    <ThemedText type="h4">{trend.frequency}x</ThemedText>
                  </View>
                  {trend.averageSeverity > 0 ? (
                    <View style={styles.statItem}>
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>Avg Severity</ThemedText>
                      <ThemedText type="h4">{trend.averageSeverity}/5</ThemedText>
                    </View>
                  ) : null}
                </View>

                <View style={[styles.severityBar, { backgroundColor: theme.backgroundSecondary }]}>
                  <View 
                    style={[
                      styles.severityFill, 
                      { 
                        backgroundColor: theme.primary, 
                        width: `${(trend.averageSeverity / 5) * 100}%` 
                      }
                    ]} 
                  />
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="trending-up" size={48} color={theme.textSecondary} />
          <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>No trends yet</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Track symptoms over time to see your personal trends and patterns.
          </ThemedText>
        </View>
      )}
    </Animated.View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing["2xl"],
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
      }
    >
      <View style={[styles.header, { backgroundColor: theme.primary + "15" }]}>
        <Feather name="bar-chart-2" size={24} color={theme.primary} />
        <View style={styles.headerContent}>
          <ThemedText type="h4">Your Health Insights</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Patterns and recommendations based on your tracking data
          </ThemedText>
        </View>
      </View>

      <View style={styles.tabBar}>
        {renderTab("insights", "Insights", "zap")}
        {renderTab("recommendations", "Tips", "heart")}
        {renderTab("trends", "Trends", "trending-up")}
      </View>

      {activeTab === "insights" && renderInsights()}
      {activeTab === "recommendations" && renderRecommendations()}
      {activeTab === "trends" && renderTrends()}

      <View style={[styles.disclaimer, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name="info" size={16} color={theme.textSecondary} />
        <ThemedText type="caption" style={{ color: theme.textSecondary, flex: 1 }}>
          These insights are for informational purposes only and are not medical advice. 
          Consult a healthcare provider for any health concerns.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  headerContent: {
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
  cardsList: {
    gap: Spacing.md,
  },
  insightCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  insightContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  actionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  recCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  recIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  recContent: {
    flex: 1,
  },
  phaseBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  trendCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  trendHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  trendIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  trendStats: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginBottom: Spacing.md,
  },
  statItem: {
    gap: 2,
  },
  severityBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  severityFill: {
    height: "100%",
    borderRadius: 4,
  },
  emptyState: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  disclaimer: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    alignItems: "flex-start",
  },
});

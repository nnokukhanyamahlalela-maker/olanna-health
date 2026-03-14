import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';

import { ThemedText } from '@/components/ThemedText';
import { AppGradient } from '@/components/AppGradient';
import { AfricanPattern } from '@/components/AfricanPattern';
import { GlassSurface } from '@/components/GlassSurface';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getSymptomLogsByDateRange, getDailyCheckIns } from '@/lib/symptomStorage';
import { SYMPTOM_CATEGORIES, SymptomLog, getCategoryById } from '@/lib/symptomSchema';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.sm * 6) / 7;

interface DayData {
  date: string;
  count: number;
  severity: number;
}

interface PatternInsight {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export default function PatternsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | '3months'>('month');
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [topSymptoms, setTopSymptoms] = useState<{ id: string; name: string; count: number; color: string }[]>([]);
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatternData();
  }, [selectedTimeRange]);

  const loadPatternData = async () => {
    setLoading(true);
    const endDate = new Date();
    const startDate = new Date();

    switch (selectedTimeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '3months':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
    const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    const logs = await getSymptomLogsByDateRange(startStr, endStr);

    const dateMap = new Map<string, { count: number; severity: number }>();
    const symptomCounts = new Map<string, { count: number; categoryId: string }>();

    logs.forEach(log => {
      const existing = dateMap.get(log.date) || { count: 0, severity: 0 };
      dateMap.set(log.date, {
        count: existing.count + 1,
        severity: Math.max(existing.severity, log.severity || 0),
      });

      const symptomKey = log.symptomId;
      const existingSymptom = symptomCounts.get(symptomKey) || { count: 0, categoryId: log.categoryId };
      symptomCounts.set(symptomKey, {
        count: existingSymptom.count + 1,
        categoryId: log.categoryId,
      });
    });

    const calData: DayData[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayData = dateMap.get(dateStr);
      calData.push({
        date: dateStr,
        count: dayData?.count || 0,
        severity: dayData?.severity || 0,
      });
    }
    setCalendarData(calData);

    const sortedSymptoms = Array.from(symptomCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, data]) => {
        const category = getCategoryById(data.categoryId);
        const symptom = category?.items.find(i => i.id === id);
        return {
          id,
          name: symptom?.name || id,
          count: data.count,
          color: category?.color || theme.primary,
        };
      });
    setTopSymptoms(sortedSymptoms);

    const generatedInsights = generateInsights(logs);
    setInsights(generatedInsights);

    setLoading(false);
  };

  const generateInsights = (logs: SymptomLog[]): PatternInsight[] => {
    const insights: PatternInsight[] = [];

    const crampLogs = logs.filter(l => l.symptomId === 'cramps');
    if (crampLogs.length >= 3) {
      insights.push({
        id: 'cramps-pattern',
        title: 'Cramp Pattern Detected',
        description: `You've logged cramps ${crampLogs.length} times. Consider tracking what helps relieve them.`,
        icon: 'zap',
        color: '#FFB6C1',
      });
    }

    const bloatingLogs = logs.filter(l => l.symptomId === 'bloating');
    if (bloatingLogs.length >= 2) {
      insights.push({
        id: 'bloating-pattern',
        title: 'Bloating Trends',
        description: 'Bloating appears regularly. This is common 2-3 days before your period.',
        icon: 'circle',
        color: '#FFDAB9',
      });
    }

    const moodLogs = logs.filter(l => ['low-mood', 'anxious', 'irritable'].includes(l.symptomId));
    if (moodLogs.length >= 3) {
      insights.push({
        id: 'mood-pattern',
        title: 'Mood Changes',
        description: 'You may experience mood shifts related to your cycle. This is completely normal.',
        icon: 'heart',
        color: '#E6E6FA',
      });
    }

    const severePain = logs.filter(l => (l.severity || 0) >= 4);
    if (severePain.length >= 2) {
      insights.push({
        id: 'severe-pain',
        title: 'Significant Pain Logged',
        description: 'You\'ve logged severe symptoms. Consider speaking with a healthcare provider.',
        icon: 'alert-circle',
        color: '#F8A5B0',
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: 'keep-tracking',
        title: 'Keep Tracking',
        description: 'Log more symptoms to discover your personal patterns and insights.',
        icon: 'trending-up',
        color: theme.primary,
      });
    }

    return insights;
  };

  const getCellColor = (count: number, severity: number): string => {
    if (count === 0) return theme.backgroundSecondary;
    const intensity = Math.min(count / 5, 1) * 0.5 + (severity / 5) * 0.5;
    const opacity = 0.2 + intensity * 0.6;
    return `rgba(123, 163, 135, ${opacity})`;
  };

  const renderCalendarHeatmap = () => {
    const weeks: DayData[][] = [];
    let currentWeek: DayData[] = [];

    calendarData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === calendarData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return (
      <View style={styles.heatmapContainer}>
        <View style={styles.weekdayLabels}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <ThemedText
              key={i}
              type="caption"
              style={[styles.weekdayLabel, { color: theme.textSecondary }]}
            >
              {day}
            </ThemedText>
          ))}
        </View>
        <View style={styles.weeksContainer}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) => (
                <View
                  key={`${weekIndex}-${dayIndex}`}
                  style={[
                    styles.dayCell,
                    {
                      backgroundColor: getCellColor(day.count, day.severity),
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                    },
                  ]}
                >
                  {day.count > 0 ? (
                    <ThemedText type="caption" style={{ color: theme.buttonText }}>
                      {day.count}
                    </ThemedText>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </View>
        <View style={styles.legendRow}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>Less</ThemedText>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
            <View
              key={i}
              style={[
                styles.legendCell,
                { backgroundColor: `rgba(123, 163, 135, ${0.2 + intensity * 0.6})` },
              ]}
            />
          ))}
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>More</ThemedText>
        </View>
      </View>
    );
  };

  return (
    <AppGradient style={styles.container}>
      <AfricanPattern variant="waves" opacity={0.02} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="h2" style={styles.title}>Your Patterns</ThemedText>
        <ThemedText type="small" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Discover trends in your symptoms over time
        </ThemedText>

        <View style={styles.timeRangeTabs}>
          {(['week', 'month', '3months'] as const).map((range) => (
            <Pressable
              key={range}
              onPress={() => setSelectedTimeRange(range)}
              style={[
                styles.timeTab,
                {
                  backgroundColor: selectedTimeRange === range ? theme.primary : isDark ? "rgba(42,23,48,0.35)" : "rgba(255,255,255,0.25)",
                  borderColor: selectedTimeRange === range ? theme.primary : isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.40)",
                },
              ]}
              testID={`time-range-${range}`}
            >
              <ThemedText
                type="small"
                style={{ color: selectedTimeRange === range ? theme.buttonText : theme.primary }}
              >
                {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : '90 Days'}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Animated.View
          entering={FadeInDown.duration(300)}
        >
          <GlassSurface style={styles.card}>
            <ThemedText type="h4" style={styles.cardTitle}>Activity Heatmap</ThemedText>
            {renderCalendarHeatmap()}
          </GlassSurface>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(300)}
        >
          <GlassSurface style={styles.card}>
            <ThemedText type="h4" style={styles.cardTitle}>Top Symptoms</ThemedText>
          {topSymptoms.length > 0 ? (
            <View style={styles.symptomsList}>
              {topSymptoms.map((symptom, index) => (
                <View key={symptom.id} style={styles.symptomRow}>
                  <View style={styles.symptomInfo}>
                    <View style={[styles.symptomRank, { backgroundColor: `${symptom.color}20` }]}>
                      <ThemedText type="caption" style={{ color: symptom.color }}>
                        {index + 1}
                      </ThemedText>
                    </View>
                    <ThemedText type="body">{symptom.name}</ThemedText>
                  </View>
                  <View style={styles.symptomBar}>
                    <View
                      style={[
                        styles.symptomBarFill,
                        {
                          backgroundColor: symptom.color,
                          width: `${(symptom.count / (topSymptoms[0]?.count || 1)) * 100}%`,
                        },
                      ]}
                    />
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      {symptom.count}x
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Start tracking to see your top symptoms
            </ThemedText>
          )}
          </GlassSurface>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(300)}
        >
          <GlassSurface style={styles.card}>
            <ThemedText type="h4" style={styles.cardTitle}>Insights</ThemedText>
          {insights.map((insight) => (
            <View
              key={insight.id}
              style={[styles.insightRow, { borderLeftColor: insight.color }]}
            >
              <View style={[styles.insightIcon, { backgroundColor: `${insight.color}20` }]}>
                <Feather name={insight.icon as any} size={18} color={insight.color} />
              </View>
              <View style={styles.insightContent}>
                <ThemedText type="small" style={{ fontWeight: '600' }}>
                  {insight.title}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {insight.description}
                </ThemedText>
              </View>
            </View>
          ))}
          </GlassSurface>
        </Animated.View>

        <GlassSurface style={styles.disclaimer}>
          <Feather name="info" size={16} color={theme.info} />
          <ThemedText type="caption" style={{ color: theme.info, flex: 1 }}>
            These insights are based on your logged data and are not medical advice.
            Please consult a healthcare provider for medical concerns.
          </ThemedText>
        </GlassSurface>
      </ScrollView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.lg,
  },
  timeRangeTabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  timeTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  heatmapContainer: {
    alignItems: 'center',
  },
  weekdayLabels: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: 'center',
  },
  weeksContainer: {
    gap: Spacing.xs,
  },
  weekRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dayCell: {
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  legendCell: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  symptomsList: {
    gap: Spacing.md,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  symptomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  symptomRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: 100,
  },
  symptomBarFill: {
    height: 8,
    borderRadius: 4,
    flex: 1,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingLeft: Spacing.md,
    borderLeftWidth: 3,
    marginBottom: Spacing.md,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
});

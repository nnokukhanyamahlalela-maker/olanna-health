import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { LannaMascot } from "@/components/LannaMascot";
import { storage, UserProfile } from "@/lib/storage";
import { Phase, getPhaseForDay } from "@/constants/phaseConfig";
import { phase as phaseTokens } from "@/constants/colors";
import { articles as articlesData, Article } from "@/data/articles";
import { LearnStackParamList } from "@/navigation/LearnStackNavigator";
import { useLotusCycle } from "@/hooks/useLotusCycle";

type NavigationProp = NativeStackNavigationProp<LearnStackParamList>;

const BG = "#EEEDFE";
const TEXT_DARK = "#26215C";
const TEXT_MID = "#4A4580";
const TEXT_SOFT = "#6B6591";
const PINK = "#D85A30";

// Category filters (per spec §6.4 — no topic-colored icons on article list)
const FILTER_CHIPS = [
  { id: "Cycle basics", label: "Cycle basics" },
  { id: "PMOS", label: "PMOS" },
  { id: "Nutrition", label: "Nutrition" },
  { id: "Mental health", label: "Mental health" },
  { id: "Periods", label: "Periods" },
  { id: "PCOS", label: "PCOS" },
];

// Tag pill colors (subtle, no icons)
const TAG_COLORS: Record<string, string> = {
  PMOS: "#E8A070",
  PCOS: "#E8A070",
  Nutrition: "#7ABFB0",
  "Mental health": "#4A4580",
  Periods: "#D85A30",
  Fertility: "#0F6E56",
  "Cycle basics": "#9490C8",
};

function TagPill({ label }: { label: string }) {
  const color = TAG_COLORS[label] ?? "#8A6F80";
  return (
    <View style={[styles.tagPill, { backgroundColor: color + "22" }]}>
      <Text style={[styles.tagPillText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Featured article card ────────────────────────────────────────────────────

function FeaturedCard({
  article,
  phase,
  phaseColor,
  onPress,
}: {
  article: Article;
  phase: Phase;
  phaseColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.featuredCard, { backgroundColor: phaseColor + "22" }]}>
      <View style={styles.featuredInner}>
        <View style={[styles.forTodayBadge, { backgroundColor: phaseColor }]}>
          <Text style={styles.forTodayText}>FOR TODAY</Text>
        </View>
        <Text style={styles.featuredTitle}>{article.title}</Text>
        <Text style={styles.featuredReadTime}>{article.readTime}</Text>
      </View>
      <LannaMascot phase={phase} size={72} />
    </Pressable>
  );
}

// ─── Article row (no thumbnail, no color block per spec §6.4) ────────────────

function ArticleRow({
  article,
  onPress,
}: {
  article: Article;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.articleRow}>
      <TagPill label={article.category} />
      <Text style={styles.articleRowTitle}>{article.title}</Text>
      <Text style={styles.articleRowReadTime}>{article.readTime}</Text>
    </Pressable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { data: cycleData } = useLotusCycle(profile?.id ?? "");

  useEffect(() => {
    (async () => {
      try { setProfile(await storage.getUserProfile()); } catch {}
    })();
  }, []);

  const cycleLength = profile?.cycleLength ?? 28;
  const periodLength = profile?.periodLength ?? 5;
  const currentDay = cycleData?.currentCycleDay ?? 1;
  const currentPhase: Phase = getPhaseForDay(currentDay, cycleLength, periodLength);
  const phaseKey = currentPhase === "ovulation" ? "ovulatory" : currentPhase === "late" ? "luteal" : currentPhase;
  const phaseColor = (phaseTokens as any)[phaseKey]?.front ?? PINK;

  const filtered = useMemo(() => {
    return articlesData.filter((a) => {
      const matchSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = !selectedFilter || a.category === selectedFilter;
      return matchSearch && matchFilter;
    });
  }, [searchQuery, selectedFilter]);

  const featuredArticle = filtered.find((a) => a.featured) ?? filtered[0];
  const remaining = filtered.filter((a) => a !== featuredArticle);

  const handleArticlePress = (article: Article) => {
    navigation.navigate("ArticleDetail", { articleId: article.id });
  };

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <FlatList
        data={remaining}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 20, paddingBottom: tabBarHeight + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Title */}
            <View style={styles.titleRow}>
              <Text style={styles.pageTitle}>Learn</Text>
              <Text style={styles.pageSubtitle}>Grounded in real research</Text>
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search articles"
                placeholderTextColor={TEXT_SOFT}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Text style={styles.searchClear}>✕</Text>
                </Pressable>
              )}
            </View>

            {/* Featured article */}
            {featuredArticle && (
              <FeaturedCard
                article={featuredArticle}
                phase={currentPhase}
                phaseColor={phaseColor}
                onPress={() => handleArticlePress(featuredArticle)}
              />
            )}

            {/* Category filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChips}
            >
              {FILTER_CHIPS.map((chip) => {
                const isSelected = selectedFilter === chip.id;
                return (
                  <Pressable
                    key={chip.id}
                    onPress={() => setSelectedFilter(isSelected ? null : chip.id)}
                    style={[
                      styles.filterChip,
                      isSelected && { backgroundColor: phaseColor, borderColor: phaseColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextActive,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Section label */}
            {remaining.length > 0 && (
              <Text style={styles.sectionLabel}>Recommended for you</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <ArticleRow article={item} onPress={() => handleArticlePress(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No articles found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingHorizontal: 20, gap: 0 },
  header: { gap: 16, marginBottom: 12 },
  titleRow: { gap: 2 },
  pageTitle: { fontSize: 24, fontWeight: "700", color: TEXT_DARK },
  pageSubtitle: { fontSize: 13, color: TEXT_SOFT },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0E4EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: TEXT_DARK },
  searchClear: { fontSize: 14, color: TEXT_SOFT },
  featuredCard: {
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  featuredInner: { flex: 1, gap: 8 },
  forTodayBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  forTodayText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.5 },
  featuredTitle: { fontSize: 18, fontWeight: "700", color: TEXT_DARK, lineHeight: 24 },
  featuredReadTime: { fontSize: 12, color: TEXT_SOFT },
  filterChips: { gap: 8, paddingRight: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D8D6F0",
    backgroundColor: "transparent",
  },
  filterChipText: { fontSize: 13, color: TEXT_MID, fontWeight: "500" },
  filterChipTextActive: { color: "#FFFFFF", fontWeight: "700" },
  sectionLabel: { fontSize: 15, fontWeight: "700", color: TEXT_DARK },
  articleRow: {
    paddingVertical: 14,
    gap: 5,
  },
  tagPill: {
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagPillText: { fontSize: 11, fontWeight: "600" },
  articleRowTitle: { fontSize: 15, fontWeight: "600", color: TEXT_DARK, lineHeight: 21 },
  articleRowReadTime: { fontSize: 12, color: TEXT_SOFT },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#D8D6F0" },
  emptyState: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: TEXT_SOFT },
});

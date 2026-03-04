import React, { useState, useEffect, useMemo } from "react";
import { View, FlatList, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { AppText } from "@/components/AppText";
import { ArticleCard } from "@/components/ArticleCard";
import { EmptyState } from "@/components/EmptyState";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius } from "@/constants/theme";
import { AppFontFamily } from "@/constants/typography";
import { getUserGoals, GoalId } from "@/utils/onboardingStorage";
import { getLearnTopicOrder, LearnTopicId, LEARN_TOPIC_INFO } from "@/utils/personalization";
import { articles as articlesData, TOPIC_CATEGORIES, Article } from "@/data/articles";
import { LearnStackParamList } from "@/navigation/LearnStackNavigator";

type NavigationProp = NativeStackNavigationProp<LearnStackParamList>;

const categories = [
  "All",
  "Periods",
  "PCOS",
  "Endometriosis",
  "Sexual Health",
  "Fertility",
  "Wellness",
  "Screenings",
];

export default function LearnScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userGoals, setUserGoals] = useState<GoalId[]>([]);
  const [topicOrder, setTopicOrder] = useState<LearnTopicId[]>([]);

  useEffect(() => {
    const loadGoals = async () => {
      const goals = await getUserGoals();
      setUserGoals(goals);
      setTopicOrder(getLearnTopicOrder(goals));
    };
    loadGoals();
  }, []);

  const sortedArticles = useMemo(() => {
    if (topicOrder.length === 0) return articlesData;

    const categoryPriority: Record<string, number> = {};
    topicOrder.forEach((topicId, index) => {
      const info = LEARN_TOPIC_INFO[topicId];
      if (info && !categoryPriority[info.category]) {
        categoryPriority[info.category] = index;
      }
    });

    return [...articlesData].sort((a, b) => {
      const priorityA = categoryPriority[a.category] ?? 999;
      const priorityB = categoryPriority[b.category] ?? 999;
      return priorityA - priorityB;
    });
  }, [topicOrder]);

  const filteredArticles = sortedArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = filteredArticles.find((a) => a.featured) || filteredArticles[0];
  const remainingArticles = filteredArticles.filter((a) => a !== featuredArticle);

  const handleArticlePress = (article: Article) => {
    navigation.navigate("ArticleDetail", { articleId: article.id });
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <AppText variant="h1" color={theme.text}>
        Learn
      </AppText>
      <AppText variant="caption" color={theme.textSecondary} style={styles.pageSubtitle}>
        Evidence-based health education
      </AppText>

      <View style={styles.quickLinksRow}>
        <Pressable
          onPress={() => navigation.navigate("Glossary")}
          testID="button-glossary"
          style={styles.quickLinkPressable}
        >
          <GlassSurface style={styles.quickLinkCard} padding={Spacing.md} borderRadius={BorderRadius.md}>
            <View style={[styles.quickLinkIcon, { backgroundColor: theme.primary + "15" }]}>
              <Feather name="book" size={18} color={theme.primary} />
            </View>
            <AppText variant="label" color={theme.text}>
              Glossary
            </AppText>
            <AppText variant="caption" color={theme.textSecondary}>
              Health terms explained
            </AppText>
          </GlassSurface>
        </Pressable>
      </View>

      <View style={styles.topicCardsContainer}>
        <AppText variant="caption" color={theme.textSecondary} style={styles.sectionLabel}>
          BROWSE BY TOPIC
        </AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicCardsList}
        >
          {TOPIC_CATEGORIES.map((topic) => (
            <Pressable
              key={topic.id}
              onPress={() => setSelectedCategory(topic.label === "Periods 101" ? "Periods" : topic.label)}
            >
              <GlassSurface style={styles.topicCard} padding={Spacing.md} borderRadius={BorderRadius.md}>
                <View style={[styles.topicIconCircle, { backgroundColor: topic.color + "30" }]}>
                  <Feather name={topic.icon} size={20} color={topic.color} />
                </View>
                <AppText variant="label" color={theme.text} style={styles.topicCardTitle}>
                  {topic.label}
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} numberOfLines={2} style={styles.topicCardDesc}>
                  {topic.description}
                </AppText>
              </GlassSurface>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <GlassSurface noPadding borderRadius={BorderRadius.md} style={styles.searchContainer}>
        <View style={styles.searchInner}>
          <Feather name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search articles..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="input-article-search"
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </GlassSurface>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      >
        {categories.map((item) => {
          const isSelected = selectedCategory === item;
          return isSelected ? (
            <Pressable key={item} onPress={() => setSelectedCategory(item)}>
              <GlassSurface
                noPadding
                borderRadius={BorderRadius.full}
                style={[styles.categoryChip, { backgroundColor: theme.primary + "DD" }]}
              >
                <View style={styles.categoryChipInner}>
                  <AppText variant="caption" color="#FFFCFA">
                    {item}
                  </AppText>
                </View>
              </GlassSurface>
            </Pressable>
          ) : (
            <Pressable
              key={item}
              onPress={() => setSelectedCategory(item)}
              style={[styles.categoryChip, { borderColor: theme.border, borderWidth: 1 }]}
            >
              <View style={styles.categoryChipInner}>
                <AppText variant="caption" color={theme.textSecondary}>
                  {item}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {featuredArticle ? (
        <>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AppText variant="caption" color={theme.textSecondary} style={styles.sectionLabel}>
            FEATURED
          </AppText>
          <ArticleCard
            title={featuredArticle.title}
            summary={featuredArticle.summary}
            category={featuredArticle.category}
            readTime={featuredArticle.readTime}
            imageSource={featuredArticle.imageSource}
            featured
            onPress={() => handleArticlePress(featuredArticle)}
          />
          {remainingArticles.length > 0 ? (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <AppText variant="caption" color={theme.textSecondary} style={styles.sectionLabel}>
                MORE ARTICLES
              </AppText>
            </>
          ) : null}
        </>
      ) : null}
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      image={require("../../assets/images/empty-search.png")}
      title="No Articles Found"
      description="Try adjusting your search or browse a different category."
    />
  );

  const renderSeparator = () => (
    <View style={[styles.articleDivider, { backgroundColor: theme.border }]} />
  );

  return (
    <AppGradient style={styles.container}>
      <FlatList
        data={remainingArticles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ArticleCard
            title={item.title}
            summary={item.summary}
            category={item.category}
            readTime={item.readTime}
            imageSource={item.imageSource}
            onPress={() => handleArticlePress(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={filteredArticles.length === 0 ? renderEmptyState : null}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: ScreenPadding.horizontal,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={renderSeparator}
      />
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContent: {
    marginBottom: Spacing.md,
  },
  pageSubtitle: {
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  quickLinksRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickLinkPressable: {
    flex: 1,
  },
  quickLinkCard: {
    gap: 6,
  },
  quickLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  topicCardsContainer: {
    marginBottom: Spacing.xl,
  },
  topicCardsList: {
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  topicCard: {
    width: 160,
    gap: 6,
  },
  topicIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  topicCardTitle: {
    fontSize: 14,
  },
  topicCardDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  searchContainer: {
    marginBottom: Spacing.lg,
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: AppFontFamily.regular,
    fontSize: 14,
    fontWeight: "400",
    height: "100%",
  },
  categoriesList: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  categoryChip: {
    borderRadius: BorderRadius.full,
  },
  categoryChipInner: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  articleDivider: {
    height: 1,
    marginLeft: 0,
  },
});

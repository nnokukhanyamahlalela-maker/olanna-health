import React, { useState, useEffect, useMemo } from "react";
import { View, FlatList, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ArticleCard } from "@/components/ArticleCard";
import { EmptyState } from "@/components/EmptyState";
import { AppGradient } from "@/components/AppGradient";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, ScreenPadding } from "@/constants/spacing";
import { BorderRadius } from "@/constants/theme";
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
      <ThemedText style={[styles.pageTitle, { color: theme.text }]}>
        Learn
      </ThemedText>
      <ThemedText style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
        Evidence-based health education
      </ThemedText>

      <View style={styles.quickLinksRow}>
        <Pressable
          onPress={() => navigation.navigate("Glossary")}
          style={[styles.quickLinkCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          testID="button-glossary"
        >
          <View style={[styles.quickLinkIcon, { backgroundColor: theme.primary + "15" }]}>
            <Feather name="book" size={18} color={theme.primary} />
          </View>
          <ThemedText style={[styles.quickLinkLabel, { color: theme.text }]}>
            Glossary
          </ThemedText>
          <ThemedText style={[styles.quickLinkDesc, { color: theme.textSecondary }]}>
            Health terms explained
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.topicCardsContainer}>
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          BROWSE BY TOPIC
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicCardsList}
        >
          {TOPIC_CATEGORIES.map((topic) => (
            <Pressable
              key={topic.id}
              onPress={() => setSelectedCategory(topic.label === "Periods 101" ? "Periods" : topic.label)}
              style={[
                styles.topicCard,
                { backgroundColor: topic.color + "20", borderColor: topic.color + "40" },
              ]}
            >
              <View style={[styles.topicIconCircle, { backgroundColor: topic.color + "30" }]}>
                <Feather name={topic.icon} size={20} color={topic.color} />
              </View>
              <ThemedText style={[styles.topicCardTitle, { color: theme.text }]}>
                {topic.label}
              </ThemedText>
              <ThemedText style={[styles.topicCardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                {topic.description}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      >
        {categories.map((item) => (
          <Pressable
            key={item}
            onPress={() => setSelectedCategory(item)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === item ? theme.primary : "transparent",
                borderColor: selectedCategory === item ? theme.primary : theme.border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === item ? "#FFFCFA" : theme.textSecondary,
                },
              ]}
            >
              {item}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {featuredArticle ? (
        <>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            FEATURED
          </ThemedText>
          <ArticleCard
            title={featuredArticle.title}
            summary={featuredArticle.summary}
            category={featuredArticle.category}
            readTime={featuredArticle.readTime}
            featured
            onPress={() => handleArticlePress(featuredArticle)}
          />
          {remainingArticles.length > 0 ? (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                MORE ARTICLES
              </ThemedText>
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
  pageTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 28,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontFamily: "DMSans_300Light",
    fontSize: 14,
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  quickLinksRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickLinkCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
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
  quickLinkLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
  },
  quickLinkDesc: {
    fontFamily: "DMSans_300Light",
    fontSize: 12,
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
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
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
  },
  topicCardDesc: {
    fontFamily: "DMSans_300Light",
    fontSize: 11,
    lineHeight: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    height: "100%",
  },
  categoriesList: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xl,
  },
  sectionLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  articleDivider: {
    height: 1,
    marginLeft: 0,
  },
});

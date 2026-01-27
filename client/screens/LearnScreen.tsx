import React, { useState } from "react";
import { View, FlatList, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ArticleCard } from "@/components/ArticleCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
}

const articles: Article[] = [
  {
    id: "1",
    title: "Understanding Your Menstrual Cycle",
    summary: "Learn about the four phases of your cycle and how they affect your body and mind.",
    category: "Periods",
    readTime: "5 min",
  },
  {
    id: "2",
    title: "PCOS: Symptoms, Diagnosis, and Management",
    summary: "Everything you need to know about Polycystic Ovary Syndrome and how to manage it.",
    category: "PCOS",
    readTime: "8 min",
  },
  {
    id: "3",
    title: "Endometriosis: Living with Chronic Pain",
    summary: "Strategies for managing endometriosis symptoms and improving quality of life.",
    category: "Endometriosis",
    readTime: "7 min",
  },
  {
    id: "4",
    title: "STI Prevention and Testing Guide",
    summary: "A comprehensive guide to sexually transmitted infections and regular testing.",
    category: "Sexual Health",
    readTime: "6 min",
  },
  {
    id: "5",
    title: "Cervical Cancer Screening in South Africa",
    summary: "Understanding the latest guidelines for Pap smears and HPV testing.",
    category: "Screenings",
    readTime: "4 min",
  },
  {
    id: "6",
    title: "Fertility Awareness Methods",
    summary: "Natural family planning and understanding your fertile window.",
    category: "Fertility",
    readTime: "6 min",
  },
  {
    id: "7",
    title: "Nutrition for Hormonal Balance",
    summary: "Foods that support your hormones throughout your menstrual cycle.",
    category: "Wellness",
    readTime: "5 min",
  },
  {
    id: "8",
    title: "Exercise and Your Cycle",
    summary: "How to adapt your workout routine to each phase of your menstrual cycle.",
    category: "Wellness",
    readTime: "4 min",
  },
];

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
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <ThemedText style={[styles.pageTitle, { color: theme.text }]}>
        Learn
      </ThemedText>
      <ThemedText style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
        Evidence-based health education
      </ThemedText>

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
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            MORE ARTICLES
          </ThemedText>
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
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={remainingArticles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ArticleCard
            title={item.title}
            summary={item.summary}
            category={item.category}
            readTime={item.readTime}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={filteredArticles.length === 0 ? renderEmptyState : null}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing["2xl"],
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={renderSeparator}
      />
    </View>
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

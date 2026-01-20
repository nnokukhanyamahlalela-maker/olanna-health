import React, { useState } from "react";
import { View, FlatList, StyleSheet, TextInput, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ArticleCard } from "@/components/ArticleCard";
import { SymptomChip } from "@/components/SymptomChip";
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

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <Feather name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search articles..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
        renderItem={({ item }) => (
          <SymptomChip
            label={item}
            selected={selectedCategory === item}
            onPress={() => setSelectedCategory(item)}
          />
        )}
      />

      <ThemedText type="h3" style={styles.sectionTitle}>
        {selectedCategory === "All" ? "All Articles" : selectedCategory}
      </ThemedText>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      image={require("../../assets/images/empty-search.png")}
      title="No Articles Found"
      description="Try adjusting your search or browse a different category."
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredArticles}
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
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing["2xl"],
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContent: {
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  categoriesList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  separator: {
    height: Spacing.md,
  },
});

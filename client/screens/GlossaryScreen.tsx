import React, { useState, useMemo } from "react";
import { View, FlatList, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/spacing";
import { BorderRadius } from "@/constants/theme";
import { glossaryTerms, GLOSSARY_CATEGORIES, GlossaryTerm, searchGlossary } from "@/data/glossary";

function TermCard({ term, theme, expanded, onToggle }: {
  term: GlossaryTerm;
  theme: any;
  expanded: boolean;
  onToggle: () => void;
}) {
  const categoryColors: Record<string, string> = {
    "Menstrual Health": "#D4A090",
    "Hormones": "#C9A86C",
    "Conditions": "#C8C0D0",
    "Fertility": "#D4A99A",
    "Anatomy": "#B8C4B8",
    "Treatment": "#A8B8C8",
  };

  const color = categoryColors[term.category] || theme.primary;

  return (
    <GlassSurface borderRadius={BorderRadius.md} style={styles.termCard}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={`${term.term}: ${expanded ? "collapse" : "expand"}`}
        testID={`glossary-term-${term.id}`}
      >
        <View style={styles.termHeader}>
          <View style={styles.termTitleRow}>
            <ThemedText style={[styles.termTitle, { color: theme.text }]}>
              {term.term}
            </ThemedText>
            <View style={[styles.termCategoryBadge, { backgroundColor: color + "20" }]}>
              <ThemedText style={[styles.termCategoryText, { color }]}>
                {term.category}
              </ThemedText>
            </View>
          </View>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.textSecondary}
          />
        </View>
        {expanded ? (
          <View style={styles.termBody}>
            <ThemedText style={[styles.termDefinition, { color: theme.textSecondary }]}>
              {term.definition}
            </ThemedText>
            {term.relatedTerms && term.relatedTerms.length > 0 ? (
              <View style={styles.relatedRow}>
                <ThemedText style={[styles.relatedLabel, { color: theme.textSecondary }]}>
                  Related:
                </ThemedText>
                <View style={styles.relatedTags}>
                  {term.relatedTerms.map((rt) => (
                    <View key={rt} style={[styles.relatedTag, { backgroundColor: theme.primary + "15" }]}>
                      <ThemedText style={[styles.relatedTagText, { color: theme.primary }]}>
                        {rt}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
      </Pressable>
    </GlassSurface>
  );
}

export default function GlossaryScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    return searchGlossary(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach((term) => {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    });
    const sections: { letter: string; terms: GlossaryTerm[] }[] = [];
    Object.keys(groups)
      .sort()
      .forEach((letter) => {
        sections.push({ letter, terms: groups[letter] });
      });
    return sections;
  }, [filteredTerms]);

  const flatData = useMemo(() => {
    const items: ({ type: "header"; letter: string } | { type: "term"; term: GlossaryTerm })[] = [];
    groupedTerms.forEach((group) => {
      items.push({ type: "header", letter: group.letter });
      group.terms.forEach((term) => {
        items.push({ type: "term", term });
      });
    });
    return items;
  }, [groupedTerms]);

  const renderItem = ({ item }: { item: typeof flatData[0] }) => {
    if (item.type === "header") {
      return (
        <ThemedText style={[styles.letterHeader, { color: theme.primary }]}>
          {item.letter}
        </ThemedText>
      );
    }
    return (
      <TermCard
        term={item.term}
        theme={theme}
        expanded={expandedId === item.term.id}
        onToggle={() =>
          setExpandedId((prev) => (prev === item.term.id ? null : item.term.id))
        }
      />
    );
  };

  return (
    <AppGradient style={styles.container}>
      <FlatList
        data={flatData}
        keyExtractor={(item, index) =>
          item.type === "header" ? `header-${item.letter}` : `term-${item.term.id}`
        }
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <ThemedText style={[styles.pageTitle, { color: theme.text }]}>
              Glossary
            </ThemedText>
            <ThemedText style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
              {glossaryTerms.length} terms explained simply
            </ThemedText>

            <GlassSurface noPadding borderRadius={BorderRadius.md} noShadow style={styles.searchContainer}>
              <View style={styles.searchInner}>
              <Feather name="search" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search terms..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                testID="glossary-search-input"
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
              {GLOSSARY_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategory === cat ? theme.primary : "transparent",
                      borderColor: selectedCategory === cat ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.categoryText,
                      { color: selectedCategory === cat ? "#FFFCFA" : theme.textSecondary },
                    ]}
                  >
                    {cat}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="search" size={40} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No terms found
            </ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Try a different search or category
            </ThemedText>
          </View>
        }
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: 20,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
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
  letterHeader: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 18,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  termCard: {
    marginBottom: Spacing.sm,
  },
  termHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  termTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginRight: Spacing.sm,
  },
  termTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
  },
  termCategoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  termCategoryText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  termBody: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  termDefinition: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  relatedRow: {
    gap: Spacing.xs,
  },
  relatedLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    letterSpacing: 1,
  },
  relatedTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  relatedTag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  relatedTagText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: Spacing.sm,
  },
  emptyText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
  },
  emptySubtext: {
    fontFamily: "DMSans_300Light",
    fontSize: 13,
  },
});

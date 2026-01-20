import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { SYMPTOM_TAGS } from '@/lib/symptomSchema';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const { theme } = useTheme();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
        Context Tags (optional)
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsRow}
      >
        {SYMPTOM_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Pressable
              key={tag}
              onPress={() => toggleTag(tag)}
              style={[
                styles.tag,
                {
                  backgroundColor: isSelected ? `${theme.tertiary}20` : theme.backgroundSecondary,
                  borderColor: isSelected ? theme.tertiary : theme.border,
                },
              ]}
              testID={`tag-${tag.replace(/\s+/g, '-')}`}
            >
              <Feather
                name={isSelected ? 'check' : 'plus'}
                size={12}
                color={isSelected ? theme.tertiary : theme.textSecondary}
              />
              <ThemedText
                type="caption"
                style={{ color: isSelected ? theme.tertiary : theme.text }}
              >
                {tag}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
});

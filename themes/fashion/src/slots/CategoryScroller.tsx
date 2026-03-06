/**
 * CategoryScroller - Horizontal category icons for home screen
 *
 * Displays category icons in a horizontal scrollable row.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type Category } from '@ridly/mobile-core';

interface CategoryScrollerProps {
  slotContext?: {
    categories?: Category[];
    onCategoryPress?: (category: Category) => void;
    onSeeAll?: () => void;
  };
}

// Icon mapping for common category names
const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  fashion: 'shirt-outline',
  clothing: 'shirt-outline',
  apparel: 'shirt-outline',
  tech: 'phone-portrait-outline',
  electronics: 'phone-portrait-outline',
  home: 'home-outline',
  furniture: 'bed-outline',
  beauty: 'sparkles-outline',
  cosmetics: 'sparkles-outline',
  watches: 'watch-outline',
  accessories: 'watch-outline',
  jewelry: 'diamond-outline',
  shoes: 'footsteps-outline',
  bags: 'bag-outline',
  sports: 'fitness-outline',
  kids: 'happy-outline',
  default: 'grid-outline',
};

function getCategoryIcon(name: string): keyof typeof Ionicons.glyphMap {
  const lowerName = name.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lowerName.includes(key)) {
      return icon;
    }
  }
  return categoryIcons.default;
}

export function CategoryScroller({ slotContext }: CategoryScrollerProps) {
  const { theme } = useTheme();
  const categories = slotContext?.categories || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Categories
        </Text>
        <Pressable onPress={slotContext?.onSeeAll}>
          <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
            See All
          </Text>
        </Pressable>
      </View>

      {/* Category icons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.slice(0, 6).map((category) => (
          <Pressable
            key={category.id}
            style={styles.categoryItem}
            onPress={() => slotContext?.onCategoryPress?.(category)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Ionicons
                name={getCategoryIcon(category.name)}
                size={24}
                color={theme.colors.text}
              />
            </View>
            <Text
              style={[styles.categoryName, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: 64,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

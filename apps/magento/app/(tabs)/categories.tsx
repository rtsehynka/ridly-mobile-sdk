/**
 * RIDLY Mobile Demo - Categories Screen
 *
 * Shows all categories from Magento.
 */

import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CategoryList,
  useTheme,
  useToast,
} from '@ridly/mobile-core';
import type { Category } from '@ridly/mobile-core';

import { magentoAdapter } from '../../lib/adapter';

export default function CategoriesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      const result = await magentoAdapter.getCategories();
      setCategories(result);
    } catch (err) {
      console.error('Failed to load categories:', err);
      error('Error', 'Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCategoryPress = useCallback((category: Category) => {
    router.push(`/category/${category.slug}`);
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <CategoryList
        categories={categories}
        layout="grid"
        columns={2}
        onCategoryPress={handleCategoryPress}
        isLoading={isLoading}
        skeletonCount={6}
        showProductCount={true}
        showImages={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

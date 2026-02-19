/**
 * RIDLY Mobile Demo - Category Detail Screen
 *
 * Shows products in a category from Magento.
 */

import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Text,
  ProductGrid,
  useTheme,
  useToast,
} from '@ridly/mobile-core';
import type { Product, Category } from '@ridly/mobile-core';

import { magentoAdapter } from '../../lib/adapter';

export default function CategoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { error } = useToast();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadCategory = useCallback(async () => {
    if (!slug) return;

    try {
      const result = await magentoAdapter.getCategory(slug);
      setCategory(result);
    } catch (err) {
      console.error('Failed to load category:', err);
    }
  }, [slug]);

  const loadProducts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!slug || !category) return;

    try {
      const result = await magentoAdapter.getProducts({
        categoryId: category.id,
        page: pageNum,
        pageSize: 20,
      });

      if (append) {
        setProducts(prev => [...prev, ...result.items]);
      } else {
        setProducts(result.items);
      }
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load products:', err);
      error('Error', 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [slug, category, error]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  useEffect(() => {
    if (category) {
      loadProducts(1, false);
    }
  }, [category, loadProducts]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    loadProducts(page + 1, true);
  }, [hasMore, isLoadingMore, page, loadProducts]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    loadProducts(1, false);
  }, [loadProducts]);

  const handleProductPress = useCallback((product: Product) => {
    router.push(`/product/${product.slug}`);
  }, [router]);

  if (isLoading && !category) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: category?.name || 'Category' }} />

      <ProductGrid
        products={products}
        columns={2}
        cardSize="md"
        onProductPress={handleProductPress}
        isLoading={isLoading || isLoadingMore}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={isLoading && products.length > 0}
        onRefresh={handleRefresh}
        emptyMessage={`No products found in ${category?.name || 'this category'}`}
        ListHeaderComponent={
          category?.description ? (
            <View style={styles.header}>
              <Text variant="body" color="textSecondary">
                {category.description}
              </Text>
            </View>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
});

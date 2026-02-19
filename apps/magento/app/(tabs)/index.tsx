/**
 * RIDLY Mobile Demo - Home Screen
 *
 * Clean, minimal home screen matching modern e-commerce aesthetic.
 */

import { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Text,
  Button,
  ProductRow,
  CategoryList,
  useTheme,
  useToast,
} from '@ridly/mobile-core';
import type { Product, Category } from '@ridly/mobile-core';

import { magentoAdapter } from '../../lib/adapter';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // Load products and categories in parallel
      const [productsResult, categoriesResult] = await Promise.all([
        magentoAdapter.getProducts({ pageSize: 10 }),
        magentoAdapter.getCategories(),
      ]);

      setProducts(productsResult.items);
      setCategories(categoriesResult);
    } catch (err) {
      console.error('Failed to load data:', err);
      error('Error', 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [loadData]);

  const handleProductPress = useCallback((product: Product) => {
    router.push(`/product/${product.slug}`);
  }, [router]);

  const handleCategoryPress = useCallback((category: Category) => {
    router.push(`/category/${category.slug}`);
  }, [router]);

  const handleViewAllProducts = useCallback(() => {
    router.push('/categories');
  }, [router]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.text,
              }}
            >
              Categories
            </Text>
          </View>
          <CategoryList
            categories={categories}
            layout="chips"
            onCategoryPress={handleCategoryPress}
            isLoading={isLoading}
            skeletonCount={6}
            showProductCount={false}
          />
        </View>

        {/* Featured Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.text,
              }}
            >
              Featured
            </Text>
            <Button variant="ghost" size="sm" onPress={handleViewAllProducts}>
              View All
            </Button>
          </View>
          <ProductRow
            products={products}
            cardSize="md"
            onProductPress={handleProductPress}
            isLoading={isLoading}
            skeletonCount={3}
          />
        </View>

        {/* New Arrivals Section - reuse same products for demo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.text,
              }}
            >
              New Arrivals
            </Text>
          </View>
          <ProductRow
            products={products.slice(0, 6)}
            cardSize="md"
            onProductPress={handleProductPress}
            isLoading={isLoading}
            skeletonCount={3}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});

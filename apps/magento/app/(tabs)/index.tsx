/**
 * RIDLY Mobile Demo - Home Screen
 *
 * Clean, minimal home screen matching modern e-commerce aesthetic.
 */

import { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, Image, Pressable } from 'react-native';
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

// Import logo
const ridlyLogo = require('../../assets/images/ridly-logo.png');

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
        magentoAdapter.getCategoryTree(),
      ]);

      setProducts(productsResult.items);

      // Flatten and filter categories - get level 2 categories (main categories)
      const flattenCategories = (cats: Category[], level = 0): Category[] => {
        let result: Category[] = [];
        for (const cat of cats) {
          if (cat.name !== 'Default Category' && cat.name !== 'Root Catalog') {
            result.push({ ...cat, level });
          }
          if (cat.children && cat.children.length > 0) {
            result = result.concat(flattenCategories(cat.children as Category[], level + 1));
          }
        }
        return result;
      };

      const allCats = flattenCategories(categoriesResult);
      // Show categories at level 1 (children of root)
      const mainCategories = allCats.filter(c => c.level === 1).slice(0, 8);
      setCategories(mainCategories);
      console.log('Categories loaded:', mainCategories.length, mainCategories.map(c => c.name));
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
        {/* Hero Banner */}
        <View style={styles.banner}>
          <View style={[styles.bannerContent, { backgroundColor: theme.colors.surface }]}>
            <Image
              source={ridlyLogo}
              style={styles.bannerLogo}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
              Mobile Commerce SDK
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
              Build native shopping apps faster
            </Text>
          </View>
        </View>

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
          {isLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={{ alignItems: 'center', width: 72 }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.border }} />
                  <View style={{ width: 50, height: 12, borderRadius: 4, backgroundColor: theme.colors.border, marginTop: 8 }} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPress(category)}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    width: 72,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: theme.colors.surface,
                      borderWidth: 2,
                      borderColor: theme.colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {category.image?.url ? (
                      <Image
                        source={{ uri: category.image.url }}
                        style={{ width: 64, height: 64, borderRadius: 32 }}
                      />
                    ) : (
                      <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary }}>
                        {category.name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <Text
                    numberOfLines={2}
                    style={{
                      fontSize: 12,
                      color: theme.colors.text,
                      textAlign: 'center',
                      marginTop: 8,
                      fontWeight: '500',
                    }}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
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
  banner: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bannerContent: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  bannerLogo: {
    width: 120,
    height: 40,
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

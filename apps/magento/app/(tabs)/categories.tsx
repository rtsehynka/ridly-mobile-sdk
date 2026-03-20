/**
 * RIDLY Mobile Demo - Categories Screen
 *
 * Shows all categories with subcategories and search for categories + products.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Text as RNText,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useToast, Price } from '@ridly/mobile-core';
import type { Category, Product } from '@ridly/mobile-core';

import { magentoAdapter } from '../../lib/adapter';

// Strip HTML tags and decode entities
const stripHtml = (html: string): string => {
  if (!html) return '';
  let text = html;

  // First decode HTML entities (in case HTML is double-encoded)
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));

  // Remove style tags and their content completely
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove script tags and their content
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove all HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Decode entities again (in case there were nested)
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

  // Collapse multiple spaces and trim
  text = text.replace(/\s+/g, ' ').trim();

  // If result is empty or just whitespace, return empty
  if (!text || text.length < 3) return '';

  return text;
};

export default function CategoriesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await magentoAdapter.getCategoryTree();

        // Extract children from root categories
        let mainCategories: Category[] = [];
        for (const cat of result) {
          if (cat.name === 'Default Category' || cat.name === 'Root Catalog') {
            if (cat.children && cat.children.length > 0) {
              mainCategories = [...mainCategories, ...(cat.children as Category[])];
            }
          } else {
            mainCategories.push(cat);
          }
        }

        setCategories(mainCategories);
      } catch (err) {
        console.error('Failed to load categories:', err);
        error('Error', 'Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Search products with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchProducts([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await magentoAdapter.getProducts({
          searchTerm: searchQuery,
          pageSize: 10,
        });
        setSearchProducts(result.items);
      } catch (err) {
        console.error('Product search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Flatten categories for search
  const getAllCategories = useCallback((cats: Category[], parentName = ''): Array<Category & { parentName: string }> => {
    let result: Array<Category & { parentName: string }> = [];
    for (const cat of cats) {
      result.push({ ...cat, parentName });
      if (cat.children && cat.children.length > 0) {
        result = [...result, ...getAllCategories(cat.children as Category[], cat.name)];
      }
    }
    return result;
  }, []);

  // Get filtered categories for search
  const getFilteredCategories = useCallback(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const allCats = getAllCategories(categories);
    return allCats.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
    );
  }, [searchQuery, categories, getAllCategories]);

  const handleCategoryPress = (category: Category) => {
    router.push(`/category/${category.slug}`);
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.slug}`);
  };

  const handleBarcodeScan = (data: string, type: 'barcode' | 'qr') => {
    setScannerVisible(false);
    // Search for the scanned code
    setSearchQuery(data);
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <View key={category.id}>
        <Pressable
          onPress={() => {
            if (hasChildren) {
              toggleExpanded(category.id);
            } else {
              handleCategoryPress(category);
            }
          }}
          onLongPress={() => handleCategoryPress(category)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingLeft: 16 + level * 20,
            paddingRight: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: 'transparent',
          }}
        >
          {/* Category Image */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              overflow: 'hidden',
            }}
          >
            {category.image?.url ? (
              <Image
                source={{ uri: category.image.url }}
                style={{ width: 48, height: 48, borderRadius: 8 }}
              />
            ) : (
              <RNText style={{ fontSize: 20, fontWeight: '700', color: theme.colors.primary }}>
                {category.name.charAt(0)}
              </RNText>
            )}
          </View>

          {/* Category Info */}
          <View style={{ flex: 1 }}>
            <RNText style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
              {category.name}
            </RNText>
            {category.productCount && category.productCount > 0 ? (
              <RNText style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>
                {category.productCount} products
              </RNText>
            ) : null}
          </View>

          {/* Chevron Icon */}
          <Ionicons
            name={hasChildren && isExpanded ? 'chevron-down' : 'chevron-forward'}
            size={20}
            color={theme.colors.textSecondary}
          />
        </Pressable>

        {/* Subcategories */}
        {hasChildren && isExpanded && (
          <View>
            {(category.children as Category[]).map((child) => renderCategory(child, level + 1))}
          </View>
        )}
      </View>
    );
  };

  const renderCategoryResult = (category: Category & { parentName: string }) => (
    <Pressable
      key={`cat-${category.id}`}
      onPress={() => handleCategoryPress(category)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          overflow: 'hidden',
        }}
      >
        {category.image?.url ? (
          <Image
            source={{ uri: category.image.url }}
            style={{ width: 48, height: 48, borderRadius: 8 }}
          />
        ) : (
          <Ionicons name="folder-outline" size={24} color={theme.colors.primary} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <RNText style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
          {category.name}
        </RNText>
        <RNText style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
          Category{category.parentName ? ` in ${category.parentName}` : ''}
        </RNText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </Pressable>
  );

  const renderProductResult = (product: Product) => (
    <Pressable
      key={`prod-${product.id}`}
      onPress={() => handleProductPress(product)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          overflow: 'hidden',
        }}
      >
        {product.thumbnail?.url ? (
          <Image
            source={{ uri: product.thumbnail.url }}
            style={{ width: 48, height: 48, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="cube-outline" size={24} color={theme.colors.primary} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <RNText numberOfLines={1} style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
          {product.name}
        </RNText>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <RNText style={{ fontSize: 12, color: theme.colors.textSecondary }}>Product</RNText>
          <RNText style={{ fontSize: 12, color: theme.colors.textSecondary }}> · </RNText>
          <Price price={product.price.amount} currency={product.price.currency} size="sm" />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </Pressable>
  );

  const filteredCategories = getFilteredCategories();
  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasResults = filteredCategories.length > 0 || searchProducts.length > 0;

  return (
    <SafeAreaView testID="categories-screen" style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      {/* Search Bar */}
      <View testID="search-bar-container" style={{ padding: 12, backgroundColor: theme.colors.surface }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            testID="search-input"
            style={{
              flex: 1,
              fontSize: 16,
              color: theme.colors.text,
              marginLeft: 8,
              padding: 0,
            }}
            placeholder="Search categories and products..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={{ marginLeft: 8 }}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </Pressable>
          )}
          {/* Barcode Scanner Button */}
          <Pressable
            testID="barcode-scanner-button"
            onPress={() => setScannerVisible(true)}
            style={{ marginLeft: 8, padding: 4 }}
          >
            <Ionicons name="barcode-outline" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Barcode Scanner Modal */}
      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={() => setScannerVisible(false)}
      >
        <View testID="barcode-scanner-modal" style={{ flex: 1, backgroundColor: '#000' }}>
          {/* Scanner Header */}
          <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pressable
                testID="scanner-close-button"
                onPress={() => setScannerVisible(false)}
                style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
              <RNText style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                Scan Barcode
              </RNText>
              <View style={{ width: 40 }} />
            </View>
          </View>

          {/* Scanner Placeholder */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                width: 250,
                height: 250,
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.5)',
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="scan-outline" size={100} color="rgba(255,255,255,0.5)" />
            </View>
            <RNText style={{ color: 'rgba(255,255,255,0.8)', marginTop: 24, fontSize: 14, textAlign: 'center' }}>
              Position the barcode within the frame{'\n'}to scan automatically
            </RNText>
          </View>

          {/* Manual Entry Button */}
          <View style={{ padding: 20, paddingBottom: 50 }}>
            <Pressable
              testID="manual-entry-button"
              onPress={() => {
                setScannerVisible(false);
                // Focus search input
              }}
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <RNText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Enter Code Manually
              </RNText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <RNText style={{ marginTop: 12, color: theme.colors.textSecondary }}>
            Loading categories...
          </RNText>
        </View>
      ) : hasSearchQuery ? (
        /* Search Results */
        <ScrollView style={{ flex: 1 }}>
          {isSearching && (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          )}

          {/* Category Results */}
          {filteredCategories.length > 0 && (
            <View>
              <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.colors.surface }}>
                <RNText style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, textTransform: 'uppercase' }}>
                  Categories ({filteredCategories.length})
                </RNText>
              </View>
              {filteredCategories.map(renderCategoryResult)}
            </View>
          )}

          {/* Product Results */}
          {searchProducts.length > 0 && (
            <View>
              <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.colors.surface }}>
                <RNText style={{ fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, textTransform: 'uppercase' }}>
                  Products ({searchProducts.length})
                </RNText>
              </View>
              {searchProducts.map(renderProductResult)}
            </View>
          )}

          {/* No Results */}
          {!isSearching && !hasResults && (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
              <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
              <RNText style={{ marginTop: 12, color: theme.colors.textSecondary }}>
                No results found for "{searchQuery}"
              </RNText>
            </View>
          )}
        </ScrollView>
      ) : (
        /* Category Tree */
        <ScrollView style={{ flex: 1 }}>
          {categories.length > 0 ? (
            categories.map((cat) => renderCategory(cat))
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
              <Ionicons name="folder-outline" size={48} color={theme.colors.textSecondary} />
              <RNText style={{ marginTop: 12, color: theme.colors.textSecondary }}>
                No categories available
              </RNText>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

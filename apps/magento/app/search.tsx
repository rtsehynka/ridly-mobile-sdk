/**
 * RIDLY Mobile Demo - Search Screen
 *
 * Full-screen search with results.
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, useTheme, useSearch, Price } from '@ridly/mobile-core';
import type { Product } from '@ridly/mobile-core';

export default function SearchScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const {
    term,
    setTerm,
    results,
    isLoading,
    clear,
  } = useSearch({ minChars: 1 });

  const items = results?.items || [];
  const hasSearched = term.length > 0;

  // Auto focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleClear = useCallback(() => {
    clear();
  }, [clear]);

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <Pressable
        style={[styles.productItem, { borderBottomColor: theme.colors.border }]}
        onPress={() => router.push(`/product/${item.slug}`)}
      >
        <Image
          source={{ uri: item.thumbnail?.url || item.images?.[0]?.url }}
          style={[styles.productImage, { backgroundColor: theme.colors.surface }]}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Price price={item.price.amount} currency={item.price.currency} size="sm" />
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </Pressable>
    ),
    [theme, router]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.textSecondary}
            value={term}
            onChangeText={setTerm}
            onSubmitEditing={() => Keyboard.dismiss()}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {term.length > 0 && (
            <Pressable onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </Pressable>
          )}
        </View>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={{ color: theme.colors.primary, fontWeight: '500' }}>Cancel</Text>
        </Pressable>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : hasSearched && items.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
          <Text variant="body" color="textSecondary" style={{ marginTop: 12 }}>
            No results for "{term}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            !hasSearched ? (
              <View style={styles.emptyHint}>
                <Text variant="body" color="textSecondary" align="center">
                  Search for products by name or category
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyHint: {
    paddingHorizontal: 32,
    paddingTop: 48,
  },
});

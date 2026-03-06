/**
 * FeaturedProducts - Featured products grid for home screen
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Price } from '@ridly/mobile-core';
import type { Product } from '@ridly/mobile-core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface FeaturedProductsProps {
  slotContext?: {
    products?: Product[];
    onProductPress?: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
    onToggleFavorite?: (product: Product) => void;
    onSeeAll?: () => void;
    favorites?: Set<string>;
  };
}

export function FeaturedProducts({ slotContext }: FeaturedProductsProps) {
  const { theme } = useTheme();
  const products = slotContext?.products || [];
  const favorites = slotContext?.favorites || new Set<string>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Featured
        </Text>
        <Pressable onPress={slotContext?.onSeeAll}>
          <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
            See All
          </Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {products.slice(0, 4).map((product) => {
          const isFavorite = favorites.has(product.id);
          const brandAttr = product.attributes?.find(
            (attr) =>
              attr.code === 'brand' ||
              attr.code === 'manufacturer' ||
              attr.code === 'brand_name' ||
              attr.code === 'product_brand'
          );
          const brand = brandAttr?.value || '';

          // Get color options for swatches
          const colorOption = product.options?.find(
            (opt) => opt.code === 'color' || opt.code === 'colour'
          );
          const colorSwatches = colorOption?.values?.slice(0, 4) || [];

          // Get size options count
          const sizeOption = product.options?.find(
            (opt) => opt.code === 'size'
          );
          const sizeCount = sizeOption?.values?.length || 0;

          return (
            <Pressable
              key={product.id}
              style={styles.card}
              onPress={() => slotContext?.onProductPress?.(product)}
            >
              <View style={[styles.imageContainer, { backgroundColor: theme.colors.surface }]}>
                <Image
                  source={{ uri: product.thumbnail?.url || product.images?.[0]?.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <Pressable
                  style={[styles.favoriteButton, { backgroundColor: theme.colors.background }]}
                  onPress={() => slotContext?.onToggleFavorite?.(product)}
                >
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isFavorite ? theme.colors.error : theme.colors.textSecondary}
                  />
                </Pressable>
              </View>

              <View style={styles.info}>
                {brand ? (
                  <Text style={[styles.brand, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {String(brand).toUpperCase()}
                  </Text>
                ) : null}
                <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
                  {product.name}
                </Text>

                {/* Options: Color swatches and size count */}
                {(colorSwatches.length > 0 || sizeCount > 0) && (
                  <View style={styles.optionsRow}>
                    {colorSwatches.length > 0 && (
                      <View style={styles.swatchesContainer}>
                        {colorSwatches.map((color) => (
                          <View
                            key={color.id}
                            style={[
                              styles.colorSwatch,
                              {
                                backgroundColor: color.swatch?.startsWith('#')
                                  ? color.swatch
                                  : theme.colors.border,
                                borderColor: theme.colors.border,
                              },
                            ]}
                          />
                        ))}
                        {(colorOption?.values?.length || 0) > 4 && (
                          <Text style={[styles.moreColors, { color: theme.colors.textSecondary }]}>
                            +{(colorOption?.values?.length || 0) - 4}
                          </Text>
                        )}
                      </View>
                    )}
                    {sizeCount > 0 && (
                      <Text style={[styles.sizeCount, { color: theme.colors.textSecondary }]}>
                        {sizeCount} sizes
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.priceRow}>
                  <Price
                    price={product.price.amount}
                    currency={product.price.currency}
                    size="md"
                  />
                  <Pressable
                    style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => slotContext?.onAddToCart?.(product)}
                  >
                    <Ionicons name="add" size={20} color={theme.colors.onPrimary} />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingHorizontal: 2,
  },
  brand: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  swatchesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colorSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  moreColors: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 2,
  },
  sizeCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

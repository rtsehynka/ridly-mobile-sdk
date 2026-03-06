/**
 * FeaturedProducts - Featured products grid for home screen
 *
 * Displays products in a 2-column grid with brand name, product name, and price.
 * Includes favorite button and add-to-cart quick action.
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
import { useTheme, Price, type Product } from '@ridly/mobile-core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 16px padding on each side + 16px gap

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
  const favorites = slotContext?.favorites || new Set();

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Products grid */}
      <View style={styles.grid}>
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favorites.has(product.id)}
            onPress={() => slotContext?.onProductPress?.(product)}
            onAddToCart={() => slotContext?.onAddToCart?.(product)}
            onToggleFavorite={() => slotContext?.onToggleFavorite?.(product)}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onPress: () => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  theme: any;
}

function ProductCard({
  product,
  isFavorite,
  onPress,
  onAddToCart,
  onToggleFavorite,
  theme,
}: ProductCardProps) {
  // Extract brand from attributes or use placeholder
  const brand = product.attributes?.find(
    (attr) => attr.code === 'brand' || attr.code === 'manufacturer'
  )?.value || '';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Product image */}
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Image
          source={{ uri: product.thumbnail?.url || product.images?.[0]?.url }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Favorite button */}
        <Pressable
          style={[
            styles.favoriteButton,
            { backgroundColor: theme.colors.background },
          ]}
          onPress={onToggleFavorite}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? theme.colors.error : theme.colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Product info */}
      <View style={styles.info}>
        {brand ? (
          <Text
            style={[styles.brand, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {brand.toUpperCase()}
          </Text>
        ) : null}

        <Text
          style={[styles.name, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <Price
            price={product.price.amount}
            currency={product.price.currency}
            originalPrice={product.price.originalAmount}
            size="md"
          />

          {/* Add to cart button */}
          <Pressable
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={onAddToCart}
          >
            <Ionicons name="add" size={20} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
      </View>
    </Pressable>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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

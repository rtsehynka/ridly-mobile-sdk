/**
 * RIDLY Mobile SDK - ProductCard Component
 *
 * Minimal, clean product card matching modern e-commerce aesthetic.
 */

import {
  View,
  Image,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from '../ui/Text';
import { Price } from '../ui/Price';
import { DiscountBadge, Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { useTheme } from '../../theme/ThemeContext';
import type { Product } from '../../types/product';

export type ProductCardSize = 'sm' | 'md' | 'lg';
export type ProductCardLayout = 'vertical' | 'horizontal';

export interface ProductCardProps {
  /**
   * Product data
   */
  product: Product;

  /**
   * Card size
   * @default 'md'
   */
  size?: ProductCardSize;

  /**
   * Card layout
   * @default 'vertical'
   */
  layout?: ProductCardLayout;

  /**
   * Called when card is pressed
   */
  onPress?: (product: Product) => void;

  /**
   * Called when add to cart is pressed
   */
  onAddToCart?: (product: Product) => void;

  /**
   * Show discount badge
   * @default true
   */
  showDiscount?: boolean;

  /**
   * Show out of stock badge
   * @default true
   */
  showOutOfStock?: boolean;

  /**
   * Show brand name
   * @default false
   */
  showBrand?: boolean;

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * ProductCard Component
 *
 * Clean, minimal product card with no shadows for modern e-commerce aesthetic.
 *
 * @example
 * ```tsx
 * <ProductCard
 *   product={product}
 *   onPress={(p) => router.push(`/product/${p.slug}`)}
 * />
 * ```
 */
export function ProductCard({
  product,
  size = 'md',
  layout = 'vertical',
  onPress,
  showDiscount = true,
  showOutOfStock = true,
  showBrand = false,
  style,
}: ProductCardProps) {
  const { theme } = useTheme();

  // Size configurations - clean minimal sizing
  const sizeConfig = {
    sm: {
      imageSize: 120,
      padding: 8,
      titleSize: 13 as const,
      brandSize: 11 as const,
      priceSize: 'sm' as const,
      gap: 4,
    },
    md: {
      imageSize: 160,
      padding: 10,
      titleSize: 14 as const,
      brandSize: 12 as const,
      priceSize: 'md' as const,
      gap: 6,
    },
    lg: {
      imageSize: 200,
      padding: 12,
      titleSize: 15 as const,
      brandSize: 13 as const,
      priceSize: 'lg' as const,
      gap: 8,
    },
  };

  const config = sizeConfig[size];

  const hasDiscount = product.specialPrice && product.specialPrice.amount < product.price.amount;
  const discountPercent = hasDiscount
    ? Math.round(((product.price.amount - product.specialPrice!.amount) / product.price.amount) * 100)
    : 0;

  const imageUrl = product.thumbnail?.url || product.images[0]?.url;

  // Extract brand from product metadata or name
  const brand = (product as Product & { brand?: string }).brand;

  const isVertical = layout === 'vertical';

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      style={({ pressed }) => [
        {
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.card,
          overflow: 'hidden',
          flexDirection: isVertical ? 'column' : 'row',
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {/* Image Container */}
      <View
        style={{
          position: 'relative',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.image,
          overflow: 'hidden',
          ...(isVertical
            ? { width: '100%', aspectRatio: 1 }
            : { width: config.imageSize, height: config.imageSize }),
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
            }}
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: theme.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              No Image
            </Text>
          </View>
        )}

        {/* Discount Badge - top left */}
        {hasDiscount && showDiscount && (
          <View style={{ position: 'absolute', top: 8, left: 8 }}>
            <DiscountBadge percent={discountPercent} size="sm" />
          </View>
        )}

        {/* Out of Stock Badge - top right */}
        {!product.inStock && showOutOfStock && (
          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <Badge variant="secondary" size="sm">
              Out of Stock
            </Badge>
          </View>
        )}
      </View>

      {/* Content */}
      <View
        style={{
          paddingTop: isVertical ? config.padding : 0,
          paddingHorizontal: isVertical ? 0 : config.padding,
          flex: isVertical ? undefined : 1,
          justifyContent: isVertical ? 'flex-start' : 'center',
        }}
      >
        {/* Brand Name */}
        {showBrand && brand && (
          <Text
            numberOfLines={1}
            style={{
              fontSize: config.brandSize,
              fontWeight: '400',
              color: theme.colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 2,
            }}
          >
            {brand}
          </Text>
        )}

        {/* Product Name */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: config.titleSize,
            fontWeight: '500',
            color: theme.colors.text,
            lineHeight: config.titleSize * 1.3,
            marginBottom: config.gap,
          }}
        >
          {product.name}
        </Text>

        {/* Price */}
        <Price
          price={hasDiscount ? product.specialPrice!.amount : product.price.amount}
          originalPrice={hasDiscount ? product.price.amount : undefined}
          currency={product.price.currency}
          size={config.priceSize}
          showDiscount={false}
        />
      </View>
    </Pressable>
  );
}

/**
 * ProductCard Skeleton
 */
export interface ProductCardSkeletonProps {
  size?: ProductCardSize;
  layout?: ProductCardLayout;
  style?: StyleProp<ViewStyle>;
}

export function ProductCardSkeleton({
  size = 'md',
  layout = 'vertical',
  style,
}: ProductCardSkeletonProps) {
  const { theme } = useTheme();

  const sizeConfig = {
    sm: { imageSize: 120, padding: 8, gap: 4 },
    md: { imageSize: 160, padding: 10, gap: 6 },
    lg: { imageSize: 200, padding: 12, gap: 8 },
  };

  const config = sizeConfig[size];
  const isVertical = layout === 'vertical';

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.card,
          overflow: 'hidden',
          flexDirection: isVertical ? 'column' : 'row',
        },
        style,
      ]}
    >
      {/* Image Skeleton */}
      <Skeleton
        width={isVertical ? '100%' : config.imageSize}
        height={isVertical ? undefined : config.imageSize}
        style={isVertical ? { aspectRatio: 1 } : undefined}
        borderRadius={theme.borderRadius.image}
      />

      {/* Content Skeleton */}
      <View
        style={{
          paddingTop: isVertical ? config.padding : 0,
          paddingHorizontal: isVertical ? 0 : config.padding,
          flex: isVertical ? undefined : 1,
        }}
      >
        <Skeleton width="70%" height={14} style={{ marginBottom: config.gap }} />
        <Skeleton width="90%" height={14} style={{ marginBottom: config.gap }} />
        <Skeleton width="40%" height={16} />
      </View>
    </View>
  );
}

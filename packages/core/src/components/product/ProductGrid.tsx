/**
 * RIDLY Mobile SDK - ProductGrid Component
 *
 * Display products in a responsive grid layout.
 */

import {
  View,
  FlatList,
  type StyleProp,
  type ViewStyle,
  type ListRenderItemInfo,
  useWindowDimensions,
} from 'react-native';
import { ProductCard, ProductCardSkeleton, type ProductCardSize } from './ProductCard';
import { Text } from '../ui/Text';
import { useTheme } from '../../theme/ThemeContext';
import type { Product } from '../../types/product';

export interface ProductGridProps {
  /**
   * Products to display
   */
  products: Product[];

  /**
   * Number of columns
   * @default 2
   */
  columns?: number;

  /**
   * Gap between items
   * @default 12
   */
  gap?: number;

  /**
   * Card size
   * @default 'md'
   */
  cardSize?: ProductCardSize;

  /**
   * Called when a product is pressed
   */
  onProductPress?: (product: Product) => void;

  /**
   * Called when add to cart is pressed
   */
  onAddToCart?: (product: Product) => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Number of skeleton items when loading
   * @default 4
   */
  skeletonCount?: number;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Header component
   */
  ListHeaderComponent?: React.ReactElement;

  /**
   * Footer component
   */
  ListFooterComponent?: React.ReactElement;

  /**
   * Called when end is reached (for pagination)
   */
  onEndReached?: () => void;

  /**
   * Threshold for onEndReached
   * @default 0.5
   */
  onEndReachedThreshold?: number;

  /**
   * Refreshing state
   */
  refreshing?: boolean;

  /**
   * Called on pull to refresh
   */
  onRefresh?: () => void;

  /**
   * Custom container style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Custom content container style
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * ProductGrid Component
 *
 * @example
 * ```tsx
 * <ProductGrid
 *   products={products}
 *   columns={2}
 *   onProductPress={(p) => router.push(`/product/${p.slug}`)}
 *   onEndReached={loadMore}
 * />
 * ```
 */
export function ProductGrid({
  products,
  columns = 2,
  gap = 12,
  cardSize = 'md',
  onProductPress,
  onAddToCart,
  isLoading = false,
  skeletonCount = 4,
  emptyMessage = 'No products found',
  ListHeaderComponent,
  ListFooterComponent,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing,
  onRefresh,
  style,
  contentContainerStyle,
}: ProductGridProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  // Calculate item width based on screen width and columns
  const horizontalPadding = 16 * 2; // Left + right padding
  const totalGap = gap * (columns - 1);
  const itemWidth = (width - horizontalPadding - totalGap) / columns;

  const renderItem = ({ item, index }: ListRenderItemInfo<Product>) => {
    const isLastInRow = (index + 1) % columns === 0;

    return (
      <View
        style={{
          width: itemWidth,
          marginBottom: gap,
          marginRight: isLastInRow ? 0 : gap,
        }}
      >
        <ProductCard
          product={item}
          size={cardSize}
          onPress={onProductPress}
          onAddToCart={onAddToCart}
        />
      </View>
    );
  };

  const renderSkeleton = () => {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 16 }}>
        {Array.from({ length: skeletonCount }).map((_, index) => {
          const isLastInRow = (index + 1) % columns === 0;
          return (
            <View
              key={index}
              style={{
                width: itemWidth,
                marginBottom: gap,
                marginRight: isLastInRow ? 0 : gap,
              }}
            >
              <ProductCardSkeleton size={cardSize} />
            </View>
          );
        })}
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View
        style={{
          padding: 32,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
          }}
        >
          {emptyMessage}
        </Text>
      </View>
    );
  };

  if (isLoading && products.length === 0) {
    return (
      <View style={style}>
        {ListHeaderComponent}
        {renderSkeleton()}
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={columns}
      columnWrapperStyle={columns > 1 ? { paddingHorizontal: 16 } : undefined}
      contentContainerStyle={[
        { paddingVertical: 16 },
        columns === 1 && { paddingHorizontal: 16 },
        contentContainerStyle,
      ]}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        isLoading && products.length > 0 ? (
          <View style={{ padding: 16 }}>
            {renderSkeleton()}
          </View>
        ) : ListFooterComponent
      }
      ListEmptyComponent={renderEmpty}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      style={style}
    />
  );
}

/**
 * ProductRow Component
 *
 * Horizontal scrolling list of products
 */
export interface ProductRowProps {
  /**
   * Products to display
   */
  products: Product[];

  /**
   * Card size
   * @default 'md'
   */
  cardSize?: ProductCardSize;

  /**
   * Gap between items
   * @default 12
   */
  gap?: number;

  /**
   * Called when a product is pressed
   */
  onProductPress?: (product: Product) => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Number of skeleton items
   * @default 3
   */
  skeletonCount?: number;

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;
}

export function ProductRow({
  products,
  cardSize = 'md',
  gap = 12,
  onProductPress,
  isLoading = false,
  skeletonCount = 3,
  style,
}: ProductRowProps) {
  const cardWidth = cardSize === 'sm' ? 140 : cardSize === 'lg' ? 200 : 160;

  const renderItem = ({ item }: ListRenderItemInfo<Product>) => (
    <View style={{ width: cardWidth, marginRight: gap }}>
      <ProductCard
        product={item}
        size={cardSize}
        onPress={onProductPress}
      />
    </View>
  );

  const renderSkeleton = () => (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <View key={index} style={{ width: cardWidth, marginRight: gap }}>
          <ProductCardSkeleton size={cardSize} />
        </View>
      ))}
    </View>
  );

  if (isLoading && products.length === 0) {
    return <View style={style}>{renderSkeleton()}</View>;
  }

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      style={style}
    />
  );
}

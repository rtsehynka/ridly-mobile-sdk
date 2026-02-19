/**
 * RIDLY Mobile SDK - CategoryList Component
 *
 * Display categories in various layouts.
 */

import {
  View,
  Image,
  Pressable,
  FlatList,
  ScrollView,
  type StyleProp,
  type ViewStyle,
  type ListRenderItemInfo,
} from 'react-native';
import { Text } from '../ui/Text';
import { Skeleton } from '../ui/Skeleton';
import { useTheme } from '../../theme/ThemeContext';
import type { Category } from '../../types/category';

export type CategoryLayout = 'grid' | 'list' | 'horizontal' | 'chips';

export interface CategoryItemProps {
  /**
   * Category data
   */
  category: Category;

  /**
   * Called when category is pressed
   */
  onPress?: (category: Category) => void;

  /**
   * Show product count
   * @default true
   */
  showProductCount?: boolean;

  /**
   * Show category image
   * @default true
   */
  showImage?: boolean;

  /**
   * Card size (for grid layout)
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * CategoryCard Component
 *
 * Single category card with image
 */
export function CategoryCard({
  category,
  onPress,
  showProductCount = true,
  showImage = true,
  size = 'md',
  style,
}: CategoryItemProps) {
  const { theme } = useTheme();

  const sizeConfig = {
    sm: { imageHeight: 80, titleSize: 12, padding: 8 },
    md: { imageHeight: 120, titleSize: 14, padding: 12 },
    lg: { imageHeight: 160, titleSize: 16, padding: 16 },
  };

  const config = sizeConfig[size];

  return (
    <Pressable
      onPress={() => onPress?.(category)}
      style={({ pressed }) => [
        {
          backgroundColor: theme.colors.background,
          borderRadius: theme.borderRadius.card,
          overflow: 'hidden',
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {/* Image */}
      {showImage && (
        <View
          style={{
            width: '100%',
            height: config.imageHeight,
            backgroundColor: theme.colors.background,
          }}
        >
          {category.image?.url ? (
            <Image
              source={{ uri: category.image.url }}
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
                backgroundColor: theme.colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: config.titleSize + 8,
                  fontWeight: '700',
                  color: theme.colors.primary,
                }}
              >
                {category.name.charAt(0)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <View style={{ padding: config.padding }}>
        <Text
          numberOfLines={2}
          style={{
            fontSize: config.titleSize,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'center',
          }}
        >
          {category.name}
        </Text>

        {showProductCount && category.productCount > 0 && (
          <Text
            style={{
              fontSize: config.titleSize - 2,
              color: theme.colors.textSecondary,
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            {category.productCount} products
          </Text>
        )}
      </View>
    </Pressable>
  );
}

/**
 * CategoryListItem Component
 *
 * Category row for list layout
 */
export function CategoryListItem({
  category,
  onPress,
  showProductCount = true,
  showImage = true,
  style,
}: CategoryItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() => onPress?.(category)}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: pressed ? theme.colors.background : theme.colors.surface,
          padding: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        style,
      ]}
    >
      {/* Image */}
      {showImage && (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            backgroundColor: theme.colors.background,
            marginRight: 12,
            overflow: 'hidden',
          }}
        >
          {category.image?.url ? (
            <Image
              source={{ uri: category.image.url }}
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
                backgroundColor: theme.colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: theme.colors.primary,
                }}
              >
                {category.name.charAt(0)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.text,
          }}
        >
          {category.name}
        </Text>

        {showProductCount && category.productCount > 0 && (
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.textSecondary,
              marginTop: 2,
            }}
          >
            {category.productCount} products
          </Text>
        )}
      </View>

      {/* Arrow */}
      <Text style={{ fontSize: 18, color: theme.colors.textSecondary }}>›</Text>
    </Pressable>
  );
}

/**
 * CategoryChip Component
 *
 * Compact chip for horizontal scrolling
 */
export function CategoryChip({
  category,
  onPress,
  isSelected,
  style,
}: CategoryItemProps & { isSelected?: boolean }) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() => onPress?.(category)}
      style={({ pressed }) => [
        {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: isSelected
            ? theme.colors.primary
            : pressed
              ? theme.colors.background
              : theme.colors.surface,
          borderWidth: 1,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: isSelected ? theme.colors.onPrimary : theme.colors.text,
        }}
      >
        {category.name}
      </Text>
    </Pressable>
  );
}

/**
 * CategoryList Component
 *
 * @example
 * ```tsx
 * <CategoryList
 *   categories={categories}
 *   layout="grid"
 *   onCategoryPress={(c) => router.push(`/category/${c.slug}`)}
 * />
 * ```
 */
export interface CategoryListProps {
  /**
   * Categories to display
   */
  categories: Category[];

  /**
   * Layout style
   * @default 'grid'
   */
  layout?: CategoryLayout;

  /**
   * Number of columns for grid
   * @default 2
   */
  columns?: number;

  /**
   * Gap between items
   * @default 12
   */
  gap?: number;

  /**
   * Called when category is pressed
   */
  onCategoryPress?: (category: Category) => void;

  /**
   * Selected category ID (for chips)
   */
  selectedId?: string;

  /**
   * Show product count
   * @default true
   */
  showProductCount?: boolean;

  /**
   * Show images
   * @default true
   */
  showImages?: boolean;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Number of skeleton items
   * @default 4
   */
  skeletonCount?: number;

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;
}

export function CategoryList({
  categories,
  layout = 'grid',
  columns = 2,
  gap = 12,
  onCategoryPress,
  selectedId,
  showProductCount = true,
  showImages = true,
  isLoading = false,
  skeletonCount = 4,
  style,
}: CategoryListProps) {
  const { theme } = useTheme();

  // Skeleton rendering
  const renderSkeleton = () => {
    if (layout === 'chips') {
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap, paddingHorizontal: 16 }}>
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <Skeleton
                key={i}
                width={80}
                height={36}
                borderRadius={20}
              />
            ))}
          </View>
        </ScrollView>
      );
    }

    if (layout === 'horizontal') {
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap, paddingHorizontal: 16 }}>
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <Skeleton
                key={i}
                width={140}
                height={showImages ? 160 : 60}
                borderRadius={theme.borderRadius.card}
              />
            ))}
          </View>
        </ScrollView>
      );
    }

    return (
      <View style={{ padding: 16 }}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton
            key={i}
            width="100%"
            height={layout === 'list' ? 72 : 140}
            borderRadius={layout === 'list' ? 0 : theme.borderRadius.card}
            style={{ marginBottom: gap }}
          />
        ))}
      </View>
    );
  };

  if (isLoading && categories.length === 0) {
    return <View style={style}>{renderSkeleton()}</View>;
  }

  // Chips layout
  if (layout === 'chips') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap }}
        style={[{ flexGrow: 0 }, style]}
      >
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            onPress={onCategoryPress}
            isSelected={selectedId === category.id}
          />
        ))}
      </ScrollView>
    );
  }

  // Horizontal layout
  if (layout === 'horizontal') {
    const renderItem = ({ item }: ListRenderItemInfo<Category>) => (
      <View style={{ width: 140, marginRight: gap }}>
        <CategoryCard
          category={item}
          onPress={onCategoryPress}
          showProductCount={showProductCount}
          showImage={showImages}
          size="sm"
        />
      </View>
    );

    return (
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        style={style}
      />
    );
  }

  // List layout
  if (layout === 'list') {
    return (
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryListItem
            category={item}
            onPress={onCategoryPress}
            showProductCount={showProductCount}
            showImage={showImages}
          />
        )}
        keyExtractor={(item) => item.id}
        style={style}
      />
    );
  }

  // Grid layout (default)
  const renderGridItem = ({ item, index }: ListRenderItemInfo<Category>) => {
    const isLastInRow = (index + 1) % columns === 0;

    return (
      <View
        style={{
          flex: 1,
          marginBottom: gap,
          marginRight: isLastInRow ? 0 : gap,
        }}
      >
        <CategoryCard
          category={item}
          onPress={onCategoryPress}
          showProductCount={showProductCount}
          showImage={showImages}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={categories}
      renderItem={renderGridItem}
      keyExtractor={(item) => item.id}
      numColumns={columns}
      contentContainerStyle={{ padding: 16 }}
      style={style}
    />
  );
}

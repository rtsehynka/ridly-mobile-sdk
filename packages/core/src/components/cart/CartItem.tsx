/**
 * RIDLY Mobile SDK - CartItemCard Component
 *
 * Horizontal cart item display with image, name, price, quantity selector.
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
import { QuantitySelector } from './QuantitySelector';
import { Skeleton } from '../ui/Skeleton';
import { useTheme } from '../../theme/ThemeContext';

export interface CartItemCardProduct {
  id: string;
  name: string;
  brand?: string;
  sku?: string;
  imageUrl?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  quantity: number;
  options?: Array<{
    label: string;
    value: string;
  }>;
}

export interface CartItemCardProps {
  /**
   * Cart item data
   */
  item: CartItemCardProduct;

  /**
   * Called when quantity changes
   */
  onQuantityChange?: (quantity: number) => void;

  /**
   * Called when remove button is pressed
   */
  onRemove?: () => void;

  /**
   * Called when item is pressed
   */
  onPress?: () => void;

  /**
   * Show remove button
   * @default true
   */
  showRemove?: boolean;

  /**
   * Disable interactions
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom container style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Index for list items (used for testID generation)
   */
  index?: number;
}

/**
 * CartItemCard Component
 *
 * Horizontal cart item with clean, minimal design.
 *
 * @example
 * ```tsx
 * <CartItemCard
 *   item={{
 *     id: '1',
 *     name: 'Product Name',
 *     brand: 'Brand',
 *     imageUrl: 'https://...',
 *     price: 29.99,
 *     currency: 'USD',
 *     quantity: 2,
 *   }}
 *   onQuantityChange={(qty) => updateCart(id, qty)}
 *   onRemove={() => removeFromCart(id)}
 * />
 * ```
 */
export function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
  onPress,
  showRemove = true,
  disabled = false,
  style,
  index,
}: CartItemCardProps) {
  const { theme } = useTheme();

  const imageSize = 80;
  const testIDPrefix = index !== undefined ? `cart-item-${index}` : `cart-item-${item.id}`;

  return (
    <View
      testID={index !== undefined ? `cart-item-${index}` : undefined}
      style={[
        {
          flexDirection: 'row',
          backgroundColor: theme.colors.background,
          paddingVertical: 12,
          gap: 12,
        },
        style,
      ]}
    >
      {/* Product Image */}
      <Pressable onPress={onPress} disabled={!onPress}>
        <View
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: theme.borderRadius.image,
            backgroundColor: theme.colors.surface,
            overflow: 'hidden',
          }}
        >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
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
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
                No Image
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Content */}
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        {/* Top Row: Name, Brand, Remove */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={{ flex: 1, marginRight: 8 }}
          >
            {/* Brand */}
            {item.brand && (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  fontWeight: '400',
                  color: theme.colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 2,
                }}
              >
                {item.brand}
              </Text>
            )}

            {/* Name */}
            <Text
              numberOfLines={2}
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: theme.colors.text,
                lineHeight: 18,
              }}
            >
              {item.name}
            </Text>

            {/* Options (size, color, etc.) */}
            {item.options && item.options.length > 0 && (
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {item.options.map((opt) => opt.value).join(' / ')}
              </Text>
            )}
          </Pressable>

          {/* Remove Button */}
          {showRemove && onRemove && (
            <Pressable
              testID={index !== undefined ? `remove-item-${index}` : undefined}
              onPress={onRemove}
              disabled={disabled}
              hitSlop={12}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                padding: 4,
              })}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: theme.colors.textSecondary,
                  lineHeight: 18,
                }}
              >
                ×
              </Text>
            </Pressable>
          )}
        </View>

        {/* Bottom Row: Price & Quantity */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          {/* Price */}
          <Price
            price={item.price}
            originalPrice={item.originalPrice}
            currency={item.currency}
            size="sm"
            showDiscount={false}
          />

          {/* Quantity Selector */}
          {onQuantityChange && (
            <QuantitySelector
              value={item.quantity}
              onChange={onQuantityChange}
              size="sm"
              disabled={disabled}
              testIDPrefix={index !== undefined ? String(index) : undefined}
            />
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * CartItemCard Skeleton
 */
export function CartItemCardSkeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: theme.colors.background,
          paddingVertical: 12,
          gap: 12,
        },
        style,
      ]}
    >
      {/* Image Skeleton */}
      <Skeleton width={80} height={80} borderRadius={theme.borderRadius.image} />

      {/* Content Skeleton */}
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View>
          <Skeleton width={60} height={10} style={{ marginBottom: 4 }} />
          <Skeleton width="80%" height={14} style={{ marginBottom: 4 }} />
          <Skeleton width="50%" height={14} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Skeleton width={60} height={16} />
          <Skeleton width={100} height={28} />
        </View>
      </View>
    </View>
  );
}

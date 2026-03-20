/**
 * RIDLY Mobile SDK - Price Component
 *
 * Display prices with formatting, sale prices, and discounts.
 */

import { View, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { Text } from './Text';
import { DiscountBadge } from './Badge';
import { useTheme } from '../../theme/ThemeContext';
import {
  formatPrice,
  formatSalePrice,
  type FormatPriceOptions,
} from '../../utils/formatPrice';

export interface PriceProps {
  /**
   * Current price value
   */
  price: number;

  /**
   * Original price (for sale items)
   */
  originalPrice?: number;

  /**
   * Currency code
   * @default 'USD'
   */
  currency?: string;

  /**
   * Locale for formatting
   * @default 'en-US'
   */
  locale?: string;

  /**
   * Price size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Show discount badge
   * @default true
   */
  showDiscount?: boolean;

  /**
   * Layout direction
   * @default 'row'
   */
  layout?: 'row' | 'column';

  /**
   * Custom container style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Custom price text style
   */
  priceStyle?: StyleProp<TextStyle>;

  /**
   * Custom original price text style
   */
  originalPriceStyle?: StyleProp<TextStyle>;

  /**
   * Test ID for E2E testing
   */
  testID?: string;
}

/**
 * Price Component
 *
 * @example
 * ```tsx
 * <Price price={99.99} />
 * <Price price={79.99} originalPrice={99.99} showDiscount />
 * <Price price={199.99} currency="EUR" size="lg" />
 * ```
 */
export function Price({
  price,
  originalPrice,
  currency = 'USD',
  locale = 'en-US',
  size = 'md',
  showDiscount = true,
  layout = 'row',
  style,
  priceStyle,
  originalPriceStyle,
  testID,
}: PriceProps) {
  const { theme } = useTheme();

  const formatOptions: FormatPriceOptions = { currency, locale };
  const saleInfo = originalPrice
    ? formatSalePrice(originalPrice, price, formatOptions)
    : null;

  const hasSale = saleInfo?.hasSale ?? false;

  // Size configurations
  const sizeStyles: Record<'sm' | 'md' | 'lg', { price: number; original: number }> = {
    sm: { price: 14, original: 12 },
    md: { price: 18, original: 14 },
    lg: { price: 24, original: 16 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      testID={testID}
      style={[
        {
          flexDirection: layout === 'row' ? 'row' : 'column',
          alignItems: layout === 'row' ? 'center' : 'flex-start',
          gap: layout === 'row' ? 8 : 4,
        },
        style,
      ]}
    >
      {/* Current Price */}
      <Text
        style={[
          {
            fontSize: currentSize.price,
            fontWeight: '700',
            color: hasSale ? theme.colors.sale : theme.colors.price,
          },
          priceStyle,
        ]}
      >
        {formatPrice(price, formatOptions)}
      </Text>

      {/* Original Price (if on sale) */}
      {hasSale && originalPrice && (
        <Text
          style={[
            {
              fontSize: currentSize.original,
              fontWeight: '400',
              color: theme.colors.textSecondary,
              textDecorationLine: 'line-through',
            },
            originalPriceStyle,
          ]}
        >
          {formatPrice(originalPrice, formatOptions)}
        </Text>
      )}

      {/* Discount Badge */}
      {hasSale && showDiscount && saleInfo && (
        <DiscountBadge percent={saleInfo.discount} size="sm" />
      )}
    </View>
  );
}

/**
 * Price Range Component
 *
 * For products with price ranges (configurable, grouped products)
 *
 * @example
 * ```tsx
 * <PriceRange minPrice={99.99} maxPrice={199.99} />
 * ```
 */
export interface PriceRangeProps {
  /**
   * Minimum price
   */
  minPrice: number;

  /**
   * Maximum price
   */
  maxPrice: number;

  /**
   * Currency code
   * @default 'USD'
   */
  currency?: string;

  /**
   * Locale for formatting
   * @default 'en-US'
   */
  locale?: string;

  /**
   * Price size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Prefix text (e.g., "From")
   */
  prefix?: string;

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;
}

export function PriceRange({
  minPrice,
  maxPrice,
  currency = 'USD',
  locale = 'en-US',
  size = 'md',
  prefix,
  style,
}: PriceRangeProps) {
  const { theme } = useTheme();

  const formatOptions: FormatPriceOptions = { currency, locale };
  const samePrice = minPrice === maxPrice;

  const sizeStyles: Record<'sm' | 'md' | 'lg', number> = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4 }, style]}>
      {prefix && (
        <Text
          style={{
            fontSize: sizeStyles[size] - 2,
            color: theme.colors.textSecondary,
          }}
        >
          {prefix}
        </Text>
      )}

      <Text
        style={{
          fontSize: sizeStyles[size],
          fontWeight: '700',
          color: theme.colors.price,
        }}
      >
        {formatPrice(minPrice, formatOptions)}
      </Text>

      {!samePrice && (
        <>
          <Text
            style={{
              fontSize: sizeStyles[size],
              color: theme.colors.textSecondary,
            }}
          >
            -
          </Text>

          <Text
            style={{
              fontSize: sizeStyles[size],
              fontWeight: '700',
              color: theme.colors.price,
            }}
          >
            {formatPrice(maxPrice, formatOptions)}
          </Text>
        </>
      )}
    </View>
  );
}

/**
 * Free Badge - Shows "Free" instead of $0.00
 *
 * @example
 * ```tsx
 * <Price price={0} /> // Shows "$0.00"
 * <FreePrice /> // Shows "Free"
 * ```
 */
export interface FreePriceProps {
  /**
   * Custom "Free" label
   * @default 'Free'
   */
  label?: string;

  /**
   * Size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;
}

export function FreePrice({ label = 'Free', size = 'md', style }: FreePriceProps) {
  const { theme } = useTheme();

  const sizeStyles: Record<'sm' | 'md' | 'lg', number> = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  return (
    <View style={style}>
      <Text
        style={{
          fontSize: sizeStyles[size],
          fontWeight: '700',
          color: theme.colors.success,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * RIDLY Mobile SDK - Badge Component
 *
 * Badges for status, counts, and discounts.
 */

import { View, Text, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /**
   * Badge content
   */
  children: React.ReactNode;

  /**
   * Badge variant
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * Badge size
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Pill shape (fully rounded)
   * @default false
   */
  pill?: boolean;

  /**
   * Outline style (no background)
   * @default false
   */
  outline?: boolean;

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Custom text style
   */
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Badge Component
 *
 * @example
 * ```tsx
 * <Badge>New</Badge>
 * <Badge variant="success">In Stock</Badge>
 * <Badge variant="error" pill>-20%</Badge>
 * ```
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  pill = false,
  outline = false,
  style,
  textStyle,
}: BadgeProps) {
  const { theme } = useTheme();

  // Size configurations
  const sizeStyles: Record<BadgeSize, { paddingH: number; paddingV: number; fontSize: number }> = {
    sm: { paddingH: 6, paddingV: 2, fontSize: 10 },
    md: { paddingH: 8, paddingV: 4, fontSize: 12 },
    lg: { paddingH: 12, paddingV: 6, fontSize: 14 },
  };

  // Variant colors
  const getVariantColors = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: theme.colors.primary,
          text: '#FFFFFF',
          border: theme.colors.primary,
        };
      case 'secondary':
        return {
          bg: theme.colors.secondary,
          text: '#FFFFFF',
          border: theme.colors.secondary,
        };
      case 'success':
        return {
          bg: theme.colors.success,
          text: '#FFFFFF',
          border: theme.colors.success,
        };
      case 'warning':
        return {
          bg: theme.colors.warning,
          text: '#000000',
          border: theme.colors.warning,
        };
      case 'error':
        return {
          bg: theme.colors.error,
          text: '#FFFFFF',
          border: theme.colors.error,
        };
      case 'info':
        return {
          bg: '#2196F3',
          text: '#FFFFFF',
          border: '#2196F3',
        };
      default:
        return {
          bg: theme.colors.border,
          text: theme.colors.text,
          border: theme.colors.border,
        };
    }
  };

  const colors = getVariantColors();
  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        {
          paddingHorizontal: currentSize.paddingH,
          paddingVertical: currentSize.paddingV,
          borderRadius: pill ? 999 : theme.borderRadius.small,
          backgroundColor: outline ? 'transparent' : colors.bg,
          borderWidth: outline ? 1 : 0,
          borderColor: colors.border,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            fontSize: currentSize.fontSize,
            fontWeight: '600',
            color: outline ? colors.border : colors.text,
            textAlign: 'center',
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

/**
 * Discount Badge - Specialized badge for showing discounts
 *
 * @example
 * ```tsx
 * <DiscountBadge percent={20} />
 * <DiscountBadge percent={15} variant="primary" />
 * ```
 */
export interface DiscountBadgeProps extends Omit<BadgeProps, 'children'> {
  /**
   * Discount percentage
   */
  percent: number;
}

export function DiscountBadge({ percent, variant = 'error', ...props }: DiscountBadgeProps) {
  return (
    <Badge variant={variant} pill {...props}>
      -{Math.round(percent)}%
    </Badge>
  );
}

/**
 * Count Badge - For showing counts (cart items, notifications)
 *
 * @example
 * ```tsx
 * <CountBadge count={5} />
 * <CountBadge count={99} max={99} />
 * ```
 */
export interface CountBadgeProps extends Omit<BadgeProps, 'children' | 'size'> {
  /**
   * Count number
   */
  count: number;

  /**
   * Maximum display number (shows "99+" if exceeded)
   * @default 99
   */
  max?: number;

  /**
   * Minimum size for the badge (useful for single digits)
   * @default 20
   */
  minSize?: number;
}

export function CountBadge({
  count,
  max = 99,
  minSize = 20,
  variant = 'error',
  style,
  ...props
}: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : String(count);

  if (count <= 0) return null;

  return (
    <Badge
      variant={variant}
      pill
      size="sm"
      style={[
        {
          minWidth: minSize,
          minHeight: minSize,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      {...props}
    >
      {displayCount}
    </Badge>
  );
}

/**
 * Status Badge - For product availability status
 *
 * @example
 * ```tsx
 * <StatusBadge status="in_stock" />
 * <StatusBadge status="out_of_stock" />
 * ```
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'children' | 'variant'> {
  /**
   * Status type
   */
  status: 'in_stock' | 'out_of_stock' | 'low_stock' | 'preorder' | 'backorder';

  /**
   * Custom labels for statuses
   */
  labels?: Partial<Record<StatusBadgeProps['status'], string>>;
}

export function StatusBadge({ status, labels, ...props }: StatusBadgeProps) {
  const defaultLabels: Record<StatusBadgeProps['status'], string> = {
    in_stock: 'In Stock',
    out_of_stock: 'Out of Stock',
    low_stock: 'Low Stock',
    preorder: 'Pre-order',
    backorder: 'Backorder',
  };

  const variantMap: Record<StatusBadgeProps['status'], BadgeVariant> = {
    in_stock: 'success',
    out_of_stock: 'error',
    low_stock: 'warning',
    preorder: 'info',
    backorder: 'warning',
  };

  return (
    <Badge variant={variantMap[status]} {...props}>
      {labels?.[status] || defaultLabels[status]}
    </Badge>
  );
}

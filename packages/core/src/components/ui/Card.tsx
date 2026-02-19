/**
 * RIDLY Mobile SDK - Card Component
 *
 * A versatile card component for displaying content.
 */

import {
  View,
  Pressable,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps extends Omit<ViewProps, 'style'> {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Card variant
   * @default 'elevated'
   */
  variant?: CardVariant;

  /**
   * Make card pressable
   */
  onPress?: () => void;

  /**
   * Disable press interaction
   */
  disabled?: boolean;

  /**
   * Padding inside the card
   * @default 16
   */
  padding?: number | 'none' | 'sm' | 'md' | 'lg';

  /**
   * Border radius
   * @default 'card' (from theme)
   */
  borderRadius?: number | 'sm' | 'md' | 'lg' | 'card';

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * Card Component
 *
 * @example
 * ```tsx
 * <Card>
 *   <Text>Card content</Text>
 * </Card>
 *
 * <Card variant="outlined" onPress={handlePress}>
 *   <Text>Pressable outlined card</Text>
 * </Card>
 * ```
 */
export function Card({
  children,
  variant = 'elevated',
  onPress,
  disabled = false,
  padding = 'md',
  borderRadius = 'card',
  style,
  ...props
}: CardProps) {
  const { theme } = useTheme();

  // Resolve padding value
  const getPadding = (): number => {
    if (typeof padding === 'number') return padding;
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return 8;
      case 'md':
        return 16;
      case 'lg':
        return 24;
      default:
        return 16;
    }
  };

  // Resolve border radius
  const getBorderRadius = (): number => {
    if (typeof borderRadius === 'number') return borderRadius;
    switch (borderRadius) {
      case 'sm':
        return theme.borderRadius.small;
      case 'md':
        return theme.borderRadius.medium;
      case 'lg':
        return theme.borderRadius.large;
      case 'card':
        return theme.borderRadius.card;
      default:
        return theme.borderRadius.card;
    }
  };

  // Get variant styles
  const getVariantStyles = (pressed: boolean = false): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: getBorderRadius(),
      padding: getPadding(),
      backgroundColor: theme.colors.surface,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...base,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: pressed ? 1 : 4,
        };

      case 'outlined':
        return {
          ...base,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: pressed ? theme.colors.background : theme.colors.surface,
        };

      case 'filled':
        return {
          ...base,
          backgroundColor: pressed
            ? theme.colors.background
            : theme.isDark
              ? theme.colors.surface
              : theme.colors.background,
        };

      default:
        return base;
    }
  };

  // If pressable
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          getVariantStyles(pressed),
          disabled && { opacity: 0.6 },
          style,
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  // Non-pressable card
  return (
    <View style={[getVariantStyles(), style]} {...props}>
      {children}
    </View>
  );
}

/**
 * Card Header Component
 */
export interface CardHeaderProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {children}
    </View>
  );
}

/**
 * Card Content Component
 */
export interface CardContentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CardContent({ children, style }: CardContentProps) {
  return (
    <View style={style}>
      {children}
    </View>
  );
}

/**
 * Card Footer Component
 */
export interface CardFooterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return (
    <View
      style={[
        {
          marginTop: 12,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

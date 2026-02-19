/**
 * RIDLY Mobile SDK - Text Component
 *
 * Typography component with theme integration.
 */

import {
  Text as RNText,
  type TextProps as RNTextProps,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'price'
  | 'priceOld';

export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'left' | 'center' | 'right';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  /**
   * Text content
   */
  children: React.ReactNode;

  /**
   * Typography variant
   * @default 'body'
   */
  variant?: TextVariant;

  /**
   * Font weight override
   */
  weight?: TextWeight;

  /**
   * Text alignment
   */
  align?: TextAlign;

  /**
   * Text color (theme color key or custom color)
   */
  color?: keyof ReturnType<typeof useTheme>['theme']['colors'] | string;

  /**
   * Number of lines before truncating
   */
  numberOfLines?: number;

  /**
   * Custom style
   */
  style?: StyleProp<TextStyle>;
}

/**
 * Text Component
 *
 * @example
 * ```tsx
 * <Text variant="h1">Heading 1</Text>
 * <Text variant="body" color="textSecondary">Body text</Text>
 * <Text variant="price" weight="bold">$99.99</Text>
 * ```
 */
export function Text({
  children,
  variant = 'body',
  weight,
  align,
  color,
  numberOfLines,
  style,
  ...props
}: TextProps) {
  const { theme } = useTheme();

  // Variant configurations
  const variantStyles: Record<TextVariant, TextStyle> = {
    h1: {
      fontSize: 32,
      fontWeight: theme.typography.headingWeight as TextStyle['fontWeight'],
      lineHeight: 40,
      letterSpacing: -0.5,
      color: theme.colors.text,
    },
    h2: {
      fontSize: 28,
      fontWeight: theme.typography.headingWeight as TextStyle['fontWeight'],
      lineHeight: 36,
      letterSpacing: -0.3,
      color: theme.colors.text,
    },
    h3: {
      fontSize: 24,
      fontWeight: theme.typography.headingWeight as TextStyle['fontWeight'],
      lineHeight: 32,
      color: theme.colors.text,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      color: theme.colors.text,
    },
    body: {
      fontSize: theme.typography.baseFontSize,
      fontWeight: theme.typography.bodyWeight as TextStyle['fontWeight'],
      lineHeight: 24,
      color: theme.colors.text,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: theme.typography.bodyWeight as TextStyle['fontWeight'],
      lineHeight: 20,
      color: theme.colors.text,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      color: theme.colors.textSecondary,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      color: theme.colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    price: {
      fontSize: 18,
      fontWeight: '700',
      lineHeight: 24,
      color: theme.colors.price,
    },
    priceOld: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      color: theme.colors.textSecondary,
      textDecorationLine: 'line-through',
    },
  };

  // Weight mapping
  const weightStyles: Record<TextWeight, TextStyle['fontWeight']> = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };

  // Resolve color
  const resolveColor = (): string => {
    if (!color) return variantStyles[variant].color as string;

    // Check if it's a theme color key
    if (color in theme.colors) {
      return theme.colors[color as keyof typeof theme.colors];
    }

    // Otherwise treat as custom color
    return color;
  };

  return (
    <RNText
      {...props}
      numberOfLines={numberOfLines}
      style={[
        variantStyles[variant],
        weight && { fontWeight: weightStyles[weight] },
        align && { textAlign: align },
        { color: resolveColor() },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

/**
 * Heading convenience components
 */
export function H1(props: Omit<TextProps, 'variant'>) {
  return <Text {...props} variant="h1" />;
}

export function H2(props: Omit<TextProps, 'variant'>) {
  return <Text {...props} variant="h2" />;
}

export function H3(props: Omit<TextProps, 'variant'>) {
  return <Text {...props} variant="h3" />;
}

export function H4(props: Omit<TextProps, 'variant'>) {
  return <Text {...props} variant="h4" />;
}

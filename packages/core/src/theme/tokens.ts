/**
 * RIDLY Mobile SDK - Design Tokens
 *
 * Design tokens are the foundation of the theme system.
 * Based on clean, minimal e-commerce design aesthetic.
 */

import type { ThemeColors, BorderRadiusConfig, SpacingConfig, TypographyConfig } from '../types';

/**
 * Default color palette - Clean minimal e-commerce theme
 *
 * Based on modern cosmetics/beauty app design:
 * - Pure white background
 * - Black primary buttons
 * - Clean typography with gray secondary text
 * - Subtle borders
 */
export const defaultColors: ThemeColors = {
  // Brand colors
  primary: '#000000',
  primaryDark: '#1A1A1A',
  secondary: '#666666',
  secondaryDark: '#444444',
  accent: '#000000', // Used for highlights, same as primary for minimal look

  // Backgrounds
  background: '#FFFFFF',
  surface: '#FAFAFA', // Slightly off-white for cards

  // Text
  text: '#000000',
  textSecondary: '#888888', // Brand names, descriptions

  // Borders
  border: '#EEEEEE', // Very subtle border

  // Status colors
  error: '#E53935',
  success: '#43A047',
  warning: '#FB8C00',

  // Button text
  onPrimary: '#FFFFFF',

  // Navigation
  headerBackground: '#FFFFFF',
  headerText: '#000000',
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#000000',
  tabBarInactive: '#AAAAAA',

  // UI state colors
  disabled: '#F5F5F5',
  disabledText: '#CCCCCC',

  // Price colors
  price: '#000000',
  sale: '#E53935', // Red for sale/discount prices
};

/**
 * Dark mode color overrides
 */
export const darkColors: Partial<ThemeColors> = {
  background: '#0A0A0A',
  surface: '#141414',
  text: '#FFFFFF',
  textSecondary: '#999999',
  border: '#2A2A2A',
  headerBackground: '#0A0A0A',
  headerText: '#FFFFFF',
  tabBarBackground: '#0A0A0A',
  tabBarActive: '#FFFFFF',
  tabBarInactive: '#666666',
  // Primary stays black, needs white border/outline in dark mode
  primary: '#FFFFFF',
  primaryDark: '#E0E0E0',
  onPrimary: '#000000',
  // UI state colors
  disabled: '#1F1F1F',
  disabledText: '#666666',
  // Price colors
  price: '#FFFFFF',
};

/**
 * Default border radius values - Minimal aesthetic
 */
export const defaultBorderRadius: BorderRadiusConfig = {
  small: 4,
  medium: 6,
  large: 8,
  button: 6, // Slightly rounded buttons
  card: 0, // No radius on cards for clean look
  image: 4, // Minimal radius on images
};

/**
 * Default spacing values
 */
export const defaultSpacing: SpacingConfig = {
  screenPadding: 16,
  cardPadding: 16,
  sectionGap: 24,
};

/**
 * Default typography settings
 */
export const defaultTypography: TypographyConfig = {
  fontFamily: 'System',
  headingFontFamily: 'System',
  baseFontSize: 15,
  headingWeight: '600',
  bodyWeight: '400',
};

/**
 * Font size scale
 */
export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 19,
  '2xl': 22,
  '3xl': 26,
  '4xl': 32,
  '5xl': 40,
};

/**
 * Line height scale
 */
export const lineHeights = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.8,
};

/**
 * Spacing scale (in pixels)
 */
export const spacingScale = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
};

/**
 * Shadow presets - Minimal shadows for clean aesthetic
 */
export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};

/**
 * Component-specific tokens
 */
export const componentTokens = {
  // Cart item
  cartItem: {
    imageSize: 80,
    gap: 12,
    borderWidth: 0,
    borderColor: 'transparent',
  },

  // Product card
  productCard: {
    imageAspectRatio: 1, // Square
    titleLines: 2,
    priceGap: 4,
  },

  // Quantity selector
  quantitySelector: {
    buttonSize: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  // Button
  button: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    paddingHorizontal: {
      sm: 12,
      md: 16,
      lg: 20,
    },
  },

  // Input
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 6,
  },
};

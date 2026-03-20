/**
 * RIDLY Luxe Theme - Color Tokens
 *
 * Premium luxury theme with gold/champagne accent colors.
 * Designed for high-end fashion and lifestyle brands.
 */

import type { ThemeTokens } from '@ridly/mobile-core';

/**
 * Light mode theme tokens - Luxury Gold
 */
export const lightTokens: ThemeTokens = {
  colors: {
    // Primary - Champagne Gold
    primary: '#C9A962',
    primaryDark: '#B8944D',

    // Secondary - Charcoal
    secondary: '#2C2C2C',
    secondaryDark: '#1A1A1A',
    accent: '#D4AF37', // Classic Gold

    // Backgrounds - Warm tones
    background: '#FDFCFA',
    surface: '#F8F6F3',

    // Text
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',

    // UI
    border: '#E8E4DE',
    error: '#C53030',
    success: '#2F855A',
    warning: '#C05621',
    onPrimary: '#FFFFFF',

    // Header
    headerBackground: '#FDFCFA',
    headerText: '#1A1A1A',

    // Tab bar
    tabBarBackground: '#FDFCFA',
    tabBarActive: '#C9A962',
    tabBarInactive: '#9A9A9A',

    // States
    disabled: '#E5E2DD',
    disabledText: '#A8A8A8',

    // Pricing
    price: '#1A1A1A',
    sale: '#C53030',
  },

  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    button: 6,
    card: 8,
    image: 8,
  },

  spacing: {
    screenPadding: 16,
    cardPadding: 14,
    sectionGap: 24,
  },

  typography: {
    fontFamily: 'System',
    headingFontFamily: 'System',
    baseFontSize: 15,
    headingWeight: '600',
    bodyWeight: '400',
  },

  isDark: false,
};

/**
 * Dark mode theme tokens - Luxury Dark
 */
export const darkTokens: ThemeTokens = {
  colors: {
    // Primary - Bright Gold on dark
    primary: '#D4AF37',
    primaryDark: '#C9A962',

    // Secondary
    secondary: '#E8E4DE',
    secondaryDark: '#D4D0C8',
    accent: '#E8C547',

    // Backgrounds - Rich dark
    background: '#0D0D0D',
    surface: '#1A1A1A',

    // Text
    text: '#F5F3F0',
    textSecondary: '#A8A8A8',

    // UI
    border: '#2C2C2C',
    error: '#FC8181',
    success: '#68D391',
    warning: '#F6AD55',
    onPrimary: '#0D0D0D',

    // Header
    headerBackground: '#0D0D0D',
    headerText: '#F5F3F0',

    // Tab bar
    tabBarBackground: '#0D0D0D',
    tabBarActive: '#D4AF37',
    tabBarInactive: '#6B6B6B',

    // States
    disabled: '#2C2C2C',
    disabledText: '#6B6B6B',

    // Pricing
    price: '#F5F3F0',
    sale: '#FC8181',
  },

  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    button: 6,
    card: 8,
    image: 8,
  },

  spacing: {
    screenPadding: 16,
    cardPadding: 14,
    sectionGap: 24,
  },

  typography: {
    fontFamily: 'System',
    headingFontFamily: 'System',
    baseFontSize: 15,
    headingWeight: '600',
    bodyWeight: '400',
  },

  isDark: true,
};

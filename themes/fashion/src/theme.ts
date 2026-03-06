/**
 * RIDLY Fashion Theme - Color Tokens
 *
 * Adapts to existing ThemeTokens interface.
 */

import type { ThemeTokens } from '@ridly/mobile-core';

/**
 * Light mode theme tokens
 */
export const lightTokens: ThemeTokens = {
  colors: {
    // Primary
    primary: '#3B82F6',
    primaryDark: '#2563EB',

    // Secondary
    secondary: '#1F2937',
    secondaryDark: '#111827',
    accent: '#60A5FA',

    // Backgrounds
    background: '#FFFFFF',
    surface: '#F9FAFB',

    // Text
    text: '#111827',
    textSecondary: '#6B7280',

    // UI
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    onPrimary: '#FFFFFF',

    // Header
    headerBackground: '#FFFFFF',
    headerText: '#111827',

    // Tab bar
    tabBarBackground: '#FFFFFF',
    tabBarActive: '#3B82F6',
    tabBarInactive: '#6B7280',

    // States
    disabled: '#D1D5DB',
    disabledText: '#9CA3AF',

    // Pricing
    price: '#111827',
    sale: '#EF4444',
  },

  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    button: 10,
    card: 12,
    image: 12,
  },

  spacing: {
    screenPadding: 16,
    cardPadding: 12,
    sectionGap: 20,
  },

  typography: {
    fontFamily: 'System',
    headingFontFamily: 'System',
    baseFontSize: 14,
    headingWeight: '700',
    bodyWeight: '400',
  },

  isDark: false,
};

/**
 * Dark mode theme tokens
 */
export const darkTokens: ThemeTokens = {
  colors: {
    // Primary
    primary: '#60A5FA',
    primaryDark: '#3B82F6',

    // Secondary
    secondary: '#E5E7EB',
    secondaryDark: '#D1D5DB',
    accent: '#93C5FD',

    // Backgrounds
    background: '#111827',
    surface: '#1F2937',

    // Text
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',

    // UI
    border: '#374151',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    onPrimary: '#111827',

    // Header
    headerBackground: '#111827',
    headerText: '#F9FAFB',

    // Tab bar
    tabBarBackground: '#111827',
    tabBarActive: '#60A5FA',
    tabBarInactive: '#6B7280',

    // States
    disabled: '#4B5563',
    disabledText: '#6B7280',

    // Pricing
    price: '#F9FAFB',
    sale: '#F87171',
  },

  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    button: 10,
    card: 12,
    image: 12,
  },

  spacing: {
    screenPadding: 16,
    cardPadding: 12,
    sectionGap: 20,
  },

  typography: {
    fontFamily: 'System',
    headingFontFamily: 'System',
    baseFontSize: 14,
    headingWeight: '700',
    bodyWeight: '400',
  },

  isDark: true,
};

/**
 * RIDLY Fashion Theme - Color Tokens
 *
 * Modern, clean design with blue accent colors.
 * Based on premium fashion/lifestyle app aesthetics.
 */

import type { ThemeTokens } from '@ridly/mobile-core';

/**
 * Light mode theme tokens
 */
export const lightTokens: ThemeTokens = {
  colors: {
    // Primary - Blue accent (from design)
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    onPrimary: '#FFFFFF',

    // Secondary/Accent
    secondary: '#1F2937',
    secondaryLight: '#374151',
    secondaryDark: '#111827',
    onSecondary: '#FFFFFF',

    // Backgrounds
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceVariant: '#F3F4F6',

    // Text colors
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',

    // Status colors
    error: '#EF4444',
    errorLight: '#FCA5A5',
    errorDark: '#DC2626',
    onError: '#FFFFFF',

    success: '#10B981',
    successLight: '#6EE7B7',
    successDark: '#059669',
    onSuccess: '#FFFFFF',

    warning: '#F59E0B',
    warningLight: '#FCD34D',
    warningDark: '#D97706',
    onWarning: '#111827',

    info: '#3B82F6',
    infoLight: '#93C5FD',
    infoDark: '#2563EB',
    onInfo: '#FFFFFF',

    // UI elements
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    divider: '#E5E7EB',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Interactive states
    disabled: '#D1D5DB',
    disabledBackground: '#F3F4F6',
    focus: '#3B82F6',
    hover: 'rgba(59, 130, 246, 0.1)',
    pressed: 'rgba(59, 130, 246, 0.2)',
    ripple: 'rgba(59, 130, 246, 0.3)',

    // Skeleton loading
    skeleton: '#E5E7EB',
    skeletonHighlight: '#F9FAFB',

    // Rating stars
    rating: '#FBBF24',
    ratingEmpty: '#D1D5DB',

    // Badge backgrounds
    badgeBackground: '#EF4444',
    badgeText: '#FFFFFF',

    // Card shadows
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },

  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },

  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
    },
  },

  isDark: false,
};

/**
 * Dark mode theme tokens
 */
export const darkTokens: ThemeTokens = {
  ...lightTokens,

  colors: {
    // Primary - Blue accent
    primary: '#60A5FA',
    primaryLight: '#93C5FD',
    primaryDark: '#3B82F6',
    onPrimary: '#111827',

    // Secondary/Accent
    secondary: '#E5E7EB',
    secondaryLight: '#F3F4F6',
    secondaryDark: '#D1D5DB',
    onSecondary: '#111827',

    // Backgrounds
    background: '#111827',
    surface: '#1F2937',
    surfaceVariant: '#374151',

    // Text colors
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    textInverse: '#111827',

    // Status colors
    error: '#F87171',
    errorLight: '#FCA5A5',
    errorDark: '#EF4444',
    onError: '#111827',

    success: '#34D399',
    successLight: '#6EE7B7',
    successDark: '#10B981',
    onSuccess: '#111827',

    warning: '#FBBF24',
    warningLight: '#FCD34D',
    warningDark: '#F59E0B',
    onWarning: '#111827',

    info: '#60A5FA',
    infoLight: '#93C5FD',
    infoDark: '#3B82F6',
    onInfo: '#111827',

    // UI elements
    border: '#374151',
    borderLight: '#4B5563',
    divider: '#374151',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Interactive states
    disabled: '#4B5563',
    disabledBackground: '#374151',
    focus: '#60A5FA',
    hover: 'rgba(96, 165, 250, 0.1)',
    pressed: 'rgba(96, 165, 250, 0.2)',
    ripple: 'rgba(96, 165, 250, 0.3)',

    // Skeleton loading
    skeleton: '#374151',
    skeletonHighlight: '#4B5563',

    // Rating stars
    rating: '#FBBF24',
    ratingEmpty: '#4B5563',

    // Badge backgrounds
    badgeBackground: '#EF4444',
    badgeText: '#FFFFFF',

    // Card shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
  },

  isDark: true,
};

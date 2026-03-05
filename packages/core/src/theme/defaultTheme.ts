/**
 * RIDLY Mobile SDK - Default Theme
 *
 * The default "Minimal" theme configuration.
 */

import type { ThemeTokens } from '../types';
import {
  defaultColors,
  defaultBorderRadius,
  defaultSpacing,
  defaultTypography,
} from './tokens';

/**
 * Default light theme
 */
export const defaultTheme: ThemeTokens = {
  colors: defaultColors,
  borderRadius: defaultBorderRadius,
  spacing: defaultSpacing,
  typography: defaultTypography,
  isDark: false,
};

/**
 * Default dark theme (with dark color overrides)
 */
export const defaultDarkTheme: ThemeTokens = {
  colors: {
    ...defaultColors,
    background: '#121212',
    surface: '#1E1E1E',
    text: '#F5F5F5',
    textSecondary: '#AAAAAA',
    border: '#333333',
    headerBackground: '#1E1E1E',
    headerText: '#F5F5F5',
    tabBarBackground: '#1E1E1E',
    tabBarActive: '#FFFFFF',
    tabBarInactive: '#666666',
    // Primary colors inverted for dark mode
    primary: '#FFFFFF',
    primaryDark: '#E0E0E0',
    onPrimary: '#000000',
    // UI state colors for dark mode
    disabled: '#374151',
    disabledText: '#6B7280',
    // Price colors for dark mode
    price: '#F5F5F5',
  },
  borderRadius: defaultBorderRadius,
  spacing: defaultSpacing,
  typography: defaultTypography,
  isDark: true,
};

/**
 * Theme types for RIDLY Mobile SDK
 */

import type { ThemeColors, BorderRadiusConfig, SpacingConfig, TypographyConfig } from './config';
import type { ThemeNavigation } from './theme-package';

/**
 * Complete theme tokens
 */
export interface ThemeTokens {
  colors: ThemeColors;
  borderRadius: BorderRadiusConfig;
  spacing: SpacingConfig;
  typography: TypographyConfig;
  isDark: boolean;
}

/**
 * Theme preset name
 */
export type ThemePreset = 'minimal' | 'bold' | 'elegant' | 'custom';

/**
 * Theme context value
 */
export interface ThemeContextValue {
  theme: ThemeTokens;
  isDarkMode: boolean;
  /** Alias for isDarkMode */
  isDark: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  /** Alias for setDarkMode - sets color scheme ('light' | 'dark') */
  setColorScheme: (scheme: 'light' | 'dark') => void;
  /** Navigation configuration from theme package */
  navigation?: ThemeNavigation;
}

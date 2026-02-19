/**
 * Theme types for RIDLY Mobile SDK
 */

import type { ThemeColors, BorderRadiusConfig, SpacingConfig, TypographyConfig } from './config';

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
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

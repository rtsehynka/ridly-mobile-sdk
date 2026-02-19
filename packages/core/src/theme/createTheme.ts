/**
 * RIDLY Mobile SDK - Theme Creation Utilities
 *
 * Provides functions for creating themes based on a base theme,
 * with deep merging and automatic dark mode generation.
 *
 * @example Basic usage
 * ```ts
 * // Create a simple custom theme
 * const myTheme = createCustomTheme({
 *   colors: { primary: '#FF6B00' },
 * });
 *
 * // Create both light and dark variants
 * const { light, dark } = createBrandTheme({
 *   primary: '#FF6B00',
 *   accent: '#00BFFF',
 * });
 * ```
 */

import type { ThemeTokens } from '../types';
import type { ThemeConfig, ThemeColors, BorderRadiusConfig, SpacingConfig, TypographyConfig } from '../types/config';
import { defaultTheme, defaultDarkTheme } from './defaultTheme';

// ============================================
// Types
// ============================================

/**
 * Partial theme configuration for overriding base theme
 */
export interface PartialThemeConfig {
  colors?: Partial<ThemeColors>;
  borderRadius?: Partial<BorderRadiusConfig>;
  spacing?: Partial<SpacingConfig>;
  typography?: Partial<TypographyConfig>;
}

/**
 * Theme preset definition with light and dark variants
 */
export interface ThemePresetConfig {
  name: string;
  description?: string;
  light: ThemeTokens;
  dark: ThemeTokens;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Deep merge two objects
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  if (!source) return target;

  const output = { ...target } as T;
  const sourceObj = source as Record<string, unknown>;
  const targetObj = target as Record<string, unknown>;
  const outputObj = output as Record<string, unknown>;

  for (const key in sourceObj) {
    if (Object.prototype.hasOwnProperty.call(sourceObj, key)) {
      const sourceValue = sourceObj[key];
      const targetValue = targetObj[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        outputObj[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        outputObj[key] = sourceValue;
      }
    }
  }

  return output;
}

/**
 * Darken a hex color by percentage
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) * (1 - percent)));
  const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - percent)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}


// ============================================
// Theme Creation Functions
// ============================================

/**
 * Create a theme from config (legacy support)
 *
 * @param config - Theme configuration from ridly.mobile.config.json
 * @param isDark - Whether to use dark mode
 * @returns Complete theme tokens
 */
export function createTheme(config: ThemeConfig, isDark: boolean = false): ThemeTokens {
  const baseTheme = isDark ? defaultDarkTheme : defaultTheme;

  const theme: ThemeTokens = { ...baseTheme };

  if (config.colors) {
    theme.colors = deepMerge(theme.colors, config.colors);
  }

  if (isDark && config.darkMode?.colors) {
    theme.colors = deepMerge(theme.colors, config.darkMode.colors as Partial<ThemeColors>);
  }

  if (config.borderRadius) {
    theme.borderRadius = deepMerge(theme.borderRadius, config.borderRadius);
  }

  if (config.spacing) {
    theme.spacing = deepMerge(theme.spacing, config.spacing);
  }

  if (config.typography) {
    theme.typography = deepMerge(theme.typography, config.typography);
  }

  theme.isDark = isDark;

  return theme;
}

/**
 * Create a custom theme by merging partial config with defaults
 *
 * @param config - Partial theme configuration to override defaults
 * @returns Complete theme tokens
 *
 * @example
 * ```ts
 * const myTheme = createCustomTheme({
 *   colors: {
 *     primary: '#FF6B00',
 *     accent: '#00BFFF',
 *   },
 *   borderRadius: {
 *     button: 24, // More rounded buttons
 *   },
 * });
 * ```
 */
export function createCustomTheme(config: PartialThemeConfig = {}): ThemeTokens {
  return {
    colors: deepMerge(defaultTheme.colors, config.colors || {}),
    borderRadius: deepMerge(defaultTheme.borderRadius, config.borderRadius || {}),
    spacing: deepMerge(defaultTheme.spacing, config.spacing || {}),
    typography: deepMerge(defaultTheme.typography, config.typography || {}),
    isDark: false,
  };
}

/**
 * Create a dark variant of a theme automatically
 *
 * @param lightTheme - The light theme to create a dark variant from
 * @param darkOverrides - Optional additional dark mode color overrides
 * @returns Dark theme tokens
 *
 * @example
 * ```ts
 * const lightTheme = createCustomTheme({ colors: { primary: '#FF6B00' } });
 * const darkTheme = createDarkVariant(lightTheme);
 * ```
 */
export function createDarkVariant(
  lightTheme: ThemeTokens,
  darkOverrides: Partial<ThemeColors> = {}
): ThemeTokens {
  // Auto-generate dark mode colors
  const autoDarkColors: ThemeColors = {
    // Keep brand colors
    primary: lightTheme.colors.primary,
    primaryDark: lightTheme.colors.primaryDark,
    secondary: lightTheme.colors.secondary,
    secondaryDark: lightTheme.colors.secondaryDark,
    accent: lightTheme.colors.accent,
    onPrimary: lightTheme.colors.onPrimary,
    // Status colors
    error: lightTheme.colors.error,
    success: lightTheme.colors.success,
    warning: lightTheme.colors.warning,
    sale: lightTheme.colors.sale,
    // Dark mode backgrounds
    background: '#121212',
    surface: '#1E1E1E',
    // Dark mode text
    text: '#F5F5F5',
    textSecondary: '#AAAAAA',
    border: '#333333',
    // Dark mode UI
    headerBackground: '#1E1E1E',
    headerText: '#F5F5F5',
    tabBarBackground: '#1E1E1E',
    tabBarActive: '#FFFFFF',
    tabBarInactive: '#666666',
    disabled: '#374151',
    disabledText: '#6B7280',
    price: '#F5F5F5',
  };

  return {
    colors: deepMerge(autoDarkColors, darkOverrides),
    borderRadius: lightTheme.borderRadius,
    spacing: lightTheme.spacing,
    typography: lightTheme.typography,
    isDark: true,
  };
}

/**
 * Extend an existing theme with additional overrides
 *
 * @param baseTheme - The theme to extend
 * @param overrides - Partial configuration to override
 * @returns New theme with overrides applied
 *
 * @example
 * ```ts
 * import { presets } from '@ridly/mobile-core';
 *
 * const myTheme = extendTheme(presets.bold.light, {
 *   colors: {
 *     primary: '#FF6B00', // Override just the primary color
 *   },
 * });
 * ```
 */
export function extendTheme(baseTheme: ThemeTokens, overrides: PartialThemeConfig): ThemeTokens {
  return {
    colors: deepMerge(baseTheme.colors, overrides.colors || {}),
    borderRadius: deepMerge(baseTheme.borderRadius, overrides.borderRadius || {}),
    spacing: deepMerge(baseTheme.spacing, overrides.spacing || {}),
    typography: deepMerge(baseTheme.typography, overrides.typography || {}),
    isDark: baseTheme.isDark,
  };
}

/**
 * Create a complete theme set (light + dark) with brand colors
 *
 * This is the recommended way to create a custom branded theme.
 *
 * @param brandColors - Your brand colors
 * @param options - Additional theme options
 * @returns Object with light and dark theme variants
 *
 * @example
 * ```ts
 * const { light, dark } = createBrandTheme({
 *   primary: '#FF6B00',
 *   secondary: '#333333',
 *   accent: '#00BFFF',
 * });
 *
 * // Use in ThemeProvider
 * <ThemeProvider lightTheme={light} darkTheme={dark}>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function createBrandTheme(
  brandColors: {
    primary: string;
    secondary?: string;
    accent?: string;
    onPrimary?: string;
  },
  options: {
    borderRadius?: 'sharp' | 'rounded' | 'pill';
    typography?: Partial<TypographyConfig>;
    darkOverrides?: Partial<ThemeColors>;
  } = {}
): ThemePresetConfig {
  // Calculate darker variants
  const primaryDark = darkenColor(brandColors.primary, 0.2);
  const secondaryDark = brandColors.secondary
    ? darkenColor(brandColors.secondary, 0.2)
    : undefined;

  // Border radius presets
  const radiusPresets: Record<string, BorderRadiusConfig> = {
    sharp: { small: 0, medium: 2, large: 4, button: 4, card: 4, image: 2 },
    rounded: { small: 4, medium: 8, large: 12, button: 8, card: 12, image: 8 },
    pill: { small: 8, medium: 16, large: 24, button: 999, card: 16, image: 12 },
  };

  const config: PartialThemeConfig = {
    colors: {
      primary: brandColors.primary,
      primaryDark,
      secondary: brandColors.secondary,
      secondaryDark,
      accent: brandColors.accent,
      onPrimary: brandColors.onPrimary || '#FFFFFF',
    },
    borderRadius: options.borderRadius ? radiusPresets[options.borderRadius] : undefined,
    typography: options.typography,
  };

  const light = createCustomTheme(config);
  const dark = createDarkVariant(light, options.darkOverrides);

  return {
    name: 'Custom Brand',
    light,
    dark,
  };
}

// ============================================
// Preset Themes
// ============================================

/**
 * Minimal preset - Clean, modern, black & white
 */
export const minimalPreset: ThemePresetConfig = {
  name: 'Minimal',
  description: 'Clean, modern design with black and white aesthetics',
  light: defaultTheme,
  dark: defaultDarkTheme,
};

/**
 * Bold preset - Strong, impactful, sharp edges
 */
export const boldPreset: ThemePresetConfig = (() => {
  const light: ThemeTokens = {
    colors: {
      ...defaultTheme.colors,
      primary: '#1A1A1A',
      primaryDark: '#000000',
      secondary: '#444444',
      secondaryDark: '#222222',
      accent: '#FF0000',
      headerBackground: '#1A1A1A',
      headerText: '#FFFFFF',
      tabBarBackground: '#1A1A1A',
      tabBarActive: '#FFFFFF',
      tabBarInactive: '#666666',
    },
    borderRadius: {
      small: 0,
      medium: 0,
      large: 0,
      button: 0,
      card: 0,
      image: 0,
    },
    spacing: defaultTheme.spacing,
    typography: {
      ...defaultTheme.typography,
      headingWeight: '800',
    },
    isDark: false,
  };

  return {
    name: 'Bold',
    description: 'Strong, impactful design with sharp edges',
    light,
    dark: createDarkVariant(light, {
      accent: '#FF3333', // Lighter red for dark mode
    }),
  };
})();

/**
 * Elegant preset - Sophisticated, luxurious feel
 */
export const elegantPreset: ThemePresetConfig = (() => {
  const light: ThemeTokens = {
    colors: {
      ...defaultTheme.colors,
      primary: '#1A1A1A',
      primaryDark: '#000000',
      secondary: '#666666',
      secondaryDark: '#444444',
      accent: '#C9A86C', // Gold
      background: '#FAFAF8',
      surface: '#FFFFFF',
      border: '#E8E8E8',
    },
    borderRadius: {
      small: 2,
      medium: 4,
      large: 8,
      button: 2,
      card: 4,
      image: 2,
    },
    spacing: {
      screenPadding: 20,
      cardPadding: 16,
      sectionGap: 32,
    },
    typography: {
      fontFamily: 'System',
      headingFontFamily: 'System',
      baseFontSize: 16,
      headingWeight: '600',
      bodyWeight: '400',
    },
    isDark: false,
  };

  return {
    name: 'Elegant',
    description: 'Sophisticated, luxurious design with gold accents',
    light,
    dark: createDarkVariant(light, {
      accent: '#D4B97C', // Lighter gold for dark mode
      background: '#0A0A0A',
      surface: '#161616',
    }),
  };
})();

/**
 * Vibrant preset - Colorful, energetic, playful
 */
export const vibrantPreset: ThemePresetConfig = (() => {
  const light: ThemeTokens = {
    colors: {
      ...defaultTheme.colors,
      primary: '#6366F1', // Indigo
      primaryDark: '#4F46E5',
      secondary: '#EC4899', // Pink
      secondaryDark: '#DB2777',
      accent: '#10B981', // Emerald
      background: '#FFFFFF',
      surface: '#F9FAFB',
    },
    borderRadius: {
      small: 8,
      medium: 12,
      large: 16,
      button: 12,
      card: 16,
      image: 12,
    },
    spacing: defaultTheme.spacing,
    typography: {
      ...defaultTheme.typography,
      headingWeight: '700',
    },
    isDark: false,
  };

  return {
    name: 'Vibrant',
    description: 'Colorful, energetic design with playful aesthetics',
    light,
    dark: createDarkVariant(light, {
      primary: '#818CF8', // Lighter indigo
      secondary: '#F472B6', // Lighter pink
      accent: '#34D399', // Lighter emerald
    }),
  };
})();

/**
 * All presets as a map
 */
export const presets = {
  minimal: minimalPreset,
  bold: boldPreset,
  elegant: elegantPreset,
  vibrant: vibrantPreset,
} as const;

/**
 * Get preset theme by name
 */
export function getPresetTheme(preset: keyof typeof presets): ThemePresetConfig {
  return presets[preset] || presets.minimal;
}

/**
 * Legacy support - get single theme tokens by preset name
 */
export function getPresetThemeTokens(
  preset: 'minimal' | 'bold' | 'elegant' | 'vibrant',
  isDark: boolean = false
): ThemeTokens {
  const themePreset = getPresetTheme(preset);
  return isDark ? themePreset.dark : themePreset.light;
}

// Legacy export
export const presetThemes = {
  minimal: minimalPreset.light,
  bold: boldPreset.light,
  elegant: elegantPreset.light,
  vibrant: vibrantPreset.light,
};

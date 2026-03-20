/**
 * RIDLY Mobile SDK - Theme System
 *
 * @example Using preset theme
 * ```tsx
 * import { ThemeProvider } from '@ridly/mobile-core';
 *
 * <ThemeProvider preset="elegant">
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example Creating custom brand theme
 * ```tsx
 * import { ThemeProvider, createBrandTheme } from '@ridly/mobile-core';
 *
 * const myBrand = createBrandTheme({
 *   primary: '#FF6B00',
 *   accent: '#00BFFF',
 * });
 *
 * <ThemeProvider lightTheme={myBrand.light} darkTheme={myBrand.dark}>
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example Extending a preset
 * ```tsx
 * import { presets, extendTheme } from '@ridly/mobile-core';
 *
 * const myTheme = extendTheme(presets.elegant.light, {
 *   colors: { primary: '#FF6B00' },
 * });
 * ```
 */

// Provider
export { ThemeProvider, type ThemeProviderProps } from './ThemeProvider';

// Context & Hooks
export { ThemeContext, useTheme, useThemeTokens, useIsDarkMode } from './ThemeContext';

// Theme creation functions
export {
  // Factory functions
  createTheme,
  createCustomTheme,
  createDarkVariant,
  createBrandTheme,
  extendTheme,
  // Preset getters
  getPresetTheme,
  getPresetThemeTokens,
  // Presets
  presets,
  minimalPreset,
  boldPreset,
  elegantPreset,
  vibrantPreset,
  // Legacy
  presetThemes,
  // Types
  type PartialThemeConfig,
  type ThemePresetConfig,
} from './createTheme';

// Default themes
export { defaultTheme, defaultDarkTheme } from './defaultTheme';

// Base theme package (for free SDK)
export { baseThemePackage } from './baseThemePackage';

// Design tokens
export {
  defaultColors,
  darkColors,
  defaultBorderRadius,
  defaultSpacing,
  defaultTypography,
  fontSizes,
  lineHeights,
  spacingScale,
  shadows,
  componentTokens,
} from './tokens';

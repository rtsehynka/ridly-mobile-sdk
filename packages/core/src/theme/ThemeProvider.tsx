/**
 * RIDLY Mobile SDK - Theme Provider
 *
 * Provides theme context to the app with dark mode support.
 *
 * @example Using preset theme
 * ```tsx
 * <ThemeProvider preset="elegant">
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example Using custom brand theme
 * ```tsx
 * import { createBrandTheme } from '@ridly/mobile-core';
 *
 * const brandTheme = createBrandTheme({
 *   primary: '#FF6B00',
 *   accent: '#00BFFF',
 * });
 *
 * <ThemeProvider
 *   lightTheme={brandTheme.light}
 *   darkTheme={brandTheme.dark}
 * >
 *   <App />
 * </ThemeProvider>
 * ```
 */

import { useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import type { ThemeConfig, ThemeTokens, ThemeContextValue } from '../types';
import { ThemeContext } from './ThemeContext';
import { createTheme, getPresetTheme, presets, extendTheme } from './createTheme';

export interface ThemeProviderProps {
  /**
   * Theme preset name
   * @default 'minimal'
   */
  preset?: 'minimal' | 'bold' | 'elegant' | 'vibrant';

  /**
   * Custom light theme (overrides preset)
   */
  lightTheme?: ThemeTokens;

  /**
   * Custom dark theme (overrides preset)
   */
  darkTheme?: ThemeTokens;

  /**
   * Theme configuration from ridly.mobile.config.json (legacy)
   */
  config?: ThemeConfig;

  /**
   * Children components
   */
  children: ReactNode;

  /**
   * Enable dark mode
   * @default true
   */
  enableDarkMode?: boolean;

  /**
   * Follow system dark mode setting
   * @default true
   */
  followSystem?: boolean;

  /**
   * Initial dark mode state (overrides system preference)
   */
  initialDarkMode?: boolean;

  /**
   * Callback when dark mode changes
   */
  onDarkModeChange?: (isDark: boolean) => void;
}

/**
 * Theme Provider Component
 *
 * Wraps your app to provide theme context.
 *
 * @example Basic usage with preset
 * ```tsx
 * import { ThemeProvider } from '@ridly/mobile-core';
 *
 * function App() {
 *   return (
 *     <ThemeProvider preset="elegant">
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 *
 * @example Custom brand theme
 * ```tsx
 * import { ThemeProvider, createBrandTheme } from '@ridly/mobile-core';
 *
 * const myBrand = createBrandTheme({
 *   primary: '#FF6B00',
 *   accent: '#00BFFF',
 * });
 *
 * function App() {
 *   return (
 *     <ThemeProvider lightTheme={myBrand.light} darkTheme={myBrand.dark}>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function ThemeProvider({
  preset = 'minimal',
  lightTheme,
  darkTheme,
  config,
  children,
  enableDarkMode = true,
  followSystem = true,
  initialDarkMode,
  onDarkModeChange,
}: ThemeProviderProps) {
  // Get system color scheme
  const systemColorScheme = useColorScheme();

  // Determine initial dark mode state
  const getInitialDarkMode = (): boolean => {
    if (initialDarkMode !== undefined) {
      return initialDarkMode;
    }

    if (!enableDarkMode) {
      return false;
    }

    // Legacy config support
    if (config?.darkMode?.enabled) {
      if (config.darkMode.auto) {
        return systemColorScheme === 'dark';
      }
      return false;
    }

    if (followSystem) {
      return systemColorScheme === 'dark';
    }

    return false;
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialDarkMode);

  // Update dark mode when system preference changes (if following system)
  useEffect(() => {
    if (enableDarkMode && followSystem) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
    // Legacy config support
    if (config?.darkMode?.enabled && config?.darkMode?.auto) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, enableDarkMode, followSystem, config?.darkMode?.enabled, config?.darkMode?.auto]);

  // Notify parent when dark mode changes
  useEffect(() => {
    onDarkModeChange?.(isDarkMode);
  }, [isDarkMode, onDarkModeChange]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    if (enableDarkMode || config?.darkMode?.enabled) {
      setIsDarkMode((prev) => !prev);
    }
  }, [enableDarkMode, config?.darkMode?.enabled]);

  // Set dark mode explicitly
  const setDarkModeValue = useCallback(
    (enabled: boolean) => {
      if (enableDarkMode || config?.darkMode?.enabled) {
        setIsDarkMode(enabled);
      }
    },
    [enableDarkMode, config?.darkMode?.enabled]
  );

  // Build theme
  const theme: ThemeTokens = useMemo(() => {
    // Priority 1: Custom themes provided directly
    if (lightTheme && darkTheme) {
      return isDarkMode ? darkTheme : lightTheme;
    }

    if (lightTheme) {
      // Auto-generate dark theme if only light provided
      return isDarkMode
        ? { ...lightTheme, isDark: true }
        : lightTheme;
    }

    // Priority 2: Legacy config
    if (config) {
      // Get preset theme if specified
      if (config.preset && config.preset !== 'custom') {
        const presetTheme = getPresetTheme(config.preset as keyof typeof presets);
        const baseTheme = isDarkMode ? presetTheme.dark : presetTheme.light;

        // Merge config overrides with preset
        // First merge base colors, then merge dark mode colors on top if in dark mode
        const mergedColors = isDarkMode && config.darkMode?.colors
          ? { ...config.colors, ...config.darkMode.colors }
          : config.colors;

        return extendTheme(baseTheme, {
          colors: mergedColors,
          borderRadius: config.borderRadius,
          spacing: config.spacing,
          typography: config.typography,
        });
      }

      return createTheme(config, isDarkMode);
    }

    // Priority 3: Use preset
    const selectedPreset = getPresetTheme(preset);
    return isDarkMode ? selectedPreset.dark : selectedPreset.light;
  }, [preset, lightTheme, darkTheme, config, isDarkMode]);

  // Context value
  const contextValue: ThemeContextValue = useMemo(
    () => ({
      theme,
      isDarkMode,
      toggleDarkMode,
      setDarkMode: setDarkModeValue,
    }),
    [theme, isDarkMode, toggleDarkMode, setDarkModeValue]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

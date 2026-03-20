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
import type { ThemeConfig, ThemeTokens, ThemeContextValue, RidlyThemePackage } from '../types';
import { ThemeContext } from './ThemeContext';
import { createTheme, getPresetTheme, presets, extendTheme } from './createTheme';
import { useComponentRegistry } from '../registry/ComponentRegistry';
import { useSlotRegistry } from '../registry/SlotRegistry';

export interface ThemeProviderProps {
  /**
   * Premium theme package (highest priority)
   * When provided, uses tokens, style overrides, and slots from the package.
   */
  themePackage?: RidlyThemePackage;

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
  themePackage,
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
  // Registry access
  const registerComponent = useComponentRegistry((state) => state.register);
  const clearComponents = useComponentRegistry((state) => state.clear);
  const fillSlot = useSlotRegistry((state) => state.fill);
  const clearSlots = useSlotRegistry((state) => state.clear);

  // Get system color scheme - but DON'T use it during initial render to avoid hydration mismatch
  const systemColorScheme = useColorScheme();

  // Always initialize with false for SSR to ensure consistent hydration
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync dark mode ONLY after hydration to avoid mismatch
  useEffect(() => {
    setIsHydrated(true);

    // Now it's safe to read system preference
    if (initialDarkMode !== undefined) {
      setIsDarkMode(initialDarkMode);
      return;
    }

    if (!enableDarkMode) {
      setIsDarkMode(false);
      return;
    }

    // Legacy config support
    if (config?.darkMode?.enabled) {
      if (config.darkMode.auto && systemColorScheme) {
        setIsDarkMode(systemColorScheme === 'dark');
      }
      return;
    }

    if (followSystem && systemColorScheme) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, []); // Empty deps - only run once on mount

  // Update dark mode when system preference changes (if following system)
  // Only after hydration to avoid mismatch
  useEffect(() => {
    if (!isHydrated) return;

    if (enableDarkMode && followSystem && systemColorScheme) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
    // Legacy config support
    if (config?.darkMode?.enabled && config?.darkMode?.auto && systemColorScheme) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, enableDarkMode, followSystem, config?.darkMode?.enabled, config?.darkMode?.auto, isHydrated]);

  // Notify parent when dark mode changes
  useEffect(() => {
    onDarkModeChange?.(isDarkMode);
  }, [isDarkMode, onDarkModeChange]);

  // Register theme package on mount/change
  useEffect(() => {
    if (!themePackage) return;

    // Register style overrides
    if (themePackage.styleOverrides) {
      Object.entries(themePackage.styleOverrides).forEach(([componentId, override]) => {
        if (override) {
          registerComponent(componentId, override);
        }
      });
    }

    // Register slot contents
    if (themePackage.slots) {
      themePackage.slots.forEach(({ slotId, component, priority, props }) => {
        fillSlot(slotId, component, { priority, props });
      });
    }

    // Call onActivate lifecycle hook
    const currentTheme = isDarkMode ? themePackage.tokens.dark : themePackage.tokens.light;
    themePackage.onActivate?.({ theme: currentTheme, isDarkMode });

    // Cleanup on unmount or theme change
    return () => {
      clearComponents();
      clearSlots();
      themePackage.onDeactivate?.({ theme: currentTheme, isDarkMode });
    };
  }, [themePackage, registerComponent, fillSlot, clearComponents, clearSlots, isDarkMode]);

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

  // Set color scheme (light/dark)
  const setColorScheme = useCallback(
    (scheme: 'light' | 'dark') => {
      setDarkModeValue(scheme === 'dark');
    },
    [setDarkModeValue]
  );

  // Build theme
  const theme: ThemeTokens = useMemo(() => {
    // Priority 0: Theme package (highest priority)
    if (themePackage) {
      return isDarkMode ? themePackage.tokens.dark : themePackage.tokens.light;
    }

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
  }, [themePackage, preset, lightTheme, darkTheme, config, isDarkMode]);

  // Context value
  const contextValue: ThemeContextValue = useMemo(
    () => ({
      theme,
      isDarkMode,
      isDark: isDarkMode, // Alias
      toggleDarkMode,
      setDarkMode: setDarkModeValue,
      setColorScheme, // Alias
      navigation: themePackage?.navigation,
    }),
    [theme, isDarkMode, toggleDarkMode, setDarkModeValue, setColorScheme, themePackage?.navigation]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

/**
 * RIDLY Mobile SDK - Base Theme Package
 *
 * Default theme package that implements RidlyThemePackage interface.
 * Used as fallback when no premium theme is configured.
 */

import type { RidlyThemePackage } from '../types/theme-package';
import { defaultTheme, defaultDarkTheme } from './defaultTheme';

/**
 * Base/Minimal Theme Package
 *
 * This is the default theme that ships with the free SDK.
 * It provides a clean, minimal design that works out of the box.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, baseThemePackage } from '@ridly/mobile-core';
 *
 * function App() {
 *   return (
 *     <ThemeProvider themePackage={baseThemePackage}>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export const baseThemePackage: RidlyThemePackage = {
  id: 'ridly-base',
  name: 'RIDLY Base',
  version: '1.0.0',
  description: 'Default minimal theme for RIDLY Mobile SDK',
  author: 'RIDLY',

  // Theme tokens - uses default light/dark themes
  tokens: {
    light: defaultTheme,
    dark: defaultDarkTheme,
  },

  // No style overrides - uses default component styles
  styleOverrides: {},

  // No custom slots - uses default slot content
  slots: [],

  // Basic navigation - simple 4-tab layout
  navigation: {
    tabs: [
      {
        name: 'index',
        title: 'Home',
        icon: 'home-outline',
        iconFocused: 'home',
      },
      {
        name: 'categories',
        title: 'Browse',
        icon: 'grid-outline',
        iconFocused: 'grid',
      },
      {
        name: 'cart',
        title: 'Cart',
        icon: 'cart-outline',
        iconFocused: 'cart',
        badge: 'cart',
      },
      {
        name: 'account',
        title: 'Profile',
        icon: 'person-outline',
        iconFocused: 'person',
        behavior: 'navigate',
      },
    ],
    tabBarStyle: {
      height: 60,
      showLabels: true,
      iconSize: 24,
      animated: false,
    },
    customHeader: false,
  },

  // Lifecycle hooks
  onActivate: (context) => {
    console.log('[RIDLY Base] Theme activated', context.isDarkMode ? '(dark mode)' : '(light mode)');
  },

  onDeactivate: () => {
    console.log('[RIDLY Base] Theme deactivated');
  },
};

export default baseThemePackage;

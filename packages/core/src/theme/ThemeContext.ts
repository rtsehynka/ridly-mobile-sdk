/**
 * RIDLY Mobile SDK - Theme Context
 *
 * React context for theme access throughout the app.
 */

import { createContext, useContext } from 'react';
import type { ThemeContextValue, ThemeTokens } from '../types';
import { defaultTheme } from './defaultTheme';

/**
 * Default context value
 */
const defaultContextValue: ThemeContextValue = {
  theme: defaultTheme,
  isDarkMode: false,
  toggleDarkMode: () => {
    console.warn('ThemeProvider not found. Wrap your app with ThemeProvider.');
  },
  setDarkMode: () => {
    console.warn('ThemeProvider not found. Wrap your app with ThemeProvider.');
  },
};

/**
 * Theme context
 */
export const ThemeContext = createContext<ThemeContextValue>(defaultContextValue);

/**
 * Hook to access theme context
 *
 * @returns Theme context value with theme tokens and dark mode controls
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, isDarkMode, toggleDarkMode } = useTheme();
 *   return (
 *     <View style={{ backgroundColor: theme.colors.background }}>
 *       <Text style={{ color: theme.colors.text }}>Hello</Text>
 *       <Button onPress={toggleDarkMode}>Toggle Dark Mode</Button>
 *     </View>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  return context;
}

/**
 * Hook to access just the theme tokens
 *
 * @returns Theme tokens
 */
export function useThemeTokens(): ThemeTokens {
  const { theme } = useTheme();
  return theme;
}

/**
 * Hook to check if dark mode is enabled
 *
 * @returns True if dark mode is enabled
 */
export function useIsDarkMode(): boolean {
  const { isDarkMode } = useTheme();
  return isDarkMode;
}

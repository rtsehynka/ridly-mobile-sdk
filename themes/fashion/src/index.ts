/**
 * RIDLY Fashion Theme
 *
 * Premium fashion & lifestyle theme for RIDLY Mobile SDK.
 * Features modern design with blue accents, hero banners,
 * horizontal category icons, and featured product grids.
 */

import type { RidlyThemePackage } from '@ridly/mobile-core';
import { SLOTS } from '@ridly/mobile-core';

import { lightTokens, darkTokens } from './theme';
import { buttonStyles, productCardStyles } from './styles';
import { HeroBanner, CategoryScroller, FeaturedProducts } from './slots';

/**
 * RIDLY Fashion Theme Package
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from '@ridly/mobile-core';
 * import fashionTheme from '@ridly/theme-fashion';
 *
 * function App() {
 *   return (
 *     <ThemeProvider themePackage={fashionTheme}>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export const fashionTheme: RidlyThemePackage = {
  id: 'ridly-fashion',
  name: 'RIDLY Fashion',
  version: '1.0.0',
  description: 'Premium fashion & lifestyle theme with modern design',
  author: 'RIDLY',

  // Theme tokens
  tokens: {
    light: lightTokens,
    dark: darkTokens,
  },

  // Component style overrides
  styleOverrides: {
    Button: buttonStyles,
    ProductCard: productCardStyles,
  },

  // Slot content for home screen
  slots: [
    {
      slotId: SLOTS['home.hero'],
      component: HeroBanner,
      priority: 10,
    },
    {
      slotId: SLOTS['home.categories'],
      component: CategoryScroller,
      priority: 10,
    },
    {
      slotId: SLOTS['home.featured'],
      component: FeaturedProducts,
      priority: 10,
    },
  ],

  // Lifecycle hooks
  onActivate: (context) => {
    console.log('[RIDLY Fashion] Theme activated', context.isDarkMode ? '(dark mode)' : '(light mode)');
  },

  onDeactivate: (context) => {
    console.log('[RIDLY Fashion] Theme deactivated');
  },
};

// Default export for convenience
export default fashionTheme;

// Named exports
export { lightTokens, darkTokens } from './theme';
export { buttonStyles, productCardStyles } from './styles';
export { HeroBanner, CategoryScroller, FeaturedProducts } from './slots';

/**
 * RIDLY Luxe Theme
 *
 * Premium luxury theme for RIDLY Mobile SDK.
 * Features elegant gold/champagne accents, refined typography,
 * and sophisticated component styling for high-end brands.
 */

import type { RidlyThemePackage } from '@ridly/mobile-core';
import { SLOTS } from '@ridly/mobile-core';

import { lightTokens, darkTokens } from './theme';
import { buttonStyles, productCardStyles } from './styles';
import { HeroBanner, CategoryScroller, FeaturedProducts } from './slots';

/**
 * RIDLY Luxe Theme Package
 *
 * @example
 * ```tsx
 * import { ThemeProvider } from '@ridly/mobile-core';
 * import luxeTheme from '@ridly/theme-luxe';
 *
 * function App() {
 *   return (
 *     <ThemeProvider themePackage={luxeTheme}>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export const luxeTheme: RidlyThemePackage = {
  id: 'ridly-luxe',
  name: 'RIDLY Luxe',
  version: '1.0.0',
  description: 'Premium luxury theme with gold/champagne accents for high-end brands',
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

  // Premium navigation with burger menu
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
        icon: 'bag-outline',
        iconFocused: 'bag',
        badge: 'cart',
      },
      {
        name: 'account',
        title: 'Menu',
        icon: 'menu-outline',
        behavior: 'modal',
      },
    ],
    // Premium: Burger menu items
    menuItems: [
      { icon: 'heart-outline', label: 'Wishlist', route: '/(tabs)/saved' },
      { icon: 'receipt-outline', label: 'Orders', route: '/orders' },
      { icon: 'person-outline', label: 'Profile', route: '/(tabs)/account' },
      { icon: 'settings-outline', label: 'Settings', route: '/settings' },
    ],
    tabBarStyle: {
      height: 64,
      showLabels: true,
      iconSize: 24,
      animated: true,
    },
    // Premium: Custom header with RIDLY logo and search
    customHeader: true,
  },

  // Lifecycle hooks
  onActivate: (context) => {
    console.log('[RIDLY Luxe] Theme activated', context.isDarkMode ? '(dark mode)' : '(light mode)');
  },

  onDeactivate: () => {
    console.log('[RIDLY Luxe] Theme deactivated');
  },
};

// Default export for convenience
export default luxeTheme;

// Named exports
export { lightTokens, darkTokens } from './theme';
export { buttonStyles, productCardStyles } from './styles';
export { HeroBanner, CategoryScroller, FeaturedProducts } from './slots';

// Premium Components
export {
  LanguageSwitcher,
  CurrencySelector,
  SocialLoginButtons,
  BarcodeScannerView,
} from './components';

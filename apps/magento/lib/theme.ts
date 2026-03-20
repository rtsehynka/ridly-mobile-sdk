/**
 * Theme Loader
 *
 * Loads the appropriate theme package based on configuration.
 * Falls back to base theme if premium theme is not available.
 */

import { baseThemePackage, type RidlyThemePackage } from '@ridly/mobile-core';
import config from '../ridly.mobile.config.json';

/**
 * Get the theme package based on config.
 * Premium themes are loaded conditionally - if not available, falls back to base theme.
 */
function loadThemePackage(): RidlyThemePackage {
  const preset = config.theme?.preset;

  console.log('[Theme] Loading theme preset:', preset || 'base');

  // Premium theme: luxe (gold/champagne luxury theme)
  if (preset === 'luxe') {
    try {
      const luxeTheme = require('../../../themes/luxe/src').default;
      console.log('[Theme] Luxe theme loaded successfully');
      return luxeTheme;
    } catch (error) {
      console.log('[Theme] Luxe theme not available, using base theme');
    }
  }

  // Legacy support for 'fashion' preset (redirects to luxe)
  if (preset === 'fashion') {
    try {
      const luxeTheme = require('../../../themes/luxe/src').default;
      console.log('[Theme] Fashion preset → Luxe theme loaded');
      return luxeTheme;
    } catch (error) {
      console.log('[Theme] Theme not available, using base theme');
    }
  }

  // Default: use base theme from core
  console.log('[Theme] Using base theme');
  return baseThemePackage;
}

/**
 * Theme package singleton
 * Loaded once at app startup based on config
 */
export const themePackage = loadThemePackage();

/**
 * Re-export types for convenience
 */
export type { RidlyThemePackage };

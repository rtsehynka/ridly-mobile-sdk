/**
 * Adapter Configuration
 *
 * Dynamically loads the appropriate e-commerce adapter based on config.
 * Supports: Magento, Shopware (future), WooCommerce (future)
 */

import { Platform } from 'react-native';
import config from '../ridly.mobile.config.json';

// Import adapter interface type from core
import type { ECommerceAdapter } from '@ridly/mobile-core';

/**
 * Get the appropriate store URL based on platform.
 * Web uses proxy to avoid browser CORS restrictions.
 * Native apps use direct URL (no CORS issues).
 */
const getStoreUrl = () => {
  const isWeb = Platform.OS === 'web';

  console.log('[Adapter] Platform:', Platform.OS);

  if (isWeb) {
    // Web always uses proxy (both dev and production)
    const proxyPath = process.env.EXPO_PUBLIC_API_PROXY_URL || '/api/magento-proxy';

    if (typeof window !== 'undefined' && window.location?.origin) {
      const proxyUrl = window.location.origin + proxyPath;
      console.log('[Adapter] Using proxy:', proxyUrl);
      return proxyUrl;
    }

    // SSR fallback
    console.log('[Adapter] SSR mode, using direct URL:', config.store.url);
    return config.store.url;
  }

  // Native apps use direct URL
  console.log('[Adapter] Using direct URL:', config.store.url);
  return config.store.url;
};

/**
 * Load adapter based on platform config
 */
function loadAdapter(): ECommerceAdapter {
  const platform = config.store.platform;
  console.log('[Adapter] Loading adapter for platform:', platform);

  // Magento adapter
  if (platform === 'magento') {
    try {
      const { MagentoAdapter } = require('@ridly/mobile-adapter-magento');
      console.log('[Adapter] Magento adapter loaded successfully');
      return new MagentoAdapter({
        storeUrl: getStoreUrl(),
        storeCode: config.store.storeCode,
      });
    } catch (error) {
      console.error('[Adapter] Failed to load Magento adapter:', error);
      throw new Error('Magento adapter not available. Install @ridly/mobile-adapter-magento');
    }
  }

  // Shopware adapter (future)
  if (platform === 'shopware') {
    try {
      const { ShopwareAdapter } = require('@ridly/mobile-adapter-shopware');
      const storeConfig = config.store as any;
      console.log('[Adapter] Shopware adapter loaded successfully');
      return new ShopwareAdapter({
        storeUrl: getStoreUrl(),
        accessKey: storeConfig.accessKey,
      });
    } catch (error) {
      console.error('[Adapter] Failed to load Shopware adapter:', error);
      throw new Error('Shopware adapter not available. Install @ridly/mobile-adapter-shopware');
    }
  }

  // WooCommerce adapter (future)
  if (platform === 'woocommerce') {
    try {
      const { WooCommerceAdapter } = require('@ridly/mobile-adapter-woocommerce');
      const storeConfig = config.store as any;
      console.log('[Adapter] WooCommerce adapter loaded successfully');
      return new WooCommerceAdapter({
        storeUrl: getStoreUrl(),
        consumerKey: storeConfig.consumerKey,
        consumerSecret: storeConfig.consumerSecret,
      });
    } catch (error) {
      console.error('[Adapter] Failed to load WooCommerce adapter:', error);
      throw new Error('WooCommerce adapter not available. Install @ridly/mobile-adapter-woocommerce');
    }
  }

  throw new Error(`Unknown platform: ${platform}. Supported: magento, shopware, woocommerce`);
}

// Lazy singleton for adapter
let _adapter: ECommerceAdapter | null = null;

/**
 * Get the adapter instance (lazy initialization)
 */
export const getAdapter = (): ECommerceAdapter => {
  if (!_adapter) {
    _adapter = loadAdapter();
  }
  return _adapter;
};

/**
 * Adapter instance with Proxy for web lazy loading
 * Ensures window.location is available before creating adapter
 */
export const adapter = Platform.OS === 'web'
  ? (new Proxy({} as ECommerceAdapter, {
      get(_, prop) {
        const adapterInstance = getAdapter();
        const value = (adapterInstance as any)[prop];
        // Bind methods so `this` works correctly
        if (typeof value === 'function') {
          return value.bind(adapterInstance);
        }
        return value;
      },
    }))
  : loadAdapter();

// Legacy export for backward compatibility
export const magentoAdapter = adapter;

/**
 * Re-export the config for use throughout the app
 */
export { config };

/**
 * Re-export types
 */
export type { ECommerceAdapter };

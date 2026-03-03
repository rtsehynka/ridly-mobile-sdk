/**
 * Magento Adapter Configuration
 *
 * Creates and exports the Magento adapter instance using the central config.
 */

import { Platform } from 'react-native';
import { MagentoAdapter } from '@ridly/mobile-adapter-magento';
import config from '../ridly.mobile.config.json';

/**
 * Get the appropriate store URL based on platform.
 * Web uses local CORS proxy to avoid browser CORS restrictions.
 */
const getStoreUrl = () => {
  if (Platform.OS === 'web' && __DEV__) {
    // Use local CORS proxy for web development
    // Start proxy with: node scripts/cors-proxy.js
    return 'http://localhost:3001';
  }
  return config.store.url;
};

/**
 * Singleton Magento adapter instance configured from ridly.mobile.config.json
 */
export const magentoAdapter = new MagentoAdapter({
  storeUrl: getStoreUrl(),
  storeCode: config.store.storeCode,
});

/**
 * Re-export the config for use throughout the app
 */
export { config };

/**
 * Re-export types and utilities
 */
export type { MagentoAdapterConfig } from '@ridly/mobile-adapter-magento';

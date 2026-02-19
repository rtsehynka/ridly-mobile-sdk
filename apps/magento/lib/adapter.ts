/**
 * Magento Adapter Configuration
 *
 * Creates and exports the Magento adapter instance using the central config.
 */

import { MagentoAdapter } from '@ridly/mobile-adapter-magento';
import config from '../ridly.mobile.config.json';

/**
 * Singleton Magento adapter instance configured from ridly.mobile.config.json
 */
export const magentoAdapter = new MagentoAdapter({
  storeUrl: config.store.url,
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

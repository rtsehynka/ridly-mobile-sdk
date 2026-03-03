/**
 * RIDLY Mobile SDK - Config Store
 *
 * Zustand store for managing SDK configuration and adapter instance.
 */

import { create } from 'zustand';
import type { RidlyMobileConfig, ECommerceAdapter, StoreConfig } from '../types';

export interface ConfigState {
  /** The SDK configuration */
  config: RidlyMobileConfig | null;

  /** The e-commerce adapter instance */
  adapter: ECommerceAdapter | null;

  /** Store configuration from the adapter */
  storeConfig: StoreConfig | null;

  /** Whether the SDK is initialized */
  isInitialized: boolean;

  /** Whether initialization is in progress */
  isInitializing: boolean;

  /** Initialization error if any */
  initError: Error | null;

  /** Set the configuration */
  setConfig: (config: RidlyMobileConfig) => void;

  /** Set the adapter instance */
  setAdapter: (adapter: ECommerceAdapter) => void;

  /** Set store config */
  setStoreConfig: (storeConfig: StoreConfig) => void;

  /** Initialize the SDK with config and adapter */
  initialize: (config: RidlyMobileConfig, adapter: ECommerceAdapter) => Promise<void>;

  /** Reset the store */
  reset: () => void;
}

const initialState = {
  config: null,
  adapter: null,
  storeConfig: null,
  isInitialized: false,
  isInitializing: false,
  initError: null,
};

/**
 * Config Store
 *
 * Central store for SDK configuration and adapter management.
 *
 * @example
 * ```tsx
 * // In your app initialization
 * import { useConfigStore } from '@ridly/mobile-core';
 * import { MagentoAdapter } from '@ridly/mobile-adapter-magento';
 * import config from '../ridly.mobile.config.json';
 *
 * const adapter = new MagentoAdapter({ storeUrl: config.store.url });
 * await useConfigStore.getState().initialize(config, adapter);
 *
 * // In components
 * const { config, adapter, isInitialized } = useConfigStore();
 * ```
 */
export const useConfigStore = create<ConfigState>((set, get) => ({
  ...initialState,

  setConfig: (config) => {
    set({ config });
  },

  setAdapter: (adapter) => {
    set({ adapter });
  },

  setStoreConfig: (storeConfig) => {
    set({ storeConfig });
  },

  initialize: async (config, adapter) => {
    const { isInitializing, isInitialized } = get();

    if (isInitializing || isInitialized) {
      return;
    }

    set({ isInitializing: true, initError: null });

    try {
      // Fetch store config from adapter
      const storeConfig = await adapter.getStoreConfig();

      set({
        config,
        adapter,
        storeConfig,
        isInitialized: true,
        isInitializing: false,
      });
    } catch (error) {
      set({
        initError: error instanceof Error ? error : new Error('Initialization failed'),
        isInitializing: false,
      });
      throw error;
    }
  },

  reset: () => {
    set(initialState);
  },
}));

/**
 * Get the adapter instance (throws if not initialized)
 */
export function getAdapter(): ECommerceAdapter {
  const adapter = useConfigStore.getState().adapter;
  if (!adapter) {
    throw new Error('SDK not initialized. Call initialize() first.');
  }
  return adapter;
}

/**
 * Get the config (throws if not initialized)
 */
export function getConfig(): RidlyMobileConfig {
  const config = useConfigStore.getState().config;
  if (!config) {
    throw new Error('SDK not initialized. Call initialize() first.');
  }
  return config;
}
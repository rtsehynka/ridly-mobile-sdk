/**
 * RIDLY Mobile SDK - useConfig Hook
 *
 * Hook to access the SDK configuration.
 */

import { useConfigStore } from '../stores/configStore';
import type { RidlyMobileConfig, StoreConfig } from '../types';

export interface UseConfigReturn {
  /** The SDK configuration */
  config: RidlyMobileConfig | null;

  /** Store configuration from the adapter */
  storeConfig: StoreConfig | null;

  /** Whether the SDK is initialized */
  isInitialized: boolean;

  /** Whether initialization is in progress */
  isInitializing: boolean;

  /** Initialization error if any */
  initError: Error | null;
}

/**
 * Hook to access SDK configuration
 *
 * @example
 * ```tsx
 * const { config, storeConfig, isInitialized } = useConfig();
 *
 * if (!isInitialized) {
 *   return <LoadingScreen />;
 * }
 *
 * return <Text>{config.app.name}</Text>;
 * ```
 */
export function useConfig(): UseConfigReturn {
  return useConfigStore((state) => ({
    config: state.config,
    storeConfig: state.storeConfig,
    isInitialized: state.isInitialized,
    isInitializing: state.isInitializing,
    initError: state.initError,
  }));
}

/**
 * Hook to access specific config sections
 */
export function useThemeConfig() {
  return useConfigStore((state) => state.config?.theme ?? null);
}

export function useFeaturesConfig() {
  return useConfigStore((state) => state.config?.features ?? null);
}

export function useLocalizationConfig() {
  return useConfigStore((state) => state.config?.localization ?? null);
}

export function useNavigationConfig() {
  return useConfigStore((state) => state.config?.navigation ?? null);
}

/**
 * RIDLY Mobile SDK - useAdapter Hook
 *
 * Hook to access the e-commerce adapter instance.
 */

import { useConfigStore } from '../stores/configStore';
import type { ECommerceAdapter } from '../types';

/**
 * Hook to access the adapter instance
 *
 * @throws Error if SDK is not initialized
 *
 * @example
 * ```tsx
 * const adapter = useAdapter();
 *
 * // Use adapter methods
 * const product = await adapter.getProduct('product-slug');
 * ```
 */
export function useAdapter(): ECommerceAdapter {
  const adapter = useConfigStore((state) => state.adapter);

  if (!adapter) {
    throw new Error('SDK not initialized. Wrap your app with RidlyProvider.');
  }

  return adapter;
}

/**
 * RIDLY Mobile SDK - useWishlist Hook
 *
 * Hook for wishlist functionality.
 */

import { useCallback } from 'react';
import { useWishlistStore } from '../stores/wishlistStore';
import type { WishlistItem, Product } from '../types';

export interface UseWishlistReturn {
  /** Wishlist items */
  items: WishlistItem[];

  /** Local wishlist for guests (product IDs) */
  localItems: string[];

  /** Total item count */
  itemCount: number;

  /** Whether wishlist is loading */
  isLoading: boolean;

  /** Wishlist error */
  error: Error | null;

  /** Fetch wishlist from server */
  fetchWishlist: () => Promise<void>;

  /** Add product to wishlist */
  addToWishlist: (productId: string) => Promise<void>;

  /** Remove product from wishlist */
  removeFromWishlist: (itemId: string) => Promise<void>;

  /** Move item to cart */
  moveToCart: (itemId: string) => Promise<void>;

  /** Check if product is in wishlist */
  isInWishlist: (productId: string) => boolean;

  /** Toggle wishlist status */
  toggleWishlist: (productId: string, product?: Product) => Promise<void>;

  /** Clear error */
  clearError: () => void;

  /** Sync local wishlist to server after login */
  syncWishlist: () => Promise<void>;
}

/**
 * Hook for wishlist
 *
 * @example
 * ```tsx
 * const {
 *   items,
 *   isLoading,
 *   addToWishlist,
 *   removeFromWishlist,
 *   isInWishlist,
 *   toggleWishlist,
 * } = useWishlist();
 *
 * // Toggle wishlist on product card
 * <WishlistButton
 *   isActive={isInWishlist(product.id)}
 *   onPress={() => toggleWishlist(product.id)}
 * />
 *
 * // Display wishlist
 * return (
 *   <FlatList
 *     data={items}
 *     renderItem={({ item }) => (
 *       <ProductCard
 *         product={item.product}
 *         onRemove={() => removeFromWishlist(item.id)}
 *       />
 *     )}
 *   />
 * );
 * ```
 */
export function useWishlist(): UseWishlistReturn {
  const {
    items,
    localWishlist,
    isLoading,
    error,
    fetchWishlist,
    addToWishlist: storeAdd,
    removeFromWishlist: storeRemove,
    moveToCart: storeMove,
    isInWishlist: storeIsIn,
    toggleWishlist: storeToggle,
    clearError,
    syncWishlist,
  } = useWishlistStore();

  const addToWishlist = useCallback(
    async (productId: string) => {
      await storeAdd(productId);
    },
    [storeAdd]
  );

  const removeFromWishlist = useCallback(
    async (itemId: string) => {
      await storeRemove(itemId);
    },
    [storeRemove]
  );

  const moveToCart = useCallback(
    async (itemId: string) => {
      await storeMove(itemId);
    },
    [storeMove]
  );

  const toggleWishlist = useCallback(
    async (productId: string, product?: Product) => {
      await storeToggle(productId, product);
    },
    [storeToggle]
  );

  const itemCount = items.length + localWishlist.length;

  return {
    items,
    localItems: localWishlist,
    itemCount,
    isLoading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    isInWishlist: storeIsIn,
    toggleWishlist,
    clearError,
    syncWishlist,
  };
}

/**
 * Hook to get wishlist item count
 *
 * @example
 * ```tsx
 * const count = useWishlistItemCount();
 *
 * return <Badge count={count} />;
 * ```
 */
export function useWishlistItemCount(): number {
  return useWishlistStore((state) => state.items.length + state.localWishlist.length);
}

/**
 * Hook to check if a specific product is in wishlist
 *
 * @example
 * ```tsx
 * const isFavorited = useIsInWishlist(productId);
 *
 * return <HeartIcon filled={isFavorited} />;
 * ```
 */
export function useIsInWishlist(productId: string): boolean {
  return useWishlistStore((state) => state.isInWishlist(productId));
}

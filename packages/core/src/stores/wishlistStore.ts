/**
 * RIDLY Mobile SDK - Wishlist Store
 *
 * Zustand store for managing wishlist state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WishlistItem, Product } from '../types';
import { getAdapter } from './configStore';
import { useAuthStore } from './authStore';

export interface WishlistState {
  /** Wishlist items */
  items: WishlistItem[];

  /** Local wishlist for guests (product IDs) */
  localWishlist: string[];

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
 * Wishlist Store
 *
 * Manages wishlist state with persistence.
 * Supports both authenticated (server-side) and guest (local) wishlists.
 *
 * @example
 * ```tsx
 * const { items, addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
 *
 * // Add to wishlist
 * await addToWishlist('product-id');
 *
 * // Check if in wishlist
 * const isFavorited = isInWishlist('product-id');
 *
 * // Toggle wishlist
 * await toggleWishlist('product-id');
 * ```
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      localWishlist: [],
      isLoading: false,
      error: null,

      fetchWishlist: async () => {
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) {
          // For guests, we only have local wishlist
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const adapter = getAdapter();
          const items = await adapter.getWishlist();
          set({ items, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Failed to fetch wishlist'),
            isLoading: false,
          });
        }
      },

      addToWishlist: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) {
          // Add to local wishlist for guests
          set((state) => ({
            localWishlist: [...new Set([...state.localWishlist, productId])],
          }));
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const adapter = getAdapter();
          await adapter.addToWishlist(productId);

          // Refresh wishlist
          const items = await adapter.getWishlist();
          set({ items, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Failed to add to wishlist'),
            isLoading: false,
          });
          throw error;
        }
      },

      removeFromWishlist: async (itemId) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) {
          // Remove from local wishlist for guests
          set((state) => ({
            localWishlist: state.localWishlist.filter((id) => id !== itemId),
          }));
          return;
        }

        set({ isLoading: true, error: null });

        // Optimistic update
        const { items } = get();
        set({
          items: items.filter((item) => item.id !== itemId),
        });

        try {
          const adapter = getAdapter();
          await adapter.removeFromWishlist(itemId);
          set({ isLoading: false });
        } catch (error) {
          // Revert optimistic update
          set({
            items,
            error: error instanceof Error ? error : new Error('Failed to remove from wishlist'),
            isLoading: false,
          });
          throw error;
        }
      },

      moveToCart: async (itemId) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) {
          throw new Error('Must be logged in to move items to cart');
        }

        set({ isLoading: true, error: null });

        try {
          const adapter = getAdapter();
          await adapter.moveWishlistItemToCart(itemId);

          // Refresh wishlist
          const items = await adapter.getWishlist();
          set({ items, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Failed to move item to cart'),
            isLoading: false,
          });
          throw error;
        }
      },

      isInWishlist: (productId) => {
        const { isAuthenticated } = useAuthStore.getState();
        const { items, localWishlist } = get();

        if (!isAuthenticated) {
          return localWishlist.includes(productId);
        }

        return items.some((item) => item.product.id === productId);
      },

      toggleWishlist: async (productId, _product) => {
        const { isInWishlist, addToWishlist, removeFromWishlist, items } = get();
        const { isAuthenticated } = useAuthStore.getState();

        if (isInWishlist(productId)) {
          if (isAuthenticated) {
            // Find item ID for authenticated users
            const item = items.find((i) => i.product.id === productId);
            if (item) {
              await removeFromWishlist(item.id);
            }
          } else {
            await removeFromWishlist(productId);
          }
        } else {
          await addToWishlist(productId);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      syncWishlist: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        const { localWishlist } = get();

        if (!isAuthenticated || localWishlist.length === 0) {
          return;
        }

        set({ isLoading: true });

        try {
          const adapter = getAdapter();

          // Add all local wishlist items to server
          for (const productId of localWishlist) {
            try {
              await adapter.addToWishlist(productId);
            } catch {
              // Ignore individual failures
            }
          }

          // Clear local wishlist and fetch server wishlist
          const items = await adapter.getWishlist();
          set({ items, localWishlist: [], isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Failed to sync wishlist'),
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'ridly-wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        localWishlist: state.localWishlist,
      }),
    }
  )
);
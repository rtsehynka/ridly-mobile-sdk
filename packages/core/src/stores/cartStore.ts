/**
 * RIDLY Mobile SDK - Cart Store
 *
 * Zustand store for managing shopping cart state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Cart, CartItem, AddToCartInput } from '../types';
import { getAdapter } from './configStore';

export interface CartState {
  /** Current cart */
  cart: Cart | null;

  /** Cart ID for persistence */
  cartId: string | null;

  /** Whether cart is loading */
  isLoading: boolean;

  /** Cart operation error */
  error: Error | null;

  /** Cart items count */
  itemCount: number;

  /** Set cart */
  setCart: (cart: Cart | null) => void;

  /** Fetch current cart from server */
  fetchCart: () => Promise<void>;

  /** Add item to cart */
  addItem: (input: AddToCartInput) => Promise<void>;

  /** Update item quantity */
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;

  /** Remove item from cart */
  removeItem: (itemId: string) => Promise<void>;

  /** Apply coupon code */
  applyCoupon: (code: string) => Promise<void>;

  /** Remove applied coupon */
  removeCoupon: (code: string) => Promise<void>;

  /** Clear the cart */
  clearCart: () => Promise<void>;

  /** Clear error */
  clearError: () => void;

  /** Restore cart from storage */
  restoreCart: () => Promise<void>;
}

// Default empty cart structure for reference
// const emptyCart: Cart = {
//   id: '',
//   items: [],
//   itemCount: 0,
//   totals: {
//     subtotal: { amount: 0, currency: 'USD' },
//     grandTotal: { amount: 0, currency: 'USD' },
//   },
//   appliedCoupons: [],
//   isVirtual: false,
// };

/**
 * Cart Store
 *
 * Manages shopping cart state with persistence.
 *
 * @example
 * ```tsx
 * const { cart, addItem, removeItem, itemCount } = useCartStore();
 *
 * // Add item
 * await addItem({ productId: 'SKU123', quantity: 2 });
 *
 * // Update quantity
 * await updateItemQuantity('item-id', 3);
 *
 * // Remove item
 * await removeItem('item-id');
 *
 * // Apply coupon
 * await applyCoupon('SAVE10');
 * ```
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      cartId: null,
      isLoading: false,
      error: null,
      itemCount: 0,

      setCart: (cart) => {
        set({
          cart,
          cartId: cart?.id || null,
          itemCount: cart?.itemCount || 0,
        });
      },

      fetchCart: async () => {
        set({ isLoading: true, error: null });

        try {
          const adapter = getAdapter();

          // Restore cart ID to adapter if we have one
          const { cartId } = get();
          if (cartId && 'setCartId' in adapter && typeof adapter.setCartId === 'function') {
            (adapter as any).setCartId(cartId);
          }

          const cart = await adapter.getCart();
          set({
            cart,
            cartId: cart.id,
            itemCount: cart.itemCount,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Failed to fetch cart'),
            isLoading: false,
          });
        }
      },

      addItem: async (input) => {
        set({ isLoading: true, error: null });

        try {
          const adapter = getAdapter();

          // Ensure cart ID is set
          const { cartId } = get();
          if (cartId && 'setCartId' in adapter && typeof adapter.setCartId === 'function') {
            (adapter as any).setCartId(cartId);
          }

          const cart = await adapter.addToCart(input);
          set({
            cart,
            cartId: cart.id,
            itemCount: cart.itemCount,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Failed to add item to cart'),
            isLoading: false,
          });
          throw error;
        }
      },

      updateItemQuantity: async (itemId, quantity) => {
        set({ isLoading: true, error: null });

        // Optimistic update
        const { cart } = get();
        if (cart) {
          const updatedItems = cart.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
          set({
            cart: { ...cart, items: updatedItems },
          });
        }

        try {
          const adapter = getAdapter();
          const updatedCart = await adapter.updateCartItem(itemId, quantity);
          set({
            cart: updatedCart,
            itemCount: updatedCart.itemCount,
            isLoading: false,
          });
        } catch (error) {
          // Revert optimistic update
          set({
            cart,
            error: error instanceof Error ? error : new Error('Failed to update item'),
            isLoading: false,
          });
          throw error;
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true, error: null });

        // Optimistic update
        const { cart } = get();
        if (cart) {
          const updatedItems = cart.items.filter((item) => item.id !== itemId);
          set({
            cart: {
              ...cart,
              items: updatedItems,
              itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            },
          });
        }

        try {
          const adapter = getAdapter();
          const updatedCart = await adapter.removeCartItem(itemId);
          set({
            cart: updatedCart,
            itemCount: updatedCart.itemCount,
            isLoading: false,
          });
        } catch (error) {
          // Revert optimistic update
          set({
            cart,
            error: error instanceof Error ? error : new Error('Failed to remove item'),
            isLoading: false,
          });
          throw error;
        }
      },

      applyCoupon: async (code) => {
        set({ isLoading: true, error: null });

        try {
          const adapter = getAdapter();
          const cart = await adapter.applyCoupon(code);
          set({
            cart,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Failed to apply coupon'),
            isLoading: false,
          });
          throw error;
        }
      },

      removeCoupon: async (code) => {
        set({ isLoading: true, error: null });

        try {
          const adapter = getAdapter();
          const cart = await adapter.removeCoupon(code);
          set({
            cart,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Failed to remove coupon'),
            isLoading: false,
          });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });

        try {
          const adapter = getAdapter();
          const cart = await adapter.clearCart();
          set({
            cart,
            cartId: cart.id,
            itemCount: 0,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Failed to clear cart'),
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      restoreCart: async () => {
        const { cartId } = get();
        if (!cartId) return;

        await get().fetchCart();
      },
    }),
    {
      name: 'ridly-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cartId: state.cartId,
      }),
    }
  )
);

/**
 * Helper to check if a product is in the cart
 */
export function isInCart(productId: string): boolean {
  const cart = useCartStore.getState().cart;
  return cart?.items.some((item) => item.productId === productId) || false;
}

/**
 * Helper to get cart item by product ID
 */
export function getCartItem(productId: string): CartItem | undefined {
  const cart = useCartStore.getState().cart;
  return cart?.items.find((item) => item.productId === productId);
}
/**
 * RIDLY Mobile SDK - useCart Hook
 *
 * Hook for shopping cart functionality.
 */

import { useCallback, useMemo } from 'react';
import { useCartStore, isInCart, getCartItem } from '../stores/cartStore';
import type { Cart, CartItem, AddToCartInput } from '../types';

export interface UseCartReturn {
  /** Current cart */
  cart: Cart | null;

  /** Cart items */
  items: CartItem[];

  /** Total item count */
  itemCount: number;

  /** Whether cart is loading */
  isLoading: boolean;

  /** Cart error */
  error: Error | null;

  /** Whether cart is empty */
  isEmpty: boolean;

  /** Subtotal amount */
  subtotal: number;

  /** Grand total amount */
  grandTotal: number;

  /** Currency code */
  currency: string;

  /** Fetch cart from server */
  fetchCart: () => Promise<void>;

  /** Add item to cart */
  addItem: (input: AddToCartInput) => Promise<void>;

  /** Update item quantity */
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;

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

  /** Check if product is in cart */
  isInCart: (productId: string) => boolean;

  /** Get cart item by product ID */
  getItem: (productId: string) => CartItem | undefined;
}

/**
 * Hook for shopping cart
 *
 * @example
 * ```tsx
 * const {
 *   cart,
 *   items,
 *   itemCount,
 *   isLoading,
 *   addItem,
 *   removeItem,
 *   updateQuantity,
 *   grandTotal,
 *   currency,
 * } = useCart();
 *
 * // Add to cart
 * await addItem({ productId: 'SKU123', quantity: 1 });
 *
 * // Update quantity
 * await updateQuantity('item-id', 2);
 *
 * // Remove item
 * await removeItem('item-id');
 *
 * return (
 *   <View>
 *     <Text>Cart ({itemCount})</Text>
 *     {items.map(item => (
 *       <CartItemCard key={item.id} item={item} />
 *     ))}
 *     <Text>Total: {currency} {grandTotal}</Text>
 *   </View>
 * );
 * ```
 */
export function useCart(): UseCartReturn {
  const {
    cart,
    isLoading,
    error,
    fetchCart,
    addItem: storeAddItem,
    updateItemQuantity,
    removeItem: storeRemoveItem,
    applyCoupon: storeApplyCoupon,
    removeCoupon: storeRemoveCoupon,
    clearCart: storeClearCart,
    clearError,
  } = useCartStore();

  const items = useMemo(() => cart?.items ?? [], [cart?.items]);
  const itemCount = cart?.itemCount ?? 0;
  const isEmpty = itemCount === 0;

  const subtotal = cart?.totals.subtotal.amount ?? 0;
  const grandTotal = cart?.totals.grandTotal.amount ?? 0;
  const currency = cart?.totals.grandTotal.currency ?? 'USD';

  const addItem = useCallback(
    async (input: AddToCartInput) => {
      await storeAddItem(input);
    },
    [storeAddItem]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      await updateItemQuantity(itemId, quantity);
    },
    [updateItemQuantity]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      await storeRemoveItem(itemId);
    },
    [storeRemoveItem]
  );

  const applyCoupon = useCallback(
    async (code: string) => {
      await storeApplyCoupon(code);
    },
    [storeApplyCoupon]
  );

  const removeCoupon = useCallback(
    async (code: string) => {
      await storeRemoveCoupon(code);
    },
    [storeRemoveCoupon]
  );

  const clearCartHandler = useCallback(async () => {
    await storeClearCart();
  }, [storeClearCart]);

  const checkIsInCart = useCallback((productId: string) => isInCart(productId), []);

  const getItem = useCallback((productId: string) => getCartItem(productId), []);

  return {
    cart,
    items,
    itemCount,
    isLoading,
    error,
    isEmpty,
    subtotal,
    grandTotal,
    currency,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    clearCart: clearCartHandler,
    clearError,
    isInCart: checkIsInCart,
    getItem,
  };
}

/**
 * Hook to get cart item count
 *
 * @example
 * ```tsx
 * const count = useCartItemCount();
 *
 * return <Badge count={count} />;
 * ```
 */
export function useCartItemCount(): number {
  return useCartStore((state) => state.itemCount);
}

/**
 * Hook to check if cart is empty
 */
export function useIsCartEmpty(): boolean {
  return useCartStore((state) => state.itemCount === 0);
}

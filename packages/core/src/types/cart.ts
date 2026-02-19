/**
 * Cart types for RIDLY Mobile SDK
 */

import type { Money, Image } from './common';

/**
 * Cart item in shopping cart
 */
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  image: Image;
  price: Money;
  quantity: number;
  total: Money;
  options?: Record<string, string>; // Selected options for configurable products
  customOptions?: CartItemCustomOption[];
}

/**
 * Custom option on cart item
 */
export interface CartItemCustomOption {
  id: string;
  label: string;
  value: string;
}

/**
 * Cart totals breakdown
 */
export interface CartTotals {
  subtotal: Money;
  discount?: Money;
  shipping?: Money;
  tax?: Money;
  grandTotal: Money;
}

/**
 * Applied coupon/discount
 */
export interface AppliedCoupon {
  code: string;
  discount: Money;
  label?: string;
}

/**
 * Shopping cart
 */
export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  totals: CartTotals;
  appliedCoupons: AppliedCoupon[];
  isVirtual: boolean; // true if all items are virtual (no shipping needed)
}

/**
 * Add to cart input
 */
export interface AddToCartInput {
  productId: string;
  quantity: number;
  options?: Record<string, string>;
  customOptions?: { id: string; value: string }[];
}

/**
 * Cart Item Mapper
 *
 * Transforms unified CartItem type to cart display props.
 * Platform-agnostic - works with Magento, Shopware, WooCommerce.
 */

import type { CartItem, Money } from '@ridly/mobile-core';

/**
 * Data structure for cart item display
 */
export interface CartItemDisplayData {
  id: string;
  productId: string;
  name: string;
  image: string | null;
  price: string;
  originalPrice?: string;
  quantity: number;
  maxQuantity: number;
  subtotal: string;
  options: CartItemOption[];
  isOnSale: boolean;
  inStock: boolean;
  lowStock: boolean;
  sku?: string;
}

/**
 * Cart item option (size, color, etc.)
 */
export interface CartItemOption {
  label: string;
  value: string;
}

/**
 * Map a CartItem to display data
 */
export function mapCartItemToDisplay(item: CartItem): CartItemDisplayData {
  const hasDiscount = item.originalPrice && item.originalPrice.amount > item.price.amount;

  // Extract selected options
  const options: CartItemOption[] = [];
  if (item.options) {
    for (const [key, value] of Object.entries(item.options)) {
      options.push({
        label: formatOptionLabel(key),
        value: String(value),
      });
    }
  }

  return {
    id: item.id,
    productId: item.productId,
    name: item.name,
    image: item.image?.url || null,
    price: formatMoney(item.price),
    originalPrice: hasDiscount ? formatMoney(item.originalPrice!) : undefined,
    quantity: item.quantity,
    maxQuantity: 99,
    subtotal: formatMoney(item.total),
    options,
    isOnSale: hasDiscount,
    inStock: true,
    lowStock: false,
    sku: item.sku,
  };
}

/**
 * Format money for display
 */
function formatMoney(money?: Money | null): string {
  if (!money) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currency || 'USD',
  }).format(money.amount);
}

/**
 * Format option label (e.g., "selected_color" → "Color")
 */
function formatOptionLabel(key: string): string {
  return key
    .replace(/^selected_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Calculate cart summary from items
 */
export function calculateCartSummary(items: CartItem[]): {
  itemCount: number;
  subtotal: string;
  savings: string | null;
} {
  let totalItems = 0;
  let subtotalAmount = 0;
  let savingsAmount = 0;
  let currency = 'USD';

  for (const item of items) {
    totalItems += item.quantity;
    currency = item.price.currency || currency;
    subtotalAmount += item.price.amount * item.quantity;

    if (item.originalPrice) {
      savingsAmount += (item.originalPrice.amount - item.price.amount) * item.quantity;
    }
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  return {
    itemCount: totalItems,
    subtotal: formatter.format(subtotalAmount),
    savings: savingsAmount > 0 ? formatter.format(savingsAmount) : null,
  };
}

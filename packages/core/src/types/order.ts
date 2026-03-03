/**
 * Order types for RIDLY Mobile SDK
 */

import type { Money, Image } from './common';
import type { Address } from './customer';

/**
 * Order item
 */
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  image?: Image;
  price: Money;
  quantity: number;
  total: Money;
  options?: Record<string, string>;
}

/**
 * Order status
 */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'complete'
  | 'canceled'
  | 'refunded'
  | 'on_hold';

/**
 * Shipment tracking info
 */
export interface ShipmentTracking {
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
}

/**
 * Order totals
 */
export interface OrderTotals {
  subtotal: Money;
  discount?: Money;
  shipping?: Money;
  tax?: Money;
  grandTotal: Money;
}

/**
 * Order entity
 */
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel?: string;
  items: OrderItem[];
  totals: OrderTotals;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethod?: string;
  shippingMethodLabel?: string;
  paymentMethod?: string;
  paymentMethodLabel?: string;
  createdAt: string;
  updatedAt: string;
  tracking?: ShipmentTracking[];
  comments?: OrderComment[];
}

/**
 * Order comment/note
 */
export interface OrderComment {
  id?: string;
  message: string;
  createdAt: string;
  isCustomerNotified?: boolean;
}

/**
 * Place order result
 */
export interface PlaceOrderResult {
  orderId: string;
  orderNumber: string;
  redirectUrl?: string; // For payment gateways that need redirect
}

/**
 * Order Mapper
 *
 * Transforms unified Order type to order list display props.
 * Platform-agnostic - works with Magento, Shopware, WooCommerce.
 */

import type { Order, OrderStatus, Money } from '@ridly/mobile-core';

/**
 * Data structure for order list item
 */
export interface OrderListItemData {
  id: string;
  orderNumber: string;
  date: string;
  formattedDate: string;
  status: OrderStatus;
  statusLabel: string;
  statusColor: string;
  total: string;
  itemCount: number;
  thumbnailUrl: string | null;
  canCancel: boolean;
  canReturn: boolean;
  canReorder: boolean;
}

/**
 * Status display configuration
 */
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#C05621' },
  processing: { label: 'Processing', color: '#2F855A' },
  shipped: { label: 'Shipped', color: '#3B82F6' },
  delivered: { label: 'Delivered', color: '#2F855A' },
  complete: { label: 'Completed', color: '#2F855A' },
  canceled: { label: 'Cancelled', color: '#C53030' },
  refunded: { label: 'Refunded', color: '#6B6B6B' },
  on_hold: { label: 'On Hold', color: '#C05621' },
};

/**
 * Map an Order to list item display data
 */
export function mapOrderToListItem(order: Order): OrderListItemData {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  // Get first product image as thumbnail
  const thumbnailUrl = order.items?.[0]?.image?.url || null;

  // Calculate item count
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Determine available actions
  const canCancel = ['pending', 'processing'].includes(order.status);
  const canReturn = ['delivered', 'complete'].includes(order.status);
  const canReorder = ['delivered', 'complete', 'canceled'].includes(order.status);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    date: order.createdAt,
    formattedDate: formatOrderDate(order.createdAt),
    status: order.status,
    statusLabel: statusConfig.label,
    statusColor: statusConfig.color,
    total: formatMoney(order.totals?.grandTotal),
    itemCount,
    thumbnailUrl,
    canCancel,
    canReturn,
    canReorder,
  };
}

/**
 * Format order date for display
 */
function formatOrderDate(dateString: string): string {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format money amount
 */
function formatMoney(money?: Money | null, currency: string = 'USD'): string {
  if (!money) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currency || currency,
  }).format(money.amount);
}

/**
 * Group orders by status for tabs/sections
 */
export function groupOrdersByStatus(orders: Order[]): Record<string, OrderListItemData[]> {
  const groups: Record<string, OrderListItemData[]> = {
    active: [],
    completed: [],
    cancelled: [],
  };

  for (const order of orders) {
    const mappedOrder = mapOrderToListItem(order);

    if (['canceled', 'refunded'].includes(order.status)) {
      groups.cancelled.push(mappedOrder);
    } else if (['delivered', 'complete'].includes(order.status)) {
      groups.completed.push(mappedOrder);
    } else {
      groups.active.push(mappedOrder);
    }
  }

  return groups;
}

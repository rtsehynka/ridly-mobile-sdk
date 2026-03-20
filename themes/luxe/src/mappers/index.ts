/**
 * RIDLY Luxe Theme - Data Mappers
 *
 * Platform-agnostic data transformation functions.
 * These mappers convert unified types to component props,
 * ensuring the theme works with any backend (Magento, Shopware, WooCommerce).
 */

export { mapProductToCard, type ProductCardData } from './productCard';
export { mapCategoryToItem, type CategoryItemData } from './category';
export { mapOrderToListItem, type OrderListItemData } from './order';
export { mapCartItemToDisplay, type CartItemDisplayData } from './cartItem';

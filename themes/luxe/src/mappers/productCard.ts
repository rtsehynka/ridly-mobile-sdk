/**
 * Product Card Mapper
 *
 * Transforms unified Product type to ProductCard component props.
 * Platform-agnostic - works with Magento, Shopware, WooCommerce.
 */

import type { Product, Money } from '@ridly/mobile-core';

/**
 * Data structure for ProductCard component
 */
export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: string;
  originalPrice?: string;
  discount?: number;
  isOnSale: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
  rating?: number;
  reviewCount?: number;
  colors?: string[];
  sizes?: string[];
}

/**
 * Map a Product to ProductCard display data
 */
export function mapProductToCard(product: Product, options?: {
  isFavorite?: boolean;
  showColors?: boolean;
  showSizes?: boolean;
}): ProductCardData {
  const { isFavorite = false, showColors = true, showSizes = true } = options || {};

  // Extract color options if available
  const colors = showColors && product.options
    ? extractColorOptions(product.options)
    : undefined;

  // Extract size options if available
  const sizes = showSizes && product.options
    ? extractSizeOptions(product.options)
    : undefined;

  // Check if product is on sale (has special price lower than regular price)
  const isOnSale = !!(product.specialPrice && product.specialPrice.amount < product.price.amount);

  // Calculate discount percentage
  const discount = isOnSale
    ? Math.round((1 - product.specialPrice!.amount / product.price.amount) * 100)
    : undefined;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: product.images?.[0]?.url || null,
    price: formatMoney(isOnSale ? product.specialPrice! : product.price),
    originalPrice: isOnSale ? formatMoney(product.price) : undefined,
    discount,
    isOnSale,
    isNew: isNewProduct(product),
    isFavorite,
    rating: product.rating,
    reviewCount: product.reviewCount,
    colors,
    sizes,
  };
}

/**
 * Format money for display
 */
function formatMoney(money: Money): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currency || 'USD',
  }).format(money.amount);
}

/**
 * Extract color options from product
 */
function extractColorOptions(options: Product['options']): string[] | undefined {
  if (!options) return undefined;

  const colorOption = options.find(opt =>
    opt.label.toLowerCase().includes('color') ||
    opt.label.toLowerCase().includes('colour')
  );

  if (!colorOption?.values) return undefined;

  // Return color hex values or labels
  return colorOption.values.slice(0, 5).map(v => v.swatch || v.label);
}

/**
 * Extract size options from product
 */
function extractSizeOptions(options: Product['options']): string[] | undefined {
  if (!options) return undefined;

  const sizeOption = options.find(opt =>
    opt.label.toLowerCase().includes('size')
  );

  if (!sizeOption?.values) return undefined;

  return sizeOption.values.slice(0, 6).map(v => v.label);
}

/**
 * Check if product is considered "new" (within last 30 days)
 */
function isNewProduct(product: Product): boolean {
  if (!product.createdAt) return false;

  const createdDate = new Date(product.createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return createdDate > thirtyDaysAgo;
}

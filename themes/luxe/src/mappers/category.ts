/**
 * Category Mapper
 *
 * Transforms unified Category type to category display props.
 * Platform-agnostic - works with Magento, Shopware, WooCommerce.
 */

import type { Category } from '@ridly/mobile-core';

/**
 * Data structure for category display
 */
export interface CategoryItemData {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  icon: string;
  productCount?: number;
  children?: CategoryItemData[];
}

/**
 * Icon mapping for common category names
 */
const CATEGORY_ICONS: Record<string, string> = {
  // Clothing
  'women': 'woman-outline',
  'men': 'man-outline',
  'kids': 'people-outline',
  'clothing': 'shirt-outline',
  'dresses': 'shirt-outline',
  'tops': 'shirt-outline',
  'pants': 'reorder-four-outline',
  'jeans': 'reorder-four-outline',
  'jackets': 'cloudy-outline',
  'coats': 'cloudy-outline',

  // Accessories
  'accessories': 'diamond-outline',
  'bags': 'bag-handle-outline',
  'shoes': 'footsteps-outline',
  'jewelry': 'diamond-outline',
  'watches': 'watch-outline',
  'sunglasses': 'glasses-outline',
  'hats': 'baseball-outline',
  'belts': 'remove-outline',

  // Beauty
  'beauty': 'sparkles-outline',
  'makeup': 'color-palette-outline',
  'skincare': 'water-outline',
  'fragrance': 'flask-outline',
  'haircare': 'cut-outline',

  // Home
  'home': 'home-outline',
  'furniture': 'bed-outline',
  'decor': 'flower-outline',
  'kitchen': 'restaurant-outline',
  'bedding': 'bed-outline',

  // Electronics
  'electronics': 'phone-portrait-outline',
  'phones': 'phone-portrait-outline',
  'laptops': 'laptop-outline',
  'tablets': 'tablet-landscape-outline',
  'audio': 'headset-outline',

  // Sports
  'sports': 'fitness-outline',
  'activewear': 'body-outline',
  'yoga': 'body-outline',
  'running': 'walk-outline',

  // Sale
  'sale': 'pricetag-outline',
  'new': 'star-outline',
  'bestsellers': 'trophy-outline',
};

/**
 * Get icon for category based on name
 */
function getCategoryIcon(name: string): string {
  const normalizedName = name.toLowerCase().trim();

  // Check for exact match
  if (CATEGORY_ICONS[normalizedName]) {
    return CATEGORY_ICONS[normalizedName];
  }

  // Check for partial match
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return icon;
    }
  }

  // Default icon
  return 'grid-outline';
}

/**
 * Map a Category to display data
 */
export function mapCategoryToItem(
  category: Category,
  options?: { includeChildren?: boolean; maxChildren?: number }
): CategoryItemData {
  const { includeChildren = false, maxChildren = 5 } = options || {};

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image?.url || null,
    icon: getCategoryIcon(category.name),
    productCount: category.productCount,
    children: includeChildren && category.children
      ? category.children
          .slice(0, maxChildren)
          .map(child => mapCategoryToItem(child, { includeChildren: false }))
      : undefined,
  };
}

/**
 * Map multiple categories for horizontal scroller
 */
export function mapCategoriesToScroller(
  categories: Category[],
  limit: number = 8
): CategoryItemData[] {
  return categories
    .slice(0, limit)
    .map(cat => mapCategoryToItem(cat, { includeChildren: false }));
}

/**
 * Product types for RIDLY Mobile SDK
 */

import type { Money, Image, FilterOption, SortOption, PaginatedResult } from './common';

/**
 * Product type enumeration
 */
export type ProductType = 'simple' | 'configurable' | 'grouped' | 'bundle' | 'virtual';

/**
 * Category reference in product
 */
export interface CategoryReference {
  id: string;
  name: string;
  slug?: string;
}

/**
 * Product attribute (e.g., brand, material)
 */
export interface ProductAttribute {
  code: string;
  label: string;
  value: string;
}

/**
 * Product option (e.g., Size, Color for configurable products)
 */
export interface ProductOption {
  id: string;
  label: string;
  type: 'select' | 'swatch' | 'text';
  required: boolean;
  values: ProductOptionValue[];
}

/**
 * Product option value (e.g., "Red", "XL")
 */
export interface ProductOptionValue {
  id: string;
  label: string;
  swatch?: string; // hex color or image URL
  inStock: boolean;
  priceAdjustment?: Money;
}

/**
 * Product variant (concrete SKU for configurable products)
 */
export interface ProductVariant {
  id: string;
  sku: string;
  price: Money;
  specialPrice?: Money;
  options: Record<string, string>; // { "color": "red", "size": "xl" }
  inStock: boolean;
  stockQty?: number;
  image?: Image;
}

/**
 * Product meta information for SEO
 */
export interface ProductMeta {
  title?: string;
  description?: string;
  keywords?: string;
}

/**
 * Main Product interface
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: Money;
  specialPrice?: Money;
  images: Image[];
  thumbnail: Image;
  categories: CategoryReference[];
  attributes: ProductAttribute[];
  options: ProductOption[];
  variants: ProductVariant[];
  inStock: boolean;
  stockQty?: number;
  type: ProductType;
  rating?: number; // 0-5
  reviewCount?: number;
  relatedProductIds?: string[];
  upsellProductIds?: string[];
  crosssellProductIds?: string[];
  createdAt: string;
  updatedAt: string;
  meta?: ProductMeta;
}

/**
 * Product query parameters
 */
export interface ProductQuery {
  categoryId?: string;
  searchTerm?: string;
  filters?: FilterOption[];
  sort?: SortOption;
  page?: number;
  pageSize?: number;
  includeOutOfStock?: boolean;
}

/**
 * Product list result with filters
 */
export interface ProductListResult extends PaginatedResult<Product> {
  availableFilters?: import('./common').AvailableFilter[];
  availableSortOptions?: string[];
}

/**
 * Product review
 */
export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  title: string;
  content: string;
  rating: number; // 1-5
  createdAt: string;
  isVerifiedPurchase?: boolean;
}

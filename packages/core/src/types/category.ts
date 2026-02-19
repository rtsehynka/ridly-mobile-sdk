/**
 * Category types for RIDLY Mobile SDK
 */

import type { Image, AvailableFilter } from './common';

/**
 * Category entity
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: Image;
  parentId: string | null;
  children: Category[];
  productCount: number;
  level: number;
  position: number;
  isActive: boolean;
  includeInMenu: boolean;
  availableFilters?: AvailableFilter[];
  availableSortOptions?: string[];
  meta?: CategoryMeta;
}

/**
 * Category meta information for SEO
 */
export interface CategoryMeta {
  title?: string;
  description?: string;
  keywords?: string;
}

/**
 * Flat category reference (for breadcrumbs, etc.)
 */
export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
  level: number;
}

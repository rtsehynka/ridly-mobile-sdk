/**
 * Common types used across RIDLY Mobile SDK
 */

/**
 * Money representation with amount and currency
 */
export interface Money {
  amount: number;
  currency: string; // ISO 4217: "USD", "EUR", "GBP", etc.
}

/**
 * Image with URL and metadata
 */
export interface Image {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Sort option for queries
 */
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter option for queries
 */
export interface FilterOption {
  field: string;
  value: string | string[];
  condition?: 'eq' | 'in' | 'range' | 'like' | 'gt' | 'lt' | 'gte' | 'lte';
}

/**
 * Available filter definition from API
 */
export interface AvailableFilter {
  code: string;
  label: string;
  type: 'select' | 'range' | 'boolean' | 'swatch';
  options?: FilterOptionItem[];
  range?: { min: number; max: number };
}

export interface FilterOptionItem {
  value: string;
  label: string;
  count?: number;
  swatch?: string; // hex color or image URL for swatch type
}

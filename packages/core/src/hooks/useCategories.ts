/**
 * RIDLY Mobile SDK - useCategories Hook
 *
 * Hook for fetching category lists and trees.
 */

import { useQuery } from '@tanstack/react-query';
import { useAdapter } from './useAdapter';
import type { Category } from '../types';

export interface UseCategoriesOptions {
  /** Parent category ID to filter children */
  parentId?: string;

  /** Whether to enable the query */
  enabled?: boolean;
}

export interface UseCategoriesReturn {
  /** Category list */
  categories: Category[];

  /** Whether the query is loading */
  isLoading: boolean;

  /** Query error */
  error: Error | null;

  /** Refetch the query */
  refetch: () => void;
}

/**
 * Hook to fetch categories
 *
 * @example
 * ```tsx
 * // Fetch root categories
 * const { categories, isLoading } = useCategories();
 *
 * // Fetch children of a category
 * const { categories: children } = useCategories({ parentId: 'parent-id' });
 * ```
 */
export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const adapter = useAdapter();
  const { parentId, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categories', parentId ?? 'root'],
    queryFn: () => adapter.getCategories(parentId),
    enabled,
  });

  return {
    categories: data ?? [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to fetch full category tree
 *
 * @example
 * ```tsx
 * const { tree, isLoading } = useCategoryTree();
 *
 * // Render hierarchical menu
 * return <CategoryMenu categories={tree} />;
 * ```
 */
export function useCategoryTree(enabled = true) {
  const adapter = useAdapter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => adapter.getCategoryTree(),
    enabled,
  });

  return {
    tree: data ?? [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

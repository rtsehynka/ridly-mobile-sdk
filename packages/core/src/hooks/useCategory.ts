/**
 * RIDLY Mobile SDK - useCategory Hook
 *
 * Hook for fetching a single category by ID or slug.
 */

import { useQuery } from '@tanstack/react-query';
import { useAdapter } from './useAdapter';
import type { Category } from '../types';

export interface UseCategoryOptions {
  /** Whether to enable the query */
  enabled?: boolean;
}

export interface UseCategoryReturn {
  /** The category */
  category: Category | undefined;

  /** Whether the query is loading */
  isLoading: boolean;

  /** Query error */
  error: Error | null;

  /** Refetch the query */
  refetch: () => void;
}

/**
 * Hook to fetch a single category
 *
 * @param idOrSlug - Category ID or URL slug
 * @param options - Query options
 *
 * @example
 * ```tsx
 * const { category, isLoading, error } = useCategory('women');
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * if (!category) return <NotFound />;
 *
 * return (
 *   <View>
 *     <Text>{category.name}</Text>
 *     <Text>{category.productCount} products</Text>
 *   </View>
 * );
 * ```
 */
export function useCategory(
  idOrSlug: string,
  options: UseCategoryOptions = {}
): UseCategoryReturn {
  const adapter = useAdapter();
  const { enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['category', idOrSlug],
    queryFn: () => adapter.getCategory(idOrSlug),
    enabled: enabled && !!idOrSlug,
  });

  return {
    category: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

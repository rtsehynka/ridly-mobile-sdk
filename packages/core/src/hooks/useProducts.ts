/**
 * RIDLY Mobile SDK - useProducts Hook
 *
 * Hook for fetching paginated product lists with filters and sorting.
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useAdapter } from './useAdapter';
import type { ProductQuery, ProductListResult, FilterOption, SortOption } from '../types';

export interface UseProductsOptions {
  /** Category ID to filter by */
  categoryId?: string;

  /** Filter options */
  filters?: FilterOption[];

  /** Sort option */
  sort?: SortOption;

  /** Page size */
  pageSize?: number;

  /** Initial page */
  page?: number;

  /** Whether to enable the query */
  enabled?: boolean;
}

export interface UseProductsReturn {
  /** Product list result */
  data: ProductListResult | undefined;

  /** Whether the query is loading */
  isLoading: boolean;

  /** Whether the query is fetching (including background refetch) */
  isFetching: boolean;

  /** Query error */
  error: Error | null;

  /** Refetch the query */
  refetch: () => void;
}

/**
 * Hook to fetch paginated products
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useProducts({
 *   categoryId: 'category-123',
 *   pageSize: 20,
 *   sort: { field: 'price', direction: 'asc' },
 * });
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <ProductGrid products={data.items} />
 * );
 * ```
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const adapter = useAdapter();
  const { categoryId, filters, sort, pageSize = 20, page = 1, enabled = true } = options;

  const query: ProductQuery = {
    categoryId,
    filters,
    sort,
    pageSize,
    page,
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['products', query],
    queryFn: () => adapter.getProducts(query),
    enabled,
  });

  return {
    data,
    isLoading,
    isFetching,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook for infinite scrolling product lists
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteProducts({ categoryId: 'cat-123' });
 *
 * const products = data?.pages.flatMap(page => page.items) ?? [];
 *
 * return (
 *   <FlatList
 *     data={products}
 *     onEndReached={() => hasNextPage && fetchNextPage()}
 *   />
 * );
 * ```
 */
export function useInfiniteProducts(options: Omit<UseProductsOptions, 'page'> = {}) {
  const adapter = useAdapter();
  const { categoryId, filters, sort, pageSize = 20, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: ['products', 'infinite', { categoryId, filters, sort, pageSize }],
    queryFn: ({ pageParam = 1 }) =>
      adapter.getProducts({
        categoryId,
        filters,
        sort,
        pageSize,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled,
  });
}

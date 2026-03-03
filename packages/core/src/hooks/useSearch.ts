/**
 * RIDLY Mobile SDK - useSearch Hook
 *
 * Hooks for product search functionality.
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useAdapter } from './useAdapter';
import type { ProductListResult, FilterOption, SortOption, AvailableFilter } from '../types';

export interface UseSearchOptions {
  /** Initial search term */
  initialTerm?: string;

  /** Page size */
  pageSize?: number;

  /** Debounce delay in ms */
  debounceMs?: number;

  /** Minimum characters to trigger search */
  minChars?: number;
}

export interface UseSearchReturn {
  /** Current search term */
  term: string;

  /** Set search term */
  setTerm: (term: string) => void;

  /** Search results */
  results: ProductListResult | undefined;

  /** Whether the search is loading */
  isLoading: boolean;

  /** Whether the search is fetching */
  isFetching: boolean;

  /** Search error */
  error: Error | null;

  /** Applied filters */
  filters: FilterOption[];

  /** Set filters */
  setFilters: (filters: FilterOption[]) => void;

  /** Add a filter */
  addFilter: (filter: FilterOption) => void;

  /** Remove a filter */
  removeFilter: (field: string, value?: string) => void;

  /** Clear all filters */
  clearFilters: () => void;

  /** Sort option */
  sort: SortOption | undefined;

  /** Set sort option */
  setSort: (sort: SortOption | undefined) => void;

  /** Available filters from search results */
  availableFilters: AvailableFilter[];

  /** Clear search */
  clear: () => void;
}

/**
 * Hook for product search with filters and sorting
 *
 * @example
 * ```tsx
 * const {
 *   term,
 *   setTerm,
 *   results,
 *   isLoading,
 *   filters,
 *   addFilter,
 *   removeFilter,
 *   sort,
 *   setSort,
 * } = useSearch();
 *
 * return (
 *   <View>
 *     <SearchInput value={term} onChangeText={setTerm} />
 *     <FilterPanel
 *       available={results?.availableFilters}
 *       applied={filters}
 *       onAddFilter={addFilter}
 *       onRemoveFilter={removeFilter}
 *     />
 *     {isLoading ? <Loading /> : <ProductGrid products={results?.items} />}
 *   </View>
 * );
 * ```
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const adapter = useAdapter();
  const { initialTerm = '', pageSize = 20, minChars = 2 } = options;

  const [term, setTerm] = useState(initialTerm);
  const [filters, setFilters] = useState<FilterOption[]>([]);
  const [sort, setSort] = useState<SortOption | undefined>();

  const shouldSearch = term.length >= minChars;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['search', term, filters, sort, pageSize],
    queryFn: () => adapter.searchProducts(term, filters, sort, 1, pageSize),
    enabled: shouldSearch,
  });

  const addFilter = useCallback((filter: FilterOption) => {
    setFilters((prev) => {
      // Check if filter already exists
      const exists = prev.some((f) => f.field === filter.field && f.value === filter.value);
      if (exists) return prev;
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((field: string, value?: string) => {
    setFilters((prev) => {
      if (value) {
        return prev.filter((f) => !(f.field === field && f.value === value));
      }
      return prev.filter((f) => f.field !== field);
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const clear = useCallback(() => {
    setTerm('');
    setFilters([]);
    setSort(undefined);
  }, []);

  const availableFilters = useMemo(
    () => data?.availableFilters ?? [],
    [data?.availableFilters]
  );

  return {
    term,
    setTerm,
    results: data,
    isLoading: shouldSearch && isLoading,
    isFetching,
    error: error as Error | null,
    filters,
    setFilters,
    addFilter,
    removeFilter,
    clearFilters,
    sort,
    setSort,
    availableFilters,
    clear,
  };
}

/**
 * Hook for infinite scrolling search results
 */
export function useInfiniteSearch(term: string, filters?: FilterOption[], sort?: SortOption) {
  const adapter = useAdapter();
  const pageSize = 20;

  return useInfiniteQuery({
    queryKey: ['search', 'infinite', term, filters, sort],
    queryFn: ({ pageParam = 1 }) =>
      adapter.searchProducts(term, filters, sort, pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: term.length >= 2,
  });
}

/**
 * Hook for search suggestions/autocomplete
 *
 * @example
 * ```tsx
 * const { suggestions, isLoading } = useSearchSuggestions(term);
 *
 * return (
 *   <FlatList
 *     data={suggestions}
 *     renderItem={({ item }) => <Text>{item}</Text>}
 *   />
 * );
 * ```
 */
export function useSearchSuggestions(term: string, limit = 5) {
  const adapter = useAdapter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', 'suggestions', term, limit],
    queryFn: () => adapter.getSearchSuggestions(term, limit),
    enabled: term.length >= 2,
  });

  return {
    suggestions: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}

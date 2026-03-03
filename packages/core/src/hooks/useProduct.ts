/**
 * RIDLY Mobile SDK - useProduct Hook
 *
 * Hook for fetching a single product by ID or slug.
 */

import { useQuery } from '@tanstack/react-query';
import { useAdapter } from './useAdapter';
import type { Product } from '../types';

export interface UseProductOptions {
  /** Whether to enable the query */
  enabled?: boolean;
}

export interface UseProductReturn {
  /** The product */
  product: Product | undefined;

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
 * Hook to fetch a single product
 *
 * @param idOrSlug - Product ID or URL slug
 * @param options - Query options
 *
 * @example
 * ```tsx
 * const { product, isLoading, error } = useProduct('product-slug');
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * if (!product) return <NotFound />;
 *
 * return (
 *   <View>
 *     <Text>{product.name}</Text>
 *     <Price money={product.price} />
 *   </View>
 * );
 * ```
 */
export function useProduct(
  idOrSlug: string,
  options: UseProductOptions = {}
): UseProductReturn {
  const adapter = useAdapter();
  const { enabled = true } = options;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => adapter.getProduct(idOrSlug),
    enabled: enabled && !!idOrSlug,
  });

  return {
    product: data,
    isLoading,
    isFetching,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to fetch related products
 *
 * @example
 * ```tsx
 * const { products, isLoading } = useRelatedProducts('product-id', 4);
 * ```
 */
export function useRelatedProducts(productId: string, limit = 4) {
  const adapter = useAdapter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'related', productId, limit],
    queryFn: () => adapter.getRelatedProducts(productId, limit),
    enabled: !!productId,
  });

  return {
    products: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Hook to fetch upsell products
 *
 * @example
 * ```tsx
 * const { products, isLoading } = useUpsellProducts('product-id', 4);
 * ```
 */
export function useUpsellProducts(productId: string, limit = 4) {
  const adapter = useAdapter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'upsell', productId, limit],
    queryFn: () => adapter.getUpsellProducts(productId, limit),
    enabled: !!productId,
  });

  return {
    products: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}

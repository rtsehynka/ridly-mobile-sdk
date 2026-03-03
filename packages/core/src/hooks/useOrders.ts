/**
 * RIDLY Mobile SDK - useOrders Hook
 *
 * Hook for order history and details.
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdapter } from './useAdapter';
import { useCartStore } from '../stores/cartStore';
import type { Order } from '../types';

export interface UseOrdersOptions {
  /** Page size */
  pageSize?: number;

  /** Whether to enable the query */
  enabled?: boolean;
}

export interface UseOrdersReturn {
  /** Orders list */
  orders: Order[];

  /** Total number of orders */
  total: number;

  /** Whether orders are loading */
  isLoading: boolean;

  /** Orders error */
  error: Error | null;

  /** Refetch orders */
  refetch: () => void;
}

/**
 * Hook to fetch customer orders
 *
 * @example
 * ```tsx
 * const { orders, isLoading, error } = useOrders();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <FlatList
 *     data={orders}
 *     renderItem={({ item }) => <OrderCard order={item} />}
 *   />
 * );
 * ```
 */
export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const adapter = useAdapter();
  const { pageSize = 10, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', pageSize],
    queryFn: () => adapter.getOrders(1, pageSize),
    enabled,
  });

  return {
    orders: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook for infinite scrolling order list
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteOrders();
 *
 * const orders = data?.pages.flatMap(page => page.items) ?? [];
 *
 * return (
 *   <FlatList
 *     data={orders}
 *     onEndReached={() => hasNextPage && fetchNextPage()}
 *   />
 * );
 * ```
 */
export function useInfiniteOrders(pageSize = 10) {
  const adapter = useAdapter();

  return useInfiniteQuery({
    queryKey: ['orders', 'infinite', pageSize],
    queryFn: ({ pageParam = 1 }) => adapter.getOrders(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
}

export interface UseOrderOptions {
  /** Whether to enable the query */
  enabled?: boolean;
}

export interface UseOrderReturn {
  /** The order */
  order: Order | undefined;

  /** Whether order is loading */
  isLoading: boolean;

  /** Order error */
  error: Error | null;

  /** Refetch order */
  refetch: () => void;

  /** Reorder (add all items to cart) */
  reorder: () => Promise<void>;

  /** Whether reorder is in progress */
  isReordering: boolean;
}

/**
 * Hook to fetch a single order
 *
 * @param orderId - Order ID
 * @param options - Query options
 *
 * @example
 * ```tsx
 * const { order, isLoading, error, reorder, isReordering } = useOrder('12345');
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * if (!order) return <NotFound />;
 *
 * return (
 *   <View>
 *     <Text>Order #{order.orderNumber}</Text>
 *     <Text>Status: {order.status}</Text>
 *     <OrderItems items={order.items} />
 *     <Button onPress={reorder} loading={isReordering}>
 *       Reorder
 *     </Button>
 *   </View>
 * );
 * ```
 */
export function useOrder(orderId: string, options: UseOrderOptions = {}): UseOrderReturn {
  const adapter = useAdapter();
  const queryClient = useQueryClient();
  const { fetchCart } = useCartStore();
  const { enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => adapter.getOrder(orderId),
    enabled: enabled && !!orderId,
  });

  const reorderMutation = useMutation({
    mutationFn: () => adapter.reorder(orderId),
    onSuccess: () => {
      // Refresh cart after reorder
      fetchCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return {
    order: data,
    isLoading,
    error: error as Error | null,
    refetch,
    reorder: async () => {
      await reorderMutation.mutateAsync();
    },
    isReordering: reorderMutation.isPending,
  };
}

/**
 * Hook for order status display
 */
export function useOrderStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    pending_payment: 'Pending Payment',
    processing: 'Processing',
    complete: 'Complete',
    closed: 'Closed',
    canceled: 'Canceled',
    holded: 'On Hold',
    payment_review: 'Payment Review',
  };

  return statusLabels[status] ?? status;
}

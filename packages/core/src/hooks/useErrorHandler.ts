/**
 * RIDLY Mobile SDK - useErrorHandler Hook
 *
 * Hook for handling errors in components with retry logic.
 */

import { useState, useCallback, useRef } from 'react';
import {
  getErrorType,
  getErrorMessage,
  isRecoverableError,
  reportError,
} from '../utils/errors';
import type { ErrorType } from '../components/error';

export interface UseErrorHandlerOptions {
  /** Maximum retry attempts */
  maxRetries?: number;

  /** Delay between retries in ms */
  retryDelay?: number;

  /** Whether to report errors to the error reporter */
  report?: boolean;

  /** Context to include in error reports */
  context?: Record<string, unknown>;

  /** Called when an error occurs */
  onError?: (error: Error) => void;

  /** Called when all retries are exhausted */
  onMaxRetries?: (error: Error) => void;
}

export interface UseErrorHandlerReturn<T> {
  /** Execute an async function with error handling */
  execute: (fn: () => Promise<T>) => Promise<T | undefined>;

  /** Current error if any */
  error: Error | null;

  /** Error type for UI rendering */
  errorType: ErrorType | null;

  /** User-friendly error message */
  errorMessage: string | null;

  /** Whether the operation is loading */
  isLoading: boolean;

  /** Whether we can retry */
  canRetry: boolean;

  /** Retry the last operation */
  retry: () => Promise<T | undefined>;

  /** Clear the error state */
  clearError: () => void;

  /** Number of retries attempted */
  retryCount: number;
}

/**
 * Hook for handling errors in async operations
 *
 * @example
 * ```tsx
 * function ProductScreen({ productId }) {
 *   const [product, setProduct] = useState(null);
 *   const {
 *     execute,
 *     error,
 *     errorType,
 *     errorMessage,
 *     isLoading,
 *     canRetry,
 *     retry,
 *   } = useErrorHandler({
 *     maxRetries: 3,
 *     report: true,
 *   });
 *
 *   useEffect(() => {
 *     execute(async () => {
 *       const data = await fetchProduct(productId);
 *       setProduct(data);
 *       return data;
 *     });
 *   }, [productId]);
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   if (error) {
 *     return (
 *       <ErrorView
 *         type={errorType}
 *         message={errorMessage}
 *         onRetry={canRetry ? retry : undefined}
 *       />
 *     );
 *   }
 *
 *   return <ProductDetails product={product} />;
 * }
 * ```
 */
export function useErrorHandler<T = unknown>(
  options: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn<T> {
  const {
    maxRetries = 2,
    retryDelay = 1000,
    report = true,
    context,
    onError,
    onMaxRetries,
  } = options;

  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Store the last function for retry
  const lastFnRef = useRef<(() => Promise<T>) | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T | undefined> => {
      lastFnRef.current = fn;
      setIsLoading(true);
      setError(null);

      try {
        const result = await fn();
        setRetryCount(0);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (onError) {
          onError(error);
        }

        if (report) {
          reportError(error, { ...context, retryCount });
        }

        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [context, onError, report, retryCount]
  );

  const retry = useCallback(async (): Promise<T | undefined> => {
    if (!lastFnRef.current) {
      console.warn('useErrorHandler: No function to retry');
      return undefined;
    }

    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);

    // Check if we've exceeded max retries
    if (newRetryCount > maxRetries) {
      if (onMaxRetries && error) {
        onMaxRetries(error);
      }
      return undefined;
    }

    // Wait before retrying
    if (retryDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }

    return execute(lastFnRef.current);
  }, [retryCount, maxRetries, retryDelay, execute, onMaxRetries, error]);

  const errorType = error ? getErrorType(error) : null;
  const errorMessage = error ? getErrorMessage(error) : null;
  const canRetry = !!error && isRecoverableError(error) && retryCount < maxRetries;

  return {
    execute,
    error,
    errorType,
    errorMessage,
    isLoading,
    canRetry,
    retry,
    clearError,
    retryCount,
  };
}

export default useErrorHandler;

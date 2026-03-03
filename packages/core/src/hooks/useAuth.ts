/**
 * RIDLY Mobile SDK - useAuth Hook
 *
 * Hook for authentication functionality.
 */

import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { Customer, RegisterInput } from '../types';

export interface UseAuthReturn {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;

  /** Current customer profile */
  customer: Customer | null;

  /** Whether auth operation is in progress */
  isLoading: boolean;

  /** Authentication error */
  error: Error | null;

  /** Login with email and password */
  login: (email: string, password: string) => Promise<void>;

  /** Register a new customer */
  register: (data: Omit<RegisterInput, 'email' | 'password'> & { email: string; password: string }) => Promise<void>;

  /** Logout the current user */
  logout: () => Promise<void>;

  /** Refresh customer data */
  refreshCustomer: () => Promise<void>;

  /** Clear error */
  clearError: () => void;
}

/**
 * Hook for authentication
 *
 * @example
 * ```tsx
 * const { isAuthenticated, customer, login, logout, isLoading, error } = useAuth();
 *
 * const handleLogin = async () => {
 *   try {
 *     await login(email, password);
 *     // Navigate to home
 *   } catch (err) {
 *     // Error is also available in `error`
 *   }
 * };
 *
 * if (isAuthenticated) {
 *   return (
 *     <View>
 *       <Text>Welcome, {customer?.firstName}!</Text>
 *       <Button onPress={logout}>Logout</Button>
 *     </View>
 *   );
 * }
 *
 * return (
 *   <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
 * );
 * ```
 */
export function useAuth(): UseAuthReturn {
  const {
    isAuthenticated,
    customer,
    isLoading,
    error,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    refreshCustomer,
    clearError,
  } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      await storeLogin(email, password);
    },
    [storeLogin]
  );

  const register = useCallback(
    async (data: RegisterInput) => {
      await storeRegister(data);
    },
    [storeRegister]
  );

  const logout = useCallback(async () => {
    await storeLogout();
  }, [storeLogout]);

  return {
    isAuthenticated,
    customer,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshCustomer,
    clearError,
  };
}

/**
 * Hook to check if user is authenticated
 *
 * @example
 * ```tsx
 * const isLoggedIn = useIsAuthenticated();
 *
 * if (!isLoggedIn) {
 *   return <Redirect to="/login" />;
 * }
 * ```
 */
export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.isAuthenticated);
}

/**
 * Hook to get current customer
 *
 * @example
 * ```tsx
 * const customer = useCustomer();
 *
 * return <Text>Hello, {customer?.firstName ?? 'Guest'}</Text>;
 * ```
 */
export function useCustomer(): Customer | null {
  return useAuthStore((state) => state.customer);
}

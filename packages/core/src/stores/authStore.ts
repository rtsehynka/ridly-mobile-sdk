/**
 * RIDLY Mobile SDK - Auth Store
 *
 * Zustand store for managing authentication state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Customer, AuthTokens } from '../types';
import { getAdapter } from './configStore';

export interface AuthState {
  /** Current authentication tokens */
  tokens: AuthTokens | null;

  /** Current customer profile */
  customer: Customer | null;

  /** Whether the user is authenticated */
  isAuthenticated: boolean;

  /** Whether auth state is being loaded */
  isLoading: boolean;

  /** Authentication error if any */
  error: Error | null;

  /** Set tokens */
  setTokens: (tokens: AuthTokens | null) => void;

  /** Set customer */
  setCustomer: (customer: Customer | null) => void;

  /** Login with email and password */
  login: (email: string, password: string) => Promise<void>;

  /** Register a new customer */
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isSubscribedToNewsletter?: boolean;
  }) => Promise<void>;

  /** Logout the current user */
  logout: () => Promise<void>;

  /** Refresh customer data */
  refreshCustomer: () => Promise<void>;

  /** Clear error */
  clearError: () => void;

  /** Check and restore auth state */
  restoreAuth: () => Promise<void>;
}

/**
 * Auth Store
 *
 * Manages user authentication state with persistence.
 *
 * @example
 * ```tsx
 * const { isAuthenticated, customer, login, logout } = useAuthStore();
 *
 * // Login
 * await login('user@example.com', 'password');
 *
 * // Check auth
 * if (isAuthenticated) {
 *   console.log(`Welcome, ${customer?.firstName}`);
 * }
 *
 * // Logout
 * await logout();
 * ```
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokens: null,
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setTokens: (tokens) => {
        set({ tokens, isAuthenticated: !!tokens });

        // Update adapter with token
        try {
          const adapter = getAdapter();
          if ('setAuthToken' in adapter && typeof adapter.setAuthToken === 'function') {
            (adapter as any).setAuthToken(tokens?.accessToken || null);
          }
        } catch {
          // Adapter not initialized yet, will be set on restore
        }
      },

      setCustomer: (customer) => {
        set({ customer });
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const adapter = getAdapter();
          const tokens = await adapter.login(email, password);

          // Set tokens (also updates adapter)
          get().setTokens(tokens);

          // Fetch customer profile
          const customer = await adapter.getCustomer();
          set({ customer, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Login failed'),
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const adapter = getAdapter();
          const tokens = await adapter.register(data);

          // Set tokens
          get().setTokens(tokens);

          // Fetch customer profile
          const customer = await adapter.getCustomer();
          set({ customer, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Registration failed'),
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          const adapter = getAdapter();
          await adapter.logout();
        } catch {
          // Ignore logout errors
        }

        set({
          tokens: null,
          customer: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      refreshCustomer: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        set({ isLoading: true });

        try {
          const adapter = getAdapter();
          const customer = await adapter.getCustomer();
          set({ customer, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Failed to refresh customer'),
            isLoading: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      restoreAuth: async () => {
        const { tokens } = get();
        if (!tokens?.accessToken) return;

        set({ isLoading: true });

        try {
          const adapter = getAdapter();

          // Set token on adapter
          if ('setAuthToken' in adapter && typeof adapter.setAuthToken === 'function') {
            (adapter as any).setAuthToken(tokens.accessToken);
          }

          // Verify token is still valid by fetching customer
          const customer = await adapter.getCustomer();
          set({ customer, isAuthenticated: true, isLoading: false });
        } catch {
          // Token is invalid, clear auth
          set({
            tokens: null,
            customer: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'ridly-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tokens: state.tokens,
      }),
    }
  )
);
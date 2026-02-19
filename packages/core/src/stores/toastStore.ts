/**
 * RIDLY Mobile SDK - Toast Store
 *
 * Zustand store for managing toast notifications.
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

let toastId = 0;

/**
 * Toast Store
 *
 * @example
 * ```tsx
 * const { addToast, removeToast } = useToastStore();
 *
 * // Add a success toast
 * addToast({ type: 'success', title: 'Item added to cart' });
 *
 * // Add an error toast with message
 * addToast({ type: 'error', title: 'Error', message: 'Something went wrong' });
 *
 * // Add a toast with action
 * addToast({
 *   type: 'info',
 *   title: 'Item removed',
 *   action: { label: 'Undo', onPress: handleUndo }
 * });
 * ```
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastId}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));

/**
 * Helper functions for showing toasts
 */
export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'success', title, message }),

  error: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'error', title, message }),

  warning: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'warning', title, message }),

  info: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'info', title, message }),

  custom: (toastData: Omit<Toast, 'id'>) =>
    useToastStore.getState().addToast(toastData),

  dismiss: (id: string) =>
    useToastStore.getState().removeToast(id),

  dismissAll: () =>
    useToastStore.getState().clearAllToasts(),
};

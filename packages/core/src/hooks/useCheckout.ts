/**
 * RIDLY Mobile SDK - useCheckout Hook
 *
 * Hook for checkout flow management.
 */

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdapter } from './useAdapter';
import { useCartStore } from '../stores/cartStore';
import type {
  AddressInput,
  ShippingMethod,
  PaymentMethod,
  Country,
  PlaceOrderResult,
} from '../types';

export type CheckoutStep = 'shipping' | 'billing' | 'payment' | 'review';

export interface CheckoutState {
  /** Shipping address */
  shippingAddress: AddressInput | null;

  /** Billing address */
  billingAddress: AddressInput | null;

  /** Whether billing is same as shipping */
  billingSameAsShipping: boolean;

  /** Selected shipping method */
  shippingMethod: { carrierCode: string; methodCode: string } | null;

  /** Selected payment method code */
  paymentMethod: string | null;

  /** Current checkout step */
  currentStep: CheckoutStep;
}

export interface UseCheckoutReturn {
  /** Checkout state */
  state: CheckoutState;

  /** Available shipping methods */
  shippingMethods: ShippingMethod[];

  /** Available payment methods */
  paymentMethods: PaymentMethod[];

  /** Available countries */
  countries: Country[];

  /** Whether data is loading */
  isLoading: boolean;

  /** Whether checkout is processing */
  isProcessing: boolean;

  /** Checkout error */
  error: Error | null;

  /** Set shipping address */
  setShippingAddress: (address: AddressInput) => Promise<void>;

  /** Set billing address */
  setBillingAddress: (address: AddressInput) => Promise<void>;

  /** Set billing same as shipping */
  setBillingSameAsShipping: (same: boolean) => Promise<void>;

  /** Set shipping method */
  setShippingMethod: (carrierCode: string, methodCode: string) => Promise<void>;

  /** Set payment method */
  setPaymentMethod: (code: string) => Promise<void>;

  /** Place order */
  placeOrder: () => Promise<PlaceOrderResult>;

  /** Go to step */
  goToStep: (step: CheckoutStep) => void;

  /** Go to next step */
  nextStep: () => void;

  /** Go to previous step */
  prevStep: () => void;

  /** Reset checkout */
  reset: () => void;
}

const initialState: CheckoutState = {
  shippingAddress: null,
  billingAddress: null,
  billingSameAsShipping: true,
  shippingMethod: null,
  paymentMethod: null,
  currentStep: 'shipping',
};

const stepOrder: CheckoutStep[] = ['shipping', 'billing', 'payment', 'review'];

/**
 * Hook for checkout flow
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   shippingMethods,
 *   paymentMethods,
 *   countries,
 *   setShippingAddress,
 *   setShippingMethod,
 *   setPaymentMethod,
 *   placeOrder,
 *   currentStep,
 *   nextStep,
 *   prevStep,
 * } = useCheckout();
 *
 * // Step 1: Shipping Address
 * await setShippingAddress(addressData);
 * nextStep();
 *
 * // Step 2: Shipping Method
 * await setShippingMethod('flatrate', 'flatrate');
 * nextStep();
 *
 * // Step 3: Payment
 * await setPaymentMethod('checkmo');
 * nextStep();
 *
 * // Step 4: Review & Place Order
 * const result = await placeOrder();
 * // Navigate to success page with result.orderId
 * ```
 */
export function useCheckout(): UseCheckoutReturn {
  const adapter = useAdapter();
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();

  const [state, setState] = useState<CheckoutState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch countries
  const { data: countries = [], isLoading: countriesLoading } = useQuery({
    queryKey: ['countries'],
    queryFn: () => adapter.getCountries(),
  });

  // Fetch shipping methods (enabled after shipping address is set)
  const { data: shippingMethods = [], isLoading: shippingLoading } = useQuery({
    queryKey: ['checkout', 'shippingMethods'],
    queryFn: () => adapter.getShippingMethods(),
    enabled: !!state.shippingAddress,
  });

  // Fetch payment methods (enabled after shipping method is set)
  const { data: paymentMethods = [], isLoading: paymentLoading } = useQuery({
    queryKey: ['checkout', 'paymentMethods'],
    queryFn: () => adapter.getPaymentMethods(),
    enabled: !!state.shippingMethod,
  });

  const isLoading = countriesLoading || shippingLoading || paymentLoading;

  // Set shipping address
  const setShippingAddress = useCallback(
    async (address: AddressInput) => {
      setIsProcessing(true);
      setError(null);

      try {
        await adapter.setShippingAddress(address);
        setState((prev) => ({ ...prev, shippingAddress: address }));

        // Invalidate shipping methods query
        queryClient.invalidateQueries({ queryKey: ['checkout', 'shippingMethods'] });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to set shipping address'));
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [adapter, queryClient]
  );

  // Set billing address
  const setBillingAddress = useCallback(
    async (address: AddressInput) => {
      setIsProcessing(true);
      setError(null);

      try {
        await adapter.setBillingAddress(address);
        setState((prev) => ({
          ...prev,
          billingAddress: address,
          billingSameAsShipping: false,
        }));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to set billing address'));
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [adapter]
  );

  // Set billing same as shipping
  const setBillingSameAsShipping = useCallback(
    async (same: boolean) => {
      setIsProcessing(true);
      setError(null);

      try {
        if (same) {
          await adapter.setBillingSameAsShipping();
        }
        setState((prev) => ({
          ...prev,
          billingSameAsShipping: same,
          billingAddress: same ? prev.shippingAddress : prev.billingAddress,
        }));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to set billing address'));
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [adapter]
  );

  // Set shipping method
  const setShippingMethod = useCallback(
    async (carrierCode: string, methodCode: string) => {
      setIsProcessing(true);
      setError(null);

      try {
        await adapter.setShippingMethod(carrierCode, methodCode);
        setState((prev) => ({
          ...prev,
          shippingMethod: { carrierCode, methodCode },
        }));

        // Invalidate payment methods query
        queryClient.invalidateQueries({ queryKey: ['checkout', 'paymentMethods'] });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to set shipping method'));
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [adapter, queryClient]
  );

  // Set payment method
  const setPaymentMethod = useCallback(
    async (code: string) => {
      setIsProcessing(true);
      setError(null);

      try {
        await adapter.setPaymentMethod(code);
        setState((prev) => ({ ...prev, paymentMethod: code }));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to set payment method'));
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [adapter]
  );

  // Place order
  const placeOrder = useCallback(async (): Promise<PlaceOrderResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await adapter.placeOrder();

      // Clear cart after successful order
      await clearCart();

      // Reset checkout state
      setState(initialState);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to place order'));
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [adapter, clearCart]);

  // Navigation
  const goToStep = useCallback((step: CheckoutStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = stepOrder.indexOf(prev.currentStep);
      const nextIndex = Math.min(currentIndex + 1, stepOrder.length - 1);
      return { ...prev, currentStep: stepOrder[nextIndex] as CheckoutStep };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = stepOrder.indexOf(prev.currentStep);
      const prevIndex = Math.max(currentIndex - 1, 0);
      return { ...prev, currentStep: stepOrder[prevIndex] as CheckoutStep };
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setError(null);
  }, []);

  return {
    state,
    shippingMethods,
    paymentMethods,
    countries,
    isLoading,
    isProcessing,
    error,
    setShippingAddress,
    setBillingAddress,
    setBillingSameAsShipping,
    setShippingMethod,
    setPaymentMethod,
    placeOrder,
    goToStep,
    nextStep,
    prevStep,
    reset,
  };
}

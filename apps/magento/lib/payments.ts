/**
 * Payment Integration
 *
 * Provides PaymentIntentProvider implementation that creates
 * PaymentIntents via the backend API.
 */

import type {
  PaymentIntentProvider,
  CreatePaymentIntentParams,
  PaymentIntentResponse,
} from '@ridly/mobile-core';
import { getAdapter } from './adapter';

/**
 * Create a PaymentIntentProvider that uses Magento/backend API
 * to create Stripe PaymentIntents securely on the server.
 */
export function createMagentoPaymentIntentProvider(): PaymentIntentProvider {
  return {
    async createPaymentIntent(
      params: CreatePaymentIntentParams
    ): Promise<PaymentIntentResponse> {
      const adapter = getAdapter();

      // Use adapter's payment endpoint to create PaymentIntent
      // This calls the Magento backend which has the Stripe secret key
      const response = await adapter.createPaymentIntent({
        amount: params.amount,
        currency: params.currency,
        orderId: params.orderId,
        metadata: params.metadata,
      });

      return {
        clientSecret: response.clientSecret,
        paymentIntentId: response.paymentIntentId,
        ephemeralKey: response.ephemeralKey,
        customerId: response.customerId,
      };
    },
  };
}

/**
 * Alternative: Create PaymentIntent via direct API call
 * Use this if your backend exposes a custom endpoint
 */
export function createApiPaymentIntentProvider(
  apiUrl: string
): PaymentIntentProvider {
  return {
    async createPaymentIntent(
      params: CreatePaymentIntentParams
    ): Promise<PaymentIntentResponse> {
      const response = await fetch(`${apiUrl}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency,
          order_id: params.orderId,
          metadata: params.metadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || `Failed to create PaymentIntent: ${response.status}`
        );
      }

      const data = await response.json();

      return {
        clientSecret: data.client_secret,
        paymentIntentId: data.payment_intent_id,
        ephemeralKey: data.ephemeral_key,
        customerId: data.customer_id,
      };
    },
  };
}

/**
 * Initialize payment plugins with the PaymentIntentProvider
 *
 * Call this in your app initialization after plugins are loaded.
 *
 * @example
 * ```typescript
 * import { initializePaymentPlugins } from './lib/payments';
 * import { PluginRegistry } from '@ridly/mobile-core';
 *
 * // After plugins are registered
 * initializePaymentPlugins();
 * ```
 */
export async function initializePaymentPlugins(): Promise<void> {
  const { PluginRegistry } = await import('@ridly/mobile-core');
  const provider = createMagentoPaymentIntentProvider();

  // Set provider for Apple Pay
  const applePay = PluginRegistry.getPlugin('apple-pay');
  if (applePay && 'setPaymentIntentProvider' in applePay) {
    (applePay as any).setPaymentIntentProvider(provider);
    console.log('[Payments] Apple Pay provider configured');
  }

  // Set provider for Google Pay
  const googlePay = PluginRegistry.getPlugin('google-pay');
  if (googlePay && 'setPaymentIntentProvider' in googlePay) {
    (googlePay as any).setPaymentIntentProvider(provider);
    console.log('[Payments] Google Pay provider configured');
  }
}

/**
 * Apple Pay Plugin
 *
 * Native Apple Pay payments using Stripe.
 * Works on iOS devices with Apple Pay enabled.
 *
 * IMPORTANT: Requires a PaymentIntentProvider to be set before processing payments.
 * The provider fetches the clientSecret from your backend server.
 */

import type {
  PaymentPlugin,
  PaymentSession,
  PaymentResult,
  PaymentIntentProvider,
  PluginConfig,
} from '@ridly/mobile-core';
import { createPlugin } from '@ridly/mobile-core';

/**
 * Apple Pay configuration
 */
export interface ApplePayConfig extends PluginConfig {
  /** Stripe publishable key */
  stripePublishableKey: string;
  /** Apple Pay Merchant ID */
  merchantId: string;
  /** Merchant display name */
  merchantName: string;
  /** Country code (e.g., 'US', 'UA', 'PL') */
  countryCode: string;
  /** Supported networks */
  supportedNetworks?: ('visa' | 'masterCard' | 'amex' | 'discover')[];
}

/**
 * Create Apple Pay Plugin
 */
export function createApplePayPlugin(): PaymentPlugin {
  let config: ApplePayConfig | null = null;
  let stripe: StripeInstance | null = null;
  let paymentIntentProvider: PaymentIntentProvider | null = null;

  const plugin = createPlugin<PaymentPlugin>({
    metadata: {
      id: 'apple-pay',
      name: 'Apple Pay',
      version: '1.0.0',
      category: 'payment',
      description: 'Pay with Apple Pay',
      author: 'RIDLY',
      platforms: ['any'],
      isPremium: true,
    },

    isActive: false,

    async initialize(cfg?: PluginConfig): Promise<void> {
      config = cfg as ApplePayConfig;

      if (!config?.stripePublishableKey || !config?.merchantId) {
        throw new Error('[ApplePay] Missing required configuration: stripePublishableKey and merchantId are required');
      }

      try {
        const StripeModule = await import('@stripe/stripe-react-native');
        await StripeModule.initStripe({
          publishableKey: config.stripePublishableKey,
          merchantIdentifier: config.merchantId,
        });
        stripe = StripeModule;
        console.log('[ApplePay] Initialized successfully');
      } catch (error) {
        console.error('[ApplePay] Failed to initialize Stripe:', error);
        throw error;
      }
    },

    async cleanup(): Promise<void> {
      stripe = null;
      paymentIntentProvider = null;
      console.log('[ApplePay] Cleaned up');
    },

    setPaymentIntentProvider(provider: PaymentIntentProvider): void {
      paymentIntentProvider = provider;
      console.log('[ApplePay] PaymentIntentProvider set');
    },

    async isAvailable(): Promise<boolean> {
      if (!stripe) return false;

      try {
        const { isApplePaySupported } = await stripe.isApplePaySupported();
        return isApplePaySupported;
      } catch {
        return false;
      }
    },

    async createPaymentSession(
      amount: number,
      currency: string,
      orderId?: string
    ): Promise<PaymentSession> {
      if (!paymentIntentProvider) {
        throw new Error(
          '[ApplePay] PaymentIntentProvider not set. Call setPaymentIntentProvider() before creating a session.'
        );
      }

      // Fetch PaymentIntent from backend
      const paymentIntent = await paymentIntentProvider.createPaymentIntent({
        amount,
        currency: currency.toUpperCase(),
        orderId,
        metadata: {
          paymentMethod: 'apple-pay',
        },
      });

      return {
        id: `applepay_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
        amount,
        currency: currency.toUpperCase(),
        status: 'pending',
        metadata: {
          provider: 'apple-pay',
          orderId,
          ephemeralKey: paymentIntent.ephemeralKey,
          customerId: paymentIntent.customerId,
        },
      };
    },

    async processPayment(session: PaymentSession): Promise<PaymentResult> {
      if (!stripe || !config) {
        return {
          success: false,
          error: 'Apple Pay not initialized',
        };
      }

      if (!session.clientSecret) {
        return {
          success: false,
          error: 'Invalid payment session: missing clientSecret',
        };
      }

      try {
        // Present Apple Pay sheet
        const { error: presentError } = await stripe.presentApplePay({
          cartItems: [
            {
              label: config.merchantName,
              amount: (session.amount / 100).toFixed(2),
              paymentType: 'Immediate',
            },
          ],
          country: config.countryCode,
          currency: session.currency,
          requiredShippingAddressFields: ['emailAddress'],
          requiredBillingContactFields: ['phoneNumber', 'name'],
        });

        if (presentError) {
          await stripe.dismissApplePay();
          return {
            success: false,
            error: presentError.message || 'Apple Pay cancelled',
          };
        }

        // Confirm payment with the real clientSecret from backend
        const { error: confirmError } = await stripe.confirmApplePayPayment(
          session.clientSecret
        );

        if (confirmError) {
          await stripe.dismissApplePay();
          return {
            success: false,
            error: confirmError.message || 'Payment confirmation failed',
          };
        }

        // Payment successful
        return {
          success: true,
          transactionId: session.id,
          paymentIntentId: session.paymentIntentId,
        };
      } catch (error) {
        console.error('[ApplePay] Payment error:', error);

        try {
          await stripe.dismissApplePay();
        } catch {
          // Ignore dismiss errors
        }

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Payment failed',
        };
      }
    },
  });

  return plugin;
}

/**
 * Stripe instance type
 */
interface StripeInstance {
  initStripe(config: {
    publishableKey: string;
    merchantIdentifier: string;
  }): Promise<void>;
  isApplePaySupported(): Promise<{ isApplePaySupported: boolean }>;
  presentApplePay(options: {
    cartItems: Array<{ label: string; amount: string; paymentType: string }>;
    country: string;
    currency: string;
    requiredShippingAddressFields?: string[];
    requiredBillingContactFields?: string[];
  }): Promise<{ error?: { message: string } }>;
  confirmApplePayPayment(
    clientSecret: string
  ): Promise<{ error?: { message: string } }>;
  dismissApplePay(): Promise<void>;
}

/**
 * Default export
 */
export default createApplePayPlugin;

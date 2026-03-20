/**
 * Google Pay Plugin
 *
 * Native Google Pay payments using Stripe.
 * Works on Android devices with Google Pay enabled.
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
 * Google Pay configuration
 */
export interface GooglePayConfig extends PluginConfig {
  /** Stripe publishable key */
  stripePublishableKey: string;
  /** Google Pay Merchant ID (optional for test mode) */
  merchantId?: string;
  /** Merchant display name */
  merchantName: string;
  /** Country code (e.g., 'US', 'UA', 'PL') */
  countryCode: string;
  /** Test environment (default: false for production) */
  testEnv?: boolean;
  /** Existing payment method required */
  existingPaymentMethodRequired?: boolean;
}

/**
 * Create Google Pay Plugin
 */
export function createGooglePayPlugin(): PaymentPlugin {
  let config: GooglePayConfig | null = null;
  let stripe: StripeInstance | null = null;
  let paymentIntentProvider: PaymentIntentProvider | null = null;

  const plugin = createPlugin<PaymentPlugin>({
    metadata: {
      id: 'google-pay',
      name: 'Google Pay',
      version: '1.0.0',
      category: 'payment',
      description: 'Pay with Google Pay',
      author: 'RIDLY',
      platforms: ['any'],
      isPremium: true,
    },

    isActive: false,

    async initialize(cfg?: PluginConfig): Promise<void> {
      config = cfg as GooglePayConfig;

      if (!config?.stripePublishableKey) {
        throw new Error('[GooglePay] Missing required configuration: stripePublishableKey is required');
      }

      try {
        const StripeModule = await import('@stripe/stripe-react-native');
        await StripeModule.initStripe({
          publishableKey: config.stripePublishableKey,
          googlePay: {
            merchantCountryCode: config.countryCode,
            testEnv: config.testEnv ?? false,
          },
        });
        stripe = StripeModule;
        console.log('[GooglePay] Initialized successfully');
      } catch (error) {
        console.error('[GooglePay] Failed to initialize Stripe:', error);
        throw error;
      }
    },

    async cleanup(): Promise<void> {
      stripe = null;
      paymentIntentProvider = null;
      console.log('[GooglePay] Cleaned up');
    },

    setPaymentIntentProvider(provider: PaymentIntentProvider): void {
      paymentIntentProvider = provider;
      console.log('[GooglePay] PaymentIntentProvider set');
    },

    async isAvailable(): Promise<boolean> {
      if (!stripe) return false;

      try {
        const { isGooglePaySupported } = await stripe.isGooglePaySupported({
          testEnv: config?.testEnv ?? false,
        });
        return isGooglePaySupported;
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
          '[GooglePay] PaymentIntentProvider not set. Call setPaymentIntentProvider() before creating a session.'
        );
      }

      // Fetch PaymentIntent from backend
      const paymentIntent = await paymentIntentProvider.createPaymentIntent({
        amount,
        currency: currency.toUpperCase(),
        orderId,
        metadata: {
          paymentMethod: 'google-pay',
        },
      });

      return {
        id: `googlepay_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
        amount,
        currency: currency.toUpperCase(),
        status: 'pending',
        metadata: {
          provider: 'google-pay',
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
          error: 'Google Pay not initialized',
        };
      }

      if (!session.clientSecret) {
        return {
          success: false,
          error: 'Invalid payment session: missing clientSecret',
        };
      }

      try {
        // Initialize Google Pay
        const { error: initError } = await stripe.initGooglePay({
          merchantName: config.merchantName,
          countryCode: config.countryCode,
          billingAddressConfig: {
            format: 'FULL',
            isPhoneNumberRequired: true,
            isRequired: true,
          },
          existingPaymentMethodRequired: config.existingPaymentMethodRequired ?? false,
          isEmailRequired: true,
          testEnv: config.testEnv ?? false,
        });

        if (initError) {
          return {
            success: false,
            error: initError.message || 'Failed to initialize Google Pay',
          };
        }

        // Present Google Pay sheet with REAL clientSecret from backend
        const { error: payError } = await stripe.presentGooglePay({
          clientSecret: session.clientSecret,
          forSetupIntent: false,
        });

        if (payError) {
          return {
            success: false,
            error: payError.message || 'Google Pay cancelled',
          };
        }

        // Payment successful
        return {
          success: true,
          transactionId: session.id,
          paymentIntentId: session.paymentIntentId,
        };
      } catch (error) {
        console.error('[GooglePay] Payment error:', error);
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
    googlePay?: { merchantCountryCode: string; testEnv: boolean };
  }): Promise<void>;
  isGooglePaySupported(options: {
    testEnv: boolean;
  }): Promise<{ isGooglePaySupported: boolean }>;
  initGooglePay(options: {
    merchantName: string;
    countryCode: string;
    billingAddressConfig?: {
      format: string;
      isPhoneNumberRequired: boolean;
      isRequired: boolean;
    };
    existingPaymentMethodRequired?: boolean;
    isEmailRequired?: boolean;
    testEnv?: boolean;
  }): Promise<{ error?: { message: string } }>;
  presentGooglePay(options: {
    clientSecret: string;
    forSetupIntent: boolean;
  }): Promise<{ error?: { message: string } }>;
}

/**
 * Default export
 */
export default createGooglePayPlugin;

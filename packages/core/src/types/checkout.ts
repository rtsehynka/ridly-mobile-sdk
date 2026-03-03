/**
 * Checkout types for RIDLY Mobile SDK
 */

import type { Money } from './common';

/**
 * Shipping method option
 */
export interface ShippingMethod {
  code: string;
  carrierCode: string;
  carrierTitle: string;
  methodCode: string;
  methodTitle: string;
  price: Money;
  priceExclTax?: Money;
  description?: string;
  estimatedDelivery?: string; // e.g., "2-5 business days"
  available?: boolean;
  errorMessage?: string;
}

/**
 * Payment method option
 */
export interface PaymentMethod {
  code: string;
  title: string;
  description?: string;
  icon?: string;
  isOffline?: boolean;
  sortOrder?: number;
  /**
   * For complex gateways (Stripe, PayPal, etc.)
   * Use WebView checkout when true
   */
  requiresWebView?: boolean;
  webViewUrl?: string;
  /**
   * Additional configuration for payment method
   */
  config?: Record<string, unknown>;
}

/**
 * Country option for address forms
 */
export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  requiresRegion: boolean;
}

/**
 * Region/State option for address forms
 */
export interface Region {
  code: string;
  name: string;
}

/**
 * Checkout state/session
 */
export interface CheckoutSession {
  cartId: string;
  shippingAddressSet: boolean;
  billingAddressSet: boolean;
  shippingMethodSet: boolean;
  paymentMethodSet: boolean;
  selectedShippingMethod?: string;
  selectedPaymentMethod?: string;
}

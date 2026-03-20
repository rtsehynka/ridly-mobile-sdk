/**
 * RIDLY Configuration Types
 *
 * Centralized configuration for the entire app.
 * All plugins, features, and settings in one place.
 */

import type { CurrencyCode } from '../currency/types';
import type { Locale, LanguageConfig } from '../i18n/types';
import type { RidlyPlugin } from '../plugins/types';

/**
 * Main RIDLY Configuration
 */
export interface RidlyConfig {
  /** App Information */
  app: RidlyAppConfig;

  /** Backend/Platform Configuration */
  platform: RidlyPlatformConfig;

  /** Theme Configuration */
  theme: RidlyThemeConfig;

  /** i18n Configuration */
  i18n: RidlyI18nConfig;

  /** Currency Configuration */
  currency: RidlyCurrencyConfig;

  /** Home Screen Configuration */
  homeScreen?: RidlyHomeScreenConfig;

  /** Product Display Configuration */
  product?: RidlyProductConfig;

  /** Navigation Configuration */
  navigation?: RidlyNavigationConfig;

  /** Checkout Configuration */
  checkout?: RidlyCheckoutConfig;

  /** Plugins Configuration */
  plugins: RidlyPluginsConfig;

  /** Feature Flags */
  features: RidlyFeaturesConfig;

  /** Analytics Configuration */
  analytics?: RidlyAnalyticsDevConfig;

  /** Development Options */
  dev?: RidlyDevConfig;
}

/**
 * App Configuration
 */
export interface RidlyAppConfig {
  /** App name */
  name: string;
  /** App version */
  version: string;
  /** Bundle ID / Package name */
  bundleId: string;
  /** App scheme for deep links */
  scheme: string;
  /** Support email */
  supportEmail?: string;
  /** Terms of service URL */
  termsUrl?: string;
  /** Privacy policy URL */
  privacyUrl?: string;
}

/**
 * Platform/Backend Configuration
 */
export interface RidlyPlatformConfig {
  /** Platform type */
  type: 'magento' | 'shopify' | 'shopware' | 'woocommerce';
  /** API URL */
  apiUrl: string;
  /** Store code (for multi-store) */
  storeCode?: string;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Timeout in ms */
  timeout?: number;
}

/**
 * Theme Configuration
 */
export interface RidlyThemeConfig {
  /** Theme ID */
  id: string;
  /** Default color mode */
  defaultMode: 'light' | 'dark' | 'system';
  /** Custom colors override */
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

/**
 * i18n Configuration Options
 */
export interface RidlyI18nConfig {
  /** Default locale */
  defaultLocale: Locale;
  /** Available locales */
  locales: LanguageConfig[];
  /** Fallback locale */
  fallbackLocale?: Locale;
}

/**
 * Currency Configuration Options
 */
export interface RidlyCurrencyConfig {
  /** Default/base currency */
  defaultCurrency: CurrencyCode;
  /** Available currencies */
  currencies: CurrencyCode[];
  /** Auto-detect from locale */
  autoDetect?: boolean;
}

/**
 * Plugin Factory Function
 */
export type PluginFactory = () => RidlyPlugin;

/**
 * Plugins Configuration
 */
export interface RidlyPluginsConfig {
  /** Search Plugin */
  search?: SearchPluginConfig;
  /** Auth Plugins */
  auth?: AuthPluginsConfig;
  /** Payment Plugins */
  payments?: PaymentsPluginConfig;
  /** Notifications Plugin */
  notifications?: NotificationsPluginConfig;
  /** Scanner Plugin */
  scanner?: ScannerPluginConfig;
  /** Offline Plugin */
  offline?: OfflinePluginConfig;
  /** Analytics Plugin */
  analytics?: AnalyticsPluginConfig;
  /** Custom plugin factories */
  custom?: PluginFactory[];
}

/**
 * Search Plugin Config
 */
export interface SearchPluginConfig {
  /** Provider: 'algolia' | 'elasticsearch' | 'native' */
  provider: 'algolia' | 'elasticsearch' | 'native';
  /** Algolia config */
  algolia?: {
    appId: string;
    apiKey: string;
    indexName: string;
  };
}

/**
 * Auth Plugins Config
 */
export interface AuthPluginsConfig {
  /** Google Sign-In */
  google?: {
    enabled: boolean;
    iosClientId?: string;
    androidClientId?: string;
    webClientId?: string;
    expoClientId?: string;
  };
  /** Apple Sign-In */
  apple?: {
    enabled: boolean;
  };
  /** Facebook Login */
  facebook?: {
    enabled: boolean;
    appId?: string;
  };
}

/**
 * Payments Plugin Config
 */
export interface PaymentsPluginConfig {
  /** Stripe config (for Apple Pay / Google Pay) */
  stripe?: {
    publishableKey: string;
    merchantId: string;
    merchantName: string;
    countryCode: string;
  };
  /** Apple Pay */
  applePay?: {
    enabled: boolean;
  };
  /** Google Pay */
  googlePay?: {
    enabled: boolean;
    testEnv?: boolean;
  };
}

/**
 * Notifications Plugin Config
 */
export interface NotificationsPluginConfig {
  enabled: boolean;
  /** Android channel config */
  android?: {
    channelId: string;
    channelName: string;
    icon?: string;
    color?: string;
  };
}

/**
 * Scanner Plugin Config
 */
export interface ScannerPluginConfig {
  enabled: boolean;
  /** Barcode types to scan */
  barcodeTypes?: string[];
}

/**
 * Offline Plugin Config
 */
export interface OfflinePluginConfig {
  enabled: boolean;
  /** Cache TTL in seconds */
  cacheTTL?: number;
  /** Max queue size */
  maxQueueSize?: number;
  /** Auto process queue on reconnect */
  autoProcessQueue?: boolean;
}

/**
 * Analytics Plugin Config
 */
export interface AnalyticsPluginConfig {
  /** Provider */
  provider?: 'firebase' | 'mixpanel' | 'amplitude';
  /** Firebase config */
  firebase?: {
    enabled: boolean;
  };
  /** Track screens automatically */
  autoTrackScreens?: boolean;
  /** Track e-commerce events */
  trackEcommerce?: boolean;
}

/**
 * Feature Flags
 */
export interface RidlyFeaturesConfig {
  /** Enable wishlist */
  wishlist?: boolean;
  /** Enable product reviews */
  reviews?: boolean;
  /** Enable product comparison */
  compare?: boolean;
  /** Enable barcode scanner */
  barcodeScanner?: boolean;
  /** Enable push notifications */
  pushNotifications?: boolean;
  /** Enable offline mode */
  offlineMode?: boolean;
  /** Enable social login */
  socialLogin?: boolean;
  /** Enable guest checkout */
  guestCheckout?: boolean;
  /** Enable multi-language */
  multiLanguage?: boolean;
  /** Enable multi-currency */
  multiCurrency?: boolean;
}

/**
 * Analytics Configuration
 */
export interface RidlyAnalyticsDevConfig {
  /** Enable analytics */
  enabled: boolean;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Development Configuration
 */
export interface RidlyDevConfig {
  /** Enable debug mode */
  debug?: boolean;
  /** Show dev tools */
  showDevTools?: boolean;
  /** Log network requests */
  logNetwork?: boolean;
  /** Mock data */
  useMockData?: boolean;
}

// ===========================================
// UI CONFIGURATION TYPES
// ===========================================

/**
 * Home Screen Section
 */
export interface RidlyHomeScreenSection {
  type: 'banner' | 'categories' | 'featured' | 'newArrivals' | 'onSale' | 'brands' | 'cmsBlock';
  enabled: boolean;
  title?: string;
  limit?: number;
  style?: 'grid' | 'carousel' | 'list' | 'horizontal';
  categoryId?: string;
  blockId?: string;
}

/**
 * Home Screen Configuration
 */
export interface RidlyHomeScreenConfig {
  sections: RidlyHomeScreenSection[];
}

/**
 * Product Display Configuration
 */
export interface RidlyProductConfig {
  /** Grid columns (1, 2, or 3) */
  gridColumns?: 1 | 2 | 3;
  /** Show SKU */
  showSku?: boolean;
  /** Show stock status */
  showStock?: boolean;
  /** Show rating */
  showRating?: boolean;
  /** Show wishlist button */
  showWishlist?: boolean;
  /** Show share button */
  showShare?: boolean;
  /** Show related products */
  showRelated?: boolean;
  /** Image aspect ratio */
  imageAspectRatio?: '1:1' | '3:4' | '4:3';
  /** Gallery style */
  galleryStyle?: 'scroll' | 'zoom' | 'fullscreen';
}

/**
 * Tab Item
 */
export interface RidlyTabItem {
  name: string;
  icon: string;
  route?: string;
  showBadge?: boolean;
}

/**
 * Drawer Link
 */
export interface RidlyDrawerLink {
  label: string;
  icon: string;
  route: string;
}

/**
 * Header Configuration
 */
export interface RidlyHeaderConfig {
  showLogo?: boolean;
  showSearch?: boolean;
  showHamburger?: boolean;
  logoStyle?: 'text' | 'image';
  logoText?: string;
  logoImage?: string;
}

/**
 * Drawer Configuration
 */
export interface RidlyDrawerConfig {
  enabled: boolean;
  showCategories?: boolean;
  showUserProfile?: boolean;
  customLinks?: RidlyDrawerLink[];
}

/**
 * Navigation Configuration
 */
export interface RidlyNavigationConfig {
  tabs?: RidlyTabItem[];
  drawer?: RidlyDrawerConfig;
  header?: RidlyHeaderConfig;
}

/**
 * Checkout Configuration
 */
export interface RidlyCheckoutConfig {
  /** Use WebView for checkout */
  webViewCheckout?: boolean;
  /** Use WebView only for payment */
  webViewPaymentOnly?: boolean;
  /** Require phone number */
  requirePhone?: boolean;
  /** Require region/state */
  requireRegion?: boolean;
  /** Default country code */
  defaultCountry?: string;
}

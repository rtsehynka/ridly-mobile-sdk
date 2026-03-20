/**
 * RIDLY Plugins
 *
 * Premium plugins for RIDLY Mobile SDK.
 * All plugins are optional and can be installed separately.
 */

import { ConfigManager } from '@ridly/mobile-core';

// Auth Plugins
import { createGoogleAuthPlugin } from './google-auth/src';
import { createAppleAuthPlugin } from './apple-auth/src';

// Search Plugins
import { createAlgoliaSearchPlugin } from './algolia-search/src';

// Payment Plugins
import { createApplePayPlugin } from './apple-pay/src';
import { createGooglePayPlugin } from './google-pay/src';

// Notification Plugins
import { createPushNotificationsPlugin } from './push-notifications/src';

// Scanner Plugins
import { createBarcodeScannerPlugin } from './barcode-scanner/src';

// Offline Plugins
import { createOfflineModePlugin } from './offline-mode/src';

// Re-export plugin factories
export { createGoogleAuthPlugin } from './google-auth/src';
export type { GoogleAuthConfig } from './google-auth/src';

export { createAppleAuthPlugin } from './apple-auth/src';
export type { AppleAuthConfig } from './apple-auth/src';

export { createAlgoliaSearchPlugin } from './algolia-search/src';
export type { AlgoliaConfig } from './algolia-search/src';

export { createApplePayPlugin } from './apple-pay/src';
export type { ApplePayConfig } from './apple-pay/src';

export { createGooglePayPlugin } from './google-pay/src';
export type { GooglePayConfig } from './google-pay/src';

export { createPushNotificationsPlugin } from './push-notifications/src';
export type { PushNotificationsConfig } from './push-notifications/src';

export { createBarcodeScannerPlugin } from './barcode-scanner/src';
export type { BarcodeScannerConfig, BarcodeScannerPluginExtended } from './barcode-scanner/src';

export { createOfflineModePlugin } from './offline-mode/src';
export type { OfflineModeConfig } from './offline-mode/src';

/**
 * Register all plugin loaders with ConfigManager
 * This is called automatically when @ridly/mobile-plugins is imported
 */
export function registerPlugins(): void {
  ConfigManager.registerPluginLoaders({
    algoliaSearch: createAlgoliaSearchPlugin,
    googleAuth: createGoogleAuthPlugin,
    appleAuth: createAppleAuthPlugin,
    applePay: createApplePayPlugin,
    googlePay: createGooglePayPlugin,
    pushNotifications: createPushNotificationsPlugin,
    barcodeScanner: createBarcodeScannerPlugin,
    offlineMode: createOfflineModePlugin,
  });
}

// Auto-register on import
registerPlugins();

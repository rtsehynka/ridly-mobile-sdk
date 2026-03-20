/**
 * RIDLY Plugin System
 *
 * Exports all plugin-related types, registry, and hooks.
 */

// Types
export type {
  PluginCategory,
  Platform,
  PluginMetadata,
  PluginLifecycle,
  RidlyPlugin,
  SearchPlugin,
  SearchOptions,
  SearchResult,
  SearchFacet,
  PaymentPlugin,
  PaymentSession,
  PaymentResult,
  PaymentIntentProvider,
  CreatePaymentIntentParams,
  PaymentIntentResponse,
  SocialAuthPlugin,
  SocialAuthResult,
  SocialUser,
  NotificationsPlugin,
  NotificationHandler,
  PushNotification,
  LocalNotification,
  ScannerPlugin,
  ScanResult,
  AnalyticsPlugin,
  EcommerceEvent,
  OfflinePlugin,
  OfflineAction,
  PluginConfig,
  PluginRegistrationOptions,
} from './types';

// Registry
export { PluginRegistry, createPlugin } from './PluginRegistry';

// Hooks
export {
  usePlugin,
  usePluginByCategory,
  usePluginAvailable,
  useActivePlugins,
  useSearchPlugin,
  usePayments,
  useSocialAuth,
  useNotifications,
  useScanner,
  useAnalytics,
  useOffline,
} from './hooks';

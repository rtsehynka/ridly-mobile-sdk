/**
 * RIDLY Configuration System
 *
 * Centralized configuration for the entire app.
 */

// Types
export type {
  RidlyConfig,
  RidlyAppConfig,
  RidlyPlatformConfig,
  RidlyThemeConfig,
  RidlyI18nConfig,
  RidlyCurrencyConfig,
  RidlyPluginsConfig,
  SearchPluginConfig,
  AuthPluginsConfig,
  PaymentsPluginConfig,
  NotificationsPluginConfig,
  ScannerPluginConfig,
  OfflinePluginConfig,
  AnalyticsPluginConfig,
  RidlyFeaturesConfig,
  RidlyAnalyticsDevConfig,
  RidlyDevConfig,
  PluginFactory,
  // UI Config types
  RidlyHomeScreenConfig,
  RidlyHomeScreenSection,
  RidlyProductConfig,
  RidlyNavigationConfig,
  RidlyCheckoutConfig,
  RidlyTabItem,
  RidlyDrawerConfig,
  RidlyDrawerLink,
  RidlyHeaderConfig,
} from './types';

// Config Manager
export { ConfigManager, defineConfig } from './ConfigManager';

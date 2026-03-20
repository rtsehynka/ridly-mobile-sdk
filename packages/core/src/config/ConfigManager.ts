/**
 * RIDLY Config Manager
 *
 * Centralized configuration management.
 * Loads config and initializes all systems.
 */

import type { RidlyConfig, RidlyPluginsConfig, PluginFactory } from './types';
import { PluginRegistry } from '../plugins/PluginRegistry';
import { I18nStore } from '../i18n/I18nStore';
import { CurrencyStore } from '../currency/CurrencyStore';
import { COMMON_CURRENCIES } from '../currency/types';
import type { RidlyPlugin, PluginConfig } from '../plugins/types';

/**
 * Plugin Loaders Registry
 * Allows @ridly/mobile-plugins package to register its plugin factories
 */
interface PluginLoaders {
  algoliaSearch?: PluginFactory;
  googleAuth?: PluginFactory;
  appleAuth?: PluginFactory;
  applePay?: PluginFactory;
  googlePay?: PluginFactory;
  pushNotifications?: PluginFactory;
  barcodeScanner?: PluginFactory;
  offlineMode?: PluginFactory;
}

/**
 * Config Manager class
 */
class ConfigManagerClass {
  private config: RidlyConfig | null = null;
  private initialized = false;
  private listeners: Set<() => void> = new Set();
  private pluginLoaders: PluginLoaders = {};

  /**
   * Register plugin loaders from @ridly/mobile-plugins
   * This should be called by the plugins package during import
   */
  registerPluginLoaders(loaders: Partial<PluginLoaders>): void {
    this.pluginLoaders = { ...this.pluginLoaders, ...loaders };
  }

  /**
   * Register a custom plugin directly
   */
  async registerPlugin(plugin: RidlyPlugin, config?: PluginConfig): Promise<void> {
    await PluginRegistry.register({
      plugin,
      config,
      autoActivate: true,
    });
  }

  /**
   * Initialize RIDLY with configuration
   */
  async initialize(config: RidlyConfig): Promise<void> {
    if (this.initialized) {
      console.warn('[ConfigManager] Already initialized');
      return;
    }

    this.config = config;

    console.log(`[ConfigManager] Initializing ${config.app.name} v${config.app.version}`);

    // 1. Initialize Plugin Registry with platform
    await PluginRegistry.initialize(config.platform.type);

    // 2. Initialize i18n
    await I18nStore.initialize({
      defaultLocale: config.i18n.defaultLocale,
      locales: config.i18n.locales,
    });

    // 3. Initialize Currency
    const currencyConfigs = config.currency.currencies.map(code => {
      const common = COMMON_CURRENCIES[code];
      if (common) {
        return { ...common, exchangeRate: 1 };
      }
      return {
        code,
        name: code,
        symbol: code,
        symbolPosition: 'before' as const,
        decimalPlaces: 2,
        decimalSeparator: '.',
        thousandsSeparator: ',',
        exchangeRate: 1,
      };
    });

    await CurrencyStore.initialize({
      baseCurrency: config.currency.defaultCurrency,
      currencies: currencyConfigs,
    });

    // 4. Register plugins based on config
    await this.registerPlugins(config.plugins);

    this.initialized = true;
    console.log('[ConfigManager] Initialization complete');
    this.notifyListeners();
  }

  /**
   * Register plugins based on config
   */
  private async registerPlugins(plugins: RidlyPluginsConfig): Promise<void> {
    // Search Plugin
    if (plugins.search?.provider === 'algolia' && plugins.search.algolia) {
      await this.tryRegisterPlugin('algoliaSearch', plugins.search.algolia);
    }

    // Auth Plugins
    if (plugins.auth?.google?.enabled) {
      await this.tryRegisterPlugin('googleAuth', plugins.auth.google);
    }
    if (plugins.auth?.apple?.enabled) {
      await this.tryRegisterPlugin('appleAuth', undefined);
    }

    // Payment Plugins
    if (plugins.payments?.stripe) {
      if (plugins.payments.applePay?.enabled) {
        await this.tryRegisterPlugin('applePay', {
          stripePublishableKey: plugins.payments.stripe.publishableKey,
          merchantId: plugins.payments.stripe.merchantId,
          merchantName: plugins.payments.stripe.merchantName,
          countryCode: plugins.payments.stripe.countryCode,
        });
      }
      if (plugins.payments.googlePay?.enabled) {
        await this.tryRegisterPlugin('googlePay', {
          stripePublishableKey: plugins.payments.stripe.publishableKey,
          merchantName: plugins.payments.stripe.merchantName,
          countryCode: plugins.payments.stripe.countryCode,
          testEnv: plugins.payments.googlePay.testEnv,
        });
      }
    }

    // Notifications Plugin
    if (plugins.notifications?.enabled) {
      await this.tryRegisterPlugin('pushNotifications', plugins.notifications.android);
    }

    // Scanner Plugin
    if (plugins.scanner?.enabled) {
      await this.tryRegisterPlugin('barcodeScanner', { barcodeTypes: plugins.scanner.barcodeTypes });
    }

    // Offline Plugin
    if (plugins.offline?.enabled) {
      await this.tryRegisterPlugin('offlineMode', {
        defaultTTL: plugins.offline.cacheTTL,
        maxQueueSize: plugins.offline.maxQueueSize,
        autoProcessQueue: plugins.offline.autoProcessQueue,
      });
    }

    // Custom plugins
    if (plugins.custom) {
      for (const factory of plugins.custom) {
        try {
          const plugin = factory();
          await PluginRegistry.register({
            plugin,
            autoActivate: true,
          });
        } catch (error) {
          console.warn('[ConfigManager] Failed to register custom plugin:', error);
        }
      }
    }
  }

  /**
   * Try to register a plugin using the registered loader
   */
  private async tryRegisterPlugin(
    loaderKey: keyof PluginLoaders,
    config?: PluginConfig
  ): Promise<void> {
    const loader = this.pluginLoaders[loaderKey];
    if (!loader) {
      console.warn(
        `[ConfigManager] Plugin loader for '${loaderKey}' not registered. ` +
        'Make sure @ridly/mobile-plugins is imported.'
      );
      return;
    }

    try {
      const plugin = loader();
      await PluginRegistry.register({
        plugin,
        config,
        autoActivate: true,
      });
    } catch (error) {
      console.warn(`[ConfigManager] Failed to register ${loaderKey} plugin:`, error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): RidlyConfig | null {
    return this.config;
  }

  /**
   * Get specific config section
   */
  get<K extends keyof RidlyConfig>(key: K): RidlyConfig[K] | undefined {
    return this.config?.[key];
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof RidlyConfig['features']): boolean {
    return this.config?.features?.[feature] ?? false;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Subscribe to config changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Reset (for testing)
   */
  reset(): void {
    this.config = null;
    this.initialized = false;
    this.listeners.clear();
  }
}

/**
 * Singleton instance
 */
export const ConfigManager = new ConfigManagerClass();

/**
 * Helper function to define config with type safety
 */
export function defineConfig(config: RidlyConfig): RidlyConfig {
  return config;
}

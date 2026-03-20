/**
 * Plugin Hooks
 *
 * React hooks for accessing plugins in components.
 * Provides type-safe access to plugin functionality.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PluginRegistry } from './PluginRegistry';
import type {
  RidlyPlugin,
  PluginCategory,
  SearchPlugin,
  PaymentPlugin,
  SocialAuthPlugin,
  NotificationsPlugin,
  ScannerPlugin,
  AnalyticsPlugin,
  OfflinePlugin,
} from './types';

/**
 * Plugin type mapping for hooks
 */
interface PluginHookMap {
  search: SearchPlugin;
  payment: PaymentPlugin;
  auth: SocialAuthPlugin;
  notifications: NotificationsPlugin;
  scanner: ScannerPlugin;
  analytics: AnalyticsPlugin;
  offline: OfflinePlugin;
}

/**
 * Hook to get a plugin by ID
 */
export function usePlugin<T extends RidlyPlugin>(pluginId: string): T | null {
  const [plugin, setPlugin] = useState<T | null>(() => PluginRegistry.get<T>(pluginId));

  useEffect(() => {
    const unsubscribe = PluginRegistry.subscribe(() => {
      setPlugin(PluginRegistry.get<T>(pluginId));
    });
    return unsubscribe;
  }, [pluginId]);

  return plugin;
}

/**
 * Hook to get active plugin by category
 */
export function usePluginByCategory<K extends keyof PluginHookMap>(
  category: K
): PluginHookMap[K] | null {
  const [plugin, setPlugin] = useState<PluginHookMap[K] | null>(() =>
    PluginRegistry.getByCategory(category)
  );

  useEffect(() => {
    const unsubscribe = PluginRegistry.subscribe(() => {
      setPlugin(PluginRegistry.getByCategory(category));
    });
    return unsubscribe;
  }, [category]);

  return plugin;
}

/**
 * Hook to check if a plugin category is available
 */
export function usePluginAvailable(category: PluginCategory): boolean {
  const [available, setAvailable] = useState(() =>
    PluginRegistry.hasActivePlugin(category)
  );

  useEffect(() => {
    const unsubscribe = PluginRegistry.subscribe(() => {
      setAvailable(PluginRegistry.hasActivePlugin(category));
    });
    return unsubscribe;
  }, [category]);

  return available;
}

/**
 * Hook to get all active plugins
 */
export function useActivePlugins(): RidlyPlugin[] {
  const [plugins, setPlugins] = useState(() => PluginRegistry.getActivePlugins());

  useEffect(() => {
    const unsubscribe = PluginRegistry.subscribe(() => {
      setPlugins(PluginRegistry.getActivePlugins());
    });
    return unsubscribe;
  }, []);

  return plugins;
}

// ============================================
// Category-specific hooks
// ============================================

/**
 * Hook for search plugin
 * Note: Named useSearchPlugin to avoid conflict with core useSearch hook
 */
export function useSearchPlugin() {
  const plugin = usePluginByCategory('search');

  const search = useCallback(
    async (query: string, options?: Parameters<SearchPlugin['search']>[1]) => {
      if (!plugin) {
        throw new Error('Search plugin not available');
      }
      return plugin.search(query, options);
    },
    [plugin]
  );

  const suggest = useCallback(
    async (query: string, limit?: number) => {
      if (!plugin) {
        return [];
      }
      return plugin.suggest(query, limit);
    },
    [plugin]
  );

  return {
    isAvailable: plugin !== null,
    search,
    suggest,
    plugin,
  };
}

/**
 * Hook for payment plugins
 */
export function usePayments() {
  const [paymentPlugins, setPaymentPlugins] = useState<PaymentPlugin[]>(() =>
    PluginRegistry.getAllByCategory('payment')
  );

  useEffect(() => {
    const unsubscribe = PluginRegistry.subscribe(() => {
      setPaymentPlugins(PluginRegistry.getAllByCategory('payment'));
    });
    return unsubscribe;
  }, []);

  const activePlugins = useMemo(
    () => paymentPlugins.filter(p => p.isActive),
    [paymentPlugins]
  );

  const getPaymentPlugin = useCallback(
    (id: string) => paymentPlugins.find(p => p.metadata.id === id) || null,
    [paymentPlugins]
  );

  return {
    plugins: activePlugins,
    getPlugin: getPaymentPlugin,
    hasApplePay: activePlugins.some(p => p.metadata.id.includes('apple-pay')),
    hasGooglePay: activePlugins.some(p => p.metadata.id.includes('google-pay')),
  };
}

/**
 * Hook for social auth plugins
 */
export function useSocialAuth() {
  const [authPlugins, setAuthPlugins] = useState<SocialAuthPlugin[]>(() =>
    PluginRegistry.getAllByCategory('auth').filter(
      (p): p is SocialAuthPlugin => p.metadata.category === 'auth'
    )
  );

  useEffect(() => {
    const unsubscribe = PluginRegistry.subscribe(() => {
      setAuthPlugins(
        PluginRegistry.getAllByCategory('auth').filter(
          (p): p is SocialAuthPlugin => p.metadata.category === 'auth'
        )
      );
    });
    return unsubscribe;
  }, []);

  const activePlugins = useMemo(
    () => authPlugins.filter(p => p.isActive),
    [authPlugins]
  );

  const getProviderPlugin = useCallback(
    (provider: string) => activePlugins.find(p => p.provider === provider) || null,
    [activePlugins]
  );

  const signInWith = useCallback(
    async (provider: string) => {
      const plugin = getProviderPlugin(provider);
      if (!plugin) {
        throw new Error(`Social auth provider "${provider}" not available`);
      }
      return plugin.signIn();
    },
    [getProviderPlugin]
  );

  return {
    providers: activePlugins.map(p => p.provider),
    getProvider: getProviderPlugin,
    signInWith,
    hasGoogle: activePlugins.some(p => p.provider === 'google'),
    hasApple: activePlugins.some(p => p.provider === 'apple'),
    hasFacebook: activePlugins.some(p => p.provider === 'facebook'),
  };
}

/**
 * Hook for push notifications
 */
export function useNotifications() {
  const plugin = usePluginByCategory('notifications');
  const [isEnabled, setIsEnabled] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (plugin) {
      plugin.isEnabled().then(setIsEnabled);
      plugin.getToken().then(setToken);
    }
  }, [plugin]);

  const requestPermissions = useCallback(async () => {
    if (!plugin) return false;
    const granted = await plugin.requestPermissions();
    setIsEnabled(granted);
    if (granted) {
      const newToken = await plugin.getToken();
      setToken(newToken);
    }
    return granted;
  }, [plugin]);

  return {
    isAvailable: plugin !== null,
    isEnabled,
    token,
    requestPermissions,
    scheduleLocal: plugin?.scheduleLocal.bind(plugin),
    cancel: plugin?.cancel.bind(plugin),
    plugin,
  };
}

/**
 * Hook for barcode/QR scanner
 */
export function useScanner() {
  const plugin = usePluginByCategory('scanner');
  const [isScanning, setIsScanning] = useState(false);

  const startScan = useCallback(async () => {
    if (!plugin) {
      throw new Error('Scanner plugin not available');
    }
    setIsScanning(true);
    try {
      const result = await plugin.startScan();
      return result;
    } finally {
      setIsScanning(false);
    }
  }, [plugin]);

  const stopScan = useCallback(() => {
    if (plugin) {
      plugin.stopScan();
      setIsScanning(false);
    }
  }, [plugin]);

  return {
    isAvailable: plugin !== null,
    isScanning,
    startScan,
    stopScan,
    plugin,
  };
}

/**
 * Hook for analytics
 */
export function useAnalytics() {
  const plugin = usePluginByCategory('analytics');

  const trackScreen = useCallback(
    (screenName: string, params?: Record<string, unknown>) => {
      plugin?.trackScreen(screenName, params);
    },
    [plugin]
  );

  const trackEvent = useCallback(
    (eventName: string, params?: Record<string, unknown>) => {
      plugin?.trackEvent(eventName, params);
    },
    [plugin]
  );

  const trackEcommerce = useCallback(
    (event: Parameters<AnalyticsPlugin['trackEcommerce']>[0]) => {
      plugin?.trackEcommerce(event);
    },
    [plugin]
  );

  return {
    isAvailable: plugin !== null,
    trackScreen,
    trackEvent,
    trackEcommerce,
    setUserId: plugin?.setUserId.bind(plugin),
    setUserProperties: plugin?.setUserProperties.bind(plugin),
  };
}

/**
 * Hook for offline mode
 */
export function useOffline() {
  const plugin = usePluginByCategory('offline');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (plugin) {
      setIsOnline(plugin.isOnline());
      return plugin.onConnectivityChange(setIsOnline);
    }
    return undefined;
  }, [plugin]);

  const cache = useCallback(
    async (key: string, data: unknown, ttl?: number) => {
      if (!plugin) return;
      await plugin.cache(key, data, ttl);
    },
    [plugin]
  );

  const getCached = useCallback(
    async <T>(key: string): Promise<T | null> => {
      if (!plugin) return null;
      return plugin.getCached<T>(key);
    },
    [plugin]
  );

  return {
    isAvailable: plugin !== null,
    isOnline,
    cache,
    getCached,
    clearCache: plugin?.clearCache.bind(plugin),
    queueAction: plugin?.queueAction.bind(plugin),
    processQueue: plugin?.processQueue.bind(plugin),
  };
}

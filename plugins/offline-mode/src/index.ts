/**
 * Offline Mode Plugin
 *
 * Offline support with data caching and action queuing.
 * Uses AsyncStorage for persistence and NetInfo for connectivity.
 */

import type {
  OfflinePlugin,
  OfflineAction,
  PluginConfig,
} from '@ridly/mobile-core';
import { createPlugin } from '@ridly/mobile-core';

/**
 * Action handler function type
 */
export type ActionHandler = (action: OfflineAction) => Promise<void>;

/**
 * Offline Mode configuration
 */
export interface OfflineModeConfig extends PluginConfig {
  /** Cache prefix */
  cachePrefix?: string;
  /** Default TTL in seconds */
  defaultTTL?: number;
  /** Max queue size */
  maxQueueSize?: number;
  /** Auto process queue on reconnect */
  autoProcessQueue?: boolean;
  /** Custom action handlers */
  actionHandlers?: Record<string, ActionHandler>;
  /** Get adapter for cart/order operations */
  getAdapter?: () => import('@ridly/mobile-core').ECommerceAdapter;
  /** Get auth token for authenticated requests */
  getAuthToken?: () => Promise<string | null>;
}

/**
 * Cached item structure
 */
interface CachedItem<T = unknown> {
  data: T;
  expiresAt: number | null;
  createdAt: number;
}

/**
 * Create Offline Mode Plugin
 */
export function createOfflineModePlugin(): OfflinePlugin {
  let config: OfflineModeConfig | null = null;
  let isOnlineState = true;
  let connectivityListeners: Set<(isOnline: boolean) => void> = new Set();
  let unsubscribeNetInfo: (() => void) | null = null;
  let actionQueue: OfflineAction[] = [];

  const CACHE_PREFIX = '@ridly_cache:';
  const QUEUE_KEY = '@ridly_offline_queue';

  const plugin = createPlugin<OfflinePlugin>({
    metadata: {
      id: 'offline-mode',
      name: 'Offline Mode',
      version: '1.0.0',
      category: 'offline',
      description: 'Offline support with caching and action queue',
      author: 'RIDLY',
      platforms: ['any'],
      isPremium: true,
    },

    isActive: false,

    async initialize(cfg?: PluginConfig): Promise<void> {
      config = (cfg as OfflineModeConfig) || {
        cachePrefix: CACHE_PREFIX,
        defaultTTL: 3600, // 1 hour
        maxQueueSize: 100,
        autoProcessQueue: true,
      };

      try {
        // Dynamic import for @react-native-community/netinfo
        const NetInfo = await import('@react-native-community/netinfo');

        // Get initial state
        const state = await NetInfo.fetch();
        isOnlineState = state.isConnected ?? true;

        // Subscribe to changes
        unsubscribeNetInfo = NetInfo.addEventListener((state) => {
          const wasOnline = isOnlineState;
          isOnlineState = state.isConnected ?? true;

          // Notify listeners
          connectivityListeners.forEach(listener => listener(isOnlineState));

          // Auto process queue on reconnect
          if (!wasOnline && isOnlineState && config?.autoProcessQueue) {
            plugin.processQueue();
          }
        });

        // Load queued actions
        await loadQueue();

        console.log('[OfflineMode] Initialized, online:', isOnlineState);
      } catch (error) {
        console.error('[OfflineMode] Failed to initialize:', error);
        // Fallback: assume online
        isOnlineState = true;
      }
    },

    async cleanup(): Promise<void> {
      unsubscribeNetInfo?.();
      unsubscribeNetInfo = null;
      connectivityListeners.clear();
      console.log('[OfflineMode] Cleaned up');
    },

    isOnline(): boolean {
      return isOnlineState;
    },

    onConnectivityChange(handler: (isOnline: boolean) => void): () => void {
      connectivityListeners.add(handler);
      return () => {
        connectivityListeners.delete(handler);
      };
    },

    async cache(key: string, data: unknown, ttl?: number): Promise<void> {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const storage = AsyncStorage.default;

        const cacheKey = (config?.cachePrefix || CACHE_PREFIX) + key;
        const ttlSeconds = ttl ?? config?.defaultTTL ?? 3600;

        const item: CachedItem = {
          data,
          expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
          createdAt: Date.now(),
        };

        await storage.setItem(cacheKey, JSON.stringify(item));
      } catch (error) {
        console.error('[OfflineMode] Cache error:', error);
      }
    },

    async getCached<T>(key: string): Promise<T | null> {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const storage = AsyncStorage.default;

        const cacheKey = (config?.cachePrefix || CACHE_PREFIX) + key;
        const stored = await storage.getItem(cacheKey);

        if (!stored) return null;

        const item: CachedItem<T> = JSON.parse(stored);

        // Check expiration
        if (item.expiresAt && Date.now() > item.expiresAt) {
          await storage.removeItem(cacheKey);
          return null;
        }

        return item.data;
      } catch (error) {
        console.error('[OfflineMode] Get cached error:', error);
        return null;
      }
    },

    async clearCache(key?: string): Promise<void> {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const storage = AsyncStorage.default;

        if (key) {
          const cacheKey = (config?.cachePrefix || CACHE_PREFIX) + key;
          await storage.removeItem(cacheKey);
        } else {
          // Clear all cached items with prefix
          const allKeys = await storage.getAllKeys();
          const cacheKeys = allKeys.filter(k =>
            k.startsWith(config?.cachePrefix || CACHE_PREFIX)
          );
          await storage.multiRemove(cacheKeys);
        }
      } catch (error) {
        console.error('[OfflineMode] Clear cache error:', error);
      }
    },

    async queueAction(action: OfflineAction): Promise<void> {
      const maxSize = config?.maxQueueSize ?? 100;

      if (actionQueue.length >= maxSize) {
        console.warn('[OfflineMode] Queue full, removing oldest action');
        actionQueue.shift();
      }

      actionQueue.push({
        ...action,
        id: action.id || `action_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        createdAt: action.createdAt || new Date().toISOString(),
        retryCount: action.retryCount ?? 0,
      });

      await saveQueue();
      console.log('[OfflineMode] Action queued:', action.type);
    },

    async processQueue(): Promise<void> {
      if (!isOnlineState) {
        console.log('[OfflineMode] Cannot process queue: offline');
        return;
      }

      if (actionQueue.length === 0) {
        console.log('[OfflineMode] Queue is empty');
        return;
      }

      console.log('[OfflineMode] Processing queue:', actionQueue.length, 'actions');

      const processedIds: string[] = [];
      const failedActions: OfflineAction[] = [];

      for (const action of actionQueue) {
        try {
          // Process action based on type
          // This is where you would dispatch to appropriate handlers
          await processAction(action);
          processedIds.push(action.id);
          console.log('[OfflineMode] Processed action:', action.id);
        } catch (error) {
          console.error('[OfflineMode] Failed to process action:', action.id, error);

          // Retry logic
          if ((action.retryCount ?? 0) < 3) {
            failedActions.push({
              ...action,
              retryCount: (action.retryCount ?? 0) + 1,
            });
          }
        }
      }

      // Update queue with failed actions only
      actionQueue = failedActions;
      await saveQueue();

      console.log('[OfflineMode] Queue processed. Remaining:', actionQueue.length);
    },
  });

  // Helper functions
  async function loadQueue(): Promise<void> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const storage = AsyncStorage.default;

      const stored = await storage.getItem(QUEUE_KEY);
      if (stored) {
        actionQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[OfflineMode] Failed to load queue:', error);
      actionQueue = [];
    }
  }

  async function saveQueue(): Promise<void> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const storage = AsyncStorage.default;

      await storage.setItem(QUEUE_KEY, JSON.stringify(actionQueue));
    } catch (error) {
      console.error('[OfflineMode] Failed to save queue:', error);
    }
  }

  async function processAction(action: OfflineAction): Promise<void> {
    // Check for custom handler first
    if (config?.actionHandlers?.[action.type]) {
      await config.actionHandlers[action.type](action);
      return;
    }

    // Built-in handlers for common e-commerce operations
    switch (action.type) {
      case 'api-request': {
        const { url, method, body, headers: customHeaders } = action.payload as {
          url: string;
          method: string;
          body?: unknown;
          headers?: Record<string, string>;
        };

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...customHeaders,
        };

        // Add auth token if available
        if (config?.getAuthToken) {
          const token = await config.getAuthToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }
        break;
      }

      case 'add-to-cart': {
        const adapter = config?.getAdapter?.();
        if (!adapter) {
          throw new Error('Adapter not configured for add-to-cart action');
        }

        const { productId, quantity, options } = action.payload as {
          productId: string;
          quantity: number;
          options?: Record<string, string>;
        };

        await adapter.addToCart({
          productId,
          quantity,
          options,
        });
        break;
      }

      case 'update-cart-item': {
        const adapter = config?.getAdapter?.();
        if (!adapter) {
          throw new Error('Adapter not configured for update-cart-item action');
        }

        const { itemId, quantity } = action.payload as {
          itemId: string;
          quantity: number;
        };

        await adapter.updateCartItem(itemId, quantity);
        break;
      }

      case 'remove-cart-item': {
        const adapter = config?.getAdapter?.();
        if (!adapter) {
          throw new Error('Adapter not configured for remove-cart-item action');
        }

        const { itemId } = action.payload as { itemId: string };
        await adapter.removeCartItem(itemId);
        break;
      }

      case 'add-to-wishlist': {
        const adapter = config?.getAdapter?.();
        if (!adapter) {
          throw new Error('Adapter not configured for add-to-wishlist action');
        }

        const { productId } = action.payload as { productId: string };
        await adapter.addToWishlist(productId);
        break;
      }

      case 'remove-from-wishlist': {
        const adapter = config?.getAdapter?.();
        if (!adapter) {
          throw new Error('Adapter not configured for remove-from-wishlist action');
        }

        const { itemId } = action.payload as { itemId: string };
        await adapter.removeFromWishlist(itemId);
        break;
      }

      case 'apply-coupon': {
        const adapter = config?.getAdapter?.();
        if (!adapter) {
          throw new Error('Adapter not configured for apply-coupon action');
        }

        const { code } = action.payload as { code: string };
        await adapter.applyCoupon(code);
        break;
      }

      case 'subscribe-newsletter': {
        const adapter = config?.getAdapter?.();
        if (!adapter) {
          throw new Error('Adapter not configured for subscribe-newsletter action');
        }

        const { email } = action.payload as { email: string };
        await adapter.subscribeToNewsletter(email);
        break;
      }

      case 'submit-review': {
        const adapter = config?.getAdapter?.();
        if (!adapter) {
          throw new Error('Adapter not configured for submit-review action');
        }

        const { productId, review } = action.payload as {
          productId: string;
          review: { title: string; content: string; rating: number; nickname?: string };
        };

        await adapter.submitProductReview(productId, review);
        break;
      }

      default:
        console.warn('[OfflineMode] Unknown action type:', action.type);
        // Don't throw - just log and continue
    }
  }

  return plugin;
}

/**
 * Default export
 */
export default createOfflineModePlugin;

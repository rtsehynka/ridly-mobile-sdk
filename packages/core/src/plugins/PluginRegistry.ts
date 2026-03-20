/**
 * Plugin Registry
 *
 * Central registry for managing RIDLY plugins.
 * Handles registration, activation, and retrieval of plugins.
 * Auto-selects appropriate plugin based on platform config.
 */

import type {
  RidlyPlugin,
  PluginCategory,
  Platform,
  PluginConfig,
  PluginRegistrationOptions,
  SearchPlugin,
  PaymentPlugin,
  SocialAuthPlugin,
  NotificationsPlugin,
  ScannerPlugin,
  AnalyticsPlugin,
  OfflinePlugin,
} from './types';

/**
 * Plugin registry state
 */
interface RegistryState {
  plugins: Map<string, RidlyPlugin>;
  configs: Map<string, PluginConfig>;
  activePlugins: Set<string>;
  currentPlatform: Platform;
  initialized: boolean;
}

/**
 * Plugin type mapping for type-safe retrieval
 */
interface PluginTypeMap {
  search: SearchPlugin;
  payment: PaymentPlugin;
  auth: SocialAuthPlugin;
  notifications: NotificationsPlugin;
  scanner: ScannerPlugin;
  analytics: AnalyticsPlugin;
  offline: OfflinePlugin;
}

/**
 * Plugin Registry class
 */
class PluginRegistryClass {
  private state: RegistryState = {
    plugins: new Map(),
    configs: new Map(),
    activePlugins: new Set(),
    currentPlatform: 'any',
    initialized: false,
  };

  private listeners: Set<() => void> = new Set();

  /**
   * Initialize the registry with platform config
   */
  async initialize(platform: Platform): Promise<void> {
    if (this.state.initialized) {
      console.warn('[PluginRegistry] Already initialized');
      return;
    }

    this.state.currentPlatform = platform;
    this.state.initialized = true;

    console.log(`[PluginRegistry] Initialized for platform: ${platform}`);
  }

  /**
   * Register a plugin
   */
  async register(options: PluginRegistrationOptions): Promise<void> {
    const { plugin, config, autoActivate = false, override = false } = options;
    const { id, platforms } = plugin.metadata;

    // Check if plugin already exists
    if (this.state.plugins.has(id) && !override) {
      throw new Error(`[PluginRegistry] Plugin "${id}" is already registered. Use override: true to replace.`);
    }

    // Check platform compatibility
    if (!platforms.includes('any') && !platforms.includes(this.state.currentPlatform)) {
      console.warn(
        `[PluginRegistry] Plugin "${id}" is not compatible with platform "${this.state.currentPlatform}". ` +
        `Supported: ${platforms.join(', ')}`
      );
      return;
    }

    // Store plugin and config
    this.state.plugins.set(id, plugin);
    if (config) {
      this.state.configs.set(id, config);
    }

    // Call lifecycle hook
    await plugin.onRegister?.();

    console.log(`[PluginRegistry] Registered plugin: ${id}`);

    // Auto-activate if requested
    if (autoActivate) {
      await this.activate(id);
    }

    this.notifyListeners();
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.state.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`[PluginRegistry] Plugin "${pluginId}" not found`);
      return;
    }

    // Deactivate if active
    if (this.state.activePlugins.has(pluginId)) {
      await this.deactivate(pluginId);
    }

    // Call lifecycle hook
    await plugin.onUnregister?.();

    // Remove from registry
    this.state.plugins.delete(pluginId);
    this.state.configs.delete(pluginId);

    console.log(`[PluginRegistry] Unregistered plugin: ${pluginId}`);
    this.notifyListeners();
  }

  /**
   * Activate a plugin
   */
  async activate(pluginId: string): Promise<void> {
    const plugin = this.state.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`[PluginRegistry] Plugin "${pluginId}" not found`);
    }

    if (this.state.activePlugins.has(pluginId)) {
      console.warn(`[PluginRegistry] Plugin "${pluginId}" is already active`);
      return;
    }

    // Initialize with config
    const config = this.state.configs.get(pluginId);
    await plugin.initialize(config);

    // Call lifecycle hook
    await plugin.onActivate?.();

    plugin.isActive = true;
    this.state.activePlugins.add(pluginId);

    console.log(`[PluginRegistry] Activated plugin: ${pluginId}`);
    this.notifyListeners();
  }

  /**
   * Deactivate a plugin
   */
  async deactivate(pluginId: string): Promise<void> {
    const plugin = this.state.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`[PluginRegistry] Plugin "${pluginId}" not found`);
      return;
    }

    if (!this.state.activePlugins.has(pluginId)) {
      console.warn(`[PluginRegistry] Plugin "${pluginId}" is not active`);
      return;
    }

    // Call lifecycle hook
    await plugin.onDeactivate?.();

    // Cleanup
    await plugin.cleanup();

    plugin.isActive = false;
    this.state.activePlugins.delete(pluginId);

    console.log(`[PluginRegistry] Deactivated plugin: ${pluginId}`);
    this.notifyListeners();
  }

  /**
   * Get a plugin by ID
   */
  get<T extends RidlyPlugin>(pluginId: string): T | null {
    const plugin = this.state.plugins.get(pluginId);
    return (plugin as T) || null;
  }

  /**
   * Alias for get() - Get a plugin by ID
   */
  getPlugin<T extends RidlyPlugin>(pluginId: string): T | null {
    return this.get<T>(pluginId);
  }

  /**
   * Get active plugin by category
   * Returns the first active plugin matching the category
   */
  getByCategory<K extends keyof PluginTypeMap>(category: K): PluginTypeMap[K] | null {
    for (const pluginId of this.state.activePlugins) {
      const plugin = this.state.plugins.get(pluginId);
      if (plugin?.metadata.category === category) {
        return plugin as PluginTypeMap[K];
      }
    }
    return null;
  }

  /**
   * Get all plugins by category
   */
  getAllByCategory<K extends keyof PluginTypeMap>(category: K): PluginTypeMap[K][] {
    const plugins: PluginTypeMap[K][] = [];
    for (const plugin of this.state.plugins.values()) {
      if (plugin.metadata.category === category) {
        plugins.push(plugin as PluginTypeMap[K]);
      }
    }
    return plugins;
  }

  /**
   * Get all active plugins
   */
  getActivePlugins(): RidlyPlugin[] {
    return Array.from(this.state.activePlugins)
      .map(id => this.state.plugins.get(id))
      .filter((p): p is RidlyPlugin => p !== undefined);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): RidlyPlugin[] {
    return Array.from(this.state.plugins.values());
  }

  /**
   * Check if a plugin is registered
   */
  has(pluginId: string): boolean {
    return this.state.plugins.has(pluginId);
  }

  /**
   * Check if a plugin is active
   */
  isActive(pluginId: string): boolean {
    return this.state.activePlugins.has(pluginId);
  }

  /**
   * Check if a category has an active plugin
   */
  hasActivePlugin(category: PluginCategory): boolean {
    return this.getByCategory(category as keyof PluginTypeMap) !== null;
  }

  /**
   * Get current platform
   */
  getPlatform(): Platform {
    return this.state.currentPlatform;
  }

  /**
   * Subscribe to registry changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Reset the registry (for testing)
   */
  async reset(): Promise<void> {
    // Deactivate all plugins
    for (const pluginId of this.state.activePlugins) {
      await this.deactivate(pluginId);
    }

    // Unregister all plugins
    for (const pluginId of this.state.plugins.keys()) {
      await this.unregister(pluginId);
    }

    this.state = {
      plugins: new Map(),
      configs: new Map(),
      activePlugins: new Set(),
      currentPlatform: 'any',
      initialized: false,
    };

    this.listeners.clear();
  }
}

/**
 * Singleton instance
 */
export const PluginRegistry = new PluginRegistryClass();

/**
 * Helper function to create a plugin with proper typing
 */
export function createPlugin<T extends RidlyPlugin>(plugin: T): T {
  return {
    ...plugin,
    isActive: false,
  };
}

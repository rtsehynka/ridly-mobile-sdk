/**
 * Plugin System Types
 *
 * Core types and interfaces for the RIDLY plugin system.
 * Plugins are backend-agnostic and auto-selected based on config.
 */

/**
 * Plugin categories
 */
export type PluginCategory =
  | 'search'
  | 'payment'
  | 'auth'
  | 'notifications'
  | 'analytics'
  | 'scanner'
  | 'offline'
  | 'shipping'
  | 'reviews'
  | 'loyalty'
  | 'custom';

/**
 * Supported e-commerce platforms
 */
export type Platform = 'magento' | 'shopify' | 'shopware' | 'woocommerce' | 'any';

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  /** Unique plugin identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin category */
  category: PluginCategory;
  /** Description */
  description?: string;
  /** Author */
  author?: string;
  /** Supported platforms ('any' for platform-agnostic) */
  platforms: Platform[];
  /** Required permissions */
  permissions?: string[];
  /** Dependencies on other plugins */
  dependencies?: string[];
  /** Is this a premium plugin? */
  isPremium?: boolean;
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginLifecycle {
  /** Called when plugin is registered */
  onRegister?: () => void | Promise<void>;
  /** Called when plugin is activated */
  onActivate?: () => void | Promise<void>;
  /** Called when plugin is deactivated */
  onDeactivate?: () => void | Promise<void>;
  /** Called when plugin is unregistered */
  onUnregister?: () => void | Promise<void>;
}

/**
 * Base plugin interface - all plugins must implement this
 */
export interface RidlyPlugin extends PluginLifecycle {
  /** Plugin metadata */
  readonly metadata: PluginMetadata;
  /** Is plugin currently active? */
  isActive: boolean;
  /** Initialize plugin with config */
  initialize(config?: Record<string, unknown>): Promise<void>;
  /** Cleanup plugin resources */
  cleanup(): Promise<void>;
}

/**
 * Search plugin interface
 */
export interface SearchPlugin extends RidlyPlugin {
  metadata: PluginMetadata & { category: 'search' };
  /** Search products */
  search(query: string, options?: SearchOptions): Promise<SearchResult>;
  /** Get search suggestions */
  suggest(query: string, limit?: number): Promise<string[]>;
  /** Index products (for plugins that support it) */
  indexProducts?(products: unknown[]): Promise<void>;
}

export interface SearchOptions {
  page?: number;
  pageSize?: number;
  filters?: Record<string, string | string[]>;
  sort?: { field: string; direction: 'asc' | 'desc' };
  categoryId?: string;
}

export interface SearchResult {
  items: unknown[]; // Will be Product[] when imported
  totalCount: number;
  facets?: SearchFacet[];
  suggestions?: string[];
}

export interface SearchFacet {
  field: string;
  label: string;
  values: Array<{ value: string; label: string; count: number }>;
}

/**
 * Payment Intent provider - fetches client secret from backend
 */
export interface PaymentIntentProvider {
  /** Create PaymentIntent on server and return client_secret */
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResponse>;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  orderId?: string;
  customerId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  ephemeralKey?: string;
  customerId?: string;
}

/**
 * Payment plugin interface
 */
export interface PaymentPlugin extends RidlyPlugin {
  metadata: PluginMetadata & { category: 'payment' };
  /** Check if payment method is available */
  isAvailable(): Promise<boolean>;
  /** Set the payment intent provider (for fetching clientSecret from backend) */
  setPaymentIntentProvider(provider: PaymentIntentProvider): void;
  /** Initialize payment session */
  createPaymentSession(amount: number, currency: string, orderId?: string): Promise<PaymentSession>;
  /** Process payment */
  processPayment(session: PaymentSession): Promise<PaymentResult>;
  /** Handle payment callback/webhook */
  handleCallback?(data: unknown): Promise<PaymentResult>;
}

export interface PaymentSession {
  id: string;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentIntentId?: string;
  error?: string;
  redirectUrl?: string;
}

/**
 * Social auth plugin interface
 */
export interface SocialAuthPlugin extends RidlyPlugin {
  metadata: PluginMetadata & { category: 'auth' };
  /** Provider name (google, apple, facebook) */
  readonly provider: string;
  /** Check if provider is available */
  isAvailable(): Promise<boolean>;
  /** Sign in with provider */
  signIn(): Promise<SocialAuthResult>;
  /** Sign out */
  signOut(): Promise<void>;
  /** Get current user info */
  getCurrentUser(): Promise<SocialUser | null>;
}

export interface SocialAuthResult {
  success: boolean;
  user?: SocialUser;
  tokens?: {
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
  };
  error?: string;
}

export interface SocialUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  provider: string;
}

/**
 * Push notifications plugin interface
 */
export interface NotificationsPlugin extends RidlyPlugin {
  metadata: PluginMetadata & { category: 'notifications' };
  /** Request notification permissions */
  requestPermissions(): Promise<boolean>;
  /** Check if notifications are enabled */
  isEnabled(): Promise<boolean>;
  /** Get push token */
  getToken(): Promise<string | null>;
  /** Register device with backend */
  registerDevice(token: string): Promise<void>;
  /** Handle incoming notification */
  onNotificationReceived(handler: NotificationHandler): void;
  /** Handle notification tap */
  onNotificationTapped(handler: NotificationHandler): void;
  /** Schedule local notification */
  scheduleLocal(notification: LocalNotification): Promise<string>;
  /** Cancel notification */
  cancel(notificationId: string): Promise<void>;
}

export type NotificationHandler = (notification: PushNotification) => void;

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
}

export interface LocalNotification extends Omit<PushNotification, 'id'> {
  triggerAt?: Date;
  repeatInterval?: 'minute' | 'hour' | 'day' | 'week';
}

/**
 * Barcode/QR scanner plugin interface
 */
export interface ScannerPlugin extends RidlyPlugin {
  metadata: PluginMetadata & { category: 'scanner' };
  /** Check if camera is available */
  isAvailable(): Promise<boolean>;
  /** Request camera permissions */
  requestPermissions(): Promise<boolean>;
  /** Start scanning */
  startScan(): Promise<ScanResult>;
  /** Stop scanning */
  stopScan(): void;
  /** Parse barcode to product */
  parseBarcode?(code: string): Promise<unknown>;
}

export interface ScanResult {
  type: 'barcode' | 'qr';
  data: string;
  format?: string;
}

/**
 * Analytics plugin interface
 */
export interface AnalyticsPlugin extends RidlyPlugin {
  metadata: PluginMetadata & { category: 'analytics' };
  /** Track screen view */
  trackScreen(screenName: string, params?: Record<string, unknown>): void;
  /** Track custom event */
  trackEvent(eventName: string, params?: Record<string, unknown>): void;
  /** Track e-commerce event */
  trackEcommerce(event: EcommerceEvent): void;
  /** Set user properties */
  setUserProperties(properties: Record<string, unknown>): void;
  /** Set user ID */
  setUserId(userId: string | null): void;
}

export type EcommerceEvent =
  | { type: 'view_item'; item: unknown }
  | { type: 'add_to_cart'; item: unknown; quantity: number }
  | { type: 'remove_from_cart'; item: unknown; quantity: number }
  | { type: 'begin_checkout'; cart: unknown }
  | { type: 'purchase'; order: unknown; transactionId: string };

/**
 * Offline mode plugin interface
 */
export interface OfflinePlugin extends RidlyPlugin {
  metadata: PluginMetadata & { category: 'offline' };
  /** Check if device is online */
  isOnline(): boolean;
  /** Subscribe to connectivity changes */
  onConnectivityChange(handler: (isOnline: boolean) => void): () => void;
  /** Cache data for offline use */
  cache(key: string, data: unknown, ttl?: number): Promise<void>;
  /** Get cached data */
  getCached<T>(key: string): Promise<T | null>;
  /** Clear cache */
  clearCache(key?: string): Promise<void>;
  /** Queue action for when online */
  queueAction(action: OfflineAction): Promise<void>;
  /** Process queued actions */
  processQueue(): Promise<void>;
}

export interface OfflineAction {
  id: string;
  type: string;
  payload: unknown;
  createdAt: string;
  retryCount?: number;
}

/**
 * Plugin configuration passed during registration
 */
export interface PluginConfig {
  /** Plugin-specific configuration */
  [key: string]: unknown;
}

/**
 * Plugin registration options
 */
export interface PluginRegistrationOptions {
  /** Plugin instance */
  plugin: RidlyPlugin;
  /** Plugin configuration */
  config?: PluginConfig;
  /** Auto-activate on registration */
  autoActivate?: boolean;
  /** Override existing plugin with same ID */
  override?: boolean;
}

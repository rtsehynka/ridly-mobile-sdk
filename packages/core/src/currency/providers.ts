/**
 * Exchange Rate Providers
 *
 * Ready-to-use implementations of ExchangeRateProvider interface.
 * Supports multiple free and paid exchange rate APIs.
 */

import type { ExchangeRateProvider, CurrencyCode } from './types';

/**
 * Exchange Rate API Provider
 * Uses https://exchangerate-api.com/
 *
 * Free tier: 1,500 requests/month
 * No API key required for limited access
 */
export function createExchangeRateApiProvider(apiKey?: string): ExchangeRateProvider {
  const baseUrl = apiKey
    ? `https://v6.exchangerate-api.com/v6/${apiKey}`
    : 'https://open.er-api.com/v6';

  return {
    async getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
      const rates = await this.getAllRates(from);
      const rate = rates[to];
      if (rate === undefined) {
        throw new Error(`Exchange rate not available for ${from} -> ${to}`);
      }
      return rate;
    },

    async getAllRates(base: CurrencyCode): Promise<Record<CurrencyCode, number>> {
      const endpoint = apiKey ? `/latest/${base}` : `/latest/${base}`;
      const response = await fetch(`${baseUrl}${endpoint}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status}`);
      }

      const data = await response.json();

      if (data.result !== 'success') {
        throw new Error(data['error-type'] || 'Failed to fetch exchange rates');
      }

      return data.rates;
    },
  };
}

/**
 * Fixer.io Provider
 * Uses https://fixer.io/
 *
 * Free tier: 100 requests/month, EUR base only
 * Paid tiers: All base currencies
 */
export function createFixerProvider(apiKey: string): ExchangeRateProvider {
  const baseUrl = 'http://data.fixer.io/api';

  return {
    async getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
      const rates = await this.getAllRates(from);
      return rates[to] ?? 1;
    },

    async getAllRates(base: CurrencyCode): Promise<Record<CurrencyCode, number>> {
      const response = await fetch(
        `${baseUrl}/latest?access_key=${apiKey}&base=${base}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.info || 'Failed to fetch exchange rates');
      }

      return data.rates;
    },
  };
}

/**
 * Open Exchange Rates Provider
 * Uses https://openexchangerates.org/
 *
 * Free tier: 1,000 requests/month, USD base only
 * Paid tiers: All base currencies
 */
export function createOpenExchangeRatesProvider(
  appId: string
): ExchangeRateProvider {
  const baseUrl = 'https://openexchangerates.org/api';

  return {
    async getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
      const rates = await this.getAllRates(from);
      return rates[to] ?? 1;
    },

    async getAllRates(base: CurrencyCode): Promise<Record<CurrencyCode, number>> {
      // Free tier only supports USD base
      // We'll fetch USD rates and convert
      const response = await fetch(
        `${baseUrl}/latest.json?app_id=${appId}&base=${base}`
      );

      if (!response.ok) {
        // If base currency fails (free tier), try USD and convert
        if (response.status === 403 && base !== 'USD') {
          return this.getAllRatesViaUsd(base);
        }
        throw new Error(`Failed to fetch exchange rates: ${response.status}`);
      }

      const data = await response.json();
      return data.rates;
    },

    async getAllRatesViaUsd(
      base: CurrencyCode
    ): Promise<Record<CurrencyCode, number>> {
      const response = await fetch(
        `${baseUrl}/latest.json?app_id=${appId}&base=USD`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status}`);
      }

      const data = await response.json();
      const usdRates = data.rates;

      // Convert from USD rates to base currency rates
      const baseToUsd = usdRates[base];
      if (!baseToUsd) {
        throw new Error(`Base currency ${base} not available`);
      }

      const rates: Record<CurrencyCode, number> = {};
      for (const [currency, usdRate] of Object.entries(usdRates)) {
        rates[currency] = (usdRate as number) / baseToUsd;
      }
      rates[base] = 1;

      return rates;
    },
  } as ExchangeRateProvider & {
    getAllRatesViaUsd(base: CurrencyCode): Promise<Record<CurrencyCode, number>>;
  };
}

/**
 * Currency Beacon Provider
 * Uses https://currencybeacon.com/
 *
 * Free tier: 5,000 requests/month
 */
export function createCurrencyBeaconProvider(
  apiKey: string
): ExchangeRateProvider {
  const baseUrl = 'https://api.currencybeacon.com/v1';

  return {
    async getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
      const response = await fetch(
        `${baseUrl}/convert?api_key=${apiKey}&from=${from}&to=${to}&amount=1`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate: ${response.status}`);
      }

      const data = await response.json();
      return data.response.value;
    },

    async getAllRates(base: CurrencyCode): Promise<Record<CurrencyCode, number>> {
      const response = await fetch(
        `${baseUrl}/latest?api_key=${apiKey}&base=${base}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status}`);
      }

      const data = await response.json();
      return data.response.rates;
    },
  };
}

/**
 * Frankfurter Provider (European Central Bank)
 * Uses https://www.frankfurter.app/
 *
 * Completely free, no API key required
 * Updates daily (ECB rates)
 * Supports ~30 currencies
 */
export function createFrankfurterProvider(): ExchangeRateProvider {
  const baseUrl = 'https://api.frankfurter.app';

  return {
    async getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
      const response = await fetch(`${baseUrl}/latest?from=${from}&to=${to}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate: ${response.status}`);
      }

      const data = await response.json();
      return data.rates[to];
    },

    async getAllRates(base: CurrencyCode): Promise<Record<CurrencyCode, number>> {
      const response = await fetch(`${baseUrl}/latest?from=${base}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status}`);
      }

      const data = await response.json();
      // Add base currency with rate 1
      return { ...data.rates, [base]: 1 };
    },
  };
}

/**
 * Magento Store Provider
 * Fetches exchange rates from Magento backend
 *
 * Uses rates configured in Magento admin
 */
export function createMagentoExchangeProvider(
  storeUrl: string,
  authToken?: string
): ExchangeRateProvider {
  return {
    async getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
      const rates = await this.getAllRates(from);
      return rates[to] ?? 1;
    },

    async getAllRates(base: CurrencyCode): Promise<Record<CurrencyCode, number>> {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(
        `${storeUrl}/rest/V1/directory/currency`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status}`);
      }

      const data = await response.json();

      // Magento returns: { base_currency_code, exchange_rates: [{ currency_to, rate }] }
      const rates: Record<CurrencyCode, number> = { [base]: 1 };

      if (data.exchange_rates) {
        for (const rate of data.exchange_rates) {
          rates[rate.currency_to] = rate.rate;
        }
      }

      return rates;
    },
  };
}

/**
 * Static/Manual Provider
 * Uses predefined exchange rates
 *
 * Useful for testing or when rates are managed manually
 */
export function createStaticProvider(
  rates: Record<CurrencyCode, number>
): ExchangeRateProvider {
  return {
    async getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
      if (from === to) return 1;

      const fromRate = rates[from] ?? 1;
      const toRate = rates[to] ?? 1;

      // Convert: divide by source rate, multiply by target rate
      return toRate / fromRate;
    },

    async getAllRates(base: CurrencyCode): Promise<Record<CurrencyCode, number>> {
      const baseRate = rates[base] ?? 1;
      const result: Record<CurrencyCode, number> = {};

      for (const [currency, rate] of Object.entries(rates)) {
        result[currency] = rate / baseRate;
      }

      result[base] = 1;
      return result;
    },
  };
}

/**
 * Cached Provider Wrapper
 * Wraps any provider with caching to reduce API calls
 */
export function createCachedProvider(
  provider: ExchangeRateProvider,
  cacheDurationMs: number = 3600000 // 1 hour default
): ExchangeRateProvider {
  const cache: Map<string, { rates: Record<CurrencyCode, number>; timestamp: number }> =
    new Map();

  return {
    async getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
      const rates = await this.getAllRates(from);
      return rates[to] ?? 1;
    },

    async getAllRates(base: CurrencyCode): Promise<Record<CurrencyCode, number>> {
      const cached = cache.get(base);
      const now = Date.now();

      if (cached && now - cached.timestamp < cacheDurationMs) {
        return cached.rates;
      }

      const rates = await provider.getAllRates(base);
      cache.set(base, { rates, timestamp: now });

      return rates;
    },
  };
}

/**
 * Fallback Provider
 * Tries multiple providers in order until one succeeds
 *
 * @example
 * const provider = createFallbackProvider([
 *   createFrankfurterProvider(),      // Free, no API key
 *   createExchangeRateApiProvider(),   // Free tier
 *   createStaticProvider(fallbackRates), // Last resort
 * ]);
 */
export function createFallbackProvider(
  providers: ExchangeRateProvider[],
  options?: {
    /** Called when a provider fails */
    onProviderError?: (providerIndex: number, error: Error) => void;
    /** Called when all providers fail */
    onAllFailed?: (errors: Error[]) => void;
  }
): ExchangeRateProvider {
  if (providers.length === 0) {
    throw new Error('At least one provider is required');
  }

  return {
    async getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
      const rates = await this.getAllRates(from);
      return rates[to] ?? 1;
    },

    async getAllRates(base: CurrencyCode): Promise<Record<CurrencyCode, number>> {
      const errors: Error[] = [];

      for (let i = 0; i < providers.length; i++) {
        try {
          const rates = await providers[i].getAllRates(base);
          // Success - return rates
          return rates;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          errors.push(err);
          options?.onProviderError?.(i, err);
          console.warn(`[FallbackProvider] Provider ${i} failed:`, err.message);
          // Continue to next provider
        }
      }

      // All providers failed
      options?.onAllFailed?.(errors);

      // Return base currency only as absolute fallback
      console.error('[FallbackProvider] All providers failed, returning base rate only');
      return { [base]: 1 };
    },
  };
}

/**
 * Persistent Cached Provider
 * Caches rates to AsyncStorage for offline support
 */
export function createPersistentCachedProvider(
  provider: ExchangeRateProvider,
  options?: {
    /** Cache duration in milliseconds (default: 24 hours) */
    cacheDurationMs?: number;
    /** Storage key prefix */
    storagePrefix?: string;
  }
): ExchangeRateProvider {
  const cacheDurationMs = options?.cacheDurationMs ?? 86400000; // 24 hours
  const storagePrefix = options?.storagePrefix ?? '@ridly_currency_rates:';

  // In-memory cache as first level
  const memoryCache: Map<string, { rates: Record<CurrencyCode, number>; timestamp: number }> =
    new Map();

  async function getAsyncStorage() {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.default;
  }

  async function loadFromStorage(base: CurrencyCode): Promise<{ rates: Record<CurrencyCode, number>; timestamp: number } | null> {
    try {
      const storage = await getAsyncStorage();
      const stored = await storage.getItem(storagePrefix + base);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[PersistentCachedProvider] Failed to load from storage:', error);
    }
    return null;
  }

  async function saveToStorage(base: CurrencyCode, data: { rates: Record<CurrencyCode, number>; timestamp: number }): Promise<void> {
    try {
      const storage = await getAsyncStorage();
      await storage.setItem(storagePrefix + base, JSON.stringify(data));
    } catch (error) {
      console.warn('[PersistentCachedProvider] Failed to save to storage:', error);
    }
  }

  return {
    async getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
      const rates = await this.getAllRates(from);
      return rates[to] ?? 1;
    },

    async getAllRates(base: CurrencyCode): Promise<Record<CurrencyCode, number>> {
      const now = Date.now();

      // Check memory cache first
      const memCached = memoryCache.get(base);
      if (memCached && now - memCached.timestamp < cacheDurationMs) {
        return memCached.rates;
      }

      // Try to fetch fresh rates
      try {
        const rates = await provider.getAllRates(base);
        const cacheData = { rates, timestamp: now };

        // Update both caches
        memoryCache.set(base, cacheData);
        await saveToStorage(base, cacheData);

        return rates;
      } catch (fetchError) {
        console.warn('[PersistentCachedProvider] Failed to fetch fresh rates:', fetchError);

        // Fall back to storage cache (even if expired)
        const storageCached = await loadFromStorage(base);
        if (storageCached) {
          // Update memory cache with storage data
          memoryCache.set(base, storageCached);

          // Log if using stale data
          const ageHours = Math.round((now - storageCached.timestamp) / 3600000);
          console.log(`[PersistentCachedProvider] Using cached rates from ${ageHours}h ago`);

          return storageCached.rates;
        }

        // No cached data available
        console.error('[PersistentCachedProvider] No cached rates available');
        return { [base]: 1 };
      }
    },
  };
}

/**
 * Create a production-ready exchange rate provider with fallbacks and caching
 *
 * This is the recommended way to set up exchange rates for production:
 * - Uses multiple free APIs as fallbacks
 * - Caches rates persistently for offline support
 * - Provides sensible defaults
 *
 * @example
 * const provider = createProductionProvider({
 *   // Optional: provide API keys for better rate limits
 *   exchangeRateApiKey: 'your-key',
 * });
 */
export function createProductionProvider(options?: {
  /** ExchangeRate-API.com API key (optional, increases rate limits) */
  exchangeRateApiKey?: string;
  /** Cache duration in hours (default: 4) */
  cacheHours?: number;
  /** Fallback static rates when all APIs fail */
  fallbackRates?: Record<CurrencyCode, number>;
}): ExchangeRateProvider {
  const cacheMs = (options?.cacheHours ?? 4) * 3600000;

  // Default fallback rates (USD base, approximate values)
  const defaultFallbackRates: Record<CurrencyCode, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    UAH: 41.5,
    PLN: 4.0,
    CAD: 1.36,
    AUD: 1.53,
    JPY: 149.5,
    CHF: 0.88,
    CNY: 7.24,
    INR: 83.4,
    BRL: 4.97,
    MXN: 17.15,
    KRW: 1330,
    SEK: 10.5,
    NOK: 10.7,
    DKK: 6.9,
    NZD: 1.64,
    SGD: 1.34,
    HKD: 7.82,
    ...options?.fallbackRates,
  };

  // Create providers chain
  const providers: ExchangeRateProvider[] = [
    // Primary: Frankfurter (free, no API key, ECB rates)
    createFrankfurterProvider(),

    // Secondary: ExchangeRate API (free tier or with key)
    createExchangeRateApiProvider(options?.exchangeRateApiKey),

    // Tertiary: Static fallback rates
    createStaticProvider(defaultFallbackRates),
  ];

  // Create fallback chain
  const fallbackProvider = createFallbackProvider(providers, {
    onProviderError: (index, error) => {
      const names = ['Frankfurter', 'ExchangeRateAPI', 'Static'];
      console.warn(`[ExchangeRates] ${names[index]} failed:`, error.message);
    },
    onAllFailed: () => {
      console.error('[ExchangeRates] All providers failed!');
    },
  });

  // Wrap with persistent caching
  return createPersistentCachedProvider(fallbackProvider, {
    cacheDurationMs: cacheMs,
    storagePrefix: '@ridly_exchange_rates:',
  });
}

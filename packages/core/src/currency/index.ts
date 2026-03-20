/**
 * Currency System
 *
 * Multi-currency support for RIDLY Mobile.
 * Provides currency formatting, conversion, and display.
 */

// Types - Note: Money and CurrencyConfig are exported from core types
// These are re-exported as CurrencyMoney and CurrencyFormatConfig to avoid conflicts
export type {
  CurrencyCode,
  CurrencyState,
  CurrencyServiceConfig,
  PriceDisplayOptions,
  ExchangeRateProvider,
} from './types';

export type { CurrencyConfig as CurrencyFormatConfig } from './types';
export type { Money as CurrencyMoney } from './types';

// Constants
export { COMMON_CURRENCIES } from './types';

// Store
export { CurrencyStore } from './CurrencyStore';

// Hooks
export {
  useCurrency,
  useCurrencySelector,
  useFormattedPrice,
  useFormattedMoney,
} from './hooks';

// Provider
export { CurrencyProvider, useCurrencyContext } from './CurrencyProvider';

// Exchange Rate Providers
export {
  createExchangeRateApiProvider,
  createFixerProvider,
  createOpenExchangeRatesProvider,
  createCurrencyBeaconProvider,
  createFrankfurterProvider,
  createMagentoExchangeProvider,
  createStaticProvider,
  createCachedProvider,
  createFallbackProvider,
  createPersistentCachedProvider,
  createProductionProvider,
} from './providers';

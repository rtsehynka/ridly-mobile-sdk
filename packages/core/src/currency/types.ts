/**
 * Currency System Types
 *
 * Core types for multi-currency support.
 * Handles currency formatting, conversion, and display.
 */

/**
 * ISO 4217 currency code
 */
export type CurrencyCode = string; // e.g., 'USD', 'EUR', 'UAH'

/**
 * Currency configuration
 */
export interface CurrencyConfig {
  /** ISO 4217 currency code */
  code: CurrencyCode;
  /** Display name */
  name: string;
  /** Currency symbol */
  symbol: string;
  /** Symbol position */
  symbolPosition: 'before' | 'after';
  /** Number of decimal places */
  decimalPlaces: number;
  /** Decimal separator */
  decimalSeparator: string;
  /** Thousands separator */
  thousandsSeparator: string;
  /** Exchange rate to base currency */
  exchangeRate?: number;
}

/**
 * Money value - immutable representation of monetary amount
 */
export interface Money {
  /** Amount in smallest currency unit (cents, kopecks, etc.) */
  amount: number;
  /** Currency code */
  currency: CurrencyCode;
}

/**
 * Price display options
 */
export interface PriceDisplayOptions {
  /** Show currency symbol */
  showSymbol?: boolean;
  /** Show currency code */
  showCode?: boolean;
  /** Number of decimal places (override currency default) */
  decimalPlaces?: number;
  /** Show + sign for positive amounts */
  showPositiveSign?: boolean;
  /** Use compact notation for large numbers */
  compact?: boolean;
}

/**
 * Currency store state
 */
export interface CurrencyState {
  /** Base currency (from store config) */
  baseCurrency: CurrencyCode;
  /** Current display currency */
  currentCurrency: CurrencyCode;
  /** Available currencies */
  currencies: Map<CurrencyCode, CurrencyConfig>;
  /** Is initialized */
  initialized: boolean;
}

/**
 * Currency service configuration
 */
export interface CurrencyServiceConfig {
  /** Base/default currency */
  baseCurrency: CurrencyCode;
  /** Available currencies */
  currencies: CurrencyConfig[];
  /** Exchange rate provider */
  exchangeRateProvider?: ExchangeRateProvider;
  /** Auto-update exchange rates */
  autoUpdateRates?: boolean;
  /** Update interval in milliseconds */
  updateInterval?: number;
}

/**
 * Exchange rate provider interface
 */
export interface ExchangeRateProvider {
  /** Get exchange rate from base to target currency */
  getRate(from: CurrencyCode, to: CurrencyCode): Promise<number>;
  /** Get all rates from base currency */
  getAllRates(base: CurrencyCode): Promise<Record<CurrencyCode, number>>;
}

/**
 * Common currencies configuration
 */
export const COMMON_CURRENCIES: Record<string, Omit<CurrencyConfig, 'exchangeRate'>> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  UAH: {
    code: 'UAH',
    name: 'Ukrainian Hryvnia',
    symbol: '₴',
    symbolPosition: 'after',
    decimalPlaces: 2,
    decimalSeparator: ',',
    thousandsSeparator: ' ',
  },
  PLN: {
    code: 'PLN',
    name: 'Polish Zloty',
    symbol: 'zł',
    symbolPosition: 'after',
    decimalPlaces: 2,
    decimalSeparator: ',',
    thousandsSeparator: ' ',
  },
  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: "'",
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    symbolPosition: 'before',
    decimalPlaces: 0,
    decimalSeparator: '',
    thousandsSeparator: ',',
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  SEK: {
    code: 'SEK',
    name: 'Swedish Krona',
    symbol: 'kr',
    symbolPosition: 'after',
    decimalPlaces: 2,
    decimalSeparator: ',',
    thousandsSeparator: ' ',
  },
  NOK: {
    code: 'NOK',
    name: 'Norwegian Krone',
    symbol: 'kr',
    symbolPosition: 'after',
    decimalPlaces: 2,
    decimalSeparator: ',',
    thousandsSeparator: ' ',
  },
  DKK: {
    code: 'DKK',
    name: 'Danish Krone',
    symbol: 'kr',
    symbolPosition: 'after',
    decimalPlaces: 2,
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  CZK: {
    code: 'CZK',
    name: 'Czech Koruna',
    symbol: 'Kč',
    symbolPosition: 'after',
    decimalPlaces: 2,
    decimalSeparator: ',',
    thousandsSeparator: ' ',
  },
  RUB: {
    code: 'RUB',
    name: 'Russian Ruble',
    symbol: '₽',
    symbolPosition: 'after',
    decimalPlaces: 2,
    decimalSeparator: ',',
    thousandsSeparator: ' ',
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  BRL: {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  MXN: {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  HKD: {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    symbol: 'HK$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
};

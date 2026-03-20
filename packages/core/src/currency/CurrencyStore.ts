/**
 * Currency Store
 *
 * Central store for managing currency state and formatting.
 * Supports multiple currencies with conversion.
 */

import type {
  CurrencyCode,
  CurrencyConfig,
  CurrencyState,
  CurrencyServiceConfig,
  Money,
  PriceDisplayOptions,
} from './types';
import { COMMON_CURRENCIES } from './types';

/**
 * Currency Store class
 */
class CurrencyStoreClass {
  private state: CurrencyState = {
    baseCurrency: 'USD',
    currentCurrency: 'USD',
    currencies: new Map(),
    initialized: false,
  };

  private config: CurrencyServiceConfig | null = null;
  private listeners: Set<() => void> = new Set();

  /**
   * Initialize currency store with configuration
   */
  async initialize(config: CurrencyServiceConfig): Promise<void> {
    this.config = config;
    this.state.baseCurrency = config.baseCurrency;
    this.state.currentCurrency = config.baseCurrency;

    // Add currencies
    for (const currency of config.currencies) {
      this.state.currencies.set(currency.code, currency);
    }

    // Load exchange rates if provider is configured
    if (config.exchangeRateProvider) {
      await this.updateExchangeRates();
    }

    this.state.initialized = true;
    console.log(`[Currency] Initialized with base currency: ${config.baseCurrency}`);
    this.notifyListeners();
  }

  /**
   * Get base currency code
   */
  getBaseCurrency(): CurrencyCode {
    return this.state.baseCurrency;
  }

  /**
   * Get current display currency code
   */
  getCurrentCurrency(): CurrencyCode {
    return this.state.currentCurrency;
  }

  /**
   * Get currency configuration
   */
  getCurrencyConfig(code: CurrencyCode): CurrencyConfig | undefined {
    return this.state.currencies.get(code);
  }

  /**
   * Get all available currencies
   */
  getAvailableCurrencies(): CurrencyConfig[] {
    return Array.from(this.state.currencies.values());
  }

  /**
   * Set current display currency
   */
  setCurrency(code: CurrencyCode): void {
    if (!this.state.currencies.has(code)) {
      console.warn(`[Currency] Currency "${code}" is not available`);
      return;
    }

    this.state.currentCurrency = code;
    console.log(`[Currency] Current currency changed to: ${code}`);
    this.notifyListeners();
  }

  /**
   * Add a currency configuration
   */
  addCurrency(config: CurrencyConfig): void {
    this.state.currencies.set(config.code, config);
    this.notifyListeners();
  }

  /**
   * Create a Money object
   */
  createMoney(amount: number, currency?: CurrencyCode): Money {
    return {
      amount: Math.round(amount),
      currency: currency || this.state.currentCurrency,
    };
  }

  /**
   * Create Money from decimal value (e.g., 10.99 -> 1099 cents)
   */
  fromDecimal(value: number, currency?: CurrencyCode): Money {
    const curr = currency || this.state.currentCurrency;
    const config = this.getCurrencyConfig(curr);
    const multiplier = Math.pow(10, config?.decimalPlaces ?? 2);
    return {
      amount: Math.round(value * multiplier),
      currency: curr,
    };
  }

  /**
   * Convert Money to decimal value
   */
  toDecimal(money: Money): number {
    const config = this.getCurrencyConfig(money.currency);
    const divisor = Math.pow(10, config?.decimalPlaces ?? 2);
    return money.amount / divisor;
  }

  /**
   * Format money value for display
   */
  format(money: Money, options: PriceDisplayOptions = {}): string {
    const config = this.getCurrencyConfig(money.currency);

    if (!config) {
      // Fallback formatting
      const decimal = this.toDecimal(money);
      return `${money.currency} ${decimal.toFixed(2)}`;
    }

    const {
      showSymbol = true,
      showCode = false,
      decimalPlaces = config.decimalPlaces,
      showPositiveSign = false,
      compact = false,
    } = options;

    const decimal = this.toDecimal(money);
    const isNegative = decimal < 0;
    const absValue = Math.abs(decimal);

    // Format number
    let formattedNumber: string;

    if (compact && absValue >= 1000) {
      formattedNumber = this.formatCompact(absValue);
    } else {
      formattedNumber = this.formatNumber(absValue, decimalPlaces, config);
    }

    // Build result
    let result = '';

    // Sign
    if (isNegative) {
      result += '-';
    } else if (showPositiveSign && decimal > 0) {
      result += '+';
    }

    // Symbol/value based on position
    if (showSymbol && config.symbolPosition === 'before') {
      result += config.symbol;
    }

    result += formattedNumber;

    if (showSymbol && config.symbolPosition === 'after') {
      result += ' ' + config.symbol;
    }

    if (showCode) {
      result += ' ' + config.code;
    }

    return result;
  }

  /**
   * Format a plain number with currency formatting
   */
  formatPrice(value: number, currency?: CurrencyCode, options?: PriceDisplayOptions): string {
    const money = this.fromDecimal(value, currency);
    return this.format(money, options);
  }

  /**
   * Format number with separators
   */
  private formatNumber(value: number, decimalPlaces: number, config: CurrencyConfig): string {
    const parts = value.toFixed(decimalPlaces).split('.');
    const intPart = parts[0] || '0';
    const decPart = parts[1];

    // Add thousands separators
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);

    if (decimalPlaces === 0 || !decPart) {
      return formattedInt;
    }

    return formattedInt + config.decimalSeparator + decPart;
  }

  /**
   * Format large numbers compactly
   */
  private formatCompact(value: number): string {
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1) + 'B';
    }
    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + 'M';
    }
    if (value >= 1_000) {
      return (value / 1_000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  /**
   * Convert money from one currency to another
   */
  convert(money: Money, toCurrency: CurrencyCode): Money {
    if (money.currency === toCurrency) {
      return money;
    }

    const fromConfig = this.getCurrencyConfig(money.currency);
    const toConfig = this.getCurrencyConfig(toCurrency);

    if (!fromConfig?.exchangeRate || !toConfig?.exchangeRate) {
      console.warn(`[Currency] Cannot convert: missing exchange rates`);
      return money;
    }

    // Convert through base currency
    const baseAmount = money.amount / fromConfig.exchangeRate;
    const targetAmount = baseAmount * toConfig.exchangeRate;

    return {
      amount: Math.round(targetAmount),
      currency: toCurrency,
    };
  }

  /**
   * Convert to current display currency
   */
  convertToCurrent(money: Money): Money {
    return this.convert(money, this.state.currentCurrency);
  }

  /**
   * Update exchange rates from provider
   */
  async updateExchangeRates(): Promise<void> {
    if (!this.config?.exchangeRateProvider) {
      return;
    }

    try {
      const rates = await this.config.exchangeRateProvider.getAllRates(this.state.baseCurrency);

      for (const [code, rate] of Object.entries(rates)) {
        const config = this.state.currencies.get(code);
        if (config) {
          config.exchangeRate = rate;
        }
      }

      // Base currency always has rate of 1
      const baseConfig = this.state.currencies.get(this.state.baseCurrency);
      if (baseConfig) {
        baseConfig.exchangeRate = 1;
      }

      console.log('[Currency] Exchange rates updated');
      this.notifyListeners();
    } catch (error) {
      console.error('[Currency] Failed to update exchange rates:', error);
    }
  }

  /**
   * Get currency from common currencies by code
   */
  static getCommonCurrency(code: CurrencyCode): CurrencyConfig | undefined {
    const common = COMMON_CURRENCIES[code];
    if (!common) return undefined;
    return { ...common, exchangeRate: 1 };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Reset store (for testing)
   */
  reset(): void {
    this.state = {
      baseCurrency: 'USD',
      currentCurrency: 'USD',
      currencies: new Map(),
      initialized: false,
    };
    this.config = null;
    this.listeners.clear();
  }
}

/**
 * Singleton instance
 */
export const CurrencyStore = new CurrencyStoreClass();

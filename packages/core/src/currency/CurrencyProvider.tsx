/**
 * Currency Provider
 *
 * React context provider for currency functionality.
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { CurrencyStore } from './CurrencyStore';
import type {
  CurrencyCode,
  CurrencyConfig,
  CurrencyServiceConfig,
  Money,
  PriceDisplayOptions,
} from './types';

/**
 * Currency context value
 */
interface CurrencyContextValue {
  /** Base currency */
  baseCurrency: CurrencyCode;
  /** Current display currency */
  currentCurrency: CurrencyCode;
  /** Current currency config */
  currentConfig: CurrencyConfig | undefined;
  /** Available currencies */
  currencies: CurrencyConfig[];
  /** Is initialized */
  isInitialized: boolean;
  /** Set current currency */
  setCurrency: (code: CurrencyCode) => void;
  /** Format price */
  formatPrice: (value: number, currency?: CurrencyCode, options?: PriceDisplayOptions) => string;
  /** Format money */
  formatMoney: (money: Money, options?: PriceDisplayOptions) => string;
  /** Convert money */
  convert: (money: Money, toCurrency: CurrencyCode) => Money;
  /** Convert to current currency */
  convertToCurrent: (money: Money) => Money;
  /** Create money object */
  createMoney: (amount: number, currency?: CurrencyCode) => Money;
  /** Create money from decimal */
  fromDecimal: (value: number, currency?: CurrencyCode) => Money;
  /** Convert money to decimal */
  toDecimal: (money: Money) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * Currency provider props
 */
interface CurrencyProviderProps {
  /** Configuration */
  config?: CurrencyServiceConfig;
  /** Children */
  children: ReactNode;
}

/**
 * Currency provider component
 */
export function CurrencyProvider({ config, children }: CurrencyProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [, forceUpdate] = useState({});

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (config) {
        await CurrencyStore.initialize(config);
        setIsInitialized(true);
      }
    };
    init();
  }, [config]);

  // Subscribe to changes
  useEffect(() => {
    const unsubscribe = CurrencyStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    CurrencyStore.setCurrency(code);
  }, []);

  const formatPrice = useCallback(
    (value: number, currency?: CurrencyCode, options?: PriceDisplayOptions) => {
      return CurrencyStore.formatPrice(value, currency, options);
    },
    []
  );

  const formatMoney = useCallback((money: Money, options?: PriceDisplayOptions) => {
    return CurrencyStore.format(money, options);
  }, []);

  const convert = useCallback((money: Money, toCurrency: CurrencyCode) => {
    return CurrencyStore.convert(money, toCurrency);
  }, []);

  const convertToCurrent = useCallback((money: Money) => {
    return CurrencyStore.convertToCurrent(money);
  }, []);

  const createMoney = useCallback((amount: number, currency?: CurrencyCode) => {
    return CurrencyStore.createMoney(amount, currency);
  }, []);

  const fromDecimal = useCallback((value: number, currency?: CurrencyCode) => {
    return CurrencyStore.fromDecimal(value, currency);
  }, []);

  const toDecimal = useCallback((money: Money) => {
    return CurrencyStore.toDecimal(money);
  }, []);

  const currencies = CurrencyStore.getAvailableCurrencies();
  const currentCurrency = CurrencyStore.getCurrentCurrency();

  const value: CurrencyContextValue = {
    baseCurrency: CurrencyStore.getBaseCurrency(),
    currentCurrency,
    currentConfig: currencies.find(c => c.code === currentCurrency),
    currencies,
    isInitialized,
    setCurrency,
    formatPrice,
    formatMoney,
    convert,
    convertToCurrent,
    createMoney,
    fromDecimal,
    toDecimal,
  };

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

/**
 * Hook to use currency context
 */
export function useCurrencyContext(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  return context;
}

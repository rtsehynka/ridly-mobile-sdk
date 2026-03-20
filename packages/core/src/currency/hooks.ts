/**
 * Currency Hooks
 *
 * React hooks for using currency functionality in components.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CurrencyStore } from './CurrencyStore';
import type {
  CurrencyCode,
  CurrencyConfig,
  Money,
  PriceDisplayOptions,
} from './types';

/**
 * Hook for currency formatting and conversion
 */
export function useCurrency() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = CurrencyStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
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

  return {
    currentCurrency: CurrencyStore.getCurrentCurrency(),
    baseCurrency: CurrencyStore.getBaseCurrency(),
    formatPrice,
    formatMoney,
    convert,
    convertToCurrent,
    createMoney: CurrencyStore.createMoney.bind(CurrencyStore),
    fromDecimal: CurrencyStore.fromDecimal.bind(CurrencyStore),
    toDecimal: CurrencyStore.toDecimal.bind(CurrencyStore),
  };
}

/**
 * Hook for currency selection
 */
export function useCurrencySelector() {
  const [currentCurrency, setCurrentCurrencyState] = useState<CurrencyCode>(
    CurrencyStore.getCurrentCurrency()
  );
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>(
    CurrencyStore.getAvailableCurrencies()
  );

  useEffect(() => {
    const unsubscribe = CurrencyStore.subscribe(() => {
      setCurrentCurrencyState(CurrencyStore.getCurrentCurrency());
      setCurrencies(CurrencyStore.getAvailableCurrencies());
    });
    return unsubscribe;
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    CurrencyStore.setCurrency(code);
  }, []);

  const currentConfig = useMemo(
    () => currencies.find(c => c.code === currentCurrency),
    [currencies, currentCurrency]
  );

  return {
    currentCurrency,
    currentConfig,
    currencies,
    setCurrency,
  };
}

/**
 * Hook for formatting a specific price
 * Automatically re-renders when currency changes
 */
export function useFormattedPrice(
  value: number,
  currency?: CurrencyCode,
  options?: PriceDisplayOptions
): string {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = CurrencyStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  return CurrencyStore.formatPrice(value, currency, options);
}

/**
 * Hook for formatting money
 */
export function useFormattedMoney(
  money: Money | null | undefined,
  options?: PriceDisplayOptions
): string {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = CurrencyStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  if (!money) {
    return '';
  }

  return CurrencyStore.format(money, options);
}

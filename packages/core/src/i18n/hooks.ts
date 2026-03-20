/**
 * i18n Hooks
 *
 * React hooks for using translations in components.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { I18nStore, slavicPluralRule } from './I18nStore';
import type {
  Locale,
  LanguageConfig,
  TranslationKey,
  TranslateOptions,
  TranslateFunction,
  I18nFormatters,
} from './types';

/**
 * Hook for translations
 */
export function useTranslation(namespace?: string) {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = I18nStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  // Load namespace on mount
  useEffect(() => {
    if (namespace) {
      const locale = I18nStore.getLocale();
      I18nStore.loadNamespace(locale, namespace);
    }
  }, [namespace]);

  const t: TranslateFunction = useCallback(
    (key: TranslationKey, options?: TranslateOptions) => {
      return I18nStore.t(key, {
        ...options,
        namespace: options?.namespace ?? namespace,
      });
    },
    [namespace]
  );

  const formatters: I18nFormatters = useMemo(
    () => ({
      formatNumber: (value, options) => I18nStore.formatNumber(value, options),
      formatCurrency: (value, currency) => I18nStore.formatCurrency(value, currency),
      formatDate: (date, options) => I18nStore.formatDate(date, options),
      formatRelativeTime: (date) => I18nStore.formatRelativeTime(date),
    }),
    []
  );

  return {
    t,
    locale: I18nStore.getLocale(),
    isRTL: I18nStore.isRTL(),
    ...formatters,
  };
}

/**
 * Hook for locale management
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(I18nStore.getLocale());
  const [locales, setLocales] = useState<LanguageConfig[]>(I18nStore.getLocales());

  useEffect(() => {
    const unsubscribe = I18nStore.subscribe(() => {
      setLocaleState(I18nStore.getLocale());
      setLocales(I18nStore.getLocales());
    });
    return unsubscribe;
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    await I18nStore.setLocale(newLocale);
  }, []);

  const currentLanguage = useMemo(
    () => locales.find(l => l.code === locale),
    [locales, locale]
  );

  return {
    locale,
    locales,
    currentLanguage,
    setLocale,
    isRTL: currentLanguage?.isRTL ?? false,
  };
}

/**
 * Hook for loading state
 */
export function useTranslationLoading(locale?: Locale, namespace?: string) {
  const [isLoading, setIsLoading] = useState(() =>
    I18nStore.isLoading(locale, namespace)
  );

  useEffect(() => {
    const unsubscribe = I18nStore.subscribe(() => {
      setIsLoading(I18nStore.isLoading(locale, namespace));
    });
    return unsubscribe;
  }, [locale, namespace]);

  return isLoading;
}

/**
 * Re-export for convenience
 */
export { slavicPluralRule };

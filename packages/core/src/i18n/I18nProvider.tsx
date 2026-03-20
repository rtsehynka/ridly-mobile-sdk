/**
 * i18n Provider
 *
 * React context provider for i18n functionality.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { I18nStore } from './I18nStore';
import { defaultTranslations } from './defaultTranslations';
import type {
  Locale,
  LanguageConfig,
  I18nConfig,
  TranslateFunction,
  I18nFormatters,
} from './types';

/**
 * i18n Context value
 */
interface I18nContextValue {
  /** Current locale */
  locale: Locale;
  /** Available locales */
  locales: LanguageConfig[];
  /** Current language config */
  currentLanguage: LanguageConfig | undefined;
  /** Is RTL */
  isRTL: boolean;
  /** Is initialized */
  isInitialized: boolean;
  /** Set locale */
  setLocale: (locale: Locale) => Promise<void>;
  /** Translation function */
  t: TranslateFunction;
  /** Formatters */
  formatters: I18nFormatters;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * i18n Provider props
 */
interface I18nProviderProps {
  /** Configuration */
  config?: Partial<I18nConfig>;
  /** Children */
  children: ReactNode;
  /** Initial locale override */
  initialLocale?: Locale;
  /** Load default translations */
  loadDefaults?: boolean;
}

/**
 * i18n Provider component
 */
export function I18nProvider({
  config,
  children,
  initialLocale,
  loadDefaults = true,
}: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [, forceUpdate] = useState({});

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await I18nStore.initialize({
        defaultLocale: initialLocale ?? config?.defaultLocale ?? 'en',
        ...config,
      });

      // Load default translations
      if (loadDefaults) {
        for (const [namespace, translations] of Object.entries(defaultTranslations)) {
          I18nStore.addTranslations('en', namespace, translations);
        }
      }

      setIsInitialized(true);
    };

    init();
  }, [config, initialLocale, loadDefaults]);

  // Subscribe to changes
  useEffect(() => {
    const unsubscribe = I18nStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  // Create context value
  const value: I18nContextValue = {
    locale: I18nStore.getLocale(),
    locales: I18nStore.getLocales(),
    currentLanguage: I18nStore.getCurrentLanguage(),
    isRTL: I18nStore.isRTL(),
    isInitialized,
    setLocale: async (locale) => {
      await I18nStore.setLocale(locale);
    },
    t: (key, options) => I18nStore.t(key, options),
    formatters: {
      formatNumber: (value, options) => I18nStore.formatNumber(value, options),
      formatCurrency: (value, currency) => I18nStore.formatCurrency(value, currency),
      formatDate: (date, options) => I18nStore.formatDate(date, options),
      formatRelativeTime: (date) => I18nStore.formatRelativeTime(date),
    },
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to use i18n context
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

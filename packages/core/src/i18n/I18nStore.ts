/**
 * i18n Store
 *
 * Central store for managing translations and locale state.
 * Supports lazy loading, interpolation, and pluralization.
 */

import type {
  Locale,
  LanguageConfig,
  I18nConfig,
  I18nState,
  TranslationObject,
  TranslationKey,
  TranslateOptions,
  PluralRules,
  TranslationValue,
} from './types';

/**
 * Default plural rules (English-like)
 */
function defaultPluralRule(count: number): keyof PluralRules {
  if (count === 0) return 'zero';
  if (count === 1) return 'one';
  return 'other';
}

/**
 * Slavic plural rules (Ukrainian, Russian, etc.)
 */
export function slavicPluralRule(count: number): keyof PluralRules {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (count === 0) return 'zero';
  if (mod10 === 1 && mod100 !== 11) return 'one';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
  return 'many';
}

/**
 * i18n Store class
 */
class I18nStoreClass {
  private config: I18nConfig = {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    ],
    defaultNamespace: 'common',
  };

  private state: I18nState = {
    locale: 'en',
    locales: [],
    translations: new Map(),
    loading: new Map(),
    initialized: false,
  };

  private listeners: Set<() => void> = new Set();

  /**
   * Initialize i18n with configuration
   */
  async initialize(config: Partial<I18nConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    this.state.locales = this.config.locales;
    this.state.locale = this.config.defaultLocale;
    this.state.initialized = true;

    console.log(`[i18n] Initialized with locale: ${this.state.locale}`);
    this.notifyListeners();
  }

  /**
   * Get current locale
   */
  getLocale(): Locale {
    return this.state.locale;
  }

  /**
   * Get current language config
   */
  getCurrentLanguage(): LanguageConfig | undefined {
    return this.state.locales.find(l => l.code === this.state.locale);
  }

  /**
   * Get all available locales
   */
  getLocales(): LanguageConfig[] {
    return this.state.locales;
  }

  /**
   * Check if locale is RTL
   */
  isRTL(): boolean {
    const lang = this.getCurrentLanguage();
    return lang?.isRTL ?? false;
  }

  /**
   * Set current locale
   */
  async setLocale(locale: Locale): Promise<void> {
    if (!this.state.locales.some(l => l.code === locale)) {
      console.warn(`[i18n] Locale "${locale}" is not available`);
      return;
    }

    this.state.locale = locale;
    console.log(`[i18n] Locale changed to: ${locale}`);
    this.notifyListeners();
  }

  /**
   * Add translations for a locale
   */
  addTranslations(locale: Locale, namespace: string, translations: TranslationObject): void {
    const existing = this.state.translations.get(locale) || {};
    existing[namespace] = {
      ...existing[namespace],
      ...translations,
    };
    this.state.translations.set(locale, existing);
    this.notifyListeners();
  }

  /**
   * Load translations for a locale/namespace
   */
  async loadNamespace(locale: Locale, namespace: string): Promise<void> {
    const loadingKey = `${locale}:${namespace}`;

    if (this.state.loading.get(loadingKey)) {
      return; // Already loading
    }

    // Check if already loaded
    const existing = this.state.translations.get(locale);
    if (existing?.[namespace]) {
      return;
    }

    if (!this.config.loadTranslations) {
      console.warn(`[i18n] No translation loader configured`);
      return;
    }

    this.state.loading.set(loadingKey, true);
    this.notifyListeners();

    try {
      const translations = await this.config.loadTranslations(locale, namespace);
      this.addTranslations(locale, namespace, translations);
    } catch (error) {
      console.error(`[i18n] Failed to load translations for ${locale}:${namespace}`, error);
    } finally {
      this.state.loading.set(loadingKey, false);
      this.notifyListeners();
    }
  }

  /**
   * Check if namespace is loading
   */
  isLoading(locale?: Locale, namespace?: string): boolean {
    if (locale && namespace) {
      return this.state.loading.get(`${locale}:${namespace}`) ?? false;
    }
    return Array.from(this.state.loading.values()).some(v => v);
  }

  /**
   * Translate a key
   */
  t(key: TranslationKey, options: TranslateOptions = {}): string {
    const { count, values, defaultValue, namespace } = options;
    const ns = namespace || this.config.defaultNamespace || 'common';

    // Try current locale first, then fallback
    let result = this.getTranslation(this.state.locale, ns, key);

    if (result === null && this.state.locale !== this.config.defaultLocale) {
      result = this.getTranslation(this.config.defaultLocale, ns, key);
    }

    if (result === null) {
      // Use missing key handler or return key
      if (this.config.onMissingKey) {
        return this.config.onMissingKey(key, this.state.locale);
      }
      return defaultValue ?? key;
    }

    // Handle pluralization
    if (typeof result === 'object' && count !== undefined) {
      result = this.pluralize(result as PluralRules, count);
    }

    // Handle interpolation
    if (typeof result === 'string' && values) {
      result = this.interpolate(result, values);
    }

    // Handle count interpolation
    if (typeof result === 'string' && count !== undefined) {
      result = result.replace(/\{\{count\}\}/g, String(count));
    }

    return result as string;
  }

  /**
   * Get translation value by key path
   */
  private getTranslation(locale: Locale, namespace: string, key: TranslationKey): TranslationValue | null {
    const translations = this.state.translations.get(locale);
    if (!translations) return null;

    const nsTranslations = translations[namespace];
    if (!nsTranslations) return null;

    // Handle dot notation
    const parts = key.split('.');
    let result: TranslationValue = nsTranslations;

    for (const part of parts) {
      if (result === null || result === undefined) return null;
      if (typeof result === 'string') return null;
      const nextValue: TranslationValue | undefined = (result as TranslationObject)[part];
      if (nextValue === undefined) return null;
      result = nextValue;
    }

    return result;
  }

  /**
   * Handle pluralization
   */
  private pluralize(rules: PluralRules, count: number): string {
    const lang = this.getCurrentLanguage();
    const pluralFn = lang?.pluralRule ?? defaultPluralRule;
    const form = pluralFn(count);

    return rules[form] ?? rules.other ?? rules.one;
  }

  /**
   * Handle interpolation
   */
  private interpolate(text: string, values: Record<string, string | number>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = values[key];
      return value !== undefined ? String(value) : `{{${key}}}`;
    });
  }

  /**
   * Format number
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.state.locale, options).format(value);
  }

  /**
   * Format currency
   */
  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat(this.state.locale, {
      style: 'currency',
      currency,
    }).format(value);
  }

  /**
   * Format date
   */
  formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const d = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat(this.state.locale, options).format(d);
  }

  /**
   * Format relative time
   */
  formatRelativeTime(date: Date | string | number): string {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat(this.state.locale, { numeric: 'auto' });

    if (Math.abs(diffSec) < 60) {
      return rtf.format(diffSec, 'second');
    } else if (Math.abs(diffMin) < 60) {
      return rtf.format(diffMin, 'minute');
    } else if (Math.abs(diffHour) < 24) {
      return rtf.format(diffHour, 'hour');
    } else {
      return rtf.format(diffDay, 'day');
    }
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
      locale: 'en',
      locales: [],
      translations: new Map(),
      loading: new Map(),
      initialized: false,
    };
    this.listeners.clear();
  }
}

/**
 * Singleton instance
 */
export const I18nStore = new I18nStoreClass();

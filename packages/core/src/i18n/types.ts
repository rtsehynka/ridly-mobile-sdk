/**
 * i18n System Types
 *
 * Core types and interfaces for internationalization.
 * Supports multiple languages with lazy loading of translations.
 */

/**
 * Supported locales
 */
export type Locale = string; // e.g., 'en', 'uk', 'de', 'fr', 'es'

/**
 * Translation key - dot-notation path
 */
export type TranslationKey = string;

/**
 * Translation values for interpolation
 */
export type TranslationValues = Record<string, string | number>;

/**
 * Plural forms
 */
export interface PluralRules {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/**
 * Translation value - can be string, plural rules, or nested object
 */
export type TranslationValue = string | PluralRules | TranslationObject;

/**
 * Translation object - nested structure
 */
export interface TranslationObject {
  [key: string]: TranslationValue;
}

/**
 * Translations for a locale
 */
export interface LocaleTranslations {
  [namespace: string]: TranslationObject;
}

/**
 * Language configuration
 */
export interface LanguageConfig {
  /** Locale code (e.g., 'en', 'uk') */
  code: Locale;
  /** Display name */
  name: string;
  /** Native name */
  nativeName: string;
  /** RTL language */
  isRTL?: boolean;
  /** Flag emoji or icon */
  flag?: string;
  /** Plural rule function */
  pluralRule?: (count: number) => keyof PluralRules;
}

/**
 * i18n configuration
 */
export interface I18nConfig {
  /** Default/fallback locale */
  defaultLocale: Locale;
  /** Available locales */
  locales: LanguageConfig[];
  /** Default namespace */
  defaultNamespace?: string;
  /** Missing key handler */
  onMissingKey?: (key: TranslationKey, locale: Locale) => string;
  /** Translation loader for lazy loading */
  loadTranslations?: (locale: Locale, namespace: string) => Promise<TranslationObject>;
}

/**
 * i18n state
 */
export interface I18nState {
  /** Current locale */
  locale: Locale;
  /** Available locales */
  locales: LanguageConfig[];
  /** Loaded translations */
  translations: Map<Locale, LocaleTranslations>;
  /** Loading state per locale/namespace */
  loading: Map<string, boolean>;
  /** Is initialized */
  initialized: boolean;
}

/**
 * Translation function options
 */
export interface TranslateOptions {
  /** Count for pluralization */
  count?: number;
  /** Interpolation values */
  values?: TranslationValues;
  /** Default value if key not found */
  defaultValue?: string;
  /** Namespace override */
  namespace?: string;
}

/**
 * Translation function type
 */
export type TranslateFunction = (
  key: TranslationKey,
  options?: TranslateOptions
) => string;

/**
 * Number format options
 */
export interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Date format options
 */
export interface DateFormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

/**
 * Formatter functions
 */
export interface I18nFormatters {
  /** Format number */
  formatNumber: (value: number, options?: NumberFormatOptions) => string;
  /** Format currency */
  formatCurrency: (value: number, currency: string) => string;
  /** Format date */
  formatDate: (date: Date | string | number, options?: DateFormatOptions) => string;
  /** Format relative time */
  formatRelativeTime: (date: Date | string | number) => string;
}

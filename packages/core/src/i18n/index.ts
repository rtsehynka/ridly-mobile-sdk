/**
 * i18n System
 *
 * Internationalization support for RIDLY Mobile.
 * Provides translations, number/date formatting, and RTL support.
 */

// Types
export type {
  Locale,
  TranslationKey,
  TranslationValues,
  PluralRules,
  TranslationValue,
  TranslationObject,
  LocaleTranslations,
  LanguageConfig,
  I18nConfig,
  I18nState,
  TranslateOptions,
  TranslateFunction,
  NumberFormatOptions,
  DateFormatOptions,
  I18nFormatters,
} from './types';

// Store
export { I18nStore, slavicPluralRule } from './I18nStore';

// Hooks
export { useTranslation, useLocale, useTranslationLoading } from './hooks';

// Provider
export { I18nProvider, useI18n } from './I18nProvider';

// Default translations
export {
  defaultTranslations,
  commonTranslations,
  navigationTranslations,
  productTranslations,
  cartTranslations,
  checkoutTranslations,
  accountTranslations,
} from './defaultTranslations';
export type { TranslationNamespace } from './defaultTranslations';

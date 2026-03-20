/**
 * RIDLY Default Translations
 *
 * Pre-bundled translations for common UI elements.
 */

// English translations
import enCommon from './en/common.json';
import enProduct from './en/product.json';
import enCart from './en/cart.json';
import enCheckout from './en/checkout.json';
import enAccount from './en/account.json';

// Ukrainian translations
import ukCommon from './uk/common.json';
import ukProduct from './uk/product.json';
import ukCart from './uk/cart.json';
import ukCheckout from './uk/checkout.json';
import ukAccount from './uk/account.json';

/**
 * Default translations bundled with RIDLY
 */
export const defaultTranslations = {
  en: {
    common: enCommon,
    product: enProduct,
    cart: enCart,
    checkout: enCheckout,
    account: enAccount,
  },
  uk: {
    common: ukCommon,
    product: ukProduct,
    cart: ukCart,
    checkout: ukCheckout,
    account: ukAccount,
  },
} as const;

/**
 * Available namespaces
 */
export type TranslationNamespace = 'common' | 'product' | 'cart' | 'checkout' | 'account';

/**
 * Get translations for a locale
 */
export function getTranslations(locale: string, namespace: TranslationNamespace) {
  const lang = defaultTranslations[locale as keyof typeof defaultTranslations];
  if (!lang) {
    // Fallback to English
    return defaultTranslations.en[namespace];
  }
  return lang[namespace];
}

/**
 * Load all translations for a locale
 */
export function loadAllTranslations(locale: string) {
  return defaultTranslations[locale as keyof typeof defaultTranslations] || defaultTranslations.en;
}

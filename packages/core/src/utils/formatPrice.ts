/**
 * RIDLY Mobile SDK - Price Formatting Utility
 *
 * Formats monetary values with currency support.
 */

export interface FormatPriceOptions {
  /**
   * Currency code (ISO 4217)
   * @default 'USD'
   */
  currency?: string;

  /**
   * Locale for formatting
   * @default 'en-US'
   */
  locale?: string;

  /**
   * Show currency symbol
   * @default true
   */
  showSymbol?: boolean;

  /**
   * Show currency code instead of symbol
   * @default false
   */
  showCode?: boolean;

  /**
   * Number of decimal places
   * @default 2
   */
  decimals?: number;

  /**
   * Hide decimals if they are zero (e.g., $100 instead of $100.00)
   * @default false
   */
  hideZeroDecimals?: boolean;
}

/**
 * Currency symbols map
 */
const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  CHF: 'CHF',
  CAD: 'CA$',
  AUD: 'A$',
  PLN: 'zł',
  CZK: 'Kč',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
};

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency.toUpperCase()] || currency;
}

/**
 * Format a price value with currency
 *
 * @param value - The numeric price value
 * @param options - Formatting options
 * @returns Formatted price string
 *
 * @example
 * ```ts
 * formatPrice(99.99) // "$99.99"
 * formatPrice(99.99, { currency: 'EUR' }) // "€99.99"
 * formatPrice(99.99, { currency: 'EUR', locale: 'de-DE' }) // "99,99 €"
 * formatPrice(100, { hideZeroDecimals: true }) // "$100"
 * ```
 */
export function formatPrice(
  value: number | null | undefined,
  options: FormatPriceOptions = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    showSymbol = true,
    showCode = false,
    decimals = 2,
    hideZeroDecimals = false,
  } = options;

  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Check if decimals should be hidden
  const actualDecimals = hideZeroDecimals && value % 1 === 0 ? 0 : decimals;

  try {
    // Use Intl.NumberFormat for locale-aware formatting
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: actualDecimals,
      maximumFractionDigits: actualDecimals,
    });

    let formatted = formatter.format(value);

    // If we don't want the symbol or want the code instead
    if (!showSymbol && !showCode) {
      // Remove currency symbol/code and trim
      formatted = formatter
        .formatToParts(value)
        .filter((part) => part.type !== 'currency' && part.type !== 'literal')
        .map((part) => part.value)
        .join('')
        .trim();
    } else if (showCode) {
      // Replace symbol with code
      const symbol = getCurrencySymbol(currency);
      formatted = formatted.replace(symbol, currency + ' ');
    }

    return formatted;
  } catch {
    // Fallback for unsupported currencies/locales
    const symbol = showCode ? currency : getCurrencySymbol(currency);
    const formatted = value.toFixed(actualDecimals);
    return showSymbol || showCode ? `${symbol}${formatted}` : formatted;
  }
}

/**
 * Format price range (e.g., for configurable products)
 *
 * @example
 * ```ts
 * formatPriceRange(99.99, 199.99) // "$99.99 - $199.99"
 * formatPriceRange(99.99, 99.99) // "$99.99"
 * ```
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  options: FormatPriceOptions = {}
): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, options);
  }

  return `${formatPrice(minPrice, options)} - ${formatPrice(maxPrice, options)}`;
}

/**
 * Calculate discount percentage
 *
 * @example
 * ```ts
 * calculateDiscount(100, 80) // 20
 * calculateDiscount(50, 40) // 20
 * ```
 */
export function calculateDiscount(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) {
    return 0;
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Format price with original price and sale price
 *
 * @example
 * ```ts
 * formatSalePrice(100, 80)
 * // { original: "$100.00", sale: "$80.00", discount: 20 }
 * ```
 */
export function formatSalePrice(
  originalPrice: number,
  salePrice: number,
  options: FormatPriceOptions = {}
): {
  original: string;
  sale: string;
  discount: number;
  hasSale: boolean;
} {
  const discount = calculateDiscount(originalPrice, salePrice);
  const hasSale = discount > 0;

  return {
    original: formatPrice(originalPrice, options),
    sale: formatPrice(salePrice, options),
    discount,
    hasSale,
  };
}

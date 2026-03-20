# RIDLY Currency Guide

Complete guide to multi-currency support in RIDLY Mobile.

## Overview

RIDLY provides a complete currency system with:
- Multi-currency support (20+ currencies)
- Automatic formatting per locale
- Currency conversion
- Currency selector component

## Configuration

```typescript
// ridly.config.ts
export default defineConfig({
  currency: {
    defaultCurrency: 'EUR',
    currencies: ['EUR', 'USD', 'GBP', 'UAH', 'PLN'],
    autoDetect: true, // Auto-detect from user locale
  },
  features: {
    multiCurrency: true, // Show currency selector
  },
});
```

## Supported Currencies

| Code | Currency | Symbol |
|------|----------|--------|
| USD | US Dollar | $ |
| EUR | Euro | € |
| GBP | British Pound | £ |
| UAH | Ukrainian Hryvnia | ₴ |
| PLN | Polish Zloty | zł |
| CHF | Swiss Franc | CHF |
| JPY | Japanese Yen | ¥ |
| CNY | Chinese Yuan | ¥ |
| AUD | Australian Dollar | A$ |
| CAD | Canadian Dollar | C$ |
| SEK | Swedish Krona | kr |
| NOK | Norwegian Krone | kr |
| DKK | Danish Krone | kr |
| CZK | Czech Koruna | Kč |
| RUB | Russian Ruble | ₽ |
| INR | Indian Rupee | ₹ |
| BRL | Brazilian Real | R$ |
| MXN | Mexican Peso | $ |
| SGD | Singapore Dollar | S$ |
| HKD | Hong Kong Dollar | HK$ |

## Usage

### Basic Formatting

```typescript
import { useCurrency } from '@ridly/mobile-core';

function ProductPrice({ price }) {
  const { formatPrice, currentCurrency } = useCurrency();

  return (
    <Text>
      {formatPrice(price)} {/* €99.99 */}
    </Text>
  );
}
```

### Working with Money Objects

```typescript
import { useCurrency } from '@ridly/mobile-core';

function CartTotal({ items }) {
  const {
    formatMoney,
    createMoney,
    fromDecimal,
    toDecimal
  } = useCurrency();

  // Create money from cents (1099 = $10.99)
  const subtotal = createMoney(1099, 'USD');

  // Create money from decimal (10.99 = $10.99)
  const shipping = fromDecimal(5.99, 'USD');

  // Format for display
  return (
    <View>
      <Text>Subtotal: {formatMoney(subtotal)}</Text>
      <Text>Shipping: {formatMoney(shipping)}</Text>
    </View>
  );
}
```

### Format Options

```typescript
const { formatPrice } = useCurrency();

// Default
formatPrice(99.99);                    // "$99.99"

// Without symbol
formatPrice(99.99, 'USD', { showSymbol: false }); // "99.99"

// With code
formatPrice(99.99, 'USD', { showCode: true });    // "$99.99 USD"

// Compact (for large numbers)
formatPrice(1500000, 'USD', { compact: true });   // "$1.5M"

// Custom decimal places
formatPrice(99.999, 'USD', { decimalPlaces: 3 }); // "$99.999"

// Show positive sign
formatPrice(10, 'USD', { showPositiveSign: true }); // "+$10.00"
```

### Currency Formatting by Locale

```typescript
// Same value, different formatting:

// English (US): $1,234.56
// German: 1.234,56 €
// French: 1 234,56 €
// Ukrainian: 1 234,56 ₴
```

### Currency Switching

```typescript
import { useCurrencySelector } from '@ridly/mobile-core';

function SettingsScreen() {
  const { currentCurrency, currencies, setCurrency } = useCurrencySelector();

  return (
    <View>
      <Text>Current: {currentCurrency}</Text>

      {currencies.map(currency => (
        <TouchableOpacity
          key={currency.code}
          onPress={() => setCurrency(currency.code)}
        >
          <Text>{currency.symbol} {currency.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### Currency Selector Component

```typescript
import { CurrencySelector } from '@ridly/theme-luxe';

// As a button (opens modal)
<CurrencySelector variant="button" />

// As inline list
<CurrencySelector variant="list" />
```

### Currency Conversion

```typescript
import { useCurrency } from '@ridly/mobile-core';

function PriceConverter() {
  const { convert, convertToCurrent, fromDecimal } = useCurrency();

  const priceUSD = fromDecimal(100, 'USD');

  // Convert to specific currency
  const priceEUR = convert(priceUSD, 'EUR');

  // Convert to user's selected currency
  const priceInUserCurrency = convertToCurrent(priceUSD);
}
```

## Exchange Rates

### Static Rates (Configuration)

```typescript
// In your config, currencies come with exchangeRate: 1
// You can update rates at initialization
```

### Dynamic Rates

```typescript
import { CurrencyStore } from '@ridly/mobile-core';

// Update exchange rates from your backend
async function updateRates() {
  const rates = await fetch('/api/exchange-rates');

  for (const [code, rate] of Object.entries(rates)) {
    const config = CurrencyStore.getCurrencyConfig(code);
    if (config) {
      config.exchangeRate = rate;
    }
  }
}
```

### With Exchange Rate Provider

```typescript
// ridly.config.ts
currency: {
  defaultCurrency: 'EUR',
  currencies: ['EUR', 'USD', 'GBP'],
  exchangeRateProvider: {
    async getRate(from, to) {
      const response = await fetch(`/api/rate?from=${from}&to=${to}`);
      return response.json();
    },
    async getAllRates(base) {
      const response = await fetch(`/api/rates?base=${base}`);
      return response.json();
    },
  },
  autoUpdateRates: true,
  updateInterval: 3600000, // 1 hour
}
```

## Using with Product Prices

```typescript
import { useFormattedPrice } from '@ridly/mobile-core';

function ProductCard({ product }) {
  // Automatically re-renders when currency changes
  const formattedPrice = useFormattedPrice(product.price, product.currency);
  const formattedSalePrice = useFormattedPrice(product.salePrice, product.currency);

  return (
    <View>
      {product.onSale ? (
        <>
          <Text style={styles.salePrice}>{formattedSalePrice}</Text>
          <Text style={styles.originalPrice}>{formattedPrice}</Text>
        </>
      ) : (
        <Text>{formattedPrice}</Text>
      )}
    </View>
  );
}
```

## Hooks Reference

| Hook | Description |
|------|-------------|
| `useCurrency()` | Main currency hook |
| `useCurrencySelector()` | Currency selection |
| `useFormattedPrice(value, currency?, options?)` | Format single price |
| `useFormattedMoney(money, options?)` | Format money object |
| `useCurrencyContext()` | Full currency context |

### useCurrency Return Value

```typescript
const {
  currentCurrency,  // Current currency code
  baseCurrency,     // Base/default currency
  formatPrice,      // Format decimal to string
  formatMoney,      // Format Money object
  convert,          // Convert between currencies
  convertToCurrent, // Convert to current currency
  createMoney,      // Create Money from cents
  fromDecimal,      // Create Money from decimal
  toDecimal,        // Convert Money to decimal
} = useCurrency();
```

### useCurrencySelector Return Value

```typescript
const {
  currentCurrency,  // Current currency code
  currentConfig,    // Current currency config
  currencies,       // All available currencies
  setCurrency,      // Change currency function
} = useCurrencySelector();
```

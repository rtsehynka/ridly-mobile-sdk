# RIDLY Configuration Guide

Complete guide to configuring your RIDLY Mobile app.

## Overview

RIDLY uses a centralized configuration file (`ridly.config.ts`) that controls all aspects of your app:
- App information
- Backend connection
- Theme settings
- Languages & currencies
- Plugin configuration
- Feature flags

## Quick Start

```typescript
// ridly.config.ts
import { defineConfig } from '@ridly/mobile-core';

export default defineConfig({
  app: {
    name: 'My Store',
    version: '1.0.0',
    bundleId: 'com.mystore.app',
    scheme: 'mystore',
  },
  platform: {
    type: 'magento',
    apiUrl: process.env.EXPO_PUBLIC_MAGENTO_URL,
  },
  theme: {
    id: 'ridly-luxe',
    defaultMode: 'light',
  },
  // ... more config
});
```

## Configuration Sections

### App Configuration

```typescript
app: {
  name: string;          // App display name
  version: string;       // App version (semver)
  bundleId: string;      // iOS Bundle ID / Android Package
  scheme: string;        // Deep link scheme (e.g., 'mystore://')
  supportEmail?: string; // Support email address
  termsUrl?: string;     // Terms of service URL
  privacyUrl?: string;   // Privacy policy URL
}
```

### Platform Configuration

```typescript
platform: {
  type: 'magento' | 'shopify' | 'shopware' | 'woocommerce';
  apiUrl: string;        // GraphQL/API endpoint
  storeCode?: string;    // Store code for multi-store
  headers?: Record<string, string>; // Custom headers
  timeout?: number;      // Request timeout in ms (default: 30000)
}
```

**Environment Variables:**
```env
EXPO_PUBLIC_MAGENTO_URL=https://your-store.com/graphql
EXPO_PUBLIC_STORE_CODE=default
```

### Theme Configuration

```typescript
theme: {
  id: string;            // Theme package ID ('ridly-luxe')
  defaultMode: 'light' | 'dark' | 'system';
  colors?: {
    primary?: string;    // Override primary color
    secondary?: string;  // Override secondary color
    accent?: string;     // Override accent color
  };
}
```

### i18n Configuration

```typescript
i18n: {
  defaultLocale: string; // Default language code
  fallbackLocale?: string; // Fallback if translation missing
  locales: [
    {
      code: string;      // ISO code (e.g., 'en', 'uk')
      name: string;      // English name
      nativeName: string; // Native name (e.g., 'Українська')
      flag?: string;     // Flag emoji
      isRTL?: boolean;   // Right-to-left language
    }
  ];
}
```

**Example:**
```typescript
i18n: {
  defaultLocale: 'en',
  locales: [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  ],
}
```

### Currency Configuration

```typescript
currency: {
  defaultCurrency: string; // Default currency code (ISO 4217)
  currencies: string[];    // Available currencies
  autoDetect?: boolean;    // Auto-detect from locale
}
```

**Supported currencies:** USD, EUR, GBP, UAH, PLN, CHF, JPY, CNY, AUD, CAD, SEK, NOK, DKK, CZK, RUB, INR, BRL, MXN, SGD, HKD

### Plugins Configuration

#### Search Plugin

```typescript
plugins: {
  search: {
    provider: 'algolia' | 'elasticsearch' | 'native';
    algolia?: {
      appId: string;
      apiKey: string;     // Search-only API key (public)
      indexName: string;
    };
  }
}
```

#### Auth Plugins

```typescript
plugins: {
  auth: {
    google?: {
      enabled: boolean;
      webClientId?: string;
      iosClientId?: string;
      androidClientId?: string;
      expoClientId?: string;
    };
    apple?: {
      enabled: boolean;
    };
    facebook?: {
      enabled: boolean;
      appId?: string;
    };
  }
}
```

#### Payment Plugins

```typescript
plugins: {
  payments: {
    stripe?: {
      publishableKey: string;
      merchantId: string;
      merchantName: string;
      countryCode: string;
    };
    applePay?: {
      enabled: boolean;
    };
    googlePay?: {
      enabled: boolean;
      testEnv?: boolean;
    };
  }
}
```

#### Notifications Plugin

```typescript
plugins: {
  notifications: {
    enabled: boolean;
    android?: {
      channelId: string;
      channelName: string;
      icon?: string;
      color?: string;
    };
  }
}
```

#### Scanner Plugin

```typescript
plugins: {
  scanner: {
    enabled: boolean;
    barcodeTypes?: string[]; // ['qr', 'ean13', 'ean8', 'upc_a']
  }
}
```

#### Offline Plugin

```typescript
plugins: {
  offline: {
    enabled: boolean;
    cacheTTL?: number;        // Cache TTL in seconds
    maxQueueSize?: number;    // Max queued actions
    autoProcessQueue?: boolean; // Process on reconnect
  }
}
```

### Feature Flags

```typescript
features: {
  wishlist?: boolean;        // Enable wishlist
  reviews?: boolean;         // Enable product reviews
  compare?: boolean;         // Enable product comparison
  barcodeScanner?: boolean;  // Enable barcode scanner
  pushNotifications?: boolean;
  offlineMode?: boolean;
  socialLogin?: boolean;
  guestCheckout?: boolean;
  multiLanguage?: boolean;   // Show language switcher
  multiCurrency?: boolean;   // Show currency selector
}
```

### Development Options

```typescript
dev: {
  debug?: boolean;       // Enable debug logging
  showDevTools?: boolean; // Show dev tools UI
  logNetwork?: boolean;  // Log network requests
  useMockData?: boolean; // Use mock data instead of API
}
```

## Environment Variables

Create a `.env` file in your app directory:

```env
# API
EXPO_PUBLIC_MAGENTO_URL=https://your-store.com/graphql
EXPO_PUBLIC_STORE_CODE=default

# Algolia
EXPO_PUBLIC_ALGOLIA_APP_ID=your-app-id
EXPO_PUBLIC_ALGOLIA_API_KEY=your-search-key
EXPO_PUBLIC_ALGOLIA_INDEX=products

# Stripe
EXPO_PUBLIC_STRIPE_KEY=pk_test_xxx
EXPO_PUBLIC_MERCHANT_ID=merchant.com.yourapp

# Google Auth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com
```

## Initialization

In your app's entry point:

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { ConfigManager } from '@ridly/mobile-core';
import '@ridly/mobile-plugins'; // Auto-registers all plugins (IMPORTANT!)
import config from '../ridly.config';

export default function RootLayout() {
  useEffect(() => {
    ConfigManager.initialize(config);
  }, []);

  return <App />;
}
```

**Important:** The `import '@ridly/mobile-plugins'` line must be included before calling `ConfigManager.initialize()`. This import auto-registers all plugin loaders with the ConfigManager, enabling plugins defined in your config to work correctly.
```

## Accessing Config at Runtime

```typescript
import { ConfigManager } from '@ridly/mobile-core';

// Get full config
const config = ConfigManager.getConfig();

// Get specific section
const platform = ConfigManager.get('platform');
const features = ConfigManager.get('features');

// Check feature flag
if (ConfigManager.isFeatureEnabled('wishlist')) {
  // Show wishlist
}
```

## Type Safety

The `defineConfig` helper provides full TypeScript support:

```typescript
import { defineConfig } from '@ridly/mobile-core';

// Full autocomplete and type checking
export default defineConfig({
  app: {
    name: 'My Store', // ✓ Required
    // version: missing // ✗ TypeScript error
  },
});
```

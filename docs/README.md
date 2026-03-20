# RIDLY Mobile SDK Documentation

Complete documentation for building e-commerce mobile apps with RIDLY.

## Table of Contents

1. [Getting Started](#getting-started)
2. [**Pro Features Guide**](./PRO_FEATURES.md) - Complete guide to all premium features
3. [Configuration](./CONFIGURATION.md)
4. [Plugins](./PLUGINS.md)
5. [i18n (Internationalization)](./I18N.md)
6. [Currency](./CURRENCY.md)
7. [Themes](#themes)
8. [Architecture](#architecture)

## Getting Started

### Installation

```bash
# Create new RIDLY app
npx create-ridly-app my-store

# Or add to existing Expo project
yarn add @ridly/mobile-core @ridly/adapter-magento @ridly/theme-luxe
```

### Project Structure

```
my-store/
├── app/                    # Expo Router pages
├── ridly.config.ts         # ← Central configuration
├── .env                    # Environment variables
└── package.json
```

### Minimal Setup

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
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    ],
  },
  currency: {
    defaultCurrency: 'USD',
    currencies: ['USD'],
  },
  plugins: {},
  features: {},
});
```

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { ConfigManager, ThemeProvider } from '@ridly/mobile-core';
import '@ridly/mobile-plugins'; // Auto-registers all plugins
import config from '../ridly.config';

export default function RootLayout() {
  useEffect(() => {
    ConfigManager.initialize(config);
  }, []);

  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
```

## Architecture

### Package Structure

```
ridly-mobile/
├── packages/
│   ├── core/              # @ridly/mobile-core (Free)
│   │   ├── components/    # Base UI components
│   │   ├── hooks/         # React hooks
│   │   ├── stores/        # State management
│   │   ├── theme/         # Theming system
│   │   ├── plugins/       # Plugin system
│   │   ├── i18n/          # Internationalization
│   │   ├── currency/      # Currency handling
│   │   └── config/        # Configuration
│   │
│   └── adapter-magento/   # @ridly/adapter-magento
│       ├── graphql/       # GraphQL queries
│       └── transformers/  # Data transformers
│
├── plugins/               # @ridly/mobile-plugins (Premium)
│   ├── google-auth/
│   ├── apple-auth/
│   ├── algolia-search/
│   ├── apple-pay/
│   ├── google-pay/
│   ├── push-notifications/
│   ├── barcode-scanner/
│   └── offline-mode/
│
└── themes/
    └── luxe/              # @ridly/theme-luxe (Premium)
        ├── components/    # Premium components
        ├── screens/       # Screen overrides
        ├── slots/         # Home page slots
        └── styles/        # Style overrides
```

### Backend Agnostic

RIDLY works with any e-commerce backend:

| Backend | Adapter | Status |
|---------|---------|--------|
| Magento 2 | `@ridly/adapter-magento` | ✅ Ready |
| Shopify | `@ridly/adapter-shopify` | 🚧 Coming |
| Shopware | `@ridly/adapter-shopware` | 🚧 Coming |
| WooCommerce | `@ridly/adapter-woocommerce` | 🚧 Coming |

Just change `platform.type` in config:

```typescript
platform: {
  type: 'shopify', // Switch backend
  apiUrl: 'https://my-store.myshopify.com/api/graphql',
}
```

## Themes

### Available Themes

| Theme | Description | Status |
|-------|-------------|--------|
| Luxe | Premium luxury theme | ✅ Ready |
| Minimal | Clean minimal theme | 🚧 Coming |
| Bold | Vibrant colorful theme | 🚧 Coming |

### Theme Features

- Light/Dark mode
- Custom color overrides
- Component style overrides
- Slot system for home page
- Premium UI components

### Customizing Theme

```typescript
theme: {
  id: 'ridly-luxe',
  defaultMode: 'system',
  colors: {
    primary: '#FF5733',    // Custom primary color
    secondary: '#1A1A1A',
    accent: '#E8DCC4',
  },
}
```

## Premium Features

For detailed information about all premium features, see the [**Pro Features Guide**](./PRO_FEATURES.md).

### Free (Core)

- Basic components
- Theming system
- Cart & checkout
- Category/Product pages
- User account
- Orders history

### Premium (Plugins + Luxe Theme)

| Feature | Status | E2E Tested |
|---------|--------|------------|
| Premium Pro Theme (Luxe) | ✅ Working | ✅ Yes |
| Algolia Search | ✅ Working | ✅ Yes |
| Barcode & QR Scanner | ✅ Working | ✅ Yes |
| Push Notifications | ✅ Working | Manual |
| Offline Mode | ✅ Working | Manual |
| Apple Pay | ⚙️ Requires config | Manual |
| Google Pay | ⚙️ Requires config | Manual |
| Social Login (Apple) | ⚙️ Requires config | Manual |
| Social Login (Google) | ⚙️ Requires config | Manual |
| Multi-language (i18n) | ✅ Working | Manual |
| Multi-currency | ✅ Working | Manual |

## Quick Links

- [Configuration Guide](./CONFIGURATION.md)
- [Plugins Guide](./PLUGINS.md)
- [i18n Guide](./I18N.md)
- [Currency Guide](./CURRENCY.md)

## Support

- GitHub Issues: https://github.com/ridly-io/ridly-mobile/issues
- Documentation: https://docs.ridly.io
- Email: support@ridly.io

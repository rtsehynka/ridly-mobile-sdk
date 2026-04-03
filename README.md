# RIDLY Mobile SDK

Open-source React Native SDK for building native e-commerce mobile apps.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2052-000020)](https://expo.dev/)
[![E2E Tests](https://img.shields.io/badge/E2E%20Tests-14%2F14%20passing-brightgreen)](e2e/)

## What is RIDLY?

RIDLY Mobile SDK converts e-commerce stores into native iOS and Android mobile apps. It provides a complete, production-ready solution with:

- **Backend Agnostic Architecture** - Works with Magento 2, with Shopify, Shopware, and WooCommerce adapters coming soon
- **Modern Tech Stack** - Expo SDK 52+, TypeScript, NativeWind, Zustand, TanStack Query
- **Plugin System** - Extend functionality with Algolia Search, Apple/Google Pay, Push Notifications, and more
- **Theming** - Premium themes with light/dark mode and full customization
- **i18n & Multi-currency** - Built-in internationalization and currency support

## Features

### Core (Free)

| Feature | Description |
|---------|-------------|
| UI Components | Button, Input, Card, Badge, Skeleton, Price, Toast |
| Product Catalog | Product listing, search, filtering, categories |
| Shopping Cart | Add/remove items, quantity management |
| Checkout | Multi-step checkout flow |
| User Account | Login, registration, profile management |
| Order History | View past orders and order details |
| Theming System | Light/dark mode, custom colors |

### Premium Plugins

| Plugin | Description | Status |
|--------|-------------|--------|
| Luxe Theme | Premium UI with custom components | ✅ Working |
| Algolia Search | Fast, typo-tolerant search | ✅ Working |
| Barcode Scanner | EAN, UPC, QR code scanning | ✅ Working |
| Push Notifications | Expo Notifications integration | ✅ Working |
| Offline Mode | Data caching, action queuing | ✅ Working |
| Apple Pay | Stripe-powered payments | ⚙️ Requires config |
| Google Pay | Stripe-powered payments | ⚙️ Requires config |
| Apple Sign-In | Native authentication | ⚙️ Requires config |
| Google Sign-In | OAuth 2.0 authentication | ⚙️ Requires config |
| i18n | Multi-language support (EN, UK) | ✅ Working |
| Multi-currency | Currency conversion | ✅ Working |

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Expo SDK 52+ |
| Navigation | Expo Router v4 |
| Styling | NativeWind v4 (Tailwind CSS) |
| State | Zustand |
| Data Fetching | TanStack Query v5 |
| API | GraphQL |
| Language | TypeScript (strict mode) |
| Testing | Vitest (unit), Detox (E2E) |

## Project Structure

```
ridly-mobile-sdk/
├── apps/
│   └── magento/              # Demo Expo app
├── packages/
│   ├── core/                 # @ridly/mobile-core - Components, hooks, stores
│   └── adapter-magento/      # @ridly/adapter-magento - Magento 2 GraphQL
├── plugins/                  # Premium plugins
│   ├── algolia-search/
│   ├── apple-auth/
│   ├── apple-pay/
│   ├── barcode-scanner/
│   ├── google-auth/
│   ├── google-pay/
│   ├── offline-mode/
│   └── push-notifications/
├── themes/
│   └── luxe/                 # Premium Luxe theme
├── e2e/                      # Detox E2E tests (14/14 passing)
└── docs/                     # Documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn 4
- iOS: Xcode 15+ (for iOS development)
- Android: Android Studio (for Android development)

### Installation

```bash
# Clone the repository
git clone https://github.com/nicksavov/ridly-mobile-sdk.git
cd ridly-mobile-sdk

# Install dependencies
yarn install

# Start the demo app
yarn dev
```

### Run on Device/Simulator

```bash
# iOS Simulator
yarn workspace @ridly/magento-app ios

# Android Emulator
yarn workspace @ridly/magento-app android

# Web Browser
yarn workspace @ridly/magento-app web
```

### Verify Setup

```bash
# TypeScript check
yarn typecheck

# Linting
yarn lint

# Unit tests
yarn test

# E2E tests (iOS)
yarn e2e:build:ios
yarn e2e:test:ios
```

## Configuration

Create `ridly.config.ts` in your project root:

```typescript
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
    storeCode: 'default',
  },
  theme: {
    id: 'ridly-luxe',
    defaultMode: 'light',
    colors: {
      primary: '#000000',
      secondary: '#1A1A1A',
      accent: '#E8DCC4',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
    ],
    fallbackLocale: 'en',
  },
  currency: {
    defaultCurrency: 'USD',
    currencies: ['USD', 'EUR', 'GBP', 'UAH'],
  },
  plugins: {
    algoliaSearch: {
      enabled: true,
      appId: process.env.EXPO_PUBLIC_ALGOLIA_APP_ID,
      apiKey: process.env.EXPO_PUBLIC_ALGOLIA_API_KEY,
      indexName: 'products',
    },
    barcodeScanner: { enabled: true },
    pushNotifications: { enabled: true },
    offlineMode: { enabled: true },
  },
});
```

### Environment Variables

Create `.env` file:

```env
# Magento Backend
EXPO_PUBLIC_MAGENTO_URL=https://your-magento-store.com/graphql

# Algolia (optional)
EXPO_PUBLIC_ALGOLIA_APP_ID=your_app_id
EXPO_PUBLIC_ALGOLIA_API_KEY=your_search_api_key

# Stripe (for Apple/Google Pay)
EXPO_PUBLIC_STRIPE_KEY=pk_test_xxx

# Google OAuth (for Google Sign-In)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com

# Currency conversion (optional)
EXPO_PUBLIC_EXCHANGE_RATES_API_KEY=your_api_key
```

## Development Commands

```bash
# Development
yarn dev                    # Start Expo dev server
yarn typecheck              # TypeScript validation
yarn lint                   # ESLint
yarn lint:fix               # ESLint with auto-fix
yarn format                 # Prettier formatting

# Testing
yarn test                   # Run all unit tests
yarn workspace @ridly/mobile-adapter-magento test        # Adapter tests
yarn workspace @ridly/mobile-adapter-magento test:watch  # Watch mode

# E2E Testing (Detox)
yarn e2e:build:ios          # Build iOS for E2E
yarn e2e:test:ios           # Run iOS E2E tests
yarn e2e:build:android      # Build Android for E2E
yarn e2e:test:android       # Run Android E2E tests

# Code Generation
yarn workspace @ridly/mobile-adapter-magento codegen     # Generate GraphQL types
```

## Architecture

### Adapter Pattern

RIDLY is backend-agnostic. All platform-specific code lives in adapters that implement the `ECommerceAdapter` interface:

```
┌─────────────────────────────────────────────────────────┐
│                    Your App (Expo)                      │
├─────────────────────────────────────────────────────────┤
│                  @ridly/mobile-core                     │
│    Components │ Hooks │ Stores │ Theme │ Plugins       │
├─────────────────────────────────────────────────────────┤
│                 ECommerceAdapter Interface              │
├──────────────┬──────────────┬──────────────┬───────────┤
│   Magento    │   Shopify    │   Shopware   │  WooComm  │
│   Adapter    │   Adapter    │   Adapter    │  Adapter  │
│     ✅       │     🚧       │     🚧       │    🚧     │
└──────────────┴──────────────┴──────────────┴───────────┘
```

### Key Packages

| Package | Description |
|---------|-------------|
| `@ridly/mobile-core` | UI components, hooks, stores, theming, plugins |
| `@ridly/adapter-magento` | Magento 2 GraphQL adapter |
| `@ridly/theme-luxe` | Premium Luxe theme |
| `@ridly/mobile-plugins` | All premium plugins |

## Documentation

| Document | Description |
|----------|-------------|
| [Configuration](docs/CONFIGURATION.md) | Full configuration reference |
| [Pro Features](docs/PRO_FEATURES.md) | Premium features guide |
| [Plugins](docs/PLUGINS.md) | Plugin system documentation |
| [i18n](docs/I18N.md) | Internationalization guide |
| [Currency](docs/CURRENCY.md) | Multi-currency support |

## Supported Backends

| Backend | Adapter | Status |
|---------|---------|--------|
| Magento 2 / Adobe Commerce | `@ridly/adapter-magento` | ✅ Ready |
| Shopify | `@ridly/adapter-shopify` | 🚧 Coming |
| Shopware | `@ridly/adapter-shopware` | 🚧 Coming |
| WooCommerce | `@ridly/adapter-woocommerce` | 🚧 Coming |

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/ridly-mobile-sdk.git

# Create a feature branch
git checkout -b feature/my-feature

# Make changes and test
yarn typecheck
yarn lint
yarn test

# Submit a PR
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- GitHub Issues: [Report a bug](https://github.com/nicksavov/ridly-mobile-sdk/issues)
- Documentation: [docs/](docs/)

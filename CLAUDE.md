# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RIDLY Mobile SDK is an open-source React Native SDK for building native e-commerce mobile apps. Version 1.0 targets Magento 2 / Adobe Commerce with an adapter pattern supporting future platforms (Shopware, WooCommerce).

**Tech stack**: Expo SDK 52+, Expo Router v4, NativeWind v4, Zustand, TanStack Query v5, TypeScript (strict mode), Magento GraphQL

## Monorepo Structure

```
ridly-mobile-sdk/
├── apps/magento/          # Demo Expo app (@ridly/magento-app)
├── packages/
│   ├── core/              # @ridly/mobile-core - Components, hooks, stores, types
│   └── adapter-magento/   # @ridly/mobile-adapter-magento - Magento 2 GraphQL adapter
├── e2e/                   # Detox E2E tests
└── docs/                  # Documentation
```

## Common Commands

```bash
# Development
yarn dev                    # Start demo app (Expo)
yarn workspace @ridly/magento-app ios      # Run iOS
yarn workspace @ridly/magento-app android  # Run Android
yarn workspace @ridly/magento-app web      # Run web

# Quality
yarn typecheck              # TypeScript check across all packages
yarn lint                   # ESLint
yarn lint:fix               # ESLint with auto-fix
yarn format                 # Prettier format

# Testing
yarn test                   # Unit tests across all packages
yarn workspace @ridly/mobile-adapter-magento test        # Run adapter tests (vitest)
yarn workspace @ridly/mobile-adapter-magento test:watch  # Watch mode

# E2E (Detox)
yarn e2e:build:ios          # Build iOS for E2E
yarn e2e:test:ios           # Run E2E tests on iOS simulator
yarn e2e:build:android      # Build Android for E2E
yarn e2e:test:android       # Run E2E tests on Android emulator

# Package-specific
yarn workspace @ridly/mobile-adapter-magento codegen  # Generate GraphQL types
```

## Architecture

### Adapter Pattern

The SDK is backend-agnostic. All platform-specific code lives in adapters that implement `ECommerceAdapter` interface (`packages/core/src/types/adapter.ts`).

```
Core components → ECommerceAdapter interface → Platform adapters (Magento, etc.)
```

Core components never call platform APIs directly - they use hooks that consume the adapter.

### Key Modules in @ridly/mobile-core

- **types/**: TypeScript interfaces for all entities (Product, Cart, Customer, Order, etc.) and the `ECommerceAdapter` interface
- **hooks/**: React hooks (useProducts, useCart, useAuth, useCheckout, etc.) that consume adapters
- **stores/**: Zustand stores (auth, cart, config, toast, wishlist)
- **components/**: UI components (Button, Input, Card, Badge, Skeleton, Price, Toast)
- **theme/**: Theming system (ThemeProvider, useTheme, createTheme, design tokens)
- **plugins/**: Plugin system for premium features (PluginRegistry)
- **i18n/**: Internationalization (I18nStore, useTranslation)
- **currency/**: Multi-currency support
- **config/**: ConfigManager for centralized app configuration
- **registry/**: ComponentRegistry and SlotRegistry for theme customization

### Magento Adapter (@ridly/mobile-adapter-magento)

- **MagentoAdapter.ts**: Main adapter implementing ECommerceAdapter
- **graphql/**: GraphQL queries, mutations, fragments
- **transformers.ts**: Transform Magento responses to SDK types
- **client.ts**: GraphQL client setup

### Demo App (apps/magento)

Uses Expo Router for file-based routing:
- `app/(tabs)/` - Tab navigation screens (home, categories, cart, account, saved)
- `app/product/[slug].tsx` - Product detail page
- `app/category/[slug].tsx` - Category page
- `app/checkout.tsx` - Checkout flow
- `app/search.tsx` - Search screen

## Configuration

App configuration is centralized via `ridly.config.ts` using `defineConfig()` from core. The ConfigManager handles initialization at app startup.

## TypeScript

Strict mode enabled with all strict flags. Path aliases configured:
- `@ridly/mobile-core` → `packages/core/src`
- `@ridly/mobile-adapter-magento` → `packages/adapter-magento/src`

## E2E Testing

Detox configured for iOS simulator and Android emulator. Tests in `e2e/flows/`:
- smoke.test.ts, catalog.test.ts, cart.test.ts, checkout.test.ts, auth.test.ts, premium-features.test.ts
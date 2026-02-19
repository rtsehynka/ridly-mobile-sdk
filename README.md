# RIDLY Mobile SDK

Open-source React Native SDK for building native e-commerce mobile apps.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2052-000020)](https://expo.dev/)

## Overview

RIDLY Mobile SDK converts e-commerce stores into native iOS and Android mobile apps. Version 1.0 targets **Magento 2 / Adobe Commerce** with an adapter pattern that supports future platforms (Shopware, WooCommerce, etc.).

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Expo SDK 52+ |
| Navigation | Expo Router v4 |
| Styling | NativeWind v4 |
| State | Zustand |
| Data Fetching | TanStack Query v5 |
| API | Magento GraphQL |
| Language | TypeScript (strict) |

## Project Structure

```
ridly-mobile/
├── apps/
│   └── magento/              # Demo app (Expo Router)
├── packages/
│   ├── core/                 # @ridly/mobile-core
│   ├── adapter-magento/      # @ridly/mobile-adapter-magento
│   ├── adapter-shopware/     # Stub (Phase 2)
│   └── adapter-woocommerce/  # Stub (Phase 3)
├── docs/                     # Documentation
└── scripts/                  # Build scripts
```

## Getting Started

```bash
# Clone the repository
git clone https://github.com/ridly-dev/ridly-mobile.git
cd ridly-mobile

# Install dependencies
yarn install

# Start the demo app
yarn dev
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [Configuration](docs/configuration.md)
- [Theming](docs/theming.md)
- [Creating Adapters](docs/creating-adapter.md)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ridly-dev/ridly-mobile.git
cd ridly-mobile

# Install dependencies (requires Yarn 4)
yarn install

# Start the demo app
yarn dev

# Or run specific platforms
yarn workspace @ridly/magento-app ios
yarn workspace @ridly/magento-app android
yarn workspace @ridly/magento-app web
```

## Verify Setup

After installation, verify everything works:

```bash
# 1. Check TypeScript compilation
yarn typecheck

# 2. Run linting
yarn lint

# 3. Start the demo app
yarn dev
```

Expected result: The Expo development server should start and you can open the app in a simulator or on your device.

---

## Development Progress

### Week 1: Project Scaffold & Foundation ✅ COMPLETE

| Task | Status |
|------|--------|
| Initialize yarn workspaces | Done |
| Create tsconfig.base.json | Done |
| Setup ESLint + Prettier | Done |
| Create .gitignore, .editorconfig | Done |
| Create packages/core scaffold | Done |
| Create packages/adapter-magento scaffold | Done |
| Create Expo app with Expo Router | Done |
| Configure NativeWind v4 | Done |
| Create ridly.mobile.config.json | Done |
| Setup theme system foundation | Done |
| Verify monorepo with yarn install | Done |

### Completed Files

**Root Config:**
- `package.json` - Yarn workspaces configuration
- `tsconfig.base.json` - TypeScript strict mode config
- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.gitignore` - Git ignore patterns
- `.editorconfig` - Editor settings
- `.yarnrc.yml` - Yarn 4 configuration (node-modules linker)
- `yarn.lock` - Dependency lock file

**packages/core:**
- Complete type definitions (adapter, product, category, cart, customer, checkout, order, cms, config, theme)
- ECommerceAdapter interface with 50+ methods
- Theme system (ThemeProvider, useTheme, createTheme, tokens)
- Placeholder structure for components, hooks, stores, utils

**packages/adapter-magento:**
- MagentoAdapter class (stub implementation)
- MagentoGraphQLClient for API calls
- GraphQL client setup

**apps/magento:**
- Expo SDK 54 with Expo Router
- NativeWind v4 configured
- Metro config for monorepo
- `ridly.mobile.config.json` - Complete config template
- Tailwind CSS setup
- Babel config for NativeWind

### Week 2: UI Kit — Core Components ✅ COMPLETE

| Task | Status |
|------|--------|
| Button component (primary, secondary, outline, ghost, danger) | Done |
| Text component (h1-h4, body, caption, label, price) | Done |
| Input component (text, email, password, phone, search) | Done |
| Card component (elevated, outlined, filled) | Done |
| Badge component (default, status, discount, count) | Done |
| Skeleton component (text, card, list) | Done |
| Price component with formatPrice utility | Done |
| Toast notification system | Done |
| Demo app showcase | Done |

### Week 2 Components

**UI Components (`packages/core/src/components/ui/`):**

| Component | Description | Props |
|-----------|-------------|-------|
| `Button` | Primary action button | variant, size, loading, fullWidth, disabled |
| `Text` | Typography component | variant, weight, align, color |
| `H1-H4` | Heading shortcuts | Same as Text |
| `Input` | Form input field | type, label, error, helperText, disabled |
| `Card` | Content container | variant, padding, onPress |
| `Badge` | Status indicator | variant, size, pill, outline |
| `DiscountBadge` | Sale percentage | percent |
| `StatusBadge` | Stock status | status (in_stock, out_of_stock, etc) |
| `CountBadge` | Notification count | count, max |
| `Skeleton` | Loading placeholder | width, height, circle |
| `SkeletonText` | Text loading | lines |
| `SkeletonCard` | Card loading | showImage |
| `Price` | Price display | price, originalPrice, currency |
| `PriceRange` | Price range | minPrice, maxPrice |
| `ToastContainer` | Toast display | position |
| `useToast` | Toast hook | success, error, warning, info |

**Utilities (`packages/core/src/utils/`):**
- `formatPrice` - Format price with currency
- `formatPriceRange` - Format min-max price
- `formatSalePrice` - Format sale with discount
- `calculateDiscount` - Calculate discount percentage

**Stores (`packages/core/src/stores/`):**
- `useToastStore` - Zustand store for toast notifications
- `toast` - Helper functions for showing toasts

**Current Phase**: Week 3 - Product Components

**Last Updated**: 2026-02-17

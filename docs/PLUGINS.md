# RIDLY Plugins Guide

Complete guide to using and configuring RIDLY plugins.

## Overview

RIDLY plugins extend app functionality with premium features:

| Plugin | Description | Package |
|--------|-------------|---------|
| Google Auth | Google Sign-In | `@ridly/mobile-plugins` |
| Apple Auth | Apple Sign-In | `@ridly/mobile-plugins` |
| Algolia Search | Fast product search | `@ridly/mobile-plugins` |
| Apple Pay | Apple Pay payments | `@ridly/mobile-plugins` |
| Google Pay | Google Pay payments | `@ridly/mobile-plugins` |
| Push Notifications | Push notifications | `@ridly/mobile-plugins` |
| Barcode Scanner | QR/Barcode scanning | `@ridly/mobile-plugins` |
| Offline Mode | Offline support | `@ridly/mobile-plugins` |

## Installation

```bash
# Install plugins package
yarn add @ridly/mobile-plugins

# Install required peer dependencies based on plugins you use
yarn add expo-auth-session              # Google Auth
yarn add expo-apple-authentication      # Apple Auth
yarn add @stripe/stripe-react-native    # Apple/Google Pay
yarn add expo-notifications expo-device # Push Notifications
yarn add expo-barcode-scanner           # Barcode Scanner
yarn add @react-native-async-storage/async-storage @react-native-community/netinfo # Offline
```

## Configuration

All plugins are configured via `ridly.config.ts`:

```typescript
export default defineConfig({
  plugins: {
    search: { /* ... */ },
    auth: { /* ... */ },
    payments: { /* ... */ },
    notifications: { /* ... */ },
    scanner: { /* ... */ },
    offline: { /* ... */ },
  },
});
```

## Search Plugin (Algolia)

### Configuration

```typescript
plugins: {
  search: {
    provider: 'algolia',
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY', // Public search-only key
      indexName: 'products',
    },
  },
}
```

### Usage

```typescript
import { useSearchPlugin } from '@ridly/mobile-core';

function SearchScreen() {
  const { isAvailable, search, suggest } = useSearchPlugin();

  const handleSearch = async (query: string) => {
    const results = await search(query, {
      page: 1,
      pageSize: 20,
      filters: { category: 'shoes' },
    });

    console.log(results.items, results.totalCount, results.facets);
  };

  const handleSuggestions = async (query: string) => {
    const suggestions = await suggest(query, 5);
    console.log(suggestions); // ['Nike Air Max', 'Nike Jordan', ...]
  };
}
```

## Auth Plugins

### Google Sign-In

**Configuration:**
```typescript
plugins: {
  auth: {
    google: {
      enabled: true,
      webClientId: 'xxx.apps.googleusercontent.com',
      iosClientId: 'xxx.apps.googleusercontent.com',
      androidClientId: 'xxx.apps.googleusercontent.com',
    },
  },
}
```

**Usage:**
```typescript
import { useSocialAuth } from '@ridly/mobile-core';

function LoginScreen() {
  const { hasGoogle, hasApple, signInWith } = useSocialAuth();

  const handleGoogleSignIn = async () => {
    const result = await signInWith('google');
    if (result.success) {
      console.log('User:', result.user);
      console.log('Token:', result.tokens.accessToken);
    } else {
      console.error('Error:', result.error);
    }
  };

  return (
    <>
      {hasGoogle && <Button onPress={handleGoogleSignIn}>Sign in with Google</Button>}
      {hasApple && <Button onPress={() => signInWith('apple')}>Sign in with Apple</Button>}
    </>
  );
}
```

### Apple Sign-In

**Configuration:**
```typescript
plugins: {
  auth: {
    apple: {
      enabled: true,
    },
  },
}
```

**Note:** Apple Sign-In requires additional setup in Xcode and Apple Developer account.

## Payment Plugins

### Apple Pay & Google Pay

**Configuration:**
```typescript
plugins: {
  payments: {
    stripe: {
      publishableKey: 'pk_test_xxx',
      merchantId: 'merchant.com.yourapp',
      merchantName: 'Your Store',
      countryCode: 'US',
    },
    applePay: { enabled: true },
    googlePay: { enabled: true, testEnv: true },
  },
}
```

**Usage:**
```typescript
import { usePayments } from '@ridly/mobile-core';

function CheckoutScreen() {
  const { hasApplePay, hasGooglePay, plugins } = usePayments();

  const handleApplePay = async (amount: number) => {
    const applePayPlugin = plugins.find(p => p.metadata.id === 'apple-pay');
    if (!applePayPlugin) return;

    const session = await applePayPlugin.createPaymentSession(amount * 100, 'USD');
    const result = await applePayPlugin.processPayment(session);

    if (result.success) {
      console.log('Payment successful:', result.transactionId);
    }
  };

  return (
    <>
      {hasApplePay && <ApplePayButton onPress={() => handleApplePay(99.99)} />}
      {hasGooglePay && <GooglePayButton onPress={() => handleGooglePay(99.99)} />}
    </>
  );
}
```

## Push Notifications

### Configuration

```typescript
plugins: {
  notifications: {
    enabled: true,
    android: {
      channelId: 'default',
      channelName: 'Notifications',
      color: '#FF0000',
    },
  },
}
```

### Usage

```typescript
import { useNotifications } from '@ridly/mobile-core';

function App() {
  const {
    isAvailable,
    isEnabled,
    token,
    requestPermissions,
    scheduleLocal,
  } = useNotifications();

  useEffect(() => {
    if (isAvailable && !isEnabled) {
      requestPermissions();
    }
  }, [isAvailable, isEnabled]);

  // Schedule local notification
  const remindLater = async () => {
    await scheduleLocal({
      title: 'Don\'t forget!',
      body: 'Items in your cart are waiting',
      triggerAt: new Date(Date.now() + 3600000), // 1 hour
    });
  };
}
```

## Barcode Scanner

### Configuration

```typescript
plugins: {
  scanner: {
    enabled: true,
    barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e'],
  },
}
```

### Usage

```typescript
import { useScanner } from '@ridly/mobile-core';
import { BarcodeScannerView } from '@ridly/theme-luxe';

function ScannerScreen() {
  const { isAvailable, startScan } = useScanner();
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = (data: string, type: 'barcode' | 'qr') => {
    console.log('Scanned:', data, type);
    setShowScanner(false);

    // Navigate to product by barcode
    if (type === 'barcode') {
      router.push(`/product/barcode/${data}`);
    }
  };

  if (showScanner) {
    return (
      <BarcodeScannerView
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  return (
    <Button onPress={() => setShowScanner(true)}>
      Scan Product
    </Button>
  );
}
```

## Offline Mode

### Configuration

```typescript
plugins: {
  offline: {
    enabled: true,
    cacheTTL: 3600,        // 1 hour
    maxQueueSize: 50,
    autoProcessQueue: true,
  },
}
```

### Usage

```typescript
import { useOffline } from '@ridly/mobile-core';

function ProductScreen({ productId }) {
  const { isOnline, cache, getCached, queueAction } = useOffline();

  // Cache product data
  useEffect(() => {
    const loadProduct = async () => {
      // Try cache first
      const cached = await getCached(`product:${productId}`);
      if (cached) {
        setProduct(cached);
      }

      // Fetch fresh data if online
      if (isOnline) {
        const fresh = await fetchProduct(productId);
        setProduct(fresh);
        await cache(`product:${productId}`, fresh, 3600);
      }
    };

    loadProduct();
  }, [productId, isOnline]);

  // Queue action for later if offline
  const addToCart = async () => {
    if (isOnline) {
      await api.addToCart(productId);
    } else {
      await queueAction({
        id: `add-to-cart-${productId}`,
        type: 'api-request',
        payload: {
          url: '/api/cart/add',
          method: 'POST',
          body: { productId },
        },
      });
      showToast('Added to cart (will sync when online)');
    }
  };
}
```

## Creating Custom Plugins

```typescript
import { createPlugin, RidlyPlugin } from '@ridly/mobile-core';

interface MyPluginConfig {
  apiKey: string;
}

export function createMyPlugin(): RidlyPlugin {
  let config: MyPluginConfig | null = null;

  return createPlugin({
    metadata: {
      id: 'my-plugin',
      name: 'My Custom Plugin',
      version: '1.0.0',
      category: 'custom',
      platforms: ['any'],
    },

    isActive: false,

    async initialize(cfg) {
      config = cfg as MyPluginConfig;
      console.log('Plugin initialized');
    },

    async cleanup() {
      config = null;
    },

    // Add custom methods
    myMethod() {
      return 'Hello from plugin!';
    },
  });
}
```

## Plugin Hooks Reference

| Hook | Description |
|------|-------------|
| `usePlugin(id)` | Get plugin by ID |
| `usePluginByCategory(category)` | Get active plugin by category |
| `usePluginAvailable(category)` | Check if category has active plugin |
| `useActivePlugins()` | Get all active plugins |
| `useSearchPlugin()` | Search plugin helpers |
| `usePayments()` | Payment plugins helpers |
| `useSocialAuth()` | Auth plugins helpers |
| `useNotifications()` | Notifications plugin helpers |
| `useScanner()` | Scanner plugin helpers |
| `useAnalytics()` | Analytics plugin helpers |
| `useOffline()` | Offline plugin helpers |

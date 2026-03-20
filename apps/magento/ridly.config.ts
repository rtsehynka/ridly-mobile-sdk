/**
 * RIDLY Configuration
 *
 * Central configuration file for the entire app.
 * All plugins, features, UI settings defined here.
 */

import { defineConfig } from '@ridly/mobile-core';

export default defineConfig({
  // ===========================================
  // APP INFO
  // ===========================================
  app: {
    name: 'RIDLY Demo',
    version: '1.0.0',
    bundleId: 'com.ridly.demo',
    scheme: 'ridly',
    supportEmail: 'support@ridly.io',
    termsUrl: 'https://ridly.io/terms',
    privacyUrl: 'https://ridly.io/privacy',
  },

  // ===========================================
  // BACKEND / PLATFORM
  // ===========================================
  platform: {
    type: 'magento',
    apiUrl: process.env.EXPO_PUBLIC_MAGENTO_URL || 'https://magento.ridly.io/graphql',
    storeCode: process.env.EXPO_PUBLIC_STORE_CODE || 'default',
    timeout: 30000,
  },

  // ===========================================
  // THEME
  // ===========================================
  theme: {
    id: 'ridly-luxe',
    defaultMode: 'system',
    colors: {
      primary: '#C9A961',
      secondary: '#1A1A1A',
      accent: '#E8DCC4',
    },
  },

  // ===========================================
  // LANGUAGES (i18n)
  // ===========================================
  i18n: {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    locales: [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    ],
  },

  // ===========================================
  // CURRENCIES
  // ===========================================
  currency: {
    defaultCurrency: 'EUR',
    currencies: ['EUR', 'USD', 'GBP', 'UAH', 'PLN'],
    autoDetect: true,
  },

  // ===========================================
  // HOME SCREEN
  // ===========================================
  homeScreen: {
    sections: [
      { type: 'banner', enabled: false },
      { type: 'categories', enabled: true, title: 'Categories', style: 'horizontal', limit: 8 },
      { type: 'featured', enabled: true, title: 'Featured Products', limit: 10, style: 'carousel' },
      { type: 'newArrivals', enabled: true, title: 'New Arrivals', limit: 10, style: 'grid' },
      { type: 'onSale', enabled: true, title: 'On Sale', limit: 10, style: 'carousel' },
    ],
  },

  // ===========================================
  // PRODUCT DISPLAY
  // ===========================================
  product: {
    gridColumns: 2,
    showSku: false,
    showStock: true,
    showRating: false,
    showWishlist: true,
    showShare: false,
    showRelated: true,
    imageAspectRatio: '1:1',
    galleryStyle: 'scroll',
  },

  // ===========================================
  // NAVIGATION
  // ===========================================
  navigation: {
    tabs: [
      { name: 'Home', icon: 'home', route: '/' },
      { name: 'Categories', icon: 'grid', route: '/categories' },
      { name: 'Cart', icon: 'cart', route: '/cart', showBadge: true },
      { name: 'Profile', icon: 'person', route: '/account' },
    ],
    drawer: {
      enabled: true,
      showCategories: true,
      showUserProfile: true,
      customLinks: [
        { label: 'My Orders', icon: 'receipt-outline', route: '/orders' },
        { label: 'Wishlist', icon: 'heart-outline', route: '/wishlist' },
        { label: 'Settings', icon: 'settings-outline', route: '/settings' },
      ],
    },
    header: {
      showLogo: true,
      showSearch: true,
      showHamburger: true,
      logoStyle: 'text',
      logoText: 'RIDLY',
    },
  },

  // ===========================================
  // CHECKOUT
  // ===========================================
  checkout: {
    webViewCheckout: false,
    webViewPaymentOnly: false,
    requirePhone: true,
    requireRegion: true,
    defaultCountry: 'US',
  },

  // ===========================================
  // PLUGINS
  // ===========================================
  plugins: {
    // Search
    search: {
      provider: 'algolia',
      algolia: {
        appId: process.env.EXPO_PUBLIC_ALGOLIA_APP_ID || '',
        apiKey: process.env.EXPO_PUBLIC_ALGOLIA_API_KEY || '',
        indexName: process.env.EXPO_PUBLIC_ALGOLIA_INDEX || 'products',
      },
    },

    // Social Auth
    auth: {
      google: {
        enabled: true,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      },
      apple: {
        enabled: true,
      },
      facebook: {
        enabled: false,
        appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
      },
    },

    // Payments
    payments: {
      stripe: {
        publishableKey: process.env.EXPO_PUBLIC_STRIPE_KEY || '',
        merchantId: process.env.EXPO_PUBLIC_MERCHANT_ID || 'merchant.com.ridly.demo',
        merchantName: process.env.EXPO_PUBLIC_MERCHANT_NAME || 'RIDLY Demo Store',
        countryCode: 'US',
      },
      applePay: {
        enabled: true,
      },
      googlePay: {
        enabled: true,
        testEnv: true,
      },
    },

    // Push Notifications
    notifications: {
      enabled: true,
      android: {
        channelId: 'ridly-default',
        channelName: 'RIDLY Notifications',
        color: '#C9A961',
      },
    },

    // Barcode Scanner
    scanner: {
      enabled: true,
      barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e'],
    },

    // Offline Mode
    offline: {
      enabled: true,
      cacheTTL: 3600,
      maxQueueSize: 50,
      autoProcessQueue: true,
    },

    // Analytics
    analytics: {
      provider: 'firebase',
      firebase: {
        enabled: true,
      },
      autoTrackScreens: true,
      trackEcommerce: true,
    },
  },

  // ===========================================
  // FEATURE FLAGS
  // ===========================================
  features: {
    wishlist: true,
    reviews: true,
    compare: false,
    barcodeScanner: true,
    pushNotifications: true,
    offlineMode: true,
    socialLogin: true,
    guestCheckout: true,
    multiLanguage: true,
    multiCurrency: true,
  },

  // ===========================================
  // ANALYTICS
  // ===========================================
  analytics: {
    enabled: true,
    debug: false,
  },

  // ===========================================
  // DEVELOPMENT
  // ===========================================
  dev: {
    debug: __DEV__,
    showDevTools: __DEV__,
    logNetwork: false,
    useMockData: false,
  },
});

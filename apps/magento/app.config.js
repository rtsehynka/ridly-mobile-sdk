// Dynamic Expo config that supports baseUrl from environment variable
// Used for subdirectory deployment (e.g., /mobile-demo/base-theme/)

const baseUrl = process.env.EXPO_BASE_URL || ''

module.exports = {
  expo: {
    name: 'RIDLY Demo Store',
    slug: 'ridly-demo-magento',
    version: '0.1.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'ridly',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'dev.ridly.demo.magento',
    },
    android: {
      package: 'dev.ridly.demo.magento',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: ['expo-router', ['expo-splash-screen', { image: './assets/images/icon.png', imageWidth: 100, backgroundColor: '#ffffff' }]],
    experiments: {
      typedRoutes: true,
      // Set baseUrl for subdirectory deployment
      ...(baseUrl ? { baseUrl } : {}),
    },
  },
}

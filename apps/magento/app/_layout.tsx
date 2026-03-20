/**
 * RIDLY Mobile Demo - Root Layout
 *
 * Sets up the theme provider and navigation using central config.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import 'react-native-reanimated';

// Dynamic import for expo-network to avoid crashes on builds without native module
let Network: { getNetworkStateAsync: () => Promise<{ isConnected: boolean }> } | null = null;
try {
  Network = require('expo-network');
} catch {
  // expo-network not available (e.g., in release builds without native module)
}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider, ToastContainer, useConfigStore, useTheme } from '@ridly/mobile-core';

// Theme loaded from config - falls back to base theme if premium not available
import { themePackage } from '../lib/theme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});
import { config, magentoAdapter } from '../lib/adapter';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

// Offline Banner Component
function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        if (Network) {
          const networkState = await Network.getNetworkStateAsync();
          setIsOffline(!networkState.isConnected);
        } else {
          // Network module not available, assume online
          setIsOffline(false);
        }
      } catch {
        // Network check failed, assume online
        setIsOffline(false);
      }
    };

    // Check initially only (no interval to avoid Detox sync issues)
    checkNetwork();
  }, []);

  if (!isOffline) return null;

  return (
    <View testID="offline-banner" style={styles.offlineBanner}>
      <Text style={styles.offlineText}>You are offline. Some features may be limited.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  offlineText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
});

function RootLayoutNav() {
  const { initialize, isInitialized, isInitializing, initError } = useConfigStore();

  // Initialize the SDK with the adapter
  useEffect(() => {
    const initSDK = async () => {
      // Don't retry if already initialized, initializing, or had an error
      if (!isInitialized && !isInitializing && !initError) {
        try {
          await initialize(config as any, magentoAdapter);
          console.log('SDK initialized successfully');
        } catch (error) {
          console.error('SDK initialization failed:', error);
        }
      }
    };
    initSDK();
  }, [initialize, isInitialized, isInitializing, initError]);

  // Log initialization status for debugging
  useEffect(() => {
    console.log('SDK status:', { isInitialized, isInitializing, hasError: !!initError });
    if (initError) {
      console.error('Init error:', initError);
    }
  }, [isInitialized, isInitializing, initError]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider themePackage={themePackage}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="product/[slug]"
            options={{
              title: 'Product',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="category/[slug]"
            options={{
              title: 'Category',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="checkout"
            options={{
              title: 'Checkout',
              headerBackTitle: 'Cart',
            }}
          />
          <Stack.Screen
            name="checkout/success"
            options={{
              title: 'Order Confirmed',
              headerBackVisible: false,
            }}
          />
        </Stack>
        <OfflineBanner />
        <ToastContainer position="top" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

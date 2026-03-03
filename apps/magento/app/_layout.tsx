/**
 * RIDLY Mobile Demo - Root Layout
 *
 * Sets up the theme provider and navigation using central config.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ThemeProvider, ToastContainer, useConfigStore } from '@ridly/mobile-core';
import type { ThemeConfig } from '@ridly/mobile-core';
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

function RootLayoutNav() {
  const { initialize, isInitialized, isInitializing, initError } = useConfigStore();

  // Initialize the SDK with the adapter
  useEffect(() => {
    const initSDK = async () => {
      if (!isInitialized && !isInitializing) {
        try {
          await initialize(config as any, magentoAdapter);
          console.log('SDK initialized successfully');
        } catch (error) {
          console.error('SDK initialization failed:', error);
        }
      }
    };
    initSDK();
  }, [initialize, isInitialized, isInitializing]);

  // Log initialization status for debugging
  useEffect(() => {
    console.log('SDK status:', { isInitialized, isInitializing, hasError: !!initError });
    if (initError) {
      console.error('Init error:', initError);
    }
  }, [isInitialized, isInitializing, initError]);

  // Cast theme config from JSON to the expected type
  const themeConfig = config.theme as ThemeConfig;

  return (
    <ThemeProvider config={themeConfig}>
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
      </Stack>
      <ToastContainer position="top" />
    </ThemeProvider>
  );
}

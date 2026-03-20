/**
 * Apple Sign-In Plugin
 *
 * Social authentication with Apple.
 * Uses expo-apple-authentication for native Sign in with Apple.
 */

import type {
  SocialAuthPlugin,
  SocialAuthResult,
  SocialUser,
  PluginConfig,
} from '@ridly/mobile-core';
import { createPlugin } from '@ridly/mobile-core';

/**
 * Apple Auth configuration
 */
export interface AppleAuthConfig extends PluginConfig {
  /** Request user's name */
  requestName?: boolean;
  /** Request user's email */
  requestEmail?: boolean;
}

/**
 * Create Apple Auth Plugin
 */
export function createAppleAuthPlugin(): SocialAuthPlugin {
  let config: AppleAuthConfig | null = null;
  let currentUser: SocialUser | null = null;
  let identityToken: string | null = null;

  const plugin = createPlugin<SocialAuthPlugin>({
    metadata: {
      id: 'apple-auth',
      name: 'Apple Sign-In',
      version: '1.0.0',
      category: 'auth',
      description: 'Sign in with Apple',
      author: 'RIDLY',
      platforms: ['any'], // iOS native, web fallback
      permissions: [],
    },

    provider: 'apple',
    isActive: false,

    async initialize(cfg?: PluginConfig): Promise<void> {
      config = (cfg as AppleAuthConfig) || {
        requestName: true,
        requestEmail: true,
      };
      console.log('[AppleAuth] Initialized');
    },

    async cleanup(): Promise<void> {
      currentUser = null;
      identityToken = null;
      console.log('[AppleAuth] Cleaned up');
    },

    async isAvailable(): Promise<boolean> {
      try {
        // Dynamic import for expo-apple-authentication
        const AppleAuthentication = await import('expo-apple-authentication');
        return await AppleAuthentication.isAvailableAsync();
      } catch {
        // Package not installed or not available
        return false;
      }
    },

    async signIn(): Promise<SocialAuthResult> {
      if (!config) {
        return {
          success: false,
          error: 'Plugin not initialized',
        };
      }

      try {
        // Dynamic import for expo-apple-authentication
        const AppleAuthentication = await import('expo-apple-authentication');

        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            ...(config.requestName ? [AppleAuthentication.AppleAuthenticationScope.FULL_NAME] : []),
            ...(config.requestEmail ? [AppleAuthentication.AppleAuthenticationScope.EMAIL] : []),
          ],
        });

        identityToken = credential.identityToken;

        // Note: Apple only provides name/email on first sign-in
        // Subsequent sign-ins only provide user ID
        currentUser = {
          id: credential.user,
          email: credential.email || '',
          firstName: credential.fullName?.givenName || undefined,
          lastName: credential.fullName?.familyName || undefined,
          provider: 'apple',
        };

        return {
          success: true,
          user: currentUser,
          tokens: {
            accessToken: credential.authorizationCode || '',
            idToken: credential.identityToken || undefined,
          },
        };
      } catch (error: unknown) {
        const appleError = error as { code?: string; message?: string };

        if (appleError.code === 'ERR_CANCELED') {
          return {
            success: false,
            error: 'User cancelled',
          };
        }

        console.error('[AppleAuth] Sign in error:', error);
        return {
          success: false,
          error: appleError.message || 'Unknown error',
        };
      }
    },

    async signOut(): Promise<void> {
      // Apple Sign-In doesn't have a sign-out API
      // Just clear local state
      currentUser = null;
      identityToken = null;
      console.log('[AppleAuth] Signed out');
    },

    async getCurrentUser(): Promise<SocialUser | null> {
      return currentUser;
    },
  });

  return plugin;
}

/**
 * Default export
 */
export default createAppleAuthPlugin;

/**
 * Google Sign-In Plugin
 *
 * Social authentication with Google.
 * Uses expo-auth-session for OAuth flow.
 */

import type {
  SocialAuthPlugin,
  SocialAuthResult,
  SocialUser,
  PluginConfig,
} from '@ridly/mobile-core';
import { createPlugin } from '@ridly/mobile-core';

/**
 * Google Auth configuration
 */
export interface GoogleAuthConfig extends PluginConfig {
  /** Google OAuth Client ID for iOS */
  iosClientId?: string;
  /** Google OAuth Client ID for Android */
  androidClientId?: string;
  /** Google OAuth Client ID for Web */
  webClientId?: string;
  /** Expo Client ID (for development) */
  expoClientId?: string;
  /** Scopes to request */
  scopes?: string[];
}

/**
 * Google user info response
 */
interface GoogleUserInfo {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  verified_email?: boolean;
}

/**
 * Create Google Auth Plugin
 */
export function createGoogleAuthPlugin(): SocialAuthPlugin {
  let config: GoogleAuthConfig | null = null;
  let currentUser: SocialUser | null = null;
  let accessToken: string | null = null;

  const plugin = createPlugin<SocialAuthPlugin>({
    metadata: {
      id: 'google-auth',
      name: 'Google Sign-In',
      version: '1.0.0',
      category: 'auth',
      description: 'Sign in with Google OAuth',
      author: 'RIDLY',
      platforms: ['any'],
      permissions: [],
    },

    provider: 'google',
    isActive: false,

    async initialize(cfg?: PluginConfig): Promise<void> {
      config = (cfg as GoogleAuthConfig) || {};
      console.log('[GoogleAuth] Initialized');
    },

    async cleanup(): Promise<void> {
      currentUser = null;
      accessToken = null;
      console.log('[GoogleAuth] Cleaned up');
    },

    async isAvailable(): Promise<boolean> {
      // Google Sign-In is available on all platforms
      return true;
    },

    async signIn(): Promise<SocialAuthResult> {
      if (!config) {
        return {
          success: false,
          error: 'Plugin not initialized',
        };
      }

      try {
        // Dynamic import for expo-auth-session
        const AuthSession = await import('expo-auth-session');
        const { makeRedirectUri, useAuthRequest } = AuthSession;

        // This is a placeholder - actual implementation requires hooks
        // In real usage, this would be called from a React component
        // that uses useAuthRequest hook

        const discovery = {
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
          revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
        };

        const redirectUri = makeRedirectUri({
          scheme: 'ridly',
          path: 'auth/google',
        });

        const clientId = config.expoClientId || config.webClientId || '';
        const scopes = config.scopes || ['openid', 'profile', 'email'];

        // Create auth URL
        const authUrl = `${discovery.authorizationEndpoint}?` +
          `client_id=${encodeURIComponent(clientId)}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=token&` +
          `scope=${encodeURIComponent(scopes.join(' '))}`;

        // Open browser for auth
        const result = await AuthSession.startAsync({ authUrl });

        if (result.type === 'success' && result.params.access_token) {
          accessToken = result.params.access_token;

          // Fetch user info
          const userInfo = await fetchGoogleUserInfo(accessToken);

          currentUser = {
            id: userInfo.id,
            email: userInfo.email,
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
            avatar: userInfo.picture,
            provider: 'google',
          };

          return {
            success: true,
            user: currentUser,
            tokens: {
              accessToken,
            },
          };
        }

        return {
          success: false,
          error: result.type === 'cancel' ? 'User cancelled' : 'Authentication failed',
        };
      } catch (error) {
        console.error('[GoogleAuth] Sign in error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    async signOut(): Promise<void> {
      if (accessToken) {
        try {
          // Revoke token
          await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
            method: 'POST',
          });
        } catch (error) {
          console.warn('[GoogleAuth] Failed to revoke token:', error);
        }
      }

      currentUser = null;
      accessToken = null;
      console.log('[GoogleAuth] Signed out');
    },

    async getCurrentUser(): Promise<SocialUser | null> {
      return currentUser;
    },
  });

  return plugin;
}

/**
 * Fetch user info from Google
 */
async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return response.json();
}

/**
 * Default export
 */
export default createGoogleAuthPlugin;

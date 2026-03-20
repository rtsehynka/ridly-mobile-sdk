/**
 * Social Login Buttons Component
 *
 * Buttons for social authentication (Google, Apple, Facebook).
 * Integrates with auth plugins from @ridly/mobile-plugins.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSocialAuth, useTheme } from '@ridly/mobile-core';

interface SocialLoginButtonsProps {
  /** Called when login succeeds */
  onSuccess?: (provider: string, user: unknown) => void;
  /** Called when login fails */
  onError?: (provider: string, error: string) => void;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Show text labels */
  showLabels?: boolean;
  /** Custom style */
  style?: object;
}

export function SocialLoginButtons({
  onSuccess,
  onError,
  direction = 'vertical',
  showLabels = true,
  style,
}: SocialLoginButtonsProps) {
  const { providers, signInWith, hasGoogle, hasApple, hasFacebook } = useSocialAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setLoading(provider);
    try {
      const result = await signInWith(provider);
      if (result.success && result.user) {
        onSuccess?.(provider, result.user);
      } else {
        onError?.(provider, result.error || 'Login failed');
      }
    } catch (error) {
      onError?.(provider, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  };

  const renderButton = (
    provider: string,
    icon: string,
    label: string,
    buttonStyle: object,
    textStyle: object
  ) => {
    const isLoading = loading === provider;

    return (
      <TouchableOpacity
        key={provider}
        testID={`${provider}-signin-button`}
        style={[
          styles.button,
          buttonStyle,
          direction === 'horizontal' && styles.buttonHorizontal,
          isLoading && styles.buttonDisabled,
        ]}
        onPress={() => handleSignIn(provider)}
        disabled={isLoading || loading !== null}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={textStyle.color as string} />
        ) : (
          <>
            <Text style={[styles.icon, textStyle]}>{icon}</Text>
            {showLabels && (
              <Text style={[styles.label, textStyle]}>{label}</Text>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  };

  const buttons = [];

  // Apple Sign In (iOS only or web)
  if (hasApple) {
    buttons.push(
      renderButton(
        'apple',
        '', // Apple logo would be an icon
        'Continue with Apple',
        styles.appleButton,
        styles.appleText
      )
    );
  }

  // Google Sign In
  if (hasGoogle) {
    buttons.push(
      renderButton(
        'google',
        'G',
        'Continue with Google',
        [styles.googleButton, { borderColor: theme.colors.border }],
        [styles.googleText, { color: theme.colors.text }]
      )
    );
  }

  // Facebook Sign In
  if (hasFacebook) {
    buttons.push(
      renderButton(
        'facebook',
        'f',
        'Continue with Facebook',
        styles.facebookButton,
        styles.facebookText
      )
    );
  }

  if (buttons.length === 0) {
    return null;
  }

  return (
    <View
      testID="social-login-buttons"
      style={[
        styles.container,
        direction === 'horizontal' && styles.containerHorizontal,
        style,
      ]}
    >
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
          or continue with
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
      </View>

      {/* Buttons */}
      <View
        style={[
          styles.buttonsContainer,
          direction === 'horizontal' && styles.buttonsHorizontal,
        ]}
      >
        {buttons}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  containerHorizontal: {
    // No changes needed
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonsContainer: {
    gap: 12,
  },
  buttonsHorizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  buttonHorizontal: {
    flex: 1,
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Apple
  appleButton: {
    backgroundColor: '#000',
  },
  appleText: {
    color: '#fff',
  },
  // Google
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  googleText: {
    color: '#333',
  },
  // Facebook
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  facebookText: {
    color: '#fff',
  },
});

export default SocialLoginButtons;

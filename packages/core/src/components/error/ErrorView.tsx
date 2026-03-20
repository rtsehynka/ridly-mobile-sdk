/**
 * RIDLY Mobile SDK - Error View Component
 *
 * A reusable error display component for showing errors inline.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type ErrorType = 'network' | 'auth' | 'notFound' | 'server' | 'generic';

export interface ErrorViewProps {
  /** Error type for appropriate icon and message */
  type?: ErrorType;

  /** Custom title */
  title?: string;

  /** Custom message */
  message?: string;

  /** Retry callback */
  onRetry?: () => void;

  /** Show retry button */
  showRetry?: boolean;

  /** Compact mode for inline display */
  compact?: boolean;

  /** Custom styles */
  style?: ViewStyle;

  /** Theme colors */
  theme?: {
    background?: string;
    text?: string;
    textSecondary?: string;
    error?: string;
    primary?: string;
    onPrimary?: string;
    border?: string;
  };
}

const errorConfig: Record<ErrorType, { icon: keyof typeof Ionicons.glyphMap; title: string; message: string }> = {
  network: {
    icon: 'cloud-offline',
    title: 'No Connection',
    message: 'Please check your internet connection and try again.',
  },
  auth: {
    icon: 'lock-closed',
    title: 'Authentication Required',
    message: 'Please sign in to access this content.',
  },
  notFound: {
    icon: 'search',
    title: 'Not Found',
    message: "The content you're looking for doesn't exist or has been moved.",
  },
  server: {
    icon: 'server',
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
  },
  generic: {
    icon: 'alert-circle',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
};

const defaultTheme = {
  background: 'transparent',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  error: '#DC2626',
  primary: '#1A1A1A',
  onPrimary: '#FFFFFF',
  border: '#E5E7EB',
};

/**
 * Error View Component
 *
 * Displays error messages with appropriate icons and retry functionality.
 *
 * @example
 * ```tsx
 * <ErrorView
 *   type="network"
 *   onRetry={handleRetry}
 * />
 *
 * <ErrorView
 *   type="generic"
 *   title="Custom Error"
 *   message="Something specific went wrong"
 *   showRetry
 *   onRetry={handleRetry}
 *   compact
 * />
 * ```
 */
export function ErrorView({
  type = 'generic',
  title,
  message,
  onRetry,
  showRetry = true,
  compact = false,
  style,
  theme: themeProp,
}: ErrorViewProps) {
  const theme = { ...defaultTheme, ...themeProp };
  const config = errorConfig[type];

  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  if (compact) {
    return (
      <View style={[styles.compactContainer, { borderColor: theme.border }, style]}>
        <View style={styles.compactContent}>
          <Ionicons name={config.icon} size={20} color={theme.error} />
          <View style={styles.compactText}>
            <Text style={[styles.compactTitle, { color: theme.text }]} numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text style={[styles.compactMessage, { color: theme.textSecondary }]} numberOfLines={2}>
              {displayMessage}
            </Text>
          </View>
        </View>
        {showRetry && onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.compactRetry}>
            <Ionicons name="refresh" size={20} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }, style]}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: theme.error + '15' }]}>
        <Ionicons name={config.icon} size={40} color={theme.error} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>
        {displayTitle}
      </Text>

      {/* Message */}
      <Text style={[styles.message, { color: theme.textSecondary }]}>
        {displayMessage}
      </Text>

      {/* Retry Button */}
      {showRetry && onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={onRetry}
        >
          <Ionicons
            name="refresh"
            size={18}
            color={theme.onPrimary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.retryText, { color: theme.onPrimary }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactText: {
    flex: 1,
    marginLeft: 10,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactMessage: {
    fontSize: 12,
    marginTop: 2,
  },
  compactRetry: {
    padding: 8,
    marginLeft: 8,
  },
});

export default ErrorView;

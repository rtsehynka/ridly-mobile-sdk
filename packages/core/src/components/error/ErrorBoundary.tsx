/**
 * RIDLY Mobile SDK - Error Boundary Component
 *
 * Catches JavaScript errors in child components and displays a fallback UI.
 * Provides retry functionality and error reporting.
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;

  /** Custom fallback component */
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);

  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /** Show error details in development */
  showDetails?: boolean;

  /** Custom title for error screen */
  title?: string;

  /** Custom message for error screen */
  message?: string;

  /** Theme colors (optional) */
  theme?: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    primary: string;
    onPrimary: string;
    border: string;
  };
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const defaultTheme = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  error: '#DC2626',
  primary: '#1A1A1A',
  onPrimary: '#FFFFFF',
  border: '#E5E7EB',
};

/**
 * Error Boundary Component
 *
 * Wraps components to catch errors and display a recovery UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error) => reportError(error)}
 *   fallback={(error, retry) => (
 *     <CustomErrorUI error={error} onRetry={retry} />
 *   )}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { children, fallback, showDetails, title, message, theme: themeProp } = this.props;
    const { hasError, error, errorInfo } = this.state;
    const theme = { ...defaultTheme, ...themeProp };

    if (hasError && error) {
      // Custom fallback
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.handleRetry);
        }
        return fallback;
      }

      // Default error UI
      const isDev = __DEV__;
      const shouldShowDetails = showDetails ?? isDev;

      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={[styles.content, { backgroundColor: theme.surface }]}>
            {/* Error Icon */}
            <View style={[styles.iconContainer, { backgroundColor: theme.error + '15' }]}>
              <Ionicons name="warning" size={48} color={theme.error} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: theme.text }]}>
              {title || 'Something went wrong'}
            </Text>

            {/* Message */}
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {message || 'We encountered an unexpected error. Please try again.'}
            </Text>

            {/* Error Details (dev mode) */}
            {shouldShowDetails && (
              <ScrollView
                style={[styles.detailsContainer, { borderColor: theme.border }]}
                contentContainerStyle={styles.detailsContent}
              >
                <Text style={[styles.errorName, { color: theme.error }]}>
                  {error.name}: {error.message}
                </Text>
                {errorInfo?.componentStack && (
                  <Text style={[styles.stackTrace, { color: theme.textSecondary }]}>
                    {errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            {/* Retry Button */}
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={this.handleRetry}
            >
              <Ionicons
                name="refresh"
                size={18}
                color={theme.onPrimary}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.retryText, { color: theme.onPrimary }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  detailsContainer: {
    width: '100%',
    maxHeight: 150,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
  },
  detailsContent: {
    padding: 12,
  },
  errorName: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  stackTrace: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;

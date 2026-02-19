/**
 * RIDLY Mobile SDK - Toast Component
 *
 * Toast notification display component.
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useToastStore, type Toast as ToastType, type ToastType as ToastVariant } from '../../stores/toastStore';

/**
 * Toast Item Component
 */
interface ToastItemProps {
  toast: ToastType;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [fadeAnim, translateY, onDismiss]);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [toast.duration, fadeAnim, translateY, handleDismiss]);

  // Get variant colors
  const getVariantColors = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return {
          bg: theme.colors.success,
          icon: '✓',
        };
      case 'error':
        return {
          bg: theme.colors.error,
          icon: '✕',
        };
      case 'warning':
        return {
          bg: theme.colors.warning,
          icon: '⚠',
        };
      case 'info':
        return {
          bg: '#2196F3',
          icon: 'ℹ',
        };
      default:
        return {
          bg: theme.colors.text,
          icon: '',
        };
    }
  };

  const colors = getVariantColors(toast.type);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
        marginBottom: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.bg,
          borderRadius: theme.borderRadius.medium,
          paddingVertical: 12,
          paddingHorizontal: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
          minWidth: 280,
          maxWidth: '90%',
        }}
      >
        {/* Icon */}
        <Text
          style={{
            fontSize: 16,
            color: '#FFFFFF',
            marginRight: 12,
            fontWeight: '700',
          }}
        >
          {colors.icon}
        </Text>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#FFFFFF',
            }}
          >
            {toast.title}
          </Text>
          {toast.message && (
            <Text
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.9)',
                marginTop: 2,
              }}
            >
              {toast.message}
            </Text>
          )}
        </View>

        {/* Action */}
        {toast.action && (
          <Pressable
            onPress={() => {
              toast.action?.onPress();
              handleDismiss();
            }}
            style={{ marginLeft: 12 }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: '#FFFFFF',
                textDecorationLine: 'underline',
              }}
            >
              {toast.action.label}
            </Text>
          </Pressable>
        )}

        {/* Dismiss */}
        <Pressable
          onPress={handleDismiss}
          hitSlop={8}
          style={{ marginLeft: 12, padding: 4 }}
        >
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>✕</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

/**
 * Toast Container Props
 */
export interface ToastContainerProps {
  /**
   * Position of toasts
   * @default 'top'
   */
  position?: 'top' | 'bottom';

  /**
   * Custom container style
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * Toast Container Component
 *
 * Place this at the root of your app to display toasts.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *       <ToastContainer position="top" />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function ToastContainer({ position = 'top', style }: ToastContainerProps) {
  const insets = useSafeAreaInsets();
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 9999,
          pointerEvents: 'box-none',
        },
        position === 'top'
          ? { top: insets.top + 8 }
          : { bottom: insets.bottom + 8 },
        style,
      ]}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
}

/**
 * Hook for showing toasts
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { showToast } = useToast();
 *
 *   const handleSuccess = () => {
 *     showToast({
 *       type: 'success',
 *       title: 'Success!',
 *       message: 'Your action was completed',
 *     });
 *   };
 *
 *   return <Button onPress={handleSuccess}>Show Toast</Button>;
 * }
 * ```
 */
export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  const removeToast = useToastStore((state) => state.removeToast);
  const clearAllToasts = useToastStore((state) => state.clearAllToasts);

  return {
    showToast: addToast,
    hideToast: removeToast,
    hideAllToasts: clearAllToasts,

    // Convenience methods
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),

    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),

    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message }),

    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
  };
}

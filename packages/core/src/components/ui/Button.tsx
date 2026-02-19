/**
 * RIDLY Mobile SDK - Button Component
 *
 * A customizable button with multiple variants and sizes.
 */

import {
  Pressable,
  Text,
  ActivityIndicator,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  /**
   * Button text content
   */
  children: string;

  /**
   * Visual variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Show loading spinner
   * @default false
   */
  loading?: boolean;

  /**
   * Disable the button
   * @default false
   */
  disabled?: boolean;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon component
   */
  rightIcon?: React.ReactNode;

  /**
   * Custom container style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Custom text style
   */
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Button Component
 *
 * @example
 * ```tsx
 * <Button onPress={handlePress}>Click me</Button>
 * <Button variant="secondary" size="lg">Large Secondary</Button>
 * <Button variant="outline" loading>Loading...</Button>
 * ```
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  // Size configurations
  const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
    sm: { paddingVertical: 8, paddingHorizontal: 12, fontSize: 14 },
    md: { paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 },
  };

  // Variant configurations
  const getVariantStyles = (pressed: boolean): { container: ViewStyle; text: TextStyle } => {
    const baseContainer: ViewStyle = {
      borderRadius: theme.borderRadius.button,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    };

    switch (variant) {
      case 'primary':
        return {
          container: {
            ...baseContainer,
            backgroundColor: isDisabled
              ? theme.colors.disabled
              : pressed
                ? theme.colors.primaryDark
                : theme.colors.primary,
          },
          text: {
            color: isDisabled ? theme.colors.disabledText : theme.colors.onPrimary,
            fontWeight: '600',
          },
        };

      case 'secondary':
        return {
          container: {
            ...baseContainer,
            backgroundColor: isDisabled
              ? theme.colors.disabled
              : pressed
                ? theme.colors.secondaryDark
                : theme.colors.secondary,
          },
          text: {
            color: isDisabled ? theme.colors.disabledText : theme.colors.onPrimary,
            fontWeight: '600',
          },
        };

      case 'outline':
        return {
          container: {
            ...baseContainer,
            backgroundColor: pressed ? theme.colors.primary + '10' : 'transparent',
            borderWidth: 2,
            borderColor: isDisabled ? theme.colors.disabled : theme.colors.primary,
          },
          text: {
            color: isDisabled ? theme.colors.disabledText : theme.colors.primary,
            fontWeight: '600',
          },
        };

      case 'ghost':
        return {
          container: {
            ...baseContainer,
            backgroundColor: pressed ? theme.colors.primary + '10' : 'transparent',
          },
          text: {
            color: isDisabled ? theme.colors.disabledText : theme.colors.primary,
            fontWeight: '600',
          },
        };

      case 'danger':
        return {
          container: {
            ...baseContainer,
            backgroundColor: isDisabled
              ? theme.colors.disabled
              : pressed
                ? '#B71C1C'
                : theme.colors.error,
          },
          text: {
            color: isDisabled ? theme.colors.disabledText : '#FFFFFF',
            fontWeight: '600',
          },
        };

      default:
        return {
          container: baseContainer,
          text: {},
        };
    }
  };

  const currentSize = sizeStyles[size];

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      style={({ pressed }) => {
        const variantStyles = getVariantStyles(pressed);
        return [
          variantStyles.container,
          {
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
            opacity: isDisabled ? 0.6 : 1,
            width: fullWidth ? '100%' : undefined,
          },
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const variantStyles = getVariantStyles(pressed);
        return (
          <>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={variantStyles.text.color}
              />
            ) : (
              <>
                {leftIcon}
                <Text
                  style={[
                    variantStyles.text,
                    { fontSize: currentSize.fontSize },
                    textStyle,
                  ]}
                >
                  {children}
                </Text>
                {rightIcon}
              </>
            )}
          </>
        );
      }}
    </Pressable>
  );
}

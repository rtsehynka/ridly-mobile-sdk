/**
 * RIDLY Mobile SDK - Input Component
 *
 * Text input with validation states and various types.
 */

import { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type InputType = 'text' | 'email' | 'password' | 'phone' | 'number' | 'search';
export type InputState = 'default' | 'focused' | 'error' | 'success' | 'disabled';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Input type
   * @default 'text'
   */
  type?: InputType;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Helper text (shown when no error)
   */
  helperText?: string;

  /**
   * Success state
   */
  success?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon component
   */
  rightIcon?: React.ReactNode;

  /**
   * Show clear button when has value
   * @default false
   */
  clearable?: boolean;

  /**
   * Callback when clear button pressed
   */
  onClear?: () => void;

  /**
   * Container style
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Input style
   */
  inputStyle?: StyleProp<TextStyle>;
}

/**
 * Input Component
 *
 * @example
 * ```tsx
 * <Input label="Email" type="email" placeholder="Enter email" />
 * <Input label="Password" type="password" error="Password is required" />
 * <Input label="Search" type="search" leftIcon={<SearchIcon />} clearable />
 * ```
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    type = 'text',
    placeholder,
    error,
    helperText,
    success = false,
    disabled = false,
    leftIcon,
    rightIcon,
    clearable = false,
    onClear,
    containerStyle,
    inputStyle,
    value,
    onChangeText,
    ...props
  },
  ref
) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Determine current state
  const getState = (): InputState => {
    if (disabled) return 'disabled';
    if (error) return 'error';
    if (success) return 'success';
    if (isFocused) return 'focused';
    return 'default';
  };

  const state = getState();

  // Get border color based on state
  const getBorderColor = (): string => {
    switch (state) {
      case 'focused':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      case 'disabled':
        return theme.colors.border;
      default:
        return theme.colors.border;
    }
  };

  // Get input props based on type
  const getTypeProps = (): Partial<TextInputProps> => {
    switch (type) {
      case 'email':
        return {
          keyboardType: 'email-address',
          autoCapitalize: 'none',
          autoComplete: 'email',
        };
      case 'password':
        return {
          secureTextEntry: !showPassword,
          autoCapitalize: 'none',
          autoComplete: 'password',
        };
      case 'phone':
        return {
          keyboardType: 'phone-pad',
          autoComplete: 'tel',
        };
      case 'number':
        return {
          keyboardType: 'numeric',
        };
      case 'search':
        return {
          autoCapitalize: 'none',
          autoCorrect: false,
          returnKeyType: 'search',
        };
      default:
        return {};
    }
  };

  const showClearButton = clearable && value && value.length > 0;
  const showPasswordToggle = type === 'password';

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {/* Label */}
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: state === 'error' ? theme.colors.error : theme.colors.text,
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: getBorderColor(),
          borderRadius: theme.borderRadius.medium,
          backgroundColor: disabled ? theme.colors.disabled + '20' : theme.colors.surface,
          paddingHorizontal: 12,
          minHeight: 48,
        }}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={{ marginRight: 8 }}>
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          ref={ref}
          {...props}
          {...getTypeProps()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          editable={!disabled}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: disabled ? theme.colors.disabledText : theme.colors.text,
              paddingVertical: 12,
            },
            inputStyle,
          ]}
        />

        {/* Clear Button */}
        {showClearButton && !showPasswordToggle && (
          <Pressable
            onPress={onClear}
            hitSlop={8}
            style={{ marginLeft: 8, padding: 4 }}
          >
            <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>✕</Text>
          </Pressable>
        )}

        {/* Password Toggle */}
        {showPasswordToggle && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={8}
            style={{ marginLeft: 8, padding: 4 }}
          >
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        )}

        {/* Right Icon */}
        {rightIcon && !showClearButton && !showPasswordToggle && (
          <View style={{ marginLeft: 8 }}>
            {rightIcon}
          </View>
        )}
      </View>

      {/* Error / Helper Text */}
      {(error || helperText) && (
        <Text
          style={{
            fontSize: 12,
            color: error ? theme.colors.error : theme.colors.textSecondary,
            marginTop: 4,
          }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

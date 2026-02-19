/**
 * RIDLY Mobile SDK - QuantitySelector Component
 *
 * Minimal quantity selector with - and + buttons.
 */

import {
  View,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from '../ui/Text';
import { useTheme } from '../../theme/ThemeContext';

export type QuantitySelectorSize = 'sm' | 'md' | 'lg';

export interface QuantitySelectorProps {
  /**
   * Current quantity value
   */
  value: number;

  /**
   * Called when quantity changes
   */
  onChange: (value: number) => void;

  /**
   * Minimum allowed quantity
   * @default 1
   */
  min?: number;

  /**
   * Maximum allowed quantity
   * @default 99
   */
  max?: number;

  /**
   * Size variant
   * @default 'md'
   */
  size?: QuantitySelectorSize;

  /**
   * Disable the selector
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom container style
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * QuantitySelector Component
 *
 * Clean, minimal quantity selector with bordered - and + buttons.
 *
 * @example
 * ```tsx
 * const [qty, setQty] = useState(1);
 * <QuantitySelector value={qty} onChange={setQty} />
 * ```
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
  style,
}: QuantitySelectorProps) {
  const { theme } = useTheme();

  // Size configurations
  const sizeConfig = {
    sm: {
      buttonSize: 28,
      fontSize: 13,
      valueFontSize: 14,
      minWidth: 32,
    },
    md: {
      buttonSize: 32,
      fontSize: 16,
      valueFontSize: 15,
      minWidth: 40,
    },
    lg: {
      buttonSize: 40,
      fontSize: 20,
      valueFontSize: 17,
      minWidth: 48,
    },
  };

  const config = sizeConfig[size];

  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  const handleDecrement = () => {
    if (canDecrement) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      onChange(value + 1);
    }
  };

  const buttonStyle = (enabled: boolean): ViewStyle => ({
    width: config.buttonSize,
    height: config.buttonSize,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: enabled ? theme.colors.border : theme.colors.disabled,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  });

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        style,
      ]}
    >
      {/* Decrement Button */}
      <Pressable
        onPress={handleDecrement}
        disabled={!canDecrement}
        style={({ pressed }) => [
          buttonStyle(canDecrement),
          pressed && canDecrement && { backgroundColor: theme.colors.surface },
        ]}
        hitSlop={8}
      >
        <Text
          style={{
            fontSize: config.fontSize,
            fontWeight: '400',
            color: canDecrement ? theme.colors.text : theme.colors.disabledText,
            lineHeight: config.fontSize,
          }}
        >
          −
        </Text>
      </Pressable>

      {/* Value Display */}
      <View
        style={{
          minWidth: config.minWidth,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: config.valueFontSize,
            fontWeight: '500',
            color: disabled ? theme.colors.disabledText : theme.colors.text,
          }}
        >
          {value}
        </Text>
      </View>

      {/* Increment Button */}
      <Pressable
        onPress={handleIncrement}
        disabled={!canIncrement}
        style={({ pressed }) => [
          buttonStyle(canIncrement),
          pressed && canIncrement && { backgroundColor: theme.colors.surface },
        ]}
        hitSlop={8}
      >
        <Text
          style={{
            fontSize: config.fontSize,
            fontWeight: '400',
            color: canIncrement ? theme.colors.text : theme.colors.disabledText,
            lineHeight: config.fontSize,
          }}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
}

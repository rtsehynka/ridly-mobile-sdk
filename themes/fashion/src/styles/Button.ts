/**
 * Button Style Overrides
 *
 * Fashion theme styling for buttons.
 */

import type { ThemeTokens } from '@ridly/mobile-core';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

interface ButtonStyles {
  container: object;
  text: object;
}

export function buttonStyles(
  theme: ThemeTokens,
  props: ButtonProps
): Partial<ButtonStyles> {
  const baseStyles: Partial<ButtonStyles> = {
    container: {
      borderRadius: 10,
    },
    text: {
      fontWeight: '600',
    },
  };

  // Primary variant - solid blue
  if (props.variant === 'primary') {
    return {
      ...baseStyles,
      container: {
        ...baseStyles.container,
        backgroundColor: theme.colors.primary,
      },
      text: {
        ...baseStyles.text,
        color: theme.colors.onPrimary,
      },
    };
  }

  // Outline variant
  if (props.variant === 'outline') {
    return {
      ...baseStyles,
      container: {
        ...baseStyles.container,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
      },
      text: {
        ...baseStyles.text,
        color: theme.colors.primary,
      },
    };
  }

  return baseStyles;
}

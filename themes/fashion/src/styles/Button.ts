/**
 * Button Style Overrides
 */

export function buttonStyles(theme: any, props: any): any {
  const baseStyles = {
    container: {
      borderRadius: theme.borderRadius?.button || 10,
    },
    text: {
      fontWeight: '600',
    },
  };

  if (props?.variant === 'primary') {
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

  if (props?.variant === 'outline') {
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

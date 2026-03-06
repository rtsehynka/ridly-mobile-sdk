/**
 * ProductCard Style Overrides
 */

export function productCardStyles(theme: any, props: any): any {
  return {
    container: {
      borderRadius: theme.borderRadius?.card || 12,
      backgroundColor: theme.colors.background,
    },
    imageContainer: {
      borderRadius: theme.borderRadius?.image || 12,
      overflow: 'hidden',
    },
    content: {
      padding: 10,
    },
    title: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 18,
    },
  };
}

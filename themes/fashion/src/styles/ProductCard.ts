/**
 * ProductCard Style Overrides
 *
 * Fashion theme styling for product cards.
 */

import type { ThemeTokens } from '@ridly/mobile-core';

interface ProductCardProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'horizontal';
}

interface ProductCardStyles {
  container: object;
  imageContainer: object;
  image: object;
  content: object;
  title: object;
  price: object;
  badge: object;
}

export function productCardStyles(
  theme: ThemeTokens,
  props: ProductCardProps
): Partial<ProductCardStyles> {
  return {
    container: {
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    imageContainer: {
      borderRadius: 12,
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

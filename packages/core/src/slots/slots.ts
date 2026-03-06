/**
 * Slot IDs - Predefined injection points throughout the app
 *
 * Themes can register components to render at these locations.
 */

export const SLOTS = {
  // Home Screen
  'home.before-content': 'home.before-content',
  'home.hero': 'home.hero',
  'home.after-hero': 'home.after-hero',
  'home.categories': 'home.categories',
  'home.after-categories': 'home.after-categories',
  'home.featured': 'home.featured',
  'home.after-featured': 'home.after-featured',
  'home.promotions': 'home.promotions',
  'home.after-content': 'home.after-content',

  // Product Page
  'product.before-gallery': 'product.before-gallery',
  'product.after-gallery': 'product.after-gallery',
  'product.after-title': 'product.after-title',
  'product.after-price': 'product.after-price',
  'product.before-options': 'product.before-options',
  'product.after-options': 'product.after-options',
  'product.before-add-to-cart': 'product.before-add-to-cart',
  'product.after-add-to-cart': 'product.after-add-to-cart',
  'product.before-description': 'product.before-description',
  'product.after-description': 'product.after-description',
  'product.related': 'product.related',

  // Category Page
  'category.before-products': 'category.before-products',
  'category.after-products': 'category.after-products',
  'category.filters': 'category.filters',

  // Cart
  'cart.before-items': 'cart.before-items',
  'cart.after-items': 'cart.after-items',
  'cart.summary.before': 'cart.summary.before',
  'cart.summary.after': 'cart.summary.after',
  'cart.promotions': 'cart.promotions',

  // Checkout
  'checkout.before-steps': 'checkout.before-steps',
  'checkout.after-address': 'checkout.after-address',
  'checkout.after-shipping': 'checkout.after-shipping',
  'checkout.payment-methods': 'checkout.payment-methods',
  'checkout.before-place-order': 'checkout.before-place-order',
  'checkout.after-place-order': 'checkout.after-place-order',

  // Layout
  'layout.header.left': 'layout.header.left',
  'layout.header.center': 'layout.header.center',
  'layout.header.right': 'layout.header.right',
  'layout.footer.before': 'layout.footer.before',
  'layout.tab-bar.before': 'layout.tab-bar.before',

  // Global
  'global.modals': 'global.modals',
  'global.overlays': 'global.overlays',
  'global.notifications': 'global.notifications',
} as const;

export type SlotId = typeof SLOTS[keyof typeof SLOTS];

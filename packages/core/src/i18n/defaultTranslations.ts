/**
 * Default Translations
 *
 * Base English translations for common UI elements.
 * These serve as fallbacks and documentation for required keys.
 */

import type { TranslationObject } from './types';

/**
 * Common translations (buttons, labels, etc.)
 */
export const commonTranslations: TranslationObject = {
  actions: {
    add: 'Add',
    remove: 'Remove',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    clear: 'Clear',
    reset: 'Reset',
    apply: 'Apply',
    retry: 'Retry',
    refresh: 'Refresh',
    viewAll: 'View All',
    seeMore: 'See More',
    seeLess: 'See Less',
    showMore: 'Show More',
    showLess: 'Show Less',
    loadMore: 'Load More',
  },
  status: {
    loading: 'Loading...',
    saving: 'Saving...',
    processing: 'Processing...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    notFound: 'Not found',
    unauthorized: 'Please sign in to continue.',
    forbidden: 'You don\'t have permission to access this.',
    validation: 'Please check your input.',
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    invalidPhone: 'Please enter a valid phone number',
    passwordMismatch: 'Passwords do not match',
    minLength: 'Must be at least {{count}} characters',
    maxLength: 'Must be no more than {{count}} characters',
  },
  empty: {
    noResults: 'No results found',
    noItems: 'No items',
    noData: 'No data available',
  },
};

/**
 * Navigation translations
 */
export const navigationTranslations: TranslationObject = {
  tabs: {
    home: 'Home',
    categories: 'Categories',
    cart: 'Cart',
    wishlist: 'Wishlist',
    account: 'Account',
    menu: 'Menu',
  },
  screens: {
    home: 'Home',
    categories: 'Categories',
    category: 'Category',
    product: 'Product',
    search: 'Search',
    cart: 'Cart',
    checkout: 'Checkout',
    account: 'My Account',
    orders: 'My Orders',
    wishlist: 'Wishlist',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
  },
};

/**
 * Product translations
 */
export const productTranslations: TranslationObject = {
  labels: {
    price: 'Price',
    originalPrice: 'Original Price',
    salePrice: 'Sale Price',
    discount: 'Discount',
    sku: 'SKU',
    availability: 'Availability',
    quantity: 'Quantity',
    size: 'Size',
    color: 'Color',
    description: 'Description',
    details: 'Details',
    specifications: 'Specifications',
    reviews: 'Reviews',
    relatedProducts: 'Related Products',
    recentlyViewed: 'Recently Viewed',
  },
  status: {
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    onSale: 'On Sale',
    new: 'New',
    bestseller: 'Bestseller',
  },
  actions: {
    addToCart: 'Add to Cart',
    addToWishlist: 'Add to Wishlist',
    removeFromWishlist: 'Remove from Wishlist',
    buyNow: 'Buy Now',
    selectOptions: 'Select Options',
    notifyMe: 'Notify Me',
    share: 'Share',
  },
  reviews: {
    writeReview: 'Write a Review',
    rating: 'Rating',
    reviews: {
      zero: 'No reviews',
      one: '{{count}} review',
      other: '{{count}} reviews',
    },
  },
};

/**
 * Cart translations
 */
export const cartTranslations: TranslationObject = {
  title: 'Shopping Cart',
  empty: {
    title: 'Your cart is empty',
    subtitle: 'Add some products to get started',
    action: 'Start Shopping',
  },
  labels: {
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax',
    discount: 'Discount',
    total: 'Total',
    estimatedTotal: 'Estimated Total',
    freeShipping: 'Free Shipping',
  },
  actions: {
    checkout: 'Proceed to Checkout',
    continueShopping: 'Continue Shopping',
    applyCoupon: 'Apply Coupon',
    removeCoupon: 'Remove Coupon',
    updateQuantity: 'Update Quantity',
    removeItem: 'Remove Item',
    clearCart: 'Clear Cart',
  },
  items: {
    zero: 'No items',
    one: '{{count}} item',
    other: '{{count}} items',
  },
  messages: {
    itemAdded: 'Item added to cart',
    itemRemoved: 'Item removed from cart',
    cartUpdated: 'Cart updated',
    couponApplied: 'Coupon applied',
    couponRemoved: 'Coupon removed',
    invalidCoupon: 'Invalid coupon code',
  },
};

/**
 * Checkout translations
 */
export const checkoutTranslations: TranslationObject = {
  steps: {
    shipping: 'Shipping',
    payment: 'Payment',
    review: 'Review',
    confirmation: 'Confirmation',
  },
  shipping: {
    title: 'Shipping Address',
    addNew: 'Add New Address',
    selectAddress: 'Select Address',
    shippingMethod: 'Shipping Method',
  },
  payment: {
    title: 'Payment Method',
    selectMethod: 'Select Payment Method',
    creditCard: 'Credit Card',
    applePay: 'Apple Pay',
    googlePay: 'Google Pay',
    paypal: 'PayPal',
    cardNumber: 'Card Number',
    expiryDate: 'Expiry Date',
    cvv: 'CVV',
    nameOnCard: 'Name on Card',
  },
  review: {
    title: 'Review Order',
    editShipping: 'Edit Shipping',
    editPayment: 'Edit Payment',
  },
  actions: {
    placeOrder: 'Place Order',
    backToCart: 'Back to Cart',
  },
  confirmation: {
    title: 'Order Confirmed!',
    orderNumber: 'Order Number',
    thankYou: 'Thank you for your order!',
    emailSent: 'A confirmation email has been sent to {{email}}',
    viewOrder: 'View Order',
    continueShopping: 'Continue Shopping',
  },
};

/**
 * Account translations
 */
export const accountTranslations: TranslationObject = {
  guest: {
    title: 'Welcome',
    subtitle: 'Sign in to access your account',
    signIn: 'Sign In',
    signUp: 'Create Account',
  },
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    rememberMe: 'Remember Me',
    orContinueWith: 'Or continue with',
  },
  profile: {
    title: 'My Profile',
    editProfile: 'Edit Profile',
    personalInfo: 'Personal Information',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
  },
  orders: {
    title: 'My Orders',
    orderNumber: 'Order #{{number}}',
    orderDate: 'Order Date',
    orderStatus: 'Status',
    orderTotal: 'Total',
    viewDetails: 'View Details',
    trackOrder: 'Track Order',
    reorder: 'Reorder',
    noOrders: 'No orders yet',
    status: {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    },
  },
  addresses: {
    title: 'My Addresses',
    addAddress: 'Add Address',
    editAddress: 'Edit Address',
    deleteAddress: 'Delete Address',
    setDefault: 'Set as Default',
    defaultBilling: 'Default Billing',
    defaultShipping: 'Default Shipping',
    noAddresses: 'No addresses saved',
  },
  wishlist: {
    title: 'My Wishlist',
    empty: 'Your wishlist is empty',
    moveToCart: 'Move to Cart',
    removeItem: 'Remove',
  },
};

/**
 * All default translations
 */
export const defaultTranslations = {
  common: commonTranslations,
  navigation: navigationTranslations,
  product: productTranslations,
  cart: cartTranslations,
  checkout: checkoutTranslations,
  account: accountTranslations,
};

export type TranslationNamespace = keyof typeof defaultTranslations;

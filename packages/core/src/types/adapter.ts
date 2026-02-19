/**
 * E-Commerce Adapter Interface
 *
 * This is the core contract that all platform adapters must implement.
 * The SDK core components use ONLY this interface — they never call platform APIs directly.
 */

import type { PaginatedResult, FilterOption, SortOption } from './common';
import type { Product, ProductQuery, ProductListResult, ProductReview } from './product';
import type { Category } from './category';
import type { Cart, AddToCartInput } from './cart';
import type {
  Customer,
  Address,
  AddressInput,
  AuthTokens,
  RegisterInput,
  CustomerUpdateInput,
  ChangePasswordInput,
} from './customer';
import type { ShippingMethod, PaymentMethod, Country, Region } from './checkout';
import type { Order, PlaceOrderResult } from './order';
import type { CmsPage, CmsBlock, Banner } from './cms';

/**
 * Store configuration returned by adapter
 */
export interface StoreConfig {
  storeName: string;
  storeUrl: string;
  currency: string;
  locale: string;
  weightUnit: 'kg' | 'lb';
  allowGuestCheckout: boolean;
  requireRegion: boolean;
  minimumOrderAmount?: number;
  logoUrl?: string;
}

/**
 * Wishlist item
 */
export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

/**
 * The main adapter interface that all e-commerce platforms must implement
 */
export interface ECommerceAdapter {
  /**
   * Platform identifier (e.g., "magento", "shopware", "woocommerce")
   */
  readonly platform: string;

  /**
   * Adapter version
   */
  readonly version: string;

  // ============================================
  // PRODUCTS
  // ============================================

  /**
   * Get paginated list of products with optional filters and sorting
   */
  getProducts(query: ProductQuery): Promise<ProductListResult>;

  /**
   * Get single product by ID or slug
   */
  getProduct(idOrSlug: string): Promise<Product>;

  /**
   * Get related products for a product
   */
  getRelatedProducts(productId: string, limit?: number): Promise<Product[]>;

  /**
   * Get upsell products for a product
   */
  getUpsellProducts(productId: string, limit?: number): Promise<Product[]>;

  /**
   * Get product reviews
   */
  getProductReviews(
    productId: string,
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResult<ProductReview>>;

  /**
   * Submit a product review (requires authentication)
   */
  submitProductReview(
    productId: string,
    review: { title: string; content: string; rating: number }
  ): Promise<void>;

  // ============================================
  // CATEGORIES
  // ============================================

  /**
   * Get categories (optionally filtered by parent)
   */
  getCategories(parentId?: string): Promise<Category[]>;

  /**
   * Get full category tree
   */
  getCategoryTree(): Promise<Category[]>;

  /**
   * Get single category by ID or slug
   */
  getCategory(idOrSlug: string): Promise<Category>;

  // ============================================
  // SEARCH
  // ============================================

  /**
   * Search products with term, filters, and sorting
   */
  searchProducts(
    term: string,
    filters?: FilterOption[],
    sort?: SortOption,
    page?: number,
    pageSize?: number
  ): Promise<ProductListResult>;

  /**
   * Get search suggestions/autocomplete
   */
  getSearchSuggestions(term: string, limit?: number): Promise<string[]>;

  // ============================================
  // CART
  // ============================================

  /**
   * Get current cart (creates one if doesn't exist)
   */
  getCart(): Promise<Cart>;

  /**
   * Add item to cart
   */
  addToCart(input: AddToCartInput): Promise<Cart>;

  /**
   * Update cart item quantity
   */
  updateCartItem(itemId: string, quantity: number): Promise<Cart>;

  /**
   * Remove item from cart
   */
  removeCartItem(itemId: string): Promise<Cart>;

  /**
   * Apply coupon code to cart
   */
  applyCoupon(code: string): Promise<Cart>;

  /**
   * Remove applied coupon from cart
   */
  removeCoupon(code: string): Promise<Cart>;

  /**
   * Clear all items from cart
   */
  clearCart(): Promise<Cart>;

  /**
   * Merge guest cart into customer cart after login
   */
  mergeGuestCart(guestCartId: string): Promise<Cart>;

  // ============================================
  // AUTHENTICATION
  // ============================================

  /**
   * Login with email and password
   */
  login(email: string, password: string): Promise<AuthTokens>;

  /**
   * Register new customer
   */
  register(data: RegisterInput): Promise<AuthTokens>;

  /**
   * Logout current user
   */
  logout(): Promise<void>;

  /**
   * Refresh authentication token
   */
  refreshToken(refreshToken: string): Promise<AuthTokens>;

  /**
   * Request password reset email
   */
  requestPasswordReset(email: string): Promise<void>;

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Promise<void>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>;

  // ============================================
  // CUSTOMER
  // ============================================

  /**
   * Get current customer profile
   */
  getCustomer(): Promise<Customer>;

  /**
   * Update customer profile
   */
  updateCustomer(data: CustomerUpdateInput): Promise<Customer>;

  /**
   * Change customer password
   */
  changePassword(data: ChangePasswordInput): Promise<void>;

  /**
   * Get customer addresses
   */
  getAddresses(): Promise<Address[]>;

  /**
   * Add new address
   */
  addAddress(address: AddressInput): Promise<Address>;

  /**
   * Update existing address
   */
  updateAddress(id: string, address: Partial<AddressInput>): Promise<Address>;

  /**
   * Delete address
   */
  deleteAddress(id: string): Promise<void>;

  // ============================================
  // CHECKOUT
  // ============================================

  /**
   * Set shipping address for checkout
   */
  setShippingAddress(address: AddressInput): Promise<void>;

  /**
   * Set billing address for checkout
   */
  setBillingAddress(address: AddressInput): Promise<void>;

  /**
   * Use same address for billing as shipping
   */
  setBillingSameAsShipping(): Promise<void>;

  /**
   * Get available shipping methods based on address
   */
  getShippingMethods(): Promise<ShippingMethod[]>;

  /**
   * Select shipping method
   */
  setShippingMethod(carrierCode: string, methodCode: string): Promise<Cart>;

  /**
   * Get available payment methods
   */
  getPaymentMethods(): Promise<PaymentMethod[]>;

  /**
   * Select payment method
   */
  setPaymentMethod(code: string): Promise<void>;

  /**
   * Place order
   */
  placeOrder(): Promise<PlaceOrderResult>;

  // ============================================
  // ORDERS
  // ============================================

  /**
   * Get customer orders
   */
  getOrders(page?: number, pageSize?: number): Promise<PaginatedResult<Order>>;

  /**
   * Get single order by ID
   */
  getOrder(id: string): Promise<Order>;

  /**
   * Reorder (add all items from previous order to cart)
   */
  reorder(orderId: string): Promise<Cart>;

  // ============================================
  // WISHLIST
  // ============================================

  /**
   * Get wishlist items
   */
  getWishlist(): Promise<WishlistItem[]>;

  /**
   * Add product to wishlist
   */
  addToWishlist(productId: string): Promise<void>;

  /**
   * Remove product from wishlist
   */
  removeFromWishlist(itemId: string): Promise<void>;

  /**
   * Move wishlist item to cart
   */
  moveWishlistItemToCart(itemId: string): Promise<Cart>;

  // ============================================
  // CMS
  // ============================================

  /**
   * Get CMS page by ID or identifier
   */
  getCmsPage(idOrIdentifier: string): Promise<CmsPage>;

  /**
   * Get CMS block by ID or identifier
   */
  getCmsBlock(idOrIdentifier: string): Promise<CmsBlock>;

  /**
   * Get banners for home screen
   */
  getBanners(): Promise<Banner[]>;

  // ============================================
  // STORE CONFIG
  // ============================================

  /**
   * Get store configuration
   */
  getStoreConfig(): Promise<StoreConfig>;

  /**
   * Get available countries for address forms
   */
  getCountries(): Promise<Country[]>;

  /**
   * Get regions/states for a country
   */
  getRegions(countryCode: string): Promise<Region[]>;

  // ============================================
  // NEWSLETTER
  // ============================================

  /**
   * Subscribe to newsletter (guest)
   */
  subscribeToNewsletter(email: string): Promise<void>;
}

/**
 * Adapter configuration
 */
export interface AdapterConfig {
  storeUrl: string;
  storeCode?: string;
  apiVersion?: string;
}

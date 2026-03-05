/**
 * Magento 2 / Adobe Commerce Adapter
 *
 * Implements the ECommerceAdapter interface for Magento stores.
 * Uses GraphQL API for efficient data fetching.
 */

import type {
  ECommerceAdapter,
  AdapterConfig,
  StoreConfig,
  WishlistItem,
  Product,
  ProductQuery,
  ProductListResult,
  ProductReview,
  Category,
  Cart,
  AddToCartInput,
  Customer,
  Address,
  AddressInput,
  AuthTokens,
  RegisterInput,
  CustomerUpdateInput,
  ChangePasswordInput,
  ShippingMethod,
  PaymentMethod,
  Country,
  Region,
  Order,
  PlaceOrderResult,
  CmsPage,
  CmsBlock,
  Banner,
  PaginatedResult,
  FilterOption,
  SortOption,
  AvailableFilter,
  FilterOptionItem,
} from '@ridly/mobile-core';

import { MagentoGraphQLClient } from './client';
import {
  STORE_CONFIG_QUERY,
  CATEGORY_TREE_QUERY,
  CATEGORY_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_BY_URL_KEY_QUERY,
  PRODUCT_BY_SKU_QUERY,
  CREATE_EMPTY_CART_MUTATION,
  GET_CART_QUERY,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_ITEM_MUTATION,
  REMOVE_CART_ITEM_MUTATION,
  APPLY_COUPON_MUTATION,
  REMOVE_COUPON_MUTATION,
  GENERATE_TOKEN_MUTATION,
  CREATE_CUSTOMER_MUTATION,
  GET_CUSTOMER_QUERY,
  CMS_PAGE_QUERY,
  CMS_BLOCKS_QUERY,
  COUNTRIES_QUERY,
  // Checkout
  SET_SHIPPING_ADDRESS_MUTATION,
  SET_BILLING_ADDRESS_MUTATION,
  GET_SHIPPING_METHODS_QUERY,
  SET_SHIPPING_METHOD_MUTATION,
  GET_PAYMENT_METHODS_QUERY,
  SET_PAYMENT_METHOD_MUTATION,
  PLACE_ORDER_MUTATION,
  // Orders
  CUSTOMER_ORDERS_QUERY,
  ORDER_DETAIL_QUERY,
  REORDER_MUTATION,
  // Wishlist
  GET_WISHLIST_QUERY,
  ADD_TO_WISHLIST_MUTATION,
  REMOVE_FROM_WISHLIST_MUTATION,
  // Customer
  UPDATE_CUSTOMER_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  REQUEST_PASSWORD_RESET_MUTATION,
  RESET_PASSWORD_MUTATION,
  CREATE_ADDRESS_MUTATION,
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  SUBSCRIBE_NEWSLETTER_MUTATION,
  MERGE_CARTS_MUTATION,
} from './graphql';
import {
  transformProduct,
  transformCategory,
  transformCart,
  transformStoreConfig,
  transformCustomer,
  transformCountry,
  transformCmsPage,
  transformCmsBlock,
  transformOrder,
  transformShippingMethod,
  transformPaymentMethod,
  transformWishlistItem,
  transformAddress,
} from './transformers';

/**
 * Magento adapter configuration
 */
export interface MagentoAdapterConfig extends AdapterConfig {
  storeCode?: string;
}

/**
 * Magento 2 adapter implementation
 */
export class MagentoAdapter implements ECommerceAdapter {
  readonly platform = 'magento';
  readonly version = '0.1.0';

  private client: MagentoGraphQLClient;
  private cartId: string | null = null;

  constructor(config: MagentoAdapterConfig) {
    this.client = new MagentoGraphQLClient({
      storeUrl: config.storeUrl,
      storeCode: config.storeCode,
    });
  }

  /**
   * Get current cart ID (used internally for cart operations)
   */
  getCartId(): string | null {
    return this.cartId;
  }

  /**
   * Set cart ID (useful when restoring from storage)
   */
  setCartId(cartId: string | null): void {
    this.cartId = cartId;
  }

  /**
   * Set auth token (for authenticated requests)
   */
  setAuthToken(token: string | null): void {
    this.client.setAuthToken(token);
  }

  // ============================================
  // STORE CONFIG
  // ============================================

  async getStoreConfig(): Promise<StoreConfig> {
    const response = await this.client.query<{ storeConfig: any }>(STORE_CONFIG_QUERY);
    return transformStoreConfig(response.storeConfig);
  }

  async getCountries(): Promise<Country[]> {
    const response = await this.client.query<{ countries: any[] }>(COUNTRIES_QUERY);
    return response.countries.map(transformCountry);
  }

  async getRegions(countryCode: string): Promise<Region[]> {
    const response = await this.client.query<{ countries: any[] }>(COUNTRIES_QUERY);
    const country = response.countries.find(
      (c) => c.two_letter_abbreviation === countryCode
    );
    return (
      country?.available_regions?.map((r: any) => ({
        code: r.code,
        name: r.name,
      })) || []
    );
  }

  // ============================================
  // CATEGORIES
  // ============================================

  async getCategories(parentId?: string): Promise<Category[]> {
    const response = await this.client.query<{ categories: { items: any[] } }>(
      CATEGORY_TREE_QUERY
    );

    const allCategories = response.categories.items;

    if (parentId) {
      // Find parent and return its children
      const findChildren = (cats: any[], id: string): any[] | null => {
        for (const cat of cats) {
          if (cat.uid === id) {
            return cat.children || [];
          }
          if (cat.children) {
            const result = findChildren(cat.children, id);
            if (result) return result;
          }
        }
        return null;
      };
      const children = findChildren(allCategories, parentId);
      return children?.map(transformCategory) || [];
    }

    // Return root categories (level 2 in Magento, since level 1 is root)
    return allCategories
      .filter((cat) => cat.level === 2 && cat.include_in_menu)
      .map(transformCategory);
  }

  async getCategoryTree(): Promise<Category[]> {
    const response = await this.client.query<{ categories: { items: any[] } }>(
      CATEGORY_TREE_QUERY
    );
    return response.categories.items
      .filter((cat) => cat.include_in_menu !== 0)
      .map(transformCategory);
  }

  async getCategory(slug: string): Promise<Category> {
    const response = await this.client.query<{ categories: { items: any[] } }>(
      CATEGORY_QUERY,
      { urlKey: slug }
    );

    if (!response.categories.items.length) {
      throw new Error(`Category not found: ${slug}`);
    }

    return transformCategory(response.categories.items[0]);
  }

  // ============================================
  // PRODUCTS
  // ============================================

  async getProducts(query: ProductQuery): Promise<ProductListResult> {
    const pageSize = query.pageSize || 20;
    const page = query.page || 1;

    const variables: any = {
      pageSize,
      currentPage: page,
    };

    // Build filter
    const filter: any = {};

    if (query.categoryId) {
      filter.category_uid = { eq: query.categoryId };
    }

    if (query.filters) {
      query.filters.forEach((f) => {
        filter[f.field] = { eq: f.value };
      });
    }

    // Magento requires either 'search' or 'filter' parameter
    // If no filters provided, use a wildcard search to get all products
    if (Object.keys(filter).length > 0) {
      variables.filter = filter;
    } else {
      // Use empty search to return all products
      variables.search = '';
    }

    // Build sort
    if (query.sort) {
      variables.sort = { [query.sort.field]: query.sort.direction.toUpperCase() };
    }

    const response = await this.client.query<{ products: any }>(
      PRODUCTS_QUERY,
      variables
    );

    const products = response.products;
    const totalCount = products.total_count;
    const totalPages = products.page_info.total_pages;

    // Transform aggregations to AvailableFilter
    const availableFilters: AvailableFilter[] | undefined = products.aggregations?.map(
      (agg: any) => ({
        code: agg.attribute_code,
        label: agg.label,
        type: 'select' as const,
        options: agg.options.map(
          (opt: any): FilterOptionItem => ({
            label: opt.label,
            value: opt.value,
            count: opt.count,
          })
        ),
      })
    );

    // Transform sort options
    const availableSortOptions: string[] | undefined = products.sort_fields?.options?.map(
      (opt: any) => opt.value
    );

    return {
      items: products.items.map(transformProduct),
      total: totalCount,
      page,
      pageSize,
      hasMore: page < totalPages,
      availableFilters,
      availableSortOptions,
    };
  }

  async getProduct(idOrSlug: string): Promise<Product> {
    // Try by URL key first (most common)
    let response = await this.client.query<{ products: { items: any[] } }>(
      PRODUCT_BY_URL_KEY_QUERY,
      { urlKey: idOrSlug }
    );

    if (!response.products.items.length) {
      // Try by SKU
      response = await this.client.query<{ products: { items: any[] } }>(
        PRODUCT_BY_SKU_QUERY,
        { sku: idOrSlug }
      );
    }

    if (!response.products.items.length) {
      throw new Error(`Product not found: ${idOrSlug}`);
    }

    return transformProduct(response.products.items[0]);
  }

  async getRelatedProducts(_productId: string, _limit?: number): Promise<Product[]> {
    // Related products are included in the product detail query
    // This is a simplified version - in production you'd want a separate query
    // TODO: Implement with actual related products from product query
    return [];
  }

  async getUpsellProducts(_productId: string, _limit?: number): Promise<Product[]> {
    // TODO: Implement with actual upsell products from product query
    return [];
  }

  async getProductReviews(
    _productId: string,
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResult<ProductReview>> {
    // TODO: Implement reviews query
    const actualPage = page || 1;
    const actualPageSize = pageSize || 10;
    return {
      items: [],
      total: 0,
      page: actualPage,
      pageSize: actualPageSize,
      hasMore: false,
    };
  }

  async submitProductReview(
    _productId: string,
    _review: { title: string; content: string; rating: number }
  ): Promise<void> {
    // TODO: Implement review submission
    throw new Error('Not implemented: submitProductReview');
  }

  // ============================================
  // SEARCH
  // ============================================

  async searchProducts(
    term: string,
    filters?: FilterOption[],
    sort?: SortOption,
    page?: number,
    pageSize?: number
  ): Promise<ProductListResult> {
    const actualPageSize = pageSize || 20;
    const actualPage = page || 1;

    const variables: any = {
      search: term,
      pageSize: actualPageSize,
      currentPage: actualPage,
    };

    if (filters?.length) {
      const filter: any = {};
      filters.forEach((f) => {
        filter[f.field] = { eq: f.value };
      });
      variables.filter = filter;
    }

    if (sort) {
      variables.sort = { [sort.field]: sort.direction.toUpperCase() };
    }

    const response = await this.client.query<{ products: any }>(
      PRODUCTS_QUERY,
      variables
    );

    const products = response.products;
    const totalCount = products.total_count;
    const totalPages = products.page_info.total_pages;

    // Transform aggregations to AvailableFilter
    const availableFilters: AvailableFilter[] | undefined = products.aggregations?.map(
      (agg: any) => ({
        code: agg.attribute_code,
        label: agg.label,
        type: 'select' as const,
        options: agg.options.map(
          (opt: any): FilterOptionItem => ({
            label: opt.label,
            value: opt.value,
            count: opt.count,
          })
        ),
      })
    );

    return {
      items: products.items.map(transformProduct),
      total: totalCount,
      page: actualPage,
      pageSize: actualPageSize,
      hasMore: actualPage < totalPages,
      availableFilters,
    };
  }

  async getSearchSuggestions(term: string, limit?: number): Promise<string[]> {
    // Magento doesn't have a built-in suggestions endpoint
    // You could implement this with a products search and return names
    const results = await this.searchProducts(term, undefined, undefined, 1, limit || 5);
    return results.items.map((p) => p.name);
  }

  // ============================================
  // CART
  // ============================================

  async getCart(): Promise<Cart> {
    if (!this.cartId) {
      // Create new cart
      const response = await this.client.query<{ createEmptyCart: string }>(
        CREATE_EMPTY_CART_MUTATION
      );
      this.cartId = response.createEmptyCart;
    }

    const response = await this.client.query<{ cart: any }>(GET_CART_QUERY, {
      cartId: this.cartId,
    });

    return transformCart(response.cart);
  }

  async addToCart(input: AddToCartInput): Promise<Cart> {
    if (!this.cartId) {
      await this.getCart(); // Creates cart if needed
    }

    // Note: For Magento, productId should be the product SKU
    // This is because Magento's addProductsToCart mutation requires SKU
    await this.client.query(ADD_TO_CART_MUTATION, {
      cartId: this.cartId,
      sku: input.productId,
      quantity: input.quantity,
    });

    return this.getCart();
  }

  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    if (!this.cartId) {
      throw new Error('No cart found');
    }

    await this.client.query(UPDATE_CART_ITEM_MUTATION, {
      cartId: this.cartId,
      itemUid: itemId,
      quantity,
    });

    return this.getCart();
  }

  async removeCartItem(itemId: string): Promise<Cart> {
    if (!this.cartId) {
      throw new Error('No cart found');
    }

    await this.client.query(REMOVE_CART_ITEM_MUTATION, {
      cartId: this.cartId,
      itemUid: itemId,
    });

    return this.getCart();
  }

  async applyCoupon(code: string): Promise<Cart> {
    if (!this.cartId) {
      throw new Error('No cart found');
    }

    await this.client.query(APPLY_COUPON_MUTATION, {
      cartId: this.cartId,
      couponCode: code,
    });

    return this.getCart();
  }

  async removeCoupon(_code: string): Promise<Cart> {
    if (!this.cartId) {
      throw new Error('No cart found');
    }

    await this.client.query(REMOVE_COUPON_MUTATION, {
      cartId: this.cartId,
    });

    return this.getCart();
  }

  async clearCart(): Promise<Cart> {
    // Create a new empty cart
    const response = await this.client.query<{ createEmptyCart: string }>(
      CREATE_EMPTY_CART_MUTATION
    );
    this.cartId = response.createEmptyCart;
    return this.getCart();
  }

  async mergeGuestCart(guestCartId: string): Promise<Cart> {
    if (!this.cartId) {
      throw new Error('No customer cart found');
    }

    await this.client.query(MERGE_CARTS_MUTATION, {
      sourceCartId: guestCartId,
      destinationCartId: this.cartId,
    });

    return this.getCart();
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await this.client.query<{
      generateCustomerToken: { token: string };
    }>(GENERATE_TOKEN_MUTATION, { email, password });

    const token = response.generateCustomerToken.token;
    this.client.setAuthToken(token);

    return {
      accessToken: token,
      // Magento tokens don't expire by default, set far future
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    };
  }

  async register(data: RegisterInput): Promise<AuthTokens> {
    await this.client.query(CREATE_CUSTOMER_MUTATION, {
      input: {
        firstname: data.firstName,
        lastname: data.lastName,
        email: data.email,
        password: data.password,
        is_subscribed: data.isSubscribedToNewsletter || false,
      },
    });

    // Auto login after registration
    return this.login(data.email, data.password);
  }

  async logout(): Promise<void> {
    this.client.setAuthToken(null);
    this.cartId = null;
  }

  async refreshToken(_refreshToken: string): Promise<AuthTokens> {
    // Magento doesn't have refresh tokens by default
    throw new Error('Not implemented: refreshToken - Magento uses long-lived tokens');
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.client.query(REQUEST_PASSWORD_RESET_MUTATION, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Note: Magento requires email for password reset
    // The token should contain the email or be passed separately
    await this.client.query(RESET_PASSWORD_MUTATION, {
      email: '', // Should be passed from the reset link
      resetPasswordToken: token,
      newPassword,
    });
  }

  async isAuthenticated(): Promise<boolean> {
    return this.client.getAuthToken() !== null;
  }

  // ============================================
  // CUSTOMER
  // ============================================

  async getCustomer(): Promise<Customer> {
    const response = await this.client.query<{ customer: any }>(GET_CUSTOMER_QUERY);
    return transformCustomer(response.customer);
  }

  async updateCustomer(data: CustomerUpdateInput): Promise<Customer> {
    const input: any = {};

    if (data.firstName) input.firstname = data.firstName;
    if (data.lastName) input.lastname = data.lastName;
    if (data.dateOfBirth) input.date_of_birth = data.dateOfBirth;
    if (data.gender) {
      input.gender = data.gender === 'male' ? 1 : data.gender === 'female' ? 2 : 3;
    }
    if (data.isSubscribedToNewsletter !== undefined) {
      input.is_subscribed = data.isSubscribedToNewsletter;
    }

    await this.client.query(UPDATE_CUSTOMER_MUTATION, { input });
    return this.getCustomer();
  }

  async changePassword(data: ChangePasswordInput): Promise<void> {
    await this.client.query(CHANGE_PASSWORD_MUTATION, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  }

  async getAddresses(): Promise<Address[]> {
    const customer = await this.getCustomer();
    return customer.addresses || [];
  }

  async addAddress(address: AddressInput): Promise<Address> {
    const input = {
      firstname: address.firstName,
      lastname: address.lastName,
      company: address.company,
      street: address.street,
      city: address.city,
      region: address.regionCode ? { region_code: address.regionCode } : undefined,
      postcode: address.postcode,
      country_code: address.countryCode,
      telephone: address.phone,
      default_shipping: address.isDefaultShipping || false,
      default_billing: address.isDefaultBilling || false,
    };

    const response = await this.client.query<{ createCustomerAddress: any }>(
      CREATE_ADDRESS_MUTATION,
      { input }
    );

    return transformAddress(response.createCustomerAddress);
  }

  async updateAddress(id: string, address: Partial<AddressInput>): Promise<Address> {
    const input: any = {};

    if (address.firstName) input.firstname = address.firstName;
    if (address.lastName) input.lastname = address.lastName;
    if (address.company !== undefined) input.company = address.company;
    if (address.street) input.street = address.street;
    if (address.city) input.city = address.city;
    if (address.regionCode) input.region = { region_code: address.regionCode };
    if (address.postcode) input.postcode = address.postcode;
    if (address.countryCode) input.country_code = address.countryCode;
    if (address.phone !== undefined) input.telephone = address.phone;
    if (address.isDefaultShipping !== undefined) input.default_shipping = address.isDefaultShipping;
    if (address.isDefaultBilling !== undefined) input.default_billing = address.isDefaultBilling;

    const response = await this.client.query<{ updateCustomerAddress: any }>(
      UPDATE_ADDRESS_MUTATION,
      { id: parseInt(id, 10), input }
    );

    return transformAddress(response.updateCustomerAddress);
  }

  async deleteAddress(id: string): Promise<void> {
    await this.client.query(DELETE_ADDRESS_MUTATION, { id: parseInt(id, 10) });
  }

  // ============================================
  // CHECKOUT
  // ============================================

  async setShippingAddress(address: AddressInput): Promise<void> {
    if (!this.cartId) {
      await this.getCart();
    }

    const cartAddress = {
      firstname: address.firstName,
      lastname: address.lastName,
      company: address.company,
      street: address.street,
      city: address.city,
      region: address.regionCode,
      postcode: address.postcode,
      country_code: address.countryCode,
      telephone: address.phone || '',
    };

    await this.client.query(SET_SHIPPING_ADDRESS_MUTATION, {
      cartId: this.cartId,
      address: cartAddress,
    });
  }

  async setBillingAddress(address: AddressInput): Promise<void> {
    if (!this.cartId) {
      await this.getCart();
    }

    const cartAddress = {
      firstname: address.firstName,
      lastname: address.lastName,
      company: address.company,
      street: address.street,
      city: address.city,
      region: address.regionCode,
      postcode: address.postcode,
      country_code: address.countryCode,
      telephone: address.phone || '',
    };

    await this.client.query(SET_BILLING_ADDRESS_MUTATION, {
      cartId: this.cartId,
      address: cartAddress,
      sameAsShipping: false,
    });
  }

  async setBillingSameAsShipping(): Promise<void> {
    if (!this.cartId) {
      await this.getCart();
    }

    await this.client.query(SET_BILLING_ADDRESS_MUTATION, {
      cartId: this.cartId,
      address: {},
      sameAsShipping: true,
    });
  }

  async getShippingMethods(): Promise<ShippingMethod[]> {
    if (!this.cartId) {
      throw new Error('No cart found. Set shipping address first.');
    }

    const response = await this.client.query<{
      cart: {
        shipping_addresses: Array<{
          available_shipping_methods: any[];
        }>;
      };
    }>(GET_SHIPPING_METHODS_QUERY, { cartId: this.cartId });

    const methods = response.cart.shipping_addresses[0]?.available_shipping_methods || [];
    return methods.filter((m: any) => m.available).map(transformShippingMethod);
  }

  async setShippingMethod(carrierCode: string, methodCode: string): Promise<Cart> {
    if (!this.cartId) {
      throw new Error('No cart found');
    }

    await this.client.query(SET_SHIPPING_METHOD_MUTATION, {
      cartId: this.cartId,
      carrierCode,
      methodCode,
    });

    return this.getCart();
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    if (!this.cartId) {
      throw new Error('No cart found');
    }

    const response = await this.client.query<{
      cart: {
        available_payment_methods: any[];
      };
    }>(GET_PAYMENT_METHODS_QUERY, { cartId: this.cartId });

    return response.cart.available_payment_methods.map(transformPaymentMethod);
  }

  async setPaymentMethod(code: string): Promise<void> {
    if (!this.cartId) {
      throw new Error('No cart found');
    }

    await this.client.query(SET_PAYMENT_METHOD_MUTATION, {
      cartId: this.cartId,
      paymentCode: code,
    });
  }

  async placeOrder(): Promise<PlaceOrderResult> {
    if (!this.cartId) {
      throw new Error('No cart found');
    }

    const response = await this.client.query<{
      placeOrder: { order: { order_number: string } };
    }>(PLACE_ORDER_MUTATION, { cartId: this.cartId });

    // Clear cart ID after placing order
    this.cartId = null;

    return {
      orderId: response.placeOrder.order.order_number,
      orderNumber: response.placeOrder.order.order_number,
    };
  }

  // ============================================
  // ORDERS
  // ============================================

  async getOrders(page?: number, pageSize?: number): Promise<PaginatedResult<Order>> {
    const actualPage = page || 1;
    const actualPageSize = pageSize || 10;

    const response = await this.client.query<{
      customer: {
        orders: {
          total_count: number;
          items: any[];
          page_info: { current_page: number; page_size: number; total_pages: number };
        };
      };
    }>(CUSTOMER_ORDERS_QUERY, {
      pageSize: actualPageSize,
      currentPage: actualPage,
    });

    const orders = response.customer.orders;

    return {
      items: orders.items.map(transformOrder),
      total: orders.total_count,
      page: actualPage,
      pageSize: actualPageSize,
      hasMore: actualPage < orders.page_info.total_pages,
    };
  }

  async getOrder(id: string): Promise<Order> {
    const response = await this.client.query<{
      customer: {
        orders: {
          items: any[];
        };
      };
    }>(ORDER_DETAIL_QUERY, { orderNumber: id });

    if (!response.customer.orders.items.length) {
      throw new Error(`Order not found: ${id}`);
    }

    return transformOrder(response.customer.orders.items[0]);
  }

  async reorder(orderId: string): Promise<Cart> {
    await this.client.query(REORDER_MUTATION, { orderNumber: orderId });
    return this.getCart();
  }

  // ============================================
  // WISHLIST
  // ============================================

  private wishlistId: string | null = null;

  private async getWishlistId(): Promise<string> {
    if (this.wishlistId) return this.wishlistId;

    const response = await this.client.query<{
      customer: {
        wishlists: Array<{ id: string }>;
      };
    }>(GET_WISHLIST_QUERY);

    const firstWishlist = response.customer.wishlists[0];
    if (firstWishlist) {
      this.wishlistId = firstWishlist.id;
      return this.wishlistId;
    }

    throw new Error('No wishlist found');
  }

  async getWishlist(): Promise<WishlistItem[]> {
    const response = await this.client.query<{
      customer: {
        wishlists: Array<{
          id: string;
          items_v2: {
            items: any[];
          };
        }>;
      };
    }>(GET_WISHLIST_QUERY);

    const firstWishlist = response.customer.wishlists[0];
    if (!firstWishlist) {
      return [];
    }

    this.wishlistId = firstWishlist.id;
    return firstWishlist.items_v2.items.map(transformWishlistItem);
  }

  async addToWishlist(productId: string): Promise<void> {
    const wishlistId = await this.getWishlistId();

    await this.client.query(ADD_TO_WISHLIST_MUTATION, {
      wishlistId,
      sku: productId, // productId should be SKU for Magento
    });
  }

  async removeFromWishlist(itemId: string): Promise<void> {
    const wishlistId = await this.getWishlistId();

    await this.client.query(REMOVE_FROM_WISHLIST_MUTATION, {
      wishlistId,
      itemIds: [itemId],
    });
  }

  async moveWishlistItemToCart(itemId: string): Promise<Cart> {
    // For Magento, we need to get the product from wishlist and add to cart manually
    const wishlist = await this.getWishlist();
    const item = wishlist.find((i) => i.id === itemId);

    if (!item) {
      throw new Error('Wishlist item not found');
    }

    // Add to cart
    await this.addToCart({
      productId: item.product.sku,
      quantity: 1,
    });

    // Remove from wishlist
    await this.removeFromWishlist(itemId);

    return this.getCart();
  }

  // ============================================
  // CMS
  // ============================================

  async getCmsPage(idOrIdentifier: string): Promise<CmsPage> {
    const response = await this.client.query<{ cmsPage: any }>(CMS_PAGE_QUERY, {
      identifier: idOrIdentifier,
    });
    return transformCmsPage(response.cmsPage);
  }

  async getCmsBlock(idOrIdentifier: string): Promise<CmsBlock> {
    const response = await this.client.query<{ cmsBlocks: { items: any[] } }>(
      CMS_BLOCKS_QUERY,
      { identifiers: [idOrIdentifier] }
    );

    if (!response.cmsBlocks.items.length) {
      throw new Error(`CMS block not found: ${idOrIdentifier}`);
    }

    return transformCmsBlock(response.cmsBlocks.items[0]);
  }

  async getBanners(): Promise<Banner[]> {
    // Magento doesn't have a standard banners API
    // This would need a custom module or CMS blocks
    return [];
  }

  // ============================================
  // NEWSLETTER
  // ============================================

  async subscribeToNewsletter(email: string): Promise<void> {
    await this.client.query(SUBSCRIBE_NEWSLETTER_MUTATION, { email });
  }
}

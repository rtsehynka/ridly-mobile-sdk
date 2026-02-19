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

  async getCategory(idOrSlug: string): Promise<Category> {
    const response = await this.client.query<{ categories: { items: any[] } }>(
      CATEGORY_QUERY,
      { id: idOrSlug }
    );

    if (!response.categories.items.length) {
      throw new Error(`Category not found: ${idOrSlug}`);
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

  async mergeGuestCart(_guestCartId: string): Promise<Cart> {
    // TODO: Implement cart merging
    throw new Error('Not implemented: mergeGuestCart');
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

  async requestPasswordReset(_email: string): Promise<void> {
    // TODO: Implement password reset
    throw new Error('Not implemented: requestPasswordReset');
  }

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    // TODO: Implement password reset
    throw new Error('Not implemented: resetPassword');
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

  async updateCustomer(_data: CustomerUpdateInput): Promise<Customer> {
    // TODO: Implement customer update
    throw new Error('Not implemented: updateCustomer');
  }

  async changePassword(_data: ChangePasswordInput): Promise<void> {
    // TODO: Implement password change
    throw new Error('Not implemented: changePassword');
  }

  async getAddresses(): Promise<Address[]> {
    const customer = await this.getCustomer();
    return customer.addresses || [];
  }

  async addAddress(_address: AddressInput): Promise<Address> {
    // TODO: Implement address management
    throw new Error('Not implemented: addAddress');
  }

  async updateAddress(_id: string, _address: Partial<AddressInput>): Promise<Address> {
    throw new Error('Not implemented: updateAddress');
  }

  async deleteAddress(_id: string): Promise<void> {
    throw new Error('Not implemented: deleteAddress');
  }

  // ============================================
  // CHECKOUT
  // ============================================

  async setShippingAddress(_address: AddressInput): Promise<void> {
    throw new Error('Not implemented: setShippingAddress');
  }

  async setBillingAddress(_address: AddressInput): Promise<void> {
    throw new Error('Not implemented: setBillingAddress');
  }

  async setBillingSameAsShipping(): Promise<void> {
    throw new Error('Not implemented: setBillingSameAsShipping');
  }

  async getShippingMethods(): Promise<ShippingMethod[]> {
    throw new Error('Not implemented: getShippingMethods');
  }

  async setShippingMethod(_carrierCode: string, _methodCode: string): Promise<Cart> {
    throw new Error('Not implemented: setShippingMethod');
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    throw new Error('Not implemented: getPaymentMethods');
  }

  async setPaymentMethod(_code: string): Promise<void> {
    throw new Error('Not implemented: setPaymentMethod');
  }

  async placeOrder(): Promise<PlaceOrderResult> {
    throw new Error('Not implemented: placeOrder');
  }

  // ============================================
  // ORDERS
  // ============================================

  async getOrders(page?: number, pageSize?: number): Promise<PaginatedResult<Order>> {
    const actualPage = page || 1;
    const actualPageSize = pageSize || 10;
    // TODO: Implement orders query
    return {
      items: [],
      total: 0,
      page: actualPage,
      pageSize: actualPageSize,
      hasMore: false,
    };
  }

  async getOrder(_id: string): Promise<Order> {
    throw new Error('Not implemented: getOrder');
  }

  async reorder(_orderId: string): Promise<Cart> {
    throw new Error('Not implemented: reorder');
  }

  // ============================================
  // WISHLIST
  // ============================================

  async getWishlist(): Promise<WishlistItem[]> {
    throw new Error('Not implemented: getWishlist');
  }

  async addToWishlist(_productId: string): Promise<void> {
    throw new Error('Not implemented: addToWishlist');
  }

  async removeFromWishlist(_itemId: string): Promise<void> {
    throw new Error('Not implemented: removeFromWishlist');
  }

  async moveWishlistItemToCart(_itemId: string): Promise<Cart> {
    throw new Error('Not implemented: moveWishlistItemToCart');
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

  async subscribeToNewsletter(_email: string): Promise<void> {
    // TODO: Implement newsletter subscription
    throw new Error('Not implemented: subscribeToNewsletter');
  }
}

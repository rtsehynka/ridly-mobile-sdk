/**
 * Magento 2 GraphQL Queries
 */

import {
  PRODUCT_BASIC_FRAGMENT,
  PRODUCT_DETAIL_FRAGMENT,
  CATEGORY_FRAGMENT,
  CATEGORY_WITH_CHILDREN_FRAGMENT,
  MONEY_FRAGMENT,
} from './fragments';

/**
 * Store Configuration
 */
export const STORE_CONFIG_QUERY = `
  query StoreConfig {
    storeConfig {
      store_code
      store_name
      base_url
      base_currency_code
      default_display_currency_code
      locale
      weight_unit
      copyright
      timezone
    }
  }
`;

/**
 * Category Tree
 */
export const CATEGORY_TREE_QUERY = `
  query CategoryTree {
    categories {
      items {
        ...CategoryWithChildrenFields
      }
    }
  }
  ${CATEGORY_WITH_CHILDREN_FRAGMENT}
`;

/**
 * Single Category
 */
export const CATEGORY_QUERY = `
  query Category($id: String!) {
    categories(filters: { category_uid: { eq: $id } }) {
      items {
        ...CategoryFields
        breadcrumbs {
          category_id
          category_name
          category_url_key
        }
      }
    }
  }
  ${CATEGORY_FRAGMENT}
`;

/**
 * Products List with Filters
 */
export const PRODUCTS_QUERY = `
  query Products(
    $search: String
    $filter: ProductAttributeFilterInput
    $sort: ProductAttributeSortInput
    $pageSize: Int = 20
    $currentPage: Int = 1
  ) {
    products(
      search: $search
      filter: $filter
      sort: $sort
      pageSize: $pageSize
      currentPage: $currentPage
    ) {
      total_count
      page_info {
        current_page
        page_size
        total_pages
      }
      aggregations {
        attribute_code
        label
        count
        options {
          label
          value
          count
        }
      }
      sort_fields {
        default
        options {
          label
          value
        }
      }
      items {
        ...ProductBasicFields
      }
    }
  }
  ${PRODUCT_BASIC_FRAGMENT}
`;

/**
 * Single Product by URL Key
 */
export const PRODUCT_BY_URL_KEY_QUERY = `
  query ProductByUrlKey($urlKey: String!) {
    products(filter: { url_key: { eq: $urlKey } }) {
      items {
        ...ProductDetailFields
      }
    }
  }
  ${PRODUCT_DETAIL_FRAGMENT}
`;

/**
 * Single Product by SKU
 */
export const PRODUCT_BY_SKU_QUERY = `
  query ProductBySku($sku: String!) {
    products(filter: { sku: { eq: $sku } }) {
      items {
        ...ProductDetailFields
      }
    }
  }
  ${PRODUCT_DETAIL_FRAGMENT}
`;

/**
 * Cart Queries & Mutations
 */
export const CREATE_EMPTY_CART_MUTATION = `
  mutation CreateEmptyCart {
    createEmptyCart
  }
`;

export const GET_CART_QUERY = `
  query GetCart($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      email
      total_quantity
      items {
        uid
        quantity
        product {
          ...ProductBasicFields
        }
        prices {
          row_total {
            ...MoneyFields
          }
          row_total_including_tax {
            ...MoneyFields
          }
        }
      }
      prices {
        subtotal_excluding_tax {
          ...MoneyFields
        }
        subtotal_including_tax {
          ...MoneyFields
        }
        grand_total {
          ...MoneyFields
        }
        discounts {
          amount {
            ...MoneyFields
          }
          label
        }
        applied_taxes {
          amount {
            ...MoneyFields
          }
          label
        }
      }
      applied_coupons {
        code
      }
      shipping_addresses {
        selected_shipping_method {
          carrier_code
          method_code
          carrier_title
          method_title
          amount {
            ...MoneyFields
          }
        }
      }
    }
  }
  ${PRODUCT_BASIC_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

export const ADD_TO_CART_MUTATION = `
  mutation AddToCart($cartId: String!, $sku: String!, $quantity: Float!) {
    addProductsToCart(
      cartId: $cartId
      cartItems: [{ sku: $sku, quantity: $quantity }]
    ) {
      cart {
        id
        total_quantity
        items {
          uid
          quantity
          product {
            sku
            name
          }
        }
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const UPDATE_CART_ITEM_MUTATION = `
  mutation UpdateCartItem($cartId: String!, $itemUid: ID!, $quantity: Float!) {
    updateCartItems(
      input: {
        cart_id: $cartId
        cart_items: [{ cart_item_uid: $itemUid, quantity: $quantity }]
      }
    ) {
      cart {
        id
        total_quantity
      }
    }
  }
`;

export const REMOVE_CART_ITEM_MUTATION = `
  mutation RemoveCartItem($cartId: String!, $itemUid: ID!) {
    removeItemFromCart(input: { cart_id: $cartId, cart_item_uid: $itemUid }) {
      cart {
        id
        total_quantity
      }
    }
  }
`;

export const APPLY_COUPON_MUTATION = `
  mutation ApplyCoupon($cartId: String!, $couponCode: String!) {
    applyCouponToCart(input: { cart_id: $cartId, coupon_code: $couponCode }) {
      cart {
        id
        applied_coupons {
          code
        }
      }
    }
  }
`;

export const REMOVE_COUPON_MUTATION = `
  mutation RemoveCoupon($cartId: String!) {
    removeCouponFromCart(input: { cart_id: $cartId }) {
      cart {
        id
        applied_coupons {
          code
        }
      }
    }
  }
`;

/**
 * Customer Authentication
 */
export const GENERATE_TOKEN_MUTATION = `
  mutation GenerateToken($email: String!, $password: String!) {
    generateCustomerToken(email: $email, password: $password) {
      token
    }
  }
`;

export const CREATE_CUSTOMER_MUTATION = `
  mutation CreateCustomer($input: CustomerCreateInput!) {
    createCustomerV2(input: $input) {
      customer {
        email
        firstname
        lastname
      }
    }
  }
`;

export const GET_CUSTOMER_QUERY = `
  query GetCustomer {
    customer {
      id
      email
      firstname
      lastname
      date_of_birth
      gender
      is_subscribed
      addresses {
        id
        firstname
        lastname
        street
        city
        region {
          region
          region_code
        }
        postcode
        country_code
        telephone
        default_shipping
        default_billing
      }
    }
  }
`;

/**
 * CMS Content
 */
export const CMS_PAGE_QUERY = `
  query CmsPage($identifier: String!) {
    cmsPage(identifier: $identifier) {
      identifier
      title
      content
      content_heading
      meta_title
      meta_description
    }
  }
`;

export const CMS_BLOCKS_QUERY = `
  query CmsBlocks($identifiers: [String!]!) {
    cmsBlocks(identifiers: $identifiers) {
      items {
        identifier
        title
        content
      }
    }
  }
`;

/**
 * Countries and Regions
 */
export const COUNTRIES_QUERY = `
  query Countries {
    countries {
      id
      two_letter_abbreviation
      full_name_english
      available_regions {
        id
        code
        name
      }
    }
  }
`;

// ============================================
// CHECKOUT MUTATIONS
// ============================================

/**
 * Set Shipping Address on Cart
 */
export const SET_SHIPPING_ADDRESS_MUTATION = `
  mutation SetShippingAddress($cartId: String!, $address: CartAddressInput!) {
    setShippingAddressesOnCart(
      input: {
        cart_id: $cartId
        shipping_addresses: [{ address: $address }]
      }
    ) {
      cart {
        id
        shipping_addresses {
          firstname
          lastname
          street
          city
          region {
            code
            label
          }
          postcode
          country {
            code
            label
          }
          telephone
          available_shipping_methods {
            carrier_code
            carrier_title
            method_code
            method_title
            amount {
              ...MoneyFields
            }
          }
        }
      }
    }
  }
  ${MONEY_FRAGMENT}
`;

/**
 * Set Billing Address on Cart
 */
export const SET_BILLING_ADDRESS_MUTATION = `
  mutation SetBillingAddress($cartId: String!, $address: CartAddressInput!, $sameAsShipping: Boolean) {
    setBillingAddressOnCart(
      input: {
        cart_id: $cartId
        billing_address: {
          address: $address
          same_as_shipping: $sameAsShipping
        }
      }
    ) {
      cart {
        id
        billing_address {
          firstname
          lastname
          street
          city
          region {
            code
            label
          }
          postcode
          country {
            code
            label
          }
          telephone
        }
      }
    }
  }
`;

/**
 * Get Available Shipping Methods
 */
export const GET_SHIPPING_METHODS_QUERY = `
  query GetShippingMethods($cartId: String!) {
    cart(cart_id: $cartId) {
      shipping_addresses {
        available_shipping_methods {
          carrier_code
          carrier_title
          method_code
          method_title
          amount {
            ...MoneyFields
          }
          price_excl_tax {
            ...MoneyFields
          }
          price_incl_tax {
            ...MoneyFields
          }
          available
          error_message
        }
      }
    }
  }
  ${MONEY_FRAGMENT}
`;

/**
 * Set Shipping Method on Cart
 */
export const SET_SHIPPING_METHOD_MUTATION = `
  mutation SetShippingMethod($cartId: String!, $carrierCode: String!, $methodCode: String!) {
    setShippingMethodsOnCart(
      input: {
        cart_id: $cartId
        shipping_methods: [{ carrier_code: $carrierCode, method_code: $methodCode }]
      }
    ) {
      cart {
        id
        shipping_addresses {
          selected_shipping_method {
            carrier_code
            carrier_title
            method_code
            method_title
            amount {
              ...MoneyFields
            }
          }
        }
        prices {
          grand_total {
            ...MoneyFields
          }
        }
      }
    }
  }
  ${MONEY_FRAGMENT}
`;

/**
 * Get Available Payment Methods
 */
export const GET_PAYMENT_METHODS_QUERY = `
  query GetPaymentMethods($cartId: String!) {
    cart(cart_id: $cartId) {
      available_payment_methods {
        code
        title
      }
    }
  }
`;

/**
 * Set Payment Method on Cart
 */
export const SET_PAYMENT_METHOD_MUTATION = `
  mutation SetPaymentMethod($cartId: String!, $paymentCode: String!) {
    setPaymentMethodOnCart(
      input: {
        cart_id: $cartId
        payment_method: { code: $paymentCode }
      }
    ) {
      cart {
        id
        selected_payment_method {
          code
          title
        }
      }
    }
  }
`;

/**
 * Place Order
 */
export const PLACE_ORDER_MUTATION = `
  mutation PlaceOrder($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      order {
        order_number
      }
    }
  }
`;

// ============================================
// ORDER QUERIES
// ============================================

/**
 * Customer Orders List
 */
export const CUSTOMER_ORDERS_QUERY = `
  query CustomerOrders($pageSize: Int = 10, $currentPage: Int = 1) {
    customer {
      orders(pageSize: $pageSize, currentPage: $currentPage) {
        total_count
        items {
          id
          order_number
          order_date
          status
          total {
            grand_total {
              ...MoneyFields
            }
            subtotal {
              ...MoneyFields
            }
            total_shipping {
              ...MoneyFields
            }
            total_tax {
              ...MoneyFields
            }
            discounts {
              amount {
                ...MoneyFields
              }
              label
            }
          }
          items {
            product_name
            product_sku
            quantity_ordered
            product_sale_price {
              ...MoneyFields
            }
          }
          shipping_address {
            firstname
            lastname
            street
            city
            region
            postcode
            country_code
            telephone
          }
          billing_address {
            firstname
            lastname
            street
            city
            region
            postcode
            country_code
            telephone
          }
          payment_methods {
            name
            type
          }
          shipments {
            tracking {
              carrier
              number
              title
            }
          }
        }
        page_info {
          current_page
          page_size
          total_pages
        }
      }
    }
  }
  ${MONEY_FRAGMENT}
`;

/**
 * Single Order Detail
 */
export const ORDER_DETAIL_QUERY = `
  query OrderDetail($orderNumber: String!) {
    customer {
      orders(filter: { number: { eq: $orderNumber } }) {
        items {
          id
          order_number
          order_date
          status
          comments {
            timestamp
            message
          }
          total {
            grand_total {
              ...MoneyFields
            }
            subtotal {
              ...MoneyFields
            }
            total_shipping {
              ...MoneyFields
            }
            total_tax {
              ...MoneyFields
            }
            discounts {
              amount {
                ...MoneyFields
              }
              label
            }
          }
          items {
            product_name
            product_sku
            quantity_ordered
            quantity_shipped
            quantity_canceled
            quantity_refunded
            product_sale_price {
              ...MoneyFields
            }
            product_url_key
          }
          shipping_address {
            firstname
            lastname
            street
            city
            region
            postcode
            country_code
            telephone
          }
          billing_address {
            firstname
            lastname
            street
            city
            region
            postcode
            country_code
            telephone
          }
          shipping_method
          payment_methods {
            name
            type
          }
          shipments {
            id
            number
            tracking {
              carrier
              number
              title
            }
            items {
              product_name
              quantity_shipped
            }
          }
        }
      }
    }
  }
  ${MONEY_FRAGMENT}
`;

// ============================================
// WISHLIST MUTATIONS
// ============================================

/**
 * Get Customer Wishlist
 */
export const GET_WISHLIST_QUERY = `
  query GetWishlist {
    customer {
      wishlists {
        id
        items_count
        items_v2(currentPage: 1, pageSize: 100) {
          items {
            id
            added_at
            product {
              ...ProductBasicFields
            }
          }
        }
      }
    }
  }
  ${PRODUCT_BASIC_FRAGMENT}
`;

/**
 * Add to Wishlist
 */
export const ADD_TO_WISHLIST_MUTATION = `
  mutation AddToWishlist($wishlistId: ID!, $sku: String!) {
    addProductsToWishlist(
      wishlistId: $wishlistId
      wishlistItems: [{ sku: $sku, quantity: 1 }]
    ) {
      wishlist {
        id
        items_count
      }
      user_errors {
        code
        message
      }
    }
  }
`;

/**
 * Remove from Wishlist
 */
export const REMOVE_FROM_WISHLIST_MUTATION = `
  mutation RemoveFromWishlist($wishlistId: ID!, $itemIds: [ID!]!) {
    removeProductsFromWishlist(wishlistId: $wishlistId, wishlistItemsIds: $itemIds) {
      wishlist {
        id
        items_count
      }
      user_errors {
        code
        message
      }
    }
  }
`;

/**
 * Move Wishlist Item to Cart
 */
export const MOVE_WISHLIST_TO_CART_MUTATION = `
  mutation MoveWishlistToCart($wishlistId: ID!, $itemIds: [ID!]!) {
    moveProductsBetweenWishlists(
      sourceWishlistUid: $wishlistId
      destinationWishlistUid: "0"
      wishlistItems: $itemIds
    ) {
      destination_wishlist {
        id
      }
    }
  }
`;

// ============================================
// CUSTOMER MANAGEMENT MUTATIONS
// ============================================

/**
 * Update Customer Profile
 */
export const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateCustomer($input: CustomerUpdateInput!) {
    updateCustomerV2(input: $input) {
      customer {
        id
        email
        firstname
        lastname
        date_of_birth
        gender
        is_subscribed
      }
    }
  }
`;

/**
 * Change Customer Password
 */
export const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changeCustomerPassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      id
      email
    }
  }
`;

/**
 * Request Password Reset Email
 */
export const REQUEST_PASSWORD_RESET_MUTATION = `
  mutation RequestPasswordReset($email: String!) {
    requestPasswordResetEmail(email: $email)
  }
`;

/**
 * Reset Password with Token
 */
export const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($email: String!, $resetPasswordToken: String!, $newPassword: String!) {
    resetPassword(email: $email, resetPasswordToken: $resetPasswordToken, newPassword: $newPassword)
  }
`;

/**
 * Create Customer Address
 */
export const CREATE_ADDRESS_MUTATION = `
  mutation CreateAddress($input: CustomerAddressInput!) {
    createCustomerAddress(input: $input) {
      id
      firstname
      lastname
      street
      city
      region {
        region
        region_code
      }
      postcode
      country_code
      telephone
      default_shipping
      default_billing
    }
  }
`;

/**
 * Update Customer Address
 */
export const UPDATE_ADDRESS_MUTATION = `
  mutation UpdateAddress($id: Int!, $input: CustomerAddressInput!) {
    updateCustomerAddress(id: $id, input: $input) {
      id
      firstname
      lastname
      street
      city
      region {
        region
        region_code
      }
      postcode
      country_code
      telephone
      default_shipping
      default_billing
    }
  }
`;

/**
 * Delete Customer Address
 */
export const DELETE_ADDRESS_MUTATION = `
  mutation DeleteAddress($id: Int!) {
    deleteCustomerAddress(id: $id)
  }
`;

/**
 * Subscribe to Newsletter
 */
export const SUBSCRIBE_NEWSLETTER_MUTATION = `
  mutation SubscribeNewsletter($email: String!) {
    subscribeEmailToNewsletter(email: $email) {
      status
    }
  }
`;

/**
 * Reorder - Add all items from previous order to cart
 */
export const REORDER_MUTATION = `
  mutation Reorder($orderNumber: String!) {
    reorderItems(orderNumber: $orderNumber) {
      cart {
        id
        total_quantity
      }
      userInputErrors {
        code
        message
        path
      }
    }
  }
`;

/**
 * Merge Guest Cart into Customer Cart
 */
export const MERGE_CARTS_MUTATION = `
  mutation MergeCarts($sourceCartId: String!, $destinationCartId: String!) {
    mergeCarts(source_cart_id: $sourceCartId, destination_cart_id: $destinationCartId) {
      id
      total_quantity
    }
  }
`;

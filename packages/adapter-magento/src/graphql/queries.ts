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

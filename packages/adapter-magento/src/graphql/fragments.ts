/**
 * Magento 2 GraphQL Fragments
 *
 * Reusable fragments for common data structures.
 * Compatible with Magento 2.4.x GraphQL schema.
 */

export const MONEY_FRAGMENT = `
  fragment MoneyFields on Money {
    value
    currency
  }
`;

export const IMAGE_FRAGMENT = `
  fragment ImageFields on ProductImage {
    url
    label
  }
`;

/**
 * Price fragment - uses ProductPrice type (not ProductPrices)
 * with snake_case field names (regular_price, final_price)
 */
export const PRICE_FRAGMENT = `
  fragment PriceFields on ProductPrice {
    regular_price {
      ...MoneyFields
    }
    final_price {
      ...MoneyFields
    }
    discount {
      amount_off
      percent_off
    }
  }
  ${MONEY_FRAGMENT}
`;

export const PRODUCT_BASIC_FRAGMENT = `
  fragment ProductBasicFields on ProductInterface {
    id
    uid
    sku
    name
    url_key
    __typename
    created_at
    updated_at
    image {
      ...ImageFields
    }
    small_image {
      ...ImageFields
    }
    price_range {
      minimum_price {
        ...PriceFields
      }
      maximum_price {
        ...PriceFields
      }
    }
  }
  ${IMAGE_FRAGMENT}
  ${PRICE_FRAGMENT}
`;

export const PRODUCT_DETAIL_FRAGMENT = `
  fragment ProductDetailFields on ProductInterface {
    id
    uid
    sku
    name
    url_key
    __typename
    created_at
    updated_at
    stock_status
    description {
      html
    }
    short_description {
      html
    }
    image {
      ...ImageFields
    }
    small_image {
      ...ImageFields
    }
    media_gallery {
      url
      label
      position
    }
    price_range {
      minimum_price {
        ...PriceFields
      }
      maximum_price {
        ...PriceFields
      }
    }
    categories {
      id
      uid
      name
      url_key
    }
    related_products {
      uid
      sku
      name
      url_key
      small_image {
        url
        label
      }
    }
    upsell_products {
      uid
      sku
      name
      url_key
      small_image {
        url
        label
      }
    }
    ... on ConfigurableProduct {
      configurable_options {
        id
        uid
        attribute_code
        label
        position
        use_default
        values {
          uid
          label
          default_label
          store_label
          use_default_value
          swatch_data {
            value
          }
        }
      }
      variants {
        attributes {
          uid
          code
          label
          value_index
        }
        product {
          id
          uid
          sku
          stock_status
          price_range {
            minimum_price {
              ...PriceFields
            }
          }
          small_image {
            url
            label
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
  ${PRICE_FRAGMENT}
`;

export const CATEGORY_FRAGMENT = `
  fragment CategoryFields on CategoryTree {
    id
    uid
    name
    url_key
    url_path
    position
    level
    include_in_menu
    product_count
    image
    children_count
    description
  }
`;

export const CATEGORY_WITH_CHILDREN_FRAGMENT = `
  fragment CategoryWithChildrenFields on CategoryTree {
    ...CategoryFields
    children {
      ...CategoryFields
      children {
        ...CategoryFields
      }
    }
  }
  ${CATEGORY_FRAGMENT}
`;

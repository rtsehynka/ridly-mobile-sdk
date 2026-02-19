/**
 * Magento 2 Data Transformers
 *
 * Converts Magento GraphQL responses to RIDLY SDK types.
 */

import type {
  Product,
  ProductType,
  ProductAttribute,
  CategoryReference,
  Category,
  Cart,
  CartItem,
  AppliedCoupon,
  Money,
  Image,
  StoreConfig,
  Customer,
  Address,
  CmsPage,
  CmsBlock,
  Country,
} from '@ridly/mobile-core';

// ============================================
// Magento Response Types
// ============================================

interface MagentoMoney {
  value: number;
  currency: string;
}

interface MagentoImage {
  url: string;
  label?: string;
}

interface MagentoPrice {
  regular_price: MagentoMoney;
  final_price: MagentoMoney;
  discount?: { amount_off: number; percent_off: number };
}

interface MagentoPriceRange {
  minimum_price: MagentoPrice;
  maximum_price: MagentoPrice;
}

interface MagentoProduct {
  id: number;
  uid: string;
  sku: string;
  name: string;
  url_key: string;
  __typename?: string;
  image?: MagentoImage;
  small_image?: MagentoImage;
  price_range: MagentoPriceRange;
  description?: { html: string };
  short_description?: { html: string };
  media_gallery?: Array<{ url: string; label?: string; position?: number }>;
  categories?: MagentoCategory[];
  related_products?: MagentoProduct[];
  upsell_products?: MagentoProduct[];
  created_at?: string;
  updated_at?: string;
}

interface MagentoCategory {
  id: number;
  uid: string;
  name: string;
  url_key: string;
  url_path?: string;
  position?: number;
  level?: number;
  include_in_menu?: number;
  product_count?: number;
  image?: string;
  children_count?: number;
  children?: MagentoCategory[];
  breadcrumbs?: Array<{
    category_id: number;
    category_name: string;
    category_url_key: string;
  }>;
}

interface MagentoCartItem {
  uid: string;
  quantity: number;
  product: MagentoProduct;
  prices: {
    row_total: MagentoMoney;
    row_total_including_tax: MagentoMoney;
  };
}

interface MagentoCart {
  id: string;
  email?: string;
  total_quantity: number;
  items: MagentoCartItem[];
  is_virtual?: boolean;
  prices: {
    subtotal_excluding_tax: MagentoMoney;
    subtotal_including_tax: MagentoMoney;
    grand_total: MagentoMoney;
    discounts?: Array<{ amount: MagentoMoney; label: string }>;
    applied_taxes?: Array<{ amount: MagentoMoney; label: string }>;
  };
  applied_coupons?: Array<{ code: string }>;
  shipping_addresses?: Array<{
    selected_shipping_method?: {
      carrier_code: string;
      method_code: string;
      carrier_title: string;
      method_title: string;
      amount: MagentoMoney;
    };
  }>;
}

interface MagentoStoreConfig {
  store_code: string;
  store_name: string;
  base_url: string;
  base_currency_code: string;
  default_display_currency_code: string;
  locale: string;
  weight_unit: string;
  logo_url?: string;
}

interface MagentoCustomer {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  date_of_birth?: string;
  gender?: number;
  is_subscribed?: boolean;
  addresses?: MagentoAddress[];
  created_at?: string;
}

interface MagentoAddress {
  id: number;
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  region?: { region: string; region_code: string };
  postcode: string;
  country_code: string;
  telephone?: string;
  default_shipping?: boolean;
  default_billing?: boolean;
}

// ============================================
// Transformers
// ============================================

export function transformMoney(magentoMoney: MagentoMoney): Money {
  return {
    amount: magentoMoney.value,
    currency: magentoMoney.currency,
  };
}

export function transformImage(magentoImage: MagentoImage | undefined, fallbackAlt: string = ''): Image {
  return {
    url: magentoImage?.url || '',
    alt: magentoImage?.label || fallbackAlt,
  };
}

function getProductType(typename?: string): ProductType {
  switch (typename) {
    case 'ConfigurableProduct':
      return 'configurable';
    case 'GroupedProduct':
      return 'grouped';
    case 'BundleProduct':
      return 'bundle';
    case 'VirtualProduct':
      return 'virtual';
    case 'SimpleProduct':
    default:
      return 'simple';
  }
}

export function transformProduct(magentoProduct: MagentoProduct): Product {
  const priceRange = magentoProduct.price_range;
  const minPrice = priceRange.minimum_price;
  const discount = minPrice.discount;

  const images: Image[] = [];

  // Add main image
  if (magentoProduct.image?.url) {
    images.push({
      url: magentoProduct.image.url,
      alt: magentoProduct.image.label || magentoProduct.name,
    });
  }

  // Add gallery images
  if (magentoProduct.media_gallery) {
    magentoProduct.media_gallery
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .forEach((img) => {
        if (img.url && !images.find((i) => i.url === img.url)) {
          images.push({
            url: img.url,
            alt: img.label || magentoProduct.name,
          });
        }
      });
  }

  // Transform categories to CategoryReference
  const categories: CategoryReference[] = (magentoProduct.categories || []).map((cat) => ({
    id: cat.uid,
    name: cat.name,
    slug: cat.url_key,
  }));

  // Transform related product IDs
  const relatedProductIds = magentoProduct.related_products?.map((p) => p.uid);
  const upsellProductIds = magentoProduct.upsell_products?.map((p) => p.uid);

  // Build attributes array (empty for now - would need custom attributes query)
  const attributes: ProductAttribute[] = [];

  // Check if there's a discount (final_price < regular_price)
  const hasDiscount = discount && discount.percent_off > 0;

  return {
    id: magentoProduct.uid,
    sku: magentoProduct.sku,
    name: magentoProduct.name,
    slug: magentoProduct.url_key,
    description: magentoProduct.description?.html || '',
    shortDescription: magentoProduct.short_description?.html,
    price: transformMoney(minPrice.final_price),
    specialPrice: hasDiscount ? transformMoney(minPrice.final_price) : undefined,
    images,
    thumbnail: transformImage(magentoProduct.small_image || magentoProduct.image, magentoProduct.name),
    inStock: true, // Default to true since stock_status is not available
    categories,
    variants: [],
    options: [],
    attributes,
    type: getProductType(magentoProduct.__typename),
    rating: undefined,
    reviewCount: undefined,
    relatedProductIds,
    upsellProductIds,
    createdAt: magentoProduct.created_at || new Date().toISOString(),
    updatedAt: magentoProduct.updated_at || new Date().toISOString(),
  };
}

export function transformCategory(magentoCategory: MagentoCategory): Category {
  return {
    id: magentoCategory.uid,
    name: magentoCategory.name,
    slug: magentoCategory.url_key,
    description: undefined,
    image: magentoCategory.image
      ? { url: magentoCategory.image, alt: magentoCategory.name }
      : undefined,
    parentId: null, // Would need parent info from query
    children: magentoCategory.children?.map(transformCategory) || [],
    productCount: magentoCategory.product_count || 0,
    level: magentoCategory.level || 0,
    position: magentoCategory.position || 0,
    isActive: true,
    includeInMenu: magentoCategory.include_in_menu !== 0,
  };
}

export function transformCartItem(magentoItem: MagentoCartItem): CartItem {
  return {
    id: magentoItem.uid,
    productId: magentoItem.product.uid,
    sku: magentoItem.product.sku,
    name: magentoItem.product.name,
    quantity: magentoItem.quantity,
    price: transformMoney(magentoItem.prices.row_total_including_tax),
    total: transformMoney(magentoItem.prices.row_total_including_tax),
    image: transformImage(magentoItem.product.small_image, magentoItem.product.name),
  };
}

export function transformCart(magentoCart: MagentoCart): Cart {
  const shipping = magentoCart.shipping_addresses?.[0]?.selected_shipping_method;

  // Transform applied coupons to AppliedCoupon objects
  const appliedCoupons: AppliedCoupon[] = (magentoCart.applied_coupons || []).map((coupon) => {
    // Find corresponding discount
    const discountEntry = magentoCart.prices.discounts?.find(
      (d) => d.label.toLowerCase().includes('coupon')
    );
    return {
      code: coupon.code,
      discount: discountEntry
        ? transformMoney(discountEntry.amount)
        : { amount: 0, currency: magentoCart.prices.grand_total.currency },
    };
  });

  return {
    id: magentoCart.id,
    items: magentoCart.items?.map(transformCartItem) || [],
    totals: {
      subtotal: transformMoney(magentoCart.prices.subtotal_including_tax),
      shipping: shipping ? transformMoney(shipping.amount) : undefined,
      tax: magentoCart.prices.applied_taxes?.[0]
        ? transformMoney(magentoCart.prices.applied_taxes[0].amount)
        : undefined,
      discount: magentoCart.prices.discounts?.[0]
        ? transformMoney(magentoCart.prices.discounts[0].amount)
        : undefined,
      grandTotal: transformMoney(magentoCart.prices.grand_total),
    },
    itemCount: magentoCart.total_quantity,
    appliedCoupons,
    isVirtual: magentoCart.is_virtual || false,
  };
}

export function transformStoreConfig(magentoConfig: MagentoStoreConfig): StoreConfig {
  return {
    storeName: magentoConfig.store_name,
    storeUrl: magentoConfig.base_url,
    currency: magentoConfig.default_display_currency_code || magentoConfig.base_currency_code,
    locale: magentoConfig.locale,
    weightUnit: magentoConfig.weight_unit === 'lbs' ? 'lb' : 'kg',
    allowGuestCheckout: true, // Magento allows by default
    requireRegion: true,
    logoUrl: magentoConfig.logo_url,
  };
}

export function transformCustomer(magentoCustomer: MagentoCustomer): Customer {
  return {
    id: String(magentoCustomer.id),
    email: magentoCustomer.email,
    firstName: magentoCustomer.firstname,
    lastName: magentoCustomer.lastname,
    dateOfBirth: magentoCustomer.date_of_birth,
    gender:
      magentoCustomer.gender === 1
        ? 'male'
        : magentoCustomer.gender === 2
          ? 'female'
          : undefined,
    isSubscribedToNewsletter: magentoCustomer.is_subscribed || false,
    addresses: magentoCustomer.addresses?.map(transformAddress) || [],
    createdAt: magentoCustomer.created_at || new Date().toISOString(),
  };
}

export function transformAddress(magentoAddress: MagentoAddress): Address {
  return {
    id: String(magentoAddress.id),
    firstName: magentoAddress.firstname,
    lastName: magentoAddress.lastname,
    street: magentoAddress.street,
    city: magentoAddress.city,
    region: magentoAddress.region?.region,
    regionCode: magentoAddress.region?.region_code,
    postcode: magentoAddress.postcode,
    countryCode: magentoAddress.country_code,
    phone: magentoAddress.telephone,
    isDefaultShipping: magentoAddress.default_shipping || false,
    isDefaultBilling: magentoAddress.default_billing || false,
  };
}

export function transformCountry(magentoCountry: {
  id: string;
  two_letter_abbreviation: string;
  full_name_english: string;
  available_regions?: Array<{ id: string; code: string; name: string }>;
}): Country {
  return {
    code: magentoCountry.two_letter_abbreviation,
    name: magentoCountry.full_name_english,
    requiresRegion: (magentoCountry.available_regions?.length || 0) > 0,
  };
}

export function transformCmsPage(magentoCmsPage: {
  identifier: string;
  title: string;
  content: string;
  content_heading?: string;
  meta_title?: string;
  meta_description?: string;
}): CmsPage {
  return {
    id: magentoCmsPage.identifier,
    identifier: magentoCmsPage.identifier,
    title: magentoCmsPage.title,
    content: magentoCmsPage.content,
    metaTitle: magentoCmsPage.meta_title,
    metaDescription: magentoCmsPage.meta_description,
  };
}

export function transformCmsBlock(magentoCmsBlock: {
  identifier: string;
  title: string;
  content: string;
}): CmsBlock {
  return {
    id: magentoCmsBlock.identifier,
    identifier: magentoCmsBlock.identifier,
    title: magentoCmsBlock.title,
    content: magentoCmsBlock.content,
  };
}

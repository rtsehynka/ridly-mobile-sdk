/**
 * RIDLY Mobile Config types
 * This defines the schema for ridly.mobile.config.json
 */

/**
 * Store connection configuration
 */
export interface StoreConnectionConfig {
  platform: 'magento' | 'shopware' | 'woocommerce';
  url: string;
  apiVersion?: string;
  graphql?: boolean;
  storeCode?: string;
}

/**
 * App metadata configuration
 */
export interface AppConfig {
  name: string;
  bundleId: string;
  packageName: string;
  version: string;
  buildNumber: string;
}

/**
 * Theme colors
 */
export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryDark: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  onPrimary: string;
  headerBackground: string;
  headerText: string;
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  // UI state colors
  disabled: string;
  disabledText: string;
  // Price colors
  price: string;
  sale: string;
}

/**
 * Dark mode configuration
 */
export interface DarkModeConfig {
  enabled: boolean;
  auto: boolean;
  colors?: Partial<ThemeColors>;
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
  fontFamily: string;
  headingFontFamily?: string;
  baseFontSize: number;
  headingWeight: string;
  bodyWeight: string;
}

/**
 * Border radius configuration
 */
export interface BorderRadiusConfig {
  small: number;
  medium: number;
  large: number;
  button: number;
  card: number;
  image: number;
}

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  screenPadding: number;
  cardPadding: number;
  sectionGap: number;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  preset: 'minimal' | 'bold' | 'elegant' | 'custom';
  colors: ThemeColors;
  darkMode: DarkModeConfig;
  typography: TypographyConfig;
  borderRadius: BorderRadiusConfig;
  spacing: SpacingConfig;
}

/**
 * Home screen section
 */
export interface HomeScreenSection {
  type:
    | 'banner'
    | 'categories'
    | 'featured'
    | 'newArrivals'
    | 'onSale'
    | 'brands'
    | 'cmsBlock';
  enabled: boolean;
  title?: string;
  limit?: number;
  style?: 'grid' | 'carousel' | 'list';
  categoryId?: string;
  blockId?: string;
}

/**
 * Home screen configuration
 */
export interface HomeScreenConfig {
  sections: HomeScreenSection[];
}

/**
 * Product display configuration
 */
export interface ProductConfig {
  gridColumns: 1 | 2 | 3;
  showSku: boolean;
  showStock: boolean;
  showRating: boolean;
  showWishlist: boolean;
  showShare: boolean;
  showRelated: boolean;
  imageAspectRatio: '1:1' | '3:4' | '4:3';
  galleryStyle: 'scroll' | 'zoom' | 'fullscreen';
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  enabled: boolean;
  provider: 'firebase' | 'none';
  trackScreenViews: boolean;
  trackAddToCart: boolean;
  trackPurchase: boolean;
}

/**
 * Social login configuration
 */
export interface SocialLoginConfig {
  google: boolean;
  apple: boolean;
  facebook: boolean;
}

/**
 * Features configuration
 */
export interface FeaturesConfig {
  wishlist: boolean;
  search: boolean;
  filters: boolean;
  reviews: boolean;
  guestCheckout: boolean;
  socialLogin: SocialLoginConfig;
  pushNotifications: boolean;
  deepLinking: boolean;
  analytics: AnalyticsConfig;
  biometricLogin: boolean;
  barcodeScan: boolean;
}

/**
 * Currency configuration
 */
export interface CurrencyConfig {
  code: string;
  symbol: string;
  position: 'before' | 'after';
  decimalSeparator: string;
  thousandSeparator: string;
  decimalDigits: number;
}

/**
 * Localization configuration
 */
export interface LocalizationConfig {
  defaultLanguage: string;
  languages: string[];
  rtl: boolean;
  currency: CurrencyConfig;
}

/**
 * Checkout configuration
 */
export interface CheckoutConfig {
  webViewCheckout: boolean;
  webViewPaymentOnly: boolean;
  requirePhone: boolean;
  requireRegion: boolean;
  defaultCountry: string;
}

/**
 * Tab navigation item
 */
export interface TabItem {
  name: string;
  icon: string;
  showBadge?: boolean;
}

/**
 * Custom drawer link
 */
export interface DrawerLink {
  title: string;
  type: 'cms' | 'url' | 'screen';
  id?: string;
  url?: string;
  screen?: string;
}

/**
 * Drawer configuration
 */
export interface DrawerConfig {
  enabled: boolean;
  showCategories: boolean;
  customLinks: DrawerLink[];
}

/**
 * Navigation configuration
 */
export interface NavigationConfig {
  tabs: TabItem[];
  drawer: DrawerConfig;
}

/**
 * Main RIDLY Mobile configuration
 */
export interface RidlyMobileConfig {
  store: StoreConnectionConfig;
  app: AppConfig;
  theme: ThemeConfig;
  homeScreen: HomeScreenConfig;
  product: ProductConfig;
  features: FeaturesConfig;
  localization: LocalizationConfig;
  checkout: CheckoutConfig;
  navigation: NavigationConfig;
}

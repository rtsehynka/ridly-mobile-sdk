/**
 * RIDLY Mobile SDK - React Hooks
 */

// Re-export theme hooks
export { useTheme, useThemeTokens, useIsDarkMode } from '../theme/ThemeContext';

// Core hooks
export { useAdapter } from './useAdapter';
export {
  useConfig,
  useThemeConfig,
  useFeaturesConfig,
  useLocalizationConfig,
  useNavigationConfig,
  type UseConfigReturn,
} from './useConfig';

// Product hooks
export {
  useProducts,
  useInfiniteProducts,
  type UseProductsOptions,
  type UseProductsReturn,
} from './useProducts';

export {
  useProduct,
  useRelatedProducts,
  useUpsellProducts,
  type UseProductOptions,
  type UseProductReturn,
} from './useProduct';

// Category hooks
export {
  useCategories,
  useCategoryTree,
  type UseCategoriesOptions,
  type UseCategoriesReturn,
} from './useCategories';

export {
  useCategory,
  type UseCategoryOptions,
  type UseCategoryReturn,
} from './useCategory';

// Search hooks
export {
  useSearch,
  useInfiniteSearch,
  useSearchSuggestions,
  type UseSearchOptions,
  type UseSearchReturn,
} from './useSearch';

// Cart hooks
export {
  useCart,
  useCartItemCount,
  useIsCartEmpty,
  type UseCartReturn,
} from './useCart';

// Auth hooks
export {
  useAuth,
  useIsAuthenticated,
  useCustomer,
  type UseAuthReturn,
} from './useAuth';

// Checkout hooks
export {
  useCheckout,
  type CheckoutStep,
  type CheckoutState,
  type UseCheckoutReturn,
} from './useCheckout';

// Order hooks
export {
  useOrders,
  useInfiniteOrders,
  useOrder,
  useOrderStatusLabel,
  type UseOrdersOptions,
  type UseOrdersReturn,
  type UseOrderOptions,
  type UseOrderReturn,
} from './useOrders';

// Wishlist hooks
export {
  useWishlist,
  useWishlistItemCount,
  useIsInWishlist,
  type UseWishlistReturn,
} from './useWishlist';

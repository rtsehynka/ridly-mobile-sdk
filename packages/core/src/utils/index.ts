/**
 * RIDLY Mobile SDK - Utilities
 */

// Price formatting
export {
  formatPrice,
  formatPriceRange,
  formatSalePrice,
  calculateDiscount,
  getCurrencySymbol,
  type FormatPriceOptions,
} from './formatPrice';

// Error utilities
export {
  RidlyError,
  NetworkError,
  AuthError,
  NotFoundError,
  ServerError,
  ValidationError,
  getErrorType,
  getErrorMessage,
  isNetworkError,
  isAuthError,
  isRecoverableError,
  setErrorReporter,
  getErrorReporter,
  reportError,
  consoleErrorReporter,
  type ErrorReporter,
} from './errors';

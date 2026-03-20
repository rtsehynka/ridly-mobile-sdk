/**
 * E2E Test Data
 *
 * Test fixtures and constants for E2E tests.
 */

/**
 * Test user credentials
 * These should match test accounts in your Magento instance
 */
export const TEST_USER = {
  email: 'e2e-test@ridly.io',
  password: 'Test123!@#',
  firstName: 'E2E',
  lastName: 'Tester',
};

/**
 * Generate unique email for registration tests
 */
export function generateTestEmail(): string {
  return `e2e-test-${Date.now()}@ridly.io`;
}

/**
 * Test address data
 */
export const TEST_ADDRESS = {
  street: '123 Test Street',
  city: 'Test City',
  region: 'California',
  regionCode: 'CA',
  postcode: '90210',
  country: 'US',
  phone: '+1234567890',
};

/**
 * Test payment data (for mock payments)
 */
export const TEST_PAYMENT = {
  cardNumber: '4111111111111111',
  expMonth: '12',
  expYear: '2030',
  cvv: '123',
};

/**
 * Test coupon codes
 */
export const TEST_COUPONS = {
  valid: 'TESTCODE10',
  invalid: 'INVALIDCODE',
  expired: 'EXPIREDCODE',
};

/**
 * Expected product data (for verification)
 */
export const EXPECTED_PRODUCTS = {
  // First product in listing - update based on your catalog
  firstProduct: {
    titleContains: '', // Will be checked dynamically
    hasPrice: true,
  },
};

/**
 * Timeouts for different operations
 */
export const TIMEOUTS = {
  short: 5000,      // UI animations, toasts
  medium: 10000,    // API calls, screen navigation
  long: 30000,      // Checkout, payment processing
  veryLong: 60000,  // App launch, heavy operations
};

/**
 * Test categories
 */
export const TEST_CATEGORIES = {
  // Update based on your catalog structure
  mainCategory: 'Clothing',
  subCategory: 'Tops',
};

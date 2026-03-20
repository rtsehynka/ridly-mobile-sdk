/**
 * E2E Test Helpers
 *
 * Common utilities for Detox E2E tests.
 */

import { device, element, by, expect } from 'detox';

/**
 * Wait for element to be visible with custom timeout
 */
export async function waitForElement(
  testID: string,
  timeout: number = 10000
): Promise<void> {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * Tap element by testID
 */
export async function tap(testID: string): Promise<void> {
  await element(by.id(testID)).tap();
}

/**
 * Type text into input by testID
 */
export async function typeText(testID: string, text: string): Promise<void> {
  await element(by.id(testID)).typeText(text);
}

/**
 * Clear text and type new text
 */
export async function replaceText(testID: string, text: string): Promise<void> {
  await element(by.id(testID)).clearText();
  await element(by.id(testID)).typeText(text);
}

/**
 * Scroll to element
 */
export async function scrollToElement(
  scrollViewID: string,
  targetID: string,
  direction: 'up' | 'down' = 'down',
  pixels: number = 200
): Promise<void> {
  await waitFor(element(by.id(targetID)))
    .toBeVisible()
    .whileElement(by.id(scrollViewID))
    .scroll(pixels, direction);
}

/**
 * Login helper - performs full login flow
 */
export async function login(
  email: string,
  password: string
): Promise<void> {
  // Navigate to login if needed
  try {
    await element(by.id('tab-account')).tap();
    await waitFor(element(by.id('login-email-input')))
      .toBeVisible()
      .withTimeout(5000);
  } catch {
    // Already on login screen
  }

  await element(by.id('login-email-input')).typeText(email);
  await element(by.id('login-password-input')).typeText(password);
  await element(by.id('login-submit-button')).tap();

  // Wait for successful login
  await waitFor(element(by.id('home-screen')))
    .toBeVisible()
    .withTimeout(15000);
}

/**
 * Logout helper
 */
export async function logout(): Promise<void> {
  await element(by.id('tab-account')).tap();
  await waitFor(element(by.id('logout-button')))
    .toBeVisible()
    .withTimeout(5000);
  await element(by.id('logout-button')).tap();
  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(5000);
}

/**
 * Add product to cart helper
 */
export async function addProductToCart(productIndex: number = 0): Promise<void> {
  await element(by.id(`product-item-${productIndex}`)).tap();
  await waitFor(element(by.id('product-detail-screen')))
    .toBeVisible()
    .withTimeout(10000);
  await element(by.id('add-to-cart-button')).tap();
  await waitFor(element(by.id('cart-success-message')))
    .toBeVisible()
    .withTimeout(5000);
}

/**
 * Navigate to tab
 */
export async function navigateToTab(
  tab: 'home' | 'categories' | 'search' | 'cart' | 'account'
): Promise<void> {
  await element(by.id(`tab-${tab}`)).tap();
}

/**
 * Dismiss keyboard
 */
export async function dismissKeyboard(): Promise<void> {
  if (device.getPlatform() === 'ios') {
    await element(by.id('keyboard-dismiss-area')).tap();
  } else {
    await device.pressBack();
  }
}

/**
 * Reset app state
 */
export async function resetAppState(): Promise<void> {
  await device.clearKeychain();
  await device.launchApp({ delete: true });
}

/**
 * Take screenshot with name
 */
export async function takeScreenshot(name: string): Promise<void> {
  await device.takeScreenshot(name);
}

/**
 * Expect element to have text
 */
export async function expectText(testID: string, text: string): Promise<void> {
  await expect(element(by.id(testID))).toHaveText(text);
}

/**
 * Expect element to be visible
 */
export async function expectVisible(testID: string): Promise<void> {
  await expect(element(by.id(testID))).toBeVisible();
}

/**
 * Expect element to not exist
 */
export async function expectNotVisible(testID: string): Promise<void> {
  await expect(element(by.id(testID))).not.toBeVisible();
}

/**
 * Authentication E2E Tests
 *
 * Tests for login, registration, and logout flows.
 */

import { device, element, by, expect } from 'detox';
import { TEST_USER, generateTestEmail, TIMEOUTS } from '../utils/testData';
import { waitForElement, login, navigateToTab } from '../utils/testHelpers';

describe('Authentication', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Login', () => {
    it('should display login screen elements', async () => {
      await navigateToTab('account');

      await expect(element(by.id('login-email-input'))).toBeVisible();
      await expect(element(by.id('login-password-input'))).toBeVisible();
      await expect(element(by.id('login-submit-button'))).toBeVisible();
      await expect(element(by.id('register-link'))).toBeVisible();
      await expect(element(by.id('forgot-password-link'))).toBeVisible();
    });

    it('should show validation errors for empty fields', async () => {
      await navigateToTab('account');
      await element(by.id('login-submit-button')).tap();

      await expect(element(by.id('login-email-error'))).toBeVisible();
      await expect(element(by.id('login-password-error'))).toBeVisible();
    });

    it('should show error for invalid email format', async () => {
      await navigateToTab('account');

      await element(by.id('login-email-input')).typeText('invalid-email');
      await element(by.id('login-password-input')).typeText('password123');
      await element(by.id('login-submit-button')).tap();

      await expect(element(by.id('login-email-error'))).toBeVisible();
    });

    it('should show error for invalid credentials', async () => {
      await navigateToTab('account');

      await element(by.id('login-email-input')).typeText('wrong@example.com');
      await element(by.id('login-password-input')).typeText('wrongpassword');
      await element(by.id('login-submit-button')).tap();

      await waitFor(element(by.id('login-error-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should login successfully with valid credentials', async () => {
      await navigateToTab('account');

      await element(by.id('login-email-input')).typeText(TEST_USER.email);
      await element(by.id('login-password-input')).typeText(TEST_USER.password);
      await element(by.id('login-submit-button')).tap();

      await waitFor(element(by.id('account-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      // Should show user info
      await expect(element(by.id('user-greeting'))).toBeVisible();
    });

    it('should persist login after app restart', async () => {
      // Login first
      await navigateToTab('account');
      await element(by.id('login-email-input')).typeText(TEST_USER.email);
      await element(by.id('login-password-input')).typeText(TEST_USER.password);
      await element(by.id('login-submit-button')).tap();

      await waitFor(element(by.id('account-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      // Restart app
      await device.launchApp({ newInstance: false });

      // Should still be logged in
      await navigateToTab('account');
      await expect(element(by.id('account-screen'))).toBeVisible();
      await expect(element(by.id('user-greeting'))).toBeVisible();
    });
  });

  describe('Registration', () => {
    it('should display registration screen elements', async () => {
      await navigateToTab('account');
      await element(by.id('register-link')).tap();

      await expect(element(by.id('register-firstname-input'))).toBeVisible();
      await expect(element(by.id('register-lastname-input'))).toBeVisible();
      await expect(element(by.id('register-email-input'))).toBeVisible();
      await expect(element(by.id('register-password-input'))).toBeVisible();
      await expect(element(by.id('register-submit-button'))).toBeVisible();
    });

    it('should show validation errors for empty fields', async () => {
      await navigateToTab('account');
      await element(by.id('register-link')).tap();
      await element(by.id('register-submit-button')).tap();

      await expect(element(by.id('register-firstname-error'))).toBeVisible();
      await expect(element(by.id('register-lastname-error'))).toBeVisible();
      await expect(element(by.id('register-email-error'))).toBeVisible();
      await expect(element(by.id('register-password-error'))).toBeVisible();
    });

    it('should show error for weak password', async () => {
      await navigateToTab('account');
      await element(by.id('register-link')).tap();

      await element(by.id('register-firstname-input')).typeText('Test');
      await element(by.id('register-lastname-input')).typeText('User');
      await element(by.id('register-email-input')).typeText(generateTestEmail());
      await element(by.id('register-password-input')).typeText('weak');
      await element(by.id('register-submit-button')).tap();

      await expect(element(by.id('register-password-error'))).toBeVisible();
    });

    it('should register new user successfully', async () => {
      const newEmail = generateTestEmail();

      await navigateToTab('account');
      await element(by.id('register-link')).tap();

      await element(by.id('register-firstname-input')).typeText('New');
      await element(by.id('register-lastname-input')).typeText('Tester');
      await element(by.id('register-email-input')).typeText(newEmail);
      await element(by.id('register-password-input')).typeText('NewTest123!@#');
      await element(by.id('register-submit-button')).tap();

      // Should navigate to account screen after successful registration
      await waitFor(element(by.id('account-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.long);

      await expect(element(by.id('user-greeting'))).toBeVisible();
    });

    it('should show error for existing email', async () => {
      await navigateToTab('account');
      await element(by.id('register-link')).tap();

      await element(by.id('register-firstname-input')).typeText('Test');
      await element(by.id('register-lastname-input')).typeText('User');
      await element(by.id('register-email-input')).typeText(TEST_USER.email);
      await element(by.id('register-password-input')).typeText('Test123!@#');
      await element(by.id('register-submit-button')).tap();

      await waitFor(element(by.id('register-error-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });
  });

  describe('Logout', () => {
    beforeEach(async () => {
      // Login before each logout test
      await login(TEST_USER.email, TEST_USER.password);
    });

    it('should logout successfully', async () => {
      await navigateToTab('account');
      await element(by.id('logout-button')).tap();

      // Should navigate back to login screen
      await waitFor(element(by.id('login-email-input')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.short);
    });

    it('should clear cart after logout', async () => {
      // Add item to cart while logged in
      await navigateToTab('home');
      await element(by.id('product-item-0')).tap();
      await element(by.id('add-to-cart-button')).tap();

      // Logout
      await navigateToTab('account');
      await element(by.id('logout-button')).tap();

      // Cart should be empty
      await navigateToTab('cart');
      await expect(element(by.id('empty-cart-message'))).toBeVisible();
    });
  });
});

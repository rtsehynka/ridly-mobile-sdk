/**
 * Shopping Cart E2E Tests
 *
 * Tests for cart operations: add, update, remove, coupons.
 */

import { device, element, by, expect } from 'detox';
import { TEST_USER, TEST_COUPONS, TIMEOUTS } from '../utils/testData';
import { navigateToTab, login, addProductToCart } from '../utils/testHelpers';

describe('Shopping Cart', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Empty Cart', () => {
    it('should display empty cart message', async () => {
      await navigateToTab('cart');

      await expect(element(by.id('empty-cart-message'))).toBeVisible();
      await expect(element(by.id('continue-shopping-button'))).toBeVisible();
    });

    it('should navigate to shop from empty cart', async () => {
      await navigateToTab('cart');
      await element(by.id('continue-shopping-button')).tap();

      await expect(element(by.id('home-screen'))).toBeVisible();
    });
  });

  describe('Add to Cart', () => {
    it('should add simple product to cart', async () => {
      await navigateToTab('home');
      await element(by.id('featured-product-0')).tap();

      await waitFor(element(by.id('product-detail-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      await element(by.id('add-to-cart-button')).tap();

      await waitFor(element(by.id('cart-success-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.short);

      // Cart badge should show 1
      await expect(element(by.id('cart-badge'))).toHaveText('1');
    });

    it('should add configurable product with selected options', async () => {
      await navigateToTab('categories');
      await waitFor(element(by.id('category-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
      await element(by.id('category-item-0')).tap();
      await waitFor(element(by.id('product-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
      await element(by.id('product-item-0')).tap();

      await waitFor(element(by.id('product-detail-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      // Select options if available
      try {
        await element(by.id('option-size-M')).tap();
        await element(by.id('option-color-0')).tap();
      } catch {
        // Product may not have options
      }

      await element(by.id('add-to-cart-button')).tap();

      await waitFor(element(by.id('cart-success-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.short);
    });

    it('should show error when required options not selected', async () => {
      await navigateToTab('categories');
      await waitFor(element(by.id('category-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
      await element(by.id('category-item-0')).tap();
      await waitFor(element(by.id('product-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
      await element(by.id('product-item-0')).tap();

      await waitFor(element(by.id('product-detail-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      // Try to add without selecting options
      await element(by.id('add-to-cart-button')).tap();

      // Should show options required error
      await waitFor(element(by.id('options-required-error')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.short);
    });

    it('should increase quantity with +/- buttons', async () => {
      await navigateToTab('home');
      await element(by.id('featured-product-0')).tap();

      await waitFor(element(by.id('product-detail-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      // Increase quantity
      await element(by.id('quantity-increase')).tap();
      await element(by.id('quantity-increase')).tap();

      await expect(element(by.id('quantity-value'))).toHaveText('3');

      await element(by.id('add-to-cart-button')).tap();

      await waitFor(element(by.id('cart-success-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.short);

      // Cart badge should show 3
      await expect(element(by.id('cart-badge'))).toHaveText('3');
    });
  });

  describe('Cart Management', () => {
    beforeEach(async () => {
      // Add product to cart before each test
      await addProductToCart(0);
      await navigateToTab('cart');
      await waitFor(element(by.id('cart-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should display cart items', async () => {
      await expect(element(by.id('cart-item-0'))).toBeVisible();
      await expect(element(by.id('cart-item-image-0'))).toBeVisible();
      await expect(element(by.id('cart-item-title-0'))).toBeVisible();
      await expect(element(by.id('cart-item-price-0'))).toBeVisible();
      await expect(element(by.id('cart-item-quantity-0'))).toBeVisible();
    });

    it('should update item quantity', async () => {
      await element(by.id('quantity-increase-0')).tap();

      await waitFor(element(by.id('cart-item-quantity-0')))
        .toHaveText('2')
        .withTimeout(TIMEOUTS.short);

      // Total should update
      await expect(element(by.id('cart-total'))).toBeVisible();
    });

    it('should decrease item quantity', async () => {
      // First increase to 2
      await element(by.id('quantity-increase-0')).tap();
      await waitFor(element(by.id('cart-item-quantity-0')))
        .toHaveText('2')
        .withTimeout(TIMEOUTS.short);

      // Then decrease to 1
      await element(by.id('quantity-decrease-0')).tap();
      await waitFor(element(by.id('cart-item-quantity-0')))
        .toHaveText('1')
        .withTimeout(TIMEOUTS.short);
    });

    it('should remove item from cart', async () => {
      await element(by.id('remove-item-0')).tap();

      // Should show confirmation dialog
      await waitFor(element(by.id('confirm-remove-dialog')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.short);

      await element(by.id('confirm-remove-button')).tap();

      // Should show empty cart
      await waitFor(element(by.id('empty-cart-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should swipe to remove item', async () => {
      await element(by.id('cart-item-0')).swipe('left');
      await element(by.id('swipe-delete-0')).tap();

      await waitFor(element(by.id('empty-cart-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should display cart summary', async () => {
      await expect(element(by.id('cart-subtotal'))).toBeVisible();
      await expect(element(by.id('cart-total'))).toBeVisible();
    });

    it('should navigate to product from cart', async () => {
      await element(by.id('cart-item-0')).tap();

      await waitFor(element(by.id('product-detail-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });
  });

  describe('Coupon Codes', () => {
    beforeEach(async () => {
      await addProductToCart(0);
      await navigateToTab('cart');
      await waitFor(element(by.id('cart-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should display coupon input', async () => {
      await expect(element(by.id('coupon-input'))).toBeVisible();
      await expect(element(by.id('apply-coupon-button'))).toBeVisible();
    });

    it('should apply valid coupon code', async () => {
      await element(by.id('coupon-input')).typeText(TEST_COUPONS.valid);
      await element(by.id('apply-coupon-button')).tap();

      await waitFor(element(by.id('coupon-applied-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      // Discount should be visible
      await expect(element(by.id('cart-discount'))).toBeVisible();
    });

    it('should show error for invalid coupon', async () => {
      await element(by.id('coupon-input')).typeText(TEST_COUPONS.invalid);
      await element(by.id('apply-coupon-button')).tap();

      await waitFor(element(by.id('coupon-error-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should remove applied coupon', async () => {
      // Apply coupon first
      await element(by.id('coupon-input')).typeText(TEST_COUPONS.valid);
      await element(by.id('apply-coupon-button')).tap();

      await waitFor(element(by.id('coupon-applied-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      // Remove coupon
      await element(by.id('remove-coupon-button')).tap();

      await waitFor(element(by.id('cart-discount')))
        .not.toBeVisible()
        .withTimeout(TIMEOUTS.short);
    });
  });

  describe('Cart for Logged In Users', () => {
    beforeAll(async () => {
      await device.launchApp({ newInstance: true });
      await login(TEST_USER.email, TEST_USER.password);
    });

    it('should persist cart after app restart', async () => {
      // Add item to cart
      await addProductToCart(0);

      // Get cart item title for verification
      await navigateToTab('cart');
      await waitFor(element(by.id('cart-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      // Restart app
      await device.launchApp({ newInstance: false });

      // Cart should still have item
      await navigateToTab('cart');
      await expect(element(by.id('cart-item-0'))).toBeVisible();
    });

    it('should merge guest cart with user cart on login', async () => {
      // Start fresh
      await device.launchApp({ newInstance: true });

      // Add item as guest
      await addProductToCart(0);

      // Login
      await login(TEST_USER.email, TEST_USER.password);

      // Check cart - should have merged items
      await navigateToTab('cart');
      await expect(element(by.id('cart-item-0'))).toBeVisible();
    });
  });

  describe('Checkout Button', () => {
    beforeEach(async () => {
      await addProductToCart(0);
      await navigateToTab('cart');
      await waitFor(element(by.id('cart-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should display checkout button', async () => {
      await expect(element(by.id('checkout-button'))).toBeVisible();
    });

    it('should navigate to checkout when logged in', async () => {
      await login(TEST_USER.email, TEST_USER.password);
      await navigateToTab('cart');
      await element(by.id('checkout-button')).tap();

      await waitFor(element(by.id('checkout-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should prompt login when guest tries to checkout', async () => {
      await device.launchApp({ newInstance: true });
      await addProductToCart(0);
      await navigateToTab('cart');
      await element(by.id('checkout-button')).tap();

      // Should show login prompt or navigate to login
      await waitFor(element(by.id('login-prompt')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });
  });
});

/**
 * RIDLY Mobile E2E - Smoke Tests
 *
 * Basic visual tests that navigate through the main app screens.
 * These tests verify that the app loads and basic navigation works.
 */

import { by, device, element, expect, waitFor } from 'detox';

describe('App Smoke Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: {
        detoxDisableSynchronization: '1',
      },
    });
    await device.disableSynchronization();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await device.disableSynchronization();
    // Wait for app to fully initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  describe('Home Screen', () => {
    it('should display home screen', async () => {
      // Wait for home screen to load
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(15000);
    });

    it('should display categories section', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(15000);

      // Categories text exists on home screen
      await waitFor(element(by.text('Categories')))
        .toExist()
        .withTimeout(10000);
    });

    it('should display featured products section', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(15000);

      // Featured text exists on home screen
      await waitFor(element(by.text('Featured')))
        .toExist()
        .withTimeout(10000);
    });

    it('should display new arrivals section', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(15000);

      // Scroll down to see new arrivals
      await element(by.id('home-scroll-view')).scroll(400, 'down');

      await waitFor(element(by.id('new-arrivals-section-title')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Tab Navigation', () => {
    it('should navigate to Categories tab', async () => {
      // Wait for app to load
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(15000);

      // Tap on Browse/Categories tab
      await element(by.text('Browse')).tap();

      // Wait for categories screen
      await waitFor(element(by.id('categories-screen')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should navigate to Cart tab', async () => {
      // Wait for app to load
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(15000);

      // Tap on Cart tab
      await element(by.text('Cart')).tap();

      // Wait for cart screen (empty cart)
      await waitFor(element(by.id('cart-screen-empty')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should display empty cart message', async () => {
      // Navigate to Cart
      await element(by.text('Cart')).tap();

      // Wait for empty cart to exist
      await waitFor(element(by.id('cart-screen-empty')))
        .toExist()
        .withTimeout(10000);
    });

    it('should see all tabs exist', async () => {
      // Check Home tab exists
      await expect(element(by.text('Home'))).toExist();

      // Check Browse tab exists
      await expect(element(by.text('Browse'))).toExist();

      // Check Cart tab exists
      await expect(element(by.text('Cart'))).toExist();
    });

    it('should navigate between tabs', async () => {
      // Navigate to Home
      await element(by.text('Home')).tap();

      // Verify home screen is visible
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Categories Screen', () => {
    beforeEach(async () => {
      // Navigate to Categories
      await element(by.text('Browse')).tap();
      await waitFor(element(by.id('categories-screen')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should display search bar', async () => {
      await expect(element(by.id('search-bar-container'))).toExist();
    });

    it('should have search input', async () => {
      await expect(element(by.id('search-input'))).toBeVisible();
    });

    it('should allow typing in search', async () => {
      await element(by.id('search-input')).typeText('shirt');

      // Give time for search debounce
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear search
      await element(by.id('search-input')).clearText();
    });
  });

  describe('Product Browsing', () => {
    it('should display products on home screen', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(15000);

      // Wait for product row to load
      await waitFor(element(by.id('product-row')))
        .toExist()
        .withTimeout(15000);
    });

    it('should tap on first product and see details', async () => {
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(15000);

      // Scroll down a bit to make product visible
      await element(by.id('home-scroll-view')).scroll(300, 'down');

      // Wait for products to load
      await waitFor(element(by.id('product-item-0')))
        .toExist()
        .withTimeout(15000);

      // Scroll up a bit so product is fully visible
      await element(by.id('home-scroll-view')).scroll(200, 'up');

      // Tap on first product using whileElement
      await waitFor(element(by.id('product-item-0')))
        .toBeVisible()
        .whileElement(by.id('home-scroll-view'))
        .scroll(50, 'down');

      await element(by.id('product-item-0')).tap();

      // Wait for product detail screen to load
      await waitFor(element(by.id('product-detail-screen')))
        .toExist()
        .withTimeout(45000);

      // Product name should be visible now (product data loaded)
      await waitFor(element(by.id('product-name')))
        .toExist()
        .withTimeout(30000);

      // Add to cart button should exist
      await waitFor(element(by.id('add-to-cart-button')))
        .toExist()
        .withTimeout(10000);
    });
  });
});

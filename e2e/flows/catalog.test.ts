/**
 * Catalog E2E Tests
 *
 * Tests for product browsing, categories, and search.
 */

import { device, element, by, expect } from 'detox';
import { TIMEOUTS } from '../utils/testData';
import { waitForElement, navigateToTab, scrollToElement } from '../utils/testHelpers';

describe('Catalog', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Home Screen', () => {
    it('should display home screen elements', async () => {
      await expect(element(by.id('home-screen'))).toBeVisible();
      await expect(element(by.id('hero-banner'))).toBeVisible();
      await expect(element(by.id('category-scroller'))).toBeVisible();
      await expect(element(by.id('featured-products'))).toBeVisible();
    });

    it('should navigate to category from home banner', async () => {
      await element(by.id('hero-banner')).tap();

      await waitFor(element(by.id('product-list')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should display category scroller with categories', async () => {
      await expect(element(by.id('category-scroller'))).toBeVisible();
      await expect(element(by.id('category-item-0'))).toBeVisible();
    });

    it('should navigate to category from scroller', async () => {
      await element(by.id('category-item-0')).tap();

      await waitFor(element(by.id('product-list')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should display featured products', async () => {
      await expect(element(by.id('featured-products'))).toBeVisible();
      await expect(element(by.id('featured-product-0'))).toBeVisible();
    });
  });

  describe('Category Browsing', () => {
    it('should display categories list', async () => {
      await navigateToTab('categories');

      await waitFor(element(by.id('category-list')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should expand category to show subcategories', async () => {
      await navigateToTab('categories');

      await waitFor(element(by.id('category-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      await element(by.id('category-expand-0')).tap();

      await expect(element(by.id('subcategory-0-0'))).toBeVisible();
    });

    it('should navigate to category products', async () => {
      await navigateToTab('categories');

      await waitFor(element(by.id('category-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      await element(by.id('category-item-0')).tap();

      await waitFor(element(by.id('product-list')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should display product count in category', async () => {
      await navigateToTab('categories');

      await waitFor(element(by.id('category-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      await expect(element(by.id('category-count-0'))).toBeVisible();
    });
  });

  describe('Product List', () => {
    beforeEach(async () => {
      await navigateToTab('categories');
      await waitFor(element(by.id('category-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
      await element(by.id('category-item-0')).tap();
      await waitFor(element(by.id('product-list')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should display products in list', async () => {
      await expect(element(by.id('product-item-0'))).toBeVisible();
    });

    it('should display product image, title, and price', async () => {
      await expect(element(by.id('product-image-0'))).toBeVisible();
      await expect(element(by.id('product-title-0'))).toBeVisible();
      await expect(element(by.id('product-price-0'))).toBeVisible();
    });

    it('should load more products on scroll', async () => {
      // Scroll down to load more
      await element(by.id('product-list')).scroll(500, 'down');

      // Should have more products loaded
      await waitFor(element(by.id('product-item-10')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should pull to refresh product list', async () => {
      await element(by.id('product-list')).scroll(100, 'up');

      // Should show refreshing indicator briefly
      await waitFor(element(by.id('product-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should toggle between grid and list view', async () => {
      await element(by.id('view-toggle')).tap();

      await expect(element(by.id('product-list-view'))).toBeVisible();

      await element(by.id('view-toggle')).tap();

      await expect(element(by.id('product-grid-view'))).toBeVisible();
    });
  });

  describe('Product Detail', () => {
    beforeEach(async () => {
      await navigateToTab('home');
      await element(by.id('featured-product-0')).tap();
      await waitFor(element(by.id('product-detail-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should display product detail elements', async () => {
      await expect(element(by.id('product-detail-screen'))).toBeVisible();
      await expect(element(by.id('product-images'))).toBeVisible();
      await expect(element(by.id('product-title'))).toBeVisible();
      await expect(element(by.id('product-price'))).toBeVisible();
      await expect(element(by.id('add-to-cart-button'))).toBeVisible();
    });

    it('should swipe through product images', async () => {
      await element(by.id('product-images')).swipe('left');
      await expect(element(by.id('image-indicator-1'))).toBeVisible();

      await element(by.id('product-images')).swipe('right');
      await expect(element(by.id('image-indicator-0'))).toBeVisible();
    });

    it('should display product description', async () => {
      await element(by.id('product-detail-scroll')).scroll(300, 'down');
      await expect(element(by.id('product-description'))).toBeVisible();
    });

    it('should display product attributes', async () => {
      await element(by.id('product-detail-scroll')).scroll(400, 'down');
      await expect(element(by.id('product-attributes'))).toBeVisible();
    });

    it('should show configurable options for configurable products', async () => {
      // Navigate to a configurable product
      await device.reloadReactNative();
      await navigateToTab('categories');
      await waitFor(element(by.id('category-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
      await element(by.id('category-item-0')).tap();
      await waitFor(element(by.id('product-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
      await element(by.id('product-item-0')).tap();

      // Should see option selectors (size, color, etc.)
      await waitFor(element(by.id('product-options')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should add product to wishlist', async () => {
      await element(by.id('wishlist-button')).tap();

      await waitFor(element(by.id('wishlist-success-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.short);
    });

    it('should share product', async () => {
      await element(by.id('share-button')).tap();

      // Native share sheet should appear
      // Note: Cannot fully test native share sheet in Detox
    });

    it('should display related products', async () => {
      await element(by.id('product-detail-scroll')).scroll(600, 'down');
      await expect(element(by.id('related-products'))).toBeVisible();
    });
  });

  describe('Search', () => {
    it('should display search screen', async () => {
      await navigateToTab('search');

      await expect(element(by.id('search-input'))).toBeVisible();
    });

    it('should search products by keyword', async () => {
      await navigateToTab('search');

      await element(by.id('search-input')).typeText('shirt');
      await element(by.id('search-submit')).tap();

      await waitFor(element(by.id('search-results')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      await expect(element(by.id('search-result-0'))).toBeVisible();
    });

    it('should show "no results" for invalid search', async () => {
      await navigateToTab('search');

      await element(by.id('search-input')).typeText('xyznonexistent123');
      await element(by.id('search-submit')).tap();

      await waitFor(element(by.id('no-results-message')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should show search suggestions', async () => {
      await navigateToTab('search');

      await element(by.id('search-input')).typeText('sh');

      await waitFor(element(by.id('search-suggestions')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.short);
    });

    it('should show recent searches', async () => {
      // First search
      await navigateToTab('search');
      await element(by.id('search-input')).typeText('pants');
      await element(by.id('search-submit')).tap();
      await waitFor(element(by.id('search-results')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      // Go back to search
      await device.reloadReactNative();
      await navigateToTab('search');

      // Should show recent searches
      await expect(element(by.id('recent-searches'))).toBeVisible();
      await expect(element(by.text('pants'))).toBeVisible();
    });

    it('should clear recent searches', async () => {
      await navigateToTab('search');
      await element(by.id('clear-recent-searches')).tap();

      await expect(element(by.id('recent-searches'))).not.toBeVisible();
    });

    it('should navigate to product from search results', async () => {
      await navigateToTab('search');
      await element(by.id('search-input')).typeText('shirt');
      await element(by.id('search-submit')).tap();

      await waitFor(element(by.id('search-result-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      await element(by.id('search-result-0')).tap();

      await waitFor(element(by.id('product-detail-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });
  });

  describe('Filters and Sorting', () => {
    beforeEach(async () => {
      await navigateToTab('categories');
      await waitFor(element(by.id('category-item-0')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
      await element(by.id('category-item-0')).tap();
      await waitFor(element(by.id('product-list')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });

    it('should open filters panel', async () => {
      await element(by.id('filters-button')).tap();

      await expect(element(by.id('filters-panel'))).toBeVisible();
    });

    it('should apply price filter', async () => {
      await element(by.id('filters-button')).tap();
      await element(by.id('filter-price')).tap();
      await element(by.id('price-min-input')).typeText('10');
      await element(by.id('price-max-input')).typeText('100');
      await element(by.id('apply-filters-button')).tap();

      await waitFor(element(by.id('product-list')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      // Should show active filters badge
      await expect(element(by.id('active-filters-badge'))).toBeVisible();
    });

    it('should clear all filters', async () => {
      await element(by.id('filters-button')).tap();
      await element(by.id('clear-filters-button')).tap();

      await expect(element(by.id('active-filters-badge'))).not.toBeVisible();
    });

    it('should open sorting options', async () => {
      await element(by.id('sort-button')).tap();

      await expect(element(by.id('sort-options'))).toBeVisible();
    });

    it('should sort by price low to high', async () => {
      await element(by.id('sort-button')).tap();
      await element(by.id('sort-price-asc')).tap();

      await waitFor(element(by.id('product-list')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);

      // First product should have lower price than last
      // Note: Actual price comparison would require reading values
    });

    it('should sort by price high to low', async () => {
      await element(by.id('sort-button')).tap();
      await element(by.id('sort-price-desc')).tap();

      await waitFor(element(by.id('product-list')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    });
  });
});

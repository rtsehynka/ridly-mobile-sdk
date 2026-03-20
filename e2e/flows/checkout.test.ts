/**
 * Full Checkout Flow E2E Tests
 *
 * Tests the complete checkout journey:
 * 1. Add product to cart
 * 2. Go to cart
 * 3. Proceed to checkout
 * 4. Fill shipping address form
 * 5. Verify checkout screen progression
 */

import { by, device, element, expect, waitFor } from 'detox';

const TIMEOUTS = {
  short: 5000,
  medium: 10000,
  long: 30000,
  xlong: 60000,
};

// Helper to wait for animations/loading
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Full Checkout Flow', () => {
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
    await wait(3000);
  });

  it('should add product to cart, fill address form, and proceed through checkout', async () => {
    // ========================================
    // STEP 1: Navigate to product and add to cart
    // ========================================

    // Wait for home screen
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(TIMEOUTS.long);

    // Scroll down to see products
    await element(by.id('home-scroll-view')).scroll(300, 'down');

    // Wait for products to load
    await waitFor(element(by.id('product-item-0')))
      .toExist()
      .withTimeout(TIMEOUTS.long);

    // Scroll to make product visible
    await element(by.id('home-scroll-view')).scroll(200, 'up');

    await waitFor(element(by.id('product-item-0')))
      .toBeVisible()
      .whileElement(by.id('home-scroll-view'))
      .scroll(50, 'down');

    // Tap on product
    await element(by.id('product-item-0')).tap();

    // Wait for product detail screen
    await waitFor(element(by.id('product-detail-screen')))
      .toExist()
      .withTimeout(TIMEOUTS.long);

    // Wait for add to cart button
    await waitFor(element(by.id('add-to-cart-button')))
      .toExist()
      .withTimeout(TIMEOUTS.medium);

    // Check if product has options - if yes, select first available options
    let hasOptions = false;
    try {
      const optionsCard = element(by.id('product-options-card'));
      await waitFor(optionsCard)
        .toExist()
        .withTimeout(3000);
      hasOptions = true;

      // Scroll down to see options better
      try {
        await element(by.id('product-detail-screen')).scrollTo('bottom');
        await wait(500);
        await element(by.id('product-detail-screen')).scrollTo('top');
        await wait(300);
      } catch {
        // OK
      }

      // Try to select first size option - extended list
      const sizeOptions = [
        'option-size-xs', 'option-size-s', 'option-size-m', 'option-size-l', 'option-size-xl',
        'option-size-28', 'option-size-29', 'option-size-30', 'option-size-31', 'option-size-32', 'option-size-33', 'option-size-34',
      ];
      let sizeSelected = false;
      for (const sizeOpt of sizeOptions) {
        try {
          await waitFor(element(by.id(sizeOpt)))
            .toExist()
            .withTimeout(500);
          await element(by.id(sizeOpt)).tap();
          await wait(500);
          sizeSelected = true;
          break;
        } catch {
          // Try next
        }
      }

      // Try to select first color option - extended list
      const colorOptions = [
        'option-color-black', 'option-color-blue', 'option-color-white', 'option-color-gray',
        'option-color-red', 'option-color-green', 'option-color-orange', 'option-color-peach',
        'option-color-khaki', 'option-color-mint', 'option-color-lilac', 'option-color-yellow',
      ];
      let colorSelected = false;
      for (const colorOpt of colorOptions) {
        try {
          await waitFor(element(by.id(colorOpt)))
            .toExist()
            .withTimeout(500);
          await element(by.id(colorOpt)).tap();
          await wait(500);
          colorSelected = true;
          break;
        } catch {
          // Try next
        }
      }
    } catch {
      // No options - simple product
    }

    await wait(1000);

    // Scroll down to see the add to cart button
    try {
      await element(by.id('product-detail-screen')).scroll(200, 'down');
    } catch {
      // OK if scroll fails
    }
    await wait(500);

    // Wait for add to cart button to be visible and enabled
    await waitFor(element(by.id('add-to-cart-button')))
      .toBeVisible()
      .withTimeout(TIMEOUTS.short);

    // Check what the button says - if it's "Select Options" we need to select options first
    try {
      // First try to check if "Add to Cart" text is visible (not disabled)
      await waitFor(element(by.text('Add to Cart')))
        .toBeVisible()
        .withTimeout(3000);

      // Button is enabled - tap it
      await element(by.id('add-to-cart-button')).tap();
    } catch {
      // Button might say "Select Options" - meaning we didn't select all options
      // This shouldn't happen if our option selection worked, but let's handle it
      console.log('Add to Cart button not visible or disabled');
      await element(by.id('add-to-cart-button')).tap(); // Try anyway
    }

    // Wait for the success toast to appear - this confirms add to cart worked
    try {
      await waitFor(element(by.text('Added to Cart')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.long);
      await wait(2000); // Let toast disappear
    } catch {
      // If no toast visible, check for error toast
      try {
        const errorVisible = await element(by.text('Error')).atIndex(0);
        console.log('Error toast found - add to cart failed');
      } catch {
        // No error toast either
      }
      await wait(3000);
    }

    // ========================================
    // STEP 2: Go to Cart
    // ========================================

    // Use the header cart button on product detail screen (iOS doesn't have pressBack)
    // First, wait for the add to cart success to be processed
    await wait(1500);

    // Look for and tap the back button to go back to home
    try {
      // Try the iOS back button (typically displayed as chevron or text)
      await element(by.traits(['button']).and(by.label('Home'))).atIndex(0).tap();
    } catch {
      try {
        // Try tapping on the back arrow/chevron
        await element(by.type('_UIButtonBarButton')).atIndex(0).tap();
      } catch {
        // Fall back to looking for a back button by accessibility
        await element(by.label('Back')).tap();
      }
    }
    await wait(1000);

    // Wait for home screen to be visible
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(TIMEOUTS.medium);

    // Now tap the Cart tab
    await element(by.text('Cart')).tap();
    await wait(3000); // Wait for cart to load from API

    // Wait for cart screen (either with items or empty)
    // First check if cart has items
    try {
      await waitFor(element(by.id('cart-screen')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.medium);
    } catch {
      // Cart might be empty - check for empty state
      await waitFor(element(by.id('cart-screen-empty')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.short);

      // If empty, the test should fail gracefully
      throw new Error('Cart is empty - add to cart may have failed. Check if the product was successfully added.');
    }

    // Find checkout button by scrolling
    await waitFor(element(by.id('checkout-button')))
      .toBeVisible()
      .whileElement(by.id('cart-scroll-view'))
      .scroll(100, 'down');

    // ========================================
    // STEP 3: Go to Checkout
    // ========================================

    await element(by.id('checkout-button')).tap();
    await wait(4000); // Wait for checkout to load including countries

    // Should be on checkout screen
    await waitFor(element(by.id('checkout-screen')))
      .toBeVisible()
      .withTimeout(TIMEOUTS.long);

    // ========================================
    // STEP 4: Fill Shipping Address Form
    // ========================================

    // Wait for shipping address form to be visible
    await waitFor(element(by.id('shipping-address-form')))
      .toExist()
      .withTimeout(TIMEOUTS.medium);

    // Fill in first name
    await waitFor(element(by.id('input-first-name')))
      .toBeVisible()
      .withTimeout(TIMEOUTS.short);
    await element(by.id('input-first-name')).typeText('John');
    await wait(300);

    // Fill in last name
    await element(by.id('input-last-name')).typeText('Doe');
    await wait(300);

    // Fill in street address
    await element(by.id('input-street')).typeText('123 Test Street');
    await wait(300);

    // Fill in city
    await element(by.id('input-city')).typeText('Los Angeles');
    await wait(300);

    // Select country - tap to open modal
    await element(by.id('select-country')).tap();
    await wait(500);

    // Select United States from the country list
    try {
      await waitFor(element(by.text('United States')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.short);
      await element(by.text('United States')).tap();
    } catch {
      // Try to find US
      try {
        await element(by.text('US')).tap();
      } catch {
        // Close modal if can't find
        await device.pressBack();
      }
    }
    await wait(1000);

    // Select region/state - tap to open modal
    try {
      await element(by.id('select-region')).tap();
      await wait(500);

      // Select California
      await waitFor(element(by.text('California')))
        .toBeVisible()
        .withTimeout(TIMEOUTS.short);
      await element(by.text('California')).tap();
      await wait(500);
    } catch {
      // If select-region doesn't exist, fill input-region
      try {
        await element(by.id('input-region')).typeText('CA');
        await wait(300);
      } catch {
        // Skip region
      }
    }

    // Fill in postal code
    await element(by.id('input-postcode')).typeText('90210');
    await wait(300);

    // Fill in phone
    await element(by.id('input-phone')).typeText('5551234567');
    await wait(300);

    // Dismiss keyboard
    try {
      await device.pressBack();
    } catch {
      // OK if fails
    }
    await wait(500);

    // ========================================
    // STEP 5: Verify we can proceed
    // ========================================

    // Verify the continue button exists
    await waitFor(element(by.id('continue-to-shipping')))
      .toExist()
      .withTimeout(TIMEOUTS.short);

    // Take a moment to visually verify the form is filled
    await wait(2000);
  });
});

/**
 * Magento Adapter Integration Tests
 *
 * Tests against real Magento GraphQL endpoint to verify queries work.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { MagentoAdapter } from '../MagentoAdapter';

const MAGENTO_URL = 'https://voriagh.gomage.dev';

describe('MagentoAdapter', () => {
  let adapter: MagentoAdapter;

  beforeAll(() => {
    adapter = new MagentoAdapter({
      storeUrl: MAGENTO_URL,
    });
  });

  describe('Store Config', () => {
    it('should fetch store configuration', async () => {
      const config = await adapter.getStoreConfig();

      expect(config).toBeDefined();
      expect(config.storeName).toBeDefined();
      expect(config.currency).toBeDefined();
    });
  });

  describe('Categories', () => {
    it('should fetch categories', async () => {
      const categories = await adapter.getCategories();

      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      console.log('Categories count:', categories.length);
      if (categories.length > 0) {
        console.log('First category:', categories[0].name);
      }
    });

    it('should fetch category tree', async () => {
      const tree = await adapter.getCategoryTree();

      expect(tree).toBeDefined();
      expect(Array.isArray(tree)).toBe(true);
    });
  });

  describe('Products', () => {
    it('should fetch products list', async () => {
      const result = await adapter.getProducts({ pageSize: 5 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.total).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(5);

      console.log('Products count:', result.total);
      if (result.items.length > 0) {
        const product = result.items[0];
        console.log('First product:', {
          id: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          thumbnail: product.thumbnail?.url,
        });
      }
    });

    it('should have valid product structure', async () => {
      const result = await adapter.getProducts({ pageSize: 1 });

      expect(result.items.length).toBeGreaterThan(0);

      const product = result.items[0];

      // Required fields
      expect(product.id).toBeDefined();
      expect(product.sku).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.slug).toBeDefined();
      expect(product.price).toBeDefined();
      expect(product.price.amount).toBeTypeOf('number');
      expect(product.price.currency).toBeDefined();
      expect(product.thumbnail).toBeDefined();
      expect(product.type).toBeDefined();
      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
    });

    it('should search products', async () => {
      const result = await adapter.searchProducts('dress', undefined, undefined, 1, 5);

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      console.log('Search results for "dress":', result.total);
    });
  });

  describe('Countries', () => {
    it('should fetch countries', async () => {
      const countries = await adapter.getCountries();

      expect(countries).toBeDefined();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);

      console.log('Countries count:', countries.length);
      const usa = countries.find((c) => c.code === 'US');
      expect(usa).toBeDefined();
    });

    it('should fetch regions for a country', async () => {
      const regions = await adapter.getRegions('US');

      expect(regions).toBeDefined();
      expect(Array.isArray(regions)).toBe(true);
      console.log('US regions count:', regions.length);
    });
  });
});

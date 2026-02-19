/**
 * Simple API test script to verify Magento GraphQL queries
 * Run with: node test-api.mjs
 */

const MAGENTO_URL = 'https://voriagh.gomage.dev/graphql';

async function query(queryString, variables = {}) {
  const response = await fetch(MAGENTO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: queryString,
      variables,
    }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2));
    throw new Error('GraphQL query failed');
  }

  return data.data;
}

// Test 1: Store Config
async function testStoreConfig() {
  console.log('\n=== Testing Store Config ===');

  const result = await query(`
    query StoreConfig {
      storeConfig {
        store_code
        store_name
        base_url
        base_currency_code
        default_display_currency_code
        locale
      }
    }
  `);

  console.log('Store Name:', result.storeConfig.store_name);
  console.log('Currency:', result.storeConfig.default_display_currency_code);
  console.log('✅ Store Config: OK');
}

// Test 2: Categories
async function testCategories() {
  console.log('\n=== Testing Categories ===');

  const result = await query(`
    query Categories {
      categories {
        items {
          uid
          name
          url_key
          level
          product_count
        }
      }
    }
  `);

  console.log('Categories found:', result.categories.items.length);
  if (result.categories.items.length > 0) {
    console.log('First category:', result.categories.items[0].name);
  }
  console.log('✅ Categories: OK');
}

// Test 3: Products - Magento requires 'search' or 'filter' parameter
async function testProducts() {
  console.log('\n=== Testing Products ===');

  // Magento requires search or filter - use empty search to get all products
  const result = await query(`
    query Products {
      products(search: "", pageSize: 5, currentPage: 1) {
        total_count
        items {
          uid
          sku
          name
          url_key
          __typename
          small_image {
            url
            label
          }
          price_range {
            minimum_price {
              regular_price {
                value
                currency
              }
              final_price {
                value
                currency
              }
              discount {
                amount_off
                percent_off
              }
            }
          }
        }
      }
    }
  `);

  console.log('Total products:', result.products.total_count);
  console.log('Products in response:', result.products.items.length);

  if (result.products.items.length > 0) {
    const product = result.products.items[0];
    console.log('First product:', {
      uid: product.uid,
      sku: product.sku,
      name: product.name,
      price: product.price_range?.minimum_price?.final_price?.value,
      currency: product.price_range?.minimum_price?.final_price?.currency,
    });
  }

  console.log('✅ Products: OK');
}

// Test 4: Check available fields on ProductInterface
async function testProductIntrospection() {
  console.log('\n=== Testing Product Schema ===');

  const result = await query(`
    query IntrospectProduct {
      __type(name: "ProductInterface") {
        name
        fields {
          name
          type {
            name
            kind
          }
        }
      }
    }
  `);

  const stockField = result.__type.fields.find(f => f.name === 'stock_status');
  console.log('Has stock_status field:', stockField ? 'YES' : 'NO');

  // Find price-related fields
  const priceFields = result.__type.fields.filter(f =>
    f.name.includes('price') || f.name.includes('Price')
  );
  console.log('Price fields:', priceFields.map(f => f.name).join(', '));

  console.log('✅ Schema introspection: OK');
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Magento API Tests...');
  console.log('URL:', MAGENTO_URL);

  try {
    await testStoreConfig();
    await testCategories();
    await testProductIntrospection();
    await testProducts();

    console.log('\n✅✅✅ All tests passed! ✅✅✅\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();

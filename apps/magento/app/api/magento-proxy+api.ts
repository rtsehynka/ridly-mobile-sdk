/**
 * Magento GraphQL Proxy API Route
 *
 * Handles CORS issues for web by proxying requests to Magento.
 * Works with both Expo dev server and production builds.
 */

import config from '../../ridly.mobile.config.json';

const MAGENTO_URL = `${config.store.url}/graphql`;

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.text();

    // Forward headers we care about
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward store code if present
    const storeHeader = request.headers.get('Store');
    if (storeHeader) {
      headers['Store'] = storeHeader;
    }

    // Forward authorization if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log('[Proxy] Forwarding to:', MAGENTO_URL);

    const response = await fetch(MAGENTO_URL, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return new Response(
      JSON.stringify({ errors: [{ message: 'Proxy error' }] }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Store',
      'Access-Control-Max-Age': '86400',
    },
  });
}

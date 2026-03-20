/**
 * Algolia Search Plugin
 *
 * Product search powered by Algolia.
 * Provides fast, typo-tolerant search with faceting.
 */

import type {
  SearchPlugin,
  SearchOptions,
  SearchResult,
  SearchFacet,
  PluginConfig,
} from '@ridly/mobile-core';
import { createPlugin } from '@ridly/mobile-core';

/**
 * Algolia configuration
 */
export interface AlgoliaConfig extends PluginConfig {
  /** Algolia Application ID */
  appId: string;
  /** Algolia Search API Key (public) */
  apiKey: string;
  /** Index name for products */
  indexName: string;
  /** Facet attributes to retrieve */
  facetAttributes?: string[];
  /** Attributes to retrieve */
  attributesToRetrieve?: string[];
  /** Attributes to highlight */
  attributesToHighlight?: string[];
}

/**
 * Algolia hit structure
 */
interface AlgoliaHit {
  objectID: string;
  [key: string]: unknown;
}

/**
 * Algolia search response
 */
interface AlgoliaSearchResponse {
  hits: AlgoliaHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  facets?: Record<string, Record<string, number>>;
  query: string;
}

/**
 * Create Algolia Search Plugin
 */
export function createAlgoliaSearchPlugin(): SearchPlugin {
  let config: AlgoliaConfig | null = null;
  let searchClient: AlgoliaSearchClient | null = null;

  const plugin = createPlugin<SearchPlugin>({
    metadata: {
      id: 'algolia-search',
      name: 'Algolia Search',
      version: '1.0.0',
      category: 'search',
      description: 'Fast product search powered by Algolia',
      author: 'RIDLY',
      platforms: ['any'],
      isPremium: true,
    },

    isActive: false,

    async initialize(cfg?: PluginConfig): Promise<void> {
      config = cfg as AlgoliaConfig;

      if (!config?.appId || !config?.apiKey || !config?.indexName) {
        throw new Error('[Algolia] Missing required configuration: appId, apiKey, indexName');
      }

      searchClient = createAlgoliaClient(config.appId, config.apiKey);
      console.log('[Algolia] Initialized with index:', config.indexName);
    },

    async cleanup(): Promise<void> {
      searchClient = null;
      console.log('[Algolia] Cleaned up');
    },

    async search(query: string, options?: SearchOptions): Promise<SearchResult> {
      if (!config || !searchClient) {
        throw new Error('[Algolia] Plugin not initialized');
      }

      const {
        page = 1,
        pageSize = 20,
        filters = {},
        sort,
        categoryId,
      } = options || {};

      // Build Algolia search parameters
      const searchParams: Record<string, unknown> = {
        query,
        page: page - 1, // Algolia uses 0-based pages
        hitsPerPage: pageSize,
        facets: config.facetAttributes || ['*'],
      };

      if (config.attributesToRetrieve) {
        searchParams.attributesToRetrieve = config.attributesToRetrieve;
      }

      if (config.attributesToHighlight) {
        searchParams.attributesToHighlight = config.attributesToHighlight;
      }

      // Build filter string
      const filterParts: string[] = [];

      if (categoryId) {
        filterParts.push(`category_ids:${categoryId}`);
      }

      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          const orFilters = value.map(v => `${key}:${v}`).join(' OR ');
          filterParts.push(`(${orFilters})`);
        } else {
          filterParts.push(`${key}:${value}`);
        }
      }

      if (filterParts.length > 0) {
        searchParams.filters = filterParts.join(' AND ');
      }

      // Handle sorting
      if (sort) {
        // Algolia uses replica indices for sorting
        // Convention: indexName_sort_field_direction
        const sortIndex = `${config.indexName}_${sort.field}_${sort.direction}`;
        searchParams.index = sortIndex;
      }

      try {
        const response = await searchClient.search<AlgoliaSearchResponse>(
          config.indexName,
          searchParams
        );

        // Transform facets
        const facets: SearchFacet[] = [];
        if (response.facets) {
          for (const [field, values] of Object.entries(response.facets)) {
            facets.push({
              field,
              label: formatFacetLabel(field),
              values: Object.entries(values).map(([value, count]) => ({
                value,
                label: value,
                count,
              })),
            });
          }
        }

        return {
          items: response.hits,
          totalCount: response.nbHits,
          facets,
        };
      } catch (error) {
        console.error('[Algolia] Search error:', error);
        throw error;
      }
    },

    async suggest(query: string, limit = 5): Promise<string[]> {
      if (!config || !searchClient) {
        return [];
      }

      try {
        const response = await searchClient.search<AlgoliaSearchResponse>(
          config.indexName,
          {
            query,
            hitsPerPage: limit,
            attributesToRetrieve: ['name', 'title'],
            attributesToHighlight: [],
          }
        );

        // Extract suggestions from hits
        return response.hits
          .map(hit => (hit.name || hit.title || '') as string)
          .filter(Boolean);
      } catch (error) {
        console.error('[Algolia] Suggest error:', error);
        return [];
      }
    },

    async indexProducts(products: unknown[]): Promise<void> {
      // This would require the Admin API key (server-side only)
      console.warn('[Algolia] indexProducts should be called from server-side');
    },
  });

  return plugin;
}

/**
 * Simple Algolia search client
 */
interface AlgoliaSearchClient {
  search<T>(indexName: string, params: Record<string, unknown>): Promise<T>;
}

function createAlgoliaClient(appId: string, apiKey: string): AlgoliaSearchClient {
  const baseUrl = `https://${appId}-dsn.algolia.net`;

  return {
    async search<T>(indexName: string, params: Record<string, unknown>): Promise<T> {
      const response = await fetch(`${baseUrl}/1/indexes/${indexName}/query`, {
        method: 'POST',
        headers: {
          'X-Algolia-Application-Id': appId,
          'X-Algolia-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Algolia request failed: ${response.status}`);
      }

      return response.json();
    },
  };
}

/**
 * Format facet field name to human-readable label
 */
function formatFacetLabel(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Default export
 */
export default createAlgoliaSearchPlugin;

/**
 * Magento GraphQL Client
 */

import { GraphQLClient } from 'graphql-request';

export interface MagentoClientConfig {
  storeUrl: string;
  storeCode?: string;
}

/**
 * Creates a configured GraphQL client for Magento
 */
export function createMagentoClient(config: MagentoClientConfig): GraphQLClient {
  const endpoint = `${config.storeUrl}/graphql`;

  const client = new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...(config.storeCode && { Store: config.storeCode }),
    },
  });

  return client;
}

/**
 * Magento GraphQL client wrapper with auth support
 */
export class MagentoGraphQLClient {
  private client: GraphQLClient;
  private authToken: string | null = null;

  constructor(private config: MagentoClientConfig) {
    this.client = createMagentoClient(config);
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
    this.updateHeaders();
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Update client headers with current auth state
   */
  private updateHeaders(): void {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.storeCode) {
      headers['Store'] = this.config.storeCode;
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    this.client.setHeaders(headers);
  }

  /**
   * Execute GraphQL query
   */
  async query<T>(
    document: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    return this.client.request<T>(document, variables);
  }

  /**
   * Execute GraphQL mutation
   */
  async mutate<T>(
    document: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    return this.client.request<T>(document, variables);
  }
}

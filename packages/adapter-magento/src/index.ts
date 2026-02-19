/**
 * @ridly/mobile-adapter-magento
 *
 * Magento 2 / Adobe Commerce adapter for RIDLY Mobile SDK.
 * Implements the ECommerceAdapter interface using Magento's GraphQL API.
 */

export { MagentoAdapter, type MagentoAdapterConfig } from './MagentoAdapter';
export { MagentoGraphQLClient, createMagentoClient, type MagentoClientConfig } from './client';

// GraphQL queries and fragments
export * from './graphql';

// Data transformers
export * from './transformers';

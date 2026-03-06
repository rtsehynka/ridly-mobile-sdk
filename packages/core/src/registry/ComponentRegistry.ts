/**
 * ComponentRegistry - Style override registration system
 *
 * Allows themes to register style overrides for core components
 * without replacing the entire component.
 */

import { create } from 'zustand';
import type { ThemeTokens } from '../types';

// Style override function type
export type StyleOverride<TProps = any, TStyles = any> = (
  theme: ThemeTokens,
  props: TProps
) => Partial<TStyles>;

interface ComponentRegistryState {
  overrides: Map<string, StyleOverride>;

  // Register a style override for a component
  register: (componentId: string, override: StyleOverride) => void;

  // Get style override for a component
  get: (componentId: string) => StyleOverride | undefined;

  // Clear all overrides (used when theme changes)
  clear: () => void;

  // Check if component has override
  has: (componentId: string) => boolean;
}

export const useComponentRegistry = create<ComponentRegistryState>((set, get) => ({
  overrides: new Map(),

  register: (componentId, override) => {
    set((state) => {
      const newOverrides = new Map(state.overrides);
      newOverrides.set(componentId, override);
      return { overrides: newOverrides };
    });
  },

  get: (componentId) => {
    return get().overrides.get(componentId);
  },

  clear: () => {
    set({ overrides: new Map() });
  },

  has: (componentId) => {
    return get().overrides.has(componentId);
  },
}));

// Component IDs for style overrides
export const COMPONENT_IDS = {
  // UI Components
  Button: 'Button',
  Card: 'Card',
  Input: 'Input',
  Badge: 'Badge',
  Price: 'Price',
  Text: 'Text',

  // Product Components
  ProductCard: 'ProductCard',
  ProductGrid: 'ProductGrid',
  ProductGallery: 'ProductGallery',

  // Category Components
  CategoryCard: 'CategoryCard',
  CategoryList: 'CategoryList',

  // Cart Components
  CartItem: 'CartItem',
  CartSummary: 'CartSummary',
  QuantitySelector: 'QuantitySelector',

  // Home Components
  HeroBanner: 'HeroBanner',
  FeaturedSection: 'FeaturedSection',
  CategoryScroller: 'CategoryScroller',

  // Layout Components
  Header: 'Header',
  TabBar: 'TabBar',
  SearchBar: 'SearchBar',
} as const;

export type ComponentId = typeof COMPONENT_IDS[keyof typeof COMPONENT_IDS];

/**
 * Theme Package Types
 *
 * Defines the contract for premium theme packages.
 */

import type { ComponentType } from 'react';
import type { ThemeTokens } from './theme';
import type { StyleOverride, ComponentId } from '../registry/ComponentRegistry';
import type { SlotId } from '../slots/slots';

/**
 * Screen component that themes can provide
 */
export interface ThemeScreen {
  name: string;
  component: ComponentType<any>;
  options?: Record<string, any>;
}

/**
 * Slot content registration
 */
export interface ThemeSlotContent {
  slotId: SlotId;
  component: ComponentType<any>;
  priority?: number;
  props?: Record<string, any>;
}

/**
 * Theme context passed to lifecycle hooks
 */
export interface ThemeContext {
  theme: ThemeTokens;
  isDarkMode: boolean;
}

/**
 * Main theme package interface
 *
 * All premium themes must export an object implementing this interface.
 *
 * @example
 * ```typescript
 * const myTheme: RidlyThemePackage = {
 *   id: 'my-fashion-theme',
 *   name: 'My Fashion Theme',
 *   version: '1.0.0',
 *   tokens: {
 *     light: lightTokens,
 *     dark: darkTokens,
 *   },
 *   styleOverrides: {
 *     Button: (theme, props) => ({
 *       container: { borderRadius: 24 },
 *     }),
 *   },
 *   slots: [
 *     { slotId: 'home.hero', component: HeroBanner },
 *   ],
 * };
 * ```
 */
export interface RidlyThemePackage {
  /** Unique theme identifier */
  id: string;

  /** Display name */
  name: string;

  /** Theme version (semver) */
  version: string;

  /** Theme description */
  description?: string;

  /** Theme author */
  author?: string;

  /**
   * Theme tokens for light and dark modes
   */
  tokens: {
    light: ThemeTokens;
    dark: ThemeTokens;
  };

  /**
   * Style overrides for core components
   *
   * Each override receives theme tokens and component props,
   * and returns partial styles to merge with base styles.
   */
  styleOverrides?: Partial<Record<ComponentId, StyleOverride>>;

  /**
   * Slot content to inject into predefined locations
   */
  slots?: ThemeSlotContent[];

  /**
   * Custom screens to register (optional)
   */
  screens?: ThemeScreen[];

  /**
   * Called when theme is activated
   */
  onActivate?: (context: ThemeContext) => void | Promise<void>;

  /**
   * Called when theme is deactivated
   */
  onDeactivate?: (context: ThemeContext) => void | Promise<void>;

  /**
   * Assets/resources the theme provides
   */
  assets?: {
    logo?: any;
    splash?: any;
    fonts?: string[];
  };
}

/**
 * Helper type for creating style overrides with proper typing
 */
export type CreateStyleOverride<TProps, TStyles> = (
  theme: ThemeTokens,
  props: TProps
) => Partial<TStyles>;

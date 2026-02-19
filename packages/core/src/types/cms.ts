/**
 * CMS types for RIDLY Mobile SDK
 */

import type { Image } from './common';

/**
 * CMS Page
 */
export interface CmsPage {
  id: string;
  identifier: string;
  title: string;
  content: string; // HTML content
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

/**
 * CMS Block (reusable content block)
 */
export interface CmsBlock {
  id: string;
  identifier: string;
  title: string;
  content: string; // HTML content
}

/**
 * Banner for home screen slider
 */
export interface Banner {
  id: string;
  image: Image;
  mobileImage?: Image;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  link?: string; // Deep link: "product/123", "category/456", "https://..."
  position: number;
  isActive: boolean;
}

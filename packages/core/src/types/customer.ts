/**
 * Customer types for RIDLY Mobile SDK
 */

/**
 * Customer address
 */
export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  street: string[];
  city: string;
  region?: string;
  regionCode?: string;
  postcode: string;
  countryCode: string; // ISO 3166-1 alpha-2
  phone?: string;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
}

/**
 * Address input (without id)
 */
export type AddressInput = Omit<Address, 'id' | 'isDefaultBilling' | 'isDefaultShipping'> & {
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
};

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // Unix timestamp
  tokenType?: string;
}

/**
 * Customer entity
 */
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  addresses: Address[];
  defaultBillingAddressId?: string;
  defaultShippingAddressId?: string;
  isSubscribedToNewsletter: boolean;
  createdAt: string;
}

/**
 * Customer registration input
 */
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isSubscribedToNewsletter?: boolean;
}

/**
 * Customer update input
 */
export interface CustomerUpdateInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  isSubscribedToNewsletter?: boolean;
}

/**
 * Password change input
 */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

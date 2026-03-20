/**
 * RIDLY Luxe Theme - Screens
 *
 * Premium theme screens that extend or replace core screens.
 * All screens are platform-agnostic and work with any backend.
 */

// Auth screens (to be implemented)
// export * from './auth';

// Order screens (to be implemented)
// export * from './orders';

// Profile screens (to be implemented)
// export * from './profile';

// Settings screens (to be implemented)
// export * from './settings';

/**
 * Screen registry for theme
 * Maps screen names to components
 */
export const themeScreens = {
  // Auth
  // 'auth/login': LoginScreen,
  // 'auth/register': RegisterScreen,
  // 'auth/forgot-password': ForgotPasswordScreen,

  // Orders
  // 'orders/list': OrderListScreen,
  // 'orders/detail': OrderDetailScreen,

  // Profile
  // 'profile/edit': EditProfileScreen,
  // 'profile/addresses': AddressBookScreen,

  // Settings
  // 'settings/index': SettingsScreen,
  // 'settings/notifications': NotificationSettingsScreen,
};

export type ThemeScreenName = keyof typeof themeScreens;

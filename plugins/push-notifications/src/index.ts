/**
 * Push Notifications Plugin
 *
 * Push notifications using Expo Notifications.
 * Handles permission requests, token management, and notification display.
 */

import type {
  NotificationsPlugin,
  NotificationHandler,
  PushNotification,
  LocalNotification,
  PluginConfig,
} from '@ridly/mobile-core';
import { createPlugin } from '@ridly/mobile-core';

/**
 * Device registration endpoint configuration
 */
export interface DeviceRegistrationConfig {
  /** Backend endpoint URL for device registration */
  registrationUrl: string;
  /** HTTP method (default: POST) */
  method?: 'POST' | 'PUT';
  /** Additional headers */
  headers?: Record<string, string>;
  /** Custom body transformer */
  transformBody?: (token: string, deviceInfo: DeviceInfo) => Record<string, unknown>;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'unknown';
  deviceId?: string;
  appVersion?: string;
  osVersion?: string;
  locale?: string;
}

/**
 * Push Notifications configuration
 */
export interface PushNotificationsConfig extends PluginConfig {
  /** Android notification channel ID */
  androidChannelId?: string;
  /** Android notification channel name */
  androidChannelName?: string;
  /** Android notification icon */
  androidIcon?: string;
  /** Android notification color */
  androidColor?: string;
  /** iOS sound */
  iosSound?: string;
  /** Device registration configuration */
  deviceRegistration?: DeviceRegistrationConfig;
  /** Auth token getter for authenticated requests */
  getAuthToken?: () => Promise<string | null>;
}

/**
 * Create Push Notifications Plugin
 */
export function createPushNotificationsPlugin(): NotificationsPlugin {
  let config: PushNotificationsConfig | null = null;
  let notificationToken: string | null = null;
  let notificationReceivedHandler: NotificationHandler | null = null;
  let notificationTappedHandler: NotificationHandler | null = null;
  let notificationSubscription: { remove: () => void } | null = null;
  let responseSubscription: { remove: () => void } | null = null;

  const plugin = createPlugin<NotificationsPlugin>({
    metadata: {
      id: 'push-notifications',
      name: 'Push Notifications',
      version: '1.0.0',
      category: 'notifications',
      description: 'Push notifications for mobile apps',
      author: 'RIDLY',
      platforms: ['any'],
      permissions: ['notifications'],
    },

    isActive: false,

    async initialize(cfg?: PluginConfig): Promise<void> {
      config = (cfg as PushNotificationsConfig) || {};

      try {
        const Notifications = await import('expo-notifications');
        const Device = await import('expo-device');

        // Set notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        // Create Android channel
        if (Device.osName === 'Android' || Device.osName === 'android') {
          await Notifications.setNotificationChannelAsync(
            config.androidChannelId || 'default',
            {
              name: config.androidChannelName || 'Default',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: config.androidColor || '#FF231F7C',
            }
          );
        }

        // Subscribe to notifications
        notificationSubscription = Notifications.addNotificationReceivedListener(
          (notification) => {
            const pushNotification: PushNotification = {
              id: notification.request.identifier,
              title: notification.request.content.title || '',
              body: notification.request.content.body || '',
              data: notification.request.content.data as Record<string, unknown>,
            };
            notificationReceivedHandler?.(pushNotification);
          }
        );

        // Subscribe to notification responses
        responseSubscription = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            const notification = response.notification;
            const pushNotification: PushNotification = {
              id: notification.request.identifier,
              title: notification.request.content.title || '',
              body: notification.request.content.body || '',
              data: notification.request.content.data as Record<string, unknown>,
            };
            notificationTappedHandler?.(pushNotification);
          }
        );

        console.log('[PushNotifications] Initialized');
      } catch (error) {
        console.error('[PushNotifications] Failed to initialize:', error);
        throw error;
      }
    },

    async cleanup(): Promise<void> {
      notificationSubscription?.remove();
      responseSubscription?.remove();
      notificationSubscription = null;
      responseSubscription = null;
      notificationToken = null;
      console.log('[PushNotifications] Cleaned up');
    },

    async requestPermissions(): Promise<boolean> {
      try {
        const Notifications = await import('expo-notifications');
        const Device = await import('expo-device');

        if (!Device.isDevice) {
          console.warn('[PushNotifications] Must use physical device for Push Notifications');
          return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('[PushNotifications] Permission not granted');
          return false;
        }

        // Get push token
        const tokenData = await Notifications.getExpoPushTokenAsync();
        notificationToken = tokenData.data;
        console.log('[PushNotifications] Token:', notificationToken);

        return true;
      } catch (error) {
        console.error('[PushNotifications] Permission error:', error);
        return false;
      }
    },

    async isEnabled(): Promise<boolean> {
      try {
        const Notifications = await import('expo-notifications');
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
      } catch {
        return false;
      }
    },

    async getToken(): Promise<string | null> {
      if (notificationToken) {
        return notificationToken;
      }

      try {
        const Notifications = await import('expo-notifications');
        const tokenData = await Notifications.getExpoPushTokenAsync();
        notificationToken = tokenData.data;
        return notificationToken;
      } catch {
        return null;
      }
    },

    async registerDevice(token: string): Promise<void> {
      if (!config?.deviceRegistration?.registrationUrl) {
        console.warn('[PushNotifications] No registration URL configured, skipping device registration');
        return;
      }

      try {
        const Device = await import('expo-device');
        const Application = await import('expo-application');
        const Localization = await import('expo-localization');

        // Gather device information
        const deviceInfo: DeviceInfo = {
          platform: Device.osName?.toLowerCase() === 'ios' ? 'ios' :
                    Device.osName?.toLowerCase() === 'android' ? 'android' : 'unknown',
          deviceId: await Application.getIosIdForVendorAsync() || Device.modelId || undefined,
          appVersion: Application.nativeApplicationVersion || undefined,
          osVersion: Device.osVersion || undefined,
          locale: Localization.locale,
        };

        // Build request body
        const defaultBody = {
          token,
          platform: deviceInfo.platform,
          device_id: deviceInfo.deviceId,
          app_version: deviceInfo.appVersion,
          os_version: deviceInfo.osVersion,
          locale: deviceInfo.locale,
          timestamp: new Date().toISOString(),
        };

        const body = config.deviceRegistration.transformBody
          ? config.deviceRegistration.transformBody(token, deviceInfo)
          : defaultBody;

        // Build headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...config.deviceRegistration.headers,
        };

        // Add auth token if available
        if (config.getAuthToken) {
          const authToken = await config.getAuthToken();
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }
        }

        // Send registration request
        const response = await fetch(config.deviceRegistration.registrationUrl, {
          method: config.deviceRegistration.method || 'POST',
          headers,
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Device registration failed: ${response.status} - ${errorText}`);
        }

        console.log('[PushNotifications] Device registered successfully');
      } catch (error) {
        console.error('[PushNotifications] Device registration error:', error);
        throw error;
      }
    },

    onNotificationReceived(handler: NotificationHandler): void {
      notificationReceivedHandler = handler;
    },

    onNotificationTapped(handler: NotificationHandler): void {
      notificationTappedHandler = handler;
    },

    async scheduleLocal(notification: LocalNotification): Promise<string> {
      try {
        const Notifications = await import('expo-notifications');

        let trigger: unknown = null;

        if (notification.triggerAt) {
          trigger = { date: notification.triggerAt };
        }

        if (notification.repeatInterval) {
          const repeatMap: Record<string, unknown> = {
            minute: { repeats: true, seconds: 60 },
            hour: { repeats: true, seconds: 3600 },
            day: { repeats: true, seconds: 86400 },
            week: { repeats: true, seconds: 604800 },
          };
          trigger = repeatMap[notification.repeatInterval];
        }

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: notification.data,
          },
          trigger,
        });

        console.log('[PushNotifications] Scheduled local notification:', id);
        return id;
      } catch (error) {
        console.error('[PushNotifications] Failed to schedule:', error);
        throw error;
      }
    },

    async cancel(notificationId: string): Promise<void> {
      try {
        const Notifications = await import('expo-notifications');
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log('[PushNotifications] Cancelled notification:', notificationId);
      } catch (error) {
        console.error('[PushNotifications] Failed to cancel:', error);
      }
    },
  });

  return plugin;
}

/**
 * Default export
 */
export default createPushNotificationsPlugin;

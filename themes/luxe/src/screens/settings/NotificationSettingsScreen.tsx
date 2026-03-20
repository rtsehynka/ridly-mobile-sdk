/**
 * Notification Settings Screen
 *
 * Allows users to manage push notification preferences.
 * Platform-agnostic - uses notifications plugin from core.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, useNotifications, useToast } from '@ridly/mobile-core';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export function NotificationSettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const notifications = useNotifications();
  const { success, error } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'orders',
      title: 'Order Updates',
      description: 'Get notified about order status changes',
      enabled: true,
    },
    {
      id: 'promotions',
      title: 'Promotions & Sales',
      description: 'Receive exclusive offers and discounts',
      enabled: true,
    },
    {
      id: 'stock',
      title: 'Back in Stock',
      description: 'Be notified when wishlist items return',
      enabled: true,
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      description: 'Personalized product suggestions',
      enabled: false,
    },
  ]);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const isEnabled = await notifications?.isEnabled?.();
      setPermissionGranted(isEnabled || false);
    } catch {
      setPermissionGranted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await notifications?.requestPermissions?.();
      setPermissionGranted(granted || false);
      if (granted) {
        success('Notifications enabled');
      } else {
        // Open settings
        Linking.openSettings();
      }
    } catch (err) {
      error('Failed to enable notifications');
    }
  };

  const handleToggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
    // In production, save to backend or local storage
  };

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Permission Status */}
        {!permissionGranted ? (
          <View style={styles.permissionCard}>
            <View style={styles.permissionIcon}>
              <Ionicons name="notifications-off-outline" size={32} color={theme.colors.error} />
            </View>
            <Text style={styles.permissionTitle}>Notifications Disabled</Text>
            <Text style={styles.permissionText}>
              Enable notifications to stay updated on orders, promotions, and more.
            </Text>
            <TouchableOpacity
              style={styles.enableButton}
              onPress={handleRequestPermission}
            >
              <Text style={styles.enableButtonText}>Enable Notifications</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Status */}
            <View style={styles.statusCard}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.colors.success}
              />
              <Text style={styles.statusText}>Notifications are enabled</Text>
            </View>

            {/* Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Types</Text>
              <View style={styles.settingsCard}>
                {settings.map((setting, index) => (
                  <View
                    key={setting.id}
                    style={[
                      styles.settingItem,
                      index < settings.length - 1 && styles.settingItemBorder,
                    ]}
                  >
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>{setting.title}</Text>
                      <Text style={styles.settingDescription}>
                        {setting.description}
                      </Text>
                    </View>
                    <Switch
                      value={setting.enabled}
                      onValueChange={() => handleToggleSetting(setting.id)}
                      trackColor={{
                        false: theme.colors.border,
                        true: theme.colors.primary + '60',
                      }}
                      thumbColor={
                        setting.enabled ? theme.colors.primary : theme.colors.surface
                      }
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.infoText}>
                You can manage notification permissions in your device settings at any time.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    scrollContent: {
      padding: 16,
    },
    permissionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    permissionIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.error + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    permissionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    permissionText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    enableButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: theme.borderRadius.button,
    },
    enableButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    statusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.colors.success + '15',
      padding: 16,
      borderRadius: theme.borderRadius.medium,
      marginBottom: 24,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.success,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    settingsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    settingItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingInfo: {
      flex: 1,
      marginRight: 12,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    settingDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
  });

export default NotificationSettingsScreen;

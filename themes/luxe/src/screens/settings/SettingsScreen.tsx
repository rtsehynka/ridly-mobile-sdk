/**
 * Settings Screen
 *
 * Main settings hub with navigation to all settings.
 * Platform-agnostic - works with any backend.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, useLocale, useCurrency } from '@ridly/mobile-core';

interface SettingItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  route?: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export function SettingsScreen() {
  const router = useRouter();
  const { theme, toggleDarkMode, isDarkMode } = useTheme();
  const { currentLocale, availableLocales } = useLocale();
  const { currentCurrency, availableCurrencies } = useCurrency();

  const currentLocaleName =
    availableLocales.find((l) => l.code === currentLocale)?.nativeName || currentLocale;
  const currentCurrencyName =
    availableCurrencies.find((c) => c.code === currentCurrency)?.name || currentCurrency;

  const sections: SettingSection[] = [
    {
      title: 'Preferences',
      items: [
        {
          id: 'language',
          icon: 'language-outline',
          title: 'Language',
          subtitle: 'Change app language',
          value: currentLocaleName,
          route: '/settings/language',
        },
        {
          id: 'currency',
          icon: 'cash-outline',
          title: 'Currency',
          subtitle: 'Change display currency',
          value: currentCurrencyName,
          route: '/settings/currency',
        },
        {
          id: 'theme',
          icon: 'moon-outline',
          title: 'Dark Mode',
          subtitle: 'Enable dark theme',
          toggle: true,
          toggleValue: isDarkMode,
          onToggle: toggleDarkMode,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          icon: 'notifications-outline',
          title: 'Push Notifications',
          subtitle: 'Manage notification preferences',
          route: '/settings/notifications',
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'privacy',
          icon: 'shield-checkmark-outline',
          title: 'Privacy',
          subtitle: 'Data and privacy settings',
          route: '/settings/privacy',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          icon: 'help-circle-outline',
          title: 'Help & FAQ',
          subtitle: 'Get help and answers',
          route: '/settings/help',
        },
        {
          id: 'about',
          icon: 'information-circle-outline',
          title: 'About',
          subtitle: 'App version and info',
          route: '/settings/about',
        },
      ],
    },
  ];

  const styles = createStyles(theme);

  const renderItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.item}
      onPress={item.route ? () => router.push(item.route as any) : item.onPress}
      disabled={item.toggle}
    >
      <View style={styles.itemIcon}>
        <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.subtitle && <Text style={styles.itemSubtitle}>{item.subtitle}</Text>}
      </View>
      {item.toggle ? (
        <Switch
          value={item.toggleValue}
          onValueChange={item.onToggle}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary + '60',
          }}
          thumbColor={item.toggleValue ? theme.colors.primary : theme.colors.surface}
        />
      ) : (
        <View style={styles.itemRight}>
          {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderItem)}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>RIDLY Mobile v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with love</Text>
        </View>
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
      paddingVertical: 16,
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
      paddingHorizontal: 24,
      marginBottom: 8,
    },
    sectionContent: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    itemIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    itemContent: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    itemSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    itemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    itemValue: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    footerSubtext: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
  });

export default SettingsScreen;

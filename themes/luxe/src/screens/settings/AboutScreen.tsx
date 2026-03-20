/**
 * About Screen
 *
 * Displays app information, version, and links.
 * Platform-agnostic.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@ridly/mobile-core';

interface LinkItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  url: string;
}

export function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const links: LinkItem[] = [
    {
      icon: 'globe-outline',
      title: 'Website',
      url: 'https://ridly.io',
    },
    {
      icon: 'document-text-outline',
      title: 'Terms of Service',
      url: 'https://ridly.io/terms',
    },
    {
      icon: 'shield-outline',
      title: 'Privacy Policy',
      url: 'https://ridly.io/privacy',
    },
    {
      icon: 'help-circle-outline',
      title: 'Support Center',
      url: 'https://ridly.io/support',
    },
  ];

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>RIDLY</Text>
          </View>
          <Text style={styles.appName}>RIDLY Mobile</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.tagline}>Premium Shopping Experience</Text>
        </View>

        {/* Links */}
        <View style={styles.linksSection}>
          {links.map((link) => (
            <TouchableOpacity
              key={link.title}
              style={styles.linkItem}
              onPress={() => handleOpenLink(link.url)}
            >
              <View style={styles.linkIcon}>
                <Ionicons name={link.icon} size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Ionicons
                name="open-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Technical Info */}
        <View style={styles.techSection}>
          <Text style={styles.sectionTitle}>Technical Information</Text>
          <View style={styles.techCard}>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Platform</Text>
              <Text style={styles.techValue}>React Native / Expo</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>SDK Version</Text>
              <Text style={styles.techValue}>1.0.0</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>Build</Text>
              <Text style={styles.techValue}>Production</Text>
            </View>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={styles.creditsText}>Built with RIDLY Mobile SDK</Text>
          <Text style={styles.copyrightText}>
            2024 RIDLY. All rights reserved.
          </Text>
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
      padding: 24,
    },
    appInfo: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    logo: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.onPrimary,
      letterSpacing: 2,
    },
    appName: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.text,
    },
    appVersion: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    tagline: {
      fontSize: 14,
      color: theme.colors.primary,
      marginTop: 8,
    },
    linksSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 24,
    },
    linkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    linkIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    linkTitle: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    techSection: {
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
    techCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    techRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    techLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    techValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    credits: {
      alignItems: 'center',
      paddingTop: 16,
    },
    creditsText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    copyrightText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
  });

export default AboutScreen;

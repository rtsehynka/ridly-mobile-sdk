/**
 * Language Settings Screen
 *
 * Allows users to change the app language.
 * Platform-agnostic - uses i18n system from core.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, useLocale, useToast } from '@ridly/mobile-core';

export function LanguageSettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { currentLocale, availableLocales, setLocale } = useLocale();
  const { success } = useToast();

  const handleSelectLanguage = async (code: string) => {
    if (code === currentLocale) return;

    await setLocale(code);
    success('Language changed');
  };

  const styles = createStyles(theme);

  const renderLanguage = ({
    item,
  }: {
    item: { code: string; name: string; nativeName: string };
  }) => {
    const isSelected = item.code === currentLocale;

    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.languageItemSelected]}
        onPress={() => handleSelectLanguage(item.code)}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.languageNative}>{item.nativeName}</Text>
          <Text style={styles.languageName}>{item.name}</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Description */}
      <View style={styles.description}>
        <Text style={styles.descriptionText}>
          Select your preferred language. The app will display all text in the selected language.
        </Text>
      </View>

      {/* Language List */}
      <FlatList
        data={availableLocales}
        keyExtractor={(item) => item.code}
        renderItem={renderLanguage}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
    description: {
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    descriptionText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    listContent: {
      padding: 16,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    languageItemSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    languageInfo: {
      flex: 1,
    },
    languageNative: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    languageName: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    separator: {
      height: 12,
    },
  });

export default LanguageSettingsScreen;

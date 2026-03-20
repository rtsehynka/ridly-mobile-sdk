/**
 * Currency Settings Screen
 *
 * Allows users to change the display currency.
 * Platform-agnostic - uses currency system from core.
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
import { useTheme, useCurrency, useToast } from '@ridly/mobile-core';

export function CurrencySettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { currentCurrency, availableCurrencies, setCurrency } = useCurrency();
  const { success } = useToast();

  const handleSelectCurrency = async (code: string) => {
    if (code === currentCurrency) return;

    setCurrency(code);
    success('Currency changed');
  };

  const styles = createStyles(theme);

  const renderCurrency = ({
    item,
  }: {
    item: { code: string; name: string; symbol: string };
  }) => {
    const isSelected = item.code === currentCurrency;

    return (
      <TouchableOpacity
        style={[styles.currencyItem, isSelected && styles.currencyItemSelected]}
        onPress={() => handleSelectCurrency(item.code)}
      >
        <View style={styles.currencySymbol}>
          <Text style={styles.symbolText}>{item.symbol}</Text>
        </View>
        <View style={styles.currencyInfo}>
          <Text style={styles.currencyCode}>{item.code}</Text>
          <Text style={styles.currencyName}>{item.name}</Text>
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
        <Text style={styles.headerTitle}>Currency</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Description */}
      <View style={styles.description}>
        <Text style={styles.descriptionText}>
          Select your preferred currency for displaying prices. Prices will be converted automatically.
        </Text>
      </View>

      {/* Currency List */}
      <FlatList
        data={availableCurrencies}
        keyExtractor={(item) => item.code}
        renderItem={renderCurrency}
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
    currencyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    currencyItemSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    currencySymbol: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    symbolText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    currencyInfo: {
      flex: 1,
    },
    currencyCode: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    currencyName: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    separator: {
      height: 12,
    },
  });

export default CurrencySettingsScreen;

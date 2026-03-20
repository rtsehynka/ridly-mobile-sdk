/**
 * Address Book Screen
 *
 * Displays and manages customer addresses.
 * Platform-agnostic - works with any backend via ECommerceAdapter.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, useAdapter, useToast } from '@ridly/mobile-core';
import type { Address } from '@ridly/mobile-core';

export function AddressBookScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const adapter = useAdapter();
  const { success, error } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    try {
      const data = await adapter.getAddresses();
      setAddresses(data);
    } catch (err: any) {
      error(err?.message || 'Failed to load addresses');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [adapter]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAddresses();
  };

  const handleDeleteAddress = (address: Address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete this address?\n\n${address.street.join(', ')}, ${address.city}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(address.id);
            try {
              await adapter.deleteAddress(address.id);
              setAddresses((prev) => prev.filter((a) => a.id !== address.id));
              success('Address deleted');
            } catch (err: any) {
              error(err?.message || 'Failed to delete address');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      {/* Default badges */}
      <View style={styles.badgeContainer}>
        {item.isDefaultShipping && (
          <View style={[styles.badge, styles.badgeShipping]}>
            <Ionicons name="airplane-outline" size={12} color={theme.colors.onPrimary} />
            <Text style={styles.badgeText}>Shipping</Text>
          </View>
        )}
        {item.isDefaultBilling && (
          <View style={[styles.badge, styles.badgeBilling]}>
            <Ionicons name="card-outline" size={12} color={theme.colors.onPrimary} />
            <Text style={styles.badgeText}>Billing</Text>
          </View>
        )}
      </View>

      {/* Address details */}
      <Text style={styles.addressName}>
        {item.firstName} {item.lastName}
      </Text>
      {item.company && <Text style={styles.addressCompany}>{item.company}</Text>}
      <Text style={styles.addressLine}>{item.street.join(', ')}</Text>
      <Text style={styles.addressLine}>
        {item.city}, {item.region?.name || item.region?.code} {item.postcode}
      </Text>
      <Text style={styles.addressLine}>{item.countryCode}</Text>
      {item.phone && (
        <View style={styles.phoneRow}>
          <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.phoneText}>{item.phone}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.addressActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/profile/address/${item.id}`)}
        >
          <Ionicons name="pencil-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAddress(item)}
          disabled={deletingId === item.id}
        >
          {deletingId === item.id ? (
            <ActivityIndicator size="small" color={theme.colors.error} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Delete
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Addresses Yet</Text>
      <Text style={styles.emptyText}>
        Add your first address to speed up checkout
      </Text>
      <TouchableOpacity
        style={styles.addFirstButton}
        onPress={() => router.push('/profile/address/new')}
      >
        <Text style={styles.addFirstButtonText}>Add Address</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.headerTitle}>Address Book</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/profile/address/new')}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Address List */}
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderAddress}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
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
    addButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      padding: 16,
      flexGrow: 1,
    },
    addressCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    badgeContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeShipping: {
      backgroundColor: theme.colors.primary,
    },
    badgeBilling: {
      backgroundColor: theme.colors.accent || theme.colors.secondary,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    addressName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    addressCompany: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    addressLine: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
    phoneText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    addressActions: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    deleteButton: {},
    deleteButtonText: {
      color: theme.colors.error,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    addFirstButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: theme.borderRadius.button,
    },
    addFirstButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
  });

export default AddressBookScreen;

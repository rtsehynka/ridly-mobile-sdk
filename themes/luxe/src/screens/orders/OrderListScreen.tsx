/**
 * Order List Screen
 *
 * Luxe theme order history screen with gold/champagne styling.
 * Platform-agnostic - works with any backend via ECommerceAdapter.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, useAdapter, useToast } from '@ridly/mobile-core';
import { mapOrderToListItem, type OrderListItemData } from '../../mappers/order';

type TabType = 'all' | 'active' | 'completed' | 'cancelled';

export function OrderListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const adapter = useAdapter();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<OrderListItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const result = await adapter.getOrders();
      const mappedOrders = result.items.map(mapOrderToListItem);
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return ['pending', 'processing', 'shipped'].includes(order.status);
    }
    if (activeTab === 'completed') {
      return ['delivered', 'complete'].includes(order.status);
    }
    if (activeTab === 'cancelled') {
      return ['cancelled', 'refunded', 'failed'].includes(order.status);
    }
    return true;
  });

  const handleReorder = async (orderId: string) => {
    setActionLoading(`reorder-${orderId}`);
    try {
      await adapter.reorder(orderId);
      success('Items added to cart');
      router.push('/cart');
    } catch (err: any) {
      error(err?.message || 'Failed to reorder');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = (orderId: string) => {
    // Navigate to return request screen or show modal
    Alert.alert(
      'Return Request',
      'Would you like to request a return for this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => router.push(`/orders/${orderId}/return`),
        },
      ]
    );
  };

  const handleCancel = (orderId: string, orderNumber: string) => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order #${orderNumber}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(`cancel-${orderId}`);
            try {
              // Note: Most e-commerce platforms don't have a direct cancel API
              // This would typically be handled via customer service
              error('Please contact support to cancel your order');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const renderOrderItem = ({ item }: { item: OrderListItemData }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/orders/${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{item.formattedDate}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: item.statusColor }]}>
            {item.statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.orderContent}>
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumb]}>
            <Ionicons name="bag-outline" size={24} color={theme.colors.textSecondary} />
          </View>
        )}
        <View style={styles.orderDetails}>
          <Text style={styles.itemCount}>{item.itemCount} item{item.itemCount !== 1 ? 's' : ''}</Text>
          <Text style={styles.orderTotal}>{item.total}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </View>

      {(item.canCancel || item.canReturn || item.canReorder) && (
        <View style={styles.orderActions}>
          {item.canReorder && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReorder(item.id)}
              disabled={actionLoading === `reorder-${item.id}`}
            >
              {actionLoading === `reorder-${item.id}` ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.actionText}>Reorder</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {item.canReturn && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReturn(item.id)}
            >
              <Ionicons name="return-down-back-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.actionText}>Return</Text>
            </TouchableOpacity>
          )}
          {item.canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancel(item.id, item.orderNumber)}
              disabled={actionLoading === `cancel-${item.id}`}
            >
              {actionLoading === `cancel-${item.id}` ? (
                <ActivityIndicator size="small" color={theme.colors.error} />
              ) : (
                <>
                  <Ionicons name="close-outline" size={16} color={theme.colors.error} />
                  <Text style={[styles.actionText, { color: theme.colors.error }]}>Cancel</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={theme.colors.border} />
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        When you place an order, it will appear here
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
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
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchOrders(true)}
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
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 8,
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    tabTextActive: {
      color: theme.colors.onPrimary,
    },
    listContent: {
      padding: 16,
      flexGrow: 1,
    },
    orderCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.card,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    orderNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    orderDate: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    orderContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    thumbnail: {
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.small,
      marginRight: 12,
    },
    placeholderThumb: {
      backgroundColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    orderDetails: {
      flex: 1,
    },
    itemCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    orderTotal: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: 2,
    },
    orderActions: {
      flexDirection: 'row',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    cancelButton: {},
    emptyState: {
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
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    shopButton: {
      marginTop: 24,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: theme.borderRadius.button,
    },
    shopButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
  });

export default OrderListScreen;

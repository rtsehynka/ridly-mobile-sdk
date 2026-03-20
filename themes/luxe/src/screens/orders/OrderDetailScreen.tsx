/**
 * Order Detail Screen
 *
 * Shows full order details with tracking timeline.
 * Platform-agnostic - works with any backend via ECommerceAdapter.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, useAdapter, useToast } from '@ridly/mobile-core';
import type { Order, OrderItem } from '@ridly/mobile-core';

interface TrackingStep {
  status: string;
  label: string;
  date?: string;
  completed: boolean;
  current: boolean;
}

export function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const adapter = useAdapter();
  const { success, error } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    try {
      const data = await adapter.getOrder(id);
      setOrder(data);
    } catch (err: any) {
      error(err?.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;

    setIsReordering(true);
    try {
      await adapter.reorder(order.id);
      success('Items added to cart');
      router.push('/cart');
    } catch (err: any) {
      error(err?.message || 'Failed to reorder');
    } finally {
      setIsReordering(false);
    }
  };

  const handleTrackPackage = () => {
    const tracking = order?.shipments?.[0]?.tracking;
    if (tracking?.url) {
      Linking.openURL(tracking.url);
    } else if (tracking?.number) {
      Alert.alert('Tracking Number', tracking.number, [
        { text: 'Copy', onPress: () => {} },
        { text: 'OK' },
      ]);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@ridly.io?subject=Order%20' + order?.orderNumber);
  };

  const getTrackingSteps = (): TrackingStep[] => {
    const statusOrder = [
      { status: 'pending', label: 'Order Placed' },
      { status: 'processing', label: 'Processing' },
      { status: 'shipped', label: 'Shipped' },
      { status: 'delivered', label: 'Delivered' },
    ];

    const currentStatus = order?.status || 'pending';
    const currentIndex = statusOrder.findIndex((s) => s.status === currentStatus);

    return statusOrder.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      current: index === currentIndex,
      date:
        index === 0
          ? order?.createdAt
          : index === currentIndex
          ? order?.updatedAt
          : undefined,
    }));
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: '#FFA500',
      processing: '#2196F3',
      shipped: '#9C27B0',
      delivered: '#4CAF50',
      complete: '#4CAF50',
      cancelled: '#F44336',
      refunded: '#F44336',
    };
    return colors[status] || theme.colors.textSecondary;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number | { amount: number }): string => {
    const amount = typeof price === 'object' ? price.amount / 100 : price;
    return `$${amount.toFixed(2)}`;
  };

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const trackingSteps = getTrackingSteps();
  const statusColor = getStatusColor(order.status);
  const hasTracking = order.shipments && order.shipments.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
        <TouchableOpacity onPress={handleContactSupport} style={styles.headerButton}>
          <Ionicons name="chatbubble-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>

          {/* Tracking Timeline */}
          {!['cancelled', 'refunded'].includes(order.status) && (
            <View style={styles.timeline}>
              {trackingSteps.map((step, index) => (
                <View key={step.status} style={styles.timelineStep}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        step.completed && styles.timelineDotCompleted,
                        step.current && styles.timelineDotCurrent,
                      ]}
                    >
                      {step.completed && (
                        <Ionicons
                          name="checkmark"
                          size={12}
                          color={theme.colors.onPrimary}
                        />
                      )}
                    </View>
                    {index < trackingSteps.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          step.completed && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        (step.completed || step.current) && styles.timelineLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {step.date && (
                      <Text style={styles.timelineDate}>{formatDate(step.date)}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Track Package Button */}
          {hasTracking && order.status === 'shipped' && (
            <TouchableOpacity
              style={styles.trackButton}
              onPress={handleTrackPackage}
            >
              <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.trackButtonText}>Track Package</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          <View style={styles.itemsCard}>
            {order.items.map((item: OrderItem, index: number) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  index < order.items.length - 1 && styles.itemRowBorder,
                ]}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                    <Ionicons
                      name="cube-outline"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.sku && (
                    <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                  )}
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.addressCard}>
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.colors.primary}
                style={styles.addressIcon}
              />
              <View style={styles.addressContent}>
                <Text style={styles.addressName}>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </Text>
                <Text style={styles.addressLine}>
                  {order.shippingAddress.street?.join(', ')}
                </Text>
                <Text style={styles.addressLine}>
                  {order.shippingAddress.city}, {order.shippingAddress.region?.name}{' '}
                  {order.shippingAddress.postcode}
                </Text>
                <Text style={styles.addressLine}>
                  {order.shippingAddress.countryCode}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(order.totals?.subtotal || 0)}
              </Text>
            </View>
            {order.totals?.shipping !== undefined && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
                  {order.totals.shipping === 0
                    ? 'Free'
                    : formatPrice(order.totals.shipping)}
                </Text>
              </View>
            )}
            {order.totals?.tax !== undefined && order.totals.tax > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>
                  {formatPrice(order.totals.tax)}
                </Text>
              </View>
            )}
            {order.totals?.discount !== undefined && order.totals.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -{formatPrice(order.totals.discount)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatPrice(order.totals?.grandTotal || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        {order.paymentMethod && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentCard}>
              <Ionicons
                name="card-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.paymentText}>{order.paymentMethod}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.reorderButton]}
            onPress={handleReorder}
            disabled={isReordering}
          >
            {isReordering ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={20} color={theme.colors.onPrimary} />
                <Text style={styles.reorderButtonText}>Reorder</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.supportButton]}
            onPress={handleContactSupport}
          >
            <Ionicons name="help-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.supportButtonText}>Need Help?</Text>
          </TouchableOpacity>
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
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      padding: 32,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 24,
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
    headerButton: {
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
    statusCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
    },
    orderDate: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    timeline: {
      paddingLeft: 8,
    },
    timelineStep: {
      flexDirection: 'row',
      minHeight: 48,
    },
    timelineLeft: {
      alignItems: 'center',
      width: 24,
    },
    timelineDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timelineDotCompleted: {
      backgroundColor: theme.colors.success,
    },
    timelineDotCurrent: {
      backgroundColor: theme.colors.primary,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: theme.colors.border,
      marginVertical: 4,
    },
    timelineLineCompleted: {
      backgroundColor: theme.colors.success,
    },
    timelineContent: {
      flex: 1,
      paddingLeft: 12,
      paddingBottom: 16,
    },
    timelineLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    timelineLabelActive: {
      fontWeight: '600',
      color: theme.colors.text,
    },
    timelineDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    trackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    trackButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    itemsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    itemRow: {
      flexDirection: 'row',
      padding: 12,
    },
    itemRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
    },
    itemImagePlaceholder: {
      backgroundColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    itemSku: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    itemQty: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    addressCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    addressIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    addressContent: {
      flex: 1,
    },
    addressName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    addressLine: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      fontSize: 14,
      color: theme.colors.text,
    },
    discountValue: {
      color: theme.colors.success,
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: 8,
      paddingTop: 16,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    paymentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    paymentText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
      marginBottom: 24,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 48,
      borderRadius: theme.borderRadius.button,
    },
    reorderButton: {
      backgroundColor: theme.colors.primary,
    },
    reorderButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    supportButton: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    supportButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    backButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: theme.borderRadius.button,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
  });

export default OrderDetailScreen;

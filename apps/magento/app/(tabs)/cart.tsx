/**
 * RIDLY Mobile Demo - Cart Screen
 *
 * Shows the shopping cart with real items.
 */

import { useCallback, useEffect } from 'react';
import { View, ScrollView, Image, StyleSheet, Pressable, ActivityIndicator, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Text,
  H2,
  Button,
  Card,
  CardContent,
  Price,
  useTheme,
  useToast,
  useCartStore,
} from '@ridly/mobile-core';

export default function CartScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { error, success } = useToast();
  const { cart, isLoading, fetchCart, updateItemQuantity, removeItem } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      try {
        await removeItem(itemId);
        success('Removed', 'Item removed from cart');
      } catch {
        error('Error', 'Failed to remove item');
      }
    } else {
      try {
        await updateItemQuantity(itemId, newQuantity);
      } catch {
        error('Error', 'Failed to update quantity');
      }
    }
  }, [updateItemQuantity, removeItem, success, error]);

  const handleRemoveItem = useCallback(async (itemId: string) => {
    try {
      await removeItem(itemId);
      success('Removed', 'Item removed from cart');
    } catch {
      error('Error', 'Failed to remove item');
    }
  }, [removeItem, success, error]);

  const handleCheckout = useCallback(() => {
    // Navigate to checkout
    router.push('/checkout' as any);
  }, [router]);

  const handleContinueShopping = useCallback(() => {
    router.push('/(tabs)');
  }, [router]);

  if (isLoading && !cart) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Card variant="outlined">
            <CardContent>
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <H2>Your cart is empty</H2>
                <Text variant="bodySmall" color="textSecondary" align="center" style={{ marginTop: 8 }}>
                  Browse products and add them to your cart to see them here.
                </Text>
                <Button style={{ marginTop: 24 }} onPress={handleContinueShopping}>
                  Start Shopping
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Cart Items */}
          {cart.items.map((item) => (
            <Card key={item.id} variant="outlined" style={styles.itemCard}>
              <CardContent>
                <View style={styles.itemRow}>
                  {/* Image */}
                  <View style={[styles.itemImage, { backgroundColor: theme.colors.surface }]}>
                    {item.image?.url ? (
                      <Image source={{ uri: item.image.url }} style={styles.image} resizeMode="cover" />
                    ) : (
                      <FontAwesome name="image" size={24} color={theme.colors.textSecondary} />
                    )}
                  </View>

                  {/* Details */}
                  <View style={styles.itemDetails}>
                    <Text variant="body" numberOfLines={2} style={{ fontWeight: '500' }}>
                      {item.name}
                    </Text>
                    <Text variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                      SKU: {item.sku}
                    </Text>
                    <Price
                      price={item.price.amount}
                      currency={item.price.currency}
                      size="sm"
                      style={{ marginTop: 8 }}
                    />
                  </View>

                  {/* Remove Button */}
                  <Pressable
                    onPress={() => handleRemoveItem(item.id)}
                    style={({ pressed }) => [
                      styles.removeButton,
                      { opacity: pressed ? 0.5 : 1 },
                    ]}
                  >
                    <FontAwesome name="trash-o" size={18} color={theme.colors.error} />
                  </Pressable>
                </View>

                {/* Quantity Controls */}
                <View style={styles.quantityRow}>
                  <Text variant="bodySmall" color="textSecondary">Quantity:</Text>
                  <View style={styles.quantityControls}>
                    <Pressable
                      onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      style={[styles.quantityButton, { backgroundColor: theme.colors.surface }]}
                    >
                      <FontAwesome name="minus" size={12} color={theme.colors.text} />
                    </Pressable>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <Pressable
                      onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      style={[styles.quantityButton, { backgroundColor: theme.colors.surface }]}
                    >
                      <FontAwesome name="plus" size={12} color={theme.colors.text} />
                    </Pressable>
                  </View>
                </View>
              </CardContent>
            </Card>
          ))}

          {/* Order Summary */}
          <Card variant="elevated" style={styles.summaryCard}>
            <CardContent>
              <H2 style={{ marginBottom: 16 }}>Order Summary</H2>

              <View style={styles.summaryRow}>
                <Text color="textSecondary">Subtotal</Text>
                <Price price={cart.totals.subtotal.amount} currency={cart.totals.subtotal.currency} size="sm" />
              </View>

              {cart.totals.shipping && (
                <View style={styles.summaryRow}>
                  <Text color="textSecondary">Shipping</Text>
                  <Price price={cart.totals.shipping.amount} currency={cart.totals.shipping.currency} size="sm" />
                </View>
              )}

              {cart.totals.tax && (
                <View style={styles.summaryRow}>
                  <Text color="textSecondary">Tax</Text>
                  <Price price={cart.totals.tax.amount} currency={cart.totals.tax.currency} size="sm" />
                </View>
              )}

              {cart.totals.discount && (
                <View style={styles.summaryRow}>
                  <Text color="textSecondary">Discount</Text>
                  <Text style={{ color: theme.colors.success }}>
                    -{cart.totals.discount.currency} {cart.totals.discount.amount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: theme.colors.border }]}>
                <Text variant="label">Total</Text>
                <Price price={cart.totals.grandTotal.amount} currency={cart.totals.grandTotal.currency} size="lg" />
              </View>

              <Pressable
                onPress={handleCheckout}
                style={{
                  marginTop: 16,
                  backgroundColor: '#1a1a1a',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RNText style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                  Proceed to Checkout
                </RNText>
              </Pressable>

              <Pressable
                onPress={handleContinueShopping}
                style={{
                  marginTop: 12,
                  backgroundColor: 'transparent',
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: '#1a1a1a',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RNText style={{ color: '#1a1a1a', fontSize: 16, fontWeight: '600' }}>
                  Continue Shopping
                </RNText>
              </Pressable>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  summaryCard: {
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    marginBottom: 0,
  },
  checkoutButton: {
    marginTop: 16,
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

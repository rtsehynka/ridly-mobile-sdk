/**
 * RIDLY Mobile Demo - Order Success Screen
 *
 * Displayed after successful order placement.
 */

import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  H1,
  H2,
  Button,
  Card,
  CardContent,
  useTheme,
} from '@ridly/mobile-core';

export default function CheckoutSuccessScreen() {
  const { theme } = useTheme();
  const { orderId, orderNumber } = useLocalSearchParams<{
    orderId: string;
    orderNumber: string;
  }>();

  const handleContinueShopping = () => {
    router.replace('/(tabs)');
  };

  const handleViewOrders = () => {
    router.replace('/(tabs)/account');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Order Confirmed',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
          <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
        </View>

        {/* Title */}
        <H1 style={{ marginTop: 24, textAlign: 'center' }}>
          Thank You!
        </H1>

        <Text
          variant="body"
          color="textSecondary"
          align="center"
          style={{ marginTop: 8 }}
        >
          Your order has been placed successfully.
        </Text>

        {/* Order Number Card */}
        <Card variant="elevated" style={styles.orderCard}>
          <CardContent>
            <Text variant="caption" color="textSecondary" align="center">
              Order Number
            </Text>
            <H2 style={{ textAlign: 'center', marginTop: 4 }}>
              #{orderNumber || orderId || 'N/A'}
            </H2>
          </CardContent>
        </Card>

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
            <Text variant="bodySmall" color="textSecondary" style={{ marginLeft: 12, flex: 1 }}>
              A confirmation email has been sent to your email address.
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
            <Text variant="bodySmall" color="textSecondary" style={{ marginLeft: 12, flex: 1 }}>
              You can track your order status in your account.
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          fullWidth
          size="lg"
          onPress={handleContinueShopping}
          style={{ marginBottom: 12 }}
        >
          Continue Shopping
        </Button>

        <Button
          fullWidth
          variant="outline"
          size="lg"
          onPress={handleViewOrders}
        >
          View My Orders
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    marginTop: 32,
    width: '100%',
  },
  infoContainer: {
    marginTop: 32,
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  buttons: {
    padding: 24,
  },
});

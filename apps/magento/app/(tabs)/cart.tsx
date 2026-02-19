/**
 * RIDLY Mobile Demo - Cart Screen
 *
 * Shows the shopping cart.
 */

import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  H2,
  Button,
  Card,
  CardContent,
  useTheme,
} from '@ridly/mobile-core';

export default function CartScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <Card variant="outlined">
          <CardContent>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <H2>Your cart is empty</H2>
              <Text variant="bodySmall" color="textSecondary" align="center" style={{ marginTop: 8 }}>
                Browse products and add them to your cart to see them here.
              </Text>
              <Button style={{ marginTop: 24 }} onPress={() => {}}>
                Start Shopping
              </Button>
            </View>
          </CardContent>
        </Card>

        <View style={styles.note}>
          <Text variant="caption" color="textSecondary" align="center">
            Cart functionality will be implemented in Week 5
          </Text>
        </View>
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
  note: {
    marginTop: 24,
  },
});

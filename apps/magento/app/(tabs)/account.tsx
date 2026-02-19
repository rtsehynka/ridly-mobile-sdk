/**
 * RIDLY Mobile Demo - Account Screen
 *
 * Shows the user account / login.
 */

import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  H2,
  Button,
  Input,
  Card,
  CardContent,
  useTheme,
} from '@ridly/mobile-core';
import { useState } from 'react';

export default function AccountScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <Card variant="elevated">
          <CardContent>
            <H2 style={{ marginBottom: 16, textAlign: 'center' }}>Sign In</H2>

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
            />

            <Button fullWidth style={{ marginTop: 16 }} onPress={() => {}}>
              Sign In
            </Button>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text variant="caption" color="textSecondary" style={styles.dividerText}>
                or
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>

            <Button fullWidth variant="outline" onPress={() => {}}>
              Create Account
            </Button>
          </CardContent>
        </Card>

        <View style={styles.note}>
          <Text variant="caption" color="textSecondary" align="center">
            Authentication will be implemented in Week 5
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  note: {
    marginTop: 24,
  },
});

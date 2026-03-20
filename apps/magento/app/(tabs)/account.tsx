/**
 * RIDLY Mobile Demo - Account Screen
 *
 * Profile menu with account options including Saved Items.
 * Includes social login integration (Apple/Google).
 */

import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Text,
  H2,
  Button,
  Input,
  Card,
  CardContent,
  useTheme,
  useToast,
} from '@ridly/mobile-core';
import { useState } from 'react';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: number;
}

function MenuItem({ icon, label, onPress, badge }: MenuItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={22} color={theme.colors.text} />
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge !== undefined && badge > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={{ color: theme.colors.onPrimary, fontSize: 11, fontWeight: '600' }}>
              {badge}
            </Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </View>
    </Pressable>
  );
}

export default function AccountScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [isLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    try {
      // Simulate social login
      await new Promise(resolve => setTimeout(resolve, 1500));
      success('Login Successful', `Logged in with ${provider}`);
    } catch {
      showError('Login Failed', `Could not login with ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView testID="account-screen" style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
        <ScrollView testID="account-scroll-view" contentContainerStyle={styles.scrollContent}>
          {/* Guest Menu */}
          <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
            <MenuItem
              icon="heart-outline"
              label="Saved Items"
              onPress={() => router.push('/(tabs)/saved')}
            />
            <MenuItem
              icon="time-outline"
              label="Recently Viewed"
              onPress={() => {}}
            />
          </View>

          {/* Login Card */}
          <Card variant="elevated" style={styles.loginCard}>
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

              {/* Social Login */}
              <View testID="social-login-buttons" style={styles.socialSection}>
                <View style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                  <Text variant="caption" color="textSecondary" style={styles.dividerText}>
                    or continue with
                  </Text>
                  <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                </View>

                <Pressable
                  testID="apple-signin-button"
                  style={[styles.socialButton, { backgroundColor: '#000' }]}
                  onPress={() => handleSocialLogin('Apple')}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === 'Apple' ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="logo-apple" size={20} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>
                        Continue with Apple
                      </Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  testID="google-signin-button"
                  style={[styles.socialButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.border }]}
                  onPress={() => handleSocialLogin('Google')}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === 'Google' ? (
                    <ActivityIndicator size="small" color="#333" />
                  ) : (
                    <>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: '#4285F4' }}>G</Text>
                      <Text style={{ color: '#333', fontWeight: '600', marginLeft: 8 }}>
                        Continue with Google
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </CardContent>
          </Card>

          {/* Settings Section */}
          <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
            <MenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => router.push('/settings' as any)}
            />
            <MenuItem
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => {}}
            />
            <MenuItem
              icon="document-text-outline"
              label="Terms & Conditions"
              onPress={() => {}}
            />
            <MenuItem
              icon="shield-outline"
              label="Privacy Policy"
              onPress={() => {}}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Logged in view (future implementation)
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
          <MenuItem
            icon="person-outline"
            label="My Profile"
            onPress={() => {}}
          />
          <MenuItem
            icon="bag-outline"
            label="My Orders"
            onPress={() => {}}
          />
          <MenuItem
            icon="heart-outline"
            label="Saved Items"
            onPress={() => router.push('/(tabs)/saved')}
          />
          <MenuItem
            icon="location-outline"
            label="Addresses"
            onPress={() => {}}
          />
        </View>

        <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
          <MenuItem
            icon="settings-outline"
            label="Settings"
            onPress={() => {}}
          />
          <MenuItem
            icon="log-out-outline"
            label="Sign Out"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  loginCard: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  socialSection: {
    marginTop: 8,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
});

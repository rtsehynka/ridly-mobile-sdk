/**
 * RIDLY Mobile Demo - Tab Layout
 *
 * Fashion theme navigation: Home, Browse, Cart, Menu
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';

import { useTheme, useCartStore, Text } from '@ridly/mobile-core';

export default function TabLayout() {
  const { theme } = useTheme();
  const router = useRouter();
  const { itemCount: cartItemCount } = useCartStore();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [
    { icon: 'heart-outline' as const, label: 'Wishlist', onPress: () => { setMenuVisible(false); router.push('/(tabs)/saved'); } },
    { icon: 'git-compare-outline' as const, label: 'Compare', onPress: () => { setMenuVisible(false); /* router.push('/compare'); */ } },
    { icon: 'person-outline' as const, label: 'Profile', onPress: () => { setMenuVisible(false); router.push('/(tabs)/account'); } },
    { icon: 'settings-outline' as const, label: 'Settings', onPress: () => { setMenuVisible(false); } },
  ];

  // Custom header with logo, search bar and cart icon
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.background, paddingTop: insets.top + 8 }]}>
      {/* Logo */}
      <Image
        source={require('../../assets/images/ridly-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Search Bar */}
      <Pressable
        style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <Text style={[styles.searchPlaceholder, { color: theme.colors.textSecondary }]}>
          Search products...
        </Text>
      </Pressable>

      {/* Cart Icon */}
      <Pressable
        style={styles.cartButton}
        onPress={() => router.push('/(tabs)/cart')}
      >
        <Ionicons name="cart-outline" size={26} color={theme.colors.text} />
        {cartItemCount > 0 && (
          <View style={[styles.cartBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.cartBadgeText}>
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );

  return (
    <>
    {/* Menu Modal */}
    <Modal
      visible={menuVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
        <Pressable style={[styles.menuContainer, { backgroundColor: theme.colors.background, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.menuHandle} />
          <Text variant="label" style={styles.menuTitle}>Menu</Text>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={24} color={theme.colors.text} />
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>

    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
          header: renderHeader,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
          ),
          headerTitle: 'Browse',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={color} />
              {cartItemCount > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.tabBadgeText}>
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Text>
                </View>
              )}
            </View>
          ),
          headerTitle: 'Shopping Cart',
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => (
            <Ionicons name="menu-outline" size={24} color={color} />
          ),
          headerTitle: 'Menu',
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            setMenuVisible(true);
          },
        }}
      />
      {/* Hide unused tabs */}
      <Tabs.Screen
        name="saved"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  logo: {
    width: 36,
    height: 36,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
  },
  cartButton: {
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    textAlign: 'center',
    includeFontPadding: false,
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});

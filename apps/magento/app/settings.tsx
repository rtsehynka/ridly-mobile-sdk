/**
 * RIDLY Mobile Demo - Settings Screen
 *
 * Settings for language, currency, notifications, and app preferences.
 */

import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  H2,
  Card,
  CardContent,
  useTheme,
  useToast,
} from '@ridly/mobile-core';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  testID?: string;
  rightElement?: React.ReactNode;
}

function SettingItem({ icon, label, value, onPress, testID, rightElement }: SettingItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      testID={testID}
      style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={22} color={theme.colors.text} />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && (
          <Text variant="body" color="textSecondary">{value}</Text>
        )}
        {rightElement}
        {onPress && !rightElement && (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        )}
      </View>
    </Pressable>
  );
}

// Languages data
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

// Currencies data
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export default function SettingsScreen() {
  const { theme, isDark, setColorScheme } = useTheme();
  const { success } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const selectedLanguage = LANGUAGES.find(l => l.code === currentLanguage);
  const selectedCurrency = CURRENCIES.find(c => c.code === currentCurrency);

  const handleLanguageSelect = (code: string) => {
    setCurrentLanguage(code);
    setLanguageModalVisible(false);
    success('Language Changed', 'App language has been updated');
  };

  const handleCurrencySelect = (code: string) => {
    setCurrentCurrency(code);
    setCurrencyModalVisible(false);
    success('Currency Changed', 'Display currency has been updated');
  };

  const handleDarkModeToggle = (value: boolean) => {
    setColorScheme(value ? 'dark' : 'light');
  };

  return (
    <SafeAreaView testID="settings-screen" style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Settings' }} />

      <ScrollView testID="settings-scroll-view" contentContainerStyle={styles.scrollContent}>
        {/* Language & Region */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="label" style={styles.sectionTitle}>Language & Region</Text>

          <SettingItem
            testID="language-selector"
            icon="language-outline"
            label="Language"
            value={`${selectedLanguage?.flag} ${selectedLanguage?.nativeName}`}
            onPress={() => setLanguageModalVisible(true)}
          />

          <SettingItem
            testID="currency-selector"
            icon="cash-outline"
            label="Currency"
            value={`${selectedCurrency?.symbol} ${selectedCurrency?.code}`}
            onPress={() => setCurrencyModalVisible(true)}
          />
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="label" style={styles.sectionTitle}>Appearance</Text>

          <SettingItem
            testID="dark-mode-toggle"
            icon="moon-outline"
            label="Dark Mode"
            rightElement={
              <Switch
                testID="dark-mode-switch"
                value={isDark}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Notifications */}
        <View testID="notification-settings" style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="label" style={styles.sectionTitle}>Notifications</Text>

          <SettingItem
            testID="push-notifications-toggle"
            icon="notifications-outline"
            label="Push Notifications"
            rightElement={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            }
          />

          <View testID="notification-preferences">
            <SettingItem
              icon="bag-outline"
              label="Order Updates"
              rightElement={
                <Switch
                  value={orderUpdates}
                  onValueChange={setOrderUpdates}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#fff"
                  disabled={!pushEnabled}
                />
              }
            />

            <SettingItem
              icon="pricetag-outline"
              label="Promotions"
              rightElement={
                <Switch
                  value={promotions}
                  onValueChange={setPromotions}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#fff"
                  disabled={!pushEnabled}
                />
              }
            />
          </View>
        </View>

        {/* Account */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="label" style={styles.sectionTitle}>Account</Text>

          <SettingItem
            icon="lock-closed-outline"
            label="Privacy Settings"
            onPress={() => {}}
          />

          <SettingItem
            icon="trash-outline"
            label="Clear Cache"
            onPress={() => success('Cache Cleared', 'App cache has been cleared')}
          />
        </View>

        {/* App Info */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="label" style={styles.sectionTitle}>About</Text>

          <SettingItem
            icon="information-circle-outline"
            label="App Version"
            value="1.0.0"
          />

          <SettingItem
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => {}}
          />

          <SettingItem
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => {}}
          />
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={languageModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLanguageModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <H2>Select Language</H2>
              <Pressable onPress={() => setLanguageModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView testID="language-options">
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  testID={`language-option-${lang.code}`}
                  style={[
                    styles.optionItem,
                    { borderBottomColor: theme.colors.border },
                    lang.code === currentLanguage && { backgroundColor: theme.colors.primary + '20' },
                  ]}
                  onPress={() => handleLanguageSelect(lang.code)}
                >
                  <Text style={styles.optionFlag}>{lang.flag}</Text>
                  <View style={styles.optionInfo}>
                    <Text style={{ fontWeight: lang.code === currentLanguage ? '600' : '400' }}>
                      {lang.nativeName}
                    </Text>
                    <Text variant="caption" color="textSecondary">{lang.name}</Text>
                  </View>
                  {lang.code === currentLanguage && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={currencyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCurrencyModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <H2>Select Currency</H2>
              <Pressable onPress={() => setCurrencyModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView testID="currency-options">
              {CURRENCIES.map((curr) => (
                <Pressable
                  key={curr.code}
                  testID={`currency-option-${curr.code}`}
                  style={[
                    styles.optionItem,
                    { borderBottomColor: theme.colors.border },
                    curr.code === currentCurrency && { backgroundColor: theme.colors.primary + '20' },
                  ]}
                  onPress={() => handleCurrencySelect(curr.code)}
                >
                  <View style={[styles.currencySymbol, { backgroundColor: theme.colors.surface }]}>
                    <Text style={{ fontSize: 18, fontWeight: '600' }}>{curr.symbol}</Text>
                  </View>
                  <View style={styles.optionInfo}>
                    <Text style={{ fontWeight: curr.code === currentCurrency ? '600' : '400' }}>
                      {curr.code}
                    </Text>
                    <Text variant="caption" color="textSecondary">{curr.name}</Text>
                  </View>
                  {curr.code === currentCurrency && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    opacity: 0.7,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  optionFlag: {
    fontSize: 24,
  },
  optionInfo: {
    flex: 1,
  },
  currencySymbol: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * Language Switcher Component
 *
 * Dropdown/modal for selecting app language.
 * Integrates with i18n system from @ridly/mobile-core.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useLocale, useTheme } from '@ridly/mobile-core';
import type { LanguageConfig } from '@ridly/mobile-core';

interface LanguageSwitcherProps {
  /** Show as button (opens modal) or inline list */
  variant?: 'button' | 'list';
  /** Custom style */
  style?: object;
}

export function LanguageSwitcher({ variant = 'button', style }: LanguageSwitcherProps) {
  const { locale, locales, currentLanguage, setLocale } = useLocale();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectLanguage = async (code: string) => {
    await setLocale(code);
    setModalVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: LanguageConfig }) => {
    const isSelected = item.code === locale;

    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          isSelected && { backgroundColor: theme.colors.primary + '20' },
        ]}
        onPress={() => handleSelectLanguage(item.code)}
      >
        {item.flag && <Text style={styles.flag}>{item.flag}</Text>}
        <View style={styles.languageInfo}>
          <Text
            style={[
              styles.languageName,
              { color: theme.colors.text },
              isSelected && { color: theme.colors.primary, fontWeight: '600' },
            ]}
          >
            {item.nativeName}
          </Text>
          <Text style={[styles.languageCode, { color: theme.colors.textSecondary }]}>
            {item.name}
          </Text>
        </View>
        {isSelected && (
          <Text style={[styles.checkmark, { color: theme.colors.primary }]}>
            ✓
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (variant === 'list') {
    return (
      <View style={[styles.listContainer, style]}>
        <FlatList
          data={locales}
          renderItem={renderLanguageItem}
          keyExtractor={(item) => item.code}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
          )}
        />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        testID="language-selector"
        style={[
          styles.button,
          { borderColor: theme.colors.border },
          style,
        ]}
        onPress={() => setModalVisible(true)}
      >
        {currentLanguage?.flag && (
          <Text style={styles.buttonFlag}>{currentLanguage.flag}</Text>
        )}
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>
          {currentLanguage?.nativeName || locale.toUpperCase()}
        </Text>
        <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>
          ▼
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Select Language
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: theme.colors.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              testID="language-options"
              data={locales}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  buttonFlag: {
    fontSize: 18,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 10,
    marginLeft: 4,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 20,
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  flag: {
    fontSize: 24,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
  },
  languageCode: {
    fontSize: 12,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '600',
  },
  separator: {
    height: 1,
  },
});

export default LanguageSwitcher;

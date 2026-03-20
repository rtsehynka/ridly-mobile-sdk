/**
 * Currency Selector Component
 *
 * Dropdown/modal for selecting display currency.
 * Integrates with currency system from @ridly/mobile-core.
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
import { useCurrencySelector, useTheme } from '@ridly/mobile-core';
import type { CurrencyFormatConfig } from '@ridly/mobile-core';

interface CurrencySelectorProps {
  /** Show as button (opens modal) or inline list */
  variant?: 'button' | 'list';
  /** Custom style */
  style?: object;
}

export function CurrencySelector({ variant = 'button', style }: CurrencySelectorProps) {
  const { currentCurrency, currentConfig, currencies, setCurrency } = useCurrencySelector();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectCurrency = (code: string) => {
    setCurrency(code);
    setModalVisible(false);
  };

  const renderCurrencyItem = ({ item }: { item: CurrencyFormatConfig }) => {
    const isSelected = item.code === currentCurrency;

    return (
      <TouchableOpacity
        style={[
          styles.currencyItem,
          isSelected && { backgroundColor: theme.colors.primary + '20' },
        ]}
        onPress={() => handleSelectCurrency(item.code)}
      >
        <View style={[styles.symbolContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.symbol, { color: theme.colors.text }]}>
            {item.symbol}
          </Text>
        </View>
        <View style={styles.currencyInfo}>
          <Text
            style={[
              styles.currencyCode,
              { color: theme.colors.text },
              isSelected && { color: theme.colors.primary, fontWeight: '600' },
            ]}
          >
            {item.code}
          </Text>
          <Text style={[styles.currencyName, { color: theme.colors.textSecondary }]}>
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
          data={currencies}
          renderItem={renderCurrencyItem}
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
        testID="currency-selector"
        style={[
          styles.button,
          { borderColor: theme.colors.border },
          style,
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.buttonSymbol, { color: theme.colors.primary }]}>
          {currentConfig?.symbol || '$'}
        </Text>
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>
          {currentCurrency}
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
                Select Currency
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: theme.colors.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              testID="currency-options"
              data={currencies}
              renderItem={renderCurrencyItem}
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
    gap: 6,
  },
  buttonSymbol: {
    fontSize: 16,
    fontWeight: '600',
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
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  symbolContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '500',
  },
  currencyName: {
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

export default CurrencySelector;

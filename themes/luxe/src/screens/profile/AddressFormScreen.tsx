/**
 * Address Form Screen
 *
 * Create or edit customer address.
 * Platform-agnostic - works with any backend via ECommerceAdapter.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, useAdapter, useToast } from '@ridly/mobile-core';
import type { Address, Country, Region } from '@ridly/mobile-core';

export function AddressFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = id && id !== 'new';

  const { theme } = useTheme();
  const adapter = useAdapter();
  const { success, error } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [street1, setStreet1] = useState('');
  const [street2, setStreet2] = useState('');
  const [city, setCity] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [regionCode, setRegionCode] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefaultShipping, setIsDefaultShipping] = useState(false);
  const [isDefaultBilling, setIsDefaultBilling] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (countryCode) {
      loadRegions(countryCode);
    }
  }, [countryCode]);

  const loadInitialData = async () => {
    try {
      // Load countries
      const countriesData = await adapter.getCountries();
      setCountries(countriesData);

      // Load existing address if editing
      if (isEditing) {
        const addresses = await adapter.getAddresses();
        const address = addresses.find((a) => a.id === id);
        if (address) {
          setFirstName(address.firstName);
          setLastName(address.lastName);
          setCompany(address.company || '');
          setStreet1(address.street[0] || '');
          setStreet2(address.street[1] || '');
          setCity(address.city);
          setCountryCode(address.countryCode);
          setRegionCode(address.region?.code || '');
          setPostcode(address.postcode);
          setPhone(address.phone || '');
          setIsDefaultShipping(address.isDefaultShipping || false);
          setIsDefaultBilling(address.isDefaultBilling || false);
        }
      }
    } catch (err: any) {
      error(err?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRegions = async (country: string) => {
    try {
      const regionsData = await adapter.getRegions(country);
      setRegions(regionsData);
      // Reset region if not valid for new country
      if (regionsData.length > 0 && !regionsData.find((r) => r.code === regionCode)) {
        setRegionCode('');
      }
    } catch (err) {
      setRegions([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!street1.trim()) newErrors.street1 = 'Street address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!countryCode) newErrors.countryCode = 'Country is required';
    if (regions.length > 0 && !regionCode) newErrors.regionCode = 'Region is required';
    if (!postcode.trim()) newErrors.postcode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const addressData = {
        firstName,
        lastName,
        company: company || undefined,
        street: [street1, street2].filter(Boolean),
        city,
        countryCode,
        regionCode: regionCode || undefined,
        postcode,
        phone: phone || undefined,
        isDefaultShipping,
        isDefaultBilling,
      };

      if (isEditing) {
        await adapter.updateAddress(id!, addressData);
        success('Address updated');
      } else {
        await adapter.addAddress(addressData);
        success('Address added');
      }
      router.back();
    } catch (err: any) {
      error(err?.message || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const selectedCountry = countries.find((c) => c.code === countryCode);
  const selectedRegion = regions.find((r) => r.code === regionCode);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Address' : 'New Address'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name row */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="John"
                placeholderTextColor={theme.colors.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Doe"
                placeholderTextColor={theme.colors.textSecondary}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>
          </View>

          {/* Company */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Company (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Company name"
              placeholderTextColor={theme.colors.textSecondary}
              value={company}
              onChangeText={setCompany}
            />
          </View>

          {/* Street */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={[styles.input, errors.street1 && styles.inputError]}
              placeholder="123 Main Street"
              placeholderTextColor={theme.colors.textSecondary}
              value={street1}
              onChangeText={setStreet1}
            />
            {errors.street1 && (
              <Text style={styles.errorText}>{errors.street1}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Apartment, suite, etc. (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Apt 4B"
              placeholderTextColor={theme.colors.textSecondary}
              value={street2}
              onChangeText={setStreet2}
            />
          </View>

          {/* City */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="New York"
              placeholderTextColor={theme.colors.textSecondary}
              value={city}
              onChangeText={setCity}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>

          {/* Country */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Country *</Text>
            <TouchableOpacity
              style={[styles.picker, errors.countryCode && styles.inputError]}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
            >
              <Text
                style={[
                  styles.pickerText,
                  !selectedCountry && styles.pickerPlaceholder,
                ]}
              >
                {selectedCountry?.name || 'Select country'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
            {errors.countryCode && (
              <Text style={styles.errorText}>{errors.countryCode}</Text>
            )}
          </View>

          {/* Country picker modal (simplified as inline list) */}
          {showCountryPicker && (
            <View style={styles.pickerDropdown}>
              <ScrollView style={styles.pickerList} nestedScrollEnabled>
                {countries.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={styles.pickerItem}
                    onPress={() => {
                      setCountryCode(country.code);
                      setShowCountryPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        countryCode === country.code && styles.pickerItemTextSelected,
                      ]}
                    >
                      {country.name}
                    </Text>
                    {countryCode === country.code && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Region */}
          {regions.length > 0 && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>State/Region *</Text>
              <TouchableOpacity
                style={[styles.picker, errors.regionCode && styles.inputError]}
                onPress={() => setShowRegionPicker(!showRegionPicker)}
              >
                <Text
                  style={[
                    styles.pickerText,
                    !selectedRegion && styles.pickerPlaceholder,
                  ]}
                >
                  {selectedRegion?.name || 'Select state/region'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
              {errors.regionCode && (
                <Text style={styles.errorText}>{errors.regionCode}</Text>
              )}
            </View>
          )}

          {/* Region picker */}
          {showRegionPicker && (
            <View style={styles.pickerDropdown}>
              <ScrollView style={styles.pickerList} nestedScrollEnabled>
                {regions.map((region) => (
                  <TouchableOpacity
                    key={region.code}
                    style={styles.pickerItem}
                    onPress={() => {
                      setRegionCode(region.code);
                      setShowRegionPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        regionCode === region.code && styles.pickerItemTextSelected,
                      ]}
                    >
                      {region.name}
                    </Text>
                    {regionCode === region.code && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Postal Code & Phone row */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>Postal Code *</Text>
              <TextInput
                style={[styles.input, errors.postcode && styles.inputError]}
                placeholder="10001"
                placeholderTextColor={theme.colors.textSecondary}
                value={postcode}
                onChangeText={setPostcode}
                keyboardType="default"
                autoCapitalize="characters"
              />
              {errors.postcode && (
                <Text style={styles.errorText}>{errors.postcode}</Text>
              )}
            </View>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>Phone (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 555 123 4567"
                placeholderTextColor={theme.colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Default checkboxes */}
          <View style={styles.checkboxSection}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsDefaultShipping(!isDefaultShipping)}
            >
              <View
                style={[styles.checkbox, isDefaultShipping && styles.checkboxChecked]}
              >
                {isDefaultShipping && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.onPrimary} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Set as default shipping address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsDefaultBilling(!isDefaultBilling)}
            >
              <View
                style={[styles.checkbox, isDefaultBilling && styles.checkboxChecked]}
              >
                {isDefaultBilling && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.onPrimary} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Set as default billing address</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Save Changes' : 'Add Address'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    backButton: {
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
    form: {
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    flex1: {
      flex: 1,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      height: 48,
      fontSize: 16,
      color: theme.colors.text,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 4,
    },
    picker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      height: 48,
    },
    pickerText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    pickerPlaceholder: {
      color: theme.colors.textSecondary,
    },
    pickerDropdown: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: -8,
      marginBottom: 16,
      maxHeight: 200,
    },
    pickerList: {
      padding: 8,
    },
    pickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    pickerItemText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    pickerItemTextSelected: {
      color: theme.colors.primary,
      fontWeight: '500',
    },
    checkboxSection: {
      marginTop: 8,
      gap: 16,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkboxLabel: {
      fontSize: 14,
      color: theme.colors.text,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.button,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
  });

export default AddressFormScreen;

/**
 * RIDLY Mobile Demo - Product Detail Screen
 *
 * Shows product details from Magento.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Text,
  H1,
  Button,
  Price,
  Badge,
  StatusBadge,
  Card,
  CardContent,
  useTheme,
  useToast,
  useCartStore,
} from '@ridly/mobile-core';
import type { Product, ProductVariant } from '@ridly/mobile-core';

import { magentoAdapter } from '../../lib/adapter';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { theme } = useTheme();
  const { error, success } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const { addItem, itemCount: cartItemCount } = useCartStore();

  // Find the selected variant based on selected options
  // selectedOptions keys are option.code (e.g., "color", "size")
  // variant.options keys are also attr.code (e.g., "color", "size")
  const selectedVariant = useMemo((): ProductVariant | null => {
    if (!product || product.options.length === 0) return null;
    if (Object.keys(selectedOptions).length !== product.options.length) return null;

    return product.variants.find((variant) => {
      return Object.entries(selectedOptions).every(
        ([code, label]) => variant.options[code] === label
      );
    }) || null;
  }, [product, selectedOptions]);

  // Check if all options are selected
  const allOptionsSelected = useMemo(() => {
    if (!product || product.options.length === 0) return true;
    return Object.keys(selectedOptions).length === product.options.length;
  }, [product, selectedOptions]);

  const loadProduct = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await magentoAdapter.getProduct(slug);
      setProduct(result);
    } catch (err) {
      console.error('Failed to load product:', err);
      error('Error', 'Failed to load product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [slug, error]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    // Use selected variant SKU for configurable products
    const skuToAdd = selectedVariant?.sku ?? product.sku;

    setIsAddingToCart(true);
    try {
      await addItem({ productId: skuToAdd, quantity: 1 });
      success('Added to Cart', `${product.name} has been added to your cart.`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      error('Error', 'Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, selectedVariant, addItem, success, error]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text variant="body" color="textSecondary">Product not found</Text>
      </SafeAreaView>
    );
  }

  const hasDiscount = product.specialPrice && product.specialPrice.amount < product.price.amount;
  const displayPrice = hasDiscount ? product.specialPrice!.amount : product.price.amount;
  const originalPrice = hasDiscount ? product.price.amount : undefined;

  const buttonText = !product.inStock
    ? 'Out of Stock'
    : product.options.length > 0 && !allOptionsSelected
      ? 'Select Options'
      : 'Add to Cart';

  const isButtonDisabled = !product.inStock || isAddingToCart || (product.options.length > 0 && !allOptionsSelected);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: product.name,
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/(tabs)/cart')}
              style={styles.headerCartButton}
            >
              <Ionicons name="cart-outline" size={24} color={theme.colors.text} />
              {cartItemCount > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={{ color: theme.colors.onPrimary, fontSize: 10, fontWeight: '600' }}>
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Text>
                </View>
              )}
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {/* Show variant image if selected, otherwise product images */}
          {selectedVariant?.image ? (
            <Image
              source={{ uri: selectedVariant.image.url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : product.images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setActiveImageIndex(index);
              }}
            >
              {product.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.image, styles.noImage, { backgroundColor: theme.colors.border }]}>
              <Text color="textSecondary">No Image</Text>
            </View>
          )}

          {/* Image Indicators - hide when showing variant image */}
          {!selectedVariant?.image && product.images.length > 1 && (
            <View style={styles.indicators}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: index === activeImageIndex
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          {/* Badges */}
          <View style={styles.badges}>
            {!product.inStock && (
              <StatusBadge status="out_of_stock" />
            )}
            {product.inStock && (
              <StatusBadge status="in_stock" />
            )}
            {product.type !== 'simple' && (
              <Badge variant="secondary" size="sm">
                {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
              </Badge>
            )}
          </View>

          {/* Title */}
          <H1 style={{ marginTop: 12 }}>{product.name}</H1>

          {/* SKU */}
          <Text variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
            SKU: {product.sku}
          </Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Price
              price={selectedVariant?.price.amount ?? displayPrice}
              originalPrice={originalPrice}
              currency={product.price.currency}
              size="lg"
            />
          </View>

          {/* Product Options */}
          {product.options.length > 0 && (
            <View style={{ marginTop: 20 }}>
              {product.options.map((option) => (
                <View key={option.id} style={{ marginBottom: 16 }}>
                  <Text variant="label" style={{ marginBottom: 8 }}>
                    {option.label}
                    {selectedOptions[option.code] && (
                      <Text variant="body" color="textSecondary">
                        {': ' + selectedOptions[option.code]}
                      </Text>
                    )}
                  </Text>
                  <View style={styles.optionsRow}>
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.code] === value.label;
                      const isColorSwatch = value.swatch?.startsWith('#');

                      return (
                        <Pressable
                          key={value.id}
                          onPress={() => setSelectedOptions((prev) => ({
                            ...prev,
                            [option.code]: value.label,
                          }))}
                          style={[
                            styles.optionButton,
                            {
                              borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                              borderWidth: isSelected ? 2 : 1,
                              backgroundColor: isColorSwatch
                                ? value.swatch!
                                : theme.colors.surface,
                            },
                            isColorSwatch && styles.swatchButton,
                          ]}
                        >
                          {!isColorSwatch && (
                            <Text
                              variant="body"
                              style={{
                                color: isSelected ? theme.colors.primary : theme.colors.text,
                                fontWeight: isSelected ? '600' : '400',
                              }}
                            >
                              {value.label}
                            </Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          {product.description && (
            <Card variant="outlined" style={{ marginTop: 24 }}>
              <CardContent>
                <Text variant="label" style={{ marginBottom: 8 }}>Description</Text>
                <Text variant="body" color="textSecondary">
                  {product.description.replace(/<[^>]*>/g, '')}
                </Text>
              </CardContent>
            </Card>
          )}

          {/* Categories */}
          {product.categories.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text variant="label" style={{ marginBottom: 8 }}>Categories</Text>
              <View style={styles.categories}>
                {product.categories.map((cat) => (
                  <Badge key={cat.id} variant="secondary" size="sm">
                    {cat.name}
                  </Badge>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Footer with Add to Cart Button */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.background }}>
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <View style={styles.footerPrice}>
            <Text variant="caption" color="textSecondary">Price</Text>
            <Price
              price={selectedVariant?.price.amount ?? displayPrice}
              originalPrice={originalPrice}
              currency={product.price.currency}
              size="md"
            />
          </View>
          <View style={styles.footerButton}>
            <Pressable
              onPress={handleAddToCart}
              disabled={isButtonDisabled}
              style={[
                styles.addToCartButton,
                {
                  backgroundColor: isButtonDisabled ? theme.colors.disabled : theme.colors.primary,
                },
              ]}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                <Text
                  variant="body"
                  style={{
                    color: isButtonDisabled ? theme.colors.disabledText : theme.colors.onPrimary,
                    fontWeight: '600',
                    fontSize: 16,
                  }}
                >
                  {buttonText}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
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
  scrollContent: {
    paddingBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerPrice: {
    flex: 1,
  },
  footerButton: {
    flex: 1,
  },
  addToCartButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCartButton: {
    padding: 8,
    marginRight: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  imageContainer: {
    width: '100%',
    height: width,
    position: 'relative',
  },
  image: {
    width,
    height: width,
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    padding: 16,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceContainer: {
    marginTop: 16,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});

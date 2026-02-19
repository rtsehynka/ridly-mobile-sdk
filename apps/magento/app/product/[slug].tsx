/**
 * RIDLY Mobile Demo - Product Detail Screen
 *
 * Shows product details from Magento.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
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
} from '@ridly/mobile-core';
import type { Product } from '@ridly/mobile-core';

import { magentoAdapter } from '../../lib/adapter';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { theme } = useTheme();
  const { error, success } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const loadProduct = useCallback(async () => {
    if (!slug) return;

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

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    // Cart functionality will be implemented in Week 5
    success('Added to Cart', `${product.name} has been added to your cart.`);
  }, [product, success]);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: product.name }} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {product.images.length > 0 ? (
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

          {/* Image Indicators */}
          {product.images.length > 1 && (
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
              price={displayPrice}
              originalPrice={originalPrice}
              currency={product.price.currency}
              size="lg"
            />
          </View>

          {/* Add to Cart */}
          <Button
            fullWidth
            size="lg"
            disabled={!product.inStock}
            onPress={handleAddToCart}
            style={{ marginTop: 24 }}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>

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
    </SafeAreaView>
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
});

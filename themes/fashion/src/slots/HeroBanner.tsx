/**
 * HeroBanner - Hero section for home screen
 *
 * Displays promotional banner with background image and CTA.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '@ridly/mobile-core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeroBannerProps {
  slotContext?: {
    onShopNow?: () => void;
  };
}

export function HeroBanner({ slotContext }: HeroBannerProps) {
  const { theme } = useTheme();

  // Demo banner data - in real app this would come from CMS
  const banner = {
    label: 'NEW COLLECTION',
    title: 'Summer\nEssentials',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: banner.image }}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {banner.label}
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {banner.title}
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: theme.colors.background }]}
            onPress={slotContext?.onShopNow}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              Shop Now
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  background: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
  },
  backgroundImage: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 16,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

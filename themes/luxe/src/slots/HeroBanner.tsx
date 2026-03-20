/**
 * HeroBanner - Hero slider for home screen
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ImageBackground,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '@ridly/mobile-core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AUTO_SCROLL_INTERVAL = 5000;

interface Banner {
  id: string;
  label: string;
  title: string;
  image: string;
  buttonText?: string;
}

interface HeroBannerProps {
  slotContext?: {
    onShopNow?: () => void;
    onBannerPress?: (bannerId: string) => void;
  };
}

const banners: Banner[] = [
  {
    id: '1',
    label: 'LIMITED OFFER',
    title: 'Up to 50%\nOff',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    buttonText: 'View Deals',
  },
  {
    id: '2',
    label: 'NEW COLLECTION',
    title: 'Summer\nEssentials',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    buttonText: 'Shop Now',
  },
];

export function HeroBanner({ slotContext }: HeroBannerProps) {
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  const scrollToIndex = useCallback((index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  }, []);

  // Auto scroll
  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollTimer.current = setInterval(() => {
        setActiveIndex((prev) => {
          const nextIndex = (prev + 1) % banners.length;
          scrollToIndex(nextIndex);
          return nextIndex;
        });
      }, AUTO_SCROLL_INTERVAL);
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [scrollToIndex]);

  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < banners.length) {
      setActiveIndex(index);
    }
  }, [activeIndex]);

  const handleScrollBegin = useCallback(() => {
    // Pause auto-scroll when user interacts
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
  }, []);

  const handleScrollEnd = useCallback(() => {
    // Resume auto-scroll after user interaction
    autoScrollTimer.current = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % banners.length;
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);
  }, [scrollToIndex]);

  return (
    <View testID="hero-banner" style={styles.container}>
      <ScrollView
        testID="hero-banner-scroll"
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
      >
        {banners.map((banner) => (
          <View key={banner.id} style={styles.bannerWrapper}>
            <View style={styles.bannerInner}>
              <ImageBackground
                source={{ uri: banner.image }}
                style={styles.background}
                imageStyle={styles.backgroundImage}
                resizeMode="cover"
              >
                <View style={styles.overlay} />
                <View style={styles.content}>
                  <Text style={[styles.label, { color: '#FFFFFF' }]}>
                    {banner.label}
                  </Text>
                  <Text style={[styles.title, { color: '#FFFFFF' }]}>
                    {banner.title}
                  </Text>
                  <Pressable
                    style={[styles.button, { backgroundColor: theme.colors.background }]}
                    onPress={() => {
                      if (slotContext?.onBannerPress) {
                        slotContext.onBannerPress(banner.id);
                      } else if (slotContext?.onShopNow) {
                        slotContext.onShopNow();
                      }
                    }}
                  >
                    <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                      {banner.buttonText || 'Shop Now'}
                    </Text>
                  </Pressable>
                </View>
              </ImageBackground>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Indicators */}
      <View style={styles.indicators}>
        {banners.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => {
              setActiveIndex(index);
              scrollToIndex(index);
            }}
          >
            <View
              style={[
                styles.indicator,
                {
                  backgroundColor: index === activeIndex
                    ? theme.colors.primary
                    : 'rgba(255, 255, 255, 0.5)',
                  width: index === activeIndex ? 24 : 8,
                },
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
  },
  bannerWrapper: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 16,
  },
  bannerInner: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
});

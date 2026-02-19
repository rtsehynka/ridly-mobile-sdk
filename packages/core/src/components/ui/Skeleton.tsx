/**
 * RIDLY Mobile SDK - Skeleton Component
 *
 * Loading placeholder components with shimmer animation.
 */

import { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  type StyleProp,
  type ViewStyle,
  type DimensionValue,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export interface SkeletonProps {
  /**
   * Width of the skeleton
   * @default '100%'
   */
  width?: DimensionValue;

  /**
   * Height of the skeleton
   * @default 16
   */
  height?: DimensionValue;

  /**
   * Border radius
   * @default 4
   */
  borderRadius?: number;

  /**
   * Circle skeleton
   * @default false
   */
  circle?: boolean;

  /**
   * Disable animation
   * @default false
   */
  noAnimation?: boolean;

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * Skeleton Component
 *
 * @example
 * ```tsx
 * <Skeleton width={200} height={20} />
 * <Skeleton circle width={50} height={50} />
 * <Skeleton width="100%" height={150} borderRadius={8} />
 * ```
 */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  circle = false,
  noAnimation = false,
  style,
}: SkeletonProps) {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (noAnimation) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [shimmerAnim, noAnimation]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const resolvedBorderRadius = circle
    ? typeof height === 'number'
      ? height / 2
      : 999
    : borderRadius;

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: resolvedBorderRadius,
          backgroundColor: theme.isDark ? '#374151' : '#E5E7EB',
          opacity: noAnimation ? 0.5 : opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton Text - Simulates text lines
 *
 * @example
 * ```tsx
 * <SkeletonText lines={3} />
 * ```
 */
export interface SkeletonTextProps {
  /**
   * Number of lines
   * @default 1
   */
  lines?: number;

  /**
   * Line height
   * @default 16
   */
  lineHeight?: number;

  /**
   * Gap between lines
   * @default 8
   */
  gap?: number;

  /**
   * Make last line shorter
   * @default true
   */
  lastLineShort?: boolean;

  /**
   * Custom style for container
   */
  style?: StyleProp<ViewStyle>;
}

export function SkeletonText({
  lines = 1,
  lineHeight = 16,
  gap = 8,
  lastLineShort = true,
  style,
}: SkeletonTextProps) {
  return (
    <View style={[{ gap }, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={lastLineShort && index === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </View>
  );
}

/**
 * Skeleton Card - Product card placeholder
 *
 * @example
 * ```tsx
 * <SkeletonCard />
 * ```
 */
export interface SkeletonCardProps {
  /**
   * Show image placeholder
   * @default true
   */
  showImage?: boolean;

  /**
   * Image aspect ratio
   * @default 1
   */
  imageAspectRatio?: number;

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;
}

export function SkeletonCard({
  showImage = true,
  imageAspectRatio = 1,
  style,
}: SkeletonCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.card,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* Image */}
      {showImage && (
        <Skeleton
          width="100%"
          height={0}
          style={{ aspectRatio: imageAspectRatio }}
          borderRadius={0}
        />
      )}

      {/* Content */}
      <View style={{ padding: 12, gap: 8 }}>
        {/* Title */}
        <Skeleton height={18} width="80%" />

        {/* Subtitle */}
        <Skeleton height={14} width="60%" />

        {/* Price */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <Skeleton height={20} width={60} />
          <Skeleton height={16} width={40} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton List - List of items placeholder
 *
 * @example
 * ```tsx
 * <SkeletonList count={5} />
 * ```
 */
export interface SkeletonListProps {
  /**
   * Number of items
   * @default 3
   */
  count?: number;

  /**
   * Show avatar/image on left
   * @default false
   */
  showAvatar?: boolean;

  /**
   * Avatar size
   * @default 48
   */
  avatarSize?: number;

  /**
   * Gap between items
   * @default 16
   */
  gap?: number;

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;
}

export function SkeletonList({
  count = 3,
  showAvatar = false,
  avatarSize = 48,
  gap = 16,
  style,
}: SkeletonListProps) {
  return (
    <View style={[{ gap }, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {showAvatar && (
            <Skeleton circle width={avatarSize} height={avatarSize} />
          )}
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton height={16} width="70%" />
            <Skeleton height={12} width="50%" />
          </View>
        </View>
      ))}
    </View>
  );
}

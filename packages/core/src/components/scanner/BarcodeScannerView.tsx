/**
 * Barcode Scanner View Component
 *
 * Ready-to-use barcode scanner UI component.
 * Uses expo-barcode-scanner for cross-platform scanning.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface BarcodeScannerViewProps {
  /** Called when a barcode is scanned */
  onScanned: (data: { type: string; data: string }) => void;

  /** Called when scanner is closed */
  onClose?: () => void;

  /** Barcode types to scan (default: all) */
  barcodeTypes?: string[];

  /** Show torch/flash button */
  showTorchButton?: boolean;

  /** Scanner overlay style */
  overlayStyle?: 'full' | 'corners' | 'minimal';

  /** Custom instructions text */
  instructionText?: string;

  /** Theme colors */
  theme?: {
    primary: string;
    background: string;
    text: string;
    overlay: string;
  };

  /** Prevent scanning same barcode repeatedly (ms) */
  scanCooldown?: number;
}

const defaultTheme = {
  primary: '#D4AF37',
  background: '#000000',
  text: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_AREA_SIZE = Math.min(SCREEN_WIDTH * 0.75, 300);

/**
 * Barcode Scanner View
 *
 * Full-screen barcode scanner with permission handling and UI overlay.
 *
 * @example
 * ```tsx
 * <BarcodeScannerView
 *   onScanned={({ data, type }) => {
 *     console.log('Scanned:', type, data);
 *     // Navigate to product or search
 *   }}
 *   onClose={() => navigation.goBack()}
 *   showTorchButton
 * />
 * ```
 */
export function BarcodeScannerView({
  onScanned,
  onClose,
  barcodeTypes,
  showTorchButton = true,
  overlayStyle = 'corners',
  instructionText = 'Point the camera at a barcode',
  theme: themeProp,
  scanCooldown = 2000,
}: BarcodeScannerViewProps) {
  const theme = { ...defaultTheme, ...themeProp };

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [BarCodeScanner, setBarCodeScanner] = useState<any>(null);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);

  // Animation for scan line
  const scanLineAnim = React.useRef(new Animated.Value(0)).current;

  // Load BarCodeScanner dynamically
  useEffect(() => {
    const loadScanner = async () => {
      try {
        const module = await import('expo-barcode-scanner');
        setBarCodeScanner(module.BarCodeScanner);

        const { status } = await module.BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('[BarcodeScannerView] Failed to load scanner:', error);
        setHasPermission(false);
      }
    };

    loadScanner();
  }, []);

  // Animate scan line
  useEffect(() => {
    if (hasPermission && !scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [hasPermission, scanned, scanLineAnim]);

  const handleBarCodeScanned = useCallback(
    ({ type, data }: { type: string; data: string }) => {
      // Prevent duplicate scans
      if (scanned || data === lastScannedData) {
        return;
      }

      setScanned(true);
      setLastScannedData(data);

      // Call handler
      onScanned({ type, data });

      // Reset after cooldown
      setTimeout(() => {
        setScanned(false);
      }, scanCooldown);
    },
    [scanned, lastScannedData, onScanned, scanCooldown]
  );

  const toggleTorch = useCallback(() => {
    setTorch((prev) => !prev);
  }, []);

  // Loading state
  if (hasPermission === null || !BarCodeScanner) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading camera...
        </Text>
      </View>
    );
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Ionicons name="camera-off" size={64} color={theme.text} />
        <Text style={[styles.permissionText, { color: theme.text }]}>
          Camera permission is required to scan barcodes
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: theme.primary }]}
          onPress={async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        {onClose && (
          <TouchableOpacity style={styles.closeTextButton} onPress={onClose}>
            <Text style={[styles.closeTextButtonLabel, { color: theme.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        barCodeTypes={barcodeTypes}
        style={StyleSheet.absoluteFillObject}
        flashMode={torch ? 'torch' : 'off'}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top overlay */}
        <View
          style={[
            styles.overlaySection,
            { backgroundColor: theme.overlay, flex: 1 },
          ]}
        />

        {/* Middle row with scan area */}
        <View style={styles.middleRow}>
          {/* Left overlay */}
          <View
            style={[
              styles.overlaySection,
              { backgroundColor: theme.overlay, flex: 1 },
            ]}
          />

          {/* Scan area */}
          <View style={[styles.scanArea, { borderColor: theme.primary }]}>
            {overlayStyle === 'corners' && (
              <>
                <View
                  style={[
                    styles.corner,
                    styles.cornerTopLeft,
                    { borderColor: theme.primary },
                  ]}
                />
                <View
                  style={[
                    styles.corner,
                    styles.cornerTopRight,
                    { borderColor: theme.primary },
                  ]}
                />
                <View
                  style={[
                    styles.corner,
                    styles.cornerBottomLeft,
                    { borderColor: theme.primary },
                  ]}
                />
                <View
                  style={[
                    styles.corner,
                    styles.cornerBottomRight,
                    { borderColor: theme.primary },
                  ]}
                />
              </>
            )}

            {/* Scan line animation */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  backgroundColor: theme.primary,
                  transform: [{ translateY: scanLineTranslate }],
                },
              ]}
            />
          </View>

          {/* Right overlay */}
          <View
            style={[
              styles.overlaySection,
              { backgroundColor: theme.overlay, flex: 1 },
            ]}
          />
        </View>

        {/* Bottom overlay */}
        <View
          style={[
            styles.overlaySection,
            { backgroundColor: theme.overlay, flex: 1 },
          ]}
        >
          <Text style={[styles.instructionText, { color: theme.text }]}>
            {instructionText}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Close button */}
        {onClose && (
          <TouchableOpacity style={styles.controlButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />

        {/* Torch button */}
        {showTorchButton && (
          <TouchableOpacity
            style={[
              styles.controlButton,
              torch && { backgroundColor: theme.primary },
            ]}
            onPress={toggleTorch}
          >
            <Ionicons
              name={torch ? 'flash' : 'flash-outline'}
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Scanned indicator */}
      {scanned && (
        <View style={styles.scannedIndicator}>
          <Ionicons name="checkmark-circle" size={48} color={theme.primary} />
          <Text style={[styles.scannedText, { color: theme.text }]}>
            Barcode scanned!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 32,
  },
  permissionButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeTextButton: {
    marginTop: 16,
    padding: 12,
  },
  closeTextButtonLabel: {
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlaySection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 3,
    borderRadius: 2,
  },
  instructionText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
  },
  controls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedIndicator: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  scannedText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});

export default BarcodeScannerView;

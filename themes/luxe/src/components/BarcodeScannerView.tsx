/**
 * Barcode Scanner View Component
 *
 * Full-screen barcode/QR scanner with overlay.
 * Integrates with scanner plugin from @ridly/mobile-plugins.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useScanner, useTheme } from '@ridly/mobile-core';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

interface BarcodeScannerViewProps {
  /** Called when scan succeeds */
  onScan: (data: string, type: 'barcode' | 'qr') => void;
  /** Called when scanner is closed */
  onClose: () => void;
  /** Title text */
  title?: string;
  /** Subtitle/instruction text */
  subtitle?: string;
}

export function BarcodeScannerView({
  onScan,
  onClose,
  title = 'Scan Code',
  subtitle = 'Position the code within the frame',
}: BarcodeScannerViewProps) {
  const { isAvailable, isScanning, startScan, stopScan } = useScanner();
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [BarCodeScannerComponent, setBarCodeScannerComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const setupScanner = async () => {
      try {
        const BarCodeScanner = await import('expo-barcode-scanner');
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        setBarCodeScannerComponent(() => BarCodeScanner.BarCodeScanner);
      } catch (error) {
        console.error('Failed to setup scanner:', error);
        setHasPermission(false);
      }
    };

    setupScanner();

    return () => {
      stopScan();
    };
  }, [stopScan]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    const scanType = type.toLowerCase().includes('qr') ? 'qr' : 'barcode';
    onScan(data, scanType);
  };

  // Loading state
  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.statusText}>Initializing camera...</Text>
      </View>
    );
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
          Camera Access Required
        </Text>
        <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
          Please enable camera access in your device settings to scan codes.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Scanner not available
  if (!isAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
          Scanner Not Available
        </Text>
        <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
          The barcode scanner is not available on this device.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const Scanner = BarCodeScannerComponent;

  return (
    <View testID="barcode-scanner-view" style={styles.container}>
      {Scanner && (
        <Scanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity testID="scanner-close-button" style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Scan area with corners */}
        <View style={styles.scanAreaContainer}>
          <View style={styles.scanArea}>
            {/* Corner decorations */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.footer}>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scanAreaContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    backgroundColor: 'transparent',
    borderRadius: 20,
    // This creates the "hole" in the overlay
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  footer: {
    paddingBottom: 100,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statusText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BarcodeScannerView;

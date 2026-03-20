/**
 * Barcode Scanner Plugin
 *
 * Barcode and QR code scanning using expo-barcode-scanner.
 * Supports multiple barcode formats.
 */

import type {
  ScannerPlugin,
  ScanResult,
  PluginConfig,
} from '@ridly/mobile-core';
import { createPlugin } from '@ridly/mobile-core';

/**
 * Barcode Scanner configuration
 */
export interface BarcodeScannerConfig extends PluginConfig {
  /** Barcode types to scan */
  barcodeTypes?: string[];
  /** Show torch button */
  showTorch?: boolean;
  /** Initial torch state */
  torchOn?: boolean;
}

/**
 * Create Barcode Scanner Plugin
 */
export function createBarcodeScannerPlugin(): ScannerPlugin {
  let config: BarcodeScannerConfig | null = null;
  let isScanning = false;
  let resolveScanner: ((result: ScanResult) => void) | null = null;
  let rejectScanner: ((error: Error) => void) | null = null;

  const plugin = createPlugin<ScannerPlugin>({
    metadata: {
      id: 'barcode-scanner',
      name: 'Barcode Scanner',
      version: '1.0.0',
      category: 'scanner',
      description: 'Scan barcodes and QR codes',
      author: 'RIDLY',
      platforms: ['any'],
      permissions: ['camera'],
    },

    isActive: false,

    async initialize(cfg?: PluginConfig): Promise<void> {
      config = (cfg as BarcodeScannerConfig) || {};
      console.log('[BarcodeScanner] Initialized');
    },

    async cleanup(): Promise<void> {
      isScanning = false;
      resolveScanner = null;
      rejectScanner = null;
      console.log('[BarcodeScanner] Cleaned up');
    },

    async isAvailable(): Promise<boolean> {
      try {
        const BarCodeScanner = await import('expo-barcode-scanner');
        // expo-barcode-scanner is available if the module loads
        return !!BarCodeScanner;
      } catch {
        return false;
      }
    },

    async requestPermissions(): Promise<boolean> {
      try {
        const BarCodeScanner = await import('expo-barcode-scanner');
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        return status === 'granted';
      } catch {
        return false;
      }
    },

    async startScan(): Promise<ScanResult> {
      if (isScanning) {
        throw new Error('Scanner is already active');
      }

      isScanning = true;

      // Return a promise that will be resolved when handleBarCodeScanned is called
      return new Promise((resolve, reject) => {
        resolveScanner = resolve;
        rejectScanner = reject;

        // The actual scanning UI needs to be rendered by a React component
        // This plugin provides the handler, but the UI must be implemented
        // in the app using BarCodeScanner component

        // Timeout after 60 seconds
        setTimeout(() => {
          if (isScanning) {
            isScanning = false;
            reject(new Error('Scan timeout'));
          }
        }, 60000);
      });
    },

    stopScan(): void {
      isScanning = false;
      if (rejectScanner) {
        rejectScanner(new Error('Scan cancelled'));
      }
      resolveScanner = null;
      rejectScanner = null;
    },

    async parseBarcode(code: string): Promise<unknown> {
      // Parse different barcode formats
      // This is a simplified implementation

      // Check if it's a URL
      if (code.startsWith('http://') || code.startsWith('https://')) {
        return { type: 'url', url: code };
      }

      // Check if it's a product barcode (UPC/EAN)
      if (/^\d{8,14}$/.test(code)) {
        return {
          type: 'product',
          barcode: code,
          format: code.length === 8 ? 'EAN-8' :
                  code.length === 12 ? 'UPC-A' :
                  code.length === 13 ? 'EAN-13' : 'ITF-14',
        };
      }

      // Check if it's a vCard
      if (code.startsWith('BEGIN:VCARD')) {
        return parseVCard(code);
      }

      // Check if it's WiFi config
      if (code.startsWith('WIFI:')) {
        return parseWiFi(code);
      }

      // Default: return raw data
      return { type: 'text', data: code };
    },
  });

  // Add helper method for React components to call
  (plugin as BarcodeScannerPluginExtended).handleBarCodeScanned = (result: {
    type: string;
    data: string;
  }) => {
    if (isScanning && resolveScanner) {
      isScanning = false;
      const scanResult: ScanResult = {
        type: result.type.includes('QR') ? 'qr' : 'barcode',
        data: result.data,
        format: result.type,
      };
      resolveScanner(scanResult);
      resolveScanner = null;
      rejectScanner = null;
    }
  };

  return plugin;
}

/**
 * Extended plugin with handleBarCodeScanned
 */
export interface BarcodeScannerPluginExtended extends ScannerPlugin {
  handleBarCodeScanned: (result: { type: string; data: string }) => void;
}

/**
 * Parse vCard format
 */
function parseVCard(data: string): object {
  const lines = data.split('\n');
  const vcard: Record<string, string> = { type: 'vcard' };

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();

    if (key === 'FN') vcard.name = value;
    if (key === 'TEL') vcard.phone = value;
    if (key === 'EMAIL') vcard.email = value;
    if (key === 'ORG') vcard.organization = value;
  }

  return vcard;
}

/**
 * Parse WiFi config format
 */
function parseWiFi(data: string): object {
  // WIFI:T:WPA;S:NetworkName;P:Password;;
  const params: Record<string, string> = { type: 'wifi' };
  const matches = data.matchAll(/([TSP]):([^;]*)/g);

  for (const match of matches) {
    const [, key, value] = match;
    if (key === 'T') params.encryption = value;
    if (key === 'S') params.ssid = value;
    if (key === 'P') params.password = value;
  }

  return params;
}

/**
 * Default export
 */
export default createBarcodeScannerPlugin;

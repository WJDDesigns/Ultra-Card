/**
 * Ultra Card Config Encoder
 *
 * Encodes/decodes card configs using compression and Base64,
 * similar to row export format - makes configs look "encrypted"
 * instead of plain JSON.
 *
 * Format: UC_CONFIG_V1:{base64_encoded_compressed_json}
 *
 * Sensitive fields (e.g. API keys) are redacted before export
 * so they are never included in exported files or clipboard.
 *
 * @author WJD Designs
 */

import { UltraCardConfig, CardModule, CardColumn } from '../types';
import pako from 'pako';

const CONFIG_PREFIX = 'UC_CONFIG_V1:';

/** Placeholder used in exports when a sensitive value is redacted */
export const SENSITIVE_PLACEHOLDER = '***REDACTED***';

/** Keys that must not be included in exports (e.g. API keys, secrets) */
const SENSITIVE_MODULE_KEYS: string[] = ['google_api_key'];

export class UcConfigEncoder {
  /**
   * Sanitize config for export: deep-clone and redact sensitive fields
   * (e.g. map module google_api_key) so they are never written to file or clipboard.
   */
  static sanitizeForExport(config: UltraCardConfig): UltraCardConfig {
    const cloned = JSON.parse(JSON.stringify(config)) as UltraCardConfig;
    const layout = cloned.layout;
    if (!layout?.rows) return cloned;

    for (const row of layout.rows) {
      const columns: CardColumn[] = row.columns ?? [];
      for (const col of columns) {
        const modules: CardModule[] = col.modules ?? [];
        for (const mod of modules) {
          for (const key of SENSITIVE_MODULE_KEYS) {
            const rec = mod as unknown as Record<string, unknown>;
            if (key in mod && rec[key]) {
              rec[key] = SENSITIVE_PLACEHOLDER;
            }
          }
        }
      }
    }
    return cloned;
  }

  /**
   * Encode config to compressed Base64 string.
   * Sensitive fields are redacted before encoding.
   */
  static encode(config: UltraCardConfig): string {
    try {
      const safe = this.sanitizeForExport(config);
      // Convert config to JSON string
      const jsonString = JSON.stringify(safe);

      // Compress using pako (gzip)
      const compressed = pako.deflate(jsonString);

      // Convert to Base64
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(compressed)));

      // Add prefix for versioning
      return `${CONFIG_PREFIX}${base64}`;
    } catch (error) {
      console.error('Failed to encode config:', error);
      throw new Error('Failed to encode config');
    }
  }

  /**
   * Decode compressed Base64 string back to config
   */
  static decode(encoded: string): UltraCardConfig {
    try {
      // Check for correct prefix
      if (!encoded.startsWith(CONFIG_PREFIX)) {
        throw new Error('Invalid encoded config format');
      }

      // Remove prefix
      const base64 = encoded.substring(CONFIG_PREFIX.length);

      // Decode Base64
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decompress
      const decompressed = pako.inflate(bytes, { to: 'string' });

      // Parse JSON
      const config = JSON.parse(decompressed) as UltraCardConfig;

      return config;
    } catch (error) {
      console.error('Failed to decode config:', error);
      throw new Error('Failed to decode config - invalid or corrupted data');
    }
  }

  /**
   * Check if a string is a valid encoded config
   */
  static isValidEncoded(encoded: string): boolean {
    if (!encoded || typeof encoded !== 'string') {
      return false;
    }

    if (!encoded.startsWith(CONFIG_PREFIX)) {
      return false;
    }

    try {
      // Try to decode
      this.decode(encoded);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get encoded config size info
   */
  static getSizeInfo(encoded: string): {
    encoded_kb: number;
    original_kb: number;
    compression_ratio: number;
  } {
    try {
      const config = this.decode(encoded);
      const originalJson = JSON.stringify(config);

      const encodedSize = new Blob([encoded]).size / 1024;
      const originalSize = new Blob([originalJson]).size / 1024;
      const compressionRatio = Math.round((1 - encodedSize / originalSize) * 100);

      return {
        encoded_kb: Math.round(encodedSize * 100) / 100,
        original_kb: Math.round(originalSize * 100) / 100,
        compression_ratio: compressionRatio,
      };
    } catch {
      return {
        encoded_kb: 0,
        original_kb: 0,
        compression_ratio: 0,
      };
    }
  }

  /**
   * Export config as downloadable file (encoded format)
   */
  static exportToFile(config: UltraCardConfig, filename?: string): void {
    try {
      const encoded = this.encode(config);

      const blob = new Blob([encoded], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `ultra-card-export-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export config:', error);
      throw new Error('Failed to export config to file');
    }
  }

  /**
   * Import config from file (handles both encoded and plain JSON)
   */
  static async importFromFile(file: File): Promise<UltraCardConfig> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => {
        try {
          const content = e.target?.result as string;

          if (!content) {
            reject(new Error('File is empty'));
            return;
          }

          // Try to decode as encoded format first
          if (content.startsWith(CONFIG_PREFIX)) {
            const config = this.decode(content);
            resolve(config);
            return;
          }

          // Fallback: try to parse as plain JSON
          try {
            const config = JSON.parse(content) as UltraCardConfig;
            resolve(config);
            return;
          } catch {
            reject(new Error('File does not contain valid config data'));
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Copy encoded config to clipboard
   */
  static async copyToClipboard(config: UltraCardConfig): Promise<void> {
    try {
      const encoded = this.encode(config);
      const clipboard = (navigator as Navigator).clipboard;
      if (!clipboard) throw new Error('Clipboard API not available');
      await clipboard.writeText(encoded);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw new Error('Failed to copy config to clipboard');
    }
  }

  /**
   * Get config from clipboard (handles both encoded and plain JSON)
   */
  static async pasteFromClipboard(): Promise<UltraCardConfig> {
    try {
      const clipboard = (navigator as Navigator).clipboard;
      if (!clipboard) throw new Error('Clipboard API not available');
      const text = await clipboard.readText();

      if (!text) {
        throw new Error('Clipboard is empty');
      }

      // Try to decode as encoded format first
      if (text.startsWith(CONFIG_PREFIX)) {
        const config = this.decode(text);
        return config;
      }

      // Fallback: try to parse as plain JSON
      try {
        const config = JSON.parse(text) as UltraCardConfig;
        return config;
      } catch {
        throw new Error('Clipboard does not contain valid config data');
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      throw error;
    }
  }
}

// Export helper functions for convenience
export const encodeConfig = UcConfigEncoder.encode.bind(UcConfigEncoder);
export const decodeConfig = UcConfigEncoder.decode.bind(UcConfigEncoder);
export const isValidEncodedConfig = UcConfigEncoder.isValidEncoded.bind(UcConfigEncoder);

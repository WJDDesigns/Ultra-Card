import { ExportData, CardRow, LayoutConfig, CardModule } from '../types';
import { VERSION } from '../version';
import { ucPrivacyService } from './uc-privacy-service';

/**
 * Service for exporting and importing Ultra Card configurations
 * Supports both clipboard operations and file operations
 */
class UcExportImportService {
  /**
   * Export a row to clipboard as Ultra Card shortcode with privacy protection
   */
  async exportRowToClipboard(row: CardRow, name?: string): Promise<void> {
    // Scan for privacy issues
    const privacyScan = ucPrivacyService.scanAndSanitize(row);

    // Show privacy dialog if issues found
    const userConsent = await ucPrivacyService.showPrivacyDialog(privacyScan);
    if (!userConsent) {
      throw new Error('Export cancelled by user');
    }

    const exportData: ExportData = {
      type: 'ultra-card-row',
      version: VERSION,
      data: privacyScan.sanitizedData, // Use sanitized data
      metadata: {
        exported: new Date().toISOString(),
        name: name || 'Exported Row',
        privacyProtected: privacyScan.found.length > 0, // Flag if sanitized
      },
    };

    const shortcode = this._generateShortcode(exportData);
    await this._copyToClipboard(shortcode);
  }

  /**
   * Export a layout to clipboard with privacy protection
   */
  async exportLayoutToClipboard(layout: LayoutConfig, name?: string): Promise<void> {
    // Scan for privacy issues
    const privacyScan = ucPrivacyService.scanAndSanitize(layout);

    // Show privacy dialog if issues found
    const userConsent = await ucPrivacyService.showPrivacyDialog(privacyScan);
    if (!userConsent) {
      throw new Error('Export cancelled by user');
    }

    const exportData: ExportData = {
      type: 'ultra-card-layout',
      version: VERSION,
      data: privacyScan.sanitizedData, // Use sanitized data
      metadata: {
        exported: new Date().toISOString(),
        name: name || 'Exported Layout',
        privacyProtected: privacyScan.found.length > 0, // Flag if sanitized
      },
    };

    const shortcode = this._generateShortcode(exportData);
    await this._copyToClipboard(shortcode);
  }

  /**
   * Export a module to clipboard with privacy protection
   */
  async exportModuleToClipboard(module: CardModule, name?: string): Promise<void> {
    // Scan for privacy issues
    const privacyScan = ucPrivacyService.scanAndSanitize(module);

    // Show privacy dialog if issues found
    const userConsent = await ucPrivacyService.showPrivacyDialog(privacyScan);
    if (!userConsent) {
      throw new Error('Export cancelled by user');
    }

    const exportData: ExportData = {
      type: 'ultra-card-module',
      version: VERSION,
      data: privacyScan.sanitizedData, // Use sanitized data
      metadata: {
        exported: new Date().toISOString(),
        name: name || 'Exported Module',
        privacyProtected: privacyScan.found.length > 0, // Flag if sanitized
      },
    };

    const shortcode = this._generateShortcode(exportData);
    await this._copyToClipboard(shortcode);
  }

  /**
   * Import from shortcode
   */
  importFromShortcode(shortcode: string): ExportData | null {
    try {
      // Clean the shortcode first
      const cleanShortcode = shortcode.trim();

      const match = cleanShortcode.match(/\[ultra_card\]([\s\S]*?)\[\/ultra_card\]/);
      if (!match) {
        throw new Error('Invalid Ultra Card shortcode format');
      }

      const encodedData = match[1].trim();

      // Validate base64 encoding
      if (!encodedData || encodedData.length === 0) {
        throw new Error('Empty shortcode data');
      }

      let jsonData: string;
      try {
        // Use proper Unicode-aware decoding to preserve empty character glyphs
        jsonData = this._decodeFromBase64(encodedData);
      } catch (decodeError) {
        throw new Error('Invalid base64 encoding in shortcode');
      }

      // Clean JSON data and validate
      const cleanJsonData = jsonData.trim();
      if (!cleanJsonData || cleanJsonData.length === 0) {
        throw new Error('Empty JSON data in shortcode');
      }

      let exportData: ExportData;
      try {
        exportData = JSON.parse(cleanJsonData);
      } catch (jsonError) {
        // Try to fix common JSON issues
        const fixedJson = this._attemptJsonFix(cleanJsonData);
        if (fixedJson) {
          exportData = JSON.parse(fixedJson);
        } else {
          throw new Error(
            `Invalid JSON in shortcode: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`
          );
        }
      }

      // Validate the import data
      if (!this._isValidExportData(exportData)) {
        throw new Error('Invalid export data structure');
      }

      // Regenerate IDs to avoid conflicts
      exportData.data = this._regenerateIds(exportData.data, exportData.type);

      return exportData;
    } catch (error) {
      console.error('Failed to import from shortcode:', error);
      return null;
    }
  }

  /**
   * Import from clipboard
   */
  async importFromClipboard(): Promise<ExportData | null> {
    try {
      // Check if the modern clipboard API is available
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (!text || text.trim().length === 0) {
          console.warn('Clipboard is empty');
          return null;
        }
        return this.importFromShortcode(text);
      } else {
        // Fallback: prompt user to paste manually
        const text = prompt('Paste your Ultra Card shortcode here:');
        if (!text || text.trim().length === 0) {
          return null;
        }
        return this.importFromShortcode(text);
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      // If modern API fails, try fallback
      try {
        const text = prompt(
          'Clipboard access failed. Please paste your Ultra Card shortcode here:'
        );
        if (!text || text.trim().length === 0) {
          return null;
        }
        return this.importFromShortcode(text);
      } catch (fallbackError) {
        console.error('Fallback paste also failed:', fallbackError);
        return null;
      }
    }
  }

  /**
   * Export to file download with privacy protection
   */
  async exportToFile(
    data: CardRow | LayoutConfig | CardModule,
    type: ExportData['type'],
    name: string
  ): Promise<void> {
    // Scan for privacy issues
    const privacyScan = ucPrivacyService.scanAndSanitize(data);

    // Show privacy dialog if issues found
    const userConsent = await ucPrivacyService.showPrivacyDialog(privacyScan);
    if (!userConsent) {
      throw new Error('Export cancelled by user');
    }

    const exportData: ExportData = {
      type,
      version: VERSION,
      data: privacyScan.sanitizedData, // Use sanitized data
      metadata: {
        exported: new Date().toISOString(),
        name,
        privacyProtected: privacyScan.found.length > 0, // Flag if sanitized
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ultracard`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import from file
   */
  async importFromFile(file: File): Promise<ExportData | null> {
    try {
      const text = await file.text();
      const exportData: ExportData = JSON.parse(text);

      if (!this._isValidExportData(exportData)) {
        throw new Error('Invalid file format');
      }

      // Regenerate IDs to avoid conflicts
      exportData.data = this._regenerateIds(exportData.data, exportData.type);

      return exportData;
    } catch (error) {
      console.error('Failed to import from file:', error);
      return null;
    }
  }

  /**
   * Encode a Unicode string to base64, properly handling all Unicode characters
   * including empty character glyphs (zero-width spaces, non-breaking spaces, etc.)
   */
  private _encodeToBase64(str: string): string {
    try {
      // Use TextEncoder to properly handle Unicode characters
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      // Convert bytes to binary string for btoa
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      // Fallback: use encodeURIComponent if TextEncoder fails
      console.warn('TextEncoder failed, using fallback encoding:', error);
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    }
  }

  /**
   * Decode base64 string back to Unicode, properly handling all Unicode characters
   */
  private _decodeFromBase64(str: string): string {
    try {
      // Decode base64 to binary string
      const binary = atob(str);
      // Convert binary string to bytes
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      // Use TextDecoder to properly decode Unicode
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } catch (error) {
      // Fallback: use decodeURIComponent if TextDecoder fails
      console.warn('TextDecoder failed, using fallback decoding:', error);
      try {
        const binary = atob(str);
        let result = '';
        for (let i = 0; i < binary.length; i++) {
          result += '%' + ('00' + binary.charCodeAt(i).toString(16)).slice(-2);
        }
        return decodeURIComponent(result);
      } catch (fallbackError) {
        throw new Error('Failed to decode base64 string');
      }
    }
  }

  /**
   * Generate Ultra Card shortcode format
   */
  private _generateShortcode(exportData: ExportData): string {
    const jsonString = JSON.stringify(exportData);
    // Properly handle Unicode characters (including empty character glyphs)
    // by encoding to UTF-8 before base64 encoding
    const encodedData = this._encodeToBase64(jsonString);
    return `[ultra_card]${encodedData}[/ultra_card]`;
  }

  /**
   * Copy text to clipboard
   */
  private async _copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  /**
   * Validate export data structure
   */
  private _isValidExportData(data: any): data is ExportData {
    return (
      data &&
      typeof data.type === 'string' &&
      ['ultra-card-row', 'ultra-card-layout', 'ultra-card-module'].includes(data.type) &&
      typeof data.version === 'string' &&
      data.data &&
      data.metadata &&
      typeof data.metadata.exported === 'string'
    );
  }

  /**
   * Attempt to fix common JSON issues
   */
  private _attemptJsonFix(jsonString: string): string | null {
    try {
      // Remove trailing commas before closing brackets/braces
      let fixed = jsonString.replace(/,\s*([}\]])/g, '$1');

      // Remove any non-JSON characters at the end
      fixed = fixed.replace(/[^}\]]*$/, '');

      // Try to find the last complete JSON object/array
      const lastBrace = fixed.lastIndexOf('}');
      const lastBracket = fixed.lastIndexOf(']');
      const lastIndex = Math.max(lastBrace, lastBracket);

      if (lastIndex > 0) {
        fixed = fixed.substring(0, lastIndex + 1);
      }

      // Test if the fixed JSON parses
      JSON.parse(fixed);
      return fixed;
    } catch {
      return null;
    }
  }

  /**
   * Regenerate IDs in imported data to avoid conflicts
   */
  private _regenerateIds(data: any, type: ExportData['type']): any {
    const cloned = JSON.parse(JSON.stringify(data));

    switch (type) {
      case 'ultra-card-row':
        return this._regenerateRowIds(cloned);
      case 'ultra-card-layout':
        return this._regenerateLayoutIds(cloned);
      case 'ultra-card-module':
        return this._regenerateModuleIds(cloned);
      default:
        return cloned;
    }
  }

  private _regenerateRowIds(row: CardRow): CardRow {
    row.id = `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    row.columns = row.columns.map((column, colIndex) => ({
      ...column,
      id: `col-${Date.now()}-${colIndex}-${Math.random().toString(36).substr(2, 9)}`,
      modules: column.modules.map((module, moduleIndex) => ({
        ...module,
        id: `${module.type}-${Date.now()}-${moduleIndex}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    }));

    return row;
  }

  private _regenerateLayoutIds(layout: LayoutConfig): LayoutConfig {
    layout.rows = layout.rows.map(row => this._regenerateRowIds(row));
    return layout;
  }

  private _regenerateModuleIds(module: CardModule): CardModule {
    module.id = `${module.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return module;
  }
}

// Export singleton instance
export const ucExportImportService = new UcExportImportService();

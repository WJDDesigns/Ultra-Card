import { ExportData, CardRow, LayoutConfig, CardModule, CardColumn, UltraCardConfig, CustomVariable } from '../types';
import { VERSION } from '../version';
import { ucPrivacyService } from './uc-privacy-service';
import { ucCustomVariablesService } from './uc-custom-variables-service';
import { scanConfigForVariables } from '../utils/uc-template-processor';

/**
 * Service for exporting and importing Ultra Card configurations
 * Supports both clipboard operations and file operations
 */
class UcExportImportService {
  /**
   * Export a row to clipboard as Ultra Card shortcode with privacy protection
   * @param cardConfig Optional card config to get card-specific variables from
   */
  async exportRowToClipboard(row: CardRow, name?: string, cardConfig?: UltraCardConfig): Promise<void> {
    // Scan for privacy issues
    const privacyScan = ucPrivacyService.scanAndSanitize(row);

    // Show privacy dialog if issues found
    const userConsent = await ucPrivacyService.showPrivacyDialog(privacyScan);
    if (!userConsent) {
      throw new Error('Export cancelled by user');
    }

    // Scan for variables used in the row and include them in export
    const usedVarNames = scanConfigForVariables(row);
    const variablesToExport: CustomVariable[] = [];
    
    for (const varName of usedVarNames) {
      // Check card-specific variables first (they take priority)
      const cardVar = cardConfig?._customVariables?.find(
        v => v.name.toLowerCase() === varName.toLowerCase()
      );
      if (cardVar) {
        variablesToExport.push({ ...cardVar, isGlobal: false }); // Ensure isGlobal is set
        continue;
      }
      
      // Check global variables
      const globalVar = ucCustomVariablesService.getVariableByName(varName);
      if (globalVar) {
        variablesToExport.push({ ...globalVar, isGlobal: true }); // Ensure isGlobal is set
      }
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
      customVariables: variablesToExport.length > 0 ? variablesToExport : undefined,
    };

    const shortcode = this._generateShortcode(exportData);
    await this._copyToClipboard(shortcode);
    
    // Mark that export data is available in clipboard
    this.markExportedToClipboard('ultra-card-row');
  }

  /**
   * Export a layout to clipboard with privacy protection
   * @param cardConfig Optional card config to get card-specific variables from
   */
  async exportLayoutToClipboard(layout: LayoutConfig, name?: string, cardConfig?: UltraCardConfig): Promise<void> {
    // Scan for privacy issues
    const privacyScan = ucPrivacyService.scanAndSanitize(layout);

    // Show privacy dialog if issues found
    const userConsent = await ucPrivacyService.showPrivacyDialog(privacyScan);
    if (!userConsent) {
      throw new Error('Export cancelled by user');
    }

    // Scan for variables used in the layout and include them in export
    const usedVarNames = scanConfigForVariables(layout);
    const variablesToExport: CustomVariable[] = [];
    
    for (const varName of usedVarNames) {
      // Check card-specific variables first (they take priority)
      const cardVar = cardConfig?._customVariables?.find(
        v => v.name.toLowerCase() === varName.toLowerCase()
      );
      if (cardVar) {
        variablesToExport.push({ ...cardVar, isGlobal: false });
        continue;
      }
      
      // Check global variables
      const globalVar = ucCustomVariablesService.getVariableByName(varName);
      if (globalVar) {
        variablesToExport.push({ ...globalVar, isGlobal: true });
      }
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
      customVariables: variablesToExport.length > 0 ? variablesToExport : undefined,
    };

    const shortcode = this._generateShortcode(exportData);
    await this._copyToClipboard(shortcode);
    
    // Mark that export data is available in clipboard
    this.markExportedToClipboard('ultra-card-layout');
  }

  /**
   * Export a module to clipboard with privacy protection
   * @param cardConfig Optional card config to get card-specific variables from
   */
  async exportModuleToClipboard(module: CardModule, name?: string, cardConfig?: UltraCardConfig): Promise<void> {
    // Scan for privacy issues
    const privacyScan = ucPrivacyService.scanAndSanitize(module);

    // Show privacy dialog if issues found
    const userConsent = await ucPrivacyService.showPrivacyDialog(privacyScan);
    if (!userConsent) {
      throw new Error('Export cancelled by user');
    }

    // Scan for variables used in the module and include them in export
    const usedVarNames = scanConfigForVariables(module);
    const variablesToExport: CustomVariable[] = [];
    
    for (const varName of usedVarNames) {
      // Check card-specific variables first (they take priority)
      const cardVar = cardConfig?._customVariables?.find(
        v => v.name.toLowerCase() === varName.toLowerCase()
      );
      if (cardVar) {
        variablesToExport.push({ ...cardVar, isGlobal: false });
        continue;
      }
      
      // Check global variables
      const globalVar = ucCustomVariablesService.getVariableByName(varName);
      if (globalVar) {
        variablesToExport.push({ ...globalVar, isGlobal: true });
      }
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
      customVariables: variablesToExport.length > 0 ? variablesToExport : undefined,
    };

    const shortcode = this._generateShortcode(exportData);
    await this._copyToClipboard(shortcode);
    
    // Mark that export data is available in clipboard
    this.markExportedToClipboard('ultra-card-module');
  }

  /**
   * Export full card configuration to clipboard with privacy protection
   * Automatically includes all variables used in the config (both global and card-specific)
   * @param config Card configuration to export
   * @param name Optional name for the export
   */
  /**
   * Generate the full [ultra_card]...[/ultra_card] shortcode for a card config
   * without copying to clipboard or showing the privacy dialog.
   * Used when sharing a preset from the layout builder.
   */
  generateCardShortcode(config: UltraCardConfig, name?: string): string {
    // Strip personal data (same as exportCardToClipboard)
    const sanitized = { ...config };
    delete sanitized.favorite_colors;

    // Gather variables referenced in the config
    const usedVarNames = scanConfigForVariables(config);
    const variablesToExport: CustomVariable[] = [];
    for (const varName of usedVarNames) {
      const cardVar = config._customVariables?.find(
        v => v.name.toLowerCase() === varName.toLowerCase()
      );
      if (cardVar) {
        variablesToExport.push({ ...cardVar, isGlobal: false });
        continue;
      }
      const globalVar = ucCustomVariablesService.getVariableByName(varName);
      if (globalVar) variablesToExport.push({ ...globalVar, isGlobal: true });
    }

    const exportData: ExportData = {
      type: 'ultra-card-full',
      version: VERSION,
      data: sanitized,
      metadata: {
        exported: new Date().toISOString(),
        name: name || config.card_name || 'Ultra Card',
        privacyProtected: true,
      },
      customVariables: variablesToExport.length > 0 ? variablesToExport : undefined,
    };

    return this._generateShortcode(exportData);
  }

  async exportCardToClipboard(config: UltraCardConfig, name?: string): Promise<void> {
    // Scan for privacy issues
    const privacyScan = ucPrivacyService.scanAndSanitize(config);

    // Show privacy dialog if issues found
    const userConsent = await ucPrivacyService.showPrivacyDialog(privacyScan);
    if (!userConsent) {
      throw new Error('Export cancelled by user');
    }

    // Scan for variables used in the config and include them in export
    const usedVarNames = scanConfigForVariables(config);
    const variablesToExport: CustomVariable[] = [];
    
    for (const varName of usedVarNames) {
      // Check card-specific variables first (they take priority)
      const cardVar = config._customVariables?.find(
        v => v.name.toLowerCase() === varName.toLowerCase()
      );
      if (cardVar) {
        variablesToExport.push({ ...cardVar, isGlobal: false }); // Ensure isGlobal is set
        continue;
      }
      
      // Check global variables
      const globalVar = ucCustomVariablesService.getVariableByName(varName);
      if (globalVar) {
        variablesToExport.push({ ...globalVar, isGlobal: true }); // Ensure isGlobal is set
      }
    }

    // Strip personal data (favorite colors are user-local, not part of shared configs)
    const sanitizedExport = { ...privacyScan.sanitizedData };
    delete sanitizedExport.favorite_colors;

    const exportData: ExportData = {
      type: 'ultra-card-full',
      version: VERSION,
      data: sanitizedExport,
      metadata: {
        exported: new Date().toISOString(),
        name: name || config.card_name || 'Exported Card',
        privacyProtected: privacyScan.found.length > 0, // Flag if sanitized
      },
      customVariables: variablesToExport.length > 0 ? variablesToExport : undefined,
    };

    const shortcode = this._generateShortcode(exportData);
    await this._copyToClipboard(shortcode);
    
    // Mark that export data is available in clipboard
    this.markExportedToClipboard('ultra-card-full');
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
      const nav = navigator as unknown as Navigator;
      if (nav.clipboard && nav.clipboard.readText) {
        const text = await nav.clipboard.readText();
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
      await (navigator as unknown as Navigator).clipboard.writeText(text);
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
      ['ultra-card-row', 'ultra-card-layout', 'ultra-card-module', 'ultra-card-full'].includes(data.type) &&
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
      case 'ultra-card-full':
        return this._regenerateCardIds(cloned);
      default:
        return cloned;
    }
  }

  private _regenerateRowIds(row: CardRow): CardRow {
    row.id = `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    row.columns = row.columns.map((column, colIndex) => ({
      ...column,
      id: `col-${Date.now()}-${colIndex}-${Math.random().toString(36).substr(2, 9)}`,
      modules: column.modules.map((module) => this._regenerateModuleIds(module as any) as CardModule),
    }));

    return row;
  }

  private _regenerateLayoutIds(layout: LayoutConfig): LayoutConfig {
    layout.rows = layout.rows.map(row => this._regenerateRowIds(row));
    return layout;
  }

  private _regenerateCardIds(config: UltraCardConfig): UltraCardConfig {
    // Regenerate all layout IDs
    if (config.layout) {
      config.layout = this._regenerateLayoutIds(config.layout);
    }
    return config;
  }

  /**
   * Comprehensively regenerate IDs for a module and all nested content
   * Handles: info_entities, icons, dropdown options, slider bars, and nested layout modules
   */
  private _regenerateModuleIds(module: any): any {
    // Generate new ID for the module itself
    module.id = `${module.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // If this is a layout module (horizontal/vertical/accordion/popup), regenerate IDs for all nested modules
    if ((module.type === 'horizontal' || module.type === 'vertical' || module.type === 'accordion' || module.type === 'popup') && module.modules) {
      module.modules.forEach((childModule: any) => {
        this._regenerateModuleIds(childModule); // Recursive for nested layouts
      });
    }

    // Handle info modules with entities
    if (module.type === 'info' && module.info_entities) {
      module.info_entities.forEach((entity: any) => {
        entity.id = `info-entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      });
    }

    // Handle icon modules with icons array
    if (module.type === 'icon' && module.icons) {
      module.icons.forEach((icon: any) => {
        icon.id = `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      });
    }

    // Handle dropdown modules with options
    if (module.type === 'dropdown' && module.options && Array.isArray(module.options)) {
      module.options.forEach((option: any) => {
        if (option.id) {
          option.id = `dropdown-option-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
      });
    }

    // Handle slider control modules with bars
    if (module.type === 'slider_control' && module.bars && Array.isArray(module.bars)) {
      module.bars.forEach((bar: any) => {
        if (bar.id) {
          bar.id = `slider-bar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
      });
    }

    // Handle graph modules with bars
    if (module.type === 'graph' && module.bars && Array.isArray(module.bars)) {
      module.bars.forEach((bar: any) => {
        if (bar.id) {
          bar.id = `graph-bar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
      });
    }

    // Handle button modules with buttons array
    if (module.type === 'button' && module.buttons && Array.isArray(module.buttons)) {
      module.buttons.forEach((button: any) => {
        if (button.id) {
          button.id = `button-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
      });
    }

    // Handle image modules with images array
    if (module.type === 'image' && module.images && Array.isArray(module.images)) {
      module.images.forEach((image: any) => {
        if (image.id) {
          image.id = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
      });
    }

    return module;
  }

  // ========== LOCAL STORAGE CLIPBOARD METHODS ==========
  // These methods provide quick copy/paste functionality for modules
  // using localStorage for cross-card persistence without privacy dialogs

  private readonly CLIPBOARD_KEY = 'ultra-card-module-clipboard';
  private readonly CLIPBOARD_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
  
  // In-memory fallback when localStorage is full
  private _memoryClipboard: { version: string; timestamp: number; module: CardModule } | null = null;

  /**
   * Copy a module to localStorage for quick paste across cards
   * Falls back to sessionStorage or memory if localStorage quota is exceeded
   */
  copyModuleToLocalStorage(module: CardModule): void {
    // Deep clone the module to avoid reference issues
    const clonedModule = JSON.parse(JSON.stringify(module));
    
    const clipboardData = {
      version: VERSION,
      timestamp: Date.now(),
      module: clonedModule,
    };

    const dataString = JSON.stringify(clipboardData);

    // Try localStorage first
    try {
      // Clear any existing clipboard data first to free space
      localStorage.removeItem(this.CLIPBOARD_KEY);
      localStorage.setItem(this.CLIPBOARD_KEY, dataString);
      this._memoryClipboard = null; // Clear memory fallback
      return;
    } catch (e) {
      // localStorage quota exceeded or not available
      console.warn('localStorage quota exceeded, trying sessionStorage...');
    }

    // Try sessionStorage as fallback
    try {
      sessionStorage.removeItem(this.CLIPBOARD_KEY);
      sessionStorage.setItem(this.CLIPBOARD_KEY, dataString);
      this._memoryClipboard = null;
      return;
    } catch (e) {
      // sessionStorage also full or not available
      console.warn('sessionStorage also full, using memory fallback');
    }

    // Use memory as final fallback
    this._memoryClipboard = clipboardData;
  }

  /**
   * Get a module from clipboard (checks localStorage, sessionStorage, then memory)
   * Returns null if clipboard is empty or expired
   */
  getModuleFromLocalStorage(): CardModule | null {
    let clipboardData: { version: string; timestamp: number; module: CardModule } | null = null;

    // Try localStorage first
    try {
      const stored = localStorage.getItem(this.CLIPBOARD_KEY);
      if (stored) {
        clipboardData = JSON.parse(stored);
      }
    } catch (e) {
      // localStorage not available
    }

    // Try sessionStorage if localStorage didn't have it
    if (!clipboardData) {
      try {
        const stored = sessionStorage.getItem(this.CLIPBOARD_KEY);
        if (stored) {
          clipboardData = JSON.parse(stored);
        }
      } catch (e) {
        // sessionStorage not available
      }
    }

    // Try memory fallback
    if (!clipboardData && this._memoryClipboard) {
      clipboardData = this._memoryClipboard;
    }

    if (!clipboardData) return null;

    // Check if clipboard data has expired
    if (Date.now() - clipboardData.timestamp > this.CLIPBOARD_EXPIRY_MS) {
      this.clearModuleClipboard();
      return null;
    }

    // Validate module exists
    if (!clipboardData.module || !clipboardData.module.type) {
      return null;
    }

    // Deep clone and regenerate IDs to avoid conflicts
    const clonedModule = JSON.parse(JSON.stringify(clipboardData.module));
    return this._regenerateModuleIds(clonedModule);
  }

  /**
   * Check if there's a valid module in the clipboard (localStorage, sessionStorage, or memory)
   */
  hasModuleInLocalStorage(): boolean {
    let clipboardData: { version: string; timestamp: number; module: CardModule } | null = null;

    // Try localStorage first
    try {
      const stored = localStorage.getItem(this.CLIPBOARD_KEY);
      if (stored) {
        clipboardData = JSON.parse(stored);
      }
    } catch (e) {
      // localStorage not available
    }

    // Try sessionStorage
    if (!clipboardData) {
      try {
        const stored = sessionStorage.getItem(this.CLIPBOARD_KEY);
        if (stored) {
          clipboardData = JSON.parse(stored);
        }
      } catch (e) {
        // sessionStorage not available
      }
    }

    // Try memory fallback
    if (!clipboardData && this._memoryClipboard) {
      clipboardData = this._memoryClipboard;
    }

    if (!clipboardData) return false;

    // Check if clipboard data has expired
    if (Date.now() - clipboardData.timestamp > this.CLIPBOARD_EXPIRY_MS) {
      this.clearModuleClipboard();
      return false;
    }

    // Validate module exists
    return !!(clipboardData.module && clipboardData.module.type);
  }

  /**
   * Get the type/name of the module currently in clipboard
   * Useful for showing what will be pasted
   */
  getClipboardModuleType(): string | null {
    let clipboardData: { version: string; timestamp: number; module: CardModule } | null = null;

    // Try localStorage first
    try {
      const stored = localStorage.getItem(this.CLIPBOARD_KEY);
      if (stored) {
        clipboardData = JSON.parse(stored);
      }
    } catch (e) {
      // localStorage not available
    }

    // Try sessionStorage
    if (!clipboardData) {
      try {
        const stored = sessionStorage.getItem(this.CLIPBOARD_KEY);
        if (stored) {
          clipboardData = JSON.parse(stored);
        }
      } catch (e) {
        // sessionStorage not available
      }
    }

    // Try memory fallback
    if (!clipboardData && this._memoryClipboard) {
      clipboardData = this._memoryClipboard;
    }

    if (!clipboardData) return null;

    // Check if clipboard data has expired
    if (Date.now() - clipboardData.timestamp > this.CLIPBOARD_EXPIRY_MS) {
      return null;
    }

    return clipboardData.module?.type || null;
  }

  /**
   * Clear the clipboard from all storage locations
   */
  clearModuleClipboard(): void {
    try {
      localStorage.removeItem(this.CLIPBOARD_KEY);
    } catch (e) {
      // localStorage not available
    }
    try {
      sessionStorage.removeItem(this.CLIPBOARD_KEY);
    } catch (e) {
      // sessionStorage not available
    }
    this._memoryClipboard = null;
  }

  // ========== COLUMN CLIPBOARD METHODS ==========
  // These methods provide quick copy/paste functionality for columns

  private readonly COLUMN_CLIPBOARD_KEY = 'ultra-card-column-clipboard';
  
  // In-memory fallback when localStorage is full
  private _memoryColumnClipboard: { version: string; timestamp: number; column: CardColumn } | null = null;

  /**
   * Copy a column to localStorage for quick paste across cards
   */
  copyColumnToLocalStorage(column: CardColumn): void {
    const clonedColumn = JSON.parse(JSON.stringify(column));
    
    const clipboardData = {
      version: VERSION,
      timestamp: Date.now(),
      column: clonedColumn,
    };

    const dataString = JSON.stringify(clipboardData);

    try {
      localStorage.removeItem(this.COLUMN_CLIPBOARD_KEY);
      localStorage.setItem(this.COLUMN_CLIPBOARD_KEY, dataString);
      this._memoryColumnClipboard = null;
      return;
    } catch (e) {
      console.warn('localStorage quota exceeded for column, trying sessionStorage...');
    }

    try {
      sessionStorage.removeItem(this.COLUMN_CLIPBOARD_KEY);
      sessionStorage.setItem(this.COLUMN_CLIPBOARD_KEY, dataString);
      this._memoryColumnClipboard = null;
      return;
    } catch (e) {
      console.warn('sessionStorage also full, using memory fallback for column');
    }

    this._memoryColumnClipboard = clipboardData;
  }

  /**
   * Get a column from clipboard
   */
  getColumnFromLocalStorage(): CardColumn | null {
    let clipboardData: { version: string; timestamp: number; column: CardColumn } | null = null;

    try {
      const stored = localStorage.getItem(this.COLUMN_CLIPBOARD_KEY);
      if (stored) {
        clipboardData = JSON.parse(stored);
      }
    } catch (e) {
      // localStorage not available
    }

    if (!clipboardData) {
      try {
        const stored = sessionStorage.getItem(this.COLUMN_CLIPBOARD_KEY);
        if (stored) {
          clipboardData = JSON.parse(stored);
        }
      } catch (e) {
        // sessionStorage not available
      }
    }

    if (!clipboardData && this._memoryColumnClipboard) {
      clipboardData = this._memoryColumnClipboard;
    }

    if (!clipboardData) return null;

    if (Date.now() - clipboardData.timestamp > this.CLIPBOARD_EXPIRY_MS) {
      this.clearColumnClipboard();
      return null;
    }

    if (!clipboardData.column) {
      return null;
    }

    const clonedColumn = JSON.parse(JSON.stringify(clipboardData.column));
    return this._regenerateColumnIds(clonedColumn);
  }

  /**
   * Check if there's a valid column in the clipboard
   */
  hasColumnInLocalStorage(): boolean {
    let clipboardData: { version: string; timestamp: number; column: CardColumn } | null = null;

    try {
      const stored = localStorage.getItem(this.COLUMN_CLIPBOARD_KEY);
      if (stored) {
        clipboardData = JSON.parse(stored);
      }
    } catch (e) {
      // localStorage not available
    }

    if (!clipboardData) {
      try {
        const stored = sessionStorage.getItem(this.COLUMN_CLIPBOARD_KEY);
        if (stored) {
          clipboardData = JSON.parse(stored);
        }
      } catch (e) {
        // sessionStorage not available
      }
    }

    if (!clipboardData && this._memoryColumnClipboard) {
      clipboardData = this._memoryColumnClipboard;
    }

    if (!clipboardData) return false;

    if (Date.now() - clipboardData.timestamp > this.CLIPBOARD_EXPIRY_MS) {
      this.clearColumnClipboard();
      return false;
    }

    return !!clipboardData.column;
  }

  /**
   * Clear the column clipboard
   */
  clearColumnClipboard(): void {
    try {
      localStorage.removeItem(this.COLUMN_CLIPBOARD_KEY);
    } catch (e) {
      // localStorage not available
    }
    try {
      sessionStorage.removeItem(this.COLUMN_CLIPBOARD_KEY);
    } catch (e) {
      // sessionStorage not available
    }
    this._memoryColumnClipboard = null;
  }

  /**
   * Regenerate IDs for a column and its modules
   */
  private _regenerateColumnIds(column: CardColumn): CardColumn {
    column.id = `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    column.modules = column.modules.map((module, moduleIndex) => ({
      ...module,
      id: `${module.type}-${Date.now()}-${moduleIndex}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    return column;
  }

  // ========== CARD/EXPORT CLIPBOARD TRACKING ==========
  // Track when Ultra Card data is exported to clipboard using localStorage
  // This is more reliable than the Clipboard API which requires permission

  private readonly EXPORT_CLIPBOARD_KEY = 'ultra-card-export-clipboard';
  private readonly EXPORT_CLIPBOARD_EXPIRY_MS = 60 * 60 * 1000; // 1 hour expiry

  /**
   * Mark that Ultra Card data was exported to clipboard
   * Called after successful export operations
   */
  markExportedToClipboard(type: ExportData['type']): void {
    try {
      const clipboardData = {
        type,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.EXPORT_CLIPBOARD_KEY, JSON.stringify(clipboardData));
    } catch (e) {
      // localStorage not available - ignore
    }
  }

  /**
   * Check if there's recent Ultra Card export data available
   */
  hasExportInClipboard(): boolean {
    try {
      const stored = localStorage.getItem(this.EXPORT_CLIPBOARD_KEY);
      if (!stored) return false;

      const clipboardData = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() - clipboardData.timestamp > this.EXPORT_CLIPBOARD_EXPIRY_MS) {
        this.clearExportClipboard();
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get the type of export in clipboard
   */
  getExportClipboardType(): ExportData['type'] | null {
    try {
      const stored = localStorage.getItem(this.EXPORT_CLIPBOARD_KEY);
      if (!stored) return null;

      const clipboardData = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() - clipboardData.timestamp > this.EXPORT_CLIPBOARD_EXPIRY_MS) {
        this.clearExportClipboard();
        return null;
      }

      return clipboardData.type;
    } catch (e) {
      return null;
    }
  }

  /**
   * Clear the export clipboard tracking
   */
  clearExportClipboard(): void {
    try {
      localStorage.removeItem(this.EXPORT_CLIPBOARD_KEY);
    } catch (e) {
      // localStorage not available - ignore
    }
  }

  // ========== CUSTOM VARIABLES EXPORT/IMPORT HELPERS ==========

  /**
   * Check if export data contains custom variables
   */
  hasCustomVariables(exportData: ExportData): boolean {
    return !!(exportData.customVariables && exportData.customVariables.length > 0);
  }

  /**
   * Get custom variables from export data
   */
  getCustomVariables(exportData: ExportData): CustomVariable[] {
    return exportData.customVariables || [];
  }

  /**
   * Import custom variables from export data (global only - legacy method)
   * @param exportData Export data containing variables
   * @param merge If true, merge with existing variables; if false, replace all
   * @param existingCardVars Optional card-specific variables to check for name conflicts
   * @returns Object with imported count and skipped variables info
   */
  importCustomVariables(
    exportData: ExportData, 
    merge: boolean = true,
    existingCardVars: CustomVariable[] = []
  ): { imported: number; skipped: { name: string; reason: string }[] } {
    if (!this.hasCustomVariables(exportData)) {
      return { imported: 0, skipped: [] };
    }
    return ucCustomVariablesService.importVariables(exportData.customVariables!, merge, existingCardVars);
  }

  /**
   * Import custom variables - always as card-specific with auto-rename on conflict
   * This provides the best UX: no prompts, user can change scope later
   * @param exportData Export data containing variables
   * @param existingCardVars Current card's card-specific variables
   * @returns Object with cardVarsToAdd and summary info
   */
  importVariablesAsCardSpecific(
    exportData: ExportData,
    existingCardVars: CustomVariable[] = []
  ): { 
    cardVarsToAdd: CustomVariable[];
    summary: { added: number; renamed: { from: string; to: string }[]; skipped: string[] };
  } {
    const result = {
      cardVarsToAdd: [] as CustomVariable[],
      summary: {
        added: 0,
        renamed: [] as { from: string; to: string }[],
        skipped: [] as string[],
      },
    };

    if (!this.hasCustomVariables(exportData)) {
      return result;
    }

    const variables = exportData.customVariables!;
    
    // Build set of all existing names (global + card-specific + newly added)
    const existingNames = new Set<string>();
    ucCustomVariablesService.getVariables().forEach(v => existingNames.add(v.name.toLowerCase()));
    existingCardVars.forEach(v => existingNames.add(v.name.toLowerCase()));

    for (const variable of variables) {
      const originalName = variable.name;
      let finalName = originalName;
      
      // Check if name already exists
      if (existingNames.has(finalName.toLowerCase())) {
        // Check if it's the exact same variable (same entity and config)
        const existingGlobal = ucCustomVariablesService.getVariableByName(finalName);
        const existingCard = existingCardVars.find(v => v.name.toLowerCase() === finalName.toLowerCase());
        const existing = existingGlobal || existingCard;
        
        if (existing && 
            existing.entity === variable.entity && 
            existing.value_type === variable.value_type &&
            existing.attribute_name === variable.attribute_name) {
          // Exact same variable - skip it
          result.summary.skipped.push(originalName);
          continue;
        }
        
        // Different config - auto-rename
        let suffix = 2;
        while (existingNames.has(`${originalName}_${suffix}`.toLowerCase())) {
          suffix++;
        }
        finalName = `${originalName}_${suffix}`;
        result.summary.renamed.push({ from: originalName, to: finalName });
      }
      
      // Add as card-specific variable
      const newCardVar: CustomVariable = {
        ...variable,
        name: finalName,
        id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isGlobal: false,
        order: existingCardVars.length + result.cardVarsToAdd.length,
      };
      result.cardVarsToAdd.push(newCardVar);
      existingNames.add(finalName.toLowerCase());
      result.summary.added++;
    }

    return result;
  }

  /**
   * Get the count of custom variables that would be imported
   */
  getCustomVariablesCount(exportData: ExportData): number {
    return exportData.customVariables?.length || 0;
  }
}

// Export singleton instance
export const ucExportImportService = new UcExportImportService();

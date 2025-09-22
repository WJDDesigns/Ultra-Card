import { ExportData, CardRow, LayoutConfig, CardModule } from '../types';
import { VERSION } from '../version';

/**
 * Service for exporting and importing Ultra Card configurations
 * Supports both clipboard operations and file operations
 */
class UcExportImportService {
  /**
   * Export a row to clipboard as Ultra Card shortcode
   */
  async exportRowToClipboard(row: CardRow, name?: string): Promise<void> {
    const exportData: ExportData = {
      type: 'ultra-card-row',
      version: VERSION,
      data: row,
      metadata: {
        exported: new Date().toISOString(),
        name: name || 'Exported Row',
      },
    };

    const shortcode = this._generateShortcode(exportData);
    await this._copyToClipboard(shortcode);
  }

  /**
   * Export a layout to clipboard
   */
  async exportLayoutToClipboard(layout: LayoutConfig, name?: string): Promise<void> {
    const exportData: ExportData = {
      type: 'ultra-card-layout',
      version: VERSION,
      data: layout,
      metadata: {
        exported: new Date().toISOString(),
        name: name || 'Exported Layout',
      },
    };

    const shortcode = this._generateShortcode(exportData);
    await this._copyToClipboard(shortcode);
  }

  /**
   * Export a module to clipboard
   */
  async exportModuleToClipboard(module: CardModule, name?: string): Promise<void> {
    const exportData: ExportData = {
      type: 'ultra-card-module',
      version: VERSION,
      data: module,
      metadata: {
        exported: new Date().toISOString(),
        name: name || 'Exported Module',
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
      const match = shortcode.match(/\[ultra_card\]([\s\S]*?)\[\/ultra_card\]/);
      if (!match) {
        throw new Error('Invalid Ultra Card shortcode format');
      }

      const encodedData = match[1].trim();
      const jsonData = atob(encodedData);
      const exportData: ExportData = JSON.parse(jsonData);

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
        return this.importFromShortcode(text);
      } else {
        // Fallback: prompt user to paste manually
        const text = prompt('Paste your Ultra Card shortcode here:');
        if (!text) {
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
        if (!text) {
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
   * Export to file download
   */
  exportToFile(
    data: CardRow | LayoutConfig | CardModule,
    type: ExportData['type'],
    name: string
  ): void {
    const exportData: ExportData = {
      type,
      version: VERSION,
      data,
      metadata: {
        exported: new Date().toISOString(),
        name,
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
   * Generate Ultra Card shortcode format
   */
  private _generateShortcode(exportData: ExportData): string {
    const jsonString = JSON.stringify(exportData);
    const encodedData = btoa(jsonString);
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

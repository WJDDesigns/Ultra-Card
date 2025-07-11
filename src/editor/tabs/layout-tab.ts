import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { HomeAssistant } from 'custom-card-helpers';
import {
  UltraCardConfig,
  CardRow,
  CardColumn,
  CardModule,
  TextModule,
  SeparatorModule,
  ImageModule,
  BarModule,
  DisplayCondition,
} from '../../types';
import '../../components/ultra-color-picker';
import { getModuleRegistry } from '../../modules/module-registry';
import '../global-design-tab';
import { DesignProperties } from '../global-design-tab';
import { logicService } from '../../services/logic-service';

// Typography and font definitions matching the professional interface
const DEFAULT_FONTS = [{ value: 'default', label: '– Default –', category: 'default' }];

const TYPOGRAPHY_FONTS = [
  { value: 'Montserrat', label: 'Montserrat (used as default font)', category: 'typography' },
];

const WEB_SAFE_FONTS = [
  { value: 'Georgia, serif', label: 'Georgia, serif', category: 'websafe' },
  {
    value: 'Palatino Linotype, Book Antiqua, Palatino, serif',
    label: 'Palatino Linotype, Book Antiqua, Palatino, serif',
    category: 'websafe',
  },
  {
    value: 'Times New Roman, Times, serif',
    label: 'Times New Roman, Times, serif',
    category: 'websafe',
  },
  {
    value: 'Arial, Helvetica, sans-serif',
    label: 'Arial, Helvetica, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Impact, Charcoal, sans-serif',
    label: 'Impact, Charcoal, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Lucida Sans Unicode, Lucida Grande, sans-serif',
    label: 'Lucida Sans Unicode, Lucida Grande, sans-serif',
    category: 'websafe',
  },
  { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma, Geneva, sans-serif', category: 'websafe' },
  {
    value: 'Trebuchet MS, Helvetica, sans-serif',
    label: 'Trebuchet MS, Helvetica, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Verdana, Geneva, sans-serif',
    label: 'Verdana, Geneva, sans-serif',
    category: 'websafe',
  },
  {
    value: 'Courier New, Courier, monospace',
    label: 'Courier New, Courier, monospace',
    category: 'websafe',
  },
  {
    value: 'Lucida Console, Monaco, monospace',
    label: 'Lucida Console, Monaco, monospace',
    category: 'websafe',
  },
];

@customElement('ultra-layout-tab')
export class LayoutTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: UltraCardConfig;

  @state() private _showModuleSelector = false;
  @state() private _selectedRowIndex = -1;
  @state() private _selectedColumnIndex = -1;
  @state() private _showModuleSettings = false;
  @state() private _selectedModule: {
    rowIndex: number;
    columnIndex: number;
    moduleIndex: number;
  } | null = null;
  @state() private _activeModuleTab = 'general';
  @state() private _activeDesignSubtab = 'text';

  // Row settings state
  @state() private _showRowSettings = false;
  @state() private _selectedRowForSettings = -1;
  @state() private _activeRowTab = 'general';

  // Column settings state
  @state() private _showColumnSettings = false;
  @state() private _selectedColumnForSettings: {
    rowIndex: number;
    columnIndex: number;
  } | null = null;
  @state() private _activeColumnTab = 'general';

  // Column layout selector state
  @state() private _showColumnLayoutSelector = false;
  @state() private _selectedRowForLayout = -1;

  // Drag and drop state
  @state() private _draggedItem: {
    type: 'module' | 'column' | 'row';
    rowIndex: number;
    columnIndex?: number;
    moduleIndex?: number;
    data: any;
    layoutChildIndex?: number;
  } | null = null;
  @state() private _dropTarget: {
    type: 'module' | 'column' | 'row' | 'layout' | 'layout-child';
    rowIndex: number;
    columnIndex?: number;
    moduleIndex?: number;
    childIndex?: number;
  } | null = null;
  @state() private _selectedLayoutModuleIndex: number = -1;

  // Layout child module settings state
  @state() private _showLayoutChildSettings = false;
  @state() private _selectedLayoutChild: {
    parentRowIndex: number;
    parentColumnIndex: number;
    parentModuleIndex: number;
    childIndex: number;
  } | null = null;

  // Create visual column icon representation for popup
  private _createColumnIconHTML(proportions: number[]): string {
    const totalWidth = proportions.reduce((sum, prop) => sum + prop, 0);
    const columns = proportions
      .map((prop, index) => {
        const widthPercent = (prop / totalWidth) * 100;
        const gap = index > 0 ? 'margin-left: 2px;' : '';
        return `<div style="width: ${widthPercent}%; height: 16px; background: #2196F3; border-radius: 2px; ${gap}"></div>`;
      })
      .join('');

    return `<div style="display: flex; width: 100%; height: 16px; gap: 2px;">${columns}</div>`;
  }

  // Create simple icon representation for layout display
  private _createSimpleIcon(proportions: number[]): string {
    return proportions.map(prop => '█'.repeat(prop)).join(' ');
  }

  // Predefined column layouts - organized by column count
  private readonly COLUMN_LAYOUTS = [
    // 1 Column
    { id: '1-col', name: '1', proportions: [1], columnCount: 1 },

    // 2 Columns
    { id: '1-2-1-2', name: '1/2 + 1/2', proportions: [1, 1], columnCount: 2 },
    { id: '1-3-2-3', name: '1/3 + 2/3', proportions: [1, 2], columnCount: 2 },
    { id: '2-3-1-3', name: '2/3 + 1/3', proportions: [2, 1], columnCount: 2 },
    { id: '2-5-3-5', name: '2/5 + 3/5', proportions: [2, 3], columnCount: 2 },
    { id: '3-5-2-5', name: '3/5 + 2/5', proportions: [3, 2], columnCount: 2 },

    // 3 Columns
    {
      id: '1-3-1-3-1-3',
      name: '1/3 + 1/3 + 1/3',
      proportions: [1, 1, 1],
      columnCount: 3,
    },
    {
      id: '1-4-1-2-1-4',
      name: '1/4 + 1/2 + 1/4',
      proportions: [1, 2, 1],
      columnCount: 3,
    },
    {
      id: '1-5-3-5-1-5',
      name: '1/5 + 3/5 + 1/5',
      proportions: [1, 3, 1],
      columnCount: 3,
    },
    {
      id: '1-6-2-3-1-6',
      name: '1/6 + 2/3 + 1/6',
      proportions: [1, 4, 1],
      columnCount: 3,
    },

    // 4 Columns
    {
      id: '1-4-1-4-1-4-1-4',
      name: '1/4 + 1/4 + 1/4 + 1/4',
      proportions: [1, 1, 1, 1],
      columnCount: 4,
    },
    {
      id: '1-5-1-5-1-5-1-5',
      name: '1/5 + 1/5 + 1/5 + 1/5',
      proportions: [1, 1, 1, 1],
      columnCount: 4,
    },
    {
      id: '1-6-1-6-1-6-1-6',
      name: '1/6 + 1/6 + 1/6 + 1/6',
      proportions: [1, 1, 1, 1],
      columnCount: 4,
    },
    {
      id: '1-8-1-4-1-4-1-8',
      name: '1/8 + 1/4 + 1/4 + 1/8',
      proportions: [1, 2, 2, 1],
      columnCount: 4,
    },

    // 5 Columns
    {
      id: '1-5-1-5-1-5-1-5-1-5',
      name: '1/5 + 1/5 + 1/5 + 1/5 + 1/5',
      proportions: [1, 1, 1, 1, 1],
      columnCount: 5,
    },
    {
      id: '1-6-1-6-1-3-1-6-1-6',
      name: '1/6 + 1/6 + 1/3 + 1/6 + 1/6',
      proportions: [1, 1, 2, 1, 1],
      columnCount: 5,
    },
    {
      id: '1-8-1-4-1-4-1-4-1-8',
      name: '1/8 + 1/4 + 1/4 + 1/4 + 1/8',
      proportions: [1, 2, 2, 2, 1],
      columnCount: 5,
    },

    // 6 Columns
    {
      id: '1-6-1-6-1-6-1-6-1-6-1-6',
      name: '1/6 + 1/6 + 1/6 + 1/6 + 1/6 + 1/6',
      proportions: [1, 1, 1, 1, 1, 1],
      columnCount: 6,
    },
  ];

  // Get layouts for a specific column count
  private _getLayoutsForColumnCount(columnCount: number): typeof this.COLUMN_LAYOUTS {
    // Limit to maximum 6 columns
    const maxColumns = Math.min(columnCount, 6);
    return this.COLUMN_LAYOUTS.filter(layout => layout.columnCount === maxColumns);
  }

  // Migration helper to map legacy layout IDs to new ones
  private _migrateLegacyLayoutId(layoutId: string): string {
    const migrations: Record<string, string> = {
      '50-50': '1-2-1-2',
      '30-70': '1-3-2-3',
      '70-30': '2-3-1-3',
      '33-33-33': '1-3-1-3-1-3',
      '25-50-25': '1-4-1-2-1-4',
      '20-60-20': '1-5-3-5-1-5',
      '25-25-25-25': '1-4-1-4-1-4-1-4',
    };
    return migrations[layoutId] || layoutId;
  }

  // Initialize layout if it doesn't exist
  private _ensureLayout(): { rows: CardRow[] } {
    if (!this.config.layout || !this.config.layout.rows) {
      return {
        rows: [
          {
            id: `row-${Date.now()}`,
            columns: [
              {
                id: `col-${Date.now()}`,
                modules: [],
                vertical_alignment: 'center',
                horizontal_alignment: 'center',
              },
            ],
            column_layout: '1-col',
          },
        ],
      };
    }
    return this.config.layout;
  }

  private _updateConfig(updates: Partial<UltraCardConfig>): void {
    const newConfig = { ...this.config, ...updates };
    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private _updateLayout(layout: { rows: CardRow[] }): void {
    this._updateConfig({ layout });
  }

  private _addRow(): void {
    console.log('Adding new row...');
    const layout = this._ensureLayout();

    // Create a new empty row with no columns
    const newRow: CardRow = {
      id: `row-${Date.now()}`,
      columns: [], // Start with empty columns array
      column_layout: '1-col',
    };

    // Create a completely new layout object to ensure Lit detects the change
    const newLayout = {
      rows: [...layout.rows, newRow],
    };

    this._updateLayout(newLayout);
    console.log('Row added successfully (empty row)');
  }

  private _deleteRow(rowIndex: number): void {
    console.log('Deleting row:', rowIndex);
    const layout = this._ensureLayout();

    if (layout.rows.length > 1) {
      // Create a completely new layout object with the row removed
      const newLayout = {
        rows: layout.rows.filter((_, index) => index !== rowIndex),
      };

      this._updateLayout(newLayout);
      console.log('Row deleted successfully');
    } else {
      console.log('Cannot delete the last remaining row');
    }
  }

  private _duplicateRow(rowIndex: number): void {
    console.log('Duplicating row:', rowIndex);
    const layout = this._ensureLayout();
    const rowToCopy = layout.rows[rowIndex];
    if (!rowToCopy) {
      console.error('Row to copy not found at index:', rowIndex);
      return;
    }

    // Deep clone the row with new IDs
    const duplicatedRow: CardRow = {
      ...JSON.parse(JSON.stringify(rowToCopy)),
      id: `row-${Date.now()}`,
      columns: rowToCopy.columns.map((column, idx) => ({
        ...JSON.parse(JSON.stringify(column)),
        id: `col-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
        modules: column.modules.map((module, moduleIdx) => ({
          ...JSON.parse(JSON.stringify(module)),
          id: `${module.type}-${Date.now()}-${moduleIdx}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      })),
    };

    // Create new layout with duplicated row
    const newLayout = JSON.parse(JSON.stringify(layout));
    newLayout.rows.splice(rowIndex + 1, 0, duplicatedRow);
    this._updateLayout(newLayout);
    console.log('Row duplicated successfully. New layout has', newLayout.rows.length, 'rows');
  }

  private _addColumn(rowIndex: number): void {
    console.log('Adding column to row:', rowIndex);
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row) {
      console.error('Row not found at index:', rowIndex);
      return;
    }

    // Enforce maximum 6 columns
    if (row.columns.length >= 6) {
      console.log('Cannot add more than 6 columns to a row');
      return;
    }

    const newColumn: CardColumn = {
      id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      modules: [],
      vertical_alignment: 'center',
      horizontal_alignment: 'center',
    };

    // Create new layout with added column
    const newLayout = {
      rows: layout.rows.map((r, index) => {
        if (index === rowIndex) {
          return {
            ...r,
            columns: [...r.columns, newColumn],
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
    console.log(
      'Column added successfully. Row now has',
      newLayout.rows[rowIndex].columns.length,
      'columns'
    );
  }

  private _addColumnAfter(rowIndex: number, columnIndex: number): void {
    console.log('Adding column after:', rowIndex, columnIndex);
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row) return;

    // Enforce maximum 6 columns
    if (row.columns.length >= 6) {
      console.log('Cannot add more than 6 columns to a row');
      return;
    }

    const newColumn: CardColumn = {
      id: `col-${Date.now()}`,
      modules: [],
      vertical_alignment: 'center',
      horizontal_alignment: 'center',
    };

    // Create new layout with column inserted after the current column
    const newLayout = {
      rows: layout.rows.map((r, index) => {
        if (index === rowIndex) {
          const newColumns = [...r.columns];
          newColumns.splice(columnIndex + 1, 0, newColumn);
          return {
            ...r,
            columns: newColumns,
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
    console.log('Column added after successfully');
  }

  private _duplicateColumn(rowIndex: number, columnIndex: number): void {
    console.log('Duplicating column:', rowIndex, columnIndex);
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row || !row.columns[columnIndex]) {
      console.error('Row or column not found:', rowIndex, columnIndex);
      return;
    }

    // Enforce maximum 6 columns
    if (row.columns.length >= 6) {
      console.log('Cannot duplicate column: maximum 6 columns already reached');
      return;
    }

    const columnToCopy = row.columns[columnIndex];

    // Deep clone the column with new ID and module IDs
    const duplicatedColumn: CardColumn = {
      ...JSON.parse(JSON.stringify(columnToCopy)),
      id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      modules: columnToCopy.modules.map((module, moduleIdx) => ({
        ...JSON.parse(JSON.stringify(module)),
        id: `${module.type}-${Date.now()}-${moduleIdx}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    };

    // Create new layout with duplicated column
    const newLayout = JSON.parse(JSON.stringify(layout));
    newLayout.rows[rowIndex].columns.splice(columnIndex + 1, 0, duplicatedColumn);
    this._updateLayout(newLayout);
    console.log(
      'Column duplicated successfully. Row now has',
      newLayout.rows[rowIndex].columns.length,
      'columns'
    );
  }

  private _deleteColumn(rowIndex: number, columnIndex: number): void {
    console.log('Deleting column:', rowIndex, columnIndex);
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row) {
      console.error('Row not found at index:', rowIndex);
      return;
    }

    if (!row.columns[columnIndex]) {
      console.error('Column not found at index:', columnIndex);
      return;
    }

    // Create new layout with deleted column (allow empty rows)
    const newLayout = {
      rows: layout.rows.map((r, index) => {
        if (index === rowIndex) {
          return {
            ...r,
            columns: r.columns.filter((_, colIndex) => colIndex !== columnIndex),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
    console.log(
      'Column deleted successfully. Row now has',
      newLayout.rows[rowIndex].columns.length,
      'columns'
    );
  }

  private _openColumnLayoutSelector(rowIndex: number): void {
    this._selectedRowForLayout = rowIndex;
    this._showColumnLayoutSelector = true;
  }

  private _changeColumnLayout(layoutId: string): void {
    if (this._selectedRowForLayout === -1) return;

    const layout = this._ensureLayout();
    const row = layout.rows[this._selectedRowForLayout];
    if (!row) return;

    const selectedLayout = this.COLUMN_LAYOUTS.find(l => l.id === layoutId);
    if (!selectedLayout) return;

    const targetColumnCount = selectedLayout.columnCount;
    const currentColumnCount = row.columns.length;

    console.log(`Changing layout from ${currentColumnCount} to ${targetColumnCount} columns`);

    // Create new layout
    const newLayout = JSON.parse(JSON.stringify(layout));
    const targetRow = newLayout.rows[this._selectedRowForLayout];

    if (targetColumnCount === currentColumnCount) {
      // Same number of columns, just change the layout proportions
      targetRow.column_layout = layoutId as CardRow['column_layout'];
    } else if (targetColumnCount > currentColumnCount) {
      // Adding columns - WPBakery style
      const newColumns: CardColumn[] = [...targetRow.columns];

      // Add new empty columns
      for (let i = currentColumnCount; i < targetColumnCount; i++) {
        newColumns.push({
          id: `col-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          modules: [],
          vertical_alignment: 'center',
          horizontal_alignment: 'center',
        });
      }

      targetRow.columns = newColumns;
      targetRow.column_layout = layoutId as CardRow['column_layout'];
    } else {
      // Reducing columns - WPBakery style: move all content to remaining columns
      const newColumns: CardColumn[] = [];
      const allModules: CardModule[] = [];

      // Collect all modules from all columns
      targetRow.columns.forEach(column => {
        if (column.modules && column.modules.length > 0) {
          allModules.push(...column.modules);
        }
      });

      // Create target number of columns
      for (let i = 0; i < targetColumnCount; i++) {
        if (i < currentColumnCount) {
          // Keep existing column structure but clear modules
          newColumns.push({
            ...targetRow.columns[i],
            modules: [],
          });
        } else {
          // Create new column
          newColumns.push({
            id: `col-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
            modules: [],
            vertical_alignment: 'center',
            horizontal_alignment: 'center',
          });
        }
      }

      // Distribute modules evenly across the remaining columns
      if (allModules.length > 0) {
        if (targetColumnCount === 1) {
          // Single column gets all modules
          newColumns[0].modules = allModules;
        } else {
          // Distribute modules round-robin style
          allModules.forEach((module, index) => {
            const targetColumnIndex = index % targetColumnCount;
            newColumns[targetColumnIndex].modules.push(module);
          });
        }
      }

      targetRow.columns = newColumns;
      targetRow.column_layout = layoutId as CardRow['column_layout'];
    }

    this._updateLayout(newLayout);
    console.log(`Layout changed successfully. Row now has ${targetColumnCount} columns`);

    // Close the selector
    this._showColumnLayoutSelector = false;
    this._selectedRowForLayout = -1;
  }

  private _getCurrentLayoutDisplay(row: CardRow): string {
    const columnCount = row.columns.length;
    const layoutId = row.column_layout;

    // Find matching predefined layout
    const predefinedLayout = this.COLUMN_LAYOUTS.find(l => l.id === layoutId);
    if (predefinedLayout) {
      return this._createSimpleIcon(predefinedLayout.proportions);
    }

    // Fallback to generic display based on column count
    switch (columnCount) {
      case 1:
        return '█';
      case 2:
        return '█ █';
      case 3:
        return '█ █ █';
      case 4:
        return '█ █ █ █';
      default:
        return '█ '.repeat(Math.min(columnCount, 6)).trim();
    }
  }

  private _openModuleSelector(rowIndex: number, columnIndex: number): void {
    console.log('Opening module selector for:', { rowIndex, columnIndex });

    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];

    // If the row has no columns, automatically add one
    if (!row || !row.columns || row.columns.length === 0) {
      console.log('Row has no columns, automatically adding one');
      this._addColumn(rowIndex);
      // Set the column index to 0 since we just added the first column
      columnIndex = 0;
    }

    this._selectedRowIndex = rowIndex;
    this._selectedColumnIndex = columnIndex;
    this._showModuleSelector = true;
  }

  private _addModule(type: string): void {
    console.log('Adding module of type:', type);

    if (this._selectedRowIndex === -1 || this._selectedColumnIndex === -1) {
      console.error('No row or column selected');
      return;
    }

    const layout = this._ensureLayout();

    if (!layout.rows[this._selectedRowIndex]) {
      console.error('Selected row does not exist:', this._selectedRowIndex);
      return;
    }

    const row = layout.rows[this._selectedRowIndex];

    if (!row.columns[this._selectedColumnIndex]) {
      console.error('Selected column does not exist:', this._selectedColumnIndex);
      return;
    }

    const column = row.columns[this._selectedColumnIndex];

    // Create a simple default module with proper typing
    let newModule: CardModule;

    switch (type) {
      case 'text':
        newModule = {
          id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          text: 'Sample Text',
          font_size: 16,
          color: 'var(--primary-text-color)',
        } as TextModule;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        break;
      case 'separator':
        newModule = {
          id: `separator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'separator',
          thickness: 1,
          color: 'var(--divider-color)',
        } as SeparatorModule;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        delete (newModule as any).label;
        break;
      case 'image':
        newModule = {
          id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'image',
          image_type: 'none',
        } as ImageModule;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        delete (newModule as any).label;
        break;
      case 'markdown':
        newModule = {
          id: `markdown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'markdown',
          content: `This is a markdown module that supports:

- Italic and bold text
- Links
- inline code
- Lists and more!`,
          markdown_content: `This is a markdown module that supports:

- Italic and bold text
- Links
- inline code
- Lists and more!`,
        } as any;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        delete (newModule as any).label;
        break;
      case 'bar':
        newModule = {
          id: `bar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'bar',
          entity: 'sensor.battery_level',
          bar_color: 'var(--primary-color)',
          background_color: 'var(--secondary-background-color)',
          height: 20,
          show_value: true,
        } as BarModule;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        delete (newModule as any).label;
        break;
      case 'button':
        newModule = {
          id: `button-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'button',
          label: 'Click Me',
          button_text: 'Click Me',
          tap_action: {
            action: 'more-info',
          },
        } as any;
        // Ensure no default title is set (but keep label for button functionality)
        delete (newModule as any).name;
        delete (newModule as any).title;
        break;
      case 'info':
        newModule = {
          id: `info-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'info',
          info_entities: [
            {
              entity: 'sensor.temperature',
              name: 'Temperature',
              icon: 'mdi:thermometer',
            },
          ],
        } as any;
        // Ensure no default title is set
        delete (newModule as any).name;
        delete (newModule as any).title;
        delete (newModule as any).label;
        break;
      default:
        // Try to use the module registry for other types
        try {
          const registry = getModuleRegistry();
          const registryModule = registry.createDefaultModule(type);
          if (registryModule) {
            newModule = registryModule;
            // Remove any default titles/names that might have been set by the registry
            delete (newModule as any).name;
            delete (newModule as any).title;
            delete (newModule as any).label;
            break;
          }
        } catch (e) {
          console.error('Module registry failed:', e);
        }
        // Fallback to text module
        newModule = {
          id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          text: 'Unknown Module Type',
          font_size: 16,
          color: 'var(--primary-text-color)',
        } as TextModule;
        break;
    }

    console.log('Created module:', newModule);

    // Create new layout with updated modules
    let newLayout;

    if (this._selectedLayoutModuleIndex >= 0) {
      // Adding to a layout module (horizontal or vertical)
      newLayout = {
        rows: layout.rows.map((row, rIndex) => {
          if (rIndex === this._selectedRowIndex) {
            return {
              ...row,
              columns: row.columns.map((col, cIndex) => {
                if (cIndex === this._selectedColumnIndex) {
                  return {
                    ...col,
                    modules: col.modules.map((module, mIndex) => {
                      if (mIndex === this._selectedLayoutModuleIndex) {
                        const layoutModule = module as any;
                        return {
                          ...layoutModule,
                          modules: [...(layoutModule.modules || []), newModule],
                        };
                      }
                      return module;
                    }),
                  };
                }
                return col;
              }),
            };
          }
          return row;
        }),
      };
    } else {
      // Adding directly to a column
      newLayout = {
        rows: layout.rows.map((row, rIndex) => {
          if (rIndex === this._selectedRowIndex) {
            return {
              ...row,
              columns: row.columns.map((col, cIndex) => {
                if (cIndex === this._selectedColumnIndex) {
                  return {
                    ...col,
                    modules: [...(col.modules || []), newModule],
                  };
                }
                return col;
              }),
            };
          }
          return row;
        }),
      };
    }

    this._updateLayout(newLayout);
    this._showModuleSelector = false;

    // Auto-open module settings for the newly added module (only for non-layout modules)
    if (this._shouldAutoOpenSettings(type)) {
      if (this._selectedLayoutModuleIndex >= 0) {
        // Module was added to a layout module - don't auto-open settings for now
        // TODO: Could implement nested module settings if needed
      } else {
        const moduleIndex = column.modules.length; // The new module will be at this index
        this._openModuleSettings(this._selectedRowIndex, this._selectedColumnIndex, moduleIndex);
      }
    }

    this._selectedRowIndex = -1;
    this._selectedColumnIndex = -1;
    this._selectedLayoutModuleIndex = -1;

    console.log('Module added successfully');
  }

  private _duplicateModule(rowIndex: number, columnIndex: number, moduleIndex: number): void {
    console.log('Duplicating module:', rowIndex, columnIndex, moduleIndex);
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row || !row.columns[columnIndex]) return;

    const column = row.columns[columnIndex];
    if (!column.modules || !column.modules[moduleIndex]) return;

    const moduleToCopy = column.modules[moduleIndex];

    // Deep clone the module with new ID
    const duplicatedModule: CardModule = {
      ...JSON.parse(JSON.stringify(moduleToCopy)),
      id: `${moduleToCopy.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Create new layout with duplicated module
    const newLayout = {
      rows: layout.rows.map((r, rIndex) => {
        if (rIndex === rowIndex) {
          return {
            ...r,
            columns: r.columns.map((col, cIndex) => {
              if (cIndex === columnIndex) {
                const newModules = [...col.modules];
                newModules.splice(moduleIndex + 1, 0, duplicatedModule);
                return {
                  ...col,
                  modules: newModules,
                };
              }
              return col;
            }),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
    console.log('Module duplicated successfully');
  }

  private _deleteModule(rowIndex: number, columnIndex: number, moduleIndex: number): void {
    console.log('Deleting module:', rowIndex, columnIndex, moduleIndex);
    const layout = this._ensureLayout();
    const row = layout.rows[rowIndex];
    if (!row || !row.columns[columnIndex]) return;

    const column = row.columns[columnIndex];
    if (!column.modules || !column.modules[moduleIndex]) return;

    // Create new layout without the deleted module
    const newLayout = {
      rows: layout.rows.map((r, rIndex) => {
        if (rIndex === rowIndex) {
          return {
            ...r,
            columns: r.columns.map((col, cIndex) => {
              if (cIndex === columnIndex) {
                return {
                  ...col,
                  modules: col.modules.filter((_, mIndex) => mIndex !== moduleIndex),
                };
              }
              return col;
            }),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
    console.log('Module deleted successfully');
  }

  private _openModuleSettings(rowIndex: number, columnIndex: number, moduleIndex: number): void {
    this._selectedModule = { rowIndex, columnIndex, moduleIndex };
    this._showModuleSettings = true;
  }

  private _updateModule(updates: Partial<CardModule>): void {
    console.log(`🔄 LayoutTab: _updateModule called with updates:`, updates);

    if (!this._selectedModule) {
      console.log(`🔄 LayoutTab: No selected module, returning early`);
      return;
    }

    const layout = this._ensureLayout();
    const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;

    console.log(
      `🔄 LayoutTab: Updating module at row ${rowIndex}, column ${columnIndex}, module ${moduleIndex}`
    );

    // Create a new layout with the updated module
    const newLayout = {
      rows: layout.rows.map((row, rIndex) => {
        if (rIndex === rowIndex) {
          return {
            ...row,
            columns: row.columns.map((col, cIndex) => {
              if (cIndex === columnIndex) {
                return {
                  ...col,
                  modules: col.modules.map((module, mIndex) => {
                    if (mIndex === moduleIndex) {
                      console.log(`🔄 LayoutTab: Original module:`, module);

                      // Create updated module by copying original and applying updates
                      const updatedModule = { ...module };

                      // Apply updates, but DELETE properties that are set to undefined (for reset functionality)
                      for (const [key, value] of Object.entries(updates)) {
                        if (value === undefined) {
                          console.log(`🔄 LayoutTab: DELETING property ${key} from module`);
                          delete (updatedModule as any)[key];
                        } else {
                          console.log(`🔄 LayoutTab: SETTING property ${key} =`, value);
                          (updatedModule as any)[key] = value;
                        }
                      }

                      console.log(`🔄 LayoutTab: Updated module:`, updatedModule);
                      return updatedModule as CardModule;
                    }
                    return module;
                  }),
                };
              }
              return col;
            }),
          };
        }
        return row;
      }),
    };

    console.log(`🔄 LayoutTab: Calling _updateLayout with new layout`);
    this._updateLayout(newLayout);
    console.log(`🔄 LayoutTab: Layout updated successfully`);
  }

  private _updateLayoutChildModule(updates: Partial<CardModule>): void {
    console.log(`🔄 LayoutTab: _updateLayoutChildModule called with updates:`, updates);

    if (!this._selectedLayoutChild) {
      console.log(`🔄 LayoutTab: No selected layout child, returning early`);
      return;
    }

    const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
      this._selectedLayoutChild;

    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));

    const targetRow = newLayout.rows[parentRowIndex];
    if (!targetRow || !targetRow.columns[parentColumnIndex]) return;

    const targetColumn = targetRow.columns[parentColumnIndex];
    if (!targetColumn.modules || !targetColumn.modules[parentModuleIndex]) return;

    const layoutModule = targetColumn.modules[parentModuleIndex] as any;
    if (!layoutModule.modules || !layoutModule.modules[childIndex]) return;

    const originalChildModule = layoutModule.modules[childIndex];
    console.log(`🔄 LayoutTab: Original child module:`, originalChildModule);

    // Create updated module by copying original and applying updates
    const updatedModule = { ...originalChildModule };

    // Apply updates, but DELETE properties that are set to undefined (for reset functionality)
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        console.log(`🔄 LayoutTab: DELETING property ${key} from child module`);
        delete (updatedModule as any)[key];
      } else {
        console.log(`🔄 LayoutTab: SETTING child module property ${key} =`, value);
        (updatedModule as any)[key] = value;
      }
    }

    // Update the child module in the layout
    layoutModule.modules[childIndex] = updatedModule;

    console.log(`🔄 LayoutTab: Updated child module:`, updatedModule);
    this._updateLayout(newLayout);
    console.log(`🔄 LayoutTab: Layout child module updated successfully`);
  }

  private _updateModuleDesign(updates: Partial<DesignProperties>): void {
    console.log(`🔄 LayoutTab: _updateModuleDesign called with updates:`, updates);
    console.log(`🔄 LayoutTab: _selectedModule:`, this._selectedModule);

    if (!this._selectedModule) {
      console.log(`🔄 LayoutTab: No selected module, returning early`);
      return;
    }

    const moduleUpdates: any = {};

    // Convert design properties back to module properties (including undefined for reset)
    if (updates.hasOwnProperty('color')) moduleUpdates.color = updates.color;
    if (updates.hasOwnProperty('text_align')) moduleUpdates.text_align = updates.text_align;
    if (updates.hasOwnProperty('font_size'))
      moduleUpdates.font_size = updates.font_size ? parseFloat(updates.font_size) : undefined;
    if (updates.hasOwnProperty('line_height')) moduleUpdates.line_height = updates.line_height;
    if (updates.hasOwnProperty('letter_spacing'))
      moduleUpdates.letter_spacing = updates.letter_spacing;
    if (updates.hasOwnProperty('font_family')) moduleUpdates.font_family = updates.font_family;
    if (updates.hasOwnProperty('font_weight')) moduleUpdates.font_weight = updates.font_weight;
    if (updates.hasOwnProperty('text_transform'))
      moduleUpdates.text_transform = updates.text_transform;
    if (updates.hasOwnProperty('font_style')) moduleUpdates.font_style = updates.font_style;
    if (updates.hasOwnProperty('background_color'))
      moduleUpdates.background_color = updates.background_color;
    if (updates.hasOwnProperty('background_image'))
      moduleUpdates.background_image = updates.background_image;
    if (updates.hasOwnProperty('background_image_type'))
      moduleUpdates.background_image_type = updates.background_image_type;
    if (updates.hasOwnProperty('background_image_entity'))
      moduleUpdates.background_image_entity = updates.background_image_entity;
    if (updates.hasOwnProperty('backdrop_filter'))
      moduleUpdates.backdrop_filter = updates.backdrop_filter;
    if (updates.hasOwnProperty('width')) moduleUpdates.width = updates.width;
    if (updates.hasOwnProperty('height')) moduleUpdates.height = updates.height;
    if (updates.hasOwnProperty('max_width')) moduleUpdates.max_width = updates.max_width;
    if (updates.hasOwnProperty('max_height')) moduleUpdates.max_height = updates.max_height;
    if (updates.hasOwnProperty('min_width')) moduleUpdates.min_width = updates.min_width;
    if (updates.hasOwnProperty('min_height')) moduleUpdates.min_height = updates.min_height;

    // Position properties
    if (updates.hasOwnProperty('position')) moduleUpdates.position = updates.position;
    if (updates.hasOwnProperty('top')) moduleUpdates.top = updates.top;
    if (updates.hasOwnProperty('bottom')) moduleUpdates.bottom = updates.bottom;
    if (updates.hasOwnProperty('left')) moduleUpdates.left = updates.left;
    if (updates.hasOwnProperty('right')) moduleUpdates.right = updates.right;
    if (updates.hasOwnProperty('z_index')) moduleUpdates.z_index = updates.z_index;

    // Text shadow properties
    if (updates.hasOwnProperty('text_shadow_h'))
      moduleUpdates.text_shadow_h = updates.text_shadow_h;
    if (updates.hasOwnProperty('text_shadow_v'))
      moduleUpdates.text_shadow_v = updates.text_shadow_v;
    if (updates.hasOwnProperty('text_shadow_blur'))
      moduleUpdates.text_shadow_blur = updates.text_shadow_blur;
    if (updates.hasOwnProperty('text_shadow_color'))
      moduleUpdates.text_shadow_color = updates.text_shadow_color;

    // Box shadow properties
    if (updates.hasOwnProperty('box_shadow_h')) moduleUpdates.box_shadow_h = updates.box_shadow_h;
    if (updates.hasOwnProperty('box_shadow_v')) moduleUpdates.box_shadow_v = updates.box_shadow_v;
    if (updates.hasOwnProperty('box_shadow_blur'))
      moduleUpdates.box_shadow_blur = updates.box_shadow_blur;
    if (updates.hasOwnProperty('box_shadow_spread'))
      moduleUpdates.box_shadow_spread = updates.box_shadow_spread;
    if (updates.hasOwnProperty('box_shadow_color'))
      moduleUpdates.box_shadow_color = updates.box_shadow_color;

    // Other properties
    if (updates.hasOwnProperty('overflow')) moduleUpdates.overflow = updates.overflow;
    if (updates.hasOwnProperty('clip_path')) moduleUpdates.clip_path = updates.clip_path;

    // Spacing properties
    if (updates.hasOwnProperty('margin_top')) moduleUpdates.margin_top = updates.margin_top;
    if (updates.hasOwnProperty('margin_bottom'))
      moduleUpdates.margin_bottom = updates.margin_bottom;
    if (updates.hasOwnProperty('margin_left')) moduleUpdates.margin_left = updates.margin_left;
    if (updates.hasOwnProperty('margin_right')) moduleUpdates.margin_right = updates.margin_right;
    if (updates.hasOwnProperty('padding_top')) moduleUpdates.padding_top = updates.padding_top;
    if (updates.hasOwnProperty('padding_bottom'))
      moduleUpdates.padding_bottom = updates.padding_bottom;
    if (updates.hasOwnProperty('padding_left')) moduleUpdates.padding_left = updates.padding_left;
    if (updates.hasOwnProperty('padding_right'))
      moduleUpdates.padding_right = updates.padding_right;

    // Border properties
    if (updates.hasOwnProperty('border_radius'))
      moduleUpdates.border_radius = updates.border_radius;
    if (updates.hasOwnProperty('border_style')) moduleUpdates.border_style = updates.border_style;
    if (updates.hasOwnProperty('border_width')) moduleUpdates.border_width = updates.border_width;
    if (updates.hasOwnProperty('border_color')) moduleUpdates.border_color = updates.border_color;

    // Animation properties
    if (updates.hasOwnProperty('animation_type'))
      moduleUpdates.animation_type = updates.animation_type;
    if (updates.hasOwnProperty('animation_entity'))
      moduleUpdates.animation_entity = updates.animation_entity;
    if (updates.hasOwnProperty('animation_trigger_type'))
      moduleUpdates.animation_trigger_type = updates.animation_trigger_type;
    if (updates.hasOwnProperty('animation_attribute'))
      moduleUpdates.animation_attribute = updates.animation_attribute;
    if (updates.hasOwnProperty('animation_state'))
      moduleUpdates.animation_state = updates.animation_state;
    if (updates.hasOwnProperty('intro_animation'))
      moduleUpdates.intro_animation = updates.intro_animation;
    if (updates.hasOwnProperty('outro_animation'))
      moduleUpdates.outro_animation = updates.outro_animation;
    if (updates.hasOwnProperty('animation_duration'))
      moduleUpdates.animation_duration = updates.animation_duration;
    if (updates.hasOwnProperty('animation_delay'))
      moduleUpdates.animation_delay = updates.animation_delay;
    if (updates.hasOwnProperty('animation_timing'))
      moduleUpdates.animation_timing = updates.animation_timing;

    // Handle margin/padding updates
    if (
      updates.hasOwnProperty('margin_top') ||
      updates.hasOwnProperty('margin_bottom') ||
      updates.hasOwnProperty('margin_left') ||
      updates.hasOwnProperty('margin_right')
    ) {
      const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;
      const layout = this._ensureLayout();
      const module = layout.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];

      if (module) {
        // Check if all margin properties are being reset to undefined
        const marginTop = updates.hasOwnProperty('margin_top')
          ? updates.margin_top
          : (module as any).margin?.top;
        const marginBottom = updates.hasOwnProperty('margin_bottom')
          ? updates.margin_bottom
          : (module as any).margin?.bottom;
        const marginLeft = updates.hasOwnProperty('margin_left')
          ? updates.margin_left
          : (module as any).margin?.left;
        const marginRight = updates.hasOwnProperty('margin_right')
          ? updates.margin_right
          : (module as any).margin?.right;

        if (
          marginTop === undefined &&
          marginBottom === undefined &&
          marginLeft === undefined &&
          marginRight === undefined
        ) {
          // All margin properties are being reset, delete the entire margin object
          moduleUpdates.margin = undefined;
        } else {
          // Some margin properties exist, create/update the margin object
          const currentMargin = (module as any).margin || {};
          moduleUpdates.margin = {
            top: marginTop !== undefined ? parseFloat(marginTop) || 0 : currentMargin.top || 0,
            bottom:
              marginBottom !== undefined
                ? parseFloat(marginBottom) || 0
                : currentMargin.bottom || 0,
            left: marginLeft !== undefined ? parseFloat(marginLeft) || 0 : currentMargin.left || 0,
            right:
              marginRight !== undefined ? parseFloat(marginRight) || 0 : currentMargin.right || 0,
          };
        }
      }
    }

    if (
      updates.hasOwnProperty('padding_top') ||
      updates.hasOwnProperty('padding_bottom') ||
      updates.hasOwnProperty('padding_left') ||
      updates.hasOwnProperty('padding_right')
    ) {
      const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;
      const layout = this._ensureLayout();
      const module = layout.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];

      if (module) {
        // Check if all padding properties are being reset to undefined
        const paddingTop = updates.hasOwnProperty('padding_top')
          ? updates.padding_top
          : (module as any).padding?.top;
        const paddingBottom = updates.hasOwnProperty('padding_bottom')
          ? updates.padding_bottom
          : (module as any).padding?.bottom;
        const paddingLeft = updates.hasOwnProperty('padding_left')
          ? updates.padding_left
          : (module as any).padding?.left;
        const paddingRight = updates.hasOwnProperty('padding_right')
          ? updates.padding_right
          : (module as any).padding?.right;

        if (
          paddingTop === undefined &&
          paddingBottom === undefined &&
          paddingLeft === undefined &&
          paddingRight === undefined
        ) {
          // All padding properties are being reset, delete the entire padding object
          moduleUpdates.padding = undefined;
        } else {
          // Some padding properties exist, create/update the padding object
          const currentPadding = (module as any).padding || {};
          moduleUpdates.padding = {
            top: paddingTop !== undefined ? parseFloat(paddingTop) || 0 : currentPadding.top || 0,
            bottom:
              paddingBottom !== undefined
                ? parseFloat(paddingBottom) || 0
                : currentPadding.bottom || 0,
            left:
              paddingLeft !== undefined ? parseFloat(paddingLeft) || 0 : currentPadding.left || 0,
            right:
              paddingRight !== undefined
                ? parseFloat(paddingRight) || 0
                : currentPadding.right || 0,
          };
        }
      }
    }

    // Handle border updates
    if (
      updates.hasOwnProperty('border_radius') ||
      updates.hasOwnProperty('border_style') ||
      updates.hasOwnProperty('border_width') ||
      updates.hasOwnProperty('border_color')
    ) {
      const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;
      const layout = this._ensureLayout();
      const module = layout.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];

      if (module) {
        // Check if all border properties are being reset to undefined
        const borderRadius = updates.hasOwnProperty('border_radius')
          ? updates.border_radius
          : (module as any).border?.radius;
        const borderStyle = updates.hasOwnProperty('border_style')
          ? updates.border_style
          : (module as any).border?.style;
        const borderWidth = updates.hasOwnProperty('border_width')
          ? updates.border_width
          : (module as any).border?.width;
        const borderColor = updates.hasOwnProperty('border_color')
          ? updates.border_color
          : (module as any).border?.color;

        if (
          borderRadius === undefined &&
          borderStyle === undefined &&
          borderWidth === undefined &&
          borderColor === undefined
        ) {
          // All border properties are being reset, delete the entire border object
          moduleUpdates.border = undefined;
        } else {
          // Some border properties exist, create/update the border object
          const currentBorder = (module as any).border || {};
          moduleUpdates.border = {
            radius:
              borderRadius !== undefined
                ? parseFloat(borderRadius) || 0
                : currentBorder.radius || 0,
            style: borderStyle !== undefined ? borderStyle : currentBorder.style || 'none',
            width: borderWidth !== undefined ? borderWidth : currentBorder.width || '1px',
            color:
              borderColor !== undefined
                ? borderColor
                : currentBorder.color || 'var(--divider-color)',
          };
        }
      }
    }

    console.log(`🔄 LayoutTab: Final moduleUpdates being applied:`, moduleUpdates);
    this._updateModule(moduleUpdates);
    console.log(`🔄 LayoutTab: _updateModule called successfully`);
  }

  private _closeModuleSettings(): void {
    this._showModuleSettings = false;
    this._selectedModule = null;
    this.requestUpdate();
  }

  private _closeLayoutChildSettings(): void {
    this._showLayoutChildSettings = false;
    this._selectedLayoutChild = null;
    this.requestUpdate();
  }

  // Drag and Drop Methods
  private _onDragStart(
    e: DragEvent,
    type: 'module' | 'column' | 'row',
    rowIndex: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    if (!e.dataTransfer) return;

    e.stopPropagation();

    const layout = this._ensureLayout();
    let data: any;

    switch (type) {
      case 'module':
        if (columnIndex !== undefined && moduleIndex !== undefined) {
          data = layout.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];
        }
        break;
      case 'column':
        if (columnIndex !== undefined) {
          data = layout.rows[rowIndex]?.columns[columnIndex];
        }
        break;
      case 'row':
        data = layout.rows[rowIndex];
        break;
    }

    this._draggedItem = { type, rowIndex, columnIndex, moduleIndex, data };

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ type, rowIndex, columnIndex, moduleIndex })
    );

    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '0.6';
      target.style.transform = 'scale(0.95)';
    }

    // Add dragging state to host for CSS targeting
    if (type === 'column') {
      this.setAttribute('dragging-column', '');
    } else if (type === 'row') {
      this.setAttribute('dragging-row', '');
    }
  }

  private _onDragEnd(e: DragEvent): void {
    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '';
      target.style.transform = '';
    }

    // Remove dragging state attributes
    this.removeAttribute('dragging-column');
    this.removeAttribute('dragging-row');

    this._draggedItem = null;
    this._dropTarget = null;
    this.requestUpdate();
  }

  private _onDragOver(e: DragEvent): void {
    if (!this._draggedItem) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  private _onDragEnter(
    e: DragEvent,
    type: 'module' | 'column' | 'row' | 'layout' | 'layout-child',
    rowIndex: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this._draggedItem) return;

    // Don't allow dropping on self
    if (
      this._draggedItem.type === type &&
      this._draggedItem.rowIndex === rowIndex &&
      this._draggedItem.columnIndex === columnIndex &&
      this._draggedItem.moduleIndex === moduleIndex
    ) {
      return;
    }

    // Special handling for layout children being dragged to regular columns
    if (this._draggedItem.layoutChildIndex !== undefined) {
      // Prevent dropping on the parent layout module
      if (
        type === 'layout' &&
        this._draggedItem.rowIndex === rowIndex &&
        this._draggedItem.columnIndex === columnIndex &&
        this._draggedItem.moduleIndex === moduleIndex
      ) {
        return;
      }
    }

    // Only show drop target for valid combinations
    if (!this._isValidDropTarget(this._draggedItem.type, type)) {
      return;
    }

    this._dropTarget = { type, rowIndex, columnIndex, moduleIndex };

    // Add enhanced visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.borderColor = 'var(--primary-color)';
      target.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
    }

    this.requestUpdate();
  }

  private _onDragLeave(e: DragEvent): void {
    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.borderColor = '';
      target.style.backgroundColor = '';
    }

    // Only clear drop target if we're actually leaving the element
    if (
      e.relatedTarget &&
      e.currentTarget &&
      !(e.currentTarget as Element).contains(e.relatedTarget as Node)
    ) {
      this._dropTarget = null;
      this.requestUpdate();
    }
  }

  private _onDrop(
    e: DragEvent,
    type: 'module' | 'column' | 'row' | 'layout' | 'layout-child',
    rowIndex: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.borderColor = '';
      target.style.backgroundColor = '';
    }

    if (!this._draggedItem) return;

    // Don't allow dropping on self
    if (
      this._draggedItem.type === type &&
      this._draggedItem.rowIndex === rowIndex &&
      this._draggedItem.columnIndex === columnIndex &&
      this._draggedItem.moduleIndex === moduleIndex
    ) {
      return;
    }

    // Validate drop target compatibility
    if (!this._isValidDropTarget(this._draggedItem.type, type)) {
      return; // Reject invalid drops
    }

    this._performMove(this._draggedItem, { type, rowIndex, columnIndex, moduleIndex });

    this._draggedItem = null;
    this._dropTarget = null;
    this.requestUpdate();
  }

  private _isValidDropTarget(sourceType: string, targetType: string): boolean {
    // Define valid drop combinations
    const validCombinations: Record<string, string[]> = {
      module: ['module', 'column', 'layout', 'layout-child'], // Modules can be dropped on other modules, column areas, layout modules, or layout children for reordering
      column: ['column', 'row'], // Columns can be dropped on other columns or row areas
      row: ['row'], // Rows can only be dropped on other rows
    };

    return validCombinations[sourceType]?.includes(targetType) || false;
  }

  private _performMove(source: any, target: any): void {
    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));

    switch (source.type) {
      case 'module':
        this._moveModule(newLayout, source, target);
        break;
      case 'column':
        this._moveColumn(newLayout, source, target);
        break;
      case 'row':
        this._moveRow(newLayout, source, target);
        break;
    }

    this._updateLayout(newLayout);
  }

  private _moveModule(layout: any, source: any, target: any): void {
    let sourceModule: any;

    // Handle layout-child reordering within the same layout module FIRST
    if (source.layoutChildIndex !== undefined && target.type === 'layout-child') {
      const sourceParentRow = source.rowIndex;
      const sourceParentColumn = source.columnIndex;
      const sourceParentModule = source.moduleIndex;
      const sourceChildIndex = source.layoutChildIndex;

      const targetParentRow = target.rowIndex;
      const targetParentColumn = target.columnIndex;
      const targetParentModule = target.moduleIndex;
      const targetChildIndex = target.childIndex;

      // Check if this is reordering within the same layout module
      if (
        sourceParentRow === targetParentRow &&
        sourceParentColumn === targetParentColumn &&
        sourceParentModule === targetParentModule
      ) {
        if (sourceChildIndex === targetChildIndex) {
          // Dropping on self, do nothing
          return;
        }

        const layoutModule = layout.rows[sourceParentRow].columns[sourceParentColumn].modules[
          sourceParentModule
        ] as any;

        if (layoutModule && this._isLayoutModule(layoutModule.type) && layoutModule.modules) {
          // Remove from source position
          const movedModule = layoutModule.modules.splice(sourceChildIndex, 1)[0];

          // Calculate new insertion index - INSERT BEFORE the target module
          let newIndex = targetChildIndex;

          // If we removed an item from before the target position, adjust the target index
          if (sourceChildIndex < targetChildIndex) {
            newIndex = targetChildIndex - 1;
          }

          // Insert at new position (before the target module)
          layoutModule.modules.splice(newIndex, 0, movedModule);
        }
        return;
      }
    }

    // Get source module and handle removal
    if (source.layoutChildIndex !== undefined) {
      // Get source module from layout child
      const parentLayoutModule = layout.rows[source.rowIndex].columns[source.columnIndex].modules[
        source.moduleIndex
      ] as any;
      sourceModule = parentLayoutModule.modules[source.layoutChildIndex];
      // Remove from layout child
      parentLayoutModule.modules.splice(source.layoutChildIndex, 1);
    } else {
      // Get source module from regular column
      sourceModule =
        layout.rows[source.rowIndex].columns[source.columnIndex].modules[source.moduleIndex];
      // Don't remove from source first for layout targets!
    }

    if (target.type === 'layout') {
      // Move to layout module - validate target first, then move
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];

      if (targetLayoutModule && this._isLayoutModule(targetLayoutModule.type)) {
        if (!targetLayoutModule.modules) {
          targetLayoutModule.modules = [];
        }
        // Add the module to the layout module FIRST
        targetLayoutModule.modules.push(sourceModule);

        // Only remove from source AFTER successfully adding to target (if not from layout child)
        if (source.layoutChildIndex === undefined) {
          layout.rows[source.rowIndex].columns[source.columnIndex].modules.splice(
            source.moduleIndex,
            1
          );
        }
      }
      return;
    }

    if (target.type === 'layout-child') {
      // Move to specific position within layout module
      const targetLayoutModule =
        layout.rows[target.rowIndex].columns[target.columnIndex].modules[target.moduleIndex];

      if (targetLayoutModule && this._isLayoutModule(targetLayoutModule.type)) {
        if (!targetLayoutModule.modules) {
          targetLayoutModule.modules = [];
        }

        // Insert at specific position
        const insertIndex = (target as any).childIndex || 0;
        targetLayoutModule.modules.splice(insertIndex, 0, sourceModule);

        // Only remove from source AFTER successfully adding to target (if not from layout child)
        if (source.layoutChildIndex === undefined) {
          layout.rows[source.rowIndex].columns[source.columnIndex].modules.splice(
            source.moduleIndex,
            1
          );
        }
      }
      return;
    }

    // For non-layout targets, remove from source first (traditional move behavior)
    if (source.layoutChildIndex === undefined) {
      layout.rows[source.rowIndex].columns[source.columnIndex].modules.splice(
        source.moduleIndex,
        1
      );
    }

    // Add to target
    if (target.type === 'module') {
      // Insert at specific position
      let targetIndex = target.moduleIndex || 0;

      // If moving within the same column and target is after source, adjust index
      if (
        source.rowIndex === target.rowIndex &&
        source.columnIndex === target.columnIndex &&
        target.moduleIndex > source.moduleIndex
      ) {
        targetIndex--;
      }

      layout.rows[target.rowIndex].columns[target.columnIndex].modules.splice(
        targetIndex,
        0,
        sourceModule
      );
    } else if (target.type === 'column') {
      // Add to end of column
      layout.rows[target.rowIndex].columns[target.columnIndex].modules.push(sourceModule);
    }
  }

  private _moveColumn(layout: any, source: any, target: any): void {
    // Remove column from source row
    const sourceColumn = layout.rows[source.rowIndex].columns[source.columnIndex];
    layout.rows[source.rowIndex].columns.splice(source.columnIndex, 1);

    if (target.type === 'column') {
      // Insert at specific position within row
      layout.rows[target.rowIndex].columns.splice(target.columnIndex || 0, 0, sourceColumn);
    } else if (target.type === 'row') {
      // Add to end of target row
      layout.rows[target.rowIndex].columns.push(sourceColumn);
    }
  }

  private _moveRow(layout: any, source: any, target: any): void {
    // Remove row from source
    const sourceRow = layout.rows[source.rowIndex];
    layout.rows.splice(source.rowIndex, 1);

    // Insert at target position
    const targetIndex = target.rowIndex;
    layout.rows.splice(targetIndex, 0, sourceRow);
  }

  // Row settings methods
  private _openRowSettings(rowIndex: number): void {
    this._selectedRowForSettings = rowIndex;
    this._showRowSettings = true;
  }

  private _updateRow(updates: Partial<CardRow>): void {
    console.log(`🔄 LayoutTab: _updateRow called with updates:`, updates);

    if (this._selectedRowForSettings === -1) {
      console.log(`🔄 LayoutTab: No selected row for settings, returning early`);
      return;
    }

    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));
    const targetRow = newLayout.rows[this._selectedRowForSettings];

    console.log(`🔄 LayoutTab: Original row:`, targetRow);

    // Apply updates, but DELETE properties that are set to undefined (for reset functionality)
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        console.log(`🔄 LayoutTab: DELETING property ${key} from row`);
        delete (targetRow as any)[key];
      } else {
        console.log(`🔄 LayoutTab: SETTING row property ${key} =`, value);
        (targetRow as any)[key] = value;
      }
    }

    console.log(`🔄 LayoutTab: Updated row:`, targetRow);
    this._updateLayout(newLayout);
    console.log(`🔄 LayoutTab: Row updated successfully`);
  }

  // Column settings methods
  private _openColumnSettings(rowIndex: number, columnIndex: number): void {
    this._selectedColumnForSettings = { rowIndex, columnIndex };
    this._showColumnSettings = true;
  }

  private _updateColumn(updates: Partial<CardColumn>): void {
    console.log(`🔄 LayoutTab: _updateColumn called with updates:`, updates);

    if (!this._selectedColumnForSettings) {
      console.log(`🔄 LayoutTab: No selected column for settings, returning early`);
      return;
    }

    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));
    const targetColumn =
      newLayout.rows[this._selectedColumnForSettings.rowIndex].columns[
        this._selectedColumnForSettings.columnIndex
      ];

    console.log(`🔄 LayoutTab: Original column:`, targetColumn);

    // Apply updates, but DELETE properties that are set to undefined (for reset functionality)
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        console.log(`🔄 LayoutTab: DELETING property ${key} from column`);
        delete (targetColumn as any)[key];
      } else {
        console.log(`🔄 LayoutTab: SETTING column property ${key} =`, value);
        (targetColumn as any)[key] = value;
      }
    }

    console.log(`🔄 LayoutTab: Updated column:`, targetColumn);
    this._updateLayout(newLayout);
    console.log(`🔄 LayoutTab: Column updated successfully`);
  }

  private _loadGoogleFont(fontFamily?: string): void {
    if (
      !fontFamily ||
      fontFamily === 'default' ||
      WEB_SAFE_FONTS.some(font => font.value === fontFamily)
    ) {
      return; // Don't load Google Fonts for web safe fonts
    }

    // Check if font is already loaded
    const existingLink = document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`);
    if (existingLink) {
      return;
    }

    // Create and append Google Fonts link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  private _renderModulePreview(): TemplateResult {
    if (!this._selectedModule) return html``;

    const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;
    const module = this.config.layout?.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];

    if (!module) return html``;

    return html`
      <div class="module-preview">
        <div class="preview-header">Live Preview</div>
        <div class="preview-content">${this._renderSingleModuleWithAnimation(module)}</div>
      </div>
    `;
  }

  private _renderSingleModule(
    module: CardModule,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): TemplateResult {
    // For layout builder, render simplified version instead of actual preview
    return this._renderSimplifiedModule(module, rowIndex, columnIndex, moduleIndex);
  }

  private _renderSimplifiedModule(
    module: CardModule,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    // Get module metadata for icon and description
    const metadata = moduleHandler?.metadata || {
      icon: 'mdi:help-circle',
      title: 'Unknown',
      description: 'Unknown module type',
    };

    // Check if this is a layout module (horizontal or vertical)
    const isLayoutModule = module.type === 'horizontal' || module.type === 'vertical';

    if (isLayoutModule) {
      return this._renderLayoutModuleAsColumn(module, rowIndex, columnIndex, moduleIndex, metadata);
    }

    // Generate helpful info based on module type and configuration
    const moduleInfo = this._generateModuleInfo(module);

    // Get module title/name if available
    const moduleTitle = this._getModuleDisplayName(module);

    return html`
      <div class="simplified-module">
        <div class="simplified-module-header">
          <div class="simplified-module-drag-handle" title="Drag to move module">
            <ha-icon icon="mdi:drag"></ha-icon>
          </div>
          <ha-icon icon="${metadata.icon}" class="simplified-module-icon"></ha-icon>
          <div class="simplified-module-content">
            <div class="simplified-module-title">${moduleTitle}</div>
            <div class="simplified-module-info">${moduleInfo}</div>
          </div>
          ${rowIndex !== undefined && columnIndex !== undefined && moduleIndex !== undefined
            ? html`
                <div class="simplified-module-actions">
                  <button
                    class="simplified-action-btn edit-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._openModuleSettings(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="Edit Module"
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="simplified-action-btn duplicate-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._duplicateModule(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="Duplicate Module"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="simplified-action-btn delete-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._deleteModule(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="Delete Module"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _renderLayoutModuleAsColumn(
    module: CardModule,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number,
    metadata?: any
  ): TemplateResult {
    const layoutModule = module as any; // HorizontalModule or VerticalModule
    const hasChildren = layoutModule.modules && layoutModule.modules.length > 0;
    const isHorizontal = module.type === 'horizontal';
    const isVertical = module.type === 'vertical';

    return html`
      <div class="layout-module-container">
        <div class="layout-module-header">
          <div class="layout-module-title">
            <div class="layout-module-drag-handle" title="Drag to move layout module">
              <ha-icon icon="mdi:drag"></ha-icon>
            </div>
            <ha-icon icon="${metadata?.icon || 'mdi:view-sequential'}"></ha-icon>
            <span>${isHorizontal ? 'Horizontal Layout' : 'Vertical Layout'}</span>
          </div>
          <div class="layout-module-actions">
            ${rowIndex !== undefined && columnIndex !== undefined && moduleIndex !== undefined
              ? html`
                  <button
                    class="layout-module-add-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._openLayoutModuleSelector(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="Add Module to Layout"
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                  </button>
                  <button
                    class="layout-module-settings-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._openModuleSettings(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="Layout Settings"
                  >
                    <ha-icon icon="mdi:cog"></ha-icon>
                  </button>
                  <button
                    class="layout-module-duplicate-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._duplicateModule(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="Duplicate Layout"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="layout-module-delete-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._deleteModule(rowIndex, columnIndex, moduleIndex);
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="Delete Layout"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                `
              : ''}
          </div>
        </div>
        <div
          class="layout-modules-container"
          style="
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 8px 12px;
            min-height: 60px;
            box-sizing: border-box;
            overflow: hidden;
          "
          @dragover=${this._onDragOver}
          @dragenter=${(e: DragEvent) =>
            this._onDragEnter(e, 'layout', rowIndex, columnIndex, moduleIndex)}
          @dragleave=${this._onDragLeave}
          @drop=${(e: DragEvent) => this._onDrop(e, 'layout', rowIndex, columnIndex, moduleIndex)}
        >
          ${hasChildren
            ? layoutModule.modules.map(
                (childModule: CardModule, childIndex: number) => html`
                  <div
                    class="layout-child-module-wrapper"
                    draggable="true"
                    @dragstart=${(e: DragEvent) =>
                      this._onLayoutChildDragStart(
                        e,
                        rowIndex,
                        columnIndex,
                        moduleIndex,
                        childIndex
                      )}
                    @dragend=${(e: DragEvent) => this._onLayoutChildDragEnd(e)}
                    @dragover=${this._onDragOver}
                    @dragenter=${(e: DragEvent) =>
                      this._onLayoutChildDragEnter(
                        e,
                        rowIndex,
                        columnIndex,
                        moduleIndex,
                        childIndex
                      )}
                    @dragleave=${this._onDragLeave}
                    @drop=${(e: DragEvent) =>
                      this._onLayoutChildDrop(e, rowIndex, columnIndex, moduleIndex, childIndex)}
                    class="${this._dropTarget?.type === 'layout-child' &&
                    this._dropTarget?.rowIndex === rowIndex &&
                    this._dropTarget?.columnIndex === columnIndex &&
                    this._dropTarget?.moduleIndex === moduleIndex &&
                    (this._dropTarget as any)?.childIndex === childIndex
                      ? 'drop-target'
                      : ''}"
                    style="width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden;"
                  >
                    ${this._renderLayoutChildModule(
                      childModule,
                      rowIndex,
                      columnIndex,
                      moduleIndex,
                      childIndex
                    )}
                  </div>
                `
              )
            : html`
                <div class="layout-module-empty">
                  <ha-icon icon="mdi:plus-circle"></ha-icon>
                  <span>Drop modules here</span>
                </div>
              `}
          ${hasChildren
            ? html`
                <div
                  class="layout-append-zone"
                  @dragover=${this._onDragOver}
                  @dragenter=${(e: DragEvent) =>
                    this._onLayoutAppendDragEnter(e, rowIndex, columnIndex, moduleIndex)}
                  @dragleave=${this._onDragLeave}
                  @drop=${(e: DragEvent) =>
                    this._onLayoutAppendDrop(e, rowIndex, columnIndex, moduleIndex)}
                  style="
                    min-height: 20px;
                    margin-top: 8px;
                    border: 2px dashed transparent;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--secondary-text-color);
                    font-size: 12px;
                    transition: all 0.2s ease;
                  "
                >
                  Drop here to add to end
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _getJustifyContent(alignment: string): string {
    switch (alignment) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      case 'justify':
        return 'space-between';
      default:
        return 'flex-start';
    }
  }

  private _renderLayoutChildModule(
    childModule: CardModule,
    parentRowIndex?: number,
    parentColumnIndex?: number,
    parentModuleIndex?: number,
    childIndex?: number
  ): TemplateResult {
    // In the layout builder, show simplified modules like regular columns
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(childModule.type);

    // Get module metadata for icon and description
    const metadata = moduleHandler?.metadata || {
      icon: 'mdi:help-circle',
      title: 'Unknown',
      description: 'Unknown module type',
    };

    // Generate helpful info based on module type and configuration
    const moduleInfo = this._generateModuleInfo(childModule);
    const moduleTitle = this._getModuleDisplayName(childModule);

    return html`
      <div
        class="layout-child-simplified-module"
        @click=${(e: Event) => {
          // Only open settings if not clicking on action buttons or drag handle
          const target = e.target as HTMLElement;
          if (
            !target.closest('.layout-child-actions') &&
            !target.closest('.layout-child-drag-handle')
          ) {
            e.stopPropagation();
            if (
              parentRowIndex !== undefined &&
              parentColumnIndex !== undefined &&
              parentModuleIndex !== undefined &&
              childIndex !== undefined
            ) {
              this._openLayoutChildSettings(
                parentRowIndex,
                parentColumnIndex,
                parentModuleIndex,
                childIndex
              );
            }
          }
        }}
      >
        <div class="layout-child-module-header">
          <div class="layout-child-drag-handle" title="Drag to reorder">
            <ha-icon icon="mdi:drag"></ha-icon>
          </div>
          <ha-icon icon="${metadata.icon}" class="layout-child-icon"></ha-icon>
          <div class="layout-child-content">
            <div class="layout-child-title">${moduleTitle}</div>
            <div class="layout-child-info">${moduleInfo}</div>
          </div>
          ${parentRowIndex !== undefined &&
          parentColumnIndex !== undefined &&
          parentModuleIndex !== undefined &&
          childIndex !== undefined
            ? html`
                <div class="layout-child-actions">
                  <button
                    class="layout-child-action-btn edit-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._openLayoutChildSettings(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="Edit Child Module"
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="layout-child-action-btn duplicate-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._duplicateLayoutChildModule(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="Duplicate Child Module"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </button>
                  <button
                    class="layout-child-action-btn delete-btn"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._deleteLayoutChildModule(
                        parentRowIndex,
                        parentColumnIndex,
                        parentModuleIndex,
                        childIndex
                      );
                    }}
                    @mousedown=${(e: Event) => e.stopPropagation()}
                    @dragstart=${(e: Event) => e.preventDefault()}
                    title="Delete Child Module"
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  // Drag and drop handlers for layout modules
  private _onLayoutModuleDragOver(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  private _onLayoutModuleDragEnter(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    // Only allow dropping modules
    if (this._draggedItem && this._draggedItem.type === 'module') {
      // Check if we're dragging from a different location
      const isDifferentSource = !(
        this._draggedItem.rowIndex === rowIndex &&
        this._draggedItem.columnIndex === columnIndex &&
        this._draggedItem.moduleIndex === moduleIndex
      );

      if (isDifferentSource) {
        // Set visual feedback - add CSS class to show drop target
        const target = e.currentTarget as HTMLElement;
        target.classList.add('layout-drop-target');
      }
    }
  }

  private _onLayoutModuleDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  private _onLayoutModuleDrop(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    // Remove visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('layout-drop-target');

    if (!this._draggedItem || this._draggedItem.type !== 'module') {
      console.log('Invalid drop - not a module or no dragged item');
      return;
    }

    if (rowIndex === undefined || columnIndex === undefined || moduleIndex === undefined) {
      console.log('Invalid drop - missing coordinates');
      return;
    }

    // Get the layout module we're dropping into
    const layout = this._ensureLayout();
    const targetRow = layout.rows[rowIndex];
    if (!targetRow || !targetRow.columns[columnIndex]) {
      console.log('Invalid drop - target row/column not found');
      return;
    }

    const targetColumn = targetRow.columns[columnIndex];
    const targetLayoutModule = targetColumn.modules[moduleIndex] as any; // HorizontalModule or VerticalModule

    if (!targetLayoutModule || !this._isLayoutModule(targetLayoutModule.type)) {
      console.log('Invalid drop - target is not a layout module');
      return;
    }

    // Initialize modules array if it doesn't exist
    if (!targetLayoutModule.modules) {
      targetLayoutModule.modules = [];
    }

    // Clone the dragged module
    const draggedModule = JSON.parse(JSON.stringify(this._draggedItem.data));

    // Check if this is a reordering within the same layout module
    if (
      this._draggedItem.layoutChildIndex !== undefined &&
      this._draggedItem.rowIndex === rowIndex &&
      this._draggedItem.columnIndex === columnIndex &&
      this._draggedItem.moduleIndex === moduleIndex
    ) {
      // This is reordering within the same layout - don't add, the child handler should handle this
      console.log('Ignoring layout drop - this should be handled by child reordering');
      return;
    }

    // Add the module to the layout module (only for new modules coming from outside)
    targetLayoutModule.modules.push(draggedModule);

    // Remove the module from its original location
    const sourceRow = layout.rows[this._draggedItem.rowIndex];
    if (sourceRow && sourceRow.columns[this._draggedItem.columnIndex!]) {
      const sourceColumn = sourceRow.columns[this._draggedItem.columnIndex!];
      sourceColumn.modules.splice(this._draggedItem.moduleIndex!, 1);
    }

    // Update the layout
    this._updateLayout(layout);
    console.log('Module successfully moved to layout module');

    // Clear drag state
    this._draggedItem = null;
    this._dropTarget = null;
  }

  private _onLayoutChildDragStart(
    e: DragEvent,
    parentRowIndex?: number,
    parentColumnIndex?: number,
    parentModuleIndex?: number,
    childIndex?: number
  ): void {
    if (!e.dataTransfer) return;

    e.stopPropagation();

    // Get the child module data
    const layout = this._ensureLayout();
    const layoutModule = layout.rows[parentRowIndex!]?.columns[parentColumnIndex!]?.modules[
      parentModuleIndex!
    ] as any;
    const childModule = layoutModule?.modules?.[childIndex!];

    if (childModule) {
      // Set drag data to indicate this is from a layout child
      this._draggedItem = {
        type: 'module',
        rowIndex: parentRowIndex!,
        columnIndex: parentColumnIndex!,
        moduleIndex: parentModuleIndex!,
        data: childModule,
        // Add special property to indicate this is from layout child
        layoutChildIndex: childIndex,
      } as any;

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(
        'text/plain',
        JSON.stringify({
          type: 'layout-child',
          parentRowIndex,
          parentColumnIndex,
          parentModuleIndex,
          childIndex,
        })
      );

      // Add visual feedback
      const target = e.currentTarget as HTMLElement;
      if (target) {
        target.style.opacity = '0.6';
        target.style.transform = 'scale(0.95)';
      }
    }
  }

  private _onLayoutChildDragEnd(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = '';
      target.style.transform = '';
    }

    this._draggedItem = null;
    this._dropTarget = null;
    this.requestUpdate();
  }

  private _onLayoutChildDragEnter(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number,
    childIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this._draggedItem || this._draggedItem.type !== 'module') return;

    // Don't allow dropping on self
    if (
      this._draggedItem.layoutChildIndex !== undefined &&
      this._draggedItem.rowIndex === rowIndex &&
      this._draggedItem.columnIndex === columnIndex &&
      this._draggedItem.moduleIndex === moduleIndex &&
      this._draggedItem.layoutChildIndex === childIndex
    ) {
      return;
    }

    // Set drop target for layout child reordering
    this._dropTarget = {
      type: 'layout-child',
      rowIndex: rowIndex!,
      columnIndex: columnIndex!,
      moduleIndex: moduleIndex!,
      childIndex: childIndex!,
    };
    this.requestUpdate();
  }

  private _onLayoutChildDrop(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number,
    childIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this._draggedItem || this._draggedItem.type !== 'module') {
      console.log('Invalid drop - not a module or no dragged item');
      return;
    }

    if (
      rowIndex === undefined ||
      columnIndex === undefined ||
      moduleIndex === undefined ||
      childIndex === undefined
    ) {
      console.log('Invalid drop - missing coordinates');
      return;
    }

    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));
    const targetLayoutModule = newLayout.rows[rowIndex].columns[columnIndex].modules[
      moduleIndex
    ] as any;

    if (!targetLayoutModule || !this._isLayoutModule(targetLayoutModule.type)) {
      console.log('Invalid drop - target is not a layout module');
      return;
    }

    if (!targetLayoutModule.modules) {
      targetLayoutModule.modules = [];
    }

    // Handle reordering within the same layout module
    if (this._draggedItem.layoutChildIndex !== undefined) {
      const sourceParentRow = this._draggedItem.rowIndex;
      const sourceParentColumn = this._draggedItem.columnIndex!;
      const sourceParentModule = this._draggedItem.moduleIndex!;
      const sourceChildIndex = this._draggedItem.layoutChildIndex;

      // Only handle reordering within the same layout module
      if (
        sourceParentRow === rowIndex &&
        sourceParentColumn === columnIndex &&
        sourceParentModule === moduleIndex
      ) {
        if (sourceChildIndex === childIndex) {
          // Dropping on self, do nothing
          return;
        }

        // Remove from source position
        const movedModule = targetLayoutModule.modules.splice(sourceChildIndex, 1)[0];

        // Calculate new insertion index - INSERT BEFORE the target module
        let newIndex = childIndex;

        // If we removed an item from before the target position, adjust the target index
        if (sourceChildIndex < childIndex) {
          newIndex = childIndex - 1;
        }

        // Insert at new position (before the target module)
        targetLayoutModule.modules.splice(newIndex, 0, movedModule);

        this._updateLayout(newLayout);
        console.log('Layout child module reordered successfully');
      } else {
        // Handle moving from a different layout module to this one
        const sourceLayoutModule = newLayout.rows[sourceParentRow].columns[sourceParentColumn]
          .modules[sourceParentModule] as any;

        if (
          sourceLayoutModule &&
          this._isLayoutModule(sourceLayoutModule.type) &&
          sourceLayoutModule.modules
        ) {
          // Remove from source layout
          const movedModule = sourceLayoutModule.modules.splice(sourceChildIndex, 1)[0];

          // Insert before the target module in the new layout
          targetLayoutModule.modules.splice(childIndex, 0, movedModule);

          this._updateLayout(newLayout);
          console.log('Module moved from one layout to another successfully');
        }
      }
    } else {
      // Handle dropping from a regular column - INSERT BEFORE the target module
      const draggedModule = JSON.parse(JSON.stringify(this._draggedItem.data));

      // Insert before the target module
      targetLayoutModule.modules.splice(childIndex, 0, draggedModule);

      // Remove from source column
      const sourceRow = newLayout.rows[this._draggedItem.rowIndex];
      if (sourceRow && sourceRow.columns[this._draggedItem.columnIndex!]) {
        const sourceColumn = sourceRow.columns[this._draggedItem.columnIndex!];
        sourceColumn.modules.splice(this._draggedItem.moduleIndex!, 1);
      }

      this._updateLayout(newLayout);
      console.log('Module moved from column to layout position successfully');
    }

    // Clear drag state
    this._draggedItem = null;
    this._dropTarget = null;
    this.requestUpdate();
  }

  private _onLayoutAppendDragEnter(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this._draggedItem || this._draggedItem.type !== 'module') return;

    // Set drop target for appending at the end
    this._dropTarget = {
      type: 'layout-append' as any,
      rowIndex: rowIndex!,
      columnIndex: columnIndex!,
      moduleIndex: moduleIndex!,
    };

    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.borderColor = 'var(--primary-color)';
    target.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';

    this.requestUpdate();
  }

  private _onLayoutAppendDrop(
    e: DragEvent,
    rowIndex?: number,
    columnIndex?: number,
    moduleIndex?: number
  ): void {
    e.preventDefault();
    e.stopPropagation();

    // Remove visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.borderColor = 'transparent';
    target.style.backgroundColor = 'transparent';

    if (!this._draggedItem || this._draggedItem.type !== 'module') {
      console.log('Invalid drop - not a module or no dragged item');
      return;
    }

    if (rowIndex === undefined || columnIndex === undefined || moduleIndex === undefined) {
      console.log('Invalid drop - missing coordinates');
      return;
    }

    const layout = this._ensureLayout();
    const newLayout = JSON.parse(JSON.stringify(layout));
    const targetLayoutModule = newLayout.rows[rowIndex].columns[columnIndex].modules[
      moduleIndex
    ] as any;

    if (targetLayoutModule && this._isLayoutModule(targetLayoutModule.type)) {
      if (!targetLayoutModule.modules) {
        targetLayoutModule.modules = [];
      }

      // Handle reordering within the same layout module (move to end)
      if (
        this._draggedItem.layoutChildIndex !== undefined &&
        this._draggedItem.rowIndex === rowIndex &&
        this._draggedItem.columnIndex === columnIndex &&
        this._draggedItem.moduleIndex === moduleIndex
      ) {
        const sourceChildIndex = this._draggedItem.layoutChildIndex;

        // Remove from source position
        const movedModule = targetLayoutModule.modules.splice(sourceChildIndex, 1)[0];

        // Add to the end
        targetLayoutModule.modules.push(movedModule);

        this._updateLayout(newLayout);
        console.log('Layout child module moved to end successfully');
      } else {
        // Handle moving from outside the layout (new module)
        const draggedModule = JSON.parse(JSON.stringify(this._draggedItem.data));

        // Add to the end
        targetLayoutModule.modules.push(draggedModule);

        // Remove from source if it's not from a layout child
        if (this._draggedItem.layoutChildIndex === undefined) {
          const sourceRow = newLayout.rows[this._draggedItem.rowIndex];
          if (sourceRow && sourceRow.columns[this._draggedItem.columnIndex!]) {
            const sourceColumn = sourceRow.columns[this._draggedItem.columnIndex!];
            sourceColumn.modules.splice(this._draggedItem.moduleIndex!, 1);
          }
        }

        this._updateLayout(newLayout);
        console.log('Module successfully moved to end of layout module');
      }
    }

    // Clear drag state
    this._draggedItem = null;
    this._dropTarget = null;
    this.requestUpdate();
  }

  // Layout module management methods
  private _openLayoutModuleSelector(
    rowIndex: number,
    columnIndex: number,
    moduleIndex: number
  ): void {
    console.log('Opening layout module selector for:', rowIndex, columnIndex, moduleIndex);
    // Set the layout module as the target for adding child modules
    this._selectedRowIndex = rowIndex;
    this._selectedColumnIndex = columnIndex;
    this._selectedLayoutModuleIndex = moduleIndex;
    this._showModuleSelector = true;
  }

  private _openLayoutChildSettings(
    parentRowIndex: number,
    parentColumnIndex: number,
    parentModuleIndex: number,
    childIndex: number
  ): void {
    console.log(
      'Opening layout child settings:',
      parentRowIndex,
      parentColumnIndex,
      parentModuleIndex,
      childIndex
    );

    this._selectedLayoutChild = {
      parentRowIndex,
      parentColumnIndex,
      parentModuleIndex,
      childIndex,
    };
    this._showLayoutChildSettings = true;
  }

  private _duplicateLayoutChildModule(
    parentRowIndex: number,
    parentColumnIndex: number,
    parentModuleIndex: number,
    childIndex: number
  ): void {
    console.log(
      'Duplicating layout child module:',
      parentRowIndex,
      parentColumnIndex,
      parentModuleIndex,
      childIndex
    );

    const layout = this._ensureLayout();
    const row = layout.rows[parentRowIndex];
    if (!row || !row.columns[parentColumnIndex]) return;

    const column = row.columns[parentColumnIndex];
    if (!column.modules || !column.modules[parentModuleIndex]) return;

    const layoutModule = column.modules[parentModuleIndex] as any;
    if (!layoutModule.modules || !layoutModule.modules[childIndex]) return;

    // Clone the child module
    const childModuleToDuplicate = layoutModule.modules[childIndex];
    const duplicatedModule = JSON.parse(JSON.stringify(childModuleToDuplicate));

    // Create new layout with the duplicated child module
    const newLayout = {
      rows: layout.rows.map((r, rIndex) => {
        if (rIndex === parentRowIndex) {
          return {
            ...r,
            columns: r.columns.map((col, cIndex) => {
              if (cIndex === parentColumnIndex) {
                return {
                  ...col,
                  modules: col.modules.map((module, mIndex) => {
                    if (mIndex === parentModuleIndex) {
                      const updatedLayoutModule = module as any;
                      const newModules = [...updatedLayoutModule.modules];
                      // Insert the duplicated module right after the original
                      newModules.splice(childIndex + 1, 0, duplicatedModule);
                      return {
                        ...updatedLayoutModule,
                        modules: newModules,
                      };
                    }
                    return module;
                  }),
                };
              }
              return col;
            }),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
    console.log('Layout child module duplicated successfully');
  }

  private _deleteLayoutChildModule(
    parentRowIndex: number,
    parentColumnIndex: number,
    parentModuleIndex: number,
    childIndex: number
  ): void {
    console.log(
      'Deleting layout child module:',
      parentRowIndex,
      parentColumnIndex,
      parentModuleIndex,
      childIndex
    );

    const layout = this._ensureLayout();
    const row = layout.rows[parentRowIndex];
    if (!row || !row.columns[parentColumnIndex]) return;

    const column = row.columns[parentColumnIndex];
    if (!column.modules || !column.modules[parentModuleIndex]) return;

    const layoutModule = column.modules[parentModuleIndex] as any;
    if (!layoutModule.modules || !layoutModule.modules[childIndex]) return;

    // Create new layout without the deleted child module
    const newLayout = {
      rows: layout.rows.map((r, rIndex) => {
        if (rIndex === parentRowIndex) {
          return {
            ...r,
            columns: r.columns.map((col, cIndex) => {
              if (cIndex === parentColumnIndex) {
                return {
                  ...col,
                  modules: col.modules.map((module, mIndex) => {
                    if (mIndex === parentModuleIndex) {
                      const updatedLayoutModule = module as any;
                      return {
                        ...updatedLayoutModule,
                        modules: updatedLayoutModule.modules.filter(
                          (_: any, index: number) => index !== childIndex
                        ),
                      };
                    }
                    return module;
                  }),
                };
              }
              return col;
            }),
          };
        }
        return r;
      }),
    };

    this._updateLayout(newLayout);
    console.log('Layout child module deleted successfully');
  }

  private _getModuleDisplayName(module: CardModule): string {
    // Check for custom module name first (for editor organization)
    const moduleAny = module as any;
    if (moduleAny.module_name && moduleAny.module_name.trim()) {
      return moduleAny.module_name;
    }

    // Fallback to consistent module type names
    switch (module.type) {
      case 'text':
        return 'Text Module';
      case 'image':
        return 'Image Module';
      case 'icon':
        return 'Icon Module';
      case 'bar':
        return 'Bar Module';
      case 'info':
        return 'Info Module';
      case 'button':
        return 'Button Module';
      case 'separator':
        return 'Separator Module';
      case 'markdown':
        return 'Markdown Module';
      default:
        return module.type.charAt(0).toUpperCase() + module.type.slice(1) + ' Module';
    }
  }

  private _generateModuleInfo(module: CardModule): string {
    const moduleAny = module as any;

    switch (module.type) {
      case 'text':
        // Show the actual text content
        if (moduleAny.text && moduleAny.text.trim()) {
          return moduleAny.text.length > 50
            ? `${moduleAny.text.substring(0, 50)}...`
            : moduleAny.text;
        }
        return 'No text configured';

      case 'image':
        // Show image name/source
        if (moduleAny.image_entity) return `Entity: ${moduleAny.image_entity}`;
        if (moduleAny.image_url) {
          const url = moduleAny.image_url;
          // Handle base64 data URLs (uploaded images)
          if (url.startsWith('data:image/')) {
            return 'Uploaded image';
          }
          // Handle regular URLs
          const fileName = url.split('/').pop() || url;
          return fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName;
        }
        if (moduleAny.image_path) {
          const path = moduleAny.image_path;
          const fileName = path.split('/').pop() || path;
          return fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName;
        }
        return 'No image configured';

      case 'icon':
        const iconCount = moduleAny.icons?.length || 0;
        if (iconCount > 1) return `${iconCount} icons configured`;
        if (iconCount === 1) {
          const firstIcon = moduleAny.icons[0];
          if (firstIcon?.entity) return `Entity: ${firstIcon.entity}`;
          if (firstIcon?.icon) return `Icon: ${firstIcon.icon}`;
          return 'Icon configured';
        }
        return 'No icons configured';

      case 'bar':
        // Show the entity configured for the bar
        if (moduleAny.entity) return `Entity: ${moduleAny.entity}`;
        return 'Entity: sensor.battery_level'; // Default entity suggestion

      case 'info':
        // Show the entity configured for info module
        if (moduleAny.info_entities?.length) {
          const firstEntity = moduleAny.info_entities[0];
          if (firstEntity?.entity) {
            return moduleAny.info_entities.length > 1
              ? `${firstEntity.entity} + ${moduleAny.info_entities.length - 1} more`
              : `Entity: ${firstEntity.entity}`;
          }
        }
        if (moduleAny.entity) return `Entity: ${moduleAny.entity}`;
        if (moduleAny.entities?.length) return `${moduleAny.entities.length} entities configured`;
        return 'No entity configured';

      case 'button':
        // Show the actual button text (without quotes)
        if (moduleAny.button_text && moduleAny.button_text.trim()) {
          return moduleAny.button_text;
        }
        if (moduleAny.text && moduleAny.text.trim()) {
          return moduleAny.text;
        }
        if (moduleAny.label && moduleAny.label.trim()) {
          return moduleAny.label;
        }
        return 'No button text configured';

      case 'markdown':
        // Show first few words of markdown content
        const markdownContent = moduleAny.content || moduleAny.markdown_content;
        if (markdownContent && markdownContent.trim()) {
          const plainText = markdownContent.replace(/[#*`>\-\[\]]/g, '').trim();
          const words = plainText.split(' ').slice(0, 8).join(' ');
          return words.length > 40 ? `${words.substring(0, 40)}...` : words;
        }
        return 'This is a markdown module that supports italic and bold text...';

      case 'separator':
        const sepInfo = [];
        if (moduleAny.separator_style) sepInfo.push(`Style: ${moduleAny.separator_style}`);
        if (moduleAny.thickness) sepInfo.push(`${moduleAny.thickness}px thick`);
        if (moduleAny.width_percent && moduleAny.width_percent !== 100)
          sepInfo.push(`${moduleAny.width_percent}% width`);
        if (sepInfo.length > 0) return sepInfo.join(' • ');
        return 'Visual separator';

      default:
        // Try to find the most relevant info for any module
        if (moduleAny.entity) return `Entity: ${moduleAny.entity}`;
        if (moduleAny.entities?.length) return `${moduleAny.entities.length} entities`;
        if (moduleAny.value !== undefined) return `Value: ${moduleAny.value}`;
        if (moduleAny.text)
          return `Text: ${moduleAny.text.length > 20 ? moduleAny.text.substring(0, 20) + '...' : moduleAny.text}`;
        return `${module.type.charAt(0).toUpperCase()}${module.type.slice(1)} module`;
    }
  }

  private _renderSingleModuleWithAnimation(module: CardModule): TemplateResult {
    // Initialize logic service with current hass instance
    logicService.setHass(this.hass);

    // Check module display conditions
    const shouldShow = logicService.evaluateDisplayConditions(
      module.display_conditions || [],
      module.display_mode || 'always'
    );

    // Also check global design logic properties if they exist
    const moduleWithDesign = module as any;
    const globalLogicVisible = logicService.evaluateLogicProperties({
      logic_entity: moduleWithDesign.design?.logic_entity,
      logic_attribute: moduleWithDesign.design?.logic_attribute,
      logic_operator: moduleWithDesign.design?.logic_operator,
      logic_value: moduleWithDesign.design?.logic_value,
    });

    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    // Always render the module, but dim it if logic conditions are not met
    const isLogicHidden = !shouldShow || !globalLogicVisible;

    let moduleContent;
    if (moduleHandler) {
      moduleContent = moduleHandler.renderPreview(module, this.hass);
    } else {
      // Fallback for unknown module types
      moduleContent = html`
        <div class="module-placeholder">
          <ha-icon icon="mdi:help-circle"></ha-icon>
          <span>Unknown Module: ${module.type}</span>
        </div>
      `;
    }

    // Get animation class and duration for preview (show animation if configured)
    const animationData = this._getPreviewAnimationData(moduleWithDesign);

    // Wrap with logic status indicator and animation
    return html`
      <div class="module-with-logic ${isLogicHidden ? 'logic-hidden' : ''}">
        ${animationData.class
          ? html`
              <div
                class="${animationData.class}"
                style="display: inherit; width: inherit; height: inherit; flex: inherit; animation-duration: ${animationData.duration};"
              >
                ${moduleContent}
              </div>
            `
          : moduleContent}
        ${isLogicHidden
          ? html`
              <div class="logic-overlay">
                <ha-icon icon="mdi:eye-off-outline"></ha-icon>
                <span>Hidden by Logic</span>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _getPreviewAnimationData(moduleWithDesign: any): { class: string; duration: string } {
    // Check if module has animation configured
    const animationType =
      moduleWithDesign.animation_type || moduleWithDesign.design?.animation_type;

    if (!animationType || animationType === 'none') {
      return { class: '', duration: '2s' };
    }

    // Get animation duration or use default
    const animationDuration =
      moduleWithDesign.animation_duration || moduleWithDesign.design?.animation_duration || '2s';

    // Check if entity condition is configured and evaluate it
    const animationEntity =
      moduleWithDesign.animation_entity || moduleWithDesign.design?.animation_entity;
    const animationTriggerType =
      moduleWithDesign.animation_trigger_type ||
      moduleWithDesign.design?.animation_trigger_type ||
      'state';
    const animationAttribute =
      moduleWithDesign.animation_attribute || moduleWithDesign.design?.animation_attribute;
    const animationState =
      moduleWithDesign.animation_state || moduleWithDesign.design?.animation_state;

    // If no entity configured, always show animation
    if (!animationEntity) {
      return {
        class: `animation-${animationType}`,
        duration: animationDuration,
      };
    }

    // If entity is configured, check actual state to match real card behavior
    if (animationState && this.hass) {
      const entity = this.hass.states[animationEntity];
      if (entity) {
        let shouldTriggerAnimation = false;

        if (animationTriggerType === 'attribute' && animationAttribute) {
          // Check attribute value
          const attributeValue = entity.attributes[animationAttribute];
          shouldTriggerAnimation = String(attributeValue) === animationState;
        } else {
          // Check entity state
          shouldTriggerAnimation = entity.state === animationState;
        }

        // Only show animation if condition is met (matching actual card behavior)
        if (shouldTriggerAnimation) {
          return {
            class: `animation-${animationType}`,
            duration: animationDuration,
          };
        }
      }
    }

    // Entity configured but condition not met - no animation
    return { class: '', duration: animationDuration };
  }

  private _getRowPreviewAnimationData(row: any): { class: string; duration: string } {
    // Check if row has animation configured in design
    const design = row.design || {};
    const animationType = design.animation_type;

    if (!animationType || animationType === 'none') {
      return { class: '', duration: '2s' };
    }

    // Get animation duration or use default
    const animationDuration = design.animation_duration || '2s';

    // Check if entity condition is configured and evaluate it
    const animationEntity = design.animation_entity;
    const animationTriggerType = design.animation_trigger_type || 'state';
    const animationAttribute = design.animation_attribute;
    const animationState = design.animation_state;

    // If no entity configured, always show animation
    if (!animationEntity) {
      return {
        class: `animation-${animationType}`,
        duration: animationDuration,
      };
    }

    // If entity is configured, check actual state to match real card behavior
    if (animationState && this.hass) {
      const entity = this.hass.states[animationEntity];
      if (entity) {
        let shouldTriggerAnimation = false;

        if (animationTriggerType === 'attribute' && animationAttribute) {
          // Check attribute value
          const attributeValue = entity.attributes[animationAttribute];
          shouldTriggerAnimation = String(attributeValue) === animationState;
        } else {
          // Check entity state
          shouldTriggerAnimation = entity.state === animationState;
        }

        // Only show animation if condition is met (matching actual card behavior)
        if (shouldTriggerAnimation) {
          return {
            class: `animation-${animationType}`,
            duration: animationDuration,
          };
        }
      }
    }

    // Entity configured but condition not met - no animation
    return { class: '', duration: animationDuration };
  }

  private _getColumnPreviewAnimationData(column: any): { class: string; duration: string } {
    // Check if column has animation configured in design
    const design = column.design || {};
    const animationType = design.animation_type;

    if (!animationType || animationType === 'none') {
      return { class: '', duration: '2s' };
    }

    // Get animation duration or use default
    const animationDuration = design.animation_duration || '2s';

    // Check if entity condition is configured and evaluate it
    const animationEntity = design.animation_entity;
    const animationTriggerType = design.animation_trigger_type || 'state';
    const animationAttribute = design.animation_attribute;
    const animationState = design.animation_state;

    // If no entity configured, always show animation
    if (!animationEntity) {
      return {
        class: `animation-${animationType}`,
        duration: animationDuration,
      };
    }

    // If entity is configured, check actual state to match real card behavior
    if (animationState && this.hass) {
      const entity = this.hass.states[animationEntity];
      if (entity) {
        let shouldTriggerAnimation = false;

        if (animationTriggerType === 'attribute' && animationAttribute) {
          // Check attribute value
          const attributeValue = entity.attributes[animationAttribute];
          shouldTriggerAnimation = String(attributeValue) === animationState;
        } else {
          // Check entity state
          shouldTriggerAnimation = entity.state === animationState;
        }

        // Only show animation if condition is met (matching actual card behavior)
        if (shouldTriggerAnimation) {
          return {
            class: `animation-${animationType}`,
            duration: animationDuration,
          };
        }
      }
    }

    // Entity configured but condition not met - no animation
    return { class: '', duration: animationDuration };
  }

  private _renderRowPreview(row: CardRow): TemplateResult {
    // Get row animation data for preview
    const rowAnimationData = this._getRowPreviewAnimationData(row);

    const rowContent = html`
      <div
        class="row-preview-content"
        style="background: ${row.background_color ||
        'var(--ha-card-background, var(--card-background-color, #fff))'};gap: ${row.gap || 16}px;"
      >
        ${row.columns.map(
          (column, columnIndex) => html`<div class="column-preview">Column ${columnIndex + 1}</div>`
        )}
      </div>
    `;

    return html`
      <div class="module-preview">
        <div class="preview-header">Live Preview</div>
        <div class="preview-content">
          ${rowAnimationData.class
            ? html`
                <div
                  class="${rowAnimationData.class}"
                  style="display: inherit; width: inherit; height: inherit; flex: inherit; animation-duration: ${rowAnimationData.duration};"
                >
                  ${rowContent}
                </div>
              `
            : rowContent}
        </div>
      </div>
    `;
  }

  private _renderColumnPreview(column: CardColumn): TemplateResult {
    // Get column animation data for preview
    const columnAnimationData = this._getColumnPreviewAnimationData(column);

    const columnContent = html`
      <div class="column-preview-content">
        <p>Column Preview</p>
        <div class="module-count">${column.modules?.length || 0} modules</div>
      </div>
    `;

    return html`
      <div class="module-preview">
        <div class="preview-header">Live Preview</div>
        <div class="preview-content">
          ${columnAnimationData.class
            ? html`
                <div
                  class="${columnAnimationData.class}"
                  style="display: inherit; width: inherit; height: inherit; flex: inherit; animation-duration: ${columnAnimationData.duration};"
                >
                  ${columnContent}
                </div>
              `
            : columnContent}
        </div>
      </div>
    `;
  }

  private _renderModuleSettings(): TemplateResult {
    if (!this._selectedModule) return html``;

    const { rowIndex, columnIndex, moduleIndex } = this._selectedModule;
    const module = this.config.layout?.rows[rowIndex]?.columns[columnIndex]?.modules[moduleIndex];

    if (!module) return html``;

    // Determine which extra tabs are supported by this module
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);
    const hasActionsTab =
      moduleHandler && typeof (moduleHandler as any).renderActionsTab === 'function';
    const hasOtherTab =
      moduleHandler && typeof (moduleHandler as any).renderOtherTab === 'function';

    // Ensure active tab is valid for this module
    if (
      (this._activeModuleTab === 'actions' && !hasActionsTab) ||
      (this._activeModuleTab === 'other' && !hasOtherTab)
    ) {
      this._activeModuleTab = 'general';
    }

    return html`
      <div class="module-settings-popup">
        <div class="popup-overlay"></div>
        <div class="popup-content">
          <div class="popup-header">
            <h3>Module Settings - ${module.type.charAt(0).toUpperCase() + module.type.slice(1)}</h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${() => {
                  if (this._selectedModule) {
                    this._duplicateModule(
                      this._selectedModule.rowIndex,
                      this._selectedModule.columnIndex,
                      this._selectedModule.moduleIndex
                    );
                    this._closeModuleSettings();
                  }
                }}
                title="Duplicate Module"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${() => {
                  if (this._selectedModule) {
                    this._deleteModule(
                      this._selectedModule.rowIndex,
                      this._selectedModule.columnIndex,
                      this._selectedModule.moduleIndex
                    );
                    this._closeModuleSettings();
                  }
                }}
                title="Delete Module"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${() => this._closeModuleSettings()}>×</button>
            </div>
          </div>

          ${this._renderModulePreview()}

          <div class="module-tabs">
            <button
              class="module-tab ${this._activeModuleTab === 'general' ? 'active' : ''}"
              @click=${() => (this._activeModuleTab = 'general')}
            >
              General
            </button>
            ${hasActionsTab
              ? html`
                  <button
                    class="module-tab ${this._activeModuleTab === 'actions' ? 'active' : ''}"
                    @click=${() => (this._activeModuleTab = 'actions')}
                  >
                    Actions
                  </button>
                `
              : ''}
            ${hasOtherTab
              ? html`
                  <button
                    class="module-tab ${this._activeModuleTab === 'other' ? 'active' : ''}"
                    @click=${() => (this._activeModuleTab = 'other')}
                  >
                    Other
                  </button>
                `
              : ''}
            <button
              class="module-tab ${this._activeModuleTab === 'logic' ? 'active' : ''}"
              @click=${() => (this._activeModuleTab = 'logic')}
            >
              Logic
            </button>
            <button
              class="module-tab ${this._activeModuleTab === 'design' ? 'active' : ''}"
              @click=${() => (this._activeModuleTab = 'design')}
            >
              Design
            </button>
          </div>

          <div class="module-tab-content">
            ${this._activeModuleTab === 'general' ? this._renderGeneralTab(module) : ''}
            ${this._activeModuleTab === 'actions' && hasActionsTab
              ? this._renderActionsTab(module)
              : ''}
            ${this._activeModuleTab === 'other' && hasOtherTab ? this._renderOtherTab(module) : ''}
            ${this._activeModuleTab === 'logic' ? this._renderLogicTab(module) : ''}
            ${this._activeModuleTab === 'design' ? this._renderDesignTab(module) : ''}
          </div>
        </div>
      </div>
    `;
  }

  private _renderLayoutChildSettings(): TemplateResult {
    if (!this._selectedLayoutChild) return html``;

    const { parentRowIndex, parentColumnIndex, parentModuleIndex, childIndex } =
      this._selectedLayoutChild;

    // Get the child module from the layout
    const layout = this._ensureLayout();
    const parentRow = layout.rows[parentRowIndex];
    if (!parentRow || !parentRow.columns[parentColumnIndex]) return html``;

    const parentColumn = parentRow.columns[parentColumnIndex];
    if (!parentColumn.modules || !parentColumn.modules[parentModuleIndex]) return html``;

    const layoutModule = parentColumn.modules[parentModuleIndex] as any;
    if (!layoutModule.modules || !layoutModule.modules[childIndex]) return html``;

    const childModule = layoutModule.modules[childIndex];

    // Determine which extra tabs are supported by this module
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(childModule.type);
    const hasActionsTab =
      moduleHandler && typeof (moduleHandler as any).renderActionsTab === 'function';
    const hasOtherTab =
      moduleHandler && typeof (moduleHandler as any).renderOtherTab === 'function';

    // Ensure active tab is valid for this module
    if (
      (this._activeModuleTab === 'actions' && !hasActionsTab) ||
      (this._activeModuleTab === 'other' && !hasOtherTab)
    ) {
      this._activeModuleTab = 'general';
    }

    return html`
      <div class="module-settings-popup">
        <div class="popup-overlay" @click=${() => this._closeLayoutChildSettings()}></div>
        <div class="popup-content">
          <div class="popup-header">
            <h3>
              Child Module Settings -
              ${childModule.type.charAt(0).toUpperCase() + childModule.type.slice(1)}
            </h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${() => {
                  if (this._selectedLayoutChild) {
                    this._duplicateLayoutChildModule(
                      this._selectedLayoutChild.parentRowIndex,
                      this._selectedLayoutChild.parentColumnIndex,
                      this._selectedLayoutChild.parentModuleIndex,
                      this._selectedLayoutChild.childIndex
                    );
                    this._closeLayoutChildSettings();
                  }
                }}
                title="Duplicate Child Module"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${() => {
                  if (this._selectedLayoutChild) {
                    this._deleteLayoutChildModule(
                      this._selectedLayoutChild.parentRowIndex,
                      this._selectedLayoutChild.parentColumnIndex,
                      this._selectedLayoutChild.parentModuleIndex,
                      this._selectedLayoutChild.childIndex
                    );
                    this._closeLayoutChildSettings();
                  }
                }}
                title="Delete Child Module"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${() => this._closeLayoutChildSettings()}>
                ×
              </button>
            </div>
          </div>

          <!-- Child module preview -->
          <div class="module-preview">
            <div class="preview-header">Live Preview</div>
            <div class="preview-content">${this._renderSingleModuleWithAnimation(childModule)}</div>
          </div>

          <div class="module-tabs">
            <button
              class="module-tab ${this._activeModuleTab === 'general' ? 'active' : ''}"
              @click=${() => (this._activeModuleTab = 'general')}
            >
              General
            </button>
            ${hasActionsTab
              ? html`
                  <button
                    class="module-tab ${this._activeModuleTab === 'actions' ? 'active' : ''}"
                    @click=${() => (this._activeModuleTab = 'actions')}
                  >
                    Actions
                  </button>
                `
              : ''}
            ${hasOtherTab
              ? html`
                  <button
                    class="module-tab ${this._activeModuleTab === 'other' ? 'active' : ''}"
                    @click=${() => (this._activeModuleTab = 'other')}
                  >
                    Other
                  </button>
                `
              : ''}
            <button
              class="module-tab ${this._activeModuleTab === 'logic' ? 'active' : ''}"
              @click=${() => (this._activeModuleTab = 'logic')}
            >
              Logic
            </button>
            <button
              class="module-tab ${this._activeModuleTab === 'design' ? 'active' : ''}"
              @click=${() => (this._activeModuleTab = 'design')}
            >
              Design
            </button>
          </div>

          <div class="module-tab-content">
            ${this._activeModuleTab === 'general'
              ? this._renderLayoutChildGeneralTab(childModule)
              : ''}
            ${this._activeModuleTab === 'actions' && hasActionsTab
              ? this._renderLayoutChildActionsTab(childModule)
              : ''}
            ${this._activeModuleTab === 'other' && hasOtherTab
              ? this._renderLayoutChildOtherTab(childModule)
              : ''}
            ${this._activeModuleTab === 'logic' ? this._renderLayoutChildLogicTab(childModule) : ''}
            ${this._activeModuleTab === 'design'
              ? this._renderLayoutChildDesignTab(childModule)
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Layout child module tab render methods
  private _renderLayoutChildGeneralTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    // Render Module Name field first for all modules
    const moduleNameField = html`
      <div class="settings-section">
        <label>Module Name:</label>
        <input
          type="text"
          .value=${(module as any).module_name || ''}
          @input=${(e: Event) =>
            this._updateLayoutChildModule({
              module_name: (e.target as HTMLInputElement).value,
            } as any)}
          placeholder="Give this module a custom name to make it easier to identify in the editor."
          class="module-name-input"
        />
        <div class="field-help">
          Give this module a custom name to make it easier to identify in the editor.
        </div>
      </div>
    `;

    if (moduleHandler) {
      const moduleContent = moduleHandler.renderGeneralTab(
        module,
        this.hass,
        this.config,
        updates => this._updateLayoutChildModule(updates)
      );

      return html` ${moduleNameField} ${moduleContent} `;
    }

    // Fallback for unknown module types
    return html`
      ${moduleNameField}
      <div class="settings-section">
        <div class="error-message">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <span>No settings available for module type: ${module.type}</span>
        </div>
      </div>
    `;
  }

  private _renderLayoutChildActionsTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (moduleHandler && typeof (moduleHandler as any).renderActionsTab === 'function') {
      return (moduleHandler as any).renderActionsTab(module, this.hass, this.config, updates =>
        this._updateLayoutChildModule(updates)
      );
    }

    // Fallback for modules without actions tab
    return html`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have action settings</span>
        </div>
      </div>
    `;
  }

  private _renderLayoutChildOtherTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (moduleHandler && typeof (moduleHandler as any).renderOtherTab === 'function') {
      return (moduleHandler as any).renderOtherTab(module, this.hass, this.config, updates =>
        this._updateLayoutChildModule(updates)
      );
    }

    // Fallback for modules without other tab
    return html`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have other settings</span>
        </div>
      </div>
    `;
  }

  private _renderLayoutChildLogicTab(module: CardModule): TemplateResult {
    // Use the existing logic tab implementation but temporarily set the selected module
    // This is a bit of a hack but works for the logic tab which relies on _selectedModule
    const originalSelected = this._selectedModule;
    const tempSelected = {
      rowIndex: 0,
      columnIndex: 0,
      moduleIndex: 0,
    };
    this._selectedModule = tempSelected;

    // Override the _updateModule method temporarily
    const originalUpdateModule = this._updateModule.bind(this);
    this._updateModule = (updates: Partial<CardModule>) => {
      this._updateLayoutChildModule(updates);
    };

    const result = this._renderLogicTab(module);

    // Restore original methods
    this._selectedModule = originalSelected;
    this._updateModule = originalUpdateModule;

    return result;
  }

  private _renderLayoutChildDesignTab(module: CardModule): TemplateResult {
    // Use the existing design tab implementation but temporarily override update methods
    const originalUpdateModule = this._updateModule.bind(this);
    const originalUpdateModuleDesign = this._updateModuleDesign.bind(this);

    this._updateModule = (updates: Partial<CardModule>) => {
      this._updateLayoutChildModule(updates);
    };

    this._updateModuleDesign = (updates: Partial<DesignProperties>) => {
      this._updateLayoutChildModule({ design: updates } as any);
    };

    const result = this._renderDesignTab(module);

    // Restore original methods
    this._updateModule = originalUpdateModule;
    this._updateModuleDesign = originalUpdateModuleDesign;

    return result;
  }

  private _renderRowSettings(): TemplateResult {
    if (this._selectedRowForSettings === -1) return html``;

    const row = this.config.layout?.rows[this._selectedRowForSettings];
    if (!row) return html``;

    return html`
      <div class="settings-popup">
        <div class="popup-overlay" @click=${() => (this._showRowSettings = false)}></div>
        <div class="popup-content">
          <div class="popup-header">
            <h3>Row Settings</h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${() => {
                  this._duplicateRow(this._selectedRowForSettings);
                  this._showRowSettings = false;
                }}
                title="Duplicate Row"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${() => {
                  this._deleteRow(this._selectedRowForSettings);
                  this._showRowSettings = false;
                }}
                title="Delete Row"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${() => (this._showRowSettings = false)}>
                ×
              </button>
            </div>
          </div>

          ${this._renderRowPreview(row)}

          <div class="settings-tabs">
            <button
              class="settings-tab ${this._activeRowTab === 'general' ? 'active' : ''}"
              @click=${() => (this._activeRowTab = 'general')}
            >
              General
            </button>
            <button
              class="settings-tab ${this._activeRowTab === 'logic' ? 'active' : ''}"
              @click=${() => (this._activeRowTab = 'logic')}
            >
              Logic
            </button>
            <button
              class="settings-tab ${this._activeRowTab === 'design' ? 'active' : ''}"
              @click=${() => (this._activeRowTab = 'design')}
            >
              Design
            </button>
          </div>

          <div class="settings-tab-content">
            ${this._activeRowTab === 'general' ? this._renderRowGeneralTab(row) : ''}
            ${this._activeRowTab === 'logic' ? this._renderRowLogicTab(row) : ''}
            ${this._activeRowTab === 'design' ? this._renderRowDesignTab(row) : ''}
          </div>
        </div>
      </div>
    `;
  }

  private _renderColumnSettings(): TemplateResult {
    if (!this._selectedColumnForSettings) return html``;

    const { rowIndex, columnIndex } = this._selectedColumnForSettings;
    const column = this.config.layout?.rows[rowIndex]?.columns[columnIndex];
    if (!column) return html``;

    return html`
      <div class="settings-popup">
        <div class="popup-overlay" @click=${() => (this._showColumnSettings = false)}></div>
        <div class="popup-content">
          <div class="popup-header">
            <h3>Column Settings</h3>
            <div class="header-actions">
              <button
                class="action-button duplicate-button"
                @click=${() => {
                  if (this._selectedColumnForSettings) {
                    this._duplicateColumn(
                      this._selectedColumnForSettings.rowIndex,
                      this._selectedColumnForSettings.columnIndex
                    );
                    this._showColumnSettings = false;
                  }
                }}
                title="Duplicate Column"
              >
                <ha-icon icon="mdi:content-copy"></ha-icon>
              </button>
              <button
                class="action-button delete-button"
                @click=${() => {
                  if (this._selectedColumnForSettings) {
                    this._deleteColumn(
                      this._selectedColumnForSettings.rowIndex,
                      this._selectedColumnForSettings.columnIndex
                    );
                    this._showColumnSettings = false;
                  }
                }}
                title="Delete Column"
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
              <button class="close-button" @click=${() => (this._showColumnSettings = false)}>
                ×
              </button>
            </div>
          </div>

          ${this._renderColumnPreview(column)}

          <div class="settings-tabs">
            <button
              class="settings-tab ${this._activeColumnTab === 'general' ? 'active' : ''}"
              @click=${() => (this._activeColumnTab = 'general')}
            >
              General
            </button>
            <button
              class="settings-tab ${this._activeColumnTab === 'logic' ? 'active' : ''}"
              @click=${() => (this._activeColumnTab = 'logic')}
            >
              Logic
            </button>
            <button
              class="settings-tab ${this._activeColumnTab === 'design' ? 'active' : ''}"
              @click=${() => (this._activeColumnTab = 'design')}
            >
              Design
            </button>
          </div>

          <div class="settings-tab-content">
            ${this._activeColumnTab === 'general' ? this._renderColumnGeneralTab(column) : ''}
            ${this._activeColumnTab === 'logic' ? this._renderColumnLogicTab(column) : ''}
            ${this._activeColumnTab === 'design' ? this._renderColumnDesignTab(column) : ''}
          </div>
        </div>
      </div>
    `;
  }

  private _renderRowGeneralTab(row: CardRow): TemplateResult {
    return html`
      <div class="settings-section">
        <ultra-color-picker
          .label=${'Row Background Color'}
          .value=${row.background_color || ''}
          .defaultValue=${'var(--ha-card-background, var(--card-background-color, #fff))'}
          .hass=${this.hass}
          @value-changed=${(e: CustomEvent) => {
            const value = e.detail.value;
            this._updateRow({ background_color: value });
          }}
        ></ultra-color-picker>
      </div>
      <div class="settings-section">
        <label>Column Gap (px):</label>
        <input
          type="number"
          min="0"
          max="50"
          .value=${row.gap || 16}
          @change=${(e: Event) =>
            this._updateRow({ gap: Number((e.target as HTMLInputElement).value) })}
        />
      </div>
    `;
  }

  private _renderRowLogicTab(row: CardRow): TemplateResult {
    const conditions = row.display_conditions || [];
    const displayMode = row.display_mode || 'always';
    const templateMode = row.template_mode || false;

    return html`
      <div class="logic-tab-content">
        <!-- Conditions Section (only shown when template mode is disabled) -->
        ${!templateMode
          ? html`
              <div class="logic-section">
                <div class="section-header">
                  <h3>Display this Row</h3>
                </div>

                <div class="display-mode-selector">
                  <select
                    .value=${displayMode}
                    @change=${(e: Event) => {
                      const value = (e.target as HTMLSelectElement).value as
                        | 'always'
                        | 'every'
                        | 'any';
                      this._updateRow({ display_mode: value });
                    }}
                    class="display-mode-dropdown"
                  >
                    <option value="always">Always</option>
                    <option value="every">If EVERY condition below is met</option>
                    <option value="any">If ANY condition below is met</option>
                  </select>
                </div>
              </div>

              <!-- Conditions Section -->
              ${displayMode !== 'always'
                ? html`
                    <div class="conditions-section">
                      <div class="conditions-header">
                        <h4>Conditions</h4>
                        <button
                          type="button"
                          class="add-condition-btn"
                          @click=${() => this._addRowCondition(row)}
                        >
                          <ha-icon icon="mdi:plus"></ha-icon>
                          Add Condition
                        </button>
                      </div>

                      <div class="conditions-list">
                        ${conditions.map((condition, index) =>
                          this._renderRowCondition(row, condition, index)
                        )}
                      </div>

                      ${conditions.length === 0
                        ? html`
                            <div class="no-conditions">
                              <p>No conditions added yet. Click "Add Condition" to get started.</p>
                            </div>
                          `
                        : ''}
                    </div>
                  `
                : ''}
            `
          : html`
              <div class="template-mode-notice">
                <p>
                  <em>Advanced Template Mode is enabled. Basic conditions above are ignored.</em>
                </p>
              </div>
            `}

        <!-- Advanced Template Mode Section -->
        <div class="template-section">
          <div class="switch-container">
            <span class="switch-label">Advanced Template Mode</span>
            <label class="switch">
              <input
                type="checkbox"
                .checked=${templateMode}
                @change=${(e: Event) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  this._updateRow({
                    template_mode: checked,
                    // Reset display_mode to 'always' when enabling template mode
                    display_mode: checked ? 'always' : displayMode,
                  });
                }}
              />
              <span class="slider"></span>
            </label>
          </div>
          <div class="template-description">
            Use Jinja2 templates for advanced conditional logic. When enabled, the conditions above
            are ignored.
          </div>

          ${templateMode
            ? html`
                <div class="template-content">
                  <textarea
                    .value=${row.template || ''}
                    @input=${(e: Event) =>
                      this._updateRow({ template: (e.target as HTMLTextAreaElement).value })}
                    placeholder="{% if states('binary_sensor.example') == 'on' %}true{% else %}false{% endif %}"
                    class="template-editor"
                    rows="6"
                  ></textarea>
                  <div class="template-help">
                    <p><strong>Template should return a boolean value:</strong></p>
                    <ul>
                      <li>
                        <code>true</code>, <code>on</code>, <code>yes</code>, <code>1</code> → Show
                        row
                      </li>
                      <li>
                        <code>false</code>, <code>off</code>, <code>no</code>, <code>0</code> → Hide
                        row
                      </li>
                    </ul>
                  </div>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _renderRowDesignTab(row: CardRow): TemplateResult {
    // Extract current design properties from row
    const designProperties: DesignProperties = {
      ...row.design,
      // Map legacy properties to design properties if they exist
      background_color: row.design?.background_color || row.background_color,
      padding_top: row.design?.padding_top || row.padding?.toString(),
      padding_bottom: row.design?.padding_bottom || row.padding?.toString(),
      padding_left: row.design?.padding_left || row.padding?.toString(),
      padding_right: row.design?.padding_right || row.padding?.toString(),
      border_radius: row.design?.border_radius || row.border_radius?.toString(),
      border_color: row.design?.border_color || row.border_color,
      border_width: row.design?.border_width || row.border_width?.toString(),
      margin_top: row.design?.margin_top || row.margin?.toString(),
      margin_bottom: row.design?.margin_bottom || row.margin?.toString(),
      margin_left: row.design?.margin_left || row.margin?.toString(),
      margin_right: row.design?.margin_right || row.margin?.toString(),
      // Ensure animation properties are included
      animation_type: row.design?.animation_type,
      animation_entity: row.design?.animation_entity,
      animation_trigger_type: row.design?.animation_trigger_type,
      animation_attribute: row.design?.animation_attribute,
      animation_state: row.design?.animation_state,
      animation_duration: row.design?.animation_duration,
      intro_animation: row.design?.intro_animation,
      outro_animation: row.design?.outro_animation,
      animation_delay: row.design?.animation_delay,
      animation_timing: row.design?.animation_timing,
    };

    console.log(`🔄 LayoutTab: Rendering row design tab with properties:`, designProperties);

    return html`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${designProperties}
        @design-changed=${(e: CustomEvent) => {
          console.log(`🔄 LayoutTab: Received design-changed event for ROW:`, e.detail);
          console.log(`🔄 LayoutTab: Current row design before update:`, row.design);
          const updates = e.detail;
          // Update the row with design properties
          const updatedDesign = { ...row.design, ...updates };
          console.log(`🔄 LayoutTab: Updated row design:`, updatedDesign);
          this._updateRow({ design: updatedDesign });
        }}
      ></ultra-global-design-tab>
    `;
  }

  private _renderColumnGeneralTab(column: CardColumn): TemplateResult {
    return html`
      <div class="settings-section">
        <label>Vertical Alignment:</label>
        <select
          .value=${column.vertical_alignment || 'center'}
          @change=${(e: Event) =>
            this._updateColumn({
              vertical_alignment: (e.target as HTMLSelectElement).value as any,
            })}
        >
          <option value="top">Top</option>
          <option value="center">Center</option>
          <option value="bottom">Bottom</option>
          <option value="stretch">Stretch</option>
        </select>
      </div>
      <div class="settings-section">
        <label>Horizontal Alignment:</label>
        <select
          .value=${column.horizontal_alignment || 'center'}
          @change=${(e: Event) =>
            this._updateColumn({
              horizontal_alignment: (e.target as HTMLSelectElement).value as any,
            })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="stretch">Stretch</option>
        </select>
      </div>
    `;
  }

  private _renderColumnLogicTab(column: CardColumn): TemplateResult {
    const conditions = column.display_conditions || [];
    const displayMode = column.display_mode || 'always';
    const templateMode = column.template_mode || false;

    return html`
      <div class="logic-tab-content">
        <!-- Conditions Section (only shown when template mode is disabled) -->
        ${!templateMode
          ? html`
              <div class="logic-section">
                <div class="section-header">
                  <h3>Display this Column</h3>
                </div>

                <div class="display-mode-selector">
                  <select
                    .value=${displayMode}
                    @change=${(e: Event) => {
                      const value = (e.target as HTMLSelectElement).value as
                        | 'always'
                        | 'every'
                        | 'any';
                      this._updateColumn({ display_mode: value });
                    }}
                    class="display-mode-dropdown"
                  >
                    <option value="always">Always</option>
                    <option value="every">If EVERY condition below is met</option>
                    <option value="any">If ANY condition below is met</option>
                  </select>
                </div>
              </div>

              <!-- Conditions Section -->
              ${displayMode !== 'always'
                ? html`
                    <div class="conditions-section">
                      <div class="conditions-header">
                        <h4>Conditions</h4>
                        <button
                          type="button"
                          class="add-condition-btn"
                          @click=${() => this._addColumnCondition(column)}
                        >
                          <ha-icon icon="mdi:plus"></ha-icon>
                          Add Condition
                        </button>
                      </div>

                      <div class="conditions-list">
                        ${conditions.map((condition, index) =>
                          this._renderColumnCondition(column, condition, index)
                        )}
                      </div>

                      ${conditions.length === 0
                        ? html`
                            <div class="no-conditions">
                              <p>No conditions added yet. Click "Add Condition" to get started.</p>
                            </div>
                          `
                        : ''}
                    </div>
                  `
                : ''}
            `
          : html`
              <div class="template-mode-notice">
                <p>
                  <em>Advanced Template Mode is enabled. Basic conditions above are ignored.</em>
                </p>
              </div>
            `}

        <!-- Advanced Template Mode Section -->
        <div class="template-section">
          <div class="switch-container">
            <span class="switch-label">Advanced Template Mode</span>
            <label class="switch">
              <input
                type="checkbox"
                .checked=${templateMode}
                @change=${(e: Event) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  this._updateColumn({
                    template_mode: checked,
                    // Reset display_mode to 'always' when enabling template mode
                    display_mode: checked ? 'always' : displayMode,
                  });
                }}
              />
              <span class="slider"></span>
            </label>
          </div>
          <div class="template-description">
            Use Jinja2 templates for advanced conditional logic. When enabled, the conditions above
            are ignored.
          </div>

          ${templateMode
            ? html`
                <div class="template-content">
                  <textarea
                    .value=${column.template || ''}
                    @input=${(e: Event) =>
                      this._updateColumn({ template: (e.target as HTMLTextAreaElement).value })}
                    placeholder="{% if states('binary_sensor.example') == 'on' %}true{% else %}false{% endif %}"
                    class="template-editor"
                    rows="6"
                  ></textarea>
                  <div class="template-help">
                    <p><strong>Template should return a boolean value:</strong></p>
                    <ul>
                      <li>
                        <code>true</code>, <code>on</code>, <code>yes</code>, <code>1</code> → Show
                        column
                      </li>
                      <li>
                        <code>false</code>, <code>off</code>, <code>no</code>, <code>0</code> → Hide
                        column
                      </li>
                    </ul>
                  </div>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _renderColumnDesignTab(column: CardColumn): TemplateResult {
    // Extract current design properties from column
    const designProperties: DesignProperties = {
      ...column.design,
      // Map legacy properties to design properties if they exist
      background_color: column.design?.background_color || column.background_color,
      padding_top: column.design?.padding_top || column.padding?.toString(),
      padding_bottom: column.design?.padding_bottom || column.padding?.toString(),
      padding_left: column.design?.padding_left || column.padding?.toString(),
      padding_right: column.design?.padding_right || column.padding?.toString(),
      border_radius: column.design?.border_radius || column.border_radius?.toString(),
      border_color: column.design?.border_color || column.border_color,
      border_width: column.design?.border_width || column.border_width?.toString(),
      margin_top: column.design?.margin_top || column.margin?.toString(),
      margin_bottom: column.design?.margin_bottom || column.margin?.toString(),
      margin_left: column.design?.margin_left || column.margin?.toString(),
      margin_right: column.design?.margin_right || column.margin?.toString(),
      // Ensure animation properties are included
      animation_type: column.design?.animation_type,
      animation_entity: column.design?.animation_entity,
      animation_trigger_type: column.design?.animation_trigger_type,
      animation_attribute: column.design?.animation_attribute,
      animation_state: column.design?.animation_state,
      animation_duration: column.design?.animation_duration,
      intro_animation: column.design?.intro_animation,
      outro_animation: column.design?.outro_animation,
      animation_delay: column.design?.animation_delay,
      animation_timing: column.design?.animation_timing,
    };

    console.log(`🔄 LayoutTab: Rendering column design tab with properties:`, designProperties);

    return html`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${designProperties}
        @design-changed=${(e: CustomEvent) => {
          console.log(`🔄 LayoutTab: Received design-changed event for COLUMN:`, e.detail);
          console.log(`🔄 LayoutTab: Current column design before update:`, column.design);
          const updates = e.detail;
          // Update the column with design properties
          const updatedDesign = { ...column.design, ...updates };
          console.log(`🔄 LayoutTab: Updated column design:`, updatedDesign);
          this._updateColumn({ design: updatedDesign });
        }}
      ></ultra-global-design-tab>
    `;
  }

  private _renderGeneralTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    // Render Module Name field first for all modules
    const moduleNameField = html`
      <div class="settings-section">
        <label>Module Name:</label>
        <input
          type="text"
          .value=${(module as any).module_name || ''}
          @input=${(e: Event) =>
            this._updateModule({ module_name: (e.target as HTMLInputElement).value } as any)}
          placeholder="Give this module a custom name to make it easier to identify in the editor."
          class="module-name-input"
        />
        <div class="field-help">
          Give this module a custom name to make it easier to identify in the editor.
        </div>
      </div>
    `;

    if (moduleHandler) {
      const moduleContent = moduleHandler.renderGeneralTab(
        module,
        this.hass,
        this.config,
        updates => this._updateModule(updates)
      );

      // For image modules, just render normally - the Image Name field will be removed later
      if (module.type === 'image') {
        return html` ${moduleNameField} ${moduleContent} `;
      }

      // Combine Module Name field with existing module content for other modules
      return html` ${moduleNameField} ${moduleContent} `;
    }

    // Fallback for unknown module types
    return html`
      ${moduleNameField}
      <div class="settings-section">
        <div class="error-message">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <span>No settings available for module type: ${module.type}</span>
        </div>
      </div>
    `;
  }

  private _renderActionsTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (moduleHandler && typeof (moduleHandler as any).renderActionsTab === 'function') {
      return (moduleHandler as any).renderActionsTab(module, this.hass, this.config, updates =>
        this._updateModule(updates)
      );
    }

    // Fallback for modules without actions tab
    return html`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have action settings</span>
        </div>
      </div>
    `;
  }

  private _renderOtherTab(module: CardModule): TemplateResult {
    const registry = getModuleRegistry();
    const moduleHandler = registry.getModule(module.type);

    if (moduleHandler && typeof (moduleHandler as any).renderOtherTab === 'function') {
      return (moduleHandler as any).renderOtherTab(module, this.hass, this.config, updates =>
        this._updateModule(updates)
      );
    }

    // Fallback for modules without other tab
    return html`
      <div class="settings-section">
        <div class="info-message">
          <ha-icon icon="mdi:information"></ha-icon>
          <span>This module does not have other settings</span>
        </div>
      </div>
    `;
  }

  // Add condition to module
  private _addCondition(module: CardModule): void {
    const newCondition: DisplayCondition = {
      id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'entity_state',
      entity: '',
      operator: '=',
      value: '',
      enabled: true,
    };

    const updatedConditions = [...(module.display_conditions || []), newCondition];
    this._updateModule({ display_conditions: updatedConditions });
  }

  // Add condition to row
  private _addRowCondition(row: CardRow): void {
    const newCondition: DisplayCondition = {
      id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'entity_state',
      entity: '',
      operator: '=',
      value: '',
      enabled: true,
    };

    const updatedConditions = [...(row.display_conditions || []), newCondition];
    this._updateRow({ display_conditions: updatedConditions });
  }

  // Add condition to column
  private _addColumnCondition(column: CardColumn): void {
    const newCondition: DisplayCondition = {
      id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'entity_state',
      entity: '',
      operator: '=',
      value: '',
      enabled: true,
    };

    const updatedConditions = [...(column.display_conditions || []), newCondition];
    this._updateColumn({ display_conditions: updatedConditions });
  }

  // Remove condition from module
  private _removeCondition(module: CardModule, conditionIndex: number): void {
    const conditions = module.display_conditions || [];
    const updatedConditions = conditions.filter((_, index) => index !== conditionIndex);
    this._updateModule({ display_conditions: updatedConditions });
  }

  // Update specific condition
  private _updateCondition(
    module: CardModule,
    conditionIndex: number,
    updates: Partial<DisplayCondition>
  ): void {
    const conditions = module.display_conditions || [];
    const updatedConditions = conditions.map((condition, index) =>
      index === conditionIndex ? { ...condition, ...updates } : condition
    );
    this._updateModule({ display_conditions: updatedConditions });
  }

  // Duplicate condition
  private _duplicateCondition(module: CardModule, conditionIndex: number): void {
    const conditions = module.display_conditions || [];
    const conditionToDuplicate = conditions[conditionIndex];
    if (conditionToDuplicate) {
      const duplicatedCondition = {
        ...conditionToDuplicate,
        id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      const updatedConditions = [
        ...conditions.slice(0, conditionIndex + 1),
        duplicatedCondition,
        ...conditions.slice(conditionIndex + 1),
      ];
      this._updateModule({ display_conditions: updatedConditions });
    }
  }

  // Render row condition (reuses module condition logic)
  private _renderRowCondition(
    row: CardRow,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return this._renderConditionGeneric(
      condition,
      index,
      updates => {
        const conditions = row.display_conditions || [];
        const updatedConditions = conditions.map((c, i) =>
          i === index ? { ...c, ...updates } : c
        );
        this._updateRow({ display_conditions: updatedConditions });
      },
      () => {
        const conditions = row.display_conditions || [];
        const updatedConditions = conditions.filter((_, i) => i !== index);
        this._updateRow({ display_conditions: updatedConditions });
      }
    );
  }

  // Render column condition (reuses module condition logic)
  private _renderColumnCondition(
    column: CardColumn,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return this._renderConditionGeneric(
      condition,
      index,
      updates => {
        const conditions = column.display_conditions || [];
        const updatedConditions = conditions.map((c, i) =>
          i === index ? { ...c, ...updates } : c
        );
        this._updateColumn({ display_conditions: updatedConditions });
      },
      () => {
        const conditions = column.display_conditions || [];
        const updatedConditions = conditions.filter((_, i) => i !== index);
        this._updateColumn({ display_conditions: updatedConditions });
      }
    );
  }

  // Generic condition renderer that can be reused
  private _renderConditionGeneric(
    condition: DisplayCondition,
    index: number,
    onUpdate: (updates: Partial<DisplayCondition>) => void,
    onDelete: () => void
  ): TemplateResult {
    const isExpanded = true; // Always expanded for now

    return html`
      <div class="condition-item ${condition.enabled ? 'enabled' : 'disabled'}">
        <div class="condition-header">
          <div class="condition-header-left">
            <button type="button" class="condition-toggle ${isExpanded ? 'expanded' : ''}">
              <ha-icon icon="mdi:chevron-${isExpanded ? 'down' : 'right'}"></ha-icon>
            </button>
            <span class="condition-label">
              ${condition.type === 'entity_state'
                ? condition.entity || 'Select Entity State'
                : condition.type === 'entity_attribute'
                  ? condition.entity || 'Select Entity Attribute'
                  : condition.type === 'time'
                    ? 'Time Condition'
                    : 'Template Condition'}
            </span>
          </div>

          <div class="condition-actions">
            <button
              type="button"
              class="condition-action-btn delete"
              @click=${onDelete}
              title="Delete"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
          </div>
        </div>

        ${isExpanded
          ? html`
              <div class="condition-content">
                <!-- Condition Type Selector -->
                <div class="condition-field">
                  <label>Condition Type:</label>
                  <select
                    .value=${condition.type}
                    @change=${(e: Event) => {
                      const type = (e.target as HTMLSelectElement).value as
                        | 'entity_state'
                        | 'entity_attribute'
                        | 'template'
                        | 'time';
                      onUpdate({
                        type,
                        entity: '',
                        operator: '=',
                        value: '',
                      });
                    }}
                  >
                    <option value="entity_state">Entity State</option>
                    <option value="entity_attribute">Entity Attribute</option>
                    <option value="time">Date/Time</option>
                    <option value="template">Template</option>
                  </select>
                </div>

                ${condition.type === 'entity_state'
                  ? this._renderEntityConditionGeneric(condition, onUpdate)
                  : ''}
                ${condition.type === 'entity_attribute'
                  ? this._renderEntityAttributeConditionGeneric(condition, onUpdate)
                  : ''}

                <!-- Enable/Disable Toggle -->
                <div class="condition-field">
                  <label class="condition-enable-toggle">
                    <input
                      type="checkbox"
                      .checked=${condition.enabled !== false}
                      @change=${(e: Event) =>
                        onUpdate({
                          enabled: (e.target as HTMLInputElement).checked,
                        })}
                    />
                    Enable this condition
                  </label>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Generic entity condition renderer
  private _renderEntityConditionGeneric(
    condition: DisplayCondition,
    onUpdate: (updates: Partial<DisplayCondition>) => void
  ): TemplateResult {
    return html`
      <div class="entity-condition-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{ entity: condition.entity || '' }}
            .schema=${[
              {
                name: 'entity',
                selector: { entity: {} },
              },
            ]}
            @value-changed=${(e: CustomEvent) => onUpdate({ entity: e.detail.value.entity })}
          ></ha-form>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${condition.operator || '='}
            @change=${(e: Event) =>
              onUpdate({
                operator: (e.target as HTMLSelectElement).value as any,
              })}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${condition.operator !== 'has_value' && condition.operator !== 'no_value'
          ? html`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${condition.value || ''}
                  @input=${(e: Event) =>
                    onUpdate({
                      value: (e.target as HTMLInputElement).value,
                    })}
                  placeholder="Enter value to compare"
                />
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Render entity attribute condition renderer
  private _renderEntityAttributeConditionGeneric(
    condition: DisplayCondition,
    onUpdate: (updates: Partial<DisplayCondition>) => void
  ): TemplateResult {
    return html`
      <div class="entity-attribute-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{ entity: condition.entity || '' }}
            .schema=${[
              {
                name: 'entity',
                selector: { entity: {} },
              },
            ]}
            @value-changed=${(e: CustomEvent) => onUpdate({ entity: e.detail.value.entity })}
          ></ha-form>
        </div>

        <!-- Attribute Selector -->
        <div class="condition-field">
          <label>Attribute Name:</label>
          <input
            type="text"
            .value=${condition.attribute || ''}
            @input=${(e: Event) => onUpdate({ attribute: (e.target as HTMLInputElement).value })}
            placeholder="Enter attribute name (e.g., battery_level, friendly_name)"
          />
          <div class="field-help">
            Enter the exact attribute name from the entity. Common examples: battery_level,
            friendly_name, unit_of_measurement
          </div>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${condition.operator || '='}
            @change=${(e: Event) =>
              onUpdate({
                operator: (e.target as HTMLSelectElement).value as any,
              })}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${condition.operator !== 'has_value' && condition.operator !== 'no_value'
          ? html`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${condition.value || ''}
                  @input=${(e: Event) =>
                    onUpdate({
                      value: (e.target as HTMLInputElement).value,
                    })}
                  placeholder="Enter value to compare"
                />
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Render individual condition
  private _renderCondition(
    module: CardModule,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    const isExpanded = true; // Always expanded for now, can add state management later

    return html`
      <div class="condition-item ${condition.enabled ? 'enabled' : 'disabled'}">
        <div class="condition-header">
          <div class="condition-header-left">
            <button
              type="button"
              class="condition-toggle ${isExpanded ? 'expanded' : ''}"
              @click=${() => {
                // Toggle expansion - implement state management if needed
              }}
            >
              <ha-icon icon="mdi:chevron-${isExpanded ? 'down' : 'right'}"></ha-icon>
            </button>
            <span class="condition-label">
              ${condition.type === 'entity_state'
                ? condition.entity || 'Select Entity State'
                : condition.type === 'entity_attribute'
                  ? condition.entity || 'Select Entity Attribute'
                  : condition.type === 'time'
                    ? 'Time Condition'
                    : 'Template Condition'}
            </span>
          </div>

          <div class="condition-actions">
            <button
              type="button"
              class="condition-action-btn"
              @click=${() => this._duplicateCondition(module, index)}
              title="Duplicate"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </button>
            <button
              type="button"
              class="condition-action-btn delete"
              @click=${() => this._removeCondition(module, index)}
              title="Delete"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
            <button type="button" class="condition-drag-handle" title="Drag to reorder">
              <ha-icon icon="mdi:drag"></ha-icon>
            </button>
          </div>
        </div>

        ${isExpanded
          ? html`
              <div class="condition-content">
                <!-- Condition Type Selector -->
                <div class="condition-field">
                  <label>Condition Type:</label>
                  <select
                    .value=${condition.type}
                    @change=${(e: Event) => {
                      const type = (e.target as HTMLSelectElement).value as
                        | 'entity_state'
                        | 'entity_attribute'
                        | 'template'
                        | 'time';
                      this._updateCondition(module, index, {
                        type,
                        entity: '',
                        operator: '=',
                        value: '',
                      });
                    }}
                  >
                    <option value="entity_state">Entity State</option>
                    <option value="entity_attribute">Entity Attribute</option>
                    <option value="time">Date/Time</option>
                    <option value="template">Template</option>
                  </select>
                </div>

                ${condition.type === 'entity_state'
                  ? this._renderEntityCondition(module, condition, index)
                  : ''}
                ${condition.type === 'entity_attribute'
                  ? this._renderEntityAttributeCondition(module, condition, index)
                  : ''}
                ${condition.type === 'time'
                  ? this._renderTimeCondition(module, condition, index)
                  : ''}
                ${condition.type === 'template'
                  ? this._renderTemplateCondition(module, condition, index)
                  : ''}

                <!-- Enable/Disable Toggle -->
                <div class="condition-field">
                  <label class="condition-enable-toggle">
                    <input
                      type="checkbox"
                      .checked=${condition.enabled !== false}
                      @change=${(e: Event) =>
                        this._updateCondition(module, index, {
                          enabled: (e.target as HTMLInputElement).checked,
                        })}
                    />
                    Enable this condition
                  </label>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Render entity condition fields
  private _renderEntityCondition(
    module: CardModule,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return html`
      <div class="entity-condition-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{ entity: condition.entity || '' }}
            .schema=${[
              {
                name: 'entity',
                selector: { entity: {} },
              },
            ]}
            @value-changed=${(e: CustomEvent) =>
              this._updateCondition(module, index, { entity: e.detail.value.entity })}
          ></ha-form>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${condition.operator || '='}
            @change=${(e: Event) =>
              this._updateCondition(module, index, {
                operator: (e.target as HTMLSelectElement).value as any,
              })}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${condition.operator !== 'has_value' && condition.operator !== 'no_value'
          ? html`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${condition.value || ''}
                  @input=${(e: Event) =>
                    this._updateCondition(module, index, {
                      value: (e.target as HTMLInputElement).value,
                    })}
                  placeholder="Enter value to compare"
                />
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Render entity attribute condition fields
  private _renderEntityAttributeCondition(
    module: CardModule,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return html`
      <div class="entity-attribute-fields">
        <!-- Entity Picker -->
        <div class="condition-field">
          <label>Entity:</label>
          <ha-form
            .hass=${this.hass}
            .data=${{ entity: condition.entity || '' }}
            .schema=${[
              {
                name: 'entity',
                selector: { entity: {} },
              },
            ]}
            @value-changed=${(e: CustomEvent) =>
              this._updateCondition(module, index, { entity: e.detail.value.entity })}
          ></ha-form>
        </div>

        <!-- Attribute Selector -->
        <div class="condition-field">
          <label>Attribute Name:</label>
          <input
            type="text"
            .value=${condition.attribute || ''}
            @input=${(e: Event) =>
              this._updateCondition(module, index, {
                attribute: (e.target as HTMLInputElement).value,
              })}
            placeholder="Enter attribute name (e.g., battery_level, friendly_name)"
          />
          <div class="field-help">
            Enter the exact attribute name from the entity. Common examples: battery_level,
            friendly_name, unit_of_measurement
          </div>
        </div>

        <!-- Operator -->
        <div class="condition-field">
          <label>Operator:</label>
          <select
            .value=${condition.operator || '='}
            @change=${(e: Event) =>
              this._updateCondition(module, index, {
                operator: (e.target as HTMLSelectElement).value as any,
              })}
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="has_value">Has a value</option>
            <option value="no_value">Doesn't have a value</option>
          </select>
        </div>

        <!-- Value (if not has_value/no_value) -->
        ${condition.operator !== 'has_value' && condition.operator !== 'no_value'
          ? html`
              <div class="condition-field">
                <label>Value:</label>
                <input
                  type="text"
                  .value=${condition.value || ''}
                  @input=${(e: Event) =>
                    this._updateCondition(module, index, {
                      value: (e.target as HTMLInputElement).value,
                    })}
                  placeholder="Enter value to compare"
                />
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Render time condition fields
  private _renderTimeCondition(
    module: CardModule,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return html`
      <div class="time-condition-fields">
        <p class="condition-info">Local time is ${new Date().toLocaleString()}</p>

        <div class="time-inputs">
          <div class="condition-field">
            <label>From Time:</label>
            <input
              type="time"
              .value=${condition.time_from || ''}
              @input=${(e: Event) =>
                this._updateCondition(module, index, {
                  time_from: (e.target as HTMLInputElement).value,
                })}
            />
          </div>

          <div class="condition-field">
            <label>To Time:</label>
            <input
              type="time"
              .value=${condition.time_to || ''}
              @input=${(e: Event) =>
                this._updateCondition(module, index, {
                  time_to: (e.target as HTMLInputElement).value,
                })}
            />
          </div>
        </div>
      </div>
    `;
  }

  // Render template condition
  private _renderTemplateCondition(
    module: CardModule,
    condition: DisplayCondition,
    index: number
  ): TemplateResult {
    return html`
      <div class="template-condition">
        <div class="condition-field">
          <label>Template:</label>
          <textarea
            .value=${condition.template || ''}
            @input=${(e: Event) =>
              this._updateCondition(module, index, {
                template: (e.target as HTMLTextAreaElement).value,
              })}
            placeholder="{% if states('sensor.example') == 'on' %}true{% else %}false{% endif %}"
            rows="3"
          ></textarea>
        </div>
        <div class="template-help">Template should return 'true' or 'false'</div>
      </div>
    `;
  }

  private _renderLogicTab(module: CardModule): TemplateResult {
    const conditions = module.display_conditions || [];
    const displayMode = module.display_mode || 'always';
    const templateMode = (module as any).template_mode || false;

    return html`
      <div class="logic-tab-content">
        <!-- Basic Conditions Section -->
        <div
          class="logic-section"
          style="opacity: ${templateMode ? '0.5' : '1'}; pointer-events: ${templateMode
            ? 'none'
            : 'auto'}"
        >
          <div class="section-header">
            <h3>Display this Element</h3>
            ${templateMode
              ? html`<span class="disabled-note">Disabled - Using Advanced Template Mode</span>`
              : ''}
          </div>

          <div class="display-mode-selector">
            <select
              .value=${displayMode}
              @change=${(e: Event) => {
                const value = (e.target as HTMLSelectElement).value as 'always' | 'every' | 'any';
                this._updateModule({ display_mode: value });
              }}
              class="display-mode-dropdown"
              .disabled=${templateMode}
            >
              <option value="always">Always</option>
              <option value="every">If EVERY condition below is met</option>
              <option value="any">If ANY condition below is met</option>
            </select>
          </div>
        </div>

        <!-- Conditions Section -->
        ${displayMode !== 'always'
          ? html`
              <div
                class="conditions-section"
                style="opacity: ${templateMode ? '0.5' : '1'}; pointer-events: ${templateMode
                  ? 'none'
                  : 'auto'}"
              >
                <div class="conditions-header">
                  <h4>Conditions</h4>
                  ${templateMode
                    ? html`<span class="disabled-note"
                        >Disabled - Using Advanced Template Mode</span
                      >`
                    : ''}
                  <button
                    type="button"
                    class="add-condition-btn"
                    @click=${() => this._addCondition(module)}
                    .disabled=${templateMode}
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                    Add Condition
                  </button>
                </div>

                <div class="conditions-list">
                  ${conditions.map((condition, index) =>
                    this._renderCondition(module, condition, index)
                  )}
                </div>

                ${conditions.length === 0
                  ? html`
                      <div class="no-conditions">
                        <p>No conditions added yet. Click "Add Condition" to get started.</p>
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}

        <!-- Advanced Template Mode Section -->
        <div class="template-section">
          <div class="template-header">
            <div class="switch-container">
              <label class="switch-label">Advanced Template Mode</label>
              <label class="switch">
                <input
                  type="checkbox"
                  .checked=${templateMode}
                  @change=${(e: Event) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    this._updateModule({
                      template_mode: checked,
                      // Reset display_mode to 'always' when enabling template mode
                      display_mode: checked ? 'always' : displayMode,
                    });
                  }}
                />
                <span class="slider round"></span>
              </label>
            </div>
            <div class="template-description">
              Use Jinja2 templates for advanced conditional logic. When enabled, the conditions
              above are ignored.
            </div>
          </div>

          ${templateMode
            ? html`
                <div class="template-content">
                  <textarea
                    .value=${(module as any).template || ''}
                    @input=${(e: Event) =>
                      this._updateModule({
                        template: (e.target as HTMLTextAreaElement).value,
                      })}
                    placeholder="{% if states('binary_sensor.example') == 'on' %}true{% else %}false{% endif %}"
                    class="template-editor"
                    rows="6"
                  ></textarea>
                  <div class="template-help">
                    <p><strong>Template should return a boolean value:</strong></p>
                    <ul>
                      <li>
                        <code>true</code>, <code>on</code>, <code>yes</code>, <code>1</code> → Show
                        element
                      </li>
                      <li>
                        <code>false</code>, <code>off</code>, <code>no</code>, <code>0</code> → Hide
                        element
                      </li>
                    </ul>
                    <p><strong>Examples:</strong></p>
                    <ul>
                      <li><code>{{ states('sensor.temperature') | float > 20 }}</code></li>
                      <li>
                        <code>{% if is_state('binary_sensor.motion', 'on') %}true{% endif %}</code>
                      </li>
                      <li><code>{{ state_attr('sensor.weather', 'humidity') > 50 }}</code></li>
                    </ul>
                  </div>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _renderDesignTab(module: CardModule): TemplateResult {
    // Extract current design properties from module
    const designProperties: DesignProperties = {
      color: (module as any).color,
      text_align: (module as any).text_align || (module as any).alignment,
      font_size: (module as any).font_size?.toString(),
      line_height: (module as any).line_height?.toString(),
      letter_spacing: (module as any).letter_spacing,
      font_family: (module as any).font_family,
      font_weight: (module as any).font_weight,
      text_transform: (module as any).text_transform,
      font_style: (module as any).font_style,
      background_color: (module as any).background_color,
      background_image: (module as any).background_image,
      background_image_type: (module as any).background_image_type,
      background_image_entity: (module as any).background_image_entity,
      backdrop_filter: (module as any).backdrop_filter,
      width: (module as any).width,
      height: (module as any).height,
      max_width: (module as any).max_width,
      max_height: (module as any).max_height,
      min_width: (module as any).min_width,
      min_height: (module as any).min_height,
      margin_top: (module as any).margin?.top?.toString() || (module as any).margin_top,
      margin_bottom: (module as any).margin?.bottom?.toString() || (module as any).margin_bottom,
      margin_left: (module as any).margin?.left?.toString() || (module as any).margin_left,
      margin_right: (module as any).margin?.right?.toString() || (module as any).margin_right,
      padding_top: (module as any).padding?.top?.toString() || (module as any).padding_top,
      padding_bottom: (module as any).padding?.bottom?.toString() || (module as any).padding_bottom,
      padding_left: (module as any).padding?.left?.toString() || (module as any).padding_left,
      padding_right: (module as any).padding?.right?.toString() || (module as any).padding_right,
      border_radius:
        (module as any).border?.radius?.toString() || (module as any).border_radius?.toString(),
      border_style: (module as any).border?.style || (module as any).border_style,
      border_width: (module as any).border?.width?.toString() || (module as any).border_width,
      border_color: (module as any).border?.color || (module as any).border_color,
      // Position properties
      position: (module as any).position,
      top: (module as any).top,
      bottom: (module as any).bottom,
      left: (module as any).left,
      right: (module as any).right,
      z_index: (module as any).z_index,
      // Text shadow properties
      text_shadow_h: (module as any).text_shadow_h,
      text_shadow_v: (module as any).text_shadow_v,
      text_shadow_blur: (module as any).text_shadow_blur,
      text_shadow_color: (module as any).text_shadow_color,
      // Box shadow properties
      box_shadow_h: (module as any).box_shadow_h,
      box_shadow_v: (module as any).box_shadow_v,
      box_shadow_blur: (module as any).box_shadow_blur,
      box_shadow_spread: (module as any).box_shadow_spread,
      box_shadow_color: (module as any).box_shadow_color,
      // Other properties
      overflow: (module as any).overflow,
      clip_path: (module as any).clip_path,
      // Animation properties
      animation_type: (module as any).animation_type,
      animation_entity: (module as any).animation_entity,
      animation_trigger_type: (module as any).animation_trigger_type,
      animation_attribute: (module as any).animation_attribute,
      animation_state: (module as any).animation_state,
      intro_animation: (module as any).intro_animation,
      outro_animation: (module as any).outro_animation,
      animation_duration: (module as any).animation_duration,
      animation_delay: (module as any).animation_delay,
      animation_timing: (module as any).animation_timing,
    };

    console.log(`🔄 LayoutTab: Rendering module design tab with properties:`, designProperties);

    return html`
      <ultra-global-design-tab
        .hass=${this.hass}
        .designProperties=${designProperties}
        .onUpdate=${(updates: Partial<DesignProperties>) => {
          console.log(`🔄 LayoutTab: Received onUpdate callback for MODULE:`, updates);
          console.log(`🔄 LayoutTab: Current selected module:`, this._selectedModule);
          this._updateModuleDesign(updates);
        }}
      ></ultra-global-design-tab>
    `;
  }

  private _renderTextDesignTab(module: CardModule): TemplateResult {
    // Only show text design options for text modules
    if (module.type === 'text') {
      const textModule = module as TextModule;
      return html`
        <!-- Text Color Section -->
        <div class="settings-section">
          <ultra-color-picker
            .label=${'Text Color'}
            .value=${textModule.color || ''}
            .defaultValue=${'var(--primary-text-color)'}
            .hass=${this.hass}
            @value-changed=${(e: CustomEvent) => {
              const value = e.detail.value;
              this._updateModule({ color: value });
              // Load Google Font if needed
              this._loadGoogleFont(textModule.font_family);
            }}
          ></ultra-color-picker>
        </div>

        <!-- Font Family Dropdown -->
        <div class="settings-section">
          <label>Font:</label>
          <select
            .value=${textModule.font_family || 'default'}
            @change=${(e: Event) => {
              const fontFamily = (e.target as HTMLSelectElement).value;
              this._updateModule({ font_family: fontFamily });
              this._loadGoogleFont(fontFamily);
            }}
            class="font-dropdown"
          >
            ${DEFAULT_FONTS.map(
              font => html`
                <option value="${font.value}" ?selected=${textModule.font_family === font.value}>
                  ${font.label}
                </option>
              `
            )}
            <optgroup label="Fonts from Typography settings">
              ${TYPOGRAPHY_FONTS.map(
                font => html`
                  <option value="${font.value}" ?selected=${textModule.font_family === font.value}>
                    ${font.label}
                  </option>
                `
              )}
            </optgroup>
            <optgroup label="Web safe font combinations (do not need to be loaded)">
              ${WEB_SAFE_FONTS.map(
                font => html`
                  <option value="${font.value}" ?selected=${textModule.font_family === font.value}>
                    ${font.label}
                  </option>
                `
              )}
            </optgroup>
          </select>
        </div>

        <!-- Font Size -->
        <div class="settings-section">
          <label>Font Size (px):</label>
          <input
            type="number"
            min="8"
            max="72"
            .value=${textModule.font_size || 16}
            @input=${(e: Event) =>
              this._updateModule({ font_size: Number((e.target as HTMLInputElement).value) })}
            class="font-size-input"
          />
        </div>

        <!-- Text Alignment -->
        <div class="settings-section">
          <label>Text Alignment:</label>
          <div class="alignment-buttons">
            ${['left', 'center', 'right'].map(
              align => html`
                <button
                  class="alignment-btn ${textModule.alignment === align ? 'active' : ''}"
                  @click=${() => this._updateModule({ alignment: align as any })}
                >
                  <ha-icon icon="mdi:format-align-${align}"></ha-icon>
                </button>
              `
            )}
          </div>
        </div>

        <!-- Text Formatting -->
        <div class="settings-section">
          <label>Text Formatting:</label>
          <div class="format-buttons">
            <button
              class="format-btn ${textModule.bold ? 'active' : ''}"
              @click=${() => this._updateModule({ bold: !textModule.bold })}
            >
              <ha-icon icon="mdi:format-bold"></ha-icon>
            </button>
            <button
              class="format-btn ${textModule.italic ? 'active' : ''}"
              @click=${() => this._updateModule({ italic: !textModule.italic })}
            >
              <ha-icon icon="mdi:format-italic"></ha-icon>
            </button>
            <button
              class="format-btn ${textModule.uppercase ? 'active' : ''}"
              @click=${() => this._updateModule({ uppercase: !textModule.uppercase })}
            >
              <ha-icon icon="mdi:format-letter-case-upper"></ha-icon>
            </button>
            <button
              class="format-btn ${textModule.strikethrough ? 'active' : ''}"
              @click=${() => this._updateModule({ strikethrough: !textModule.strikethrough })}
            >
              <ha-icon icon="mdi:format-strikethrough"></ha-icon>
            </button>
          </div>
        </div>
      `;
    }

    // For separator modules, show color picker
    if (module.type === 'separator') {
      const separatorModule = module as SeparatorModule;
      return html`
        <div class="settings-section">
          <ultra-color-picker
            .label=${'Separator Color'}
            .value=${separatorModule.color || ''}
            .defaultValue=${'var(--divider-color)'}
            .hass=${this.hass}
            @value-changed=${(e: CustomEvent) => {
              const value = e.detail.value;
              this._updateModule({ color: value });
            }}
          ></ultra-color-picker>
        </div>
      `;
    }

    // For bar modules, show bar-specific color options
    if (module.type === 'bar') {
      const barModule = module as BarModule;
      return html`
        <!-- Bar Colors -->
        <div class="settings-section">
          <ultra-color-picker
            .label=${'Bar Color'}
            .value=${barModule.bar_color || ''}
            .defaultValue=${'var(--primary-color)'}
            .hass=${this.hass}
            @value-changed=${(e: CustomEvent) => {
              const value = e.detail.value;
              this._updateModule({ bar_color: value });
            }}
          ></ultra-color-picker>
        </div>

        <div class="settings-section">
          <ultra-color-picker
            .label=${'Background Color'}
            .value=${barModule.background_color || ''}
            .defaultValue=${'var(--secondary-background-color)'}
            .hass=${this.hass}
            @value-changed=${(e: CustomEvent) => {
              const value = e.detail.value;
              this._updateModule({ background_color: value });
            }}
          ></ultra-color-picker>
        </div>

        <!-- Bar Dimensions -->
        <div class="settings-section">
          <label>Bar Height (px):</label>
          <input
            type="number"
            min="10"
            max="100"
            step="5"
            .value=${barModule.height || 20}
            @input=${(e: Event) =>
              this._updateModule({ height: Number((e.target as HTMLInputElement).value) })}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Border Radius (px):</label>
          <input
            type="number"
            min="0"
            max="50"
            .value=${barModule.border_radius || 10}
            @input=${(e: Event) =>
              this._updateModule({ border_radius: Number((e.target as HTMLInputElement).value) })}
            class="number-input"
          />
        </div>

        <!-- Value Display Options -->
        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${barModule.show_value !== false}
              @change=${(e: Event) =>
                this._updateModule({ show_value: (e.target as HTMLInputElement).checked })}
            />
            Show Value
          </label>
        </div>

        ${barModule.show_value
          ? html`
              <div class="settings-section">
                <label>Value Position:</label>
                <div class="value-position-buttons">
                  ${['inside', 'outside', 'none'].map(
                    position => html`
                      <button
                        class="position-btn ${barModule.value_position === position
                          ? 'active'
                          : ''}"
                        @click=${() => this._updateModule({ value_position: position as any })}
                      >
                        ${position.charAt(0).toUpperCase() + position.slice(1)}
                      </button>
                    `
                  )}
                </div>
              </div>
            `
          : ''}

        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${barModule.show_percentage !== false}
              @change=${(e: Event) =>
                this._updateModule({ show_percentage: (e.target as HTMLInputElement).checked })}
            />
            Show as Percentage
          </label>
        </div>

        <div class="settings-section">
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              .checked=${barModule.animation !== false}
              @change=${(e: Event) =>
                this._updateModule({ animation: (e.target as HTMLInputElement).checked })}
            />
            Animation
          </label>
        </div>
      `;
    }

    // For image modules, show image-specific design options
    if (module.type === 'image') {
      const imageModule = module as ImageModule;
      return html`
        <!-- Image Alignment -->
        <div class="settings-section">
          <label>Image Alignment:</label>
          <div class="alignment-buttons">
            ${['left', 'center', 'right'].map(
              align => html`
                <button
                  class="alignment-btn ${imageModule.alignment === align ? 'active' : ''}"
                  @click=${() => this._updateModule({ alignment: align as any })}
                >
                  <ha-icon icon="mdi:format-align-${align}"></ha-icon>
                </button>
              `
            )}
          </div>
        </div>

        <!-- Image Dimensions -->
        <div class="settings-section">
          <label>Width (px):</label>
          <input
            type="number"
            min="50"
            max="500"
            step="10"
            .value=${imageModule.image_width || 100}
            @input=${(e: Event) =>
              this._updateModule({ image_width: Number((e.target as HTMLInputElement).value) })}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Height (px):</label>
          <input
            type="number"
            min="50"
            max="500"
            step="10"
            .value=${imageModule.image_height || 100}
            @input=${(e: Event) =>
              this._updateModule({ image_height: Number((e.target as HTMLInputElement).value) })}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Border Radius (px):</label>
          <input
            type="number"
            min="0"
            max="50"
            .value=${imageModule.border_radius || 8}
            @input=${(e: Event) =>
              this._updateModule({ border_radius: Number((e.target as HTMLInputElement).value) })}
            class="number-input"
          />
        </div>

        <div class="settings-section">
          <label>Image Fit:</label>
          <div class="value-position-buttons">
            ${['cover', 'contain', 'fill', 'none'].map(
              fit => html`
                <button
                  class="position-btn ${imageModule.image_fit === fit ? 'active' : ''}"
                  @click=${() => this._updateModule({ image_fit: fit as any })}
                >
                  ${fit.charAt(0).toUpperCase() + fit.slice(1)}
                </button>
              `
            )}
          </div>
        </div>
      `;
    }

    return html`<div class="settings-section">
      <p>Design options not available for ${module.type} modules.</p>
    </div>`;
  }

  private _renderBackgroundDesignTab(module: CardModule): TemplateResult {
    return html`
      <div class="settings-section">
        <ultra-color-picker
          .label=${'Background Color'}
          .value=${module.background_color || ''}
          .defaultValue=${'var(--ha-card-background, var(--card-background-color, #fff))'}
          .hass=${this.hass}
          @value-changed=${(e: CustomEvent) => {
            const value = e.detail.value;
            this._updateModule({ background_color: value });
          }}
        ></ultra-color-picker>
      </div>
    `;
  }

  private _renderSpacingDesignTab(module: CardModule): TemplateResult {
    return html`
      <div class="spacing-grid">
        <div class="spacing-section">
          <h4>Margin</h4>
          <div class="spacing-cross">
            <input
              type="number"
              placeholder="Top"
              .value=${module.margin?.top || 0}
              @input=${(e: Event) =>
                this._updateModule({
                  margin: { ...module.margin, top: Number((e.target as HTMLInputElement).value) },
                })}
            />
            <div class="spacing-row">
              <input
                type="number"
                placeholder="Left"
                .value=${module.margin?.left || 0}
                @input=${(e: Event) =>
                  this._updateModule({
                    margin: {
                      ...module.margin,
                      left: Number((e.target as HTMLInputElement).value),
                    },
                  })}
              />
              <span class="spacing-center">M</span>
              <input
                type="number"
                placeholder="Right"
                .value=${module.margin?.right || 0}
                @input=${(e: Event) =>
                  this._updateModule({
                    margin: {
                      ...module.margin,
                      right: Number((e.target as HTMLInputElement).value),
                    },
                  })}
              />
            </div>
            <input
              type="number"
              placeholder="Bottom"
              .value=${module.margin?.bottom || 0}
              @input=${(e: Event) =>
                this._updateModule({
                  margin: {
                    ...module.margin,
                    bottom: Number((e.target as HTMLInputElement).value),
                  },
                })}
            />
          </div>
        </div>

        <div class="spacing-section">
          <h4>Padding</h4>
          <div class="spacing-cross">
            <input
              type="number"
              placeholder="Top"
              .value=${module.padding?.top || 0}
              @input=${(e: Event) =>
                this._updateModule({
                  padding: { ...module.padding, top: Number((e.target as HTMLInputElement).value) },
                })}
            />
            <div class="spacing-row">
              <input
                type="number"
                placeholder="Left"
                .value=${module.padding?.left || 0}
                @input=${(e: Event) =>
                  this._updateModule({
                    padding: {
                      ...module.padding,
                      left: Number((e.target as HTMLInputElement).value),
                    },
                  })}
              />
              <span class="spacing-center">P</span>
              <input
                type="number"
                placeholder="Right"
                .value=${module.padding?.right || 0}
                @input=${(e: Event) =>
                  this._updateModule({
                    padding: {
                      ...module.padding,
                      right: Number((e.target as HTMLInputElement).value),
                    },
                  })}
              />
            </div>
            <input
              type="number"
              placeholder="Bottom"
              .value=${module.padding?.bottom || 0}
              @input=${(e: Event) =>
                this._updateModule({
                  padding: {
                    ...module.padding,
                    bottom: Number((e.target as HTMLInputElement).value),
                  },
                })}
            />
          </div>
        </div>
      </div>
    `;
  }

  protected firstUpdated(changedProperties: Map<string, any>): void {
    super.firstUpdated(changedProperties);
    // Component has finished initial render
  }

  protected updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties);
  }

  private _renderBorderDesignTab(module: CardModule): TemplateResult {
    return html`
      <div class="settings-section">
        <label>Border Radius (px):</label>
        <input
          type="number"
          min="0"
          max="50"
          .value=${module.border?.radius || 0}
          @input=${(e: Event) =>
            this._updateModule({
              border: { ...module.border, radius: Number((e.target as HTMLInputElement).value) },
            })}
        />
      </div>
    `;
  }

  protected render(): TemplateResult {
    const layout = this._ensureLayout();

    return html`
      <div class="layout-builder">
        <div class="builder-header">
          <h3>Layout Builder</h3>
          <button
            class="add-row-btn"
            @click=${(e: Event) => {
              e.stopPropagation();
              this._addRow();
            }}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Row
          </button>
        </div>

        <div class="rows-container">
          ${layout.rows.map(
            (row, rowIndex) => html`
              <div
                class="row-builder"
                draggable="true"
                @dragstart=${(e: DragEvent) => this._onDragStart(e, 'row', rowIndex)}
                @dragend=${this._onDragEnd}
                @dragover=${this._onDragOver}
                @dragenter=${(e: DragEvent) => this._onDragEnter(e, 'row', rowIndex)}
                @dragleave=${this._onDragLeave}
                @drop=${(e: DragEvent) => this._onDrop(e, 'row', rowIndex)}
                class="${this._dropTarget?.type === 'row' && this._dropTarget?.rowIndex === rowIndex
                  ? 'drop-target'
                  : ''}"
              >
                <div class="row-header">
                  <div class="row-title">
                    <div class="row-drag-handle" title="Drag to move row">
                      <ha-icon icon="mdi:drag"></ha-icon>
                    </div>
                    <span>Row ${rowIndex + 1}</span>
                    <button
                      class="column-layout-btn"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._openColumnLayoutSelector(rowIndex);
                      }}
                      @mousedown=${(e: Event) => e.stopPropagation()}
                      @dragstart=${(e: Event) => e.preventDefault()}
                      title="Change Column Layout"
                    >
                      <span class="layout-icon">${this._getCurrentLayoutDisplay(row)}</span>
                    </button>
                  </div>
                  <div class="row-actions">
                    <button
                      class="row-add-column-btn"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._addColumn(rowIndex);
                      }}
                      @mousedown=${(e: Event) => e.stopPropagation()}
                      @dragstart=${(e: Event) => e.preventDefault()}
                      title="Add Column to Row"
                    >
                      <ha-icon icon="mdi:plus"></ha-icon>
                    </button>
                    <button
                      class="row-duplicate-btn"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._duplicateRow(rowIndex);
                      }}
                      @mousedown=${(e: Event) => e.stopPropagation()}
                      @dragstart=${(e: Event) => e.preventDefault()}
                      title="Duplicate Row"
                    >
                      <ha-icon icon="mdi:content-copy"></ha-icon>
                    </button>
                    <button
                      class="row-settings-btn"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._openRowSettings(rowIndex);
                      }}
                      @mousedown=${(e: Event) => e.stopPropagation()}
                      @dragstart=${(e: Event) => e.preventDefault()}
                      title="Row Settings"
                    >
                      <ha-icon icon="mdi:cog"></ha-icon>
                    </button>
                    <button
                      class="delete-row-btn"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._deleteRow(rowIndex);
                      }}
                      @mousedown=${(e: Event) => e.stopPropagation()}
                      @dragstart=${(e: Event) => e.preventDefault()}
                      title="Delete Row"
                    >
                      <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                  </div>
                </div>
                <div class="columns-container" data-layout="${row.column_layout || '1-2-1-2'}">
                  ${row.columns && row.columns.length > 0
                    ? row.columns.map(
                        (column, columnIndex) => html`
                          <div
                            class="column-builder"
                            draggable="true"
                            @dragstart=${(e: DragEvent) =>
                              this._onDragStart(e, 'column', rowIndex, columnIndex)}
                            @dragend=${this._onDragEnd}
                            @dragover=${this._onDragOver}
                            @dragenter=${(e: DragEvent) =>
                              this._onDragEnter(e, 'column', rowIndex, columnIndex)}
                            @dragleave=${this._onDragLeave}
                            @drop=${(e: DragEvent) =>
                              this._onDrop(e, 'column', rowIndex, columnIndex)}
                            class="${this._dropTarget?.type === 'column' &&
                            this._dropTarget?.rowIndex === rowIndex &&
                            this._dropTarget?.columnIndex === columnIndex
                              ? 'drop-target'
                              : ''}"
                          >
                            <div class="column-header">
                              <div class="column-title">
                                <div class="column-drag-handle" title="Drag to move column">
                                  <ha-icon icon="mdi:drag"></ha-icon>
                                </div>
                                <span>Column ${columnIndex + 1}</span>
                              </div>
                              <div class="column-actions">
                                <button
                                  class="column-add-module-btn"
                                  @click=${(e: Event) => {
                                    e.stopPropagation();
                                    this._openModuleSelector(rowIndex, columnIndex);
                                  }}
                                  @mousedown=${(e: Event) => e.stopPropagation()}
                                  @dragstart=${(e: Event) => e.preventDefault()}
                                  title="Add Module to Column"
                                >
                                  <ha-icon icon="mdi:plus"></ha-icon>
                                </button>
                                <button
                                  class="column-duplicate-btn"
                                  @click=${(e: Event) => {
                                    e.stopPropagation();
                                    this._duplicateColumn(rowIndex, columnIndex);
                                  }}
                                  @mousedown=${(e: Event) => e.stopPropagation()}
                                  @dragstart=${(e: Event) => e.preventDefault()}
                                  title="Duplicate Column"
                                >
                                  <ha-icon icon="mdi:content-copy"></ha-icon>
                                </button>
                                <button
                                  class="column-settings-btn"
                                  @click=${(e: Event) => {
                                    e.stopPropagation();
                                    this._openColumnSettings(rowIndex, columnIndex);
                                  }}
                                  @mousedown=${(e: Event) => e.stopPropagation()}
                                  @dragstart=${(e: Event) => e.preventDefault()}
                                  title="Column Settings"
                                >
                                  <ha-icon icon="mdi:cog"></ha-icon>
                                </button>
                                <button
                                  class="column-delete-btn"
                                  @click=${(e: Event) => {
                                    e.stopPropagation();
                                    this._deleteColumn(rowIndex, columnIndex);
                                  }}
                                  @mousedown=${(e: Event) => e.stopPropagation()}
                                  @dragstart=${(e: Event) => e.preventDefault()}
                                  title="Delete Column"
                                >
                                  <ha-icon icon="mdi:delete"></ha-icon>
                                </button>
                              </div>
                            </div>
                            <div
                              class="modules-container ${this._dropTarget?.type === 'column' &&
                              this._dropTarget?.rowIndex === rowIndex &&
                              this._dropTarget?.columnIndex === columnIndex
                                ? 'drop-target'
                                : ''}"
                              @dragover=${this._onDragOver}
                              @dragenter=${(e: DragEvent) =>
                                this._onDragEnter(e, 'column', rowIndex, columnIndex)}
                              @dragleave=${this._onDragLeave}
                              @drop=${(e: DragEvent) =>
                                this._onDrop(e, 'column', rowIndex, columnIndex)}
                            >
                              ${column.modules.map(
                                (module, moduleIndex) => html`
                                  <div
                                    class="module-item"
                                    draggable="true"
                                    @dragstart=${(e: DragEvent) =>
                                      this._onDragStart(
                                        e,
                                        'module',
                                        rowIndex,
                                        columnIndex,
                                        moduleIndex
                                      )}
                                    @dragend=${this._onDragEnd}
                                    @dragover=${this._onDragOver}
                                    @dragenter=${(e: DragEvent) =>
                                      this._onDragEnter(
                                        e,
                                        'module',
                                        rowIndex,
                                        columnIndex,
                                        moduleIndex
                                      )}
                                    @dragleave=${this._onDragLeave}
                                    @drop=${(e: DragEvent) =>
                                      this._onDrop(e, 'module', rowIndex, columnIndex, moduleIndex)}
                                    class="${this._dropTarget?.type === 'module' &&
                                    this._dropTarget?.rowIndex === rowIndex &&
                                    this._dropTarget?.columnIndex === columnIndex &&
                                    this._dropTarget?.moduleIndex === moduleIndex
                                      ? 'drop-target'
                                      : ''}"
                                  >
                                    <div
                                      class="module-content"
                                      @click=${() =>
                                        this._openModuleSettings(
                                          rowIndex,
                                          columnIndex,
                                          moduleIndex
                                        )}
                                    >
                                      ${this._renderSingleModule(
                                        module,
                                        rowIndex,
                                        columnIndex,
                                        moduleIndex
                                      )}
                                    </div>
                                  </div>
                                `
                              )}
                              <button
                                class="add-module-btn"
                                @click=${(e: Event) => {
                                  e.stopPropagation();
                                  this._openModuleSelector(rowIndex, columnIndex);
                                }}
                              >
                                <ha-icon icon="mdi:plus"></ha-icon>
                                Add Module
                              </button>
                            </div>
                          </div>
                        `
                      )
                    : html`
                        <div class="empty-row-message">
                          <p>This row has no columns.</p>
                          <button
                            class="add-module-btn"
                            @click=${(e: Event) => {
                              e.stopPropagation();
                              this._openModuleSelector(rowIndex, 0);
                            }}
                            style="margin-top: 8px;"
                          >
                            <ha-icon icon="mdi:plus"></ha-icon>
                            Add Module (will create column automatically)
                          </button>
                        </div>
                      `}
                  <div class="add-column-container">
                    <button
                      class="add-column-btn"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._addColumn(rowIndex);
                      }}
                      title="Add Column"
                    >
                      <ha-icon icon="mdi:plus"></ha-icon>
                      Add Column
                    </button>
                  </div>
                </div>
              </div>
            `
          )}
        </div>

        ${this._showModuleSelector ? this._renderModuleSelector() : ''}
        ${this._showModuleSettings ? this._renderModuleSettings() : ''}
        ${this._showLayoutChildSettings ? this._renderLayoutChildSettings() : ''}
        ${this._showRowSettings ? this._renderRowSettings() : ''}
        ${this._showColumnSettings ? this._renderColumnSettings() : ''}
        ${this._showColumnLayoutSelector ? this._renderColumnLayoutSelector() : ''}
      </div>
    `;
  }

  private _renderModuleSelector(): TemplateResult {
    const registry = getModuleRegistry();
    const allModules = registry.getAllModules();

    // Check if we're adding to a layout module (prevent nested layout modules)
    const isAddingToLayoutModule = this._selectedLayoutModuleIndex >= 0;

    // Separate layout modules from content modules
    const layoutModules = allModules.filter(m => m.metadata.category === 'layout');
    const contentModules = allModules.filter(m => m.metadata.category !== 'layout');

    return html`
      <div class="module-selector-popup">
        <div class="popup-overlay" @click=${() => (this._showModuleSelector = false)}></div>
        <div class="selector-content">
          <div class="selector-header">
            <h3>Add Module</h3>
            ${isAddingToLayoutModule
              ? html`<p class="selector-subtitle">
                  Adding to layout module (only content modules allowed)
                </p>`
              : ''}
          </div>

          ${!isAddingToLayoutModule && layoutModules.length > 0
            ? html`
                <div class="module-category">
                  <h4 class="category-title">Layout Containers</h4>
                  <p class="category-description">Create containers to organize your modules</p>
                  <div class="module-types layout-modules">
                    ${layoutModules.map(module => {
                      const metadata = module.metadata;
                      const isHorizontal = metadata.type === 'horizontal';
                      const isVertical = metadata.type === 'vertical';
                      return html`
                        <button
                          class="module-type-btn layout-module ${isHorizontal
                            ? 'horizontal-layout'
                            : ''} ${isVertical ? 'vertical-layout' : ''}"
                          @click=${() => this._addModule(metadata.type)}
                          title="${metadata.description}"
                        >
                          <div class="layout-badge">Layout</div>
                          <ha-icon icon="${metadata.icon}"></ha-icon>
                          <div class="module-info">
                            <span class="module-title">${metadata.title}</span>
                            <span class="module-description">${metadata.description}</span>
                          </div>
                        </button>
                      `;
                    })}
                  </div>
                </div>
              `
            : ''}
          ${contentModules.length > 0
            ? html`
                <div class="module-category">
                  <h4 class="category-title">Content Modules</h4>
                  <p class="category-description">Add content and interactive elements</p>
                  <div class="module-types content-modules">
                    ${contentModules.map(module => {
                      const metadata = module.metadata;
                      return html`
                        <button
                          class="module-type-btn content-module"
                          @click=${() => this._addModule(metadata.type)}
                          title="${metadata.description}"
                        >
                          <ha-icon icon="${metadata.icon}"></ha-icon>
                          <div class="module-info">
                            <span class="module-title">${metadata.title}</span>
                            <span class="module-description">${metadata.description}</span>
                          </div>
                        </button>
                      `;
                    })}
                  </div>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _formatCategoryTitle(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  // Layout Module Rules - centralized logic for layout module behavior
  private _isLayoutModule(moduleType: string): boolean {
    const layoutModuleTypes = ['horizontal', 'vertical'];
    return layoutModuleTypes.includes(moduleType);
  }

  private _shouldAutoOpenSettings(moduleType: string): boolean {
    // Layout modules should NOT auto-open settings
    if (this._isLayoutModule(moduleType)) {
      return false;
    }
    // All other modules should auto-open settings
    return true;
  }

  private _getLayoutModuleColor(moduleType: string): string {
    if (this._isLayoutModule(moduleType)) {
      return 'var(--success-color, #4caf50)';
    }
    return 'var(--accent-color, var(--orange-color, #ff9800))';
  }

  private _renderColumnLayoutSelector(): TemplateResult {
    const layout = this._ensureLayout();
    const currentRow = layout.rows[this._selectedRowForLayout];
    const currentColumnCount = currentRow ? currentRow.columns.length : 1;

    // Get the current layout ID, considering migration
    const currentLayoutId = currentRow?.column_layout || '1-col';
    const migratedLayoutId = this._migrateLegacyLayoutId(currentLayoutId);

    // Show only layouts for the current column count
    const availableLayouts = this._getLayoutsForColumnCount(currentColumnCount);

    return html`
      <div class="column-layout-selector-popup">
        <div class="popup-overlay" @click=${() => (this._showColumnLayoutSelector = false)}></div>
        <div class="selector-content">
          <div class="selector-header">
            <h3>Choose Column Layout</h3>
            <p>
              Select any layout for ${currentColumnCount}
              column${currentColumnCount !== 1 ? 's' : ''} (Currently: ${currentColumnCount}
              column${currentColumnCount !== 1 ? 's' : ''})
            </p>
          </div>

          <div class="layout-options">
            ${availableLayouts.map(
              layout => html`
                <button
                  class="layout-option-btn ${layout.id === currentLayoutId ||
                  layout.id === migratedLayoutId
                    ? 'current'
                    : ''}"
                  @click=${() => this._changeColumnLayout(layout.id)}
                  title="${layout.name}"
                >
                  <div class="layout-visual">
                    <div class="layout-icon-large">
                      ${unsafeHTML(this._createColumnIconHTML(layout.proportions))}
                    </div>
                  </div>
                  <div class="layout-name">${layout.name}</div>
                  ${layout.id === currentLayoutId || layout.id === migratedLayoutId
                    ? html`<div class="current-badge">Current</div>`
                    : ''}
                </button>
              `
            )}
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        --accent-color: var(--orange-color, #ff9800);
        --orange-color: #ff9800;
        --secondary-color: var(--orange-color, #ff9800);
      }

      .layout-builder {
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 8px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .builder-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--divider-color);
        flex-wrap: wrap;
        gap: 8px;
        flex-shrink: 0;
      }

      .builder-header h3 {
        margin: 0;
        flex: 1;
        min-width: 120px;
        font-size: 18px;
      }

      .add-row-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        white-space: nowrap;
        font-weight: 500;
        transition: all 0.2s ease;
        min-height: 40px;
      }

      .add-row-btn:hover {
        background: var(--primary-color-dark, var(--primary-color));
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .row-builder {
        margin-bottom: 16px;
        border: 2px solid var(--primary-color);
        border-radius: 8px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        position: static;
        transition: all 0.2s ease;
        overflow: visible;
      }

      .row-builder:last-child {
        margin-bottom: 0;
      }

      .row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        background: var(--primary-color);
        color: white;
        font-weight: 500;
        border-bottom: 2px solid var(--primary-color);
        position: static;
        z-index: 2;
        border-radius: 8px 8px 0px 0px;
      }

      .row-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .row-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .row-drag-handle:hover {
        opacity: 1;
      }

      .row-drag-handle:active {
        cursor: grabbing;
      }

      .column-layout-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        color: white;
        font-size: 14px;
        transition: all 0.2s ease;
        min-width: 32px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .column-layout-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
      }

      .layout-icon {
        font-family: monospace;
        font-weight: bold;
        letter-spacing: 1px;
      }

      .row-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .row-duplicate-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .row-duplicate-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .row-add-column-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .row-add-column-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .row-settings-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }

      .row-settings-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .delete-row-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .delete-row-btn:hover {
        background: rgba(255, 100, 100, 0.8);
        color: white;
      }

      .rows-container {
        flex: 1;
        min-height: 0;
        width: 100%;
        box-sizing: border-box;
      }

      .columns-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        padding: 12px;
        box-sizing: border-box;
        background: var(--card-background-color);
        border-top: 1px solid var(--primary-color);
      }

      /* Editor view: Force single column layout for better usability */
      .columns-container[data-layout='1-col'],
      .columns-container[data-layout='1-2-1-2'],
      .columns-container[data-layout='1-3-2-3'],
      .columns-container[data-layout='2-3-1-3'],
      .columns-container[data-layout='2-5-3-5'],
      .columns-container[data-layout='3-5-2-5'],
      .columns-container[data-layout='1-3-1-3-1-3'],
      .columns-container[data-layout='1-4-1-2-1-4'],
      .columns-container[data-layout='1-5-3-5-1-5'],
      .columns-container[data-layout='1-6-2-3-1-6'],
      .columns-container[data-layout='1-4-1-4-1-4-1-4'],
      .columns-container[data-layout='1-5-1-5-1-5-1-5'],
      .columns-container[data-layout='1-6-1-6-1-6-1-6'],
      .columns-container[data-layout='1-8-1-4-1-4-1-8'],
      .columns-container[data-layout='1-5-1-5-1-5-1-5'],
      .columns-container[data-layout='1-6-1-6-1-3-1-6-1-6'],
      .columns-container[data-layout='1-8-1-4-1-4-1-4-1-8'],
      .columns-container[data-layout='1-6-1-6-1-6-1-6-1-6-1-6'],
      /* Legacy support */
      .columns-container[data-layout='50-50'],
      .columns-container[data-layout='30-70'],
      .columns-container[data-layout='70-30'],
      .columns-container[data-layout='33-33-33'],
      .columns-container[data-layout='25-50-25'],
      .columns-container[data-layout='20-60-20'],
      .columns-container[data-layout='25-25-25-25'] {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border: 1px solid var(--primary-color);
        margin-bottom: 16px;
        border-radius: 0px 0px 8px 8px;
      }

      .column-builder {
        border: 2px solid var(--accent-color, var(--orange-color, #ff9800));
        border-radius: 0px 0px 6px 6px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        overflow: visible;

        position: static;
      }

      .column-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 12px;
        background: var(--accent-color, var(--orange-color, #ff9800));
        color: white;
        border-bottom: 2px solid var(--accent-color, var(--orange-color, #ff9800));
        position: static;
        z-index: 2;
        border-radius: 6px 6px 0px 0px;
      }

      .column-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .column-add-module-btn,
      .column-duplicate-btn,
      .column-settings-btn,
      .column-delete-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        font-size: 12px;
        min-width: 28px;
        min-height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .column-add-module-btn:hover,
      .column-duplicate-btn:hover,
      .column-settings-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        color: white;
        transform: scale(1.05);
      }

      .column-delete-btn:hover:not([disabled]) {
        background: rgba(255, 100, 100, 0.9);
        color: white;
        transform: scale(1.05);
      }

      .column-delete-btn[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }

      .column-delete-btn[disabled]:hover {
        background: none;
        transform: none;
      }

      .column-actions ha-icon {
        --mdc-icon-size: 16px;
      }

      .column-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .column-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .column-drag-handle:hover {
        opacity: 1;
      }

      .column-drag-handle:active {
        cursor: grabbing;
      }

      .modules-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
        box-sizing: border-box;
        padding: 12px;
        background: var(--card-background-color);
        border: 1px solid var(--secondary-color, var(--accent-color, #ff9800));
        border-top: none;
        border-radius: 0px 0px 6px 6px;
        margin-top: 0;

        position: static;
        overflow: visible;
      }

      .module-item {
        position: relative;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        margin-bottom: 8px;
        width: 100%;
        min-height: 60px;
        transition: border-color 0.2s ease;
        box-sizing: border-box;
        overflow: visible;
      }

      .module-item:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 12px rgba(var(--rgb-primary-color), 0.2);
        transform: translateY(-1px);
      }

      .module-content {
        padding: 8px;
        cursor: pointer;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        word-wrap: break-word;
        word-break: break-word;
        pointer-events: auto;
        position: relative;
        z-index: 1;

        /* Ensure content doesn't interfere with hover actions positioning */
        contain: layout style;
      }

      /* Simplified Module Styles */
      .simplified-module {
        padding: 12px;
        border-radius: 6px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        width: 100%;
        box-sizing: border-box;
      }

      .simplified-module-header {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }

      .simplified-module-drag-handle {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color, #757575);
        cursor: grab;
        opacity: 0.6;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .simplified-module:hover .simplified-module-drag-handle {
        opacity: 1;
      }

      .simplified-module-drag-handle:active {
        cursor: grabbing;
      }

      .simplified-module-icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color, #2196f3);
        color: white;
        border-radius: 6px;
        --mdc-icon-size: 20px;
      }

      .simplified-module-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .simplified-module-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        line-height: 1.3;
        margin: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .simplified-module-info {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
        line-height: 1.2;
        margin: 0;
        opacity: 0.8;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .simplified-module-actions {
        display: flex;
        gap: 4px;
        align-items: center;
        flex-shrink: 0;
      }

      .simplified-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
      }

      .simplified-action-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .simplified-action-btn.edit-btn {
        color: var(--primary-color, #2196f3);
        border-color: var(--primary-color, #2196f3);
      }

      .simplified-action-btn.edit-btn:hover {
        background: var(--primary-color, #2196f3);
        color: white;
      }

      .simplified-action-btn.duplicate-btn {
        color: var(--info-color, #2196f3);
        border-color: var(--info-color, #2196f3);
      }

      .simplified-action-btn.duplicate-btn:hover {
        background: var(--info-color, #2196f3);
        color: white;
      }

      .simplified-action-btn.delete-btn {
        color: var(--error-color, #f44336);
        border-color: var(--error-color, #f44336);
      }

      .simplified-action-btn.delete-btn:hover {
        background: var(--error-color, #f44336);
        color: white;
      }

      .simplified-action-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Disable animations within layout builder modules */
      .module-content * {
        max-width: 100%;
        box-sizing: border-box;
        animation: none !important;
        transition: none !important;
      }

      .module-content *:hover {
        transform: none !important;
        animation: none !important;
        transition: none !important;
      }

      .module-content img {
        max-width: 100%;
        height: auto;
        display: block;
      }

      .add-module-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        box-sizing: border-box;
        font-size: 13px;
        min-height: 36px;
      }

      .add-module-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .add-column-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px 12px 12px;
        width: 100%;
        box-sizing: border-box;
      }

      .add-column-btn {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 12px;
        border: 2px dashed var(--secondary-text-color);
        border-radius: 6px;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;
        width: 100%;
        min-height: 40px;
        box-sizing: border-box;
      }

      .add-column-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.05));
      }

      .add-column-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      /* Empty Row Message */
      .empty-row-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        text-align: center;
        min-height: 120px;
      }

      .empty-row-message p {
        margin: 0 0 8px 0;
        font-size: 14px;
        opacity: 0.8;
      }

      /* Module Selector Popup */
      .module-selector-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .popup-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
      }

      .selector-content {
        position: relative;
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }

      .selector-header {
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 16px;
      }

      .selector-header h3 {
        margin: 0 0 4px 0;
      }

      .module-stats {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .module-category {
        margin-bottom: 20px;
      }

      .category-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .module-types {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .module-type-btn {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        width: 100%;
        min-height: 60px;
      }

      .module-type-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }

      /* Ensure text elements are white on hover */
      .module-type-btn:hover .module-title,
      .module-type-btn:hover .module-description {
        color: white !important;
      }

      .module-type-btn ha-icon {
        font-size: 32px;
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: white;
        border-radius: 8px;
      }

      .module-type-btn:hover ha-icon {
        background: white;
        color: var(--primary-color);
      }

      .module-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        flex: 1;
      }

      .module-title {
        font-weight: 500;
        font-size: 16px;
        color: var(--primary-text-color);
      }

      .module-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.3;
      }

      .module-author,
      .module-version {
        display: none; /* Hide for cleaner look */
      }

      /* Module Category Styles */
      .module-category {
        margin-bottom: 24px;
      }

      .category-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .category-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        margin: 0 0 16px 0;
        line-height: 1.4;
      }

      /* Layout Module Specific Styles */
      .layout-modules .module-type-btn.layout-module {
        position: relative;
        border: 2px solid var(--success-color, #4caf50);
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.1));
      }

      .layout-modules .module-type-btn.horizontal-layout {
        border-color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout {
        border-color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      .layout-modules .module-type-btn.horizontal-layout:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      .layout-modules .module-type-btn.vertical-layout:hover {
        border-color: var(--success-color, #4caf50);
        background: var(--success-color, #4caf50);
        color: white;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      }

      /* Ensure layout module text is white on hover */
      .layout-modules .module-type-btn.layout-module:hover .module-title,
      .layout-modules .module-type-btn.layout-module:hover .module-description,
      .layout-modules .module-type-btn.horizontal-layout:hover .module-title,
      .layout-modules .module-type-btn.horizontal-layout:hover .module-description,
      .layout-modules .module-type-btn.vertical-layout:hover .module-title,
      .layout-modules .module-type-btn.vertical-layout:hover .module-description {
        color: white !important;
      }

      .layout-modules .module-type-btn.layout-module ha-icon {
        background: var(--success-color, #4caf50);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }

      .layout-modules .module-type-btn.horizontal-layout ha-icon {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout ha-icon {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover ha-icon {
        background: white;
        color: var(--success-color, #4caf50);
        border-color: rgba(0, 0, 0, 0.1);
      }

      .layout-modules .module-type-btn.horizontal-layout:hover ha-icon {
        color: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout:hover ha-icon {
        color: var(--success-color, #4caf50);
      }

      .layout-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--success-color, #4caf50);
        color: white;
        font-size: 9px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.9;
      }

      .layout-modules .module-type-btn.horizontal-layout .layout-badge {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.vertical-layout .layout-badge {
        background: var(--success-color, #4caf50);
      }

      .layout-modules .module-type-btn.layout-module:hover .layout-badge {
        background: rgba(255, 255, 255, 0.2);
        opacity: 1;
      }

      /* Content Module Styles */
      .content-modules .module-type-btn.content-module {
        border: 1px solid var(--divider-color);
      }

      .content-modules .module-type-btn.content-module:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }

      /* Ensure content module text is white on hover */
      .content-modules .module-type-btn.content-module:hover .module-title,
      .content-modules .module-type-btn.content-module:hover .module-description {
        color: white !important;
      }

      /* Column Layout Selector Popup */
      .column-layout-selector-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1001;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 16px;
      }

      .layout-option-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 12px;
        border: 2px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        min-height: 80px;
        gap: 8px;
      }

      .layout-option-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .layout-option-btn.current {
        border-color: var(--primary-color);
        background: var(--primary-color-light, rgba(33, 150, 243, 0.1));
        position: relative;
      }

      .layout-option-btn.current .layout-icon-large {
        color: var(--primary-color);
      }

      .current-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: var(--primary-color);
        color: white;
        font-size: 8px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .layout-visual {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 32px;
      }

      .layout-icon-large {
        font-family: monospace;
        font-weight: bold;
        font-size: 20px;
        letter-spacing: 2px;
        color: var(--primary-color);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-name {
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-text-color);
        line-height: 1.2;
      }

      .module-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        border: 1px dashed var(--divider-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--error-color);
        color: white;
        border-radius: 4px;
        font-size: 14px;
      }

      /* General Settings Popup Styles */
      .settings-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1002;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        overflow-y: auto;
      }

      .settings-tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
      }

      .settings-tab {
        flex: 1;
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .settings-tab:hover {
        color: var(--primary-color);
      }

      .settings-tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .settings-tab-content {
        padding: 24px;
        max-height: 400px;
        overflow-y: auto;
      }

      /* Module Settings Popup */
      .module-settings-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1001;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        overflow-y: auto;
      }

      .popup-content {
        position: relative;
        background: var(--card-background-color);
        border-radius: 8px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
      }

      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--divider-color);
      }

      .close-button {
        background: none;
        border: none;
        font-size: 32px;
        cursor: pointer;
        color: var(--secondary-text-color);
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      .close-button:hover {
        color: var(--primary-color);
      }

      .action-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .action-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .duplicate-button {
        color: var(--primary-color);
      }

      .duplicate-button:hover {
        background: var(--primary-color);
        color: white;
      }

      .delete-button {
        color: var(--error-color);
      }

      .delete-button:hover {
        background: var(--error-color);
        color: white;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Module Preview */
      .module-preview {
        margin: 16px 24px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
      }

      .preview-header {
        padding: 12px 16px;
        background: var(--secondary-background-color);
        font-weight: 500;
        font-size: 14px;
      }

      .preview-content {
        padding: 16px;
        min-height: 60px;
        display: block;
      }

      /* Module Tabs */
      .module-tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
      }

      .module-tab {
        flex: 1;
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .module-tab:hover {
        color: var(--primary-color);
      }

      .module-tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .module-tab-content {
        padding: 24px;
        max-height: 400px;
        overflow-y: auto;
        width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
      }

      /* Design Subtabs */
      .design-subtabs {
        display: flex;
        margin-bottom: 16px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        overflow: hidden;
      }

      .design-subtab {
        flex: 1;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .design-subtab:hover {
        color: var(--primary-color);
      }

      .design-subtab.active {
        background: var(--primary-color);
        color: white;
      }

      /* Settings Sections */
      .settings-section {
        margin-bottom: 20px;
        width: 100%;
        box-sizing: border-box;
      }

      .settings-section label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
        width: 100%;
        box-sizing: border-box;
      }

      /* Color Section Styling */
      .color-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .color-picker-wrapper {
        display: flex;
        align-items: center;
      }

      .color-picker-wrapper ultra-color-picker {
        width: 100%;
        max-width: 300px;
      }

      /* Font Dropdown Styling */
      .font-dropdown {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
      }

      .font-dropdown:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .font-dropdown optgroup {
        font-weight: 600;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
        padding: 4px 0;
      }

      .font-dropdown option {
        padding: 4px 8px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      /* Font Size Input Styling */
      .font-size-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .font-size-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      /* Enhanced Alignment Buttons */
      .alignment-buttons {
        display: flex;
        gap: 6px;
        margin-top: 4px;
      }

      .alignment-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .alignment-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .alignment-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .alignment-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .settings-section input,
      .settings-section select,
      .settings-section textarea {
        width: 100%;
        max-width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }

      .settings-section textarea {
        min-height: 60px;
        resize: vertical;
      }

      /* Ensure form elements fit properly */
      .settings-section ha-form {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Ensure color pickers fit properly */
      .settings-section ultra-color-picker {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Consistent styling for all module settings */
      .module-tab-content .settings-section,
      .settings-tab-content .settings-section {
        border-radius: 8px;
        padding: 16px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        margin-bottom: 16px;
      }

      .module-tab-content .settings-section:last-child,
      .settings-tab-content .settings-section:last-child {
        margin-bottom: 0;
      }

      /* Enhanced input field styling for consistency */
      .module-tab-content input[type='number'],
      .module-tab-content input[type='text'],
      .module-tab-content input[type='color'],
      .module-tab-content select,
      .module-tab-content textarea,
      .settings-tab-content input[type='number'],
      .settings-tab-content input[type='text'],
      .settings-tab-content input[type='color'],
      .settings-tab-content select,
      .settings-tab-content textarea {
        width: 100%;
        max-width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.2s ease;
      }

      .module-tab-content input:focus,
      .module-tab-content select:focus,
      .module-tab-content textarea:focus,
      .settings-tab-content input:focus,
      .settings-tab-content select:focus,
      .settings-tab-content textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      /* Range sliders consistent styling */
      .module-tab-content input[type='range'],
      .settings-tab-content input[type='range'] {
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color);
        outline: none;
        -webkit-appearance: none;
      }

      .module-tab-content input[type='range']::-webkit-slider-thumb,
      .settings-tab-content input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
      }

      /* Checkbox and radio button styling */
      .module-tab-content input[type='checkbox'],
      .module-tab-content input[type='radio'],
      .settings-tab-content input[type='checkbox'],
      .settings-tab-content input[type='radio'] {
        width: auto;
        margin-right: 8px;
        accent-color: var(--primary-color);
      }

      /* Label styling for form elements */
      .module-tab-content label,
      .settings-tab-content label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
        line-height: 1.4;
      }

      /* Field groups */
      .module-tab-content .field-group,
      .settings-tab-content .field-group {
        gap: 12px;
        align-items: flex-end;
      }

      .module-tab-content .field-group > div,
      .settings-tab-content .field-group > div {
        flex: 1;
      }

      /* Button Groups */
      .alignment-buttons,
      .format-buttons {
        display: flex;
        gap: 4px;
      }

      .alignment-btn,
      .format-btn {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .alignment-btn:hover,
      .format-btn:hover {
        border-color: var(--primary-color);
      }

      .alignment-btn.active,
      .format-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      /* Value Position Buttons for Bar Module */
      .value-position-buttons {
        display: flex;
        gap: 8px;
      }

      .position-btn {
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .position-btn:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .position-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      /* Spacing Grid */
      .spacing-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .spacing-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 500;
      }

      .spacing-cross {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        align-items: center;
        max-width: 120px;
        margin: 0 auto;
      }

      .spacing-row {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 8px;
        align-items: center;
      }

      .spacing-center {
        width: 32px;
        height: 32px;
        background: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-weight: bold;
        font-size: 12px;
      }

      .spacing-cross input {
        width: 60px;
        text-align: center;
        padding: 4px 8px;
        font-size: 12px;
      }

      /* Module Rendering */
      .text-module {
        word-wrap: break-word;
      }

      .separator-module {
        width: 100%;
      }

      .image-module {
        text-align: center;
      }

      .image-placeholder {
        padding: 20px;
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .module-placeholder {
        padding: 20px;
        text-align: center;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      /* Logic Tab Styles */
      .logic-tab-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 16px;
      }

      .logic-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .section-header h3 {
        margin: 0 0 16px 0;
        color: var(--primary-text-color);
        font-size: 18px;
        font-weight: 600;
      }

      .display-mode-dropdown {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        min-height: 48px;
      }

      /* Conditions Section */
      .conditions-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .conditions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .conditions-header h4 {
        margin: 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 600;
      }

      .add-condition-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .add-condition-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .add-condition-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .conditions-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .no-conditions {
        text-align: center;
        padding: 32px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      /* Individual Condition Item */
      .condition-item {
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 0;
        transition: all 0.2s ease;
      }

      .condition-item.disabled {
        opacity: 0.6;
      }

      .condition-item:hover {
        border-color: var(--primary-color);
      }

      .condition-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--card-background-color);
        border-radius: 8px 8px 0 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .condition-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .condition-toggle {
        background: none;
        border: none;
        color: var(--primary-text-color);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.2s ease;
      }

      .condition-toggle:hover {
        background: var(--secondary-background-color);
      }

      .condition-toggle ha-icon {
        --mdc-icon-size: 18px;
        transition: transform 0.2s ease;
      }

      .condition-toggle.expanded ha-icon {
        transform: rotate(0deg);
      }

      .condition-label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .condition-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .condition-action-btn {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .condition-action-btn:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .condition-action-btn.delete:hover {
        background: var(--error-color);
        color: white;
      }

      .condition-action-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .condition-drag-handle {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: grab;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .condition-drag-handle:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .condition-drag-handle:active {
        cursor: grabbing;
      }

      /* Condition Content */
      .condition-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .condition-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .condition-field label {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .condition-field select,
      .condition-field input,
      .condition-field textarea {
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        transition: border-color 0.2s ease;
      }

      .condition-field select:focus,
      .condition-field input:focus,
      .condition-field textarea:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .condition-enable-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: normal !important;
        cursor: pointer;
      }

      /* Condition Type Specific Styles */
      .entity-condition-fields,
      .time-condition-fields,
      .custom-field-condition,
      .template-condition {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .time-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .condition-info {
        margin: 0;
        padding: 8px 12px;
        background: var(--info-color, #2196f3);
        color: white;
        border-radius: 6px;
        font-size: 12px;
        text-align: center;
      }

      .template-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-style: italic;
        margin-top: 4px;
      }

      /* Template Section */
      .template-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .template-header {
        margin-bottom: 16px;
      }

      .template-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: var(--primary-text-color);
        cursor: pointer;
      }

      .template-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .template-editor {
        min-height: 120px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        resize: vertical;
      }

      @media (max-width: 768px) {
        .columns-container {
          flex-direction: column;
        }

        .column-builder {
          border-right: none;
          border-bottom: 1px solid var(--divider-color);
        }

        .column-builder:last-child {
          border-bottom: none;
        }

        .module-types {
          grid-template-columns: repeat(2, 1fr);
        }

        .spacing-grid {
          grid-template-columns: 1fr;
        }

        .time-inputs {
          grid-template-columns: 1fr;
        }
      }

      /* Logic Module Dimming */
      .module-with-logic {
        position: relative;
      }

      .module-with-logic.logic-hidden {
        opacity: 0.4;
        filter: grayscale(50%);
      }

      .logic-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 500;
        border-radius: 4px;
        pointer-events: none;
        z-index: 10;
      }

      .logic-overlay ha-icon {
        --mdc-icon-size: 20px;
        margin-bottom: 4px;
      }

      .logic-overlay span {
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      }

      /* Toggle Switch Styles */
      .switch-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }

      .switch-label {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
      }

      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--switch-unchecked-color, #ccc);
        transition: 0.3s;
        border-radius: 24px;
      }

      .slider:before {
        position: absolute;
        content: '';
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      input:checked + .slider {
        background-color: var(--primary-color);
      }

      input:focus + .slider {
        box-shadow: 0 0 1px var(--primary-color);
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .slider.round {
        border-radius: 24px;
      }

      .slider.round:before {
        border-radius: 50%;
      }

      /* Disabled state for conditions */
      .disabled-note {
        font-size: 12px;
        color: var(--warning-color, #ff9800);
        font-style: italic;
        font-weight: normal;
      }

      .template-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin-top: 4px;
      }

      /* Animation keyframes and classes for preview windows */
      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      @keyframes vibrate {
        0%,
        100% {
          transform: translateX(0);
        }
        10%,
        30%,
        50%,
        70%,
        90% {
          transform: translateX(-2px);
        }
        20%,
        40%,
        60%,
        80% {
          transform: translateX(2px);
        }
      }

      @keyframes rotate-left {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(-360deg);
        }
      }

      @keyframes rotate-right {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes hover {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes fade {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @keyframes scale {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      @keyframes bounce {
        0%,
        20%,
        50%,
        80%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-10px);
        }
        60% {
          transform: translateY(-5px);
        }
      }

      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        10%,
        30%,
        50%,
        70%,
        90% {
          transform: translateX(-5px);
        }
        20%,
        40%,
        60%,
        80% {
          transform: translateX(5px);
        }
      }

      @keyframes tada {
        0% {
          transform: scale(1);
        }
        10%,
        20% {
          transform: scale(0.9) rotate(-3deg);
        }
        30%,
        50%,
        70%,
        90% {
          transform: scale(1.1) rotate(3deg);
        }
        40%,
        60%,
        80% {
          transform: scale(1.1) rotate(-3deg);
        }
        100% {
          transform: scale(1) rotate(0);
        }
      }

      .animation-pulse {
        animation-name: pulse;
        animation-iteration-count: infinite;
      }

      .animation-vibrate {
        animation-name: vibrate;
        animation-iteration-count: infinite;
      }

      .animation-rotate-left {
        animation-name: rotate-left;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      .animation-rotate-right {
        animation-name: rotate-right;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }

      .animation-hover {
        animation-name: hover;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-fade {
        animation-name: fade;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-scale {
        animation-name: scale;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .animation-bounce {
        animation-name: bounce;
        animation-iteration-count: infinite;
      }

      .animation-shake {
        animation-name: shake;
        animation-timing-function: cubic-bezier(0.36, 0.07, 0.19, 0.97);
        animation-iteration-count: infinite;
      }

      .animation-tada {
        animation-name: tada;
        animation-iteration-count: infinite;
      }

      /* Row and Column Preview Styles */
      .row-preview-content {
        display: flex;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        min-height: 60px;
        align-items: center;
        justify-content: space-around;
      }

      .column-preview {
        flex: 1;
        padding: 12px;
        margin: 0 4px;
        background: var(--accent-color);
        color: white;
        border-radius: 4px;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
      }

      .column-preview-content {
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        text-align: center;
        background: var(--secondary-background-color);
        min-height: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .column-preview-content p {
        margin: 0 0 8px 0;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .module-count {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      /* Drag and Drop Styles */
      .row-builder[draggable='true'],
      .column-builder[draggable='true'],
      .module-item[draggable='true'] {
        cursor: grab;
      }

      .row-builder[draggable='true']:hover,
      .column-builder[draggable='true']:hover,
      .module-item[draggable='true']:hover {
        cursor: grab;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .row-builder[draggable='true']:active,
      .column-builder[draggable='true']:active,
      .module-item[draggable='true']:active {
        cursor: grabbing;
        transform: scale(0.98);
      }

      /* Invalid drop target indication */
      :host([dragging-column]) .module-item,
      :host([dragging-row]) .module-item,
      :host([dragging-row]) .column-builder {
        cursor: not-allowed !important;
        opacity: 0.5;
        pointer-events: auto;
      }

      .drop-target {
        box-shadow: 0 0 20px rgba(var(--rgb-primary-color), 0.6) !important;
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        transform: scale(1.02) !important;
        transition: all 0.2s ease !important;
      }

      .drop-target.row-builder {
        border-color: var(--primary-color) !important;
        border-width: 3px !important;
        border-style: dashed !important;
      }

      .drop-target.column-builder {
        border-color: var(--primary-color) !important;
        border-width: 3px !important;
        border-style: dashed !important;
      }

      .drop-target.module-item {
        border-color: var(--primary-color) !important;
        border-width: 2px !important;
        border-style: dashed !important;
      }

      /* Drag handle indicators */
      .row-header::before {
        content: '⋮⋮';
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        letter-spacing: -2px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .column-header::before {
        content: '⋮⋮';
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        letter-spacing: -2px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .module-content::before {
        content: '⋮⋮';
        position: absolute;
        left: 4px;
        top: 8px;
        color: var(--secondary-text-color);
        font-size: 10px;
        letter-spacing: -1px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        z-index: 1;
      }

      .row-builder[draggable='true']:hover .row-header::before {
        opacity: 1;
      }

      .column-builder[draggable='true']:hover .column-header::before {
        opacity: 1;
      }

      .module-item[draggable='true']:hover .module-content::before {
        opacity: 0.8;
      }

      /* Module item hover effect - consolidated with action display */
      .module-item:hover {
        border-color: var(--primary-color) !important;
      }

      .row-header {
        position: relative;
      }

      .column-header {
        position: relative;
      }

      .module-content {
        position: relative;
      }

      /* Visual feedback during drag */
      .row-builder[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      .column-builder[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      .module-item[draggable='true'][style*='opacity: 0.5'] {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        border: 2px dashed var(--primary-color) !important;
      }

      /* Enhanced modules container styling */
      .modules-container {
        min-height: 80px;
        position: relative;
        transition: all 0.2s ease;
      }

      /* Module Name Field Styling */
      .module-name-input {
        width: 100%;
        max-width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
      }

      .module-name-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .field-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin-top: 4px;
        font-style: italic;
      }

      /* Note: Image module still shows "Image Name" field from the registry.
         This will need to be addressed in the image module itself to remove
         the duplicate field since we now have universal "Module Name" above. */

      .modules-container:empty {
        border: 2px dashed var(--divider-color);
        background: var(--secondary-background-color);
      }

      .modules-container:empty::before {
        content: 'Drop modules here or click Add Module';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--secondary-text-color);
        font-style: italic;
        font-size: 13px;
        pointer-events: none;
        text-align: center;
      }

      .modules-container::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px dashed transparent;
        border-radius: 6px;
        pointer-events: none;
        transition: all 0.2s ease;
        z-index: 1;
      }

      .column-builder.drop-target .modules-container::after {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      /* Layout Module Styles - Column-like appearance */
      .layout-module-container {
        border: 2px solid var(--success-color, #4caf50);
        border-radius: 6px;
        background: var(--card-background-color);
        width: 100%;
        box-sizing: border-box;
        overflow: visible;
        margin-bottom: 8px;
      }

      .layout-module-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        padding: 8px 12px;
        background: var(--success-color, #4caf50);
        color: white;
        border-bottom: 2px solid var(--success-color, #4caf50);
        border-radius: 0px;
      }

      .layout-module-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .layout-module-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.7);
        cursor: grab;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .layout-module-drag-handle:hover {
        opacity: 1;
      }

      .layout-module-drag-handle:active {
        cursor: grabbing;
      }

      .layout-module-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .layout-module-add-btn,
      .layout-module-settings-btn,
      .layout-module-duplicate-btn,
      .layout-module-delete-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        --mdc-icon-size: 16px;
      }

      .layout-module-add-btn:hover,
      .layout-module-settings-btn:hover,
      .layout-module-duplicate-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .layout-module-delete-btn:hover {
        background: rgba(255, 100, 100, 0.8);
        color: white;
      }

      .layout-modules-container {
        background: var(--card-background-color);
        border: 2px dashed var(--divider-color);
        border-radius: 4px;
        margin: 8px;
        transition: all 0.2s ease;
        position: relative;
      }

      .layout-modules-container:hover {
        border-color: var(--success-color, #4caf50);
        background: rgba(76, 175, 80, 0.05);
      }

      .layout-modules-container.layout-drop-target {
        border-color: var(--primary-color) !important;
        border-width: 3px !important;
        border-style: dashed !important;
        background: rgba(var(--rgb-primary-color), 0.1) !important;
        box-shadow: 0 0 20px rgba(var(--rgb-primary-color), 0.3) !important;
      }

      .layout-module-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--secondary-text-color);
        font-style: italic;
        text-align: center;
        padding: 24px;
        width: 100%;
      }

      .layout-module-empty ha-icon {
        --mdc-icon-size: 32px;
        opacity: 0.7;
      }

      .layout-child-module-wrapper {
        width: 100%;
        box-sizing: border-box;
        cursor: grab;
      }

      .layout-child-module-wrapper:active {
        cursor: grabbing;
      }

      /* Simplified layout child module styling */
      .layout-child-simplified-module {
        width: 100%;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        transition: all 0.2s ease;
        cursor: pointer;
        box-sizing: border-box;
        margin-bottom: 8px;
      }

      .layout-child-simplified-module:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .layout-child-simplified-module:hover .layout-child-content {
        color: var(--primary-text-color);
      }

      .layout-child-simplified-module:active {
        cursor: grabbing;
        transform: scale(0.98);
      }

      .layout-child-module-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        min-height: 40px;
        box-sizing: border-box;
      }

      .layout-child-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .layout-child-content {
        flex: 1;
        min-width: 0;
      }

      .layout-child-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 2px;
      }

      .layout-child-info {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .layout-child-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: var(--secondary-text-color);
        cursor: grab;
        opacity: 0.6;
        transition: opacity 0.2s ease;
        --mdc-icon-size: 14px;
      }

      .layout-child-drag-handle:hover {
        opacity: 1;
        color: var(--primary-color);
      }

      .layout-child-drag-handle:active {
        cursor: grabbing;
      }

      .layout-child-actions {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .layout-child-action-btn {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        --mdc-icon-size: 14px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .layout-child-action-btn.edit-btn:hover {
        background: var(--primary-color);
        color: white;
      }

      .layout-child-action-btn.delete-btn:hover {
        background: var(--error-color);
        color: white;
      }

      /* Drag handle indicators */
      .row-header::before,
      .column-header::before {
        content: '⠿⠿';
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(255, 255, 255, 0.7);
        font-size: 10px;
        line-height: 1;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
        letter-spacing: 1px;
      }

      .row-builder:hover .row-header::before,
      .column-builder:hover .column-header::before {
        opacity: 1;
      }

      /* Drag handle for touch devices */
      @media (hover: none) {
        .row-header::before,
        .column-header::before,
        .module-content::before {
          opacity: 1;
        }

        /* On touch devices, show action buttons on tap/focus */
        .module-item:active .module-hover-overlay,
        .module-item:focus-within .module-hover-overlay {
          opacity: 1;
          visibility: visible;
        }

        .module-action-btn {
          width: 36px;
          height: 36px;
        }

        .module-action-btn ha-icon {
          --mdc-icon-size: 20px;
        }
      }
    `;
  }
}

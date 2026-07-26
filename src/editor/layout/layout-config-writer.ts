/**
 * Single write boundary for layout-tab config mutations.
 * Dispatches `config-changed` with the same event shape as LayoutTab historically.
 */
import type { UltraCardConfig, CardRow } from '../../types';

export interface LayoutHistoryState {
  rows: CardRow[];
}

export interface LayoutConfigWriterHost {
  getConfig(): UltraCardConfig;
  setConfig(config: UltraCardConfig): void;
  dispatchConfigChanged(config: UltraCardConfig): void;
  onAfterConfigUpdate?(): void;
  onTemplateUpdate?(): void;
}

export class LayoutConfigWriter {
  private _undoStack: LayoutHistoryState[] = [];
  private _redoStack: LayoutHistoryState[] = [];
  private _isUndoRedoAction = false;
  private readonly _maxHistorySize: number;

  constructor(
    private readonly host: LayoutConfigWriterHost,
    maxHistorySize = 50
  ) {
    this._maxHistorySize = maxHistorySize;
  }

  get undoStack(): LayoutHistoryState[] {
    return this._undoStack;
  }

  get redoStack(): LayoutHistoryState[] {
    return this._redoStack;
  }

  canUndo(): boolean {
    return this._undoStack.length > 0;
  }

  canRedo(): boolean {
    return this._redoStack.length > 0;
  }

  ensureLayout(): { rows: CardRow[] } {
    const config = this.host.getConfig();
    if (!config.layout || !Array.isArray(config.layout.rows)) {
      return { rows: [] };
    }
    return config.layout;
  }

  updateConfig(updates: Partial<UltraCardConfig>): void {
    const newConfig = { ...this.host.getConfig(), ...updates };
    this.host.setConfig(newConfig);
    this.host.onAfterConfigUpdate?.();
    this.host.dispatchConfigChanged(newConfig);
    this.host.onTemplateUpdate?.();
  }

  updateLayout(layout: { rows: CardRow[] }): void {
    if (!this._isUndoRedoAction) {
      this.saveStateToUndoStack();
      this._redoStack = [];
    }
    this.updateConfig({ layout });
  }

  saveStateToUndoStack(): void {
    const layout = this.ensureLayout();
    this._undoStack.push({
      rows: JSON.parse(JSON.stringify(layout.rows)),
    });
    if (this._undoStack.length > this._maxHistorySize) {
      this._undoStack.shift();
    }
  }

  undo(): boolean {
    if (!this.canUndo()) return false;
    const layout = this.ensureLayout();
    this._redoStack.push({
      rows: JSON.parse(JSON.stringify(layout.rows)),
    });
    const previousState = this._undoStack.pop()!;
    this._isUndoRedoAction = true;
    this.updateConfig({ layout: previousState });
    this._isUndoRedoAction = false;
    return true;
  }

  redo(): boolean {
    if (!this.canRedo()) return false;
    const layout = this.ensureLayout();
    this._undoStack.push({
      rows: JSON.parse(JSON.stringify(layout.rows)),
    });
    const nextState = this._redoStack.pop()!;
    this._isUndoRedoAction = true;
    this.updateConfig({ layout: nextState });
    this._isUndoRedoAction = false;
    return true;
  }
}

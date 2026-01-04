import { CustomVariable } from '../types';
import { HomeAssistant } from 'custom-card-helpers';

/**
 * Service for managing custom variables across Ultra Card instances
 * Provides cross-card synchronization using localStorage (local-only, no cloud sync)
 * Variables can be used in templates with {{ $variable_name }} syntax
 */
class UcCustomVariablesService {
  private static readonly STORAGE_KEY = 'ultra-card-custom-variables';
  private static readonly SYNC_EVENT = 'ultra-card-custom-variables-changed';

  private _variables: CustomVariable[] = [];
  private _listeners: Set<(variables: CustomVariable[]) => void> = new Set();

  constructor() {
    this._loadFromStorage();
    this._setupStorageListener();
  }

  /**
   * Get all custom variables, sorted by order
   */
  getVariables(): CustomVariable[] {
    return [...this._variables].sort((a, b) => a.order - b.order);
  }

  /**
   * Get a variable by name
   */
  getVariableByName(name: string): CustomVariable | undefined {
    return this._variables.find(v => v.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Add a new custom variable
   */
  addVariable(
    name: string,
    entity: string,
    valueType: 'entity_id' | 'state' | 'full_object' = 'state'
  ): CustomVariable | null {
    // Validate variable name
    const cleanName = this._sanitizeVariableName(name);
    if (!cleanName) {
      console.error('Invalid variable name. Use only letters, numbers, and underscores.');
      return null;
    }

    // Check for duplicate names
    if (this._variables.some(v => v.name.toLowerCase() === cleanName.toLowerCase())) {
      console.error(`Variable with name "${cleanName}" already exists.`);
      return null;
    }

    const newVariable: CustomVariable = {
      id: this._generateId(),
      name: cleanName,
      entity: entity,
      value_type: valueType,
      order: this._getNextOrder(),
      created: new Date().toISOString(),
    };

    this._variables.push(newVariable);
    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();

    return newVariable;
  }

  /**
   * Update an existing custom variable
   */
  updateVariable(
    id: string,
    updates: Partial<Pick<CustomVariable, 'name' | 'entity' | 'value_type'>>
  ): boolean {
    const index = this._variables.findIndex(v => v.id === id);
    if (index === -1) return false;

    // If name is being updated, validate and check for duplicates
    if (updates.name) {
      const cleanName = this._sanitizeVariableName(updates.name);
      if (!cleanName) {
        console.error('Invalid variable name. Use only letters, numbers, and underscores.');
        return false;
      }

      // Check for duplicate names (excluding current variable)
      const isDuplicate = this._variables.some(
        v => v.id !== id && v.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (isDuplicate) {
        console.error(`Variable with name "${cleanName}" already exists.`);
        return false;
      }

      updates.name = cleanName;
    }

    this._variables[index] = {
      ...this._variables[index],
      ...updates,
    };

    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();

    return true;
  }

  /**
   * Delete a custom variable
   */
  deleteVariable(id: string): boolean {
    const index = this._variables.findIndex(v => v.id === id);
    if (index === -1) return false;

    this._variables.splice(index, 1);
    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();

    return true;
  }

  /**
   * Reorder custom variables
   */
  reorderVariables(orderedIds: string[]): boolean {
    // Validate that all IDs exist
    const existingIds = new Set(this._variables.map(v => v.id));
    if (
      !orderedIds.every(id => existingIds.has(id)) ||
      orderedIds.length !== this._variables.length
    ) {
      return false;
    }

    // Update order based on new positions
    orderedIds.forEach((id, index) => {
      const variable = this._variables.find(v => v.id === id);
      if (variable) {
        variable.order = index;
      }
    });

    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
    return true;
  }

  /**
   * Resolve a variable's value based on its type
   * @param name The variable name (without $ prefix)
   * @param hass HomeAssistant instance for state lookup
   * @returns The resolved value or null if variable not found
   */
  resolveVariable(name: string, hass: HomeAssistant): string | null {
    const variable = this.getVariableByName(name);
    if (!variable) {
      return null;
    }

    const entityState = hass.states[variable.entity];

    switch (variable.value_type) {
      case 'entity_id':
        return variable.entity;

      case 'state':
        if (!entityState) {
          return 'unavailable';
        }
        return entityState.state;

      case 'full_object':
        if (!entityState) {
          return JSON.stringify({ state: 'unavailable', attributes: {} });
        }
        return JSON.stringify(entityState);

      default:
        return variable.entity;
    }
  }

  /**
   * Get all variable names for autocomplete
   */
  getVariableNames(): string[] {
    return this._variables.map(v => v.name);
  }

  /**
   * Subscribe to custom variables changes
   */
  subscribe(listener: (variables: CustomVariable[]) => void): () => void {
    this._listeners.add(listener);

    // Immediately notify with current state
    const currentVariables = this.getVariables();
    listener(currentVariables);

    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Clear all custom variables
   */
  clearAll(): void {
    this._variables = [];
    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
  }

  /**
   * Import variables from export data
   */
  importVariables(variables: CustomVariable[], merge: boolean = true): void {
    if (!Array.isArray(variables) || variables.length === 0) {
      return;
    }

    if (!merge) {
      // Replace all variables
      this._variables = variables
        .filter(this._isValidVariable.bind(this))
        .map((v, index) => ({
          ...v,
          id: v.id || this._generateId(),
          order: index,
        }));
    } else {
      // Merge with existing, avoiding duplicate names
      const existingNames = new Set(this._variables.map(v => v.name.toLowerCase()));

      variables.forEach(v => {
        if (this._isValidVariable(v) && !existingNames.has(v.name.toLowerCase())) {
          this._variables.push({
            ...v,
            id: v.id || this._generateId(),
            order: this._getNextOrder(),
          });
          existingNames.add(v.name.toLowerCase());
        }
      });
    }

    this._saveToStorage();
    this._notifyListeners();
    this._broadcastChange();
  }

  /**
   * Export variables for sharing
   */
  exportVariables(): CustomVariable[] {
    return this.getVariables();
  }

  /**
   * Check if a variable name already exists
   */
  hasVariable(name: string): boolean {
    return this._variables.some(v => v.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Validate a variable name (alphanumeric + underscore only)
   */
  isValidVariableName(name: string): boolean {
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
  }

  /**
   * Debug method to help diagnose custom variables issues
   */
  debugVariables(): void {
    console.log('=== Ultra Card Custom Variables Debug Info ===');
    console.log('Storage Key:', UcCustomVariablesService.STORAGE_KEY);
    console.log('Current Variables Count:', this._variables.length);
    console.log('Listeners Count:', this._listeners.size);
    console.log('LocalStorage Available:', this._isLocalStorageAvailable());

    try {
      const stored = localStorage.getItem(UcCustomVariablesService.STORAGE_KEY);
      console.log('Raw Storage Data:', stored ? `${stored.length} characters` : 'null');

      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed Data Type:', Array.isArray(parsed) ? 'Array' : typeof parsed);
        console.log('Parsed Data Length:', Array.isArray(parsed) ? parsed.length : 'N/A');
      }
    } catch (error) {
      console.error('Storage Data Error:', error);
    }

    console.log(
      'Variables List:',
      this._variables.map(v => ({
        id: v.id,
        name: v.name,
        entity: v.entity,
        value_type: v.value_type,
        order: v.order,
      }))
    );
    console.log('==========================================');
  }

  /**
   * Sanitize variable name - remove invalid characters
   */
  private _sanitizeVariableName(name: string): string {
    // Remove leading/trailing whitespace
    let cleaned = name.trim();

    // Replace spaces and hyphens with underscores
    cleaned = cleaned.replace(/[\s-]+/g, '_');

    // Remove any characters that aren't alphanumeric or underscore
    cleaned = cleaned.replace(/[^a-zA-Z0-9_]/g, '');

    // Ensure name starts with a letter (prefix with 'v_' if it starts with a number)
    if (/^[0-9]/.test(cleaned)) {
      cleaned = 'v_' + cleaned;
    }

    // Return empty string if result is invalid
    if (!cleaned || !this.isValidVariableName(cleaned)) {
      return '';
    }

    return cleaned;
  }

  /**
   * Load variables from localStorage
   */
  private _loadFromStorage(): void {
    try {
      // Check if localStorage is available
      if (!this._isLocalStorageAvailable()) {
        this._variables = [];
        return;
      }

      const stored = localStorage.getItem(UcCustomVariablesService.STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          this._variables = parsed.filter(this._isValidVariable.bind(this));
        } else {
          this._variables = [];
        }
      } else {
        this._variables = [];
      }
    } catch (error) {
      console.error('Failed to load custom variables from storage:', error);
      this._variables = [];
    }
  }

  /**
   * Save variables to localStorage
   */
  private _saveToStorage(): void {
    try {
      // Check if localStorage is available
      if (!this._isLocalStorageAvailable()) {
        return;
      }

      const dataToSave = JSON.stringify(this._variables);
      localStorage.setItem(UcCustomVariablesService.STORAGE_KEY, dataToSave);
    } catch (error) {
      console.error('Failed to save custom variables to storage:', error);

      // Check if it's a quota exceeded error
      if (error instanceof DOMException && error.code === DOMException.QUOTA_EXCEEDED_ERR) {
        console.error(
          'localStorage quota exceeded! Consider clearing old data or using fewer variables.'
        );
      }
    }
  }

  /**
   * Setup listener for storage changes from other tabs/windows
   */
  private _setupStorageListener(): void {
    window.addEventListener('storage', e => {
      if (e.key === UcCustomVariablesService.STORAGE_KEY) {
        this._loadFromStorage();
        this._notifyListeners();
      }
    });

    // Listen for custom events from same tab
    window.addEventListener(UcCustomVariablesService.SYNC_EVENT, () => {
      this._loadFromStorage();
      this._notifyListeners();
    });
  }

  /**
   * Broadcast change to other Ultra Card instances in same tab
   */
  private _broadcastChange(): void {
    window.dispatchEvent(new CustomEvent(UcCustomVariablesService.SYNC_EVENT));
  }

  /**
   * Notify all listeners of changes
   */
  private _notifyListeners(): void {
    const variables = this.getVariables();
    this._listeners.forEach(listener => {
      try {
        listener(variables);
      } catch (error) {
        console.warn('Error notifying custom variables listener:', error);
      }
    });
  }

  /**
   * Generate a unique ID for new variables
   */
  private _generateId(): string {
    return `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get next order value for new variables
   */
  private _getNextOrder(): number {
    if (this._variables.length === 0) return 0;
    return Math.max(...this._variables.map(v => v.order)) + 1;
  }

  /**
   * Validate if a variable object is valid
   */
  private _isValidVariable(v: any): v is CustomVariable {
    return (
      v &&
      typeof v.id === 'string' &&
      typeof v.name === 'string' &&
      typeof v.entity === 'string' &&
      typeof v.order === 'number' &&
      ['entity_id', 'state', 'full_object'].includes(v.value_type) &&
      this.isValidVariableName(v.name)
    );
  }

  /**
   * Check if localStorage is available and working
   */
  private _isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__ultra_card_variables_storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const ucCustomVariablesService = new UcCustomVariablesService();

// Make service and debug methods available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).ucCustomVariablesService = ucCustomVariablesService;
  (window as any).debugUltraCardCustomVariables = () => ucCustomVariablesService.debugVariables();
}

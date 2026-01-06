import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ucCustomVariablesService } from '../services/uc-custom-variables-service';
import { CustomVariable, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';

@customElement('uc-custom-variables-manager')
export class UcCustomVariablesManager extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public config?: UltraCardConfig;

  @state() private _globalVariables: CustomVariable[] = [];
  @state() private _cardVariables: CustomVariable[] = [];
  @state() private _draggedItem?: CustomVariable;
  @state() private _dragOverIndex?: number;
  @state() private _editingId?: string;
  @state() private _editingName = '';
  @state() private _editingEntity = '';
  @state() private _editingValueType: 'entity_id' | 'state' | 'attribute' = 'state';
  @state() private _editingAttributeName = '';
  @state() private _editingIsGlobal = true;
  @state() private _showAddForm = false;
  @state() private _newVariableName = '';
  @state() private _newVariableEntity = '';
  @state() private _newVariableValueType: 'entity_id' | 'state' | 'attribute' = 'state';
  @state() private _newVariableAttributeName = '';
  @state() private _newVariableIsGlobal = true;
  @state() private _nameError = '';

  private _variablesUnsubscribe?: () => void;

  connectedCallback(): void {
    super.connectedCallback();

    // Subscribe to global custom variables changes
    this._variablesUnsubscribe = ucCustomVariablesService.subscribe(variables => {
      this._globalVariables = variables;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    // Unsubscribe from custom variables
    if (this._variablesUnsubscribe) {
      this._variablesUnsubscribe();
      this._variablesUnsubscribe = undefined;
    }
  }

  updated(changedProps: Map<string, any>): void {
    super.updated(changedProps);
    // Update card-specific variables when config changes
    if (changedProps.has('config')) {
      this._cardVariables = ucCustomVariablesService.getCardSpecificVariables(this.config);
    }
  }

  // Get combined list for display (global first, then card-specific)
  private get _allVariables(): CustomVariable[] {
    return [...this._globalVariables, ...this._cardVariables];
  }

  private _handleDragStart(e: DragEvent, variable: CustomVariable): void {
    this._draggedItem = variable;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', variable.id);
    }
  }

  private _handleDragOver(e: DragEvent, index: number): void {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    this._dragOverIndex = index;
  }

  private _handleDragLeave(): void {
    this._dragOverIndex = undefined;
  }

  private _handleDrop(e: DragEvent, targetIndex: number): void {
    e.preventDefault();
    this._dragOverIndex = undefined;

    if (!this._draggedItem) return;

    // Determine which list we're reordering
    const isGlobal = this._draggedItem.isGlobal !== false;
    const sourceList = isGlobal ? this._globalVariables : this._cardVariables;
    
    const currentIndex = sourceList.findIndex(v => v.id === this._draggedItem!.id);
    if (currentIndex === -1 || currentIndex === targetIndex) return;

    // Create new order based on drag and drop
    const reorderedVariables = [...sourceList];
    const [draggedItem] = reorderedVariables.splice(currentIndex, 1);
    reorderedVariables.splice(targetIndex, 0, draggedItem);

    if (isGlobal) {
      // Update global variables service with new order
      const orderedIds = reorderedVariables.map(v => v.id);
      ucCustomVariablesService.reorderVariables(orderedIds);
    } else {
      // Update card-specific variables
      reorderedVariables.forEach((v, i) => v.order = i);
      this._updateCardVariables(reorderedVariables);
    }

    this._draggedItem = undefined;
  }

  private _startEdit(variable: CustomVariable): void {
    this._editingId = variable.id;
    this._editingName = variable.name;
    this._editingEntity = variable.entity;
    // Handle legacy 'full_object' type migration
    const valueType = variable.value_type as string;
    this._editingValueType = valueType === 'full_object' ? 'attribute' : (variable.value_type || 'state');
    this._editingAttributeName = variable.attribute_name || '';
    this._editingIsGlobal = variable.isGlobal !== false;
    this._nameError = '';
  }

  private _cancelEdit(): void {
    this._editingId = undefined;
    this._editingName = '';
    this._editingEntity = '';
    this._editingValueType = 'state';
    this._editingIsGlobal = true;
    this._nameError = '';
  }

  private _saveEdit(): void {
    if (!this._editingId || !this._editingName.trim() || !this._editingEntity) return;

    // Validate name
    if (!ucCustomVariablesService.isValidVariableName(this._editingName.trim())) {
      this._nameError = 'Invalid name. Use only letters, numbers, and underscores. Must start with a letter.';
      return;
    }

    const cleanName = this._editingName.trim();
    
    // Find the variable to check if it's global or card-specific
    const globalVar = this._globalVariables.find(v => v.id === this._editingId);
    const cardVar = this._cardVariables.find(v => v.id === this._editingId);
    
    // SAFETY CHECK: Ensure the variable exists in at least one list
    // This prevents accidental deletion if state gets out of sync (especially on mobile)
    if (!globalVar && !cardVar) {
      console.warn(`[UC Variables] Variable ${this._editingId} not found in any list - aborting save to prevent data loss`);
      this._nameError = 'Variable not found. Please cancel and try again.';
      return;
    }
    
    const wasGlobal = !!globalVar;
    const wantsGlobal = this._editingIsGlobal;

    // Check for duplicate names (excluding current variable)
    const duplicateInGlobal = this._globalVariables.some(
      v => v.id !== this._editingId && v.name.toLowerCase() === cleanName.toLowerCase()
    );
    const duplicateInCard = this._cardVariables.some(
      v => v.id !== this._editingId && v.name.toLowerCase() === cleanName.toLowerCase()
    );
    
    if (duplicateInGlobal || duplicateInCard) {
      this._nameError = 'A variable with this name already exists.';
      return;
    }

    // Handle scope change
    if (wasGlobal && !wantsGlobal) {
      // Moving from Global to Card-specific
      // Delete from global
      ucCustomVariablesService.deleteVariable(this._editingId);
      // Add to card
      const newCardVar: CustomVariable = {
        id: this._editingId,
        name: cleanName,
        entity: this._editingEntity,
        value_type: this._editingValueType,
        attribute_name: this._editingValueType === 'attribute' ? this._editingAttributeName : undefined,
        order: this._cardVariables.length,
        isGlobal: false,
        created: globalVar?.created || new Date().toISOString(),
      };
      this._updateCardVariables([...this._cardVariables, newCardVar]);
      this._cancelEdit();
    } else if (!wasGlobal && wantsGlobal) {
      // Moving from Card-specific to Global
      // Check if name conflicts with existing global variable first
      if (ucCustomVariablesService.hasVariable(cleanName)) {
        this._nameError = 'A global variable with this name already exists.';
        return;
      }
      // Check if name conflicts with other card variables (excluding current one being moved)
      const otherCardVars = this._cardVariables.filter(v => v.id !== this._editingId);
      // Remove from card
      this._updateCardVariables(otherCardVars);
      // Add to global - pass remaining card variables for cross-scope check
      const result = ucCustomVariablesService.addVariable(cleanName, this._editingEntity, this._editingValueType, true, 
        this._editingValueType === 'attribute' ? this._editingAttributeName : undefined, otherCardVars);
      if (result) {
        this._cancelEdit();
      } else {
        this._nameError = 'A variable with this name already exists.';
      }
    } else if (wasGlobal && wantsGlobal) {
      // Stays Global - just update (pass card variables for cross-scope name check)
      const success = ucCustomVariablesService.updateVariable(this._editingId, {
        name: cleanName,
        entity: this._editingEntity,
        value_type: this._editingValueType,
        attribute_name: this._editingValueType === 'attribute' ? this._editingAttributeName : undefined,
      }, this._cardVariables);
      if (success) {
        this._cancelEdit();
      } else {
        this._nameError = 'A variable with this name already exists.';
      }
    } else {
      // Stays Card-specific - just update
      // Check if the new name conflicts with global variables
      if (ucCustomVariablesService.hasVariable(cleanName)) {
        this._nameError = 'A global variable with this name already exists.';
        return;
      }
      // Check if name conflicts with other card variables (excluding current one)
      const isDuplicateCard = this._cardVariables.some(
        v => v.id !== this._editingId && v.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (isDuplicateCard) {
        this._nameError = 'A card variable with this name already exists.';
        return;
      }
      const updatedCardVars = this._cardVariables.map(v => 
        v.id === this._editingId 
          ? { 
              ...v, 
              name: cleanName, 
              entity: this._editingEntity, 
              value_type: this._editingValueType,
              attribute_name: this._editingValueType === 'attribute' ? this._editingAttributeName : undefined,
            }
          : v
      );
      this._updateCardVariables(updatedCardVars);
      this._cancelEdit();
    }
  }

  private _deleteVariable(variable: CustomVariable): void {
    const lang = this.hass?.locale?.language || 'en';
    if (confirm(localize('editor.custom_variables.confirm_delete', lang, 'Are you sure you want to delete this variable?'))) {
      if (variable.isGlobal !== false) {
        // Delete global variable
        ucCustomVariablesService.deleteVariable(variable.id);
      } else {
        // Delete card-specific variable
        const updatedCardVars = this._cardVariables.filter(v => v.id !== variable.id);
        this._updateCardVariables(updatedCardVars);
      }
    }
  }

  private _showAddNewForm(): void {
    this._showAddForm = true;
    this._newVariableName = '';
    this._newVariableEntity = '';
    this._newVariableValueType = 'state';
    this._newVariableAttributeName = '';
    this._newVariableIsGlobal = true;
    this._nameError = '';
  }

  private _cancelAdd(): void {
    this._showAddForm = false;
    this._newVariableName = '';
    this._newVariableEntity = '';
    this._newVariableValueType = 'state';
    this._newVariableAttributeName = '';
    this._newVariableIsGlobal = true;
    this._nameError = '';
  }

  private _addNewVariable(): void {
    if (!this._newVariableName.trim() || !this._newVariableEntity) return;

    // Validate name
    if (!ucCustomVariablesService.isValidVariableName(this._newVariableName.trim())) {
      this._nameError = 'Invalid name. Use only letters, numbers, and underscores. Must start with a letter.';
      return;
    }

    if (this._newVariableIsGlobal) {
      // Add global variable - pass card variables to check for cross-scope duplicates
      const result = ucCustomVariablesService.addVariable(
        this._newVariableName.trim(),
        this._newVariableEntity,
        this._newVariableValueType,
        true,
        this._newVariableValueType === 'attribute' ? this._newVariableAttributeName : undefined,
        this._cardVariables
      );

      if (result) {
        this._cancelAdd();
      } else {
        this._nameError = 'A variable with this name already exists.';
      }
    } else {
      // Add card-specific variable
      const newVar = ucCustomVariablesService.createCardVariable(
        this._newVariableName.trim(),
        this._newVariableEntity,
        this._newVariableValueType,
        this._cardVariables,
        this._newVariableValueType === 'attribute' ? this._newVariableAttributeName : undefined
      );

      if (newVar) {
        const updatedCardVars = [...this._cardVariables, newVar];
        this._updateCardVariables(updatedCardVars);
        this._cancelAdd();
      } else {
        this._nameError = 'A variable with this name already exists.';
      }
    }
  }

  private _clearAllVariables(): void {
    const lang = this.hass?.locale?.language || 'en';
    if (confirm(localize('editor.custom_variables.confirm_clear_all', lang, 'Are you sure you want to delete ALL global variables? This cannot be undone.'))) {
      ucCustomVariablesService.clearAll();
    }
  }

  private _clearCardVariables(): void {
    const lang = this.hass?.locale?.language || 'en';
    if (confirm(localize('editor.custom_variables.confirm_clear_card', lang, 'Are you sure you want to delete all card-specific variables?'))) {
      this._updateCardVariables([]);
    }
  }

  private _updateCardVariables(variables: CustomVariable[]): void {
    // Dispatch event to update card config
    this.dispatchEvent(new CustomEvent('card-variables-changed', {
      detail: { variables },
      bubbles: true,
      composed: true
    }));
    // Update local state
    this._cardVariables = variables;
  }

  private _validateNameInput(name: string): void {
    this._nameError = '';
    if (!name) return;
    
    if (!ucCustomVariablesService.isValidVariableName(name)) {
      this._nameError = 'Use only letters, numbers, and underscores. Must start with a letter.';
      return;
    }

    const cleanName = name.trim().toLowerCase();
    
    // When adding a new variable, check both scopes
    if (!this._editingId) {
      if (ucCustomVariablesService.hasVariable(name)) {
        this._nameError = 'A global variable with this name already exists.';
        return;
      }
      if (this._cardVariables.some(v => v.name.toLowerCase() === cleanName)) {
        this._nameError = 'A card variable with this name already exists.';
        return;
      }
    } else {
      // When editing, check both scopes but exclude current variable
      const currentVar = this._globalVariables.find(v => v.id === this._editingId) || 
                         this._cardVariables.find(v => v.id === this._editingId);
      const currentName = currentVar?.name.toLowerCase();
      
      // Only validate if name changed
      if (cleanName !== currentName) {
        if (ucCustomVariablesService.hasVariable(name)) {
          this._nameError = 'A global variable with this name already exists.';
          return;
        }
        if (this._cardVariables.some(v => v.id !== this._editingId && v.name.toLowerCase() === cleanName)) {
          this._nameError = 'A card variable with this name already exists.';
          return;
        }
      }
    }
  }

  private _getResolvedValue(variable: CustomVariable): string {
    if (!this.hass) return 'Loading...';

    const entityState = this.hass.states[variable.entity];

    switch (variable.value_type) {
      case 'entity_id':
        return variable.entity;
      case 'state':
        return entityState ? entityState.state : 'unavailable';
      case 'attribute':
        if (variable.attribute_name && entityState?.attributes) {
          const attrValue = entityState.attributes[variable.attribute_name];
          return attrValue !== undefined ? String(attrValue) : 'undefined';
        }
        return 'no attribute';
      default:
        return variable.entity;
    }
  }

  private _getValueTypeLabel(valueType: string): string {
    const lang = this.hass?.locale?.language || 'en';
    switch (valueType) {
      case 'entity_id':
        return localize('editor.custom_variables.value_type_entity_id', lang, 'Entity ID');
      case 'state':
        return localize('editor.custom_variables.value_type_state', lang, 'State Value');
      case 'attribute':
        return localize('editor.custom_variables.value_type_attribute', lang, 'Attribute');
      default:
        return valueType;
    }
  }

  protected render(): TemplateResult {
    const lang = this.hass?.locale?.language || 'en';
    const hasGlobalVariables = this._globalVariables.length > 0;
    const hasCardVariables = this._cardVariables.length > 0;
    const hasAnyVariables = hasGlobalVariables || hasCardVariables;

    return html`
      <div class="variables-manager">
        <div class="manager-header">
          <h3>${localize('editor.custom_variables.title', lang, 'Custom Variables')}</h3>
          <div class="header-actions">
            <button
              class="add-btn"
              @click=${this._showAddNewForm}
              ?disabled=${this._showAddForm}
              title="${localize('editor.custom_variables.add_variable', lang, 'Add new variable')}"
            >
              <ha-icon icon="mdi:plus"></ha-icon>
              ${localize('editor.custom_variables.add_variable', lang, 'Add Variable')}
            </button>
          </div>
        </div>

        <div class="manager-description">
          <p>
            ${localize(
              'editor.custom_variables.description',
              lang,
              'Create reusable variables that reference entities. Use them in templates with {{ $variable_name }}. Drag and drop to reorder.'
            )}
          </p>
        </div>

        ${this._showAddForm ? this._renderAddForm(lang) : ''}
        
        ${!hasAnyVariables && !this._showAddForm
          ? html`
              <div class="empty-state">
                <ha-icon icon="mdi:variable"></ha-icon>
                <h4>${localize('editor.custom_variables.empty_title', lang, 'No Custom Variables')}</h4>
                <p>
                  ${localize(
                    'editor.custom_variables.empty_description',
                    lang,
                    'Add your first variable to get started. Variables can be used in templates with {{ $variable_name }} syntax.'
                  )}
                </p>
              </div>
            `
          : ''}
        
        <!-- Global Variables Section -->
        ${hasGlobalVariables
          ? html`
              <div class="variables-section">
                <div class="section-header">
                  <div class="section-title">
                    <ha-icon icon="mdi:earth"></ha-icon>
                    <span>${localize('editor.custom_variables.global_variables', lang, 'Global Variables')}</span>
                    <span class="variable-count">(${this._globalVariables.length})</span>
                  </div>
                  <button
                    class="clear-section-btn"
                    @click=${this._clearAllVariables}
                    title="${localize('editor.custom_variables.clear_global', lang, 'Clear global variables')}"
                  >
                    <ha-icon icon="mdi:delete-sweep"></ha-icon>
                  </button>
                </div>
                <div class="variables-list">
                  ${this._globalVariables.map(
                    (variable, index) => this._renderVariableItem(variable, index, true, lang)
                  )}
                </div>
              </div>
            `
          : ''}
        
        <!-- Card-Specific Variables Section -->
        ${hasCardVariables
          ? html`
              <div class="variables-section card-section">
                <div class="section-header">
                  <div class="section-title">
                    <ha-icon icon="mdi:card-text"></ha-icon>
                    <span>${localize('editor.custom_variables.card_variables', lang, 'This Card Only')}</span>
                    <span class="variable-count">(${this._cardVariables.length})</span>
                  </div>
                  <button
                    class="clear-section-btn"
                    @click=${this._clearCardVariables}
                    title="${localize('editor.custom_variables.clear_card', lang, 'Clear card variables')}"
                  >
                    <ha-icon icon="mdi:delete-sweep"></ha-icon>
                  </button>
                </div>
                <div class="variables-list">
                  ${this._cardVariables.map(
                    (variable, index) => this._renderVariableItem(variable, index, false, lang)
                  )}
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _renderVariableItem(variable: CustomVariable, index: number, isGlobal: boolean, lang: string): TemplateResult {
    // If editing, show full edit form
    if (this._editingId === variable.id) {
      return this._renderEditForm(variable, lang);
    }

    return html`
      <div
        class="variable-item ${this._dragOverIndex === index ? 'drag-over' : ''} ${isGlobal ? 'global' : 'card-specific'}"
        draggable="true"
        @dragstart=${(e: DragEvent) => this._handleDragStart(e, variable)}
        @dragover=${(e: DragEvent) => this._handleDragOver(e, index)}
        @dragleave=${this._handleDragLeave}
        @drop=${(e: DragEvent) => this._handleDrop(e, index)}
      >
        <div class="item-header">
          <div class="item-left">
            <div class="drag-handle">
              <ha-icon icon="mdi:drag-vertical"></ha-icon>
            </div>
            <div class="variable-icon ${isGlobal ? 'global' : 'card-specific'}">
              <ha-icon icon="${isGlobal ? 'mdi:earth' : 'mdi:card-text'}"></ha-icon>
            </div>
            <div class="variable-name-col">
              <span class="variable-name">$${variable.name}</span>
              <span class="variable-scope-badge ${isGlobal ? 'global' : 'card-specific'}">
                ${isGlobal 
                  ? localize('editor.custom_variables.global', lang, 'Global') 
                  : localize('editor.custom_variables.this_card', lang, 'This Card')}
              </span>
            </div>
          </div>
          <div class="variable-actions">
            <button
              class="action-btn edit-btn"
              @click=${() => this._startEdit(variable)}
              title="${localize('editor.custom_variables.edit_variable', lang, 'Edit variable')}"
            >
              <ha-icon icon="mdi:pencil"></ha-icon>
            </button>
            <button
              class="action-btn delete-btn"
              @click=${() => this._deleteVariable(variable)}
              title="${localize('editor.custom_variables.delete_variable', lang, 'Delete variable')}"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
          </div>
        </div>
        <div class="item-body">
          <div class="variable-details">
            <span class="variable-entity">${variable.entity}</span>
            <span class="variable-type">${this._getValueTypeLabel(variable.value_type)}</span>
          </div>
          <div class="variable-preview">
            → ${this._getResolvedValue(variable)}
          </div>
        </div>
      </div>
    `;
  }

  private _renderAddForm(lang: string): TemplateResult {
    return html`
      <div class="add-form">
        <h4>${localize('editor.custom_variables.add_new_variable', lang, 'Add New Variable')}</h4>
        
        <div class="form-row">
          <div class="form-field">
            <label>${localize('editor.custom_variables.variable_name', lang, 'Variable Name')}</label>
            <input
              type="text"
              .value=${this._newVariableName}
              @input=${(e: Event) => {
                this._newVariableName = (e.target as HTMLInputElement).value;
                this._validateNameInput(this._newVariableName);
              }}
              placeholder="${localize('editor.custom_variables.variable_name_placeholder', lang, 'my_variable_name')}"
              maxlength="50"
            />
            <div class="field-hint">
              ${localize('editor.custom_variables.variable_usage', lang, 'Use in templates:')} <code>{{ $${this._newVariableName || 'variable_name'} }}</code>
            </div>
            ${this._nameError ? html`<div class="field-error">${this._nameError}</div>` : ''}
          </div>
        </div>

        <div class="form-row">
          <div class="form-field entity-field">
            <label>${localize('editor.custom_variables.select_entity', lang, 'Select Entity')}</label>
            <ha-form
              .hass=${this.hass}
              .data=${{ entity: this._newVariableEntity }}
              .schema=${[{
                name: 'entity',
                selector: { entity: {} }
              }]}
              .computeLabel=${() => ''}
              @value-changed=${(e: CustomEvent) => {
                const val = e.detail.value?.entity;
                if (val !== undefined) {
                  this._newVariableEntity = val || '';
                }
              }}
            ></ha-form>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>${localize('editor.custom_variables.value_type', lang, 'Value Type')}</label>
            <ha-select
              .value=${this._newVariableValueType}
              @selected=${(e: CustomEvent) => {
                this._newVariableValueType = (e.target as any).value;
              }}
              @closed=${(e: Event) => e.stopPropagation()}
            >
              <mwc-list-item value="entity_id">
                ${localize('editor.custom_variables.value_type_entity_id_desc', lang, 'Entity ID (e.g., sensor.temperature)')}
              </mwc-list-item>
              <mwc-list-item value="state">
                ${localize('editor.custom_variables.value_type_state_desc', lang, 'State Value (e.g., 23.5)')}
              </mwc-list-item>
              <mwc-list-item value="attribute">
                ${localize('editor.custom_variables.value_type_attribute_desc', lang, 'Attribute Value (e.g., temperature, friendly_name)')}
              </mwc-list-item>
            </ha-select>
          </div>
        </div>

        ${this._newVariableValueType === 'attribute' ? html`
          <div class="form-row">
            <div class="form-field">
              <label>${localize('editor.custom_variables.attribute_name', lang, 'Attribute Name')}</label>
              <input
                type="text"
                .value=${this._newVariableAttributeName}
                @input=${(e: Event) => {
                  this._newVariableAttributeName = (e.target as HTMLInputElement).value;
                }}
                placeholder="e.g., temperature, friendly_name"
              />
            </div>
          </div>
        ` : ''}

        <!-- Global/Card-Specific Toggle -->
        <div class="form-row">
          <div class="form-field scope-field">
            <label>${localize('editor.custom_variables.variable_scope', lang, 'Variable Scope')}</label>
            <div class="scope-toggle">
              <button
                class="scope-btn ${this._newVariableIsGlobal ? 'active' : ''}"
                @click=${() => { this._newVariableIsGlobal = true; }}
              >
                <ha-icon icon="mdi:earth"></ha-icon>
                <span>${localize('editor.custom_variables.global', lang, 'Global')}</span>
              </button>
              <button
                class="scope-btn ${!this._newVariableIsGlobal ? 'active' : ''}"
                @click=${() => { this._newVariableIsGlobal = false; }}
              >
                <ha-icon icon="mdi:card-text"></ha-icon>
                <span>${localize('editor.custom_variables.this_card', lang, 'This Card')}</span>
              </button>
            </div>
            <div class="field-hint scope-hint">
              ${this._newVariableIsGlobal 
                ? localize('editor.custom_variables.global_hint', lang, 'Available in all Ultra Cards across your dashboard.')
                : localize('editor.custom_variables.card_hint', lang, 'Only available in this specific card.')}
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            class="save-btn"
            @click=${this._addNewVariable}
            ?disabled=${!this._newVariableName.trim() || !this._newVariableEntity || !!this._nameError}
          >
            <ha-icon icon="mdi:check"></ha-icon>
            ${localize('editor.common.add', lang, 'Add')}
          </button>
          <button class="cancel-btn" @click=${this._cancelAdd}>
            <ha-icon icon="mdi:close"></ha-icon>
            ${localize('editor.common.cancel', lang, 'Cancel')}
          </button>
        </div>
      </div>
    `;
  }

  private _renderEditForm(variable: CustomVariable, lang: string): TemplateResult {
    return html`
      <div class="edit-form-container">
        <div class="edit-form-header">
          <h4>${localize('editor.custom_variables.edit_variable', lang, 'Edit Variable')}</h4>
          <div class="edit-form-actions">
            <button
              class="save-btn"
              @click=${this._saveEdit}
              ?disabled=${!this._editingName.trim() || !this._editingEntity || !!this._nameError}
              title="Save"
            >
              <ha-icon icon="mdi:check"></ha-icon>
            </button>
            <button class="cancel-btn" @click=${this._cancelEdit} title="Cancel">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
        </div>
        
        <div class="edit-form-body">
          <div class="edit-field">
            <label>${localize('editor.custom_variables.variable_name', lang, 'Variable Name')}</label>
            <input
              type="text"
              .value=${this._editingName}
              @input=${(e: Event) => {
                this._editingName = (e.target as HTMLInputElement).value;
                this._validateNameInput(this._editingName);
              }}
              placeholder="${localize('editor.custom_variables.variable_name_placeholder', lang, 'my_variable_name')}"
              maxlength="50"
            />
            ${this._nameError ? html`<div class="field-error">${this._nameError}</div>` : ''}
          </div>

          <div class="edit-field">
            <label>${localize('editor.custom_variables.select_entity', lang, 'Select Entity')}</label>
            <ha-form
              .hass=${this.hass}
              .data=${{ entity: this._editingEntity }}
              .schema=${[{
                name: 'entity',
                selector: { entity: {} }
              }]}
              .computeLabel=${() => ''}
              @value-changed=${(e: CustomEvent) => {
                const val = e.detail.value?.entity;
                if (val !== undefined) {
                  this._editingEntity = val || '';
                }
              }}
            ></ha-form>
          </div>

          <div class="edit-field">
            <label>${localize('editor.custom_variables.value_type', lang, 'Value Type')}</label>
            <ha-select
              .value=${this._editingValueType}
              @selected=${(e: CustomEvent) => {
                this._editingValueType = (e.target as any).value;
              }}
              @closed=${(e: Event) => e.stopPropagation()}
            >
              <mwc-list-item value="entity_id">${localize('editor.custom_variables.value_type_entity_id', lang, 'Entity ID')}</mwc-list-item>
              <mwc-list-item value="state">${localize('editor.custom_variables.value_type_state', lang, 'State')}</mwc-list-item>
              <mwc-list-item value="attribute">${localize('editor.custom_variables.value_type_attribute', lang, 'Attribute')}</mwc-list-item>
            </ha-select>
          </div>

          ${this._editingValueType === 'attribute' ? html`
            <div class="edit-field">
              <label>${localize('editor.custom_variables.attribute_name', lang, 'Attribute Name')}</label>
              <input
                type="text"
                .value=${this._editingAttributeName}
                @input=${(e: Event) => {
                  this._editingAttributeName = (e.target as HTMLInputElement).value;
                }}
                placeholder="e.g., temperature, friendly_name"
              />
            </div>
          ` : ''}

          <div class="edit-field">
            <label>${localize('editor.custom_variables.variable_scope', lang, 'Variable Scope')}</label>
            <div class="scope-toggle compact">
              <button
                class="scope-btn ${this._editingIsGlobal ? 'active' : ''}"
                @click=${() => { this._editingIsGlobal = true; }}
              >
                <ha-icon icon="mdi:earth"></ha-icon>
                <span>${localize('editor.custom_variables.global', lang, 'Global')}</span>
              </button>
              <button
                class="scope-btn ${!this._editingIsGlobal ? 'active' : ''}"
                @click=${() => { this._editingIsGlobal = false; }}
              >
                <ha-icon icon="mdi:card-text"></ha-icon>
                <span>${localize('editor.custom_variables.this_card', lang, 'This Card')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .variables-manager {
        width: 100%;
        max-width: 700px;
      }

      .manager-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 12px;
      }

      .manager-header h3 {
        margin: 0;
        color: var(--primary-text-color);
        font-size: 18px;
        font-weight: 500;
      }

      .header-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .add-btn,
      .clear-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .add-btn {
        background: var(--primary-color);
        color: white;
      }

      .add-btn:hover:not(:disabled) {
        background: var(--primary-color-dark, var(--primary-color));
        transform: translateY(-1px);
      }

      .add-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .clear-btn {
        background: var(--error-color);
        color: white;
      }

      .clear-btn:hover {
        background: var(--error-color-dark, var(--error-color));
        transform: translateY(-1px);
      }

      .manager-description {
        margin-bottom: 24px;
        padding: 12px 16px;
        background: var(--card-background-color, #f5f5f5);
        border-radius: 8px;
        border-left: 4px solid var(--primary-color);
      }

      .manager-description p {
        margin: 0;
        color: var(--secondary-text-color);
        font-size: 14px;
        line-height: 1.4;
      }

      /* Variables Sections */
      .variables-section {
        margin-bottom: 20px;
      }

      .variables-section.card-section {
        border-left: 3px solid var(--warning-color, #ff9800);
        padding-left: 12px;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 8px 12px;
        background: var(--secondary-background-color, #f0f0f0);
        border-radius: 6px;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .section-title ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
      }

      .variable-count {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-weight: normal;
      }

      .clear-section-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background: transparent;
        color: var(--error-color);
        transition: all 0.2s ease;
      }

      .clear-section-btn:hover {
        background: rgba(var(--error-color-rgb, 244, 67, 54), 0.1);
      }

      .clear-section-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Scope Toggle */
      .scope-field {
        margin-top: 8px;
      }

      .scope-toggle {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .scope-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        border: 2px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
      }

      .scope-btn:hover {
        border-color: var(--primary-color);
      }

      .scope-btn.active {
        border-color: var(--primary-color);
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
        color: var(--primary-color);
      }

      .scope-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      .scope-hint {
        margin-top: 8px;
        padding: 8px 12px;
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.05);
        border-radius: 4px;
        font-style: italic;
      }

      /* Variable Scope Badge */
      .variable-name-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 2px;
      }

      .variable-scope-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: 600;
      }

      .variable-scope-badge.global {
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.15);
        color: var(--primary-color);
      }

      .variable-scope-badge.card-specific {
        background: rgba(var(--warning-color-rgb, 255, 152, 0), 0.15);
        color: var(--warning-color, #ff9800);
      }

      /* Variable Icon based on scope */
      .variable-icon.global {
        background: var(--primary-color);
      }

      .variable-icon.card-specific {
        background: var(--warning-color, #ff9800);
      }

      .add-form {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 24px;
      }

      .add-form h4 {
        margin: 0 0 16px 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 500;
      }

      .form-row {
        margin-bottom: 16px;
      }

      .form-field {
        min-width: 200px;
      }

      .form-field label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .form-field input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }

      .form-field input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 33, 150, 243), 0.2);
      }

      .form-field ha-form {
        display: block;
        width: 100%;
        --mdc-theme-primary: var(--primary-color);
      }

      .entity-field ha-form {
        margin-top: 4px;
      }

      .form-field ha-select {
        width: 100%;
        --mdc-theme-primary: var(--primary-color);
      }

      .field-hint {
        margin-top: 6px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .field-hint code {
        background: var(--secondary-background-color);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: var(--code-font-family, monospace);
        font-size: 11px;
      }

      .field-error {
        margin-top: 6px;
        font-size: 12px;
        color: var(--error-color);
      }

      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 16px;
      }

      .save-btn,
      .cancel-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .save-btn {
        background: var(--success-color, #4caf50);
        color: white;
      }

      .save-btn:hover:not(:disabled) {
        background: var(--success-color-dark, #45a049);
      }

      .save-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .cancel-btn {
        background: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
      }

      .cancel-btn:hover {
        background: var(--primary-background-color);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--secondary-text-color);
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-state h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 500;
      }

      .empty-state p {
        margin: 0;
        font-size: 14px;
        line-height: 1.4;
      }

      .variables-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* Variable Item - Preview Mode */
      .variable-item {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        transition: all 0.2s ease;
        padding: 12px;
      }

      .variable-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .variable-item.drag-over {
        border-color: var(--primary-color);
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.05);
      }

      .item-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }

      .item-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex: 1;
      }

      .drag-handle {
        color: var(--secondary-text-color);
        cursor: grab;
        flex-shrink: 0;
      }

      .drag-handle:active {
        cursor: grabbing;
      }

      .drag-handle ha-icon {
        --mdc-icon-size: 18px;
      }

      .variable-icon {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .variable-icon ha-icon {
        --mdc-icon-size: 18px;
      }

      .variable-name-col {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .variable-name {
        font-weight: 600;
        color: var(--primary-color);
        font-family: var(--code-font-family, monospace);
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .variable-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: transparent;
      }

      .action-btn.edit-btn {
        color: var(--primary-color);
      }

      .action-btn.edit-btn:hover {
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.15);
      }

      .action-btn.delete-btn {
        color: var(--error-color);
      }

      .action-btn.delete-btn:hover {
        background: rgba(var(--error-color-rgb, 244, 67, 54), 0.15);
      }

      .action-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .item-body {
        padding-left: 60px; /* align with content after drag handle + icon */
      }

      .variable-details {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }

      .variable-entity {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-family: var(--code-font-family, monospace);
        word-break: break-all;
      }

      .variable-type {
        font-size: 11px;
        color: var(--primary-color);
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
        padding: 1px 6px;
        border-radius: 4px;
        white-space: nowrap;
      }

      .variable-preview {
        font-size: 12px;
        color: var(--success-color, #4caf50);
        font-family: var(--code-font-family, monospace);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Edit Form Container */
      .edit-form-container {
        background: var(--card-background-color, white);
        border: 2px solid var(--primary-color);
        border-radius: 8px;
        overflow: hidden;
      }

      .edit-form-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
        border-bottom: 1px solid var(--divider-color);
      }

      .edit-form-header h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
      }

      .edit-form-actions {
        display: flex;
        gap: 8px;
      }

      .edit-form-actions .save-btn,
      .edit-form-actions .cancel-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .edit-form-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .edit-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .edit-field label {
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .edit-field input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }

      .edit-field input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 33, 150, 243), 0.2);
      }

      .edit-field ha-form {
        display: block;
        width: 100%;
      }

      .edit-field ha-select {
        width: 100%;
      }

      .scope-toggle.compact {
        margin-top: 0;
      }

      .scope-toggle.compact .scope-btn {
        padding: 8px 12px;
        font-size: 13px;
      }

      .scope-toggle.compact .scope-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      /* Legacy edit form styles - kept for compatibility */
      .edit-form {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .edit-fields {
        flex: 1;
      }

      .edit-field-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .edit-field-row input {
        flex: 1;
        min-width: 100px;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .edit-field-row input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .edit-field-row ha-form {
        flex: 1;
        min-width: 150px;
      }

      .edit-field-row ha-select {
        min-width: 120px;
      }

      .edit-actions {
        display: flex;
        gap: 4px;
      }

      .edit-actions .save-btn,
      .edit-actions .cancel-btn {
        padding: 6px;
        min-width: auto;
      }

      .edit-actions .save-btn ha-icon,
      .edit-actions .cancel-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      @media (max-width: 768px) {
        .manager-header {
          flex-direction: column;
          align-items: stretch;
        }

        .header-actions {
          justify-content: center;
        }

        .variable-item {
          flex-wrap: wrap;
          gap: 8px;
        }

        .edit-form {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        .edit-field-row {
          flex-direction: column;
        }

        .edit-field-row input,
        .edit-field-row ha-form,
        .edit-field-row ha-select {
          min-width: auto;
          width: 100%;
        }

        .edit-actions {
          justify-content: center;
        }
      }
    `;
  }
}

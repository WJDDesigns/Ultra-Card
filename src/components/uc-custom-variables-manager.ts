import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ucCustomVariablesService } from '../services/uc-custom-variables-service';
import { CustomVariable } from '../types';
import { localize } from '../localize/localize';

@customElement('uc-custom-variables-manager')
export class UcCustomVariablesManager extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _customVariables: CustomVariable[] = [];
  @state() private _draggedItem?: CustomVariable;
  @state() private _dragOverIndex?: number;
  @state() private _editingId?: string;
  @state() private _editingName = '';
  @state() private _editingEntity = '';
  @state() private _editingValueType: 'entity_id' | 'state' | 'full_object' = 'state';
  @state() private _showAddForm = false;
  @state() private _newVariableName = '';
  @state() private _newVariableEntity = '';
  @state() private _newVariableValueType: 'entity_id' | 'state' | 'full_object' = 'state';
  @state() private _nameError = '';

  private _variablesUnsubscribe?: () => void;

  connectedCallback(): void {
    super.connectedCallback();

    // Subscribe to custom variables changes
    this._variablesUnsubscribe = ucCustomVariablesService.subscribe(variables => {
      this._customVariables = variables;
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

    const currentIndex = this._customVariables.findIndex(v => v.id === this._draggedItem!.id);
    if (currentIndex === -1 || currentIndex === targetIndex) return;

    // Create new order based on drag and drop
    const reorderedVariables = [...this._customVariables];
    const [draggedItem] = reorderedVariables.splice(currentIndex, 1);
    reorderedVariables.splice(targetIndex, 0, draggedItem);

    // Update service with new order
    const orderedIds = reorderedVariables.map(v => v.id);
    ucCustomVariablesService.reorderVariables(orderedIds);

    this._draggedItem = undefined;
  }

  private _startEdit(variable: CustomVariable): void {
    this._editingId = variable.id;
    this._editingName = variable.name;
    this._editingEntity = variable.entity;
    this._editingValueType = variable.value_type;
    this._nameError = '';
  }

  private _cancelEdit(): void {
    this._editingId = undefined;
    this._editingName = '';
    this._editingEntity = '';
    this._editingValueType = 'state';
    this._nameError = '';
  }

  private _saveEdit(): void {
    if (!this._editingId || !this._editingName.trim() || !this._editingEntity) return;

    // Validate name
    if (!ucCustomVariablesService.isValidVariableName(this._editingName.trim())) {
      this._nameError = 'Invalid name. Use only letters, numbers, and underscores. Must start with a letter.';
      return;
    }

    const success = ucCustomVariablesService.updateVariable(this._editingId, {
      name: this._editingName.trim(),
      entity: this._editingEntity,
      value_type: this._editingValueType,
    });

    if (success) {
      this._cancelEdit();
    } else {
      this._nameError = 'A variable with this name already exists.';
    }
  }

  private _deleteVariable(id: string): void {
    const lang = this.hass?.locale?.language || 'en';
    if (confirm(localize('editor.custom_variables.confirm_delete', lang, 'Are you sure you want to delete this variable?'))) {
      ucCustomVariablesService.deleteVariable(id);
    }
  }

  private _showAddNewForm(): void {
    this._showAddForm = true;
    this._newVariableName = '';
    this._newVariableEntity = '';
    this._newVariableValueType = 'state';
    this._nameError = '';
  }

  private _cancelAdd(): void {
    this._showAddForm = false;
    this._newVariableName = '';
    this._newVariableEntity = '';
    this._newVariableValueType = 'state';
    this._nameError = '';
  }

  private _addNewVariable(): void {
    if (!this._newVariableName.trim() || !this._newVariableEntity) return;

    // Validate name
    if (!ucCustomVariablesService.isValidVariableName(this._newVariableName.trim())) {
      this._nameError = 'Invalid name. Use only letters, numbers, and underscores. Must start with a letter.';
      return;
    }

    const result = ucCustomVariablesService.addVariable(
      this._newVariableName.trim(),
      this._newVariableEntity,
      this._newVariableValueType
    );

    if (result) {
      this._cancelAdd();
    } else {
      this._nameError = 'A variable with this name already exists.';
    }
  }

  private _clearAllVariables(): void {
    const lang = this.hass?.locale?.language || 'en';
    if (confirm(localize('editor.custom_variables.confirm_clear_all', lang, 'Are you sure you want to delete ALL variables? This cannot be undone.'))) {
      ucCustomVariablesService.clearAll();
    }
  }

  private _validateNameInput(name: string): void {
    this._nameError = '';
    if (name && !ucCustomVariablesService.isValidVariableName(name)) {
      this._nameError = 'Use only letters, numbers, and underscores. Must start with a letter.';
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
      case 'full_object':
        return entityState ? `{state: "${entityState.state}", ...}` : '{unavailable}';
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
      case 'full_object':
        return localize('editor.custom_variables.value_type_full_object', lang, 'Full Object');
      default:
        return valueType;
    }
  }

  protected render(): TemplateResult {
    const lang = this.hass?.locale?.language || 'en';

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
            ${this._customVariables.length > 0
              ? html`
                  <button
                    class="clear-btn"
                    @click=${this._clearAllVariables}
                    title="${localize('editor.custom_variables.clear_all', lang, 'Clear all variables')}"
                  >
                    <ha-icon icon="mdi:delete-sweep"></ha-icon>
                    ${localize('editor.custom_variables.clear_all', lang, 'Clear All')}
                  </button>
                `
              : ''}
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
        ${this._customVariables.length === 0 && !this._showAddForm
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
        ${this._customVariables.length > 0
          ? html`
              <div class="variables-list">
                ${this._customVariables.map(
                  (variable, index) => html`
                    <div
                      class="variable-item ${this._dragOverIndex === index ? 'drag-over' : ''}"
                      draggable="true"
                      @dragstart=${(e: DragEvent) => this._handleDragStart(e, variable)}
                      @dragover=${(e: DragEvent) => this._handleDragOver(e, index)}
                      @dragleave=${this._handleDragLeave}
                      @drop=${(e: DragEvent) => this._handleDrop(e, index)}
                    >
                      <div class="drag-handle">
                        <ha-icon icon="mdi:drag-vertical"></ha-icon>
                      </div>

                      <div class="variable-icon">
                        <ha-icon icon="mdi:variable"></ha-icon>
                      </div>

                      ${this._editingId === variable.id
                        ? this._renderEditForm(variable, lang)
                        : html`
                            <div class="variable-info">
                              <div class="variable-name">$${variable.name}</div>
                              <div class="variable-details">
                                <span class="variable-entity">${variable.entity}</span>
                                <span class="variable-type">${this._getValueTypeLabel(variable.value_type)}</span>
                              </div>
                              <div class="variable-preview">
                                → ${this._getResolvedValue(variable)}
                              </div>
                            </div>

                            <div class="variable-actions">
                              <button
                                class="edit-btn"
                                @click=${() => this._startEdit(variable)}
                                title="${localize('editor.custom_variables.edit_variable', lang, 'Edit variable')}"
                              >
                                <ha-icon icon="mdi:pencil"></ha-icon>
                              </button>
                              <button
                                class="delete-btn"
                                @click=${() => this._deleteVariable(variable.id)}
                                title="${localize('editor.custom_variables.delete_variable', lang, 'Delete variable')}"
                              >
                                <ha-icon icon="mdi:delete"></ha-icon>
                              </button>
                            </div>
                          `}
                    </div>
                  `
                )}
              </div>
            `
          : ''}
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
              <mwc-list-item value="full_object">
                ${localize('editor.custom_variables.value_type_full_object_desc', lang, 'Full Entity Object (JSON)')}
              </mwc-list-item>
            </ha-select>
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
      <div class="edit-form">
        <div class="edit-fields">
          <div class="edit-field-row">
            <input
              type="text"
              .value=${this._editingName}
              @input=${(e: Event) => {
                this._editingName = (e.target as HTMLInputElement).value;
                this._validateNameInput(this._editingName);
              }}
              placeholder="${localize('editor.custom_variables.variable_name', lang, 'Variable name')}"
              maxlength="50"
            />
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
            <ha-select
              .value=${this._editingValueType}
              @selected=${(e: CustomEvent) => {
                this._editingValueType = (e.target as any).value;
              }}
              @closed=${(e: Event) => e.stopPropagation()}
            >
              <mwc-list-item value="entity_id">${localize('editor.custom_variables.value_type_entity_id', lang, 'Entity ID')}</mwc-list-item>
              <mwc-list-item value="state">${localize('editor.custom_variables.value_type_state', lang, 'State')}</mwc-list-item>
              <mwc-list-item value="full_object">${localize('editor.custom_variables.value_type_full_object', lang, 'Full Object')}</mwc-list-item>
            </ha-select>
          </div>
          ${this._nameError ? html`<div class="field-error">${this._nameError}</div>` : ''}
        </div>
        <div class="edit-actions">
          <button
            class="save-btn"
            @click=${this._saveEdit}
            ?disabled=${!this._editingName.trim() || !this._editingEntity || !!this._nameError}
          >
            <ha-icon icon="mdi:check"></ha-icon>
          </button>
          <button class="cancel-btn" @click=${this._cancelEdit}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
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

      .variable-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        transition: all 0.2s ease;
        cursor: move;
      }

      .variable-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .variable-item.drag-over {
        border-color: var(--primary-color);
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.05);
      }

      .drag-handle {
        color: var(--secondary-text-color);
        cursor: grab;
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

      .variable-info {
        flex: 1;
        min-width: 0;
      }

      .variable-name {
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: 2px;
        font-family: var(--code-font-family, monospace);
        font-size: 14px;
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
      }

      .variable-type {
        font-size: 11px;
        color: var(--primary-color);
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
        padding: 1px 6px;
        border-radius: 4px;
      }

      .variable-preview {
        font-size: 12px;
        color: var(--success-color, #4caf50);
        font-family: var(--code-font-family, monospace);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .variable-actions {
        display: flex;
        gap: 4px;
      }

      .edit-btn,
      .delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: transparent;
      }

      .edit-btn {
        color: var(--primary-color);
      }

      .edit-btn:hover {
        background: rgba(var(--primary-color-rgb, 33, 150, 243), 0.1);
      }

      .delete-btn {
        color: var(--error-color);
      }

      .delete-btn:hover {
        background: rgba(var(--error-color-rgb, 244, 67, 54), 0.1);
      }

      .edit-btn ha-icon,
      .delete-btn ha-icon {
        --mdc-icon-size: 16px;
      }

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

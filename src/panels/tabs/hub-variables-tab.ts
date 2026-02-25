import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CustomVariable } from '../../types';
import { ucCustomVariablesService } from '../../services/uc-custom-variables-service';
import { panelStyles } from '../panel-styles';
import type { HomeAssistant } from 'custom-card-helpers';

@customElement('hub-variables-tab')
export class HubVariablesTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _variables: CustomVariable[] = [];
  @state() private _toastMsg = '';
  @state() private _search = '';
  @state() private _showAddForm = false;
  @state() private _newName = '';
  @state() private _newEntity = '';
  @state() private _newValueType: 'entity_id' | 'state' | 'attribute' = 'state';
  @state() private _newAttribute = '';
  @state() private _editingId: string | null = null;
  @state() private _editName = '';
  @state() private _editEntity = '';
  @state() private _editValueType: 'entity_id' | 'state' | 'attribute' = 'state';
  @state() private _editAttribute = '';
  private _unsub?: () => void;
  private _toastTimer?: ReturnType<typeof setTimeout>;

  static styles = [
    panelStyles,
    css`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      /* Header */
      .vars-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      .vars-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .vars-count {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-weight: 500;
        white-space: nowrap;
      }

      .vars-count strong {
        color: var(--primary-text-color);
      }

      .search-box {
        flex: 1;
        min-width: 150px;
        max-width: 280px;
        position: relative;
      }

      .search-box input {
        width: 100%;
        padding: 8px 14px 8px 36px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 10px;
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--primary-text-color);
        font-size: 13px;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .search-box input:focus {
        border-color: var(--primary-color);
      }

      .search-box ha-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }

      .add-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .add-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
      }

      .add-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Add form */
      .add-form {
        background: var(--ha-card-background, var(--card-background-color));
        border: 2px solid var(--primary-color);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        animation: fadeSlideIn 0.2s ease-out;
      }

      .add-form h3 {
        margin: 0 0 20px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .add-form h3 ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .form-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .form-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
        min-width: 80px;
      }

      .form-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .form-input:focus {
        border-color: var(--primary-color);
      }

      .form-select {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
      }

      .form-hint {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-top: -6px;
        margin-bottom: 12px;
        padding-left: 92px;
      }

      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 20px;
      }

      .form-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
      }

      .form-btn.primary {
        background: var(--primary-color);
        color: white;
      }

      .form-btn.primary:hover:not(:disabled) {
        filter: brightness(1.1);
      }

      .form-btn.primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .form-btn.secondary {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      }

      .form-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      /* Variables list */
      .vars-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 16px;
      }

      @media (max-width: 600px) {
        .vars-grid {
          grid-template-columns: 1fr;
        }
      }

      .var-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      }

      .var-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        border-color: var(--primary-color);
      }

      .var-card.editing {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
      }

      .var-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
      }

      .var-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .var-icon-wrap.entity_id {
        background: linear-gradient(135deg, #2196f3, #42a5f5);
      }

      .var-icon-wrap.state {
        background: linear-gradient(135deg, #4caf50, #66bb6a);
      }

      .var-icon-wrap.attribute {
        background: linear-gradient(135deg, #ff9800, #ffb74d);
      }

      .var-icon-wrap ha-icon {
        --mdc-icon-size: 22px;
        color: white;
      }

      .var-title-area {
        flex: 1;
        min-width: 0;
      }

      .var-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .var-name-prefix {
        color: var(--primary-color);
        font-family: 'SF Mono', 'Fira Code', monospace;
      }

      .var-name-text {
        font-family: 'SF Mono', 'Fira Code', monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .var-subtitle {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .var-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      /* Details section */
      .var-details {
        padding: 0 16px 14px;
      }

      .detail-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.04));
        font-size: 13px;
      }

      .detail-row:last-child {
        border-bottom: none;
      }

      .detail-label {
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .detail-value {
        color: var(--primary-text-color);
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 200px;
        text-align: right;
      }

      .type-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .type-badge.entity_id {
        background: rgba(33, 150, 243, 0.1);
        color: #2196f3;
      }

      .type-badge.state {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }

      .type-badge.attribute {
        background: rgba(255, 152, 0, 0.1);
        color: #ff9800;
      }

      /* Resolved value display */
      .resolved-value {
        padding: 10px 16px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.03);
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.04));
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
      }

      .resolved-label {
        color: var(--secondary-text-color);
        font-weight: 500;
        white-space: nowrap;
      }

      .resolved-text {
        flex: 1;
        font-family: 'SF Mono', 'Fira Code', monospace;
        color: var(--primary-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Copy var name button */
      .copy-var-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        background: none;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 6px;
        color: var(--secondary-text-color);
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'SF Mono', 'Fira Code', monospace;
      }

      .copy-var-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
      }

      .copy-var-btn ha-icon {
        --mdc-icon-size: 12px;
      }

      /* Edit inline */
      .edit-section {
        padding: 14px 16px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.02);
      }

      .edit-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }

      .edit-row:last-child {
        margin-bottom: 0;
      }

      .edit-input {
        flex: 1;
        padding: 6px 10px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 6px;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        outline: none;
        box-sizing: border-box;
      }

      .edit-input:focus {
        border-color: var(--primary-color);
      }

      .edit-select {
        padding: 6px 10px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 6px;
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        outline: none;
      }

      .edit-label {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-weight: 500;
        min-width: 60px;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._variables = ucCustomVariablesService.getVariables();
    this._unsub = ucCustomVariablesService.subscribe(list => {
      this._variables = list;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
    if (this._toastTimer) clearTimeout(this._toastTimer);
  }

  private _showToast(msg: string): void {
    this._toastMsg = msg;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => (this._toastMsg = ''), 2000);
  }

  private _copyVarRef(name: string): void {
    try {
      navigator.clipboard.writeText(`$${name}`);
      this._showToast(`Copied $${name}`);
    } catch {
      /* ignore */
    }
  }

  private _addVariable(): void {
    const name = this._newName.trim();
    const entity = this._newEntity.trim();
    if (!name || !entity) return;

    const result = ucCustomVariablesService.addVariable(
      name,
      entity,
      this._newValueType,
      true,
      this._newValueType === 'attribute' ? this._newAttribute : undefined
    );

    if (result) {
      this._newName = '';
      this._newEntity = '';
      this._newValueType = 'state';
      this._newAttribute = '';
      this._showAddForm = false;
      this._showToast(`Added variable $${result.name}`);
    } else {
      this._showToast('Could not add variable (name may already exist)');
    }
  }

  private _deleteVariable(v: CustomVariable): void {
    ucCustomVariablesService.deleteVariable(v.id);
    this._showToast(`Deleted $${v.name}`);
  }

  private _startEdit(v: CustomVariable): void {
    this._editingId = v.id;
    this._editName = v.name;
    this._editEntity = v.entity;
    this._editValueType = v.value_type;
    this._editAttribute = v.attribute_name || '';
  }

  private _saveEdit(): void {
    if (!this._editingId) return;
    const ok = ucCustomVariablesService.updateVariable(this._editingId, {
      name: this._editName,
      entity: this._editEntity,
      value_type: this._editValueType,
      attribute_name: this._editValueType === 'attribute' ? this._editAttribute : undefined,
    });
    if (ok) {
      this._editingId = null;
      this._showToast('Variable updated');
    } else {
      this._showToast('Could not update (name conflict?)');
    }
  }

  private _cancelEdit(): void {
    this._editingId = null;
  }

  private _getResolvedValue(v: CustomVariable): string {
    if (!this.hass) return '—';
    const resolved = ucCustomVariablesService.resolveVariable(v.name, this.hass);
    return resolved || '—';
  }

  private _getCurrentState(v: CustomVariable): string {
    if (!this.hass?.states) return '—';
    const state = this.hass.states[v.entity];
    if (!state) return 'unavailable';
    if (v.value_type === 'attribute' && v.attribute_name) {
      const attr = state.attributes[v.attribute_name];
      return attr != null ? String(attr) : '—';
    }
    return state.state;
  }

  private _getTypeIcon(type: string): string {
    switch (type) {
      case 'entity_id': return 'mdi:identifier';
      case 'state': return 'mdi:state-machine';
      case 'attribute': return 'mdi:code-braces';
      default: return 'mdi:variable';
    }
  }

  private _getFilteredVariables(): CustomVariable[] {
    if (!this._search.trim()) return this._variables;
    const q = this._search.toLowerCase().trim();
    return this._variables.filter(
      v =>
        v.name.toLowerCase().includes(q) ||
        v.entity.toLowerCase().includes(q) ||
        (v.attribute_name || '').toLowerCase().includes(q)
    );
  }

  render() {
    if (this._variables.length === 0 && !this._showAddForm) {
      return html`
        <div class="hub-tab-blurb">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <p><strong>Variables</strong> let you reference entities by name (e.g. <code>$living_room_temp</code>) in templates and module fields. These are global and shared across all cards; card-specific variables are in each card’s Card Settings tab.</p>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">
            <ha-icon icon="mdi:variable"></ha-icon>
          </div>
          <h3>No Variables</h3>
          <p>Create variables to use entity references like <code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-size: 13px;">$my_sensor</code> across all your Ultra Cards.</p>
          <p class="empty-hint">Variables let you change one entity and update all cards at once</p>
          <button class="add-btn" style="margin-top: 16px;" @click=${() => (this._showAddForm = true)}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Variable
          </button>
        </div>
      `;
    }

    const filtered = this._getFilteredVariables();

    return html`
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Variables</strong> let you reference entities by name (e.g. <code>$living_room_temp</code>) in templates and module fields. These are global and shared across all cards; card-specific variables are in each card’s Card Settings tab.</p>
      </div>

      <!-- Header -->
      <div class="vars-header">
        <div class="vars-header-left">
          <span class="vars-count">
            <strong>${filtered.length}</strong> global variable${filtered.length !== 1 ? 's' : ''}
          </span>
          ${this._variables.length > 3
            ? html`
                <div class="search-box">
                  <ha-icon icon="mdi:magnify"></ha-icon>
                  <input
                    type="text"
                    placeholder="Search variables…"
                    .value=${this._search}
                    @input=${(e: InputEvent) => (this._search = (e.target as HTMLInputElement).value)}
                  />
                </div>
              `
            : ''}
        </div>
        <button class="add-btn" @click=${() => (this._showAddForm = !this._showAddForm)}>
          <ha-icon icon=${this._showAddForm ? 'mdi:close' : 'mdi:plus'}></ha-icon>
          ${this._showAddForm ? 'Cancel' : 'Add Variable'}
        </button>
      </div>

      <!-- Add form -->
      ${this._showAddForm ? this._renderAddForm() : nothing}

      <!-- Variables grid -->
      ${filtered.length === 0 && this._search
        ? html`
            <div class="empty-state">
              <div class="empty-state-icon"><ha-icon icon="mdi:magnify-close"></ha-icon></div>
              <h3>No Results</h3>
              <p>No variables match "${this._search}"</p>
            </div>
          `
        : html`
            <div class="vars-grid">
              ${filtered.map(v => this._renderVariableCard(v))}
            </div>
          `}

      <div class="toast ${this._toastMsg ? 'show' : ''}">${this._toastMsg}</div>
    `;
  }

  private _renderAddForm() {
    const nameValid = !this._newName.trim() || ucCustomVariablesService.isValidVariableName(this._newName.trim());
    const nameExists = this._newName.trim() && ucCustomVariablesService.hasVariable(this._newName.trim());
    const canAdd = this._newName.trim() && this._newEntity.trim() && nameValid && !nameExists;

    return html`
      <div class="add-form">
        <h3><ha-icon icon="mdi:variable-box"></ha-icon> Add Global Variable</h3>

        <div class="form-row">
          <span class="form-label">Name</span>
          <input
            type="text"
            class="form-input"
            placeholder="e.g. living_room_temp"
            .value=${this._newName}
            @input=${(e: InputEvent) => (this._newName = (e.target as HTMLInputElement).value)}
          />
        </div>
        <div class="form-hint">
          Use in cards as <strong>$${this._newName || 'name'}</strong>. Letters, numbers, underscores only.
        </div>

        <div class="form-row">
          <span class="form-label">Entity</span>
          <input
            type="text"
            class="form-input"
            placeholder="e.g. sensor.living_room_temperature"
            .value=${this._newEntity}
            @input=${(e: InputEvent) => (this._newEntity = (e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="form-row">
          <span class="form-label">Value Type</span>
          <select
            class="form-select"
            .value=${this._newValueType}
            @change=${(e: Event) => (this._newValueType = (e.target as HTMLSelectElement).value as any)}
          >
            <option value="state">State — returns states('entity')</option>
            <option value="entity_id">Entity ID — returns the entity ID directly</option>
            <option value="attribute">Attribute — returns a specific attribute</option>
          </select>
        </div>

        ${this._newValueType === 'attribute'
          ? html`
              <div class="form-row">
                <span class="form-label">Attribute</span>
                <input
                  type="text"
                  class="form-input"
                  placeholder="e.g. temperature, friendly_name"
                  .value=${this._newAttribute}
                  @input=${(e: InputEvent) => (this._newAttribute = (e.target as HTMLInputElement).value)}
                />
              </div>
            `
          : nothing}

        ${nameExists
          ? html`
              <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(244,67,54,0.08);border:1px solid rgba(244,67,54,0.2);border-radius:8px;margin-bottom:12px;font-size:12px;color:#f44336;">
                <ha-icon icon="mdi:alert-circle" style="--mdc-icon-size:16px;flex-shrink:0"></ha-icon>
                A variable named "$${this._newName}" already exists.
              </div>
            `
          : nothing}

        <div class="form-actions">
          <button class="form-btn secondary" @click=${() => (this._showAddForm = false)}>Cancel</button>
          <button class="form-btn primary" ?disabled=${!canAdd} @click=${this._addVariable}>
            <ha-icon icon="mdi:check"></ha-icon>
            Add Variable
          </button>
        </div>
      </div>
    `;
  }

  private _renderVariableCard(v: CustomVariable) {
    const isEditing = this._editingId === v.id;
    const currentState = this._getCurrentState(v);

    return html`
      <div class="var-card ${isEditing ? 'editing' : ''}">
        <div class="var-header">
          <div class="var-icon-wrap ${v.value_type}">
            <ha-icon icon=${this._getTypeIcon(v.value_type)}></ha-icon>
          </div>
          <div class="var-title-area">
            <h4 class="var-name">
              <span class="var-name-prefix">$</span><span class="var-name-text">${v.name}</span>
            </h4>
            <p class="var-subtitle">${v.entity}</p>
          </div>
          <div class="var-actions">
            <button class="copy-var-btn" title="Copy reference" @click=${() => this._copyVarRef(v.name)}>
              <ha-icon icon="mdi:content-copy"></ha-icon>
              $${v.name}
            </button>
            ${!isEditing
              ? html`
                  <button class="action-btn" title="Edit" @click=${() => this._startEdit(v)}>
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button class="action-btn delete" title="Delete" @click=${() => this._deleteVariable(v)}>
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </button>
                `
              : nothing}
          </div>
        </div>

        ${isEditing
          ? html`
              <div class="edit-section">
                <div class="edit-row">
                  <span class="edit-label">Name</span>
                  <input
                    type="text"
                    class="edit-input"
                    .value=${this._editName}
                    @input=${(e: InputEvent) => (this._editName = (e.target as HTMLInputElement).value)}
                  />
                </div>
                <div class="edit-row">
                  <span class="edit-label">Entity</span>
                  <input
                    type="text"
                    class="edit-input"
                    .value=${this._editEntity}
                    @input=${(e: InputEvent) => (this._editEntity = (e.target as HTMLInputElement).value)}
                  />
                </div>
                <div class="edit-row">
                  <span class="edit-label">Type</span>
                  <select
                    class="edit-select"
                    .value=${this._editValueType}
                    @change=${(e: Event) => (this._editValueType = (e.target as HTMLSelectElement).value as any)}
                  >
                    <option value="state">State</option>
                    <option value="entity_id">Entity ID</option>
                    <option value="attribute">Attribute</option>
                  </select>
                </div>
                ${this._editValueType === 'attribute'
                  ? html`
                      <div class="edit-row">
                        <span class="edit-label">Attribute</span>
                        <input
                          type="text"
                          class="edit-input"
                          .value=${this._editAttribute}
                          @input=${(e: InputEvent) => (this._editAttribute = (e.target as HTMLInputElement).value)}
                        />
                      </div>
                    `
                  : nothing}
                <div class="edit-row" style="justify-content: flex-end; gap: 6px; margin-top: 4px;">
                  <button class="action-btn" title="Save" @click=${this._saveEdit}>
                    <ha-icon icon="mdi:check"></ha-icon>
                  </button>
                  <button class="action-btn" title="Cancel" @click=${this._cancelEdit}>
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                </div>
              </div>
            `
          : html`
              <div class="var-details">
                <div class="detail-row">
                  <span class="detail-label">Type</span>
                  <span class="type-badge ${v.value_type}">${v.value_type.replace('_', ' ')}</span>
                </div>
                ${v.value_type === 'attribute' && v.attribute_name
                  ? html`
                      <div class="detail-row">
                        <span class="detail-label">Attribute</span>
                        <span class="detail-value">${v.attribute_name}</span>
                      </div>
                    `
                  : nothing}
                <div class="detail-row">
                  <span class="detail-label">Current</span>
                  <span class="detail-value" title="${currentState}">${currentState}</span>
                </div>
              </div>

              <div class="resolved-value">
                <span class="resolved-label">Resolves to:</span>
                <span class="resolved-text">${this._getResolvedValue(v)}</span>
              </div>
            `}
      </div>
    `;
  }
}

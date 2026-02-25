import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { FavoriteColor } from '../../types';
import { ucFavoriteColorsService } from '../../services/uc-favorite-colors-service';
import { panelStyles } from '../panel-styles';

@customElement('hub-colors-tab')
export class HubColorsTab extends LitElement {
  @state() private _colors: FavoriteColor[] = [];
  @state() private _toastMsg = '';
  @state() private _showAddForm = false;
  @state() private _newColorName = '';
  @state() private _newColorValue = '#3498db';
  @state() private _editingId: string | null = null;
  @state() private _editName = '';
  @state() private _editColor = '';
  private _unsub?: () => void;
  private _toastTimer?: ReturnType<typeof setTimeout>;

  static styles = [
    panelStyles,
    css`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      .colors-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .colors-count {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .colors-count strong {
        color: var(--primary-text-color);
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
      }

      .add-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
      }

      .add-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Add color form */
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
        gap: 16px;
        margin-bottom: 16px;
      }

      .form-row:last-of-type {
        margin-bottom: 20px;
      }

      .form-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-text-color);
        min-width: 60px;
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

      .color-input-group {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .color-picker-input {
        width: 48px;
        height: 48px;
        border: 2px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 12px;
        cursor: pointer;
        padding: 2px;
        background: var(--primary-background-color);
        transition: border-color 0.2s;
      }

      .color-picker-input:hover {
        border-color: var(--primary-color);
      }

      .color-preview-large {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 2px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        flex-shrink: 0;
      }

      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
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

      .form-btn.secondary:hover {
        border-color: var(--primary-color);
      }

      .form-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      /* Duplicate warning */
      .duplicate-warning {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(255, 152, 0, 0.1);
        border: 1px solid rgba(255, 152, 0, 0.3);
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 12px;
        color: #f57c00;
      }

      .duplicate-warning ha-icon {
        --mdc-icon-size: 16px;
        flex-shrink: 0;
      }

      /* Color grid */
      .colors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }

      @media (max-width: 600px) {
        .colors-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
      }

      .color-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      }

      .color-card:hover {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        transform: translateY(-3px);
      }

      .color-card.editing {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
      }

      .color-swatch-area {
        width: 100%;
        height: 100px;
        position: relative;
        cursor: pointer;
        transition: height 0.2s ease;
      }

      .color-card:hover .color-swatch-area {
        height: 108px;
      }

      .swatch-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 8px 12px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.4));
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .color-card:hover .swatch-overlay {
        opacity: 1;
      }

      .swatch-overlay ha-icon {
        --mdc-icon-size: 18px;
        color: white;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        cursor: pointer;
      }

      .color-info {
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .color-details {
        flex: 1;
        min-width: 0;
      }

      .color-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 2px;
      }

      .color-value {
        font-size: 12px;
        font-family: 'SF Mono', 'Fira Code', monospace;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .color-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      /* Edit inline form within card */
      .edit-inline {
        padding: 12px 14px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        overflow: visible;
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
        min-width: 0;
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

      .edit-color-input {
        width: 32px;
        height: 32px;
        min-width: 32px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        cursor: pointer;
        padding: 1px;
        flex-shrink: 0;
      }

      .edit-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._colors = ucFavoriteColorsService.getFavorites();
    this._unsub = ucFavoriteColorsService.subscribe(list => {
      this._colors = list;
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

  private _copyColor(color: string): void {
    try {
      navigator.clipboard.writeText(color);
      this._showToast(`Copied ${color}`);
    } catch {
      /* ignore */
    }
  }

  private _deleteColor(fav: FavoriteColor): void {
    ucFavoriteColorsService.deleteFavorite(fav.id);
    this._colors = ucFavoriteColorsService.getFavorites();
  }

  private _addColor(): void {
    const name = this._newColorName.trim();
    const color = this._newColorValue.trim();
    if (!name || !color) return;

    if (ucFavoriteColorsService.hasColor(color)) {
      this._showToast('This color already exists');
      return;
    }

    ucFavoriteColorsService.addFavorite(name, color);
    this._colors = ucFavoriteColorsService.getFavorites();
    this._newColorName = '';
    this._newColorValue = '#3498db';
    this._showAddForm = false;
    this._showToast(`Added "${name}"`);
  }

  private _startEdit(fav: FavoriteColor): void {
    this._editingId = fav.id;
    this._editName = fav.name;
    this._editColor = fav.color;
  }

  private _saveEdit(): void {
    if (!this._editingId) return;
    ucFavoriteColorsService.updateFavorite(this._editingId, {
      name: this._editName,
      color: this._editColor,
    });
    this._colors = ucFavoriteColorsService.getFavorites();
    this._editingId = null;
    this._showToast('Color updated');
  }

  private _cancelEdit(): void {
    this._editingId = null;
  }

  private _isLight(color: string): boolean {
    try {
      const hex = color.replace('#', '');
      if (hex.length < 6) return true;
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 > 155;
    } catch {
      return false;
    }
  }

  render() {
    if (this._colors.length === 0 && !this._showAddForm) {
      return html`
        <div class="hub-tab-blurb">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <p><strong>Favorite colors</strong> appear in every Ultra Card color picker so you can reuse your palette. Add colors here or save them from any picker with the heart icon.</p>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">
            <ha-icon icon="mdi:palette-swatch-variant"></ha-icon>
          </div>
          <h3>No Saved Colors</h3>
          <p>Save your favorite colors here for quick access across all your cards.</p>
          <p class="empty-hint">Add colors below or use the heart icon in any card's color picker</p>
          <button class="add-btn" style="margin-top: 16px;" @click=${() => (this._showAddForm = true)}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Color
          </button>
        </div>
      `;
    }

    const isDuplicate = this._newColorValue && ucFavoriteColorsService.hasColor(this._newColorValue);

    return html`
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Favorite colors</strong> appear in every Ultra Card color picker so you can reuse your palette. Add colors here or save them from any picker with the heart icon.</p>
      </div>
      <div class="colors-header">
        <span class="colors-count">
          <strong>${this._colors.length}</strong> saved color${this._colors.length !== 1 ? 's' : ''}
        </span>
        <button class="add-btn" @click=${() => (this._showAddForm = !this._showAddForm)}>
          <ha-icon icon=${this._showAddForm ? 'mdi:close' : 'mdi:plus'}></ha-icon>
          ${this._showAddForm ? 'Cancel' : 'Add Color'}
        </button>
      </div>

      ${this._showAddForm
        ? html`
            <div class="add-form">
              <h3><ha-icon icon="mdi:palette-swatch"></ha-icon> Add New Color</h3>

              <div class="form-row">
                <span class="form-label">Color</span>
                <div class="color-input-group">
                  <input
                    type="color"
                    class="color-picker-input"
                    .value=${this._newColorValue}
                    @input=${(e: InputEvent) => (this._newColorValue = (e.target as HTMLInputElement).value)}
                  />
                  <input
                    type="text"
                    class="form-input"
                    placeholder="#3498db or rgb(52, 152, 219)"
                    .value=${this._newColorValue}
                    @input=${(e: InputEvent) => (this._newColorValue = (e.target as HTMLInputElement).value)}
                  />
                  <div class="color-preview-large" style="background: ${this._newColorValue}"></div>
                </div>
              </div>

              <div class="form-row">
                <span class="form-label">Name</span>
                <input
                  type="text"
                  class="form-input"
                  placeholder="e.g. Ocean Blue"
                  .value=${this._newColorName}
                  @input=${(e: InputEvent) => (this._newColorName = (e.target as HTMLInputElement).value)}
                  @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._addColor()}
                />
              </div>

              ${isDuplicate
                ? html`
                    <div class="duplicate-warning">
                      <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                      This color value already exists in your favorites.
                    </div>
                  `
                : ''}

              <div class="form-actions">
                <button class="form-btn secondary" @click=${() => (this._showAddForm = false)}>
                  Cancel
                </button>
                <button
                  class="form-btn primary"
                  ?disabled=${!this._newColorName.trim() || !this._newColorValue.trim() || !!isDuplicate}
                  @click=${this._addColor}
                >
                  <ha-icon icon="mdi:check"></ha-icon>
                  Add Color
                </button>
              </div>
            </div>
          `
        : ''}

      <!-- Color cards -->
      <div class="colors-grid">
        ${this._colors.map(fav => this._renderColorCard(fav))}
      </div>

      <div class="toast ${this._toastMsg ? 'show' : ''}">${this._toastMsg}</div>
    `;
  }

  private _renderColorCard(fav: FavoriteColor) {
    const isEditing = this._editingId === fav.id;

    return html`
      <div class="color-card ${isEditing ? 'editing' : ''}">
        <div
          class="color-swatch-area"
          style="background: ${isEditing ? this._editColor : fav.color}"
          @click=${() => this._copyColor(fav.color)}
          title="Click to copy"
        >
          <div class="swatch-overlay">
            <ha-icon icon="mdi:content-copy" @click=${(e: Event) => { e.stopPropagation(); this._copyColor(fav.color); }}></ha-icon>
            <ha-icon icon="mdi:pencil" @click=${(e: Event) => { e.stopPropagation(); this._startEdit(fav); }}></ha-icon>
          </div>
        </div>

        ${isEditing
          ? html`
              <div class="edit-inline">
                <div class="edit-row">
                  <input
                    type="color"
                    class="edit-color-input"
                    .value=${this._editColor}
                    @input=${(e: InputEvent) => (this._editColor = (e.target as HTMLInputElement).value)}
                  />
                  <input
                    type="text"
                    class="edit-input"
                    .value=${this._editColor}
                    @input=${(e: InputEvent) => (this._editColor = (e.target as HTMLInputElement).value)}
                  />
                </div>
                <div class="edit-row">
                  <input
                    type="text"
                    class="edit-input"
                    .value=${this._editName}
                    placeholder="Color name"
                    @input=${(e: InputEvent) => (this._editName = (e.target as HTMLInputElement).value)}
                    @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._saveEdit()}
                  />
                  <div class="edit-actions">
                    <button class="action-btn" title="Save" @click=${this._saveEdit}>
                      <ha-icon icon="mdi:check"></ha-icon>
                    </button>
                    <button class="action-btn" title="Cancel" @click=${this._cancelEdit}>
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>
                  </div>
                </div>
              </div>
            `
          : html`
              <div class="color-info">
                <div class="color-details">
                  <div class="color-name">${fav.name}</div>
                  <div class="color-value">${fav.color}</div>
                </div>
                <div class="color-actions">
                  <button class="action-btn" title="Edit" @click=${() => this._startEdit(fav)}>
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button class="action-btn delete" title="Remove" @click=${() => this._deleteColor(fav)}>
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </button>
                </div>
              </div>
            `}
      </div>
    `;
  }
}

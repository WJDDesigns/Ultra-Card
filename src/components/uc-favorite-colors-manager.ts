import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ucFavoriteColorsService } from '../services/uc-favorite-colors-service';
import { FavoriteColor } from '../types';
import './ultra-color-picker';

@customElement('uc-favorite-colors-manager')
export class UcFavoriteColorsManager extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _favoriteColors: FavoriteColor[] = [];
  @state() private _draggedItem?: FavoriteColor;
  @state() private _dragOverIndex?: number;
  @state() private _editingId?: string;
  @state() private _editingName = '';
  @state() private _editingColor = '';
  @state() private _showAddForm = false;
  @state() private _newColorName = '';
  @state() private _newColorValue = '#ffffff';

  private _favoritesUnsubscribe?: () => void;

  connectedCallback(): void {
    super.connectedCallback();

    // Subscribe to favorite colors changes
    this._favoritesUnsubscribe = ucFavoriteColorsService.subscribe(favorites => {
      this._favoriteColors = favorites;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    // Unsubscribe from favorite colors
    if (this._favoritesUnsubscribe) {
      this._favoritesUnsubscribe();
      this._favoritesUnsubscribe = undefined;
    }
  }

  private _handleDragStart(e: DragEvent, favorite: FavoriteColor): void {
    this._draggedItem = favorite;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', favorite.id);
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

    const currentIndex = this._favoriteColors.findIndex(f => f.id === this._draggedItem!.id);
    if (currentIndex === -1 || currentIndex === targetIndex) return;

    // Create new order based on drag and drop
    const reorderedFavorites = [...this._favoriteColors];
    const [draggedItem] = reorderedFavorites.splice(currentIndex, 1);
    reorderedFavorites.splice(targetIndex, 0, draggedItem);

    // Update service with new order
    const orderedIds = reorderedFavorites.map(f => f.id);
    ucFavoriteColorsService.reorderFavorites(orderedIds);

    this._draggedItem = undefined;
  }

  private _startEdit(favorite: FavoriteColor): void {
    this._editingId = favorite.id;
    this._editingName = favorite.name;
    this._editingColor = favorite.color;
  }

  private _cancelEdit(): void {
    this._editingId = undefined;
    this._editingName = '';
    this._editingColor = '';
  }

  private _saveEdit(): void {
    if (!this._editingId || !this._editingName.trim()) return;

    ucFavoriteColorsService.updateFavorite(this._editingId, {
      name: this._editingName.trim(),
      color: this._editingColor,
    });

    this._cancelEdit();
  }

  private _deleteFavorite(id: string): void {
    if (confirm('Are you sure you want to delete this favorite color?')) {
      ucFavoriteColorsService.deleteFavorite(id);
    }
  }

  private _showAddNewForm(): void {
    this._showAddForm = true;
    this._newColorName = '';
    this._newColorValue = '#ffffff';
  }

  private _cancelAdd(): void {
    this._showAddForm = false;
    this._newColorName = '';
    this._newColorValue = '#ffffff';
  }

  private _addNewFavorite(): void {
    if (!this._newColorName.trim()) return;

    ucFavoriteColorsService.addFavorite(this._newColorName.trim(), this._newColorValue);
    this._cancelAdd();
  }

  private _clearAllFavorites(): void {
    if (confirm('Are you sure you want to delete ALL favorite colors? This cannot be undone.')) {
      ucFavoriteColorsService.clearAll();
    }
  }

  protected render(): TemplateResult {
    return html`
      <div class="favorites-manager">
        <div class="manager-header">
          <h3>Favorite Colors</h3>
          <div class="header-actions">
            <button
              class="add-btn"
              @click=${this._showAddNewForm}
              ?disabled=${this._showAddForm}
              title="Add new favorite color"
            >
              <ha-icon icon="mdi:plus"></ha-icon>
              Add Color
            </button>
            ${this._favoriteColors.length > 0
              ? html`
                  <button
                    class="clear-btn"
                    @click=${this._clearAllFavorites}
                    title="Clear all favorite colors"
                  >
                    <ha-icon icon="mdi:delete-sweep"></ha-icon>
                    Clear All
                  </button>
                `
              : ''}
          </div>
        </div>

        <div class="manager-description">
          <p>
            Manage your favorite colors that appear in all Ultra Card color pickers. Drag and drop
            to reorder.
          </p>
        </div>

        ${this._showAddForm
          ? html`
              <div class="add-form">
                <h4>Add New Favorite Color</h4>
                <div class="form-row">
                  <div class="form-field">
                    <label>Color Name</label>
                    <input
                      type="text"
                      .value=${this._newColorName}
                      @input=${(e: Event) => {
                        this._newColorName = (e.target as HTMLInputElement).value;
                      }}
                      placeholder="Enter color name..."
                      maxlength="50"
                    />
                  </div>
                  <div class="form-field">
                    <label>Color Value</label>
                    <ultra-color-picker
                      .hass=${this.hass}
                      .value=${this._newColorValue}
                      .defaultValue=${'#ffffff'}
                      @value-changed=${(e: CustomEvent) => {
                        this._newColorValue = e.detail.value;
                      }}
                    ></ultra-color-picker>
                  </div>
                </div>
                <div class="form-actions">
                  <button
                    class="save-btn"
                    @click=${this._addNewFavorite}
                    ?disabled=${!this._newColorName.trim()}
                  >
                    <ha-icon icon="mdi:check"></ha-icon>
                    Add
                  </button>
                  <button class="cancel-btn" @click=${this._cancelAdd}>
                    <ha-icon icon="mdi:close"></ha-icon>
                    Cancel
                  </button>
                </div>
              </div>
            `
          : ''}
        ${this._favoriteColors.length === 0 && !this._showAddForm
          ? html`
              <div class="empty-state">
                <ha-icon icon="mdi:palette-outline"></ha-icon>
                <h4>No Favorite Colors</h4>
                <p>
                  Add your first favorite color to get started. These colors will appear in all
                  Ultra Card color pickers.
                </p>
              </div>
            `
          : ''}
        ${this._favoriteColors.length > 0
          ? html`
              <div class="favorites-list">
                ${this._favoriteColors.map(
                  (favorite, index) => html`
                    <div
                      class="favorite-item ${this._dragOverIndex === index ? 'drag-over' : ''}"
                      draggable="true"
                      @dragstart=${(e: DragEvent) => this._handleDragStart(e, favorite)}
                      @dragover=${(e: DragEvent) => this._handleDragOver(e, index)}
                      @dragleave=${this._handleDragLeave}
                      @drop=${(e: DragEvent) => this._handleDrop(e, index)}
                    >
                      <div class="drag-handle">
                        <ha-icon icon="mdi:drag-vertical"></ha-icon>
                      </div>

                      <div class="color-preview" style="background-color: ${favorite.color}"></div>

                      ${this._editingId === favorite.id
                        ? html`
                            <div class="edit-form">
                              <input
                                type="text"
                                .value=${this._editingName}
                                @input=${(e: Event) => {
                                  this._editingName = (e.target as HTMLInputElement).value;
                                }}
                                placeholder="Color name..."
                                maxlength="50"
                              />
                              <ultra-color-picker
                                .hass=${this.hass}
                                .value=${this._editingColor}
                                .defaultValue=${favorite.color}
                                @value-changed=${(e: CustomEvent) => {
                                  this._editingColor = e.detail.value;
                                }}
                              ></ultra-color-picker>
                              <div class="edit-actions">
                                <button
                                  class="save-btn"
                                  @click=${this._saveEdit}
                                  ?disabled=${!this._editingName.trim()}
                                >
                                  <ha-icon icon="mdi:check"></ha-icon>
                                </button>
                                <button class="cancel-btn" @click=${this._cancelEdit}>
                                  <ha-icon icon="mdi:close"></ha-icon>
                                </button>
                              </div>
                            </div>
                          `
                        : html`
                            <div class="favorite-info">
                              <div class="favorite-name">${favorite.name}</div>
                              <div class="favorite-color-value">${favorite.color}</div>
                            </div>

                            <div class="favorite-actions">
                              <button
                                class="edit-btn"
                                @click=${() => this._startEdit(favorite)}
                                title="Edit color"
                              >
                                <ha-icon icon="mdi:pencil"></ha-icon>
                              </button>
                              <button
                                class="delete-btn"
                                @click=${() => this._deleteFavorite(favorite.id)}
                                title="Delete color"
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

  static get styles() {
    return css`
      .favorites-manager {
        width: 100%;
        max-width: 600px;
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
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .form-field {
        flex: 1;
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

      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
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

      .favorites-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .favorite-item {
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

      .favorite-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .favorite-item.drag-over {
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

      .color-preview {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 2px solid var(--divider-color);
        flex-shrink: 0;
      }

      .favorite-info {
        flex: 1;
        min-width: 0;
      }

      .favorite-name {
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 2px;
        word-break: break-word;
      }

      .favorite-color-value {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-family: var(--code-font-family, monospace);
      }

      .favorite-actions {
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
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .edit-form input {
        flex: 1;
        min-width: 120px;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .edit-form input:focus {
        outline: none;
        border-color: var(--primary-color);
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

        .form-row {
          flex-direction: column;
        }

        .form-field {
          min-width: auto;
        }

        .favorite-item {
          flex-wrap: wrap;
          gap: 8px;
        }

        .edit-form {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        .edit-actions {
          justify-content: center;
        }
      }
    `;
  }
}

/**
 * Find & replace entity IDs across the current card layout (JSON string replace).
 */
import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { Z_INDEX } from '../utils/uc-z-index';

@customElement('uc-entity-replace-dialog')
export class UcEntityReplaceDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public open = false;

  @state() private _findEntity = '';
  @state() private _replaceEntity = '';

  static styles = css`
    :host {
      display: block;
    }

    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: ${Z_INDEX.DIALOG_OVERLAY};
      padding: 16px;
    }

    .dialog {
      background: var(--card-background-color, #fff);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: visible;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .dialog-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-text-color, #000);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .close-btn {
      border: none;
      background: transparent;
      color: var(--secondary-text-color, #666);
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: var(--primary-color, #03a9f4);
      background: var(--secondary-background-color, #f5f5f5);
    }

    .dialog-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow: visible;
    }

    .help {
      margin: 0;
      font-size: 13px;
      color: var(--secondary-text-color, #666);
      line-height: 1.5;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .field label {
      display: block;
      font-weight: 500;
      color: var(--primary-text-color, #000);
      font-size: 14px;
    }

    .field ha-entity-picker {
      display: block;
      width: 100%;
    }

    .entity-input {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .entity-input input {
      flex: 1;
      padding: 10px 12px;
      border: 2px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      font-size: 14px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #000);
      outline: none;
      transition: border-color 0.2s;
      font-family: monospace;
    }

    .entity-input input:focus {
      border-color: var(--primary-color, #03a9f4);
    }

    .entity-input input::placeholder {
      color: var(--secondary-text-color, #999);
      font-family: inherit;
    }

    .browse-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: 2px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--secondary-text-color, #666);
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s;
    }

    .browse-btn:hover {
      border-color: var(--primary-color, #03a9f4);
      color: var(--primary-color, #03a9f4);
    }

    .browse-btn ha-icon {
      --mdc-icon-size: 20px;
    }

    .entity-suggestions {
      position: absolute;
      left: 0;
      right: 0;
      top: 100%;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      max-height: 200px;
      overflow-y: auto;
      z-index: 10;
    }

    .entity-suggestion {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      transition: background 0.15s;
      font-size: 13px;
    }

    .entity-suggestion:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .entity-suggestion .entity-id {
      font-family: monospace;
      color: var(--primary-text-color, #000);
    }

    .entity-suggestion .entity-name {
      color: var(--secondary-text-color, #666);
      font-size: 12px;
      margin-left: auto;
      text-align: right;
      max-width: 45%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .suggestion-wrapper {
      position: relative;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 20px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }

    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: var(--secondary-background-color, #e0e0e0);
      color: var(--primary-text-color, #000);
    }

    .btn-secondary:hover {
      background: var(--divider-color, #ccc);
    }

    .btn-primary {
      background: var(--primary-color, #03a9f4);
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(3, 169, 244, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  updated(changed: Map<string, unknown>): void {
    if (changed.has('open') && this.open) {
      this._findEntity = '';
      this._replaceEntity = '';
      this._findSuggestions = [];
      this._replaceSuggestions = [];
      this._showFindSuggestions = false;
      this._showReplaceSuggestions = false;
    }
  }

  @state() private _findSuggestions: string[] = [];
  @state() private _replaceSuggestions: string[] = [];
  @state() private _showFindSuggestions = false;
  @state() private _showReplaceSuggestions = false;

  private _getFilteredEntities(query: string): string[] {
    if (!this.hass?.states || !query || query.length < 2) return [];
    const q = query.toLowerCase();
    return Object.keys(this.hass.states)
      .filter(id => {
        const friendly = this.hass.states[id]?.attributes?.friendly_name?.toLowerCase() || '';
        return id.toLowerCase().includes(q) || friendly.includes(q);
      })
      .slice(0, 8);
  }

  private _handleFindInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this._findEntity = val;
    this._findSuggestions = this._getFilteredEntities(val);
    this._showFindSuggestions = this._findSuggestions.length > 0 && val.length >= 2;
  }

  private _handleReplaceInput(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this._replaceEntity = val;
    this._replaceSuggestions = this._getFilteredEntities(val);
    this._showReplaceSuggestions = this._replaceSuggestions.length > 0 && val.length >= 2;
  }

  private _selectFindEntity(entityId: string): void {
    this._findEntity = entityId;
    this._showFindSuggestions = false;
  }

  private _selectReplaceEntity(entityId: string): void {
    this._replaceEntity = entityId;
    this._showReplaceSuggestions = false;
  }

  private _close(): void {
    this._showFindSuggestions = false;
    this._showReplaceSuggestions = false;
    this.dispatchEvent(new CustomEvent('dialog-closed', { bubbles: true, composed: true }));
  }

  private _apply(): void {
    const from = this._findEntity.trim();
    const to = this._replaceEntity.trim();
    if (!from || !to || from === to) return;
    this.dispatchEvent(
      new CustomEvent('entity-replace', {
        detail: { from, to },
        bubbles: true,
        composed: true,
      })
    );
    this._close();
  }

  private _renderSuggestions(
    suggestions: string[],
    onSelect: (id: string) => void
  ): TemplateResult {
    if (suggestions.length === 0) return html``;
    return html`
      <div class="entity-suggestions">
        ${suggestions.map(id => {
          const friendly = this.hass?.states[id]?.attributes?.friendly_name || '';
          return html`
            <div class="entity-suggestion" @mousedown=${() => onSelect(id)}>
              <span class="entity-id">${id}</span>
              ${friendly ? html`<span class="entity-name">${friendly}</span>` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  protected render(): TemplateResult {
    if (!this.open) return html``;

    const canApply =
      !!this._findEntity.trim() &&
      !!this._replaceEntity.trim() &&
      this._findEntity.trim() !== this._replaceEntity.trim();

    return html`
      <div
        class="dialog-overlay"
        @click=${(e: Event) => e.target === e.currentTarget && this._close()}
      >
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <h3>
              <ha-icon icon="mdi:find-replace"></ha-icon>
              Find &amp; replace entity
            </h3>
            <button class="close-btn" @click=${this._close} aria-label="Close">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="dialog-body">
            <p class="help">
              Replaces every exact text match of the entity ID inside this card's layout (including
              templates and nested modules). Use undo in the layout builder if needed.
            </p>
            <div class="field">
              <label>Find entity</label>
              <div class="suggestion-wrapper">
                <div class="entity-input">
                  <input
                    type="text"
                    .value=${this._findEntity}
                    @input=${this._handleFindInput}
                    @focus=${() => {
                      if (this._findSuggestions.length > 0 && this._findEntity.length >= 2) {
                        this._showFindSuggestions = true;
                      }
                    }}
                    @blur=${() => {
                      setTimeout(() => (this._showFindSuggestions = false), 200);
                    }}
                    placeholder="sensor.example_entity"
                  />
                </div>
                ${this._showFindSuggestions
                  ? this._renderSuggestions(this._findSuggestions, id =>
                      this._selectFindEntity(id)
                    )
                  : ''}
              </div>
            </div>
            <div class="field">
              <label>Replace with</label>
              <div class="suggestion-wrapper">
                <div class="entity-input">
                  <input
                    type="text"
                    .value=${this._replaceEntity}
                    @input=${this._handleReplaceInput}
                    @focus=${() => {
                      if (
                        this._replaceSuggestions.length > 0 &&
                        this._replaceEntity.length >= 2
                      ) {
                        this._showReplaceSuggestions = true;
                      }
                    }}
                    @blur=${() => {
                      setTimeout(() => (this._showReplaceSuggestions = false), 200);
                    }}
                    placeholder="sensor.new_entity"
                  />
                </div>
                ${this._showReplaceSuggestions
                  ? this._renderSuggestions(this._replaceSuggestions, id =>
                      this._selectReplaceEntity(id)
                    )
                  : ''}
              </div>
            </div>
          </div>
          <div class="dialog-footer">
            <button type="button" class="btn btn-secondary" @click=${this._close}>Cancel</button>
            <button
              type="button"
              class="btn btn-primary"
              @click=${this._apply}
              ?disabled=${!canApply}
            >
              Replace all
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { Z_INDEX } from '../utils/uc-z-index';
import { ucFavoritesService } from '../services/uc-favorites-service';
import { CardRow } from '../types';
import { localize } from '../localize/localize';

@customElement('uc-favorite-dialog')
export class UcFavoriteDialog extends LitElement {
  @property({ attribute: false }) public hass: HomeAssistant | undefined;
  @property({ attribute: false }) public row!: CardRow;
  @property({ type: Boolean }) public open = false;

  @state() private _name = '';
  @state() private _description = '';
  @state() private _tags = '';
  private _previouslyFocusedElement: HTMLElement | null = null;

  override updated(changedProperties: Map<string, unknown>): void {
    if (!changedProperties.has('open')) return;
    if (this.open) {
      this._previouslyFocusedElement = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => this._focusInitialControl());
    } else if (this._previouslyFocusedElement) {
      this._previouslyFocusedElement.focus();
      this._previouslyFocusedElement = null;
    }
  }

  protected override render(): TemplateResult {
    if (!this.open) return html``;

    return html`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div
          class="dialog-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="uc-favorite-dialog-title"
          @keydown=${this._handleKeyDown}
          @click=${(e: Event) => e.stopPropagation()}
        >
          <div class="dialog-header">
            <h3 id="uc-favorite-dialog-title">
              ${this._t('editor.favorite_dialog.title', 'Save as Favorite')}
            </h3>
            <button
              class="close-btn"
              type="button"
              aria-label="${this._t('editor.favorite_dialog.close', 'Close')}"
              @click=${this._close}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="dialog-body">
            <div class="field">
              <label>${this._t('editor.favorite_dialog.name', 'Name')} *</label>
              <input
                type="text"
                .value=${this._name}
                @input=${(e: Event) => (this._name = (e.target as HTMLInputElement).value)}
                placeholder="${this._t(
                  'editor.favorite_dialog.name_placeholder',
                  'Enter a name for this favorite'
                )}"
                required
              />
            </div>

            <div class="field">
              <label>${this._t('editor.favorite_dialog.description', 'Description')}</label>
              <textarea
                .value=${this._description}
                @input=${(e: Event) =>
                  (this._description = (e.target as HTMLTextAreaElement).value)}
                placeholder="${this._t('editor.favorite_dialog.description_placeholder', 'Optional description')}"
                rows="3"
              ></textarea>
            </div>

            <div class="field">
              <label>${this._t('editor.favorite_dialog.tags', 'Tags')}</label>
              <input
                type="text"
                .value=${this._tags}
                @input=${(e: Event) => (this._tags = (e.target as HTMLInputElement).value)}
                placeholder="${this._t(
                  'editor.favorite_dialog.tags_placeholder',
                  'Comma-separated tags (e.g., lights, bedroom, automation)'
                )}"
              />
              <small
                >${this._t(
                  'editor.favorite_dialog.tags_hint',
                  'Use tags to organize and search your favorites'
                )}</small
              >
            </div>
          </div>

          <div class="dialog-footer">
            <button class="cancel-btn" type="button" @click=${this._close}>
              ${this._t('editor.common.cancel', 'Cancel')}
            </button>
            <button class="save-btn" type="button" @click=${this._save} ?disabled=${!this._name.trim()}>
              ${this._t('editor.favorite_dialog.save', 'Save Favorite')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _handleOverlayClick(e: Event): void {
    if (e.target === e.currentTarget) {
      this._close();
    }
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this._close();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = this._getFocusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.shadowRoot?.activeElement as HTMLElement | null;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
      return;
    }
    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  private _close(): void {
    this.open = false;
    this._reset();
    this.dispatchEvent(new CustomEvent('close'));
  }

  private _save(): void {
    if (!this._name.trim()) return;

    const tags = this._tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean);

    ucFavoritesService.addFavorite(
      this.row,
      this._name.trim(),
      this._description.trim() || undefined,
      tags
    );

    this.dispatchEvent(
      new CustomEvent('saved', {
        detail: { name: this._name.trim() },
      })
    );

    this._close();
  }

  private _reset(): void {
    this._name = '';
    this._description = '';
    this._tags = '';
  }

  private _focusInitialControl(): void {
    const input = this.shadowRoot?.querySelector<HTMLInputElement>('input[type="text"]');
    input?.focus();
  }

  private _getFocusableElements(): HTMLElement[] {
    const root = this.shadowRoot;
    if (!root) return [];
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(el => {
      if (el.hasAttribute('disabled')) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      if (el.tabIndex < 0) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      return true;
    });
  }

  private _t(key: string, fallback: string): string {
    return localize(key, this.hass?.locale?.language || 'en', fallback);
  }

  static override styles = css`
    :host {
      display: contents;
    }

    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: ${Z_INDEX.DIALOG_OVERLAY};
      padding: 20px;
    }

    .dialog-content {
      background: var(--card-background-color);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--divider-color);
    }

    .dialog-header h3 {
      margin: 0;
      color: var(--primary-text-color);
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      border-radius: 6px;
      color: var(--secondary-text-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }

    .dialog-body {
      padding: 24px;
    }

    .field {
      margin-bottom: 20px;
    }

    .field:last-child {
      margin-bottom: 0;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: var(--primary-text-color);
      font-size: 14px;
    }

    input,
    textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    small {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .dialog-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid var(--divider-color);
    }

    .cancel-btn,
    .save-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cancel-btn {
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color);
    }

    .cancel-btn:hover {
      background: var(--divider-color);
      color: var(--primary-text-color);
    }

    .save-btn {
      background: var(--primary-color);
      color: white;
    }

    .save-btn:hover:not(:disabled) {
      background: var(--primary-color-dark);
    }

    .save-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {
      .dialog-content {
        margin: 0;
        border-radius: 0;
        height: 100vh;
        max-height: none;
      }

      .dialog-footer {
        flex-direction: column-reverse;
        gap: 8px;
      }

      .cancel-btn,
      .save-btn {
        width: 100%;
      }
    }
  `;
}

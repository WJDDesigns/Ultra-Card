/**
 * Professional Snapshot Restore Dialog
 * Beautiful modal for choosing restore method
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface RestoreMethodChoice {
  method: 'smart' | 'clean' | null;
}

@customElement('uc-snapshot-restore-dialog')
export class UcSnapshotRestoreDialog extends LitElement {
  @property({ type: Boolean }) public open = false;
  @property({ type: Number }) public cardCount = 0;
  @property({ type: Array }) public viewNames: string[] = [];

  @state() private _selectedMethod: 'smart' | 'clean' | null = null;

  private _handleMethodSelect(method: 'smart' | 'clean') {
    this._selectedMethod = method;
  }

  private _handleConfirm() {
    if (!this._selectedMethod) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<RestoreMethodChoice>('method-selected', {
        detail: { method: this._selectedMethod },
        bubbles: true,
        composed: true,
      })
    );
    this._close();
  }

  private _close() {
    this.dispatchEvent(
      new CustomEvent('dialog-closed', {
        bubbles: true,
        composed: true,
      })
    );
  }

  render(): TemplateResult {
    if (!this.open) return html``;

    return html`
      <div class="backdrop" @click="${this._close}">
        <div class="dialog" @click="${(e: Event) => e.stopPropagation()}">
          <!-- Header -->
          <div class="header">
            <div class="header-icon">📸</div>
            <div class="header-content">
              <h2>Restore Dashboard Snapshot</h2>
              <p class="header-subtitle">
                ${this.cardCount} Ultra Cards • ${this.viewNames.length} Views
              </p>
            </div>
            <button class="close-btn" @click="${this._close}">✕</button>
          </div>

          <!-- Method Cards -->
          <div class="methods">
            <!-- Smart Replace Method -->
            <div
              class="method-card ${this._selectedMethod === 'smart' ? 'selected' : ''}"
              @click="${() => this._handleMethodSelect('smart')}"
            >
              <div class="method-header">
                <input
                  type="radio"
                  name="method"
                  .checked="${this._selectedMethod === 'smart'}"
                  @click="${(e: Event) => e.stopPropagation()}"
                />
                <div class="method-icon smart">🧠</div>
                <div class="method-title">
                  <h3>Smart Replace</h3>
                  <span class="badge recommended">Recommended</span>
                </div>
              </div>
              <p class="method-description">
                Intelligently matches cards by custom name OR position, replacing them in-place
                without creating duplicates.
              </p>
              <ul class="method-features">
                <li>✅ Safe - no duplicates</li>
                <li>✅ Works with named or unnamed cards</li>
                <li>✅ Preserves non-matching cards</li>
                <li>✅ Can run multiple times</li>
              </ul>
            </div>

            <!-- Clean & Restore Method -->
            <div
              class="method-card ${this._selectedMethod === 'clean' ? 'selected' : ''}"
              @click="${() => this._handleMethodSelect('clean')}"
            >
              <div class="method-header">
                <input
                  type="radio"
                  name="method"
                  .checked="${this._selectedMethod === 'clean'}"
                  @click="${(e: Event) => e.stopPropagation()}"
                />
                <div class="method-icon clean">🧹</div>
                <div class="method-title">
                  <h3>Clean & Restore</h3>
                  <span class="badge nuclear">Nuclear Option</span>
                </div>
              </div>
              <p class="method-description">
                Deletes ALL Ultra Cards first, then restores snapshot cards to their exact original
                positions and order.
              </p>
              <ul class="method-features">
                <li>✅ Fixes duplicated cards</li>
                <li>✅ Exact snapshot state</li>
                <li>✅ Perfect for messed up dashboards</li>
                <li>⚠️ Deletes all Ultra Cards first</li>
              </ul>
            </div>
          </div>

          <!-- Views Preview -->
          <div class="views-preview">
            <div class="preview-title">Affected Views:</div>
            <div class="view-chips">
              ${this.viewNames.map(viewName => html`<div class="view-chip">${viewName}</div>`)}
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="footer">
            <button class="btn btn-secondary" @click="${this._close}">Cancel</button>
            <button
              class="btn btn-primary"
              ?disabled="${!this._selectedMethod}"
              @click="${this._handleConfirm}"
            >
              <span class="btn-icon">🔄</span>
              Restore ${this.cardCount} Cards
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      --primary: #667eea;
      --primary-dark: #5568d3;
      --secondary: #764ba2;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --text-primary: #1a1a1a;
      --text-secondary: #666;
      --bg-primary: #fff;
      --bg-secondary: #f9fafb;
      --border: #e5e7eb;
      --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    * {
      box-sizing: border-box;
    }

    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .dialog {
      background: var(--bg-primary);
      border-radius: 16px;
      box-shadow: var(--shadow);
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      border-bottom: 2px solid var(--border);
    }

    .header-icon {
      font-size: 48px;
      line-height: 1;
    }

    .header-content {
      flex: 1;
    }

    .header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .header-subtitle {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    /* Methods */
    .methods {
      padding: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .methods {
        grid-template-columns: 1fr;
      }
    }

    .method-card {
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--bg-primary);
    }

    .method-card:hover {
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }

    .method-card.selected {
      border-color: var(--primary);
      background: linear-gradient(
        135deg,
        rgba(102, 126, 234, 0.05) 0%,
        rgba(118, 75, 162, 0.05) 100%
      );
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .method-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }

    .method-header input[type='radio'] {
      margin-top: 4px;
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: var(--primary);
    }

    .method-icon {
      font-size: 32px;
      line-height: 1;
    }

    .method-title {
      flex: 1;
    }

    .method-title h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .badge {
      display: inline-block;
      margin-top: 4px;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.recommended {
      background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
      color: white;
    }

    .badge.nuclear {
      background: linear-gradient(135deg, var(--warning) 0%, #d97706 100%);
      color: white;
    }

    .method-description {
      margin: 12px 0;
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-secondary);
    }

    .method-features {
      list-style: none;
      padding: 0;
      margin: 12px 0 0 0;
    }

    .method-features li {
      font-size: 13px;
      padding: 6px 0;
      color: var(--text-secondary);
    }

    /* Views Preview */
    .views-preview {
      padding: 20px 24px;
      background: var(--bg-secondary);
      border-top: 2px solid var(--border);
    }

    .preview-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .view-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .view-chip {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      color: var(--text-primary);
    }

    /* Footer */
    .footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 2px solid var(--border);
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 2px solid var(--border);
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      border: none;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-icon {
      font-size: 18px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-snapshot-restore-dialog': UcSnapshotRestoreDialog;
  }
}

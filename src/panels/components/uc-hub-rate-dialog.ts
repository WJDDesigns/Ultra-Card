/**
 * Ultra Card Hub — Rate preset dialog
 * Uses a fully custom overlay (no ha-dialog) so it always renders above
 * the builder's module-selector-popup (z-index 1000).
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ucCloudSyncService } from '../../services/uc-cloud-sync-service';

export class UcHubRateDialog extends LitElement {
  @property() presetId = '';
  @property() presetName = '';
  @property({ type: Number }) existingRating = 0;

  @state() private _selectedRating = 0;
  @state() private _hoveredRating = 0;
  @state() private _submitting = false;
  @state() private _error = '';

  static styles = css`
    /* Full-screen backdrop — position: fixed so it escapes any parent stacking context */
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.55);
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .dialog-surface {
      background: var(--ha-card-background, var(--card-background-color, #1c1c1e));
      border-radius: 16px;
      padding: 24px 28px;
      min-width: 300px;
      max-width: min(480px, 90vw);
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
      animation: slideUp 0.18s ease;
    }

    @keyframes slideUp {
      from { transform: translateY(12px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .dialog-title {
      font-size: 17px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin: 0;
    }

    .dialog-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: background 0.15s;
    }

    .dialog-close:hover {
      background: rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.08);
    }

    .rate-dialog-subtitle {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin: 0 0 20px;
    }

    .rate-stars-row {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      user-select: none;
      margin-bottom: 8px;
    }

    .rate-stars-row ha-icon {
      --mdc-icon-size: 36px;
      color: #ffb300;
      transition: transform 0.1s ease;
    }

    .rate-stars-row ha-icon.empty {
      color: var(--secondary-text-color);
      opacity: 0.35;
    }

    .rate-stars-row ha-icon:hover {
      transform: scale(1.15);
    }

    .rate-hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 20px;
      min-height: 18px;
    }

    .rate-actions {
      display: flex;
      gap: 10px;
    }

    .rate-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 16px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s ease, background 0.15s ease;
    }

    .rate-btn-submit {
      background: var(--primary-color);
      color: white;
    }

    .rate-btn-submit:hover:not(:disabled) {
      opacity: 0.88;
    }

    .rate-btn-submit:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .rate-btn-cancel {
      background: transparent;
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
    }

    .rate-btn-cancel:hover:not(:disabled) {
      background: rgba(var(--rgb-primary-text-color, 255,255,255), 0.06);
    }

    .rate-error {
      font-size: 12px;
      color: var(--error-color, #db4437);
      margin: 4px 0 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .rate-spin {
      animation: spin 0.8s linear infinite;
    }
  `;

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('existingRating') || changed.has('presetId')) {
      if (this._selectedRating === 0 && this.existingRating > 0) {
        this._selectedRating = this.existingRating;
      }
    }
  }

  private _close() {
    this._selectedRating = 0;
    this._hoveredRating = 0;
    this._error = '';
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private _displayRating(): number {
    return this._hoveredRating > 0 ? this._hoveredRating : this._selectedRating;
  }

  private _ratingLabel(r: number): string {
    return ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][r] ?? '';
  }

  private async _handleSubmit() {
    if (this._selectedRating < 1 || this._submitting || !this.presetId) return;
    this._submitting = true;
    this._error = '';
    try {
      await ucCloudSyncService.submitReview(this.presetId, this._selectedRating);
      this.dispatchEvent(
        new CustomEvent('rating-submitted', {
          detail: { presetId: this.presetId, rating: this._selectedRating },
          bubbles: true,
          composed: true,
        })
      );
      this._close();
    } catch (err) {
      this._error = err instanceof Error ? err.message : 'Failed to submit rating';
    } finally {
      this._submitting = false;
    }
  }

  protected render(): TemplateResult {
    const displayRating = this._displayRating();

    return html`
      <div class="overlay" @click=${(e: Event) => { if (e.target === e.currentTarget) this._close(); }}>
        <div class="dialog-surface">

          <div class="dialog-header">
            <h2 class="dialog-title">Rate this preset</h2>
            <button class="dialog-close" @click=${this._close} ?disabled=${this._submitting}>
              <ha-icon icon="mdi:close" style="--mdc-icon-size:20px;"></ha-icon>
            </button>
          </div>

          ${this.presetName
            ? html`<p class="rate-dialog-subtitle">${this.presetName}</p>`
            : ''}

          <div class="rate-stars-row" @mouseleave=${() => (this._hoveredRating = 0)}>
            ${[1, 2, 3, 4, 5].map(star => html`
              <ha-icon
                icon=${star <= displayRating ? 'mdi:star' : 'mdi:star-outline'}
                class=${star <= displayRating ? '' : 'empty'}
                @mouseenter=${() => (this._hoveredRating = star)}
                @click=${() => (this._selectedRating = star)}
              ></ha-icon>
            `)}
          </div>

          <p class="rate-hint">${this._ratingLabel(displayRating)}</p>

          ${this._error ? html`<p class="rate-error">${this._error}</p>` : ''}

          <div class="rate-actions">
            <button
              class="rate-btn rate-btn-submit"
              ?disabled=${this._selectedRating < 1 || this._submitting}
              @click=${this._handleSubmit}
            >
              ${this._submitting
                ? html`<ha-icon icon="mdi:loading" class="rate-spin"></ha-icon> Submitting…`
                : this.existingRating > 0
                  ? 'Update rating'
                  : 'Submit rating'}
            </button>
            <button class="rate-btn rate-btn-cancel" @click=${this._close} ?disabled=${this._submitting}>
              Cancel
            </button>
          </div>

        </div>
      </div>
    `;
  }
}

if (!customElements.get('uc-hub-rate-dialog')) {
  customElements.define('uc-hub-rate-dialog', UcHubRateDialog);
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-hub-rate-dialog': UcHubRateDialog;
  }
}

import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface UltraSegmentedOption {
  value: string;
  label: string;
  icon?: string | undefined;
}

/**
 * `<ultra-segmented>` — Segmented control for mutually exclusive string values.
 *
 * IMPORTANT (consistency rule):
 * ALWAYS use this component (via `BaseUltraModule.renderSegmentedField`) for any
 * "pick exactly one of N options" UI in a module editor. NEVER hand-roll a
 * `<button class="…-btn">` row, a `<div class="…-option">` grid, or a raw `<select>`
 * dropdown — those produce per-module visual drift that breaks Ultra Card's
 * "every module looks the same" guarantee.
 *
 * Use this for:
 * - Source-type pickers (default | url | upload | entity | attribute)
 * - Alignment / direction / position pickers
 * - Layout / style / mode switchers
 * - Badge corner pickers (top-left, top-right, bottom-left, bottom-right)
 * - Any other mutually exclusive string-valued setting
 *
 * The component handles label/description spacing AND smart grid layout (4 options
 * → 2x2 grid, 9 → 3x3, etc.) so module authors never have to think about it.
 */
@customElement('ultra-segmented')
export class UltraSegmented extends LitElement {
  @property({ type: String }) value = '';

  @property({ type: Array }) options: UltraSegmentedOption[] = [];

  @property({ type: String }) label = '';

  @property({ type: String }) description = '';

  @property({ type: Boolean }) disabled = false;

  /**
   * Force a fixed-column grid layout instead of the default flex-wrap row.
   * When set, options are laid out in `columns` equal-width columns and as many
   * rows as needed. This avoids ugly "3 + 1 leftover" wrap patterns for 4-option
   * cases (a 2x2 grid is much more symmetric). Set to 'auto' or omit to use the
   * flex-wrap row behavior.
   */
  @property({ type: Number }) columns?: number;

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
    }
    .uc-seg-label {
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
      /* Match the same gap that field-description leaves above its control so
         the title doesn't visually hug the first segmented button. */
      margin: 0 0 12px 0;
      display: block;
    }
    .uc-seg-desc {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin: 0 0 12px 0;
      opacity: 0.85;
      line-height: 1.4;
      display: block;
    }
    /* When a label is present, the description sits right under it; tighten the
       label-to-description gap so the description still reads as a sub-line. */
    .uc-seg-label + .uc-seg-desc {
      margin-top: -8px;
    }
    .uc-seg-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .uc-seg-row.uc-seg-grid {
      display: grid;
      grid-template-columns: repeat(var(--uc-seg-cols, 2), minmax(0, 1fr));
      gap: 8px;
    }
    .uc-seg-btn {
      flex: 1 1 auto;
      min-width: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 12px;
      border: 2px solid var(--divider-color);
      border-radius: 10px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
    }
    .uc-seg-btn:hover:not([data-active]):not(:disabled) {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.06);
    }
    .uc-seg-btn[data-active] {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.12);
      color: var(--primary-color);
    }
    .uc-seg-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .uc-seg-btn ha-icon {
      flex-shrink: 0;
      --mdc-icon-size: 18px;
    }
  `;

  private _select(v: string) {
    if (this.disabled || v === this.value) return;
    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: v },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Pick a sensible default columns count when none is provided.
   * Heuristic: 4 options → 2x2 grid (avoids 3+1 wrap), 9 options → 3x3, etc.
   * Anything else falls back to the flex-wrap row.
   */
  private _resolveColumns(): number | undefined {
    if (this.columns && this.columns > 0) return this.columns;
    const count = this.options?.length ?? 0;
    if (count === 4) return 2;
    if (count === 6) return 3;
    if (count === 8) return 4;
    if (count === 9) return 3;
    return undefined;
  }

  override render() {
    const opts = Array.isArray(this.options) ? this.options : [];
    const cols = this._resolveColumns();
    const rowStyle = cols ? `--uc-seg-cols: ${cols};` : '';
    return html`
      ${this.label ? html`<span class="uc-seg-label">${this.label}</span>` : nothing}
      ${this.description ? html`<span class="uc-seg-desc">${this.description}</span>` : nothing}
      <div
        class="uc-seg-row ${cols ? 'uc-seg-grid' : ''}"
        style=${rowStyle}
        role="tablist"
      >
        ${opts.map(
          o => html`
            <button
              type="button"
              class="uc-seg-btn"
              role="tab"
              aria-selected=${this.value === o.value}
              ?data-active=${this.value === o.value}
              ?disabled=${this.disabled}
              @click=${() => this._select(o.value)}
            >
              ${o.icon ? html`<ha-icon icon=${o.icon}></ha-icon>` : nothing}
              <span>${o.label}</span>
            </button>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ultra-segmented': UltraSegmented;
  }
}

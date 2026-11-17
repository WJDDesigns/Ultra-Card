import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';

export interface UcSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * `<uc-select>` — Ultra Card's own dropdown.
 *
 * Home Assistant's 2026 frontend rebuilt `<ha-select>` on Web Awesome. The new
 * one only shows options passed through `.options` (as `ha-dropdown-item`s),
 * reports the choice in `e.detail.value`, and ignores slotted
 * `<mwc-list-item>` children, because the Material `mwc-*` elements are gone
 * from HA entirely. Older HA (down to the card's 2024.1 minimum) needs the
 * opposite. This element uses a native `<select>`, so it behaves the same on
 * every HA version.
 *
 * Fires `selected` (not bubbling, so it can't leak into the editor, see #92)
 * with `detail.value`, and also sets `.value` first so `e.target.value` keeps
 * working in handlers written for the old `ha-select`.
 */
export class UcSelect extends LitElement {
  @property() value = '';
  @property() label = '';
  @property({ attribute: false }) options: UcSelectOption[] = [];
  @property({ type: Boolean, reflect: true }) disabled = false;

  static override styles = css`
    :host {
      display: inline-block;
      box-sizing: border-box;
      min-width: 0;
    }
    .uc-sel-label {
      display: block;
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }
    .uc-sel-wrap {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      border-radius: var(--ha-border-radius-sm, 4px) var(--ha-border-radius-sm, 4px) 0 0;
      background: var(
        --input-fill-color,
        var(--secondary-background-color, rgba(127, 127, 127, 0.08))
      );
      border-bottom: 1px solid
        var(--input-idle-line-color, var(--divider-color, rgba(127, 127, 127, 0.4)));
    }
    .uc-sel-wrap:focus-within {
      border-bottom: 2px solid var(--primary-color);
    }
    :host([disabled]) .uc-sel-wrap {
      opacity: 0.5;
    }
    select {
      appearance: none;
      -webkit-appearance: none;
      width: 100%;
      min-height: 48px;
      box-sizing: border-box;
      border: none;
      outline: none;
      background: transparent;
      color: var(--primary-text-color);
      font: inherit;
      font-size: 16px;
      padding: 12px 40px 12px 12px;
      cursor: pointer;
    }
    select:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    option {
      color: var(--primary-text-color);
      background: var(--card-background-color, var(--primary-background-color, #fff));
    }
    .uc-sel-arrow {
      position: absolute;
      right: 12px;
      top: 50%;
      width: 0;
      height: 0;
      margin-top: -2px;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid var(--secondary-text-color);
      pointer-events: none;
    }
  `;

  private _onChange(e: Event): void {
    e.stopPropagation();
    const next = (e.target as HTMLSelectElement).value;
    if (next === this.value) return;
    this.value = next;
    this.dispatchEvent(new CustomEvent('selected', { detail: { value: next } }));
  }

  protected override render() {
    const current = this.value ?? '';
    const known = this.options.some(o => o.value === current);
    return html`
      ${this.label ? html`<label class="uc-sel-label">${this.label}</label>` : nothing}
      <div class="uc-sel-wrap">
        <select
          aria-label=${this.label || nothing}
          ?disabled=${this.disabled}
          @change=${this._onChange}
        >
          ${known ? nothing : html`<option value="" ?selected=${true} disabled hidden></option>`}
          ${this.options.map(
            o =>
              html`<option
                value=${o.value}
                ?selected=${o.value === current}
                ?disabled=${!!o.disabled}
              >
                ${o.label}
              </option>`
          )}
        </select>
        <span class="uc-sel-arrow"></span>
      </div>
    `;
  }
}

if (!customElements.get('uc-select')) {
  customElements.define('uc-select', UcSelect);
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-select': UcSelect;
  }
}

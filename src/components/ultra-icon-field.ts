import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

/**
 * `<ultra-icon-field>` — Icon picker framed like other editor fields.
 *
 * IMPORTANT (consistency rule):
 * ALWAYS use this component (via `BaseUltraModule.renderIconField`) for any icon
 * picker in a module editor. NEVER hand-roll a `<ha-icon-picker>` with custom
 * `field-title` / `field-description` markup around it — those produce per-module
 * spacing inconsistencies (some have manual font-size overrides, some are bare,
 * some sit inside an `ha-form`), which breaks Ultra Card's "every module looks
 * the same" guarantee.
 *
 * Wraps `<ha-icon-picker>` with the same field-title / field-description typography
 * used by all other shared field helpers (`renderFieldSection`, `renderSliderField`,
 * `renderFileField`, `renderSegmentedField`, etc.).
 *
 * Emits `value-changed` with `{ value: string }`.
 */
@customElement('ultra-icon-field')
export class UltraIconField extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;

  @property({ type: String }) label = '';

  @property({ type: String }) description = '';

  @property({ type: String }) value = '';

  @property({ type: Boolean }) disabled = false;

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
    }
    .uc-if-label {
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin-bottom: 4px;
      display: block;
    }
    .uc-if-desc {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
      opacity: 0.85;
      line-height: 1.4;
      display: block;
    }
    ha-icon-picker {
      display: block;
      width: 100%;
      --mdc-theme-primary: var(--primary-color);
    }
  `;

  private _onChange(e: CustomEvent<{ value: string }>) {
    const v = e.detail?.value ?? '';
    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: v },
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    return html`
      ${this.label ? html`<span class="uc-if-label">${this.label}</span>` : nothing}
      ${this.description ? html`<span class="uc-if-desc">${this.description}</span>` : nothing}
      <ha-icon-picker
        .hass=${this.hass}
        .value=${this.value || ''}
        ?disabled=${this.disabled}
        @value-changed=${this._onChange}
      ></ha-icon-picker>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ultra-icon-field': UltraIconField;
  }
}

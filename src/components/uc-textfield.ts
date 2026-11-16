import { LitElement, html, css, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';

/**
 * `<uc-textfield>` — Ultra Card's own text input.
 *
 * Home Assistant removed `<ha-textfield>` in its 2026 frontend (replaced by
 * `<ha-input>`). Any editor field still using `<ha-textfield>` renders as an
 * empty unknown element on current HA, which is how the Light Control preset
 * name field disappeared (GitHub #247). This element does not depend on any HA
 * internal component, so it works on every HA version.
 *
 * Drop-in for the subset of the `ha-textfield` API the card used:
 * `.value`, `type`, `placeholder`, `label`, `helper`, `min`, `max`, `step`,
 * `inputmode`, `maxlength`, `multiline` + `rows`, `disabled`, and the `leadingIcon` /
 * `suffix` slots. Native `input` and `change` events bubble out of the shadow
 * root, so `e.target.value` keeps working in existing handlers.
 */
export class UcTextfield extends LitElement {
  @property() value = '';
  @property() type = 'text';
  @property() placeholder = '';
  @property() label = '';
  @property() helper = '';
  @property() min?: string;
  @property() max?: string;
  @property() step?: string;
  @property() inputmode?: string;
  @property({ type: Number }) maxlength?: number;
  @property({ type: Boolean }) multiline = false;
  @property({ type: Number }) rows = 3;
  @property({ type: Boolean, reflect: true }) disabled = false;

  @query('.uc-tf-input') private _input?: HTMLInputElement | HTMLTextAreaElement;

  static override styles = css`
    :host {
      display: inline-block;
      box-sizing: border-box;
      min-width: 0;
    }
    .uc-tf-label {
      display: block;
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }
    .uc-tf-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      box-sizing: border-box;
      width: 100%;
      min-height: 48px;
      padding: 0 12px;
      border-radius: var(--ha-border-radius-sm, 4px) var(--ha-border-radius-sm, 4px) 0 0;
      background: var(
        --input-fill-color,
        var(--secondary-background-color, rgba(127, 127, 127, 0.08))
      );
      border-bottom: 1px solid
        var(--input-idle-line-color, var(--divider-color, rgba(127, 127, 127, 0.4)));
      transition: border-color 0.15s ease;
    }
    .uc-tf-wrap.multiline {
      align-items: flex-start;
      padding: 10px 12px;
    }
    .uc-tf-wrap:focus-within {
      border-bottom: 2px solid var(--primary-color);
    }
    :host([disabled]) .uc-tf-wrap {
      opacity: 0.5;
    }
    .uc-tf-input {
      flex: 1 1 auto;
      min-width: 0;
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: var(--primary-text-color);
      font: inherit;
      font-size: 16px;
      line-height: 1.4;
      padding: 12px 0;
      box-sizing: border-box;
    }
    .uc-tf-input:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    textarea.uc-tf-input {
      padding: 0;
      resize: vertical;
      font-family: var(--code-font-family, monospace);
      font-size: 14px;
    }
    .uc-tf-input::placeholder {
      color: var(--secondary-text-color);
      opacity: 0.7;
    }
    ::slotted([slot='leadingIcon']) {
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
      flex: 0 0 auto;
    }
    ::slotted([slot='suffix']) {
      color: var(--secondary-text-color);
      flex: 0 0 auto;
    }
    .uc-tf-helper {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin: 4px 12px 0;
    }
  `;

  override focus(options?: FocusOptions): void {
    this._input?.focus(options);
  }

  private _onInput(e: Event): void {
    this.value = (e.target as HTMLInputElement).value;
  }

  protected override render() {
    const field = this.multiline
      ? html`<textarea
          class="uc-tf-input"
          .value=${this.value ?? ''}
          rows=${this.rows}
          placeholder=${this.placeholder || nothing}
          aria-label=${this.label || this.placeholder || nothing}
          ?disabled=${this.disabled}
          @input=${this._onInput}
        ></textarea>`
      : html`<input
          class="uc-tf-input"
          .value=${this.value ?? ''}
          type=${this.type || 'text'}
          placeholder=${this.placeholder || nothing}
          min=${this.min ?? nothing}
          max=${this.max ?? nothing}
          step=${this.step ?? nothing}
          inputmode=${this.inputmode ?? nothing}
          maxlength=${this.maxlength ?? nothing}
          aria-label=${this.label || this.placeholder || nothing}
          ?disabled=${this.disabled}
          @input=${this._onInput}
        />`;
    return html`
      ${this.label ? html`<label class="uc-tf-label">${this.label}</label>` : nothing}
      <div class="uc-tf-wrap ${this.multiline ? 'multiline' : ''}">
        <slot name="leadingIcon"></slot>
        ${field}
        <slot name="suffix"></slot>
      </div>
      ${this.helper ? html`<div class="uc-tf-helper">${this.helper}</div>` : nothing}
    `;
  }
}

if (!customElements.get('uc-textfield')) {
  customElements.define('uc-textfield', UcTextfield);
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-textfield': UcTextfield;
  }
}

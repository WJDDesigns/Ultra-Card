import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

@customElement('ultra-navigation-picker')
export class NavigationPicker extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public value = '';
  @property() public label = 'Navigation Target';
  @property() public helper?: string;
  @property({ type: Boolean }) public disabled = false;

  private _valueChanged(ev: CustomEvent) {
    const value = ev.detail.value;
    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render() {
    // Use Home Assistant's native navigation selector if available
    // This should render exactly like native Home Assistant navigation selector
    return html`
      <div class="navigation-picker">
        ${this.label ? html`<label class="label">${this.label}</label>` : ''}
        ${this.helper ? html`<div class="helper">${this.helper}</div>` : ''}

        <ha-selector
          .hass=${this.hass}
          .selector=${{ navigation: {} }}
          .value=${this.value}
          .disabled=${this.disabled}
          @value-changed=${this._valueChanged}
        ></ha-selector>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .navigation-picker {
      width: 100%;
    }

    .label {
      display: block;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 8px;
    }

    .helper {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
    }

    ha-selector {
      width: 100%;
      display: block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'ultra-navigation-picker': NavigationPicker;
  }
}

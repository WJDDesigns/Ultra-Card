import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';

@customElement('ultra-card-entity-picker')
export class UltraEntityPicker extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public label!: string;
  @property() public value?: string;
  @property() public entityFilter?: (entityId: string) => boolean;

  // Add CSS to improve visibility
  static get styles() {
    return css`
      ha-entity-picker {
        width: 100%;
        display: block;
      }
    `;
  }

  protected render() {
    return html`
      <ha-entity-picker
        .hass=${this.hass}
        .label=${this.label}
        .value=${this.value || ''}
        .entityFilter=${this.entityFilter}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>
    `;
  }

  private _valueChanged(ev) {
    ev.stopPropagation();
    const value = ev.detail.value;
    if (value !== this.value) {
      this.value = value;
      fireEvent(this, 'value-changed', { value });
    }
  }
}

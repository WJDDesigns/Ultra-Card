import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';

type EntityPickerFilter = (entityId: string) => boolean;

@customElement('ultra-card-entity-picker')
export class UltraEntityPicker extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public label!: string;
  @property() public value: string | undefined;
  @property() public entityFilter: EntityPickerFilter | undefined;

  // Add CSS to improve visibility
  static override get styles() {
    return css`
      ha-entity-picker {
        width: 100%;
        display: block;
      }
    `;
  }

  protected override render() {
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

  private _valueChanged(ev: CustomEvent<{ value: string }>) {
    ev.stopPropagation();
    const value = ev.detail.value;
    if (value !== this.value) {
      this.value = value;
      fireEvent(this, 'value-changed', { value });
    }
  }
}

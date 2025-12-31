import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';

/**
 * Entity picker component with domain filtering for entity mapping dialog
 */
@customElement('uc-entity-picker')
export class UcEntityPicker extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: String }) public value?: string;
  @property({ type: String }) public domain?: string;
  @property({ type: Boolean }) public disabled = false;
  @property({ type: String }) public label = 'Entity';

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }

      ha-entity-picker {
        width: 100%;
        display: block;
      }

      ha-entity-picker[disabled] {
        opacity: 0.5;
        pointer-events: none;
      }
    `;
  }

  protected render(): TemplateResult {
    return html`
      <ha-entity-picker
        .hass="${this.hass}"
        .value="${this.value || ''}"
        .label="${this.label}"
        .entityFilter="${this._entityFilter.bind(this)}"
        .disabled="${this.disabled}"
        @value-changed="${this._handleValueChanged}"
        allow-custom-entity
      ></ha-entity-picker>
    `;
  }

  /**
   * Filter entities by domain if specified
   */
  private _entityFilter(entityId: string): boolean {
    if (!this.domain) {
      return true;
    }

    const entityDomain = entityId.split('.')[0];
    return entityDomain === this.domain;
  }

  /**
   * Handle entity value change
   */
  private _handleValueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    const value = ev.detail.value;

    if (value !== this.value) {
      this.value = value;
      fireEvent(this, 'value-changed', { value });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-entity-picker': UcEntityPicker;
  }
}


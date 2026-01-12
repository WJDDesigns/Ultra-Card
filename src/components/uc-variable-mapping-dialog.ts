import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ucCustomVariablesService } from '../services/uc-custom-variables-service';
import { localize } from '../localize/localize';

export interface VariableMapping {
  variableName: string;
  entity: string;
  valueType: 'entity_id' | 'state' | 'attribute';
  attributeName?: string;
  shouldCreate: boolean;
}

/**
 * Dialog for mapping missing variables during card import
 * Allows users to create variables that are referenced in imported cards
 */
@customElement('uc-variable-mapping-dialog')
export class UcVariableMappingDialog extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ type: Array }) public missingVariables: string[] = [];
  @property({ type: Boolean }) public open = false;

  @state() private _mappings: Map<string, VariableMapping> = new Map();

  connectedCallback(): void {
    super.connectedCallback();
    this._initializeMappings();
  }

  updated(changedProperties: Map<string, any>): void {
    if (changedProperties.has('missingVariables')) {
      this._initializeMappings();
    }
  }

  private _initializeMappings(): void {
    this._mappings = new Map();
    for (const varName of this.missingVariables) {
      this._mappings.set(varName, {
        variableName: varName,
        entity: '',
        valueType: 'state',
        shouldCreate: true,
      });
    }
    this.requestUpdate();
  }

  private _handleEntityChange(varName: string, entity: string): void {
    const mapping = this._mappings.get(varName);
    if (mapping) {
      mapping.entity = entity;
      this._mappings.set(varName, mapping);
      this.requestUpdate();
    }
  }

  private _handleValueTypeChange(varName: string, valueType: 'entity_id' | 'state' | 'attribute'): void {
    const mapping = this._mappings.get(varName);
    if (mapping) {
      mapping.valueType = valueType;
      this._mappings.set(varName, mapping);
      this.requestUpdate();
    }
  }

  private _handleShouldCreateChange(varName: string, shouldCreate: boolean): void {
    const mapping = this._mappings.get(varName);
    if (mapping) {
      mapping.shouldCreate = shouldCreate;
      this._mappings.set(varName, mapping);
      this.requestUpdate();
    }
  }

  private _handleConfirm(): void {
    // Build array of card-specific variables to create
    // Variables created from imports should be local to the card by default
    const cardVarsToCreate: Array<{
      name: string;
      entity: string;
      valueType: 'entity_id' | 'state' | 'attribute';
      attributeName?: string;
    }> = [];

    for (const [varName, mapping] of this._mappings) {
      if (mapping.shouldCreate && mapping.entity) {
        cardVarsToCreate.push({
          name: mapping.variableName,
          entity: mapping.entity,
          valueType: mapping.valueType,
          attributeName: mapping.attributeName,
        });
      }
    }

    // Dispatch confirm event with variables to create
    // Parent component should add these to config._customVariables as card-specific
    this.dispatchEvent(new CustomEvent('confirm', {
      detail: { 
        mappings: Array.from(this._mappings.values()),
        cardVarsToCreate, // Pass variables to be created as card-specific
      },
      bubbles: true,
      composed: true,
    }));

    this.open = false;
  }

  private _handleCancel(): void {
    this.dispatchEvent(new CustomEvent('cancel', {
      bubbles: true,
      composed: true,
    }));
    this.open = false;
  }

  private _handleSkipAll(): void {
    this.dispatchEvent(new CustomEvent('skip', {
      bubbles: true,
      composed: true,
    }));
    this.open = false;
  }

  protected render(): TemplateResult {
    if (!this.open || this.missingVariables.length === 0) {
      return html``;
    }

    const lang = this.hass?.locale?.language || 'en';

    return html`
      <div class="dialog-overlay" @click=${this._handleCancel}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <h2>${localize('editor.variable_mapping.title', lang, 'Map Missing Variables')}</h2>
            <button class="close-btn" @click=${this._handleCancel}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="dialog-content">
            <p class="dialog-description">
              ${localize(
                'editor.variable_mapping.description',
                lang,
                'This card uses the following variables that are not in your system. Map them to entities to create them, or skip to import without them.'
              )}
            </p>

            <div class="variable-list">
              ${this.missingVariables.map(varName => this._renderVariableMapping(varName, lang))}
            </div>
          </div>

          <div class="dialog-actions">
            <button class="skip-btn" @click=${this._handleSkipAll}>
              ${localize('editor.variable_mapping.skip', lang, 'Skip All')}
            </button>
            <button class="confirm-btn" @click=${this._handleConfirm}>
              <ha-icon icon="mdi:check"></ha-icon>
              ${localize('editor.variable_mapping.create', lang, 'Create Variables')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderVariableMapping(varName: string, lang: string): TemplateResult {
    const mapping = this._mappings.get(varName);
    if (!mapping) return html``;

    return html`
      <div class="variable-item ${mapping.shouldCreate ? '' : 'disabled'}">
        <div class="variable-header">
          <label class="checkbox-label">
            <input
              type="checkbox"
              .checked=${mapping.shouldCreate}
              @change=${(e: Event) => {
                this._handleShouldCreateChange(varName, (e.target as HTMLInputElement).checked);
              }}
            />
            <span class="variable-name">$${varName}</span>
          </label>
        </div>

        ${mapping.shouldCreate ? html`
          <div class="variable-fields">
            <div class="field">
              <label>${localize('editor.custom_variables.select_entity', lang, 'Entity')}</label>
              <ha-form
                .hass=${this.hass}
                .data=${{ entity: mapping.entity }}
                .schema=${[{
                  name: 'entity',
                  selector: { entity: {} }
                }]}
                .computeLabel=${() => ''}
                @value-changed=${(e: CustomEvent) => {
                  const val = e.detail.value?.entity;
                  if (val !== undefined) {
                    this._handleEntityChange(varName, val || '');
                  }
                }}
              ></ha-form>
            </div>

            <div class="field">
              <label>${localize('editor.custom_variables.value_type', lang, 'Value Type')}</label>
              <ha-select
                .value=${mapping.valueType}
                @selected=${(e: CustomEvent) => {
                  this._handleValueTypeChange(varName, (e.target as any).value);
                }}
                @closed=${(e: Event) => e.stopPropagation()}
              >
                <mwc-list-item value="entity_id">Entity ID</mwc-list-item>
                <mwc-list-item value="state">State Value</mwc-list-item>
                <mwc-list-item value="attribute">Attribute</mwc-list-item>
              </ha-select>
            </div>
          </div>
        ` : html`
          <div class="skipped-message">
            ${localize('editor.variable_mapping.skipped', lang, 'Will not be created')}
          </div>
        `}
      </div>
    `;
  }

  static get styles() {
    return css`
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }

      .dialog {
        background: var(--card-background-color, white);
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color);
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: var(--secondary-text-color);
        border-radius: 4px;
      }

      .close-btn:hover {
        background: var(--secondary-background-color);
      }

      .dialog-content {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }

      .dialog-description {
        margin: 0 0 20px 0;
        color: var(--secondary-text-color);
        font-size: 14px;
        line-height: 1.5;
      }

      .variable-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .variable-item {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
      }

      .variable-item.disabled {
        opacity: 0.6;
      }

      .variable-header {
        margin-bottom: 12px;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .checkbox-label input {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .variable-name {
        font-family: var(--code-font-family, monospace);
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-color);
      }

      .variable-fields {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .field label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 6px;
      }

      .field ha-form {
        display: block;
      }

      .field ha-select {
        width: 100%;
      }

      .skipped-message {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid var(--divider-color);
      }

      .skip-btn,
      .confirm-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .skip-btn {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
      }

      .skip-btn:hover {
        background: var(--primary-background-color);
      }

      .confirm-btn {
        background: var(--primary-color);
        color: white;
      }

      .confirm-btn:hover {
        opacity: 0.9;
      }

      @media (max-width: 500px) {
        .dialog {
          width: 95%;
          max-height: 90vh;
        }

        .dialog-actions {
          flex-direction: column;
        }

        .skip-btn,
        .confirm-btn {
          width: 100%;
          justify-content: center;
        }
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-variable-mapping-dialog': UcVariableMappingDialog;
  }
}

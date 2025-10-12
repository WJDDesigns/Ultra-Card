// @deprecated - No longer used. External cards now use standard module popup. Kept for backward compatibility only.

import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ExternalCardModule } from '../types';
import { ucExternalCardsService } from '../services/uc-external-cards-service';

@customElement('uc-native-card-dialog')
export class UcNativeCardDialog extends LitElement {
  @property({ attribute: false }) public module!: ExternalCardModule;
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public open = false;

  @state() private _config: any = {};
  @state() private _editorElement: any = null;
  @state() private _previewElement: any = null;

  updated(changedProps: Map<string, any>) {
    super.updated(changedProps);

    if (changedProps.has('open') && this.open) {
      this._config = { ...this.module.card_config };
      this._createEditor();
      this._createPreview();
    }

    if (changedProps.has('_config')) {
      this._updatePreview();
    }
  }

  private _createEditor() {
    requestAnimationFrame(() => {
      const container = this.shadowRoot?.querySelector('.editor-container');
      if (!container || !this.module.card_type) return;

      // Clear existing editor
      container.innerHTML = '';

      try {
        const editorType = `${this.module.card_type}-editor`;
        const editor = document.createElement(editorType) as any;

        // Check if editor is actually a custom element
        if (editor instanceof HTMLUnknownElement) {
          console.warn(`Native editor not available for ${this.module.card_type}`);
          container.innerHTML = `
            <div class="no-editor">
              <ha-icon icon="mdi:information"></ha-icon>
              <p>This card does not have a visual editor.</p>
              <p>Configure it using the YAML editor in Ultra Card settings.</p>
            </div>
          `;
          return;
        }

        // Set config and hass
        if (typeof editor.setConfig === 'function') {
          editor.setConfig(this._config);
        } else {
          editor.config = this._config;
        }
        editor.hass = this.hass;

        // Listen for config changes
        editor.addEventListener('config-changed', (e: CustomEvent) => {
          e.stopPropagation();
          if (e.detail && e.detail.config) {
            this._config = { ...e.detail.config };
            this.requestUpdate();
          }
        });

        this._editorElement = editor;
        container.appendChild(editor);
      } catch (error) {
        console.error('Failed to create native editor:', error);
        container.innerHTML = `
          <div class="editor-error">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <p>Failed to load editor</p>
          </div>
        `;
      }
    });
  }

  private _createPreview() {
    requestAnimationFrame(() => {
      const container = this.shadowRoot?.querySelector('.preview-container');
      if (!container || !this.module.card_type) return;

      this._updatePreviewContainer(container);
    });
  }

  private _updatePreview() {
    const container = this.shadowRoot?.querySelector('.preview-container');
    if (!container) return;

    this._updatePreviewContainer(container);
  }

  private _updatePreviewContainer(container: Element) {
    // Clear existing preview
    container.innerHTML = '';

    try {
      const preview = ucExternalCardsService.createCardElement(
        this.module.card_type,
        this._config,
        this.hass
      );

      if (preview) {
        this._previewElement = preview;
        container.appendChild(preview);
      } else {
        container.innerHTML = `
          <div class="preview-placeholder">
            <ha-icon icon="mdi:eye-off"></ha-icon>
            <p>No preview available</p>
          </div>
        `;
      }
    } catch (error) {
      container.innerHTML = `
        <div class="preview-placeholder">
          <ha-icon icon="mdi:cog"></ha-icon>
          <p>Configuring card...</p>
        </div>
      `;
    }
  }

  private _handleSave() {
    this.dispatchEvent(
      new CustomEvent('save', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleCancel() {
    this.dispatchEvent(
      new CustomEvent('cancel', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleDuplicate() {
    this.dispatchEvent(
      new CustomEvent('duplicate', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleDelete() {
    this.dispatchEvent(
      new CustomEvent('delete', {
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render(): TemplateResult {
    if (!this.open) return html``;

    const cardInfo = ucExternalCardsService.getCardInfo(this.module.card_type);
    const cardName = cardInfo?.name || this.module.name || this.module.card_type;

    return html`
      <div class="dialog-backdrop" @click=${this._handleCancel}>
        <div class="dialog-container" @click=${(e: Event) => e.stopPropagation()}>
          <!-- Dialog Header -->
          <div class="dialog-header">
            <h2>${cardName} configuration</h2>
            <button class="close-button" @click=${this._handleCancel}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <!-- Dialog Content: Two Column Layout -->
          <div class="dialog-content">
            <!-- Left: Editor -->
            <div class="editor-panel">
              <div class="panel-header">
                <ha-icon icon="mdi:cog"></ha-icon>
                <span>Config</span>
              </div>
              <div class="editor-container"></div>
            </div>

            <!-- Right: Preview -->
            <div class="preview-panel">
              <div class="panel-header">
                <ha-icon icon="mdi:eye"></ha-icon>
                <span>Preview</span>
              </div>
              <div class="preview-wrapper">
                <div class="preview-container"></div>
              </div>
            </div>
          </div>

          <!-- Dialog Actions -->
          <div class="dialog-actions">
            <div class="actions-left">
              <button class="action-button duplicate-button" @click=${this._handleDuplicate}>
                <ha-icon icon="mdi:content-copy"></ha-icon>
                <span>Duplicate</span>
              </button>
              <button class="action-button delete-button" @click=${this._handleDelete}>
                <ha-icon icon="mdi:delete"></ha-icon>
                <span>Delete</span>
              </button>
            </div>
            <div class="actions-right">
              <button class="action-button cancel-button" @click=${this._handleCancel}>
                Cancel
              </button>
              <button class="action-button save-button" @click=${this._handleSave}>Save</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }

      .dialog-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .dialog-container {
        background: var(--card-background-color, #fff);
        border-radius: 8px;
        width: 100%;
        max-width: 1200px;
        height: 90vh;
        max-height: 900px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid var(--divider-color);
        background: var(--card-background-color);
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .close-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        color: var(--secondary-text-color);
        border-radius: 4px;
        transition: all 0.2s;
      }

      .close-button:hover {
        background: var(--secondary-background-color);
        color: var(--primary-color);
      }

      .close-button ha-icon {
        --mdc-icon-size: 24px;
      }

      .dialog-content {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        overflow: hidden;
      }

      .editor-panel,
      .preview-panel {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .editor-panel {
        border-right: 1px solid var(--divider-color);
      }

      .panel-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px 24px;
        background: var(--secondary-background-color);
        border-bottom: 1px solid var(--divider-color);
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .panel-header ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .editor-container {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 24px;
      }

      .editor-container > * {
        width: 100%;
        box-sizing: border-box;
      }

      .preview-wrapper {
        flex: 1;
        overflow-y: auto;
        background: var(
          --view-background,
          var(--lovelace-background, var(--primary-background-color))
        );
        padding: 24px;
      }

      .preview-container {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
      }

      .preview-container > * {
        width: 100%;
      }

      .preview-placeholder,
      .no-editor,
      .editor-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
        color: var(--secondary-text-color);
      }

      .preview-placeholder ha-icon,
      .no-editor ha-icon,
      .editor-error ha-icon {
        --mdc-icon-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .no-editor p,
      .editor-error p,
      .preview-placeholder p {
        margin: 8px 0;
        font-size: 14px;
      }

      .dialog-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-top: 1px solid var(--divider-color);
        background: var(--card-background-color);
      }

      .actions-left,
      .actions-right {
        display: flex;
        gap: 12px;
      }

      .action-button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: inherit;
      }

      .action-button ha-icon {
        --mdc-icon-size: 18px;
      }

      .save-button {
        background: var(--primary-color);
        color: white;
      }

      .save-button:hover {
        background: var(--primary-color-hover, var(--primary-color));
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(var(--rgb-primary-color), 0.3);
      }

      .cancel-button {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .cancel-button:hover {
        background: var(--divider-color);
      }

      .duplicate-button {
        background: var(--secondary-background-color);
        color: var(--primary-color);
      }

      .duplicate-button:hover {
        background: var(--primary-color);
        color: white;
      }

      .delete-button {
        background: var(--secondary-background-color);
        color: var(--error-color);
      }

      .delete-button:hover {
        background: var(--error-color);
        color: white;
      }

      /* Responsive */
      @media (max-width: 900px) {
        .dialog-content {
          grid-template-columns: 1fr;
        }

        .editor-panel {
          border-right: none;
          border-bottom: 1px solid var(--divider-color);
        }

        .preview-panel {
          display: none; /* Hide preview on small screens */
        }
      }
    `;
  }
}

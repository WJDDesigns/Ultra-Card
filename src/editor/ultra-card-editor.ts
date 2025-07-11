import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../types';
import { configValidationService } from '../services/config-validation-service';
import './tabs/about-tab';
import './tabs/layout-tab';
import '../components/ultra-color-picker';

type EditorTab = 'layout' | 'settings' | 'about';

@customElement('ultra-card-editor')
export class UltraCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public config!: UltraCardConfig;
  @state() private _activeTab: EditorTab = 'layout';
  @state() private _configDebounceTimeout?: number;

  public setConfig(config: UltraCardConfig): void {
    this.config = config || {
      type: 'custom:ultra-card',
      layout: { rows: [] },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('config-changed', this._handleConfigChanged as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('config-changed', this._handleConfigChanged as EventListener);
  }

  private _handleConfigChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (ev.detail && ev.detail.config) {
      this.config = ev.detail.config;
      // Only re-dispatch if this isn't already a bubbled event to prevent infinite loops
      if (!ev.detail.isInternal) {
        const event = new CustomEvent('config-changed', {
          detail: { config: ev.detail.config, isInternal: true },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      }
    }
  }

  private _updateConfig(updates: Partial<UltraCardConfig>): void {
    const newConfig = { ...this.config, ...updates };

    // Clear existing debounce timeout
    if (this._configDebounceTimeout) {
      clearTimeout(this._configDebounceTimeout);
    }

    // Debounce the validation to prevent excessive calls
    this._configDebounceTimeout = window.setTimeout(() => {
      // Validate config before dispatching
      const validationResult = configValidationService.validateAndCorrectConfig(newConfig);

      if (!validationResult.valid) {
        console.error('❌ Ultra Card Editor: Config validation failed', {
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        });
        // Still dispatch the original config rather than failing completely
        // This allows the editor to continue working even with validation issues
        const event = new CustomEvent('config-changed', {
          detail: { config: newConfig, isInternal: true },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
        return;
      }

      // Check for duplicate module IDs and fix them
      const uniqueIdCheck = configValidationService.validateUniqueModuleIds(
        validationResult.correctedConfig!
      );

      let finalConfig = validationResult.correctedConfig!;
      if (!uniqueIdCheck.valid) {
        console.warn('⚠️  Ultra Card Editor: Duplicate module IDs detected, fixing...', {
          duplicates: uniqueIdCheck.duplicates,
        });
        finalConfig = configValidationService.fixDuplicateModuleIds(finalConfig);
      }

      // Only log validation info when there are meaningful warnings
      if (validationResult.warnings.length > 0) {
        console.info('ℹ️  Ultra Card: Config corrected with warnings', {
          warnings: validationResult.warnings.length,
        });
      }

      const event = new CustomEvent('config-changed', {
        detail: { config: finalConfig, isInternal: true },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }, 100); // 100ms debounce delay
  }

  protected render() {
    if (!this.hass || !this.config) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <div class="card-config">
        <div class="tabs">
          <button
            class="tab ${this._activeTab === 'layout' ? 'active' : ''}"
            @click=${() => (this._activeTab = 'layout')}
          >
            Layout Builder
          </button>
          <button
            class="tab ${this._activeTab === 'settings' ? 'active' : ''}"
            @click=${() => (this._activeTab = 'settings')}
          >
            Settings
          </button>
          <button
            class="tab ${this._activeTab === 'about' ? 'active' : ''}"
            @click=${() => (this._activeTab = 'about')}
          >
            About
          </button>
        </div>

        <div class="tab-content">
          ${this._activeTab === 'layout'
            ? html`<ultra-layout-tab .hass=${this.hass} .config=${this.config}></ultra-layout-tab>`
            : this._activeTab === 'settings'
              ? this._renderSettingsTab()
              : html`<ultra-about-tab .hass=${this.hass}></ultra-about-tab>`}
        </div>
      </div>
    `;
  }

  private _renderSettingsTab() {
    const defaultCardBackground = 'var(--card-background-color)'; // Use HA default

    return html`
      <div class="settings-tab">
        <div class="settings-header">
          <h3>Card Settings</h3>
          <p>Configure global card appearance and behavior.</p>
        </div>

        <div class="settings-container">
          <!-- Appearance Section -->
          <div class="settings-section">
            <div class="section-header">
              <h4>Appearance</h4>
              <p>Control the visual appearance of your card</p>
            </div>

            <div class="settings-grid">
              <div class="setting-item">
                <label>Card Background Color</label>
                <div class="setting-description">The background color of the entire card</div>
                <ultra-color-picker
                  .label=${'Card Background Color'}
                  .value=${this.config.card_background || defaultCardBackground}
                  .defaultValue=${defaultCardBackground}
                  .hass=${this.hass}
                  @value-changed=${(e: CustomEvent) =>
                    this._updateConfig({ card_background: e.detail.value })}
                ></ultra-color-picker>
              </div>

              <div class="setting-item">
                <label>Border Radius</label>
                <div class="setting-description">Rounded corners for the card (in pixels)</div>
                <div class="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    .value=${this.config.card_border_radius || 8}
                    @change=${(e: Event) =>
                      this._updateConfig({
                        card_border_radius: Number((e.target as HTMLInputElement).value),
                      })}
                  />
                  <span class="unit">px</span>
                  <button
                    class="reset-btn"
                    @click=${() => this._updateConfig({ card_border_radius: 8 })}
                    title="Reset to default (8px)"
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Spacing Section -->
          <div class="settings-section">
            <div class="section-header">
              <h4>Spacing</h4>
              <p>Control the spacing and positioning of your card</p>
            </div>

            <div class="settings-grid">
              <div class="setting-item">
                <label>Card Padding</label>
                <div class="setting-description">Internal spacing within the card</div>
                <div class="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    .value=${this.config.card_padding || 16}
                    @change=${(e: Event) =>
                      this._updateConfig({
                        card_padding: Number((e.target as HTMLInputElement).value),
                      })}
                  />
                  <span class="unit">px</span>
                  <button
                    class="reset-btn"
                    @click=${() => this._updateConfig({ card_padding: 16 })}
                    title="Reset to default (16px)"
                  >
                    ↺
                  </button>
                </div>
              </div>

              <div class="setting-item">
                <label>Card Margin</label>
                <div class="setting-description">External spacing around the card</div>
                <div class="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    .value=${this.config.card_margin || 0}
                    @change=${(e: Event) =>
                      this._updateConfig({
                        card_margin: Number((e.target as HTMLInputElement).value),
                      })}
                  />
                  <span class="unit">px</span>
                  <button
                    class="reset-btn"
                    @click=${() => this._updateConfig({ card_margin: 0 })}
                    title="Reset to default (0px)"
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .card-config {
        padding: 16px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .tabs {
        display: flex;
        border-bottom: 2px solid var(--divider-color);
        margin-bottom: 16px;
      }

      .tab {
        background: none;
        border: none;
        padding: 12px 16px;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
        flex: 1;
        text-align: center;
      }

      .tab:hover {
        color: var(--primary-color);
      }

      .tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .tab-content {
        min-height: 400px;
      }

      .settings-tab {
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 8px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .settings-header {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .settings-header h3 {
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
        font-size: 18px;
        font-weight: 600;
      }

      .settings-header p {
        margin: 0;
        color: var(--secondary-text-color);
        font-size: 14px;
        line-height: 1.4;
      }

      .settings-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        flex: 1;
      }

      .settings-section {
        background: var(--secondary-background-color);
        border: 2px solid var(--primary-color);
        border-radius: 8px;
        padding: 20px;
        box-sizing: border-box;
      }

      .section-header {
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
      }

      .section-header h4 {
        margin: 0 0 6px 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section-header p {
        margin: 0;
        color: var(--secondary-text-color);
        font-size: 13px;
        line-height: 1.4;
      }

      .settings-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .setting-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .setting-item label {
        color: var(--primary-text-color);
        font-size: 14px;
        font-weight: 500;
        margin: 0;
      }

      .setting-description {
        color: var(--secondary-text-color);
        font-size: 12px;
        line-height: 1.3;
        margin-bottom: 4px;
      }

      .input-with-unit {
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 200px;
      }

      .input-with-unit input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        transition: all 0.2s ease;
        min-width: 0;
      }

      .input-with-unit input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .input-with-unit .unit {
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 500;
        min-width: 20px;
        text-align: center;
      }

      .reset-btn {
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        color: var(--secondary-text-color);
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        padding: 0;
        flex-shrink: 0;
      }

      .reset-btn:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
        transform: scale(1.05);
      }

      .reset-btn:active {
        transform: scale(0.95);
      }

      .setting-item ultra-color-picker {
        max-width: 300px;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .settings-tab {
          padding: 16px 12px;
        }

        .settings-section {
          padding: 16px;
        }

        .settings-grid {
          gap: 16px;
        }
      }
    `;
  }
}

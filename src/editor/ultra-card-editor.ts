import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig } from '../types';
import { configValidationService } from '../services/config-validation-service';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import './tabs/about-tab';
import './tabs/layout-tab';
import '../components/ultra-color-picker';
import '../components/uc-favorite-colors-manager';
import '../components/uc-favorite-dialog';
import '../components/uc-import-dialog';
import { getModuleRegistry } from '../modules';
import { localize } from '../localize/localize';

type EditorTab = 'layout' | 'settings' | 'about';

@customElement('ultra-card-editor')
export class UltraCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public config!: UltraCardConfig;
  @state() private _activeTab: EditorTab = 'layout';
  @state() private _configDebounceTimeout?: number;
  @state() private _isFullScreen: boolean = false;
  @state() private _isMobile: boolean = false;

  /** Flag to ensure module CSS for animations is injected once */
  private _moduleStylesInjected = false;

  public setConfig(config: UltraCardConfig): void {
    this.config = config || {
      type: 'custom:ultra-card',
      layout: { rows: [] },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('config-changed', this._handleConfigChanged as EventListener);
    this.addEventListener('keydown', this._handleKeyDown as EventListener);

    // Detect mobile device
    this._checkMobileDevice();

    // Listen for resize events to update mobile detection
    this._resizeListener = this._checkMobileDevice.bind(this);
    window.addEventListener('resize', this._resizeListener);

    // Inject module-level CSS so previews inside the editor show correct
    // animations (e.g. icon spin, pulse, etc.).
    this._injectModuleStyles();

    // Inject hover effect styles into editor's shadow root
    UcHoverEffectsService.injectHoverEffectStyles(this.shadowRoot!);
  }

  private _resizeListener?: () => void;

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('config-changed', this._handleConfigChanged as EventListener);
    this.removeEventListener('keydown', this._handleKeyDown as EventListener);

    // Clean up hover effect styles
    UcHoverEffectsService.removeHoverEffectStyles(this.shadowRoot!);

    // Clean up resize listener
    if (this._resizeListener) {
      window.removeEventListener('resize', this._resizeListener);
    }

    // Clean up full screen class if still applied
    document.body.classList.remove('ultra-card-fullscreen');
  }

  private _checkMobileDevice(): void {
    // Check viewport width and user agent for mobile detection
    const isMobileViewport = window.innerWidth <= 768;
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    const wasMobile = this._isMobile;
    this._isMobile = isMobileViewport || isMobileUserAgent;

    // If we switched to mobile and are in fullscreen, exit fullscreen
    if (this._isMobile && !wasMobile && this._isFullScreen) {
      this._toggleFullScreen();
    }
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

  private _handleKeyDown(ev: KeyboardEvent): void {
    // Handle escape key to exit fullscreen
    if (ev.key === 'Escape' && this._isFullScreen) {
      ev.preventDefault();
      this._toggleFullScreen();
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
        // Config validation failed in editor (silent); still dispatch original config
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
        // Duplicate module IDs detected; fixing silently
        finalConfig = configValidationService.fixDuplicateModuleIds(finalConfig);
      }

      // Only log validation info when there are meaningful warnings
      // Suppress info logs for warnings

      const event = new CustomEvent('config-changed', {
        detail: { config: finalConfig, isInternal: true },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }, 100); // 100ms debounce delay
  }

  private _toggleFullScreen(): void {
    this._isFullScreen = !this._isFullScreen;

    // Apply/remove the full screen class to the document body to hide preview
    if (this._isFullScreen) {
      document.body.classList.add('ultra-card-fullscreen');
      // Force switch to Layout tab when entering fullscreen mode
      if (this._activeTab !== 'layout') {
        this._activeTab = 'layout';
      }
    } else {
      document.body.classList.remove('ultra-card-fullscreen');
    }
  }

  protected render() {
    if (!this.hass || !this.config) {
      return html`<div>Loading...</div>`;
    }
    const lang = this.hass.locale?.language || 'en';

    return html`
      <div class="card-config ${this._isFullScreen ? 'fullscreen' : ''}">
        <div class="tabs">
          <button
            class="tab ${this._activeTab === 'layout' ? 'active' : ''}"
            @click=${() => (this._activeTab = 'layout')}
          >
            ${this._isFullScreen
              ? 'Ultra Card Layout Builder'
              : localize('editor.tabs.layout', lang, 'Layout Builder')}
          </button>
          ${!this._isFullScreen
            ? html`
                <button
                  class="tab ${this._activeTab === 'settings' ? 'active' : ''}"
                  @click=${() => (this._activeTab = 'settings')}
                >
                  ${localize('editor.tabs.settings', lang, 'Settings')}
                </button>
                <button
                  class="tab ${this._activeTab === 'about' ? 'active' : ''}"
                  @click=${() => (this._activeTab = 'about')}
                >
                  ${localize('editor.tabs.about', lang, 'About')}
                </button>
              `
            : ''}
          ${!this._isMobile
            ? html`
                <button
                  class="fullscreen-toggle"
                  @click=${this._toggleFullScreen}
                  title=${this._isFullScreen
                    ? localize('editor.tooltips.return_dashboard', lang, 'Return to Dashboard')
                    : localize('editor.tooltips.enter_fullscreen', lang, 'Enter Full Screen')}
                >
                  ${this._isFullScreen
                    ? html`
                        <svg viewBox="0 0 24 24" class="arrow-icon">
                          <path d="M15.41,7.41L14,6L8,12L14,18L15.41,16.59L10.83,12L15.41,7.41Z" />
                        </svg>
                        <span class="dashboard-text"
                          >${localize('editor.tooltips.dashboard', lang, 'Dashboard')}</span
                        >
                      `
                    : html`
                        <svg viewBox="0 0 24 24" class="arrow-icon">
                          <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                        </svg>
                      `}
                </button>
              `
            : ''}
        </div>

        <div class="tab-content">
          ${this._activeTab === 'layout'
            ? html`<ultra-layout-tab
                .hass=${this.hass}
                .config=${this.config}
                .isFullScreen=${this._isFullScreen}
              ></ultra-layout-tab>`
            : this._activeTab === 'settings'
              ? this._renderSettingsTab()
              : html`<ultra-about-tab .hass=${this.hass}></ultra-about-tab>`}
        </div>
      </div>
    `;
  }

  private _renderSettingsTab() {
    const lang = this.hass?.locale?.language || 'en';
    const defaultCardBackground = 'var(--card-background-color)'; // Use HA default

    return html`
      <div class="settings-tab">
        <div class="settings-header">
          <h3>${localize('editor.settings.title', lang, 'Card Settings')}</h3>
          <p>
            ${localize(
              'editor.settings.description',
              lang,
              'Configure global card appearance and behavior.'
            )}
          </p>
        </div>

        <div class="settings-container">
          <!-- Appearance Section -->
          <div class="settings-section">
            <div class="section-header">
              <h4>${localize('editor.appearance.title', lang, 'Appearance')}</h4>
              <p>
                ${localize(
                  'editor.appearance.description',
                  lang,
                  'Control the visual appearance of your card'
                )}
              </p>
            </div>

            <div class="settings-grid">
              <div class="setting-item">
                <label>
                  ${localize('editor.fields.card_background_color', lang, 'Card Background Color')}
                </label>
                <div class="setting-description">
                  ${localize(
                    'editor.fields.card_background_color_desc',
                    lang,
                    'The background color of the entire card'
                  )}
                </div>
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
                <label> ${localize('editor.fields.border_radius', lang, 'Border Radius')} </label>
                <div class="setting-description">
                  ${localize(
                    'editor.fields.border_radius_desc',
                    lang,
                    'Rounded corners for the card (in pixels)'
                  )}
                </div>
                <div class="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    .value=${this.config.card_border_radius ?? ''}
                    placeholder="12"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value.trim();
                      this._updateConfig({
                        // Allow clearing to fall back to theme/HA default. Undefined removes the key.
                        card_border_radius: value === '' ? undefined : Number(value),
                      });
                    }}
                  />
                  <span class="unit">${localize('editor.fields.unit_px', lang, 'px')}</span>
                  <button
                    class="reset-btn"
                    @click=${() => this._updateConfig({ card_border_radius: 12 })}
                    title=${localize(
                      'editor.fields.reset_default_value',
                      lang,
                      'Reset to default ({value})'
                    ).replace('{value}', '12px')}
                  >
                    ↺
                  </button>
                </div>
              </div>

              <div class="setting-item">
                <label>
                  ${localize('editor.fields.card_border_color', lang, 'Border Color')}
                </label>
                <div class="setting-description">
                  ${localize(
                    'editor.fields.card_border_color_desc',
                    lang,
                    'The border color of the card'
                  )}
                </div>
                <ultra-color-picker
                  .label=${'Card Border Color'}
                  .value=${this.config.card_border_color || 'var(--divider-color)'}
                  .defaultValue=${'var(--divider-color)'}
                  .hass=${this.hass}
                  @value-changed=${(e: CustomEvent) =>
                    this._updateConfig({ card_border_color: e.detail.value })}
                ></ultra-color-picker>
              </div>

              <div class="setting-item">
                <label>
                  ${localize('editor.fields.card_border_width', lang, 'Border Width')}
                </label>
                <div class="setting-description">
                  ${localize(
                    'editor.fields.card_border_width_desc',
                    lang,
                    'The thickness of the card border (in pixels)'
                  )}
                </div>
                <div class="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    .value=${this.config.card_border_width ?? ''}
                    placeholder="1"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value.trim();
                      this._updateConfig({
                        card_border_width: value === '' ? undefined : Number(value),
                      });
                    }}
                  />
                  <span class="unit">${localize('editor.fields.unit_px', lang, 'px')}</span>
                  <button
                    class="reset-btn"
                    @click=${() => this._updateConfig({ card_border_width: 1 })}
                    title=${localize(
                      'editor.fields.reset_default_value',
                      lang,
                      'Reset to default ({value})'
                    ).replace('{value}', '1px')}
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
              <h4>${localize('editor.spacing.title', lang, 'Spacing')}</h4>
              <p>
                ${localize(
                  'editor.spacing.description',
                  lang,
                  'Control the spacing and positioning of your card'
                )}
              </p>
            </div>

            <div class="settings-grid">
              <div class="setting-item">
                <label>${localize('editor.fields.card_padding', lang, 'Card Padding')}</label>
                <div class="setting-description">
                  ${localize(
                    'editor.fields.card_padding_desc',
                    lang,
                    'Internal spacing within the card'
                  )}
                </div>
                <div class="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    .value=${this.config.card_padding ?? ''}
                    placeholder="16"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value.trim();
                      this._updateConfig({
                        card_padding: value === '' ? 16 : Number(value),
                      });
                    }}
                  />
                  <span class="unit">${localize('editor.fields.unit_px', lang, 'px')}</span>
                  <button
                    class="reset-btn"
                    @click=${() => this._updateConfig({ card_padding: 16 })}
                    title=${localize(
                      'editor.fields.reset_default_value',
                      lang,
                      'Reset to default ({value})'
                    ).replace('{value}', '16px')}
                  >
                    ↺
                  </button>
                </div>
              </div>

              <div class="setting-item">
                <label>${localize('editor.fields.card_margin', lang, 'Card Margin')}</label>
                <div class="setting-description">
                  ${localize(
                    'editor.fields.card_margin_desc',
                    lang,
                    'External spacing around the card'
                  )}
                </div>
                <div class="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    .value=${this.config.card_margin ?? ''}
                    placeholder="0"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value.trim();
                      this._updateConfig({
                        card_margin: value === '' ? 0 : Number(value),
                      });
                    }}
                  />
                  <span class="unit">${localize('editor.fields.unit_px', lang, 'px')}</span>
                  <button
                    class="reset-btn"
                    @click=${() => this._updateConfig({ card_margin: 0 })}
                    title=${localize(
                      'editor.fields.reset_default_value',
                      lang,
                      'Reset to default ({value})'
                    ).replace('{value}', '0px')}
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Behavior Section -->
          <div class="settings-section">
            <div class="section-header">
              <h4>${localize('editor.behavior.title', lang, 'Behavior')}</h4>
              <p>
                ${localize(
                  'editor.behavior.description',
                  lang,
                  'Configure how your card responds to user interactions'
                )}
              </p>
            </div>

            <div class="settings-grid">
              <div class="setting-item">
                <label>
                  ${localize('editor.actions.haptic_feedback', lang, 'Haptic Feedback')}
                </label>
                <div class="setting-description">
                  ${localize(
                    'editor.actions.haptic_feedback_desc',
                    lang,
                    'Provide tactile feedback when buttons are pressed on supported devices'
                  )}
                  <br /><small style="opacity: 0.7;"
                    >Uses Home Assistant's native haptic system. Respects OS-level haptic
                    settings.</small
                  >
                </div>
                <ha-form
                  .hass=${this.hass}
                  .data=${{ haptic_feedback: this.config.haptic_feedback !== false }}
                  .schema=${[
                    {
                      name: 'haptic_feedback',
                      label: '',
                      selector: {
                        boolean: {},
                      },
                    },
                  ]}
                  .computeLabel=${() => ''}
                  @value-changed=${(e: CustomEvent) => {
                    const enabled = (e.detail as any)?.value?.haptic_feedback;
                    if (enabled !== undefined) {
                      this._updateConfig({ haptic_feedback: enabled });
                    }
                  }}
                ></ha-form>
              </div>
            </div>
          </div>

          <!-- Favorite Colors Section -->
          <div class="settings-section">
            <div class="section-header">
              <h4>${localize('editor.favorite_colors.title', lang, 'Favorite Colors')}</h4>
              <p>
                ${localize(
                  'editor.favorite_colors.description',
                  lang,
                  'Manage your favorite colors that appear in all Ultra Card color pickers. These colors sync across all your Ultra Cards.'
                )}
              </p>
            </div>

            <uc-favorite-colors-manager .hass=${this.hass}></uc-favorite-colors-manager>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Inject a <style> element containing the combined CSS returned by the
   * ModuleRegistry so that module previews benefit from their specific styles
   * (especially animations) while editing.
   */
  private _injectModuleStyles(): void {
    if (this._moduleStylesInjected || !this.shadowRoot) return;

    const css = getModuleRegistry().getAllModuleStyles();
    if (css.trim().length) {
      const styleEl = document.createElement('style');
      styleEl.textContent = css;
      this.shadowRoot.appendChild(styleEl);
    }
    this._moduleStylesInjected = true;
  }

  static get styles() {
    return css`
      /* Global styles for hiding preview in full screen */
      :host {
        --ultra-editor-transition: all 0.3s ease;
      }

      .card-config {
        padding: 16px;
        max-width: 100%;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
        transition: var(--ultra-editor-transition);
      }

      /* Full screen mode styles */
      .card-config.fullscreen {
        max-width: none !important;
        width: 100vw !important;
        margin: 0 !important;
        padding: 20px !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        height: 100vh !important;
        z-index: 10000 !important;
        background: var(--card-background-color) !important;
        overflow-y: auto !important;
        box-sizing: border-box !important;
      }

      /* Full screen mode tab content */
      .card-config.fullscreen .tab-content {
        min-height: calc(100vh - 120px) !important;
        width: 100% !important;
        max-width: none !important;
      }

      /* Full screen mode header adjustments */
      .card-config.fullscreen .tabs {
        border: none;
        background: var(--card-background-color);
        padding: 16px;
        position: sticky;
        top: 0;
        z-index: 100;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      /* Remove the gradient line in fullscreen */
      .card-config.fullscreen .tabs::before {
        display: none;
      }

      /* Center the single tab in fullscreen mode and remove borders */
      .card-config.fullscreen .tab {
        flex: none;
        min-width: auto;
        justify-content: center;
        border: none;
        border-radius: 12px;
        background: var(--primary-color);
        color: white;
        padding: 12px 24px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(var(--rgb-primary-color), 0.3);
      }

      .card-config.fullscreen .tab:hover {
        background: var(--primary-color);
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.4);
      }

      /* Hide Home Assistant preview when in full screen mode */
      :global(body.ultra-card-fullscreen) {
        overflow: hidden !important;
      }

      :global(body.ultra-card-fullscreen *) {
        .element-preview,
        .element-preview-container,
        .preview-container,
        .card-preview,
        .preview-pane,
        hui-card-preview,
        .card-config > div:last-child:not(.card-config),
        .card-config-row > div:last-child,
        .mdc-dialog .mdc-dialog__container .mdc-dialog__surface > div:last-child:not(.card-config) {
          display: none !important;
        }

        .card-config-container,
        .editor-container,
        .card-config-row,
        .mdc-dialog .mdc-dialog__container .mdc-dialog__surface {
          width: 100% !important;
          max-width: none !important;
        }

        /* Override HA dialog sizing */
        .mdc-dialog .mdc-dialog__container {
          max-width: 100vw !important;
          width: 100vw !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 9999 !important;
        }

        .mdc-dialog .mdc-dialog__surface {
          max-width: 100vw !important;
          width: 100vw !important;
          max-height: 100vh !important;
          height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          margin: 0 !important;
          border-radius: 0 !important;
        }

        /* Hide the backdrop */
        .mdc-dialog .mdc-dialog__scrim {
          display: none !important;
        }
      }

      /* Allow action forms to display all their elements properly */
      ha-form[data-action-form] *,
      ha-form[data-action-form] .mdc-form-field,
      ha-form[data-action-form] .mdc-text-field,
      ha-form[data-action-form] .mdc-floating-label,
      ha-form[data-action-form] .mdc-notched-outline__leading,
      ha-form[data-action-form] .mdc-notched-outline__notch,
      ha-form[data-action-form] .mdc-notched-outline__trailing,
      ha-form[data-action-form] .mdc-floating-label--float-above,
      ha-form[data-action-form] label,
      ha-form[data-action-form] .ha-form-label,
      ha-form[data-action-form] .form-label,
      ha-form[data-action-form] .mdc-text-field-character-counter,
      ha-form[data-action-form] .mdc-text-field-helper-text,
      ha-form[data-action-form] mwc-formfield,
      ha-form[data-action-form] .formfield {
        display: initial !important;
        visibility: visible !important;
      }

      /* Ensure action forms themselves are visible */
      ha-form[data-action-form] {
        display: block !important;
        visibility: visible !important;
      }

      /* Hide unwanted form labels with underscores - but only for non-action forms */
      ha-form:not([data-action-form]) .mdc-form-field > label,
      ha-form:not([data-action-form]) .mdc-text-field > label,
      ha-form:not([data-action-form]) .mdc-floating-label,
      ha-form:not([data-action-form]) .mdc-notched-outline__leading,
      ha-form:not([data-action-form]) .mdc-notched-outline__notch,
      ha-form:not([data-action-form]) .mdc-notched-outline__trailing,
      ha-form:not([data-action-form]) .mdc-floating-label--float-above,
      ha-form:not([data-action-form]) label[for],
      ha-form:not([data-action-form]) .ha-form-label,
      ha-form:not([data-action-form]) .form-label {
        display: none !important;
      }

      /* Hide labels containing underscores only for non-action forms */
      ha-form:not([data-action-form]) label[data-label*='_'],
      ha-form:not([data-action-form]) .label-text:contains('_'),
      :not([data-action-form]) label:contains('_') {
        display: none !important;
      }

      /* Additional safeguards for underscore labels in non-action forms */
      ha-form:not([data-action-form]) .mdc-text-field-character-counter,
      ha-form:not([data-action-form]) .mdc-text-field-helper-text,
      ha-form:not([data-action-form]) mwc-formfield,
      ha-form:not([data-action-form]) .formfield {
        display: none !important;
      }

      /* Mobile responsive adjustments */
      @media (max-width: 768px) {
        .card-config {
          padding: 8px;
        }

        /* Hide fullscreen toggle on mobile as additional safeguard */
        .fullscreen-toggle {
          display: none !important;
        }
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

      .fullscreen-toggle {
        background: none;
        border: none;
        padding: 8px 12px;
        cursor: pointer;
        color: var(--secondary-text-color);
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: var(--ultra-editor-transition);
        position: relative;
        min-width: 40px;
        height: 40px;
        gap: 6px;
      }

      .fullscreen-toggle:hover {
        background: var(--divider-color);
        color: var(--primary-color);
      }

      .fullscreen-toggle:active {
        transform: scale(0.95);
      }

      /* Active fullscreen state - Dashboard button styling */
      .card-config.fullscreen .fullscreen-toggle {
        background: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-color);
        border: 1px solid rgba(var(--rgb-primary-color), 0.2);
        padding: 8px 16px;
        min-width: auto;
        height: auto;
      }

      .card-config.fullscreen .fullscreen-toggle:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
        transform: translateX(-2px);
      }

      .arrow-icon {
        width: 20px;
        height: 20px;
        fill: currentColor;
        transition: var(--ultra-editor-transition);
        flex-shrink: 0;
      }

      .dashboard-text {
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
      }

      .tab-content {
        min-height: 400px;
        transition: var(--ultra-editor-transition);
      }

      /* Full screen mode tab content */
      .card-config.fullscreen .tab-content {
        min-height: calc(100vh - 120px);
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

      /* Full screen mode responsive behavior for builder columns */
      .card-config.fullscreen {
        /* Allow horizontal layout components to display side by side */
        ::slotted(ultra-layout-tab) {
          --layout-columns-display: flex;
          --layout-columns-direction: row;
          --layout-columns-gap: 16px;
        }

        /* Style for layout builder in full screen */
        ultra-layout-tab {
          --columns-layout: horizontal;
        }
      }

      /* Default preview mode - stack columns vertically */
      .card-config:not(.fullscreen) {
        ::slotted(ultra-layout-tab) {
          --layout-columns-display: flex;
          --layout-columns-direction: column;
          --layout-columns-gap: 12px;
        }

        ultra-layout-tab {
          --columns-layout: vertical;
        }
      }

      /* Enhanced mobile behavior */
      @media (max-width: 768px) {
        .card-config.fullscreen {
          width: 100vw;
          height: 100vh;
          padding: 12px;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          background: var(--card-background-color);
        }

        .fullscreen-toggle {
          padding: 6px 10px;
          min-width: 36px;
          height: 36px;
        }

        .arrow-icon {
          width: 16px;
          height: 16px;
        }
      }
    `;
  }
}

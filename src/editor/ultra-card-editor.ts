import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig, HoverEffectConfig } from '../types';
import { configValidationService } from '../services/config-validation-service';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { ucCloudAuthService, CloudUser } from '../services/uc-cloud-auth-service';
import { ucCloudSyncService, SyncStatus } from '../services/uc-cloud-sync-service';
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

  // Cloud sync state
  @state() private _cloudUser: CloudUser | null = null;
  @state() private _syncStatus: SyncStatus | null = null;
  @state() private _showLoginForm: boolean = false;
  @state() private _loginError: string = '';
  @state() private _isLoggingIn: boolean = false;

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

    // Update hover styles when configuration changes
    this._updateHoverEffectStyles();

    // Setup cloud sync listeners
    this._setupCloudSyncListeners();
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

    // Cleanup cloud sync listeners
    this._cleanupCloudSyncListeners();
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
      // Update hover styles when configuration changes
      this._updateHoverEffectStyles();
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

          <!-- Cloud Sync Section -->
          ${this._renderCloudSyncSection(lang)}
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

      /* Cloud Sync Styles */
      .cloud-sync-container {
        margin-top: 16px;
      }

      .login-section {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 20px;
        background: var(--card-background-color);
      }

      .login-prompt {
        text-align: center;
      }

      .login-benefits {
        margin-bottom: 24px;
      }

      .login-benefits h5 {
        margin: 0 0 12px 0;
        color: var(--primary-text-color);
        font-size: 16px;
      }

      .login-benefits ul {
        list-style: none;
        padding: 0;
        margin: 0;
        text-align: left;
        display: inline-block;
      }

      .login-benefits li {
        margin: 8px 0;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .login-actions {
        margin-top: 20px;
      }

      .login-btn {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: 6px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .login-btn:hover {
        background: var(--primary-color);
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .login-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .login-note {
        margin-top: 16px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .login-note a {
        color: var(--primary-color);
        text-decoration: none;
      }

      .login-note a:hover {
        text-decoration: underline;
      }

      .login-form {
        max-width: 400px;
        margin: 0 auto;
      }

      .login-form h5 {
        margin: 0 0 20px 0;
        text-align: center;
        color: var(--primary-text-color);
      }

      .error-message {
        background: var(--error-color);
        color: white;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 14px;
        text-align: center;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .form-group input {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        font-size: 14px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        box-sizing: border-box;
      }

      .form-group input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px var(--primary-color) 20;
      }

      .form-group input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
      }

      .cancel-btn {
        background: transparent;
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 12px 20px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .cancel-btn:hover {
        background: var(--divider-color);
      }

      .login-links {
        text-align: center;
        margin-top: 20px;
        font-size: 13px;
      }

      .login-links a {
        color: var(--primary-color);
        text-decoration: none;
      }

      .login-links a:hover {
        text-decoration: underline;
      }

      .login-links span {
        margin: 0 8px;
        color: var(--secondary-text-color);
      }

      .sync-controls {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 20px;
        background: var(--card-background-color);
      }

      .user-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .user-details {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }

      .user-avatar-placeholder {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 18px;
      }

      .user-text {
        display: flex;
        flex-direction: column;
      }

      .user-text strong {
        color: var(--primary-text-color);
        font-size: 16px;
      }

      .user-email {
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .logout-btn {
        background: transparent;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 8px;
        cursor: pointer;
        color: var(--secondary-text-color);
        transition: all 0.2s ease;
      }

      .logout-btn:hover {
        background: var(--error-color);
        color: white;
        border-color: var(--error-color);
      }

      .sync-status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .sync-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .sync-stat {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }

      .sync-stat.pending .stat-value {
        color: var(--warning-color);
        font-weight: 500;
      }

      .sync-stat.conflicts .stat-value {
        color: var(--error-color);
        font-weight: 500;
      }

      .stat-label {
        color: var(--secondary-text-color);
        min-width: 80px;
      }

      .stat-value {
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .sync-btn {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: 6px;
        padding: 10px 16px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
      }

      .sync-btn:hover:not(:disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .sync-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .sync-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .sync-settings {
        border-top: 1px solid var(--divider-color);
        padding-top: 16px;
      }

      .sync-toggle {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .toggle-label {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        font-size: 14px;
      }

      .toggle-label input[type='checkbox'] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .toggle-text {
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .toggle-description {
        margin: 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-left: 30px;
      }

      .sync-conflicts {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }

      .sync-conflicts h6 {
        margin: 0 0 8px 0;
        color: var(--error-color);
        font-size: 16px;
      }

      .sync-conflicts p {
        margin: 0 0 16px 0;
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .conflicts-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .conflict-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        border: 1px solid var(--error-color);
        border-radius: 6px;
        background: var(--error-color) 10;
      }

      .conflict-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .conflict-info strong {
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .conflict-field {
        color: var(--secondary-text-color);
        font-size: 12px;
      }

      .conflict-actions {
        display: flex;
        gap: 8px;
      }

      .resolve-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .resolve-btn.local {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }

      .resolve-btn.remote {
        background: var(--secondary-color, var(--divider-color));
        color: var(--primary-text-color);
      }

      .resolve-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      /* Mobile responsive styles */
      @media (max-width: 768px) {
        .sync-status {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .user-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .conflict-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .conflict-actions {
          width: 100%;
          justify-content: flex-end;
        }

        .form-actions {
          flex-direction: column;
        }

        .login-benefits ul {
          width: 100%;
        }
      }
    `;
  }

  /**
   * Collect all hover effect configurations from the current card config
   */
  private _collectHoverEffectConfigs(): HoverEffectConfig[] {
    const configs: HoverEffectConfig[] = [];

    if (!this.config) return configs;

    // Collect from rows
    this.config.layout?.rows?.forEach(row => {
      if (row.design?.hover_effect) {
        configs.push(row.design.hover_effect);
      }

      // Collect from columns
      row.columns?.forEach(column => {
        if (column.design?.hover_effect) {
          configs.push(column.design.hover_effect);
        }

        // Collect from modules
        column.modules?.forEach(module => {
          if ((module as any).design?.hover_effect) {
            configs.push((module as any).design.hover_effect);
          }
        });
      });
    });

    return configs;
  }

  /**
   * Update hover effect styles based on current configuration
   */
  private _updateHoverEffectStyles(): void {
    if (!this.shadowRoot) return;

    const configs = this._collectHoverEffectConfigs();
    if (configs.length > 0) {
      UcHoverEffectsService.updateHoverEffectStyles(this.shadowRoot, configs);
    }
  }

  // Cloud Sync Methods

  private _authListener?: (user: CloudUser | null) => void;
  private _syncListener?: (status: SyncStatus) => void;

  /**
   * Setup cloud sync listeners
   */
  private _setupCloudSyncListeners(): void {
    // Get initial state
    this._cloudUser = ucCloudAuthService.getCurrentUser();
    this._syncStatus = ucCloudSyncService.getSyncStatus();

    // Setup auth listener
    this._authListener = (user: CloudUser | null) => {
      this._cloudUser = user;
      this._loginError = '';
      this.requestUpdate();
    };
    ucCloudAuthService.addListener(this._authListener);

    // Setup sync listener
    this._syncListener = (status: SyncStatus) => {
      this._syncStatus = status;
      this.requestUpdate();
    };
    ucCloudSyncService.addListener(this._syncListener);
  }

  /**
   * Cleanup cloud sync listeners
   */
  private _cleanupCloudSyncListeners(): void {
    if (this._authListener) {
      ucCloudAuthService.removeListener(this._authListener);
      this._authListener = undefined;
    }
    if (this._syncListener) {
      ucCloudSyncService.removeListener(this._syncListener);
      this._syncListener = undefined;
    }
  }

  /**
   * Render cloud sync section
   */
  private _renderCloudSyncSection(lang: string): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-header">
          <h4>${localize('editor.cloud_sync.title', lang, 'Cloud Sync')}</h4>
          <p>
            ${localize(
              'editor.cloud_sync.description',
              lang,
              'Sync your favorites, colors, and reviews across all your devices using your ultracard.io account.'
            )}
          </p>
        </div>

        <div class="cloud-sync-container">
          ${this._cloudUser ? this._renderSyncControls(lang) : this._renderLoginSection(lang)}
        </div>
      </div>
    `;
  }

  /**
   * Render login section for unauthenticated users
   */
  private _renderLoginSection(lang: string): TemplateResult {
    return html`
      <div class="login-section">
        ${!this._showLoginForm
          ? html`
              <div class="login-prompt">
                <div class="login-benefits">
                  <h5>Benefits of Cloud Sync:</h5>
                  <ul>
                    <li>✅ Access your favorites on any device</li>
                    <li>✅ Automatic backup of your custom colors</li>
                    <li>✅ Sync your preset reviews and ratings</li>
                    <li>✅ Never lose your configurations</li>
                  </ul>
                </div>

                <div class="login-actions">
                  <button class="login-btn primary" @click=${() => (this._showLoginForm = true)}>
                    Sign In to Ultra Card Cloud
                  </button>
                  <p class="login-note">
                    Don't have an account?
                    <a href="https://ultracard.io/register" target="_blank" rel="noopener">
                      Create one free at ultracard.io
                    </a>
                  </p>
                </div>
              </div>
            `
          : this._renderLoginForm(lang)}
      </div>
    `;
  }

  /**
   * Render login form
   */
  private _renderLoginForm(lang: string): TemplateResult {
    return html`
      <div class="login-form">
        <h5>Sign In to Ultra Card Cloud</h5>

        ${this._loginError ? html`<div class="error-message">${this._loginError}</div>` : ''}

        <form @submit=${this._handleLogin}>
          <div class="form-group">
            <label for="username">Username or Email</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              ?disabled=${this._isLoggingIn}
              placeholder="Enter your username or email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              ?disabled=${this._isLoggingIn}
              placeholder="Enter your password"
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="cancel-btn"
              @click=${() => {
                this._showLoginForm = false;
                this._loginError = '';
              }}
              ?disabled=${this._isLoggingIn}
            >
              Cancel
            </button>
            <button type="submit" class="login-btn primary" ?disabled=${this._isLoggingIn}>
              ${this._isLoggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div class="login-links">
          <a href="https://ultracard.io/forgot-password" target="_blank" rel="noopener">
            Forgot Password?
          </a>
          <span>•</span>
          <a href="https://ultracard.io/register" target="_blank" rel="noopener">
            Create Account
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Render sync controls for authenticated users
   */
  private _renderSyncControls(lang: string): TemplateResult {
    const lastSync = this._syncStatus?.lastSync;
    const isSyncing = this._syncStatus?.isSyncing || false;
    const pendingChanges = this._syncStatus?.pendingChanges || 0;
    const conflicts = this._syncStatus?.conflicts || [];

    return html`
      <div class="sync-controls">
        <div class="user-info">
          <div class="user-details">
            ${this._cloudUser?.avatar
              ? html`<img src="${this._cloudUser.avatar}" alt="Avatar" class="user-avatar" />`
              : html`<div class="user-avatar-placeholder">
                  ${this._cloudUser?.displayName?.charAt(0) || '?'}
                </div>`}
            <div class="user-text">
              <strong>${this._cloudUser?.displayName || 'Unknown User'}</strong>
              <span class="user-email">${this._cloudUser?.email}</span>
            </div>
          </div>
          <button class="logout-btn" @click=${this._handleLogout} title="Sign Out">
            <ha-icon icon="mdi:logout"></ha-icon>
          </button>
        </div>

        <div class="sync-status">
          <div class="sync-info">
            <div class="sync-stat">
              <span class="stat-label">Last Sync:</span>
              <span class="stat-value">
                ${lastSync ? this._formatRelativeTime(lastSync) : 'Never'}
              </span>
            </div>
            ${pendingChanges > 0
              ? html`
                  <div class="sync-stat pending">
                    <span class="stat-label">Pending:</span>
                    <span class="stat-value">${pendingChanges} changes</span>
                  </div>
                `
              : ''}
            ${conflicts.length > 0
              ? html`
                  <div class="sync-stat conflicts">
                    <span class="stat-label">Conflicts:</span>
                    <span class="stat-value">${conflicts.length} items</span>
                  </div>
                `
              : ''}
          </div>

          <div class="sync-actions">
            <button
              class="sync-btn"
              @click=${this._handleSyncNow}
              ?disabled=${isSyncing}
              title="Sync all data now"
            >
              <ha-icon icon="mdi:sync${isSyncing ? ' spin' : ''}"></ha-icon>
              ${isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>

        <div class="sync-settings">
          <div class="sync-toggle">
            <label class="toggle-label">
              <input
                type="checkbox"
                ?checked=${this._syncStatus?.isEnabled}
                @change=${this._handleSyncToggle}
                ?disabled=${isSyncing}
              />
              <span class="toggle-text">
                ${localize('editor.cloud_sync.auto_sync', lang, 'Automatic Sync')}
              </span>
            </label>
            <p class="toggle-description">
              ${localize(
                'editor.cloud_sync.auto_sync_desc',
                lang,
                'Automatically sync changes in the background'
              )}
            </p>
          </div>
        </div>

        ${conflicts.length > 0 ? this._renderConflicts(conflicts, lang) : ''}
      </div>
    `;
  }

  /**
   * Render sync conflicts
   */
  private _renderConflicts(conflicts: any[], lang: string): TemplateResult {
    return html`
      <div class="sync-conflicts">
        <h6>Sync Conflicts</h6>
        <p>The following items have conflicts that need to be resolved:</p>

        <div class="conflicts-list">
          ${conflicts.map(
            conflict => html`
              <div class="conflict-item">
                <div class="conflict-info">
                  <strong>${conflict.type}: ${conflict.local.name || conflict.local.id}</strong>
                  <span class="conflict-field">Field: ${conflict.field}</span>
                </div>
                <div class="conflict-actions">
                  <button
                    class="resolve-btn local"
                    @click=${() => this._resolveConflict(conflict, 'local')}
                  >
                    Keep Local
                  </button>
                  <button
                    class="resolve-btn remote"
                    @click=${() => this._resolveConflict(conflict, 'remote')}
                  >
                    Keep Cloud
                  </button>
                </div>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  /**
   * Handle login form submission
   */
  private async _handleLogin(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      this._loginError = 'Please enter both username and password';
      return;
    }

    this._isLoggingIn = true;
    this._loginError = '';

    try {
      await ucCloudAuthService.login({ username, password });
      this._showLoginForm = false;

      // Enable sync by default after successful login
      await ucCloudSyncService.setSyncEnabled(true);

      console.log('✅ Successfully logged in and enabled sync');
    } catch (error) {
      this._loginError = error instanceof Error ? error.message : 'Login failed';
      console.error('❌ Login failed:', error);
    } finally {
      this._isLoggingIn = false;
    }
  }

  /**
   * Handle logout
   */
  private async _handleLogout(): Promise<void> {
    try {
      await ucCloudAuthService.logout();
      this._showLoginForm = false;
      console.log('✅ Successfully logged out');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  }

  /**
   * Handle sync now button
   */
  private async _handleSyncNow(): Promise<void> {
    try {
      const results = await ucCloudSyncService.syncAll();
      console.log('✅ Sync completed:', results);

      // Show success message (could be enhanced with toast notification)
      const totalSynced = results.favorites.synced + results.colors.synced + results.reviews.synced;
      if (totalSynced > 0) {
        console.log(`Synced ${totalSynced} items successfully`);
      }
    } catch (error) {
      console.error('❌ Sync failed:', error);
      // Could show error toast here
    }
  }

  /**
   * Handle sync toggle
   */
  private async _handleSyncToggle(e: Event): Promise<void> {
    const target = e.target as HTMLInputElement;
    const enabled = target.checked;

    try {
      await ucCloudSyncService.setSyncEnabled(enabled);
      console.log(`✅ Sync ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('❌ Failed to toggle sync:', error);
      // Revert checkbox state
      target.checked = !enabled;
    }
  }

  /**
   * Resolve a sync conflict
   */
  private async _resolveConflict(conflict: any, resolution: 'local' | 'remote'): Promise<void> {
    try {
      await ucCloudSyncService.resolveConflict(conflict, resolution);
      console.log(`✅ Conflict resolved: ${resolution}`);
    } catch (error) {
      console.error('❌ Failed to resolve conflict:', error);
    }
  }

  /**
   * Format relative time for last sync display
   */
  private _formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}

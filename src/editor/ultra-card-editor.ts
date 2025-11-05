import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardConfig, HoverEffectConfig } from '../types';
import { configValidationService } from '../services/config-validation-service';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { ucCloudAuthService, CloudUser } from '../services/uc-cloud-auth-service';
import { ucCloudSyncService, SyncStatus } from '../services/uc-cloud-sync-service';
import { ucCloudBackupService, BackupStatus } from '../services/uc-cloud-backup-service';
import { ucSnapshotService } from '../services/uc-snapshot-service';
import { ucCardBackupService } from '../services/uc-card-backup-service';
import { ucDashboardScannerService } from '../services/uc-dashboard-scanner-service';
import {
  ucSnapshotSchedulerService,
  SnapshotSchedulerStatus,
} from '../services/uc-snapshot-scheduler-service';
import { UcConfigEncoder } from '../utils/uc-config-encoder';
import { uploadImage } from '../utils/image-upload';
import { Z_INDEX } from '../utils/uc-z-index';
import './tabs/about-tab';
import './tabs/layout-tab';
import '../components/ultra-color-picker';
import '../components/uc-favorite-colors-manager';
import '../components/uc-favorite-dialog';
import '../components/uc-import-dialog';
import '../components/uc-snapshot-history-modal';
import '../components/uc-snapshot-settings-dialog';
import '../components/uc-manual-backup-dialog';
import { getModuleRegistry } from '../modules';
import { localize } from '../localize/localize';

type EditorTab = 'layout' | 'settings' | 'pro' | 'about';

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
  @state() private _backupStatus: BackupStatus | null = null;
  @state() private _showLoginForm: boolean = false;
  @state() private _loginError: string = '';
  @state() private _isLoggingIn: boolean = false;
  @state() private _showBackupHistory: boolean = false;
  @state() private _showCreateSnapshot: boolean = false;
  @state() private _showManualBackup: boolean = false;
  @state() private _showSnapshotSettings: boolean = false;
  @state() private _snapshotSchedulerStatus: SnapshotSchedulerStatus | null = null;
  @state() private _newerBackupAvailable: any = null;
  @state() private _showSyncNotification: boolean = false;
  @state() private _isCreatingManualSnapshot: boolean = false;

  /** Flag to ensure module CSS for animations is injected once */
  private _moduleStylesInjected = false;

  public setConfig(config: UltraCardConfig): void {
    this.config = config || {
      type: 'custom:ultra-card',
      layout: { rows: [] },
    };
  }

  protected willUpdate(changedProperties: Map<string, any>): void {
    super.willUpdate(changedProperties);

    // Check for integration auth when hass updates
    if (changedProperties.has('hass') && this.hass) {
      const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);

      // If integration is authenticated and we don't have a card user, use integration
      if (integrationUser && !ucCloudAuthService.getCurrentUser()) {
        console.log('✅ Integration auth detected, updating PRO status');
        this._cloudUser = integrationUser;
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    try {
      (window as any).__UC_PREVIEW_SUPPRESS_LOCKS = true;
      window.dispatchEvent(
        new CustomEvent('uc-preview-suppress-locks-changed', { detail: { suppressed: true } })
      );
    } catch {}
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
    try {
      (window as any).__UC_PREVIEW_SUPPRESS_LOCKS = false;
      window.dispatchEvent(
        new CustomEvent('uc-preview-suppress-locks-changed', { detail: { suppressed: false } })
      );
    } catch {}
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

      // Trigger cloud backup auto-save if authenticated
      if (ucCloudAuthService.isAuthenticated()) {
        ucCloudBackupService.autoSave(finalConfig);
      }
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
                  class="tab ${this._activeTab === 'pro' ? 'active' : ''}"
                  @click=${() => (this._activeTab = 'pro')}
                >
                  ${localize('editor.tabs.pro', lang, 'PRO')}
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
                .cloudUser=${this._cloudUser}
                @switch-tab=${(e: CustomEvent) => (this._activeTab = e.detail.tab)}
              ></ultra-layout-tab>`
            : this._activeTab === 'settings'
              ? this._renderSettingsTab()
              : this._activeTab === 'pro'
                ? this._renderProTab()
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
          <!-- Card Name Section -->
          <div class="settings-section">
            <div class="section-header">
              <h4>${localize('editor.ultra_card_pro.card_name', lang, 'Card Name')}</h4>
              <p>
                ${localize(
                  'editor.ultra_card_pro.card_name_desc',
                  lang,
                  'Give this card a name to identify it in your backups'
                )}
              </p>
            </div>

            <div class="setting-item">
              <label for="card-name">
                ${localize('editor.ultra_card_pro.card_name', lang, 'Card Name')}
              </label>
              <ha-textfield
                id="card-name"
                .value="${this.config.card_name || ''}"
                @input="${this._handleCardNameChange}"
                placeholder="${localize(
                  'editor.ultra_card_pro.card_name_placeholder',
                  lang,
                  'My Ultra Card'
                )}"
                maxlength="100"
              ></ha-textfield>
            </div>
          </div>

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

              <!-- Card Background Image Settings -->
              <div class="setting-item" style="grid-column: 1 / -1;">
                <label>
                  ${localize(
                    'editor.fields.card_background_image_type',
                    lang,
                    'Background Image Type'
                  )}
                </label>
                <div class="setting-description">
                  ${localize(
                    'editor.fields.card_background_image_type_desc',
                    lang,
                    'Add a background image to your card'
                  )}
                </div>
                <select
                  .value=${this.config.card_background_image_type || 'none'}
                  @change=${(e: Event) => {
                    const value = (e.target as HTMLSelectElement).value as
                      | 'none'
                      | 'upload'
                      | 'entity'
                      | 'url';
                    this._updateConfig({ card_background_image_type: value });
                  }}
                  class="property-select"
                  style="width: 100%;"
                >
                  <option value="none">${localize('editor.design.bg_none', lang, 'None')}</option>
                  <option value="upload">
                    ${localize('editor.design.bg_upload', lang, 'Upload Image')}
                  </option>
                  <option value="entity">
                    ${localize('editor.design.bg_entity', lang, 'Entity Image')}
                  </option>
                  <option value="url">
                    ${localize('editor.design.bg_url', lang, 'Image URL')}
                  </option>
                </select>
              </div>

              ${this.config.card_background_image_type === 'upload'
                ? html`
                    <div
                      class="conditional-fields-group"
                      style="grid-column: 1 / -1; padding: 16px; margin-top: 8px;"
                    >
                      <div class="settings-grid">
                        <div class="setting-item" style="grid-column: 1 / -1;">
                          <label>
                            ${localize(
                              'editor.design.upload_bg_image',
                              lang,
                              'Upload Background Image'
                            )}
                          </label>
                          <div class="upload-container" style="margin-top: 8px;">
                            <div class="file-upload-row">
                              <label class="file-upload-button">
                                <div class="button-content">
                                  <ha-icon icon="mdi:upload"></ha-icon>
                                  <span class="button-label"
                                    >${localize(
                                      'editor.design.choose_file',
                                      lang,
                                      'Choose File'
                                    )}</span
                                  >
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  @change=${this._handleCardBackgroundImageUpload}
                                  style="display: none"
                                />
                              </label>
                              <div class="path-display">
                                ${this.config.card_background_image
                                  ? html`<span
                                      class="uploaded-path"
                                      title="${this.config.card_background_image}"
                                    >
                                      ${this._truncatePath(this.config.card_background_image)}
                                    </span>`
                                  : html`<span class="no-file"
                                      >${localize(
                                        'editor.design.no_file_chosen',
                                        lang,
                                        'No file chosen'
                                      )}</span
                                    >`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  `
                : ''}
              ${this.config.card_background_image_type === 'entity'
                ? html`
                    <div
                      class="conditional-fields-group"
                      style="grid-column: 1 / -1; padding: 16px; margin-top: 8px;"
                    >
                      <div class="settings-grid">
                        <div class="setting-item" style="grid-column: 1 / -1;">
                          <label>
                            ${localize(
                              'editor.design.bg_image_entity',
                              lang,
                              'Background Image Entity'
                            )}
                          </label>
                          <ha-entity-picker
                            .hass=${this.hass}
                            .value=${this.config.card_background_image_entity || ''}
                            @value-changed=${(e: CustomEvent) =>
                              this._updateConfig({ card_background_image_entity: e.detail.value })}
                            .label=${'Select entity with image attribute'}
                            allow-custom-entity
                          ></ha-entity-picker>
                        </div>
                      </div>
                    </div>
                  `
                : ''}
              ${this.config.card_background_image_type === 'url'
                ? html`
                    <div
                      class="conditional-fields-group"
                      style="grid-column: 1 / -1; padding: 16px; margin-top: 8px;"
                    >
                      <div class="settings-grid">
                        <div class="setting-item" style="grid-column: 1 / -1;">
                          <label>
                            ${localize('editor.design.bg_image_url', lang, 'Background Image URL')}
                          </label>
                          <input
                            type="text"
                            .value=${this.config.card_background_image || ''}
                            @input=${(e: Event) => {
                              const value = (e.target as HTMLInputElement).value;
                              this._updateConfig({ card_background_image: value });
                            }}
                            placeholder="https://example.com/image.jpg"
                            class="property-input"
                            style="width: 100%;"
                          />
                        </div>
                      </div>
                    </div>
                  `
                : ''}
              ${this.config.card_background_image_type &&
              this.config.card_background_image_type !== 'none'
                ? html`
                    <div
                      class="conditional-fields-group"
                      style="grid-column: 1 / -1; padding: 16px; margin-top: 8px;"
                    >
                      <div class="settings-grid">
                        <div class="setting-item">
                          <label>Background Size</label>
                          <div class="setting-description">How the image fills the card area</div>
                          <select
                            .value=${this._getBackgroundSizeDropdownValue(
                              this.config.card_background_size
                            )}
                            @change=${(e: Event) => {
                              const value = (e.target as HTMLSelectElement).value;
                              this._updateConfig({ card_background_size: value });
                            }}
                            class="property-select"
                            style="width: 100%;"
                          >
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="auto">Auto</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>

                        ${this._getBackgroundSizeDropdownValue(this.config.card_background_size) ===
                        'custom'
                          ? html`
                              <div class="setting-item">
                                <label>Custom Width</label>
                                <input
                                  type="text"
                                  .value=${this._getCustomSizeValue(
                                    this.config.card_background_size,
                                    'width'
                                  )}
                                  @input=${(e: Event) => {
                                    const width = (e.target as HTMLInputElement).value;
                                    const height = this._getCustomSizeValue(
                                      this.config.card_background_size,
                                      'height'
                                    );
                                    const customSize =
                                      width && height
                                        ? `${width} ${height}`
                                        : width || height || 'auto';
                                    this._updateConfig({ card_background_size: customSize });
                                  }}
                                  placeholder="100px, 50%, auto"
                                  class="property-input"
                                  style="width: 100%;"
                                />
                              </div>
                              <div class="setting-item">
                                <label>Custom Height</label>
                                <input
                                  type="text"
                                  .value=${this._getCustomSizeValue(
                                    this.config.card_background_size,
                                    'height'
                                  )}
                                  @input=${(e: Event) => {
                                    const height = (e.target as HTMLInputElement).value;
                                    const width = this._getCustomSizeValue(
                                      this.config.card_background_size,
                                      'width'
                                    );
                                    const customSize =
                                      width && height
                                        ? `${width} ${height}`
                                        : width || height || 'auto';
                                    this._updateConfig({ card_background_size: customSize });
                                  }}
                                  placeholder="100px, 50%, auto"
                                  class="property-input"
                                  style="width: 100%;"
                                />
                              </div>
                            `
                          : ''}

                        <div class="setting-item">
                          <label>Background Repeat</label>
                          <div class="setting-description">How the image repeats</div>
                          <select
                            .value=${this.config.card_background_repeat || 'no-repeat'}
                            @change=${(e: Event) => {
                              const value = (e.target as HTMLSelectElement).value as
                                | 'repeat'
                                | 'repeat-x'
                                | 'repeat-y'
                                | 'no-repeat';
                              this._updateConfig({ card_background_repeat: value });
                            }}
                            class="property-select"
                            style="width: 100%;"
                          >
                            <option value="no-repeat">No Repeat</option>
                            <option value="repeat">Repeat</option>
                            <option value="repeat-x">Repeat X</option>
                            <option value="repeat-y">Repeat Y</option>
                          </select>
                        </div>

                        <div class="setting-item">
                          <label>Background Position</label>
                          <div class="setting-description">Where the image is positioned</div>
                          <select
                            .value=${this.config.card_background_position || 'center center'}
                            @change=${(e: Event) => {
                              const value = (e.target as HTMLSelectElement).value;
                              this._updateConfig({ card_background_position: value });
                            }}
                            class="property-select"
                            style="width: 100%;"
                          >
                            <option value="left top">Left Top</option>
                            <option value="left center">Left Center</option>
                            <option value="left bottom">Left Bottom</option>
                            <option value="center top">Center Top</option>
                            <option value="center center">Center</option>
                            <option value="center bottom">Center Bottom</option>
                            <option value="right top">Right Top</option>
                            <option value="right center">Right Center</option>
                            <option value="right bottom">Right Bottom</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  `
                : ''}

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

              <!-- Card Shadow Settings -->
              <div class="setting-item" style="grid-column: 1 / -1;">
                <div
                  style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;"
                >
                  <label style="margin: 0; font-weight: 500;">
                    ${localize('editor.fields.card_shadow_enabled', lang, 'Custom Drop Shadow')}
                  </label>
                  <ha-switch
                    .checked=${this.config.card_shadow_enabled || false}
                    @change=${(e: Event) => {
                      const target = e.target as any;
                      this._updateConfig({ card_shadow_enabled: target.checked });
                    }}
                  ></ha-switch>
                </div>
                <div class="setting-description">
                  ${localize(
                    'editor.fields.card_shadow_enabled_desc',
                    lang,
                    'Enable custom shadow for the card'
                  )}
                </div>
              </div>

              ${this.config.card_shadow_enabled
                ? html`
                    <div
                      class="conditional-fields-group"
                      style="grid-column: 1 / -1; padding: 16px; margin-top: 8px;"
                    >
                      <div class="settings-grid">
                        <div class="setting-item">
                          <label>
                            ${localize('editor.fields.card_shadow_color', lang, 'Shadow Color')}
                          </label>
                          <div class="setting-description">
                            ${localize(
                              'editor.fields.card_shadow_color_desc',
                              lang,
                              'The color of the card shadow'
                            )}
                          </div>
                          <ultra-color-picker
                            .label=${'Shadow Color'}
                            .value=${this.config.card_shadow_color || 'rgba(0, 0, 0, 0.15)'}
                            .defaultValue=${'rgba(0, 0, 0, 0.15)'}
                            .hass=${this.hass}
                            @value-changed=${(e: CustomEvent) =>
                              this._updateConfig({ card_shadow_color: e.detail.value })}
                          ></ultra-color-picker>
                        </div>

                        <div class="setting-item">
                          <label>
                            ${localize(
                              'editor.fields.card_shadow_horizontal',
                              lang,
                              'Horizontal Offset'
                            )}
                          </label>
                          <div class="setting-description">
                            ${localize(
                              'editor.fields.card_shadow_horizontal_desc',
                              lang,
                              'Horizontal position of the shadow (negative = left, positive = right)'
                            )}
                          </div>
                          <div class="input-with-unit">
                            <input
                              type="number"
                              min="-50"
                              max="50"
                              .value=${this.config.card_shadow_horizontal ?? 0}
                              @input=${(e: Event) => {
                                const target = e.target as HTMLInputElement;
                                this._updateConfig({
                                  card_shadow_horizontal: Number(target.value),
                                });
                              }}
                            />
                            <span class="unit"
                              >${localize('editor.fields.unit_px', lang, 'px')}</span
                            >
                            <button
                              class="reset-btn"
                              @click=${() => this._updateConfig({ card_shadow_horizontal: 0 })}
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

                        <div class="setting-item">
                          <label>
                            ${localize(
                              'editor.fields.card_shadow_vertical',
                              lang,
                              'Vertical Offset'
                            )}
                          </label>
                          <div class="setting-description">
                            ${localize(
                              'editor.fields.card_shadow_vertical_desc',
                              lang,
                              'Vertical position of the shadow (negative = up, positive = down)'
                            )}
                          </div>
                          <div class="input-with-unit">
                            <input
                              type="number"
                              min="-50"
                              max="50"
                              .value=${this.config.card_shadow_vertical ?? 2}
                              @input=${(e: Event) => {
                                const target = e.target as HTMLInputElement;
                                this._updateConfig({
                                  card_shadow_vertical: Number(target.value),
                                });
                              }}
                            />
                            <span class="unit"
                              >${localize('editor.fields.unit_px', lang, 'px')}</span
                            >
                            <button
                              class="reset-btn"
                              @click=${() => this._updateConfig({ card_shadow_vertical: 2 })}
                              title=${localize(
                                'editor.fields.reset_default_value',
                                lang,
                                'Reset to default ({value})'
                              ).replace('{value}', '2px')}
                            >
                              ↺
                            </button>
                          </div>
                        </div>

                        <div class="setting-item">
                          <label>
                            ${localize('editor.fields.card_shadow_blur', lang, 'Blur Radius')}
                          </label>
                          <div class="setting-description">
                            ${localize(
                              'editor.fields.card_shadow_blur_desc',
                              lang,
                              'How blurred the shadow appears'
                            )}
                          </div>
                          <div class="input-with-unit">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              .value=${this.config.card_shadow_blur ?? 8}
                              @input=${(e: Event) => {
                                const target = e.target as HTMLInputElement;
                                this._updateConfig({
                                  card_shadow_blur: Number(target.value),
                                });
                              }}
                            />
                            <span class="unit"
                              >${localize('editor.fields.unit_px', lang, 'px')}</span
                            >
                            <button
                              class="reset-btn"
                              @click=${() => this._updateConfig({ card_shadow_blur: 8 })}
                              title=${localize(
                                'editor.fields.reset_default_value',
                                lang,
                                'Reset to default ({value})'
                              ).replace('{value}', '8px')}
                            >
                              ↺
                            </button>
                          </div>
                        </div>

                        <div class="setting-item">
                          <label>
                            ${localize('editor.fields.card_shadow_spread', lang, 'Spread Radius')}
                          </label>
                          <div class="setting-description">
                            ${localize(
                              'editor.fields.card_shadow_spread_desc',
                              lang,
                              'How much the shadow expands or contracts'
                            )}
                          </div>
                          <div class="input-with-unit">
                            <input
                              type="number"
                              min="-50"
                              max="50"
                              .value=${this.config.card_shadow_spread ?? 0}
                              @input=${(e: Event) => {
                                const target = e.target as HTMLInputElement;
                                this._updateConfig({
                                  card_shadow_spread: Number(target.value),
                                });
                              }}
                            />
                            <span class="unit"
                              >${localize('editor.fields.unit_px', lang, 'px')}</span
                            >
                            <button
                              class="reset-btn"
                              @click=${() => this._updateConfig({ card_shadow_spread: 0 })}
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
                  `
                : ''}
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
              <div class="setting-item setting-inline">
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
   * Handle card background image upload
   */
  private async _handleCardBackgroundImageUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.hass) return;

    try {
      const imagePath = await uploadImage(this.hass, file);
      this._updateConfig({
        card_background_image: imagePath,
        card_background_image_type: 'upload' as const,
      });
    } catch (error) {
      console.error('Failed to upload card background image:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Reset the input so the same file can be selected again if needed
      input.value = '';
    }
  }

  /**
   * Truncate long file paths for display
   */
  private _truncatePath(path: string): string {
    if (!path) return '';
    const maxLength = 30;
    if (path.length <= maxLength) return path;
    return '...' + path.slice(-maxLength + 3);
  }

  /**
   * Get the dropdown value for background size
   */
  private _getBackgroundSizeDropdownValue(backgroundSize: string | undefined): string {
    if (!backgroundSize) {
      return 'cover';
    }

    // If it's one of the preset values, return it as-is
    if (['cover', 'contain', 'auto'].includes(backgroundSize)) {
      return backgroundSize;
    }

    // If it's 'custom' or any other custom value, return 'custom'
    return 'custom';
  }

  /**
   * Get custom size value (width or height) from background size string
   */
  private _getCustomSizeValue(
    backgroundSize: string | undefined,
    dimension: 'width' | 'height'
  ): string {
    if (!backgroundSize || ['cover', 'contain', 'auto'].includes(backgroundSize)) {
      return '';
    }

    // If it's just 'custom' without actual values, return empty
    if (backgroundSize === 'custom') {
      return '';
    }

    // Parse custom size value like "100px 200px" or "50% auto"
    const parts = backgroundSize.split(' ');
    if (dimension === 'width') {
      return parts[0] || '';
    } else if (dimension === 'height') {
      return parts[1] || parts[0] || '';
    }
    return '';
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
        z-index: ${Z_INDEX.FULLSCREEN_EDITOR} !important;
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
        z-index: ${Z_INDEX.EDITOR_TABS};
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
          z-index: ${Z_INDEX.DIALOG_CONTENT} !important;
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

      .settings-tab,
      .pro-tab-content {
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
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 0.2px;
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
        width: 100%;
      }

      .setting-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }

      /* Inline layout: title (left), toggle (right), description below */
      .setting-inline {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap; /* allow description on its own row */
        gap: 12px;
        width: 100%;
      }
      .setting-inline > label {
        flex: 1 1 auto;
        margin-right: 12px;
      }
      .setting-inline ha-form {
        margin-left: auto; /* push toggle to right */
      }
      .setting-inline > .setting-description {
        order: 3;
        width: 100%; /* force onto next line below title+toggle */
        margin: 6px 0 0 0;
      }

      /* Conditional fields group styling */
      .conditional-fields-group {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
        border-left: 3px solid var(--primary-color);
        border-radius: 4px;
      }

      /* Upload container styling */
      .upload-container {
        width: 100%;
      }

      .file-upload-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      .file-upload-button {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 120px;
      }

      .file-upload-button:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }

      .button-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .button-label {
        font-size: 14px;
        font-weight: 500;
      }

      .path-display {
        flex: 1;
        min-width: 0;
      }

      .uploaded-path {
        color: var(--primary-text-color);
        font-size: 12px;
        word-break: break-all;
      }

      .no-file {
        color: var(--secondary-text-color);
        font-size: 12px;
        font-style: italic;
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
        width: 100%;
        max-width: none;
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
          z-index: ${Z_INDEX.FULLSCREEN_EDITOR};
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

      .beta-badge {
        display: inline-block;
        background: var(--warning-color);
        color: white;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 8px;
        vertical-align: middle;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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

      /* ============================================
         ULTRA CARD PRO STYLES
         ============================================ */

      /* Pro Banner */
      /* Integration Status Card Styles */
      .integration-status-card {
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
        border: 2px solid;
        display: flex;
        align-items: flex-start;
        gap: 16px;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .integration-status-card .status-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      .integration-status-card .status-content {
        flex: 1;
      }

      .integration-status-card .status-content h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
      }

      .integration-status-card .status-content p {
        margin: 4px 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .integration-status-card .status-note {
        margin-top: 12px;
        font-size: 13px;
        opacity: 0.8;
      }

      .integration-status-card .status-note-small {
        margin-top: 8px;
        font-size: 12px;
        opacity: 0.7;
      }

      .integration-status-card .status-actions {
        margin-top: 16px;
        display: flex;
        gap: 12px;
      }

      .integration-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s;
        cursor: pointer;
      }

      .integration-button ha-icon {
        font-size: 18px;
      }

      /* Authenticated State - Green */
      .integration-authenticated {
        background-color: rgba(76, 175, 80, 0.1);
        border-color: #4caf50;
        color: var(--primary-text-color);
      }

      .integration-authenticated .status-icon {
        background-color: #4caf50;
        color: white;
      }

      .integration-authenticated a {
        color: #4caf50;
        font-weight: 600;
      }

      /* Not Configured State - Orange/Yellow */
      .integration-not-configured {
        background-color: rgba(255, 152, 0, 0.1);
        border-color: #ff9800;
        color: var(--primary-text-color);
      }

      .integration-not-configured .status-icon {
        background-color: #ff9800;
        color: white;
      }

      .integration-not-configured .integration-button {
        background-color: #ff9800;
        color: white;
      }

      .integration-not-configured .integration-button:hover {
        background-color: #f57c00;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
      }

      /* Not Installed State - Blue */
      .integration-not-installed {
        background-color: rgba(33, 150, 243, 0.1);
        border-color: #2196f3;
        color: var(--primary-text-color);
      }

      .integration-not-installed .status-icon {
        background-color: #2196f3;
        color: white;
      }

      .integration-not-installed .integration-button {
        background-color: #f5f5f5;
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
      }

      .integration-not-installed .integration-button-primary {
        background-color: #2196f3;
        color: white;
        border: none;
      }

      .integration-not-installed .integration-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .integration-not-installed .integration-button-primary:hover {
        background-color: #1976d2;
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
      }

      /* Benefits List */
      .benefits-list {
        margin: 16px 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .benefit-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        font-size: 14px;
      }

      .benefit-item ha-icon {
        color: #4caf50;
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .benefit-item div {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .benefit-description {
        font-size: 12px;
        opacity: 0.7;
      }

      .integration-subtitle {
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 8px;
      }

      /* Install Steps */
      .install-steps {
        margin: 20px 0;
        padding: 16px;
        background-color: rgba(var(--rgb-primary-color), 0.05);
        border-radius: 8px;
        border-left: 3px solid var(--primary-color);
      }

      .install-steps h5 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .install-steps ol {
        margin: 0;
        padding-left: 20px;
      }

      .install-steps li {
        font-size: 13px;
        line-height: 1.6;
        margin-bottom: 6px;
        color: var(--primary-text-color);
      }

      .install-steps strong {
        color: var(--primary-color);
        font-weight: 600;
      }

      .ultra-pro-banner {
        position: relative;
        padding: 24px;
        border-radius: 16px;
        margin-bottom: 24px;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .ultra-pro-banner-minimal {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .ultra-pro-banner-free {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
      }

      .ultra-pro-banner-pro {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        box-shadow: 0 8px 24px rgba(245, 87, 108, 0.3);
        animation: proPulse 3s ease-in-out infinite;
      }

      @keyframes proPulse {
        0%,
        100% {
          box-shadow: 0 8px 24px rgba(245, 87, 108, 0.3);
        }
        50% {
          box-shadow: 0 12px 32px rgba(245, 87, 108, 0.5);
        }
      }

      .banner-gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
        pointer-events: none;
      }

      .banner-icon {
        flex-shrink: 0;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        backdrop-filter: blur(10px);
      }

      .banner-icon ha-icon {
        --mdc-icon-size: 32px;
      }

      .banner-content {
        flex: 1;
      }

      .banner-content h3 {
        margin: 0 0 6px 0;
        font-size: 22px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .banner-content h3 ha-icon {
        --mdc-icon-size: 24px;
        animation: starRotate 4s linear infinite;
      }

      @keyframes starRotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .banner-content p {
        margin: 0;
        opacity: 0.95;
        font-size: 14px;
      }

      .pro-badge {
        flex-shrink: 0;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 20px;
        font-weight: 700;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
        backdrop-filter: blur(10px);
      }

      .pro-badge ha-icon {
        --mdc-icon-size: 18px;
      }

      .free-badge {
        flex-shrink: 0;
        padding: 6px 14px;
        background: rgba(255, 255, 255, 0.25);
        border-radius: 16px;
        font-weight: 600;
        font-size: 13px;
        backdrop-filter: blur(10px);
      }

      /* Auth Info Section (Integration-based authentication) */
      .auth-info-section {
        padding: 20px;
        background: var(--card-background-color);
        border: 2px solid var(--primary-color);
        border-radius: 12px;
        margin-bottom: 24px;
      }

      .auth-info-section ha-icon {
        font-size: 24px;
        color: var(--primary-color);
        margin-bottom: 12px;
        display: block;
      }

      .auth-info-section .info-content h4 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .auth-info-section .info-content p {
        margin: 0 0 16px 0;
        font-size: 14px;
        line-height: 1.5;
        color: var(--secondary-text-color);
      }

      .install-integration-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        padding: 10px 20px;
        background: var(--primary-color);
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        transition: background 0.2s;
      }

      .install-integration-link:hover {
        background: var(--primary-color-hover, var(--primary-color));
        filter: brightness(1.1);
      }

      .install-integration-link ha-icon {
        font-size: 18px;
        margin: 0;
        color: white;
      }

      .user-card {
        background: var(--card-background-color);
        border: 2px solid var(--divider-color);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
      }

      .user-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
      }

      .user-avatar-icon {
        --mdc-icon-size: 48px;
        color: var(--primary-color);
      }

      .user-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .user-name {
        font-weight: 600;
        font-size: 16px;
        color: var(--primary-text-color);
      }

      .user-email {
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      /* Card Name Setting */
      .ultra-pro-card-name {
        background: var(--card-background-color);
        border: 2px solid var(--divider-color);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
      }

      .setting-header {
        margin-bottom: 12px;
      }

      .setting-header label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 15px;
        color: var(--primary-text-color);
        margin-bottom: 6px;
      }

      .setting-header label ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .ultra-pro-card-name ha-textfield {
        width: 100%;
      }

      /* Pro Tools Sections */
      .pro-tools-section {
        background: var(--card-background-color);
        border: 2px solid var(--divider-color);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .header-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .header-icon ha-icon {
        --mdc-icon-size: 24px;
        color: white;
      }

      .header-content h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .header-content p {
        margin: 4px 0 0 0;
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      /* Pro Actions (Legacy) */
      .ultra-pro-actions {
        background: var(--card-background-color);
        border: 2px solid var(--divider-color);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
      }

      .actions-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .actions-header h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--primary-text-color);
      }

      .actions-header h4 ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .backup-count {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .backup-count ha-icon {
        --mdc-icon-size: 16px;
        color: var(--primary-color);
      }

      .limit-warning {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #f44336;
        font-weight: 600;
      }

      .limit-warning ha-icon {
        --mdc-icon-size: 16px;
      }

      /* New Tools Grid */
      .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      }

      .tool-card {
        background: var(--secondary-background-color);
        border: 2px solid transparent;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        align-items: flex-start;
        gap: 16px;
        cursor: pointer;
        transition: all 0.3s;
        text-align: left;
      }

      .tool-card:hover:not(:disabled) {
        transform: translateY(-4px);
        border-color: var(--primary-color);
        box-shadow: 0 8px 16px rgba(3, 169, 244, 0.2);
      }

      .tool-card:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .tool-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .tool-icon.export {
        background: linear-gradient(135deg, #4caf50, #66bb6a);
      }

      .tool-icon.import {
        background: linear-gradient(135deg, #2196f3, #42a5f5);
      }

      .tool-icon.backup {
        background: linear-gradient(135deg, #ff9800, #ffb74d);
      }

      .tool-icon.restore {
        background: linear-gradient(135deg, #9c27b0, #ba68c8);
      }

      .tool-icon.history {
        background: linear-gradient(135deg, #607d8b, #78909c);
      }

      .tool-icon.snapshot {
        background: linear-gradient(135deg, #f44336, #ef5350);
      }

      .tool-icon.settings {
        background: linear-gradient(135deg, #795548, #8d6e63);
      }

      .tool-icon ha-icon {
        --mdc-icon-size: 24px;
        color: white;
      }

      .tool-content h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .tool-content p {
        margin: 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      /* Legacy Actions Grid */
      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 16px;
      }

      .action-card {
        background: var(--secondary-background-color);
        border: 2px solid transparent;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: all 0.3s;
        text-align: center;
      }

      .action-card:hover:not(:disabled) {
        transform: translateY(-4px);
        border-color: var(--primary-color);
        box-shadow: 0 8px 16px rgba(3, 169, 244, 0.2);
      }

      .action-card:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .action-icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
      }

      .action-icon.export {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .action-icon.import {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .action-icon.backup {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      .action-icon ha-icon {
        --mdc-icon-size: 28px;
        color: white;
      }

      .action-card:hover:not(:disabled) .action-icon {
        transform: scale(1.1);
      }

      .action-label {
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color);
      }

      /* Status Sections */
      .backup-status,
      .snapshot-status {
        margin-top: 16px;
        padding: 16px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        border-left: 4px solid var(--primary-color);
      }

      .status-warning {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ff9800;
        font-weight: 500;
      }

      .status-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .status-warning ha-icon,
      .status-info ha-icon {
        --mdc-icon-size: 18px;
      }

      .status-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .status-primary {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .status-icon {
        --mdc-icon-size: 24px;
      }

      .status-card.enabled .status-icon {
        color: #4caf50;
      }

      .status-card.paused .status-icon {
        color: #ff9800;
      }

      .status-text strong {
        display: block;
        font-size: 16px;
        margin-bottom: 2px;
      }

      .status-desc {
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .status-detail {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--secondary-text-color);
        margin-left: 36px;
      }

      .status-detail ha-icon {
        --mdc-icon-size: 16px;
      }

      .status-loading {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .status-loading ha-icon {
        --mdc-icon-size: 18px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      /* Upgrade Section */
      .ultra-pro-upgrade {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 28px;
        margin-bottom: 24px;
        color: white;
      }

      .upgrade-content {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
      }

      .upgrade-content > ha-icon {
        flex-shrink: 0;
        --mdc-icon-size: 48px;
        opacity: 0.9;
      }

      .upgrade-text h4 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 700;
      }

      .upgrade-text p {
        margin: 0 0 16px 0;
        opacity: 0.95;
        font-size: 14px;
      }

      .upgrade-features {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .upgrade-features li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
      }

      .upgrade-features li ha-icon {
        --mdc-icon-size: 18px;
        flex-shrink: 0;
      }

      /* View Backups Button */
      .ultra-pro-view-backups {
        margin-bottom: 24px;
      }

      /* Buttons */
      .ultra-btn {
        padding: 12px 24px;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        justify-content: center;
      }

      .ultra-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      .ultra-btn-primary {
        background: linear-gradient(135deg, var(--primary-color) 0%, #00796b 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(3, 169, 244, 0.3);
      }

      .ultra-btn-primary:hover {
        box-shadow: 0 6px 16px rgba(3, 169, 244, 0.4);
        transform: translateY(-2px);
      }

      .ultra-btn-secondary {
        background: transparent;
        color: var(--primary-text-color);
        border: 2px solid var(--divider-color);
      }

      .ultra-btn-secondary:hover {
        background: var(--secondary-background-color);
        border-color: var(--primary-color);
      }

      .ultra-btn-upgrade {
        background: rgba(255, 255, 255, 0.25);
        color: white;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.3);
      }

      .ultra-btn-upgrade:hover {
        background: rgba(255, 255, 255, 0.35);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      .ultra-btn-view-backups {
        background: var(--card-background-color);
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
      }

      .ultra-btn-view-backups:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(3, 169, 244, 0.3);
      }

      /* Responsive for Ultra Card Pro */
      @media (max-width: 600px) {
        .ultra-pro-banner {
          flex-direction: column;
          text-align: center;
        }

        .features-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .actions-grid {
          grid-template-columns: 1fr;
        }

        .tools-grid {
          grid-template-columns: 1fr;
        }

        .tool-card {
          flex-direction: column;
          text-align: center;
          gap: 12px;
        }

        .section-header {
          flex-direction: column;
          text-align: center;
          gap: 12px;
        }

        .upgrade-content {
          flex-direction: column;
          text-align: center;
        }

        .user-card {
          flex-direction: column;
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
  private _backupListener?: (status: BackupStatus) => void;
  private _hasInitializedAuth = false; // Track if we've initialized auth for this instance

  /**
   * Setup cloud sync listeners
   */
  private async _setupCloudSyncListeners(): Promise<void> {
    // Skip if already initialized for this instance
    if (this._hasInitializedAuth) {
      return;
    }
    this._hasInitializedAuth = true;

    // Priority 1: Check for integration auth (cross-device)
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    if (integrationUser) {
      this._cloudUser = integrationUser;
    } else {
      // Priority 2: Fall back to card-based auth (single device)
      this._cloudUser = ucCloudAuthService.getCurrentUser();
    }

    this._syncStatus = ucCloudSyncService.getSyncStatus();
    this._backupStatus = ucCloudBackupService.getStatus();

    // If user exists in storage, attempt to restore session
    if (this._cloudUser && ucCloudAuthService.isAuthenticated()) {
      // Token is valid, just restore services
      try {
        await this._initializeProServices(this._cloudUser);
      } catch (error) {
        console.error('❌ Failed to restore Pro session:', error);
      }
    } else if (this._cloudUser && this._cloudUser.refreshToken) {
      // Token needs refresh - attempt it but don't logout on failure
      try {
        await ucCloudAuthService.refreshToken();
        this._cloudUser = ucCloudAuthService.getCurrentUser();
        if (this._cloudUser) {
          await this._initializeProServices(this._cloudUser);
        }
      } catch (error) {
        // Don't clear session on refresh failure - user might have network issues
        // The auth service will handle logging them out if truly invalid
        console.warn('⚠️ Session restore failed, please check your connection');
      }
    }

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

    // Setup backup listener
    this._backupListener = (status: BackupStatus) => {
      this._backupStatus = status;
      this.requestUpdate();
    };
    ucCloudBackupService.addListener(this._backupListener);

    // Check for newer backups (smart sync)
    if (this._cloudUser) {
      this._checkForNewerBackup();
    }
  }

  /**
   * Check for newer backup on server (smart sync)
   */
  private async _checkForNewerBackup() {
    try {
      const newerBackup = await ucCloudBackupService.checkForUpdates();
      if (newerBackup) {
        this._newerBackupAvailable = newerBackup;
        this._showSyncNotification = true;
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
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
    if (this._backupListener) {
      ucCloudBackupService.removeListener(this._backupListener);
      this._backupListener = undefined;
    }
  }

  /**
   * Render PRO TAB (New dedicated tab for all Pro features)
   */
  private _renderProTab(): TemplateResult {
    const lang = this.hass?.locale?.language || 'en';

    // Check for Ultra Card Pro Cloud integration (only auth method)
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    const isIntegrationInstalled = ucCloudAuthService.isIntegrationInstalled(this.hass);

    // Pro access via integration only
    const isPro = integrationUser?.subscription?.tier === 'pro';
    const isLoggedIn = !!integrationUser;

    return html`
      <div class="pro-tab-content">
        <!-- INTEGRATION STATUS (if installed) -->
        ${this._renderIntegrationStatus(lang, integrationUser, isIntegrationInstalled)}

        <!-- ULTRA CARD PRO BRANDED BANNER -->
        ${this._renderProBanner(lang, isPro, isLoggedIn)}

        <!-- AUTHENTICATION INFO (show if not authenticated via integration) -->
        ${!integrationUser ? this._renderAuthInfo(isIntegrationInstalled) : ''}

        <!-- PRO TOOLS SECTIONS (integration auth only) -->
        ${isLoggedIn ? this._renderCardProTools(lang, isPro) : ''}
        ${isLoggedIn && isPro ? this._renderDashboardProTools(lang) : ''}

        <!-- MODALS -->
        ${this._showBackupHistory && this._cloudUser
          ? html`
              <uc-snapshot-history-modal
                .open="${this._showBackupHistory}"
                .hass="${this.hass}"
                .subscription="${this._cloudUser.subscription!}"
                @close-modal="${() => (this._showBackupHistory = false)}"
                @snapshot-restored="${this._handleSnapshotRestored}"
                @card-backup-restored="${this._handleCardBackupRestored}"
              ></uc-snapshot-history-modal>
            `
          : ''}
        ${this._showManualBackup && this._cloudUser
          ? html`
              <uc-manual-backup-dialog
                .open="${this._showManualBackup}"
                .config="${this.config}"
                @dialog-closed="${() => (this._showManualBackup = false)}"
                @backup-created="${this._handleManualBackupCreated}"
              ></uc-manual-backup-dialog>
            `
          : ''}
        ${this._showSnapshotSettings
          ? html`
              <uc-snapshot-settings-dialog
                .open="${this._showSnapshotSettings}"
                @dialog-closed="${() => (this._showSnapshotSettings = false)}"
                @settings-saved="${this._handleSnapshotSettingsSaved}"
              ></uc-snapshot-settings-dialog>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Render Ultra Card Pro section (DEPRECATED - kept for backward compatibility)
   */
  private _renderCloudSyncSection(lang: string): TemplateResult {
    // Use integration auth only
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    const isIntegrationInstalled = ucCloudAuthService.isIntegrationInstalled(this.hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';
    const isLoggedIn = !!integrationUser;

    return html`
      <div class="settings-section ultra-card-pro-section">
        <!-- ULTRA CARD PRO BRANDED BANNER -->
        ${this._renderProBanner(lang, isPro, isLoggedIn)}

        <!-- AUTHENTICATION INFO (integration only) -->
        ${!integrationUser ? this._renderAuthInfo(isIntegrationInstalled) : ''}

        <!-- CARD NAME SETTING (Always visible when logged in) -->
        ${isLoggedIn ? this._renderCardNameSetting(lang) : ''}

        <!-- PRO TOOLS SECTIONS (integration auth only) -->
        ${isLoggedIn ? this._renderCardProTools(lang, isPro) : ''}
        ${isLoggedIn && isPro ? this._renderDashboardProTools(lang) : ''}

        <!-- MODALS (integration auth only) -->
        ${this._showBackupHistory && integrationUser
          ? html`
              <uc-snapshot-history-modal
                .open="${this._showBackupHistory}"
                .hass="${this.hass}"
                .subscription="${integrationUser.subscription!}"
                @close-modal="${() => (this._showBackupHistory = false)}"
                @snapshot-restored="${this._handleSnapshotRestored}"
                @card-backup-restored="${this._handleCardBackupRestored}"
              ></uc-snapshot-history-modal>
            `
          : ''}
        ${this._showManualBackup && integrationUser
          ? html`
              <uc-manual-backup-dialog
                .open="${this._showManualBackup}"
                .config="${this.config}"
                @dialog-closed="${() => (this._showManualBackup = false)}"
                @backup-created="${this._handleManualBackupCreated}"
              ></uc-manual-backup-dialog>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Render Integration Status Section
   */
  private _renderIntegrationStatus(
    lang: string,
    integrationUser: CloudUser | null,
    isIntegrationInstalled: boolean
  ): TemplateResult {
    // Integration installed and authenticated
    if (integrationUser) {
      const isPro = integrationUser.subscription?.tier === 'pro';
      return html`
        <div class="integration-status-card integration-authenticated">
          <div class="status-icon">
            <ha-icon icon="mdi:check-circle"></ha-icon>
          </div>
          <div class="status-content">
            <h4>✅ PRO Features Unlocked via Ultra Card Pro Cloud</h4>
            <p>
              <strong
                >${integrationUser.displayName}${integrationUser.email
                  ? ` • ${integrationUser.email}`
                  : ''}</strong
              >
            </p>
            <p>
              Subscription: <strong>${isPro ? 'PRO' : 'Free'}</strong>
              ${isPro ? '⭐' : ''}
            </p>
            <p class="status-note">
              All your devices are automatically unlocked. Manage this in Home Assistant Settings →
              <a href="/config/integrations/integration/ultra_card_pro_cloud" target="_top">
                Integrations
              </a>
            </p>
          </div>
        </div>
      `;
    }

    // Integration installed but not configured
    if (isIntegrationInstalled) {
      return html`
        <div class="integration-status-card integration-not-configured">
          <div class="status-icon">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
          </div>
          <div class="status-content">
            <h4>🔧 Ultra Card Pro Cloud Integration Detected</h4>
            <p>The integration is installed but not configured.</p>
            <div class="status-actions">
              <a
                href="/config/integrations/integration/ultra_card_pro_cloud"
                target="_top"
                class="integration-button"
              >
                <ha-icon icon="mdi:cog"></ha-icon>
                Configure Now
              </a>
            </div>
            <p class="status-note">Takes 30 seconds to unlock all devices</p>
          </div>
        </div>
      `;
    }

    // Integration not installed - show install instructions
    if (!isIntegrationInstalled && !this._cloudUser) {
      return html`
        <div class="integration-status-card integration-not-installed">
          <div class="status-icon">
            <ha-icon icon="mdi:cloud-lock"></ha-icon>
          </div>
          <div class="status-content">
            <h4>⭐ Unlock PRO Features Across All Devices</h4>
            <p class="integration-subtitle">
              Install <strong>Ultra Card Pro Cloud</strong> integration once, and every device
              connected to this Home Assistant automatically gets PRO features.
            </p>
            <div class="benefits-list">
              <div class="benefit-item">
                <ha-icon icon="mdi:check-circle"></ha-icon>
                <div>
                  <strong>Login Once</strong>
                  <span class="benefit-description">Works on desktop, mobile, tablet, TV</span>
                </div>
              </div>
              <div class="benefit-item">
                <ha-icon icon="mdi:sync"></ha-icon>
                <div>
                  <strong>Auto-Sync</strong>
                  <span class="benefit-description">No per-device configuration needed</span>
                </div>
              </div>
              <div class="benefit-item">
                <ha-icon icon="mdi:shield-check"></ha-icon>
                <div>
                  <strong>Secure & Reliable</strong>
                  <span class="benefit-description">Server-side auth, automatic token refresh</span>
                </div>
              </div>
            </div>

            <div class="install-steps">
              <h5>📋 Quick Install (2 minutes):</h5>
              <ol>
                <li>Click <strong>"Install via HACS"</strong> below</li>
                <li>
                  In HACS: Search "<strong>Ultra Card Pro Cloud</strong>" (now available in HACS!)
                </li>
                <li>Click <strong>Download</strong></li>
                <li>Restart Home Assistant</li>
                <li>Go to Settings → Integrations → Add Integration</li>
                <li>Search and add "<strong>Ultra Card Pro Cloud</strong>"</li>
                <li>Enter your <strong>ultracard.io</strong> credentials</li>
              </ol>
            </div>

            <div class="status-actions">
              <a
                href="https://my.home-assistant.io/redirect/hacs_repository/?owner=WJDDesigns&repository=ultra-card-pro-cloud&category=integration"
                target="_blank"
                class="integration-button integration-button-primary"
              >
                <ha-icon icon="mdi:cloud-download"></ha-icon>
                Install via HACS
              </a>
              <a href="https://ultracard.io" target="_blank" class="integration-button">
                <ha-icon icon="mdi:cart"></ha-icon>
                Get PRO Subscription
              </a>
            </div>
            <p class="status-note-small">
              💡 Prefer single-device? Use the card login below instead.
            </p>
          </div>
        </div>
      `;
    }

    return html``;
  }

  /**
   * Render Pro Banner (Free or Pro variant)
   */
  private _renderProBanner(lang: string, isPro: boolean, isLoggedIn: boolean): TemplateResult {
    if (!isLoggedIn) {
      // Show minimal banner for logged out users
      return html`
        <div class="ultra-pro-banner ultra-pro-banner-minimal">
          <div class="banner-icon">
            <ha-icon icon="mdi:star-circle"></ha-icon>
          </div>
          <div class="banner-content">
            <h3>${localize('editor.ultra_card_pro.title', lang, 'Ultra Card Pro')}</h3>
            <p>
              ${localize(
                'editor.ultra_card_pro.free_banner_subtitle',
                lang,
                'Professional card management and cloud backups'
              )}
            </p>
          </div>
        </div>
      `;
    }

    if (isPro) {
      // PRO USER BANNER
      return html`
        <div class="ultra-pro-banner ultra-pro-banner-pro">
          <div class="banner-gradient"></div>
          <div class="banner-icon">
            <ha-icon icon="mdi:star-circle"></ha-icon>
          </div>
          <div class="banner-content">
            <h3>
              <ha-icon icon="mdi:star"></ha-icon>
              ${localize('editor.ultra_card_pro.pro_banner_title', lang, 'Ultra Card Pro')}
            </h3>
            <p>
              ${localize(
                'editor.ultra_card_pro.pro_banner_subtitle',
                lang,
                'Thank you for being a Pro member!'
              )}
            </p>
          </div>
          <div class="pro-badge">
            <ha-icon icon="mdi:check-decagram"></ha-icon>
            PRO
          </div>
        </div>
      `;
    }

    // FREE USER BANNER
    return html`
      <div class="ultra-pro-banner ultra-pro-banner-free">
        <div class="banner-icon">
          <ha-icon icon="mdi:star-circle-outline"></ha-icon>
        </div>
        <div class="banner-content">
          <h3>${localize('editor.ultra_card_pro.free_banner_title', lang, 'Ultra Card Pro')}</h3>
          <p>
            ${localize(
              'editor.ultra_card_pro.free_banner_subtitle',
              lang,
              'Professional card management and cloud backups'
            )}
          </p>
        </div>
        <div class="free-badge">FREE</div>
      </div>
    `;
  }

  /**
   * Render Auth Info (Integration-based authentication only)
   */
  private _renderAuthInfo(isIntegrationInstalled: boolean): TemplateResult {
    return html`
      <div class="auth-info-section">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <div class="info-content">
          <h4>Ultra Card Pro Authentication</h4>
          <p>
            To unlock Pro features, install the <strong>Ultra Card Pro Cloud</strong> integration
            (now available in HACS!) from HACS and sign in there. Authentication is managed through
            the integration for seamless cross-device sync.
          </p>
          ${!isIntegrationInstalled
            ? html`
                <a
                  href="https://my.home-assistant.io/redirect/hacs_repository/?owner=WJDDesigns&repository=ultra-card-pro-cloud&category=integration"
                  target="_blank"
                  rel="noopener"
                  class="install-integration-link"
                >
                  <ha-icon icon="mdi:download"></ha-icon>
                  Install Integration
                </a>
              `
            : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render Card Name Setting
   */
  private _renderCardNameSetting(lang: string): TemplateResult {
    return html`
      <div class="ultra-pro-card-name">
        <div class="setting-header">
          <label for="card-name">
            <ha-icon icon="mdi:card-text"></ha-icon>
            ${localize('editor.ultra_card_pro.card_name', lang, 'Card Name')}
          </label>
          <p class="setting-description">
            ${localize(
              'editor.ultra_card_pro.card_name_desc',
              lang,
              'Give this card a name to identify it in your backups'
            )}
          </p>
        </div>
        <ha-textfield
          id="card-name"
          .value="${this.config.card_name || ''}"
          @input="${this._handleCardNameChange}"
          placeholder="${localize(
            'editor.ultra_card_pro.card_name_placeholder',
            lang,
            'My Ultra Card'
          )}"
          maxlength="100"
        ></ha-textfield>
      </div>
    `;
  }

  /**
   * Render Card Pro Tools Section
   */
  private _renderCardProTools(lang: string, isPro: boolean): TemplateResult {
    if (!isPro) {
      // Show upgrade prompt for free users
      return html`
        <div class="ultra-pro-upgrade">
          <div class="upgrade-content">
            <ha-icon icon="mdi:star-box"></ha-icon>
            <div class="upgrade-text">
              <h4>
                ${localize('editor.ultra_card_pro.upgrade_title', lang, 'Unlock Pro Features')}
              </h4>
              <p>
                ${localize(
                  'editor.ultra_card_pro.upgrade_subtitle',
                  lang,
                  'Get export, import, and manual backups for all your cards'
                )}
              </p>
              <ul class="upgrade-features">
                <li>
                  <ha-icon icon="mdi:check"></ha-icon>
                  ${localize(
                    'editor.ultra_card_pro.features.export',
                    lang,
                    'Export full card configs'
                  )}
                </li>
                <li>
                  <ha-icon icon="mdi:check"></ha-icon>
                  ${localize('editor.ultra_card_pro.features.import', lang, 'Import card configs')}
                </li>
                <li>
                  <ha-icon icon="mdi:check"></ha-icon>
                  ${localize(
                    'editor.ultra_card_pro.features.backups',
                    lang,
                    '30 manual backups across all cards'
                  )}
                </li>
                <li>
                  <ha-icon icon="mdi:check"></ha-icon>
                  ${localize(
                    'editor.ultra_card_pro.features.naming',
                    lang,
                    'Name your cards and backups'
                  )}
                </li>
                <li>
                  <ha-icon icon="mdi:check"></ha-icon>
                  ${localize('editor.ultra_card_pro.features.support', lang, 'Priority support')}
                </li>
              </ul>
            </div>
          </div>
          <button
            class="ultra-btn ultra-btn-upgrade"
            @click="${() => window.open('https://ultracard.io/pro', '_blank')}"
          >
            <ha-icon icon="mdi:star"></ha-icon>
            ${localize(
              'editor.ultra_card_pro.upgrade_button',
              lang,
              'Upgrade to Pro - $4.99/month'
            )}
          </button>
        </div>
      `;
    }

    // PRO USER - Show Card Pro Tools
    const subscription = this._cloudUser!.subscription!;
    const backupCount = subscription.snapshot_count || 0;
    const backupLimit = subscription.snapshot_limit || 30;
    const canCreateBackup = backupCount < backupLimit;

    return html`
      <div class="pro-tools-section">
        <div class="section-header">
          <div class="header-icon">
            <ha-icon icon="mdi:card"></ha-icon>
          </div>
          <div class="header-content">
            <h3>Card Pro Tools</h3>
            <p>Manage individual card configurations</p>
          </div>
        </div>

        <div class="tools-grid">
          <!-- Export Card -->
          <button class="tool-card" @click="${this._handleExport}">
            <div class="tool-icon export">
              <ha-icon icon="mdi:export"></ha-icon>
            </div>
            <div class="tool-content">
              <h4>Export Card</h4>
              <p>Download this card's configuration</p>
            </div>
          </button>

          <!-- Import Card -->
          <button class="tool-card" @click="${this._handleImport}">
            <div class="tool-icon import">
              <ha-icon icon="mdi:import"></ha-icon>
            </div>
            <div class="tool-content">
              <h4>Import Card</h4>
              <p>Load configuration from file</p>
            </div>
          </button>

          <!-- Backup Card -->
          <button
            class="tool-card"
            @click="${this._handleCreateBackup}"
            ?disabled="${!canCreateBackup}"
          >
            <div class="tool-icon backup">
              <ha-icon icon="mdi:bookmark-plus"></ha-icon>
            </div>
            <div class="tool-content">
              <h4>Backup Card</h4>
              <p>Save current card state</p>
            </div>
          </button>

          <!-- Restore Card -->
          <button class="tool-card" @click="${() => (this._showBackupHistory = true)}">
            <div class="tool-icon restore">
              <ha-icon icon="mdi:backup-restore"></ha-icon>
            </div>
            <div class="tool-content">
              <h4>Restore Card</h4>
              <p>Restore from saved backup</p>
            </div>
          </button>

          <!-- View All Backups -->
          <button class="tool-card" @click="${() => (this._showBackupHistory = true)}">
            <div class="tool-icon history">
              <ha-icon icon="mdi:history"></ha-icon>
            </div>
            <div class="tool-content">
              <h4>View All Backups</h4>
              <p>Browse all card backups</p>
            </div>
          </button>
        </div>

        <!-- Backup Status -->
        <div class="backup-status">
          ${!canCreateBackup
            ? html`
                <div class="status-warning">
                  <ha-icon icon="mdi:alert"></ha-icon>
                  Backup limit reached (${backupCount}/${backupLimit})
                </div>
              `
            : html`
                <div class="status-info">
                  <ha-icon icon="mdi:bookmark-multiple"></ha-icon>
                  ${backupCount} / ${backupLimit} backups used
                </div>
              `}
        </div>
      </div>
    `;
  }

  /**
   * Render Dashboard Pro Tools Section
   */
  private _renderDashboardProTools(lang: string): TemplateResult {
    const status = this._snapshotSchedulerStatus;

    return html`
      <div class="pro-tools-section">
        <div class="section-header">
          <div class="header-icon">
            <ha-icon icon="mdi:view-dashboard"></ha-icon>
          </div>
          <div class="header-content">
            <h3>Dashboard Pro Tools</h3>
            <p>Manage entire dashboard snapshots</p>
          </div>
        </div>

        <div class="tools-grid">
          <!-- Export Dashboard -->
          <button class="tool-card" @click="${this._handleExportDashboard}">
            <div class="tool-icon export">
              <ha-icon icon="mdi:export"></ha-icon>
            </div>
            <div class="tool-content">
              <h4>Export Dashboard</h4>
              <p>Download entire dashboard config</p>
            </div>
          </button>

          <!-- Import Dashboard -->
          <button class="tool-card" @click="${this._handleImportDashboard}">
            <div class="tool-icon import">
              <ha-icon icon="mdi:import"></ha-icon>
            </div>
            <div class="tool-content">
              <h4>Import Dashboard</h4>
              <p>Load dashboard from file</p>
            </div>
          </button>

          <!-- Create Snapshot -->
          <button class="tool-card" @click="${this._handleCreateSnapshot}">
            <div class="tool-icon snapshot">
              <ha-icon icon="mdi:camera-plus"></ha-icon>
            </div>
            <div class="tool-content">
              <h4>Create Snapshot</h4>
              <p>Manual dashboard snapshot</p>
            </div>
          </button>

          <!-- Restore Snapshot -->
          <button class="tool-card" @click="${this._handleRestoreSnapshot}">
            <div class="tool-icon restore">
              <ha-icon icon="mdi:backup-restore"></ha-icon>
            </div>
            <div class="tool-content">
              <h4>Restore Snapshot</h4>
              <p>Restore dashboard state</p>
            </div>
          </button>

          <!-- View Snapshots -->
          <button class="tool-card" @click="${this._handleViewSnapshots}">
            <div class="tool-icon history">
              <ha-icon icon="mdi:history"></ha-icon>
            </div>
            <div class="tool-content">
              <h4>View Snapshots</h4>
              <p>Browse dashboard snapshots</p>
            </div>
          </button>

          <!-- Snapshot Settings -->
          <button class="tool-card" @click="${() => (this._showSnapshotSettings = true)}">
            <div class="tool-icon settings">
              <ha-icon icon="mdi:cog"></ha-icon>
            </div>
            <div class="tool-content">
              <h4>Snapshot Settings</h4>
              <p>Configure auto-snapshots</p>
            </div>
          </button>
        </div>

        <!-- Snapshot Status -->
        <div class="snapshot-status">
          ${status
            ? html`
                <div class="status-card ${status.enabled ? 'enabled' : 'paused'}">
                  <div class="status-primary">
                    <ha-icon
                      icon="${status.enabled ? 'mdi:check-circle' : 'mdi:pause-circle'}"
                      class="status-icon"
                    ></ha-icon>
                    <div class="status-text">
                      <strong>Auto-snapshots: ${status.enabled ? 'Enabled' : 'Paused'}</strong>
                      <span class="status-desc">
                        ${status.enabled
                          ? 'Daily snapshots are active'
                          : 'Daily snapshots are paused'}
                      </span>
                    </div>
                  </div>

                  ${status.enabled && status.nextSnapshotTime
                    ? html`
                        <div class="status-detail">
                          <ha-icon icon="mdi:calendar-clock"></ha-icon>
                          <span
                            >Next: ${this._formatNextSnapshotTime(status.nextSnapshotTime)}</span
                          >
                        </div>
                      `
                    : ''}
                  ${status.lastSnapshotTime
                    ? html`
                        <div class="status-detail">
                          <ha-icon icon="mdi:history"></ha-icon>
                          <span
                            >Last: ${this._formatLastSnapshotTime(status.lastSnapshotTime)}</span
                          >
                        </div>
                      `
                    : ''}
                </div>
              `
            : html`
                <div class="status-loading">
                  <ha-icon icon="mdi:loading"></ha-icon>
                  Loading snapshot status...
                </div>
              `}
        </div>
      </div>
    `;
  }

  /**
   * Render View Backups Button
   */
  private _renderViewBackupsButton(lang: string): TemplateResult {
    return html`
      <div class="ultra-pro-view-backups">
        <button
          class="ultra-btn ultra-btn-view-backups"
          @click="${() => (this._showBackupHistory = true)}"
        >
          <ha-icon icon="mdi:history"></ha-icon>
          ${localize('editor.ultra_card_pro.view_backups', lang, 'View All Backups')}
        </button>
      </div>
    `;
  }

  /**
   * Render Snapshot Status Section (Pro only)
   */
  private _renderSnapshotStatusSection(lang: string): TemplateResult {
    const status = this._snapshotSchedulerStatus;

    return html`
      <div class="ultra-pro-snapshot-section">
        <div class="snapshot-header">
          <div class="header-content">
            <div class="header-icon">
              <ha-icon icon="mdi:camera-timer"></ha-icon>
            </div>
            <div class="header-text">
              <h3>Auto Dashboard Snapshots</h3>
              <p>Automatic daily backups of your entire dashboard</p>
            </div>
          </div>
          <button
            class="snapshot-settings-btn"
            @click="${() => (this._showSnapshotSettings = true)}"
            title="Configure snapshot settings"
          >
            <ha-icon icon="mdi:cog"></ha-icon>
          </button>
        </div>

        <div class="snapshot-status-container">
          ${status
            ? html`
                <div class="status-card ${status.enabled ? 'enabled' : 'paused'}">
                  <div class="status-primary">
                    <ha-icon
                      icon="${status.enabled ? 'mdi:check-circle' : 'mdi:pause-circle'}"
                      class="status-icon"
                    ></ha-icon>
                    <div class="status-text">
                      <strong>${status.enabled ? 'Enabled' : 'Paused'}</strong>
                      <span class="status-desc">
                        ${status.enabled
                          ? 'Daily snapshots are active'
                          : 'Daily snapshots are paused'}
                      </span>
                    </div>
                  </div>

                  ${status.enabled && status.nextSnapshotTime
                    ? html`
                        <div class="status-detail">
                          <div class="detail-icon">
                            <ha-icon icon="mdi:calendar-clock"></ha-icon>
                          </div>
                          <div class="detail-content">
                            <span class="detail-label">Next Snapshot</span>
                            <span class="detail-value">
                              ${this._formatNextSnapshotTime(status.nextSnapshotTime)}
                            </span>
                          </div>
                        </div>
                      `
                    : ''}
                  ${status.lastSnapshotTime
                    ? html`
                        <div class="status-detail">
                          <div class="detail-icon">
                            <ha-icon icon="mdi:history"></ha-icon>
                          </div>
                          <div class="detail-content">
                            <span class="detail-label">Last Snapshot</span>
                            <span class="detail-value">
                              ${this._formatLastSnapshotTime(status.lastSnapshotTime)}
                            </span>
                          </div>
                        </div>
                      `
                    : ''}
                  ${status.isRunning
                    ? html`
                        <div class="status-detail running">
                          <div class="detail-icon">
                            <ha-icon icon="mdi:loading" class="spinning"></ha-icon>
                          </div>
                          <div class="detail-content">
                            <span class="detail-value">Creating snapshot...</span>
                          </div>
                        </div>
                      `
                    : ''}
                </div>
              `
            : html`
                <div class="status-card loading">
                  <ha-icon icon="mdi:loading" class="spinning"></ha-icon>
                  <span>Loading snapshot status...</span>
                </div>
              `}

          <div class="manual-snapshot-action">
            <button
              class="ultra-btn ultra-btn-manual-snapshot"
              @click="${this._handleManualSnapshot}"
              ?disabled="${this._isCreatingManualSnapshot || status?.isRunning}"
            >
              <ha-icon
                icon="${this._isCreatingManualSnapshot ? 'mdi:loading' : 'mdi:camera-plus'}"
                class="${this._isCreatingManualSnapshot ? 'spinning' : ''}"
              ></ha-icon>
              ${this._isCreatingManualSnapshot
                ? 'Creating Snapshot...'
                : 'Perform Manual Dashboard Snapshot'}
            </button>
            <p class="manual-snapshot-note">
              <ha-icon icon="mdi:information"></ha-icon>
              Manual snapshots count towards your 30-day snapshot history.
            </p>
          </div>

          <div class="snapshot-info-card">
            <div class="info-icon-container">
              <ha-icon icon="mdi:information-outline"></ha-icon>
            </div>
            <div class="info-content">
              <h4>What are Dashboard Snapshots?</h4>
              <p>
                Automatically backs up <strong>all</strong> your Ultra Cards across your entire
                dashboard once per day. Both auto and manual snapshots are kept for
                <strong>30 days</strong> and include card positions for easy restoration.
              </p>
            </div>
          </div>
        </div>

        <style>
          .ultra-pro-snapshot-section {
            margin: 16px 0;
            padding: 20px;
            background: var(--card-background-color);
            border-radius: 12px;
            border: 2px solid var(--primary-color, #03a9f4);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .snapshot-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--divider-color, #e0e0e0);
          }

          .header-content {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .header-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, #0288d1 100%);
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(3, 169, 244, 0.3);
          }

          .header-icon ha-icon {
            --mdc-icon-size: 28px;
            color: white;
          }

          .header-text h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--primary-text-color);
          }

          .header-text p {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: var(--secondary-text-color);
            opacity: 0.8;
          }

          .snapshot-settings-btn {
            padding: 10px;
            background: var(--secondary-background-color, #f5f5f5);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--primary-text-color);
          }

          .snapshot-settings-btn:hover {
            background: var(--divider-color, #e0e0e0);
            transform: rotate(90deg);
          }

          .snapshot-settings-btn ha-icon {
            --mdc-icon-size: 20px;
          }

          .snapshot-status-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .status-card {
            background: var(--secondary-background-color, #f5f5f5);
            border-radius: 10px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .status-card.enabled {
            border-left: 4px solid var(--success-color, #4caf50);
          }

          .status-card.paused {
            border-left: 4px solid var(--warning-color, #ff9800);
          }

          .status-card.loading {
            flex-direction: row;
            align-items: center;
            gap: 12px;
            justify-content: center;
            color: var(--secondary-text-color);
          }

          .status-primary {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .status-icon {
            --mdc-icon-size: 32px;
          }

          .status-card.enabled .status-icon {
            color: var(--success-color, #4caf50);
          }

          .status-card.paused .status-icon {
            color: var(--warning-color, #ff9800);
          }

          .status-text {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .status-text strong {
            font-size: 16px;
            color: var(--primary-text-color);
          }

          .status-desc {
            font-size: 13px;
            color: var(--secondary-text-color);
            opacity: 0.9;
          }

          .status-detail {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--card-background-color);
            border-radius: 8px;
          }

          .status-detail.running {
            background: var(--primary-color, #03a9f4);
            color: white;
          }

          .status-detail.running .detail-value {
            color: white;
          }

          .detail-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: var(--secondary-background-color, #f5f5f5);
            border-radius: 8px;
          }

          .status-detail.running .detail-icon {
            background: rgba(255, 255, 255, 0.2);
          }

          .detail-icon ha-icon {
            --mdc-icon-size: 20px;
            color: var(--primary-color, #03a9f4);
          }

          .status-detail.running .detail-icon ha-icon {
            color: white;
          }

          .detail-content {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .detail-label {
            font-size: 12px;
            color: var(--secondary-text-color);
            opacity: 0.8;
            text-transform: uppercase;
            font-weight: 500;
            letter-spacing: 0.5px;
          }

          .detail-value {
            font-size: 14px;
            color: var(--primary-text-color);
            font-weight: 500;
          }

          .manual-snapshot-action {
            margin: 20px 0;
            padding: 16px;
            background: linear-gradient(
              135deg,
              rgba(3, 169, 244, 0.05) 0%,
              rgba(2, 136, 209, 0.08) 100%
            );
            border-radius: 10px;
            border: 2px dashed var(--primary-color, #03a9f4);
          }

          .ultra-btn-manual-snapshot {
            width: 100%;
            padding: 14px 20px;
            font-size: 15px;
            font-weight: 600;
            background: linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, #0288d1 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(3, 169, 244, 0.3);
          }

          .ultra-btn-manual-snapshot:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(3, 169, 244, 0.4);
          }

          .ultra-btn-manual-snapshot:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .ultra-btn-manual-snapshot ha-icon {
            --mdc-icon-size: 22px;
          }

          .manual-snapshot-note {
            margin: 12px 0 0 0;
            padding: 0;
            font-size: 13px;
            color: var(--secondary-text-color);
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
          }

          .manual-snapshot-note ha-icon {
            --mdc-icon-size: 16px;
            color: var(--primary-color, #03a9f4);
          }

          .snapshot-info-card {
            display: flex;
            gap: 16px;
            padding: 16px;
            background: var(--secondary-background-color, #f5f5f5);
            border-radius: 10px;
            border-left: 4px solid var(--primary-color, #03a9f4);
          }

          .info-icon-container {
            display: flex;
            align-items: flex-start;
            padding-top: 2px;
          }

          .info-icon-container ha-icon {
            --mdc-icon-size: 24px;
            color: var(--primary-color, #03a9f4);
          }

          .info-content {
            flex: 1;
          }

          .info-content h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-text-color);
          }

          .info-content p {
            margin: 0;
            font-size: 13px;
            line-height: 1.5;
            color: var(--secondary-text-color);
          }

          .info-content strong {
            color: var(--primary-text-color);
            font-weight: 600;
          }

          .spinning {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 768px) {
            .ultra-pro-snapshot-section {
              padding: 16px;
            }

            .header-content {
              gap: 12px;
            }

            .header-icon {
              width: 40px;
              height: 40px;
            }

            .header-icon ha-icon {
              --mdc-icon-size: 24px;
            }

            .header-text h3 {
              font-size: 16px;
            }

            .header-text p {
              font-size: 12px;
            }

            .status-primary {
              flex-direction: column;
              align-items: flex-start;
            }
          }
        </style>
      </div>
    `;
  }

  private _formatNextSnapshotTime(time: Date): string {
    const now = new Date();
    const isToday = time.getDate() === now.getDate();
    const timeString = time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${isToday ? 'Today' : 'Tomorrow'} at ${timeString}`;
  }

  private _formatLastSnapshotTime(time: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return time.toLocaleDateString();
  }

  private _handleCardNameChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const newConfig = { ...this.config, card_name: input.value };
    this._updateConfig(newConfig);
  }

  private _handleExport() {
    try {
      // Use new encoded format (compressed + Base64)
      UcConfigEncoder.exportToFile(
        this.config,
        `${(this.config.card_name || 'ultra-card').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.txt`
      );

      const lang = 'en';
      alert(localize('editor.ultra_card_pro.export_success', lang, 'Card configuration exported!'));
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export card configuration');
    }
  }

  private _handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json'; // Accept both encoded (.txt) and plain JSON

    input.onchange = async (e: Event) => {
      try {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const text = await file.text();
        let data: any;

        // Try to parse as JSON first (snapshot format)
        try {
          data = JSON.parse(text);
        } catch {
          // If JSON parsing fails, try as encoded format
          data = await UcConfigEncoder.importFromFile(file);
        }

        // Check if this is a snapshot file (multiple cards)
        if (data.cards && Array.isArray(data.cards)) {
          this._handleSnapshotImport(data);
          return;
        }

        // Single card config
        const config = data.type ? data : await UcConfigEncoder.importFromFile(file);

        // Validate it's an Ultra Card config
        if (config.type !== 'custom:ultra-card' || !config.layout) {
          throw new Error('Invalid Ultra Card configuration file');
        }

        if (confirm('Import this card configuration? Your current config will be replaced.')) {
          this._updateConfig(config);
          const lang = 'en';
          alert(
            localize('editor.ultra_card_pro.import_success', lang, 'Card configuration imported!')
          );
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert(
          'Failed to import card configuration: ' +
            (error instanceof Error ? error.message : 'Unknown error')
        );
      }
    };

    input.click();
  }

  private _handleSnapshotImport(snapshotData: any) {
    const cards = snapshotData.cards || [];

    if (cards.length === 0) {
      alert('No cards found in snapshot file');
      return;
    }

    // Build selection message
    let message = `📸 Snapshot Import\n\n`;
    message += `Found ${cards.length} cards in this snapshot.\n\n`;
    message += `Select a card to import:\n\n`;

    // Group cards by view
    const cardsByView: { [key: string]: any[] } = {};
    cards.forEach((card: any, index: number) => {
      const viewTitle = card.view_title || 'Unknown View';
      if (!cardsByView[viewTitle]) {
        cardsByView[viewTitle] = [];
      }
      cardsByView[viewTitle].push({ ...card, originalIndex: index });
    });

    // Build selection options
    let cardIndex = 0;
    const cardOptions: any[] = [];

    Object.entries(cardsByView).forEach(([viewTitle, viewCards]) => {
      message += `\n📋 ${viewTitle}:\n`;
      viewCards.forEach((card: any) => {
        cardIndex++;
        const cardName = card.card_name || card.config?.card_name || `Card ${card.card_index + 1}`;
        message += `  ${cardIndex}. ${cardName}\n`;
        cardOptions.push(card);
      });
    });

    message += `\n\nEnter the number of the card you want to import (1-${cardOptions.length}):`;

    const selection = prompt(message);
    if (!selection) return;

    const selectedNum = parseInt(selection);
    if (isNaN(selectedNum) || selectedNum < 1 || selectedNum > cardOptions.length) {
      alert('Invalid selection');
      return;
    }

    const selectedCard = cardOptions[selectedNum - 1];
    const config = selectedCard.config;

    if (!config || config.type !== 'custom:ultra-card') {
      alert('Invalid card configuration in snapshot');
      return;
    }

    if (
      confirm(
        `Import "${selectedCard.card_name || 'this card'}"?\n\nThis will replace your current card configuration.`
      )
    ) {
      this._updateConfig(config);
      alert(`✅ Card imported successfully from snapshot!`);
    }
  }

  private _handleCreateBackup() {
    this._showManualBackup = true;
  }

  // Dashboard Pro Tools Handlers
  private _handleExportDashboard() {
    try {
      // Export current dashboard configuration
      const dashboardConfig = {
        views: this.hass?.panels?.['lovelace']?.config?.views || [],
        dashboard_path: this.hass?.panels?.['lovelace']?.config?.dashboard_path || 'default',
        exported_at: new Date().toISOString(),
        exported_by: this._cloudUser?.username || 'Unknown',
      };

      const blob = new Blob([JSON.stringify(dashboardConfig, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Dashboard configuration exported successfully!');
    } catch (error) {
      console.error('Dashboard export failed:', error);
      alert('Failed to export dashboard configuration');
    }
  }

  private _handleImportDashboard() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e: Event) => {
      try {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.views || !Array.isArray(data.views)) {
          throw new Error('Invalid dashboard configuration file');
        }

        if (
          confirm('Import this dashboard configuration? This will replace your current dashboard.')
        ) {
          // This would need to be implemented with proper Home Assistant API calls
          alert(
            'Dashboard import functionality requires Home Assistant API integration.\nPlease use the Home Assistant UI to import dashboard configurations.'
          );
        }
      } catch (error) {
        console.error('Dashboard import failed:', error);
        alert(
          'Failed to import dashboard configuration: ' +
            (error instanceof Error ? error.message : 'Unknown error')
        );
      }
    };

    input.click();
  }

  private _handleCreateSnapshot() {
    // Use the existing manual snapshot functionality
    this._handleManualSnapshot();
  }

  private _handleRestoreSnapshot() {
    // This will open the snapshot history modal for restoration
    this._showBackupHistory = true;
  }

  private _handleViewSnapshots() {
    // This will open the snapshot history modal
    this._showBackupHistory = true;
  }

  private _handleManualBackupCreated(e: CustomEvent) {
    const lang = 'en';
    const { name } = e.detail;

    // Refresh subscription to update count
    if (this._cloudUser) {
      ucCloudBackupService.getSubscription().then(subscription => {
        if (this._cloudUser) {
          this._cloudUser.subscription = subscription;
          this.requestUpdate();
        }
      });
    }

    alert(
      localize('editor.ultra_card_pro.backup_created', lang, 'Backup created successfully!') +
        `\n\n"${name}"`
    );
  }

  private _handleBackupRestored(e: CustomEvent) {
    const { config } = e.detail;
    this._updateConfig(config);
    alert('Backup restored successfully!');
  }

  private _handleSnapshotCreated(e: CustomEvent) {
    // Refresh user subscription to update snapshot count
    if (this._cloudUser) {
      ucCloudBackupService.getSubscription().then(subscription => {
        if (this._cloudUser) {
          this._cloudUser.subscription = subscription;
          this.requestUpdate();
        }
      });
    }
    alert('Snapshot created successfully!');
  }

  private _handleSnapshotRestored(e: CustomEvent) {
    // Snapshot has been automatically restored to the dashboard
  }

  private _handleCardBackupRestored(e: CustomEvent) {
    const { config } = e.detail;
    this._updateConfig(config);
    alert('Card backup restored successfully!');
  }

  private async _handleSnapshotSettingsSaved() {
    // Refresh scheduler status
    this._updateSnapshotSchedulerStatus();
  }

  private async _updateSnapshotSchedulerStatus() {
    try {
      this._snapshotSchedulerStatus = await ucSnapshotSchedulerService.getStatus();
    } catch (error) {
      console.error('Failed to get snapshot scheduler status:', error);
    }
  }

  /**
   * Handle manual snapshot creation
   */
  private async _handleManualSnapshot(): Promise<void> {
    if (this._isCreatingManualSnapshot) {
      return;
    }

    try {
      this._isCreatingManualSnapshot = true;

      // Create the snapshot
      await ucSnapshotService.createSnapshot();

      // Update the last snapshot timestamp
      ucSnapshotSchedulerService.updateLastSnapshotTime();

      // Refresh the scheduler status to update the display
      await this._updateSnapshotSchedulerStatus();

      // Show success notification using HA toast
      const event = new CustomEvent('hass-notification', {
        detail: {
          message: '✅ Manual dashboard snapshot created successfully!',
          duration: 5000,
        },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    } catch (error) {
      console.error('❌ Manual snapshot failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create manual snapshot: ${errorMessage}`);
    } finally {
      this._isCreatingManualSnapshot = false;
    }
  }

  private async _handleLoadNewerBackup() {
    if (!this._newerBackupAvailable) return;

    if (
      !confirm(
        'Load the newer backup from another device? Your current unsaved changes will be lost.'
      )
    ) {
      return;
    }

    try {
      const config = await ucCloudBackupService.restoreBackup(this._newerBackupAvailable.id);
      this._updateConfig(config);
      this._showSyncNotification = false;
      this._newerBackupAvailable = null;
      alert('Newer backup loaded successfully!');
    } catch (error) {
      console.error('Failed to load newer backup:', error);
      alert(
        'Failed to load newer backup: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }

  private _handleDismissSyncNotification() {
    this._showSyncNotification = false;
    this._newerBackupAvailable = null;
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
                    Sign In to Ultra Card Cloud <span class="beta-badge">BETA</span>
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
        <h5>Sign In to Ultra Card Cloud <span class="beta-badge">BETA</span></h5>

        ${this._loginError
          ? html`<div class="error-message">${unsafeHTML(this._loginError)}</div>`
          : ''}

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
   * Initialize Pro services after successful authentication
   * Called both on fresh login and when restoring session from storage
   */
  private async _initializeProServices(user: CloudUser): Promise<void> {
    const wordpressUrl = 'https://ultracard.io'; // TODO: Make this configurable

    // Initialize services
    if (this.hass) {
      ucSnapshotService.initialize(this.hass, wordpressUrl);
      ucDashboardScannerService.initialize(this.hass);
    }
    ucCardBackupService.initialize(wordpressUrl);

    // Enable sync by default
    await ucCloudSyncService.setSyncEnabled(true);

    // Start auto-snapshot scheduler for Pro users
    if (user?.subscription?.tier === 'pro') {
      ucSnapshotSchedulerService.start();
      // Subscribe to status updates
      ucSnapshotSchedulerService.subscribe(status => {
        this._snapshotSchedulerStatus = status;
      });
      // Get initial status
      this._updateSnapshotSchedulerStatus();
    }
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
      const user = await ucCloudAuthService.login({ username, password });
      this._showLoginForm = false;

      // Initialize Pro services
      await this._initializeProServices(user);

      console.log('✅ Successfully logged in and initialized all services');
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
      // Stop snapshot scheduler
      ucSnapshotSchedulerService.stop();
      this._snapshotSchedulerStatus = null;

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

      // Show success message (could be enhanced with toast notification)
      const totalSynced = results.favorites.synced + results.colors.synced + results.reviews.synced;
      if (totalSynced > 0) {
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

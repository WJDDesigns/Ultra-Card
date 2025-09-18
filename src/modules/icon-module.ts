import { TemplateResult, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { formatEntityState } from '../utils/number-format';
import { CardModule, IconModule, IconConfig, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { TemplateService } from '../services/template-service';
// Removed ActionsTabService in favor of GlobalActionsTab
import { EntityIconService } from '../services/entity-icon-service';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { UltraLinkComponent } from '../components/ultra-link';
import { getImageUrl } from '../utils/image-upload';
import { localize } from '../localize/localize';
import { GlobalLogicTab } from '../tabs/global-logic-tab';

import '../components/ultra-color-picker';

export class UltraIconModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'icon',
    title: 'Icons',
    description: 'Interactive icon buttons',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:circle',
    category: 'interactive',
    tags: ['icon', 'button', 'interactive', 'control'],
  };

  private _previewCollapsed = false;
  private _templateService?: TemplateService;

  // Ensure animation/keyframe CSS is globally available (outside editor shadow DOM)
  private static _globalStylesInjected = false;
  private _localStylesInjected = false;

  // Keyframes CSS shared across all icons (needed inside nested shadow roots)
  private static readonly _ANIMATION_KEYFRAMES = `
    @keyframes iconPulse {0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.7;transform:scale(1.1);}}
    @keyframes iconSpin {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes iconBounce {0%,20%,50%,80%,100%{transform:translateY(0);}40%{transform:translateY(-10px);}60%{transform:translateY(-5px);}}
    @keyframes iconFlash {0%,50%,100%{opacity:1;}25%,75%{opacity:0.3;}}
    @keyframes iconShake {0%,100%{transform:translateX(0);}10%,30%,50%,70%,90%{transform:translateX(-2px);}20%,40%,60%,80%{transform:translateX(2px);}}
    @keyframes iconVibrate {0%,100%{transform:translate(0);}10%{transform:translate(-1px,-1px);}20%{transform:translate(1px,-1px);}30%{transform:translate(-1px,1px);}40%{transform:translate(1px,1px);}50%{transform:translate(-1px,-1px);}60%{transform:translate(1px,-1px);}70%{transform:translate(-1px,1px);}80%{transform:translate(1px,1px);}90%{transform:translate(-1px,-1px);}}
    @keyframes iconRotateLeft {from{transform:rotate(0deg);}to{transform:rotate(-360deg);}}
    @keyframes iconRotateRight {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes iconFade {0%,100%{opacity:1;}50%{opacity:0.3;}}
    @keyframes iconScale {0%,100%{transform:scale(1);}50%{transform:scale(1.2);}}
    @keyframes iconTada {0%{transform:scale(1);}10%,20%{transform:scale(0.9) rotate(-3deg);}30%,50%,70%,90%{transform:scale(1.1) rotate(3deg);}40%,60%,80%{transform:scale(1.1) rotate(-3deg);}100%{transform:scale(1) rotate(0);}}
  `;

  // Inject module CSS into <head> once
  private _injectGlobalStyles(): void {
    if (UltraIconModule._globalStylesInjected) return;

    if (typeof document !== 'undefined') {
      const styleId = 'uvc-icon-module-styles';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = this.getStyles() + '\n' + UltraIconModule._ANIMATION_KEYFRAMES;
        document.head.appendChild(styleEl);
      }
      UltraIconModule._globalStylesInjected = true;
    }
  }

  // Simple string hash function for template cache keys
  private _hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36); // Convert to base36 for shorter strings
  }

  // Jinja2 syntax highlighting
  private _highlightJinja2(template: string): string {
    if (!template) return '';

    // Escape HTML first
    const escaped = template.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let highlighted = escaped;

    // Highlight Jinja2 template expressions {{ }}
    highlighted = highlighted.replace(
      /(\{\{[\s\S]*?\}\})/g,
      '<span style="color: #569cd6;">$1</span>'
    );

    // Highlight Jinja2 template statements {% %}
    highlighted = highlighted.replace(
      /(\{%[\s\S]*?%\})/g,
      '<span style="color: #c586c0;">$1</span>'
    );

    // Highlight strings within templates
    highlighted = highlighted.replace(
      /((['"`])[^'"`]*?\2)/g,
      '<span style="color: #ce9178;">$1</span>'
    );

    // Highlight Jinja2 keywords
    const keywords = [
      'if',
      'else',
      'elif',
      'endif',
      'for',
      'endfor',
      'in',
      'not',
      'and',
      'or',
      'is',
      'true',
      'false',
      'none',
      'True',
      'False',
      'None',
    ];

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span style="color: #569cd6;">$1</span>');
    });

    // Highlight functions and filters
    highlighted = highlighted.replace(
      /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
      '<span style="color: #dcdcaa;">$1</span>('
    );

    // Highlight filters (after |)
    highlighted = highlighted.replace(
      /\|\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,
      '| <span style="color: #dcdcaa;">$1</span>'
    );

    // Highlight numbers
    highlighted = highlighted.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      '<span style="color: #b5cea8;">$1</span>'
    );

    // Highlight operators
    highlighted = highlighted.replace(
      /(==|!=|<=|>=|<|>|\+|-|\*|\/|%)/g,
      '<span style="color: #d4d4d4;">$1</span>'
    );

    return highlighted;
  }

  createDefault(id?: string, hass?: HomeAssistant): IconModule {
    return {
      id: id || this.generateId('icon'),
      type: 'icon',
      icons: [
        {
          id: this.generateId('icon-item'),
          entity: 'weather.forecast_home',
          name: '',
          icon_inactive: 'mdi:weather-partly-cloudy',
          icon_active: 'mdi:weather-partly-cloudy',
          inactive_state: '',
          active_state: '',
          custom_inactive_state_text: '',
          custom_active_state_text: '',
          custom_inactive_name_text: '',
          custom_active_name_text: '',

          // Legacy template modes (deprecated)
          inactive_template_mode: false,
          inactive_template: '',
          active_template_mode: false,
          active_template: '',

          // Entity color options
          use_entity_color_for_icon: false,
          use_state_color_for_inactive_icon: false,
          use_state_color_for_active_icon: false,

          // Color configuration
          color_inactive: 'var(--secondary-text-color)',
          color_active: 'var(--primary-color)',
          inactive_icon_color: 'var(--secondary-text-color)',
          active_icon_color: 'var(--primary-color)',
          inactive_name_color: 'var(--primary-text-color)',
          active_name_color: 'var(--primary-text-color)',
          inactive_state_color: 'var(--secondary-text-color)',
          active_state_color: 'var(--secondary-text-color)',

          // Display toggles
          show_name_when_inactive: true,
          show_state_when_inactive: true,
          show_icon_when_inactive: true,
          show_name_when_active: true,
          show_state_when_active: true,
          show_icon_when_active: true,

          // Legacy (backward compatibility)
          show_state: true,
          show_name: true,

          // Other display options
          show_units: true,
          enable_hover_effect: false,

          // Sizing
          icon_size: 26,
          text_size: 14,
          name_icon_gap: 8,
          name_state_gap: 2,
          icon_state_gap: 4,

          // Active/Inactive specific sizing
          active_icon_size: 26,
          inactive_icon_size: 26,
          active_text_size: 14,
          inactive_text_size: 14,
          state_size: 14,
          active_state_size: 14,
          inactive_state_size: 14,

          // Individual size lock mechanism
          icon_size_locked: true,
          text_size_locked: true,
          state_size_locked: true,

          // Field lock mechanism (active fields inherit from inactive by default)
          active_icon_locked: true,
          active_icon_color_locked: false,
          active_icon_background_locked: true,
          active_icon_background_color_locked: true,
          active_name_locked: true,
          active_name_color_locked: true,
          active_state_locked: false,
          active_state_color_locked: true,

          // Icon background
          icon_background: 'none',
          use_entity_color_for_icon_background: false,
          icon_background_color: 'transparent',

          // Animations
          inactive_icon_animation: 'none',
          active_icon_animation: 'none',

          // Container appearance
          vertical_alignment: 'center',
          container_width: undefined,
          container_background_shape: 'none',
          container_background_color: '#808080',

          // Ultra Link Actions
          tap_action: { action: 'nothing' },
          hold_action: { action: 'nothing' },
          double_tap_action: { action: 'nothing' },

          // Legacy actions (backward compatibility)
          click_action: 'toggle',
          double_click_action: 'none',
          hold_action_legacy: 'none',
          navigation_path: '',
          url: '',
          service: '',
          service_data: {},

          // Legacy template support
          template_mode: false,
          template: '',

          // Dynamic templates
          dynamic_icon_template_mode: false,
          dynamic_icon_template: '',
          dynamic_color_template_mode: false,
          dynamic_color_template: '',
        },
      ],
      // alignment: undefined, // No default alignment to allow Global Design tab control
      // vertical_alignment: undefined, // No default alignment to allow Global Design tab control
      columns: 3,
      gap: 16,
      // Global action configuration (for the module container)
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const iconModule = module as IconModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        ${iconModule.icons.map(
          (icon, index) => html`
            <div class="icon-settings-container">
              <!-- Entity Configuration -->
              ${this.renderSettingsSection(
                localize('editor.icon.entity_config.title', lang, 'ENTITY CONFIGURATION'),
                localize(
                  'editor.icon.entity_config.desc',
                  lang,
                  'Configure the entity and active/inactive states'
                ),
                [
                  {
                    title: localize('editor.icon.entity', lang, 'Entity'),
                    description: localize(
                      'editor.icon.entity_desc',
                      lang,
                      'Select the entity this icon represents'
                    ),
                    hass,
                    data: { entity: icon.entity || '' },
                    schema: [this.entityField('entity')],
                    onChange: (e: CustomEvent) => {
                      const entityId = e.detail.value.entity;
                      const updates: Partial<IconConfig> = { entity: entityId };

                      // Auto-populate from entity when switching
                      if (entityId && hass?.states[entityId]) {
                        // Use the centralized icon service
                        const entityIcon = EntityIconService.getEntityIcon(entityId, hass);

                        // Always update icon when switching entities if available
                        if (entityIcon) {
                          updates.icon_inactive = entityIcon;
                          // If icon is locked (default), also update active icon
                          const currentIcon = iconModule.icons[index];
                          if (currentIcon.active_icon_locked !== false) {
                            updates.icon_active = entityIcon;
                          }
                        }
                      }

                      // Auto-populate states for binary entities
                      if (entityId && this._isBinaryEntity(entityId)) {
                        // Only set default states if both are currently empty
                        const currentIcon = iconModule.icons[index];
                        if (!currentIcon.active_state && !currentIcon.inactive_state) {
                          updates.active_state = 'on';
                          updates.inactive_state = 'off';
                        }
                      }

                      this._updateIcon(iconModule, index, updates, updateModule);
                    },
                  },
                  {
                    title: localize('editor.icon.inactive_state', lang, 'Inactive State'),
                    description: localize(
                      'editor.icon.inactive_state_desc',
                      lang,
                      'State value considered "inactive" (leave blank to use actual entity state)'
                    ),
                    hass,
                    data: { inactive_state: icon.inactive_state || '' },
                    schema: [this.textField('inactive_state')],
                    onChange: (e: CustomEvent) =>
                      this._updateIcon(
                        iconModule,
                        index,
                        { inactive_state: e.detail.value.inactive_state },
                        updateModule
                      ),
                  },
                  {
                    title: localize('editor.icon.active_state', lang, 'Active State'),
                    description: localize(
                      'editor.icon.active_state_desc',
                      lang,
                      'State value considered "active" (leave blank to use actual entity state)'
                    ),
                    hass,
                    data: { active_state: icon.active_state || '' },
                    schema: [this.textField('active_state')],
                    onChange: (e: CustomEvent) =>
                      this._updateIcon(
                        iconModule,
                        index,
                        { active_state: e.detail.value.active_state },
                        updateModule
                      ),
                  },
                ]
              )}

              <!-- Icon Section -->
              <div class="settings-section" style="margin-bottom: 24px;">
                <div class="section-title">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span>${localize('editor.icon.icon_section.title', lang, 'Icon')}</span>
                    <ha-switch
                      .checked=${icon.show_icon_when_active !== false &&
                      icon.show_icon_when_inactive !== false}
                      @change=${(e: Event) => {
                        const target = e.target as any;
                        const enabled = target.checked;
                        this._updateIcon(
                          iconModule,
                          index,
                          {
                            show_icon_when_active: enabled,
                            show_icon_when_inactive: enabled,
                          },
                          updateModule
                        );
                      }}
                    ></ha-switch>
                  </div>
                </div>

                ${icon.show_icon_when_active !== false || icon.show_icon_when_inactive !== false
                  ? html`
                      <!-- Inactive Icon Section -->
                      <div style="margin-top: 16px;">
                        <details
                          style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                          @toggle=${(e: Event) => {
                            const details = e.target as HTMLDetailsElement;
                            const icon = details.querySelector('ha-icon') as HTMLElement;
                            if (icon) {
                              icon.style.transform = details.open
                                ? 'rotate(90deg)'
                                : 'rotate(0deg)';
                            }
                          }}
                        >
                          <summary
                            style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                          >
                            <ha-icon
                              icon="mdi:chevron-right"
                              style="transition: transform 0.2s;"
                            ></ha-icon>
                            ${localize('editor.icon.inactive_icon', lang, 'Inactive Icon')}
                          </summary>
                          <div style="padding: 16px;">
                            ${this.renderSettingsSection(
                              localize(
                                'editor.icon.inactive_icon_config',
                                lang,
                                'Inactive Icon Configuration'
                              ),
                              localize(
                                'editor.icon.inactive_icon_config_desc',
                                lang,
                                'Configure the inactive icon settings'
                              ),
                              [
                                {
                                  title: localize(
                                    'editor.icon.inactive_icon',
                                    lang,
                                    'Inactive Icon'
                                  ),
                                  description: localize(
                                    'editor.icon.inactive_icon_desc',
                                    lang,
                                    'Icon to show when inactive'
                                  ),
                                  hass,
                                  data: { icon_inactive: icon.icon_inactive || '' },
                                  schema: [this.iconField('icon_inactive')],
                                  onChange: (e: CustomEvent) =>
                                    this._updateIconWithLockSync(
                                      iconModule,
                                      index,
                                      'icon_inactive',
                                      e.detail.value.icon_inactive,
                                      updateModule
                                    ),
                                },
                              ]
                            )}

                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.inactive_icon_color',
                                  lang,
                                  'Inactive Icon Color'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.icon_color_inactive',
                                  lang,
                                  'Color when inactive'
                                )}
                              </div>
                              <ultra-color-picker
                                .value=${icon.inactive_icon_color || 'var(--secondary-text-color)'}
                                @value-changed=${(e: CustomEvent) =>
                                  this._updateIconWithLockSync(
                                    iconModule,
                                    index,
                                    'inactive_icon_color',
                                    e.detail.value,
                                    updateModule
                                  )}
                              ></ultra-color-picker>
                            </div>

                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.use_state_color_inactive',
                                  lang,
                                  'Use State Color'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.use_state_color_inactive_desc',
                                  lang,
                                  'Use the entity state color (RGB attributes) for inactive icon color'
                                )}
                              </div>
                              <ha-switch
                                .checked=${icon.use_state_color_for_inactive_icon || false}
                                @change=${(e: Event) => {
                                  const target = e.target as any;
                                  this._updateIcon(
                                    iconModule,
                                    index,
                                    { use_state_color_for_inactive_icon: target.checked },
                                    updateModule
                                  );
                                }}
                              ></ha-switch>
                            </div>

                            ${this.renderSettingsSection(
                              localize(
                                'editor.icon.background_section.title',
                                lang,
                                'Inactive Background'
                              ),
                              localize(
                                'editor.icon.background_section.desc',
                                lang,
                                'Configure the inactive background settings'
                              ),
                              [
                                {
                                  title: localize(
                                    'editor.icon.inactive_icon_background',
                                    lang,
                                    'Inactive Background Shape'
                                  ),
                                  description: localize(
                                    'editor.icon.background_shape_inactive',
                                    lang,
                                    'Background shape when inactive'
                                  ),
                                  hass,
                                  data: {
                                    inactive_icon_background:
                                      icon.inactive_icon_background || 'none',
                                  },
                                  schema: [
                                    this.selectField('inactive_icon_background', [
                                      { value: 'none', label: 'None' },
                                      { value: 'circle', label: 'Circle' },
                                      { value: 'square', label: 'Square' },
                                      { value: 'rounded-square', label: 'Rounded Square' },
                                    ]),
                                  ],
                                  onChange: (e: CustomEvent) => {
                                    const shape = e.detail.value.inactive_icon_background;
                                    const updates: any = {
                                      inactive_icon_background: shape,
                                    };

                                    // Auto-set background color when shape is selected (but not 'none')
                                    if (shape && shape !== 'none') {
                                      updates.inactive_icon_background_color =
                                        'var(--divider-color)';
                                    }

                                    this._updateIcon(iconModule, index, updates, updateModule);
                                  },
                                },
                              ]
                            )}

                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.inactive_icon_background_color',
                                  lang,
                                  'Inactive Background Color'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.background_color_inactive',
                                  lang,
                                  'Background color when inactive'
                                )}
                              </div>
                              <ultra-color-picker
                                .value=${icon.inactive_icon_background_color || 'transparent'}
                                @value-changed=${(e: CustomEvent) =>
                                  this._updateIconWithLockSync(
                                    iconModule,
                                    index,
                                    'inactive_icon_background_color',
                                    e.detail.value,
                                    updateModule
                                  )}
                              ></ultra-color-picker>
                            </div>

                            <div class="field-container">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.inactive_icon_size',
                                  lang,
                                  'Inactive Icon Size'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.icon_size_inactive',
                                  lang,
                                  'Icon size when inactive'
                                )}
                              </div>
                              ${this._renderSizeControl(
                                iconModule,
                                index,
                                updateModule,
                                'inactive_icon_size',
                                icon.inactive_icon_size || 26,
                                0,
                                50,
                                26
                              )}
                            </div>
                          </div>
                        </details>
                      </div>

                      <!-- Active Icon Section -->
                      <div style="margin-top: 16px;">
                        <details
                          style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                          @toggle=${(e: Event) => {
                            const details = e.target as HTMLDetailsElement;
                            const icon = details.querySelector('ha-icon') as HTMLElement;
                            if (icon) {
                              icon.style.transform = details.open
                                ? 'rotate(90deg)'
                                : 'rotate(0deg)';
                            }
                          }}
                        >
                          <summary
                            style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                          >
                            <ha-icon
                              icon="mdi:chevron-right"
                              style="transition: transform 0.2s;"
                            ></ha-icon>
                            ${localize('editor.icon.active_icon', lang, 'Active Icon')}
                          </summary>
                          <div style="padding: 16px;">
                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize('editor.icon.active_icon', lang, 'Active Icon')}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.active_icon_desc',
                                  lang,
                                  'Icon to show when active'
                                )}
                              </div>
                              ${this._renderFieldWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'active_icon_locked',
                                'icon_active',
                                'icon_inactive',
                                icon.icon_active || icon.icon_inactive || '',
                                'icon',
                                hass
                              )}
                            </div>

                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.active_icon_color',
                                  lang,
                                  'Active Icon Color'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.icon_color_active',
                                  lang,
                                  'Color when active'
                                )}
                              </div>
                              ${this._renderFieldWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'active_icon_color_locked',
                                'active_icon_color',
                                'inactive_icon_color',
                                icon.active_icon_color || 'var(--primary-color)',
                                'color',
                                hass
                              )}
                            </div>

                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.use_state_color_active',
                                  lang,
                                  'Use State Color'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.use_state_color_active_desc',
                                  lang,
                                  'Use the entity state color (RGB attributes) for active icon color'
                                )}
                              </div>
                              ${this._renderFieldWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'active_state_color_locked',
                                'use_state_color_for_active_icon',
                                'use_state_color_for_inactive_icon',
                                icon.use_state_color_for_active_icon || false,
                                'toggle',
                                hass
                              )}
                            </div>

                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.active_icon_background',
                                  lang,
                                  'Active Background Shape'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.background_shape_active',
                                  lang,
                                  'Background shape when active'
                                )}
                              </div>
                              ${this._renderFieldWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'active_icon_background_locked',
                                'active_icon_background',
                                'inactive_icon_background',
                                icon.active_icon_background || 'none',
                                'select',
                                hass,
                                [
                                  { value: 'none', label: 'None' },
                                  { value: 'circle', label: 'Circle' },
                                  { value: 'square', label: 'Square' },
                                  { value: 'rounded-square', label: 'Rounded Square' },
                                ]
                              )}
                            </div>

                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.active_icon_background_color',
                                  lang,
                                  'Active Background Color'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.background_color_active',
                                  lang,
                                  'Background color when active'
                                )}
                              </div>
                              ${this._renderFieldWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'active_icon_background_color_locked',
                                'active_icon_background_color',
                                'inactive_icon_background_color',
                                icon.active_icon_background_color || 'transparent',
                                'color',
                                hass
                              )}
                            </div>

                            <div class="field-container">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.active_icon_size',
                                  lang,
                                  'Active Icon Size'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.icon_size_active',
                                  lang,
                                  'Icon size when active'
                                )}
                              </div>
                              ${this._renderSizeControlWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'icon_size',
                                'active_icon_size',
                                'inactive_icon_size',
                                icon.active_icon_size || 26,
                                0,
                                50,
                                26
                              )}
                            </div>
                          </div>
                        </details>
                      </div>
                    `
                  : ''}
              </div>

              <!-- Name Section -->
              <div class="settings-section" style="margin-bottom: 24px;">
                <div class="section-title">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span>${localize('editor.icon.name_section.title', lang, 'Name')}</span>
                    <ha-switch
                      .checked=${icon.show_name_when_active !== false &&
                      icon.show_name_when_inactive !== false}
                      @change=${(e: Event) => {
                        const target = e.target as any;
                        const enabled = target.checked;
                        this._updateIcon(
                          iconModule,
                          index,
                          {
                            show_name_when_active: enabled,
                            show_name_when_inactive: enabled,
                          },
                          updateModule
                        );
                      }}
                    ></ha-switch>
                  </div>
                </div>

                ${icon.show_name_when_active !== false || icon.show_name_when_inactive !== false
                  ? html`
                      <!-- Inactive Name Section -->
                      <div style="margin-top: 16px;">
                        <details
                          style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                          @toggle=${(e: Event) => {
                            const details = e.target as HTMLDetailsElement;
                            const icon = details.querySelector('ha-icon') as HTMLElement;
                            if (icon) {
                              icon.style.transform = details.open
                                ? 'rotate(90deg)'
                                : 'rotate(0deg)';
                            }
                          }}
                        >
                          <summary
                            style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                          >
                            <ha-icon
                              icon="mdi:chevron-right"
                              style="transition: transform 0.2s;"
                            ></ha-icon>
                            ${localize('editor.icon.inactive_name', lang, 'Inactive Name')}
                          </summary>
                          <div style="padding: 16px;">
                            ${this.renderSettingsSection(
                              localize(
                                'editor.icon.inactive_name_config',
                                lang,
                                'Inactive Name Configuration'
                              ),
                              localize(
                                'editor.icon.inactive_name_config_desc',
                                lang,
                                'Configure the inactive name settings'
                              ),
                              [
                                {
                                  title: localize(
                                    'editor.icon.custom_inactive_name',
                                    lang,
                                    'Custom Inactive Name'
                                  ),
                                  description: localize(
                                    'editor.icon.custom_inactive_name_desc',
                                    lang,
                                    'Override entity name when inactive (leave empty to use entity name)'
                                  ),
                                  hass,
                                  data: {
                                    custom_inactive_name_text: icon.custom_inactive_name_text || '',
                                  },
                                  schema: [this.textField('custom_inactive_name_text')],
                                  onChange: (e: CustomEvent) =>
                                    this._updateIcon(
                                      iconModule,
                                      index,
                                      {
                                        custom_inactive_name_text:
                                          e.detail.value.custom_inactive_name_text,
                                      },
                                      updateModule
                                    ),
                                },
                              ]
                            )}

                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.inactive_name_color',
                                  lang,
                                  'Inactive Name Color'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.name_color_inactive',
                                  lang,
                                  'Name color when inactive'
                                )}
                              </div>
                              <ultra-color-picker
                                .value=${icon.inactive_name_color || 'var(--primary-text-color)'}
                                @value-changed=${(e: CustomEvent) =>
                                  this._updateIconWithLockSync(
                                    iconModule,
                                    index,
                                    'inactive_name_color',
                                    e.detail.value,
                                    updateModule
                                  )}
                              ></ultra-color-picker>
                            </div>

                            <div class="field-container">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.inactive_name_size',
                                  lang,
                                  'Inactive Name Size'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.name_size_inactive',
                                  lang,
                                  'Name text size when inactive'
                                )}
                              </div>
                              ${this._renderSizeControl(
                                iconModule,
                                index,
                                updateModule,
                                'inactive_text_size',
                                icon.inactive_text_size || 14,
                                0,
                                50,
                                14
                              )}
                            </div>
                          </div>
                        </details>
                      </div>

                      <!-- Active Name Section -->
                      <div style="margin-top: 16px;">
                        <details
                          style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                          @toggle=${(e: Event) => {
                            const details = e.target as HTMLDetailsElement;
                            const icon = details.querySelector('ha-icon') as HTMLElement;
                            if (icon) {
                              icon.style.transform = details.open
                                ? 'rotate(90deg)'
                                : 'rotate(0deg)';
                            }
                          }}
                        >
                          <summary
                            style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                          >
                            <ha-icon
                              icon="mdi:chevron-right"
                              style="transition: transform 0.2s;"
                            ></ha-icon>
                            ${localize('editor.icon.active_name', lang, 'Active Name')}
                          </summary>
                          <div style="padding: 16px;">
                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.custom_active_name',
                                  lang,
                                  'Custom Active Name'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.custom_active_name_desc',
                                  lang,
                                  'Override entity name when active (leave empty to use entity name)'
                                )}
                              </div>
                              ${this._renderFieldWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'active_name_locked',
                                'custom_active_name_text',
                                'custom_inactive_name_text',
                                icon.custom_active_name_text || '',
                                'text',
                                hass
                              )}
                            </div>

                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.active_name_color',
                                  lang,
                                  'Active Name Color'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.name_color_active',
                                  lang,
                                  'Name color when active'
                                )}
                              </div>
                              ${this._renderFieldWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'active_name_color_locked',
                                'active_name_color',
                                'inactive_name_color',
                                icon.active_name_color || 'var(--primary-text-color)',
                                'color',
                                hass
                              )}
                            </div>

                            <div class="field-container">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.active_name_size',
                                  lang,
                                  'Active Name Size'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.name_size_active',
                                  lang,
                                  'Name text size when active'
                                )}
                              </div>
                              ${this._renderSizeControlWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'text_size',
                                'active_text_size',
                                'inactive_text_size',
                                icon.active_text_size || icon.inactive_text_size || 14,
                                0,
                                50,
                                12
                              )}
                            </div>
                          </div>
                        </details>
                      </div>
                    `
                  : ''}
              </div>

              <!-- State Section -->
              <div class="settings-section" style="margin-bottom: 24px;">
                <div class="section-title">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span>${localize('editor.icon.state_section.title', lang, 'State')}</span>
                    <ha-switch
                      .checked=${icon.show_state_when_active !== false &&
                      icon.show_state_when_inactive !== false}
                      @change=${(e: Event) => {
                        const target = e.target as any;
                        const enabled = target.checked;
                        this._updateIcon(
                          iconModule,
                          index,
                          {
                            show_state_when_active: enabled,
                            show_state_when_inactive: enabled,
                          },
                          updateModule
                        );
                      }}
                    ></ha-switch>
                  </div>
                </div>

                ${icon.show_state_when_active !== false || icon.show_state_when_inactive !== false
                  ? html`
                      <!-- Inactive State Section -->
                      <div style="margin-top: 16px;">
                        <details
                          style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                          @toggle=${(e: Event) => {
                            const details = e.target as HTMLDetailsElement;
                            const icon = details.querySelector('ha-icon') as HTMLElement;
                            if (icon) {
                              icon.style.transform = details.open
                                ? 'rotate(90deg)'
                                : 'rotate(0deg)';
                            }
                          }}
                        >
                          <summary
                            style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                          >
                            <ha-icon
                              icon="mdi:chevron-right"
                              style="transition: transform 0.2s;"
                            ></ha-icon>
                            ${localize('editor.icon.inactive_state', lang, 'Inactive State')}
                          </summary>
                          <div style="padding: 16px;">
                            ${this.renderSettingsSection(
                              localize(
                                'editor.icon.inactive_state_config',
                                lang,
                                'Inactive State Configuration'
                              ),
                              localize(
                                'editor.icon.inactive_state_config_desc',
                                lang,
                                'Configure the inactive state settings'
                              ),
                              [
                                {
                                  title: localize(
                                    'editor.icon.custom_inactive_state',
                                    lang,
                                    'Custom Inactive State'
                                  ),
                                  description: localize(
                                    'editor.icon.custom_inactive_state_desc',
                                    lang,
                                    'Custom text when inactive (leave empty to use actual state)'
                                  ),
                                  hass,
                                  data: {
                                    custom_inactive_state_text:
                                      icon.custom_inactive_state_text || '',
                                  },
                                  schema: [this.textField('custom_inactive_state_text')],
                                  onChange: (e: CustomEvent) =>
                                    this._updateIcon(
                                      iconModule,
                                      index,
                                      {
                                        custom_inactive_state_text:
                                          e.detail.value.custom_inactive_state_text,
                                      },
                                      updateModule
                                    ),
                                },
                              ]
                            )}

                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.inactive_state_color',
                                  lang,
                                  'Inactive State Color'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.state_color_inactive',
                                  lang,
                                  'State color when inactive'
                                )}
                              </div>
                              <ultra-color-picker
                                .value=${icon.inactive_state_color || 'var(--secondary-text-color)'}
                                @value-changed=${(e: CustomEvent) =>
                                  this._updateIconWithLockSync(
                                    iconModule,
                                    index,
                                    'inactive_state_color',
                                    e.detail.value,
                                    updateModule
                                  )}
                              ></ultra-color-picker>
                            </div>

                            <div class="field-container">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.inactive_state_size',
                                  lang,
                                  'Inactive State Size'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.state_size_inactive',
                                  lang,
                                  'State text size when inactive'
                                )}
                              </div>
                              ${this._renderSizeControl(
                                iconModule,
                                index,
                                updateModule,
                                'inactive_state_size',
                                icon.inactive_state_size || 10,
                                0,
                                50,
                                10
                              )}
                            </div>
                          </div>
                        </details>
                      </div>

                      <!-- Active State Section -->
                      <div style="margin-top: 16px;">
                        <details
                          style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                          @toggle=${(e: Event) => {
                            const details = e.target as HTMLDetailsElement;
                            const icon = details.querySelector('ha-icon') as HTMLElement;
                            if (icon) {
                              icon.style.transform = details.open
                                ? 'rotate(90deg)'
                                : 'rotate(0deg)';
                            }
                          }}
                        >
                          <summary
                            style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                          >
                            <ha-icon
                              icon="mdi:chevron-right"
                              style="transition: transform 0.2s;"
                            ></ha-icon>
                            ${localize('editor.icon.active_state', lang, 'Active State')}
                          </summary>
                          <div style="padding: 16px;">
                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.custom_active_state',
                                  lang,
                                  'Custom Active State'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.custom_active_state_desc',
                                  lang,
                                  'Custom text when active (leave empty to use actual state)'
                                )}
                              </div>
                              ${this._renderFieldWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'active_state_locked',
                                'custom_active_state_text',
                                'custom_inactive_state_text',
                                icon.custom_active_state_text || '',
                                'text',
                                hass
                              )}
                            </div>

                            <div class="field-container" style="margin-bottom: 16px;">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.active_state_color',
                                  lang,
                                  'Active State Color'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.state_color_active',
                                  lang,
                                  'State color when active'
                                )}
                              </div>
                              ${this._renderFieldWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'active_state_color_locked',
                                'active_state_color',
                                'inactive_state_color',
                                icon.active_state_color || 'var(--secondary-text-color)',
                                'color',
                                hass
                              )}
                            </div>

                            <div class="field-container">
                              <div class="field-title">
                                ${localize(
                                  'editor.icon.active_state_size',
                                  lang,
                                  'Active State Size'
                                )}
                              </div>
                              <div class="field-description">
                                ${localize(
                                  'editor.icon.state_size_active',
                                  lang,
                                  'State text size when active'
                                )}
                              </div>
                              ${this._renderSizeControlWithLock(
                                iconModule,
                                index,
                                updateModule,
                                'state_size',
                                'active_state_size',
                                'inactive_state_size',
                                icon.active_state_size || 10,
                                0,
                                50,
                                10
                              )}
                            </div>
                          </div>
                        </details>
                      </div>
                    `
                  : ''}
              </div>

              <!-- Advanced Template Mode Section -->
              <div class="template-section" style="margin-bottom: 24px;">
                <div class="template-header">
                  <div class="switch-container">
                    <label class="switch-label"
                      >${localize(
                        'editor.icon.template_section.title',
                        lang,
                        'Advanced Template Mode'
                      )}</label
                    >
                    <label class="switch">
                      <input
                        type="checkbox"
                        .checked=${icon.template_mode || false}
                        @change=${(e: Event) => {
                          const checked = (e.target as HTMLInputElement).checked;
                          this._updateIcon(
                            iconModule,
                            index,
                            { template_mode: checked },
                            updateModule
                          );
                        }}
                      />
                      <span class="slider round"></span>
                    </label>
                  </div>
                  <div class="template-description">
                    ${localize(
                      'editor.icon.template_section.desc',
                      lang,
                      'Use Jinja2 templates for advanced icon control. Templates can control visibility (true/false to show/hide icons) and customize state text. Return custom text for Active State, return actual entity state for Inactive State.'
                    )}
                  </div>
                </div>

                ${icon.template_mode
                  ? html`
                      <div class="template-content">
                        <textarea
                          .value=${icon.template || ''}
                          @input=${(e: Event) => {
                            const target = e.target as HTMLTextAreaElement;
                            this._updateIcon(
                              iconModule,
                              index,
                              { template: target.value },
                              updateModule
                            );
                          }}
                          placeholder="{% if states('binary_sensor.example') == 'on' %}true{% else %}false{% endif %}"
                          class="template-editor"
                          rows="6"
                        ></textarea>
                        <div class="template-help">
                          <p><strong>For visibility control, return a boolean:</strong></p>
                          <ul>
                            <li>
                              <code>true</code>, <code>on</code>, <code>yes</code>, <code>1</code> →
                              Show icon (Active State)
                            </li>
                            <li>
                              <code>false</code>, <code>off</code>, <code>no</code>,
                              <code>0</code> → Hide icon (Inactive State)
                            </li>
                          </ul>
                          <p><strong>For custom state text, return a string:</strong></p>
                          <ul>
                            <li>
                              <code
                                >{% if states('weather.forecast_home') == 'cloudy' %}About to Rain{%
                                else %}{{ states('weather.forecast_home') }}{% endif %}</code
                              >
                              → When cloudy: shows "About to Rain" (Active), when not cloudy: shows
                              actual state (Inactive)
                            </li>
                            <li>
                              <code>{{ states('sensor.temperature') | round(1) }}°F</code> → Shows
                              formatted temperature and Active State is current
                            </li>
                          </ul>
                          <p>
                            <strong>Note:</strong> Use the same entity name throughout your template
                            to avoid "unknown" states
                          </p>
                        </div>
                      </div>
                    `
                  : ''}
              </div>

              <!-- Dynamic Icon Color Template Section -->
              <div class="template-section" style="margin-bottom: 24px;">
                <div class="template-header">
                  <div class="switch-container">
                    <label class="switch-label"
                      >${localize(
                        'editor.icon.dynamic_color_template_section.title',
                        lang,
                        'Dynamic Icon Color Template'
                      )}</label
                    >
                    <label class="switch">
                      <input
                        type="checkbox"
                        .checked=${icon.dynamic_color_template_mode || false}
                        @change=${(e: Event) => {
                          const checked = (e.target as HTMLInputElement).checked;
                          this._updateIcon(
                            iconModule,
                            index,
                            { dynamic_color_template_mode: checked },
                            updateModule
                          );
                        }}
                      />
                      <span class="slider round"></span>
                    </label>
                  </div>
                  <div class="template-description">
                    ${localize(
                      'editor.icon.dynamic_color_template_section.desc',
                      lang,
                      'Use Jinja2 templates to dynamically change icon color based on conditions. Return a valid CSS color value (e.g., #FF0000, rgb(255,0,0), red) or empty for default color.'
                    )}
                  </div>
                </div>

                ${icon.dynamic_color_template_mode
                  ? html`
                      <div class="template-content">
                        <textarea
                          .value=${icon.dynamic_color_template || ''}
                          @input=${(e: Event) => {
                            const target = e.target as HTMLTextAreaElement;
                            this._updateIcon(
                              iconModule,
                              index,
                              { dynamic_color_template: target.value },
                              updateModule
                            );
                          }}
                          placeholder="{% if states('binary_sensor.example') == 'on' %}#FF0000{% else %}#00FF00{% endif %}"
                          class="template-editor"
                          rows="4"
                        ></textarea>
                        <div class="template-help">
                          <p><strong>Return a CSS color value:</strong></p>
                          <ul>
                            <li><code>#FF0000</code> → Red color in hex</li>
                            <li><code>rgb(255, 0, 0)</code> → Red color in RGB</li>
                            <li><code>red</code> → Red color by name</li>
                            <li>
                              <code
                                >{{ states.light.living_room.attributes.rgb_color | join(',') |
                                format('rgb(%s)') }}</code
                              >
                              → Use entity RGB color
                            </li>
                          </ul>
                          <p>
                            <strong>Example:</strong>
                            <code
                              >{% if states('sensor.temperature') | int > 25 %}#FF4444{% else
                              %}#4444FF{% endif %}</code
                            >
                          </p>
                        </div>
                      </div>
                    `
                  : ''}
              </div>

              <!-- Icon Animation Section -->
              ${this.renderSettingsSection(
                localize('editor.icon.animation_section.title', lang, 'Icon Animation'),
                localize(
                  'editor.icon.animation_section.desc',
                  lang,
                  'Configure animations for active and inactive states'
                ),
                [
                  {
                    title: localize('editor.icon.active_animation', lang, 'Active Animation'),
                    description: localize(
                      'editor.icon.active_animation_desc',
                      lang,
                      'Animation when icon is active'
                    ),
                    hass,
                    data: { active_icon_animation: icon.active_icon_animation || 'none' },
                    schema: [
                      this.selectField('active_icon_animation', [
                        {
                          value: 'none',
                          label: localize('editor.icon.animation_none', lang, 'None'),
                        },
                        {
                          value: 'pulse',
                          label: localize('editor.icon.animation_pulse', lang, 'Pulse'),
                        },
                        {
                          value: 'spin',
                          label: localize('editor.icon.animation_spin', lang, 'Spin'),
                        },
                        {
                          value: 'bounce',
                          label: localize('editor.icon.animation_bounce', lang, 'Bounce'),
                        },
                        {
                          value: 'flash',
                          label: localize('editor.icon.animation_flash', lang, 'Flash'),
                        },
                        {
                          value: 'shake',
                          label: localize('editor.icon.animation_shake', lang, 'Shake'),
                        },
                        {
                          value: 'vibrate',
                          label: localize('editor.icon.animation_vibrate', lang, 'Vibrate'),
                        },
                        {
                          value: 'rotate-left',
                          label: localize('editor.icon.animation_rotate_left', lang, 'Rotate Left'),
                        },
                        {
                          value: 'rotate-right',
                          label: localize(
                            'editor.icon.animation_rotate_right',
                            lang,
                            'Rotate Right'
                          ),
                        },
                        {
                          value: 'fade',
                          label: localize('editor.icon.animation_fade', lang, 'Fade'),
                        },
                        {
                          value: 'scale',
                          label: localize('editor.icon.animation_scale', lang, 'Scale'),
                        },
                        {
                          value: 'tada',
                          label: localize('editor.icon.animation_tada', lang, 'Tada'),
                        },
                      ]),
                    ],
                    onChange: (e: CustomEvent) =>
                      this._updateIcon(
                        iconModule,
                        index,
                        { active_icon_animation: e.detail.value.active_icon_animation },
                        updateModule
                      ),
                  },
                  {
                    title: localize('editor.icon.inactive_animation', lang, 'Inactive Animation'),
                    description: localize(
                      'editor.icon.inactive_animation_desc',
                      lang,
                      'Animation when icon is inactive'
                    ),
                    hass,
                    data: { inactive_icon_animation: icon.inactive_icon_animation || 'none' },
                    schema: [
                      this.selectField('inactive_icon_animation', [
                        {
                          value: 'none',
                          label: localize('editor.icon.animation_none', lang, 'None'),
                        },
                        {
                          value: 'pulse',
                          label: localize('editor.icon.animation_pulse', lang, 'Pulse'),
                        },
                        {
                          value: 'spin',
                          label: localize('editor.icon.animation_spin', lang, 'Spin'),
                        },
                        {
                          value: 'bounce',
                          label: localize('editor.icon.animation_bounce', lang, 'Bounce'),
                        },
                        {
                          value: 'flash',
                          label: localize('editor.icon.animation_flash', lang, 'Flash'),
                        },
                        {
                          value: 'shake',
                          label: localize('editor.icon.animation_shake', lang, 'Shake'),
                        },
                        {
                          value: 'vibrate',
                          label: localize('editor.icon.animation_vibrate', lang, 'Vibrate'),
                        },
                        {
                          value: 'rotate-left',
                          label: localize('editor.icon.animation_rotate_left', lang, 'Rotate Left'),
                        },
                        {
                          value: 'rotate-right',
                          label: localize(
                            'editor.icon.animation_rotate_right',
                            lang,
                            'Rotate Right'
                          ),
                        },
                        {
                          value: 'fade',
                          label: localize('editor.icon.animation_fade', lang, 'Fade'),
                        },
                        {
                          value: 'scale',
                          label: localize('editor.icon.animation_scale', lang, 'Scale'),
                        },
                        {
                          value: 'tada',
                          label: localize('editor.icon.animation_tada', lang, 'Tada'),
                        },
                      ]),
                    ],
                    onChange: (e: CustomEvent) =>
                      this._updateIcon(
                        iconModule,
                        index,
                        { inactive_icon_animation: e.detail.value.inactive_icon_animation },
                        updateModule
                      ),
                  },
                ]
              )}
            </div>
          `
        )}
      </div>
    `;
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as any, hass, updates => updateModule(updates));
  }

  // Explicit Logic tab renderer (some editors call this directly)
  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  // Note: Icon-specific display and spacing settings were moved to General tab for consistency
  // This method is kept for backward compatibility but only renders logic
  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return this.renderLogicTab(module, hass, config, updateModule);
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const iconModule = module as IconModule;

    // Initialize template service if needed
    if (!this._templateService && hass) {
      this._templateService = new TemplateService(hass);
    }

    // Update hass reference if it changed
    if (this._templateService && hass) {
      this._templateService.updateHass(hass);
    }

    // Apply design properties with priority
    const moduleWithDesign = iconModule as any;
    const designProperties = (iconModule as any).design || {};

    // Container styles for design system - no hardcoded spacing, user controls all
    const containerStyles = {
      // Only apply padding if explicitly set by user
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right ||
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${this.addPixelUnit(designProperties.padding_top || moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right || moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom || moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left || moduleWithDesign.padding_left) || '0px'}`
          : '0',
      // Standard 8px top/bottom margin for proper web design spacing
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right ||
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${this.addPixelUnit(designProperties.margin_top || moduleWithDesign.margin_top) || '8px'} ${this.addPixelUnit(designProperties.margin_right || moduleWithDesign.margin_right) || '0px'} ${this.addPixelUnit(designProperties.margin_bottom || moduleWithDesign.margin_bottom) || '8px'} ${this.addPixelUnit(designProperties.margin_left || moduleWithDesign.margin_left) || '0px'}`
          : '8px 0',
      background:
        designProperties.background_color || moduleWithDesign.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(
        { ...moduleWithDesign, ...designProperties },
        hass
      ),
      backgroundSize:
        designProperties.background_size || moduleWithDesign.background_size || 'cover',
      backgroundPosition:
        designProperties.background_position || moduleWithDesign.background_position || 'center',
      backgroundRepeat:
        designProperties.background_repeat || moduleWithDesign.background_repeat || 'no-repeat',
      border:
        (designProperties.border_style || moduleWithDesign.border_style) &&
        (designProperties.border_style || moduleWithDesign.border_style) !== 'none'
          ? `${this.addPixelUnit(designProperties.border_width || moduleWithDesign.border_width) || '1px'} ${designProperties.border_style || moduleWithDesign.border_style} ${designProperties.border_color || moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) || '0',
      position: designProperties.position || moduleWithDesign.position || 'relative',
      top: designProperties.top || moduleWithDesign.top || 'auto',
      bottom: designProperties.bottom || moduleWithDesign.bottom || 'auto',
      left: designProperties.left || moduleWithDesign.left || 'auto',
      right: designProperties.right || moduleWithDesign.right || 'auto',
      zIndex: designProperties.z_index || moduleWithDesign.z_index || 'auto',
      width: designProperties.width || moduleWithDesign.width || '100%',
      height: designProperties.height || moduleWithDesign.height || 'auto',
      maxWidth: designProperties.max_width || moduleWithDesign.max_width || '100%',
      maxHeight: designProperties.max_height || moduleWithDesign.max_height || 'none',
      minWidth: designProperties.min_width || moduleWithDesign.min_width || 'none',
      minHeight: designProperties.min_height || moduleWithDesign.min_height || 'auto',
      overflow: designProperties.overflow || moduleWithDesign.overflow || 'hidden',
      clipPath: designProperties.clip_path || moduleWithDesign.clip_path || 'none',
      backdropFilter:
        designProperties.backdrop_filter || moduleWithDesign.backdrop_filter || 'none',
      boxShadow:
        designProperties.box_shadow_h && designProperties.box_shadow_v
          ? `${designProperties.box_shadow_h || '0'} ${designProperties.box_shadow_v || '0'} ${designProperties.box_shadow_blur || '0'} ${designProperties.box_shadow_spread || '0'} ${designProperties.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
            ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
            : 'none',
      boxSizing: 'border-box',
    };

    // Ensure animations/styles exist globally
    this._injectGlobalStyles();

    // Inject into local shadow DOM once
    const localStyle = !this._localStylesInjected
      ? html`<style>
          ${this.getStyles()}
        </style>`
      : html``;
    this._localStylesInjected = true;

    return html`
      ${localStyle}
      <div class="icon-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div class="icon-module-preview">
          <div
            class="icon-grid"
            style="
            display: grid;
            grid-template-columns: repeat(${Math.min(
              iconModule.columns || 3,
              iconModule.icons.length
            )}, 1fr);
            gap: ${iconModule.gap || 16}px;
            justify-content: ${iconModule.alignment || 'center'};
          "
          >
            ${iconModule.icons.slice(0, 6).map(icon => {
              const entityState = hass?.states[icon.entity];
              const currentState = entityState?.state || 'unknown';

              const isActive = this._evaluateIconState(icon, hass);

              // Determine what to show based on state
              const shouldShowIcon = isActive
                ? icon.show_icon_when_active !== false
                : icon.show_icon_when_inactive !== false;
              const shouldShowName = isActive
                ? icon.show_name_when_active !== false
                : icon.show_name_when_inactive !== false;
              const shouldShowState = isActive
                ? icon.show_state_when_active !== false
                : icon.show_state_when_inactive !== false;

              // Get display values based on state - check dynamic templates first
              let displayIcon = isActive
                ? icon.icon_active || icon.icon_inactive
                : icon.icon_inactive;

              // Apply dynamic icon template if enabled
              if (icon.dynamic_icon_template_mode && icon.dynamic_icon_template) {
                // Initialize template service if needed
                if (!this._templateService && hass) {
                  this._templateService = new TemplateService(hass);
                }

                const templateHash = this._hashString(icon.dynamic_icon_template);
                const templateKey = `dynamic_icon_${icon.entity}_${icon.id}_${templateHash}`;

                // Initialize template strings object if not already done
                if (!hass.__uvc_template_strings) {
                  hass.__uvc_template_strings = {};
                }

                // Subscribe to template if not already subscribed
                if (
                  this._templateService &&
                  !this._templateService.hasTemplateSubscription(templateKey)
                ) {
                  this._templateService.subscribeToTemplate(
                    icon.dynamic_icon_template,
                    templateKey,
                    () => {
                      // Force re-render when template updates
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                      }
                    }
                  );
                }

                // Get template result for dynamic icon
                const iconTemplateResult = hass?.__uvc_template_strings?.[templateKey];
                if (iconTemplateResult && String(iconTemplateResult).trim() !== '') {
                  displayIcon = String(iconTemplateResult);
                }
              } else {
                // Use entity's current icon if no custom icon is set (for dynamic weather icons, etc.)
                if (entityState?.attributes?.icon && !displayIcon) {
                  displayIcon = entityState.attributes.icon;
                }
              }

              let displayColor = isActive
                ? icon.use_state_color_for_active_icon
                  ? this._getEntityStateColor(entityState) || icon.active_icon_color
                  : icon.use_entity_color_for_icon
                    ? entityState?.attributes?.rgb_color
                      ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                      : icon.active_icon_color
                    : icon.active_icon_color
                : icon.use_state_color_for_inactive_icon
                  ? this._getEntityStateColor(entityState) || icon.inactive_icon_color
                  : icon.use_entity_color_for_icon
                    ? entityState?.attributes?.rgb_color
                      ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                      : icon.inactive_icon_color
                    : icon.inactive_icon_color;

              // Apply dynamic color template if enabled
              if (icon.dynamic_color_template_mode && icon.dynamic_color_template) {
                // Initialize template service if needed
                if (!this._templateService && hass) {
                  this._templateService = new TemplateService(hass);
                }

                const templateHash = this._hashString(icon.dynamic_color_template);
                const templateKey = `dynamic_color_${icon.entity}_${icon.id}_${templateHash}`;

                // Initialize template strings object if not already done
                if (!hass.__uvc_template_strings) {
                  hass.__uvc_template_strings = {};
                }

                // Subscribe to template if not already subscribed
                if (
                  this._templateService &&
                  !this._templateService.hasTemplateSubscription(templateKey)
                ) {
                  this._templateService.subscribeToTemplate(
                    icon.dynamic_color_template,
                    templateKey,
                    () => {
                      // Force re-render when template updates
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                      }
                    }
                  );
                }

                // Get template result for dynamic color
                const colorTemplateResult = hass?.__uvc_template_strings?.[templateKey];
                if (colorTemplateResult && String(colorTemplateResult).trim() !== '') {
                  displayColor = String(colorTemplateResult);
                }
              }

              const nameColor =
                designProperties.color ||
                (isActive ? icon.active_name_color : icon.inactive_name_color);
              const stateColor =
                designProperties.color ||
                (isActive ? icon.active_state_color : icon.inactive_state_color);

              const displayName = isActive
                ? icon.custom_active_name_text ||
                  icon.name ||
                  entityState?.attributes?.friendly_name ||
                  icon.entity
                : icon.custom_inactive_name_text ||
                  icon.name ||
                  entityState?.attributes?.friendly_name ||
                  icon.entity;

              let displayState: string;

              // Check template_mode first for state text
              if (icon.template_mode && icon.template) {
                // Initialize template service if needed
                if (!this._templateService && hass) {
                  this._templateService = new TemplateService(hass);
                }

                const templateHash = this._hashString(icon.template);
                const templateKey = `display_${icon.entity}_${icon.id}_${templateHash}`;

                // Initialize template strings object if not already done
                if (!hass.__uvc_template_strings) {
                  hass.__uvc_template_strings = {};
                }

                // Subscribe to template if not already subscribed
                if (
                  this._templateService &&
                  !this._templateService.hasTemplateSubscription(templateKey)
                ) {
                  this._templateService.subscribeToTemplate(icon.template, templateKey, () => {
                    // Force re-render when template updates
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                    }
                  });
                }

                // Get template result for state text
                const templateResult = hass?.__uvc_template_strings?.[templateKey];
                if (templateResult !== undefined) {
                  const result = String(templateResult).toLowerCase();
                  const isBooleanResult = [
                    'true',
                    'false',
                    'on',
                    'off',
                    'yes',
                    'no',
                    '0',
                    '1',
                  ].includes(result);

                  if (!isBooleanResult && String(templateResult).trim() !== '') {
                    // Template returned custom text (not boolean) - use it as state text
                    if (String(templateResult) !== currentState) {
                      // It's truly custom text, not just the entity state
                      displayState = String(templateResult);
                    } else {
                      // Template returned actual entity state - use normal logic below
                      displayState = isActive
                        ? icon.custom_active_state_text &&
                          icon.custom_active_state_text.trim() !== ''
                          ? icon.custom_active_state_text
                          : this._formatValueWithUnits(currentState, icon.entity, icon, hass)
                        : icon.custom_inactive_state_text &&
                            icon.custom_inactive_state_text.trim() !== ''
                          ? icon.custom_inactive_state_text
                          : this._formatValueWithUnits(currentState, icon.entity, icon, hass);
                    }
                  } else {
                    // Template returned boolean or empty - use normal custom text logic
                    displayState = isActive
                      ? icon.custom_active_state_text && icon.custom_active_state_text.trim() !== ''
                        ? icon.custom_active_state_text
                        : this._formatValueWithUnits(currentState, icon.entity, icon, hass)
                      : icon.custom_inactive_state_text &&
                          icon.custom_inactive_state_text.trim() !== ''
                        ? icon.custom_inactive_state_text
                        : this._formatValueWithUnits(currentState, icon.entity, icon, hass);
                  }
                } else {
                  // No template result yet - use normal logic
                  displayState = isActive
                    ? icon.custom_active_state_text && icon.custom_active_state_text.trim() !== ''
                      ? icon.custom_active_state_text
                      : this._formatValueWithUnits(currentState, icon.entity, icon, hass)
                    : icon.custom_inactive_state_text &&
                        icon.custom_inactive_state_text.trim() !== ''
                      ? icon.custom_inactive_state_text
                      : this._formatValueWithUnits(currentState, icon.entity, icon, hass);
                }
              } else {
                // No template_mode - show custom text if provided, otherwise show actual entity state
                displayState = isActive
                  ? icon.custom_active_state_text && icon.custom_active_state_text.trim() !== ''
                    ? icon.custom_active_state_text
                    : this._formatValueWithUnits(currentState, icon.entity, icon, hass)
                  : icon.custom_inactive_state_text && icon.custom_inactive_state_text.trim() !== ''
                    ? icon.custom_inactive_state_text
                    : this._formatValueWithUnits(currentState, icon.entity, icon, hass);
              }

              // Icon background styles - use active/inactive specific properties
              const iconBackground = isActive
                ? icon.active_icon_background || icon.icon_background
                : icon.inactive_icon_background || icon.icon_background;

              const iconBackgroundColor = isActive
                ? icon.active_icon_background_color || icon.icon_background_color
                : icon.inactive_icon_background_color || icon.icon_background_color;

              const iconBackgroundStyle =
                iconBackground !== 'none'
                  ? {
                      backgroundColor: icon.use_entity_color_for_icon_background
                        ? entityState?.attributes?.rgb_color
                          ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                          : iconBackgroundColor
                        : iconBackgroundColor,
                      borderRadius:
                        iconBackground === 'circle'
                          ? '50%'
                          : iconBackground === 'rounded-square'
                            ? '8px'
                            : '0',
                      padding: '8px',
                    }
                  : {};

              // Always ensure wrapper centers content for animations
              const baseWrapperStyle = {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              };

              const mergedWrapperStyle = { ...baseWrapperStyle, ...iconBackgroundStyle };

              // Animation classes
              const activeAnimation = icon.active_icon_animation || 'none';
              const inactiveAnimation = icon.inactive_icon_animation || 'none';

              const currentAnimation = isActive ? activeAnimation : inactiveAnimation;
              const animationClass =
                currentAnimation !== 'none' ? `icon-animation-${currentAnimation}` : '';

              // Force animation class updates when state changes
              if (animationClass) {
                setTimeout(() => {
                  this._updateIconAnimationClasses(icon.entity, animationClass, isActive);
                }, 100);
              }

              // Container styles
              const containerStyles = {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: icon.vertical_alignment || 'center',
                // No default padding so zero layouts are possible
                padding: '0',
                borderRadius:
                  icon.container_background_shape === 'circle'
                    ? '50%'
                    : icon.container_background_shape === 'rounded'
                      ? '8px'
                      : icon.container_background_shape === 'square'
                        ? '0'
                        : '0',
                background:
                  icon.container_background_shape && icon.container_background_shape !== 'none'
                    ? icon.container_background_color || '#808080'
                    : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: icon.container_width ? `${icon.container_width}%` : 'auto',
              };

              // Gesture detection variables (using closure to maintain state per icon)
              let clickTimeout: NodeJS.Timeout | null = null;
              let holdTimeout: NodeJS.Timeout | null = null;
              let isHolding = false;
              let clickCount = 0;
              let lastClickTime = 0;

              const handleGestures = {
                onPointerDown: (e: PointerEvent) => {
                  e.preventDefault();
                  isHolding = false;

                  // Start hold timer if hold action is configured
                  if (iconModule.hold_action) {
                    holdTimeout = setTimeout(() => {
                      isHolding = true;
                      const action =
                        iconModule.hold_action!.action === 'default'
                          ? {
                              ...iconModule.hold_action!,
                              action: 'toggle' as const,
                              entity: icon.entity,
                            }
                          : {
                              ...iconModule.hold_action!,
                              entity: iconModule.hold_action!.entity || icon.entity,
                            };
                      UltraLinkComponent.handleAction(action as any, hass, e.target as HTMLElement);
                    }, 500); // 500ms hold threshold
                  }
                },

                onPointerUp: (e: PointerEvent) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // Clear hold timer
                  if (holdTimeout) {
                    clearTimeout(holdTimeout);
                    holdTimeout = null;
                  }

                  // If this was a hold gesture, don't process as click
                  if (isHolding) {
                    isHolding = false;
                    return;
                  }

                  const now = Date.now();
                  const timeSinceLastClick = now - lastClickTime;

                  // Double click detection (within 300ms)
                  if (timeSinceLastClick < 300 && clickCount === 1) {
                    // This is a double click
                    if (clickTimeout) {
                      clearTimeout(clickTimeout);
                      clickTimeout = null;
                    }
                    clickCount = 0;

                    if (iconModule.double_tap_action) {
                      const action =
                        iconModule.double_tap_action.action === 'default'
                          ? {
                              ...iconModule.double_tap_action,
                              action: 'toggle' as const,
                              entity: icon.entity,
                            }
                          : {
                              ...iconModule.double_tap_action,
                              entity: iconModule.double_tap_action.entity || icon.entity,
                            };
                      UltraLinkComponent.handleAction(action as any, hass, e.target as HTMLElement);
                    }
                  } else {
                    // This might be a single click, but wait to see if double click follows
                    clickCount = 1;
                    lastClickTime = now;

                    // Clear any existing timeout
                    if (clickTimeout) {
                      clearTimeout(clickTimeout);
                    }

                    // Set timeout for single click (only if double-tap action is NOT configured)
                    if (!iconModule.double_tap_action && iconModule.tap_action) {
                      // No double-tap configured, execute immediately
                      const action =
                        iconModule.tap_action.action === 'default'
                          ? {
                              ...iconModule.tap_action,
                              action: 'toggle' as const,
                              entity: icon.entity,
                            }
                          : {
                              ...iconModule.tap_action,
                              entity: iconModule.tap_action.entity || icon.entity,
                            };
                      UltraLinkComponent.handleAction(action as any, hass, e.target as HTMLElement);
                    } else if (iconModule.tap_action) {
                      // Double-tap is configured, wait before executing single tap
                      clickTimeout = setTimeout(() => {
                        if (clickCount === 1) {
                          const action =
                            iconModule.tap_action!.action === 'default'
                              ? {
                                  ...iconModule.tap_action!,
                                  action: 'toggle' as const,
                                  entity: icon.entity,
                                }
                              : {
                                  ...iconModule.tap_action!,
                                  entity: iconModule.tap_action!.entity || icon.entity,
                                };
                          UltraLinkComponent.handleAction(
                            action as any,
                            hass,
                            e.target as HTMLElement
                          );
                        }
                        clickCount = 0;
                      }, 300); // Wait 300ms to distinguish from double click
                    }
                  }
                },

                onPointerLeave: () => {
                  // Cancel hold if pointer leaves the element
                  if (holdTimeout) {
                    clearTimeout(holdTimeout);
                    holdTimeout = null;
                  }
                  isHolding = false;
                },
              };

              // Get hover effect configuration from module design
              const hoverEffect = (iconModule as any).design?.hover_effect;
              const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

              return html`
                <div
                  class="icon-item-preview ${hoverEffectClass}"
                  style=${this.styleObjectToCss({
                    ...containerStyles,
                    gap: '0px', // Remove global gap, use specific spacing instead
                    touchAction: 'manipulation', // Improve touch responsiveness
                    backgroundImage: this.getBackgroundImageCSS(icon, hass),
                    backgroundSize: (icon as any).background_size || 'cover',
                    backgroundPosition: designProperties.background_position || 'center',
                    backgroundRepeat: designProperties.background_repeat || 'no-repeat',
                    margin: '0 auto',
                  })}
                  @pointerdown=${handleGestures.onPointerDown}
                  @pointerup=${handleGestures.onPointerUp}
                  @pointerleave=${handleGestures.onPointerLeave}
                >
                  ${shouldShowIcon
                    ? html`
                        <div
                          style="${this.styleObjectToCss({
                            ...mergedWrapperStyle,
                            marginBottom: shouldShowName
                              ? `${icon.name_icon_gap ?? 8}px`
                              : shouldShowState
                                ? `${icon.icon_state_gap ?? 4}px`
                                : '0px',
                          })}"
                        >
                          <ha-icon
                            icon="${displayIcon || 'mdi:help-circle'}"
                            class="${animationClass} ultra-force-animation"
                            style="
                      color: ${displayColor || 'var(--secondary-text-color)'};
                      --mdc-icon-size: ${Number(
                              isActive
                                ? icon.active_icon_size || icon.icon_size
                                : icon.inactive_icon_size || icon.icon_size
                            ) || 26}px;
                    "
                          ></ha-icon>
                        </div>
                      `
                    : ''}
                  ${shouldShowName
                    ? html`
                        <div
                          class="icon-name"
                          style="
                      font-size: ${isActive
                            ? icon.active_text_size || icon.text_size || 12
                            : icon.inactive_text_size || icon.text_size || 14}px;
                        color: ${nameColor || 'var(--primary-text-color)'};
                      text-align: center;
                      line-height: 1.2;
                        max-width: 120px;
                      word-wrap: break-word;
                      margin-bottom: ${shouldShowState ? `${icon.name_state_gap ?? 2}px` : '0px'};
                    "
                        >
                          ${displayName}
                        </div>
                      `
                    : ''}
                  ${shouldShowState
                    ? html`
                        <div
                          class="icon-state"
                          style="
                      font-size: ${isActive
                            ? icon.active_state_size || icon.state_size || 12
                            : icon.inactive_state_size || icon.state_size || 12}px;
                        color: ${stateColor || 'var(--secondary-text-color)'};
                      text-align: center;
                      line-height: 1.2;
                    "
                        >
                          ${displayState}
                        </div>
                      `
                    : ''}
                </div>
              `;
            })}
            ${iconModule.icons.length > 6
              ? html`
                  <div
                    class="more-icons"
                    style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
                color: var(--secondary-text-color);
                font-size: 12px;
                font-style: italic;
              "
                  >
                    +${iconModule.icons.length - 6} more
                  </div>
                `
              : ''}
          </div>

          <!-- More Icons Indicator -->
          ${iconModule.icons.length > 6
            ? html`
                <div
                  class="more-icons"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    color: var(--secondary-text-color);
                    font-size: 12px;
                    font-style: italic;
                    margin-top: 8px;
                  "
                >
                  +${iconModule.icons.length - 6} more icons
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  // Split preview method for child module settings popup only
  renderSplitPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const iconModule = module as IconModule;

    // Determine current state of the first icon to show which preview is "current"
    let isCurrentlyActive = false;
    if (iconModule.icons.length > 0) {
      const firstIcon = iconModule.icons[0];

      // If template mode is enabled, use template result to determine current state
      if (firstIcon.template_mode && firstIcon.template) {
        // Initialize template service if needed
        if (!this._templateService && hass) {
          this._templateService = new TemplateService(hass);
        }

        const templateHash = this._hashString(firstIcon.template);
        const templateKey = `display_${firstIcon.entity}_${firstIcon.id}_${templateHash}`;

        // Initialize template strings object if not already done
        if (!hass.__uvc_template_strings) {
          hass.__uvc_template_strings = {};
        }

        // Subscribe to template if not already subscribed
        if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
          this._templateService.subscribeToTemplate(firstIcon.template, templateKey, () => {
            // Force re-render when template updates
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
            }
          });
        }

        // Get template result and evaluate as boolean
        const templateResult = hass?.__uvc_template_strings?.[templateKey];
        if (templateResult !== undefined) {
          const result = String(templateResult).toLowerCase();
          const isBooleanResult = ['true', 'false', 'on', 'off', 'yes', 'no', '0', '1'].includes(
            result
          );

          if (isBooleanResult) {
            // Template returned boolean-like value, use it directly
            isCurrentlyActive =
              ['true', 'on', 'yes', '1'].includes(result) ||
              (parseFloat(result) > 0 && !isNaN(parseFloat(result)));
          } else if (String(templateResult).trim() !== '') {
            // Check if template result matches the actual entity state
            const entityState = hass?.states[firstIcon.entity];
            const actualState = entityState?.state || 'unknown';

            if (String(templateResult) === actualState) {
              // Template returned actual entity state - use normal entity evaluation
              isCurrentlyActive = this._evaluateIconState(firstIcon, hass);
            } else {
              // Template returned custom text (like "About to Rain") - this means active condition is met
              isCurrentlyActive = true;
            }
          } else {
            // Template returned empty/false - inactive condition
            isCurrentlyActive = false;
          }
        }
      } else {
        // Use normal entity state evaluation
        isCurrentlyActive = this._evaluateIconState(firstIcon, hass);
      }
    }

    // Ensure global styles are available
    this._injectGlobalStyles();
    // Ensure keyframes exist inside ha-icon shadow roots used in popup
    this._injectKeyframesForAllSplitPreviewIcons();

    return html`
      <style>
        ${UltraIconModule._ANIMATION_KEYFRAMES} .icon-split-preview {
          --animation-duration: 2s;
          --animation-timing: linear;
        }
        .icon-split-preview .icon-animation-spin {
          animation: iconSpin var(--animation-duration) var(--animation-timing) infinite;
        }
        .icon-split-preview .icon-animation-bounce {
          animation: iconBounce 1s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-pulse {
          animation: iconPulse 1.5s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-flash {
          animation: iconFlash 1s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-shake {
          animation: iconShake 0.5s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-vibrate {
          animation: iconVibrate 0.3s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-rotate-left {
          animation: iconRotateLeft var(--animation-duration) var(--animation-timing) infinite;
        }
        .icon-split-preview .icon-animation-rotate-right {
          animation: iconRotateRight var(--animation-duration) var(--animation-timing) infinite;
        }
        .icon-split-preview .icon-animation-fade {
          animation: iconFade 2s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-scale {
          animation: iconScale 1.5s ease-in-out infinite;
        }
        .icon-split-preview .icon-animation-tada {
          animation: iconTada 2s ease-in-out infinite;
        }
      </style>
      <div class="icon-split-preview">
        <!-- State Labels -->
        <div
          style="
               display: grid; 
               grid-template-columns: 1fr 1fr; 
               margin-bottom: 12px;
               text-align: center;
             "
        >
          <div>
            ${!isCurrentlyActive
              ? html`<div
                  style="font-size: 10px; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"
                >
                  Current
                </div>`
              : html`<div style="height: 14px; margin-bottom: 4px;"></div>`}
            <div style="font-size: 12px; font-weight: 600; color: var(--secondary-text-color);">
              Inactive State
            </div>
          </div>
          <div>
            ${isCurrentlyActive
              ? html`<div
                  style="font-size: 10px; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"
                >
                  Current
                </div>`
              : html`<div style="height: 14px; margin-bottom: 4px;"></div>`}
            <div style="font-size: 12px; font-weight: 600; color: var(--secondary-text-color);">
              Active State
            </div>
          </div>
        </div>

        <!-- Split Preview Container -->
        <div
          style="
               display: grid; 
               grid-template-columns: 1fr 1fr; 
               border: 1px solid var(--divider-color); 
               border-radius: 8px; 
               overflow: hidden;
               min-height: 120px;
             "
        >
          <!-- Inactive Preview -->
          <div
            style="
                 background: var(--card-background-color);
                 border-right: 1px solid var(--divider-color);
                 padding: 16px;
                 display: flex;
                 align-items: center;
                 justify-content: center;
               "
          >
            ${this._renderSimpleIconGrid(iconModule, hass, false)}
          </div>

          <!-- Active Preview -->
          <div
            style="
                 background: var(--card-background-color);
                 padding: 16px;
                 display: flex;
                 align-items: center;
                 justify-content: center;
               "
          >
            ${this._renderSimpleIconGrid(iconModule, hass, true)}
          </div>
        </div>

        <!-- Icon Count Indicator -->
        ${iconModule.icons.length > 6
          ? html`
              <div
                style="
                 text-align: center;
                 padding: 8px;
                 color: var(--secondary-text-color);
                 font-size: 12px;
                 font-style: italic;
               "
              >
                Showing first 6 of ${iconModule.icons.length} icons
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _renderSimpleIconGrid(
    iconModule: IconModule,
    hass: HomeAssistant,
    isActiveState: boolean
  ): TemplateResult {
    const iconsToShow = iconModule.icons.slice(0, 6);
    const gridCols = Math.min(3, iconsToShow.length);

    return html`
      <div
        style="
          display: flex;
        "
      >
        ${iconsToShow.map(icon => this._renderSingleIconPreview(icon, hass, isActiveState))}
      </div>
    `;
  }

  private _renderSingleIconPreview(
    icon: IconConfig,
    hass: HomeAssistant,
    isActiveState: boolean,
    iconModule?: IconModule
  ): TemplateResult {
    const entityState = hass?.states[icon.entity];
    const currentState = entityState?.state || 'unknown';

    // Use exact same logic as main card - determine what to show based on state
    const shouldShowIcon = isActiveState
      ? icon.show_icon_when_active !== false
      : icon.show_icon_when_inactive !== false;
    const shouldShowName = isActiveState
      ? icon.show_name_when_active !== false
      : icon.show_name_when_inactive !== false;
    const shouldShowState = isActiveState
      ? icon.show_state_when_active !== false
      : icon.show_state_when_inactive !== false;

    // Get display values based on state - check dynamic templates first
    let displayIcon = isActiveState ? icon.icon_active || icon.icon_inactive : icon.icon_inactive;

    // Apply dynamic icon template if enabled
    if (icon.dynamic_icon_template_mode && icon.dynamic_icon_template) {
      // Initialize template service if needed
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }

      const templateHash = this._hashString(icon.dynamic_icon_template);
      const templateKey = `dynamic_icon_${icon.entity}_${icon.id}_${templateHash}`;

      // Initialize template strings object if not already done
      if (!hass.__uvc_template_strings) {
        hass.__uvc_template_strings = {};
      }

      // Subscribe to template if not already subscribed
      if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
        this._templateService.subscribeToTemplate(icon.dynamic_icon_template, templateKey, () => {
          // Force re-render when template updates
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
          }
        });
      }

      // Get template result for dynamic icon
      const iconTemplateResult = hass?.__uvc_template_strings?.[templateKey];
      if (iconTemplateResult && String(iconTemplateResult).trim() !== '') {
        displayIcon = String(iconTemplateResult);
      }
    } else {
      // Use entity's current icon if no custom icon is set (for dynamic weather icons, etc.)
      if (entityState?.attributes?.icon && !displayIcon) {
        displayIcon = entityState.attributes.icon;
      }
    }

    let displayColor = isActiveState
      ? icon.use_state_color_for_active_icon
        ? this._getEntityStateColor(entityState) || icon.active_icon_color
        : icon.use_entity_color_for_icon
          ? entityState?.attributes?.rgb_color
            ? `rgb(${entityState.attributes.rgb_color.join(',')})`
            : icon.active_icon_color
          : icon.active_icon_color
      : icon.use_state_color_for_inactive_icon
        ? this._getEntityStateColor(entityState) || icon.inactive_icon_color
        : icon.use_entity_color_for_icon
          ? entityState?.attributes?.rgb_color
            ? `rgb(${entityState.attributes.rgb_color.join(',')})`
            : icon.inactive_icon_color
          : icon.inactive_icon_color;

    // Apply dynamic color template if enabled
    if (icon.dynamic_color_template_mode && icon.dynamic_color_template) {
      // Initialize template service if needed
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }

      const templateHash = this._hashString(icon.dynamic_color_template);
      const templateKey = `dynamic_color_${icon.entity}_${icon.id}_${templateHash}`;

      // Initialize template strings object if not already done
      if (!hass.__uvc_template_strings) {
        hass.__uvc_template_strings = {};
      }

      // Subscribe to template if not already subscribed
      if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
        this._templateService.subscribeToTemplate(icon.dynamic_color_template, templateKey, () => {
          // Force re-render when template updates
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
          }
        });
      }

      // Get template result for dynamic color
      const colorTemplateResult = hass?.__uvc_template_strings?.[templateKey];
      if (colorTemplateResult && String(colorTemplateResult).trim() !== '') {
        displayColor = String(colorTemplateResult);
      }
    }

    const nameColor = isActiveState ? icon.active_name_color : icon.inactive_name_color;
    const stateColor = isActiveState ? icon.active_state_color : icon.inactive_state_color;

    const displayName = isActiveState
      ? icon.custom_active_name_text ||
        icon.name ||
        entityState?.attributes?.friendly_name ||
        icon.entity
      : icon.custom_inactive_name_text ||
        icon.name ||
        entityState?.attributes?.friendly_name ||
        icon.entity;

    let displayState: string;

    // Check if template mode is enabled for state text customization
    if (icon.template_mode && icon.template) {
      // Initialize template service if needed
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }

      const templateHash = this._hashString(icon.template);
      const templateKey = `state_${icon.entity}_${icon.id}_${templateHash}`;

      // Initialize template strings object if not already done
      if (!hass.__uvc_template_strings) {
        hass.__uvc_template_strings = {};
      }

      // Subscribe to template if not already subscribed
      if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
        this._templateService.subscribeToTemplate(icon.template, templateKey, () => {
          // Force re-render when template updates
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
          }
        });
      }

      // Get template result for state text
      const templateResult = hass?.__uvc_template_strings?.[templateKey];
      if (templateResult !== undefined && String(templateResult).trim() !== '') {
        const resultString = String(templateResult).toLowerCase();
        // Only use template result as state text if it's NOT a boolean-like value
        const isBooleanResult = ['true', 'false', 'on', 'off', 'yes', 'no', '0', '1'].includes(
          resultString
        );

        if (!isBooleanResult) {
          // Check if template returned 'unknown' due to non-existent entity
          if (String(templateResult) === 'unknown') {
            displayState = `Template Error: Check entity names`;
          } else {
            displayState = String(templateResult);
          }
        } else {
          // Template returned boolean - use for visibility but keep actual state for text
          displayState = isActiveState
            ? icon.custom_active_state_text && icon.custom_active_state_text.trim() !== ''
              ? icon.custom_active_state_text
              : this._formatValueWithUnits(currentState, icon.entity, icon, hass)
            : icon.custom_inactive_state_text && icon.custom_inactive_state_text.trim() !== ''
              ? icon.custom_inactive_state_text
              : this._formatValueWithUnits(currentState, icon.entity, icon, hass);
        }
      } else {
        displayState = this._formatValueWithUnits(currentState, icon.entity, icon, hass);
      }
    } else {
      // Show custom text if provided, otherwise show actual entity state
      displayState = isActiveState
        ? icon.custom_active_state_text && icon.custom_active_state_text.trim() !== ''
          ? icon.custom_active_state_text
          : this._formatValueWithUnits(currentState, icon.entity, icon, hass)
        : icon.custom_inactive_state_text && icon.custom_inactive_state_text.trim() !== ''
          ? icon.custom_inactive_state_text
          : this._formatValueWithUnits(currentState, icon.entity, icon, hass);
    }

    // Icon background styles - use active/inactive specific properties
    const iconBackground = isActiveState
      ? icon.active_icon_background || icon.icon_background
      : icon.inactive_icon_background || icon.icon_background;

    const iconBackgroundColor = isActiveState
      ? icon.active_icon_background_color || icon.icon_background_color
      : icon.inactive_icon_background_color || icon.icon_background_color;

    const iconBackgroundStyle =
      iconBackground !== 'none'
        ? {
            backgroundColor: icon.use_entity_color_for_icon_background
              ? entityState?.attributes?.rgb_color
                ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                : iconBackgroundColor
              : iconBackgroundColor,
            borderRadius:
              iconBackground === 'circle'
                ? '50%'
                : iconBackground === 'rounded-square'
                  ? '8px'
                  : '0',
            padding: '8px',
          }
        : {};

    // Always ensure wrapper centers content for animations
    const baseWrapperStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const mergedWrapperStyle = { ...baseWrapperStyle, ...iconBackgroundStyle };

    // Animation classes
    const activeAnimation = icon.active_icon_animation || 'none';
    const inactiveAnimation = icon.inactive_icon_animation || 'none';
    const currentAnimation = isActiveState ? activeAnimation : inactiveAnimation;
    const animationClass = currentAnimation !== 'none' ? `icon-animation-${currentAnimation}` : '';

    // Container styles - exact same as main card
    const containerStyles = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: icon.vertical_alignment || 'center',
      padding: '0',
      borderRadius:
        icon.container_background_shape === 'circle'
          ? '50%'
          : icon.container_background_shape === 'rounded'
            ? '8px'
            : icon.container_background_shape === 'square'
              ? '0'
              : '8px',
      background:
        icon.container_background_shape && icon.container_background_shape !== 'none'
          ? icon.container_background_color || '#808080'
          : 'transparent',
      backgroundImage: this.getBackgroundImageCSS(icon, hass),
      backgroundSize: (icon as any).background_size || 'cover',
      backgroundPosition: icon.background_position || 'center',
      backgroundRepeat: icon.background_repeat || 'no-repeat',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: icon.container_width ? `${icon.container_width}%` : 'auto',
      margin: '0 auto',
    };

    // Use actual spacing values for true-to-life preview
    const actualNameIconGap = icon.name_icon_gap ?? 8;
    const actualNameStateGap = icon.name_state_gap ?? 2;
    const actualIconStateGap = icon.icon_state_gap ?? 4;

    // Get hover effect configuration from module design (if provided)
    const hoverEffect = iconModule ? (iconModule as any).design?.hover_effect : undefined;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    return html`
      <div
        class="icon-item-preview ${hoverEffectClass}"
        style=${this.styleObjectToCss({
          ...containerStyles,
          gap: '0px',
        })}
      >
        ${shouldShowIcon
          ? html`
              <div
                style="${this.styleObjectToCss({
                  ...mergedWrapperStyle,
                  marginBottom: shouldShowName
                    ? `${actualNameIconGap}px`
                    : shouldShowState
                      ? `${actualIconStateGap}px`
                      : '0px',
                })}"
              >
                <ha-icon
                  icon="${displayIcon || 'mdi:help-circle'}"
                  class="${animationClass} ultra-force-animation"
                  style="
                    color: ${displayColor || 'var(--secondary-text-color)'};
                    --mdc-icon-size: ${Number(
                    isActiveState
                      ? icon.active_icon_size || icon.icon_size
                      : icon.inactive_icon_size || icon.icon_size
                  ) || 26}px;
                    ${animationClass && animationClass !== 'none'
                    ? `animation: ${this._getInlineAnimation(animationClass)} !important;`
                    : ''}
                  "
                  data-animation-debug="${animationClass || 'none'}"
                  data-is-active="${isActiveState}"
                ></ha-icon>
              </div>
            `
          : ''}
        ${shouldShowName
          ? html`
              <div
                class="icon-name"
                style="
                  font-size: ${isActiveState
                  ? icon.active_text_size || icon.text_size || 12
                  : icon.inactive_text_size || icon.text_size || 14}px;
                  color: ${nameColor || 'var(--primary-text-color)'};
                  text-align: center;
                  line-height: 1.2;
                  max-width: 120px;
                  word-wrap: break-word;
                  margin-bottom: ${shouldShowState ? `${actualNameStateGap}px` : '0px'};
                "
              >
                ${displayName}
              </div>
            `
          : ''}
        ${shouldShowState
          ? html`
              <div
                class="icon-state"
                style="
                  font-size: ${isActiveState
                  ? icon.active_state_size || icon.state_size || 10
                  : icon.inactive_state_size || icon.state_size || 10}px;
                  color: ${stateColor || 'var(--secondary-text-color)'};
                  text-align: center;
                  line-height: 1.2;
                "
              >
                ${displayState}
              </div>
            `
          : ''}
      </div>
    `;
  }

  private renderIconGrid(
    iconModule: IconModule,
    hass: HomeAssistant,
    forceActive: boolean,
    syncAnimationClasses: boolean = true
  ): TemplateResult {
    // Get hover effect configuration from module design
    const hoverEffect = (iconModule as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    return html`
      <div
        class="icon-grid"
        style="
          display: grid;
          grid-template-columns: repeat(${Math.min(
          Math.max(1, Math.floor((iconModule.columns || 3) / 2)),
          iconModule.icons.length
        )}, 1fr);
          gap: ${iconModule.gap || 16}px;
          justify-content: ${iconModule.alignment || 'center'};
        "
      >
        ${iconModule.icons.slice(0, 6).map(icon => {
          const entityState = hass?.states[icon.entity];
          const currentState = entityState?.state || 'unknown';
          // Force the active state based on the forceActive parameter
          const isActive = forceActive;

          // Determine what to show based on forced state
          const shouldShowIcon = isActive
            ? icon.show_icon_when_active !== false
            : icon.show_icon_when_inactive !== false;
          const shouldShowName = isActive
            ? icon.show_name_when_active !== false
            : icon.show_name_when_inactive !== false;
          const shouldShowState = isActive
            ? icon.show_state_when_active !== false
            : icon.show_state_when_inactive !== false;

          // Get display values based on forced state
          let displayIcon = isActive ? icon.icon_active || icon.icon_inactive : icon.icon_inactive;

          // Use entity's current icon if no custom icon is set (for dynamic weather icons, etc.)
          if (entityState?.attributes?.icon && !displayIcon) {
            displayIcon = entityState.attributes.icon;
          }

          const displayColor = isActive
            ? icon.use_state_color_for_active_icon
              ? this._getEntityStateColor(entityState) || icon.active_icon_color
              : icon.use_entity_color_for_icon
                ? entityState?.attributes?.rgb_color
                  ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                  : icon.active_icon_color
                : icon.active_icon_color
            : icon.use_state_color_for_inactive_icon
              ? this._getEntityStateColor(entityState) || icon.inactive_icon_color
              : icon.use_entity_color_for_icon
                ? entityState?.attributes?.rgb_color
                  ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                  : icon.inactive_icon_color
                : icon.inactive_icon_color;

          const nameColor = isActive ? icon.active_name_color : icon.inactive_name_color;
          const stateColor = isActive ? icon.active_state_color : icon.inactive_state_color;

          const displayName = isActive
            ? icon.custom_active_name_text ||
              icon.name ||
              entityState?.attributes?.friendly_name ||
              icon.entity
            : icon.custom_inactive_name_text ||
              icon.name ||
              entityState?.attributes?.friendly_name ||
              icon.entity;

          let displayState: string;

          // Show custom text if provided, otherwise show actual entity state
          displayState = isActive
            ? icon.custom_active_state_text && icon.custom_active_state_text.trim() !== ''
              ? icon.custom_active_state_text
              : this._formatValueWithUnits(currentState, icon.entity, icon, hass)
            : icon.custom_inactive_state_text && icon.custom_inactive_state_text.trim() !== ''
              ? icon.custom_inactive_state_text
              : this._formatValueWithUnits(currentState, icon.entity, icon, hass);

          // Icon background styles - use active/inactive specific properties
          const iconBackground = isActive
            ? icon.active_icon_background || icon.icon_background
            : icon.inactive_icon_background || icon.icon_background;

          const iconBackgroundColor = isActive
            ? icon.active_icon_background_color || icon.icon_background_color
            : icon.inactive_icon_background_color || icon.icon_background_color;

          const iconBackgroundStyle =
            iconBackground !== 'none'
              ? {
                  backgroundColor: icon.use_entity_color_for_icon_background
                    ? entityState?.attributes?.rgb_color
                      ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                      : iconBackgroundColor
                    : iconBackgroundColor,
                  borderRadius:
                    iconBackground === 'circle'
                      ? '50%'
                      : iconBackground === 'rounded-square'
                        ? '8px'
                        : '0',
                  padding: '8px',
                }
              : {};

          // Always ensure wrapper centers content for animations
          const baseWrapperStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          };

          const mergedWrapperStyle = { ...baseWrapperStyle, ...iconBackgroundStyle };

          // Animation classes
          const activeAnimation = icon.active_icon_animation || 'none';
          const inactiveAnimation = icon.inactive_icon_animation || 'none';

          const currentAnimation = isActive ? activeAnimation : inactiveAnimation;
          const animationClass =
            currentAnimation !== 'none' ? `icon-animation-${currentAnimation}` : '';

          // Force animation class updates when state changes
          if (animationClass && syncAnimationClasses) {
            setTimeout(() => {
              this._updateIconAnimationClasses(icon.entity, animationClass, isActive);
            }, 150);
          }

          // Animation styles are handled by CSS classes

          // Container styles (smaller for split view)
          const containerStyles = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: icon.vertical_alignment || 'center',
            padding: '8px',
            borderRadius:
              icon.container_background_shape === 'circle'
                ? '50%'
                : icon.container_background_shape === 'rounded'
                  ? '8px'
                  : icon.container_background_shape === 'square'
                    ? '0'
                    : '8px',
            background:
              icon.container_background_shape && icon.container_background_shape !== 'none'
                ? icon.container_background_color || '#808080'
                : 'transparent',
            backgroundImage: this.getBackgroundImageCSS(icon, hass),
            backgroundSize: (icon as any).background_size || 'cover',
            backgroundPosition: icon.background_position || 'center',
            backgroundRepeat: icon.background_repeat || 'no-repeat',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: icon.container_width ? `${icon.container_width}%` : 'auto',
            margin: '0 auto',
          };

          // Use actual spacing values for true-to-life preview
          const actualNameIconGap = icon.name_icon_gap ?? 8;
          const actualNameStateGap = icon.name_state_gap ?? 2;
          const actualIconStateGap = icon.icon_state_gap ?? 4;

          return html`
            <div
              class="icon-item-preview ${hoverEffectClass}"
              style=${this.styleObjectToCss({
                ...containerStyles,
                gap: '0px',
              })}
            >
              ${shouldShowIcon
                ? html`
                    <div
                      style="${this.styleObjectToCss({
                        ...mergedWrapperStyle,
                        marginBottom: shouldShowName
                          ? `${actualNameIconGap}px`
                          : shouldShowState
                            ? `${actualIconStateGap}px`
                            : '0px',
                      })}"
                    >
                      <ha-icon
                        icon="${displayIcon || 'mdi:help-circle'}"
                        class="${animationClass} ultra-force-animation"
                        style="
                          color: ${displayColor || 'var(--secondary-text-color)'};
                          --mdc-icon-size: ${Number(
                          isActive
                            ? icon.active_icon_size || icon.icon_size
                            : icon.inactive_icon_size || icon.icon_size
                        ) || 26}px;
                          ${animationClass && animationClass !== 'none'
                          ? `animation: ${this._getInlineAnimation(animationClass)} !important;`
                          : ''}
                        "
                        data-animation-debug="${animationClass || 'none'}"
                        data-is-active="${isActive}"
                      ></ha-icon>
                    </div>
                  `
                : ''}
              ${shouldShowName
                ? html`
                    <div
                      class="icon-name"
                      style="
                        font-size: ${isActive
                        ? icon.active_text_size || icon.text_size || 12
                        : icon.inactive_text_size || icon.text_size || 14}px;
                        color: ${nameColor || 'var(--primary-text-color)'};
                        text-align: center;
                        line-height: 1.2;
                        max-width: 120px;
                        word-wrap: break-word;
                        margin-bottom: ${shouldShowState ? `${actualNameStateGap}px` : '0px'};
                      "
                    >
                      ${displayName}
                    </div>
                  `
                : ''}
              ${shouldShowState
                ? html`
                    <div
                      class="icon-state"
                      style="
                        font-size: ${isActive
                        ? icon.active_state_size || icon.state_size || 10
                        : icon.inactive_state_size || icon.state_size || 10}px;
                        color: ${stateColor || 'var(--secondary-text-color)'};
                        text-align: center;
                        line-height: 1.2;
                      "
                    >
                      ${displayState}
                    </div>
                  `
                : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const iconModule = module as IconModule;
    const errors = [...baseValidation.errors];

    if (!iconModule.icons || iconModule.icons.length === 0) {
      errors.push('At least one icon is required');
    }

    iconModule.icons.forEach((icon, index) => {
      if (!icon.entity || icon.entity.trim() === '') {
        errors.push(`Icon ${index + 1}: Entity ID is required`);
      }

      if (!icon.icon_inactive || icon.icon_inactive.trim() === '') {
        errors.push(`Icon ${index + 1}: Inactive icon is required`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Update template service with new hass reference
  public updateHass(hass: HomeAssistant): void {
    if (this._templateService) {
      this._templateService.updateHass(hass);
    }
  }

  // Clean up template subscriptions
  public cleanup(): void {
    if (this._templateService) {
      this._templateService.unsubscribeAllTemplates();
      this._templateService = undefined;
    }
  }

  // Helper method to detect binary entities by domain
  private _isBinaryEntity(entityId: string): boolean {
    const binaryDomains = [
      'binary_sensor',
      'switch',
      'input_boolean',
      'automation',
      'script',
      'light', // lights can be on/off
      'fan', // fans can be on/off
      'lock', // locks can be locked/unlocked (on/off)
      'cover', // covers can be open/closed
      'device_tracker', // device trackers can be home/away (on/off)
    ];

    const domain = entityId.split('.')[0];
    return binaryDomains.includes(domain);
  }

  // Helper method to properly evaluate icon state (matches logic from actual card)
  private _evaluateIconState(icon: IconConfig, hass: HomeAssistant): boolean {
    const entityState = hass?.states[icon.entity];
    if (!entityState) {
      return false;
    }

    const currentState = entityState.state;

    // Check template_mode first
    if (icon.template_mode && icon.template) {
      // Initialize template service if needed
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }

      const templateHash = this._hashString(icon.template);
      const templateKey = `display_${icon.entity}_${icon.id}_${templateHash}`;

      // Initialize template strings object if not already done
      if (!hass.__uvc_template_strings) {
        hass.__uvc_template_strings = {};
      }

      // Subscribe to template if not already subscribed
      if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
        this._templateService.subscribeToTemplate(icon.template, templateKey, () => {
          // Force re-render when template updates
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
          }
        });
      }

      // Get template result and evaluate for active state
      const templateResult = hass?.__uvc_template_strings?.[templateKey];
      if (templateResult !== undefined) {
        const result = String(templateResult).toLowerCase();
        const isBooleanResult = ['true', 'false', 'on', 'off', 'yes', 'no', '0', '1'].includes(
          result
        );

        if (isBooleanResult) {
          // Template returned boolean-like value, use it directly for active state
          return (
            ['true', 'on', 'yes', '1'].includes(result) ||
            (parseFloat(result) > 0 && !isNaN(parseFloat(result)))
          );
        } else if (String(templateResult).trim() !== '') {
          // Template returned custom text - check if it matches actual entity state
          if (String(templateResult) === currentState) {
            // Template returned actual entity state - use normal entity evaluation
            // Fall through to normal evaluation below
          } else {
            // Template returned custom text - this means active condition was met
            return true;
          }
        } else {
          // Template returned empty - inactive
          return false;
        }
      }
    }

    // If both active_state and inactive_state are defined, check both
    if (icon.active_state && icon.inactive_state) {
      if (currentState === icon.active_state) {
        return true;
      }
      if (currentState === icon.inactive_state) {
        return false;
      }
      // If state doesn't match either, default to inactive
      return false;
    }

    // If only active_state is defined
    if (icon.active_state) {
      return currentState === icon.active_state;
    }

    // If only inactive_state is defined
    if (icon.inactive_state) {
      return currentState !== icon.inactive_state;
    }

    // If neither is defined, use common "active" patterns
    const activeStates = ['on', 'true', 'active', 'open', 'playing', 'home'];
    const inactiveStates = [
      'off',
      'false',
      'inactive',
      'closed',
      'paused',
      'stopped',
      'away',
      'unavailable',
      'unknown',
    ];

    if (activeStates.includes(currentState.toLowerCase())) {
      return true;
    }

    if (inactiveStates.includes(currentState.toLowerCase())) {
      return false;
    }

    // For numeric states, consider > 0 as active
    const numericState = parseFloat(currentState);
    if (!isNaN(numericState)) {
      return numericState > 0;
    }

    // Default fallback
    return false;
  }

  getStyles(): string {
    return `
      /* Hide unwanted form labels with underscores and slots */
      [slot='label'] {
        display: none !important;
      }

      ha-form .mdc-form-field > label,
      ha-form .mdc-text-field > label,
      ha-form .mdc-floating-label,
      ha-form .mdc-notched-outline__leading,
      ha-form .mdc-notched-outline__notch,
      ha-form .mdc-notched-outline__trailing,
      ha-form .mdc-floating-label--float-above,
      ha-form label[for],
      ha-form .ha-form-label,
      ha-form .form-label {
        display: none !important;
      }

      /* Hide any labels containing underscores */
      ha-form label[data-label*='_'],
      ha-form .label-text:contains('_'),
      label:contains('_') {
        display: none !important;
      }
        .label {
          display: none !important;
        }

      /* Additional safeguards for underscore labels */
      ha-form .mdc-text-field-character-counter,
      ha-form .mdc-text-field-helper-text,
      ha-form mwc-formfield,
      ha-form .formfield {
        display: none !important;
      }

      /* Hide form field labels that match underscore patterns */
      ha-form[data-field*='_'] label,
      ha-form[data-field*='_'] .mdc-floating-label,
      ha-form[data-field*='_'] .mdc-notched-outline__notch > .mdc-floating-label {
        display: none !important;
      }

      /* Target specific underscore field names */
      ha-form[data-field='use_entity_color_for_icon'] label,
      ha-form[data-field='use_entity_color_for_icon_background'] label,
      ha-form[data-field='show_name_when_active'] label,
      ha-form[data-field='show_state_when_active'] label,
      ha-form[data-field='show_icon_when_active'] label,
      ha-form[data-field='show_name_when_inactive'] label,
      ha-form[data-field='show_state_when_inactive'] label,
      ha-form[data-field='show_icon_when_inactive'] label,
      ha-form[data-field='active_template_mode'] label,
      ha-form[data-field='inactive_template_mode'] label,
      ha-form[data-field='dynamic_icon_template_mode'] label,
      ha-form[data-field='dynamic_color_template_mode'] label {
        display: none !important;
      }

      /* Make dynamic template toggles more compact */
      ha-form[data-field='dynamic_icon_template_mode'] ha-switch,
      ha-form[data-field='dynamic_color_template_mode'] ha-switch {
        --mdc-switch-track-width: 36px !important;
        --mdc-switch-track-height: 20px !important;
        --switch-checked-track-color: var(--primary-color) !important;
        --switch-unchecked-track-color: var(--disabled-color) !important;
        transform: scale(0.8) !important;
      }

      ha-form[data-field='dynamic_icon_template_mode'] .mdc-switch,
      ha-form[data-field='dynamic_color_template_mode'] .mdc-switch {
        transform: scale(0.8) !important;
      }

      /* Hide any element with underscore in text content */
      *:not(script):not(style) {
        text-decoration: none !important;
      }
      
      /* Target elements that might show underscore text */
      .mdc-form-field__label:contains('_'),
      .mdc-text-field__input + label:contains('_'),
      .mdc-select__selected-text:contains('_') {
        display: none !important;
      }


      
      .icon-grid {
        width: 100%;
      }

      /* Collapsible Header Styles */
      .collapsible-header:hover {
        background: rgba(var(--rgb-primary-color), 0.08) !important;
        border-color: var(--primary-color) !important;
      }

      .collapsible-header:active {
        transform: scale(0.98);
      }

      /* Split Preview Styles */
      .split-preview-container {
        position: relative;
      }

      .split-preview-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 1px;
        height: 100%;
        background: var(--divider-color);
        z-index: 1;
      }

      .icon-module-split-preview .inactive-preview .icon-item-preview {
        border: 1px solid rgba(var(--rgb-primary-color), 0.1);
        background: rgba(var(--rgb-primary-color), 0.02);
      }

      .icon-module-split-preview .active-preview .icon-item-preview {
        border: 1px solid rgba(var(--rgb-primary-color), 0.2);
        background: rgba(var(--rgb-primary-color), 0.04);
      }

      .icon-module-split-preview .inactive-preview .icon-item-preview.hover-enabled:hover {
        background: rgba(var(--rgb-primary-color), 0.08) !important;
        border-color: var(--primary-color) !important;
        transform: scale(1.02);
      }

      .icon-module-split-preview .active-preview .icon-item-preview.hover-enabled:hover {
        background: rgba(var(--rgb-primary-color), 0.12) !important;
        border-color: var(--primary-color) !important;
        transform: scale(1.02);
      }

      /* Preview state indicators */
      .icon-module-split-preview .preview-header div {
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 8px;
        background: rgba(var(--rgb-primary-color), 0.08);
        border: 1px solid rgba(var(--rgb-primary-color), 0.2);
      }

      /* Responsive adjustments for split view */
      @media (max-width: 768px) {
        .icon-module-split-preview .split-preview-container {
          grid-template-columns: 1fr !important;
          grid-template-rows: auto auto;
        }

        .icon-module-split-preview .preview-header {
          flex-direction: column !important;
          gap: 8px !important;
        }

        .icon-module-split-preview .inactive-preview {
          border-right: none !important;
          border-bottom: 1px solid var(--divider-color) !important;
        }

        .icon-module-split-preview .split-preview-container::before {
          display: none;
        }

        .icon-module-split-preview .preview-header div {
          margin: 0 !important;
        }

        .collapsible-header {
          padding: 10px 12px !important;
        }

        .collapsible-header span {
          font-size: 14px !important;
        }

        .collapsible-header ha-icon {
          font-size: 16px !important;
        }
      }

      @media (max-width: 480px) {
        .icon-module-split-preview .icon-grid {
          grid-template-columns: repeat(auto-fit, minmax(35px, 1fr)) !important;
          gap: 2px !important;
        }

        .icon-module-split-preview .inactive-preview,
        .icon-module-split-preview .active-preview {
          padding: 8px !important;
        }

        .icon-module-split-preview .preview-header div {
          font-size: 10px !important;
          padding: 6px 8px !important;
        }

        .collapsible-header {
          padding: 8px 10px !important;
        }

        .collapsible-header span {
          font-size: 12px !important;
        }

        .collapsible-header ha-icon {
          font-size: 14px !important;
        }
      }
      
      .icon-item-preview.hover-enabled:hover {
        background: var(--primary-color) !important;
        color: white;
        transform: scale(1.05);
      }
      
      .icon-item-preview.hover-enabled:hover ha-icon {
        color: white !important;
      }
      
      .icon-item-preview.hover-enabled:hover .icon-name,
      .icon-item-preview.hover-enabled:hover .icon-state {
        color: white !important;
      }
      
      /* Field styling */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
     
        margin-bottom: 4px !important;
        display: block !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        display: block !important;
        opacity: 0.8 !important;
        line-height: 1.4 !important;
      }

      .section-title {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--primary-color) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }

      .settings-section {
        margin-bottom: 16px;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Conditional Fields Grouping CSS */
      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        overflow: hidden;
        transition: all 0.2s ease;
        animation: slideInFromLeft 0.3s ease-out;
      }

      .conditional-fields-group:hover {
        background: rgba(var(--rgb-primary-color), 0.12);
      }

      .conditional-fields-header {
        background: rgba(var(--rgb-primary-color), 0.15);
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .conditional-fields-content {
        padding: 16px;
      }

      .conditional-fields-content > .field-title:first-child {
        margin-top: 0 !important;
      }

      @keyframes slideInFromLeft {
        from { 
          opacity: 0; 
          transform: translateX(-10px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      }

      /* Expandable details styling */
      details > summary {
        list-style: none;
      }

      details > summary::-webkit-details-marker {
        display: none;
      }

      details[open] > summary ha-icon {
        transform: rotate(90deg);
      }

      details > summary:hover {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
      }

      /* Icon animations - Simple and direct selectors */
      .icon-animation-pulse {
        animation: iconPulse 2s ease-in-out infinite !important;
      }

      .icon-animation-spin {
        animation: iconSpin 2s linear infinite !important;
      }

      .icon-animation-bounce {
        animation: iconBounce 1s ease-in-out infinite !important;
      }

      .icon-animation-flash {
        animation: iconFlash 1s ease-in-out infinite !important;
      }

      .icon-animation-shake {
        animation: iconShake 0.5s ease-in-out infinite !important;
      }

      .icon-animation-vibrate {
        animation: iconVibrate 0.3s ease-in-out infinite !important;
      }

      .icon-animation-rotate-left {
        animation: iconRotateLeft 2s linear infinite !important;
      }

      .icon-animation-rotate-right {
        animation: iconRotateRight 2s linear infinite !important;
      }

      .icon-animation-fade {
        animation: iconFade 2s ease-in-out infinite !important;
      }

      .icon-animation-scale {
        animation: iconScale 1s ease-in-out infinite !important;
      }

      .icon-animation-tada {
        animation: iconTada 1s ease-in-out infinite !important;
      }



      @keyframes iconPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }

      @keyframes iconSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes iconBounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }

      @keyframes iconFlash {
        0%, 50%, 100% { opacity: 1; }
        25%, 75% { opacity: 0.3; }
      }

      @keyframes iconShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
      }

      @keyframes iconVibrate {
        0%, 100% { transform: translate(0); }
        10% { transform: translate(-1px, -1px); }
        20% { transform: translate(1px, -1px); }
        30% { transform: translate(-1px, 1px); }
        40% { transform: translate(1px, 1px); }
        50% { transform: translate(-1px, -1px); }
        60% { transform: translate(1px, -1px); }
        70% { transform: translate(-1px, 1px); }
        80% { transform: translate(1px, 1px); }
        90% { transform: translate(-1px, -1px); }
      }

      @keyframes iconRotateLeft {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
      }

      @keyframes iconRotateRight {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes iconFade {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      @keyframes iconScale {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }

      @keyframes iconTada {
        0% { transform: scale(1); }
        10%, 20% { transform: scale(0.9) rotate(-3deg); }
        30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
        40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
        100% { transform: scale(1) rotate(0); }
      }

      @keyframes lockUnlockedPulse {
        0%, 100% { 
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
          border-color: var(--info-color, #2196F3);
        }
        50% { 
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.4);
          border-color: var(--info-color, #1976D2);
        }
      }

      /* Respect user's motion preferences */
      @media (prefers-reduced-motion: reduce) {
        .lock-btn.unlocked {
          animation: none !important;
        }
      }

      /* Add icon button styling */
      .add-icon-btn:hover {
        background: var(--primary-color);
        color: white;
      }
      
      /* Remove icon button styling */
      .remove-icon-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      /* Icon picker specific styling */
      ha-icon-picker {
        --ha-icon-picker-width: 100%;
        --ha-icon-picker-height: 56px;
      }

      /* Dropdown styling */
      ha-select {
        width: 100%;
        --ha-select-height: 40px;
      }

      /* Hide any radio buttons that might still be rendered */
      ha-radio,
      mwc-radio,
      .mdc-radio {
        display: none !important;
      }

      /* Text field and select consistency */
      ha-textfield,
      ha-select {
        --mdc-shape-small: 8px;
        --mdc-theme-primary: var(--primary-color);
      }

      /* Note: Dropdown positioning fixes are now handled globally in ultra-card-editor.ts */

      /* Module tab content input width - restrict to icon module only */
      .icon-module .module-tab-content input[type="number"], 
      .icon-module .module-tab-content input[type="text"],
      .icon-module .module-tab-content .gap-input {
        width: 25% !important;
        max-width: 25% !important;
        min-width: 25% !important;
      }

      /* Grid styling for layout options */
      .settings-section[style*="grid"] > div {
        min-width: 0;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .settings-section[style*="grid-template-columns: 1fr 1fr 1fr"] {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }

        .settings-section[style*="grid-template-columns: 1fr 1fr"] {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }

        .conditional-fields-group {
          border-left-width: 3px;
        }
        
        .conditional-fields-header {
          padding: 10px 12px;
          font-size: 13px;
        }
        
        .conditional-fields-content {
          padding: 12px;
        }

        /* Mobile-friendly field titles and descriptions */
        .field-title {
          font-size: 14px !important;
        }

        .field-description {
          font-size: 12px !important;
          line-height: 1.3 !important;
        }

        .section-title {
          font-size: 16px !important;
        }

        /* Mobile-friendly size controls */
        .gap-control-container {
          gap: 8px !important;
        }

        .gap-input {
          width: 44px !important;
          max-width: 44px !important;
          min-width: 44px !important;
          font-size: 12px !important;
        }

        .reset-btn {
          width: 32px !important;
          height: 32px !important;
        }

        .reset-btn ha-icon {
          font-size: 14px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1 !important;
        }

        /* Mobile-friendly lock buttons */
        .lock-btn {
          padding: 6px 12px !important;
          font-size: 12px !important;
        }

        .lock-btn ha-icon {
          font-size: 16px !important;
        }

        .lock-btn.unlocked {
          border-color: var(--info-color, #2196F3) !important;
          background: rgba(33, 150, 243, 0.15) !important;
          color: var(--info-color, #2196F3) !important;
          box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.3) !important;
        }

        .lock-btn.unlocked ha-icon {
          color: var(--info-color, #2196F3) !important;
        }

        /* Mobile-friendly accordions */
        details > summary {
          padding: 12px !important;
          font-size: 14px !important;
        }

        details > summary ha-icon {
          font-size: 16px !important;
        }

        /* Mobile-friendly form fields */
        .icon-settings-container {
          padding: 12px !important;
        }

        /* Mobile-friendly preview grid */
        .icon-grid {
          grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)) !important;
          gap: 8px !important;
        }

        .icon-item-preview {
          padding: 6px !important;
        }
      }

      /* Extra small devices (phones, 480px and down) */
      @media (max-width: 480px) {
        .field-title {
          font-size: 13px !important;
        }

        .field-description {
          font-size: 11px !important;
        }

        .section-title {
          font-size: 14px !important;
        }

        .gap-input {
          width: 40px !important;
          max-width: 40px !important;
          min-width: 40px !important;
          font-size: 11px !important;
        }

        .reset-btn {
          width: 28px !important;
          height: 28px !important;
        }

        .reset-btn ha-icon {
          font-size: 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1 !important;
        }

        .lock-btn {
          padding: 4px 8px !important;
          font-size: 11px !important;
        }

        .lock-btn.unlocked {
          border-color: var(--info-color, #2196F3) !important;
          background: rgba(33, 150, 243, 0.15) !important;
          color: var(--info-color, #2196F3) !important;
          box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.3) !important;
        }

        .lock-btn.unlocked ha-icon {
          color: var(--info-color, #2196F3) !important;
        }

        .icon-settings-container {
          padding: 8px !important;
        }

        /* Stack lock controls vertically on very small screens */
        .gap-control-container {
          flex-wrap: wrap !important;
          gap: 6px !important;
        }

        .gap-slider {
          width: 100% !important;
          order: 1;
        }

        .gap-input {
          order: 2;
        }

        .reset-btn {
          order: 3;
        }

        .lock-btn {
          order: 4;
          width: 100% !important;
          justify-content: center !important;
        }
      }

      /* Ensure form elements don't overflow */
      .settings-section ha-form {
        max-width: 100%;
        overflow: visible;
      }

      /* Color picker adjustments */
      .settings-section ha-form[data-field*="color"] {
        min-height: 56px;
      }

      /* Boolean toggle adjustments */
      .settings-section ha-form[data-field*="mode"] {
        display: flex;
        align-items: center;
        min-height: auto;
      }

      /* Number slider adjustments */
      .settings-section ha-form[data-field*="size"] .mdc-slider,
      .settings-section ha-form[data-field*="gap"] .mdc-slider,
      .settings-section ha-form[data-field*="columns"] .mdc-slider {
        width: 100%;
        max-width: 100%;
      }

      /* Gap control styles */
      .gap-control-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .gap-slider {
        flex: 1;
        height: 6px;
        background: var(--divider-color);
        border-radius: 3px;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .gap-slider::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .gap-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .gap-slider:hover {
        background: var(--primary-color);
        opacity: 0.7;
      }

      .gap-slider:hover::-webkit-slider-thumb {
        transform: scale(1.1);
      }

      .gap-slider:hover::-moz-range-thumb {
        transform: scale(1.1);
      }

      .gap-input {
        width: 48px !important;
        max-width: 48px !important;
        min-width: 48px !important;
        padding: 4px 6px !important;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        text-align: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .gap-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .reset-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .reset-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
        transform: none;
      }

      .reset-btn ha-icon {
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        padding: 0;
        line-height: 1;
      }

      /* Lock button styles */
      .lock-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: 2px solid var(--divider-color);
        border-radius: 8px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        outline: none;
        position: relative;
      }

      .lock-btn:hover {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }

      .lock-btn.locked {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-color);
      }

      .lock-btn.locked:hover {
        background: var(--primary-color);
        color: white;
      }

      button.lock-btn.unlocked {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
      }

      .lock-btn.unlocked {
        border-color: var(--info-color, #2196F3) !important;
        background: rgba(33, 150, 243, 0.15) !important;
        color: var(--info-color, #2196F3) !important;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2) !important;
        animation: lockUnlockedPulse 2s ease-in-out infinite;
      }

      .lock-btn.unlocked:hover {
        background: var(--info-color, #2196F3) !important;
        color: white !important;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.4) !important;
        animation: none !important;
      }

      .lock-btn.unlocked ha-icon {
        color: var(--info-color, #2196F3) !important;
      }

      .lock-btn.unlocked:hover ha-icon {
        color: white !important;
      }

      .lock-btn ha-icon {
        font-size: 18px;
      }

      /* Field lock button styling */
      .field-container .lock-btn {
        padding: 6px 12px;
        font-size: 12px;
        min-width: auto;
      }

      .field-container .lock-btn ha-icon {
        font-size: 16px;
      }

      /* Icon settings container */
      .icon-settings-container {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
        border: 1px solid var(--divider-color);
      }

      .icon-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--divider-color);
      }

      .icon-preview {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: white;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .icon-title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .remove-icon-btn {
        background: var(--error-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .remove-icon-btn:hover {
        background: var(--error-color);
        opacity: 0.8;
      }

      .remove-icon-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .remove-icon-btn ha-icon {
        font-size: 16px;
      }

      /* Size lock container */
      .size-lock-container {
        padding: 12px;
        background: rgba(var(--rgb-primary-color), 0.05);
        border-radius: 8px;
        border: 1px solid rgba(var(--rgb-primary-color), 0.2);
      }

      /* Hide unwanted action options */
      ha-form mwc-list-item[value="toggle"],
      ha-form mwc-list-item[graphic="icon"]:has(ha-icon[icon="mdi:gesture-tap"]),
      ha-form .mdc-deprecated-list-item[data-value="toggle"],
      ha-form .mdc-list-item[data-value="toggle"],
      ha-form option[value="toggle"] {
        display: none !important;
      }

      /* Hide "Default ()" option - target by text content */
      ha-form mwc-list-item:has-text("Default ()"),
      ha-form .mdc-deprecated-list-item:has-text("Default ()"),
      ha-form .mdc-list-item:has-text("Default ()"),
      ha-form option:has-text("Default ()") {
        display: none !important;
      }

      /* Alternative approach using CSS attribute selectors for text content */
      ha-form mwc-list-item[textContent*="Default ()"],
      ha-form .mdc-deprecated-list-item[textContent*="Default ()"],
      ha-form .mdc-list-item[textContent*="Default ()"] {
        display: none !important;
      }

      /* Template Section Styles */
      .template-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
        margin-bottom: 32px;
      }

      .template-header {
        margin-bottom: 16px;
      }

      .switch-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }

      .switch-label {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
      }

      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--switch-unchecked-color, #ccc);
        transition: .4s;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
      }

      input:checked + .slider {
        background-color: var(--primary-color);
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .slider.round {
        border-radius: 24px;
    max-width: 50px;
}
      }

      .slider.round:before {
        border-radius: 50%;
      }

      .template-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin-bottom: 8px;
      }

      .template-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .template-editor {
        min-height: 120px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        resize: vertical;
        width: 100%;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        outline: none;
        transition: border-color 0.2s ease;
      }

      .template-editor:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .template-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-style: italic;
        margin-top: 4px;
      }

      .template-help p {
        margin: 8px 0;
        font-weight: 500;
      }

      .template-help ul {
        margin: 4px 0;
        padding-left: 16px;
      }

      .template-help li {
        margin: 2px 0;
      }

      .template-help code {
        background: rgba(var(--rgb-primary-color), 0.1);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 11px;
      }

      ${GlobalActionsTab.getHoverStyles()}
    `;
  }

  private _addIcon(
    iconModule: IconModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const newIcon: IconConfig = {
      id: this.generateId('icon-item'),
      entity: 'weather.forecast_home',
      name: '',
      icon_inactive: 'mdi:weather-partly-cloudy',
      icon_active: 'mdi:weather-partly-cloudy',
      inactive_state: '',
      active_state: '',
      custom_inactive_state_text: '',
      custom_active_state_text: '',
      custom_inactive_name_text: '',
      custom_active_name_text: '',

      // Legacy template modes (deprecated)
      inactive_template_mode: false,
      inactive_template: '',
      active_template_mode: false,
      active_template: '',

      // Entity color options
      use_entity_color_for_icon: false,
      use_state_color_for_inactive_icon: false,
      use_state_color_for_active_icon: false,

      // Color configuration
      color_inactive: 'var(--secondary-text-color)',
      color_active: 'var(--primary-color)',
      inactive_icon_color: 'var(--secondary-text-color)',
      active_icon_color: 'var(--primary-color)',
      inactive_name_color: 'var(--primary-text-color)',
      active_name_color: 'var(--primary-text-color)',
      inactive_state_color: 'var(--secondary-text-color)',
      active_state_color: 'var(--secondary-text-color)',

      // Display toggles
      show_name_when_inactive: true,
      show_state_when_inactive: true,
      show_icon_when_inactive: true,
      show_name_when_active: true,
      show_state_when_active: true,
      show_icon_when_active: true,

      // Legacy (backward compatibility)
      show_state: true,
      show_name: true,

      // Sizing
      icon_size: 26,
      text_size: 14,
      name_icon_gap: 8,
      name_state_gap: 2,
      icon_state_gap: 4,

      // Active/Inactive specific sizing
      active_icon_size: 26,
      inactive_icon_size: 26,
      active_text_size: 14,
      inactive_text_size: 14,
      state_size: 14,
      active_state_size: 14,
      inactive_state_size: 14,

      // Icon background
      icon_background: 'none',
      use_entity_color_for_icon_background: false,
      icon_background_color: 'transparent',

      // Active/Inactive specific icon backgrounds
      active_icon_background: 'none',
      inactive_icon_background: 'none',
      active_icon_background_color: 'transparent',
      inactive_icon_background_color: 'transparent',

      // Individual size lock mechanism
      icon_size_locked: true,
      text_size_locked: true,
      state_size_locked: true,

      // Field lock mechanism (active fields inherit from inactive by default)
      active_icon_locked: true,
      active_icon_color_locked: false,
      active_icon_background_locked: true,
      active_icon_background_color_locked: true,
      active_name_locked: true,
      active_name_color_locked: true,
      active_state_locked: false,
      active_state_color_locked: true,

      // Animations
      inactive_icon_animation: 'none',
      active_icon_animation: 'none',

      // Other display options
      show_units: true,

      // Container appearance
      vertical_alignment: 'center',
      container_width: undefined,
      container_background_shape: 'none',
      container_background_color: '#808080',

      // Ultra Link Actions
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },

      // Legacy actions (backward compatibility)
      click_action: 'toggle',
      double_click_action: 'none',
      hold_action_legacy: 'none',
      navigation_path: '',
      url: '',
      service: '',
      service_data: {},

      // Legacy template support
      template_mode: false,
      template: '',

      // Dynamic templates
      dynamic_icon_template_mode: false,
      dynamic_icon_template: '',
      dynamic_color_template_mode: false,
      dynamic_color_template: '',
    };

    const updatedIcons = [...iconModule.icons, newIcon];
    updateModule({ icons: updatedIcons });
  }

  private _removeIcon(
    iconModule: IconModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    if (iconModule.icons.length <= 1) return;

    const updatedIcons = iconModule.icons.filter((_, i) => i !== index);
    updateModule({ icons: updatedIcons });
  }

  private _updateIcon(
    iconModule: IconModule,
    index: number,
    updates: Partial<IconConfig>,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const updatedIcons = iconModule.icons.map((icon, i) =>
      i === index ? { ...icon, ...updates } : icon
    );
    updateModule({ icons: updatedIcons });
  }

  private _updateIconWithLockSync(
    iconModule: IconModule,
    index: number,
    property: string,
    value: any,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const icon = iconModule.icons[index];
    const updates: any = { [property]: value };

    // Sync locked active properties when their inactive counterpart changes
    const lockMapping = {
      icon_inactive: { active: 'icon_active', lock: 'active_icon_locked' },
      inactive_icon_size: { active: 'active_icon_size', lock: 'icon_size_locked' },
      inactive_text_size: { active: 'active_text_size', lock: 'text_size_locked' },
      inactive_state_size: { active: 'active_state_size', lock: 'state_size_locked' },
      inactive_icon_color: { active: 'active_icon_color', lock: 'active_icon_color_locked' },
      inactive_name_color: { active: 'active_name_color', lock: 'active_name_color_locked' },
      inactive_state_color: { active: 'active_state_color', lock: 'active_state_color_locked' },
      inactive_icon_background: {
        active: 'active_icon_background',
        lock: 'active_icon_background_locked',
      },
      inactive_icon_background_color: {
        active: 'active_icon_background_color',
        lock: 'active_icon_background_color_locked',
      },
      use_state_color_for_inactive_icon: {
        active: 'use_state_color_for_active_icon',
        lock: 'active_state_color_locked',
      },
    };

    const mapping = lockMapping[property as keyof typeof lockMapping];
    if (mapping && icon[mapping.lock as keyof typeof icon] !== false) {
      updates[mapping.active] = value;
    }

    this._updateIcon(iconModule, index, updates, updateModule);
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    const imageType = moduleWithDesign.background_image_type;
    const backgroundImage = moduleWithDesign.background_image;
    const backgroundEntity = moduleWithDesign.background_image_entity;

    if (!imageType || imageType === 'none') return 'none';

    switch (imageType) {
      case 'upload': {
        if (backgroundImage) {
          const resolved = getImageUrl(hass, backgroundImage);
          return `url("${resolved}")`;
        }
        break;
      }
      case 'url': {
        if (backgroundImage) {
          return `url("${backgroundImage}")`;
        }
        break;
      }
      case 'entity': {
        if (backgroundEntity && hass) {
          const entityState = hass.states[backgroundEntity];
          if (entityState) {
            const imageUrl =
              (entityState.attributes as any)?.entity_picture ||
              (entityState.attributes as any)?.image ||
              (typeof entityState.state === 'string' ? entityState.state : '');
            if (imageUrl && imageUrl !== 'unknown' && imageUrl !== 'unavailable') {
              const resolved = getImageUrl(hass, imageUrl);
              return `url("${resolved}")`;
            }
          }
        }
        break;
      }
    }

    return 'none';
  }

  private styleObjectToCss(styleObj: Record<string, string>): string {
    return Object.entries(styleObj)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        return `${kebabKey}: ${value}`;
      })
      .join('; ');
  }

  // Helper method to ensure border radius values have proper units
  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;

    // If value is just a number or contains only numbers, add px
    if (/^\d+$/.test(value)) {
      return `${value}px`;
    }

    // If value is a multi-value (like "5 10 15 20"), add px to each number
    if (/^[\d\s]+$/.test(value)) {
      return value
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }

    // Otherwise return as-is (already has units like px, em, %, etc.)
    return value;
  }

  private _renderSizeControl(
    iconModule: IconModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void,
    property: string,
    value: number,
    min: number,
    max: number,
    defaultValue: number
  ): TemplateResult {
    return html`
      <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
        <input
          type="range"
          class="gap-slider"
          min="${min}"
          max="${max}"
          step="1"
          .value="${value}"
          @input=${(e: Event) => {
            const target = e.target as HTMLInputElement;
            const newValue = Number(target.value);
            this._updateIconWithLockSync(iconModule, index, property, newValue, updateModule);
          }}
        />
        <input
          type="number"
          class="gap-input"
          min="${min}"
          max="${max}"
          step="1"
          .value="${value}"
          @input=${(e: Event) => {
            const target = e.target as HTMLInputElement;
            const newValue = Number(target.value);
            if (!isNaN(newValue) && newValue >= min && newValue <= max) {
              this._updateIconWithLockSync(iconModule, index, property, newValue, updateModule);
            }
          }}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault();
              const target = e.target as HTMLInputElement;
              const currentValue = Number(target.value) || defaultValue;
              const increment = e.key === 'ArrowUp' ? 1 : -1;
              const newValue = Math.max(min, Math.min(max, currentValue + increment));
              this._updateIconWithLockSync(iconModule, index, property, newValue, updateModule);
            }
          }}
        />
        <button
          class="reset-btn"
          @click=${() => {
            this._updateIconWithLockSync(iconModule, index, property, defaultValue, updateModule);
          }}
          title="Reset to default (${defaultValue})"
        >
          <ha-icon icon="mdi:refresh"></ha-icon>
        </button>
      </div>
    `;
  }

  private _renderFieldWithLock(
    iconModule: IconModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void,
    lockProperty: string,
    activeProperty: string,
    inactiveProperty: string,
    value: any,
    fieldType: 'icon' | 'color' | 'select' | 'text' | 'toggle',
    hass: HomeAssistant,
    selectOptions?: { value: string; label: string }[]
  ): TemplateResult {
    const icon = iconModule.icons[index];
    const isLocked = icon[lockProperty as keyof typeof icon] !== false;
    const displayValue = isLocked ? icon[inactiveProperty as keyof typeof icon] || value : value;

    return html`
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="flex: 1;">
          ${fieldType === 'icon'
            ? html`
                <div
                  style="opacity: ${isLocked ? '0.5' : '1'}; pointer-events: ${isLocked
                    ? 'none'
                    : 'auto'};"
                >
                  ${this.renderUcForm(
                    hass,
                    { [activeProperty]: displayValue },
                    [this.iconField(activeProperty)],
                    (e: CustomEvent) => {
                      if (!isLocked) {
                        this._updateIcon(
                          iconModule,
                          index,
                          { [activeProperty]: e.detail.value[activeProperty] },
                          updateModule
                        );
                      }
                    },
                    false
                  )}
                </div>
              `
            : fieldType === 'color'
              ? html`
                  <ultra-color-picker
                    .value=${displayValue}
                    .disabled=${isLocked}
                    @value-changed=${(e: CustomEvent) => {
                      if (!isLocked) {
                        this._updateIcon(
                          iconModule,
                          index,
                          { [activeProperty]: e.detail.value },
                          updateModule
                        );
                      }
                    }}
                  ></ultra-color-picker>
                `
              : fieldType === 'select'
                ? html`
                    <div
                      style="opacity: ${isLocked ? '0.5' : '1'}; pointer-events: ${isLocked
                        ? 'none'
                        : 'auto'};"
                    >
                      ${this.renderUcForm(
                        hass,
                        { [activeProperty]: displayValue },
                        [this.selectField(activeProperty, selectOptions || [])],
                        (e: CustomEvent) => {
                          if (!isLocked) {
                            this._updateIcon(
                              iconModule,
                              index,
                              { [activeProperty]: e.detail.value[activeProperty] },
                              updateModule
                            );
                          }
                        },
                        false
                      )}
                    </div>
                  `
                : fieldType === 'toggle'
                  ? html`
                      <ha-switch
                        .checked=${displayValue}
                        .disabled=${isLocked}
                        @change=${(e: Event) => {
                          if (!isLocked) {
                            const target = e.target as any;
                            this._updateIcon(
                              iconModule,
                              index,
                              { [activeProperty]: target.checked },
                              updateModule
                            );
                          }
                        }}
                      ></ha-switch>
                    `
                  : html`
                      <div
                        style="opacity: ${isLocked ? '0.5' : '1'}; pointer-events: ${isLocked
                          ? 'none'
                          : 'auto'};"
                      >
                        ${this.renderUcForm(
                          hass,
                          { [activeProperty]: displayValue },
                          [this.textField(activeProperty)],
                          (e: CustomEvent) => {
                            if (!isLocked) {
                              this._updateIcon(
                                iconModule,
                                index,
                                { [activeProperty]: e.detail.value[activeProperty] },
                                updateModule
                              );
                            }
                          },
                          false
                        )}
                      </div>
                    `}
        </div>
        <button
          class="lock-btn ${isLocked ? 'locked' : 'unlocked'}"
          @click=${() => {
            const newLockState = !isLocked;
            const updates: any = { [lockProperty]: newLockState };

            // If locking, sync active to inactive value
            if (newLockState) {
              updates[activeProperty] = icon[inactiveProperty as keyof typeof icon];
            }

            this._updateIcon(iconModule, index, updates, updateModule);
          }}
          title="${isLocked
            ? 'Unlock to customize this field independently'
            : 'Lock to inherit from inactive state'}"
        >
          <ha-icon icon="${isLocked ? 'mdi:lock' : 'mdi:lock-open'}"></ha-icon>
        </button>
      </div>
    `;
  }

  private _renderSizeControlWithLock(
    iconModule: IconModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void,
    lockProperty: string,
    activeProperty: string,
    inactiveProperty: string,
    value: number,
    min: number,
    max: number,
    defaultValue: number
  ): TemplateResult {
    const icon = iconModule.icons[index];
    const lockPropertyName = `${lockProperty}_locked` as keyof typeof icon;
    const isLocked = icon[lockPropertyName] !== false;

    // If locked, display the inactive value, otherwise display the active value
    const displayValue = isLocked
      ? (icon[inactiveProperty as keyof typeof icon] as number) || defaultValue
      : value;

    return html`
      <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
        <input
          type="range"
          class="gap-slider"
          min="${min}"
          max="${max}"
          step="1"
          .value="${displayValue}"
          .disabled=${isLocked}
          @input=${(e: Event) => {
            if (!isLocked) {
              const target = e.target as HTMLInputElement;
              const newValue = Number(target.value);
              this._updateIcon(iconModule, index, { [activeProperty]: newValue }, updateModule);
            }
          }}
        />
        <input
          type="number"
          class="gap-input"
          min="${min}"
          max="${max}"
          step="1"
          .value="${displayValue}"
          .disabled=${isLocked}
          @input=${(e: Event) => {
            if (!isLocked) {
              const target = e.target as HTMLInputElement;
              const newValue = Number(target.value);
              if (!isNaN(newValue) && newValue >= min && newValue <= max) {
                this._updateIcon(iconModule, index, { [activeProperty]: newValue }, updateModule);
              }
            }
          }}
          @keydown=${(e: KeyboardEvent) => {
            if (!isLocked && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
              e.preventDefault();
              const target = e.target as HTMLInputElement;
              const currentValue = Number(target.value) || defaultValue;
              const increment = e.key === 'ArrowUp' ? 1 : -1;
              const newValue = Math.max(min, Math.min(max, currentValue + increment));
              this._updateIcon(iconModule, index, { [activeProperty]: newValue }, updateModule);
            }
          }}
        />
        <button
          class="reset-btn"
          @click=${() => {
            if (!isLocked) {
              this._updateIcon(iconModule, index, { [activeProperty]: defaultValue }, updateModule);
            }
          }}
          title="Reset to default (${defaultValue})"
          .disabled=${isLocked}
        >
          <ha-icon icon="mdi:refresh"></ha-icon>
        </button>
        <button
          class="lock-btn ${isLocked ? 'locked' : 'unlocked'}"
          @click=${() => {
            const newLockState = !isLocked;
            const updates: any = { [lockPropertyName]: newLockState };

            // If locking, sync active to inactive value
            if (newLockState) {
              updates[activeProperty] = icon[inactiveProperty as keyof typeof icon] || defaultValue;
            }

            this._updateIcon(iconModule, index, updates, updateModule);
          }}
          title="${isLocked
            ? 'Unlock to set different sizes for active/inactive'
            : 'Lock to use same size for both states'}"
        >
          <ha-icon icon="${isLocked ? 'mdi:lock' : 'mdi:lock-open'}"></ha-icon>
        </button>
      </div>
    `;
  }

  private _updateIconAnimationClasses(
    entityId: string,
    newAnimationClass: string,
    isActive: boolean
  ): void {
    // Find all ha-icon elements that might be associated with this entity
    const allSearchRoots = [
      document,
      document.body,
      (this as any).shadowRoot,
      (this as any).renderRoot,
      ...Array.from(document.querySelectorAll('*'))
        .filter(el => el.shadowRoot)
        .map(el => el.shadowRoot!),
    ].filter(Boolean);

    allSearchRoots.forEach((root, index) => {
      try {
        const allIcons = root.querySelectorAll('ha-icon');

        allIcons.forEach((icon: HTMLElement) => {
          // Only touch icons that are meant to use this animation. Each icon tells us
          // what it *should* be running through the data-animation-debug attribute that
          // we set when rendering.
          const desiredClass = icon.getAttribute('data-animation-debug') || '';

          // Skip if this icon isn't the one we're currently updating. This prevents one
          // icon's update from unintentionally overwriting every other icon's animation.
          if (desiredClass !== newAnimationClass) {
            return;
          }

          // Remove any previous animation classes so we start clean.
          const currentClasses = icon.className.split(' ');
          const filteredClasses = currentClasses.filter(cls => !cls.startsWith('icon-animation-'));

          // Add the new animation class when applicable.
          if (newAnimationClass && !newAnimationClass.includes('none')) {
            filteredClasses.push(newAnimationClass);
          }

          // Update the class list in one shot.
          icon.className = filteredClasses.join(' ');

          // Provide an inline fallback as well (helps inside deep shadow DOMs).
          const animKey = newAnimationClass.replace('icon-animation-', ''); // e.g., rotate-left -> rotateLeft
          if (animKey && animKey !== 'none') {
            const keyframeName =
              'icon' +
              animKey
                .split('-')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');

            const timing =
              animKey.includes('spin') || animKey.includes('rotate')
                ? '2s linear infinite'
                : '1s ease-in-out infinite';

            (icon.style as any).animation = `${keyframeName} ${timing}`;
          } else {
            (icon.style as any).animation = '';
          }

          // Make sure keyframes exist inside this ha-icon's shadow root so the
          // animation actually plays.
          this._injectKeyframesIntoHaIcon(icon);

          // Force a reflow so that the browser notices the new animation.
          (icon as any).offsetHeight;
        });
      } catch (e) {
        // Silently handle animation errors
      }
    });
  }

  // Get inline animation string for a given animation class
  private _getInlineAnimation(animationClass: string): string {
    const animKey = animationClass.replace('icon-animation-', '');
    if (!animKey || animKey === 'none') return '';

    const keyframeName =
      'icon' +
      animKey
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    const timing =
      animKey.includes('spin') || animKey.includes('rotate')
        ? '2s linear infinite'
        : animKey === 'bounce'
          ? '1s ease-in-out infinite'
          : animKey === 'shake'
            ? '0.5s ease-in-out infinite'
            : animKey === 'vibrate'
              ? '0.3s ease-in-out infinite'
              : '2s ease-in-out infinite';

    return `${keyframeName} ${timing}`;
  }

  // Apply animation directly to an icon element
  private _applyAnimationDirectly(iconEl: HTMLElement, animationClass: string): void {
    const animKey = animationClass.replace('icon-animation-', '');
    if (!animKey || animKey === 'none') return;

    // Generate keyframe name
    const keyframeName =
      'icon' +
      animKey
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    // Apply timing
    const timing =
      animKey.includes('spin') || animKey.includes('rotate')
        ? '2s linear infinite'
        : '2s ease-in-out infinite';

    // Set inline style
    (iconEl.style as any).animation = `${keyframeName} ${timing}`;

    // Also inject keyframes
    this._injectKeyframesIntoHaIcon(iconEl);
  }

  // Inject keyframes into ha-icon shadowRoot so animations work inside dialog previews
  private _injectKeyframesForAllSplitPreviewIcons(): void {
    // Use multiple attempts with different strategies to find and inject keyframes
    const attemptInjection = (attempt: number = 1) => {
      // Strategy 1: Find ALL ha-icon elements with animation data attributes
      const allAnimatedIcons = document.querySelectorAll(
        'ha-icon[data-animation-debug]:not([data-animation-debug="none"])'
      );

      // Strategy 2: Also search within all shadow roots for nested ha-icons
      const allShadowRoots = [
        ...Array.from(document.querySelectorAll('*'))
          .filter(el => el.shadowRoot)
          .map(el => el.shadowRoot!),
      ];

      // Convert NodeList to Array so we can push to it
      const iconsArray = Array.from(allAnimatedIcons);

      allShadowRoots.forEach(shadowRoot => {
        const nestedIcons = shadowRoot.querySelectorAll(
          'ha-icon[data-animation-debug]:not([data-animation-debug="none"])'
        );
        nestedIcons.forEach(icon => iconsArray.push(icon));
      });

      let injected = 0;
      iconsArray.forEach(icon => {
        this._injectKeyframesIntoHaIcon(icon as HTMLElement);
        injected++;
      });

      // If no icons found and we haven't tried too many times, try again
      if (injected === 0 && attempt < 10) {
        setTimeout(() => attemptInjection(attempt + 1), 150);
      }
    };

    attemptInjection();
  }

  /**
   * Format entity state value with units if show_units is enabled
   */
  private _formatValueWithUnits(
    value: string,
    entityId: string,
    icon: IconConfig,
    hass: HomeAssistant
  ): string {
    // Respect entity display precision; include unit only if enabled
    if (!entityId || !hass?.states?.[entityId]) return value;
    return formatEntityState(hass, entityId, {
      state: value,
      includeUnit: icon.show_units !== false,
    });
  }

  /**
   * Extract color from entity state attributes
   */
  private _getEntityStateColor(entityState: any): string | null {
    if (!entityState || !entityState.attributes) return null;

    // Check for RGB color attributes (most common for lights)
    if (entityState.attributes.rgb_color && Array.isArray(entityState.attributes.rgb_color)) {
      return `rgb(${entityState.attributes.rgb_color.join(',')})`;
    }

    // Check for HS color attributes and convert to RGB
    if (entityState.attributes.hs_color && Array.isArray(entityState.attributes.hs_color)) {
      const [h, s] = entityState.attributes.hs_color;
      const rgb = this._hsToRgb(h / 360, s / 100, 1);
      return `rgb(${rgb.join(',')})`;
    }

    // Check for color name attribute
    if (entityState.attributes.color_name) {
      return entityState.attributes.color_name;
    }

    // Check for hex color attribute
    if (entityState.attributes.color && typeof entityState.attributes.color === 'string') {
      return entityState.attributes.color;
    }

    // For binary sensors or switches, use state-based colors
    if (entityState.entity_id) {
      const domain = entityState.entity_id.split('.')[0];
      if (domain === 'binary_sensor' || domain === 'switch') {
        return entityState.state === 'on' ? '#4CAF50' : '#F44336'; // Green for on, red for off
      }
    }

    return null;
  }

  /**
   * Convert HSV to RGB
   */
  private _hsToRgb(h: number, s: number, v: number): number[] {
    let r: number, g: number, b: number;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
      default:
        r = g = b = 0;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  private _injectKeyframesIntoHaIcon(iconEl: HTMLElement): void {
    const sr = (iconEl as any).shadowRoot as ShadowRoot | undefined;
    if (!sr) {
      return;
    }

    // Always inject fresh keyframes (remove existing first)
    const existingStyle = sr.querySelector('style[data-uvc-keyframes]');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Inject fresh keyframes
    try {
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-uvc-keyframes', '');
      styleEl.textContent = UltraIconModule._ANIMATION_KEYFRAMES;
      sr.appendChild(styleEl);

      // Also try injecting into document head as backup
      if (!document.head.querySelector('style[data-uvc-global-keyframes]')) {
        const globalStyle = document.createElement('style');
        globalStyle.setAttribute('data-uvc-global-keyframes', '');
        globalStyle.textContent = UltraIconModule._ANIMATION_KEYFRAMES;
        document.head.appendChild(globalStyle);
      }
    } catch (error) {
      console.error(`❌ Error injecting keyframes:`, error);
    }
  }
}

import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  PeopleModule,
  PeopleDataItem,
  PeopleLayoutStyle,
  PeopleDataItemType,
  UltraCardConfig,
} from '../types';
import { formatEntityState } from '../utils/number-format';
import { localize } from '../localize/localize';
import { getImageUrl } from '../utils/image-upload';
import '../components/ultra-color-picker';

/**
 * UltraPeopleModule - Display person entity information with customizable layouts
 *
 * Features:
 * - 6 layout styles: compact, banner, horizontal_compact, horizontal_detailed, header, music_overlay
 * - Drag-and-drop data items builder
 * - Avatar with dynamic status badge
 * - Support for battery, location, time info, media, sensors, device states, attributes
 * - Fully customizable styling
 */
export class UltraPeopleModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'people',
    title: 'People',
    description: 'Display person information with customizable data items',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:account',
    category: 'data',
    tags: ['people', 'person', 'presence', 'location', 'avatar', 'user'],
  };

  // Drag state for data items builder
  private _draggedItemIndex: number | null = null;
  private _dragOverIndex: number | null = null;

  createDefault(id?: string, hass?: HomeAssistant): PeopleModule {
    return {
      id: id || this.generateId('people'),
      type: 'people',
      person_entity: '',
      layout_style: 'compact',
      data_items: [
        {
          id: this.generateId('item'),
          type: 'location',
          show_icon: true,
          show_label: true,
          show_value: true,
          icon: 'mdi:map-marker',
          icon_color: 'var(--primary-color)',
        },
      ],
      avatar_settings: {
        size: 80,
        border_width: 3,
        border_color: 'var(--primary-color)',
        show_status_badge: true,
        status_badge_position: 'bottom-right',
        status_badge_home_color: '#4CAF50',
        status_badge_away_color: '#FF5722',
        use_state_color: true,
        state_home_color: '#4CAF50',
        state_away_color: '#FF5722',
        fallback_icon: 'mdi:account',
        show_entity_picture: true,
        image_fit: 'cover',
      },
      banner_settings: {
        background_type: 'gradient',
        gradient_start: '#667eea',
        gradient_end: '#764ba2',
        gradient_direction: 'to-bottom-right',
        background_blur: 0,
        background_opacity: 100,
        overlay_opacity: 30,
        banner_height: 120,
      },
      name_settings: {
        show: true,
        use_friendly_name: true,
        font_size: 18,
        font_weight: '600',
        color: 'var(--primary-text-color)',
        alignment: 'center',
      },
      location_settings: {
        show: true,
        show_icon: true,
        icon: 'mdi:map-marker',
        icon_color: 'var(--secondary-text-color)',
        font_size: 14,
        color: 'var(--secondary-text-color)',
        show_duration: false,
        duration_format: 'relative',
      },
      gap: 12,
      data_items_gap: 8,
      data_items_direction: 'column',
      alignment: 'center',
      vertical_alignment: 'center',
      header_show_badges: true,
      header_badges_position: 'top',
      music_show_progress: true,
      music_show_album_art: true,
      music_blur_background: true,
      music_album_blur: 5,
      music_album_opacity: 75,
      tap_action: { action: 'more-info' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  // ============================================
  // HELPER METHODS FOR LAYOUT-SPECIFIC DATA
  // ============================================

  /**
   * Get data items for a specific layout style
   * Falls back to the legacy data_items array if layout-specific items don't exist
   */
  private _getDataItemsForLayout(
    module: PeopleModule,
    layout?: PeopleLayoutStyle
  ): PeopleDataItem[] {
    const layoutStyle = layout || module.layout_style;
    const layoutKey = `data_items_${layoutStyle}` as keyof PeopleModule;
    const layoutItems = module[layoutKey] as PeopleDataItem[] | undefined;

    // Return layout-specific items if they exist, otherwise fall back to legacy data_items
    return layoutItems || module.data_items || [];
  }

  /**
   * Update data items for the current layout style
   */
  private _setDataItemsForLayout(
    module: PeopleModule,
    items: PeopleDataItem[],
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const layoutKey = `data_items_${module.layout_style}` as keyof PeopleModule;
    updateModule({ [layoutKey]: items } as Partial<CardModule>);
  }

  // ============================================
  // GENERAL TAB RENDERING
  // ============================================

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const peopleModule = module as PeopleModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this._getEditorStyles()}
      </style>
      <div class="module-general-settings">
        <!-- Person Entity Selection -->
        ${this._renderPersonEntitySection(peopleModule, hass, updateModule, lang)}

        <!-- Layout Style Selection -->
        ${this._renderLayoutStyleSection(peopleModule, hass, updateModule, lang)}

        <!-- Avatar Settings -->
        ${this._renderAvatarSettingsSection(peopleModule, hass, updateModule, lang)}

        <!-- Banner Settings (show only for banner layout) -->
        ${peopleModule.layout_style === 'banner'
          ? this._renderBannerSettingsSection(peopleModule, hass, updateModule, lang)
          : ''}

        <!-- Music Settings (show only for music_overlay layout) -->
        ${peopleModule.layout_style === 'music_overlay'
          ? this._renderMusicSettingsSection(peopleModule, hass, updateModule, lang)
          : ''}

        <!-- Name Settings -->
        ${this._renderNameSettingsSection(peopleModule, hass, updateModule, lang)}

        <!-- Data Items Builder -->
        ${this._renderDataItemsBuilder(peopleModule, hass, config, updateModule, lang)}

        <!-- Associated Entities (show for layouts that use them) -->
        ${['banner', 'music_overlay', 'horizontal_detailed'].includes(peopleModule.layout_style)
          ? this._renderAssociatedEntitiesSection(peopleModule, hass, updateModule, lang)
          : ''}

        <!-- Layout & Spacing -->
        ${this._renderLayoutSpacingSection(peopleModule, hass, updateModule, lang)}
      </div>
    `;
  }

  // ============================================
  // SECTION RENDERERS
  // ============================================

  private _renderPersonEntitySection(
    module: PeopleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.modules.people.person_entity', lang, 'Person Entity')}
        </div>
        <div class="section-description">
          ${localize(
            'editor.modules.people.person_entity_desc',
            lang,
            'Select the person entity to display'
          )}
        </div>
        <ha-form
          .hass=${hass}
          .data=${{ entity: module.person_entity || '' }}
          .schema=${[
            {
              name: 'entity',
              label: localize('editor.modules.people.person', lang, 'Person'),
              selector: { entity: { domain: 'person' } },
            },
          ]}
          .computeLabel=${(schema: any) => schema.label || schema.name}
          @value-changed=${(e: CustomEvent) => {
            const entity = e.detail.value.entity;
            if (entity !== module.person_entity) {
              updateModule({ person_entity: entity });
              this.triggerPreviewUpdate();
            }
          }}
        ></ha-form>
      </div>
    `;
  }

  private _renderLayoutStyleSection(
    module: PeopleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const layoutStyles: { value: PeopleLayoutStyle; label: string; icon: string }[] = [
      { value: 'compact', label: 'Compact Card', icon: 'mdi:card-account-details' },
      { value: 'banner', label: 'Banner', icon: 'mdi:image-area' },
      { value: 'horizontal_compact', label: 'Horizontal Compact', icon: 'mdi:view-sequential' },
      { value: 'horizontal_detailed', label: 'Horizontal Detailed', icon: 'mdi:view-list' },
      { value: 'header', label: 'Header', icon: 'mdi:page-layout-header' },
      { value: 'music_overlay', label: 'Music Overlay', icon: 'mdi:music' },
    ];

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.modules.people.layout_style', lang, 'Layout Style')}
        </div>
        <div class="section-description">
          ${localize(
            'editor.modules.people.layout_style_desc',
            lang,
            'Choose how the person information is displayed'
          )}
        </div>
        <div class="layout-style-grid">
          ${layoutStyles.map(
            style => html`
              <div
                class="layout-style-option ${module.layout_style === style.value ? 'selected' : ''}"
                @click=${() => {
                  updateModule({ layout_style: style.value });
                  this.triggerPreviewUpdate();
                }}
              >
                <ha-icon icon="${style.icon}"></ha-icon>
                <span>${style.label}</span>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _renderAvatarSettingsSection(
    module: PeopleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const avatarSettings = module.avatar_settings || this.createDefault().avatar_settings;

    // Determine which layouts use badges
    const layoutUsesBadges = ['banner', 'horizontal_detailed', 'header', 'music_overlay'].includes(
      module.layout_style
    );

    // Build schema dynamically based on layout
    const visibilitySchema = [
      {
        name: 'show_avatar',
        label: localize('editor.modules.people.show_avatar', lang, 'Show Avatar'),
        selector: { boolean: {} },
      },
    ];

    if (layoutUsesBadges) {
      visibilitySchema.push(
        {
          name: 'show_location_badge',
          label: localize('editor.modules.people.show_location_badge', lang, 'Show Location Badge'),
          selector: { boolean: {} },
        },
        {
          name: 'show_battery_badge',
          label: localize('editor.modules.people.show_battery_badge', lang, 'Show Battery Badge'),
          selector: { boolean: {} },
        }
      );
    }

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.modules.people.avatar_settings', lang, 'Avatar Settings')}
        </div>

        <!-- Element Visibility Toggles -->
        <div class="field-container">
          <ha-form
            .hass=${hass}
            .data=${{
              show_avatar: module.show_avatar !== false,
              ...(layoutUsesBadges
                ? {
                    show_location_badge: module.show_location_badge !== false,
                    show_battery_badge: module.show_battery_badge !== false,
                  }
                : {}),
            }}
            .schema=${visibilitySchema}
            .computeLabel=${(schema: any) => schema.label}
            .computeDescription=${(schema: any) => schema.description}
            @value-changed=${(e: CustomEvent) => {
              updateModule(e.detail.value);
              this.triggerPreviewUpdate();
            }}
          ></ha-form>
        </div>

        <!-- Avatar Size -->
        <div class="field-container">
          <div class="field-title">
            ${localize('editor.modules.people.avatar_size', lang, 'Avatar Size')}
          </div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="40"
              max="200"
              step="4"
              .value="${avatarSettings.size}"
              @input=${(e: Event) => {
                const size = Number((e.target as HTMLInputElement).value);
                updateModule({
                  avatar_settings: { ...avatarSettings, size },
                });
                this.triggerPreviewUpdate();
              }}
            />
            <input
              type="number"
              class="range-input"
              min="40"
              max="200"
              step="4"
              .value="${avatarSettings.size}"
              @input=${(e: Event) => {
                const size = Number((e.target as HTMLInputElement).value);
                if (!isNaN(size)) {
                  updateModule({
                    avatar_settings: { ...avatarSettings, size },
                  });
                  this.triggerPreviewUpdate();
                }
              }}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const currentValue = avatarSettings.size || 80;
                  const increment = e.key === 'ArrowUp' ? 4 : -4;
                  const newValue = Math.max(40, Math.min(200, currentValue + increment));
                  updateModule({
                    avatar_settings: { ...avatarSettings, size: newValue },
                  });
                  this.triggerPreviewUpdate();
                }
              }}
            />
            <button
              class="range-reset-btn"
              @click=${() => {
                updateModule({
                  avatar_settings: { ...avatarSettings, size: 80 },
                });
                this.triggerPreviewUpdate();
              }}
              title="Reset to default (80px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Border Width -->
        <div class="field-container">
          <div class="field-title">
            ${localize('editor.modules.people.border_width', lang, 'Border Width')}
          </div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="10"
              step="1"
              .value="${avatarSettings.border_width}"
              @input=${(e: Event) => {
                const border_width = Number((e.target as HTMLInputElement).value);
                updateModule({
                  avatar_settings: { ...avatarSettings, border_width },
                });
                this.triggerPreviewUpdate();
              }}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="20"
              step="1"
              .value="${avatarSettings.border_width}"
              @input=${(e: Event) => {
                const border_width = Number((e.target as HTMLInputElement).value);
                if (!isNaN(border_width)) {
                  updateModule({
                    avatar_settings: { ...avatarSettings, border_width },
                  });
                  this.triggerPreviewUpdate();
                }
              }}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const currentValue = avatarSettings.border_width || 3;
                  const increment = e.key === 'ArrowUp' ? 1 : -1;
                  const newValue = Math.max(0, Math.min(20, currentValue + increment));
                  updateModule({
                    avatar_settings: { ...avatarSettings, border_width: newValue },
                  });
                  this.triggerPreviewUpdate();
                }
              }}
            />
            <button
              class="range-reset-btn"
              @click=${() => {
                updateModule({
                  avatar_settings: { ...avatarSettings, border_width: 3 },
                });
                this.triggerPreviewUpdate();
              }}
              title="Reset to default (3px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Use State Color -->
        <div class="field-container">
          <ha-form
            .hass=${hass}
            .data=${{ use_state_color: avatarSettings.use_state_color !== false }}
            .schema=${[
              {
                name: 'use_state_color',
                label: localize(
                  'editor.modules.people.use_state_color',
                  lang,
                  'Use State-Based Border Color'
                ),
                description: localize(
                  'editor.modules.people.use_state_color_desc',
                  lang,
                  'Change border color based on home/away status'
                ),
                selector: { boolean: {} },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label}
            .computeDescription=${(schema: any) => schema.description}
            @value-changed=${(e: CustomEvent) => {
              updateModule({
                avatar_settings: {
                  ...avatarSettings,
                  use_state_color: e.detail.value.use_state_color,
                },
              });
              this.triggerPreviewUpdate();
            }}
          ></ha-form>
        </div>

        ${avatarSettings.use_state_color
          ? html`
              <div class="color-row">
                <div class="color-field">
                  <div class="field-title">
                    ${localize('editor.modules.people.home_color', lang, 'Home Color')}
                  </div>
                  <ultra-color-picker
                    .value=${avatarSettings.state_home_color || '#4CAF50'}
                    .defaultValue=${'#4CAF50'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      updateModule({
                        avatar_settings: {
                          ...avatarSettings,
                          state_home_color: e.detail.value,
                        },
                      });
                      this.triggerPreviewUpdate();
                    }}
                  ></ultra-color-picker>
                </div>
                <div class="color-field">
                  <div class="field-title">
                    ${localize('editor.modules.people.away_color', lang, 'Away Color')}
                  </div>
                  <ultra-color-picker
                    .value=${avatarSettings.state_away_color || '#FF5722'}
                    .defaultValue=${'#FF5722'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      updateModule({
                        avatar_settings: {
                          ...avatarSettings,
                          state_away_color: e.detail.value,
                        },
                      });
                      this.triggerPreviewUpdate();
                    }}
                  ></ultra-color-picker>
                </div>
              </div>
            `
          : html`
              <div class="field-container">
                <div class="field-title">
                  ${localize('editor.modules.people.border_color', lang, 'Border Color')}
                </div>
                <ultra-color-picker
                  .value=${avatarSettings.border_color || 'var(--primary-color)'}
                  .defaultValue=${'var(--primary-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({
                      avatar_settings: {
                        ...avatarSettings,
                        border_color: e.detail.value,
                      },
                    });
                    this.triggerPreviewUpdate();
                  }}
                ></ultra-color-picker>
              </div>
            `}

        <!-- Status Badge -->
        <div class="field-container">
          <ha-form
            .hass=${hass}
            .data=${{ show_status_badge: avatarSettings.show_status_badge !== false }}
            .schema=${[
              {
                name: 'show_status_badge',
                label: localize(
                  'editor.modules.people.show_status_badge',
                  lang,
                  'Show Status Badge'
                ),
                description: localize(
                  'editor.modules.people.show_status_badge_desc',
                  lang,
                  'Show home/away indicator on avatar'
                ),
                selector: { boolean: {} },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label}
            .computeDescription=${(schema: any) => schema.description}
            @value-changed=${(e: CustomEvent) => {
              updateModule({
                avatar_settings: {
                  ...avatarSettings,
                  show_status_badge: e.detail.value.show_status_badge,
                },
              });
              this.triggerPreviewUpdate();
            }}
          ></ha-form>
        </div>

        ${avatarSettings.show_status_badge
          ? html`
              <div class="field-container">
                <div class="field-title">
                  ${localize('editor.modules.people.badge_position', lang, 'Badge Position')}
                </div>
                <div class="position-grid">
                  ${(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(
                    pos => html`
                      <div
                        class="position-option ${avatarSettings.status_badge_position === pos
                          ? 'selected'
                          : ''}"
                        @click=${() => {
                          updateModule({
                            avatar_settings: {
                              ...avatarSettings,
                              status_badge_position: pos,
                            },
                          });
                          this.triggerPreviewUpdate();
                        }}
                      >
                        ${pos.replace('-', ' ')}
                      </div>
                    `
                  )}
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _renderBannerSettingsSection(
    module: PeopleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const bannerSettings = module.banner_settings || this.createDefault().banner_settings!;

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.modules.people.banner_settings', lang, 'Banner Settings')}
        </div>

        <!-- Background Type -->
        <div class="field-container">
          <div class="field-title">
            ${localize('editor.modules.people.background_type', lang, 'Background Type')}
          </div>
          <div class="button-group">
            ${(['image', 'gradient', 'color', 'entity'] as const).map(
              type => html`
                <button
                  class="option-btn ${bannerSettings.background_type === type ? 'active' : ''}"
                  @click=${() => {
                    updateModule({
                      banner_settings: { ...bannerSettings, background_type: type },
                    });
                    this.triggerPreviewUpdate();
                  }}
                >
                  ${type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              `
            )}
          </div>
        </div>

        ${bannerSettings.background_type === 'image'
          ? html`
              <div class="field-container">
                <ha-form
                  .hass=${hass}
                  .data=${{ image: bannerSettings.background_image || '' }}
                  .schema=${[
                    {
                      name: 'image',
                      label: localize('editor.modules.people.background_image', lang, 'Image URL'),
                      selector: { text: {} },
                    },
                  ]}
                  .computeLabel=${(schema: any) => schema.label}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({
                      banner_settings: {
                        ...bannerSettings,
                        background_image: e.detail.value.image,
                      },
                    });
                    this.triggerPreviewUpdate();
                  }}
                ></ha-form>
              </div>
            `
          : ''}
        ${bannerSettings.background_type === 'gradient'
          ? html`
              <div class="color-row">
                <div class="color-field">
                  <div class="field-title">Start Color</div>
                  <ultra-color-picker
                    .value=${bannerSettings.gradient_start || '#667eea'}
                    .defaultValue=${'#667eea'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      updateModule({
                        banner_settings: {
                          ...bannerSettings,
                          gradient_start: e.detail.value,
                        },
                      });
                      this.triggerPreviewUpdate();
                    }}
                  ></ultra-color-picker>
                </div>
                <div class="color-field">
                  <div class="field-title">End Color</div>
                  <ultra-color-picker
                    .value=${bannerSettings.gradient_end || '#764ba2'}
                    .defaultValue=${'#764ba2'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      updateModule({
                        banner_settings: {
                          ...bannerSettings,
                          gradient_end: e.detail.value,
                        },
                      });
                      this.triggerPreviewUpdate();
                    }}
                  ></ultra-color-picker>
                </div>
              </div>
            `
          : ''}
        ${bannerSettings.background_type === 'color'
          ? html`
              <div class="field-container">
                <div class="field-title">Background Color</div>
                <ultra-color-picker
                  .value=${bannerSettings.background_color || '#667eea'}
                  .defaultValue=${'#667eea'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({
                      banner_settings: {
                        ...bannerSettings,
                        background_color: e.detail.value,
                      },
                    });
                    this.triggerPreviewUpdate();
                  }}
                ></ultra-color-picker>
              </div>
            `
          : ''}
        ${bannerSettings.background_type === 'entity'
          ? html`
              <div class="field-container">
                <ha-form
                  .hass=${hass}
                  .data=${{ entity: bannerSettings.background_entity || '' }}
                  .schema=${[
                    {
                      name: 'entity',
                      label: localize(
                        'editor.modules.people.background_entity',
                        lang,
                        'Entity with Picture'
                      ),
                      selector: { entity: {} },
                    },
                  ]}
                  .computeLabel=${(schema: any) => schema.label}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({
                      banner_settings: {
                        ...bannerSettings,
                        background_entity: e.detail.value.entity,
                      },
                    });
                    this.triggerPreviewUpdate();
                  }}
                ></ha-form>
              </div>
            `
          : ''}

        <!-- Banner Height -->
        <div class="field-container">
          <div class="field-title">
            ${localize('editor.modules.people.banner_height', lang, 'Banner Height')}
          </div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="60"
              max="300"
              step="10"
              .value="${bannerSettings.banner_height || 120}"
              @input=${(e: Event) => {
                const banner_height = Number((e.target as HTMLInputElement).value);
                updateModule({
                  banner_settings: { ...bannerSettings, banner_height },
                });
                this.triggerPreviewUpdate();
              }}
            />
            <input
              type="number"
              class="range-input"
              min="60"
              max="400"
              step="10"
              .value="${bannerSettings.banner_height || 120}"
              @input=${(e: Event) => {
                const banner_height = Number((e.target as HTMLInputElement).value);
                if (!isNaN(banner_height)) {
                  updateModule({
                    banner_settings: { ...bannerSettings, banner_height },
                  });
                  this.triggerPreviewUpdate();
                }
              }}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const currentValue = bannerSettings.banner_height || 120;
                  const increment = e.key === 'ArrowUp' ? 10 : -10;
                  const newValue = Math.max(60, Math.min(400, currentValue + increment));
                  updateModule({
                    banner_settings: { ...bannerSettings, banner_height: newValue },
                  });
                  this.triggerPreviewUpdate();
                }
              }}
            />
            <button
              class="range-reset-btn"
              @click=${() => {
                updateModule({
                  banner_settings: { ...bannerSettings, banner_height: 120 },
                });
                this.triggerPreviewUpdate();
              }}
              title="Reset to default (120px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Blur Amount -->
        <div class="field-container">
          <div class="field-title">
            ${localize('editor.modules.people.blur_amount', lang, 'Blur Amount')}
          </div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="20"
              step="1"
              .value="${bannerSettings.background_blur || 0}"
              @input=${(e: Event) => {
                const background_blur = Number((e.target as HTMLInputElement).value);
                updateModule({
                  banner_settings: { ...bannerSettings, background_blur },
                });
                this.triggerPreviewUpdate();
              }}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="30"
              step="1"
              .value="${bannerSettings.background_blur || 0}"
              @input=${(e: Event) => {
                const background_blur = Number((e.target as HTMLInputElement).value);
                if (!isNaN(background_blur)) {
                  updateModule({
                    banner_settings: { ...bannerSettings, background_blur },
                  });
                  this.triggerPreviewUpdate();
                }
              }}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const currentValue = bannerSettings.background_blur || 0;
                  const increment = e.key === 'ArrowUp' ? 1 : -1;
                  const newValue = Math.max(0, Math.min(30, currentValue + increment));
                  updateModule({
                    banner_settings: { ...bannerSettings, background_blur: newValue },
                  });
                  this.triggerPreviewUpdate();
                }
              }}
            />
            <button
              class="range-reset-btn"
              @click=${() => {
                updateModule({
                  banner_settings: { ...bannerSettings, background_blur: 0 },
                });
                this.triggerPreviewUpdate();
              }}
              title="Reset to default (0px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Banner Border Radius -->
        <div class="field-container">
          <div class="field-title-row">
            <span class="field-title">
              ${localize(
                'editor.modules.people.banner_border_radius',
                lang,
                'Banner Border Radius'
              )}
            </span>
            <button
              class="link-corners-btn ${bannerSettings.corners_linked !== false ? 'linked' : ''}"
              @click=${() => {
                const newLinked = bannerSettings.corners_linked === false;
                if (newLinked) {
                  // When linking, set all corners to the current border_radius value
                  const radius = bannerSettings.border_radius || 0;
                  updateModule({
                    banner_settings: {
                      ...bannerSettings,
                      corners_linked: true,
                      border_radius_top_left: radius,
                      border_radius_top_right: radius,
                      border_radius_bottom_left: radius,
                      border_radius_bottom_right: radius,
                    },
                  });
                } else {
                  updateModule({
                    banner_settings: { ...bannerSettings, corners_linked: false },
                  });
                }
                this.triggerPreviewUpdate();
              }}
              title="${bannerSettings.corners_linked !== false
                ? 'Unlink corners'
                : 'Link all corners'}"
            >
              <ha-icon
                icon="${bannerSettings.corners_linked !== false ? 'mdi:link' : 'mdi:link-off'}"
              ></ha-icon>
            </button>
          </div>

          ${bannerSettings.corners_linked !== false
            ? html`
                <!-- All corners linked - single slider -->
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="0"
                    max="48"
                    step="1"
                    value="${bannerSettings.border_radius || 0}"
                    @input=${(e: Event) => {
                      const radius = Number((e.target as HTMLInputElement).value);
                      updateModule({
                        banner_settings: {
                          ...bannerSettings,
                          border_radius: radius,
                          border_radius_top_left: radius,
                          border_radius_top_right: radius,
                          border_radius_bottom_left: radius,
                          border_radius_bottom_right: radius,
                        },
                      });
                      this.triggerPreviewUpdate();
                    }}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="0"
                    max="48"
                    step="1"
                    value="${bannerSettings.border_radius || 0}"
                    @input=${(e: Event) => {
                      const radius = Number((e.target as HTMLInputElement).value);
                      if (!isNaN(radius)) {
                        updateModule({
                          banner_settings: {
                            ...bannerSettings,
                            border_radius: radius,
                            border_radius_top_left: radius,
                            border_radius_top_right: radius,
                            border_radius_bottom_left: radius,
                            border_radius_bottom_right: radius,
                          },
                        });
                        this.triggerPreviewUpdate();
                      }
                    }}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${() => {
                      updateModule({
                        banner_settings: {
                          ...bannerSettings,
                          border_radius: 0,
                          border_radius_top_left: 0,
                          border_radius_top_right: 0,
                          border_radius_bottom_left: 0,
                          border_radius_bottom_right: 0,
                        },
                      });
                      this.triggerPreviewUpdate();
                    }}
                    title="Reset to 0"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              `
            : html`
                <!-- Individual corner controls -->
                <div class="corner-radius-grid">
                  <!-- Top Left -->
                  <div class="corner-control top-left">
                    <span class="corner-label">TL</span>
                    <input
                      type="number"
                      class="corner-input"
                      min="0"
                      max="48"
                      value="${bannerSettings.border_radius_top_left ??
                      bannerSettings.border_radius ??
                      0}"
                      @input=${(e: Event) => {
                        const value = Number((e.target as HTMLInputElement).value);
                        if (!isNaN(value)) {
                          updateModule({
                            banner_settings: { ...bannerSettings, border_radius_top_left: value },
                          });
                          this.triggerPreviewUpdate();
                        }
                      }}
                    />
                  </div>
                  <!-- Top Right -->
                  <div class="corner-control top-right">
                    <span class="corner-label">TR</span>
                    <input
                      type="number"
                      class="corner-input"
                      min="0"
                      max="48"
                      value="${bannerSettings.border_radius_top_right ??
                      bannerSettings.border_radius ??
                      0}"
                      @input=${(e: Event) => {
                        const value = Number((e.target as HTMLInputElement).value);
                        if (!isNaN(value)) {
                          updateModule({
                            banner_settings: { ...bannerSettings, border_radius_top_right: value },
                          });
                          this.triggerPreviewUpdate();
                        }
                      }}
                    />
                  </div>
                  <!-- Bottom Left -->
                  <div class="corner-control bottom-left">
                    <span class="corner-label">BL</span>
                    <input
                      type="number"
                      class="corner-input"
                      min="0"
                      max="48"
                      value="${bannerSettings.border_radius_bottom_left ??
                      bannerSettings.border_radius ??
                      0}"
                      @input=${(e: Event) => {
                        const value = Number((e.target as HTMLInputElement).value);
                        if (!isNaN(value)) {
                          updateModule({
                            banner_settings: {
                              ...bannerSettings,
                              border_radius_bottom_left: value,
                            },
                          });
                          this.triggerPreviewUpdate();
                        }
                      }}
                    />
                  </div>
                  <!-- Bottom Right -->
                  <div class="corner-control bottom-right">
                    <span class="corner-label">BR</span>
                    <input
                      type="number"
                      class="corner-input"
                      min="0"
                      max="48"
                      value="${bannerSettings.border_radius_bottom_right ??
                      bannerSettings.border_radius ??
                      0}"
                      @input=${(e: Event) => {
                        const value = Number((e.target as HTMLInputElement).value);
                        if (!isNaN(value)) {
                          updateModule({
                            banner_settings: {
                              ...bannerSettings,
                              border_radius_bottom_right: value,
                            },
                          });
                          this.triggerPreviewUpdate();
                        }
                      }}
                    />
                  </div>
                </div>
              `}
        </div>
      </div>
    `;
  }

  private _renderMusicSettingsSection(
    module: PeopleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.modules.people.music_settings', lang, 'Music Settings')}
        </div>
        <div class="section-description">
          ${localize(
            'editor.modules.people.music_settings_desc',
            lang,
            'Configure music/media display options'
          )}
        </div>

        <!-- Music Toggles -->
        <ha-form
          .hass=${hass}
          .data=${{
            music_show_progress: module.music_show_progress !== false,
            music_show_album_art: module.music_show_album_art !== false,
            music_blur_background: module.music_blur_background !== false,
          }}
          .schema=${[
            { name: 'music_show_progress', label: 'Show Progress Bar', selector: { boolean: {} } },
            { name: 'music_show_album_art', label: 'Show Album Art', selector: { boolean: {} } },
            { name: 'music_blur_background', label: 'Blur Background', selector: { boolean: {} } },
          ]}
          .computeLabel=${(schema: any) => schema.label}
          @value-changed=${(e: CustomEvent) => {
            updateModule(e.detail.value);
            this.triggerPreviewUpdate();
          }}
        ></ha-form>

        <!-- Album Art Blur Amount -->
        <div class="field-container">
          <div class="field-title">Album Art Blur</div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="20"
              step="1"
              value="${module.music_album_blur ?? 5}"
              @input=${(e: Event) => {
                const value = Number((e.target as HTMLInputElement).value);
                updateModule({ music_album_blur: value });
                this.triggerPreviewUpdate();
              }}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="20"
              step="1"
              value="${module.music_album_blur ?? 5}"
              @input=${(e: Event) => {
                const value = Number((e.target as HTMLInputElement).value);
                if (!isNaN(value)) {
                  updateModule({ music_album_blur: value });
                  this.triggerPreviewUpdate();
                }
              }}
            />
            <button
              class="range-reset-btn"
              @click=${() => {
                updateModule({ music_album_blur: 5 });
                this.triggerPreviewUpdate();
              }}
              title="Reset to default (5px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Album Art Opacity -->
        <div class="field-container">
          <div class="field-title">Album Art Opacity</div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="100"
              step="5"
              value="${module.music_album_opacity ?? 75}"
              @input=${(e: Event) => {
                const value = Number((e.target as HTMLInputElement).value);
                updateModule({ music_album_opacity: value });
                this.triggerPreviewUpdate();
              }}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="100"
              step="5"
              value="${module.music_album_opacity ?? 75}"
              @input=${(e: Event) => {
                const value = Number((e.target as HTMLInputElement).value);
                if (!isNaN(value)) {
                  updateModule({ music_album_opacity: value });
                  this.triggerPreviewUpdate();
                }
              }}
            />
            <button
              class="range-reset-btn"
              @click=${() => {
                updateModule({ music_album_opacity: 75 });
                this.triggerPreviewUpdate();
              }}
              title="Reset to default (75%)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Media Player Entity -->
        <div class="field-container">
          <div class="field-title">Media Player Entity</div>
          <ha-form
            .hass=${hass}
            .data=${{ entity: module.media_player_entity || '' }}
            .schema=${[
              {
                name: 'entity',
                label: 'Media Player',
                selector: { entity: { domain: 'media_player' } },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label}
            @value-changed=${(e: CustomEvent) => {
              updateModule({ media_player_entity: e.detail.value.entity });
              this.triggerPreviewUpdate();
            }}
          ></ha-form>
        </div>
      </div>
    `;
  }

  private _renderNameSettingsSection(
    module: PeopleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const nameSettings = module.name_settings || this.createDefault().name_settings;

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.modules.people.name_settings', lang, 'Name Settings')}
        </div>

        <!-- Show Name -->
        <div class="field-container">
          <ha-form
            .hass=${hass}
            .data=${{ show_name: nameSettings.show !== false }}
            .schema=${[
              {
                name: 'show_name',
                label: localize('editor.modules.people.show_name', lang, 'Show Name'),
                selector: { boolean: {} },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label}
            @value-changed=${(e: CustomEvent) => {
              updateModule({
                name_settings: { ...nameSettings, show: e.detail.value.show_name },
              });
              this.triggerPreviewUpdate();
            }}
          ></ha-form>
        </div>

        ${nameSettings.show
          ? html`
              <!-- Custom Name -->
              <div class="field-container">
                <ha-form
                  .hass=${hass}
                  .data=${{ custom_name: nameSettings.custom_name || '' }}
                  .schema=${[
                    {
                      name: 'custom_name',
                      label: localize(
                        'editor.modules.people.custom_name',
                        lang,
                        'Custom Name (leave empty to use friendly name)'
                      ),
                      selector: { text: {} },
                    },
                  ]}
                  .computeLabel=${(schema: any) => schema.label}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({
                      name_settings: {
                        ...nameSettings,
                        custom_name: e.detail.value.custom_name,
                      },
                    });
                    this.triggerPreviewUpdate();
                  }}
                ></ha-form>
              </div>

              <!-- Font Size -->
              <div class="field-container">
                <div class="field-title">
                  ${localize('editor.modules.people.name_font_size', lang, 'Font Size')}
                </div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="12"
                    max="36"
                    step="1"
                    .value="${nameSettings.font_size}"
                    @input=${(e: Event) => {
                      const font_size = Number((e.target as HTMLInputElement).value);
                      updateModule({
                        name_settings: { ...nameSettings, font_size },
                      });
                      this.triggerPreviewUpdate();
                    }}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="12"
                    max="48"
                    step="1"
                    .value="${nameSettings.font_size}"
                    @input=${(e: Event) => {
                      const font_size = Number((e.target as HTMLInputElement).value);
                      if (!isNaN(font_size)) {
                        updateModule({
                          name_settings: { ...nameSettings, font_size },
                        });
                        this.triggerPreviewUpdate();
                      }
                    }}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const currentValue = nameSettings.font_size || 18;
                        const increment = e.key === 'ArrowUp' ? 1 : -1;
                        const newValue = Math.max(12, Math.min(48, currentValue + increment));
                        updateModule({
                          name_settings: { ...nameSettings, font_size: newValue },
                        });
                        this.triggerPreviewUpdate();
                      }
                    }}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${() => {
                      updateModule({
                        name_settings: { ...nameSettings, font_size: 18 },
                      });
                      this.triggerPreviewUpdate();
                    }}
                    title="Reset to default (18px)"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              <!-- Name Color -->
              <div class="field-container">
                <div class="field-title">
                  ${localize('editor.modules.people.name_color', lang, 'Name Color')}
                </div>
                <ultra-color-picker
                  .value=${nameSettings.color || 'var(--primary-text-color)'}
                  .defaultValue=${'var(--primary-text-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({
                      name_settings: { ...nameSettings, color: e.detail.value },
                    });
                    this.triggerPreviewUpdate();
                  }}
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>
    `;
  }

  // ============================================
  // DATA ITEMS DRAG-AND-DROP BUILDER
  // ============================================

  private _renderDataItemsBuilder(
    module: PeopleModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    // Get data items for the current layout
    const dataItems = this._getDataItemsForLayout(module);

    return html`
      <div class="settings-section data-items-section">
        <div class="section-title">
          ${localize('editor.modules.people.data_items', lang, 'Data Items')}
          <span class="layout-badge">${module.layout_style}</span>
        </div>
        <div class="section-description">
          ${localize(
            'editor.modules.people.data_items_desc',
            lang,
            'Drag to reorder, click to configure'
          )}
          - Items are saved per layout style
        </div>

        <!-- Data Items List -->
        <div class="data-items-list">
          ${dataItems.map((item, index) =>
            this._renderDataItemRow(item, index, module, hass, config, updateModule, lang)
          )}
        </div>

        <!-- Add Data Item Button -->
        <div class="add-item-container">
          <div class="add-item-dropdown">
            <select
              class="add-item-select"
              @change=${(e: Event) => {
                const type = (e.target as HTMLSelectElement).value as PeopleDataItemType;
                if (type) {
                  this._addDataItem(module, type, updateModule);
                  (e.target as HTMLSelectElement).value = '';
                }
              }}
            >
              <option value="">
                ${localize('editor.modules.people.add_data_item', lang, '+ Add Data Item')}
              </option>
              <option value="location">Location</option>
              <option value="battery">Battery</option>
              <option value="time_info">Time Info</option>
              <option value="media">Media</option>
              <option value="sensor">Sensor</option>
              <option value="device_state">Device State</option>
              <option value="attribute">Attribute</option>
              <option value="toggle">Toggle</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  private _renderDataItemRow(
    item: PeopleDataItem,
    index: number,
    module: PeopleModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const itemTypeIcons: Record<PeopleDataItemType, string> = {
      location: 'mdi:map-marker',
      battery: 'mdi:battery',
      time_info: 'mdi:clock-outline',
      media: 'mdi:music',
      sensor: 'mdi:gauge',
      device_state: 'mdi:wifi',
      attribute: 'mdi:code-tags',
      toggle: 'mdi:toggle-switch',
    };

    const itemTypeLabels: Record<PeopleDataItemType, string> = {
      location: 'Location',
      battery: 'Battery',
      time_info: 'Time Info',
      media: 'Media',
      sensor: 'Sensor',
      device_state: 'Device State',
      attribute: 'Attribute',
      toggle: 'Toggle',
    };

    return html`
      <ha-expansion-panel
        .outlined=${true}
        class="data-item-panel ${this._draggedItemIndex === index ? 'dragging' : ''} ${this
          ._dragOverIndex === index
          ? 'drag-over'
          : ''}"
      >
        <div
          slot="header"
          class="data-item-header"
          draggable="true"
          @dragstart=${(e: DragEvent) => this._onDataItemDragStart(e, index)}
          @dragover=${(e: DragEvent) => this._onDataItemDragOver(e, index)}
          @dragend=${() => this._onDataItemDragEnd()}
          @drop=${(e: DragEvent) => this._onDataItemDrop(e, index, module, updateModule)}
        >
          <div class="drag-handle" @click=${(e: Event) => e.stopPropagation()}>
            <ha-icon icon="mdi:drag"></ha-icon>
          </div>
          <div class="item-icon">
            <ha-icon icon="${item.icon || itemTypeIcons[item.type]}"></ha-icon>
          </div>
          <div class="item-info">
            <div class="item-type">${itemTypeLabels[item.type]}</div>
            <div class="item-label">${item.label || this._getDefaultItemLabel(item, hass)}</div>
          </div>
          <button
            class="item-action-btn delete"
            @click=${(e: Event) => {
              e.stopPropagation();
              this._removeDataItem(module, index, updateModule);
            }}
            title="Delete"
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
        <div class="data-item-content">
          ${this._renderDataItemConfig(item, index, module, hass, updateModule, lang)}
        </div>
      </ha-expansion-panel>
    `;
  }

  private _renderDataItemConfig(
    item: PeopleDataItem,
    index: number,
    module: PeopleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <!-- Type-specific settings (Entity first) -->
      ${this._renderTypeSpecificConfig(item, index, module, hass, updateModule, lang)}

      <!-- Icon and Label settings -->
      <ha-form
        .hass=${hass}
        .data=${{
          icon: item.icon || '',
          label: item.label || '',
        }}
        .schema=${[
          { name: 'icon', label: 'Custom Icon', selector: { icon: {} } },
          { name: 'label', label: 'Custom Label', selector: { text: {} } },
        ]}
        .computeLabel=${(schema: any) => schema.label}
        @value-changed=${(e: CustomEvent) => {
          this._updateDataItem(module, index, e.detail.value, updateModule);
        }}
      ></ha-form>

      <!-- Toggle switches -->
      <ha-form
        .hass=${hass}
        .data=${{
          show_icon: item.show_icon !== false,
          show_label: item.show_label === true,
          show_value: item.show_value !== false,
        }}
        .schema=${[
          { name: 'show_icon', label: 'Show Icon', selector: { boolean: {} } },
          { name: 'show_label', label: 'Show Label', selector: { boolean: {} } },
          { name: 'show_value', label: 'Show Value', selector: { boolean: {} } },
        ]}
        .computeLabel=${(schema: any) => schema.label}
        @value-changed=${(e: CustomEvent) => {
          this._updateDataItem(module, index, e.detail.value, updateModule);
        }}
      ></ha-form>

      <!-- Styling section -->
      <div class="styling-section">
        <div class="section-subtitle">Styling</div>

        <!-- Icon Color -->
        <div class="color-row">
          <span class="color-label">Icon Color</span>
          <ultra-color-picker
            .hass=${hass}
            .value=${item.icon_color || 'var(--secondary-text-color)'}
            @value-changed=${(e: CustomEvent) => {
              this._updateDataItem(module, index, { icon_color: e.detail.value }, updateModule);
            }}
          ></ultra-color-picker>
        </div>

        <!-- Value Color -->
        <div class="color-row">
          <span class="color-label">Value Color</span>
          <ultra-color-picker
            .hass=${hass}
            .value=${item.value_color || 'var(--primary-text-color)'}
            @value-changed=${(e: CustomEvent) => {
              this._updateDataItem(module, index, { value_color: e.detail.value }, updateModule);
            }}
          ></ultra-color-picker>
        </div>

        <!-- Label Color -->
        <div class="color-row">
          <span class="color-label">Label Color</span>
          <ultra-color-picker
            .hass=${hass}
            .value=${item.label_color || 'var(--secondary-text-color)'}
            @value-changed=${(e: CustomEvent) => {
              this._updateDataItem(module, index, { label_color: e.detail.value }, updateModule);
            }}
          ></ultra-color-picker>
        </div>

        <!-- Icon Size -->
        <div class="slider-row">
          <span class="slider-label">Icon Size</span>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="12"
              max="48"
              step="1"
              value="${item.icon_size || 18}"
              @input=${(e: Event) => {
                const value = parseInt((e.target as HTMLInputElement).value, 10);
                this._updateDataItem(module, index, { icon_size: value }, updateModule);
              }}
            />
            <input
              type="number"
              class="range-input"
              min="12"
              max="48"
              step="1"
              value="${item.icon_size || 18}"
              @input=${(e: Event) => {
                const value = parseInt((e.target as HTMLInputElement).value, 10);
                if (!isNaN(value)) {
                  this._updateDataItem(module, index, { icon_size: value }, updateModule);
                }
              }}
            />
            <button
              class="range-reset-btn"
              @click=${() => {
                this._updateDataItem(module, index, { icon_size: 18 }, updateModule);
              }}
              title="Reset to default"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Font Size -->
        <div class="slider-row">
          <span class="slider-label">Font Size</span>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="10"
              max="32"
              step="1"
              value="${item.font_size || 14}"
              @input=${(e: Event) => {
                const value = parseInt((e.target as HTMLInputElement).value, 10);
                this._updateDataItem(module, index, { font_size: value }, updateModule);
              }}
            />
            <input
              type="number"
              class="range-input"
              min="10"
              max="32"
              step="1"
              value="${item.font_size || 14}"
              @input=${(e: Event) => {
                const value = parseInt((e.target as HTMLInputElement).value, 10);
                if (!isNaN(value)) {
                  this._updateDataItem(module, index, { font_size: value }, updateModule);
                }
              }}
            />
            <button
              class="range-reset-btn"
              @click=${() => {
                this._updateDataItem(module, index, { font_size: 14 }, updateModule);
              }}
              title="Reset to default"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderTypeSpecificConfig(
    item: PeopleDataItem,
    index: number,
    module: PeopleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    switch (item.type) {
      case 'sensor':
      case 'device_state':
      case 'toggle':
        return html`
          <div class="config-row">
            <ha-form
              .hass=${hass}
              .data=${{ entity: item.entity || '' }}
              .schema=${[
                {
                  name: 'entity',
                  label: 'Entity',
                  selector: { entity: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label}
              @value-changed=${(e: CustomEvent) => {
                this._updateDataItem(
                  module,
                  index,
                  { entity: e.detail.value.entity },
                  updateModule
                );
              }}
            ></ha-form>
          </div>
        `;

      case 'attribute':
        return html`
          <div class="config-row">
            <ha-form
              .hass=${hass}
              .data=${{ entity: item.entity || '', attribute: item.attribute || '' }}
              .schema=${[
                {
                  name: 'entity',
                  label: 'Entity',
                  selector: { entity: {} },
                },
                {
                  name: 'attribute',
                  label: 'Attribute Name',
                  selector: { text: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label}
              @value-changed=${(e: CustomEvent) => {
                this._updateDataItem(module, index, e.detail.value, updateModule);
              }}
            ></ha-form>
          </div>
        `;

      case 'time_info':
        return html`
          <div class="config-row">
            <ha-form
              .hass=${hass}
              .data=${{ time_format: item.time_format || 'relative' }}
              .schema=${[
                {
                  name: 'time_format',
                  label: 'Time Format',
                  selector: {
                    select: {
                      options: [
                        { value: 'relative', label: 'Relative (e.g., 2 hours ago)' },
                        { value: 'absolute', label: 'Absolute (e.g., 2:30 PM)' },
                        { value: 'duration', label: 'Duration (e.g., 2h 30m)' },
                      ],
                    },
                  },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label}
              @value-changed=${(e: CustomEvent) => {
                this._updateDataItem(module, index, e.detail.value, updateModule);
              }}
            ></ha-form>
          </div>
        `;

      default:
        return html``;
    }
  }

  // Drag and drop handlers
  private _onDataItemDragStart(e: DragEvent, index: number): void {
    this._draggedItemIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
  }

  private _onDataItemDragOver(e: DragEvent, index: number): void {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    this._dragOverIndex = index;
  }

  private _onDataItemDragEnd(): void {
    this._draggedItemIndex = null;
    this._dragOverIndex = null;
  }

  private _onDataItemDrop(
    e: DragEvent,
    targetIndex: number,
    module: PeopleModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    e.preventDefault();
    const sourceIndex = this._draggedItemIndex;

    if (sourceIndex === null || sourceIndex === targetIndex) {
      this._onDataItemDragEnd();
      return;
    }

    const currentItems = this._getDataItemsForLayout(module);
    const items = [...currentItems];
    const [movedItem] = items.splice(sourceIndex, 1);
    items.splice(targetIndex, 0, movedItem);

    this._setDataItemsForLayout(module, items, updateModule);
    this.triggerPreviewUpdate();
    this._onDataItemDragEnd();
  }

  private _addDataItem(
    module: PeopleModule,
    type: PeopleDataItemType,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const defaultIcons: Record<PeopleDataItemType, string> = {
      location: 'mdi:map-marker',
      battery: 'mdi:battery',
      time_info: 'mdi:clock-outline',
      media: 'mdi:music',
      sensor: 'mdi:gauge',
      device_state: 'mdi:wifi',
      attribute: 'mdi:code-tags',
      toggle: 'mdi:toggle-switch',
    };

    const newItem: PeopleDataItem = {
      id: this.generateId('item'),
      type,
      show_icon: true,
      show_label: true,
      show_value: true,
      icon: defaultIcons[type],
    };

    const currentItems = this._getDataItemsForLayout(module);
    const items = [...currentItems, newItem];
    this._setDataItemsForLayout(module, items, updateModule);
    this.triggerPreviewUpdate();
  }

  private _removeDataItem(
    module: PeopleModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const currentItems = this._getDataItemsForLayout(module);
    const items = [...currentItems];
    items.splice(index, 1);
    this._setDataItemsForLayout(module, items, updateModule);
    this.triggerPreviewUpdate();
  }

  private _updateDataItem(
    module: PeopleModule,
    index: number,
    updates: Partial<PeopleDataItem>,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const currentItems = this._getDataItemsForLayout(module);
    const items = [...currentItems];
    items[index] = { ...items[index], ...updates };
    this._setDataItemsForLayout(module, items, updateModule);
    this.triggerPreviewUpdate();
  }

  private _getDefaultItemLabel(item: PeopleDataItem, hass: HomeAssistant): string {
    if (item.entity) {
      const state = hass.states[item.entity];
      return state?.attributes?.friendly_name || item.entity;
    }

    const defaults: Record<PeopleDataItemType, string> = {
      location: 'Location',
      battery: 'Battery',
      time_info: 'At location',
      media: 'Now playing',
      sensor: 'Sensor',
      device_state: 'Device',
      attribute: 'Attribute',
      toggle: 'Toggle',
    };

    return defaults[item.type];
  }

  private _renderAssociatedEntitiesSection(
    module: PeopleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.modules.people.associated_entities', lang, 'Associated Entities')}
        </div>
        <div class="section-description">
          ${localize(
            'editor.modules.people.associated_entities_desc',
            lang,
            'Link additional entities for battery and media display'
          )}
        </div>

        <div class="field-container">
          <ha-form
            .hass=${hass}
            .data=${{
              battery_entity: module.battery_entity || '',
              media_player_entity: module.media_player_entity || '',
            }}
            .schema=${[
              {
                name: 'battery_entity',
                label: localize('editor.modules.people.battery_entity', lang, 'Battery Entity'),
                description: 'Sensor or device tracker with battery attribute',
                selector: { entity: { domain: ['sensor', 'device_tracker'] } },
              },
              {
                name: 'media_player_entity',
                label: localize('editor.modules.people.media_player', lang, 'Media Player'),
                description: 'Media player for music display',
                selector: { entity: { domain: 'media_player' } },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label}
            .computeDescription=${(schema: any) => schema.description}
            @value-changed=${(e: CustomEvent) => {
              updateModule(e.detail.value);
              this.triggerPreviewUpdate();
            }}
          ></ha-form>
        </div>
      </div>
    `;
  }

  private _renderLayoutSpacingSection(
    module: PeopleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.modules.people.layout_spacing', lang, 'Layout & Spacing')}
        </div>

        <!-- Gap -->
        <div class="field-container">
          <div class="field-title">${localize('editor.modules.people.gap', lang, 'Gap')}</div>
          <div class="number-range-control">
            <input
              type="range"
              class="range-slider"
              min="0"
              max="48"
              step="2"
              .value="${module.gap || 12}"
              @input=${(e: Event) => {
                updateModule({ gap: Number((e.target as HTMLInputElement).value) });
                this.triggerPreviewUpdate();
              }}
            />
            <input
              type="number"
              class="range-input"
              min="0"
              max="48"
              step="2"
              .value="${module.gap || 12}"
              @input=${(e: Event) => {
                const gap = Number((e.target as HTMLInputElement).value);
                if (!isNaN(gap)) {
                  updateModule({ gap });
                  this.triggerPreviewUpdate();
                }
              }}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const currentValue = module.gap || 12;
                  const increment = e.key === 'ArrowUp' ? 2 : -2;
                  const newValue = Math.max(0, Math.min(48, currentValue + increment));
                  updateModule({ gap: newValue });
                  this.triggerPreviewUpdate();
                }
              }}
            />
            <button
              class="range-reset-btn"
              @click=${() => {
                updateModule({ gap: 12 });
                this.triggerPreviewUpdate();
              }}
              title="Reset to default (12px)"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        ${module.layout_style !== 'horizontal_detailed' && module.layout_style !== 'music_overlay'
          ? html`
              <!-- Data Items Gap -->
              <div class="field-container">
                <div class="field-title">
                  ${localize('editor.modules.people.data_items_gap', lang, 'Data Items Gap')}
                </div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="0"
                    max="32"
                    step="2"
                    .value="${module.data_items_gap || 8}"
                    @input=${(e: Event) => {
                      updateModule({
                        data_items_gap: Number((e.target as HTMLInputElement).value),
                      });
                      this.triggerPreviewUpdate();
                    }}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="0"
                    max="32"
                    step="2"
                    .value="${module.data_items_gap || 8}"
                    @input=${(e: Event) => {
                      const data_items_gap = Number((e.target as HTMLInputElement).value);
                      if (!isNaN(data_items_gap)) {
                        updateModule({ data_items_gap });
                        this.triggerPreviewUpdate();
                      }
                    }}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const currentValue = module.data_items_gap || 8;
                        const increment = e.key === 'ArrowUp' ? 2 : -2;
                        const newValue = Math.max(0, Math.min(32, currentValue + increment));
                        updateModule({ data_items_gap: newValue });
                        this.triggerPreviewUpdate();
                      }
                    }}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${() => {
                      updateModule({ data_items_gap: 8 });
                      this.triggerPreviewUpdate();
                    }}
                    title="Reset to default (8px)"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              <!-- Data Area Height -->
              <div class="field-container">
                <div class="field-title">
                  ${localize('editor.modules.people.data_area_height', lang, 'Data Area Height')}
                </div>
                <div class="field-description">Set to 0 for auto height</div>
                <div class="number-range-control">
                  <input
                    type="range"
                    class="range-slider"
                    min="0"
                    max="200"
                    step="4"
                    .value="${module.data_area_height || 0}"
                    @input=${(e: Event) => {
                      updateModule({
                        data_area_height: Number((e.target as HTMLInputElement).value),
                      });
                      this.triggerPreviewUpdate();
                    }}
                  />
                  <input
                    type="number"
                    class="range-input"
                    min="0"
                    max="300"
                    step="4"
                    .value="${module.data_area_height || 0}"
                    @input=${(e: Event) => {
                      const data_area_height = Number((e.target as HTMLInputElement).value);
                      if (!isNaN(data_area_height)) {
                        updateModule({ data_area_height });
                        this.triggerPreviewUpdate();
                      }
                    }}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const currentValue = module.data_area_height || 0;
                        const increment = e.key === 'ArrowUp' ? 4 : -4;
                        const newValue = Math.max(0, Math.min(300, currentValue + increment));
                        updateModule({ data_area_height: newValue });
                        this.triggerPreviewUpdate();
                      }
                    }}
                  />
                  <button
                    class="range-reset-btn"
                    @click=${() => {
                      updateModule({ data_area_height: 0 });
                      this.triggerPreviewUpdate();
                    }}
                    title="Reset to auto (0px)"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>

              <!-- Data Items Direction -->
              <div class="field-container">
                <div class="field-title">
                  ${localize(
                    'editor.modules.people.data_items_direction',
                    lang,
                    'Data Items Direction'
                  )}
                </div>
                <div class="button-group">
                  <button
                    class="option-btn ${module.data_items_direction === 'row' ? 'active' : ''}"
                    @click=${() => {
                      updateModule({ data_items_direction: 'row' });
                      this.triggerPreviewUpdate();
                    }}
                  >
                    <ha-icon icon="mdi:arrow-right"></ha-icon>
                    Row
                  </button>
                  <button
                    class="option-btn ${module.data_items_direction === 'column' ? 'active' : ''}"
                    @click=${() => {
                      updateModule({ data_items_direction: 'column' });
                      this.triggerPreviewUpdate();
                    }}
                  >
                    <ha-icon icon="mdi:arrow-down"></ha-icon>
                    Column
                  </button>
                </div>
              </div>
            `
          : ''}

        <!-- Alignment - only for compact and banner layouts -->
        ${module.layout_style === 'compact' || module.layout_style === 'banner'
          ? html`
              <div class="field-container">
                <div class="field-title">
                  ${localize('editor.modules.people.alignment', lang, 'Alignment')}
                </div>
                <div class="button-group">
                  ${(['left', 'center', 'right'] as const).map(
                    align => html`
                      <button
                        class="option-btn ${module.alignment === align ? 'active' : ''}"
                        @click=${() => {
                          updateModule({ alignment: align });
                          this.triggerPreviewUpdate();
                        }}
                      >
                        <ha-icon
                          icon="mdi:format-align-${align === 'center' ? 'center' : align}"
                        ></ha-icon>
                      </button>
                    `
                  )}
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  // ============================================
  // PREVIEW RENDERING
  // ============================================

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const peopleModule = module as PeopleModule;

    // Check if entity is configured
    if (!peopleModule.person_entity) {
      return this.renderGradientErrorState(
        'Select Person Entity',
        'Choose a person entity in the General tab'
      );
    }

    const personState = hass.states[peopleModule.person_entity];
    if (!personState) {
      return this.renderGradientErrorState('Entity Not Found', peopleModule.person_entity);
    }

    // Create gesture handlers
    const handlers = this.createGestureHandlers(
      peopleModule.id,
      {
        tap_action: peopleModule.tap_action,
        hold_action: peopleModule.hold_action,
        double_tap_action: peopleModule.double_tap_action,
        entity: peopleModule.person_entity,
        module: peopleModule,
      },
      hass,
      config
    );

    // Render based on layout style
    let content: TemplateResult;
    switch (peopleModule.layout_style) {
      case 'banner':
        content = this._renderBannerLayout(peopleModule, hass, personState, handlers, config);
        break;
      case 'horizontal_compact':
        content = this._renderHorizontalCompactLayout(
          peopleModule,
          hass,
          personState,
          handlers,
          config
        );
        break;
      case 'horizontal_detailed':
        content = this._renderHorizontalDetailedLayout(
          peopleModule,
          hass,
          personState,
          handlers,
          config
        );
        break;
      case 'header':
        content = this._renderHeaderLayout(peopleModule, hass, personState, handlers, config);
        break;
      case 'music_overlay':
        content = this._renderMusicOverlayLayout(peopleModule, hass, personState, handlers, config);
        break;
      case 'compact':
      default:
        content = this._renderCompactLayout(peopleModule, hass, personState, handlers, config);
        break;
    }

    // Wrap with animation if configured (uses base class method)
    return this.wrapWithAnimation(content, peopleModule, hass);
  }

  // ============================================
  // LAYOUT RENDERERS
  // ============================================

  private _renderCompactLayout(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any,
    handlers: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const nameSettings = module.name_settings;
    const isHome = personState.state === 'home';

    // Use base class methods for design styles
    const designStyles = this.buildDesignStyles(module, hass);
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--compact ${hoverClass}"
        style="gap: ${module.gap}px; align-items: ${module.alignment}; ${this.buildStyleString(
          designStyles
        )}"
        @pointerdown=${handlers.onPointerDown}
        @pointerup=${handlers.onPointerUp}
        @pointerleave=${handlers.onPointerLeave}
        @pointercancel=${handlers.onPointerCancel}
      >
        ${module.show_avatar !== false ? this._renderAvatar(module, hass, personState, isHome) : ''}
        ${nameSettings.show ? this._renderName(module, hass, personState) : ''}
        ${this._renderDataItems(module, hass, personState, config)}
      </div>
    `;
  }

  private _renderBannerLayout(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any,
    handlers: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const bannerSettings = module.banner_settings || this.createDefault().banner_settings!;
    const isHome = personState.state === 'home';
    const bannerBg = this._getBannerBackground(bannerSettings, hass);

    // Get individual corner radii (fall back to border_radius if not set)
    const defaultRadius = bannerSettings.border_radius || 0;
    const topLeft = bannerSettings.border_radius_top_left ?? defaultRadius;
    const topRight = bannerSettings.border_radius_top_right ?? defaultRadius;
    const bottomLeft = bannerSettings.border_radius_bottom_left ?? 0;
    const bottomRight = bannerSettings.border_radius_bottom_right ?? 0;
    const borderRadiusStyle = `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;

    // Use base class methods for design styles
    const designStyles = this.buildDesignStyles(module, hass);
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--banner ${hoverClass}"
        style="border-radius: ${borderRadiusStyle}; ${this.buildStyleString(designStyles)}"
        @pointerdown=${handlers.onPointerDown}
        @pointerup=${handlers.onPointerUp}
        @pointerleave=${handlers.onPointerLeave}
        @pointercancel=${handlers.onPointerCancel}
      >
        <div
          class="people-banner"
          style="
            ${bannerBg}
            height: ${bannerSettings.banner_height || 120}px;
            filter: blur(${bannerSettings.background_blur || 0}px);
          "
        ></div>
        ${bannerSettings.overlay_color
          ? html`<div
              class="people-banner-overlay"
              style="background: ${bannerSettings.overlay_color}; opacity: ${(bannerSettings.overlay_opacity ||
                30) / 100};"
            ></div>`
          : ''}
        <div class="people-banner-content" style="gap: ${module.gap}px;">
          <div class="people-banner-side">
            ${module.show_location_badge !== false
              ? this._renderLocationBadge(module, hass, personState)
              : ''}
          </div>
          ${module.show_avatar !== false
            ? this._renderAvatar(module, hass, personState, isHome)
            : ''}
          <div class="people-banner-side">
            ${module.show_battery_badge !== false ? this._renderBatteryBadge(module, hass) : ''}
          </div>
        </div>
        <div class="people-banner-info" style="text-align: ${module.alignment};">
          ${module.name_settings.show ? this._renderName(module, hass, personState) : ''}
          ${this._renderDataItems(module, hass, personState, config)}
        </div>
      </div>
    `;
  }

  private _renderHorizontalCompactLayout(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any,
    handlers: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const isHome = personState.state === 'home';

    // Use base class methods for design styles
    const designStyles = this.buildDesignStyles(module, hass);
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--horizontal-compact ${hoverClass}"
        style="gap: ${module.gap}px; ${this.buildStyleString(designStyles)}"
        @pointerdown=${handlers.onPointerDown}
        @pointerup=${handlers.onPointerUp}
        @pointerleave=${handlers.onPointerLeave}
        @pointercancel=${handlers.onPointerCancel}
      >
        ${module.show_avatar !== false ? this._renderAvatar(module, hass, personState, isHome) : ''}
        <div class="people-info-column">
          <div class="people-info-header">
            ${module.name_settings.show ? this._renderName(module, hass, personState) : ''}
          </div>
          ${this._renderDataItems(module, hass, personState, config)}
        </div>
      </div>
    `;
  }

  private _renderHorizontalDetailedLayout(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any,
    handlers: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const isHome = personState.state === 'home';

    // Use base class methods for design styles
    const designStyles = this.buildDesignStyles(module, hass);
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--horizontal-detailed ${hoverClass}"
        style="gap: ${module.gap}px; ${this.buildStyleString(designStyles)}"
        @pointerdown=${handlers.onPointerDown}
        @pointerup=${handlers.onPointerUp}
        @pointerleave=${handlers.onPointerLeave}
        @pointercancel=${handlers.onPointerCancel}
      >
        ${module.show_avatar !== false ? this._renderAvatar(module, hass, personState, isHome) : ''}
        <div class="people-detailed-info">
          ${module.name_settings.show || module.show_location_badge !== false
            ? html`
                <div class="people-detailed-header">
                  ${module.name_settings.show ? this._renderName(module, hass, personState) : ''}
                  ${module.show_location_badge !== false
                    ? this._renderLocationBadge(module, hass, personState)
                    : ''}
                </div>
              `
            : ''}
          <div class="people-detailed-items">
            ${this._renderDataItemsList(module, hass, personState, config)}
          </div>
        </div>
      </div>
    `;
  }

  private _renderHeaderLayout(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any,
    handlers: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const isHome = personState.state === 'home';

    // Use base class methods for design styles
    const designStyles = this.buildDesignStyles(module, hass);
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--header ${hoverClass}"
        style="${this.buildStyleString(designStyles)}"
        @pointerdown=${handlers.onPointerDown}
        @pointerup=${handlers.onPointerUp}
        @pointerleave=${handlers.onPointerLeave}
        @pointercancel=${handlers.onPointerCancel}
      >
        ${module.header_show_badges && module.header_badges_position === 'top'
          ? html`<div class="people-header-badges">
              ${this._renderHeaderBadges(module, hass, personState)}
            </div>`
          : ''}
        <div class="people-header-main" style="gap: ${module.gap}px;">
          ${module.show_avatar !== false
            ? this._renderAvatar(module, hass, personState, isHome)
            : ''}
          <div class="people-header-info">
            ${module.name_settings.show ? this._renderName(module, hass, personState) : ''}
            ${module.show_location_badge !== false && !module.header_show_badges
              ? this._renderLocationText(module, hass, personState)
              : ''}
          </div>
        </div>
        ${module.header_show_badges && module.header_badges_position === 'bottom'
          ? html`<div class="people-header-badges">
              ${this._renderHeaderBadges(module, hass, personState)}
            </div>`
          : ''}
        <div class="people-header-items" style="gap: ${module.data_items_gap}px;">
          ${this._renderDataItems(module, hass, personState, config)}
        </div>
      </div>
    `;
  }

  private _renderMusicOverlayLayout(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any,
    handlers: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const isHome = personState.state === 'home';
    const mediaPlayer = module.media_player_entity ? hass.states[module.media_player_entity] : null;
    const isPlaying = mediaPlayer?.state === 'playing';
    const albumArt = mediaPlayer?.attributes?.entity_picture;

    // Use base class methods for design styles
    const designStyles = this.buildDesignStyles(module, hass);
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      <style>
        ${this._getPreviewStyles()}
      </style>
      <div
        class="people-module people-module--music-overlay ${isPlaying
          ? 'playing'
          : ''} ${hoverClass}"
        style="${this.buildStyleString(designStyles)}"
        @pointerdown=${handlers.onPointerDown}
        @pointerup=${handlers.onPointerUp}
        @pointerleave=${handlers.onPointerLeave}
        @pointercancel=${handlers.onPointerCancel}
      >
        ${module.music_blur_background !== false && albumArt
          ? html`<div
              class="people-music-blur-bg"
              style="background-image: url(${this._resolveEntityPicture(
                albumArt,
                hass
              )}); filter: blur(${module.music_album_blur ??
              8}px); opacity: ${(module.music_album_opacity ?? 75) / 100};"
            ></div>`
          : ''}
        <div class="people-music-header">
          ${this._renderHeaderBadges(module, hass, personState)}
        </div>
        <div class="people-music-content" style="gap: ${module.gap}px;">
          ${module.show_avatar !== false
            ? this._renderAvatar(module, hass, personState, isHome)
            : ''}
          ${isPlaying && mediaPlayer
            ? this._renderMusicInfo(module, mediaPlayer, hass)
            : module.name_settings.show
              ? this._renderName(module, hass, personState)
              : ''}
        </div>
        ${isPlaying && module.music_show_progress && mediaPlayer
          ? this._renderMusicProgress(mediaPlayer)
          : ''}
      </div>
    `;
  }

  // ============================================
  // COMPONENT RENDERERS
  // ============================================

  private _renderAvatar(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any,
    isHome: boolean
  ): TemplateResult {
    const settings = module.avatar_settings;
    const entityPicture = personState.attributes?.entity_picture;
    const borderColor = settings.use_state_color
      ? isHome
        ? settings.state_home_color
        : settings.state_away_color
      : settings.border_color;

    const avatarUrl =
      settings.custom_image ||
      (settings.show_entity_picture && entityPicture
        ? this._resolveEntityPicture(entityPicture, hass)
        : null);

    return html`
      <div
        class="people-avatar"
        style="
          width: ${settings.size}px;
          height: ${settings.size}px;
          border: ${settings.border_width}px solid ${borderColor};
        "
      >
        ${avatarUrl
          ? html`<img
              src="${avatarUrl}"
              alt="Avatar"
              style="object-fit: ${settings.image_fit || 'cover'}"
            />`
          : html`<ha-icon
              icon="${settings.fallback_icon || 'mdi:account'}"
              style="--mdc-icon-size: ${settings.size * 0.6}px;"
            ></ha-icon>`}
        ${settings.show_status_badge
          ? html`
              <div
                class="people-avatar-badge people-avatar-badge--${settings.status_badge_position}"
                style="background: ${isHome
                  ? settings.status_badge_home_color
                  : settings.status_badge_away_color};"
              >
                <ha-icon icon="${isHome ? 'mdi:home' : 'mdi:walk'}"></ha-icon>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _renderName(module: PeopleModule, hass: HomeAssistant, personState: any): TemplateResult {
    const settings = module.name_settings;
    const name =
      settings.custom_name ||
      (settings.use_friendly_name
        ? personState.attributes?.friendly_name
        : personState.entity_id.split('.')[1]);

    return html`
      <div
        class="people-name"
        style="
          font-size: ${settings.font_size}px;
          font-weight: ${settings.font_weight};
          color: ${settings.color || 'var(--primary-text-color)'};
          text-align: ${settings.alignment || 'center'};
        "
      >
        ${name}
      </div>
    `;
  }

  private _renderDataItems(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const dataItems = this._getDataItemsForLayout(module);
    if (!dataItems || dataItems.length === 0) {
      return html``;
    }

    const heightStyle = module.data_area_height
      ? `height: ${module.data_area_height}px; overflow-y: auto;`
      : '';

    return html`
      <div
        class="people-data-items people-data-items--${module.data_items_direction}"
        style="gap: ${module.data_items_gap}px; ${heightStyle}"
      >
        ${dataItems.map(item => this._renderDataItem(item, module, hass, personState, config))}
      </div>
    `;
  }

  private _renderDataItemsList(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const dataItems = this._getDataItemsForLayout(module);
    if (!dataItems || dataItems.length === 0) {
      return html``;
    }

    return html`
      <div class="people-data-list">
        ${dataItems.map(item =>
          this._renderDataItemRow_Preview(item, module, hass, personState, config)
        )}
      </div>
    `;
  }

  private _renderDataItem(
    item: PeopleDataItem,
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const value = this._getDataItemValue(item, module, hass, personState);
    const icon = item.icon || this._getDefaultItemIcon(item.type);

    // Get default label based on type
    const defaultLabel = this._getDefaultItemLabel(item, hass);
    const displayLabel = item.label || defaultLabel;

    // Determine what to show
    const showIcon = item.show_icon !== false;
    const showLabel = item.show_label === true; // Only show if explicitly true
    const showValue = item.show_value !== false; // Show by default

    return html`
      <div class="people-data-item" style="font-size: ${item.font_size || 14}px;">
        ${showIcon
          ? html`<ha-icon
              icon="${icon}"
              style="color: ${item.icon_color ||
              'var(--secondary-text-color)'}; --mdc-icon-size: ${item.icon_size || 18}px;"
            ></ha-icon>`
          : ''}
        ${showLabel
          ? html`<span
              class="people-data-item-label"
              style="color: ${item.label_color || 'var(--secondary-text-color)'}"
              >${displayLabel}:</span
            >`
          : ''}
        ${showValue
          ? html`<span
              class="people-data-item-value"
              style="color: ${item.value_color || 'var(--primary-text-color)'}"
              >${value || 'N/A'}</span
            >`
          : ''}
      </div>
    `;
  }

  private _renderDataItemRow_Preview(
    item: PeopleDataItem,
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const value = this._getDataItemValue(item, module, hass, personState);
    const icon = item.icon || this._getDefaultItemIcon(item.type);

    // For toggle items, render a switch
    if (item.type === 'toggle' && item.entity) {
      const toggleState = hass.states[item.entity];
      const isOn = toggleState?.state === 'on';

      return html`
        <div class="people-data-row">
          <div class="people-data-row-left">
            ${item.show_icon !== false
              ? html`<ha-icon
                  icon="${icon}"
                  style="color: ${item.icon_color || 'var(--secondary-text-color)'};"
                ></ha-icon>`
              : ''}
            <span>${item.label || toggleState?.attributes?.friendly_name || 'Toggle'}</span>
          </div>
          <ha-switch
            .checked=${isOn}
            @change=${(e: Event) => {
              e.stopPropagation();
              const service = isOn ? 'turn_off' : 'turn_on';
              hass.callService('homeassistant', service, { entity_id: item.entity });
            }}
          ></ha-switch>
        </div>
      `;
    }

    return html`
      <div class="people-data-row">
        <div class="people-data-row-left">
          ${item.show_icon !== false
            ? html`<ha-icon
                icon="${icon}"
                style="color: ${item.icon_color || 'var(--secondary-text-color)'};"
              ></ha-icon>`
            : ''}
          ${item.show_label !== false
            ? html`<span>${item.label || this._getDefaultItemLabel(item, hass)}</span>`
            : ''}
        </div>
        ${item.show_value !== false
          ? html`<span class="people-data-row-value">${value || 'N/A'}</span>`
          : ''}
      </div>
    `;
  }

  private _renderLocationBadge(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any
  ): TemplateResult {
    const location = this._formatLocation(personState.state);
    const locationSettings = module.location_settings;

    return html`
      <div class="people-location-badge">
        ${locationSettings.show_icon
          ? html`<ha-icon
              icon="${locationSettings.icon || 'mdi:map-marker'}"
              style="color: ${locationSettings.icon_color || 'var(--secondary-text-color)'};"
            ></ha-icon>`
          : ''}
        <span style="color: ${locationSettings.color || 'var(--secondary-text-color)'};"
          >${location}</span
        >
      </div>
    `;
  }

  private _renderLocationText(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any
  ): TemplateResult {
    const location = this._formatLocation(personState.state);
    const locationSettings = module.location_settings;

    if (!locationSettings.show) return html``;

    return html`
      <div
        class="people-location-text"
        style="font-size: ${locationSettings.font_size}px; color: ${locationSettings.color ||
        'var(--secondary-text-color)'};"
      >
        ${location} ${locationSettings.show_duration ? this._renderDurationText(personState) : ''}
      </div>
    `;
  }

  private _renderDurationText(personState: any): TemplateResult {
    const lastChanged = new Date(personState.last_changed);
    const now = new Date();
    const diff = now.getTime() - lastChanged.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    let durationText = '';
    if (hours > 0) {
      durationText = `for ${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      durationText = `for ${minutes}m`;
    } else {
      durationText = 'just arrived';
    }

    return html`<span class="people-duration">${durationText}</span>`;
  }

  private _renderBatteryBadge(module: PeopleModule, hass: HomeAssistant): TemplateResult {
    if (!module.battery_entity) return html``;

    const batteryState = hass.states[module.battery_entity];
    if (!batteryState) return html``;

    const batteryLevel =
      batteryState.attributes?.battery_level ??
      batteryState.attributes?.battery ??
      parseFloat(batteryState.state);

    if (isNaN(batteryLevel)) return html``;

    const batteryIcon = this._getBatteryIcon(batteryLevel);
    const batteryColor = this._getBatteryColor(batteryLevel);

    return html`
      <div class="people-battery-badge" style="color: ${batteryColor};">
        <ha-icon icon="${batteryIcon}"></ha-icon>
        <span>${Math.round(batteryLevel)}%</span>
      </div>
    `;
  }

  private _renderHeaderBadges(
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any
  ): TemplateResult {
    const isHome = personState.state === 'home';
    const showLocation = module.show_location_badge !== false;
    const showBattery = module.show_battery_badge !== false && module.battery_entity;

    // Don't render the container if both badges are hidden
    if (!showLocation && !showBattery) {
      return html``;
    }

    return html`
      <div class="people-header-badges-row">
        ${showLocation
          ? html`<div class="people-badge ${isHome ? 'home' : 'away'}">
              <ha-icon icon="${isHome ? 'mdi:home' : 'mdi:walk'}"></ha-icon>
            </div>`
          : ''}
        ${showBattery ? this._renderBatteryBadge(module, hass) : ''}
      </div>
    `;
  }

  private _renderMusicInfo(
    module: PeopleModule,
    mediaPlayer: any,
    hass: HomeAssistant
  ): TemplateResult {
    const title = mediaPlayer.attributes?.media_title || 'Unknown';
    const artist = mediaPlayer.attributes?.media_artist || '';

    return html`
      <div class="people-music-info">
        <ha-icon icon="mdi:music-note"></ha-icon>
        <div class="people-music-text">
          <span class="people-music-title">${title}</span>
          ${artist ? html`<span class="people-music-artist">${artist}</span>` : ''}
        </div>
      </div>
    `;
  }

  private _renderMusicProgress(mediaPlayer: any): TemplateResult {
    const position = mediaPlayer.attributes?.media_position || 0;
    const duration = mediaPlayer.attributes?.media_duration || 100;
    const progress = (position / duration) * 100;

    return html`
      <div class="people-music-progress">
        <div class="people-music-progress-bar" style="width: ${progress}%;"></div>
      </div>
    `;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private _getDataItemValue(
    item: PeopleDataItem,
    module: PeopleModule,
    hass: HomeAssistant,
    personState: any
  ): string {
    switch (item.type) {
      case 'location':
        return this._formatLocation(personState.state);

      case 'battery':
        if (!module.battery_entity) return 'N/A';
        const batteryState = hass.states[module.battery_entity];
        if (!batteryState) return 'N/A';
        const level =
          batteryState.attributes?.battery_level ??
          batteryState.attributes?.battery ??
          batteryState.state;
        return `${Math.round(parseFloat(level))}%`;

      case 'time_info':
        return this._formatTimeInfo(personState, item.time_format || 'relative');

      case 'media':
        if (!module.media_player_entity) return 'N/A';
        const mediaState = hass.states[module.media_player_entity];
        if (!mediaState || mediaState.state !== 'playing') return 'Not playing';
        const title = mediaState.attributes?.media_title || 'Unknown';
        const artist = mediaState.attributes?.media_artist;
        return artist ? `${title} - ${artist}` : title;

      case 'sensor':
      case 'device_state':
        if (!item.entity) return 'N/A';
        const sensorState = hass.states[item.entity];
        if (!sensorState) return 'N/A';
        return formatEntityState(hass, item.entity);

      case 'attribute':
        if (!item.entity || !item.attribute) return 'N/A';
        const attrState = hass.states[item.entity];
        if (!attrState) return 'N/A';
        const attrValue = attrState.attributes?.[item.attribute];
        return attrValue !== undefined ? String(attrValue) : 'N/A';

      case 'toggle':
        if (!item.entity) return 'N/A';
        const toggleState = hass.states[item.entity];
        if (!toggleState) return 'N/A';
        return toggleState.state;

      default:
        return 'N/A';
    }
  }

  private _getDefaultItemIcon(type: PeopleDataItemType): string {
    const icons: Record<PeopleDataItemType, string> = {
      location: 'mdi:map-marker',
      battery: 'mdi:battery',
      time_info: 'mdi:clock-outline',
      media: 'mdi:music',
      sensor: 'mdi:gauge',
      device_state: 'mdi:wifi',
      attribute: 'mdi:code-tags',
      toggle: 'mdi:toggle-switch',
    };
    return icons[type];
  }

  private _formatLocation(state: string): string {
    if (state === 'home') return 'Home';
    if (state === 'not_home') return 'Away';
    // Capitalize first letter of zone name
    return state.charAt(0).toUpperCase() + state.slice(1).replace(/_/g, ' ');
  }

  private _formatTimeInfo(personState: any, format: 'relative' | 'absolute' | 'duration'): string {
    const lastChanged = new Date(personState.last_changed);
    const now = new Date();

    switch (format) {
      case 'absolute':
        return lastChanged.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      case 'duration': {
        const diff = now.getTime() - lastChanged.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        return `${minutes}m`;
      }

      case 'relative':
      default: {
        const diff = now.getTime() - lastChanged.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (hours > 24) {
          const days = Math.floor(hours / 24);
          return `${days} day${days > 1 ? 's' : ''} ago`;
        }
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
      }
    }
  }

  private _getBatteryIcon(level: number): string {
    if (level >= 90) return 'mdi:battery';
    if (level >= 80) return 'mdi:battery-90';
    if (level >= 70) return 'mdi:battery-80';
    if (level >= 60) return 'mdi:battery-70';
    if (level >= 50) return 'mdi:battery-60';
    if (level >= 40) return 'mdi:battery-50';
    if (level >= 30) return 'mdi:battery-40';
    if (level >= 20) return 'mdi:battery-30';
    if (level >= 10) return 'mdi:battery-20';
    return 'mdi:battery-10';
  }

  private _getBatteryColor(level: number): string {
    if (level >= 50) return '#4CAF50';
    if (level >= 20) return '#FF9800';
    return '#F44336';
  }

  private _getBannerBackground(bannerSettings: any, hass: HomeAssistant): string {
    switch (bannerSettings.background_type) {
      case 'image':
        return `background-image: url(${bannerSettings.background_image}); background-size: cover; background-position: center;`;

      case 'gradient':
        const dir = bannerSettings.gradient_direction || 'to-bottom-right';
        const cssDir = dir.replace('to-', 'to ').replace('-', ' ');
        return `background: linear-gradient(${cssDir}, ${bannerSettings.gradient_start}, ${bannerSettings.gradient_end});`;

      case 'color':
        return `background: ${bannerSettings.background_color};`;

      case 'entity':
        if (bannerSettings.background_entity) {
          const state = hass.states[bannerSettings.background_entity];
          const picture = state?.attributes?.entity_picture;
          if (picture) {
            const url = this._resolveEntityPicture(picture, hass);
            return `background-image: url(${url}); background-size: cover; background-position: center;`;
          }
        }
        return 'background: var(--primary-color);';

      default:
        return '';
    }
  }

  private _resolveEntityPicture(picture: string, hass: HomeAssistant): string {
    if (!picture) return '';

    // Already an absolute URL
    if (picture.startsWith('http') || picture.startsWith('data:')) {
      return picture;
    }

    // Relative URL starting with / - prepend Home Assistant URL
    if (picture.startsWith('/')) {
      const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
      return `${baseUrl.replace(/\/$/, '')}${picture}`;
    }

    // Return as-is for other cases
    return picture;
  }

  // ============================================
  // VALIDATION
  // ============================================

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const peopleModule = module as PeopleModule;

    if (!peopleModule.person_entity) {
      errors.push('Person entity is required');
    }

    if (
      ![
        'compact',
        'banner',
        'horizontal_compact',
        'horizontal_detailed',
        'header',
        'music_overlay',
      ].includes(peopleModule.layout_style)
    ) {
      errors.push('Invalid layout style');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ============================================
  // STYLES
  // ============================================

  getStyles(): string {
    return this._getPreviewStyles();
  }

  private _getEditorStyles(): string {
    return `
      .module-general-settings {
        padding: 0;
      }

      .settings-section {
        background: var(--card-background-color, var(--ha-card-background));
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        border: 1px solid var(--divider-color);
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--primary-color);
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      }

      .section-description {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 16px;
      }

      .field-container {
        margin-bottom: 16px;
      }

      .field-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 8px;
      }

      /* Number Range Control - Standard slider pattern */
      .number-range-control {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .range-slider {
        flex: 1;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color, #424242);
        outline: none;
        cursor: pointer;
      }

      .range-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .range-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .range-slider::-moz-range-track {
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color, #424242);
        cursor: pointer;
      }

      .range-input {
        width: 72px !important;
        max-width: 72px !important;
        min-width: 72px !important;
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
        -moz-appearance: textfield;
      }

      .range-input::-webkit-outer-spin-button,
      .range-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      .range-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .range-reset-btn {
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
      }

      .range-reset-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border-color: var(--primary-color);
      }

      .range-reset-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .color-row {
        display: flex;
        gap: 16px;
      }

      .color-field {
        flex: 1;
      }

      .position-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .position-option {
        padding: 8px;
        text-align: center;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        text-transform: capitalize;
        transition: all 0.2s ease;
      }

      .position-option:hover {
        border-color: var(--primary-color);
      }

      .position-option.selected {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .layout-style-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .layout-style-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px 8px;
        border: 2px solid var(--divider-color);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .layout-style-option:hover {
        border-color: var(--primary-color);
      }

      .layout-style-option.selected {
        background: rgba(var(--rgb-primary-color), 0.1);
        border-color: var(--primary-color);
      }

      .layout-style-option ha-icon {
        --mdc-icon-size: 24px;
        color: var(--primary-text-color);
      }

      .layout-style-option span {
        font-size: 11px;
        text-align: center;
      }

      .button-group {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .option-btn {
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
      }

      .option-btn:hover {
        border-color: var(--primary-color);
      }

      .option-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .option-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      /* Data Items Builder Styles */
      .data-items-section {
        background: var(--secondary-background-color);
      }

      .data-items-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }

      /* Data item expansion panels */
      ha-expansion-panel.data-item-panel {
        --ha-card-border-radius: 8px;
        --expansion-panel-summary-padding: 0;
        --expansion-panel-content-padding: 12px;
        margin-bottom: 8px;
      }

      ha-expansion-panel.data-item-panel::part(summary) {
        padding: 0;
        min-height: unset;
      }

      ha-expansion-panel.data-item-panel::part(content) {
        padding: 12px;
      }

      ha-expansion-panel.data-item-panel.dragging {
        opacity: 0.5;
      }

      ha-expansion-panel.data-item-panel.drag-over {
        outline: 2px dashed var(--primary-color);
        outline-offset: -2px;
      }

      .data-item-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        width: 100%;
        box-sizing: border-box;
      }

      .drag-handle {
        cursor: grab;
        color: var(--secondary-text-color);
        padding: 4px;
        flex-shrink: 0;
      }

      .drag-handle:active {
        cursor: grabbing;
      }

      .item-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(var(--rgb-primary-color), 0.1);
        border-radius: 6px;
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .item-icon ha-icon {
        --mdc-icon-size: 18px;
      }

      .item-info {
        flex: 1;
        min-width: 0;
      }

      .item-type {
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .item-label {
        font-size: 11px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item-action-btn {
        width: 28px;
        height: 28px;
        padding: 0;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        color: var(--secondary-text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .item-action-btn:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .item-action-btn.delete:hover {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }

      .item-action-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .data-item-content {
        padding-top: 8px;
      }

      /* Styling section for data items */
      .styling-section {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color);
      }

      .section-subtitle {
        font-size: 12px;
        font-weight: 600;
        color: var(--primary-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
      }

      .layout-badge {
        display: inline-block;
        padding: 2px 8px;
        background: rgba(var(--rgb-primary-color), 0.15);
        color: var(--primary-color);
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        margin-left: 8px;
        vertical-align: middle;
      }

      .color-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .color-label {
        font-size: 13px;
        color: var(--primary-text-color);
      }

      .slider-row {
        margin-bottom: 12px;
      }

      .slider-label {
        display: block;
        font-size: 13px;
        color: var(--primary-text-color);
        margin-bottom: 8px;
      }

      /* Corner radius controls */
      .field-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .link-corners-btn {
        width: 32px;
        height: 32px;
        padding: 0;
        border: 1px solid var(--divider-color);
        background: transparent;
        border-radius: 6px;
        cursor: pointer;
        color: var(--secondary-text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .link-corners-btn:hover {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .link-corners-btn.linked {
        background: rgba(var(--rgb-primary-color), 0.1);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .link-corners-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .corner-radius-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 8px;
      }

      .corner-control {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .corner-control.top-left {
        justify-content: flex-start;
      }

      .corner-control.top-right {
        justify-content: flex-end;
      }

      .corner-control.bottom-left {
        justify-content: flex-start;
      }

      .corner-control.bottom-right {
        justify-content: flex-end;
      }

      .corner-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--secondary-text-color);
        width: 20px;
        text-align: center;
      }

      .corner-input {
        width: 60px;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color, var(--ha-card-background));
        color: var(--primary-text-color);
        font-size: 13px;
        text-align: center;
      }

      .corner-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .add-item-container {
        margin-top: 8px;
      }

      .add-item-select {
        width: 100%;
        padding: 10px 12px;
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        background: transparent;
        color: var(--primary-text-color);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .add-item-select:hover {
        border-color: var(--primary-color);
      }

      .add-item-select:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    `;
  }

  private _getPreviewStyles(): string {
    return `
      /* Base People Module Styles */
      .people-module {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        box-sizing: border-box;
      }

      /* Background filter support - use pseudo-element to blur background without blurring content */
      .people-module[style*="--bg-filter"]::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--bg-color, transparent);
        background-image: var(--bg-image, none);
        background-size: var(--bg-size, cover);
        background-position: var(--bg-position, center);
        background-repeat: var(--bg-repeat, no-repeat);
        filter: var(--bg-filter);
        border-radius: inherit;
        z-index: -1;
        pointer-events: none;
      }

      /* Avatar Styles */
      .people-avatar {
        position: relative;
        border-radius: 50%;
        overflow: visible;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color, var(--ha-card-background));
      }

      .people-avatar img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      .people-avatar ha-icon {
        color: var(--secondary-text-color);
      }

      .people-avatar-badge {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--card-background-color, white);
      }

      .people-avatar-badge ha-icon {
        --mdc-icon-size: 14px;
        color: white;
      }

      .people-avatar-badge--top-left { top: -4px; left: -4px; }
      .people-avatar-badge--top-right { top: -4px; right: -4px; }
      .people-avatar-badge--bottom-left { bottom: -4px; left: -4px; }
      .people-avatar-badge--bottom-right { bottom: -4px; right: -4px; }

      /* Name Styles */
      .people-name {
        width: 100%;
      }

      /* Data Items Styles */
      .people-data-items {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }

      .people-data-items--row {
        flex-direction: row;
      }

      .people-data-items--column {
        flex-direction: column;
        align-items: center;
      }

      .people-data-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .people-data-item ha-icon {
        flex-shrink: 0;
      }

      .people-data-item-label {
        font-size: 12px;
        display: inline-block;
      }

      .people-data-item-value {
        font-weight: 500;
        display: inline-block;
      }

      /* Data List Styles (for detailed layout) */
      .people-data-list {
        width: 100%;
      }

      .people-data-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .people-data-row:last-child {
        border-bottom: none;
      }

      .people-data-row-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .people-data-row-left ha-icon {
        --mdc-icon-size: 20px;
      }

      .people-data-row-value {
        font-weight: 500;
      }

      /* Location Badge */
      .people-location-badge,
      .people-battery-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
      }

      .people-location-badge ha-icon,
      .people-battery-badge ha-icon {
        --mdc-icon-size: 18px;
      }

      .people-location-text {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .people-duration {
        opacity: 0.7;
      }

      /* Compact Layout */
      .people-module--compact {
        padding: 16px;
        text-align: center;
      }

      /* Banner Layout */
      .people-module--banner {
        position: relative;
        overflow: hidden;
        padding: 0;
      }

      .people-banner {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 0;
      }

      .people-banner-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1;
        height: inherit;
      }

      .people-banner-content {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 16px;
        padding-top: 60px;
      }

      .people-banner-side {
        flex: 1;
        display: flex;
        justify-content: center;
      }

      .people-banner-info {
        position: relative;
        z-index: 2;
        padding: 16px;
        background: transparent;
      }

      /* Horizontal Compact Layout */
      .people-module--horizontal-compact {
        flex-direction: row;
        align-items: center;
        padding: 12px 16px;
      }

      .people-info-column {
        flex: 1;
        min-width: 0;
      }

      .people-info-header {
        margin-bottom: 4px;
      }

      /* Horizontal Detailed Layout */
      .people-module--horizontal-detailed {
        flex-direction: row;
        align-items: flex-start;
        padding: 16px;
      }

      .people-detailed-info {
        flex: 1;
        min-width: 0;
      }

      .people-detailed-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .people-detailed-items {
        width: 100%;
      }

      /* Header Layout */
      .people-module--header {
        padding: 12px 16px;
      }

      .people-header-badges {
        width: 100%;
        margin-bottom: 8px;
      }

      .people-header-badges-row {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: flex-end;
      }

      .people-badge {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .people-badge ha-icon {
        --mdc-icon-size: 14px;
        color: white;
      }

      .people-badge.home {
        background: #4CAF50;
      }

      .people-badge.away {
        background: #FF5722;
      }

      .people-header-main {
        display: flex;
        align-items: center;
        width: 100%;
      }

      .people-header-info {
        flex: 1;
        min-width: 0;
      }

      .people-header-items {
        display: flex;
        flex-wrap: wrap;
        margin-top: 12px;
      }

      /* Music Overlay Layout */
      .people-module--music-overlay {
        position: relative;
        overflow: hidden;
        padding: 16px;
        background: transparent;
      }

      .people-music-blur-bg {
        position: absolute;
        top: -20px;
        left: -20px;
        right: -20px;
        bottom: -20px;
        background-size: cover;
        background-position: center;
        /* filter and opacity applied via inline style for dynamic control */
        z-index: 0;
      }

      .people-music-header {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 8px;
      }

      .people-music-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .people-music-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 20px;
        margin-top: 8px;
      }

      .people-music-info ha-icon {
        --mdc-icon-size: 16px;
        color: white;
      }

      .people-music-text {
        display: flex;
        flex-direction: column;
      }

      .people-music-title {
        font-size: 13px;
        font-weight: 500;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
      }

      .people-music-artist {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.8);
      }

      .people-music-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.2);
      }

      .people-music-progress-bar {
        height: 100%;
        background: var(--primary-color);
        transition: width 1s linear;
      }
    `;
  }
}

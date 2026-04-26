import { TemplateResult, html, nothing } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, AreaSummaryModule, AreaSummaryStylePreset, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { ucAreaDiscoveryService, RoomSummaryModel } from '../services/uc-area-discovery-service';
import type { TapActionConfig } from '../components/ultra-link';
import { getImageUrl, uploadImage } from '../utils/image-upload';
import { ucToastService } from '../services/uc-toast-service';
import '../components/ultra-color-picker';

/**
 * Area / Room Summary — smart room tiles scoped to a Home Assistant area.
 */
export class UltraAreaSummaryModule extends BaseUltraModule {
  handlesOwnDesignStyles = true;

  metadata: ModuleMetadata = {
    type: 'area_summary',
    title: 'Area / Room Summary',
    description:
      'Smart room tile that auto-pulls lights, climate, motion, doors, media, humidity, and presence by Home Assistant area',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:floor-plan',
    category: 'data',
    tags: ['area', 'room', 'summary', 'climate', 'lights', 'presence', 'dashboard'],
  };

  private _resolveCache = new Map<
    string,
    {
      requestId: number;
      loading: boolean;
      context: 'live' | 'ha-preview' | 'dashboard';
      areaId: string;
      /** Last known-good model. Kept while refreshing to prevent skeleton flashing. */
      model?: RoomSummaryModel;
      error?: string;
      updatedAt: number;
    }
  >();
  private _nextRequestId = 0;

  private _areaOptions: { value: string; label: string }[] = [];
  private _areasLoadState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';

  /** Remount `ha-entity-picker` after each selection so the combobox clears reliably. */
  private _pinnedEntityPickerKey = 0;
  private _hiddenEntityPickerKey = 0;

  createDefault(id?: string, _hass?: HomeAssistant): AreaSummaryModule {
    return {
      id: id || this.generateId('area_summary'),
      type: 'area_summary',
      area_id: '',
      title: '',
      temperature_entity: '',
      humidity_entity: '',
      tile_border_radius: 20,
      room_icon: '',
      accent_color: '',
      show_quick_entity_names: false,
      style_preset: 'iconic_soft',
      max_quick_actions: 6,
      discovery: {},
      hidden_entities: [],
      pinned_entities: [],
      room_background_type: 'none',
      room_background_image: '',
      room_background_image_entity: '',
      room_background_overlay: 55,
      tap_action: { action: 'more-info' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    const m = module as AreaSummaryModule;
    const errors = [...base.errors];
    if (!m.area_id?.trim()) {
      errors.push('Select a Home Assistant area');
    }
    return { valid: errors.length === 0, errors };
  }

  /**
   * Resolve key — captures inputs that change the resolved entity list (area, pins, hides,
   * toggles, max count). Visual-only properties (photo overlay, background URLs, style preset)
   * are excluded so slider tweaks don't refetch.
   */
  private resolveKey(m: AreaSummaryModule): string {
    return [
      m.area_id?.trim() || '',
      String(m.max_quick_actions ?? 6),
      (m.temperature_entity || '').trim(),
      (m.humidity_entity || '').trim(),
      (m.hidden_entities || []).slice().sort().join(','),
      (m.pinned_entities || []).slice().sort().join(','),
      JSON.stringify(m.discovery || {}),
    ].join('::');
  }

  private resolveCacheKeyForModule(
    m: AreaSummaryModule,
    context: 'live' | 'ha-preview' | 'dashboard'
  ): string {
    return `${context}::${m.id}::${this.resolveKey(m)}`;
  }

  private latestModelForModule(
    moduleId: string,
    areaId: string,
    context: 'live' | 'ha-preview' | 'dashboard'
  ): RoomSummaryModel | undefined {
    let best: { updatedAt: number; model: RoomSummaryModel } | undefined;
    const prefix = `${context}::${moduleId}::`;
    for (const [k, v] of this._resolveCache.entries()) {
      if (!k.startsWith(prefix)) continue;
      if (!v.model || v.areaId !== areaId) continue;
      if (!best || v.updatedAt > best.updatedAt) {
        best = { updatedAt: v.updatedAt, model: v.model };
      }
    }
    return best?.model;
  }

  /** Force a fresh resolve next time renderPreview runs for this module id. */
  private invalidateResolveCacheForModule(moduleId: string): void {
    if (!moduleId) return;
    for (const k of [...this._resolveCache.keys()]) {
      if (k.includes(`::${moduleId}::`)) this._resolveCache.delete(k);
    }
  }

  private touchResolve(
    hass: HomeAssistant,
    module: AreaSummaryModule,
    context: 'live' | 'ha-preview' | 'dashboard'
  ): void {
    const areaId = (module.area_id || '').trim();
    if (!areaId) {
      this.invalidateResolveCacheForModule(module.id);
      return;
    }
    const cacheKey = this.resolveCacheKeyForModule(module, context);
    const current = this._resolveCache.get(cacheKey);
    if (current) return;

    const requestId = ++this._nextRequestId;
    // Keep the previous model for the same area while refreshing so pin/hide updates don't flash.
    this._resolveCache.set(cacheKey, {
      requestId,
      loading: true,
      context,
      areaId,
      model: this.latestModelForModule(module.id, areaId, context),
      error: undefined,
      updatedAt: Date.now(),
    });

    void ucAreaDiscoveryService
      .resolveRoom(hass, module)
      .then(model => {
        const latest = this._resolveCache.get(cacheKey);
        if (!latest || latest.requestId !== requestId) return;
        this._resolveCache.set(cacheKey, {
          requestId,
          loading: false,
          context,
          areaId,
          model,
          error: undefined,
          updatedAt: Date.now(),
        });
        this.requestUpdate();
        this.triggerPreviewUpdate();
      })
      .catch(err => {
        const latest = this._resolveCache.get(cacheKey);
        if (!latest || latest.requestId !== requestId) return;
        this._resolveCache.set(cacheKey, {
          requestId,
          loading: false,
          context,
          areaId,
          model: latest.model,
          error: String((err as Error)?.message || err),
          updatedAt: Date.now(),
        });
        this.requestUpdate();
        this.triggerPreviewUpdate();
      });
  }

  private ensureAreaOptions(hass: HomeAssistant): void {
    if (this._areasLoadState === 'loading' || this._areasLoadState === 'ready') return;
    this._areasLoadState = 'loading';
    void ucAreaDiscoveryService
      .listAreas(hass)
      .then(rows => {
        this._areaOptions = rows.map(r => ({ value: r.area_id, label: r.name }));
        this._areasLoadState = 'ready';
        this.triggerPreviewUpdate();
      })
      .catch(() => {
        this._areasLoadState = 'error';
        this.triggerPreviewUpdate();
      });
  }

  private accent(m: AreaSummaryModule): string {
    const c = m.accent_color?.trim();
    return c || 'var(--primary-color)';
  }

  private roomTitle(m: AreaSummaryModule, model: RoomSummaryModel | undefined, lang: string): string {
    return (
      (m.title || '').trim() ||
      model?.area_name ||
      localize('editor.area_summary.room', lang, 'Room')
    );
  }

  private roomHeroIcon(m: AreaSummaryModule): string {
    return (m.room_icon || '').trim() || 'mdi:sofa-outline';
  }

  private presetOptions(
    lang: string
  ): Array<{ value: AreaSummaryStylePreset; label: string }> {
    return [
      {
        value: 'iconic_soft',
        label: localize('editor.area_summary.preset.iconic_soft', lang, 'Iconic soft'),
      },
      {
        value: 'graph_glow',
        label: localize('editor.area_summary.preset.graph_glow', lang, 'Graph glow'),
      },
      {
        value: 'compact_controls',
        label: localize('editor.area_summary.preset.compact_controls', lang, 'Compact controls'),
      },
      {
        value: 'photo_overlay',
        label: localize('editor.area_summary.preset.photo_overlay', lang, 'Photo overlay'),
      },
    ];
  }

  private discoveryKeys(): Array<{
    key: keyof NonNullable<AreaSummaryModule['discovery']>;
    labelKey: string;
    descKey: string;
    defaultLabel: string;
    defaultDesc: string;
  }> {
    return [
      { key: 'lights', labelKey: 'disc_lights', descKey: 'disc_lights_d', defaultLabel: 'Lights', defaultDesc: 'Include lights in this area.' },
      { key: 'climate', labelKey: 'disc_climate', descKey: 'disc_climate_d', defaultLabel: 'Climate', defaultDesc: 'Include thermostats / climate entities.' },
      { key: 'temperature', labelKey: 'disc_temp', descKey: 'disc_temp_d', defaultLabel: 'Temperature sensors', defaultDesc: 'Sensors with device class temperature.' },
      { key: 'humidity', labelKey: 'disc_hum', descKey: 'disc_hum_d', defaultLabel: 'Humidity sensors', defaultDesc: 'Sensors with device class humidity.' },
      { key: 'motion', labelKey: 'disc_motion', descKey: 'disc_motion_d', defaultLabel: 'Motion / occupancy', defaultDesc: 'Binary sensors for motion or occupancy.' },
      { key: 'doors_windows', labelKey: 'disc_dw', descKey: 'disc_dw_d', defaultLabel: 'Doors & windows', defaultDesc: 'Open/close sensors for doors and windows.' },
      { key: 'media', labelKey: 'disc_media', descKey: 'disc_media_d', defaultLabel: 'Media players', defaultDesc: 'Speakers, TVs, and media players.' },
      { key: 'presence', labelKey: 'disc_presence', descKey: 'disc_presence_d', defaultLabel: 'People', defaultDesc: 'Person entities assigned to the area.' },
      { key: 'covers', labelKey: 'disc_covers', descKey: 'disc_covers_d', defaultLabel: 'Covers', defaultDesc: 'Blinds, curtains, garage doors.' },
      { key: 'fans', labelKey: 'disc_fans', descKey: 'disc_fans_d', defaultLabel: 'Fans', defaultDesc: 'Fan entities.' },
      { key: 'locks', labelKey: 'disc_locks', descKey: 'disc_locks_d', defaultLabel: 'Locks', defaultDesc: 'Lock entities.' },
      { key: 'switches', labelKey: 'disc_switches', descKey: 'disc_switches_d', defaultLabel: 'Switches', defaultDesc: 'Switch entities (non-light).' },
    ];
  }

  private badgeTapAction(entityId: string): TapActionConfig {
    const domain = entityId.includes('.') ? entityId.split('.')[0] : '';
    if (domain === 'light' || domain === 'switch' || domain === 'fan') {
      return { action: 'toggle', entity: entityId };
    }
    return { action: 'more-info', entity: entityId };
  }

  private onBadgeClick(
    ev: Event,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    module: AreaSummaryModule,
    entityId: string
  ): void {
    ev.stopPropagation();
    const action = this.badgeTapAction(entityId);
    void this.handleModuleAction(action, hass, ev.currentTarget as HTMLElement, config, entityId, module);
  }

  private onLightsPillClick(ev: Event, hass: HomeAssistant, module: AreaSummaryModule, model: RoomSummaryModel): void {
    ev.stopPropagation();
    if (!module.area_id?.trim()) return;
    const service = model.lights_on > 0 ? 'turn_off' : 'turn_on';
    void hass.callService('light', service, {}, { area_id: module.area_id });
  }

  private onClimatePillClick(
    ev: Event,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    module: AreaSummaryModule,
    climateId?: string
  ): void {
    ev.stopPropagation();
    if (!climateId) return;
    void this.handleModuleAction({ action: 'more-info', entity: climateId }, hass, ev.currentTarget as HTMLElement, config, climateId, module);
  }

  private statLine(model: RoomSummaryModel, lang: string): string {
    const parts: string[] = [];
    if (model.temperature_label) parts.push(model.temperature_label);
    if (model.humidity_label) parts.push(model.humidity_label);
    if (!parts.length) {
      return localize('editor.area_summary.no_climate', lang, 'No climate data');
    }
    return parts.join(' · ');
  }

  private effectiveRoomBackgroundType(m: AreaSummaryModule): 'none' | 'upload' | 'entity' | 'url' {
    const t = m.room_background_type;
    if (t && t !== 'none') return t;
    if ((m.room_background_url || '').trim()) return 'url';
    return 'none';
  }

  private resolveBackgroundImageUrl(hass: HomeAssistant, m: AreaSummaryModule): string {
    const t = this.effectiveRoomBackgroundType(m);
    if (t === 'none') return '';
    if (t === 'url' || t === 'upload') {
      const path = (m.room_background_image || m.room_background_url || '').trim();
      if (!path) return '';
      return getImageUrl(hass, path);
    }
    if (t === 'entity') {
      const ent = (m.room_background_image_entity || '').trim();
      if (!ent || !hass.states[ent]) return '';
      const pic = hass.states[ent].attributes.entity_picture;
      if (typeof pic === 'string' && pic.trim()) return getImageUrl(hass, pic);
      return '';
    }
    return '';
  }

  private async handleRoomBackgroundUpload(
    event: Event,
    updateModule: (updates: Partial<CardModule>) => void,
    hass: HomeAssistant
  ): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const imagePath = await uploadImage(hass, file);
      updateModule({
        room_background_type: 'upload',
        room_background_image: imagePath,
      });
      this.triggerPreviewUpdate();
    } catch (err) {
      console.error('Area summary background upload failed:', err);
      ucToastService.error(
        localize('editor.area_summary.bg_upload_error', hass?.locale?.language || 'en', 'Upload failed')
      );
    } finally {
      input.value = '';
    }
  }

  private entityShortName(hass: HomeAssistant, entityId: string): string {
    const name = hass.states[entityId]?.attributes?.friendly_name;
    if (typeof name === 'string' && name.trim()) return name.trim();
    const short = entityId.split('.').pop() || entityId;
    return short.replace(/_/g, ' ');
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as AreaSummaryModule;
    const lang = hass?.locale?.language || 'en';
    const stylePreset = m.style_preset || 'iconic_soft';
    const isPhotoStyle = stylePreset === 'photo_overlay';
    this.ensureAreaOptions(hass);

    const areaFieldOptions = (() => {
      if (this._areasLoadState !== 'ready' || !this._areaOptions.length) {
        return [{ value: '', label: localize('editor.area_summary.area_loading', lang, 'Loading areas…') }];
      }
      const opts = this._areaOptions.map(o => ({ value: o.value, label: o.label }));
      if (m.area_id?.trim() && !opts.some(o => o.value === m.area_id)) {
        opts.unshift({ value: m.area_id, label: m.area_id });
      }
      return opts;
    })();

    return html`
      ${this.injectUcFormStyles()}
      <style>
        .uc-ar-editor-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 8px 0 12px 0;
        }
        .uc-ar-editor-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--primary-color);
          color: var(--text-primary-color, #fff);
          border-radius: 16px;
          font-size: 13px;
          max-width: 100%;
          position: relative;
        }
        .uc-ar-editor-chip--hidden {
          background: var(--error-color);
        }
        .uc-ar-editor-chip:hover {
          opacity: 0.95;
          padding-right: 30px;
        }
        .uc-ar-editor-chip .uc-ar-chip-remove {
          cursor: pointer;
          font-size: 16px;
          opacity: 0;
          position: absolute;
          right: 8px;
          transition: opacity 0.15s ease;
        }
        .uc-ar-editor-chip:hover .uc-ar-chip-remove {
          opacity: 1;
        }
        .uc-ar-editor-chip-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 220px;
        }
        .uc-ar-pin-hide-box .field-section ha-form {
          width: 100%;
        }
      </style>
      <div class="module-general-settings">
        ${this.renderSettingsSection(
          localize('editor.area_summary.section_area', lang, 'Area'),
          localize('editor.area_summary.section_area_desc', lang, 'Choose the Home Assistant area this tile represents.'),
          [
            {
              title: localize('editor.area_summary.area', lang, 'Area'),
              description: localize('editor.area_summary.area_desc', lang, 'Entities are discovered from the area registry.'),
              hass,
              data: { area_id: m.area_id || '' },
              schema: [
                this.selectField(
                  'area_id',
                  this._areasLoadState === 'error'
                    ? [{ value: '', label: localize('editor.area_summary.area_error', lang, 'Could not load areas') }]
                    : areaFieldOptions
                ),
              ],
              onChange: (e: CustomEvent) => {
                const v = String(e.detail.value?.area_id ?? '');
                updateModule({ area_id: v });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.area_summary.title', lang, 'Title override'),
              description: localize('editor.area_summary.title_desc', lang, 'Leave blank to use the area name.'),
              hass,
              data: { title: m.title || '' },
              schema: [{ name: 'title', selector: { text: {} } }],
              onChange: (e: CustomEvent) => {
                updateModule({ title: e.detail.value?.title ?? '' });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.area_summary.room_icon', lang, 'Room icon'),
              description: localize('editor.area_summary.room_icon_desc', lang, 'Large icon shown on the tile.'),
              hass,
              data: { room_icon: m.room_icon || '' },
              schema: [{ name: 'room_icon', selector: { icon: {} } }],
              onChange: (e: CustomEvent) => {
                updateModule({ room_icon: e.detail.value?.room_icon ?? '' });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.area_summary.temperature_entity', lang, 'Temperature entity override'),
              description: localize(
                'editor.area_summary.temperature_entity_desc',
                lang,
                'Optional. Use this entity for temperature instead of auto-discovery.'
              ),
              hass,
              data: { temperature_entity: m.temperature_entity || '' },
              schema: [
                {
                  name: 'temperature_entity',
                  selector: { entity: { domain: ['sensor', 'climate', 'weather'] } },
                },
              ],
              onChange: (e: CustomEvent) => {
                updateModule({ temperature_entity: e.detail.value?.temperature_entity ?? '' });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.area_summary.humidity_entity', lang, 'Humidity entity override'),
              description: localize(
                'editor.area_summary.humidity_entity_desc',
                lang,
                'Optional. Use this entity for humidity instead of auto-discovery.'
              ),
              hass,
              data: { humidity_entity: m.humidity_entity || '' },
              schema: [
                {
                  name: 'humidity_entity',
                  selector: { entity: { domain: ['sensor', 'climate', 'weather'] } },
                },
              ],
              onChange: (e: CustomEvent) => {
                updateModule({ humidity_entity: e.detail.value?.humidity_entity ?? '' });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.area_summary.accent', lang, 'Accent color')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.area_summary.accent_desc',
              lang,
              'Used for highlights and active states.'
            )}
          </div>
          <ultra-color-picker
            style="width: 100%;"
            .value=${m.accent_color || ''}
            .defaultValue=${'var(--primary-color)'}
            .hass=${hass}
            @value-changed=${(e: CustomEvent) => {
              updateModule({ accent_color: e.detail.value });
              this.triggerPreviewUpdate();
            }}
          ></ultra-color-picker>
        </div>

        ${this.renderSettingsSection(
          localize('editor.area_summary.section_look', lang, 'Look & feel'),
          localize(
            'editor.area_summary.section_look_desc',
            lang,
            'Visual preset for the tile. Photo background options appear when you choose the Photo overlay preset.'
          ),
          [
            {
              title: localize('editor.area_summary.preset', lang, 'Style preset'),
              description: localize('editor.area_summary.preset_desc', lang, 'Layout and decoration style for the tile.'),
              hass,
              data: { style_preset: stylePreset },
              schema: [this.selectField('style_preset', this.presetOptions(lang))],
              onChange: (e: CustomEvent) => {
                updateModule({ style_preset: e.detail.value?.style_preset || 'iconic_soft' });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.area_summary.max_quick', lang, 'Max quick actions'),
              description: localize('editor.area_summary.max_quick_desc', lang, 'Circular shortcuts for discovered entities.'),
              hass,
              data: { max_quick_actions: m.max_quick_actions ?? 6 },
              schema: [this.numberField('max_quick_actions', 1, 12, 1)],
              onChange: (e: CustomEvent) =>
                updateModule({ max_quick_actions: Number(e.detail.value?.max_quick_actions ?? 6) }),
            },
            {
              title: localize('editor.area_summary.show_entity_names', lang, 'Show entity names'),
              description: localize(
                'editor.area_summary.show_entity_names_desc',
                lang,
                'Show each quick action friendly name next to its icon.'
              ),
              hass,
              data: { show_quick_entity_names: m.show_quick_entity_names === true },
              schema: [this.booleanField('show_quick_entity_names')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_quick_entity_names: e.detail.value?.show_quick_entity_names === true,
                });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        <div class="settings-section" style="margin-bottom: 24px;">
          ${this.renderSliderField(
            localize('editor.area_summary.tile_radius', lang, 'Tile border radius'),
            localize('editor.area_summary.tile_radius_desc', lang, 'Adjust corner roundness for the room tile.'),
            m.tile_border_radius ?? 20,
            20,
            0,
            48,
            1,
            (v: number) => {
              updateModule({ tile_border_radius: v });
              this.triggerPreviewUpdate();
            },
            'px'
          )}
        </div>
        ${isPhotoStyle
          ? html`
              <div
                class="settings-section uc-ar-photo-bg-editor"
                style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
              >
                ${this.renderFieldSection(
                  localize('editor.area_summary.room_bg_type', lang, 'Photo background source'),
                  localize(
                    'editor.area_summary.room_bg_type_desc',
                    lang,
                    'Choose none, upload, an entity picture, or a URL for the Photo overlay tile.'
                  ),
                  hass,
                  {
                    room_background_type:
                      m.room_background_type && m.room_background_type !== 'none'
                        ? m.room_background_type
                        : this.effectiveRoomBackgroundType(m),
                  },
                  [
                    this.selectField('room_background_type', [
                      { value: 'none', label: localize('editor.area_summary.room_bg_none', lang, 'None') },
                      { value: 'upload', label: localize('editor.area_summary.room_bg_upload', lang, 'Upload') },
                      { value: 'entity', label: localize('editor.area_summary.room_bg_entity', lang, 'Entity image') },
                      { value: 'url', label: localize('editor.area_summary.room_bg_url', lang, 'Image URL') },
                    ]),
                  ],
                  (e: CustomEvent) => {
                    const next = e.detail.value?.room_background_type || 'none';
                    if (next === 'none') {
                      updateModule({
                        room_background_type: 'none',
                        room_background_image: '',
                        room_background_image_entity: '',
                        room_background_url: '',
                      });
                    } else {
                      updateModule({ room_background_type: next });
                    }
                    this.triggerPreviewUpdate();
                  }
                )}
                ${this.effectiveRoomBackgroundType(m) === 'url'
                  ? html`
                      <div style="margin-top: 8px;">
                        ${this.renderFieldSection(
                          localize('editor.area_summary.room_bg_image_url', lang, 'Image URL'),
                          localize(
                            'editor.area_summary.room_bg_image_url_desc',
                            lang,
                            'Direct URL to an image (https://… or /local/…).'
                          ),
                          hass,
                          { room_background_image: m.room_background_image || m.room_background_url || '' },
                          [this.textField('room_background_image')],
                          (e: CustomEvent) => {
                            updateModule({
                              room_background_image: e.detail.value?.room_background_image ?? '',
                            });
                            this.triggerPreviewUpdate();
                          }
                        )}
                      </div>
                    `
                  : ''}
                ${this.effectiveRoomBackgroundType(m) === 'upload'
                  ? html`
                      <div style="margin-top: 12px;">
                        <div class="field-title">
                          ${localize('editor.area_summary.room_bg_upload_btn', lang, 'Upload file')}
                        </div>
                        <div class="field-description">
                          ${localize(
                            'editor.area_summary.room_bg_upload_btn_desc',
                            lang,
                            'Choose an image from your device. It is stored in your Ultra Card uploads path.'
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color);"
                          @change=${(e: Event) => this.handleRoomBackgroundUpload(e, updateModule, hass)}
                        />
                        ${(m.room_background_image || '').trim()
                          ? html`<div style="margin-top: 8px; font-size: 12px; color: var(--success-color);">
                              ${localize('editor.area_summary.room_bg_uploaded', lang, 'Image ready')}
                            </div>`
                          : ''}
                      </div>
                    `
                  : ''}
                ${this.effectiveRoomBackgroundType(m) === 'entity'
                  ? html`
                      <div style="margin-top: 8px;">
                        ${this.renderEntityPickerWithVariables(
                          hass,
                          config,
                          'room_background_image_entity',
                          m.room_background_image_entity || '',
                          (value: string) => {
                            updateModule({ room_background_image_entity: value });
                            this.triggerPreviewUpdate();
                          },
                          undefined,
                          localize('editor.area_summary.room_bg_entity_label', lang, 'Image entity')
                        )}
                        <div
                          class="field-description"
                          style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);"
                        >
                          ${localize(
                            'editor.area_summary.room_bg_entity_help',
                            lang,
                            'Pick an entity that exposes entity_picture (person, camera, media player, etc.).'
                          )}
                        </div>
                      </div>
                    `
                  : ''}
                ${this.effectiveRoomBackgroundType(m) !== 'none'
                  ? html`
                      <div style="margin-top: 16px;">
                        ${this.renderSliderField(
                          localize('editor.area_summary.bg_overlay', lang, 'Background overlay %'),
                          localize(
                            'editor.area_summary.bg_overlay_desc',
                            lang,
                            'Darkens the photo for readability.'
                          ),
                          m.room_background_overlay ?? 55,
                          55,
                          0,
                          90,
                          5,
                          (v: number) => {
                            updateModule({ room_background_overlay: v });
                            this.triggerPreviewUpdate();
                          },
                          '%'
                        )}
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}

        ${this.renderSettingsSection(
          localize('editor.area_summary.section_discovery', lang, 'Discovery'),
          localize('editor.area_summary.section_discovery_desc', lang, 'Choose which categories appear as quick actions.'),
          this.discoveryKeys().map(
            ({
              key,
              labelKey,
              descKey,
              defaultLabel,
              defaultDesc,
            }) => ({
              title: localize(`editor.area_summary.${labelKey}`, lang, defaultLabel),
              description: localize(`editor.area_summary.${descKey}`, lang, defaultDesc),
              hass,
              data: { [key]: m.discovery?.[key] !== false },
              schema: [this.booleanField(key)],
              onChange: (e: CustomEvent) => {
                const v = e.detail.value?.[key];
                    updateModule({
                      discovery: { ...(m.discovery || {}), [key]: v !== false },
                    });
                this.triggerPreviewUpdate();
              },
            })
          )
        )}

        <div
          class="settings-section uc-ar-pin-hide-box"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.area_summary.section_pin', lang, 'Pin & hide')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 20px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.area_summary.section_pin_desc',
              lang,
              'Pin entities to the front of the quick row, or hide them entirely.'
            )}
          </div>

          <div
            class="field-title"
            style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
          >
            ${localize('editor.area_summary.pinned', lang, 'Pinned entities')}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.area_summary.pinned_desc',
              lang,
              'Shown first in the quick row when they exist in the area. Remove with the × on a chip.'
            )}
          </div>
          <div class="uc-ar-editor-chips">
            ${(m.pinned_entities || []).map(
              id => html`
                <div class="uc-ar-editor-chip" title=${id}>
                  <span class="uc-ar-editor-chip-label">${this.entityShortName(hass, id)}</span>
                  <ha-icon
                    class="uc-ar-chip-remove"
                    icon="mdi:close"
                    @click=${() => {
                      updateModule({
                        pinned_entities: (m.pinned_entities || []).filter(x => x !== id),
                      });
                      this.triggerPreviewUpdate();
                    }}
                  ></ha-icon>
                </div>
              `
            )}
          </div>
          ${keyed(
            this._pinnedEntityPickerKey,
            this.renderFieldSection(
              localize('editor.area_summary.pinned_add', lang, 'Add pinned entity'),
              '',
              hass,
              { uc_area_pin_entity: '' },
              [{ name: 'uc_area_pin_entity', selector: { entity: {} } }],
              (e: CustomEvent) => {
                const id = String(e.detail.value?.uc_area_pin_entity ?? '').trim();
                if (!id) return;
                if ((m.pinned_entities || []).includes(id)) return;
                this._pinnedEntityPickerKey += 1;
                updateModule({ pinned_entities: [...(m.pinned_entities || []), id] });
                this.triggerPreviewUpdate();
              }
            )
          )}

          <div
            style="margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--divider-color);"
          >
            <div
              class="field-title"
              style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
            >
              ${localize('editor.area_summary.hidden', lang, 'Hidden entities')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              ${localize(
                'editor.area_summary.hidden_desc',
                lang,
                'Excluded from the tile and from aggregates. Remove with the × on a chip.'
              )}
            </div>
            <div class="uc-ar-editor-chips">
              ${(m.hidden_entities || []).map(
                id => html`
                  <div class="uc-ar-editor-chip uc-ar-editor-chip--hidden" title=${id}>
                    <span class="uc-ar-editor-chip-label">${this.entityShortName(hass, id)}</span>
                    <ha-icon
                      class="uc-ar-chip-remove"
                      icon="mdi:close"
                      @click=${() => {
                        updateModule({
                          hidden_entities: (m.hidden_entities || []).filter(x => x !== id),
                        });
                        this.triggerPreviewUpdate();
                      }}
                    ></ha-icon>
                  </div>
                `
              )}
            </div>
            ${keyed(
              this._hiddenEntityPickerKey,
              this.renderFieldSection(
                localize('editor.area_summary.hidden_add', lang, 'Add hidden entity'),
                '',
                hass,
                { uc_area_hidden_entity: '' },
                [{ name: 'uc_area_hidden_entity', selector: { entity: {} } }],
                (e: CustomEvent) => {
                  const id = String(e.detail.value?.uc_area_hidden_entity ?? '').trim();
                  if (!id) return;
                  if ((m.hidden_entities || []).includes(id)) return;
                  this._hiddenEntityPickerKey += 1;
                  updateModule({ hidden_entities: [...(m.hidden_entities || []), id] });
                  this.triggerPreviewUpdate();
                }
              )
            )}
          </div>
        </div>

        ${this._areasLoadState === 'error'
          ? html`<div class="form-description" style="color: var(--error-color); margin-top: 8px;">
              ${localize(
                'editor.area_summary.registry_error',
                lang,
                'Could not load the area registry. Check Home Assistant connectivity and refresh.'
              )}
            </div>`
          : nothing}
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as AreaSummaryModule;
    const lang = hass?.locale?.language || 'en';
    const preset: AreaSummaryStylePreset = m.style_preset || 'iconic_soft';
    const context = previewContext || 'dashboard';

    if (!m.area_id?.trim()) {
      return html`
        ${this.injectModuleStyles()}
        <div class="uc-ar uc-ar--empty">
          ${this.renderGradientErrorState(
            localize('editor.area_summary.pick_area', lang, 'Select an area'),
            localize(
              'editor.area_summary.pick_area_desc',
              lang,
              'Choose a Home Assistant area in the General tab to discover entities automatically.'
            ),
            'mdi:floor-plan'
          )}
        </div>
      `;
    }

    this.touchResolve(hass, m, context);
    const stateKey = this.resolveCacheKeyForModule(m, context);
    const state = this._resolveCache.get(stateKey);

    if (!state) {
      return html`
        ${this.injectModuleStyles()}
        <div class="uc-ar uc-ar--skeleton" style="--uc-ar-accent: ${this.accent(m)}">
          <div class="uc-ar-skel-line"></div>
          <div class="uc-ar-skel-line short"></div>
          <div class="uc-ar-skel-blob"></div>
        </div>
      `;
    }

    // If we're refreshing but have a previous model, keep rendering it to avoid flashing.
    if (state.loading && state.model) {
      // fall through and render using state.model
    } else if (state.loading) {
      return html`
        ${this.injectModuleStyles()}
        <div class="uc-ar uc-ar--skeleton" style="--uc-ar-accent: ${this.accent(m)}">
          <div class="uc-ar-skel-line"></div>
          <div class="uc-ar-skel-line short"></div>
          <div class="uc-ar-skel-blob"></div>
        </div>
      `;
    }

    // If a refresh failed but we still have a previous model, keep showing it.
    if (state.error && !state.model) {
      return html`
        ${this.injectModuleStyles()}
        <div class="uc-ar uc-ar--empty">
          ${this.renderGradientErrorState(
            localize('editor.area_summary.resolve_error', lang, 'Could not load area'),
            state.error,
            'mdi:alert-circle-outline'
          )}
          <button
            type="button"
            class="uc-ar-retry"
            @click=${() => {
              this._resolveCache.delete(stateKey);
              ucAreaDiscoveryService.invalidateRegistryCache();
              this.touchResolve(hass, m, context);
              this.requestUpdate();
            }}
          >
            ${localize('editor.area_summary.retry', lang, 'Retry')}
          </button>
        </div>
      `;
    }

    if (!state.model) {
      return html`
        ${this.injectModuleStyles()}
        <div class="uc-ar uc-ar--skeleton" style="--uc-ar-accent: ${this.accent(m)}">
          <div class="uc-ar-skel-line"></div>
        </div>
      `;
    }
    const model = state.model;
    const title = this.roomTitle(m, model, lang);
    const heroIcon = this.roomHeroIcon(m);
    const accent = this.accent(m);
    const radius = Math.max(0, Math.min(48, m.tile_border_radius ?? 20));
    const stat = this.statLine(model, lang);
    const primary = m.tap_action?.entity?.trim()
      ? m.tap_action.entity.trim()
      : model.primary_entity_id || '';

    const resolvedTap: TapActionConfig =
      m.tap_action && m.tap_action.action
        ? (m.tap_action as TapActionConfig)
        : primary
          ? ({ action: 'more-info', entity: primary } as TapActionConfig)
          : ({ action: 'nothing' } as TapActionConfig);

    const gestures = this.createGestureHandlers(
      m.id,
      {
        tap_action: resolvedTap,
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        entity: primary,
        module: m,
      },
      hass,
      config
    );

    const showNames = m.show_quick_entity_names === true;
    const badges = (
      align: 'column' | 'row',
      opts?: { iconicInlineNames?: boolean; rowSpread?: boolean }
    ) => {
      const iconicInline = !!opts?.iconicInlineNames && showNames;
      const rowSpread = !!opts?.rowSpread;
      return html`
        <div
          class="uc-ar-badges uc-ar-badges--${align} ${showNames ? 'uc-ar-badges--names' : ''} ${iconicInline
            ? 'uc-ar-badges--iconic-inline'
            : ''} ${rowSpread ? 'uc-ar-badges--row-spread' : ''}"
          @pointerdown=${(e: Event) => e.stopPropagation()}
        >
          ${model.quick_entities.map(q => {
            const label = this.entityShortName(hass, q.entity_id);
            return html`
              <div class="uc-ar-badge-cell ${iconicInline ? 'uc-ar-badge-cell--iconic-inline' : ''}">
                ${iconicInline
                  ? html`<div class="uc-ar-badge-name uc-ar-badge-name--inline-start">${label}</div>`
                  : nothing}
                <button
                  type="button"
                  class="uc-ar-badge ${q.active ? 'is-active' : ''}"
                  title=${hass.states[q.entity_id]?.attributes?.friendly_name || q.entity_id}
                  aria-label=${label}
                  @click=${(e: Event) => this.onBadgeClick(e, hass, config, m, q.entity_id)}
                >
                  <ha-icon icon=${q.icon}></ha-icon>
                </button>
                ${showNames && !iconicInline ? html`<div class="uc-ar-badge-name">${label}</div>` : nothing}
              </div>
            `;
          })}
        </div>
      `;
    };

    const pills =
      preset === 'compact_controls'
        ? html`
            <div class="uc-ar-pills" @pointerdown=${(e: Event) => e.stopPropagation()}>
              ${model.lights_total > 0
                ? html`
                    <button
                      type="button"
                      class="uc-ar-pill ${model.lights_on > 0 ? 'is-active' : ''}"
                      @click=${(e: Event) => this.onLightsPillClick(e, hass, m, model)}
                    >
                      <ha-icon icon="mdi:lightbulb-group-outline"></ha-icon>
                      <span
                        >${localize('editor.area_summary.pill_lights', lang, 'Lights')}
                        ${model.lights_on}/${model.lights_total}</span
                      >
                    </button>
                  `
                : nothing}
              ${model.climate_entity_id
                ? html`
                    <button
                      type="button"
                      class="uc-ar-pill ${hass.states[model.climate_entity_id]?.state !== 'off' ? 'is-active' : ''}"
                      @click=${(e: Event) =>
                        this.onClimatePillClick(e, hass, config, m, model.climate_entity_id)}
                    >
                      <ha-icon icon="mdi:thermostat"></ha-icon>
                      <span>${hass.states[model.climate_entity_id]?.state || 'climate'}</span>
                    </button>
                  `
                : nothing}
            </div>
          `
        : nothing;

    let inner: TemplateResult;

    if (preset === 'graph_glow') {
      inner = html`
        <div class="uc-ar uc-ar--graph" style="--uc-ar-accent: ${accent}; --uc-ar-radius: ${radius}px;">
          <svg class="uc-ar-wave" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0,45 C60,10 120,70 180,40 S300,5 400,50 L400,80 L0,80 Z"
              fill="currentColor"
              opacity="0.12"
            ></path>
            <path
              d="M0,50 C80,20 160,60 240,35 S320,15 400,40"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              opacity="0.35"
            ></path>
          </svg>
          <div class="uc-ar-graph-top">
            <div class="uc-ar-graph-title">${title}</div>
            <div class="uc-ar-graph-stats">
              <span>${model.temperature_label || '—'}</span>
              <span class="dim">${model.humidity_label || ''}</span>
            </div>
          </div>
          <div class="uc-ar-graph-bottom">
            <div class="uc-ar-graph-icon">
              <ha-icon icon=${heroIcon}></ha-icon>
            </div>
            ${badges('row', { rowSpread: true })}
          </div>
          ${pills}
        </div>
      `;
    } else if (preset === 'compact_controls') {
      inner = html`
        <div class="uc-ar uc-ar--compact" style="--uc-ar-accent: ${accent}; --uc-ar-radius: ${radius}px;">
          <div class="uc-ar-compact-grid">
            <div class="uc-ar-compact-left">
              <div class="uc-ar-compact-icon">
                <ha-icon icon=${heroIcon}></ha-icon>
              </div>
              <div>
                <div class="uc-ar-name">${title}</div>
                <div class="uc-ar-sub">${stat}</div>
                <div class="uc-ar-micro">
                  ${model.lights_total
                    ? localize('editor.area_summary.lights_line', lang, '{on} of {total} lights on')
                        .replace('{on}', String(model.lights_on))
                        .replace('{total}', String(model.lights_total))
                    : ''}
                </div>
              </div>
            </div>
            <div class="uc-ar-compact-right">${pills}</div>
          </div>
          ${badges('row', { rowSpread: true })}
        </div>
      `;
    } else if (preset === 'photo_overlay') {
      const bg = this.resolveBackgroundImageUrl(hass, m);
      const ov = Math.max(0, Math.min(90, m.room_background_overlay ?? 55));
      const t = ov / 90;
      const gradTop = 0.12 + t * 0.58;
      const gradBot = 0.38 + t * 0.52;
      inner = html`
        <div
          class="uc-ar uc-ar--photo"
          style="--uc-ar-accent: ${accent}; --uc-ar-radius: ${radius}px; ${bg
            ? `background-image: linear-gradient(to bottom, rgba(0,0,0,${gradTop.toFixed(
                3
              )}), rgba(0,0,0,${gradBot.toFixed(3)})), url(${JSON.stringify(bg)}); background-size: cover; background-position: center;`
            : ''}"
        >
          <div class="uc-ar-photo-top">
            <div class="uc-ar-name">${title}</div>
            <div class="uc-ar-sub">${stat}</div>
          </div>
          <div class="uc-ar-photo-bottom">
            <div class="uc-ar-photo-hero">
              <ha-icon icon=${heroIcon}></ha-icon>
            </div>
            ${badges('row', { rowSpread: true })}
          </div>
        </div>
      `;
    } else {
      inner = html`
        <div class="uc-ar uc-ar--iconic" style="--uc-ar-accent: ${accent}; --uc-ar-radius: ${radius}px;">
          <div class="uc-ar-iconic-top">
            <div class="uc-ar-name">${title}</div>
            <div class="uc-ar-sub">${stat}</div>
          </div>
          <div class="uc-ar-iconic-bottom">
            <div class="uc-ar-blob">
              <div class="uc-ar-blob-inner">
                <ha-icon icon=${heroIcon}></ha-icon>
              </div>
            </div>
            ${badges('column', showNames ? { iconicInlineNames: true } : undefined)}
          </div>
          ${pills}
        </div>
      `;
    }

    return html`
      ${this.injectModuleStyles()}
      <div
        class="uc-ar-host"
        @pointerdown=${gestures.onPointerDown}
        @pointerup=${gestures.onPointerUp}
        @pointerleave=${gestures.onPointerLeave}
        @pointercancel=${gestures.onPointerCancel}
      >
        ${inner}
      </div>
    `;
  }

  private injectModuleStyles(): TemplateResult {
    return html`<style>
      ${this.getStyles()}
    </style>`;
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      .uc-ar-host { display:block; width:100%; }
      .uc-ar {
        position: relative;
        border-radius: var(--uc-ar-radius, 20px);
        overflow: hidden;
        min-height: 132px;
        color: var(--primary-text-color);
        background: var(--card-background-color, var(--ha-card-background, #fff));
        box-shadow: 0 4px 18px rgba(0,0,0,0.08);
      }
      .uc-ar--empty { padding: 0; }
      .uc-ar-retry {
        margin-top: 12px;
        padding: 8px 14px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        cursor: pointer;
        color: var(--primary-text-color);
      }
      .uc-ar--skeleton {
        padding: 18px 16px;
        background: linear-gradient(135deg, var(--secondary-background-color), var(--card-background-color));
      }
      .uc-ar-skel-line {
        height: 14px;
        border-radius: 8px;
        background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06));
        background-size: 200% 100%;
        animation: ucArShimmer 1.2s ease-in-out infinite;
        margin-bottom: 10px;
      }
      .uc-ar-skel-line.short { width: 55%; }
      .uc-ar-skel-blob {
        margin-top: 28px;
        width: 88px;
        height: 88px;
        border-radius: 50%;
        background: rgba(0,0,0,0.05);
        animation: ucArShimmer 1.2s ease-in-out infinite;
      }
      @keyframes ucArShimmer {
        0% { background-position: 0% 0%; }
        100% { background-position: -200% 0%; }
      }
      @media (prefers-reduced-motion: reduce) {
        .uc-ar-skel-line, .uc-ar-skel-blob { animation: none; }
      }

      .uc-ar-name {
        font-weight: 800;
        font-size: 1.05rem;
        letter-spacing: 0.02em;
        color: var(--uc-ar-accent, var(--primary-color));
      }
      .uc-ar-sub {
        margin-top: 4px;
        font-size: 0.85rem;
        color: var(--secondary-text-color);
      }
      .uc-ar-micro {
        margin-top: 6px;
        font-size: 0.78rem;
        color: var(--secondary-text-color);
      }

      /* Iconic soft */
      .uc-ar--iconic {
        padding: 16px 14px 18px 16px;
      }
      .uc-ar-iconic-top { position: relative; z-index: 1; }
      .uc-ar-iconic-bottom {
        margin-top: 18px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        position: relative;
        z-index: 1;
      }
      .uc-ar-iconic-bottom > .uc-ar-badges--column {
        flex: 1;
        min-width: 0;
      }
      .uc-ar-blob {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--uc-ar-accent) 35%, transparent), transparent 70%);
        display: grid;
        place-items: center;
      }
      .uc-ar-blob-inner {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--uc-ar-accent) 22%, var(--card-background-color));
        display: grid;
        place-items: center;
        color: var(--uc-ar-accent);
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--uc-ar-accent) 35%, transparent);
      }
      .uc-ar-blob-inner ha-icon {
        --mdc-icon-size: 38px;
      }

      /* Badges */
      .uc-ar-badges { display: flex; gap: 8px; align-items: center; }
      .uc-ar-badges--column { flex-direction: column; align-items: flex-end; }
      .uc-ar-badges--row { flex-wrap: wrap; justify-content: flex-end; margin-top: 8px; }
      .uc-ar-badges--iconic-inline.uc-ar-badges--column {
        align-items: flex-end;
        width: auto;
        max-width: 100%;
      }
      .uc-ar-badge-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        max-width: 88px;
      }
      .uc-ar-badge-cell--iconic-inline {
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        width: auto;
        max-width: 100%;
      }
      .uc-ar-badge-name {
        font-size: 10px;
        line-height: 1.15;
        color: var(--secondary-text-color);
        text-align: center;
        max-width: 84px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .uc-ar-badge-name--inline-start {
        text-align: left;
        width: 120px;
        max-width: 120px;
        flex: 0 1 auto;
        min-width: 0;
        -webkit-line-clamp: 2;
        align-self: center;
      }
      .uc-ar-badges--row.uc-ar-badges--row-spread {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(52px, 1fr));
        width: 100%;
        justify-items: center;
        align-items: start;
        gap: 10px 6px;
        box-sizing: border-box;
      }
      .uc-ar-badges--row.uc-ar-badges--row-spread .uc-ar-badge-cell {
        width: 100%;
        max-width: none;
        min-width: 0;
        align-items: center;
      }
      .uc-ar-badges--names.uc-ar-badges--column { gap: 10px; }
      .uc-ar-badges--names.uc-ar-badges--row:not(.uc-ar-badges--row-spread) { gap: 10px 12px; }
      .uc-ar-badge {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: grid;
        place-items: center;
        background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
        color: var(--secondary-text-color);
        transition: transform 0.12s ease, background 0.12s ease, color 0.12s ease;
      }
      .uc-ar-badge:hover { transform: translateY(-1px); }
      .uc-ar-badge:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .uc-ar-badge.is-active {
        background: color-mix(in srgb, var(--uc-ar-accent) 22%, transparent);
        color: var(--uc-ar-accent);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--uc-ar-accent) 45%, transparent);
      }
      .uc-ar-badge ha-icon { --mdc-icon-size: 20px; }

      /* Pills (compact) */
      .uc-ar-pills {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
        margin-top: 8px;
      }
      .uc-ar-pill {
        border: none;
        border-radius: 999px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 0.82rem;
        font-weight: 600;
        background: color-mix(in srgb, var(--secondary-text-color) 10%, transparent);
        color: var(--secondary-text-color);
      }
      .uc-ar-pill.is-active {
        background: color-mix(in srgb, var(--uc-ar-accent) 18%, transparent);
        color: var(--uc-ar-accent);
      }
      .uc-ar-pill ha-icon { --mdc-icon-size: 18px; }

      /* Graph glow */
      .uc-ar--graph {
        padding: 14px 14px 12px 14px;
        background: linear-gradient(180deg, color-mix(in srgb, var(--uc-ar-accent) 8%, var(--card-background-color)), var(--card-background-color));
      }
      .uc-ar-wave {
        position: absolute;
        inset: auto 0 0 0;
        height: 80px;
        width: 100%;
        color: var(--uc-ar-accent);
        pointer-events: none;
      }
      .uc-ar-graph-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        position: relative;
        z-index: 1;
      }
      .uc-ar-graph-stats {
        text-align: right;
        font-weight: 700;
        font-size: 1.1rem;
      }
      .uc-ar-graph-stats .dim {
        display: block;
        margin-top: 2px;
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .uc-ar-graph-bottom {
        margin-top: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        position: relative;
        z-index: 1;
      }
      .uc-ar-graph-bottom > .uc-ar-badges {
        flex: 1;
        min-width: 0;
      }
      .uc-ar-graph-icon {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        color: #fff;
        background: linear-gradient(135deg, var(--uc-ar-accent), color-mix(in srgb, var(--uc-ar-accent) 55%, #000));
        box-shadow: 0 8px 22px color-mix(in srgb, var(--uc-ar-accent) 35%, transparent);
      }
      .uc-ar-graph-icon ha-icon { --mdc-icon-size: 28px; }

      /* Compact */
      .uc-ar--compact { padding: 12px 12px 10px 12px; }
      .uc-ar-compact-grid {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }
      .uc-ar-compact-left { display: flex; gap: 10px; align-items: center; min-width: 0; }
      .uc-ar-compact-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--uc-ar-accent) 16%, var(--secondary-background-color));
        color: var(--uc-ar-accent);
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }
      .uc-ar-compact-icon ha-icon { --mdc-icon-size: 26px; }
      .uc-ar-compact-right { flex-shrink: 0; }

      /* Photo overlay */
      .uc-ar--photo {
        min-height: 150px;
        padding: 16px 14px 14px 14px;
        color: #fff;
        background-size: cover;
        background-position: center;
        background-color: #1e1e1e;
      }
      .uc-ar--photo .uc-ar-name { color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.45); }
      .uc-ar--photo .uc-ar-sub { color: rgba(255,255,255,0.88); text-shadow: 0 1px 8px rgba(0,0,0,0.45); }
      .uc-ar-photo-top { position: relative; z-index: 1; }
      .uc-ar-photo-bottom {
        margin-top: 36px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 10px;
        position: relative;
        z-index: 1;
      }
      .uc-ar-photo-bottom > .uc-ar-badges {
        flex: 1;
        min-width: 0;
      }
      .uc-ar-photo-hero {
        width: 56px;
        height: 56px;
        border-radius: 18px;
        display: grid;
        place-items: center;
        background: color-mix(in srgb, var(--uc-ar-accent) 55%, transparent);
        border: 1px solid rgba(255,255,255,0.25);
        box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      }
      .uc-ar-photo-hero ha-icon { --mdc-icon-size: 30px; color: #fff; }
      .uc-ar--photo .uc-ar-badge {
        background: rgba(255,255,255,0.12);
        color: #fff;
      }
      .uc-ar--photo .uc-ar-badge.is-active {
        background: color-mix(in srgb, var(--uc-ar-accent) 55%, transparent);
        color: #fff;
      }
      .uc-ar--photo .uc-ar-badge-name {
        color: rgba(255, 255, 255, 0.82);
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.45);
      }
    `;
  }

  requestUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ultra-card-update'));
      this.triggerPreviewUpdate();
    }
  }
}

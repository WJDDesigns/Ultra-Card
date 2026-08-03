import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, PlantCareEntry, PlantCareModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { hasProAccess, renderProLockUI } from '../utils/uc-pro-access';
import { todoSupportsDescription } from '../services/uc-record-store';
import { getImageUrl } from '../utils/image-upload';
import {
  ucPlantCareService,
  buildComputeConfig,
  computeStatuses,
  seasonalPhaseLabel,
  seasonalWaterFactor,
  sortStatuses,
  summarizeStatuses,
  DEFAULT_MOISTURE_THRESHOLD,
  MAX_SEASONAL_FACTOR,
  MIN_SEASONAL_FACTOR,
  type CareEvent,
  type CareKind,
  type DiscoveredPlant,
  type PlantCareState,
  type PlantStatus,
} from '../services/uc-plant-care-service';

/** Per-card preview state. Modules are singletons, so everything is keyed by module id. */
interface PlantPreviewState {
  events: CareEvent[];
  loading: boolean;
  lastFetchedAt: number;
  fetchKey: string;
  error: string;
  /** Inline undo affordance shown right after a care action. */
  undo: { plantId: string; plantName: string; kind: CareKind; at: number } | null;
  busyPlantId: string;
  /** Plant whose detail strip is expanded in the list layout. */
  openPlantId: string;
}

/** Resolved colors for one render pass. */
interface PlantPalette {
  happy: string;
  thirsty: string;
  overdue: string;
  text: string;
  secondary: string;
  cardBg: string;
}

/** Per-card editor state (expanded rows, import panel). */
interface PlantEditorState {
  expanded: Set<string>;
  advanced: Set<string>;
  importOpen: boolean;
  importScanned: boolean;
  discovered: DiscoveredPlant[];
  message: string;
}

const MS_PER_DAY = 86400000;
const UNDO_WINDOW_MS = 20000;

/**
 * Plant Care (Pro) — a roster of houseplants with watering and fertilizing
 * schedules, optional moisture sensors, and a one-tap care log backed by a
 * Local To-do helper.
 */
export class UltraPlantCareModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'plant_care',
    title: 'Plant Care',
    description: 'Watering and fertilizing schedules with optional moisture sensors',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:sprout',
    category: 'data',
    tags: ['pro', 'premium', 'plants', 'garden', 'watering', 'schedule', 'moisture', 'houseplants'],
  };

  private _preview = new Map<string, PlantPreviewState>();
  private _editor = new Map<string, PlantEditorState>();

  // ── Defaults & validation ──────────────────────────────────────────────────

  createDefault(id?: string, _hass?: HomeAssistant): PlantCareModule {
    return {
      id: id || this.generateId('plant_care'),
      type: 'plant_care',

      todo_entity: '',
      plants: [],

      layout: 'grid',
      map_image: '',
      columns: 3,

      default_water_interval_days: 7,
      default_fertilize_interval_days: 30,
      moisture_source: 'both',

      seasonal_adjust: false,
      summer_factor: 0.75,
      winter_factor: 1.5,

      title: '',
      show_title: true,
      show_summary_bar: true,
      show_photos: true,
      show_moisture: true,
      show_next_due: true,
      show_fertilize: true,
      overdue_first: true,
      history_limit: 20,

      thirsty_color: '',
      happy_color: '',
      overdue_color: '',
      text_color: '',
      secondary_text_color: '',
      card_background_color: '',

      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as PlantCareModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (!m.todo_entity) errors.push('Select a to-do list to store the care history');
    return { valid: errors.length === 0, errors };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as PlantCareModule;
    const ids: string[] = [];
    if (m.todo_entity) ids.push(m.todo_entity);
    for (const plant of m.plants || []) {
      if (plant.moisture_entity) ids.push(plant.moisture_entity);
      if (plant.temperature_entity) ids.push(plant.temperature_entity);
      if (plant.illuminance_entity) ids.push(plant.illuminance_entity);
    }
    return ids;
  }

  // ── General tab ────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as PlantCareModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.plant_care.pro_description',
          lang,
          'Plant Care is a Pro feature: a visual roster of your houseplants with watering and fertilizing schedules, one-tap care logging, and optional moisture sensors.'
        )
      );
    }

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings">
        ${this._renderStorageSection(m, hass, updateModule, lang)}
        ${this._renderPlantsSection(m, hass, updateModule, lang)}
        ${this._renderLayoutSection(m, hass, updateModule, lang)}
        ${this._renderDisplaySection(m, hass, updateModule, lang)}
        ${this._renderScheduleSection(m, hass, updateModule, lang)}
        ${this._renderAdvancedSection(m, hass, updateModule, lang)}
        ${this._renderColorsSection(m, hass, updateModule, lang)}
      </div>
    `;
  }

  // ── General tab: storage ───────────────────────────────────────────────────

  private _renderStorageSection(
    m: PlantCareModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const chosen = m.todo_entity || '';
    const descriptionsOk = !chosen || !hass ? true : todoSupportsDescription(hass, chosen);

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.plant_care.storage_section', lang, 'Storage')}
        </div>
        <div class="uc-pc-note">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <span>
            ${localize(
              'editor.plant_care.storage_help',
              lang,
              'Watering history lives on a to-do list so every device in the house sees the same log. Create one under Settings → Devices & Services → Helpers → To-do list (Local to-do), name it something like “Plant Care”, then pick it here.'
            )}
          </span>
        </div>
        ${this.renderFieldSection(
          localize('editor.plant_care.todo_entity', lang, 'Care history list'),
          localize(
            'editor.plant_care.todo_entity_desc',
            lang,
            'A Local To-do helper used as storage. Nothing else should write to it.'
          ),
          hass,
          { todo_entity: chosen },
          [{ name: 'todo_entity', selector: { entity: { domain: 'todo' } } }],
          (e: CustomEvent) => {
            updateModule({ todo_entity: e.detail.value?.todo_entity ?? '' } as Partial<CardModule>);
            const state = this._preview.get(m.id);
            if (state) state.lastFetchedAt = 0;
            this.triggerPreviewUpdate();
          }
        )}
        ${!descriptionsOk
          ? html`
              <div class="uc-pc-warn">
                <ha-icon icon="mdi:alert-outline"></ha-icon>
                <span>
                  ${localize(
                    'editor.plant_care.todo_no_description',
                    lang,
                    'This list cannot store item descriptions (the Shopping List behaves this way). Care history still works, but the stored data is appended to each item title and looks messy in the Home Assistant to-do panel. A Local To-do helper avoids that.'
                  )}
                </span>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  // ── General tab: plants ────────────────────────────────────────────────────

  private _renderPlantsSection(
    m: PlantCareModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const plants = m.plants || [];
    const editor = this._ensureEditor(m.id);

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.plant_care.plants_section', lang, 'Plants')}
        </div>
        <div class="uc-pc-section-desc">
          ${localize(
            'editor.plant_care.plants_section_desc',
            lang,
            'Every plant you want to keep an eye on. A watering interval is all that is required — sensors are optional.'
          )}
        </div>

        ${plants.length === 0
          ? html`<div class="uc-pc-empty-rows">
              ${localize(
                'editor.plant_care.no_plants_editor',
                lang,
                'No plants yet. Add one below, or import the plant entities you already have in Home Assistant.'
              )}
            </div>`
          : nothing}
        ${plants.map((plant, index) =>
          this._renderPlantRow(plant, index, m, hass, updateModule, lang)
        )}

        <button
          class="uc-pc-add-btn"
          type="button"
          @click=${() => this._addPlant(m, updateModule, lang)}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${localize('editor.plant_care.add_plant', lang, 'Add plant')}
        </button>

        ${this._renderImportPanel(m, hass, updateModule, lang, editor)}
      </div>
    `;
  }

  private _renderPlantRow(
    plant: PlantCareEntry,
    index: number,
    m: PlantCareModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const editor = this._ensureEditor(m.id);
    const expanded = editor.expanded.has(plant.id);
    const plants = m.plants || [];
    const defaultWater = m.default_water_interval_days ?? 7;
    const defaultFertilize = m.default_fertilize_interval_days ?? 0;
    const waterEvery = plant.water_interval_days ?? defaultWater;
    const thumb = this._imageUrl(hass, plant.image);

    const summaryBits: string[] = [];
    if (plant.location) summaryBits.push(plant.location);
    summaryBits.push(
      localize('editor.plant_care.row_every_days', lang, 'water every {days} days').replace(
        '{days}',
        String(waterEvery)
      )
    );

    return html`
      <div class="uc-pc-row ${expanded ? 'expanded' : ''}">
        <div class="uc-pc-row-head">
          <div class="uc-pc-thumb">
            ${thumb
              ? html`<img
                  src=${thumb}
                  alt=""
                  @error=${(e: Event) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />`
              : nothing}
            <ha-icon icon=${plant.icon || 'mdi:flower'}></ha-icon>
          </div>
          <div class="uc-pc-row-text">
            <div class="uc-pc-row-name">
              ${plant.name || localize('editor.plant_care.unnamed_plant', lang, 'Unnamed plant')}
            </div>
            <div class="uc-pc-row-sub">${summaryBits.join(' · ')}</div>
          </div>
          <button
            class="uc-pc-icon-btn"
            type="button"
            ?disabled=${index === 0}
            title=${localize('editor.plant_care.move_up', lang, 'Move up')}
            aria-label=${localize('editor.plant_care.move_up', lang, 'Move up')}
            @click=${() => this._movePlant(m, index, -1, updateModule)}
          >
            <ha-icon icon="mdi:chevron-up"></ha-icon>
          </button>
          <button
            class="uc-pc-icon-btn"
            type="button"
            ?disabled=${index === plants.length - 1}
            title=${localize('editor.plant_care.move_down', lang, 'Move down')}
            aria-label=${localize('editor.plant_care.move_down', lang, 'Move down')}
            @click=${() => this._movePlant(m, index, 1, updateModule)}
          >
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </button>
          <button
            class="uc-pc-icon-btn expand ${expanded ? 'on' : ''}"
            type="button"
            title=${expanded
              ? localize('editor.plant_care.collapse', lang, 'Collapse')
              : localize('editor.plant_care.edit', lang, 'Edit')}
            aria-label=${expanded
              ? localize('editor.plant_care.collapse', lang, 'Collapse')
              : localize('editor.plant_care.edit', lang, 'Edit')}
            @click=${() => {
              if (expanded) editor.expanded.delete(plant.id);
              else editor.expanded.add(plant.id);
              this.triggerPreviewUpdate();
            }}
          >
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button
            class="uc-pc-icon-btn danger"
            type="button"
            title=${localize('editor.plant_care.delete_plant', lang, 'Delete plant')}
            aria-label=${localize('editor.plant_care.delete_plant', lang, 'Delete plant')}
            @click=${() => this._deletePlant(m, index, updateModule)}
          >
            <ha-icon icon="mdi:delete-outline"></ha-icon>
          </button>
        </div>

        ${expanded
          ? html`
              <div class="uc-pc-row-body">
                ${this.renderFieldSection(
                  localize('editor.plant_care.plant_name', lang, 'Name'),
                  localize(
                    'editor.plant_care.plant_name_desc',
                    lang,
                    'What you call this plant — “Monstera”, “Kitchen basil”.'
                  ),
                  hass,
                  { name: plant.name || '' },
                  [this.textField('name')],
                  (e: CustomEvent) =>
                    this._patchPlant(m, index, { name: e.detail.value?.name ?? '' }, updateModule)
                )}
                ${this.renderIconField(
                  localize('editor.plant_care.plant_icon', lang, 'Icon'),
                  localize(
                    'editor.plant_care.plant_icon_desc',
                    lang,
                    'Shown when there is no photo, and as the fallback if a photo fails to load.'
                  ),
                  hass,
                  plant.icon || '',
                  (value: string) => this._patchPlant(m, index, { icon: value }, updateModule)
                )}
                ${this.renderFileField(
                  localize('editor.plant_care.plant_photo', lang, 'Photo'),
                  localize(
                    'editor.plant_care.plant_photo_desc',
                    lang,
                    'Optional. A photo makes the grid layout much easier to scan.'
                  ),
                  hass,
                  plant.image || '',
                  (path: string) => this._patchPlant(m, index, { image: path }, updateModule)
                )}
                ${this.renderFieldSection(
                  localize('editor.plant_care.plant_location', lang, 'Location'),
                  localize(
                    'editor.plant_care.plant_location_desc',
                    lang,
                    'Optional room or spot, shown under the name.'
                  ),
                  hass,
                  { location: plant.location || '' },
                  [this.textField('location')],
                  (e: CustomEvent) =>
                    this._patchPlant(
                      m,
                      index,
                      { location: e.detail.value?.location ?? '' },
                      updateModule
                    )
                )}
                ${this.renderSliderField(
                  localize('editor.plant_care.plant_water_interval', lang, 'Water every'),
                  localize(
                    'editor.plant_care.plant_water_interval_desc',
                    lang,
                    'How often this plant wants water.'
                  ),
                  waterEvery,
                  defaultWater,
                  1,
                  90,
                  1,
                  (value: number) =>
                    this._patchPlant(m, index, { water_interval_days: value }, updateModule),
                  localize('editor.plant_care.unit_days', lang, ' days')
                )}
                ${plant.water_interval_days !== undefined
                  ? html`<button
                      class="uc-pc-linkbtn"
                      type="button"
                      @click=${() =>
                        this._clearPlantField(m, index, 'water_interval_days', updateModule)}
                    >
                      ${localize(
                        'editor.plant_care.use_default_water',
                        lang,
                        'Use the module default ({days} days)'
                      ).replace('{days}', String(defaultWater))}
                    </button>`
                  : nothing}
                ${this.renderSliderField(
                  localize('editor.plant_care.plant_fertilize_interval', lang, 'Fertilize every'),
                  localize(
                    'editor.plant_care.plant_fertilize_interval_desc',
                    lang,
                    'Set to 0 to turn fertilizing reminders off for this plant.'
                  ),
                  plant.fertilize_interval_days ?? defaultFertilize,
                  defaultFertilize,
                  0,
                  180,
                  1,
                  (value: number) =>
                    this._patchPlant(m, index, { fertilize_interval_days: value }, updateModule),
                  localize('editor.plant_care.unit_days', lang, ' days')
                )}
                ${this.renderFieldSection(
                  localize('editor.plant_care.plant_notes', lang, 'Notes'),
                  localize(
                    'editor.plant_care.plant_notes_desc',
                    lang,
                    'Optional reminder to yourself — “bottom water only”, “likes it dry”.'
                  ),
                  hass,
                  { notes: plant.notes || '' },
                  [this.textField('notes', true)],
                  (e: CustomEvent) =>
                    this._patchPlant(m, index, { notes: e.detail.value?.notes ?? '' }, updateModule)
                )}
                ${m.layout === 'map'
                  ? this._renderMapPlacement(plant, index, m, hass, updateModule, lang)
                  : nothing}
                ${this._renderSensorGroup(plant, index, m, hass, updateModule, lang)}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderSensorGroup(
    plant: PlantCareEntry,
    index: number,
    m: PlantCareModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const editor = this._ensureEditor(m.id);
    const open =
      editor.advanced.has(plant.id) ||
      !!plant.moisture_entity ||
      !!plant.temperature_entity ||
      !!plant.illuminance_entity;

    return html`
      <button
        class="uc-pc-subtoggle ${open ? 'on' : ''}"
        type="button"
        @click=${() => {
          if (editor.advanced.has(plant.id)) editor.advanced.delete(plant.id);
          else editor.advanced.add(plant.id);
          this.triggerPreviewUpdate();
        }}
      >
        <ha-icon icon=${open ? 'mdi:chevron-down' : 'mdi:chevron-right'}></ha-icon>
        ${localize('editor.plant_care.advanced_sensors', lang, 'Advanced sensors')}
      </button>
      ${open
        ? this.renderConditionalFieldsGroup(
            localize('editor.plant_care.advanced_sensors', lang, 'Advanced sensors'),
            html`
              <div class="uc-pc-note subtle">
                ${localize(
                  'editor.plant_care.advanced_sensors_desc',
                  lang,
                  'If this plant has a moisture probe, the live reading takes over from the schedule guess. Plants without one keep using the schedule.'
                )}
              </div>
              ${this.renderFieldSection(
                localize('editor.plant_care.moisture_entity', lang, 'Moisture sensor'),
                localize(
                  'editor.plant_care.moisture_entity_desc',
                  lang,
                  'A sensor reporting soil moisture as a percentage.'
                ),
                hass,
                { moisture_entity: plant.moisture_entity || '' },
                [{ name: 'moisture_entity', selector: { entity: { domain: ['sensor'] } } }],
                (e: CustomEvent) =>
                  this._patchPlant(
                    m,
                    index,
                    { moisture_entity: e.detail.value?.moisture_entity ?? '' },
                    updateModule
                  )
              )}
              ${this.renderSliderField(
                localize('editor.plant_care.moisture_threshold', lang, 'Thirsty below'),
                localize(
                  'editor.plant_care.moisture_threshold_desc',
                  lang,
                  'Readings under this percentage mean the plant wants water.'
                ),
                plant.moisture_threshold ?? DEFAULT_MOISTURE_THRESHOLD,
                DEFAULT_MOISTURE_THRESHOLD,
                0,
                100,
                1,
                (value: number) =>
                  this._patchPlant(m, index, { moisture_threshold: value }, updateModule),
                '%'
              )}
              ${this.renderFieldSection(
                localize('editor.plant_care.temperature_entity', lang, 'Temperature sensor'),
                localize(
                  'editor.plant_care.temperature_entity_desc',
                  lang,
                  'Optional. Shown on the plant detail, not used for scheduling.'
                ),
                hass,
                { temperature_entity: plant.temperature_entity || '' },
                [{ name: 'temperature_entity', selector: { entity: { domain: ['sensor'] } } }],
                (e: CustomEvent) =>
                  this._patchPlant(
                    m,
                    index,
                    { temperature_entity: e.detail.value?.temperature_entity ?? '' },
                    updateModule
                  )
              )}
              ${this.renderFieldSection(
                localize('editor.plant_care.illuminance_entity', lang, 'Light sensor'),
                localize(
                  'editor.plant_care.illuminance_entity_desc',
                  lang,
                  'Optional. Shown on the plant detail, not used for scheduling.'
                ),
                hass,
                { illuminance_entity: plant.illuminance_entity || '' },
                [{ name: 'illuminance_entity', selector: { entity: { domain: ['sensor'] } } }],
                (e: CustomEvent) =>
                  this._patchPlant(
                    m,
                    index,
                    { illuminance_entity: e.detail.value?.illuminance_entity ?? '' },
                    updateModule
                  )
              )}
            `
          )
        : nothing}
    `;
  }

  /**
   * Map coordinates. Clicking the image is the primary way to place a marker —
   * typing normalized coordinates is nobody's idea of a good time — with
   * sliders kept as an accessible fallback.
   */
  private _renderMapPlacement(
    plant: PlantCareEntry,
    index: number,
    m: PlantCareModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const mapUrl = this._imageUrl(hass, m.map_image);
    const x = clamp01(plant.x ?? 0.5);
    const y = clamp01(plant.y ?? 0.5);

    return this.renderConditionalFieldsGroup(
      localize('editor.plant_care.map_position', lang, 'Position on the map'),
      html`
        ${mapUrl
          ? html`
              <div class="uc-pc-note subtle">
                ${localize(
                  'editor.plant_care.map_position_help',
                  lang,
                  'Click the plan to drop this plant where it lives.'
                )}
              </div>
              <div
                class="uc-pc-map-pick"
                @click=${(e: MouseEvent) => {
                  const point = this._pointFromClick(e);
                  this._patchPlant(m, index, { x: point.x, y: point.y }, updateModule);
                }}
              >
                <img src=${mapUrl} alt="" draggable="false" />
                <span class="uc-pc-map-pin" style="left:${x * 100}%;top:${y * 100}%;">
                  <ha-icon icon=${plant.icon || 'mdi:flower'}></ha-icon>
                </span>
              </div>
            `
          : html`<div class="uc-pc-note subtle">
              ${localize(
                'editor.plant_care.map_position_no_image',
                lang,
                'Upload a floor plan under Layout to place plants by clicking. Until then, use the sliders below.'
              )}
            </div>`}
        ${this.renderSliderField(
          localize('editor.plant_care.map_x', lang, 'Horizontal position'),
          '',
          Math.round(x * 100),
          50,
          0,
          100,
          1,
          (value: number) => this._patchPlant(m, index, { x: value / 100 }, updateModule),
          '%'
        )}
        ${this.renderSliderField(
          localize('editor.plant_care.map_y', lang, 'Vertical position'),
          '',
          Math.round(y * 100),
          50,
          0,
          100,
          1,
          (value: number) => this._patchPlant(m, index, { y: value / 100 }, updateModule),
          '%'
        )}
      `
    );
  }

  private _renderImportPanel(
    m: PlantCareModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    editor: PlantEditorState
  ): TemplateResult {
    return html`
      <button
        class="uc-pc-secondary-btn"
        type="button"
        @click=${() => {
          editor.importOpen = !editor.importOpen;
          if (editor.importOpen && !editor.importScanned) {
            editor.discovered = ucPlantCareService.discoverPlants(hass);
            editor.importScanned = true;
          }
          editor.message = '';
          this.triggerPreviewUpdate();
        }}
      >
        <ha-icon icon="mdi:import"></ha-icon>
        ${localize('editor.plant_care.import_button', lang, 'Import from HA plant entities')}
      </button>

      ${editor.importOpen
        ? html`
            <div class="uc-pc-import">
              ${editor.discovered.length === 0
                ? html`<div class="uc-pc-note subtle">
                    ${localize(
                      'editor.plant_care.import_none',
                      lang,
                      'No plant.* entities found in Home Assistant. Add plants manually instead.'
                    )}
                  </div>`
                : html`
                    <div class="uc-pc-note subtle">
                      ${localize(
                        'editor.plant_care.import_help',
                        lang,
                        'Found these plant entities. Importing copies the name and any moisture sensor it could match — you can adjust everything afterwards.'
                      )}
                    </div>
                    ${editor.discovered.map(candidate => {
                      const already = this._isImported(m, candidate);
                      return html`
                        <div class="uc-pc-import-row">
                          <ha-icon icon="mdi:flower-outline"></ha-icon>
                          <div class="uc-pc-import-text">
                            <div class="uc-pc-import-name">${candidate.name}</div>
                            <div class="uc-pc-import-sub">
                              ${candidate.moistureEntity
                                ? localize(
                                    'editor.plant_care.import_with_sensor',
                                    lang,
                                    'Moisture sensor: {entity}'
                                  ).replace('{entity}', candidate.moistureEntity)
                                : localize(
                                    'editor.plant_care.import_no_sensor',
                                    lang,
                                    'No moisture sensor matched — schedule only'
                                  )}
                            </div>
                          </div>
                          <button
                            class="uc-pc-linkbtn strong"
                            type="button"
                            ?disabled=${already}
                            @click=${() => this._importPlant(m, candidate, updateModule, lang)}
                          >
                            ${already
                              ? localize('editor.plant_care.import_added', lang, 'Added')
                              : localize('editor.plant_care.import_add', lang, 'Add')}
                          </button>
                        </div>
                      `;
                    })}
                    <button
                      class="uc-pc-secondary-btn"
                      type="button"
                      @click=${() => this._importAll(m, updateModule, lang, editor)}
                    >
                      <ha-icon icon="mdi:playlist-plus"></ha-icon>
                      ${localize('editor.plant_care.import_all', lang, 'Add all missing')}
                    </button>
                  `}
              ${editor.message
                ? html`<div class="uc-pc-note subtle">${editor.message}</div>`
                : nothing}
            </div>
          `
        : nothing}
    `;
  }

  // ── General tab: layout / display / schedule / advanced / colors ───────────

  private _renderLayoutSection(
    m: PlantCareModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const layout = m.layout || 'grid';
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.plant_care.layout_section', lang, 'Layout')}
        </div>
        ${this.renderSegmentedField(
          localize('editor.plant_care.layout', lang, 'Layout'),
          localize(
            'editor.plant_care.layout_desc',
            lang,
            'Grid for photos, list for density, map to place plants on a floor plan.'
          ),
          layout,
          [
            {
              value: 'grid',
              label: localize('editor.plant_care.layout_grid', lang, 'Grid'),
              icon: 'mdi:view-grid',
            },
            {
              value: 'list',
              label: localize('editor.plant_care.layout_list', lang, 'List'),
              icon: 'mdi:format-list-bulleted',
            },
            {
              value: 'map',
              label: localize('editor.plant_care.layout_map', lang, 'Map'),
              icon: 'mdi:map-outline',
            },
          ],
          (value: string) => {
            updateModule({
              layout: (value || 'grid') as PlantCareModule['layout'],
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          3
        )}
        ${layout === 'grid'
          ? this.renderSliderField(
              localize('editor.plant_care.columns', lang, 'Columns'),
              localize(
                'editor.plant_care.columns_desc',
                lang,
                'A target, not a hard count — tiles reflow on narrow screens.'
              ),
              m.columns ?? 3,
              3,
              1,
              6,
              1,
              (value: number) => {
                updateModule({ columns: value } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
              ''
            )
          : nothing}
        ${layout === 'map'
          ? this.renderFileField(
              localize('editor.plant_care.map_image', lang, 'Floor plan'),
              localize(
                'editor.plant_care.map_image_desc',
                lang,
                'Background image for the map layout. Place each plant on it from its row above.'
              ),
              hass,
              m.map_image || '',
              (path: string) => {
                updateModule({ map_image: path } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              }
            )
          : nothing}
      </div>
    `;
  }

  private _renderDisplaySection(
    m: PlantCareModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const toggle = (
      key: keyof PlantCareModule,
      title: string,
      description: string,
      current: boolean
    ) => ({
      title,
      description,
      hass,
      data: { [key]: current },
      schema: [this.booleanField(String(key))],
      onChange: (e: CustomEvent) => {
        updateModule({ [key]: e.detail.value?.[key] } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      },
    });

    return html`
      ${this.renderSettingsSection(
        localize('editor.plant_care.display_section', lang, 'Display'),
        localize('editor.plant_care.display_section_desc', lang, 'Choose what the card shows.'),
        [
          toggle(
            'show_title',
            localize('editor.plant_care.show_title', lang, 'Show title'),
            '',
            m.show_title !== false
          ),
          {
            title: localize('editor.plant_care.title', lang, 'Title'),
            description: localize(
              'editor.plant_care.title_desc',
              lang,
              'Leave blank to use “Plant Care”.'
            ),
            hass,
            data: { title: m.title || '' },
            schema: [this.textField('title')],
            onChange: (e: CustomEvent) => {
              updateModule({ title: e.detail.value?.title ?? '' } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          toggle(
            'show_summary_bar',
            localize('editor.plant_care.show_summary_bar', lang, 'Show summary bar'),
            localize(
              'editor.plant_care.show_summary_bar_desc',
              lang,
              'A one-line count of thirsty, overdue and happy plants.'
            ),
            m.show_summary_bar !== false
          ),
          toggle(
            'show_photos',
            localize('editor.plant_care.show_photos', lang, 'Show photos'),
            localize(
              'editor.plant_care.show_photos_desc',
              lang,
              'Turn off to fall back to icons everywhere.'
            ),
            m.show_photos !== false
          ),
          toggle(
            'show_moisture',
            localize('editor.plant_care.show_moisture', lang, 'Show moisture readings'),
            '',
            m.show_moisture !== false
          ),
          toggle(
            'show_next_due',
            localize('editor.plant_care.show_next_due', lang, 'Show next watering due'),
            '',
            m.show_next_due !== false
          ),
          toggle(
            'show_fertilize',
            localize('editor.plant_care.show_fertilize', lang, 'Show fertilizing'),
            localize(
              'editor.plant_care.show_fertilize_desc',
              lang,
              'Adds a secondary fertilize action for plants that have an interval set.'
            ),
            m.show_fertilize !== false
          ),
          toggle(
            'overdue_first',
            localize('editor.plant_care.overdue_first', lang, 'Sort by urgency'),
            localize(
              'editor.plant_care.overdue_first_desc',
              lang,
              'Overdue and thirsty plants float to the top instead of keeping your order.'
            ),
            m.overdue_first !== false
          ),
        ]
      )}
    `;
  }

  private _renderScheduleSection(
    m: PlantCareModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.plant_care.schedule_section', lang, 'Schedule defaults')}
        </div>
        <div class="uc-pc-section-desc">
          ${localize(
            'editor.plant_care.schedule_section_desc',
            lang,
            'Used by every plant that does not set its own interval.'
          )}
        </div>
        ${this.renderSliderField(
          localize('editor.plant_care.default_water', lang, 'Default watering interval'),
          '',
          m.default_water_interval_days ?? 7,
          7,
          1,
          90,
          1,
          (value: number) => {
            updateModule({ default_water_interval_days: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          localize('editor.plant_care.unit_days', lang, ' days')
        )}
        ${this.renderSliderField(
          localize('editor.plant_care.default_fertilize', lang, 'Default fertilizing interval'),
          localize('editor.plant_care.default_fertilize_desc', lang, '0 turns fertilizing off.'),
          m.default_fertilize_interval_days ?? 30,
          30,
          0,
          180,
          1,
          (value: number) => {
            updateModule({ default_fertilize_interval_days: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          localize('editor.plant_care.unit_days', lang, ' days')
        )}
        ${this.renderSegmentedField(
          localize('editor.plant_care.moisture_source', lang, 'Thirst comes from'),
          localize(
            'editor.plant_care.moisture_source_desc',
            lang,
            'Plants without a moisture sensor always fall back to the schedule — the card says so on each plant.'
          ),
          m.moisture_source || 'both',
          [
            {
              value: 'schedule',
              label: localize('editor.plant_care.source_schedule', lang, 'Schedule'),
              icon: 'mdi:calendar-clock',
            },
            {
              value: 'sensor',
              label: localize('editor.plant_care.source_sensor', lang, 'Sensor'),
              icon: 'mdi:water-percent',
            },
            {
              value: 'both',
              label: localize('editor.plant_care.source_both', lang, 'Both'),
              icon: 'mdi:set-center',
            },
          ],
          (value: string) => {
            updateModule({
              moisture_source: (value || 'both') as PlantCareModule['moisture_source'],
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          3
        )}
      </div>
    `;
  }

  private _renderAdvancedSection(
    m: PlantCareModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const southern = typeof hass?.config?.latitude === 'number' && hass.config.latitude < 0;
    const factor = seasonalWaterFactor(
      {
        seasonal_adjust: true,
        summer_factor: m.summer_factor ?? 0.75,
        winter_factor: m.winter_factor ?? 1.5,
        latitude: hass?.config?.latitude ?? null,
      },
      Date.now()
    );

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.plant_care.advanced_section', lang, 'Advanced')}
        </div>
        ${this.renderFieldSection(
          localize('editor.plant_care.seasonal_adjust', lang, 'Seasonal adjustment'),
          localize(
            'editor.plant_care.seasonal_adjust_desc',
            lang,
            'Stretch watering intervals in winter and shorten them in summer. The change eases across the year rather than flipping at the solstice, and the hemisphere is taken from your Home Assistant location.'
          ),
          hass,
          { seasonal_adjust: !!m.seasonal_adjust },
          [this.booleanField('seasonal_adjust')],
          (e: CustomEvent) => {
            updateModule({
              seasonal_adjust: !!e.detail.value?.seasonal_adjust,
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${m.seasonal_adjust
          ? this.renderConditionalFieldsGroup(
              localize('editor.plant_care.seasonal_group', lang, 'Seasonal factors'),
              html`
                <div class="uc-pc-note subtle">
                  ${(southern
                    ? localize(
                        'editor.plant_care.hemisphere_south',
                        lang,
                        'Your Home Assistant location is in the southern hemisphere, so summer peaks in January.'
                      )
                    : localize(
                        'editor.plant_care.hemisphere_north',
                        lang,
                        'Your Home Assistant location is in the northern hemisphere, so summer peaks in July.'
                      )) +
                  ' ' +
                  localize(
                    'editor.plant_care.hemisphere_today',
                    lang,
                    'Today intervals are multiplied by {factor}×.'
                  ).replace('{factor}', factor.toFixed(2))}
                </div>
                ${this.renderSliderField(
                  localize('editor.plant_care.summer_factor', lang, 'Summer factor'),
                  localize(
                    'editor.plant_care.summer_factor_desc',
                    lang,
                    'Below 1 waters more often at the height of summer.'
                  ),
                  m.summer_factor ?? 0.75,
                  0.75,
                  MIN_SEASONAL_FACTOR,
                  MAX_SEASONAL_FACTOR,
                  0.05,
                  (value: number) => {
                    updateModule({ summer_factor: value } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  },
                  '×'
                )}
                ${this.renderSliderField(
                  localize('editor.plant_care.winter_factor', lang, 'Winter factor'),
                  localize(
                    'editor.plant_care.winter_factor_desc',
                    lang,
                    'Above 1 stretches the gap between waterings in deep winter.'
                  ),
                  m.winter_factor ?? 1.5,
                  1.5,
                  MIN_SEASONAL_FACTOR,
                  MAX_SEASONAL_FACTOR,
                  0.05,
                  (value: number) => {
                    updateModule({ winter_factor: value } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  },
                  '×'
                )}
              `
            )
          : nothing}
        ${this.renderSliderField(
          localize('editor.plant_care.history_limit', lang, 'History kept per plant'),
          localize(
            'editor.plant_care.history_limit_desc',
            lang,
            'Older care entries are removed from the to-do list so it does not grow forever.'
          ),
          m.history_limit ?? 20,
          20,
          5,
          200,
          5,
          (value: number) => {
            updateModule({ history_limit: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ''
        )}
      </div>
    `;
  }

  private _renderColorsSection(
    m: PlantCareModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const fields: Array<[keyof PlantCareModule, string, string, string]> = [
      [
        'happy_color',
        localize('editor.plant_care.happy_color', lang, 'Happy'),
        localize('editor.plant_care.happy_color_desc', lang, 'Plants that need nothing.'),
        'var(--success-color)',
      ],
      [
        'thirsty_color',
        localize('editor.plant_care.thirsty_color', lang, 'Thirsty'),
        localize('editor.plant_care.thirsty_color_desc', lang, 'Due now or drifting dry.'),
        'var(--warning-color)',
      ],
      [
        'overdue_color',
        localize('editor.plant_care.overdue_color', lang, 'Overdue'),
        localize('editor.plant_care.overdue_color_desc', lang, 'Well past due, or bone dry.'),
        'var(--error-color)',
      ],
      [
        'text_color',
        localize('editor.plant_care.text_color', lang, 'Text'),
        '',
        'var(--primary-text-color)',
      ],
      [
        'secondary_text_color',
        localize('editor.plant_care.secondary_text_color', lang, 'Secondary text'),
        '',
        'var(--secondary-text-color)',
      ],
      [
        'card_background_color',
        localize('editor.plant_care.card_background_color', lang, 'Card background'),
        '',
        'var(--card-background-color)',
      ],
    ];

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.plant_care.colors_section', lang, 'Colors')}
        </div>
        ${fields.map(([key, title, description, fallback]) =>
          this.renderColorField(
            title,
            description,
            hass,
            String((m as unknown as Record<string, unknown>)[key] || ''),
            fallback,
            (value: string) => {
              updateModule({ [key]: value } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }
          )
        )}
      </div>
    `;
  }

  // ── Editor mutations ───────────────────────────────────────────────────────

  private _ensureEditor(moduleId: string): PlantEditorState {
    let state = this._editor.get(moduleId);
    if (!state) {
      state = {
        expanded: new Set<string>(),
        advanced: new Set<string>(),
        importOpen: false,
        importScanned: false,
        discovered: [],
        message: '',
      };
      this._editor.set(moduleId, state);
    }
    return state;
  }

  private _patchPlant(
    m: PlantCareModule,
    index: number,
    patch: Partial<PlantCareEntry>,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const plants = [...(m.plants || [])];
    const existing = plants[index];
    if (!existing) return;
    plants[index] = { ...existing, ...patch };
    updateModule({ plants } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _clearPlantField(
    m: PlantCareModule,
    index: number,
    field: keyof PlantCareEntry,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const plants = [...(m.plants || [])];
    const existing = plants[index];
    if (!existing) return;
    const next: PlantCareEntry = { ...existing };
    delete next[field];
    plants[index] = next;
    updateModule({ plants } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _addPlant(
    m: PlantCareModule,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): void {
    const plants = [...(m.plants || [])];
    const entry: PlantCareEntry = {
      id: this.generateId('plant'),
      name: localize('editor.plant_care.new_plant_name', lang, 'New plant'),
      icon: 'mdi:flower',
      x: 0.5,
      y: 0.5,
    };
    plants.push(entry);
    updateModule({ plants } as Partial<CardModule>);
    this._ensureEditor(m.id).expanded.add(entry.id);
    this.triggerPreviewUpdate();
  }

  private _deletePlant(
    m: PlantCareModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const plants = [...(m.plants || [])];
    const removed = plants[index];
    if (!removed) return;
    plants.splice(index, 1);
    this._ensureEditor(m.id).expanded.delete(removed.id);
    updateModule({ plants } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _movePlant(
    m: PlantCareModule,
    index: number,
    delta: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const plants = [...(m.plants || [])];
    const target = index + delta;
    if (target < 0 || target >= plants.length) return;
    const [moved] = plants.splice(index, 1);
    plants.splice(target, 0, moved);
    updateModule({ plants } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _isImported(m: PlantCareModule, candidate: DiscoveredPlant): boolean {
    const name = candidate.name.trim().toLowerCase();
    return (m.plants || []).some(plant => {
      if (candidate.moistureEntity && plant.moisture_entity === candidate.moistureEntity) {
        return true;
      }
      return (plant.name || '').trim().toLowerCase() === name;
    });
  }

  private _importPlant(
    m: PlantCareModule,
    candidate: DiscoveredPlant,
    updateModule: (updates: Partial<CardModule>) => void,
    _lang: string
  ): void {
    if (this._isImported(m, candidate)) return;
    const plants = [...(m.plants || []), this._entryFromCandidate(candidate)];
    updateModule({ plants } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _importAll(
    m: PlantCareModule,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    editor: PlantEditorState
  ): void {
    const additions = editor.discovered
      .filter(candidate => !this._isImported(m, candidate))
      .map(candidate => this._entryFromCandidate(candidate));

    if (additions.length === 0) {
      editor.message = localize(
        'editor.plant_care.import_nothing_new',
        lang,
        'Everything here has already been imported.'
      );
      this.triggerPreviewUpdate();
      return;
    }

    updateModule({ plants: [...(m.plants || []), ...additions] } as Partial<CardModule>);
    editor.message = localize(
      'editor.plant_care.import_done',
      lang,
      'Imported {count} plants.'
    ).replace('{count}', String(additions.length));
    this.triggerPreviewUpdate();
  }

  private _entryFromCandidate(candidate: DiscoveredPlant): PlantCareEntry {
    const entry: PlantCareEntry = {
      id: this.generateId('plant'),
      name: candidate.name,
      icon: 'mdi:flower',
      x: 0.5,
      y: 0.5,
    };
    if (candidate.moistureEntity) entry.moisture_entity = candidate.moistureEntity;
    if (candidate.temperatureEntity) entry.temperature_entity = candidate.temperatureEntity;
    if (candidate.illuminanceEntity) entry.illuminance_entity = candidate.illuminanceEntity;
    return entry;
  }

  /** `getImageUrl` needs a live `hass`; previews can render before one exists. */
  private _imageUrl(hass: HomeAssistant | undefined | null, path?: string): string {
    if (!hass || !path) return '';
    try {
      return getImageUrl(hass, path);
    } catch {
      return '';
    }
  }

  private _pointFromClick(e: MouseEvent): { x: number; y: number } {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    return {
      x: clamp01((e.clientX - rect.left) / (rect.width || 1)),
      y: clamp01((e.clientY - rect.top) / (rect.height || 1)),
    };
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    _config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as PlantCareModule;
    const lang = hass?.locale?.language || 'en';

    if (!m.todo_entity) {
      return this.renderGradientErrorState(
        localize('editor.plant_care.setup_title', lang, 'Pick a care history list'),
        localize(
          'editor.plant_care.setup_desc',
          lang,
          'Choose a Local To-do helper under Storage in the General tab. Watering history is saved there.'
        ),
        'mdi:sprout'
      );
    }

    const state = this._ensurePreview(m);
    this._ensureEventsLoaded(m, hass);

    const plants = m.plants || [];
    const statuses = sortStatuses(
      computeStatuses(
        plants,
        state.events,
        buildComputeConfig(
          {
            default_water_interval_days: m.default_water_interval_days ?? 7,
            default_fertilize_interval_days: m.default_fertilize_interval_days ?? 0,
            moisture_source: m.moisture_source || 'both',
            seasonal_adjust: !!m.seasonal_adjust,
            summer_factor: m.summer_factor ?? 0.75,
            winter_factor: m.winter_factor ?? 1.5,
          },
          hass
        ),
        Date.now()
      ),
      m.overdue_first !== false
    );

    const palette = this._palette(m);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const title =
      m.title?.trim() || localize('editor.plant_care.default_title', lang, 'Plant Care');

    const body = html`
      ${m.show_title !== false
        ? html`<div class="uc-pc-header" style="color:${palette.text};">
            <ha-icon icon="mdi:sprout"></ha-icon>
            <span class="uc-pc-header-text">${title}</span>
            ${m.seasonal_adjust
              ? html`<span
                  class="uc-pc-season"
                  style="color:${palette.secondary};"
                  title=${this._seasonTooltip(m, hass, lang)}
                >
                  <ha-icon icon="mdi:weather-partly-cloudy"></ha-icon>
                </span>`
              : nothing}
          </div>`
        : nothing}
      ${state.error
        ? html`<div class="uc-pc-banner error">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <span>${state.error}</span>
          </div>`
        : nothing}
      ${plants.length === 0
        ? this._renderNoPlants(lang, palette)
        : html`
            ${m.show_summary_bar !== false
              ? this._renderSummaryBar(statuses, palette, lang)
              : nothing}
            ${state.loading && state.events.length === 0
              ? html`<div class="uc-pc-loading" style="color:${palette.secondary};">
                  ${localize('editor.plant_care.loading', lang, 'Loading care history…')}
                </div>`
              : nothing}
            ${this._renderUndoBar(m, hass, state, palette, lang)}
            ${this._renderLayoutBody(m, hass, statuses, state, palette, lang)}
          `}
    `;

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div
        class="uc-pc-wrapper ${hoverClass}"
        style="padding:14px;border-radius:12px;background:${palette.cardBg};${designStyles}"
      >
        ${this.wrapWithAnimation(body, module, hass)}
      </div>
    `;
  }

  private _renderNoPlants(lang: string, palette: PlantPalette): TemplateResult {
    return html`
      <div class="uc-pc-blank">
        <ha-icon icon="mdi:flower-outline" style="color:${palette.happy};"></ha-icon>
        <div class="uc-pc-blank-title" style="color:${palette.text};">
          ${localize('editor.plant_care.add_first_title', lang, 'Add your first plant')}
        </div>
        <div class="uc-pc-blank-sub" style="color:${palette.secondary};">
          ${localize(
            'editor.plant_care.add_first_desc',
            lang,
            'Open the General tab and add a plant with a name and a watering interval. Photos and moisture sensors are optional extras.'
          )}
        </div>
      </div>
    `;
  }

  private _renderSummaryBar(
    statuses: PlantStatus[],
    palette: PlantPalette,
    lang: string
  ): TemplateResult {
    const summary = summarizeStatuses(statuses);
    const parts: TemplateResult[] = [];

    const chip = (count: number, label: string, color: string) => html`
      <span class="uc-pc-sum-chip" style="color:${color};">
        <span class="uc-pc-dot" style="background:${color};"></span>${count} ${label}
      </span>
    `;

    if (summary.thirsty > 0) {
      parts.push(
        chip(
          summary.thirsty,
          localize('editor.plant_care.sum_thirsty', lang, 'thirsty'),
          palette.thirsty
        )
      );
    }
    if (summary.overdue > 0) {
      parts.push(
        chip(
          summary.overdue,
          localize('editor.plant_care.sum_overdue', lang, 'overdue'),
          palette.overdue
        )
      );
    }
    if (summary.dueSoon > 0) {
      parts.push(
        chip(
          summary.dueSoon,
          localize('editor.plant_care.sum_due_soon', lang, 'due soon'),
          palette.thirsty
        )
      );
    }
    if (summary.happy > 0) {
      parts.push(
        chip(summary.happy, localize('editor.plant_care.sum_happy', lang, 'happy'), palette.happy)
      );
    }
    if (summary.never > 0) {
      parts.push(
        chip(
          summary.never,
          localize('editor.plant_care.sum_never', lang, 'never watered'),
          palette.secondary
        )
      );
    }

    const next = summary.next;
    const nextLabel =
      next && next.waterDueInDays !== null
        ? localize('editor.plant_care.sum_next', lang, 'Next: {name} {when}')
            .replace('{name}', next.plant.name || '—')
            .replace('{when}', this._dueLabel(next, lang).toLowerCase())
        : '';

    return html`
      <div class="uc-pc-summary">
        <div class="uc-pc-sum-chips">${parts}</div>
        ${nextLabel
          ? html`<div class="uc-pc-sum-next" style="color:${palette.secondary};">${nextLabel}</div>`
          : nothing}
      </div>
    `;
  }

  private _renderUndoBar(
    m: PlantCareModule,
    hass: HomeAssistant,
    state: PlantPreviewState,
    palette: PlantPalette,
    lang: string
  ): TemplateResult | typeof nothing {
    const undo = state.undo;
    if (!undo) return nothing;
    if (Date.now() - undo.at > UNDO_WINDOW_MS) {
      state.undo = null;
      return nothing;
    }

    const label =
      undo.kind === 'fertilize'
        ? localize('editor.plant_care.undo_fertilized', lang, 'Fertilized {name}')
        : localize('editor.plant_care.undo_watered', lang, 'Watered {name}');

    return html`
      <div class="uc-pc-undo" style="color:${palette.secondary};">
        <ha-icon icon=${undo.kind === 'fertilize' ? 'mdi:leaf' : 'mdi:water'}></ha-icon>
        <span class="uc-pc-undo-text">${label.replace('{name}', undo.plantName)}</span>
        <button class="uc-pc-undo-btn" type="button" @click=${() => this._undoCare(m, hass, state)}>
          ${localize('editor.plant_care.undo', lang, 'Undo')}
        </button>
      </div>
    `;
  }

  private _renderLayoutBody(
    m: PlantCareModule,
    hass: HomeAssistant,
    statuses: PlantStatus[],
    state: PlantPreviewState,
    palette: PlantPalette,
    lang: string
  ): TemplateResult {
    switch (m.layout) {
      case 'list':
        return this._renderListLayout(m, hass, statuses, state, palette, lang);
      case 'map':
        return this._renderMapLayout(m, hass, statuses, state, palette, lang);
      default:
        return this._renderGridLayout(m, hass, statuses, state, palette, lang);
    }
  }

  // ── Preview: grid ──────────────────────────────────────────────────────────

  private _renderGridLayout(
    m: PlantCareModule,
    hass: HomeAssistant,
    statuses: PlantStatus[],
    state: PlantPreviewState,
    palette: PlantPalette,
    lang: string
  ): TemplateResult {
    const columns = Math.min(6, Math.max(1, m.columns ?? 3));
    // `columns` is a target width, not a hard count, so tiles reflow on phones.
    const minWidth = Math.round(Math.max(96, 320 / columns));

    return html`
      <div
        class="uc-pc-grid"
        style="grid-template-columns:repeat(auto-fill,minmax(${minWidth}px,1fr));"
      >
        ${statuses.map(status => this._renderTile(m, hass, status, state, palette, lang))}
      </div>
    `;
  }

  private _renderTile(
    m: PlantCareModule,
    hass: HomeAssistant,
    status: PlantStatus,
    state: PlantPreviewState,
    palette: PlantPalette,
    lang: string
  ): TemplateResult {
    const plant = status.plant;
    const color = this._stateColor(status.state, palette);
    const busy = state.busyPlantId === plant.id;
    const canFertilize = m.show_fertilize !== false && status.fertilizeIntervalDays > 0;

    return html`
      <div class="uc-pc-tile" style="border-color:${color};">
        <button
          class="uc-pc-tile-main"
          type="button"
          ?disabled=${busy}
          title=${localize('editor.plant_care.tap_to_water', lang, 'Tap to log watering')}
          aria-label=${localize('editor.plant_care.water_plant', lang, 'Water {name}').replace(
            '{name}',
            plant.name || ''
          )}
          @click=${() => this._logCare(m, hass, status, 'water', lang)}
        >
          ${this._renderPhoto(m, hass, plant, color, 'tile')}
          <div class="uc-pc-tile-name" style="color:${palette.text};">
            <span
              class="uc-pc-dot ${status.state === 'due_soon' ? 'ring' : ''}"
              style="background:${color};border-color:${color};"
            ></span>
            <span class="uc-pc-ellipsis">${plant.name || '—'}</span>
          </div>
          ${m.show_next_due !== false
            ? html`<div
                class="uc-pc-tile-due"
                style="color:${status.state === 'happy' ? palette.secondary : color};"
              >
                ${this._dueLabel(status, lang)}
              </div>`
            : nothing}
          ${m.show_moisture !== false && status.moisture !== null
            ? html`<div class="uc-pc-tile-moist" style="color:${palette.secondary};">
                <ha-icon icon="mdi:water-percent"></ha-icon>${Math.round(status.moisture)}%
              </div>`
            : nothing}
          <div class="uc-pc-reason" style="color:${palette.secondary};">
            ${this._reasonLabel(status, lang)}
          </div>
        </button>
        <div class="uc-pc-tile-actions">
          <button
            class="uc-pc-water-btn"
            type="button"
            ?disabled=${busy}
            style="background:${color};"
            title=${localize('editor.plant_care.water_plant', lang, 'Water {name}').replace(
              '{name}',
              plant.name || ''
            )}
            aria-label=${localize('editor.plant_care.water_plant', lang, 'Water {name}').replace(
              '{name}',
              plant.name || ''
            )}
            @click=${() => this._logCare(m, hass, status, 'water', lang)}
          >
            <ha-icon icon="mdi:watering-can"></ha-icon>
          </button>
          ${canFertilize
            ? html`<button
                class="uc-pc-fert-btn"
                type="button"
                ?disabled=${busy}
                title=${this._fertilizeTitle(status, lang)}
                aria-label=${this._fertilizeTitle(status, lang)}
                @click=${() => this._logCare(m, hass, status, 'fertilize', lang)}
              >
                <ha-icon icon="mdi:leaf"></ha-icon>
              </button>`
            : nothing}
        </div>
      </div>
    `;
  }

  // ── Preview: list ──────────────────────────────────────────────────────────

  private _renderListLayout(
    m: PlantCareModule,
    hass: HomeAssistant,
    statuses: PlantStatus[],
    state: PlantPreviewState,
    palette: PlantPalette,
    lang: string
  ): TemplateResult {
    return html`
      <div class="uc-pc-list">
        ${statuses.map(status => {
          const plant = status.plant;
          const color = this._stateColor(status.state, palette);
          const busy = state.busyPlantId === plant.id;
          const canFertilize = m.show_fertilize !== false && status.fertilizeIntervalDays > 0;
          const open = state.openPlantId === plant.id;

          return html`
            <div class="uc-pc-listrow">
              <span
                class="uc-pc-dot ${status.state === 'due_soon' ? 'ring' : ''}"
                style="background:${color};border-color:${color};"
              ></span>
              ${m.show_photos !== false ? this._renderPhoto(m, hass, plant, color, 'row') : nothing}
              <button
                class="uc-pc-listtext"
                type="button"
                @click=${() => {
                  state.openPlantId = open ? '' : plant.id;
                  this.triggerPreviewUpdate(true);
                }}
                title=${localize('editor.plant_care.show_detail', lang, 'Show details')}
              >
                <div class="uc-pc-ellipsis" style="color:${palette.text};font-weight:600;">
                  ${plant.name || '—'}
                </div>
                <div class="uc-pc-listsub" style="color:${palette.secondary};">
                  ${[
                    plant.location || '',
                    m.show_next_due !== false ? this._dueLabel(status, lang) : '',
                    m.show_moisture !== false && status.moisture !== null
                      ? `${Math.round(status.moisture)}%`
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              </button>
              <button
                class="uc-pc-water-btn wide"
                type="button"
                ?disabled=${busy}
                style="background:${color};"
                title=${localize('editor.plant_care.water_plant', lang, 'Water {name}').replace(
                  '{name}',
                  plant.name || ''
                )}
                aria-label=${localize(
                  'editor.plant_care.water_plant',
                  lang,
                  'Water {name}'
                ).replace('{name}', plant.name || '')}
                @click=${() => this._logCare(m, hass, status, 'water', lang)}
              >
                <ha-icon icon="mdi:watering-can"></ha-icon>
              </button>
              ${canFertilize
                ? html`<button
                    class="uc-pc-fert-btn"
                    type="button"
                    ?disabled=${busy}
                    title=${this._fertilizeTitle(status, lang)}
                    aria-label=${this._fertilizeTitle(status, lang)}
                    @click=${() => this._logCare(m, hass, status, 'fertilize', lang)}
                  >
                    <ha-icon icon="mdi:leaf"></ha-icon>
                  </button>`
                : nothing}
            </div>
            ${open ? this._renderDetail(m, status, palette, lang) : nothing}
          `;
        })}
      </div>
    `;
  }

  private _renderDetail(
    m: PlantCareModule,
    status: PlantStatus,
    palette: PlantPalette,
    lang: string
  ): TemplateResult {
    const rows: Array<[string, string]> = [];

    rows.push([
      localize('editor.plant_care.detail_reason', lang, 'Why'),
      this._reasonLabel(status, lang),
    ]);
    rows.push([
      localize('editor.plant_care.detail_interval', lang, 'Waters every'),
      localize('editor.plant_care.detail_days', lang, '{days} days').replace(
        '{days}',
        String(status.waterIntervalDays)
      ),
    ]);
    if (status.lastWateredMs !== null) {
      rows.push([
        localize('editor.plant_care.detail_last_water', lang, 'Last watered'),
        this._agoLabel(status.lastWateredMs, lang),
      ]);
    }
    if (m.show_fertilize !== false && status.fertilizeIntervalDays > 0) {
      rows.push([
        localize('editor.plant_care.detail_fertilize', lang, 'Fertilize'),
        status.lastFertilizedMs === null
          ? localize('editor.plant_care.never_fertilized', lang, 'Never fertilized')
          : this._fertilizeLabel(status, lang),
      ]);
    }
    if (status.temperature !== null) {
      rows.push([
        localize('editor.plant_care.detail_temperature', lang, 'Temperature'),
        `${Math.round(status.temperature)}°`,
      ]);
    }
    if (status.illuminance !== null) {
      rows.push([
        localize('editor.plant_care.detail_light', lang, 'Light'),
        `${Math.round(status.illuminance)} lx`,
      ]);
    }

    return html`
      <div class="uc-pc-detail" style="color:${palette.secondary};">
        ${rows.map(
          ([label, value]) => html`
            <div class="uc-pc-detail-row">
              <span>${label}</span><span style="color:${palette.text};">${value}</span>
            </div>
          `
        )}
        ${status.plant.notes
          ? html`<div class="uc-pc-detail-note">${status.plant.notes}</div>`
          : nothing}
      </div>
    `;
  }

  // ── Preview: map ───────────────────────────────────────────────────────────

  private _renderMapLayout(
    m: PlantCareModule,
    hass: HomeAssistant,
    statuses: PlantStatus[],
    state: PlantPreviewState,
    palette: PlantPalette,
    lang: string
  ): TemplateResult {
    const mapUrl = this._imageUrl(hass, m.map_image);

    if (!mapUrl) {
      return html`
        <div class="uc-pc-blank">
          <ha-icon icon="mdi:map-outline" style="color:${palette.secondary};"></ha-icon>
          <div class="uc-pc-blank-title" style="color:${palette.text};">
            ${localize('editor.plant_care.map_needed_title', lang, 'Add a floor plan')}
          </div>
          <div class="uc-pc-blank-sub" style="color:${palette.secondary};">
            ${localize(
              'editor.plant_care.map_needed_desc',
              lang,
              'The map layout needs a background image. Upload one under Layout in the General tab, then place each plant on it.'
            )}
          </div>
        </div>
      `;
    }

    return html`
      <div class="uc-pc-map">
        <img
          src=${mapUrl}
          alt=""
          draggable="false"
          @error=${(e: Event) => {
            (e.currentTarget as HTMLElement).style.visibility = 'hidden';
          }}
        />
        ${statuses.map(status => {
          const color = this._stateColor(status.state, palette);
          const x = clamp01(status.plant.x ?? 0.5) * 100;
          const y = clamp01(status.plant.y ?? 0.5) * 100;
          const busy = state.busyPlantId === status.plant.id;
          return html`
            <button
              class="uc-pc-marker"
              type="button"
              ?disabled=${busy}
              style="left:${x}%;top:${y}%;background:${color};"
              title=${`${status.plant.name || '—'} · ${this._dueLabel(status, lang)}`}
              aria-label=${localize('editor.plant_care.water_plant', lang, 'Water {name}').replace(
                '{name}',
                status.plant.name || ''
              )}
              @click=${() => this._logCare(m, hass, status, 'water', lang)}
            >
              <ha-icon icon=${status.plant.icon || 'mdi:flower'}></ha-icon>
            </button>
          `;
        })}
      </div>
      ${statuses.length > 1 &&
      statuses.every(s => (s.plant.x ?? 0.5) === 0.5 && (s.plant.y ?? 0.5) === 0.5)
        ? html`<div class="uc-pc-loading" style="color:${palette.secondary};">
            ${localize(
              'editor.plant_care.map_place_hint',
              lang,
              'Every marker is still sitting in the middle. Open a plant in the General tab and click the plan to place it.'
            )}
          </div>`
        : nothing}
    `;
  }

  // ── Preview helpers ────────────────────────────────────────────────────────

  private _renderPhoto(
    m: PlantCareModule,
    hass: HomeAssistant,
    plant: PlantCareEntry,
    color: string,
    variant: 'tile' | 'row'
  ): TemplateResult {
    const url = m.show_photos !== false ? this._imageUrl(hass, plant.image) : '';
    return html`
      <div class="uc-pc-photo ${variant}">
        <ha-icon icon=${plant.icon || 'mdi:flower'} style="color:${color};"></ha-icon>
        ${url
          ? html`<img
              src=${url}
              alt=""
              loading="lazy"
              @error=${(e: Event) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />`
          : nothing}
      </div>
    `;
  }

  private _palette(m: PlantCareModule): PlantPalette {
    return {
      happy: m.happy_color || 'var(--success-color, #4caf50)',
      thirsty: m.thirsty_color || 'var(--warning-color, #ff9800)',
      overdue: m.overdue_color || 'var(--error-color, #f44336)',
      text: m.text_color || 'var(--primary-text-color)',
      secondary: m.secondary_text_color || 'var(--secondary-text-color)',
      cardBg: m.card_background_color || 'var(--card-background-color)',
    };
  }

  private _stateColor(state: PlantCareState, palette: PlantPalette): string {
    switch (state) {
      case 'overdue':
        return palette.overdue;
      case 'thirsty':
      case 'due_soon':
        return palette.thirsty;
      case 'happy':
        return palette.happy;
      default:
        return palette.secondary;
    }
  }

  /** Short, honest explanation of what decided this plant's state. */
  private _reasonLabel(status: PlantStatus, lang: string): string {
    if (status.reason === 'sensor' && status.moisture !== null) {
      return localize('editor.plant_care.reason_sensor', lang, 'Sensor {value}% of {threshold}%')
        .replace('{value}', String(Math.round(status.moisture)))
        .replace('{threshold}', String(Math.round(status.moistureThreshold)));
    }
    if (status.reason === 'schedule') {
      return status.plant.moisture_entity
        ? localize('editor.plant_care.reason_schedule_sensor_off', lang, 'From the schedule')
        : localize('editor.plant_care.reason_schedule', lang, 'From the schedule (no sensor)');
    }
    return localize('editor.plant_care.reason_none', lang, 'No watering logged yet');
  }

  private _dueLabel(status: PlantStatus, lang: string): string {
    const due = status.waterDueInDays;
    if (due === null) return localize('editor.plant_care.never_watered', lang, 'Never watered');
    if (due >= 1.5) {
      return localize('editor.plant_care.due_in_days', lang, 'In {days} days').replace(
        '{days}',
        String(Math.round(due))
      );
    }
    if (due >= 0.5) return localize('editor.plant_care.due_tomorrow', lang, 'Tomorrow');
    if (due > -0.5) return localize('editor.plant_care.due_today', lang, 'Due today');
    const late = Math.max(1, Math.round(-due));
    return localize('editor.plant_care.due_overdue', lang, '{days} days overdue').replace(
      '{days}',
      String(late)
    );
  }

  private _fertilizeLabel(status: PlantStatus, lang: string): string {
    const due = status.fertilizeDueInDays;
    if (due === null) {
      return localize('editor.plant_care.never_fertilized', lang, 'Never fertilized');
    }
    if (due >= 0.5) {
      return localize('editor.plant_care.fert_in_days', lang, 'Feed in {days} days').replace(
        '{days}',
        String(Math.max(1, Math.round(due)))
      );
    }
    return localize('editor.plant_care.fert_due', lang, 'Feeding due');
  }

  private _fertilizeTitle(status: PlantStatus, lang: string): string {
    return localize('editor.plant_care.fertilize_plant', lang, 'Fertilize {name}').replace(
      '{name}',
      status.plant.name || ''
    );
  }

  private _agoLabel(timestamp: number, lang: string): string {
    const days = Math.floor((Date.now() - timestamp) / MS_PER_DAY);
    if (days <= 0) return localize('editor.plant_care.ago_today', lang, 'Today');
    if (days === 1) return localize('editor.plant_care.ago_yesterday', lang, 'Yesterday');
    return localize('editor.plant_care.ago_days', lang, '{days} days ago').replace(
      '{days}',
      String(days)
    );
  }

  private _seasonTooltip(m: PlantCareModule, hass: HomeAssistant, lang: string): string {
    const config = {
      seasonal_adjust: true,
      summer_factor: m.summer_factor ?? 0.75,
      winter_factor: m.winter_factor ?? 1.5,
      latitude: hass?.config?.latitude ?? null,
    };
    const factor = seasonalWaterFactor(config, Date.now());
    const phase = seasonalPhaseLabel(config, Date.now());
    const phaseLabel =
      phase === 'summer'
        ? localize('editor.plant_care.season_summer', lang, 'summer')
        : phase === 'winter'
          ? localize('editor.plant_care.season_winter', lang, 'winter')
          : localize('editor.plant_care.season_shoulder', lang, 'shoulder season');
    return localize(
      'editor.plant_care.season_tooltip',
      lang,
      'Seasonal adjustment is on: {phase}, intervals ×{factor}'
    )
      .replace('{phase}', phaseLabel)
      .replace('{factor}', factor.toFixed(2));
  }

  // ── Preview data plumbing ──────────────────────────────────────────────────

  private _ensurePreview(m: PlantCareModule): PlantPreviewState {
    let state = this._preview.get(m.id);
    if (!state) {
      state = {
        events: [],
        loading: false,
        lastFetchedAt: 0,
        fetchKey: '',
        error: '',
        undo: null,
        busyPlantId: '',
        openPlantId: '',
      };
      this._preview.set(m.id, state);
    }
    return state;
  }

  /**
   * Fires at most one request per change. `renderPreview` is synchronous, so the
   * pattern is: use whatever is cached, kick off a fetch when the inputs moved,
   * and repaint in the `.then()`.
   */
  private _ensureEventsLoaded(m: PlantCareModule, hass: HomeAssistant): void {
    if (!hass || !m.todo_entity) return;
    const state = this._ensurePreview(m);
    if (state.loading) return;

    const key = m.todo_entity;
    const now = Date.now();
    if (state.fetchKey === key && state.lastFetchedAt > 0 && now - state.lastFetchedAt < 2000) {
      return;
    }

    state.loading = true;
    state.fetchKey = key;

    ucPlantCareService
      .getEvents(hass, m.todo_entity, () => {
        // The to-do list changed under us (another device logged care).
        const current = this._preview.get(m.id);
        if (current) current.lastFetchedAt = 0;
        this._ensureEventsLoaded(m, hass);
      })
      .then(events => {
        const current = this._ensurePreview(m);
        current.events = events;
        current.loading = false;
        current.error = '';
        current.lastFetchedAt = Date.now();
        this.triggerPreviewUpdate(true);
      })
      .catch((err: unknown) => {
        const current = this._ensurePreview(m);
        current.loading = false;
        current.lastFetchedAt = Date.now();
        current.error =
          err instanceof Error && err.message
            ? err.message
            : 'Could not read the care history list';
        this.triggerPreviewUpdate(true);
      });
  }

  private _logCare(
    m: PlantCareModule,
    hass: HomeAssistant,
    status: PlantStatus,
    kind: CareKind,
    lang: string
  ): void {
    if (!hass || !m.todo_entity) return;
    const state = this._ensurePreview(m);
    if (state.busyPlantId) return;

    const plant = status.plant;
    state.busyPlantId = plant.id;
    this.triggerPreviewUpdate(true);

    const summary = (
      kind === 'fertilize'
        ? localize('editor.plant_care.log_fertilized', lang, 'Fertilized {name}')
        : localize('editor.plant_care.log_watered', lang, 'Watered {name}')
    ).replace('{name}', plant.name || plant.id);

    ucPlantCareService
      .recordCare(hass, m.todo_entity, plant, kind, { summary })
      .then(() => {
        const current = this._ensurePreview(m);
        current.busyPlantId = '';
        current.undo = {
          plantId: plant.id,
          plantName: plant.name || plant.id,
          kind,
          at: Date.now(),
        };
        current.lastFetchedAt = 0;
        this._ensureEventsLoaded(m, hass);
        this.triggerPreviewUpdate(true);
        this._pruneLater(m, hass, plant.id);
        this._expireUndoLater(m, current.undo.at);
      })
      .catch((err: unknown) => {
        const current = this._ensurePreview(m);
        current.busyPlantId = '';
        current.error =
          err instanceof Error && err.message ? err.message : 'Could not save the care entry';
        this.triggerPreviewUpdate(true);
      });
  }

  private _undoCare(m: PlantCareModule, hass: HomeAssistant, state: PlantPreviewState): void {
    const undo = state.undo;
    if (!undo || !hass || !m.todo_entity) return;
    state.undo = null;
    state.busyPlantId = undo.plantId;
    this.triggerPreviewUpdate(true);

    ucPlantCareService
      .undoLastCare(hass, m.todo_entity, undo.plantId, undo.kind)
      .then(() => {
        const current = this._ensurePreview(m);
        current.busyPlantId = '';
        current.lastFetchedAt = 0;
        this._ensureEventsLoaded(m, hass);
        this.triggerPreviewUpdate(true);
      })
      .catch(() => {
        const current = this._ensurePreview(m);
        current.busyPlantId = '';
        this.triggerPreviewUpdate(true);
      });
  }

  /** Retires the undo chip on its own rather than waiting for the next repaint. */
  private _expireUndoLater(m: PlantCareModule, stamp: number): void {
    setTimeout(() => {
      const current = this._preview.get(m.id);
      if (current?.undo && current.undo.at === stamp) {
        current.undo = null;
        this.triggerPreviewUpdate(true);
      }
    }, UNDO_WINDOW_MS);
  }

  /** Keeps the backing to-do list bounded without blocking the tap. */
  private _pruneLater(m: PlantCareModule, hass: HomeAssistant, plantId: string): void {
    const limit = m.history_limit ?? 20;
    if (limit <= 0) return;
    setTimeout(() => {
      ucPlantCareService
        .pruneHistory(hass, m.todo_entity, plantId, limit)
        .then(removed => {
          if (removed > 0) {
            const current = this._preview.get(m.id);
            if (current) current.lastFetchedAt = 0;
            this._ensureEventsLoaded(m, hass);
          }
        })
        .catch(() => {
          /* pruning is housekeeping; never surface it */
        });
    }, 1500);
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}

      .uc-pc-wrapper { box-sizing: border-box; width: 100%; min-width: 0; }

      .uc-pc-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        font-size: 15px;
        margin-bottom: 10px;
        min-width: 0;
      }
      .uc-pc-header-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }
      .uc-pc-season { display: inline-flex; --mdc-icon-size: 16px; }

      .uc-pc-summary {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 12px;
        margin-bottom: 10px;
        font-size: 12px;
      }
      .uc-pc-sum-chips { display: flex; flex-wrap: wrap; gap: 10px; }
      .uc-pc-sum-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-weight: 600;
        white-space: nowrap;
      }
      .uc-pc-sum-next { font-size: 12px; min-width: 0; }

      .uc-pc-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        border: 2px solid transparent;
        box-sizing: border-box;
      }
      .uc-pc-dot.ring { background: transparent !important; }

      .uc-pc-banner {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 12px;
        margin-bottom: 10px;
      }
      .uc-pc-banner.error {
        background: rgba(244, 67, 54, 0.12);
        color: var(--error-color);
      }
      .uc-pc-banner ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; }

      .uc-pc-loading { font-size: 12px; padding: 6px 0; }

      .uc-pc-undo {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        padding: 6px 10px;
        margin-bottom: 10px;
        border-radius: 8px;
        background: var(--secondary-background-color);
      }
      .uc-pc-undo ha-icon { --mdc-icon-size: 16px; flex-shrink: 0; }
      .uc-pc-undo-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-pc-undo-btn {
        border: none;
        background: transparent;
        color: var(--primary-color);
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 6px;
      }
      .uc-pc-undo-btn:hover { background: rgba(var(--rgb-primary-color), 0.12); }

      .uc-pc-blank {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 6px;
        padding: 22px 12px;
        border: 1px dashed var(--divider-color);
        border-radius: 12px;
      }
      .uc-pc-blank ha-icon { --mdc-icon-size: 34px; }
      .uc-pc-blank-title { font-weight: 700; font-size: 15px; }
      .uc-pc-blank-sub { font-size: 12px; line-height: 1.5; max-width: 340px; }

      /* ── Grid ─────────────────────────────────────────────── */
      .uc-pc-grid { display: grid; gap: 10px; }
      .uc-pc-tile {
        position: relative;
        display: flex;
        flex-direction: column;
        border: 1px solid var(--divider-color);
        border-left-width: 3px;
        border-radius: 12px;
        overflow: hidden;
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.02);
        min-width: 0;
      }
      .uc-pc-tile-main {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 8px 8px;
        border: none;
        background: transparent;
        cursor: pointer;
        text-align: center;
        font: inherit;
        min-width: 0;
        width: 100%;
      }
      .uc-pc-tile-main:disabled { opacity: 0.6; cursor: default; }
      .uc-pc-tile-name {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        width: 100%;
        min-width: 0;
      }
      .uc-pc-tile-due { font-size: 12px; font-weight: 600; }
      .uc-pc-tile-moist {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
      }
      .uc-pc-tile-moist ha-icon { --mdc-icon-size: 14px; }
      .uc-pc-reason {
        font-size: 10px;
        line-height: 1.3;
        opacity: 0.85;
        max-width: 100%;
      }
      .uc-pc-tile-actions {
        display: flex;
        gap: 6px;
        padding: 0 8px 8px;
        justify-content: center;
      }

      .uc-pc-ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }

      .uc-pc-photo {
        position: relative;
        border-radius: 10px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(var(--rgb-primary-color), 0.08);
        flex-shrink: 0;
      }
      .uc-pc-photo.tile { width: 100%; aspect-ratio: 1 / 1; max-height: 120px; }
      .uc-pc-photo.row { width: 34px; height: 34px; }
      .uc-pc-photo ha-icon { --mdc-icon-size: 26px; }
      .uc-pc-photo.row ha-icon { --mdc-icon-size: 18px; }
      .uc-pc-photo img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .uc-pc-water-btn,
      .uc-pc-fert-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        width: 34px;
        height: 30px;
        flex-shrink: 0;
        color: var(--text-primary-color, #fff);
      }
      .uc-pc-water-btn { flex: 1; max-width: 90px; }
      .uc-pc-water-btn.wide { flex: 0 0 auto; width: 38px; height: 34px; }
      .uc-pc-water-btn ha-icon,
      .uc-pc-fert-btn ha-icon { --mdc-icon-size: 18px; }
      /* Fertilizing is the rarer action, so it stays visually subordinate. */
      .uc-pc-fert-btn {
        background: transparent;
        border: 1px solid var(--divider-color);
        color: var(--secondary-text-color);
      }
      .uc-pc-fert-btn:hover { color: var(--primary-color); }
      .uc-pc-water-btn:disabled,
      .uc-pc-fert-btn:disabled { opacity: 0.5; cursor: default; }

      /* ── List ─────────────────────────────────────────────── */
      .uc-pc-list { display: flex; flex-direction: column; gap: 2px; }
      .uc-pc-listrow {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 2px;
        min-width: 0;
      }
      .uc-pc-listtext {
        flex: 1;
        min-width: 0;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        font: inherit;
        padding: 0;
      }
      .uc-pc-listsub {
        font-size: 11px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-pc-detail {
        font-size: 12px;
        padding: 8px 10px 10px 26px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .uc-pc-detail-row { display: flex; justify-content: space-between; gap: 12px; }
      .uc-pc-detail-note { font-style: italic; opacity: 0.9; padding-top: 4px; }

      /* ── Map ──────────────────────────────────────────────── */
      .uc-pc-map {
        position: relative;
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        background: var(--secondary-background-color);
        min-height: 120px;
      }
      .uc-pc-map img { display: block; width: 100%; height: auto; }
      .uc-pc-marker {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid var(--card-background-color);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        color: var(--text-primary-color, #fff);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      }
      .uc-pc-marker ha-icon { --mdc-icon-size: 17px; }
      .uc-pc-marker:disabled { opacity: 0.6; cursor: default; }

      /* ── Editor ───────────────────────────────────────────── */
      .uc-pc-section-desc {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 14px;
        line-height: 1.5;
      }
      .uc-pc-note,
      .uc-pc-warn {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12px;
        line-height: 1.5;
        padding: 10px 12px;
        border-radius: 8px;
        margin-bottom: 14px;
      }
      .uc-pc-note {
        background: rgba(var(--rgb-primary-color), 0.08);
        color: var(--primary-text-color);
      }
      .uc-pc-note.subtle {
        background: transparent;
        color: var(--secondary-text-color);
        padding: 0 0 10px;
      }
      .uc-pc-warn {
        background: rgba(255, 152, 0, 0.14);
        color: var(--primary-text-color);
      }
      .uc-pc-note ha-icon,
      .uc-pc-warn ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; }

      .uc-pc-empty-rows {
        font-size: 13px;
        color: var(--secondary-text-color);
        padding: 14px;
        border: 1px dashed var(--divider-color);
        border-radius: 8px;
        margin-bottom: 12px;
        line-height: 1.5;
      }

      .uc-pc-row {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        margin-bottom: 8px;
        background: var(--card-background-color);
        overflow: hidden;
      }
      .uc-pc-row.expanded { border-color: var(--primary-color); }
      .uc-pc-row-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        min-width: 0;
      }
      .uc-pc-thumb {
        position: relative;
        width: 34px;
        height: 34px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-color);
      }
      .uc-pc-thumb ha-icon { --mdc-icon-size: 20px; }
      .uc-pc-thumb img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .uc-pc-row-text { flex: 1; min-width: 0; }
      .uc-pc-row-name {
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-pc-row-sub {
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-pc-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        flex-shrink: 0;
      }
      .uc-pc-icon-btn ha-icon { --mdc-icon-size: 19px; }
      .uc-pc-icon-btn:hover { background: rgba(var(--rgb-primary-color), 0.12); }
      .uc-pc-icon-btn.expand.on { color: var(--primary-color); }
      .uc-pc-icon-btn.danger:hover {
        background: rgba(244, 67, 54, 0.14);
        color: var(--error-color);
      }
      .uc-pc-icon-btn:disabled { opacity: 0.3; cursor: default; }
      .uc-pc-icon-btn:disabled:hover { background: transparent; }
      .uc-pc-row-body {
        padding: 4px 12px 12px;
        border-top: 1px solid var(--divider-color);
      }

      .uc-pc-add-btn,
      .uc-pc-secondary-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 11px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        margin-top: 8px;
      }
      .uc-pc-add-btn {
        border: none;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .uc-pc-secondary-btn {
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--primary-text-color);
      }
      .uc-pc-secondary-btn:hover { border-color: var(--primary-color); }

      .uc-pc-import {
        margin-top: 10px;
        padding: 12px;
        border-radius: 8px;
        background: rgba(var(--rgb-primary-color), 0.06);
      }
      .uc-pc-import-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color);
        min-width: 0;
      }
      .uc-pc-import-row:last-of-type { border-bottom: none; }
      .uc-pc-import-row ha-icon { --mdc-icon-size: 20px; color: var(--primary-color); }
      .uc-pc-import-text { flex: 1; min-width: 0; }
      .uc-pc-import-name {
        font-size: 13px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-pc-import-sub {
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .uc-pc-linkbtn {
        border: none;
        background: transparent;
        color: var(--primary-color);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 6px;
        margin: -4px 0 14px;
      }
      .uc-pc-linkbtn.strong { margin: 0; flex-shrink: 0; }
      .uc-pc-linkbtn:hover { background: rgba(var(--rgb-primary-color), 0.12); }
      .uc-pc-linkbtn:disabled {
        color: var(--secondary-text-color);
        cursor: default;
        background: transparent;
      }

      .uc-pc-subtoggle {
        display: flex;
        align-items: center;
        gap: 4px;
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        padding: 6px 0;
        margin-bottom: 4px;
      }
      .uc-pc-subtoggle.on { color: var(--primary-color); }
      .uc-pc-subtoggle ha-icon { --mdc-icon-size: 18px; }

      .uc-pc-map-pick {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        cursor: crosshair;
        margin-bottom: 14px;
        background: var(--secondary-background-color);
      }
      .uc-pc-map-pick img { display: block; width: 100%; height: auto; }
      .uc-pc-map-pin {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
      }
      .uc-pc-map-pin ha-icon { --mdc-icon-size: 15px; }

      /* The framed look comes from the shared editor stylesheet; only trim the
         trailing gap our last field leaves behind. */
      .conditional-fields-content > .field-container:last-child { margin-bottom: 0; }

      @media (max-width: 420px) {
        .uc-pc-reason { display: none; }
        .uc-pc-summary { font-size: 11px; }
      }
    `;
  }
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

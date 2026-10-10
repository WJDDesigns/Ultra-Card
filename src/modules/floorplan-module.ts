/**
 * Floorplan (Free) — a picture of your home with live entity markers.
 *
 * The friendly alternative to Home Assistant's Picture Elements card: pick a
 * floor plan image, add entities as markers and click on the plan (in the
 * General tab) to place them. Icons color with state, lights glow in their own
 * color, and optional room zones fill in while their light or sensor is on.
 *
 * All positions are percentages of the image frame, so the card scales with
 * any column width.
 */
import { TemplateResult, html, nothing, svg } from 'lit';
import type { HomeAssistant } from '../ha/types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import type {
  CardModule,
  FloorplanLabelPosition,
  FloorplanMarker,
  FloorplanModule,
  FloorplanZone,
  ModuleActionConfig,
  UltraCardConfig,
} from '../types';
import { localize } from '../localize/localize';
import { getImageUrl } from '../utils/image-upload';
import { formatEntityState } from '../utils/number-format';
import { iconPairForEntity } from '../services/smart/smart-sanitize-utils';
import {
  allEntitiesInactive,
  aspectRatioCss,
  clampPercent,
  entityDomain,
  floorplanEntityIds,
  glowAlpha,
  isEntityActive,
  lightBrightness,
  lightRgb,
  parsePolygonPoints,
  pointToPercent,
  rgbCss,
  serializePolygonPoints,
  type FloorplanPoint,
} from '../services/uc-floorplan-service';

type UpdateFn = (updates: Partial<CardModule>) => void;

/** Per-module editor state. Modules are singletons, so it is keyed by module id. */
interface FloorplanEditorState {
  mode: 'markers' | 'zones';
  activeMarkerId: string;
  activeZoneId: string;
  expanded: Set<string>;
  advanced: Set<string>;
  drag: {
    kind: 'marker' | 'zone-move' | 'zone-resize' | 'draw';
    id: string;
    startX: number;
    startY: number;
    grabDx: number;
    grabDy: number;
  } | null;
  draft: { x: number; y: number; width: number; height: number } | null;
  message: string;
}

const DEFAULT_MARKER_SIZE = 24;
const DEFAULT_GLOW_SIZE = 28;
const DEFAULT_GLOW_INTENSITY = 70;
const DEFAULT_DIM = 45;
const MIN_ZONE = 2;

const ACTIVE_FALLBACK = 'var(--state-active-color, var(--amber-color, #ffc107))';
const INACTIVE_FALLBACK = 'var(--state-inactive-color, var(--secondary-text-color, #8a8a8a))';
const UNAVAILABLE_COLOR = 'var(--state-unavailable-color, var(--disabled-text-color, #9e9e9e))';

const ACTION_SELECTOR = {
  ui_action: {
    actions: ['default', 'more-info', 'toggle', 'navigate', 'url', 'perform-action', 'assist', 'nothing'],
  },
};

/** Localize a key under `editor.floorplan.*`. */
function t(lang: string, key: string, fallback: string): string {
  return localize(`editor.floorplan.${key}`, lang, fallback);
}

function isExplicitNothing(action: ModuleActionConfig | undefined): boolean {
  return !action || action.action === 'nothing';
}

export class UltraFloorplanModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'floorplan',
    title: 'Floorplan',
    description:
      'A picture of your home with live entity markers, glowing lights and room zones — a friendly Picture Elements',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:floor-plan',
    category: 'interactive',
    tags: [
      'floorplan',
      'floor plan',
      'picture elements',
      'map',
      'rooms',
      'lights',
      'markers',
      'interactive',
    ],
  };

  private _editor = new Map<string, FloorplanEditorState>();

  createDefault(id?: string, _hass?: HomeAssistant): FloorplanModule {
    return {
      id: id || this.generateId('floorplan'),
      type: 'floorplan',
      image: '',
      dark_image: '',
      markers: [],
      zones: [],
      aspect_ratio: 'auto',
      image_fit: 'contain',
      marker_style: 'badge',
      marker_size: DEFAULT_MARKER_SIZE,
      show_names: false,
      show_states: false,
      label_position: 'below',
      active_color: '',
      inactive_color: '',
      glow_lights: true,
      glow_intensity: DEFAULT_GLOW_INTENSITY,
      glow_size: DEFAULT_GLOW_SIZE,
      dim_when_all_off: false,
      dim_amount: DEFAULT_DIM,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  /** Lenient on purpose: an empty floor plan shows a friendly empty state instead. */
  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    return { valid: errors.length === 0, errors };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as FloorplanModule;
    return floorplanEntityIds({ markers: m.markers || [], zones: m.zones || [] }).filter(id =>
      id.includes('.')
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private _ed(moduleId: string): FloorplanEditorState {
    let state = this._editor.get(moduleId);
    if (!state) {
      state = {
        mode: 'markers',
        activeMarkerId: '',
        activeZoneId: '',
        expanded: new Set<string>(),
        advanced: new Set<string>(),
        drag: null,
        draft: null,
        message: '',
      };
      this._editor.set(moduleId, state);
    }
    return state;
  }

  private _imageUrl(hass: HomeAssistant | undefined, path: string | undefined): string {
    if (!hass || !path) return '';
    try {
      return getImageUrl(hass, path.trim());
    } catch {
      return '';
    }
  }

  private _isDarkMode(hass: HomeAssistant | undefined): boolean {
    const themes: unknown = hass?.themes;
    return !!themes && typeof themes === 'object' && (themes as Record<string, unknown>).darkMode === true;
  }

  /** The picture to show right now (the dark-mode one when HA is dark and one is set). */
  private _resolveImage(m: FloorplanModule, hass: HomeAssistant | undefined): string {
    if (m.dark_image && this._isDarkMode(hass)) {
      const dark = this._imageUrl(hass, m.dark_image);
      if (dark) return dark;
    }
    return this._imageUrl(hass, m.image);
  }

  /** Inline style + image class for the frame, shared by the card and the placement surface. */
  private _frame(m: FloorplanModule): { style: string; imgClass: string } {
    const ratio = aspectRatioCss(m.aspect_ratio);
    if (!ratio) return { style: '', imgClass: 'uc-fp-img' };
    const fit = m.image_fit || 'contain';
    return { style: `aspect-ratio:${ratio};`, imgClass: `uc-fp-img fixed fit-${fit}` };
  }

  private _markerIcon(
    marker: FloorplanMarker,
    entityId: string,
    hass: HomeAssistant | undefined,
    active: boolean
  ): string {
    if (active && marker.active_icon) return marker.active_icon;
    if (marker.icon) return marker.icon;
    const stateObj = entityId ? hass?.states?.[entityId] : undefined;
    const attrIcon = stateObj?.attributes?.icon;
    if (typeof attrIcon === 'string' && attrIcon) return attrIcon;
    if (!entityId) return 'mdi:map-marker-plus-outline';
    const deviceClass = stateObj?.attributes?.device_class;
    const pair = iconPairForEntity(
      entityDomain(entityId),
      typeof deviceClass === 'string' ? deviceClass : undefined,
      undefined
    );
    return active ? pair.active : pair.inactive;
  }

  private _markerName(marker: FloorplanMarker, entityId: string, hass: HomeAssistant | undefined): string {
    const friendly = entityId ? hass?.states?.[entityId]?.attributes?.friendly_name : undefined;
    return marker.name?.trim() || (typeof friendly === 'string' ? friendly : '') || entityId || '';
  }

  // ── General tab ────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: UpdateFn
  ): TemplateResult {
    const m = module as FloorplanModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings">
        ${this._renderImageSection(m, hass, updateModule, lang)}
        ${this._renderMarkersSection(m, hass, config, updateModule, lang)}
        ${this._renderDisplaySection(m, hass, updateModule, lang)}
        ${this._renderZonesSection(m, hass, config, updateModule, lang)}
        ${this._renderLayoutSection(m, hass, updateModule, lang)}
      </div>
    `;
  }

  private _renderImageSection(
    m: FloorplanModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">${t(lang, 'image_section', 'Floor plan image')}</div>
        <div class="uc-fp-section-desc">
          ${t(
            lang,
            'image_section_desc',
            'Upload a picture of your floor plan, or paste a link to one. A screenshot of a vacuum map or a photo of a sketch works too.'
          )}
        </div>
        ${this.renderFileField(
          t(lang, 'image', 'Image'),
          t(lang, 'image_desc', 'PNG, JPG, SVG or WebP. Markers are placed in percent, so any size works.'),
          hass,
          m.image || '',
          (path: string) => {
            updateModule({ image: path } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          t(lang, 'image_url', 'Or use an image URL'),
          t(lang, 'image_url_desc', 'A full URL or a /local/ path. Same setting as the upload above.'),
          hass,
          { image: m.image || '' },
          [this.textField('image')],
          (e: CustomEvent) => {
            updateModule({ image: String(e.detail.value?.image ?? '') } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
      </div>
    `;
  }

  // ── Markers ────────────────────────────────────────────────────────────────

  private _renderMarkersSection(
    m: FloorplanModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const markers = m.markers || [];
    return html`
      <div class="settings-section">
        <div class="section-title">${t(lang, 'markers_section', 'Markers')}</div>
        <div class="uc-fp-section-desc">
          ${t(
            lang,
            'markers_section_desc',
            'Add an entity, then click on the plan to place it. Tapping a marker toggles lights and switches, and opens details for everything else.'
          )}
        </div>
        ${this._renderPlacementSurface(m, hass, config, updateModule, lang)}
        ${markers.length === 0
          ? html`<div class="uc-fp-empty-rows">
              ${t(lang, 'no_markers', 'No markers yet. Add your first one below.')}
            </div>`
          : nothing}
        ${markers.map((marker, index) =>
          this._renderMarkerRow(marker, index, m, hass, config, updateModule, lang)
        )}
        <button class="uc-fp-add-btn" type="button" @click=${() => this._addMarker(m, updateModule)}>
          <ha-icon icon="mdi:plus"></ha-icon>
          ${t(lang, 'add_marker', 'Add marker')}
        </button>
      </div>
    `;
  }

  private _renderMarkerRow(
    marker: FloorplanMarker,
    index: number,
    m: FloorplanModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const ed = this._ed(m.id);
    const expanded = ed.expanded.has(marker.id);
    const selected = ed.mode === 'markers' && ed.activeMarkerId === marker.id;
    const entityId = this.resolveEntity(marker.entity, config) || marker.entity || '';
    const stateObj = entityId ? hass?.states?.[entityId] : undefined;
    const active = isEntityActive(stateObj, marker.active_state);
    const title =
      this._markerName(marker, entityId, hass) || t(lang, 'unbound_marker', 'Choose an entity');
    const patch = (updates: Partial<FloorplanMarker>) =>
      this._patchMarker(m, marker.id, updates, updateModule);

    return html`
      <div class="uc-fp-row ${selected ? 'selected' : ''}">
        <div class="uc-fp-row-head">
          <button
            type="button"
            class="uc-fp-row-main"
            aria-expanded=${expanded ? 'true' : 'false'}
            @click=${() => {
              if (expanded) ed.expanded.delete(marker.id);
              else ed.expanded.add(marker.id);
              ed.mode = 'markers';
              ed.activeMarkerId = marker.id;
              this.triggerPreviewUpdate(true);
            }}
          >
            <ha-icon icon=${this._markerIcon(marker, entityId, hass, active)}></ha-icon>
            <span class="uc-fp-row-title">${title}</span>
            <span class="uc-fp-row-sub">${clampPercent(marker.x)}% · ${clampPercent(marker.y)}%</span>
            <ha-icon class="uc-fp-chevron" icon=${expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
          </button>
          <button
            type="button"
            class="uc-fp-icon-btn ${selected ? 'on' : ''}"
            title=${t(lang, 'place_marker', 'Place on the plan')}
            aria-label=${t(lang, 'place_marker', 'Place on the plan')}
            @click=${() => {
              ed.mode = 'markers';
              ed.activeMarkerId = selected ? '' : marker.id;
              this.triggerPreviewUpdate(true);
            }}
          >
            <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
          </button>
          <button
            type="button"
            class="uc-fp-icon-btn"
            title=${t(lang, 'remove', 'Remove')}
            aria-label=${t(lang, 'remove', 'Remove')}
            @click=${() => this._removeMarker(m, index, updateModule)}
          >
            <ha-icon icon="mdi:delete-outline"></ha-icon>
          </button>
        </div>
        ${expanded
          ? html`<div class="uc-fp-row-body">
              ${this.renderEntityPickerWithVariables(
                hass,
                config,
                'entity',
                marker.entity || '',
                (value: string) => patch({ entity: value || '' }),
                undefined,
                t(lang, 'entity', 'Entity')
              )}
              ${this.renderSliderField(
                t(lang, 'pos_x', 'Horizontal position'),
                t(lang, 'pos_x_desc', 'Percent from the left edge. Clicking on the plan sets this too.'),
                clampPercent(marker.x),
                50,
                0,
                100,
                0.5,
                (v: number) => patch({ x: clampPercent(v) }),
                '%'
              )}
              ${this.renderSliderField(
                t(lang, 'pos_y', 'Vertical position'),
                t(lang, 'pos_y_desc', 'Percent from the top edge.'),
                clampPercent(marker.y),
                50,
                0,
                100,
                0.5,
                (v: number) => patch({ y: clampPercent(v) }),
                '%'
              )}
              <button
                type="button"
                class="uc-fp-link-btn"
                @click=${() => {
                  if (ed.advanced.has(marker.id)) ed.advanced.delete(marker.id);
                  else ed.advanced.add(marker.id);
                  this.triggerPreviewUpdate(true);
                }}
              >
                <ha-icon icon=${ed.advanced.has(marker.id) ? 'mdi:chevron-up' : 'mdi:tune-variant'}></ha-icon>
                ${ed.advanced.has(marker.id)
                  ? t(lang, 'hide_advanced', 'Hide advanced options')
                  : t(lang, 'show_advanced', 'Advanced options')}
              </button>
              ${ed.advanced.has(marker.id)
                ? this.renderConditionalFieldsGroup(
                    t(lang, 'marker_advanced', 'Advanced'),
                    this._renderMarkerAdvanced(marker, m, hass, entityId, patch, lang)
                  )
                : nothing}
            </div>`
          : nothing}
      </div>
    `;
  }

  private _renderMarkerAdvanced(
    marker: FloorplanMarker,
    m: FloorplanModule,
    hass: HomeAssistant,
    entityId: string,
    patch: (updates: Partial<FloorplanMarker>) => void,
    lang: string
  ): TemplateResult {
    const isLight = entityDomain(entityId) === 'light';
    return html`
      ${this.renderFieldSection(
        t(lang, 'name', 'Name'),
        t(lang, 'name_desc', 'Leave blank to use the entity name.'),
        hass,
        { name: marker.name || '' },
        [this.textField('name')],
        (e: CustomEvent) => patch({ name: String(e.detail.value?.name ?? '') })
      )}
      ${this.renderIconField(
        t(lang, 'icon', 'Icon'),
        t(lang, 'icon_desc', 'Leave blank to use the entity icon.'),
        hass,
        marker.icon || '',
        (v: string) => patch({ icon: v || undefined })
      )}
      ${this.renderIconField(
        t(lang, 'active_icon', 'Icon while active'),
        t(lang, 'active_icon_desc', 'Optional. Swaps in while the entity is on, open or home.'),
        hass,
        marker.active_icon || '',
        (v: string) => patch({ active_icon: v || undefined })
      )}
      ${this.renderSliderField(
        t(lang, 'marker_size', 'Icon size'),
        t(lang, 'marker_size_override_desc', 'Overrides the size set under Display for this marker.'),
        marker.size ?? m.marker_size ?? DEFAULT_MARKER_SIZE,
        m.marker_size ?? DEFAULT_MARKER_SIZE,
        12,
        72,
        1,
        (v: number) => patch({ size: v }),
        'px'
      )}
      ${this.renderFieldSection(
        t(lang, 'show_name', 'Show name'),
        '',
        hass,
        { show_name: marker.show_name ?? m.show_names ?? false },
        [this.booleanField('show_name')],
        (e: CustomEvent) => patch({ show_name: e.detail.value?.show_name === true })
      )}
      ${this.renderFieldSection(
        t(lang, 'show_state', 'Show state'),
        '',
        hass,
        { show_state: marker.show_state ?? m.show_states ?? false },
        [this.booleanField('show_state')],
        (e: CustomEvent) => patch({ show_state: e.detail.value?.show_state === true })
      )}
      ${this._renderLabelPositionField(
        marker.label_position || m.label_position || 'below',
        (v: FloorplanLabelPosition) => patch({ label_position: v }),
        lang
      )}
      ${this.renderColorField(
        t(lang, 'active_color', 'Active color'),
        t(lang, 'active_color_marker_desc', 'Icon color while active. Lights use their own color when this is empty.'),
        hass,
        marker.active_color || '',
        '',
        (v: string) => patch({ active_color: v || undefined })
      )}
      ${this.renderColorField(
        t(lang, 'inactive_color', 'Inactive color'),
        '',
        hass,
        marker.inactive_color || '',
        '',
        (v: string) => patch({ inactive_color: v || undefined })
      )}
      ${this.renderFieldSection(
        t(lang, 'active_state', 'Active when state is'),
        t(
          lang,
          'active_state_desc',
          'Optional. By default on, open, unlocked, home and playing count as active.'
        ),
        hass,
        { active_state: marker.active_state || '' },
        [this.textField('active_state')],
        (e: CustomEvent) => patch({ active_state: String(e.detail.value?.active_state ?? '') || undefined })
      )}
      ${isLight
        ? this.renderFieldSection(
            t(lang, 'glow', 'Glow'),
            t(lang, 'glow_desc', 'A soft halo in the light color, brighter as the light gets brighter.'),
            hass,
            { glow: marker.glow ?? m.glow_lights !== false },
            [this.booleanField('glow')],
            (e: CustomEvent) => patch({ glow: e.detail.value?.glow === true })
          )
        : nothing}
      ${this._renderActionFields(
        marker.tap_action,
        marker.hold_action,
        marker.double_tap_action,
        { action: 'default' },
        { action: 'more-info' },
        hass,
        updates => patch(updates),
        lang
      )}
    `;
  }

  private _renderLabelPositionField(
    value: FloorplanLabelPosition,
    onChange: (v: FloorplanLabelPosition) => void,
    lang: string
  ): TemplateResult {
    return this.renderSegmentedField(
      t(lang, 'label_position', 'Label position'),
      '',
      value,
      [
        { value: 'below', label: t(lang, 'label_below', 'Below'), icon: 'mdi:arrow-down' },
        { value: 'above', label: t(lang, 'label_above', 'Above'), icon: 'mdi:arrow-up' },
        { value: 'left', label: t(lang, 'label_left', 'Left'), icon: 'mdi:arrow-left' },
        { value: 'right', label: t(lang, 'label_right', 'Right'), icon: 'mdi:arrow-right' },
      ],
      next => onChange((next || 'below') as FloorplanLabelPosition),
      4
    );
  }

  private _renderActionFields(
    tap: ModuleActionConfig | undefined,
    hold: ModuleActionConfig | undefined,
    double: ModuleActionConfig | undefined,
    tapDefault: ModuleActionConfig,
    holdDefault: ModuleActionConfig,
    hass: HomeAssistant,
    onChange: (updates: {
      tap_action?: ModuleActionConfig;
      hold_action?: ModuleActionConfig;
      double_tap_action?: ModuleActionConfig;
    }) => void,
    lang: string
  ): TemplateResult {
    const field = (
      key: 'tap_action' | 'hold_action' | 'double_tap_action',
      title: string,
      value: ModuleActionConfig
    ) =>
      this.renderFieldSection(
        title,
        '',
        hass,
        { [key]: value },
        [{ name: key, selector: ACTION_SELECTOR }],
        (e: CustomEvent) => {
          const next = e.detail.value?.[key] as ModuleActionConfig | undefined;
          if (!next || typeof next !== 'object' || !next.action) return;
          const updates: {
            tap_action?: ModuleActionConfig;
            hold_action?: ModuleActionConfig;
            double_tap_action?: ModuleActionConfig;
          } = {};
          updates[key] = next;
          onChange(updates);
        }
      );
    return html`
      ${field('tap_action', t(lang, 'tap_action', 'Tap action'), tap || tapDefault)}
      ${field('hold_action', t(lang, 'hold_action', 'Hold action'), hold || holdDefault)}
      ${field(
        'double_tap_action',
        t(lang, 'double_tap_action', 'Double-tap action'),
        double || { action: 'nothing' }
      )}
    `;
  }

  // ── Placement surface ──────────────────────────────────────────────────────

  /**
   * The plan itself, rendered inside the General tab. In marker mode a click on
   * the picture moves the selected marker there and markers can be dragged; in
   * zone mode dragging draws a new room rectangle, and with a polygon zone
   * selected each click adds a corner.
   */
  private _renderPlacementSurface(
    m: FloorplanModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const src = this._resolveImage(m, hass);
    if (!src) {
      return html`
        <div class="uc-fp-note">
          <ha-icon icon="mdi:image-outline"></ha-icon>
          <span>
            ${t(
              lang,
              'placement_needs_image',
              'Add a floor plan image above to place markers by clicking on it. You can still add markers and set their position with the sliders.'
            )}
          </span>
        </div>
      `;
    }

    const ed = this._ed(m.id);
    const frame = this._frame(m);
    const zones = m.zones || [];
    const activeZone = zones.find(z => z.id === ed.activeZoneId);
    const hasZones = zones.length > 0 || ed.mode === 'zones';

    let hint: string;
    if (ed.mode === 'zones') {
      hint =
        activeZone?.shape === 'polygon'
          ? t(lang, 'hint_polygon', 'Click on the plan to add corners to the selected polygon zone.')
          : t(
              lang,
              'hint_zones',
              'Drag on the plan to draw a room zone. Drag a zone to move it, or its corner to resize.'
            );
    } else if (ed.activeMarkerId) {
      hint = t(lang, 'hint_place', 'Click on the plan to move the selected marker there, or drag any marker.');
    } else {
      hint = t(lang, 'hint_select', 'Select a marker (or add one) and then click on the plan to place it.');
    }

    return html`
      <div class="uc-fp-placement">
        ${hasZones
          ? this.renderSegmentedField(
              t(lang, 'edit_mode', 'Editing'),
              '',
              ed.mode,
              [
                { value: 'markers', label: t(lang, 'mode_markers', 'Markers'), icon: 'mdi:map-marker' },
                { value: 'zones', label: t(lang, 'mode_zones', 'Room zones'), icon: 'mdi:vector-square' },
              ],
              next => {
                ed.mode = next === 'zones' ? 'zones' : 'markers';
                this.triggerPreviewUpdate(true);
              },
              2
            )
          : nothing}
        <div class="uc-fp-placement-hint">${hint}</div>
        <div
          class="uc-fp-stage uc-fp-place mode-${ed.mode}"
          style=${frame.style}
          @pointerdown=${(e: PointerEvent) => this._onPlaceDown(e, m, updateModule, lang)}
          @pointermove=${(e: PointerEvent) => this._onPlaceMove(e, m, updateModule)}
          @pointerup=${(e: PointerEvent) => this._onPlaceUp(e, m, updateModule, lang)}
          @pointercancel=${(e: PointerEvent) => this._onPlaceUp(e, m, updateModule, lang)}
        >
          <img class=${frame.imgClass} src=${src} alt="" draggable="false" />
          <svg class="uc-fp-zones edit" viewBox="0 0 100 100" preserveAspectRatio="none">
            ${zones.map(zone => this._placementZoneShape(zone, zone.id === ed.activeZoneId))}
            ${ed.draft
              ? svg`<rect class="uc-fp-draft" x=${ed.draft.x} y=${ed.draft.y} width=${ed.draft.width} height=${ed.draft.height}></rect>`
              : nothing}
          </svg>
          ${activeZone && ed.mode === 'zones' ? this._placementZoneHandle(activeZone) : nothing}
          ${(m.markers || []).map(marker => {
            const entityId = this.resolveEntity(marker.entity, config) || marker.entity || '';
            const stateObj = entityId ? hass?.states?.[entityId] : undefined;
            const active = isEntityActive(stateObj, marker.active_state);
            return html`
              <div
                class="uc-fp-place-marker ${ed.activeMarkerId === marker.id ? 'selected' : ''}"
                data-marker=${marker.id}
                title=${this._markerName(marker, entityId, hass)}
                style="left:${clampPercent(marker.x)}%;top:${clampPercent(marker.y)}%;"
              >
                <ha-icon icon=${this._markerIcon(marker, entityId, hass, active)}></ha-icon>
              </div>
            `;
          })}
        </div>
        ${ed.message ? html`<div class="uc-fp-placement-msg">${ed.message}</div>` : nothing}
      </div>
    `;
  }

  private _placementZoneShape(zone: FloorplanZone, selected: boolean) {
    const cls = `uc-fp-place-zone ${selected ? 'selected' : ''}`;
    if (zone.shape === 'polygon') {
      const points = parsePolygonPoints(zone.points);
      if (points.length === 0) return nothing;
      if (points.length < 3) {
        return svg`${points.map(
          p => svg`<circle class=${cls} data-zone=${zone.id} cx=${p.x} cy=${p.y} r="1.2"></circle>`
        )}`;
      }
      return svg`<polygon class=${cls} data-zone=${zone.id} points=${serializePolygonPoints(points)}></polygon>`;
    }
    const r = this._zoneRect(zone);
    return svg`<rect class=${cls} data-zone=${zone.id} x=${r.x} y=${r.y} width=${r.width} height=${r.height}></rect>`;
  }

  private _placementZoneHandle(zone: FloorplanZone): TemplateResult | typeof nothing {
    if (zone.shape === 'polygon') return nothing;
    const r = this._zoneRect(zone);
    return html`<div
      class="uc-fp-place-handle"
      data-zone-handle=${zone.id}
      style="left:${clampPercent(r.x + r.width)}%;top:${clampPercent(r.y + r.height)}%;"
    ></div>`;
  }

  private _zoneRect(zone: FloorplanZone): { x: number; y: number; width: number; height: number } {
    const x = clampPercent(zone.x, 10);
    const y = clampPercent(zone.y, 10);
    return {
      x,
      y,
      width: Math.min(100 - x, clampPercent(zone.width, 20)),
      height: Math.min(100 - y, clampPercent(zone.height, 20)),
    };
  }

  private _onPlaceDown(e: PointerEvent, m: FloorplanModule, updateModule: UpdateFn, lang: string): void {
    const container = e.currentTarget as HTMLElement;
    const target = e.target as Element;
    const pt = pointToPercent(e.clientX, e.clientY, container.getBoundingClientRect());
    const ed = this._ed(m.id);
    e.preventDefault();
    container.setPointerCapture?.(e.pointerId);
    ed.message = '';

    const startDrag = (kind: NonNullable<FloorplanEditorState['drag']>['kind'], id: string, gx = 0, gy = 0) => {
      ed.drag = { kind, id, startX: pt.x, startY: pt.y, grabDx: gx, grabDy: gy };
    };

    if (ed.mode === 'markers') {
      const markerId = target.closest?.('[data-marker]')?.getAttribute('data-marker');
      if (markerId) {
        ed.activeMarkerId = markerId;
        startDrag('marker', markerId);
        this.triggerPreviewUpdate(true);
        return;
      }
      const markers = m.markers || [];
      if (ed.activeMarkerId && markers.some(mk => mk.id === ed.activeMarkerId)) {
        this._patchMarker(m, ed.activeMarkerId, { x: pt.x, y: pt.y }, updateModule);
        startDrag('marker', ed.activeMarkerId);
        return;
      }
      ed.message = markers.length
        ? t(lang, 'msg_select_marker', 'Select a marker in the list first (the crosshair button).')
        : t(lang, 'msg_add_marker', 'Add a marker below first, then click here to place it.');
      this.triggerPreviewUpdate(true);
      return;
    }

    // Zone mode.
    const zones = m.zones || [];
    const handleId = target.closest?.('[data-zone-handle]')?.getAttribute('data-zone-handle');
    if (handleId) {
      ed.activeZoneId = handleId;
      startDrag('zone-resize', handleId);
      this.triggerPreviewUpdate(true);
      return;
    }
    const zoneId = target.closest?.('[data-zone]')?.getAttribute('data-zone');
    const selected = zones.find(z => z.id === ed.activeZoneId);
    // A selected polygon takes every click as a new corner, even on top of itself.
    if (selected?.shape === 'polygon') {
      const points = [...parsePolygonPoints(selected.points), pt];
      this._patchZone(m, selected.id, { points: serializePolygonPoints(points) }, updateModule);
      return;
    }
    if (zoneId) {
      const zone = zones.find(z => z.id === zoneId);
      ed.activeZoneId = zoneId;
      ed.expanded.add(zoneId);
      if (zone && zone.shape !== 'polygon') {
        const r = this._zoneRect(zone);
        startDrag('zone-move', zoneId, pt.x - r.x, pt.y - r.y);
      }
      this.triggerPreviewUpdate(true);
      return;
    }
    ed.activeZoneId = '';
    ed.draft = { x: pt.x, y: pt.y, width: 0, height: 0 };
    startDrag('draw', '');
    this.triggerPreviewUpdate(true);
  }

  private _onPlaceMove(e: PointerEvent, m: FloorplanModule, updateModule: UpdateFn): void {
    const ed = this._ed(m.id);
    const drag = ed.drag;
    if (!drag) return;
    const container = e.currentTarget as HTMLElement;
    const pt = pointToPercent(e.clientX, e.clientY, container.getBoundingClientRect());
    e.preventDefault();

    if (drag.kind === 'marker') {
      this._patchMarker(m, drag.id, { x: pt.x, y: pt.y }, updateModule);
      return;
    }
    if (drag.kind === 'draw') {
      ed.draft = {
        x: Math.min(drag.startX, pt.x),
        y: Math.min(drag.startY, pt.y),
        width: Math.abs(pt.x - drag.startX),
        height: Math.abs(pt.y - drag.startY),
      };
      this.triggerPreviewUpdate(true);
      return;
    }
    const zone = (m.zones || []).find(z => z.id === drag.id);
    if (!zone) return;
    const r = this._zoneRect(zone);
    if (drag.kind === 'zone-move') {
      this._patchZone(
        m,
        zone.id,
        {
          x: clampPercent(Math.min(Math.max(0, pt.x - drag.grabDx), 100 - r.width)),
          y: clampPercent(Math.min(Math.max(0, pt.y - drag.grabDy), 100 - r.height)),
        },
        updateModule
      );
      return;
    }
    this._patchZone(
      m,
      zone.id,
      {
        width: clampPercent(Math.max(MIN_ZONE, pt.x - r.x)),
        height: clampPercent(Math.max(MIN_ZONE, pt.y - r.y)),
      },
      updateModule
    );
  }

  private _onPlaceUp(e: PointerEvent, m: FloorplanModule, updateModule: UpdateFn, lang: string): void {
    const ed = this._ed(m.id);
    const container = e.currentTarget as HTMLElement;
    container.releasePointerCapture?.(e.pointerId);
    const drag = ed.drag;
    ed.drag = null;
    if (drag?.kind === 'draw') {
      const draft = ed.draft;
      ed.draft = null;
      if (draft && draft.width >= MIN_ZONE && draft.height >= MIN_ZONE) {
        this._addZone(m, updateModule, lang, 'rect', draft);
        return;
      }
    }
    this.triggerPreviewUpdate(true);
  }

  // ── Marker / zone mutations ────────────────────────────────────────────────

  private _patchMarker(
    m: FloorplanModule,
    id: string,
    updates: Partial<FloorplanMarker>,
    updateModule: UpdateFn
  ): void {
    const markers = (m.markers || []).map(mk => {
      if (mk.id !== id) return mk;
      const next: Record<string, unknown> = { ...mk };
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined) delete next[key];
        else next[key] = value;
      }
      return next as unknown as FloorplanMarker;
    });
    updateModule({ markers } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _addMarker(m: FloorplanModule, updateModule: UpdateFn): void {
    const markers = [...(m.markers || [])];
    // Stagger new markers so several added in a row stay visible.
    const step = markers.length % 5;
    const marker: FloorplanMarker = {
      id: this.generateId('marker'),
      entity: '',
      x: clampPercent(42 + step * 4),
      y: clampPercent(42 + step * 4),
      tap_action: { action: 'default' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'nothing' },
    };
    markers.push(marker);
    const ed = this._ed(m.id);
    ed.mode = 'markers';
    ed.activeMarkerId = marker.id;
    ed.expanded.add(marker.id);
    updateModule({ markers } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _removeMarker(m: FloorplanModule, index: number, updateModule: UpdateFn): void {
    const markers = [...(m.markers || [])];
    const [removed] = markers.splice(index, 1);
    if (removed) {
      const ed = this._ed(m.id);
      ed.expanded.delete(removed.id);
      ed.advanced.delete(removed.id);
      if (ed.activeMarkerId === removed.id) ed.activeMarkerId = '';
    }
    updateModule({ markers } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _patchZone(
    m: FloorplanModule,
    id: string,
    updates: Partial<FloorplanZone>,
    updateModule: UpdateFn
  ): void {
    const zones = (m.zones || []).map(z => {
      if (z.id !== id) return z;
      const next: Record<string, unknown> = { ...z };
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined) delete next[key];
        else next[key] = value;
      }
      return next as unknown as FloorplanZone;
    });
    updateModule({ zones } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _addZone(
    m: FloorplanModule,
    updateModule: UpdateFn,
    lang: string,
    shape: 'rect' | 'polygon',
    rect?: { x: number; y: number; width: number; height: number }
  ): void {
    const zones = [...(m.zones || [])];
    const offset = (zones.length % 5) * 5;
    const zone: FloorplanZone = {
      id: this.generateId('zone'),
      entity: '',
      name: t(lang, 'new_zone', 'Room'),
      shape,
      opacity: 35,
      inactive_opacity: 0,
      show_outline: false,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
    };
    if (shape === 'rect') {
      zone.x = clampPercent(rect?.x ?? 10 + offset);
      zone.y = clampPercent(rect?.y ?? 10 + offset);
      zone.width = clampPercent(rect?.width ?? 30);
      zone.height = clampPercent(rect?.height ?? 25);
    } else {
      zone.points = '';
    }
    zones.push(zone);
    const ed = this._ed(m.id);
    ed.mode = 'zones';
    ed.activeZoneId = zone.id;
    ed.expanded.add(zone.id);
    updateModule({ zones } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _removeZone(m: FloorplanModule, index: number, updateModule: UpdateFn): void {
    const zones = [...(m.zones || [])];
    const [removed] = zones.splice(index, 1);
    if (removed) {
      const ed = this._ed(m.id);
      ed.expanded.delete(removed.id);
      ed.advanced.delete(removed.id);
      if (ed.activeZoneId === removed.id) ed.activeZoneId = '';
    }
    updateModule({ zones } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  // ── Display ────────────────────────────────────────────────────────────────

  private _renderDisplaySection(
    m: FloorplanModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const set = (updates: Partial<FloorplanModule>) => {
      updateModule(updates as Partial<CardModule>);
      this.triggerPreviewUpdate();
    };
    return html`
      <div class="settings-section">
        <div class="section-title">${t(lang, 'display_section', 'Display')}</div>
        <div class="uc-fp-section-desc">
          ${t(lang, 'display_section_desc', 'How every marker looks. Each marker can override these.')}
        </div>
        ${this.renderSegmentedField(
          t(lang, 'marker_style', 'Marker style'),
          t(lang, 'marker_style_desc', 'Badges stay readable on busy pictures; plain icons are more minimal.'),
          m.marker_style || 'badge',
          [
            { value: 'badge', label: t(lang, 'style_badge', 'Badge'), icon: 'mdi:circle-slice-8' },
            { value: 'icon', label: t(lang, 'style_icon', 'Icon only'), icon: 'mdi:lightbulb-outline' },
          ],
          next => set({ marker_style: next === 'icon' ? 'icon' : 'badge' }),
          2
        )}
        ${this.renderSliderField(
          t(lang, 'marker_size', 'Icon size'),
          t(lang, 'marker_size_desc', 'Icons keep this size on any screen; their positions scale.'),
          m.marker_size ?? DEFAULT_MARKER_SIZE,
          DEFAULT_MARKER_SIZE,
          12,
          72,
          1,
          (v: number) => set({ marker_size: v }),
          'px'
        )}
        ${this.renderFieldSection(
          t(lang, 'show_names', 'Show names'),
          t(lang, 'show_names_desc', 'Label each marker with its name.'),
          hass,
          { show_names: m.show_names === true },
          [this.booleanField('show_names')],
          (e: CustomEvent) => set({ show_names: e.detail.value?.show_names === true })
        )}
        ${this.renderFieldSection(
          t(lang, 'show_states', 'Show states'),
          t(lang, 'show_states_desc', 'Show the current state, like 21.5 °C or Open.'),
          hass,
          { show_states: m.show_states === true },
          [this.booleanField('show_states')],
          (e: CustomEvent) => set({ show_states: e.detail.value?.show_states === true })
        )}
        ${m.show_names === true || m.show_states === true
          ? this._renderLabelPositionField(
              m.label_position || 'below',
              (v: FloorplanLabelPosition) => set({ label_position: v }),
              lang
            )
          : nothing}
        ${this.renderColorField(
          t(lang, 'active_color', 'Active color'),
          t(lang, 'active_color_desc', 'Icon color while on. Empty uses the theme state colors; lights use their own color.'),
          hass,
          m.active_color || '',
          '',
          (v: string) => set({ active_color: v })
        )}
        ${this.renderColorField(
          t(lang, 'inactive_color', 'Inactive color'),
          '',
          hass,
          m.inactive_color || '',
          '',
          (v: string) => set({ inactive_color: v })
        )}
        ${this.renderFieldSection(
          t(lang, 'glow_lights', 'Glow for lights'),
          t(lang, 'glow_lights_desc', 'Lights that are on cast a soft halo tinted by their color and brightness.'),
          hass,
          { glow_lights: m.glow_lights !== false },
          [this.booleanField('glow_lights')],
          (e: CustomEvent) => set({ glow_lights: e.detail.value?.glow_lights !== false })
        )}
        ${m.glow_lights !== false
          ? this.renderConditionalFieldsGroup(
              t(lang, 'glow_settings', 'Glow'),
              html`
                ${this.renderSliderField(
                  t(lang, 'glow_intensity', 'Glow intensity'),
                  '',
                  m.glow_intensity ?? DEFAULT_GLOW_INTENSITY,
                  DEFAULT_GLOW_INTENSITY,
                  5,
                  100,
                  5,
                  (v: number) => set({ glow_intensity: v }),
                  '%'
                )}
                ${this.renderSliderField(
                  t(lang, 'glow_size', 'Glow size'),
                  t(lang, 'glow_size_desc', 'Width of the halo as a share of the plan width.'),
                  m.glow_size ?? DEFAULT_GLOW_SIZE,
                  DEFAULT_GLOW_SIZE,
                  5,
                  80,
                  1,
                  (v: number) => set({ glow_size: v }),
                  '%'
                )}
              `
            )
          : nothing}
      </div>
    `;
  }

  // ── Room zones ─────────────────────────────────────────────────────────────

  private _renderZonesSection(
    m: FloorplanModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const zones = m.zones || [];
    return html`
      <div class="settings-section">
        <div class="section-title">${t(lang, 'zones_section', 'Room zones')}</div>
        <div class="uc-fp-section-desc">
          ${t(
            lang,
            'zones_section_desc',
            'Optional. Draw rooms on the plan and bind each to a light or sensor; the room fills with color while it is on.'
          )}
        </div>
        ${zones.map((zone, index) => this._renderZoneRow(zone, index, m, hass, config, updateModule, lang))}
        <div class="uc-fp-add-row">
          <button
            class="uc-fp-add-btn"
            type="button"
            @click=${() => this._addZone(m, updateModule, lang, 'rect')}
          >
            <ha-icon icon="mdi:vector-square-plus"></ha-icon>
            ${t(lang, 'add_rect_zone', 'Add rectangle')}
          </button>
          <button
            class="uc-fp-add-btn"
            type="button"
            @click=${() => this._addZone(m, updateModule, lang, 'polygon')}
          >
            <ha-icon icon="mdi:vector-polygon"></ha-icon>
            ${t(lang, 'add_polygon_zone', 'Add polygon')}
          </button>
        </div>
      </div>
    `;
  }

  private _renderZoneRow(
    zone: FloorplanZone,
    index: number,
    m: FloorplanModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const ed = this._ed(m.id);
    const expanded = ed.expanded.has(zone.id);
    const selected = ed.mode === 'zones' && ed.activeZoneId === zone.id;
    const patch = (updates: Partial<FloorplanZone>) => this._patchZone(m, zone.id, updates, updateModule);
    const entityId = this.resolveEntity(zone.entity, config) || zone.entity || '';
    const friendly = entityId ? hass?.states?.[entityId]?.attributes?.friendly_name : undefined;
    const title =
      zone.name?.trim() || (typeof friendly === 'string' ? friendly : '') || t(lang, 'new_zone', 'Room');
    const r = this._zoneRect(zone);
    const pointCount = parsePolygonPoints(zone.points).length;

    return html`
      <div class="uc-fp-row ${selected ? 'selected' : ''}">
        <div class="uc-fp-row-head">
          <button
            type="button"
            class="uc-fp-row-main"
            aria-expanded=${expanded ? 'true' : 'false'}
            @click=${() => {
              if (expanded) ed.expanded.delete(zone.id);
              else ed.expanded.add(zone.id);
              ed.mode = 'zones';
              ed.activeZoneId = zone.id;
              this.triggerPreviewUpdate(true);
            }}
          >
            <ha-icon icon=${zone.shape === 'polygon' ? 'mdi:vector-polygon' : 'mdi:vector-square'}></ha-icon>
            <span class="uc-fp-row-title">${title}</span>
            <span class="uc-fp-row-sub">${entityId || t(lang, 'no_entity', 'No entity')}</span>
            <ha-icon class="uc-fp-chevron" icon=${expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
          </button>
          <button
            type="button"
            class="uc-fp-icon-btn"
            title=${t(lang, 'remove', 'Remove')}
            aria-label=${t(lang, 'remove', 'Remove')}
            @click=${() => this._removeZone(m, index, updateModule)}
          >
            <ha-icon icon="mdi:delete-outline"></ha-icon>
          </button>
        </div>
        ${expanded
          ? html`<div class="uc-fp-row-body">
              ${this.renderEntityPickerWithVariables(
                hass,
                config,
                'entity',
                zone.entity || '',
                (value: string) => patch({ entity: value || '' }),
                undefined,
                t(lang, 'zone_entity', 'Entity (light, motion sensor, door …)')
              )}
              ${this.renderFieldSection(
                t(lang, 'name', 'Name'),
                '',
                hass,
                { name: zone.name || '' },
                [this.textField('name')],
                (e: CustomEvent) => patch({ name: String(e.detail.value?.name ?? '') })
              )}
              ${zone.shape === 'polygon'
                ? html`
                    ${this.renderFieldSection(
                      t(lang, 'points', 'Corners'),
                      t(
                        lang,
                        'points_desc',
                        'Percent x,y pairs separated by spaces. Select this zone and click on the plan to add corners.'
                      ),
                      hass,
                      { points: zone.points || '' },
                      [this.textField('points')],
                      (e: CustomEvent) => patch({ points: String(e.detail.value?.points ?? '') })
                    )}
                    <div class="uc-fp-inline-actions">
                      <span class="uc-fp-row-sub">
                        ${t(lang, 'point_count', 'Corners')}: ${pointCount}
                      </span>
                      <button type="button" class="uc-fp-link-btn" @click=${() => patch({ points: '' })}>
                        <ha-icon icon="mdi:eraser"></ha-icon>
                        ${t(lang, 'clear_points', 'Clear corners')}
                      </button>
                    </div>
                  `
                : html`
                    ${this.renderSliderField(
                      t(lang, 'pos_x', 'Horizontal position'),
                      '',
                      r.x,
                      10,
                      0,
                      100,
                      0.5,
                      (v: number) => patch({ x: clampPercent(v) }),
                      '%'
                    )}
                    ${this.renderSliderField(
                      t(lang, 'pos_y', 'Vertical position'),
                      '',
                      r.y,
                      10,
                      0,
                      100,
                      0.5,
                      (v: number) => patch({ y: clampPercent(v) }),
                      '%'
                    )}
                    ${this.renderSliderField(
                      t(lang, 'zone_width', 'Width'),
                      '',
                      r.width,
                      20,
                      MIN_ZONE,
                      100,
                      0.5,
                      (v: number) => patch({ width: clampPercent(v) }),
                      '%'
                    )}
                    ${this.renderSliderField(
                      t(lang, 'zone_height', 'Height'),
                      '',
                      r.height,
                      20,
                      MIN_ZONE,
                      100,
                      0.5,
                      (v: number) => patch({ height: clampPercent(v) }),
                      '%'
                    )}
                  `}
              ${this.renderColorField(
                t(lang, 'zone_color', 'Fill color'),
                t(lang, 'zone_color_desc', 'Empty uses the light color for lights, otherwise the theme accent.'),
                hass,
                zone.color || '',
                '',
                (v: string) => patch({ color: v || undefined })
              )}
              ${this.renderSliderField(
                t(lang, 'zone_opacity', 'Opacity while active'),
                '',
                zone.opacity ?? 35,
                35,
                0,
                100,
                5,
                (v: number) => patch({ opacity: v }),
                '%'
              )}
              <button
                type="button"
                class="uc-fp-link-btn"
                @click=${() => {
                  if (ed.advanced.has(zone.id)) ed.advanced.delete(zone.id);
                  else ed.advanced.add(zone.id);
                  this.triggerPreviewUpdate(true);
                }}
              >
                <ha-icon icon=${ed.advanced.has(zone.id) ? 'mdi:chevron-up' : 'mdi:tune-variant'}></ha-icon>
                ${ed.advanced.has(zone.id)
                  ? t(lang, 'hide_advanced', 'Hide advanced options')
                  : t(lang, 'show_advanced', 'Advanced options')}
              </button>
              ${ed.advanced.has(zone.id)
                ? this.renderConditionalFieldsGroup(
                    t(lang, 'zone_advanced', 'Advanced'),
                    html`
                      ${this.renderSegmentedField(
                        t(lang, 'zone_shape', 'Shape'),
                        '',
                        zone.shape,
                        [
                          { value: 'rect', label: t(lang, 'shape_rect', 'Rectangle'), icon: 'mdi:vector-square' },
                          { value: 'polygon', label: t(lang, 'shape_polygon', 'Polygon'), icon: 'mdi:vector-polygon' },
                        ],
                        next => {
                          if (next === 'polygon' && zone.shape !== 'polygon') {
                            // Start the polygon from the rectangle's corners.
                            const corners: FloorplanPoint[] = [
                              { x: r.x, y: r.y },
                              { x: r.x + r.width, y: r.y },
                              { x: r.x + r.width, y: r.y + r.height },
                              { x: r.x, y: r.y + r.height },
                            ];
                            patch({ shape: 'polygon', points: serializePolygonPoints(corners) });
                          } else if (next === 'rect' && zone.shape !== 'rect') {
                            patch({ shape: 'rect' });
                          }
                        },
                        2
                      )}
                      ${this.renderSliderField(
                        t(lang, 'zone_inactive_opacity', 'Opacity while off'),
                        '',
                        zone.inactive_opacity ?? 0,
                        0,
                        0,
                        100,
                        5,
                        (v: number) => patch({ inactive_opacity: v }),
                        '%'
                      )}
                      ${this.renderFieldSection(
                        t(lang, 'show_outline', 'Outline'),
                        t(lang, 'show_outline_desc', 'Draw the room edge, even while off.'),
                        hass,
                        { show_outline: zone.show_outline === true },
                        [this.booleanField('show_outline')],
                        (e: CustomEvent) => patch({ show_outline: e.detail.value?.show_outline === true })
                      )}
                      ${this.renderFieldSection(
                        t(lang, 'active_state', 'Active when state is'),
                        t(
                          lang,
                          'active_state_desc',
                          'Optional. By default on, open, unlocked, home and playing count as active.'
                        ),
                        hass,
                        { active_state: zone.active_state || '' },
                        [this.textField('active_state')],
                        (e: CustomEvent) =>
                          patch({ active_state: String(e.detail.value?.active_state ?? '') || undefined })
                      )}
                      ${this._renderActionFields(
                        zone.tap_action,
                        zone.hold_action,
                        zone.double_tap_action,
                        { action: 'nothing' },
                        { action: 'nothing' },
                        hass,
                        updates => patch(updates),
                        lang
                      )}
                    `
                  )
                : nothing}
            </div>`
          : nothing}
      </div>
    `;
  }

  // ── Image & layout ─────────────────────────────────────────────────────────

  private _renderLayoutSection(
    m: FloorplanModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const set = (updates: Partial<FloorplanModule>) => {
      updateModule(updates as Partial<CardModule>);
      this.triggerPreviewUpdate();
    };
    const ratio = m.aspect_ratio || 'auto';
    return html`
      <div class="settings-section">
        <div class="section-title">${t(lang, 'layout_section', 'Image & layout')}</div>
        ${this.renderSegmentedField(
          t(lang, 'aspect_ratio', 'Shape'),
          t(lang, 'aspect_ratio_desc', 'Auto follows the picture. A fixed shape keeps cards in a row the same height.'),
          ratio,
          [
            { value: 'auto', label: t(lang, 'ratio_auto', 'Auto') },
            { value: '16:9', label: '16:9' },
            { value: '4:3', label: '4:3' },
            { value: '3:2', label: '3:2' },
            { value: '1:1', label: '1:1' },
            { value: '3:4', label: '3:4' },
          ],
          next => set({ aspect_ratio: (next || 'auto') as FloorplanModule['aspect_ratio'] }),
          3
        )}
        ${ratio !== 'auto'
          ? this.renderSegmentedField(
              t(lang, 'image_fit', 'Image fit'),
              t(lang, 'image_fit_desc', 'Markers are placed relative to this frame, so re-check them after changing it.'),
              m.image_fit || 'contain',
              [
                { value: 'contain', label: t(lang, 'fit_contain', 'Fit') },
                { value: 'cover', label: t(lang, 'fit_cover', 'Fill & crop') },
                { value: 'fill', label: t(lang, 'fit_fill', 'Stretch') },
              ],
              next => set({ image_fit: (next || 'contain') as FloorplanModule['image_fit'] }),
              3
            )
          : nothing}
        ${this.renderFieldSection(
          t(lang, 'dim_when_all_off', 'Dim when everything is off'),
          t(lang, 'dim_when_all_off_desc', 'Darken the picture while none of the markers or zones are active.'),
          hass,
          { dim_when_all_off: m.dim_when_all_off === true },
          [this.booleanField('dim_when_all_off')],
          (e: CustomEvent) => set({ dim_when_all_off: e.detail.value?.dim_when_all_off === true })
        )}
        ${m.dim_when_all_off === true
          ? this.renderSliderField(
              t(lang, 'dim_amount', 'Dim amount'),
              '',
              m.dim_amount ?? DEFAULT_DIM,
              DEFAULT_DIM,
              5,
              90,
              5,
              (v: number) => set({ dim_amount: v }),
              '%'
            )
          : nothing}
        ${this.renderFileField(
          t(lang, 'dark_image', 'Dark mode image'),
          t(lang, 'dark_image_desc', 'Optional. Shown instead while Home Assistant uses a dark theme. Use the same framing as the main image.'),
          hass,
          m.dark_image || '',
          (path: string) => set({ dark_image: path })
        )}
      </div>
    `;
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as FloorplanModule;
    const lang = hass?.locale?.language || 'en';
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const src = this._resolveImage(m, hass);
    const inEditor = previewContext === 'live' || previewContext === 'ha-preview';

    if (!src) {
      return html`
        <div class="uc-fp-wrapper ${hoverClass}" style=${designStyles}>
          <div class="uc-fp-empty">
            <ha-icon icon="mdi:floor-plan"></ha-icon>
            <div class="uc-fp-empty-title">${t(lang, 'empty_title', 'Add your floor plan')}</div>
            <div class="uc-fp-empty-sub">
              ${t(
                lang,
                'empty_subtitle',
                'Pick a picture of your floor plan in the General tab, then add lights, sensors and doors as markers.'
              )}
            </div>
          </div>
        </div>
      `;
    }

    const frame = this._frame(m);
    const markers = m.markers || [];
    const zones = m.zones || [];
    const resolvedStates = hass?.states;
    const resolvedIds = {
      markers: markers.map(mk => ({ ...mk, entity: this.resolveEntity(mk.entity, config) || mk.entity })),
      zones: zones.map(z => ({ ...z, entity: this.resolveEntity(z.entity, config) || z.entity })),
    };
    const dimmed = m.dim_when_all_off === true && allEntitiesInactive(resolvedStates, resolvedIds);
    const dim = Math.min(90, Math.max(0, m.dim_amount ?? DEFAULT_DIM));
    const imgStyle = dimmed ? `filter:brightness(${Math.round(100 - dim) / 100});` : '';

    const moduleGestures = this.createGestureHandlers(
      m.id,
      {
        tap_action: m.tap_action,
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        module: m,
      },
      hass,
      config
    );
    const bindModule =
      moduleGestures.isActionable &&
      !(isExplicitNothing(m.tap_action) && isExplicitNothing(m.hold_action) && isExplicitNothing(m.double_tap_action));

    const stage = html`
      <div
        class="uc-fp-stage ${dimmed ? 'dimmed' : ''}"
        style=${frame.style}
        @pointerdown=${bindModule ? moduleGestures.onPointerDown : nothing}
        @pointermove=${bindModule ? moduleGestures.onPointerMove : nothing}
        @pointerup=${bindModule ? moduleGestures.onPointerUp : nothing}
        @pointerleave=${bindModule ? moduleGestures.onPointerLeave : nothing}
        @pointercancel=${bindModule ? moduleGestures.onPointerCancel : nothing}
      >
        <img class=${frame.imgClass} style=${imgStyle} src=${src} alt="" draggable="false" />
        ${zones.length
          ? html`<svg class="uc-fp-zones" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              ${resolvedIds.zones.map(zone => this._renderZone(zone, m, hass, config))}
            </svg>`
          : nothing}
        ${resolvedIds.markers.map(marker => this._renderGlow(marker, m, hass))}
        ${resolvedIds.markers.map(marker => this._renderMarker(marker, m, hass, config, lang))}
        ${inEditor && markers.length === 0
          ? html`<div class="uc-fp-hint-chip">
              <ha-icon icon="mdi:map-marker-plus-outline"></ha-icon>
              ${t(lang, 'preview_hint', 'Add markers in the General tab')}
            </div>`
          : nothing}
      </div>
    `;

    return html`
      <div class="uc-fp-wrapper ${hoverClass}" style=${designStyles}>
        ${this.wrapWithAnimation(stage, module, hass)}
      </div>
    `;
  }

  private _renderGlow(marker: FloorplanMarker, m: FloorplanModule, hass: HomeAssistant) {
    const entityId = marker.entity;
    if (entityDomain(entityId) !== 'light') return nothing;
    if (!(marker.glow ?? m.glow_lights !== false)) return nothing;
    const stateObj = hass?.states?.[entityId];
    const brightness = lightBrightness(stateObj);
    const alpha = glowAlpha(brightness, m.glow_intensity ?? DEFAULT_GLOW_INTENSITY);
    if (alpha <= 0) return nothing;
    const rgb = lightRgb(stateObj);
    const size = Math.min(100, Math.max(1, m.glow_size ?? DEFAULT_GLOW_SIZE));
    const mid = Math.round(alpha * 0.45 * 1000) / 1000;
    return html`<div
      class="uc-fp-glow"
      style="left:${clampPercent(marker.x)}%;top:${clampPercent(marker.y)}%;width:${size}%;background:radial-gradient(circle, ${rgbCss(
        rgb,
        alpha
      )} 0%, ${rgbCss(rgb, mid)} 35%, ${rgbCss(rgb, 0)} 70%);"
    ></div>`;
  }

  private _renderZone(
    zone: FloorplanZone,
    m: FloorplanModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined
  ) {
    const entityId = zone.entity;
    const stateObj = entityId ? hass?.states?.[entityId] : undefined;
    const active = isEntityActive(stateObj, zone.active_state);
    const isLight = entityDomain(entityId) === 'light';
    const color =
      zone.color ||
      (isLight && active ? rgbCss(lightRgb(stateObj)) : '') ||
      m.active_color ||
      'var(--primary-color)';
    const opacityPct = active ? zone.opacity ?? 35 : zone.inactive_opacity ?? 0;
    // Brighter lights fill their room more strongly.
    const scale = isLight && active ? 0.4 + 0.6 * lightBrightness(stateObj) : 1;
    const opacity = Math.round(Math.min(100, Math.max(0, opacityPct)) * scale) / 100;
    const outline = zone.show_outline === true;
    const style = `fill:${color};fill-opacity:${opacity};${
      outline ? `stroke:${color};stroke-opacity:0.8;stroke-width:2px;` : 'stroke:none;'
    }`;

    const actionable =
      !!entityId &&
      !(isExplicitNothing(zone.tap_action) && isExplicitNothing(zone.hold_action) && isExplicitNothing(zone.double_tap_action));
    const g = actionable
      ? this.createGestureHandlers(
          `${m.id}-${zone.id}`,
          {
            tap_action: zone.tap_action || { action: 'nothing' },
            hold_action: zone.hold_action || { action: 'nothing' },
            double_tap_action: zone.double_tap_action || { action: 'nothing' },
            entity: entityId,
            module: m,
          },
          hass,
          config
        )
      : null;
    const cls = `uc-fp-zone ${active ? 'on' : ''} ${g ? 'actionable' : ''}`;

    if (zone.shape === 'polygon') {
      const points = parsePolygonPoints(zone.points);
      if (points.length < 3) return nothing;
      return g
        ? svg`<polygon class=${cls} style=${style} points=${serializePolygonPoints(points)}
            @pointerdown=${g.onPointerDown} @pointermove=${g.onPointerMove} @pointerup=${g.onPointerUp}
            @pointerleave=${g.onPointerLeave} @pointercancel=${g.onPointerCancel}></polygon>`
        : svg`<polygon class=${cls} style=${style} points=${serializePolygonPoints(points)}></polygon>`;
    }
    const r = this._zoneRect(zone);
    return g
      ? svg`<rect class=${cls} style=${style} x=${r.x} y=${r.y} width=${r.width} height=${r.height}
          @pointerdown=${g.onPointerDown} @pointermove=${g.onPointerMove} @pointerup=${g.onPointerUp}
          @pointerleave=${g.onPointerLeave} @pointercancel=${g.onPointerCancel}></rect>`
      : svg`<rect class=${cls} style=${style} x=${r.x} y=${r.y} width=${r.width} height=${r.height}></rect>`;
  }

  private _renderMarker(
    marker: FloorplanMarker,
    m: FloorplanModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string
  ): TemplateResult {
    const entityId = marker.entity || '';
    const stateObj = entityId ? hass?.states?.[entityId] : undefined;
    const domain = entityDomain(entityId);
    const active = isEntityActive(stateObj, marker.active_state);
    const unavailable = !stateObj || stateObj.state === 'unavailable';
    const size = Math.min(96, Math.max(8, marker.size ?? m.marker_size ?? DEFAULT_MARKER_SIZE));
    const icon = stateObj ? this._markerIcon(marker, entityId, hass, active) : 'mdi:help-circle-outline';

    let color: string;
    if (unavailable) color = UNAVAILABLE_COLOR;
    else if (active)
      color =
        marker.active_color ||
        m.active_color ||
        (domain === 'light' ? rgbCss(lightRgb(stateObj)) : '') ||
        `var(--state-${domain}-active-color, ${ACTIVE_FALLBACK})`;
    else color = marker.inactive_color || m.inactive_color || INACTIVE_FALLBACK;

    const showName = marker.show_name ?? m.show_names ?? false;
    const showState = marker.show_state ?? m.show_states ?? false;
    const name = this._markerName(marker, entityId, hass);
    const stateText = stateObj
      ? formatEntityState(hass, entityId)
      : entityId
        ? t(lang, 'entity_missing', 'Not found')
        : t(lang, 'unbound_marker', 'Choose an entity');
    const labelPos = marker.label_position || m.label_position || 'below';
    const styleClass = (m.marker_style || 'badge') === 'icon' ? 'style-icon' : 'style-badge';

    const g = this.createGestureHandlers(
      `${m.id}-${marker.id}`,
      {
        tap_action: marker.tap_action || { action: 'default' },
        hold_action: marker.hold_action || { action: 'more-info' },
        double_tap_action: marker.double_tap_action || { action: 'nothing' },
        entity: entityId || undefined,
        module: m,
      },
      hass,
      config
    );
    const actionable = !!entityId && g.isActionable;
    const tooltip = [name, stateObj ? formatEntityState(hass, entityId) : ''].filter(Boolean).join(': ');

    return html`
      <div
        class="uc-fp-marker ${styleClass} label-${labelPos} ${active ? 'on' : ''} ${unavailable
          ? 'unavailable'
          : ''}"
        style="left:${clampPercent(marker.x)}%;top:${clampPercent(marker.y)}%;--uc-fp-size:${size}px;--uc-fp-color:${color};"
        title=${tooltip}
        role=${actionable ? 'button' : nothing}
        tabindex=${actionable ? '0' : nothing}
        aria-label=${tooltip || nothing}
        @pointerdown=${actionable ? g.onPointerDown : nothing}
        @pointermove=${actionable ? g.onPointerMove : nothing}
        @pointerup=${actionable ? g.onPointerUp : nothing}
        @pointerleave=${actionable ? g.onPointerLeave : nothing}
        @pointercancel=${actionable ? g.onPointerCancel : nothing}
        @keydown=${actionable ? g.onKeyDown : nothing}
      >
        <div class="uc-fp-badge">
          <ha-icon icon=${icon}></ha-icon>
        </div>
        ${showName || showState
          ? html`<div class="uc-fp-label">
              ${showName && name ? html`<span class="uc-fp-label-name">${name}</span>` : nothing}
              ${showState ? html`<span class="uc-fp-label-state">${stateText}</span>` : nothing}
            </div>`
          : nothing}
      </div>
    `;
  }

  // ── CSS ────────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      .uc-fp-wrapper { box-sizing: border-box; width: 100%; }

      .uc-fp-stage {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: var(--uc-r-12, 12px);
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
        user-select: none;
        -webkit-user-select: none;
      }
      .uc-fp-img {
        display: block;
        width: 100%;
        height: auto;
        pointer-events: none;
        -webkit-user-drag: none;
        transition: filter 0.45s ease;
      }
      .uc-fp-img.fixed { position: absolute; inset: 0; height: 100%; object-fit: contain; }
      .uc-fp-img.fixed.fit-cover { object-fit: cover; }
      .uc-fp-img.fixed.fit-fill { object-fit: fill; }

      .uc-fp-zones {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: visible;
      }
      .uc-fp-zone {
        transition: fill-opacity 0.45s ease, fill 0.45s ease;
        vector-effect: non-scaling-stroke;
      }
      .uc-fp-zone.actionable { pointer-events: visiblePainted; cursor: pointer; }

      .uc-fp-glow {
        position: absolute;
        aspect-ratio: 1 / 1;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        pointer-events: none;
        transition: background 0.45s ease, opacity 0.45s ease;
      }

      .uc-fp-marker {
        position: absolute;
        width: max(44px, calc(var(--uc-fp-size, 24px) + 16px));
        height: max(44px, calc(var(--uc-fp-size, 24px) + 16px));
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
        outline: none;
      }
      .uc-fp-marker[role='button'] { cursor: pointer; }
      .uc-fp-marker:focus-visible .uc-fp-badge {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .uc-fp-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--uc-fp-color);
        transition: color 0.3s ease, border-color 0.3s ease, transform 0.15s ease, box-shadow 0.3s ease;
      }
      .uc-fp-badge ha-icon { --mdc-icon-size: var(--uc-fp-size, 24px); display: flex; }
      .uc-fp-marker.style-badge .uc-fp-badge {
        width: calc(var(--uc-fp-size, 24px) + 12px);
        height: calc(var(--uc-fp-size, 24px) + 12px);
        border-radius: 50%;
        background: color-mix(in srgb, var(--card-background-color, #fff) 86%, transparent);
        border: 1.5px solid color-mix(in srgb, var(--divider-color, rgba(0, 0, 0, 0.12)) 100%, transparent);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
      }
      .uc-fp-marker.style-badge.on .uc-fp-badge {
        border-color: var(--uc-fp-color);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--uc-fp-color) 25%, transparent), 0 1px 4px rgba(0, 0, 0, 0.25);
      }
      .uc-fp-marker.style-icon .uc-fp-badge {
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.55));
      }
      .uc-fp-marker.unavailable .uc-fp-badge { opacity: 0.7; }
      .uc-fp-marker[role='button']:active .uc-fp-badge { transform: scale(0.92); }

      .uc-fp-label {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
        padding: 2px 7px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--card-background-color, #fff) 86%, transparent);
        color: var(--primary-text-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        font-size: 11px;
        line-height: 1.25;
        white-space: nowrap;
        max-width: 160px;
        pointer-events: none;
        z-index: 1;
      }
      .uc-fp-label span { overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
      .uc-fp-label-name { font-weight: 600; }
      .uc-fp-label-state { color: var(--secondary-text-color); }
      .uc-fp-marker.label-below .uc-fp-label { top: calc(100% - 6px); left: 50%; transform: translateX(-50%); }
      .uc-fp-marker.label-above .uc-fp-label { bottom: calc(100% - 6px); left: 50%; transform: translateX(-50%); }
      .uc-fp-marker.label-left .uc-fp-label { right: calc(100% - 6px); top: 50%; transform: translateY(-50%); align-items: flex-end; }
      .uc-fp-marker.label-right .uc-fp-label { left: calc(100% - 6px); top: 50%; transform: translateY(-50%); align-items: flex-start; }

      .uc-fp-hint-chip {
        position: absolute;
        left: 50%;
        bottom: 10px;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--card-background-color, #fff) 90%, transparent);
        color: var(--primary-text-color);
        font-size: 12px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        pointer-events: none;
        white-space: nowrap;
      }
      .uc-fp-hint-chip ha-icon { --mdc-icon-size: 16px; color: var(--primary-color); }

      .uc-fp-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 8px;
        min-height: 180px;
        padding: 24px 16px;
        box-sizing: border-box;
        border: 2px dashed var(--divider-color, rgba(127, 127, 127, 0.35));
        border-radius: var(--uc-r-12, 12px);
        color: var(--secondary-text-color);
      }
      .uc-fp-empty ha-icon { --mdc-icon-size: 44px; color: var(--primary-color); }
      .uc-fp-empty-title { font-size: 16px; font-weight: 600; color: var(--primary-text-color); }
      .uc-fp-empty-sub { font-size: 13px; line-height: 1.45; max-width: 360px; }

      /* ── Editor ── */
      .uc-fp-section-desc,
      .uc-fp-placement-hint {
        font-size: 12px;
        line-height: 1.5;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
      }
      .uc-fp-placement { margin-bottom: 14px; }
      .uc-fp-placement-hint { margin-bottom: 6px; }
      .uc-fp-placement-msg { font-size: 12px; margin-top: 6px; color: var(--warning-color, #ff9800); }
      .uc-fp-place { touch-action: none; cursor: crosshair; border: 1px solid var(--divider-color); }
      .uc-fp-place .uc-fp-zones { pointer-events: none; }
      .uc-fp-place.mode-zones .uc-fp-place-zone { pointer-events: visiblePainted; cursor: move; }
      .uc-fp-place-zone {
        fill: var(--primary-color);
        fill-opacity: 0.18;
        stroke: var(--primary-color);
        stroke-width: 2px;
        vector-effect: non-scaling-stroke;
      }
      .uc-fp-place.mode-markers .uc-fp-place-zone { fill-opacity: 0.08; stroke-opacity: 0.4; }
      .uc-fp-place-zone.selected { fill-opacity: 0.32; stroke-dasharray: 4 3; }
      .uc-fp-draft {
        fill: var(--primary-color);
        fill-opacity: 0.2;
        stroke: var(--primary-color);
        stroke-width: 2px;
        stroke-dasharray: 4 3;
        vector-effect: non-scaling-stroke;
      }
      .uc-fp-place-marker {
        position: absolute;
        width: 30px;
        height: 30px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        border: 2px solid var(--divider-color, rgba(0, 0, 0, 0.2));
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        cursor: grab;
        box-sizing: border-box;
      }
      .uc-fp-place-marker ha-icon { --mdc-icon-size: 16px; pointer-events: none; }
      .uc-fp-place-marker.selected {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        z-index: 2;
      }
      .uc-fp-place.mode-zones .uc-fp-place-marker { opacity: 0.45; pointer-events: none; }
      .uc-fp-place-handle {
        position: absolute;
        width: 16px;
        height: 16px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: var(--primary-color);
        border: 2px solid var(--card-background-color, #fff);
        cursor: nwse-resize;
        box-sizing: border-box;
        z-index: 3;
      }

      .uc-fp-note {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        padding: 10px 12px;
        margin-bottom: 12px;
        border-radius: 8px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        font-size: 12px;
        line-height: 1.5;
        color: var(--secondary-text-color);
      }
      .uc-fp-note ha-icon { --mdc-icon-size: 18px; color: var(--primary-color); flex-shrink: 0; }
      .uc-fp-empty-rows {
        font-size: 13px;
        color: var(--secondary-text-color);
        padding: 8px 0 12px;
      }

      .uc-fp-row {
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        margin-bottom: 8px;
        background: var(--card-background-color);
        overflow: hidden;
      }
      .uc-fp-row.selected { border-color: var(--primary-color); }
      .uc-fp-row-head { display: flex; align-items: center; gap: 4px; padding-right: 4px; }
      .uc-fp-row-main {
        flex: 1;
        min-width: 0;
        min-height: 48px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        background: none;
        border: none;
        color: var(--primary-text-color);
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .uc-fp-row-main ha-icon { --mdc-icon-size: 20px; color: var(--primary-color); flex-shrink: 0; }
      .uc-fp-row-title { font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .uc-fp-row-sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; margin-left: auto; }
      .uc-fp-chevron { color: var(--secondary-text-color) !important; }
      .uc-fp-icon-btn {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 8px;
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .uc-fp-icon-btn:hover { background: rgba(127, 127, 127, 0.12); }
      .uc-fp-icon-btn.on { color: var(--primary-color); background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); }
      .uc-fp-row-body { padding: 4px 12px 12px; border-top: 1px solid var(--divider-color); }
      .uc-fp-add-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .uc-fp-add-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 44px;
        padding: 8px 16px;
        border-radius: 10px;
        border: 1px dashed var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
        color: var(--primary-color);
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        flex: 1;
      }
      .uc-fp-add-btn ha-icon { --mdc-icon-size: 18px; }
      .uc-fp-link-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 44px;
        padding: 6px 4px;
        margin-bottom: 8px;
        border: none;
        background: none;
        color: var(--primary-color);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .uc-fp-link-btn ha-icon { --mdc-icon-size: 18px; }
      .uc-fp-inline-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}

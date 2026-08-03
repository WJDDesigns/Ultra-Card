import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, CleaningZoneRegion, CleaningZonesModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { hasProAccess, renderProLockUI } from '../utils/uc-pro-access';
import { todoSupportsDescription } from '../services/uc-record-store';
import { getImageUrl } from '../utils/image-upload';
import {
  ucCleaningZonesService,
  zoneIntervalDays,
  type CleaningEvent,
  type ZoneStalenessState,
  type ZoneStatus,
} from '../services/uc-cleaning-zones-service';

/** Per-card preview state. Modules are singletons, so everything is keyed by module id. */
interface CleaningPreviewState {
  events: CleaningEvent[];
  loading: boolean;
  lastFetchedAt: number;
  fetchKey: string;
  error: string;
  /** Inline undo affordance shown right after a clean is recorded. */
  undo: { zoneId: string; zoneName: string; at: number } | null;
  /** Zone waiting on a confirm tap when `require_confirm` is on. */
  confirmZoneId: string;
  busyZoneId: string;
  /** Zone whose detail row is expanded in the list view. */
  openZoneId: string;
}

/** Per-card editor state (expanded rows, draw mode). */
interface CleaningEditorState {
  expanded: Set<string>;
  advanced: Set<string>;
  /** True while the user is dragging out a new zone on the floorplan. */
  drawing: boolean;
  draft: { x: number; y: number; width: number; height: number } | null;
  /** Zone being dragged, resized or rotated on the placement map. */
  activeZoneId: string;
  mode: 'move' | 'resize' | 'rotate' | null;
  /** Grab offset inside the zone, so dragging doesn't snap the corner to the cursor. */
  grabDx: number;
  grabDy: number;
  /** Pointer bearing minus the zone's rotation at grab time, so rotating is relative. */
  grabAngle: number;
  message: string;
}

/** A pointer position on the placement canvas, in both coordinate systems. */
interface CanvasPoint {
  /** Normalized 0–1 position within the image. */
  x: number;
  y: number;
  /**
   * Unclamped pixel position, plus the image's pixel size. CSS `rotate()` is a
   * pixel-space transform, so the rotation math cannot run in normalized units —
   * on a non-square image they disagree.
   */
  px: number;
  py: number;
  imageW: number;
  imageH: number;
}

/** Resolved colors for one render pass. */
interface CleaningPalette {
  fresh: string;
  due: string;
  overdue: string;
  text: string;
  secondary: string;
  cardBg: string;
}

const MS_PER_DAY = 86400000;
const UNDO_WINDOW_MS = 20000;
/** Smallest zone the drag editor will create, as a fraction of the image. */
const MIN_ZONE_SIZE = 0.03;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Wraps any angle into whole degrees in the range 0–359. */
function normalizeRotation(deg: number | undefined): number {
  if (typeof deg !== 'number' || !Number.isFinite(deg)) return 0;
  const wrapped = Math.round(deg) % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/** Rotates an offset vector clockwise, matching the direction of CSS `rotate()`. */
function rotateVector(dx: number, dy: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
}

/** Degrees the pointer sits at, measured from the zone's center. */
function bearingDegrees(fromX: number, fromY: number, toX: number, toY: number): number {
  return (Math.atan2(toY - fromY, toX - fromX) * 180) / Math.PI;
}

/**
 * Cleaning Zones (Pro) — a floorplan of tappable rooms that fade from fresh to
 * overdue as their cleaning intervals elapse, backed by a Local To-do helper.
 *
 * The map is optional on purpose: with no floorplan the list view alone is a
 * complete room-chore tracker, so the module is useful before anyone uploads
 * an image.
 */
export class UltraCleaningZonesModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'cleaning_zones',
    title: 'Cleaning Zones',
    description: 'Floorplan with per-room cleaning schedules and staleness heatmap',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:spray-bottle',
    category: 'data',
    tags: [
      'pro',
      'premium',
      'cleaning',
      'chores',
      'floorplan',
      'rooms',
      'schedule',
      'housekeeping',
    ],
  };

  private _preview = new Map<string, CleaningPreviewState>();
  private _editor = new Map<string, CleaningEditorState>();

  // ── Defaults & validation ──────────────────────────────────────────────────

  createDefault(id?: string, _hass?: HomeAssistant): CleaningZonesModule {
    return {
      id: id || this.generateId('cleaning_zones'),
      type: 'cleaning_zones',

      todo_entity: '',
      floorplan_image: '',
      zones: [],

      view_mode: 'both',
      default_interval_days: 7,
      overdue_grace_days: 1,
      sort_mode: 'staleness',

      title: '',
      show_title: true,
      show_summary_bar: true,
      show_legend: true,
      show_zone_labels: true,
      staleness_style: 'heat',
      zone_opacity: 0.55,

      require_confirm: false,
      log_cleaner: false,
      person_entity: '',
      history_limit: 20,

      fresh_color: '',
      due_color: '',
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
    const m = module as CleaningZonesModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (!m.todo_entity) errors.push('Select a to-do list to store the cleaning history');
    return { valid: errors.length === 0, errors };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as CleaningZonesModule;
    const ids: string[] = [];
    if (m.todo_entity) ids.push(m.todo_entity);
    if (m.log_cleaner && m.person_entity) ids.push(m.person_entity);
    for (const zone of m.zones || []) {
      if (zone.auto_clean_entity) ids.push(zone.auto_clean_entity);
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
    const m = module as CleaningZonesModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.cleaning_zones.pro_description',
          lang,
          'Cleaning Zones is a Pro feature: draw rooms on your floorplan, give each one a cleaning interval, and watch them shade from fresh to overdue. Tap a room to log that it was cleaned.'
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
        ${this._renderFloorplanSection(m, hass, updateModule, lang)}
        ${this._renderZonesSection(m, hass, updateModule, lang)}
        ${this._renderDisplaySection(m, hass, updateModule, lang)}
        ${this._renderAdvancedSection(m, hass, updateModule, lang)}
        ${this._renderColorsSection(m, hass, updateModule, lang)}
      </div>
    `;
  }

  // ── General tab: storage ───────────────────────────────────────────────────

  private _renderStorageSection(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const chosen = m.todo_entity || '';
    const descriptionsOk = !chosen || !hass ? true : todoSupportsDescription(hass, chosen);

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.cleaning_zones.storage_section', lang, 'Storage')}
        </div>
        <div class="uc-cz-note">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <span>
            ${localize(
              'editor.cleaning_zones.storage_help',
              lang,
              'Cleaning history lives on a to-do list so every device in the house sees the same log. Create one under Settings → Devices & Services → Helpers → To-do list (Local to-do), name it something like “Cleaning”, then pick it here.'
            )}
          </span>
        </div>
        ${this.renderFieldSection(
          localize('editor.cleaning_zones.todo_entity', lang, 'Cleaning history list'),
          localize(
            'editor.cleaning_zones.todo_entity_desc',
            lang,
            'A Local To-do helper used as storage. Entries are saved as completed items, so they stay out of your active to-do view.'
          ),
          hass,
          { todo_entity: chosen },
          [{ name: 'todo_entity', selector: { entity: { domain: 'todo' } } }],
          (e: CustomEvent) => {
            updateModule({
              todo_entity: e.detail.value?.todo_entity ?? '',
            } as Partial<CardModule>);
            const state = this._preview.get(m.id);
            if (state) state.lastFetchedAt = 0;
            ucCleaningZonesService.resetAutoCleanState(chosen);
            this.triggerPreviewUpdate();
          }
        )}
        ${!descriptionsOk
          ? html`
              <div class="uc-cz-warn">
                <ha-icon icon="mdi:alert-outline"></ha-icon>
                <span>
                  ${localize(
                    'editor.cleaning_zones.todo_no_description',
                    lang,
                    'This list cannot store item descriptions (the Shopping List behaves this way). Tracking still works, but the stored data is appended to each item title and looks messy in the Home Assistant to-do panel. A Local To-do helper avoids that.'
                  )}
                </span>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  // ── General tab: floorplan ─────────────────────────────────────────────────

  private _renderFloorplanSection(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.cleaning_zones.floorplan_section', lang, 'Floorplan')}
        </div>
        <div class="uc-cz-section-desc">
          ${localize(
            'editor.cleaning_zones.floorplan_section_desc',
            lang,
            'Optional. Without an image the list view still works as a plain room-chore tracker.'
          )}
        </div>
        ${this.renderFileField(
          localize('editor.cleaning_zones.floorplan_image', lang, 'Floorplan image'),
          localize(
            'editor.cleaning_zones.floorplan_image_desc',
            lang,
            'A top-down plan of your home. Any image works — a screenshot of a vacuum map is a good shortcut.'
          ),
          hass,
          m.floorplan_image || '',
          (path: string) => {
            updateModule({ floorplan_image: path } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSegmentedField(
          localize('editor.cleaning_zones.view_mode', lang, 'View'),
          localize(
            'editor.cleaning_zones.view_mode_desc',
            lang,
            'What the card shows. Map falls back to the list when no image is set.'
          ),
          m.view_mode || 'both',
          [
            { value: 'map', label: localize('editor.cleaning_zones.view_map', lang, 'Map') },
            { value: 'list', label: localize('editor.cleaning_zones.view_list', lang, 'List') },
            { value: 'both', label: localize('editor.cleaning_zones.view_both', lang, 'Both') },
          ],
          (value: string) => {
            updateModule({
              view_mode: value as CleaningZonesModule['view_mode'],
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
      </div>
    `;
  }

  // ── General tab: zones ─────────────────────────────────────────────────────

  private _renderZonesSection(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const zones = m.zones || [];

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.cleaning_zones.zones_section', lang, 'Zones')}
        </div>
        <div class="uc-cz-section-desc">
          ${localize(
            'editor.cleaning_zones.zones_section_desc',
            lang,
            'One entry per room or area. A name and an interval are all that is required.'
          )}
        </div>

        ${this._renderPlacementMap(m, hass, updateModule, lang)}
        ${zones.length === 0
          ? html`<div class="uc-cz-empty-rows">
              ${localize(
                'editor.cleaning_zones.no_zones_editor',
                lang,
                'No zones yet. Add one below, or drag a rectangle on the floorplan above.'
              )}
            </div>`
          : nothing}
        ${zones.map((zone, index) => this._renderZoneRow(zone, index, m, hass, updateModule, lang))}

        <button
          class="uc-cz-add-btn"
          type="button"
          @click=${() => this._addZone(m, updateModule, lang)}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${localize('editor.cleaning_zones.add_zone', lang, 'Add zone')}
        </button>
      </div>
    `;
  }

  /**
   * Drag-to-draw placement map. Dragging on empty space creates a zone; dragging
   * a zone moves it; dragging its corner handle resizes it. Pointer events are
   * captured on the container so the gesture survives leaving the element.
   */
  private _renderPlacementMap(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const src = this._imageUrl(hass, m.floorplan_image);
    if (!src) {
      return html`
        <div class="uc-cz-note">
          <ha-icon icon="mdi:image-outline"></ha-icon>
          <span>
            ${localize(
              'editor.cleaning_zones.placement_needs_image',
              lang,
              'Upload a floorplan above to place zones by dragging. You can still add zones and set their position numerically.'
            )}
          </span>
        </div>
      `;
    }

    const editor = this._ensureEditor(m.id);
    const zones = m.zones || [];

    return html`
      <div class="uc-cz-placement">
        <div class="uc-cz-placement-hint">
          ${localize(
            'editor.cleaning_zones.placement_hint',
            lang,
            'Drag on empty space to draw a new zone. Drag a zone to move it, its bottom-right corner to resize, or the knob above it to rotate. Hold Shift while rotating to snap to 15°.'
          )}
        </div>
        <div
          class="uc-cz-canvas"
          @pointerdown=${(e: PointerEvent) => this._onCanvasPointerDown(e, m, updateModule, lang)}
          @pointermove=${(e: PointerEvent) => this._onCanvasPointerMove(e, m, updateModule)}
          @pointerup=${(e: PointerEvent) => this._onCanvasPointerUp(e, m, updateModule, lang)}
          @pointercancel=${(e: PointerEvent) => this._onCanvasPointerUp(e, m, updateModule, lang)}
        >
          <img src=${src} alt="" draggable="false" />
          ${zones.map(
            zone => html`
              <div
                class="uc-cz-place-zone ${editor.activeZoneId === zone.id ? 'active' : ''}"
                data-zone=${zone.id}
                style=${this._rectStyle(zone, zone.rotation)}
              >
                <span class="uc-cz-place-label">${zone.name || '—'}</span>
                <span
                  class="uc-cz-rotate"
                  data-rotate=${zone.id}
                  title=${localize('editor.cleaning_zones.rotate_handle', lang, 'Drag to rotate')}
                >
                  <ha-icon icon="mdi:rotate-right"></ha-icon>
                </span>
                <span class="uc-cz-handle" data-handle=${zone.id}></span>
              </div>
            `
          )}
          ${editor.draft
            ? html`<div class="uc-cz-draft" style=${this._rectStyle(editor.draft)}></div>`
            : nothing}
        </div>
        ${editor.message ? html`<div class="uc-cz-placement-msg">${editor.message}</div>` : nothing}
      </div>
    `;
  }

  private _renderZoneRow(
    zone: CleaningZoneRegion,
    index: number,
    m: CleaningZonesModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const editor = this._ensureEditor(m.id);
    const expanded = editor.expanded.has(zone.id);
    const zones = m.zones || [];
    const defaultInterval = m.default_interval_days ?? 7;
    const interval = zoneIntervalDays(zone, defaultInterval);

    return html`
      <div class="uc-cz-row ${expanded ? 'expanded' : ''}">
        <div class="uc-cz-row-head">
          <div class="uc-cz-row-icon">
            <ha-icon icon=${zone.icon || 'mdi:broom'}></ha-icon>
          </div>
          <div class="uc-cz-row-text">
            <div class="uc-cz-row-name">
              ${zone.name || localize('editor.cleaning_zones.unnamed_zone', lang, 'Unnamed zone')}
            </div>
            <div class="uc-cz-row-sub">
              ${localize('editor.cleaning_zones.row_every_days', lang, 'every {days} days').replace(
                '{days}',
                String(interval)
              )}
              ${zone.auto_clean_entity
                ? html` · <ha-icon class="uc-cz-inline-icon" icon="mdi:robot-vacuum"></ha-icon>`
                : nothing}
            </div>
          </div>
          <button
            class="uc-cz-icon-btn"
            type="button"
            ?disabled=${index === 0}
            title=${localize('editor.cleaning_zones.move_up', lang, 'Move up')}
            aria-label=${localize('editor.cleaning_zones.move_up', lang, 'Move up')}
            @click=${() => this._moveZone(m, index, -1, updateModule)}
          >
            <ha-icon icon="mdi:chevron-up"></ha-icon>
          </button>
          <button
            class="uc-cz-icon-btn"
            type="button"
            ?disabled=${index === zones.length - 1}
            title=${localize('editor.cleaning_zones.move_down', lang, 'Move down')}
            aria-label=${localize('editor.cleaning_zones.move_down', lang, 'Move down')}
            @click=${() => this._moveZone(m, index, 1, updateModule)}
          >
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </button>
          <button
            class="uc-cz-icon-btn expand ${expanded ? 'on' : ''}"
            type="button"
            title=${expanded
              ? localize('editor.cleaning_zones.collapse', lang, 'Collapse')
              : localize('editor.cleaning_zones.edit', lang, 'Edit')}
            aria-label=${expanded
              ? localize('editor.cleaning_zones.collapse', lang, 'Collapse')
              : localize('editor.cleaning_zones.edit', lang, 'Edit')}
            @click=${() => {
              if (expanded) editor.expanded.delete(zone.id);
              else editor.expanded.add(zone.id);
              this.triggerPreviewUpdate();
            }}
          >
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button
            class="uc-cz-icon-btn danger"
            type="button"
            title=${localize('editor.cleaning_zones.delete_zone', lang, 'Delete zone')}
            aria-label=${localize('editor.cleaning_zones.delete_zone', lang, 'Delete zone')}
            @click=${() => this._deleteZone(m, index, hass, updateModule)}
          >
            <ha-icon icon="mdi:delete-outline"></ha-icon>
          </button>
        </div>

        ${expanded
          ? html`
              <div class="uc-cz-row-body">
                ${this.renderFieldSection(
                  localize('editor.cleaning_zones.zone_name', lang, 'Name'),
                  localize(
                    'editor.cleaning_zones.zone_name_desc',
                    lang,
                    'What you call this area — “Kitchen”, “Upstairs bathroom”.'
                  ),
                  hass,
                  { name: zone.name || '' },
                  [this.textField('name')],
                  (e: CustomEvent) =>
                    this._patchZone(m, index, { name: e.detail.value?.name ?? '' }, updateModule)
                )}
                ${this.renderIconField(
                  localize('editor.cleaning_zones.zone_icon', lang, 'Icon'),
                  localize(
                    'editor.cleaning_zones.zone_icon_desc',
                    lang,
                    'Shown in the list view and on larger map zones.'
                  ),
                  hass,
                  zone.icon || '',
                  (value: string) => this._patchZone(m, index, { icon: value }, updateModule)
                )}
                ${this.renderSliderField(
                  localize('editor.cleaning_zones.zone_interval', lang, 'Clean every'),
                  localize(
                    'editor.cleaning_zones.zone_interval_desc',
                    lang,
                    'How often this area should be cleaned.'
                  ),
                  interval,
                  defaultInterval,
                  1,
                  90,
                  1,
                  (value: number) =>
                    this._patchZone(m, index, { interval_days: value }, updateModule),
                  localize('editor.cleaning_zones.unit_days', lang, ' days')
                )}
                ${zone.interval_days !== undefined
                  ? html`<button
                      class="uc-cz-linkbtn"
                      type="button"
                      @click=${() => this._clearZoneField(m, index, 'interval_days', updateModule)}
                    >
                      ${localize(
                        'editor.cleaning_zones.use_default_interval',
                        lang,
                        'Use the module default ({days} days)'
                      ).replace('{days}', String(defaultInterval))}
                    </button>`
                  : nothing}
                ${this.renderColorField(
                  localize('editor.cleaning_zones.zone_color', lang, 'Zone color override'),
                  localize(
                    'editor.cleaning_zones.zone_color_desc',
                    lang,
                    'Leave blank to use the fresh → overdue gradient.'
                  ),
                  hass,
                  zone.color || '',
                  '',
                  (value: string) => this._patchZone(m, index, { color: value }, updateModule)
                )}
                ${this.renderFieldSection(
                  localize('editor.cleaning_zones.zone_notes', lang, 'Notes'),
                  localize(
                    'editor.cleaning_zones.zone_notes_desc',
                    lang,
                    'Optional reminder — “mop, don’t vacuum”, “move the rug”.'
                  ),
                  hass,
                  { notes: zone.notes || '' },
                  [this.textField('notes', true)],
                  (e: CustomEvent) =>
                    this._patchZone(m, index, { notes: e.detail.value?.notes ?? '' }, updateModule)
                )}
                ${this._renderGeometryFields(zone, index, m, hass, updateModule, lang)}
                ${this._renderAutoCleanGroup(zone, index, m, hass, updateModule, lang)}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  /**
   * Numeric position fallback, for precision and for anyone without a pointer.
   * Only meaningful once a floorplan exists, so it stays hidden until then.
   */
  private _renderGeometryFields(
    zone: CleaningZoneRegion,
    index: number,
    m: CleaningZonesModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult | typeof nothing {
    if (!m.floorplan_image) return nothing;

    const pct = (value: number) => Math.round(clamp01(value) * 100);
    const labelled = (name: string, label: string, min: number) => ({
      ...this.numberField(name, min, 100, 1),
      label,
    });

    return html`
      <div class="field-container uc-ultra-field-wrap" style="margin-bottom: 16px;">
        <div class="field-title">
          ${localize('editor.cleaning_zones.zone_position', lang, 'Position on the floorplan')}
        </div>
        <div class="field-description">
          ${localize(
            'editor.cleaning_zones.zone_position_desc',
            lang,
            'Percentages of the image, measured from the top-left corner. Usually easier to set by dragging on the map above.'
          )}
        </div>
        ${this.renderUcForm(
          hass,
          {
            zone_x: pct(zone.x),
            zone_y: pct(zone.y),
            zone_w: pct(zone.width),
            zone_h: pct(zone.height),
          },
          [
            this.gridField([
              labelled('zone_x', localize('editor.cleaning_zones.pos_x', lang, 'Left %'), 0),
              labelled('zone_y', localize('editor.cleaning_zones.pos_y', lang, 'Top %'), 0),
              labelled('zone_w', localize('editor.cleaning_zones.pos_w', lang, 'Width %'), 1),
              labelled('zone_h', localize('editor.cleaning_zones.pos_h', lang, 'Height %'), 1),
            ]),
          ],
          (e: CustomEvent) => {
            const v = e.detail.value || {};
            this._patchZone(
              m,
              index,
              {
                x: clamp01(Number(v.zone_x ?? pct(zone.x)) / 100),
                y: clamp01(Number(v.zone_y ?? pct(zone.y)) / 100),
                width: clamp01(Number(v.zone_w ?? pct(zone.width)) / 100),
                height: clamp01(Number(v.zone_h ?? pct(zone.height)) / 100),
              },
              updateModule
            );
          },
          true
        )}
      </div>
      ${this.renderSliderField(
        localize('editor.cleaning_zones.zone_rotation', lang, 'Rotation'),
        localize(
          'editor.cleaning_zones.zone_rotation_desc',
          lang,
          'Angle the zone to line up with a room that is not square to the image, such as on an isometric floorplan.'
        ),
        normalizeRotation(zone.rotation),
        0,
        0,
        359,
        1,
        (value: number) =>
          this._patchZone(m, index, { rotation: normalizeRotation(value) }, updateModule),
        localize('editor.cleaning_zones.unit_degrees', lang, '°')
      )}
    `;
  }

  private _renderAutoCleanGroup(
    zone: CleaningZoneRegion,
    index: number,
    m: CleaningZonesModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const editor = this._ensureEditor(m.id);
    const open = editor.advanced.has(zone.id) || !!zone.auto_clean_entity;

    return html`
      <button
        class="uc-cz-subtoggle ${open ? 'on' : ''}"
        type="button"
        @click=${() => {
          if (editor.advanced.has(zone.id)) editor.advanced.delete(zone.id);
          else editor.advanced.add(zone.id);
          this.triggerPreviewUpdate();
        }}
      >
        <ha-icon icon=${open ? 'mdi:chevron-down' : 'mdi:chevron-right'}></ha-icon>
        ${localize('editor.cleaning_zones.auto_clean_group', lang, 'Automatic cleaning')}
      </button>
      ${open
        ? html`
            <div class="uc-cz-subgroup">
              <div class="uc-cz-section-desc">
                ${localize(
                  'editor.cleaning_zones.auto_clean_desc',
                  lang,
                  'Optional. When this entity enters the state below, the zone is marked clean automatically — handy for a robot vacuum that reports which room it finished.'
                )}
              </div>
              ${this.renderFieldSection(
                localize('editor.cleaning_zones.auto_clean_entity', lang, 'Trigger entity'),
                '',
                hass,
                { auto_clean_entity: zone.auto_clean_entity || '' },
                [{ name: 'auto_clean_entity', selector: { entity: {} } }],
                (e: CustomEvent) =>
                  this._patchZone(
                    m,
                    index,
                    { auto_clean_entity: e.detail.value?.auto_clean_entity ?? '' },
                    updateModule
                  )
              )}
              ${this.renderFieldSection(
                localize(
                  'editor.cleaning_zones.auto_clean_state',
                  lang,
                  'State that means “cleaned”'
                ),
                localize(
                  'editor.cleaning_zones.auto_clean_state_desc',
                  lang,
                  'For example “docked” or “returning”. Matching is case-insensitive.'
                ),
                hass,
                { auto_clean_state: zone.auto_clean_state || '' },
                [this.textField('auto_clean_state')],
                (e: CustomEvent) =>
                  this._patchZone(
                    m,
                    index,
                    { auto_clean_state: e.detail.value?.auto_clean_state ?? '' },
                    updateModule
                  )
              )}
            </div>
          `
        : nothing}
    `;
  }

  // ── General tab: display ───────────────────────────────────────────────────

  private _renderDisplaySection(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const set = (updates: Partial<CleaningZonesModule>) => {
      updateModule(updates as Partial<CardModule>);
      this.triggerPreviewUpdate();
    };

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.cleaning_zones.display_section', lang, 'Display')}
        </div>
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.cleaning_zones.show_title', lang, 'Show title'),
            description: '',
            hass,
            data: { show_title: m.show_title !== false },
            schema: [this.booleanField('show_title')],
            onChange: (e: CustomEvent) => set({ show_title: e.detail.value.show_title }),
          },
          {
            title: localize('editor.cleaning_zones.title', lang, 'Title override'),
            description: localize(
              'editor.cleaning_zones.title_desc',
              lang,
              'Leave blank to use “Cleaning Zones”.'
            ),
            hass,
            data: { title: m.title || '' },
            schema: [this.textField('title')],
            onChange: (e: CustomEvent) => set({ title: e.detail.value.title }),
          },
          {
            title: localize('editor.cleaning_zones.show_summary_bar', lang, 'Show summary bar'),
            description: localize(
              'editor.cleaning_zones.show_summary_bar_desc',
              lang,
              'A one-line count of what needs attention, plus the most overdue room.'
            ),
            hass,
            data: { show_summary_bar: m.show_summary_bar !== false },
            schema: [this.booleanField('show_summary_bar')],
            onChange: (e: CustomEvent) =>
              set({ show_summary_bar: e.detail.value.show_summary_bar }),
          },
          {
            title: localize('editor.cleaning_zones.show_legend', lang, 'Show legend'),
            description: '',
            hass,
            data: { show_legend: m.show_legend !== false },
            schema: [this.booleanField('show_legend')],
            onChange: (e: CustomEvent) => set({ show_legend: e.detail.value.show_legend }),
          },
          {
            title: localize('editor.cleaning_zones.show_zone_labels', lang, 'Show zone labels'),
            description: localize(
              'editor.cleaning_zones.show_zone_labels_desc',
              lang,
              'Labels are hidden automatically on zones that are too small to fit them.'
            ),
            hass,
            data: { show_zone_labels: m.show_zone_labels !== false },
            schema: [this.booleanField('show_zone_labels')],
            onChange: (e: CustomEvent) =>
              set({ show_zone_labels: e.detail.value.show_zone_labels }),
          },
        ])}
        ${this.renderSegmentedField(
          localize('editor.cleaning_zones.staleness_style', lang, 'Staleness style'),
          localize(
            'editor.cleaning_zones.staleness_style_desc',
            lang,
            'How overdue rooms stand out on the map.'
          ),
          m.staleness_style || 'heat',
          [
            { value: 'heat', label: localize('editor.cleaning_zones.style_heat', lang, 'Heat') },
            {
              value: 'outline',
              label: localize('editor.cleaning_zones.style_outline', lang, 'Outline'),
            },
            { value: 'badge', label: localize('editor.cleaning_zones.style_badge', lang, 'Badge') },
          ],
          (value: string) =>
            set({ staleness_style: value as CleaningZonesModule['staleness_style'] })
        )}
        ${this.renderSliderField(
          localize('editor.cleaning_zones.zone_opacity', lang, 'Zone opacity'),
          localize(
            'editor.cleaning_zones.zone_opacity_desc',
            lang,
            'How strongly zone tints cover the floorplan.'
          ),
          m.zone_opacity ?? 0.55,
          0.55,
          0.1,
          1,
          0.05,
          (value: number) => set({ zone_opacity: value }),
          ''
        )}
        ${this.renderSegmentedField(
          localize('editor.cleaning_zones.sort_mode', lang, 'List order'),
          localize(
            'editor.cleaning_zones.sort_mode_desc',
            lang,
            'How rooms are ordered in the list view.'
          ),
          m.sort_mode || 'staleness',
          [
            {
              value: 'staleness',
              label: localize('editor.cleaning_zones.sort_staleness', lang, 'Most overdue'),
            },
            { value: 'name', label: localize('editor.cleaning_zones.sort_name', lang, 'Name') },
            {
              value: 'interval',
              label: localize('editor.cleaning_zones.sort_interval', lang, 'Interval'),
            },
          ],
          (value: string) => set({ sort_mode: value as CleaningZonesModule['sort_mode'] })
        )}
      </div>
    `;
  }

  // ── General tab: advanced ──────────────────────────────────────────────────

  private _renderAdvancedSection(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const set = (updates: Partial<CleaningZonesModule>) => {
      updateModule(updates as Partial<CardModule>);
      this.triggerPreviewUpdate();
    };

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.cleaning_zones.advanced_section', lang, 'Advanced')}
        </div>
        ${this.renderSliderField(
          localize('editor.cleaning_zones.default_interval', lang, 'Default interval'),
          localize(
            'editor.cleaning_zones.default_interval_desc',
            lang,
            'Used by any zone that has not set its own interval.'
          ),
          m.default_interval_days ?? 7,
          7,
          1,
          90,
          1,
          (value: number) => set({ default_interval_days: value }),
          localize('editor.cleaning_zones.unit_days', lang, ' days')
        )}
        ${this.renderSliderField(
          localize('editor.cleaning_zones.overdue_grace', lang, 'Overdue grace period'),
          localize(
            'editor.cleaning_zones.overdue_grace_desc',
            lang,
            'How many days past the interval a room stays merely “due” before it turns overdue.'
          ),
          m.overdue_grace_days ?? 1,
          1,
          0,
          30,
          1,
          (value: number) => set({ overdue_grace_days: value }),
          localize('editor.cleaning_zones.unit_days', lang, ' days')
        )}
        ${this.renderSettingsSection('', '', [
          {
            title: localize(
              'editor.cleaning_zones.require_confirm',
              lang,
              'Confirm before logging'
            ),
            description: localize(
              'editor.cleaning_zones.require_confirm_desc',
              lang,
              'Asks for a second tap. Worth turning on for a wall tablet where stray taps happen.'
            ),
            hass,
            data: { require_confirm: !!m.require_confirm },
            schema: [this.booleanField('require_confirm')],
            onChange: (e: CustomEvent) => set({ require_confirm: e.detail.value.require_confirm }),
          },
          {
            title: localize('editor.cleaning_zones.log_cleaner', lang, 'Record who cleaned'),
            description: localize(
              'editor.cleaning_zones.log_cleaner_desc',
              lang,
              'Stores a name alongside each entry so you can see who did what.'
            ),
            hass,
            data: { log_cleaner: !!m.log_cleaner },
            schema: [this.booleanField('log_cleaner')],
            onChange: (e: CustomEvent) => set({ log_cleaner: e.detail.value.log_cleaner }),
          },
        ])}
        ${m.log_cleaner
          ? html`<div>
              ${this.renderFieldSection(
                localize('editor.cleaning_zones.person_entity', lang, 'Person'),
                localize(
                  'editor.cleaning_zones.person_entity_desc',
                  lang,
                  'Whose name to record. The card cannot tell who tapped it, so this is a fixed attribution.'
                ),
                hass,
                { person_entity: m.person_entity || '' },
                [{ name: 'person_entity', selector: { entity: { domain: 'person' } } }],
                (e: CustomEvent) => set({ person_entity: e.detail.value?.person_entity ?? '' })
              )}
            </div>`
          : nothing}
        ${this.renderSliderField(
          localize('editor.cleaning_zones.history_limit', lang, 'History kept per zone'),
          localize(
            'editor.cleaning_zones.history_limit_desc',
            lang,
            'Older entries are deleted so the to-do list does not grow without bound.'
          ),
          m.history_limit ?? 20,
          20,
          1,
          100,
          1,
          (value: number) => set({ history_limit: value }),
          ''
        )}
      </div>
    `;
  }

  // ── General tab: colors ────────────────────────────────────────────────────

  private _renderColorsSection(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const set = (updates: Partial<CleaningZonesModule>) => {
      updateModule(updates as Partial<CardModule>);
      this.triggerPreviewUpdate();
    };

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.cleaning_zones.colors_section', lang, 'Colors')}
        </div>
        ${this.renderColorField(
          localize('editor.cleaning_zones.fresh_color', lang, 'Fresh'),
          '',
          hass,
          m.fresh_color || '',
          'var(--success-color, #4caf50)',
          (value: string) => set({ fresh_color: value })
        )}
        ${this.renderColorField(
          localize('editor.cleaning_zones.due_color', lang, 'Due'),
          '',
          hass,
          m.due_color || '',
          'var(--warning-color, #ff9800)',
          (value: string) => set({ due_color: value })
        )}
        ${this.renderColorField(
          localize('editor.cleaning_zones.overdue_color', lang, 'Overdue'),
          '',
          hass,
          m.overdue_color || '',
          'var(--error-color, #f44336)',
          (value: string) => set({ overdue_color: value })
        )}
        ${this.renderColorField(
          localize('editor.cleaning_zones.text_color', lang, 'Text'),
          '',
          hass,
          m.text_color || '',
          'var(--primary-text-color)',
          (value: string) => set({ text_color: value })
        )}
        ${this.renderColorField(
          localize('editor.cleaning_zones.secondary_text_color', lang, 'Secondary text'),
          '',
          hass,
          m.secondary_text_color || '',
          'var(--secondary-text-color)',
          (value: string) => set({ secondary_text_color: value })
        )}
        ${this.renderColorField(
          localize('editor.cleaning_zones.card_background_color', lang, 'Card background'),
          '',
          hass,
          m.card_background_color || '',
          'var(--card-background-color)',
          (value: string) => set({ card_background_color: value })
        )}
      </div>
    `;
  }

  // ── Editor state & zone mutations ──────────────────────────────────────────

  private _ensureEditor(moduleId: string): CleaningEditorState {
    let state = this._editor.get(moduleId);
    if (!state) {
      state = {
        expanded: new Set<string>(),
        advanced: new Set<string>(),
        drawing: false,
        draft: null,
        activeZoneId: '',
        mode: null,
        grabDx: 0,
        grabDy: 0,
        grabAngle: 0,
        message: '',
      };
      this._editor.set(moduleId, state);
    }
    return state;
  }

  private _patchZone(
    m: CleaningZonesModule,
    index: number,
    patch: Partial<CleaningZoneRegion>,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const zones = [...(m.zones || [])];
    const current = zones[index];
    if (!current) return;
    zones[index] = { ...current, ...patch };
    updateModule({ zones } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  /** Removes an optional field so the zone falls back to the module default. */
  private _clearZoneField(
    m: CleaningZonesModule,
    index: number,
    field: keyof CleaningZoneRegion,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const zones = [...(m.zones || [])];
    const current = zones[index];
    if (!current) return;
    const next = { ...current };
    delete next[field];
    zones[index] = next;
    updateModule({ zones } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _addZone(
    m: CleaningZonesModule,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    rect?: { x: number; y: number; width: number; height: number }
  ): CleaningZoneRegion {
    const zones = [...(m.zones || [])];
    // Stagger default rectangles so several added in a row don't stack invisibly.
    const offset = Math.min(zones.length, 8) * 0.05;
    const zone: CleaningZoneRegion = {
      id: this.generateId('zone'),
      name: localize('editor.cleaning_zones.new_zone_name', lang, 'New zone'),
      x: round3(rect?.x ?? 0.1 + offset),
      y: round3(rect?.y ?? 0.1 + offset),
      width: round3(rect?.width ?? 0.25),
      height: round3(rect?.height ?? 0.2),
      icon: 'mdi:broom',
    };
    zones.push(zone);
    updateModule({ zones } as Partial<CardModule>);
    this._ensureEditor(m.id).expanded.add(zone.id);
    this.triggerPreviewUpdate();
    return zone;
  }

  private _deleteZone(
    m: CleaningZonesModule,
    index: number,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const zones = [...(m.zones || [])];
    const [removed] = zones.splice(index, 1);
    updateModule({ zones } as Partial<CardModule>);
    if (!removed) return;

    const editor = this._ensureEditor(m.id);
    editor.expanded.delete(removed.id);
    editor.advanced.delete(removed.id);

    // Events for a deleted zone can never be shown again, so clear them out
    // instead of letting the to-do list accumulate invisible history.
    if (hass && m.todo_entity) {
      ucCleaningZonesService
        .clearZoneHistory(hass, m.todo_entity, removed.id)
        .then(() => {
          const state = this._preview.get(m.id);
          if (state) state.lastFetchedAt = 0;
          this.triggerPreviewUpdate();
        })
        .catch(() => {
          /* housekeeping; the zone is already gone from the config */
        });
    }
    this.triggerPreviewUpdate();
  }

  private _moveZone(
    m: CleaningZonesModule,
    index: number,
    delta: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const zones = [...(m.zones || [])];
    const target = index + delta;
    if (target < 0 || target >= zones.length) return;
    const [moved] = zones.splice(index, 1);
    if (!moved) return;
    zones.splice(target, 0, moved);
    updateModule({ zones } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  // ── Placement map pointer handling ─────────────────────────────────────────

  private _pointFromEvent(e: PointerEvent, container: HTMLElement): CanvasPoint {
    const rect = container.getBoundingClientRect();
    const imageW = rect.width || 1;
    const imageH = rect.height || 1;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    return { x: clamp01(px / imageW), y: clamp01(py / imageH), px, py, imageW, imageH };
  }

  /** Center of a zone in canvas pixels — the point rotation happens about. */
  private _zoneCenterPx(
    zone: CleaningZoneRegion,
    imageW: number,
    imageH: number
  ): { x: number; y: number } {
    return {
      x: (zone.x + zone.width / 2) * imageW,
      y: (zone.y + zone.height / 2) * imageH,
    };
  }

  private _onCanvasPointerDown(
    e: PointerEvent,
    m: CleaningZonesModule,
    _updateModule: (updates: Partial<CardModule>) => void,
    _lang: string
  ): void {
    const container = e.currentTarget as HTMLElement;
    const target = e.target as HTMLElement;
    const editor = this._ensureEditor(m.id);
    const point = this._pointFromEvent(e, container);

    e.preventDefault();
    container.setPointerCapture?.(e.pointerId);
    editor.message = '';

    // Handles sit inside the zone element, so they have to be tested first, and
    // via closest() because the hit target may be an icon nested inside them.
    const rotateId = target.closest?.('[data-rotate]')?.getAttribute('data-rotate');
    if (rotateId) {
      const zone = (m.zones || []).find(z => z.id === rotateId);
      editor.activeZoneId = rotateId;
      editor.mode = 'rotate';
      if (zone) {
        const center = this._zoneCenterPx(zone, point.imageW, point.imageH);
        // Store the grab offset so the zone turns with the pointer rather than
        // snapping its top edge to wherever the drag started.
        editor.grabAngle =
          bearingDegrees(center.x, center.y, point.px, point.py) - normalizeRotation(zone.rotation);
      }
      this.triggerPreviewUpdate(true);
      return;
    }

    const handleId = target.closest?.('[data-handle]')?.getAttribute('data-handle');
    if (handleId) {
      editor.activeZoneId = handleId;
      editor.mode = 'resize';
      this.triggerPreviewUpdate(true);
      return;
    }

    const zoneId = target.closest?.('[data-zone]')?.getAttribute('data-zone');
    if (zoneId) {
      const zone = (m.zones || []).find(z => z.id === zoneId);
      editor.activeZoneId = zoneId;
      editor.mode = 'move';
      editor.grabDx = zone ? point.x - zone.x : 0;
      editor.grabDy = zone ? point.y - zone.y : 0;
      this.triggerPreviewUpdate(true);
      return;
    }

    editor.drawing = true;
    editor.mode = null;
    editor.activeZoneId = '';
    editor.draft = { x: point.x, y: point.y, width: 0, height: 0 };
    // Anchor corner is kept on the draft itself; width/height may go negative
    // mid-drag and are normalized on pointer up.
    editor.grabDx = point.x;
    editor.grabDy = point.y;
    this.triggerPreviewUpdate(true);
  }

  private _onCanvasPointerMove(
    e: PointerEvent,
    m: CleaningZonesModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const editor = this._ensureEditor(m.id);
    if (!editor.drawing && !editor.mode) return;

    const container = e.currentTarget as HTMLElement;
    const point = this._pointFromEvent(e, container);
    e.preventDefault();

    if (editor.drawing && editor.draft) {
      editor.draft = {
        x: Math.min(editor.grabDx, point.x),
        y: Math.min(editor.grabDy, point.y),
        width: Math.abs(point.x - editor.grabDx),
        height: Math.abs(point.y - editor.grabDy),
      };
      this.triggerPreviewUpdate(true);
      return;
    }

    const index = (m.zones || []).findIndex(z => z.id === editor.activeZoneId);
    if (index === -1) return;
    const zone = m.zones[index]!;

    if (editor.mode === 'rotate') {
      const center = this._zoneCenterPx(zone, point.imageW, point.imageH);
      let next = bearingDegrees(center.x, center.y, point.px, point.py) - editor.grabAngle;
      // Shift snaps to 15° so walls can be squared up exactly.
      if (e.shiftKey) next = Math.round(next / 15) * 15;
      this._patchZone(m, index, { rotation: normalizeRotation(next) }, updateModule);
      return;
    }

    if (editor.mode === 'resize') {
      this._resizeZone(m, index, zone, point, updateModule);
      return;
    }

    if (editor.mode === 'move') {
      this._patchZone(
        m,
        index,
        {
          x: round3(Math.min(Math.max(0, point.x - editor.grabDx), 1 - zone.width)),
          y: round3(Math.min(Math.max(0, point.y - editor.grabDy), 1 - zone.height)),
        },
        updateModule
      );
    }
  }

  /**
   * Drags the bottom-right corner to the pointer.
   *
   * Once a zone is rotated its corners no longer line up with the screen axes,
   * so the pointer is converted into the zone's own frame and the *opposite*
   * corner is pinned in place. Without that pin, resizing a rotated zone also
   * shifts its center and the rectangle slides out from under the cursor.
   */
  private _resizeZone(
    m: CleaningZonesModule,
    index: number,
    zone: CleaningZoneRegion,
    point: CanvasPoint,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const deg = normalizeRotation(zone.rotation);
    if (deg === 0) {
      this._patchZone(
        m,
        index,
        {
          width: round3(Math.max(MIN_ZONE_SIZE, clamp01(point.x) - zone.x)),
          height: round3(Math.max(MIN_ZONE_SIZE, clamp01(point.y) - zone.y)),
        },
        updateModule
      );
      return;
    }

    const { imageW, imageH } = point;
    const width = zone.width * imageW;
    const height = zone.height * imageH;
    const center = this._zoneCenterPx(zone, imageW, imageH);

    const anchorOffset = rotateVector(-width / 2, -height / 2, deg);
    const anchorX = center.x + anchorOffset.x;
    const anchorY = center.y + anchorOffset.y;

    const local = rotateVector(point.px - center.x, point.py - center.y, -deg);
    const nextWidth = Math.max(MIN_ZONE_SIZE * imageW, local.x + width / 2);
    const nextHeight = Math.max(MIN_ZONE_SIZE * imageH, local.y + height / 2);

    const halfOffset = rotateVector(nextWidth / 2, nextHeight / 2, deg);
    const nextCenterX = anchorX + halfOffset.x;
    const nextCenterY = anchorY + halfOffset.y;

    this._patchZone(
      m,
      index,
      {
        x: round3(clamp01((nextCenterX - nextWidth / 2) / imageW)),
        y: round3(clamp01((nextCenterY - nextHeight / 2) / imageH)),
        width: round3(clamp01(nextWidth / imageW)),
        height: round3(clamp01(nextHeight / imageH)),
      },
      updateModule
    );
  }

  private _onCanvasPointerUp(
    e: PointerEvent,
    m: CleaningZonesModule,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): void {
    const editor = this._ensureEditor(m.id);
    const container = e.currentTarget as HTMLElement;
    container.releasePointerCapture?.(e.pointerId);

    if (editor.drawing) {
      const draft = editor.draft;
      editor.drawing = false;
      editor.draft = null;
      if (draft && draft.width >= MIN_ZONE_SIZE && draft.height >= MIN_ZONE_SIZE) {
        this._addZone(m, updateModule, lang, draft);
      } else if (draft) {
        // A click rather than a drag: say so instead of silently doing nothing.
        editor.message = localize(
          'editor.cleaning_zones.draw_too_small',
          lang,
          'That zone was too small — drag out a larger rectangle.'
        );
      }
    }

    editor.mode = null;
    this.triggerPreviewUpdate(true);
  }

  private _rectStyle(
    rect: { x: number; y: number; width: number; height: number },
    rotation?: number
  ): string {
    const base = `left:${clamp01(rect.x) * 100}%;top:${clamp01(rect.y) * 100}%;width:${
      clamp01(rect.width) * 100
    }%;height:${clamp01(rect.height) * 100}%;`;
    const deg = normalizeRotation(rotation);
    return deg ? `${base}transform:rotate(${deg}deg);` : base;
  }

  private _imageUrl(hass: HomeAssistant | undefined | null, path?: string): string {
    if (!hass || !path) return '';
    try {
      return getImageUrl(hass, path);
    } catch {
      return '';
    }
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    _config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as CleaningZonesModule;
    const lang = hass?.locale?.language || 'en';

    if (!m.todo_entity) {
      return this.renderGradientErrorState(
        localize('editor.cleaning_zones.setup_title', lang, 'Pick a cleaning history list'),
        localize(
          'editor.cleaning_zones.setup_desc',
          lang,
          'Choose a Local To-do helper under Storage in the General tab. Every clean you log is saved there.'
        ),
        'mdi:spray-bottle'
      );
    }

    const state = this._ensurePreview(m);
    this._ensureEventsLoaded(m, hass);

    const zones = m.zones || [];
    const statuses = ucCleaningZonesService.computeStatuses(zones, state.events, {
      defaultIntervalDays: m.default_interval_days ?? 7,
      graceDays: m.overdue_grace_days ?? 0,
    });
    this._runAutoCleans(m, hass, state, lang);

    const palette = this._palette(m);
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const title =
      m.title?.trim() || localize('editor.cleaning_zones.default_title', lang, 'Cleaning Zones');

    const body = html`
      ${m.show_title !== false
        ? html`<div class="uc-cz-header" style="color:${palette.text};">
            <ha-icon icon="mdi:spray-bottle"></ha-icon>
            <span class="uc-cz-header-text">${title}</span>
          </div>`
        : nothing}
      ${state.error
        ? html`<div class="uc-cz-banner error">
            <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <span>${state.error}</span>
          </div>`
        : nothing}
      ${zones.length === 0
        ? this._renderNoZones(lang, palette)
        : html`
            ${m.show_summary_bar !== false
              ? this._renderSummaryBar(statuses, palette, lang)
              : nothing}
            ${state.loading && state.events.length === 0
              ? this._renderLoading(lang, palette)
              : nothing}
            ${this._renderUndoBar(m, hass, state, palette, lang)}
            ${this._renderBody(m, hass, statuses, state, palette, lang)}
            ${m.show_legend !== false ? this._renderLegend(palette, lang) : nothing}
          `}
    `;

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div
        class="uc-cz-wrapper ${hoverClass}"
        style="padding:14px;border-radius:12px;background:${palette.cardBg};${designStyles}"
      >
        ${this.wrapWithAnimation(body, module, hass)}
      </div>
    `;
  }

  private _renderNoZones(lang: string, palette: CleaningPalette): TemplateResult {
    return html`
      <div class="uc-cz-blank">
        <ha-icon icon="mdi:home-floor-g" style="color:${palette.fresh};"></ha-icon>
        <div class="uc-cz-blank-title" style="color:${palette.text};">
          ${localize('editor.cleaning_zones.add_first_title', lang, 'Add your first zone')}
        </div>
        <div class="uc-cz-blank-sub" style="color:${palette.secondary};">
          ${localize(
            'editor.cleaning_zones.add_first_desc',
            lang,
            'Open the General tab and add a room with a name and a cleaning interval. A floorplan image is optional — the list works on its own.'
          )}
        </div>
      </div>
    `;
  }

  private _renderLoading(lang: string, palette: CleaningPalette): TemplateResult {
    return html`
      <div class="uc-cz-skeleton" aria-hidden="true">
        ${[0, 1, 2].map(() => html`<div class="uc-cz-skel-row"></div>`)}
      </div>
      <div class="uc-cz-loading" style="color:${palette.secondary};">
        ${localize('editor.cleaning_zones.loading', lang, 'Loading cleaning history…')}
      </div>
    `;
  }

  private _renderSummaryBar(
    statuses: ZoneStatus[],
    palette: CleaningPalette,
    lang: string
  ): TemplateResult {
    const summary = ucCleaningZonesService.summarize(statuses);
    const worst = summary.worst;

    const attentionLabel =
      summary.needsAttention === 0
        ? localize('editor.cleaning_zones.all_clear', lang, 'Everything is on schedule')
        : localize('editor.cleaning_zones.needs_attention', lang, '{count} need attention').replace(
            '{count}',
            String(summary.needsAttention)
          );

    return html`
      <div class="uc-cz-summary">
        <div class="uc-cz-summary-main" style="color:${palette.text};">
          <ha-icon
            icon=${summary.needsAttention === 0
              ? 'mdi:check-circle-outline'
              : 'mdi:alert-circle-outline'}
            style="color:${summary.needsAttention === 0 ? palette.fresh : palette.overdue};"
          ></ha-icon>
          <span>${attentionLabel}</span>
        </div>
        <div class="uc-cz-summary-sub" style="color:${palette.secondary};">
          ${worst
            ? localize('editor.cleaning_zones.worst_zone', lang, 'Most overdue: {name}').replace(
                '{name}',
                worst.zone.name || '—'
              )
            : localize('editor.cleaning_zones.fresh_count', lang, '{count} fresh').replace(
                '{count}',
                String(summary.fresh)
              )}
        </div>
      </div>
    `;
  }

  private _renderLegend(palette: CleaningPalette, lang: string): TemplateResult {
    const item = (color: string, label: string) => html`
      <span class="uc-cz-legend-item" style="color:${palette.secondary};">
        <span class="uc-cz-swatch" style="background:${color};"></span>${label}
      </span>
    `;
    return html`
      <div class="uc-cz-legend">
        ${item(palette.fresh, localize('editor.cleaning_zones.legend_fresh', lang, 'Fresh'))}
        ${item(palette.due, localize('editor.cleaning_zones.legend_due', lang, 'Due'))}
        ${item(palette.overdue, localize('editor.cleaning_zones.legend_overdue', lang, 'Overdue'))}
      </div>
    `;
  }

  private _renderUndoBar(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    state: CleaningPreviewState,
    palette: CleaningPalette,
    lang: string
  ): TemplateResult | typeof nothing {
    const undo = state.undo;
    if (!undo) return nothing;
    return html`
      <div class="uc-cz-undo">
        <span style="color:${palette.secondary};">
          ${localize('editor.cleaning_zones.logged_clean', lang, '{name} marked clean').replace(
            '{name}',
            undo.zoneName
          )}
        </span>
        <button
          class="uc-cz-undo-btn"
          type="button"
          @click=${() => this._undoClean(m, hass, state)}
        >
          ${localize('editor.cleaning_zones.undo', lang, 'Undo')}
        </button>
      </div>
    `;
  }

  private _renderBody(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    statuses: ZoneStatus[],
    state: CleaningPreviewState,
    palette: CleaningPalette,
    lang: string
  ): TemplateResult {
    const hasImage = !!this._imageUrl(hass, m.floorplan_image);
    const mode = m.view_mode || 'both';
    // The map is meaningless without a floorplan, so fall back rather than
    // rendering an empty frame.
    const showMap = hasImage && (mode === 'map' || mode === 'both');
    const showList = mode === 'list' || mode === 'both' || !hasImage;

    return html`
      ${showMap ? this._renderMap(m, hass, statuses, state, palette, lang) : nothing}
      ${showList ? this._renderList(m, hass, statuses, state, palette, lang) : nothing}
    `;
  }

  private _renderMap(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    statuses: ZoneStatus[],
    state: CleaningPreviewState,
    palette: CleaningPalette,
    lang: string
  ): TemplateResult {
    const src = this._imageUrl(hass, m.floorplan_image);
    const style = m.staleness_style || 'heat';
    const opacity = m.zone_opacity ?? 0.55;

    return html`
      <div class="uc-cz-map">
        <img src=${src} alt="" draggable="false" />
        ${statuses.map(status => {
          const zone = status.zone;
          const color = zone.color || this._stateColor(status.state, palette);
          const confirming = state.confirmZoneId === zone.id;
          const busy = state.busyZoneId === zone.id;
          // Labels need room to breathe; tiny zones get the badge only.
          const roomy = zone.width >= 0.12 && zone.height >= 0.08;
          const showLabel = m.show_zone_labels !== false && roomy;

          const fill =
            style === 'outline'
              ? 'transparent'
              : style === 'badge'
                ? `color-mix(in srgb, ${color} 22%, transparent)`
                : color;
          const zoneOpacity = style === 'heat' ? opacity : 1;
          // The label turning with the room reads correctly on a floorplan, but a
          // sideways number in a pill does not, so the badge is counter-rotated.
          const rotation = normalizeRotation(zone.rotation);
          const badgeUpright = rotation ? `transform:rotate(${-rotation}deg);` : '';

          return html`
            <button
              class="uc-cz-zone ${confirming ? 'confirming' : ''} ${busy ? 'busy' : ''}"
              type="button"
              style="${this._rectStyle(
                zone,
                zone.rotation
              )}background:${fill};opacity:${zoneOpacity};border-color:${color};"
              title=${this._zoneTooltip(status, lang)}
              aria-label=${this._zoneTooltip(status, lang)}
              ?disabled=${busy}
              @click=${() => this._onZoneTap(m, hass, status, state, lang)}
            >
              ${showLabel
                ? html`<span class="uc-cz-zone-label">
                    ${confirming
                      ? localize('editor.cleaning_zones.confirm_short', lang, 'Tap again')
                      : zone.name}
                  </span>`
                : nothing}
              ${style === 'badge' || !roomy
                ? html`<span class="uc-cz-zone-badge" style="background:${color};${badgeUpright}">
                    ${this._badgeText(status, lang)}
                  </span>`
                : nothing}
            </button>
          `;
        })}
      </div>
    `;
  }

  private _renderList(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    statuses: ZoneStatus[],
    state: CleaningPreviewState,
    palette: CleaningPalette,
    lang: string
  ): TemplateResult {
    const sorted = this._sortStatuses(statuses, m.sort_mode || 'staleness');

    return html`
      <div class="uc-cz-list">
        ${sorted.map(status => {
          const zone = status.zone;
          const color = zone.color || this._stateColor(status.state, palette);
          const confirming = state.confirmZoneId === zone.id;
          const busy = state.busyZoneId === zone.id;
          const open = state.openZoneId === zone.id;
          const progress = Math.min(1, Math.max(0, status.ratio ?? 0));

          return html`
            <div class="uc-cz-item">
              <button
                class="uc-cz-item-main"
                type="button"
                @click=${() => {
                  state.openZoneId = open ? '' : zone.id;
                  this.triggerPreviewUpdate(true);
                }}
                aria-expanded=${open ? 'true' : 'false'}
              >
                <span class="uc-cz-item-icon" style="color:${color};">
                  <ha-icon icon=${zone.icon || 'mdi:broom'}></ha-icon>
                </span>
                <span class="uc-cz-item-text">
                  <span class="uc-cz-item-name" style="color:${palette.text};">${zone.name}</span>
                  <span class="uc-cz-item-sub" style="color:${palette.secondary};">
                    ${this._dueLabel(status, lang)}
                  </span>
                  <span class="uc-cz-track">
                    <span
                      class="uc-cz-fill"
                      style="width:${progress * 100}%;background:${color};"
                    ></span>
                  </span>
                </span>
              </button>
              <button
                class="uc-cz-clean-btn ${confirming ? 'confirming' : ''}"
                type="button"
                ?disabled=${busy}
                style="border-color:${color};color:${confirming
                  ? 'var(--text-primary-color,#fff)'
                  : color};background:${confirming ? color : 'transparent'};"
                title=${localize('editor.cleaning_zones.mark_clean', lang, 'Mark clean')}
                @click=${() => this._onZoneTap(m, hass, status, state, lang)}
              >
                ${busy
                  ? html`<ha-icon icon="mdi:progress-clock"></ha-icon>`
                  : confirming
                    ? html`<span
                        >${localize('editor.cleaning_zones.confirm_short', lang, 'Tap again')}</span
                      >`
                    : html`<ha-icon icon="mdi:check"></ha-icon>`}
              </button>
            </div>
            ${open ? this._renderZoneDetail(status, state, palette, lang) : nothing}
          `;
        })}
      </div>
    `;
  }

  private _renderZoneDetail(
    status: ZoneStatus,
    state: CleaningPreviewState,
    palette: CleaningPalette,
    lang: string
  ): TemplateResult {
    const history = ucCleaningZonesService
      .eventsForZone(state.events, status.zone.id, 5)
      .map(event => ({
        at: event.cleanedAtMs,
        by: event.payload.by,
        source: event.payload.source,
      }));

    return html`
      <div class="uc-cz-detail" style="color:${palette.secondary};">
        <div class="uc-cz-detail-line">
          ${localize('editor.cleaning_zones.interval_label', lang, 'Every {days} days').replace(
            '{days}',
            String(status.intervalDays)
          )}
          ${status.lastBy
            ? html` ·
              ${localize('editor.cleaning_zones.last_by', lang, 'last by {name}').replace(
                '{name}',
                status.lastBy
              )}`
            : nothing}
        </div>
        ${status.zone.notes
          ? html`<div class="uc-cz-detail-line">${status.zone.notes}</div>`
          : nothing}
        ${history.length > 0
          ? html`
              <div class="uc-cz-history">
                ${history.map(
                  entry => html`
                    <span class="uc-cz-history-chip">
                      ${this._agoLabel(entry.at, lang)}
                      ${entry.source === 'auto'
                        ? html`<ha-icon
                            class="uc-cz-inline-icon"
                            icon="mdi:robot-vacuum"
                          ></ha-icon>`
                        : nothing}
                    </span>
                  `
                )}
              </div>
            `
          : html`<div class="uc-cz-detail-line">
              ${localize('editor.cleaning_zones.no_history', lang, 'No cleans recorded yet')}
            </div>`}
      </div>
    `;
  }

  // ── Preview helpers ────────────────────────────────────────────────────────

  private _palette(m: CleaningZonesModule): CleaningPalette {
    return {
      fresh: m.fresh_color || 'var(--success-color, #4caf50)',
      due: m.due_color || 'var(--warning-color, #ff9800)',
      overdue: m.overdue_color || 'var(--error-color, #f44336)',
      text: m.text_color || 'var(--primary-text-color)',
      secondary: m.secondary_text_color || 'var(--secondary-text-color)',
      cardBg: m.card_background_color || 'var(--card-background-color)',
    };
  }

  private _stateColor(state: ZoneStalenessState, palette: CleaningPalette): string {
    switch (state) {
      case 'overdue':
        return palette.overdue;
      // "due" is still inside the grace period, so it stays amber.
      case 'due':
      case 'due_soon':
        return palette.due;
      case 'fresh':
        return palette.fresh;
      default:
        // Never cleaned reads as "needs attention" without being alarming.
        return palette.due;
    }
  }

  private _sortStatuses(
    statuses: ZoneStatus[],
    mode: CleaningZonesModule['sort_mode']
  ): ZoneStatus[] {
    const list = [...statuses];
    if (mode === 'name') {
      return list.sort((a, b) => (a.zone.name || '').localeCompare(b.zone.name || ''));
    }
    if (mode === 'interval') {
      return list.sort((a, b) => a.intervalDays - b.intervalDays);
    }
    // Staleness: never-cleaned first, then the most overdue.
    return list.sort((a, b) => {
      const ra = a.ratio ?? Number.POSITIVE_INFINITY;
      const rb = b.ratio ?? Number.POSITIVE_INFINITY;
      return rb - ra;
    });
  }

  private _dueLabel(status: ZoneStatus, lang: string): string {
    if (status.lastCleanedMs === null || status.dueInDays === null) {
      return localize('editor.cleaning_zones.never_cleaned', lang, 'Never cleaned');
    }
    const days = status.dueInDays;
    if (days < 0) {
      const overdue = Math.max(1, Math.round(-days));
      return localize('editor.cleaning_zones.overdue_by', lang, 'Overdue by {days} days').replace(
        '{days}',
        String(overdue)
      );
    }
    if (days < 1) {
      return localize('editor.cleaning_zones.due_today', lang, 'Due today');
    }
    const remaining = Math.round(days);
    return remaining === 1
      ? localize('editor.cleaning_zones.due_tomorrow', lang, 'Due tomorrow')
      : localize('editor.cleaning_zones.due_in', lang, 'Due in {days} days').replace(
          '{days}',
          String(remaining)
        );
  }

  private _badgeText(status: ZoneStatus, lang: string): string {
    if (status.daysSince === null) return '—';
    const days = Math.floor(status.daysSince);
    return localize('editor.cleaning_zones.days_short', lang, '{days}d').replace(
      '{days}',
      String(days)
    );
  }

  private _zoneTooltip(status: ZoneStatus, lang: string): string {
    const name = status.zone.name || '';
    return `${name} — ${this._dueLabel(status, lang)}`;
  }

  private _agoLabel(timestamp: number, lang: string): string {
    const days = Math.floor((Date.now() - timestamp) / MS_PER_DAY);
    if (days <= 0) return localize('editor.cleaning_zones.today', lang, 'Today');
    if (days === 1) return localize('editor.cleaning_zones.yesterday', lang, 'Yesterday');
    return localize('editor.cleaning_zones.days_ago', lang, '{days}d ago').replace(
      '{days}',
      String(days)
    );
  }

  // ── Preview state & actions ────────────────────────────────────────────────

  private _ensurePreview(m: CleaningZonesModule): CleaningPreviewState {
    let state = this._preview.get(m.id);
    if (!state) {
      state = {
        events: [],
        loading: false,
        lastFetchedAt: 0,
        fetchKey: '',
        error: '',
        undo: null,
        confirmZoneId: '',
        busyZoneId: '',
        openZoneId: '',
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
  private _ensureEventsLoaded(m: CleaningZonesModule, hass: HomeAssistant): void {
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

    ucCleaningZonesService
      .getEvents(hass, m.todo_entity, () => {
        // The to-do list changed under us (another device logged a clean).
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
            : 'Could not read the cleaning history list';
        this.triggerPreviewUpdate(true);
      });
  }

  /** Hands auto-clean detection to the service, which owns the idempotency guards. */
  private _runAutoCleans(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    state: CleaningPreviewState,
    lang: string
  ): void {
    if (!hass || !m.todo_entity) return;
    const zones = (m.zones || []).filter(z => z.auto_clean_entity && z.auto_clean_state);
    if (zones.length === 0) return;

    ucCleaningZonesService.checkAutoCleans(hass, m.todo_entity, zones, state.events, {
      by: m.log_cleaner ? ucCleaningZonesService.resolveCleaner(hass, m.person_entity) : undefined,
      historyLimit: m.history_limit ?? 20,
      summaryFor: zone =>
        localize('editor.cleaning_zones.log_auto', lang, '{name} cleaned automatically').replace(
          '{name}',
          zone.name || zone.id
        ),
      onWritten: () => {
        const current = this._preview.get(m.id);
        if (current) current.lastFetchedAt = 0;
        this._ensureEventsLoaded(m, hass);
      },
    });
  }

  /** One tap logs the clean, unless `require_confirm` demands a second. */
  private _onZoneTap(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    status: ZoneStatus,
    state: CleaningPreviewState,
    lang: string
  ): void {
    if (!hass || !m.todo_entity) return;
    const zoneId = status.zone.id;

    if (m.require_confirm && state.confirmZoneId !== zoneId) {
      state.confirmZoneId = zoneId;
      this.triggerPreviewUpdate(true);
      // Give up on the confirm after a few seconds so the card doesn't sit armed.
      setTimeout(() => {
        const current = this._preview.get(m.id);
        if (current?.confirmZoneId === zoneId) {
          current.confirmZoneId = '';
          this.triggerPreviewUpdate(true);
        }
      }, 4000);
      return;
    }

    state.confirmZoneId = '';
    this._logClean(m, hass, status, lang);
  }

  private _logClean(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    status: ZoneStatus,
    lang: string
  ): void {
    const state = this._ensurePreview(m);
    if (state.busyZoneId) return;

    const zone = status.zone;
    state.busyZoneId = zone.id;
    this.triggerPreviewUpdate(true);

    const summary = localize('editor.cleaning_zones.log_clean', lang, '{name} cleaned').replace(
      '{name}',
      zone.name || zone.id
    );
    const by = m.log_cleaner
      ? ucCleaningZonesService.resolveCleaner(hass, m.person_entity)
      : undefined;

    ucCleaningZonesService
      .recordClean(hass, m.todo_entity, zone, {
        source: 'manual',
        summary,
        by,
        historyLimit: m.history_limit ?? 20,
      })
      .then(() => {
        const current = this._ensurePreview(m);
        current.busyZoneId = '';
        current.undo = { zoneId: zone.id, zoneName: zone.name || zone.id, at: Date.now() };
        current.lastFetchedAt = 0;
        this._ensureEventsLoaded(m, hass);
        this.triggerPreviewUpdate(true);
        this._expireUndoLater(m, current.undo.at);
      })
      .catch((err: unknown) => {
        const current = this._ensurePreview(m);
        current.busyZoneId = '';
        current.error =
          err instanceof Error && err.message ? err.message : 'Could not save the cleaning entry';
        this.triggerPreviewUpdate(true);
      });
  }

  private _undoClean(
    m: CleaningZonesModule,
    hass: HomeAssistant,
    state: CleaningPreviewState
  ): void {
    const undo = state.undo;
    if (!undo || !hass || !m.todo_entity) return;
    state.undo = null;
    state.busyZoneId = undo.zoneId;
    this.triggerPreviewUpdate(true);

    ucCleaningZonesService
      .undoLastClean(hass, m.todo_entity, undo.zoneId)
      .then(() => {
        const current = this._ensurePreview(m);
        current.busyZoneId = '';
        current.lastFetchedAt = 0;
        this._ensureEventsLoaded(m, hass);
        this.triggerPreviewUpdate(true);
      })
      .catch(() => {
        const current = this._ensurePreview(m);
        current.busyZoneId = '';
        this.triggerPreviewUpdate(true);
      });
  }

  /** Retires the undo chip on its own rather than waiting for the next repaint. */
  private _expireUndoLater(m: CleaningZonesModule, stamp: number): void {
    setTimeout(() => {
      const current = this._preview.get(m.id);
      if (current?.undo && current.undo.at === stamp) {
        current.undo = null;
        this.triggerPreviewUpdate(true);
      }
    }, UNDO_WINDOW_MS);
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}

      .uc-cz-wrapper { box-sizing: border-box; width: 100%; min-width: 0; }

      .uc-cz-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        font-size: 15px;
        margin-bottom: 10px;
      }
      .uc-cz-header-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }

      .uc-cz-note,
      .uc-cz-warn {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12px;
        line-height: 1.5;
        padding: 10px 12px;
        border-radius: 8px;
        margin-bottom: 12px;
        color: var(--secondary-text-color);
        background: var(--primary-background-color);
      }
      .uc-cz-warn {
        color: var(--warning-color, #ff9800);
        background: color-mix(in srgb, var(--warning-color, #ff9800) 12%, transparent);
      }
      .uc-cz-note ha-icon,
      .uc-cz-warn ha-icon { flex-shrink: 0; --mdc-icon-size: 18px; }

      .uc-cz-section-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.5;
        margin-bottom: 12px;
      }

      .uc-cz-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        padding: 8px 10px;
        border-radius: 8px;
        margin-bottom: 10px;
      }
      .uc-cz-banner.error {
        color: var(--error-color, #f44336);
        background: color-mix(in srgb, var(--error-color, #f44336) 12%, transparent);
      }

      /* ── Editor: zone rows ── */

      .uc-cz-empty-rows {
        font-size: 12px;
        color: var(--secondary-text-color);
        padding: 12px;
        border: 1px dashed var(--divider-color);
        border-radius: 8px;
        margin-bottom: 12px;
        text-align: center;
      }

      .uc-cz-row {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        margin-bottom: 8px;
        background: var(--card-background-color);
        overflow: hidden;
      }
      .uc-cz-row.expanded { border-color: var(--primary-color); }

      .uc-cz-row-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
      }
      .uc-cz-row-icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--secondary-background-color);
        color: var(--primary-color);
      }
      .uc-cz-row-text { flex: 1; min-width: 0; }
      .uc-cz-row-name {
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-cz-row-sub {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .uc-cz-inline-icon { --mdc-icon-size: 13px; }

      .uc-cz-icon-btn {
        flex-shrink: 0;
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .uc-cz-icon-btn:hover:not(:disabled) { background: var(--secondary-background-color); }
      .uc-cz-icon-btn:disabled { opacity: 0.3; cursor: default; }
      .uc-cz-icon-btn:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
      .uc-cz-icon-btn.on { color: var(--primary-color); }
      .uc-cz-icon-btn.danger:hover:not(:disabled) { color: var(--error-color, #f44336); }
      .uc-cz-icon-btn ha-icon { --mdc-icon-size: 18px; }

      .uc-cz-row-body {
        padding: 4px 10px 12px;
        border-top: 1px solid var(--divider-color);
      }

      .uc-cz-add-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 10px;
        border: 1px dashed var(--primary-color);
        border-radius: 8px;
        background: transparent;
        color: var(--primary-color);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .uc-cz-add-btn:hover {
        background: color-mix(in srgb, var(--primary-color) 8%, transparent);
      }
      .uc-cz-add-btn ha-icon { --mdc-icon-size: 18px; }

      .uc-cz-linkbtn {
        border: none;
        background: transparent;
        color: var(--primary-color);
        font-size: 12px;
        cursor: pointer;
        padding: 0 0 10px;
        text-align: left;
      }
      .uc-cz-linkbtn:hover { text-decoration: underline; }

      .uc-cz-subtoggle {
        display: flex;
        align-items: center;
        gap: 4px;
        width: 100%;
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        cursor: pointer;
        padding: 8px 0;
      }
      .uc-cz-subtoggle.on { color: var(--primary-color); }
      .uc-cz-subtoggle ha-icon { --mdc-icon-size: 16px; }
      .uc-cz-subgroup { padding-left: 4px; }

      /* ── Editor: placement map ── */

      .uc-cz-placement { margin-bottom: 14px; }
      .uc-cz-placement-hint,
      .uc-cz-placement-msg {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
        line-height: 1.5;
      }
      .uc-cz-placement-msg { color: var(--warning-color, #ff9800); margin-top: 6px; }

      .uc-cz-canvas {
        position: relative;
        width: 100%;
        border-radius: 8px;
        overflow: hidden;
        touch-action: none;
        cursor: crosshair;
        user-select: none;
        background: var(--secondary-background-color);
      }
      .uc-cz-canvas img { display: block; width: 100%; height: auto; user-select: none; }

      .uc-cz-place-zone {
        position: absolute;
        border: 2px solid var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 18%, transparent);
        border-radius: 4px;
        cursor: move;
        box-sizing: border-box;
      }
      .uc-cz-place-zone.active { border-style: dashed; }
      .uc-cz-place-label {
        position: absolute;
        top: 2px;
        left: 4px;
        font-size: 10px;
        font-weight: 600;
        color: var(--text-primary-color, #fff);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
        pointer-events: none;
        white-space: nowrap;
        overflow: hidden;
        max-width: calc(100% - 8px);
        text-overflow: ellipsis;
      }
      .uc-cz-handle {
        position: absolute;
        right: -6px;
        bottom: -6px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 2px solid var(--card-background-color);
        cursor: nwse-resize;
      }

      /* Orbits the zone, since it rotates along with its parent. */
      .uc-cz-rotate {
        position: absolute;
        bottom: calc(100% + 9px);
        left: 50%;
        margin-left: -10px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 2px solid var(--card-background-color);
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        box-sizing: border-box;
      }
      .uc-cz-rotate:active { cursor: grabbing; }
      .uc-cz-rotate ha-icon { --mdc-icon-size: 12px; pointer-events: none; }
      .uc-cz-rotate::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        width: 2px;
        height: 9px;
        margin-left: -1px;
        background: var(--primary-color);
      }
      .uc-cz-draft {
        position: absolute;
        border: 2px dashed var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
        pointer-events: none;
        box-sizing: border-box;
      }

      /* ── Preview: summary, legend, undo ── */

      .uc-cz-summary {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      .uc-cz-summary-main {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 700;
        min-width: 0;
      }
      .uc-cz-summary-main ha-icon { --mdc-icon-size: 18px; flex-shrink: 0; }
      .uc-cz-summary-sub {
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }

      .uc-cz-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 10px;
        font-size: 11px;
      }
      .uc-cz-legend-item { display: flex; align-items: center; gap: 5px; }
      .uc-cz-swatch { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }

      .uc-cz-undo {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 12px;
        padding: 7px 10px;
        border-radius: 8px;
        margin-bottom: 10px;
        background: var(--secondary-background-color);
      }
      .uc-cz-undo-btn {
        border: none;
        background: transparent;
        color: var(--primary-color);
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
        padding: 2px 4px;
      }
      .uc-cz-undo-btn:hover { text-decoration: underline; }

      .uc-cz-blank {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 6px;
        padding: 22px 12px;
      }
      .uc-cz-blank ha-icon { --mdc-icon-size: 40px; }
      .uc-cz-blank-title { font-size: 15px; font-weight: 700; }
      .uc-cz-blank-sub { font-size: 12px; line-height: 1.5; max-width: 340px; }

      .uc-cz-loading { font-size: 12px; text-align: center; padding: 4px 0 8px; }
      .uc-cz-skeleton { display: flex; flex-direction: column; gap: 6px; margin-bottom: 6px; }
      .uc-cz-skel-row {
        height: 34px;
        border-radius: 8px;
        background: linear-gradient(
          90deg,
          var(--secondary-background-color) 25%,
          var(--divider-color) 50%,
          var(--secondary-background-color) 75%
        );
        background-size: 200% 100%;
        animation: uc-cz-shimmer 1.4s ease-in-out infinite;
      }
      @keyframes uc-cz-shimmer {
        from { background-position: 200% 0; }
        to { background-position: -200% 0; }
      }

      /* ── Preview: map ── */

      .uc-cz-map {
        position: relative;
        width: 100%;
        border-radius: 10px;
        overflow: hidden;
        background: var(--secondary-background-color);
      }
      .uc-cz-map img { display: block; width: 100%; height: auto; }

      .uc-cz-zone {
        position: absolute;
        border: 2px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        padding: 0;
        box-sizing: border-box;
        transition: filter 120ms ease-in-out;
      }
      .uc-cz-zone:hover:not(:disabled) { filter: brightness(1.15); }
      .uc-cz-zone:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
      .uc-cz-zone:disabled { cursor: default; }
      .uc-cz-zone.confirming { border-style: dashed; filter: brightness(1.25); }
      .uc-cz-zone.busy { opacity: 0.6; }

      .uc-cz-zone-label {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: var(--text-primary-color, #fff);
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
        padding: 2px;
        overflow: hidden;
        text-align: center;
        pointer-events: none;
      }
      .uc-cz-zone-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        border-radius: 9px;
        font-size: 10px;
        font-weight: 700;
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      /* ── Preview: list ── */

      .uc-cz-list { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }

      .uc-cz-item { display: flex; align-items: center; gap: 8px; }

      .uc-cz-item-main {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        border: none;
        background: transparent;
        padding: 6px 2px;
        cursor: pointer;
        text-align: left;
      }
      .uc-cz-item-main:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
      .uc-cz-item-icon { flex-shrink: 0; display: flex; }
      .uc-cz-item-icon ha-icon { --mdc-icon-size: 20px; }
      .uc-cz-item-text { flex: 1; min-width: 0; display: block; }
      .uc-cz-item-name {
        display: block;
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-cz-item-sub { display: block; font-size: 11px; margin-bottom: 4px; }

      .uc-cz-track {
        display: block;
        height: 4px;
        border-radius: 2px;
        background: var(--divider-color);
        overflow: hidden;
      }
      .uc-cz-fill { display: block; height: 100%; border-radius: 2px; }

      .uc-cz-clean-btn {
        flex-shrink: 0;
        min-width: 34px;
        height: 30px;
        padding: 0 8px;
        border: 1px solid;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
      }
      .uc-cz-clean-btn:disabled { opacity: 0.5; cursor: default; }
      .uc-cz-clean-btn:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
      .uc-cz-clean-btn ha-icon { --mdc-icon-size: 16px; }

      .uc-cz-detail {
        font-size: 11px;
        line-height: 1.6;
        padding: 2px 2px 8px 32px;
      }
      .uc-cz-detail-line { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
      .uc-cz-history { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
      .uc-cz-history-chip {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 1px 7px;
        border-radius: 10px;
        background: var(--secondary-background-color);
        font-size: 10px;
      }

      @media (max-width: 420px) {
        .uc-cz-summary { flex-direction: column; align-items: flex-start; gap: 2px; }
        .uc-cz-detail { padding-left: 12px; }
      }
    `;
  }
}

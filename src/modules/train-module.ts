import { TemplateResult, html, nothing, svg } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, TrainModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { hasProAccess, renderProLockUI } from '../utils/uc-pro-access';
import { TemplateService } from '../services/template-service';
import { preprocessTemplateVariables } from '../utils/uc-template-processor';
import '../components/ultra-color-picker';
import '../components/ultra-template-editor';

// ─── Departure model ─────────────────────────────────────────────────────────

export type TrainStatus = 'on_time' | 'delayed' | 'cancelled' | 'unknown';

export interface TrainDeparture {
  /** Timetabled departure */
  planned: Date | null;
  /** Realtime estimate (falls back to planned) */
  expected: Date | null;
  /** Minutes late; 0 when on time or unknown */
  delayMin: number;
  status: TrainStatus;
  destination?: string | undefined;
  line?: string | undefined;
  platform?: string | undefined;
  note?: string | undefined;
  /** Per-departure color override (template source) */
  color?: string | undefined;
}

const DEFAULT_ON_TIME_COLOR = '#22c55e';
const DEFAULT_DELAYED_COLOR = '#f59e0b';
const DEFAULT_CANCELLED_COLOR = '#ef4444';
const DEFAULT_LED_COLOR = '#ffb300';
/** Height, in SVG units under the 64-unit train, of the receding track. */
const TRACK_H = 18;

/*
 * Attribute names used by the common public-transport integrations. Matching is
 * case-insensitive and tolerant of `_`/`-`/space differences, so "Expected
 * departure" (Irish Rail) matches `expected_departure`.
 */
const EXPECTED_KEYS = [
  'expected_at', 'expected_departure_time', 'expected_departure', 'departure_time_actual',
  'estimated_time', 'estimated_departure', 'estimated', 'real_time', 'realtime_departure',
  'expected', 'actual_time', 'actual_departure', 'rt_departure', 'departure_actual',
];
const PLANNED_KEYS = [
  'planned_time', 'departure_time_planned', 'scheduled_departure', 'scheduled_time', 'scheduled',
  'aimed_departure_time', 'planned', 'departure_time', 'departure', 'due_at', 'time', 'depart',
  'start_time', 'departure_planned',
];
const DUE_IN_KEYS = ['due_in', 'due_in_min', 'minutes_until_departure', 'departure_minutes', 'minutes', 'due'];
const DELAY_KEYS = [
  'delay', 'delayed_time', 'departure_delay', 'delay_minutes', 'delay_min', 'number_of_minutes_delayed',
  'delay_seconds', 'late', 'delay_time',
];
const STATUS_KEYS = ['departure_state', 'status', 'train_status', 'state', 'realtime_state'];
const CANCEL_KEYS = ['cancelled', 'canceled', 'is_cancelled', 'is_canceled'];
const DEST_KEYS = ['destination', 'destination_name', 'direction', 'headsign', 'to', 'arrival_station', 'end_station', 'towards'];
const LINE_KEYS = [
  'line', 'line_name', 'route', 'route_short_name', 'train_type', 'product', 'product_filter',
  'transport_mode', 'operator_name', 'train_number', 'vehicle_id', 'category', 'line_number',
];
const PLATFORM_KEYS = ['platform', 'track', 'departure_platform_actual', 'departure_platform_planned', 'stop_position', 'quay'];
const NOTE_KEYS = ['other_info', 'other_information', 'deviation', 'deviations', 'remarks', 'message', 'info', 'note', 'disruption'];
const LIST_KEYS = ['departures', 'next_departures', 'next_trains', 'trains', 'next', 'connections', 'upcoming', 'journeys', 'services', 'items'];

const norm = (k: string) => k.toLowerCase().replace(/[\s-]+/g, '_');

type Rec = Map<string, unknown>;

/** Attributes keyed by their normalized name so lookups are spelling-tolerant. */
function indexRecord(rec: Record<string, unknown>): Rec {
  const index: Rec = new Map();
  for (const [k, v] of Object.entries(rec)) index.set(norm(k), v);
  return index;
}

/** Look a value up by any of `keys`, optionally with a prefix (Entur `next_*`). */
function pick(rec: Rec, keys: string[], prefix = ''): unknown {
  for (const k of keys) {
    const v = rec.get(prefix + k);
    if (v !== undefined && v !== null && v !== '' && v !== 'unknown' && v !== 'unavailable') return v;
  }
  return undefined;
}

const HHMM = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

/** Parse anything a transport integration might hand us as a time. */
export function parseTrainTime(value: unknown, now: Date): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    if (value > 1e12) return new Date(value); // epoch ms
    if (value > 1e9) return new Date(value * 1000); // epoch s
    return new Date(now.getTime() + value * 60000); // minutes from now
  }
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (!s) return null;

  const hm = HHMM.exec(s);
  if (hm) {
    const d = new Date(now);
    d.setHours(Number(hm[1]), Number(hm[2]), hm[3] ? Number(hm[3]) : 0, 0);
    // A wall-clock time far in the past means "tomorrow" (a 00:15 train seen at 23:50).
    if (d.getTime() < now.getTime() - 3 * 3600000) d.setDate(d.getDate() + 1);
    return d;
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) return parseTrainTime(Number(s), now);
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime()) && /\d{4}-\d{2}-\d{2}/.test(s)) return iso;
  // "Sep 8 11:11" style strings
  if (!Number.isNaN(iso.getTime()) && /\d/.test(s)) return iso;
  return null;
}

/** Minutes late from a number (min or s), "H:MM:SS", or "5 min" strings. */
function parseDelayMinutes(value: unknown, key = '', unit = ''): number | null {
  if (value === undefined || value === null || typeof value === 'boolean') return null;
  const seconds = /second|_s$|^s$|sec/.test(key.toLowerCase()) || /^(s|sec|seconds?)$/i.test(unit);
  if (typeof value === 'number') return Number.isFinite(value) ? (seconds ? value / 60 : value) : null;
  const s = String(value).trim().toLowerCase();
  const dur = /^(\d+):(\d{2}):(\d{2})$/.exec(s);
  if (dur) return Number(dur[1]) * 60 + Number(dur[2]) + Number(dur[3]) / 60;
  const n = parseFloat(s);
  if (Number.isNaN(n)) return null;
  if (/sec/.test(s) || (seconds && !/min/.test(s))) return n / 60;
  if (/\bh(our)?s?\b/.test(s) && !/min/.test(s)) return n * 60;
  return n;
}

function normalizeStatus(value: unknown): TrainStatus {
  if (value === true) return 'cancelled';
  if (typeof value !== 'string') return 'unknown';
  const s = value.toLowerCase();
  if (/cancel|annull|inställ|geannuleerd|ausfall|supprim/.test(s)) return 'cancelled';
  if (/delay|late|försen|vertraag|verspät|retard|ritardo/.test(s)) return 'delayed';
  if (/on[_ ]?time|punctual|scheduled|planned|i tid|op tijd|pünktlich|à l'heure|in orario/.test(s)) return 'on_time';
  return 'unknown';
}

const truthy = (v: unknown) => v === true || /^(true|on|yes|1)$/i.test(String(v ?? ''));

/** Build one departure from a flat record of attributes (an entity or a list item). */
function departureFromRecord(
  raw: Record<string, unknown>,
  now: Date,
  prefix = '',
  fallbackTime?: unknown
): TrainDeparture | null {
  const rec = indexRecord(raw);
  let planned = parseTrainTime(pick(rec, PLANNED_KEYS, prefix), now);
  let expected = parseTrainTime(pick(rec, EXPECTED_KEYS, prefix), now);
  if (!planned && !expected) {
    const dueIn = pick(rec, DUE_IN_KEYS, prefix);
    if (dueIn !== undefined) expected = parseTrainTime(Number(dueIn), now);
  }
  if (!planned && !expected && fallbackTime !== undefined) planned = parseTrainTime(fallbackTime, now);
  if (!planned && !expected) return null;

  let delayMin = 0;
  for (const k of DELAY_KEYS) {
    const raw = pick(rec, [k], prefix);
    if (raw === undefined) continue;
    if (typeof raw === 'boolean') {
      if (raw && planned && expected) delayMin = Math.max(0, (expected.getTime() - planned.getTime()) / 60000);
      else if (raw) delayMin = 1;
      break;
    }
    const parsed = parseDelayMinutes(raw, k);
    if (parsed !== null) {
      delayMin = Math.max(0, parsed);
      break;
    }
  }
  if (!delayMin && planned && expected) delayMin = Math.max(0, (expected.getTime() - planned.getTime()) / 60000);

  let status = normalizeStatus(pick(rec, STATUS_KEYS, prefix));
  if (truthy(pick(rec, CANCEL_KEYS, prefix))) status = 'cancelled';

  const str = (v: unknown) => (v === undefined || v === null ? undefined : String(v).trim() || undefined);
  const noteRaw = pick(rec, NOTE_KEYS, prefix);
  const note = Array.isArray(noteRaw)
    ? noteRaw.map(x => (typeof x === 'object' && x ? Object.values(x as object).join(' ') : String(x))).join(' · ')
    : str(noteRaw);

  return {
    planned,
    expected,
    delayMin,
    status,
    destination: str(pick(rec, DEST_KEYS, prefix)),
    line: str(pick(rec, LINE_KEYS, prefix)),
    platform: str(pick(rec, PLATFORM_KEYS, prefix)),
    note: note && note.toLowerCase() !== 'none' ? note : undefined,
    color: str(pick(rec, ['color', 'colour'], prefix)),
  };
}

/** All departures an entity describes: its own state plus any list / `next_*` attributes. */
export function departuresFromEntity(hass: HomeAssistant, entityId: string, now: Date): TrainDeparture[] {
  const st = hass?.states?.[entityId];
  if (!st) return [];
  const a = (st.attributes || {}) as Record<string, unknown>;
  const ai = indexRecord(a);
  const out: TrainDeparture[] = [];

  // The entity's own departure: attributes first, then the state as the time.
  const stateIsTime = st.state !== 'unknown' && st.state !== 'unavailable' && st.state !== 'none';
  let stateTime: unknown = stateIsTime ? st.state : undefined;
  // A "minutes until" sensor states a bare number.
  if (stateIsTime && /^-?\d+(\.\d+)?$/.test(st.state)) {
    const unit = String(a.unit_of_measurement || '').toLowerCase();
    const n = Number(st.state);
    stateTime = unit && /^(s|sec|seconds?)$/.test(unit) ? n / 60 : n;
  }
  const primary = departureFromRecord(a, now, '', stateTime);

  // Integrations that pack the trains into a list attribute. These items are
  // richer than the bare state, so they take precedence over the primary.
  for (const k of LIST_KEYS) {
    const list = pick(ai, [k]);
    if (!Array.isArray(list) || !list.length) continue;
    for (const item of list) {
      if (!item || typeof item !== 'object') continue;
      const d = departureFromRecord(item as Record<string, unknown>, now);
      if (d) out.push(d);
    }
    break;
  }

  // The entity's own departure, unless the list already describes that train.
  const bucket = (d: TrainDeparture) => Math.round(((d.expected ?? d.planned)?.getTime() ?? NaN) / 30000);
  const seen = new Set<number>(out.map(bucket));
  if (primary && !seen.has(bucket(primary))) {
    out.unshift(primary);
    seen.add(bucket(primary));
  }

  // Entur-style `next_*` attributes describing the second departure.
  if (pick(ai, ['next_due_at', 'next_due_in', 'next_expected_at', 'next_departure', 'next_departure_time'])) {
    const d = departureFromRecord(a, now, 'next_');
    if (d && !seen.has(bucket(d))) out.push(d);
  }

  return out;
}

/** Sort by time, fill in expected/planned from each other, and settle the status. */
export function finalizeDepartures(list: TrainDeparture[], delayThreshold: number): TrainDeparture[] {
  const t = (d: TrainDeparture) => (d.expected ?? d.planned)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return list
    .map(d => {
      const out = { ...d };
      if (!out.expected && out.planned) {
        out.expected = out.delayMin > 0 ? new Date(out.planned.getTime() + out.delayMin * 60000) : out.planned;
      }
      if (!out.planned && out.expected) {
        out.planned = out.delayMin > 0 ? new Date(out.expected.getTime() - out.delayMin * 60000) : out.expected;
      }
      if (out.status !== 'cancelled') {
        if (out.delayMin >= delayThreshold) out.status = 'delayed';
        else if (out.status === 'delayed') out.status = 'on_time';
      }
      return out;
    })
    .sort((x, y) => t(x) - t(y));
}

function normalizeTemplateOutput(
  raw: unknown,
  now: Date
): { departures: TrainDeparture[]; name?: string | undefined; note?: string | undefined } {
  let data: unknown = raw;
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return { departures: [] };
    try {
      data = JSON.parse(s);
    } catch {
      throw new Error('not json');
    }
  }
  let items: unknown[] = [];
  let name: string | undefined;
  let note: string | undefined;
  if (Array.isArray(data)) items = data;
  else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const list = pick(indexRecord(obj), LIST_KEYS);
    if (Array.isArray(list)) items = list;
    else items = [obj];
    if (typeof obj.name === 'string') name = obj.name;
    if (typeof obj.route === 'string' && !name) name = obj.route;
    if (typeof obj.note === 'string') note = obj.note;
    if (typeof obj.info === 'string' && !note) note = obj.info;
  }
  const departures = items
    .map(item => (item && typeof item === 'object' ? departureFromRecord(item as Record<string, unknown>, now) : null))
    .filter((d): d is TrainDeparture => !!d);
  return { departures, name, note };
}

// ─── Small helpers ───────────────────────────────────────────────────────────

function stripDepartureSuffix(name: string): string {
  return name
    .replace(/\s*[-–—:]?\s*(next\s+)?(departure|departures|departure\s+time|avgång|vertrek|abfahrt)\s*$/i, '')
    .trim();
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
  return Math.abs(hash).toString(36);
}

/**
 * Train Pro Module
 *
 * Departure board for a route: the next trains as status-colored train icons
 * with their departure times, a live "departs in" countdown, delay and
 * cancellation state, and an optional amber dot-matrix look. Reads the common
 * Home Assistant transport integrations directly (Trafikverket, NS, Entur, UK
 * Transport, HVV, Deutsche Bahn, GTFS, ...) or a JSON template for anything else.
 */
export class UltraTrainModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'train',
    title: 'Train Departures',
    description:
      'Animated departure board with the next trains as status-colored icons, live countdown, delays, and an LED dot-matrix style',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:train',
    category: 'data',
    tags: ['train', 'departures', 'transit', 'public transport', 'commute', 'timetable', 'station', 'animated', 'pro', 'premium'],
  };

  private _templateService: TemplateService | undefined;
  private _tickTimer: ReturnType<typeof setInterval> | null = null;

  createDefault(id?: string): TrainModule {
    return {
      id: id || this.generateId('train'),
      type: 'train',
      source: 'entities',
      departure_entities: [],
      template: '',
      name: '',
      icon: '',
      layout: 'standard',
      board_style: 'modern',
      status_entity: '',
      delay_entity: '',
      cancelled_entity: '',
      info_entity: '',
      max_departures: 3,
      delay_threshold: 1,
      imminent_minutes: 5,
      time_format: 'auto',
      show_name: true,
      show_countdown: true,
      show_times: true,
      show_status: true,
      show_details: true,
      show_info: true,
      show_track: true,
      enable_animations: true,
      on_time_color: '',
      delayed_color: '',
      cancelled_color: '',
      led_color: '',
      text_color: '',
      secondary_text_color: '',
      card_background_color: '',
      tap_action: { action: 'more-info' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as TrainModule, hass, updates => updateModule(updates));
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as TrainModule, hass, updates => updateModule(updates));
  }

  // ── Editor ────────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as TrainModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.train.pro_description',
          lang,
          'The Train module turns your departure sensors into an animated departure board: the next trains as status-colored icons, a live countdown, delays and cancellations, and an LED dot-matrix style.'
        )
      );
    }

    const source = m.source || 'entities';
    const isLed = (m.board_style || 'modern') === 'led';

    const entityRow = (key: keyof TrainModule, label: string, desc: string, domains?: string[]) => html`
      <div style="margin-bottom: 12px;">
        ${this.renderEntityPickerWithVariables(
          hass,
          config,
          key as string,
          (m[key] as string) || '',
          (value: string) => {
            updateModule({ [key]: value } as Partial<CardModule>);
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          },
          domains,
          label
        )}
        <div style="font-size:0.78rem; color:var(--secondary-text-color); margin-top:3px; padding-left:2px;">
          ${desc}
        </div>
      </div>
    `;

    const toggleRow = (key: keyof TrainModule, title: string, description = '') => ({
      title,
      description,
      hass,
      data: { [key]: m[key] !== false },
      schema: [this.booleanField(key as string)],
      onChange: (e: CustomEvent) => {
        updateModule({ [key]: e.detail.value?.[key] ?? true } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      },
    });

    const numberRow = (key: keyof TrainModule, title: string, description: string, min: number, max: number, step: number, dflt: number) => ({
      title,
      description,
      hass,
      data: { [key]: (m[key] as number | undefined) ?? dflt },
      schema: [this.numberField(key as string, min, max, step)],
      onChange: (e: CustomEvent) => {
        updateModule({ [key]: e.detail.value?.[key] ?? dflt } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      },
    });

    const colorRow = (key: keyof TrainModule, title: string, dflt: string) =>
      this.renderColorField(title, '', hass, (m[key] as string) || '', dflt, (value: string) => {
        updateModule({ [key]: value } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      });

    const templatePlaceholder = `[
  {% for t in state_attr('sensor.my_station', 'departures') %}
  {
    "time": "{{ t.scheduled }}",
    "expected": "{{ t.estimated }}",
    "status": "{{ 'cancelled' if t.cancelled else ('delayed' if t.delay > 0 else 'on_time') }}",
    "destination": "{{ t.destination }}",
    "platform": "{{ t.platform }}"
  }{{ "," if not loop.last }}
  {% endfor %}
]`;

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        ${this.renderSettingsSection(
          localize('editor.train.source_section', lang, 'Departures'),
          localize(
            'editor.train.source_section_desc',
            lang,
            'Pick the sensors that hold your departures, or write a template that returns them as JSON.'
          ),
          []
        )}
        ${this.renderSegmentedField(
          localize('editor.train.source', lang, 'Source'),
          localize(
            'editor.train.source_desc',
            lang,
            'Entities reads departure sensors directly. Template lets you shape the departures yourself.'
          ),
          source,
          [
            { value: 'entities', label: localize('editor.train.source_entities', lang, 'Entities'), icon: 'mdi:database-marker' },
            { value: 'template', label: localize('editor.train.source_template', lang, 'Template'), icon: 'mdi:code-braces' },
          ],
          (next: string) => {
            updateModule({ source: next as TrainModule['source'] } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${source === 'template'
          ? html`
              <div
                style="margin-bottom:16px;"
                @mousedown=${(e: Event) => {
                  const t = e.target as HTMLElement;
                  if (!t.closest('ultra-template-editor') && !t.closest('.cm-editor')) e.stopPropagation();
                }}
                @dragstart=${(e: Event) => e.stopPropagation()}
                @insert-snippet=${(e: CustomEvent) => {
                  const ed = (e.currentTarget as HTMLElement).querySelector('ultra-template-editor');
                  (ed as any)?.insertAtCursor?.(e.detail?.value ?? '');
                }}
              >
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                  <div style="font-size:14px;font-weight:600;">
                    ${localize('editor.train.template', lang, 'Departures template')}
                  </div>
                  <button
                    type="button"
                    class="help-btn"
                    style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;background:var(--primary-color, #03a9f4);border:none;color:var(--text-primary-color, #fff);cursor:pointer;border-radius:50%;line-height:0;"
                    title="${localize('editor.train.template_cheatsheet', lang, 'Template cheatsheet')}"
                    @click=${(e: Event) => {
                      (e.currentTarget as HTMLElement).dispatchEvent(
                        new CustomEvent('uc-open-template-cheatsheet', {
                          bubbles: true,
                          composed: true,
                          detail: { module: 'train' },
                        })
                      );
                    }}
                  >
                    <ha-icon icon="mdi:help-circle" style="--mdc-icon-size:18px;width:18px;height:18px;"></ha-icon>
                  </button>
                </div>
                <div style="font-size:13px;color:var(--secondary-text-color);margin-bottom:10px;line-height:1.5;">
                  ${localize(
                    'editor.train.template_desc',
                    lang,
                    'Return a JSON array, next train first. Each item may have time, expected, delay (minutes), status (on_time / delayed / cancelled), destination, line, platform, note, and color.'
                  )}
                </div>
                <ultra-template-editor
                  .hass=${hass}
                  .value=${m.template || ''}
                  .placeholder=${templatePlaceholder}
                  .minHeight=${180}
                  .maxHeight=${480}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ template: e.detail.value } as Partial<CardModule>);
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-template-editor>
              </div>
            `
          : this.renderChipListField(
              localize('editor.train.departure_entities', lang, 'Departure sensors'),
              localize(
                'editor.train.departure_entities_desc',
                lang,
                'One sensor per train, next train first. A sensor whose attributes carry a list of departures is expanded automatically.'
              ),
              hass,
              m.departure_entities || [],
              (next: string[]) => {
                updateModule({ departure_entities: next } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
              {
                mode: 'entity',
                placeholder: localize('editor.train.departure_entities_placeholder', lang, 'Add a departure sensor'),
                entityDomains: ['sensor'],
              }
            )}

        ${this.renderSettingsSection(
          localize('editor.train.appearance_section', lang, 'Route'),
          localize('editor.train.appearance_section_desc', lang, 'How the board is titled and laid out.'),
          [
            {
              title: localize('editor.train.name', lang, 'Route name'),
              description: localize(
                'editor.train.name_desc',
                lang,
                'For example "Triangeln – Trelleborg C". Leave blank to use the first sensor name.'
              ),
              hass,
              data: { name: m.name || '' },
              schema: [this.textField('name')],
              onChange: (e: CustomEvent) => {
                updateModule({ name: e.detail.value?.name ?? '' } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderIconField(
          localize('editor.train.icon', lang, 'Icon override'),
          localize('editor.train.icon_desc', lang, 'Shown next to the countdown. Leave blank for the timer icon.'),
          hass,
          m.icon || '',
          (value: string) => {
            updateModule({ icon: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSegmentedField(
          localize('editor.train.layout', lang, 'Layout'),
          localize(
            'editor.train.layout_desc',
            lang,
            'Standard puts the route on the left and the trains on the right; compact is a single row.'
          ),
          m.layout || 'standard',
          [
            { value: 'standard', label: localize('editor.train.layout_standard', lang, 'Standard'), icon: 'mdi:view-agenda-outline' },
            { value: 'compact', label: localize('editor.train.layout_compact', lang, 'Compact'), icon: 'mdi:view-stream-outline' },
          ],
          (next: string) => {
            updateModule({ layout: next as TrainModule['layout'] } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSegmentedField(
          localize('editor.train.board_style', lang, 'Style'),
          localize(
            'editor.train.board_style_desc',
            lang,
            'Modern follows your theme. LED board is a dark dot-matrix departure display.'
          ),
          m.board_style || 'modern',
          [
            { value: 'modern', label: localize('editor.train.style_modern', lang, 'Modern'), icon: 'mdi:card-outline' },
            { value: 'led', label: localize('editor.train.style_led', lang, 'LED board'), icon: 'mdi:dots-grid' },
          ],
          (next: string) => {
            updateModule({ board_style: next as TrainModule['board_style'] } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}

        ${this.renderSettingsSection(
          localize('editor.train.realtime_section', lang, 'Next Train Realtime'),
          localize(
            'editor.train.realtime_section_desc',
            lang,
            'All optional. Some integrations publish the next train\'s realtime state as separate sensors (Trafikverket, for example). Link them here and they color the first train.'
          ),
          []
        )}
        ${entityRow(
          'status_entity',
          localize('editor.train.status_entity', lang, 'Departure state'),
          localize('editor.train.status_entity_desc', lang, 'Sensor reporting on time, delayed, or cancelled'),
          ['sensor', 'binary_sensor', 'input_select', 'input_text']
        )}
        ${entityRow(
          'delay_entity',
          localize('editor.train.delay_entity', lang, 'Delay'),
          localize('editor.train.delay_entity_desc', lang, 'Minutes or seconds late; the unit is read from the sensor'),
          ['sensor', 'input_number', 'number']
        )}
        ${entityRow(
          'cancelled_entity',
          localize('editor.train.cancelled_entity', lang, 'Cancelled'),
          localize('editor.train.cancelled_entity_desc', lang, 'On when the next train is cancelled'),
          ['binary_sensor', 'sensor', 'input_boolean']
        )}
        ${entityRow(
          'info_entity',
          localize('editor.train.info_entity', lang, 'Deviations / info'),
          localize('editor.train.info_entity_desc', lang, 'Free-text sensor shown as a ticker under the board'),
          ['sensor', 'input_text']
        )}

        ${this.renderSettingsSection(
          localize('editor.train.display_section', lang, 'Display'),
          localize('editor.train.display_section_desc', lang, 'Choose what the board shows.'),
          [
            numberRow(
              'max_departures',
              localize('editor.train.max_departures', lang, 'Trains to show'),
              localize('editor.train.max_departures_desc', lang, 'The next train is always the largest'),
              1,
              6,
              1,
              3
            ),
            toggleRow('show_name', localize('editor.train.show_name', lang, 'Show route name')),
            toggleRow('show_countdown', localize('editor.train.show_countdown', lang, 'Show countdown'), localize('editor.train.show_countdown_desc', lang, '"Departs in 23 min" for the next train that is running')),
            toggleRow('show_status', localize('editor.train.show_status', lang, 'Show status'), localize('editor.train.show_status_desc', lang, 'On time, delayed by, or cancelled')),
            toggleRow('show_details', localize('editor.train.show_details', lang, 'Show details'), localize('editor.train.show_details_desc', lang, 'Line, destination, and platform when the sensor provides them')),
            toggleRow('show_times', localize('editor.train.show_times', lang, 'Show departure times')),
            toggleRow('show_track', localize('editor.train.show_track', lang, 'Show track'), localize('editor.train.show_track_desc', lang, 'Railway track under the trains')),
            toggleRow('show_info', localize('editor.train.show_info', lang, 'Show deviations ticker')),
            toggleRow('enable_animations', localize('editor.train.animations', lang, 'Enable animations'), localize('editor.train.animations_desc', lang, 'Headlights, rolling track, and the imminent-departure pulse')),
          ]
        )}
        ${this.renderSegmentedField(
          localize('editor.train.time_format', lang, 'Time format'),
          '',
          m.time_format || 'auto',
          [
            { value: 'auto', label: localize('editor.train.time_auto', lang, 'Auto'), icon: 'mdi:earth' },
            { value: '24', label: localize('editor.train.time_24', lang, '24h'), icon: 'mdi:clock-time-eight-outline' },
            { value: '12', label: localize('editor.train.time_12', lang, '12h'), icon: 'mdi:clock-time-four-outline' },
          ],
          (next: string) => {
            updateModule({ time_format: next as TrainModule['time_format'] } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}

        ${this.renderSettingsSection(
          localize('editor.train.behaviour_section', lang, 'Thresholds'),
          localize('editor.train.behaviour_section_desc', lang, 'When a train counts as delayed and when the next one lights up.'),
          [
            numberRow(
              'delay_threshold',
              localize('editor.train.delay_threshold', lang, 'Delayed from (minutes)'),
              localize('editor.train.delay_threshold_desc', lang, 'Shorter delays are still shown as on time'),
              0,
              30,
              1,
              1
            ),
            numberRow(
              'imminent_minutes',
              localize('editor.train.imminent_minutes', lang, 'Leaving soon (minutes)'),
              localize('editor.train.imminent_minutes_desc', lang, 'Within this window the next train pulses and its headlights come on'),
              0,
              60,
              1,
              5
            ),
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.train.colors_section', lang, 'Colors'),
          localize('editor.train.colors_section_desc', lang, 'Each train takes the color of its status.'),
          []
        )}
        ${colorRow('on_time_color', localize('editor.train.on_time_color', lang, 'On time'), DEFAULT_ON_TIME_COLOR)}
        ${colorRow('delayed_color', localize('editor.train.delayed_color', lang, 'Delayed'), DEFAULT_DELAYED_COLOR)}
        ${colorRow('cancelled_color', localize('editor.train.cancelled_color', lang, 'Cancelled'), DEFAULT_CANCELLED_COLOR)}
        ${isLed
          ? colorRow('led_color', localize('editor.train.led_color', lang, 'LED text color'), DEFAULT_LED_COLOR)
          : html`
              ${colorRow('text_color', localize('editor.train.text_color', lang, 'Text color'), 'var(--primary-text-color)')}
              ${colorRow('secondary_text_color', localize('editor.train.secondary_text_color', lang, 'Secondary text color'), 'var(--secondary-text-color)')}
              ${colorRow('card_background_color', localize('editor.train.card_bg', lang, 'Card background'), 'var(--card-background-color)')}
            `}
      </div>
    `;
  }

  // ── Data ──────────────────────────────────────────────────────────────────

  /**
   * Resolve the departures for a module. Returns `null` while a template is
   * still evaluating so the caller can show a loading state instead of "no trains".
   */
  private _collect(
    m: TrainModule,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    now: Date
  ): { departures: TrainDeparture[]; name?: string | undefined; note?: string | undefined; error?: string | undefined } | null {
    const resolve = (v: string | undefined) => (v ? this.resolveEntity(v, config) || v : undefined);
    const threshold = m.delay_threshold ?? 1;
    let departures: TrainDeparture[] = [];
    let name: string | undefined;
    let note: string | undefined;

    if ((m.source || 'entities') === 'template') {
      const tpl = (m.template || '').trim();
      if (!tpl) return { departures: [] };
      if (!this._templateService) this._templateService = new TemplateService(hass);
      else this._templateService.updateHass(hass);
      if (!hass.__uvc_template_strings) hass.__uvc_template_strings = {};
      const processed = preprocessTemplateVariables(tpl, hass, config);
      const key = `train_${m.id}_${hashString(processed)}`;
      this._templateService.subscribeToTemplate(processed, key, () => this.triggerPreviewUpdate(), {}, config);
      const raw = this._templateService.getLastResult(key) ?? hass.__uvc_template_strings?.[key];
      if (raw === undefined || raw === null || raw === '') return null;
      try {
        const parsed = normalizeTemplateOutput(raw, now);
        departures = parsed.departures;
        name = parsed.name;
        note = parsed.note;
      } catch {
        return { departures: [], error: 'template' };
      }
    } else {
      const ids = (m.departure_entities || []).map(resolve).filter((x): x is string => !!x);
      for (const id of ids) departures.push(...departuresFromEntity(hass, id, now));
      const first = ids[0] ? hass.states[ids[0]] : undefined;
      if (first) name = stripDepartureSuffix(String(first.attributes?.friendly_name || ids[0]));
    }

    departures = finalizeDepartures(departures, threshold);

    // Linked realtime sensors describe the next train.
    if (departures.length) {
      const next = departures[0];
      const statusId = resolve(m.status_entity);
      const delayId = resolve(m.delay_entity);
      const cancelledId = resolve(m.cancelled_entity);
      if (delayId && hass.states[delayId]) {
        const s = hass.states[delayId];
        const mins = parseDelayMinutes(s.state, '', String(s.attributes?.unit_of_measurement || ''));
        if (mins !== null) {
          next.delayMin = Math.max(0, mins);
          if (next.planned) next.expected = new Date(next.planned.getTime() + next.delayMin * 60000);
          next.status = next.delayMin >= threshold ? 'delayed' : 'on_time';
        }
      }
      if (statusId && hass.states[statusId]) {
        const s = normalizeStatus(hass.states[statusId].state);
        if (s !== 'unknown') next.status = s;
      }
      if (cancelledId && hass.states[cancelledId] && truthy(hass.states[cancelledId].state)) next.status = 'cancelled';
    }
    const infoId = resolve(m.info_entity);
    if (infoId && hass.states[infoId]) {
      const s = hass.states[infoId].state;
      if (s && !/^(unknown|unavailable|none|null|\[\]|)$/i.test(s.trim())) note = s;
    }
    if (!note) note = departures.find(d => d.note)?.note;

    return { departures, name, note };
  }

  // ── Preview ───────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as TrainModule;
    const lang = hass?.locale?.language || 'en';
    const now = new Date();
    const isLed = (m.board_style || 'modern') === 'led';
    const isCompact = (m.layout || 'standard') === 'compact';
    const animate = m.enable_animations !== false;

    const configured =
      (m.source || 'entities') === 'template'
        ? !!(m.template || '').trim()
        : (m.departure_entities || []).length > 0;

    if (!configured || !hass) {
      return html`
        <style>${this.getStyles()}</style>
        ${this.renderGradientErrorState(
          localize('editor.train.config_needed', lang, 'Add a departure sensor'),
          localize('editor.train.config_needed_desc', lang, 'Pick your train sensors or a template in the General tab'),
          'mdi:train'
        )}
      `;
    }

    this._ensureTick();
    const data = this._collect(m, hass, config, now);

    // ── Colors ──
    const led = m.led_color || DEFAULT_LED_COLOR;
    const text = isLed ? led : m.text_color || 'var(--primary-text-color)';
    const secondary = isLed
      ? `color-mix(in srgb, ${led} 62%, transparent)`
      : m.secondary_text_color || 'var(--secondary-text-color)';
    const cardBg = isLed
      ? m.card_background_color || '#0e0f12'
      : m.card_background_color || 'var(--uc-pane-bg, var(--card-background-color))';
    const statusColor = (d: TrainDeparture) =>
      d.color ||
      (d.status === 'cancelled'
        ? m.cancelled_color || DEFAULT_CANCELLED_COLOR
        : d.status === 'delayed'
          ? m.delayed_color || DEFAULT_DELAYED_COLOR
          : m.on_time_color || DEFAULT_ON_TIME_COLOR);

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const firstEntity = (m.departure_entities || [])[0];
    const g = this.createGestureHandlers(
      m.id,
      {
        tap_action: m.tap_action?.action
          ? { ...m.tap_action, entity: firstEntity }
          : { action: firstEntity ? 'more-info' : 'nothing', entity: firstEntity },
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        entity: firstEntity,
        module: m,
      },
      hass,
      config
    );

    const wrap = (inner: TemplateResult) => html`
      <style>${this.getStyles()}</style>
      <div
        class="uc-train ${isLed ? 'uc-train--led' : ''} ${isCompact ? 'uc-train--compact' : ''} ${hoverClass}"
        data-uc-role="pane"
        style="--uc-train-led:${led};--uc-train-text:${text};--uc-train-secondary:${secondary};--uc-train-bg:${cardBg};background:${cardBg};${designStyles}"
        @pointerdown=${g.onPointerDown}
        @pointermove=${g.onPointerMove}
        @pointerup=${g.onPointerUp}
        @pointerleave=${g.onPointerLeave}
        @pointercancel=${g.onPointerCancel}
      >
        ${this.wrapWithAnimation(inner, module, hass)}
      </div>
    `;

    // ── Loading / empty / error states ──
    const emptyBoard = (icon: string, title: string, sub: string, spin = false) => wrap(html`
      <div class="uc-train__empty">
        <ha-icon icon="${icon}" class="${spin ? 'uc-train--spin' : ''}" style="--mdc-icon-size:22px;color:${secondary};"></ha-icon>
        <div>
          <div class="uc-train__led-text" style="color:${text};font-weight:600;">${title}</div>
          <div class="uc-train__led-solid" style="color:${secondary};font-size:12px;">${sub}</div>
        </div>
      </div>
    `);

    if (data === null) {
      return emptyBoard(
        'mdi:loading',
        localize('editor.train.loading', lang, 'Reading timetable'),
        localize('editor.train.loading_desc', lang, 'Waiting for the template result'),
        true
      );
    }
    if (data.error) {
      return emptyBoard(
        'mdi:alert-circle-outline',
        localize('editor.train.template_error', lang, 'Template must return JSON'),
        localize('editor.train.template_error_desc', lang, 'Return an array of departures, for example [{"time": "11:11", "status": "on_time"}]')
      );
    }

    const maxN = Math.max(1, Math.min(6, Math.round(m.max_departures ?? 3)));
    const departures = data.departures.slice(0, maxN);
    const name = m.name?.trim() || data.name || localize('editor.train.default_name', lang, 'Next departures');

    if (!departures.length) {
      return emptyBoard(
        'mdi:train-variant',
        name,
        localize('editor.train.no_departures', lang, 'No departures right now')
      );
    }

    // ── Hero: the next train that is actually running ──
    const hero = departures.find(d => d.status !== 'cancelled') ?? departures[0];
    const heroTime = hero.expected ?? hero.planned;
    const minsLeft = heroTime ? Math.round((heroTime.getTime() - now.getTime()) / 60000) : null;
    const imminentWindow = m.imminent_minutes ?? 5;
    const imminent = minsLeft !== null && minsLeft <= imminentWindow && minsLeft >= -1 && hero.status !== 'cancelled';

    const countdownText = (() => {
      if (hero.status === 'cancelled') return localize('editor.train.state_cancelled', lang, 'Cancelled');
      if (minsLeft === null) return '';
      if (minsLeft <= 0 && minsLeft >= -1) return localize('editor.train.departing_now', lang, 'Departing now');
      if (minsLeft < -1) return localize('editor.train.departed', lang, 'Departed');
      if (minsLeft >= 120) {
        const h = Math.floor(minsLeft / 60);
        const mm = minsLeft % 60;
        return localize('editor.train.departs_in_hours', lang, 'Departs in {h}h {m}m')
          .replace('{h}', String(h))
          .replace('{m}', String(mm).padStart(2, '0'));
      }
      return localize('editor.train.departs_in', lang, 'Departs in {n} min').replace('{n}', String(minsLeft));
    })();

    const statusText = (d: TrainDeparture) => {
      switch (d.status) {
        case 'cancelled':
          return localize('editor.train.state_cancelled', lang, 'Cancelled');
        case 'delayed':
          return d.delayMin >= 1
            ? localize('editor.train.state_delayed_by', lang, 'Delayed {n} min').replace('{n}', String(Math.round(d.delayMin)))
            : localize('editor.train.state_delayed', lang, 'Delayed');
        case 'on_time':
          return localize('editor.train.state_on_time', lang, 'On time');
        default:
          return localize('editor.train.state_scheduled', lang, 'Scheduled');
      }
    };

    const fmtTime = (d: Date | null) => (d ? this._formatTime(d, hass, m, lang) : '—');

    const details = [hero.line, hero.destination, hero.platform ? localize('editor.train.platform', lang, 'Platform {p}').replace('{p}', hero.platform) : undefined]
      .filter(Boolean)
      .join(' · ');

    const heroColor = statusColor(hero);
    const icon = m.icon || 'mdi:timer-outline';

    // ── Trains row ──
    // A two-row grid: icons sit on row 1 (bottom-aligned so the rails meet the
    // wheels), times on row 2, so a struck-through planned time under one train
    // cannot push its neighbours out of line.
    const baseSize = isCompact ? 34 : 56;
    const sizeAt = (i: number) => Math.round(baseSize * Math.max(0.58, 1 - i * 0.19));
    const showTrack = m.show_track !== false;
    const trainsRow = html`
      <div class="uc-train__row">
        ${departures.map((d, i) => {
          const size = sizeAt(i);
          const color = statusColor(d);
          const isNext = d === hero;
          const lit = isNext && imminent;
          const cancelled = d.status === 'cancelled';
          // Track bed height, in proportion to the 64-unit train drawn above it.
          const trackH = showTrack ? Math.round((size * TRACK_H) / 64) : 0;
          const timeLabel = fmtTime(d.expected ?? d.planned);
          const plannedLabel =
            d.status === 'delayed' && d.planned && d.expected && d.planned.getTime() !== d.expected.getTime()
              ? fmtTime(d.planned)
              : null;
          const col = i + 1;
          const title = `${statusText(d)}${d.destination ? ` · ${d.destination}` : ''}${d.platform ? ` · ${d.platform}` : ''}`;
          return html`
            <div
              class="uc-train__icon ${lit && animate ? 'uc-train__icon--imminent' : ''} ${cancelled ? 'uc-train__icon--cancelled' : ''}"
              style="grid-column:${col};width:${size}px;height:${size + trackH}px;color:${color};--uc-tsz:${size}px;"
              title="${title}"
            >
              ${this._trainSvg(m.id, i, size, color, isLed, lit, cancelled, d.status === 'delayed' && d.delayMin >= 1 && size >= 44 ? `+${Math.round(d.delayMin)}` : null)}
              ${showTrack
                ? html`
                    <!-- Track as a tilted plane: near edge (bottom) wide, far edge (under the wheels) narrow. -->
                    <div class="uc-train__bed" style="height:${trackH}px;" aria-hidden="true">
                      <div class="uc-train__rails ${animate && !cancelled ? 'uc-train__rails--roll' : ''}"></div>
                    </div>
                  `
                : nothing}
            </div>
            ${m.show_times !== false
              ? html`
                  <div class="uc-train__stop-time" style="grid-column:${col};" title="${title}">
                    <div
                      class="uc-train__time ${isCompact ? 'uc-train__led-solid' : 'uc-train__led-text'} ${cancelled ? 'uc-train__time--cancelled' : ''}"
                      style="color:${isLed ? led : isNext ? text : secondary};font-size:${isCompact ? 12 : Math.max(12, Math.round(size * 0.29))}px;"
                    >
                      ${timeLabel}
                    </div>
                    ${plannedLabel && !isCompact
                      ? html`<div class="uc-train__planned" style="color:${secondary};">${plannedLabel}</div>`
                      : nothing}
                  </div>
                `
              : nothing}
          `;
        })}
      </div>
    `;

    const scrollNote = animate && (data.note?.length ?? 0) > 42;
    const infoTicker =
      m.show_info !== false && data.note
        ? html`
            <div class="uc-train__info ${scrollNote ? 'uc-train__info--scroll' : ''}" style="color:${isLed ? led : secondary};">
              <ha-icon icon="mdi:information-outline" style="--mdc-icon-size:14px;flex-shrink:0;"></ha-icon>
              <div class="uc-train__ticker">
                <span class="uc-train__ticker-text uc-train__led-solid ${scrollNote ? 'uc-train__ticker-text--scroll' : ''}">${data.note}</span>
              </div>
            </div>
          `
        : nothing;

    // ── COMPACT ──
    if (isCompact) {
      return wrap(html`
        <div class="uc-train__compact">
          <ha-icon icon="${m.icon || 'mdi:train'}" class="${imminent && animate ? 'uc-train--pulse' : ''}" style="color:${heroColor};--mdc-icon-size:24px;flex-shrink:0;"></ha-icon>
          <div class="uc-train__compact-main">
            ${m.show_name !== false ? html`<div class="uc-train__name uc-train__led-text" style="color:${text};">${name}</div>` : nothing}
            ${m.show_countdown !== false || m.show_status !== false
              ? html`
                  <div class="uc-train__sub uc-train__led-solid" style="color:${secondary};">
                    ${m.show_countdown !== false ? html`<span style="color:${imminent ? heroColor : text};font-weight:600;">${countdownText}</span>` : nothing}
                    ${m.show_status !== false && hero.status !== 'cancelled' ? html`<span style="color:${heroColor};"> · ${statusText(hero)}</span>` : nothing}
                  </div>
                `
              : nothing}
          </div>
          ${trainsRow}
        </div>
        ${infoTicker}
      `);
    }

    // ── STANDARD ──
    return wrap(html`
      <div class="uc-train__body">
        <div class="uc-train__left">
          ${m.show_name !== false ? html`<div class="uc-train__name uc-train__led-text" style="color:${text};">${name}</div>` : nothing}
          ${m.show_countdown !== false
            ? html`
                <div class="uc-train__countdown ${imminent && animate ? 'uc-train__countdown--soon' : ''}">
                  <span class="uc-train__badge ${isLed ? 'uc-train__badge--led' : ''}" style="--uc-badge:${heroColor};">
                    <ha-icon icon="${icon}" style="--mdc-icon-size:18px;"></ha-icon>
                  </span>
                  <span class="uc-train__countdown-text uc-train__led-text" style="color:${text};">${countdownText}</span>
                </div>
              `
            : nothing}
          ${m.show_status !== false || (m.show_details !== false && details)
            ? html`
                <div class="uc-train__meta uc-train__led-solid" style="color:${secondary};">
                  ${m.show_status !== false ? html`<span style="color:${heroColor};font-weight:600;">${statusText(hero)}</span>` : nothing}
                  ${m.show_details !== false && details ? html`<span>${m.show_status !== false ? ' · ' : ''}${details}</span>` : nothing}
                </div>
              `
            : nothing}
        </div>
        ${trainsRow}
      </div>
      ${infoTicker}
    `);
  }

  // ── Train SVG ─────────────────────────────────────────────────────────────

  /**
   * Front view of a train, like a station pictogram: rounded body, two windows,
   * headlights, bumper, and a head-on bogie with a wheel at each side. The track
   * is a separate 3D-tilted element below (see `.uc-train__bed`). In LED mode
   * the train is masked with a dot pattern so it reads as pixels on the board.
   */
  private _trainSvg(
    moduleId: string,
    index: number,
    size: number,
    color: string,
    led: boolean,
    lit: boolean,
    cancelled: boolean,
    badge: string | null
  ): TemplateResult {
    const p = `uct-${String(moduleId).replace(/[^a-zA-Z0-9_-]/g, '')}-${index}`;
    // The board colour. On the LED board every "off" pixel is this colour, so
    // windows, the door seam and the lamp rings are carved out of the body with
    // it; that is what keeps the train from reading as one solid dotted blob.
    const bg = 'var(--uc-train-bg, var(--card-background-color))';
    const glass = led ? bg : 'color-mix(in srgb, #0b1020 82%, var(--card-background-color))';
    const lampOn = '#fff7cc';
    const lamp = lit ? lampOn : led ? 'rgba(255,247,204,0.7)' : `color-mix(in srgb, #fff 55%, ${color})`;
    // Running gear is a darker shade of the livery so it sits back from the body.
    const gear = led ? color : `color-mix(in srgb, ${color} 62%, #000)`;
    // Keep the LED pitch constant on screen (~3px) whatever the icon size, so
    // small trains stay dotted and large ones still look like a pixel matrix.
    const pitch = (64 / Math.max(16, size)) * 3;
    return svg`
      <svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true" class="uc-train-svg ${cancelled ? 'uc-train-svg--cancelled' : ''}">
        <defs>
          <pattern id="${p}-dots" width="${pitch}" height="${pitch}" patternUnits="userSpaceOnUse">
            <circle cx="${pitch / 2}" cy="${pitch / 2}" r="${pitch * 0.34}" fill="#fff" />
          </pattern>
          <mask id="${p}-mask">
            <rect width="64" height="64" fill="url(#${p}-dots)" />
          </mask>
          <linearGradient id="${p}-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity="0.22" />
            <stop offset="0.5" stop-color="#fff" stop-opacity="0" />
            <stop offset="1" stop-color="#000" stop-opacity="0.18" />
          </linearGradient>
        </defs>
        <g mask="${led ? `url(#${p}-mask)` : 'none'}">
          <!-- wheels seen head-on: a tread showing under each side of the bumper -->
          <rect x="11" y="53" width="8" height="11" rx="2.5" fill="${gear}" style="${led ? `stroke:${bg};stroke-width:1.4` : ''}" />
          <rect x="45" y="53" width="8" height="11" rx="2.5" fill="${gear}" style="${led ? `stroke:${bg};stroke-width:1.4` : ''}" />
          <!-- bumper -->
          <rect x="7" y="48" width="50" height="7" rx="3.5" fill="${color}" />
          <!-- body -->
          <rect x="10" y="4" width="44" height="45" rx="13" fill="${color}" />
          ${led
            ? svg`<rect x="7" y="48.2" width="50" height="1.6" style="fill:${bg}" />`
            : svg`<rect x="10" y="4" width="44" height="45" rx="13" fill="url(#${p}-body)" />`}
          <!-- roof marker light -->
          <rect x="28" y="7" width="8" height="3" rx="1.5" fill="${led ? 'rgba(255,247,204,0.6)' : 'rgba(255,255,255,0.35)'}" />
          <!-- windows -->
          <rect x="15" y="13" width="15" height="15" rx="4" style="fill:${glass}" />
          <rect x="34" y="13" width="15" height="15" rx="4" style="fill:${glass}" />
          ${led
            ? svg`
              <!-- lit panes: dim pixels inside the dark frames -->
              <rect x="18" y="16" width="9" height="9" rx="2" fill="rgba(255,247,204,0.16)" />
              <rect x="37" y="16" width="9" height="9" rx="2" fill="rgba(255,247,204,0.16)" />
            `
            : svg`
              <rect x="17" y="15" width="5" height="4" rx="1.5" fill="rgba(255,255,255,0.18)" />
              <rect x="36" y="15" width="5" height="4" rx="1.5" fill="rgba(255,255,255,0.18)" />
            `}
          <!-- door seam + headlights -->
          <rect x="31" y="31" width="2" height="13" rx="1" style="fill:${led ? bg : 'rgba(0,0,0,0.22)'}" />
          ${led
            ? svg`
              <circle cx="21" cy="38" r="5.4" style="fill:${bg}" />
              <circle cx="43" cy="38" r="5.4" style="fill:${bg}" />
            `
            : nothing}
          <circle cx="21" cy="38" r="4" fill="${lamp}" class="uc-train-lamp" />
          <circle cx="43" cy="38" r="4" fill="${lamp}" class="uc-train-lamp" />
        </g>
        ${cancelled
          ? svg`
            <g class="uc-train-x" stroke="${color}" stroke-width="4.5" stroke-linecap="round" opacity="0.95">
              <line x1="18" y1="18" x2="46" y2="46" />
              <line x1="46" y1="18" x2="18" y2="46" />
            </g>
          `
          : nothing}
        ${badge && !led
          ? svg`
            <g class="uc-train-badge" transform="translate(46 4)">
              <rect x="0" y="0" width="${8 + badge.length * 6}" height="13" rx="6.5" fill="${color}" stroke="var(--card-background-color)" stroke-width="2" />
              <text x="${(8 + badge.length * 6) / 2}" y="9.6" text-anchor="middle" font-size="9" font-weight="800" font-family="inherit" fill="#fff">${badge}</text>
            </g>
          `
          : nothing}
      </svg>
    `;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _formatTime(d: Date, hass: HomeAssistant, m: TrainModule, lang: string): string {
    const pref = m.time_format || 'auto';
    const haPref = String((hass.locale as { time_format?: string } | undefined)?.time_format || '');
    const hour12 = pref === '12' ? true : pref === '24' ? false : haPref === '12' ? true : haPref === '24' ? false : undefined;
    try {
      const opts: Intl.DateTimeFormatOptions = { hour: hour12 === false ? '2-digit' : 'numeric', minute: '2-digit' };
      if (hour12 !== undefined) opts.hour12 = hour12;
      return new Intl.DateTimeFormat(lang, opts).format(d);
    } catch {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
  }

  /** Re-render twice a minute so the countdown and "departed" state stay honest. */
  private _ensureTick(): void {
    if (this._tickTimer) return;
    this._tickTimer = setInterval(() => this.triggerPreviewUpdate(), 30000);
  }

  destroy(): void {
    if (this._tickTimer) {
      clearInterval(this._tickTimer);
      this._tickTimer = null;
    }
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as TrainModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if ((m.source || 'entities') === 'template') {
      if (!(m.template || '').trim()) errors.push('Enter a departures template');
    } else if (!(m.departure_entities || []).length) {
      errors.push('Add at least one departure sensor');
    }
    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .uc-train {
        box-sizing: border-box;
        padding: 14px 16px;
        border-radius: var(--uc-r-12, 12px);
        position: relative;
        overflow: hidden;
      }

      /* ── LED board: dark panel, unlit dot grid, glowing dot-matrix text ── */
      .uc-train--led {
        background-image:
          radial-gradient(circle, rgba(255,255,255,0.05) 34%, transparent 38%);
        background-size: 2.6px 2.6px;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 40px rgba(0,0,0,0.6);
        font-family: "DotGothic16", "Menlo", "Consolas", ui-monospace, "SF Mono", monospace;
      }
      /* Large text is punched into dots; the pitch is fine enough (≈7 dots per
         cap height) that the letterforms survive, and the glow fills the gaps. */
      .uc-train--led .uc-train__led-text {
        color: transparent !important;
        /* Fat dots on a fine pitch: the letterforms stay connected enough to read
           at 16px while the gaps still give the dot-matrix texture. */
        background-image: radial-gradient(circle, var(--uc-led-dot, var(--uc-train-led)) 47%, transparent 55%);
        background-size: 2.4px 2.4px;
        -webkit-background-clip: text;
        background-clip: text;
        filter: drop-shadow(0 0 2px var(--uc-led-dot, var(--uc-train-led)));
        font-weight: 800;
        letter-spacing: 0.02em;
      }
      /* Small text stays solid so it is legible, with the same glow. */
      .uc-train--led .uc-train__led-solid {
        text-shadow: 0 0 4px currentColor;
        font-weight: 700;
      }
      .uc-train--led .uc-train__name { font-size: 16px; }
      .uc-train--led .uc-train__countdown-text { font-size: 16px; }
      /* A tight bloom in the train's own colour (the icon carries it as its color);
         a wide glow bled into the window gaps and flattened the shape. */
      .uc-train--led .uc-train__icon { filter: drop-shadow(0 0 1.5px currentColor); }
      .uc-train:not(.uc-train--led) .uc-train__icon { filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.32)); }
      .uc-train--led .uc-train__badge--led {
        background: transparent;
        color: var(--uc-badge);
        filter: drop-shadow(0 0 3px var(--uc-badge));
      }

      /* The trains wrap under the route text when the card is too narrow for both. */
      .uc-train__body {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .uc-train__left {
        flex: 1 1 148px;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .uc-train__name {
        font-weight: 700;
        font-size: 17px;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        /* Long route names wrap to a second line before we clip them. */
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow-wrap: anywhere;
      }
      .uc-train--compact .uc-train__name {
        display: block;
        white-space: nowrap;
      }
      .uc-train__countdown {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
        min-width: 0;
      }
      .uc-train__badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--uc-badge) 16%, transparent);
        color: var(--uc-badge);
        flex-shrink: 0;
      }
      .uc-train__countdown-text {
        font-size: 15px;
        font-weight: 600;
        white-space: nowrap;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-train__meta {
        font-size: 12px;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ── Trains ── */
      .uc-train__row {
        display: grid;
        grid-template-rows: auto auto;
        grid-auto-flow: column;
        grid-auto-columns: auto;
        column-gap: 14px;
        row-gap: 4px;
        align-items: end;
        justify-items: center;
        flex-shrink: 0;
        margin-left: auto;
        --uc-track-rail: color-mix(in srgb, var(--uc-train-secondary) 80%, transparent);
        --uc-track-tie: color-mix(in srgb, var(--uc-train-secondary) 42%, transparent);
      }
      .uc-train--led .uc-train__row {
        --uc-track-rail: color-mix(in srgb, var(--uc-train-led) 70%, transparent);
        --uc-track-tie: color-mix(in srgb, var(--uc-train-led) 38%, transparent);
      }
      .uc-train__icon {
        grid-row: 1;
        position: relative;
        align-self: end;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      /*
       * The track is a plane lying on the ground, seen from slightly above: its
       * far edge sits under the wheels and its near edge comes toward the viewer,
       * so the rails fan out and the sleepers spread apart as they get closer.
       * Real perspective (rotateX under a perspective container) does that for
       * free, including foreshortening of the rolling animation.
       */
      .uc-train__bed {
        position: relative;
        width: 100%;
        perspective: calc(var(--uc-tsz, 56px) * 1.4);
        perspective-origin: 50% 0;
      }
      .uc-train__rails {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 150%;
        transform-origin: 50% 0;
        transform: rotateX(60deg);
        /* Two rails, centred on the wheel treads (x = 15/64 and 49/64 of the train). */
        background: linear-gradient(
          90deg,
          transparent 21.6%,
          var(--uc-track-rail) 21.6% 25.2%,
          transparent 25.2% 74.8%,
          var(--uc-track-rail) 74.8% 78.4%,
          transparent 78.4%
        );
      }
      .uc-train__rails::before {
        content: '';
        position: absolute;
        inset: 0 11%;
        background: repeating-linear-gradient(180deg, var(--uc-track-tie) 0 2px, transparent 2px 7px);
        background-size: 100% 7px;
        background-position: 0 0;
      }
      /* The train is heading toward the viewer, so the ground ahead of it (near
         edge) runs up under the wheels: sleepers move one pitch away per loop. */
      .uc-train__rails--roll::before { animation: uc-train-ties 0.6s linear infinite; }
      @keyframes uc-train-ties {
        from { background-position: 0 0; }
        to { background-position: 0 -7px; }
      }
      /* On the LED board the track is punched into the same dot grid as the train. */
      .uc-train--led .uc-train__bed {
        -webkit-mask-image: radial-gradient(circle, #000 34%, transparent 42%);
        mask-image: radial-gradient(circle, #000 34%, transparent 42%);
        -webkit-mask-size: 3px 3px;
        mask-size: 3px 3px;
      }
      .uc-train__icon--cancelled { opacity: 0.55; }
      .uc-train__stop-time {
        grid-row: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        align-self: start;
        min-width: 0;
      }
      .uc-train-svg { display: block; flex: 0 0 auto; overflow: visible; }
      .uc-train__time {
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        line-height: 1.1;
      }
      .uc-train__time--cancelled { text-decoration: line-through; opacity: 0.7; }
      /* Dotted text cannot show a strike-through (the line is punched too), so dim it instead. */
      .uc-train--led .uc-train__led-text.uc-train__time--cancelled { text-decoration: none; opacity: 0.45; }
      .uc-train__planned {
        font-size: 10px;
        text-decoration: line-through;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .uc-train--led .uc-train__planned { text-decoration: none; opacity: 0.5; }

      /* ── Compact ── */
      .uc-train--compact { padding: 10px 14px; }
      .uc-train__compact {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .uc-train__compact-main {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .uc-train--compact .uc-train__name { font-size: 14px; }
      .uc-train--led.uc-train--compact .uc-train__name { font-size: 15px; }
      .uc-train__sub {
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-train--compact .uc-train__row { column-gap: 9px; row-gap: 2px; }

      /* ── Info ticker ── */
      .uc-train__info {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid color-mix(in srgb, currentColor 22%, transparent);
        font-size: 12px;
        min-width: 0;
      }
      .uc-train__ticker {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
      }
      .uc-train__info--scroll .uc-train__ticker {
        mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
        -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
      }
      .uc-train__ticker-text { display: inline-block; text-overflow: ellipsis; overflow: hidden; max-width: 100%; vertical-align: bottom; }
      .uc-train__ticker-text--scroll {
        max-width: none;
        overflow: visible;
        padding-left: 100%;
        animation: uc-train-ticker 14s linear infinite;
      }
      @keyframes uc-train-ticker {
        from { transform: translateX(0); }
        to { transform: translateX(-100%); }
      }

      .uc-train__empty {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 44px;
      }

      /* ── Animations ── */
      .uc-train__icon--imminent { animation: uc-train-bob 1.6s ease-in-out infinite; }
      .uc-train__icon--imminent .uc-train-lamp { animation: uc-train-lamp 1.6s ease-in-out infinite; }
      @keyframes uc-train-bob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
      @keyframes uc-train-lamp {
        0%, 100% { filter: drop-shadow(0 0 1px #fff7cc); opacity: 1; }
        50% { filter: drop-shadow(0 0 5px #fff7cc) drop-shadow(0 0 9px #ffe38a); opacity: 0.85; }
      }
      .uc-train__countdown--soon .uc-train__countdown-text { animation: uc-train-blink 1.6s ease-in-out infinite; }
      .uc-train--pulse { animation: uc-train-blink 1.6s ease-in-out infinite; }
      @keyframes uc-train-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.55; }
      }
      .uc-train--spin { animation: uc-train-spin 1s linear infinite; }
      @keyframes uc-train-spin { to { transform: rotate(360deg); } }

      @media (prefers-reduced-motion: reduce) {
        .uc-train__rails--roll::before,
        .uc-train__icon--imminent,
        .uc-train__icon--imminent .uc-train-lamp,
        .uc-train__countdown--soon .uc-train__countdown-text,
        .uc-train--pulse,
        .uc-train__ticker-text--scroll { animation: none; }
      }
    `;
  }
}

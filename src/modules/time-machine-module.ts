/**
 * Time Machine Module (PRO)
 *
 * A card-wide history scrubber. Drag the timeline to rewind every module in
 * the card to a past moment: entity states, logic conditions, and visuals all
 * re-render from recorder history. The heavy lifting (history fetch, state
 * snapshots, historical hass) lives in `uc-time-machine-service`; ultra-card
 * swaps the historical hass into its render pipeline when a scrub is active.
 */
import { TemplateResult, html, svg } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, TimeMachineModule, UltraCardConfig } from '../types';
import {
  ucTimeMachineService,
  UcTimeMachineLane,
  UcTimeMachineSeries,
} from '../services/uc-time-machine-service';

const MS_PER_HOUR = 3_600_000;
const MS_PER_MINUTE = 60_000;
const SPAN_PRESETS: Array<{ hours: number; label: string }> = [
  { hours: 1, label: '1h' },
  { hours: 6, label: '6h' },
  { hours: 24, label: '24h' },
  { hours: 168, label: '7d' },
];

/** Event marker color groups by entity domain (legend + tick tint). */
const MARKER_GROUPS: Array<{
  key: string;
  label: string;
  color: string;
  domains: string[];
}> = [
  { key: 'lights', label: 'Lights', color: '#ffb74d', domains: ['light', 'switch'] },
  { key: 'sensors', label: 'Sensors', color: '#f06292', domains: ['binary_sensor', 'cover'] },
  { key: 'locks', label: 'Locks', color: '#66bb6a', domains: ['lock', 'alarm_control_panel'] },
  {
    key: 'climate',
    label: 'Climate',
    color: '#4fc3f7',
    domains: ['climate', 'fan', 'humidifier', 'water_heater'],
  },
];
const MARKER_OTHER = { key: 'other', label: 'Other', color: '#b39ddb' };

/** Line colors for the Card Timeline built-in graph. */
const CHART_COLORS = ['#4fc3f7', '#ffb74d', '#66bb6a', '#f06292'];

export class UltraTimeMachineModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'time_machine',
    title: 'Time Machine',
    description: 'Rewind the entire card with a draggable history timeline',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:history',
    category: 'data',
    tags: ['time', 'history', 'scrubber', 'rewind', 'timeline', 'replay', 'pro', 'premium'],
  };

  createDefault(id?: string, _hass?: HomeAssistant): TimeMachineModule {
    return {
      id: id || this.generateId('time_machine'),
      type: 'time_machine',
      mode: 'dashboard',
      default_span_hours: 24,
      show_span_presets: true,
      show_event_markers: true,
      show_playback: true,
      auto_return_seconds: 120,
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    return { valid: errors.length === 0, errors };
  }

  // ── General tab ──────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    _config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as TimeMachineModule;
    const lang = hass?.locale?.language || 'en';

    const mode = this._mode(m);

    const modeOptions: Array<{
      value: 'dashboard' | 'card';
      icon: string;
      title: string;
      description: string;
    }> = [
      {
        value: 'dashboard',
        icon: 'mdi:view-dashboard-outline',
        title: localize('editor.time_machine.mode_dashboard', lang, 'Dashboard Timeline'),
        description: localize(
          'editor.time_machine.mode_dashboard_desc',
          lang,
          'Scrub the timeline and watch your dashboard rewind in real time — every Ultra Card in the current view follows, showing its history as you drag.'
        ),
      },
      {
        value: 'card',
        icon: 'mdi:chart-timeline-variant',
        title: localize('editor.time_machine.mode_card', lang, 'Card Timeline'),
        description: localize(
          'editor.time_machine.mode_card_desc',
          lang,
          'An independent history scrubber. Pick the entities you care about and explore their state history with built-in graphs, highs and lows, and details that follow the playhead. Nothing else on the page is affected.'
        ),
      },
    ];

    return html`
      ${this.injectUcFormStyles()}
      <style>
        .uc-tm-mode-picker {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }
        .uc-tm-mode-option {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 14px;
          border: 2px solid var(--divider-color);
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .uc-tm-mode-option:hover {
          border-color: var(--primary-color);
        }
        .uc-tm-mode-option.selected {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        }
        .uc-tm-mode-option ha-icon {
          --mdc-icon-size: 22px;
          color: var(--secondary-text-color);
          margin-top: 2px;
          flex-shrink: 0;
        }
        .uc-tm-mode-option.selected ha-icon {
          color: var(--primary-color);
        }
        .uc-tm-mode-title {
          font-weight: 600;
          font-size: 14px;
          color: var(--primary-text-color);
          margin-bottom: 3px;
        }
        .uc-tm-mode-option.selected .uc-tm-mode-title {
          color: var(--primary-color);
        }
        .uc-tm-mode-desc {
          font-size: 12px;
          line-height: 1.45;
          color: var(--secondary-text-color);
        }
      </style>
      <div class="module-general-settings">
        <div class="uc-tm-mode-picker">
          ${modeOptions.map(
            opt => html`
              <div
                class="uc-tm-mode-option ${mode === opt.value ? 'selected' : ''}"
                @click=${() => {
                  updateModule({ mode: opt.value } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }}
              >
                <ha-icon icon="${opt.icon}"></ha-icon>
                <div>
                  <div class="uc-tm-mode-title">${opt.title}</div>
                  <div class="uc-tm-mode-desc">${opt.description}</div>
                </div>
              </div>
            `
          )}
        </div>
        ${this.renderSettingsSection(
          localize('editor.time_machine.entities_section', lang, 'Entities'),
          mode === 'card'
            ? localize(
                'editor.time_machine.entities_card_desc',
                lang,
                'Pick the entities to graph and track on the timeline. Numeric sensors are drawn as graphs; everything else shows its state at the scrub position.'
              )
            : localize(
                'editor.time_machine.entities_dashboard_desc',
                lang,
                'The dashboard timeline automatically rewinds every entity used by the Ultra Cards in the view — no selection needed. Add extra entities here to also draw their event markers on the track.'
              ),
          [
            {
              title:
                mode === 'card'
                  ? localize('editor.time_machine.entities', lang, 'Entities')
                  : localize('editor.time_machine.extra_entities', lang, 'Extra entities'),
              description:
                mode === 'card'
                  ? localize(
                      'editor.time_machine.entities_desc',
                      lang,
                      'Their history powers the graphs, details, and event markers.'
                    )
                  : localize(
                      'editor.time_machine.extra_entities_desc',
                      lang,
                      'Tracked in addition to the auto-discovered view entities.'
                    ),
              hass,
              data: { extra_entities: m.extra_entities || [] },
              schema: [
                {
                  name: 'extra_entities',
                  selector: { entity: { multiple: true } },
                },
              ],
              onChange: (e: CustomEvent) => {
                updateModule({
                  extra_entities: e.detail.value?.extra_entities || [],
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderSegmentedField(
          localize('editor.time_machine.default_span', lang, 'Default time range'),
          localize(
            'editor.time_machine.default_span_desc',
            lang,
            'How far back the timeline reaches when the card loads.'
          ),
          String(m.default_span_hours ?? 24),
          SPAN_PRESETS.map(p => ({
            value: String(p.hours),
            label: p.label,
          })),
          (next: string) => {
            updateModule({ default_span_hours: Number(next) } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSettingsSection(
          localize('editor.time_machine.display_section', lang, 'Scrubber controls'),
          localize(
            'editor.time_machine.display_section_desc',
            lang,
            'Choose which controls appear on the timeline.'
          ),
          [
            {
              title: localize('editor.time_machine.show_span_presets', lang, 'Time range presets'),
              description: localize(
                'editor.time_machine.show_span_presets_desc',
                lang,
                'Show the 1h / 6h / 24h / 7d range pills.'
              ),
              hass,
              data: { show_span_presets: m.show_span_presets !== false },
              schema: [this.booleanField('show_span_presets')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_span_presets: e.detail.value?.show_span_presets ?? true,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.time_machine.show_event_markers', lang, 'Event markers'),
              description: localize(
                'editor.time_machine.show_event_markers_desc',
                lang,
                'Draw a tick on the track for every entity state change.'
              ),
              hass,
              data: { show_event_markers: m.show_event_markers !== false },
              schema: [this.booleanField('show_event_markers')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_event_markers: e.detail.value?.show_event_markers ?? true,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.time_machine.show_playback', lang, 'Replay controls'),
              description: localize(
                'editor.time_machine.show_playback_desc',
                lang,
                'Show play/pause and step buttons to replay history.'
              ),
              hass,
              data: { show_playback: m.show_playback !== false },
              schema: [this.booleanField('show_playback')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_playback: e.detail.value?.show_playback ?? true,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.time_machine.show_chart', lang, 'Line graph'),
              description: localize(
                'editor.time_machine.show_chart_desc',
                lang,
                'Card Timeline: plot numeric entities as lines across the window.'
              ),
              hass,
              data: { show_chart: m.show_chart !== false },
              schema: [this.booleanField('show_chart')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_chart: e.detail.value?.show_chart ?? true,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.time_machine.show_lanes', lang, 'State ribbons'),
              description: localize(
                'editor.time_machine.show_lanes_desc',
                lang,
                'Card Timeline: show on/off ribbons for non-numeric entities.'
              ),
              hass,
              data: { show_lanes: m.show_lanes !== false },
              schema: [this.booleanField('show_lanes')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_lanes: e.detail.value?.show_lanes ?? true,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.time_machine.show_details', lang, 'Entity details'),
              description: localize(
                'editor.time_machine.show_details_desc',
                lang,
                'Card Timeline: show the per-entity value list under the graph.'
              ),
              hass,
              data: { show_details: m.show_details !== false },
              schema: [this.booleanField('show_details')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_details: e.detail.value?.show_details ?? true,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderSliderField(
          localize('editor.time_machine.auto_return', lang, 'Auto-return to live'),
          localize(
            'editor.time_machine.auto_return_desc',
            lang,
            'Seconds of inactivity before snapping back to live. 0 disables auto-return.'
          ),
          m.auto_return_seconds ?? 120,
          120,
          0,
          600,
          10,
          (v: number) => {
            updateModule({ auto_return_seconds: v } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          's'
        )}
      </div>
    `;
  }

  // ── Preview ──────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    _config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as TimeMachineModule;
    const mode = this._mode(m);
    const lang = hass?.locale?.language || 'en';
    // Card Timeline is self-contained: register its own entity scope rather
    // than relying on the host card's dashboard-wide sync.
    if (mode === 'card') this._ensureSelfSync(m, hass);
    const snap = ucTimeMachineService.getSnapshot(m.id);
    const active = snap.scrubMs != null;
    const now = Date.now();
    const spanMs = snap.spanHours * MS_PER_HOUR;
    const windowStart = now - spanMs;
    const playheadPct = active ? ((snap.scrubMs! - windowStart) / spanMs) * 100 : 100;
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));

    const hidden = new Set(m.hidden_entities || []);
    const isVisible = (id: string) => !hidden.has(id);

    // Card Timeline: built-in graphs + state ribbons for the tracked entities
    const chartSeries =
      mode === 'card' && m.show_chart !== false
        ? ucTimeMachineService
            .getNumericSeries(m.id, windowStart, now)
            .filter(s => isVisible(s.entityId))
        : [];
    const stateLanes =
      mode === 'card' && m.show_lanes !== false
        ? ucTimeMachineService
            .getStateLanes(m.id, windowStart, now)
            .filter(l => isVisible(l.entityId))
        : [];

    const markers =
      m.show_event_markers !== false && snap.hasHistory
        ? ucTimeMachineService
            .getEventMarkers(m.id)
            .filter(ev => ev.t >= windowStart && ev.t <= now && isVisible(ev.entityId))
        : [];

    // Legend: only the color groups actually present on the track
    const presentGroups = new Map<string, { label: string; color: string }>();
    for (const ev of markers) {
      const g = this._markerGroup(ev.entityId);
      if (!presentGroups.has(g.key)) presentGroups.set(g.key, g);
    }

    return html`
      <div class="uc-time-machine ${active ? 'uc-tm-active' : ''}" style="${designStyles}">
        <div class="uc-tm-header">
          <div class="uc-tm-status">
            <span class="uc-tm-dot ${active ? 'past' : 'live'}"></span>
            <div class="uc-tm-time">
              <span class="uc-tm-clock">
                ${active
                  ? html`<span class="uc-tm-day">${this._formatDay(snap.scrubMs!, lang)}</span>
                      ${this._formatClock(snap.scrubMs!, hass)}`
                  : localize('editor.time_machine.live', lang, 'Live')}
              </span>
              <span class="uc-tm-delta">
                ${active
                  ? this._formatDelta(now - snap.scrubMs!, lang)
                  : snap.registered && snap.entityCount > 0
                    ? localize(
                        'editor.time_machine.tracking',
                        lang,
                        'Tracking {count} entities'
                      ).replace('{count}', String(snap.entityCount))
                    : localize('editor.time_machine.live_desc', lang, 'Showing current state')}
              </span>
            </div>
            ${snap.loading
              ? html`<ha-circular-progress indeterminate size="small"></ha-circular-progress>`
              : ''}
          </div>
          ${active
            ? html`
                <button
                  class="uc-tm-live-btn"
                  @click=${() => ucTimeMachineService.returnToLive(m.id)}
                >
                  <ha-icon icon="mdi:fast-forward"></ha-icon>
                  ${localize('editor.time_machine.return_to_live', lang, 'Return to live')}
                </button>
              `
            : ''}
        </div>

        ${mode === 'card'
          ? html`
              ${m.show_chart !== false
                ? this._renderChart(chartSeries, windowStart, spanMs, now, playheadPct, active)
                : ''}
              ${m.show_lanes !== false
                ? this._renderLanes(stateLanes, hass, windowStart, spanMs, playheadPct, active)
                : ''}
              ${m.show_details !== false ? this._renderDetails(m, hass, snap, now) : ''}
            `
          : ''}
        ${presentGroups.size > 0 && m.show_event_markers !== false
          ? html`
              <div class="uc-tm-legend">
                ${[...presentGroups.values()].map(
                  g => html`
                    <span class="uc-tm-legend-item">
                      <span class="uc-tm-legend-dot" style="background: ${g.color}"></span>
                      ${g.label}
                    </span>
                  `
                )}
              </div>
            `
          : ''}

        <div
          class="uc-tm-track"
          @pointerdown=${(e: PointerEvent) => this._onTrackPointerDown(e, m.id)}
          @pointermove=${(e: PointerEvent) => this._onTrackPointerMove(e, m.id)}
          @pointerup=${(e: PointerEvent) => this._onTrackPointerUp(e)}
          @pointercancel=${(e: PointerEvent) => this._onTrackPointerUp(e)}
        >
          ${this._renderTicks(snap.spanHours)}
          ${markers.map(ev => {
            const left = ((ev.t - windowStart) / spanMs) * 100;
            const friendly =
              hass?.states?.[ev.entityId]?.attributes?.friendly_name || ev.entityId;
            const group = this._markerGroup(ev.entityId);
            return html`
              <span
                class="uc-tm-marker"
                style="left: ${left}%; background: ${group.color}"
                title="${friendly}: ${ev.state} · ${this._formatTime(ev.t, hass)}"
              ></span>
            `;
          })}
          ${active
            ? html`<span class="uc-tm-shade" style="width: ${100 - playheadPct}%"></span>`
            : ''}
          <span class="uc-tm-playhead" style="left: ${playheadPct}%"></span>
          <span class="uc-tm-handle" style="left: ${playheadPct}%"></span>
        </div>

        <div class="uc-tm-axis">
          <span>${this._formatAxisLabel(snap.spanHours)}</span>
          <span>${localize('editor.time_machine.now', lang, 'Now')}</span>
        </div>

        <div class="uc-tm-controls">
          ${m.show_span_presets !== false
            ? html`
                <div class="uc-tm-spans">
                  ${SPAN_PRESETS.map(
                    p => html`
                      <button
                        class="uc-tm-span-btn ${snap.spanHours === p.hours ? 'selected' : ''}"
                        @click=${() => ucTimeMachineService.setSpan(m.id, p.hours)}
                      >
                        ${p.label}
                      </button>
                    `
                  )}
                </div>
              `
            : ''}
          ${m.show_playback !== false
            ? html`
                <div class="uc-tm-playback">
                  <button
                    class="uc-tm-step-btn"
                    title=${localize('editor.time_machine.step_back', lang, 'Step back')}
                    @click=${() => this._step(m.id, -MS_PER_HOUR, active)}
                  >
                    −1h
                  </button>
                  <button
                    class="uc-tm-step-btn"
                    title=${localize('editor.time_machine.step_back', lang, 'Step back')}
                    @click=${() => this._step(m.id, -15 * MS_PER_MINUTE, active)}
                  >
                    −15m
                  </button>
                  <button
                    class="uc-tm-step-btn uc-tm-play-btn"
                    title=${localize('editor.time_machine.replay', lang, 'Replay history')}
                    @click=${() => this._togglePlay(m.id, active, windowStart)}
                  >
                    <ha-icon icon=${snap.playing ? 'mdi:pause' : 'mdi:play'}></ha-icon>
                  </button>
                  <button
                    class="uc-tm-step-btn"
                    ?disabled=${!active}
                    title=${localize('editor.time_machine.step_forward', lang, 'Step forward')}
                    @click=${() => this._step(m.id, 15 * MS_PER_MINUTE, active)}
                  >
                    +15m
                  </button>
                  <button
                    class="uc-tm-step-btn"
                    ?disabled=${!active}
                    title=${localize('editor.time_machine.step_forward', lang, 'Step forward')}
                    @click=${() => this._step(m.id, MS_PER_HOUR, active)}
                  >
                    +1h
                  </button>
                </div>
              `
            : ''}
        </div>

        ${!snap.registered
          ? html`
              <div class="uc-tm-hint">
                ${localize(
                  'editor.time_machine.top_level_hint',
                  lang,
                  'Place Time Machine directly in a card column (not nested inside a layout module) to enable card-wide rewind.'
                )}
              </div>
            `
          : snap.entityCount === 0
            ? html`
                <div class="uc-tm-hint">
                  ${mode === 'card'
                    ? localize(
                        'editor.time_machine.no_entities_card_hint',
                        lang,
                        'Pick entities in the Time Machine settings to build a timeline with graphs and event markers.'
                      )
                    : localize(
                        'editor.time_machine.no_entities_hint',
                        lang,
                        'Nothing to rewind yet — no entities found in this view. Add Ultra Cards with entity modules, or pick extra entities in the Time Machine settings.'
                      )}
                </div>
              `
            : ''}
      </div>
    `;
  }

  // ── Pointer handling ─────────────────────────────────────────────────────────

  private _onTrackPointerDown(e: PointerEvent, moduleId: string): void {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
    this._scrubFromPointer(e, moduleId);
  }

  private _onTrackPointerMove(e: PointerEvent, moduleId: string): void {
    const el = e.currentTarget as HTMLElement;
    if (!el.hasPointerCapture(e.pointerId)) return;
    this._scrubFromPointer(e, moduleId);
  }

  private _onTrackPointerUp(e: PointerEvent): void {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  }

  private _scrubFromPointer(e: PointerEvent, moduleId: string): void {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const snap = ucTimeMachineService.getSnapshot(moduleId);
    const now = Date.now();
    const spanMs = snap.spanHours * MS_PER_HOUR;
    ucTimeMachineService.scrubTo(moduleId, frac >= 0.995 ? null : now - spanMs + frac * spanMs);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /** Normalize the mode (maps deprecated pre-release scope values). */
  private _mode(m: TimeMachineModule): 'dashboard' | 'card' {
    if (m.mode === 'card' || m.mode === 'dashboard') return m.mode;
    return m.scope === 'independent' ? 'card' : 'dashboard';
  }

  /**
   * Register a Card Timeline's own entity scope with the service. Card Timeline
   * is self-contained, so it must not depend on the host card's dashboard-wide
   * Time Machine wiring to fetch history.
   */
  private _ensureSelfSync(m: TimeMachineModule, hass: HomeAssistant): void {
    if (!hass) return;
    ucTimeMachineService.syncStandalone(m.id, hass, m as any);
  }

  /** SVG line chart of the tracked numeric entities across the window. */
  private _renderChart(
    series: UcTimeMachineSeries[],
    windowStart: number,
    spanMs: number,
    now: number,
    playheadPct: number,
    active: boolean
  ): TemplateResult | string {
    if (series.length === 0) {
      return html`
        <div class="uc-tm-chart-wrap uc-tm-chart-empty">
          <span class="uc-tm-chart-empty-msg">No numeric history to graph yet</span>
        </div>
      `;
    }
    const W = 1000;
    const H = 200;
    const strokeStyle =
      'vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round';

    const lines = series.map((s, i) => {
      // Per-series normalization so mixed units share the canvas
      const pad = (s.max - s.min) * 0.12 || 1;
      const lo = s.min - pad;
      const hi = s.max + pad;
      const range = hi - lo || 1;
      const pts = [...s.points];
      const last = pts[pts.length - 1];
      if (last.t < now) pts.push({ t: now, v: last.v });
      const coords = pts.map(p => {
        const x = Math.max(0, Math.min(W, ((p.t - windowStart) / spanMs) * W));
        const y = Math.max(0, Math.min(H, H - ((p.v - lo) / range) * H));
        return { x, y };
      });
      const lineD = coords
        .map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
        .join(' ');
      const first = coords[0];
      const end = coords[coords.length - 1];
      const areaD = `${lineD} L${end.x.toFixed(1)},${H} L${first.x.toFixed(1)},${H} Z`;
      return {
        lineD,
        areaD,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });

    return html`
      <div class="uc-tm-chart-wrap">
        ${svg`
          <svg
            class="uc-tm-chart"
            viewBox="0 0 ${W} ${H}"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line x1="0" y1="${H * 0.25}" x2="${W}" y2="${H * 0.25}" class="uc-tm-chart-grid"></line>
            <line x1="0" y1="${H * 0.5}" x2="${W}" y2="${H * 0.5}" class="uc-tm-chart-grid"></line>
            <line x1="0" y1="${H * 0.75}" x2="${W}" y2="${H * 0.75}" class="uc-tm-chart-grid"></line>
            ${lines.map(
              l => svg`
                <path d="${l.areaD}" fill="${l.color}" opacity="0.12"></path>
                <path
                  d="${l.lineD}"
                  fill="none"
                  stroke="${l.color}"
                  stroke-width="3"
                  style="${strokeStyle}"
                ></path>
              `
            )}
          </svg>
        `}
        <span class="uc-tm-chart-hi">${this._fmtNum(Math.max(...series.map(s => s.max)))}</span>
        <span class="uc-tm-chart-lo">${this._fmtNum(Math.min(...series.map(s => s.min)))}</span>
        ${active
          ? html`
              <span class="uc-tm-chart-shade" style="width: ${100 - playheadPct}%"></span>
              <span class="uc-tm-chart-playhead" style="left: ${playheadPct}%"></span>
            `
          : ''}
      </div>
    `;
  }

  /** State ribbons for entities that aren't graphable as numbers. */
  private _renderLanes(
    lanes: UcTimeMachineLane[],
    hass: HomeAssistant,
    windowStart: number,
    spanMs: number,
    playheadPct: number,
    active: boolean
  ): TemplateResult | string {
    if (lanes.length === 0) return '';
    return html`
      <div class="uc-tm-lanes">
        ${lanes.map(lane => {
          const friendly = hass?.states?.[lane.entityId]?.attributes?.friendly_name || lane.entityId;
          const color = this._markerGroup(lane.entityId).color;
          return html`
            <div class="uc-tm-lane" title="${friendly}">
              <span class="uc-tm-lane-name">${friendly}</span>
              <span class="uc-tm-lane-track">
                ${lane.segments.map(seg => {
                  const left = ((seg.startMs - windowStart) / spanMs) * 100;
                  const width = ((seg.endMs - seg.startMs) / spanMs) * 100;
                  const off = this._isOffState(seg.state);
                  return html`
                    <span
                      class="uc-tm-lane-seg ${off ? 'off' : ''}"
                      style="left: ${left}%; width: ${width}%; ${off
                        ? ''
                        : `background: ${color}`}"
                      title="${seg.state}"
                    ></span>
                  `;
                })}
                ${active
                  ? html`<span
                      class="uc-tm-lane-playhead"
                      style="left: ${playheadPct}%"
                    ></span>`
                  : ''}
              </span>
            </div>
          `;
        })}
      </div>
    `;
  }

  /** States drawn as an empty ribbon rather than a colored one. */
  private _isOffState(state: string): boolean {
    return (
      state === 'off' ||
      state === 'closed' ||
      state === 'locked' ||
      state === 'idle' ||
      state === 'unavailable' ||
      state === 'unknown' ||
      state === 'not_home'
    );
  }

  /** Per-entity value/state readouts that follow the playhead, with highs/lows. */
  private _renderDetails(
    m: TimeMachineModule,
    hass: HomeAssistant,
    snap: { scrubMs: number | null },
    now: number
  ): TemplateResult | string {
    const ids = ucTimeMachineService.getTrackedEntityIds(m.id);
    if (ids.length === 0) return '';
    // Full series (including hidden) so ranges stay available when re-enabled
    const windowStart = now - (ucTimeMachineService.getSnapshot(m.id).spanHours || 24) * MS_PER_HOUR;
    const allSeries = ucTimeMachineService.getNumericSeries(m.id, windowStart, now);
    const seriesById = new Map(allSeries.map((s, i) => [s.entityId, { ...s, index: i }]));
    const t = snap.scrubMs ?? now;

    return html`
      <div class="uc-tm-details">
        ${ids.map(entityId => {
          const live = hass?.states?.[entityId];
          const hp = ucTimeMachineService.stateAt(m.id, entityId, t);
          const name = live?.attributes?.friendly_name || entityId;
          const s = seriesById.get(entityId);
          const color = s
            ? CHART_COLORS[s.index % CHART_COLORS.length]
            : this._markerGroup(entityId).color;

          // Prefer the graphed field so the readout matches the plotted line
          // (a thermostat graphs current_temperature, not its "cool" state).
          const attribute = s?.attribute ?? null;
          const source = hp ?? (live as any) ?? null;
          const raw =
            attribute === null
              ? (source?.state ?? '—')
              : (source?.attributes?.[attribute] ?? source?.state ?? '—');
          const unit =
            (live?.attributes?.unit_of_measurement as string) ||
            (attribute && attribute.includes('temperature')
              ? (hass?.config as any)?.unit_system?.temperature || '°'
              : attribute && attribute.includes('humidity')
                ? '%'
                : '');
          const num = Number.parseFloat(String(raw));
          const display = Number.isFinite(num) ? `${this._fmtNum(num)}${unit}` : String(raw);
          const stateNote =
            attribute !== null && hp?.state && !Number.isFinite(Number.parseFloat(hp.state))
              ? hp.state
              : '';
          return html`
            <div class="uc-tm-detail">
              <span class="uc-tm-detail-dot" style="background: ${color}"></span>
              <span class="uc-tm-detail-name" title="${entityId}">${name}</span>
              ${stateNote ? html`<span class="uc-tm-detail-note">${stateNote}</span>` : ''}
              <span class="uc-tm-detail-value">${display}</span>
              ${s
                ? html`
                    <span class="uc-tm-detail-range">
                      ▼ ${this._fmtNum(s.min)} ▲ ${this._fmtNum(s.max)}
                    </span>
                  `
                : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _fmtNum(v: number): string {
    const rounded = Math.round(v * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  /** Step the scrub position; from live, a negative step starts time travel. */
  private _step(moduleId: string, deltaMs: number, active: boolean): void {
    if (active) {
      ucTimeMachineService.stepBy(moduleId, deltaMs);
    } else if (deltaMs < 0) {
      ucTimeMachineService.scrubTo(moduleId, Date.now() + deltaMs);
    }
  }

  /** Toggle replay; from live, start replaying from the beginning of the window. */
  private _togglePlay(moduleId: string, active: boolean, windowStart: number): void {
    if (!active) {
      ucTimeMachineService.scrubTo(moduleId, windowStart + 1000);
    }
    ucTimeMachineService.togglePlayback(moduleId);
  }

  private _markerGroup(entityId: string): { key: string; label: string; color: string } {
    const domain = entityId.split('.')[0];
    for (const g of MARKER_GROUPS) {
      if (g.domains.includes(domain)) return g;
    }
    return MARKER_OTHER;
  }

  private _formatDay(epochMs: number, lang: string): string {
    const d = new Date(epochMs);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return localize('editor.time_machine.today', lang, 'Today');
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return localize('editor.time_machine.yesterday', lang, 'Yesterday');
    }
    return d.toLocaleDateString(lang, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  private _formatClock(epochMs: number, hass: HomeAssistant): string {
    const lang = hass?.locale?.language || 'en';
    return new Date(epochMs).toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' });
  }

  private _formatTime(epochMs: number, hass: HomeAssistant): string {
    const d = new Date(epochMs);
    const lang = hass?.locale?.language || 'en';
    const sameDay = new Date().toDateString() === d.toDateString();
    const time = d.toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' });
    if (sameDay) return time;
    return `${d.toLocaleDateString(lang, { weekday: 'short' })} ${time}`;
  }

  private _formatDelta(deltaMs: number, lang: string): string {
    const mins = Math.max(1, Math.round(deltaMs / 60_000));
    const days = Math.floor(mins / 1440);
    const hours = Math.floor((mins % 1440) / 60);
    const remMins = mins % 60;
    let span: string;
    if (days > 0) span = `${days}d ${hours}h`;
    else if (hours > 0) span = `${hours}h ${remMins}m`;
    else span = `${remMins}m`;
    return localize('editor.time_machine.ago', lang, '{time} ago').replace('{time}', span);
  }

  private _formatAxisLabel(spanHours: number): string {
    return spanHours >= 24 ? `−${Math.round(spanHours / 24)}d` : `−${spanHours}h`;
  }

  private _renderTicks(spanHours: number): TemplateResult[] {
    const tickCount = spanHours >= 24 ? 12 : spanHours >= 6 ? spanHours : 4;
    const ticks: TemplateResult[] = [];
    for (let i = 1; i < tickCount; i++) {
      ticks.push(
        html`<span class="uc-tm-tick" style="left: ${(i / tickCount) * 100}%"></span>`
      );
    }
    return ticks;
  }

  // ── CSS ──────────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      .uc-time-machine {
        box-sizing: border-box;
        padding: 12px 16px;
        border-radius: 12px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        transition: border-color 0.2s ease;
      }
      .uc-time-machine.uc-tm-active {
        border-color: var(--primary-color);
      }
      .uc-tm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }
      .uc-tm-status {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .uc-tm-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .uc-tm-dot.live {
        background: var(--success-color, #4caf50);
        animation: uc-tm-pulse 2s ease-in-out infinite;
      }
      .uc-tm-dot.past {
        background: var(--primary-color);
      }
      @keyframes uc-tm-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      .uc-tm-time {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .uc-tm-clock {
        font-size: 18px;
        font-weight: 700;
        color: var(--primary-text-color);
        line-height: 1.2;
        white-space: nowrap;
      }
      .uc-time-machine.uc-tm-active .uc-tm-clock {
        color: var(--primary-color);
        font-size: 20px;
      }
      .uc-tm-day {
        margin-right: 6px;
      }
      .uc-tm-chart-wrap {
        position: relative;
        height: 120px;
        margin-bottom: 10px;
        border-radius: 8px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        overflow: hidden;
      }
      .uc-tm-chart-empty {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .uc-tm-chart-empty-msg {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .uc-tm-chart {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .uc-tm-chart-grid {
        stroke: var(--divider-color);
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
        opacity: 0.6;
      }
      .uc-tm-chart-shade {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        background: var(--card-background-color);
        opacity: 0.55;
        pointer-events: none;
      }
      .uc-tm-chart-playhead {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        margin-left: -1px;
        background: var(--primary-color);
        pointer-events: none;
      }
      .uc-tm-chart-hi,
      .uc-tm-chart-lo {
        position: absolute;
        left: 6px;
        font-size: 9px;
        color: var(--secondary-text-color);
        opacity: 0.9;
        pointer-events: none;
      }
      .uc-tm-chart-hi {
        top: 3px;
      }
      .uc-tm-chart-lo {
        bottom: 3px;
      }
      .uc-tm-lanes {
        display: flex;
        flex-direction: column;
        gap: 3px;
        margin-bottom: 10px;
      }
      .uc-tm-lane {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .uc-tm-lane-name {
        flex: 0 0 34%;
        max-width: 34%;
        font-size: 11px;
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .uc-tm-lane-track {
        position: relative;
        flex: 1;
        height: 12px;
        border-radius: 3px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        overflow: hidden;
      }
      .uc-tm-lane-seg {
        position: absolute;
        top: 0;
        bottom: 0;
        opacity: 0.85;
      }
      .uc-tm-lane-seg.off {
        background: transparent;
      }
      .uc-tm-lane-playhead {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        margin-left: -1px;
        background: var(--primary-color);
      }
      .uc-tm-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 10px;
      }
      .uc-tm-detail-note {
        font-size: 10px;
        padding: 1px 6px;
        border-radius: 8px;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .uc-tm-detail {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        line-height: 1.4;
        min-width: 0;
      }
      .uc-tm-detail-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .uc-tm-detail-name {
        color: var(--secondary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        min-width: 0;
      }
      .uc-tm-detail-value {
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
      }
      .uc-tm-detail-range {
        font-size: 10px;
        color: var(--secondary-text-color);
        opacity: 0.85;
        white-space: nowrap;
      }
      .uc-tm-legend {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 8px;
      }
      .uc-tm-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .uc-tm-legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .uc-tm-delta {
        font-size: 11px;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .uc-tm-live-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border: none;
        border-radius: 16px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 12px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .uc-tm-live-btn ha-icon {
        --mdc-icon-size: 15px;
      }
      .uc-tm-track {
        position: relative;
        height: 40px;
        border-radius: 8px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        cursor: ew-resize;
        touch-action: none;
        user-select: none;
        overflow: visible;
      }
      .uc-tm-tick {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--divider-color);
        pointer-events: none;
      }
      .uc-tm-marker {
        position: absolute;
        top: 7px;
        bottom: 7px;
        width: 2px;
        border-radius: 1px;
        background: var(--accent-color, var(--warning-color, #ff9800));
        opacity: 0.8;
        pointer-events: none;
      }
      .uc-tm-shade {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        background: var(--primary-color);
        opacity: 0.08;
        border-radius: 0 8px 8px 0;
        pointer-events: none;
      }
      .uc-tm-playhead {
        position: absolute;
        top: -3px;
        bottom: -3px;
        width: 2px;
        margin-left: -1px;
        background: var(--primary-color);
        pointer-events: none;
      }
      .uc-tm-handle {
        position: absolute;
        top: -8px;
        width: 14px;
        height: 14px;
        margin-left: -7px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 2px solid var(--card-background-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        pointer-events: none;
      }
      .uc-tm-axis {
        display: flex;
        justify-content: space-between;
        margin-top: 6px;
        font-size: 10px;
        color: var(--secondary-text-color);
        opacity: 0.8;
      }
      .uc-tm-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .uc-tm-spans {
        display: flex;
        gap: 4px;
      }
      .uc-tm-span-btn {
        padding: 4px 10px;
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 11px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
      }
      .uc-tm-span-btn.selected {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .uc-tm-playback {
        display: flex;
        gap: 4px;
      }
      .uc-tm-step-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 34px;
        height: 26px;
        padding: 0 8px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        background: transparent;
        color: var(--primary-text-color);
        font-size: 11px;
        font-weight: 600;
        font-family: inherit;
        white-space: nowrap;
        cursor: pointer;
      }
      .uc-tm-step-btn ha-icon {
        --mdc-icon-size: 16px;
      }
      .uc-tm-step-btn:disabled {
        opacity: 0.35;
        cursor: default;
      }
      .uc-tm-play-btn:not(:disabled) {
        color: var(--primary-color);
      }
      .uc-tm-hint {
        margin-top: 8px;
        font-size: 11px;
        color: var(--warning-color, #ff9800);
        line-height: 1.4;
      }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}

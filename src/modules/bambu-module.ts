/**
 * Bambu Lab (Pro) — auto-discovers ha-bambulab printers and renders
 * printer / dashboard / camera / farm / compact views.
 */

import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  UltraCardConfig,
  BambuModule,
  BambuViewMode,
  BambuAmsLayout,
  PrinterCameraMode,
} from '../types';
import { localize } from '../localize/localize';
import { hasProAccess, renderProLockUI, renderProLockedPreview } from '../utils/uc-pro-access';
import {
  discoverBambuPrinters,
  forgetBambuTopology,
  bambuSnapshot,
  orderPrinters,
  bambuSetupHints,
  type BambuPrinter,
  type BambuTopology,
} from '../services/uc-bambu-service';
import { BAMBU_STYLES } from './bambu/styles';
import {
  renderPrinterView,
  renderDashboardView,
  renderCameraView,
  renderFarmView,
  renderCompactView,
  type BambuViewContext,
} from './bambu/views';

export class UltraBambuModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'bambu',
    title: 'Bambu Lab',
    description: 'Live Bambu Lab printer card with AMS, camera, controls, and farm view',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:printer-3d-nozzle',
    category: 'data',
    tags: [
      'pro',
      'premium',
      'bambu',
      'bambu lab',
      '3d printer',
      'ams',
      'x1c',
      'p1s',
      'a1',
      'print',
    ],
  };

  private _discoveredIds = new Map<string, string[]>();
  private _orderDragIndex = new Map<string, number>();

  createDefault(id?: string, _hass?: HomeAssistant): BambuModule {
    return {
      id: id || this.generateId('bambu'),
      type: 'bambu',
      view: 'printer',
      printer_order: [],
      hidden_printer_ids: [],
      show_title: true,
      title: 'Bambu Lab',
      style: 'dark',
      animation_intensity: 'full',
      show_ams: true,
      ams_layout: 'stacked',
      ams_order: [],
      hidden_ams_ids: [],
      show_camera: true,
      show_controls: true,
      show_temps: true,
      show_fans: true,
      show_print_details: true,
      show_hms: true,
      show_speed: true,
      show_job: true,
      show_thumbnail: true,
      camera_mode: 'snapshot',
      camera_refresh_seconds: 10,
      setup_dismissed: false,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as BambuModule;
    return this._discoveredIds.get(m.id) || [];
  }

  destroy(moduleId?: string): void {
    if (moduleId) {
      forgetBambuTopology(moduleId);
      this._discoveredIds.delete(moduleId);
      this._orderDragIndex.delete(`${moduleId}:farm`);
      this._orderDragIndex.delete(`${moduleId}:ams`);
    }
  }

  private _topology(m: BambuModule, hass: HomeAssistant): BambuTopology {
    const topo = discoverBambuPrinters(hass, m.id);
    this._discoveredIds.set(m.id, topo.allEntityIds);
    return topo;
  }

  private _selectedPrinter(
    m: BambuModule,
    topo: BambuTopology
  ): BambuPrinter | undefined {
    const visible = orderPrinters(topo.printers, m.printer_order, m.hidden_printer_ids);
    if (m.printer_device_id) {
      return visible.find(p => p.deviceId === m.printer_device_id) || visible[0];
    }
    return visible[0];
  }

  private _callService(
    hass: HomeAssistant,
    domain: string,
    service: string,
    data: Record<string, unknown>
  ): void {
    try {
      hass.callService(domain, service, data);
    } catch {
      /* ignore */
    }
  }

  // ── Editor ──────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    _config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as BambuModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.bambu.pro_description',
          lang,
          'Bambu Lab builds a live printer card with AMS trays, temperatures, fans, camera, and farm view from the ha-bambulab integration.'
        )
      );
    }

    const topo = this._topology(m, hass);
    const printers = orderPrinters(topo.printers, m.printer_order, m.hidden_printer_ids);
    const selected = this._selectedPrinter(m, topo);
    const hints =
      m.setup_dismissed === true ? [] : bambuSetupHints(topo, hass, selected);
    const view = m.view || 'printer';

    const printerSegments = [
      {
        value: '',
        label: localize('editor.bambu.printer_auto', lang, 'First found'),
        icon: 'mdi:printer-3d',
      },
      ...topo.printers.map(p => ({
        value: p.deviceId,
        label: p.name,
        icon: 'mdi:printer-3d-nozzle',
      })),
    ];

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings">
        ${hints.length
          ? html`<div class="uc-bambu-setup ${hints[0]!.severity}">
              ${hints.map(h => html`<div>${h.message}</div>`)}
              <div class="hint-actions">
                <button
                  type="button"
                  @click=${() => {
                    updateModule({ setup_dismissed: true });
                    this.triggerPreviewUpdate();
                  }}
                >
                  ${localize('editor.bambu.wizard_dismiss', lang, 'Dismiss')}
                </button>
              </div>
            </div>`
          : nothing}

        ${this.renderSegmentedField(
          localize('editor.bambu.view', lang, 'View'),
          localize(
            'editor.bambu.view_desc',
            lang,
            'Printer is the hero illustration. Dashboard, camera, farm and compact cover the rest.'
          ),
          view,
          [
            {
              value: 'printer',
              label: localize('editor.bambu.view_printer', lang, 'Printer'),
              icon: 'mdi:printer-3d',
            },
            {
              value: 'dashboard',
              label: localize('editor.bambu.view_dashboard', lang, 'Dashboard'),
              icon: 'mdi:view-dashboard',
            },
            {
              value: 'camera',
              label: localize('editor.bambu.view_camera', lang, 'Camera'),
              icon: 'mdi:cctv',
            },
            {
              value: 'farm',
              label: localize('editor.bambu.view_farm', lang, 'Farm'),
              icon: 'mdi:view-grid',
            },
            {
              value: 'compact',
              label: localize('editor.bambu.view_compact', lang, 'Compact'),
              icon: 'mdi:view-compact',
            },
          ],
          next => {
            updateModule({ view: next as BambuViewMode });
            this.triggerPreviewUpdate();
          },
          3
        )}

        ${view !== 'farm'
          ? this.renderSegmentedField(
              localize('editor.bambu.printer', lang, 'Printer'),
              localize(
                'editor.bambu.printer_desc',
                lang,
                'Which discovered Bambu printer to show (Farm uses all).'
              ),
              m.printer_device_id || '',
              printerSegments,
              next => {
                updateModule({
                  printer_device_id: next || undefined,
                });
                this.triggerPreviewUpdate();
              }
            )
          : nothing}

        <div
          style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:8px;background:rgba(var(--rgb-primary-color),0.08);margin:8px 0 24px;"
        >
          <ha-icon icon="mdi:printer-3d-nozzle" style="color:var(--primary-color);"></ha-icon>
          <span style="font-size:0.85rem;">
            ${localize(
              'editor.bambu.found_printers',
              lang,
              'Found {count} Bambu printers'
            ).replace('{count}', String(topo.printers.length))}
          </span>
        </div>

        ${this.renderSettingsSection(
          localize('editor.bambu.title', lang, 'Title'),
          localize('editor.bambu.title_desc', lang, 'Optional heading text.'),
          [
            {
              title: localize('editor.bambu.show_title', lang, 'Show title'),
              description: '',
              hass,
              data: { show_title: m.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_title: e.detail.value?.show_title !== false });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.bambu.title', lang, 'Title'),
              description: '',
              hass,
              data: { title: m.title || '' },
              schema: [this.textField('title')],
              onChange: (e: CustomEvent) => {
                updateModule({ title: e.detail.value?.title || '' });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}

        ${this.renderSegmentedField(
          localize('editor.bambu.style', lang, 'Style'),
          localize('editor.bambu.style_desc', lang, 'Visual theme for surfaces and borders.'),
          m.style || 'dark',
          [
            { value: 'theme', label: localize('editor.bambu.style_theme', lang, 'Theme') },
            { value: 'dark', label: localize('editor.bambu.style_dark', lang, 'Dark') },
            { value: 'light', label: localize('editor.bambu.style_light', lang, 'Light') },
            { value: 'glass', label: localize('editor.bambu.style_glass', lang, 'Glass') },
            { value: 'carbon', label: localize('editor.bambu.style_carbon', lang, 'Carbon') },
          ],
          next => {
            updateModule({ style: next as BambuModule['style'] });
            this.triggerPreviewUpdate();
          }
        )}

        ${this.renderSegmentedField(
          localize('editor.bambu.animation', lang, 'Animation'),
          localize(
            'editor.bambu.animation_desc',
            lang,
            'Fan spin, heating glow, and progress motion. Respects prefers-reduced-motion.'
          ),
          m.animation_intensity || 'full',
          [
            { value: 'off', label: localize('editor.bambu.anim_off', lang, 'Off') },
            { value: 'subtle', label: localize('editor.bambu.anim_subtle', lang, 'Subtle') },
            { value: 'full', label: localize('editor.bambu.anim_full', lang, 'Full') },
          ],
          next => {
            updateModule({
              animation_intensity: next as BambuModule['animation_intensity'],
            });
            this.triggerPreviewUpdate();
          }
        )}

        ${this.renderColorField(
          localize('editor.bambu.accent_color', lang, 'Accent'),
          localize('editor.bambu.accent_color_desc', lang, 'Highlights and progress accents.'),
          hass,
          m.accent_color || '',
          '',
          (v: string) => {
            updateModule({ accent_color: v || undefined });
            this.triggerPreviewUpdate();
          }
        )}

        ${this.renderFileField(
          localize('editor.bambu.custom_image', lang, 'Custom printer image'),
          localize(
            'editor.bambu.custom_image_desc',
            lang,
            'Optional photo override. Hotspot overlays stay in place.'
          ),
          hass,
          m.custom_image || '',
          (v: string) => {
            updateModule({ custom_image: v || undefined });
            this.triggerPreviewUpdate();
          },
          'image/*'
        )}

        ${this.renderSettingsSection(
          localize('editor.bambu.sections', lang, 'Sections'),
          localize(
            'editor.bambu.sections_desc',
            lang,
            'Toggle which blocks appear in the selected view.'
          ),
          [
            {
              title: localize('editor.bambu.show_ams', lang, 'AMS trays'),
              description: '',
              hass,
              data: { show_ams: m.show_ams !== false },
              schema: [this.booleanField('show_ams')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_ams: e.detail.value?.show_ams !== false });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.bambu.show_temps', lang, 'Temperatures'),
              description: '',
              hass,
              data: { show_temps: m.show_temps !== false },
              schema: [this.booleanField('show_temps')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_temps: e.detail.value?.show_temps !== false });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.bambu.show_fans', lang, 'Fans'),
              description: '',
              hass,
              data: { show_fans: m.show_fans !== false },
              schema: [this.booleanField('show_fans')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_fans: e.detail.value?.show_fans !== false });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.bambu.show_controls', lang, 'Controls'),
              description: '',
              hass,
              data: { show_controls: m.show_controls !== false },
              schema: [this.booleanField('show_controls')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_controls: e.detail.value?.show_controls !== false });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.bambu.show_camera', lang, 'Camera'),
              description: '',
              hass,
              data: { show_camera: m.show_camera !== false },
              schema: [this.booleanField('show_camera')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_camera: e.detail.value?.show_camera !== false });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.bambu.show_print_details', lang, 'Print details'),
              description: '',
              hass,
              data: { show_print_details: m.show_print_details !== false },
              schema: [this.booleanField('show_print_details')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_print_details: e.detail.value?.show_print_details !== false,
                });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.bambu.show_speed', lang, 'Speed profiles'),
              description: '',
              hass,
              data: { show_speed: m.show_speed !== false },
              schema: [this.booleanField('show_speed')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_speed: e.detail.value?.show_speed !== false });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.bambu.show_job', lang, 'Print job'),
              description: localize(
                'editor.bambu.show_job_desc',
                lang,
                'File name, layer, and time remaining.'
              ),
              hass,
              data: { show_job: m.show_job !== false },
              schema: [this.booleanField('show_job')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_job: e.detail.value?.show_job !== false });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.bambu.show_thumbnail', lang, 'Cover thumbnail'),
              description: localize(
                'editor.bambu.show_thumbnail_desc',
                lang,
                'Cover image inside the print job block.'
              ),
              hass,
              data: { show_thumbnail: m.show_thumbnail !== false },
              schema: [this.booleanField('show_thumbnail')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_thumbnail: e.detail.value?.show_thumbnail !== false });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}

        ${this.renderSegmentedField(
          localize('editor.bambu.camera_mode', lang, 'Camera mode'),
          localize(
            'editor.bambu.camera_mode_desc',
            lang,
            'Snapshots poll a still image (low data). Live streams the camera like Home Assistant does.'
          ),
          m.camera_mode || 'snapshot',
          [
            {
              value: 'snapshot',
              label: localize('editor.bambu.camera_mode_snapshot', lang, 'Snapshots'),
              icon: 'mdi:image-multiple-outline',
            },
            {
              value: 'live',
              label: localize('editor.bambu.camera_mode_live', lang, 'Live'),
              icon: 'mdi:video-outline',
            },
          ],
          next => {
            updateModule({ camera_mode: next as PrinterCameraMode });
            this.triggerPreviewUpdate();
          },
          2
        )}

        ${(m.camera_mode || 'snapshot') === 'snapshot'
          ? this.renderSliderField(
              localize('editor.bambu.camera_refresh', lang, 'Camera refresh (s)'),
              localize(
                'editor.bambu.camera_refresh_desc',
                lang,
                'How often to refresh camera snapshots.'
              ),
              m.camera_refresh_seconds ?? 10,
              10,
              1,
              60,
              1,
              (v: number) => {
                updateModule({ camera_refresh_seconds: v });
                this.triggerPreviewUpdate();
              },
              's'
            )
          : nothing}

        ${view === 'farm' ? this._renderFarmOrder(m, topo, hass, lang, updateModule) : nothing}
        ${m.show_ams !== false ? this._renderAmsSettings(m, topo, hass, lang, updateModule) : nothing}
      </div>
    `;
  }

  private _renderFarmOrder(
    m: BambuModule,
    topo: BambuTopology,
    _hass: HomeAssistant,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return this._renderOrderList({
      moduleId: m.id,
      dragKey: 'farm',
      title: localize('editor.bambu.farm_order', lang, 'Farm order'),
      description: localize(
        'editor.bambu.farm_order_desc',
        lang,
        'Drag to reorder printers in the farm grid. Hide ones you do not want.'
      ),
      items: topo.printers.map(p => ({ id: p.deviceId, name: p.name, detail: p.model })),
      order: m.printer_order || [],
      hidden: m.hidden_printer_ids || [],
      onOrder: next => updateModule({ printer_order: next }),
      onHidden: next => updateModule({ hidden_printer_ids: next }),
    });
  }

  /** AMS layout + per-unit order/hide for the selected printer. */
  private _renderAmsSettings(
    m: BambuModule,
    topo: BambuTopology,
    _hass: HomeAssistant,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult | typeof nothing {
    const printer = this._selectedPrinter(m, topo);
    const units = printer ? [...printer.amsUnits, ...printer.externalSpools] : [];
    if (!units.length) return nothing;

    return html`
      ${units.length > 1
        ? this.renderSegmentedField(
            localize('editor.bambu.ams_layout', lang, 'AMS layout'),
            localize(
              'editor.bambu.ams_layout_desc',
              lang,
              'How several AMS / external spool units are arranged.'
            ),
            m.ams_layout || 'stacked',
            [
              {
                value: 'stacked',
                label: localize('editor.bambu.ams_layout_stacked', lang, 'Stacked'),
                icon: 'mdi:view-sequential',
              },
              {
                value: 'grid',
                label: localize('editor.bambu.ams_layout_grid', lang, 'Grid'),
                icon: 'mdi:view-grid',
              },
              {
                value: 'strip',
                label: localize('editor.bambu.ams_layout_strip', lang, 'Spools only'),
                icon: 'mdi:dots-horizontal-circle-outline',
              },
            ],
            next => {
              updateModule({ ams_layout: next as BambuAmsLayout });
              this.triggerPreviewUpdate();
            },
            3
          )
        : nothing}
      ${this._renderOrderList({
        moduleId: m.id,
        dragKey: 'ams',
        title: localize('editor.bambu.ams_units', lang, 'AMS units'),
        description: localize(
          'editor.bambu.ams_units_desc',
          lang,
          'Drag to reorder AMS and external spool units. Hide ones you do not want.'
        ),
        items: units.map(u => ({
          id: u.deviceId,
          name: u.name,
          detail: `${u.model} · ${u.trays.length} ${u.trays.length === 1 ? 'slot' : 'slots'}`,
        })),
        order: m.ams_order || [],
        hidden: m.hidden_ams_ids || [],
        onOrder: next => updateModule({ ams_order: next }),
        onHidden: next => updateModule({ hidden_ams_ids: next }),
      })}
    `;
  }

  /** Drag-to-reorder + show/hide list shared by farm printers and AMS units. */
  private _renderOrderList(opts: {
    moduleId: string;
    dragKey: string;
    title: string;
    description: string;
    items: Array<{ id: string; name: string; detail?: string | undefined }>;
    order: string[];
    hidden: string[];
    onOrder: (next: string[]) => void;
    onHidden: (next: string[]) => void;
  }): TemplateResult {
    const order = opts.order.length ? opts.order : opts.items.map(i => i.id);
    const hidden = new Set(opts.hidden);
    const byId = new Map(opts.items.map(i => [i.id, i]));
    const dragId = `${opts.moduleId}:${opts.dragKey}`;

    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
        >
          ${opts.title}
        </div>
        <div style="font-size:0.85rem;opacity:0.75;margin-bottom:12px;">${opts.description}</div>
        ${order.map((id, index) => {
          const item = byId.get(id);
          if (!item) return nothing;
          const isHidden = hidden.has(id);
          return html`
            <div
              style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;background:var(--uc-pane-bg, var(--card-background-color));margin-bottom:6px;opacity:${isHidden
                ? '0.45'
                : '1'};"
              draggable="true"
              @dragstart=${() => this._orderDragIndex.set(dragId, index)}
              @dragover=${(e: DragEvent) => e.preventDefault()}
              @drop=${() => {
                const from = this._orderDragIndex.get(dragId);
                if (from == null || from === index) return;
                const next = [...order];
                const [moved] = next.splice(from, 1);
                if (!moved) return;
                next.splice(index, 0, moved);
                opts.onOrder(next);
                this.triggerPreviewUpdate();
              }}
            >
              <ha-icon icon="mdi:drag" style="opacity:0.5;"></ha-icon>
              <span style="flex:1;font-weight:600;">${item.name}</span>
              ${item.detail
                ? html`<span style="font-size:0.75rem;opacity:0.65;">${item.detail}</span>`
                : nothing}
              <button
                type="button"
                style="border:none;background:transparent;color:var(--primary-color);cursor:pointer;"
                @click=${() => {
                  const nextHidden = new Set(hidden);
                  if (isHidden) nextHidden.delete(id);
                  else nextHidden.add(id);
                  opts.onHidden([...nextHidden]);
                  this.triggerPreviewUpdate();
                }}
              >
                ${isHidden ? 'Show' : 'Hide'}
              </button>
            </div>
          `;
        })}
        ${opts.items
          .filter(i => !order.includes(i.id))
          .map(
            i => html`
              <div style="padding:6px 8px;font-size:0.85rem;">
                ${i.name}
                <button
                  type="button"
                  style="margin-left:8px;border:none;background:transparent;color:var(--primary-color);cursor:pointer;"
                  @click=${() => {
                    opts.onOrder([...order, i.id]);
                    this.triggerPreviewUpdate();
                  }}
                >
                  Add
                </button>
              </div>
            `
          )}
      </div>
    `;
  }

  // ── Preview ─────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    _config?: UltraCardConfig,
    _previewContext?: unknown
  ): TemplateResult {
    const m = module as BambuModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockedPreview(
        lang,
        localize('editor.bambu.title_default', lang, 'Bambu Lab')
      );
    }

    const topo = this._topology(m, hass);
    const style = m.style || 'dark';
    const anim = m.animation_intensity || 'full';
    const textStyle = [
      m.text_color ? `color:${m.text_color}` : '',
      m.accent_color ? `--primary-color:${m.accent_color}` : '',
    ]
      .filter(Boolean)
      .join(';');

    if (!topo.printers.length) {
      return html`
        <div
          class="uc-printer-root uc-bambu-root style-${style} anim-${anim}"
          data-uc-role="pane"
          style=${textStyle}
        >
          <div class="uc-bambu-empty">
            ${localize(
              'editor.bambu.empty',
              lang,
              'No Bambu Lab printers discovered. Install greghesp/ha-bambulab, then reload this card.'
            )}
          </div>
        </div>
      `;
    }

    const view = m.view || 'printer';
    let body: TemplateResult;

    if (view === 'farm') {
      const items = orderPrinters(topo.printers, m.printer_order, m.hidden_printer_ids).map(p => ({
        printer: p,
        snap: bambuSnapshot(p, hass),
      }));
      body = renderFarmView(m, hass, items, deviceId => {
        // Switching farm tile focuses printer view for that device via more-info on progress entity if any
        const p = topo.printers.find(x => x.deviceId === deviceId);
        if (!p) return;
        const snap = bambuSnapshot(p, hass);
        const eid =
          snap.controls.pauseEntityId ||
          snap.cameraEntityId ||
          Object.keys(p.entities)[0];
        if (eid) {
          document.body.dispatchEvent(
            new CustomEvent('hass-more-info', {
              bubbles: true,
              composed: true,
              detail: { entityId: eid },
            })
          );
        }
      });
    } else {
      const printer = this._selectedPrinter(m, topo);
      if (!printer) {
        body = html`<div class="uc-bambu-empty">No printer selected.</div>`;
      } else {
        const snap = bambuSnapshot(printer, hass);
        const ctx: BambuViewContext = { module: m, hass, printer, snap };
        switch (view) {
          case 'dashboard':
            body = renderDashboardView(ctx);
            break;
          case 'camera':
            body = renderCameraView(ctx);
            break;
          case 'compact':
            body = renderCompactView(ctx);
            break;
          case 'printer':
          default:
            body = renderPrinterView(ctx);
            break;
        }
      }
    }

    return html`
      <div
        class="uc-printer-root uc-bambu-root style-${style} anim-${anim}"
        data-uc-role="pane"
        style=${textStyle}
      >
        ${m.show_title !== false && m.title && view !== 'farm'
          ? html`<div class="uc-printer-header">
              <div class="title">${m.title}</div>
            </div>`
          : nothing}
        ${body}
      </div>
    `;
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      ${BAMBU_STYLES}
    `;
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    return base;
  }
}

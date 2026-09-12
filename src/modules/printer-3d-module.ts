/**
 * Free generic 3D Printer module — manual entity mapping with
 * OctoPrint / Moonraker / PrusaLink auto-fill.
 */

import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  UltraCardConfig,
  Printer3dModule,
  Printer3dLayout,
  PrinterCameraMode,
} from '../types';
import { localize } from '../localize/localize';
import {
  PrinterSnapshot,
  emptySnapshot,
  normalizeStatus,
  parseNumber,
  parseRemainingMinutes,
  formatEta,
  fireMoreInfo,
} from './printer-shared/printer-state';
import { PRINTER_SHARED_STYLES } from './printer-shared/styles';
import {
  renderStatusPill,
  renderProgressBar,
  renderProgressRing,
  renderTempChip,
  renderControlsRow,
  renderFanRow,
  renderPrintJob,
  renderDetailsList,
  renderCameraFeed,
  renderStatTile,
  type ControlHandlers,
} from './printer-shared/widgets';
import {
  renderPrinterWithHotspots,
} from './bambu/illustrations';
import { callEntityService } from './bambu/controls';
import {
  listAutofillDevices,
  autofillFromDevice,
  applyAutofillToModule,
} from '../services/uc-printer-autofill';

function stateRaw(hass: HomeAssistant, entityId?: string): string | null {
  if (!entityId) return null;
  const st = hass.states[entityId];
  if (!st || st.state === 'unavailable' || st.state === 'unknown') return null;
  return st.state;
}

function numFrom(hass: HomeAssistant, entityId?: string): number | null {
  return parseNumber(stateRaw(hass, entityId));
}

function buildSnapshot(m: Printer3dModule, hass: HomeAssistant): PrinterSnapshot {
  const statusRaw = stateRaw(hass, m.status_entity);
  const online = statusRaw != null;
  const remainingEid = m.remaining_time_entity;
  const remainingUnit = remainingEid
    ? String(hass.states[remainingEid]?.attributes?.unit_of_measurement || '')
    : '';

  const fans = (m.fans || [])
    .filter(f => f.entity)
    .map(f => {
      const st = hass.states[f.entity];
      // fan.* exposes percentage; switches/binary sensors report on/off;
      // sensors report a number (optionally with a % suffix).
      const pct =
        parseNumber(st?.attributes?.percentage) ??
        (st?.state === 'off'
          ? 0
          : st?.state === 'on'
            ? 100
            : parseNumber(st?.state));
      return {
        id: f.entity,
        label: f.label || f.entity.split('.').pop() || 'Fan',
        percent: pct,
        entityId: f.entity,
        controllable: f.entity.startsWith('fan.'),
      };
    });

  const extraStats = (m.extra_stats || [])
    .filter(s => s.entity)
    .map(s => {
      const st = hass.states[s.entity];
      const unit = st?.attributes?.unit_of_measurement
        ? ` ${st.attributes.unit_of_measurement}`
        : '';
      const row: { label: string; value: string; icon?: string; entityId?: string } = {
        label: s.label || s.entity.split('.').pop() || 'Stat',
        value: st ? `${st.state}${unit}` : '—',
        entityId: s.entity,
      };
      if (s.icon) row.icon = s.icon;
      return row;
    });

  const entityIds = [
    m.status_entity,
    m.progress_entity,
    m.nozzle_temp_entity,
    m.nozzle_target_entity,
    m.bed_temp_entity,
    m.bed_target_entity,
    m.chamber_temp_entity,
    m.remaining_time_entity,
    m.end_time_entity,
    m.current_layer_entity,
    m.total_layers_entity,
    m.file_name_entity,
    m.camera_entity,
    m.thumbnail_entity,
    m.pause_entity,
    m.resume_entity,
    m.stop_entity,
    m.light_entity,
    ...(m.fans || []).map(f => f.entity),
    ...(m.extra_stats || []).map(s => s.entity),
  ].filter(Boolean) as string[];

  const lightState = stateRaw(hass, m.light_entity);

  return {
    id: m.id,
    name: m.title || '3D Printer',
    modelFamily:
      m.illustration === 'bedslinger'
        ? 'bedslinger'
        : m.illustration === 'enclosed'
          ? 'enclosed_corexy'
          : 'generic',
    online,
    status: normalizeStatus(statusRaw, online),
    statusRaw: statusRaw || undefined,
    progress: numFrom(hass, m.progress_entity),
    currentLayer: numFrom(hass, m.current_layer_entity),
    totalLayers: numFrom(hass, m.total_layers_entity),
    remainingMinutes: parseRemainingMinutes(stateRaw(hass, remainingEid), remainingUnit),
    endTime: stateRaw(hass, m.end_time_entity) || undefined,
    taskName: stateRaw(hass, m.file_name_entity) || undefined,
    fileName: stateRaw(hass, m.file_name_entity) || undefined,
    nozzleTemp: numFrom(hass, m.nozzle_temp_entity),
    nozzleTarget: numFrom(hass, m.nozzle_target_entity),
    bedTemp: numFrom(hass, m.bed_temp_entity),
    bedTarget: numFrom(hass, m.bed_target_entity),
    chamberTemp: numFrom(hass, m.chamber_temp_entity),
    chamberTarget: null,
    fans,
    trays: [],
    externalSpools: [],
    hms: [],
    cameraEntityId: m.camera_entity,
    coverImageEntityId: m.thumbnail_entity,
    lightOn: lightState === 'on',
    controls: {
      pauseEntityId: m.pause_entity,
      resumeEntityId: m.resume_entity,
      stopEntityId: m.stop_entity,
      lightEntityId: m.light_entity,
    },
    refs: {
      status: m.status_entity,
      progress: m.progress_entity,
      nozzleTemp: m.nozzle_temp_entity,
      bedTemp: m.bed_temp_entity,
      chamberTemp: m.chamber_temp_entity,
      remaining: m.remaining_time_entity,
      endTime: m.end_time_entity,
      taskName: m.file_name_entity,
      layer: m.current_layer_entity,
      camera: m.camera_entity,
      light: m.light_entity,
    },
    entityIds,
    extraStats,
  };
}

function handlersFor(hass: HomeAssistant, snap: PrinterSnapshot): ControlHandlers {
  return {
    onPause: () => callEntityService(hass, snap.controls.pauseEntityId),
    onResume: () => callEntityService(hass, snap.controls.resumeEntityId),
    onStop: () => callEntityService(hass, snap.controls.stopEntityId),
    onLight: () => callEntityService(hass, snap.controls.lightEntityId),
    onFan: (fan, percent) => callEntityService(hass, fan.entityId, { percentage: percent }),
  };
}

export class UltraPrinter3dModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'printer_3d',
    title: '3D Printer',
    description:
      'Generic 3D printer card with temps, progress, camera, and controls for any integration',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:printer-3d',
    category: 'interactive',
    tags: [
      '3d printer',
      'octoprint',
      'moonraker',
      'klipper',
      'prusa',
      'print',
      'filament',
      'interactive',
    ],
  };

  createDefault(id?: string, _hass?: HomeAssistant): Printer3dModule {
    return {
      id: id || this.generateId('printer_3d'),
      type: 'printer_3d',
      layout: 'standard',
      style: 'dark',
      illustration: 'enclosed',
      show_title: true,
      title: '3D Printer',
      source: 'manual',
      fans: [],
      extra_stats: [],
      show_controls: true,
      show_temps: true,
      show_fans: true,
      show_camera: true,
      show_job: true,
      show_thumbnail: true,
      camera_mode: 'snapshot',
      camera_refresh_seconds: 10,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as Printer3dModule;
    return [
      m.status_entity,
      m.progress_entity,
      m.nozzle_temp_entity,
      m.nozzle_target_entity,
      m.bed_temp_entity,
      m.bed_target_entity,
      m.chamber_temp_entity,
      m.remaining_time_entity,
      m.end_time_entity,
      m.current_layer_entity,
      m.total_layers_entity,
      m.file_name_entity,
      m.camera_entity,
      m.thumbnail_entity,
      m.pause_entity,
      m.resume_entity,
      m.stop_entity,
      m.light_entity,
      ...(m.fans || []).map(f => f.entity),
      ...(m.extra_stats || []).map(s => s.entity),
    ].filter(Boolean) as string[];
  }

  private _picker(
    hass: HomeAssistant,
    config: UltraCardConfig,
    key: keyof Printer3dModule,
    value: string | undefined,
    label: string,
    updateModule: (updates: Partial<CardModule>) => void,
    domains?: string[]
  ): TemplateResult {
    return this.renderEntityPickerWithVariables(
      hass,
      config,
      key as string,
      value || '',
      (v: string) => {
        updateModule({ [key]: v || undefined } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      },
      domains,
      label
    );
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as Printer3dModule;
    const lang = hass?.locale?.language || 'en';
    const source = m.source || 'manual';
    const devices = listAutofillDevices(hass, source === 'manual' ? undefined : source);

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings">
        <div
          style="padding:10px 12px;border-radius:8px;background:rgba(var(--rgb-primary-color),0.08);margin-bottom:16px;font-size:0.85rem;"
        >
          ${localize(
            'editor.printer_3d.bambu_hint',
            lang,
            'Have a Bambu Lab printer? Use the Pro Bambu Lab module for AMS, farm view, and auto-discovery.'
          )}
        </div>

        ${this.renderSegmentedField(
          localize('editor.printer_3d.layout', lang, 'Layout'),
          localize('editor.printer_3d.layout_desc', lang, 'How the card is arranged.'),
          m.layout || 'standard',
          [
            {
              value: 'hero',
              label: localize('editor.printer_3d.layout_hero', lang, 'Hero'),
              icon: 'mdi:printer-3d',
            },
            {
              value: 'standard',
              label: localize('editor.printer_3d.layout_standard', lang, 'Standard'),
              icon: 'mdi:view-dashboard',
            },
            {
              value: 'compact',
              label: localize('editor.printer_3d.layout_compact', lang, 'Compact'),
              icon: 'mdi:view-compact',
            },
            {
              value: 'camera',
              label: localize('editor.printer_3d.layout_camera', lang, 'Camera'),
              icon: 'mdi:cctv',
            },
          ],
          next => {
            updateModule({ layout: next as Printer3dLayout });
            this.triggerPreviewUpdate();
          }
        )}

        ${this.renderSegmentedField(
          localize('editor.printer_3d.style', lang, 'Style'),
          localize('editor.printer_3d.style_desc', lang, 'Visual theme for surfaces and borders.'),
          m.style || 'dark',
          [
            { value: 'theme', label: localize('editor.printer_3d.style_theme', lang, 'Theme') },
            { value: 'dark', label: localize('editor.printer_3d.style_dark', lang, 'Dark') },
            { value: 'light', label: localize('editor.printer_3d.style_light', lang, 'Light') },
            { value: 'glass', label: localize('editor.printer_3d.style_glass', lang, 'Glass') },
          ],
          next => {
            updateModule({ style: next as Printer3dModule['style'] });
            this.triggerPreviewUpdate();
          }
        )}

        ${this.renderSegmentedField(
          localize('editor.printer_3d.illustration', lang, 'Illustration'),
          localize(
            'editor.printer_3d.illustration_desc',
            lang,
            'Procedural printer drawing, or your own image.'
          ),
          m.illustration || 'enclosed',
          [
            {
              value: 'enclosed',
              label: localize('editor.printer_3d.illustration_enclosed', lang, 'Enclosed'),
            },
            {
              value: 'bedslinger',
              label: localize('editor.printer_3d.illustration_bedslinger', lang, 'Bedslinger'),
            },
            {
              value: 'none',
              label: localize('editor.printer_3d.illustration_none', lang, 'None'),
            },
            {
              value: 'image',
              label: localize('editor.printer_3d.illustration_image', lang, 'Custom image'),
            },
          ],
          next => {
            updateModule({ illustration: next as Printer3dModule['illustration'] });
            this.triggerPreviewUpdate();
          }
        )}

        ${m.illustration === 'image'
          ? this.renderFileField(
              localize('editor.printer_3d.custom_image', lang, 'Custom image'),
              localize(
                'editor.printer_3d.custom_image_desc',
                lang,
                'Upload a printer photo when illustration is set to Custom image.'
              ),
              hass,
              m.custom_image || '',
              (v: string) => {
                updateModule({ custom_image: v || undefined });
                this.triggerPreviewUpdate();
              },
              'image/*'
            )
          : nothing}

        ${this.renderSettingsSection(
          localize('editor.printer_3d.title', lang, 'Title'),
          localize('editor.printer_3d.title_desc', lang, 'Optional heading text.'),
          [
            {
              title: localize('editor.printer_3d.show_title', lang, 'Show title'),
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
              title: localize('editor.printer_3d.title', lang, 'Title'),
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
          localize('editor.printer_3d.source', lang, 'Source'),
          localize(
            'editor.printer_3d.source_desc',
            lang,
            'Manual mapping, or auto-fill from a known integration.'
          ),
          source,
          [
            {
              value: 'manual',
              label: localize('editor.printer_3d.source_manual', lang, 'Manual'),
            },
            {
              value: 'octoprint',
              label: localize('editor.printer_3d.source_octoprint', lang, 'OctoPrint'),
            },
            {
              value: 'moonraker',
              label: localize('editor.printer_3d.source_moonraker', lang, 'Moonraker'),
            },
            {
              value: 'prusalink',
              label: localize('editor.printer_3d.source_prusalink', lang, 'PrusaLink'),
            },
          ],
          next => {
            updateModule({
              source: next as Printer3dModule['source'],
              source_device_id: undefined,
            });
            this.triggerPreviewUpdate();
          }
        )}

        ${source !== 'manual'
          ? html`
              ${this.renderSegmentedField(
                localize('editor.printer_3d.source_device', lang, 'Device'),
                localize(
                  'editor.printer_3d.source_device_desc',
                  lang,
                  'Pick a discovered printer device, then auto-fill.'
                ),
                m.source_device_id || '',
                [
                  { value: '', label: '—' },
                  ...devices.map(d => ({ value: d.deviceId, label: d.name })),
                ],
                next => {
                  updateModule({ source_device_id: next || undefined });
                  this.triggerPreviewUpdate();
                }
              )}
              <div style="margin:8px 0 24px;">
                <button
                  type="button"
                  style="border:1px solid var(--primary-color);background:color-mix(in srgb, var(--primary-color) 15%, transparent);color:var(--primary-text-color);border-radius:8px;padding:8px 14px;cursor:pointer;font-weight:600;"
                  ?disabled=${!m.source_device_id}
                  @click=${() => {
                    if (!m.source_device_id) return;
                    const map = autofillFromDevice(hass, m.source_device_id);
                    updateModule(applyAutofillToModule(map) as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  }}
                >
                  ${localize('editor.printer_3d.autofill', lang, 'Auto-fill entities')}
                </button>
                <div style="font-size:0.8rem;opacity:0.7;margin-top:6px;">
                  ${localize(
                    'editor.printer_3d.autofill_desc',
                    lang,
                    'Map common entities from the selected device. You can edit them afterward.'
                  )}
                </div>
              </div>
            `
          : nothing}

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
          >
            ${localize('editor.printer_3d.mapping', lang, 'Entity mapping')}
          </div>
          <div style="font-size:0.85rem;opacity:0.75;margin-bottom:12px;">
            ${localize(
              'editor.printer_3d.mapping_desc',
              lang,
              'Bind Home Assistant entities to printer fields.'
            )}
          </div>
          ${this._picker(
            hass,
            config,
            'status_entity',
            m.status_entity,
            localize('editor.printer_3d.status_entity', lang, 'Status'),
            updateModule,
            ['sensor', 'binary_sensor']
          )}
          ${this._picker(
            hass,
            config,
            'progress_entity',
            m.progress_entity,
            localize('editor.printer_3d.progress_entity', lang, 'Progress'),
            updateModule,
            ['sensor']
          )}
          ${this._picker(
            hass,
            config,
            'nozzle_temp_entity',
            m.nozzle_temp_entity,
            localize('editor.printer_3d.nozzle_temp_entity', lang, 'Nozzle temperature'),
            updateModule,
            ['sensor']
          )}
          ${this._picker(
            hass,
            config,
            'nozzle_target_entity',
            m.nozzle_target_entity,
            localize('editor.printer_3d.nozzle_target_entity', lang, 'Nozzle target'),
            updateModule,
            ['sensor', 'number']
          )}
          ${this._picker(
            hass,
            config,
            'bed_temp_entity',
            m.bed_temp_entity,
            localize('editor.printer_3d.bed_temp_entity', lang, 'Bed temperature'),
            updateModule,
            ['sensor']
          )}
          ${this._picker(
            hass,
            config,
            'bed_target_entity',
            m.bed_target_entity,
            localize('editor.printer_3d.bed_target_entity', lang, 'Bed target'),
            updateModule,
            ['sensor', 'number']
          )}
          ${this._picker(
            hass,
            config,
            'chamber_temp_entity',
            m.chamber_temp_entity,
            localize('editor.printer_3d.chamber_temp_entity', lang, 'Chamber temperature'),
            updateModule,
            ['sensor']
          )}
          ${this._picker(
            hass,
            config,
            'remaining_time_entity',
            m.remaining_time_entity,
            localize('editor.printer_3d.remaining_time_entity', lang, 'Remaining time'),
            updateModule,
            ['sensor']
          )}
          ${this._picker(
            hass,
            config,
            'end_time_entity',
            m.end_time_entity,
            localize('editor.printer_3d.end_time_entity', lang, 'End time'),
            updateModule,
            ['sensor']
          )}
          ${this._picker(
            hass,
            config,
            'current_layer_entity',
            m.current_layer_entity,
            localize('editor.printer_3d.current_layer_entity', lang, 'Current layer'),
            updateModule,
            ['sensor']
          )}
          ${this._picker(
            hass,
            config,
            'total_layers_entity',
            m.total_layers_entity,
            localize('editor.printer_3d.total_layers_entity', lang, 'Total layers'),
            updateModule,
            ['sensor']
          )}
          ${this._picker(
            hass,
            config,
            'file_name_entity',
            m.file_name_entity,
            localize('editor.printer_3d.file_name_entity', lang, 'File / task name'),
            updateModule,
            ['sensor']
          )}
          ${this._picker(
            hass,
            config,
            'camera_entity',
            m.camera_entity,
            localize('editor.printer_3d.camera_entity', lang, 'Camera'),
            updateModule,
            ['camera', 'image']
          )}
          ${this._picker(
            hass,
            config,
            'thumbnail_entity',
            m.thumbnail_entity,
            localize('editor.printer_3d.thumbnail_entity', lang, 'Thumbnail image'),
            updateModule,
            ['image', 'camera']
          )}
          ${this._picker(
            hass,
            config,
            'pause_entity',
            m.pause_entity,
            localize('editor.printer_3d.pause_entity', lang, 'Pause'),
            updateModule,
            ['button', 'script', 'switch']
          )}
          ${this._picker(
            hass,
            config,
            'resume_entity',
            m.resume_entity,
            localize('editor.printer_3d.resume_entity', lang, 'Resume'),
            updateModule,
            ['button', 'script', 'switch']
          )}
          ${this._picker(
            hass,
            config,
            'stop_entity',
            m.stop_entity,
            localize('editor.printer_3d.stop_entity', lang, 'Stop'),
            updateModule,
            ['button', 'script', 'switch']
          )}
          ${this._picker(
            hass,
            config,
            'light_entity',
            m.light_entity,
            localize('editor.printer_3d.light_entity', lang, 'Light'),
            updateModule,
            ['light', 'switch']
          )}
        </div>

        ${this.renderChipListField(
          localize('editor.printer_3d.fans', lang, 'Fans'),
          localize(
            'editor.printer_3d.fans_desc',
            lang,
            'Up to three fan entities with optional labels.'
          ),
          hass,
          (m.fans || []).map(f => f.entity),
          (values: string[]) => {
            const fans = values.slice(0, 3).map((entity, i) => ({
              entity,
              label: m.fans?.[i]?.label,
            }));
            updateModule({ fans });
            this.triggerPreviewUpdate();
          },
          { mode: 'entity', entityDomains: ['fan', 'sensor'], variant: 'primary' }
        )}

        ${this.renderChipListField(
          localize('editor.printer_3d.extra_stats', lang, 'Extra stats'),
          localize(
            'editor.printer_3d.extra_stats_desc',
            lang,
            'Additional sensors shown in the details list.'
          ),
          hass,
          (m.extra_stats || []).map(s => s.entity),
          (values: string[]) => {
            const extra_stats = values.map((entity, i) => ({
              entity,
              label: m.extra_stats?.[i]?.label,
              icon: m.extra_stats?.[i]?.icon,
            }));
            updateModule({ extra_stats });
            this.triggerPreviewUpdate();
          },
          { mode: 'entity', entityDomains: ['sensor', 'binary_sensor'], variant: 'primary' }
        )}

        ${this.renderSettingsSection(
          localize('editor.printer_3d.sections', lang, 'Sections'),
          '',
          [
            {
              title: localize('editor.printer_3d.show_controls', lang, 'Controls'),
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
              title: localize('editor.printer_3d.show_temps', lang, 'Temperatures'),
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
              title: localize('editor.printer_3d.show_fans', lang, 'Fans'),
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
              title: localize('editor.printer_3d.show_camera', lang, 'Camera'),
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
              title: localize('editor.printer_3d.show_job', lang, 'Print job'),
              description: localize(
                'editor.printer_3d.show_job_desc',
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
              title: localize('editor.printer_3d.show_thumbnail', lang, 'Cover thumbnail'),
              description: localize(
                'editor.printer_3d.show_thumbnail_desc',
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
          localize('editor.printer_3d.camera_mode', lang, 'Camera mode'),
          localize(
            'editor.printer_3d.camera_mode_desc',
            lang,
            'Snapshots poll a still image (low data). Live streams the camera like Home Assistant does.'
          ),
          m.camera_mode || 'snapshot',
          [
            {
              value: 'snapshot',
              label: localize('editor.printer_3d.camera_mode_snapshot', lang, 'Snapshots'),
              icon: 'mdi:image-multiple-outline',
            },
            {
              value: 'live',
              label: localize('editor.printer_3d.camera_mode_live', lang, 'Live'),
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
              localize('editor.printer_3d.camera_refresh', lang, 'Camera refresh (s)'),
              '',
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

        ${this.renderColorField(
          localize('editor.printer_3d.accent_color', lang, 'Accent'),
          '',
          hass,
          m.accent_color || '',
          '',
          (v: string) => {
            updateModule({ accent_color: v || undefined });
            this.triggerPreviewUpdate();
          }
        )}
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    _config?: UltraCardConfig
  ): TemplateResult {
    const m = module as Printer3dModule;
    const snap = hass?.states ? buildSnapshot(m, hass) : emptySnapshot(m.id, m.title || '3D Printer');
    const handlers = handlersFor(hass, snap);
    const style = m.style || 'dark';
    const layout = m.layout || 'standard';
    const textStyle = [
      m.text_color ? `color:${m.text_color}` : '',
      m.accent_color ? `--primary-color:${m.accent_color}` : '',
    ]
      .filter(Boolean)
      .join(';');

    const temps =
      m.show_temps !== false
        ? html`<div class="uc-printer-temps">
            ${renderTempChip('Nozzle', snap.nozzleTemp, snap.nozzleTarget, {
              icon: 'mdi:printer-3d-nozzle',
              accent: '#ff9800',
              entityId: snap.refs.nozzleTemp,
            })}
            ${renderTempChip('Bed', snap.bedTemp, snap.bedTarget, {
              icon: 'mdi:heat-wave',
              accent: '#e91e63',
              entityId: snap.refs.bedTemp,
            })}
            ${snap.chamberTemp != null
              ? renderTempChip('Chamber', snap.chamberTemp, null, {
                  icon: 'mdi:thermometer',
                  accent: '#2196f3',
                  entityId: snap.refs.chamberTemp,
                })
              : nothing}
          </div>`
        : nothing;

    const controls =
      m.show_controls !== false ? renderControlsRow(snap, handlers, { showSpeed: false }) : nothing;

    const fans =
      m.show_fans !== false ? renderFanRow(snap.fans, handlers, { editable: true }) : nothing;

    const extras =
      snap.extraStats?.length
        ? renderDetailsList(
            snap.extraStats.map(s => ({ label: s.label, value: s.value, entityId: s.entityId }))
          )
        : nothing;

    const tempClick = snap.refs.nozzleTemp
      ? (e: Event) => fireMoreInfo(e, snap.refs.nozzleTemp)
      : undefined;

    const job =
      m.show_job !== false
        ? renderPrintJob(snap, hass, { showThumbnail: m.show_thumbnail !== false })
        : nothing;

    let body: TemplateResult;
    if (layout === 'compact') {
      body = html`
        <div class="uc-bambu-compact">
          <div class="compact-main">
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
              <strong>${snap.name}</strong>
              ${renderStatusPill(snap.status, snap.statusRaw, snap.refs.status)}
            </div>
            ${renderProgressBar(snap.progress, { compact: true, entityId: snap.refs.progress })}
          </div>
          <span
            class=${tempClick ? 'is-clickable' : ''}
            style="font-size:0.8rem;white-space:nowrap;"
            @click=${tempClick}
          >
            ${snap.nozzleTemp != null ? `${Math.round(snap.nozzleTemp)}°` : '—'} /
            ${snap.bedTemp != null ? `${Math.round(snap.bedTemp)}°` : '—'}
          </span>
        </div>
      `;
    } else if (layout === 'camera') {
      body = html`
        ${m.show_camera !== false
          ? renderCameraFeed(hass, snap.cameraEntityId, {
              refreshSeconds: m.camera_refresh_seconds ?? 10,
              mode: m.camera_mode,
              alt: snap.name,
            })
          : nothing}
        <div class="uc-printer-header" style="margin-top:10px;">
          <div>
            <div class="title">${snap.name}</div>
            ${renderStatusPill(snap.status, snap.statusRaw, snap.refs.status)}
          </div>
          ${renderProgressRing(snap.progress, 48, 5, snap.refs.progress)}
        </div>
        ${renderProgressBar(snap.progress, { entityId: snap.refs.progress })}
        ${controls}
      `;
    } else if (layout === 'hero') {
      body = html`
        ${m.illustration !== 'none'
          ? renderPrinterWithHotspots(snap, {
              ...(m.accent_color ? { accent: m.accent_color } : {}),
              customImage: m.illustration === 'image' ? m.custom_image : undefined,
              showTemps: m.show_temps !== false,
              animation: 'full',
            })
          : nothing}
        ${controls}
        ${job}
        ${fans}
        ${extras}
      `;
    } else {
      body = html`
        <div class="uc-printer-header">
          <div>
            <div class="title">${snap.name}</div>
            ${renderStatusPill(snap.status, snap.statusRaw, snap.refs.status)}
          </div>
          ${renderProgressRing(snap.progress, 56, 5, snap.refs.progress)}
        </div>
        ${temps}
        ${snap.remainingMinutes != null || m.show_controls !== false
          ? html`<div class="uc-printer-row">
              ${snap.remainingMinutes != null
                ? renderStatTile('Time left', formatEta(snap.remainingMinutes), {
                    icon: 'mdi:timer-outline',
                    entityId: snap.refs.remaining,
                  })
                : nothing}
              ${controls}
            </div>`
          : nothing}
        ${fans}
        ${renderProgressBar(snap.progress, { entityId: snap.refs.progress })}
        ${job}
        ${m.show_camera !== false && snap.cameraEntityId
          ? renderCameraFeed(hass, snap.cameraEntityId, {
              refreshSeconds: m.camera_refresh_seconds ?? 10,
              mode: m.camera_mode,
              alt: snap.name,
            })
          : nothing}
        ${extras}
      `;
    }

    return html`
      <div
        class="uc-printer-root uc-printer-3d-root style-${style}"
        data-uc-role="pane"
        style=${textStyle}
      >
        ${m.show_title !== false && m.title && layout !== 'compact'
          ? html`<div class="uc-printer-header"><div class="title">${m.title}</div></div>`
          : nothing}
        ${body}
      </div>
    `;
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      ${PRINTER_SHARED_STYLES}
      .uc-printer-3d-root { display: flex; flex-direction: column; gap: 12px; }
      .uc-bambu-compact {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .uc-bambu-compact .compact-main { flex: 1; min-width: 120px; }
    `;
  }
}

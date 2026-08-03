import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, DogDutyDetectRoi, DogDutyModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import {
  ucDogDutyService,
  DogDutyEvent,
  DogDutyScanResult,
  todoSupportsDescription,
  MAX_DOG_DUTY_EXAMPLE_IMAGES,
  MAX_DOG_DUTY_EXTRA_TIPS,
} from '../services/uc-dog-duty-service';

interface PreviewState {
  events: DogDutyEvent[];
  loading: boolean;
  scrubRatio: number; // 0 = lookback start, 1 = now
  selectedUid: string | null;
  scanning: boolean;
  scanMessage: string;
  lastFetchedAt: number;
  showHeatmap: boolean;
  /** Chip-driven event list panel */
  listPanel: null | 'active' | 'week';
  listSort: 'time' | 'camera' | 'confidence' | 'status';
  /** Session-local: hide full wizard after Finish */
  wizardCollapsed: boolean;
}

interface RoiEditorState {
  editing: boolean;
  dragging: boolean;
  startX: number;
  startY: number;
  current: DogDutyDetectRoi | null;
}

interface WizardState {
  step: number;
  checking: boolean;
  llmInstalled: boolean;
  providers: Array<{ id: string; title: string }>;
  creating: boolean;
  message: string;
  error: string;
  testing: boolean;
  testResult: string;
}

/**
 * Dog Duty (Pro) — yard map with AI-detected dog waste markers,
 * time scrubber, cleanup tracking, and a setup wizard.
 */
export class UltraDogDutyModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'dog_duty',
    title: 'Dog Duty',
    description: 'Yard map with AI-detected dog waste markers, time scrubber, and cleanup tracking',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:dog',
    category: 'data',
    tags: ['pro', 'premium', 'camera', 'ai', 'pets', 'dog', 'yard', 'vision'],
  };

  private _preview = new Map<string, PreviewState>();
  private _wizard = new Map<string, WizardState>();
  private _roiEdit = new Map<string, RoiEditorState>();

  createDefault(id?: string, _hass?: HomeAssistant): DogDutyModule {
    return {
      id: id || this.generateId('dog_duty'),
      type: 'dog_duty',
      camera_entity: '',
      camera_entities: [],
      cameras_layout: 'stack',
      todo_entity: '',
      trigger_entity: '',
      provider_id: '',
      automation_id: '',
      setup_complete: false,
      lookback_hours: 48,
      marker_style: 'x',
      show_heatmap: false,
      show_cleaned: false,
      background_mode: 'live_snapshot',
      reference_image: '',
      scan_cooldown_minutes: 10,
      scan_interval_minutes: 30,
      scan_active_start: '07:00',
      scan_active_end: '21:00',
      show_status_bar: true,
      show_scrubber: true,
      show_scan_now: true,
      title: '',
      show_title: true,
      detection_sensitivity: 'balanced',
      detect_squatting: true,
      min_confidence: 0.45,
      extra_tips: '',
      example_images: [],
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as DogDutyModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (!m.camera_entity) errors.push('Select a camera entity');
    if (!m.todo_entity) errors.push('Select a Dog Duty to-do list entity');
    return { valid: errors.length === 0, errors };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as DogDutyModule;
    const ids: string[] = [];
    for (const cam of getDogDutyCameras(m)) ids.push(cam);
    if (m.todo_entity) ids.push(m.todo_entity);
    if (m.trigger_entity) ids.push(m.trigger_entity);
    return ids;
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    _config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as DogDutyModule, hass, updates => updateModule(updates));
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    _config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as DogDutyModule, hass, updates => updateModule(updates));
  }

  // ── General tab ────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as DogDutyModule;
    const lang = hass?.locale?.language || 'en';

    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    if (!isPro) {
      return this.renderProLockUI(lang);
    }

    const wz = this._ensureWizard(m.id);

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings">
        ${this._renderWizard(m, hass, updateModule, lang, wz)}

        ${this.renderSettingsSection(
          localize('editor.dog_duty.entities_section', lang, 'Entities'),
          localize(
            'editor.dog_duty.entities_section_desc',
            lang,
            'Camera and to-do list that power the Dog Duty map.'
          ),
          [
            {
              title: localize('editor.dog_duty.camera', lang, 'Yard camera'),
              description: localize(
                'editor.dog_duty.camera_desc',
                lang,
                'Primary camera for the yard map. Add more below if you have multiple angles.'
              ),
              hass,
              data: { camera_entity: m.camera_entity || '' },
              schema: [{ name: 'camera_entity', selector: { entity: { domain: 'camera' } } }],
              onChange: (e: CustomEvent) => {
                updateModule({ camera_entity: e.detail.value?.camera_entity ?? '' });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.extra_cameras', lang, 'Additional cameras'),
              description: localize(
                'editor.dog_duty.extra_cameras_desc',
                lang,
                'Optional. Each camera gets its own map; status chips combine across all.'
              ),
              hass,
              data: { camera_entities: m.camera_entities || [] },
              schema: [
                {
                  name: 'camera_entities',
                  selector: { entity: { domain: 'camera', multiple: true } },
                },
              ],
              onChange: (e: CustomEvent) => {
                const raw = e.detail.value?.camera_entities;
                const list = Array.isArray(raw)
                  ? raw.filter((id: string) => id && id !== m.camera_entity)
                  : [];
                updateModule({ camera_entities: list });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.cameras_layout', lang, 'Camera layout'),
              description: localize(
                'editor.dog_duty.cameras_layout_desc',
                lang,
                'Stack maps vertically or show them in a grid when you have more than one camera.'
              ),
              hass,
              data: { cameras_layout: m.cameras_layout || 'stack' },
              schema: [
                this.selectField('cameras_layout', [
                  {
                    value: 'stack',
                    label: localize('editor.dog_duty.layout_stack', lang, 'List (stacked)'),
                  },
                  {
                    value: 'grid',
                    label: localize('editor.dog_duty.layout_grid', lang, 'Grid'),
                  },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({
                  cameras_layout: (e.detail.value?.cameras_layout || 'stack') as
                    | 'stack'
                    | 'grid',
                });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.todo', lang, 'To-do list'),
              description: localize(
                'editor.dog_duty.todo_desc',
                lang,
                'A local to-do list that stores detections. Create one named "Dog Duty" if you do not have it yet.'
              ),
              hass,
              data: { todo_entity: m.todo_entity || '' },
              schema: [{ name: 'todo_entity', selector: { entity: { domain: 'todo' } } }],
              onChange: (e: CustomEvent) => {
                updateModule({ todo_entity: e.detail.value?.todo_entity ?? '' });
                this._preview.delete(m.id);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.trigger', lang, 'Dog / motion trigger (optional)'),
              description: localize(
                'editor.dog_duty.trigger_desc',
                lang,
                'Binary sensor from Scrypted/Frigate dog detection or yard motion. Leave blank for manual Scan Now only.'
              ),
              hass,
              data: { trigger_entity: m.trigger_entity || '' },
              schema: [
                { name: 'trigger_entity', selector: { entity: { domain: 'binary_sensor' } } },
              ],
              onChange: (e: CustomEvent) => {
                updateModule({ trigger_entity: e.detail.value?.trigger_entity ?? '' });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}

        ${m.todo_entity && hass && !todoSupportsDescription(hass, m.todo_entity)
          ? html`<div class="dog-duty-warn" style="margin: -16px 0 24px;">
              <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
              ${localize(
                'editor.dog_duty.todo_no_description',
                lang,
                'This list (e.g. Shopping List) cannot store item descriptions. Markers still work, but a Local To-do named “Dog Duty” is recommended (Settings → Devices & services → Helpers → Local To-do).'
              )}
            </div>`
          : nothing}

        ${this._renderScanModeSection(m, hass, updateModule, lang)}

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
          >
            ${localize('editor.dog_duty.provider_section', lang, 'LLM Vision')}
          </div>
          <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;">
            ${localize(
              'editor.dog_duty.provider_section_desc',
              lang,
              'Provider config entry used for Scan Now and the generated automation.'
            )}
          </div>
          ${this.renderSegmentedField(
            localize('editor.dog_duty.provider', lang, 'Provider'),
            localize(
              'editor.dog_duty.provider_desc',
              lang,
              'Run Check prerequisites in the wizard to refresh the list.'
            ),
            m.provider_id || '',
            [
              ...(wz.providers.length
                ? wz.providers.map(p => ({ value: p.id, label: p.title }))
                : m.provider_id
                  ? [{ value: m.provider_id, label: m.provider_id.slice(0, 12) + '…' }]
                  : [{ value: '', label: localize('editor.dog_duty.no_provider', lang, 'None detected') }]),
            ],
            (value: string) => {
              updateModule({ provider_id: value });
            }
          )}
          ${this.renderFieldSection(
            localize('editor.dog_duty.provider_manual', lang, 'Provider ID (manual)'),
            localize(
              'editor.dog_duty.provider_manual_desc',
              lang,
              'Paste an LLM Vision provider entry_id if it was not auto-detected.'
            ),
            hass,
            { provider_id: m.provider_id || '' },
            [this.textField('provider_id')],
            (e: CustomEvent) => {
              updateModule({ provider_id: e.detail.value?.provider_id ?? '' });
            }
          )}
        </div>

        ${this._renderDetectionSection(m, hass, updateModule, lang, wz)}

        ${this.renderSettingsSection(
          localize('editor.dog_duty.display_section', lang, 'Display'),
          localize('editor.dog_duty.display_section_desc', lang, 'Map look and time window.'),
          [
            {
              title: localize('editor.dog_duty.title', lang, 'Title'),
              description: localize(
                'editor.dog_duty.title_desc',
                lang,
                'Leave blank to use "Dog Duty".'
              ),
              hass,
              data: { title: m.title || '' },
              schema: [this.textField('title')],
              onChange: (e: CustomEvent) => {
                updateModule({ title: e.detail.value?.title ?? '' });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.show_title', lang, 'Show title'),
              description: '',
              hass,
              data: { show_title: m.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_title: e.detail.value.show_title });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.show_status_bar', lang, 'Show status bar'),
              description: '',
              hass,
              data: { show_status_bar: m.show_status_bar !== false },
              schema: [this.booleanField('show_status_bar')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_status_bar: e.detail.value.show_status_bar });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.show_scrubber', lang, 'Show time scrubber'),
              description: '',
              hass,
              data: { show_scrubber: m.show_scrubber !== false },
              schema: [this.booleanField('show_scrubber')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_scrubber: e.detail.value.show_scrubber });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.show_scan_now', lang, 'Show Scan Now button'),
              description: '',
              hass,
              data: { show_scan_now: m.show_scan_now !== false },
              schema: [this.booleanField('show_scan_now')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_scan_now: e.detail.value.show_scan_now });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.show_cleaned', lang, 'Show cleaned markers'),
              description: localize(
                'editor.dog_duty.show_cleaned_desc',
                lang,
                'Completed to-do items appear as faded checkmarks.'
              ),
              hass,
              data: { show_cleaned: !!m.show_cleaned },
              schema: [this.booleanField('show_cleaned')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_cleaned: e.detail.value.show_cleaned });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.dog_duty.show_heatmap', lang, 'Heatmap by default'),
              description: localize(
                'editor.dog_duty.show_heatmap_desc',
                lang,
                'Show density overlay of favorite spots in the lookback window.'
              ),
              hass,
              data: { show_heatmap: !!m.show_heatmap },
              schema: [this.booleanField('show_heatmap')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_heatmap: e.detail.value.show_heatmap });
                const st = this._preview.get(m.id);
                if (st) st.showHeatmap = !!e.detail.value.show_heatmap;
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
            ${localize('editor.dog_duty.map_section', lang, 'Map')}
          </div>

          ${this.renderSegmentedField(
            localize('editor.dog_duty.lookback', lang, 'Lookback window'),
            localize(
              'editor.dog_duty.lookback_desc',
              lang,
              'How far back the scrubber and markers go.'
            ),
            String(m.lookback_hours || 48),
            [
              { value: '6', label: '6h' },
              { value: '24', label: '24h' },
              { value: '48', label: '48h' },
              { value: '168', label: '7d' },
            ],
            (value: string) => {
              updateModule({ lookback_hours: Number(value) || 48 });
              this.triggerPreviewUpdate();
            }
          )}

          ${this.renderSegmentedField(
            localize('editor.dog_duty.marker_style', lang, 'Marker style'),
            '',
            m.marker_style || 'x',
            [
              { value: 'x', label: localize('editor.dog_duty.marker_x', lang, 'X') },
              { value: 'emoji', label: localize('editor.dog_duty.marker_emoji', lang, 'Emoji') },
              { value: 'pin', label: localize('editor.dog_duty.marker_pin', lang, 'Pin') },
            ],
            (value: string) => {
              updateModule({ marker_style: value as DogDutyModule['marker_style'] });
              this.triggerPreviewUpdate();
            }
          )}

          ${this.renderSegmentedField(
            localize('editor.dog_duty.background_mode', lang, 'Background'),
            localize(
              'editor.dog_duty.background_mode_desc',
              lang,
              'Live camera snapshot or a fixed reference photo of the yard.'
            ),
            m.background_mode || 'live_snapshot',
            [
              {
                value: 'live_snapshot',
                label: localize('editor.dog_duty.bg_live', lang, 'Live snapshot'),
              },
              {
                value: 'reference',
                label: localize('editor.dog_duty.bg_reference', lang, 'Reference photo'),
              },
            ],
            (value: string) => {
              updateModule({ background_mode: value as DogDutyModule['background_mode'] });
              this.triggerPreviewUpdate();
            }
          )}

          ${m.background_mode === 'reference'
            ? this.renderFileField(
                localize('editor.dog_duty.reference_image', lang, 'Reference image'),
                localize(
                  'editor.dog_duty.reference_image_desc',
                  lang,
                  'Upload a still photo of the yard from the same camera angle.'
                ),
                hass,
                m.reference_image || '',
                (value: string) => {
                  updateModule({ reference_image: value });
                  this.triggerPreviewUpdate();
                },
                'image/*'
              )
            : nothing}

          ${this.renderSliderField(
            localize('editor.dog_duty.cooldown', lang, 'Scan cooldown'),
            localize(
              'editor.dog_duty.cooldown_desc',
              lang,
              'Minimum minutes between automation runs / Scan Now calls.'
            ),
            m.scan_cooldown_minutes ?? 10,
            10,
            1,
            60,
            1,
            (value: number) => {
              updateModule({ scan_cooldown_minutes: value });
            },
            'min'
          )}
        </div>
      </div>
    `;
  }

  // ── Detection settings ─────────────────────────────────────────────────────

  private _detectionOpts(m: DogDutyModule) {
    return {
      sensitivity: m.detection_sensitivity || 'balanced',
      detectSquatting: m.detect_squatting !== false,
      minConfidence: typeof m.min_confidence === 'number' ? m.min_confidence : 0.45,
      extraTips: m.extra_tips || '',
      exampleImages: (m.example_images || []).filter(Boolean).slice(0, MAX_DOG_DUTY_EXAMPLE_IMAGES),
      roi: m.detect_roi || null,
    };
  }

  private _ensureRoiEdit(moduleId: string): RoiEditorState {
    let st = this._roiEdit.get(moduleId);
    if (!st) {
      st = {
        editing: false,
        dragging: false,
        startX: 0,
        startY: 0,
        current: null,
      };
      this._roiEdit.set(moduleId, st);
    }
    return st;
  }

  /** Which scanning mode the current config results in. */
  private _scanMode(m: DogDutyModule): 'sensor' | 'scheduled' | 'manual' {
    if (!m.automation_id) return 'manual';
    return m.trigger_entity ? 'sensor' : 'scheduled';
  }

  private _formatInterval(minutes: number, lang: string): string {
    if (minutes >= 60) {
      const h = Math.round(minutes / 60);
      return `${h} ${localize(h === 1 ? 'editor.dog_duty.hour' : 'editor.dog_duty.hours', lang, h === 1 ? 'hour' : 'hours')}`;
    }
    return `${minutes} ${localize('editor.dog_duty.minutes', lang, 'min')}`;
  }

  private _renderScanModeRow(
    active: boolean,
    icon: string,
    name: string,
    desc: string,
    lang: string
  ): TemplateResult {
    return html`
      <div
        style="display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 8px; border: 1px solid ${active
          ? 'var(--primary-color)'
          : 'var(--divider-color)'}; background: ${active
          ? 'color-mix(in srgb, var(--primary-color) 8%, transparent)'
          : 'transparent'};"
      >
        <ha-icon
          icon="${icon}"
          style="--mdc-icon-size: 20px; margin-top: 1px; color: ${active
            ? 'var(--primary-color)'
            : 'var(--secondary-text-color)'};"
        ></ha-icon>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            ${name}
            ${active
              ? html`<span
                  style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--primary-color); border: 1px solid var(--primary-color); border-radius: 999px; padding: 1px 8px;"
                  >${localize('editor.dog_duty.mode_active', lang, 'Active')}</span
                >`
              : nothing}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 2px;">
            ${desc}
          </div>
        </div>
      </div>
    `;
  }

  private _renderScanModeSection(
    m: DogDutyModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const mode = this._scanMode(m);
    const interval = m.scan_interval_minutes ?? 30;
    const intervalLabel = this._formatInterval(interval, lang);

    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
        >
          ${localize('editor.dog_duty.scan_mode_section', lang, 'How scanning works')}
        </div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;">
          ${localize(
            'editor.dog_duty.scan_mode_section_desc',
            lang,
            'The mode is chosen automatically from your setup: pick a trigger sensor for the smartest scanning, or let the automation run on a schedule without one.'
          )}
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
          ${this._renderScanModeRow(
            mode === 'sensor',
            'mdi:motion-sensor',
            localize('editor.dog_duty.mode_sensor', lang, 'Sensor-triggered'),
            localize(
              'editor.dog_duty.mode_sensor_desc',
              lang,
              'A dog / motion sensor starts a scan right after activity ends. Fewest AI calls — recommended if you have one.'
            ),
            lang
          )}
          ${this._renderScanModeRow(
            mode === 'scheduled',
            'mdi:clock-outline',
            localize('editor.dog_duty.mode_scheduled', lang, 'Scheduled'),
            localize(
              'editor.dog_duty.mode_scheduled_desc',
              lang,
              'No sensor needed. The automation scans every {interval} during your active hours. Each scan is one AI call, whether or not the dog was out.'
            ).replace('{interval}', intervalLabel),
            lang
          )}
          ${this._renderScanModeRow(
            mode === 'manual',
            'mdi:gesture-tap-button',
            localize('editor.dog_duty.mode_manual', lang, 'Manual only'),
            localize(
              'editor.dog_duty.mode_manual_desc',
              lang,
              'No automation yet. Only the Scan Now button runs a scan — zero background AI cost. Finish the wizard to enable automatic scanning.'
            ),
            lang
          )}
        </div>
        ${!m.trigger_entity
          ? html`
              ${this.renderSegmentedField(
                localize('editor.dog_duty.scan_interval', lang, 'Scheduled scan interval'),
                localize(
                  'editor.dog_duty.scan_interval_desc',
                  lang,
                  'How often the automation scans when no trigger sensor is set. Shorter = catches events sooner but uses more AI calls.'
                ),
                String(interval),
                [
                  { value: '15', label: `15 ${localize('editor.dog_duty.minutes', lang, 'min')}` },
                  { value: '30', label: `30 ${localize('editor.dog_duty.minutes', lang, 'min')}` },
                  { value: '60', label: `1 ${localize('editor.dog_duty.hour', lang, 'hour')}` },
                  { value: '120', label: `2 ${localize('editor.dog_duty.hours', lang, 'hours')}` },
                  { value: '240', label: `4 ${localize('editor.dog_duty.hours', lang, 'hours')}` },
                ],
                (value: string) => {
                  updateModule({ scan_interval_minutes: Number(value) || 30 });
                }
              )}
              ${this.renderFieldSection(
                localize('editor.dog_duty.active_hours', lang, 'Active hours'),
                localize(
                  'editor.dog_duty.active_hours_desc',
                  lang,
                  'Scheduled scans only run inside this window, so you are not paying for AI calls while the dog is asleep.'
                ),
                hass,
                {
                  scan_active_start: m.scan_active_start || '07:00',
                  scan_active_end: m.scan_active_end || '21:00',
                },
                [
                  { name: 'scan_active_start', selector: { time: {} } },
                  { name: 'scan_active_end', selector: { time: {} } },
                ],
                (e: CustomEvent) => {
                  updateModule({
                    scan_active_start: e.detail.value?.scan_active_start ?? m.scan_active_start,
                    scan_active_end: e.detail.value?.scan_active_end ?? m.scan_active_end,
                  });
                }
              )}
            `
          : nothing}
        ${m.automation_id
          ? html`<div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;">
              <ha-icon icon="mdi:information-outline" style="--mdc-icon-size: 14px;"></ha-icon>
              ${localize(
                'editor.dog_duty.scan_mode_reapply',
                lang,
                'Changing the trigger sensor or schedule? Re-run "Create automation" in the wizard to update the existing automation.'
              )}
            </div>`
          : nothing}
      </div>
    `;
  }

  private _renderDetectionSection(
    m: DogDutyModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    wz: WizardState
  ): TemplateResult {
    const examples = (m.example_images || []).filter(Boolean).slice(0, MAX_DOG_DUTY_EXAMPLE_IMAGES);
    const roiEdit = this._ensureRoiEdit(m.id);
    const displayRoi = roiEdit.dragging && roiEdit.current ? roiEdit.current : m.detect_roi;

    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
        >
          ${localize('editor.dog_duty.detection_section', lang, 'Detection')}
        </div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;">
          ${localize(
            'editor.dog_duty.detection_section_desc',
            lang,
            'Tune how Scan Now and the automation look for waste. The AI instructions stay hidden — you only set preferences.'
          )}
        </div>

        ${m.automation_id
          ? html`<div class="dog-duty-warn" style="margin-bottom: 12px;">
              <ha-icon icon="mdi:robot"></ha-icon>
              <span
                >${localize(
                  'editor.dog_duty.automation_update_hint',
                  lang,
                  'Scan Now uses these settings immediately. Re-create the automation below to apply them to automatic scans.'
                )}</span
              >
              <button
                class="dog-duty-link-btn"
                ?disabled=${wz.creating || !m.camera_entity || !m.todo_entity}
                @click=${() => this._wizardCreateAutomation(m, hass, updateModule)}
              >
                ${wz.creating
                  ? localize('editor.dog_duty.creating', lang, 'Creating…')
                  : localize('editor.dog_duty.update_automation', lang, 'Update automation')}
              </button>
            </div>`
          : nothing}

        ${this.renderSegmentedField(
          localize('editor.dog_duty.sensitivity', lang, 'Sensitivity'),
          localize(
            'editor.dog_duty.sensitivity_desc',
            lang,
            'Strict = fewer high-confidence marks. Lenient = more willing to mark uncertain spots.'
          ),
          m.detection_sensitivity || 'balanced',
          [
            {
              value: 'strict',
              label: localize('editor.dog_duty.sensitivity_strict', lang, 'Strict'),
            },
            {
              value: 'balanced',
              label: localize('editor.dog_duty.sensitivity_balanced', lang, 'Balanced'),
            },
            {
              value: 'lenient',
              label: localize('editor.dog_duty.sensitivity_lenient', lang, 'Lenient'),
            },
          ],
          (value: string) => {
            updateModule({
              detection_sensitivity: value as DogDutyModule['detection_sensitivity'],
            });
          }
        )}

        ${this.renderFieldSection(
          localize('editor.dog_duty.detect_squatting', lang, 'Mark while dog is squatting'),
          localize(
            'editor.dog_duty.detect_squatting_desc',
            lang,
            'Also mark when a dog is clearly squatting or defecating, not only piles on the ground.'
          ),
          hass,
          { detect_squatting: m.detect_squatting !== false },
          [this.booleanField('detect_squatting')],
          (e: CustomEvent) => {
            updateModule({ detect_squatting: !!e.detail.value?.detect_squatting });
          }
        )}

        ${this.renderSliderField(
          localize('editor.dog_duty.min_confidence', lang, 'Minimum confidence'),
          localize(
            'editor.dog_duty.min_confidence_desc',
            lang,
            'Ignore AI spots below this confidence (0–100%).'
          ),
          Math.round((typeof m.min_confidence === 'number' ? m.min_confidence : 0.45) * 100),
          45,
          20,
          90,
          5,
          (value: number) => {
            updateModule({ min_confidence: clamp01(value / 100) });
          },
          '%'
        )}

        ${this.renderTextArea(
          localize('editor.dog_duty.extra_tips', lang, 'Extra tips'),
          m.extra_tips || '',
          (value: string) => {
            updateModule({ extra_tips: value.slice(0, MAX_DOG_DUTY_EXTRA_TIPS) });
          },
          localize(
            'editor.dog_duty.extra_tips_placeholder',
            lang,
            'e.g. Our dog is white; piles are usually dark brown near the fence'
          ),
          localize(
            'editor.dog_duty.extra_tips_desc',
            lang,
            'Tell the AI about your yard. Do not paste long instructions — short notes work best.'
          )
        )}

        <div class="dog-duty-examples" style="margin-top: 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.dog_duty.example_photos', lang, 'Example photos')}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">
            ${localize(
              'editor.dog_duty.example_photos_desc',
              lang,
              'Up to 3 photos of what waste looks like in your yard. Sent as references with each scan (uses more tokens).'
            )}
          </div>
          ${[0, 1, 2].map(idx => {
            if (idx > examples.length) return nothing;
            const value = examples[idx] || '';
            return this.renderFileField(
              localize('editor.dog_duty.example_photo_n', lang, 'Example {n}').replace(
                '{n}',
                String(idx + 1)
              ),
              '',
              hass,
              value,
              (path: string) => {
                const next = [...examples];
                if (path) {
                  next[idx] = path;
                } else {
                  next.splice(idx, 1);
                }
                updateModule({
                  example_images: next.filter(Boolean).slice(0, MAX_DOG_DUTY_EXAMPLE_IMAGES),
                });
                this.triggerPreviewUpdate();
              },
              'image/*'
            );
          })}
        </div>

        <div class="dog-duty-roi-editor" style="margin-top: 16px;">
          <div style="font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.dog_duty.detect_zone', lang, 'Detect zone')}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">
            ${localize(
              'editor.dog_duty.detect_zone_desc',
              lang,
              'Drag a rectangle on the preview to limit detection to part of the yard (e.g. lawn only).'
            )}
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
            <button
              class="dog-duty-link-btn"
              @click=${() => {
                roiEdit.editing = !roiEdit.editing;
                roiEdit.dragging = false;
                roiEdit.current = null;
                this.triggerPreviewUpdate();
              }}
            >
              ${roiEdit.editing
                ? localize('editor.dog_duty.detect_zone_done', lang, 'Done')
                : localize('editor.dog_duty.detect_zone_edit', lang, 'Edit zone')}
            </button>
            <button
              class="dog-duty-link-btn"
              ?disabled=${!m.detect_roi}
              @click=${() => {
                updateModule({ detect_roi: undefined });
                roiEdit.current = null;
                roiEdit.editing = false;
                this.triggerPreviewUpdate();
              }}
            >
              ${localize('editor.dog_duty.detect_zone_reset', lang, 'Reset to full frame')}
            </button>
          </div>
          ${roiEdit.editing
            ? html`
                <div
                  class="dog-duty-roi-canvas"
                  @pointerdown=${(e: PointerEvent) =>
                    this._onRoiPointerDown(e, m, updateModule)}
                  @pointermove=${(e: PointerEvent) => this._onRoiPointerMove(e, m)}
                  @pointerup=${(e: PointerEvent) => this._onRoiPointerUp(e, m, updateModule)}
                  @pointercancel=${(e: PointerEvent) => this._onRoiPointerUp(e, m, updateModule)}
                >
                  ${this._renderMapBackground(m, hass, lang, this._backgroundUrl(m, hass))}
                  ${this._renderRoiRect(displayRoi, true)}
                  <div class="dog-duty-roi-hint">
                    ${localize(
                      'editor.dog_duty.detect_zone_drag',
                      lang,
                      'Drag to draw the detect zone'
                    )}
                  </div>
                </div>
              `
            : m.detect_roi
              ? html`<div class="dog-duty-roi-summary">
                  ${localize(
                    'editor.dog_duty.detect_zone_set',
                    lang,
                    'Zone set — outside areas are ignored.'
                  )}
                </div>`
              : nothing}
        </div>
      </div>
    `;
  }

  private _pointerToNorm(e: PointerEvent, el: HTMLElement): { x: number; y: number } {
    const rect = el.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    return {
      x: clamp01((e.clientX - rect.left) / w),
      y: clamp01((e.clientY - rect.top) / h),
    };
  }

  private _onRoiPointerDown(
    e: PointerEvent,
    m: DogDutyModule,
    _updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const pt = this._pointerToNorm(e, el);
    const st = this._ensureRoiEdit(m.id);
    st.dragging = true;
    st.startX = pt.x;
    st.startY = pt.y;
    st.current = { x: pt.x, y: pt.y, width: 0, height: 0 };
    this.triggerPreviewUpdate();
  }

  private _onRoiPointerMove(e: PointerEvent, m: DogDutyModule): void {
    const st = this._ensureRoiEdit(m.id);
    if (!st.dragging) return;
    const el = e.currentTarget as HTMLElement;
    const pt = this._pointerToNorm(e, el);
    const x = Math.min(st.startX, pt.x);
    const y = Math.min(st.startY, pt.y);
    st.current = {
      x,
      y,
      width: Math.abs(pt.x - st.startX),
      height: Math.abs(pt.y - st.startY),
    };
    this.triggerPreviewUpdate();
  }

  private _onRoiPointerUp(
    e: PointerEvent,
    m: DogDutyModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const st = this._ensureRoiEdit(m.id);
    if (!st.dragging) return;
    st.dragging = false;
    const roi = st.current;
    st.current = null;
    if (roi && roi.width >= 0.05 && roi.height >= 0.05) {
      updateModule({ detect_roi: roi });
    }
    this.triggerPreviewUpdate();
  }

  private _renderRoiOverlay(m: DogDutyModule): TemplateResult | typeof nothing {
    return this._renderRoiRect(m.detect_roi, false);
  }

  private _renderRoiRect(
    roi: DogDutyDetectRoi | null | undefined,
    editing: boolean
  ): TemplateResult | typeof nothing {
    if (!roi || roi.width <= 0 || roi.height <= 0) {
      return editing
        ? html`<div class="dog-duty-roi-mask empty" aria-hidden="true"></div>`
        : nothing;
    }
    const left = `${clamp01(roi.x) * 100}%`;
    const top = `${clamp01(roi.y) * 100}%`;
    const width = `${clamp01(roi.width) * 100}%`;
    const height = `${clamp01(roi.height) * 100}%`;
    return html`
      <div
        class="dog-duty-roi-mask ${editing ? 'editing' : ''}"
        style="left:${left};top:${top};width:${width};height:${height};"
        aria-hidden="true"
      ></div>
    `;
  }

  // ── Wizard ─────────────────────────────────────────────────────────────────

  private _renderWizard(
    m: DogDutyModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    wz: WizardState
  ): TemplateResult {
    const st = this._ensurePreview(m);

    // After setup, show a compact banner unless the user reopens the wizard.
    if (m.setup_complete && st.wizardCollapsed) {
      return html`
        <div
          class="settings-section dog-duty-wizard dog-duty-wizard-collapsed"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; border: 1px solid color-mix(in srgb, var(--success-color, #4caf50) 35%, transparent);"
        >
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <ha-icon icon="mdi:check-circle" style="color: var(--success-color, #4caf50);"></ha-icon>
            <span style="flex:1; font-size: 13px;">
              ${localize(
                'editor.dog_duty.setup_done',
                lang,
                'Setup complete. Detections will appear on the map.'
              )}
            </span>
            <button
              class="dog-duty-btn"
              @click=${() => {
                st.wizardCollapsed = false;
                this.triggerPreviewUpdate();
              }}
            >
              ${localize('editor.dog_duty.reopen_wizard', lang, 'Reopen wizard')}
            </button>
          </div>
        </div>
      `;
    }

    return html`
      <div
        class="settings-section dog-duty-wizard"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px; border: 1px solid color-mix(in srgb, var(--primary-color) 35%, transparent);"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
        >
          ${localize('editor.dog_duty.wizard_title', lang, 'Setup wizard')}
        </div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          ${localize(
            'editor.dog_duty.wizard_desc',
            lang,
            'One-click setup creates a to-do list + automation so scans only run when the dog is outside — no token burn.'
          )}
        </div>

        <div class="dog-duty-wizard-steps">
          <div class="dog-duty-step ${wz.step >= 1 ? 'active' : ''}">1</div>
          <div class="dog-duty-step-line"></div>
          <div class="dog-duty-step ${wz.step >= 2 ? 'active' : ''}">2</div>
          <div class="dog-duty-step-line"></div>
          <div class="dog-duty-step ${wz.step >= 3 ? 'active' : ''}">3</div>
          <div class="dog-duty-step-line"></div>
          <div class="dog-duty-step ${wz.step >= 4 ? 'active' : ''}">4</div>
        </div>

        ${wz.step === 1
          ? html`
              <div class="dog-duty-wizard-body">
                <div style="font-weight: 600; margin-bottom: 8px;">
                  ${localize('editor.dog_duty.wizard_step1', lang, 'Check prerequisites')}
                </div>
                <p style="font-size: 13px; color: var(--secondary-text-color); margin: 0 0 12px;">
                  ${localize(
                    'editor.dog_duty.wizard_step1_desc',
                    lang,
                    'Dog Duty needs the LLM Vision integration (HACS) and at least one AI provider with a vision model.'
                  )}
                </p>
                <div class="dog-duty-setup-guide">
                  <div class="dog-duty-setup-guide-title">
                    ${localize('editor.dog_duty.setup_guide_title', lang, 'How to set up LLM Vision')}
                  </div>
                  <ol>
                    <li>
                      ${localize(
                        'editor.dog_duty.setup_guide_1',
                        lang,
                        'Install “LLM Vision” from HACS, then restart Home Assistant.'
                      )}
                    </li>
                    <li>
                      ${localize(
                        'editor.dog_duty.setup_guide_2',
                        lang,
                        'Settings → Devices & services → Add Integration → LLM Vision. On the first Settings screen (timeout / prompts), just press Submit — there is no model to pick here.'
                      )}
                    </li>
                    <li>
                      ${localize(
                        'editor.dog_duty.setup_guide_3',
                        lang,
                        'On the LLM Vision card, press Add Entry (or Configure → Add Entry) and choose a Provider (OpenAI, Google, OpenRouter, or Ollama).'
                      )}
                    </li>
                    <li>
                      ${localize(
                        'editor.dog_duty.setup_guide_4',
                        lang,
                        'Use a vision model. Easy picks: gpt-4o-mini (OpenAI), gemini-2.0-flash (Google), claude-haiku-4-5 (Anthropic), or gemma3:12b (Ollama).'
                      )}
                    </li>
                    <li>
                      ${localize(
                        'editor.dog_duty.setup_guide_5',
                        lang,
                        'Come back here and press Check prerequisites.'
                      )}
                    </li>
                  </ol>
                  <div class="dog-duty-setup-guide-note">
                    ${localize(
                      'editor.dog_duty.setup_guide_invalid_model',
                      lang,
                      'Seeing “Validation error: invalid_model” or “Couldn’t generate content”? (1) Pick “Anthropic Claude”, never “LLM Vision Settings”. (2) For Anthropic: ⋮ → Reconfigure → set Thinking / reasoning budget to 0, then Submit. LLM Vision 1.7.0 has a known thinking-budget float bug.'
                    )}
                  </div>
                </div>
                <button
                  class="dog-duty-btn"
                  ?disabled=${wz.checking}
                  @click=${() => this._wizardCheckPrereqs(m, hass, updateModule)}
                >
                  ${wz.checking
                    ? localize('editor.dog_duty.checking', lang, 'Checking…')
                    : localize('editor.dog_duty.check_prereqs', lang, 'Check prerequisites')}
                </button>
                ${wz.llmInstalled && wz.providers.length
                  ? html`<div class="dog-duty-ok">
                      <ha-icon icon="mdi:check-circle"></ha-icon>
                      ${localize('editor.dog_duty.llm_found', lang, 'LLM Vision found')} —
                      ${wz.providers.length}
                      ${localize('editor.dog_duty.providers_count', lang, 'provider(s)')}
                    </div>`
                  : nothing}
                ${wz.llmInstalled && !wz.providers.length
                  ? html`<div class="dog-duty-warn">
                      <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                      ${localize(
                        'editor.dog_duty.provider_missing',
                        lang,
                        'LLM Vision is installed, but no Provider is set up yet. Add Entry → Provider, pick a vision model (e.g. gpt-4o-mini), then check again.'
                      )}
                    </div>`
                  : nothing}
                ${!wz.llmInstalled && wz.message
                  ? html`<div class="dog-duty-warn">
                      <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                      ${wz.message}
                      <a
                        href="https://llmvision.gitbook.io/getting-started/setup/providers"
                        target="_blank"
                        rel="noopener"
                        >${localize('editor.dog_duty.setup_docs', lang, 'Setup docs')}</a
                      >
                    </div>`
                  : nothing}
                ${wz.error ? html`<div class="dog-duty-err">${wz.error}</div>` : nothing}
                ${wz.llmInstalled
                  ? html`<button
                      class="dog-duty-btn primary"
                      style="margin-top: 12px;"
                      @click=${() => {
                        wz.step = 2;
                        this.triggerPreviewUpdate();
                      }}
                    >
                      ${localize('editor.dog_duty.continue', lang, 'Continue')}
                    </button>`
                  : nothing}
              </div>
            `
          : nothing}

        ${wz.step === 2
          ? html`
              <div class="dog-duty-wizard-body">
                <div style="font-weight: 600; margin-bottom: 8px;">
                  ${localize('editor.dog_duty.wizard_step2', lang, 'Pick camera & list')}
                </div>
                <p style="font-size: 13px; color: var(--secondary-text-color); margin: 0 0 12px;">
                  ${localize(
                    'editor.dog_duty.wizard_step2_desc',
                    lang,
                    'Choose your yard camera and Dog Duty to-do list below (Entities section), then continue. Create a Local To-do list named "Dog Duty" in Settings → Devices & services → Helpers if needed.'
                  )}
                </p>
                <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">
                  ${localize('editor.dog_duty.camera', lang, 'Yard camera')}:
                  <strong>${m.camera_entity || '—'}</strong><br />
                  ${localize('editor.dog_duty.todo', lang, 'To-do list')}:
                  <strong>${m.todo_entity || '—'}</strong><br />
                  ${localize('editor.dog_duty.provider', lang, 'Provider')}:
                  <strong>${m.provider_id || wz.providers[0]?.id || '—'}</strong>
                </div>
                ${!m.todo_entity
                  ? html`<div class="dog-duty-warn" style="margin-bottom: 12px;">
                      ${localize(
                        'editor.dog_duty.todo_manual_hint',
                        lang,
                        'Tip: Settings → Devices & services → Helpers → Create Helper → Local To-do → name it "Dog Duty", then pick it in Entities above.'
                      )}
                    </div>`
                  : nothing}
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button
                    class="dog-duty-btn"
                    @click=${() => {
                      wz.step = 1;
                      this.triggerPreviewUpdate();
                    }}
                  >
                    ${localize('editor.dog_duty.back', lang, 'Back')}
                  </button>
                  <button
                    class="dog-duty-btn primary"
                    ?disabled=${!m.camera_entity || !m.todo_entity}
                    @click=${() => {
                      if (!m.provider_id && wz.providers[0]) {
                        updateModule({ provider_id: wz.providers[0].id });
                      }
                      wz.step = 3;
                      this.triggerPreviewUpdate();
                    }}
                  >
                    ${localize('editor.dog_duty.continue', lang, 'Continue')}
                  </button>
                </div>
              </div>
            `
          : nothing}

        ${wz.step === 3
          ? html`
              <div class="dog-duty-wizard-body">
                <div style="font-weight: 600; margin-bottom: 8px;">
                  ${localize('editor.dog_duty.wizard_step3', lang, 'Create automation')}
                </div>
                <p style="font-size: 13px; color: var(--secondary-text-color); margin: 0 0 12px;">
                  ${localize(
                    'editor.dog_duty.wizard_step3_desc',
                    lang,
                    'Creates an automation that snapshots the camera, runs one LLM Vision compare, and writes findings to your to-do list.'
                  )}
                </p>
                <div class="dog-duty-warn" style="margin-bottom: 12px;">
                  <ha-icon
                    icon="${m.trigger_entity ? 'mdi:motion-sensor' : 'mdi:clock-outline'}"
                    style="--mdc-icon-size: 16px;"
                  ></ha-icon>
                  ${m.trigger_entity
                    ? localize(
                        'editor.dog_duty.wizard_mode_sensor',
                        lang,
                        'Sensor mode: {sensor} will trigger a scan right after activity ends — the cheapest way to run this.'
                      ).replace('{sensor}', m.trigger_entity)
                    : localize(
                        'editor.dog_duty.wizard_mode_scheduled',
                        lang,
                        'No trigger sensor selected, so the automation will scan every {interval} between {start} and {end}. That works fine but uses more AI calls — pick a dog/motion sensor in Entities above if you have one.'
                      )
                        .replace(
                          '{interval}',
                          this._formatInterval(m.scan_interval_minutes ?? 30, lang)
                        )
                        .replace('{start}', m.scan_active_start || '07:00')
                        .replace('{end}', m.scan_active_end || '21:00')}
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button
                    class="dog-duty-btn"
                    @click=${() => {
                      wz.step = 2;
                      this.triggerPreviewUpdate();
                    }}
                  >
                    ${localize('editor.dog_duty.back', lang, 'Back')}
                  </button>
                  <button
                    class="dog-duty-btn primary"
                    ?disabled=${wz.creating || !m.camera_entity || !m.todo_entity}
                    @click=${() => this._wizardCreateAutomation(m, hass, updateModule)}
                  >
                    ${wz.creating
                      ? localize('editor.dog_duty.creating', lang, 'Creating…')
                      : localize('editor.dog_duty.create_automation', lang, 'Create automation')}
                  </button>
                </div>
                ${wz.message ? html`<div class="dog-duty-ok" style="margin-top:12px;">${wz.message}</div>` : nothing}
                ${wz.error ? html`<div class="dog-duty-err" style="margin-top:12px;">${wz.error}</div>` : nothing}
                ${m.automation_id
                  ? html`<button
                      class="dog-duty-btn primary"
                      style="margin-top: 12px;"
                      @click=${() => {
                        wz.step = 4;
                        updateModule({ setup_complete: true });
                        this.triggerPreviewUpdate();
                      }}
                    >
                      ${localize('editor.dog_duty.continue', lang, 'Continue')}
                    </button>`
                  : nothing}
              </div>
            `
          : nothing}

        ${wz.step === 4
          ? html`
              <div class="dog-duty-wizard-body">
                <div style="font-weight: 600; margin-bottom: 8px;">
                  ${localize('editor.dog_duty.wizard_step4', lang, 'Test scan')}
                </div>
                <p style="font-size: 13px; color: var(--secondary-text-color); margin: 0 0 12px;">
                  ${localize(
                    'editor.dog_duty.wizard_step4_desc',
                    lang,
                    'Run an on-demand scan against the current camera frame. Coordinate accuracy is approximate — keep a fixed camera angle.'
                  )}
                </p>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button
                    class="dog-duty-btn"
                    @click=${() => {
                      wz.step = 3;
                      this.triggerPreviewUpdate();
                    }}
                  >
                    ${localize('editor.dog_duty.back', lang, 'Back')}
                  </button>
                  <button
                    class="dog-duty-btn primary"
                    ?disabled=${wz.testing || !m.camera_entity || !m.provider_id}
                    @click=${() => this._wizardTestScan(m, hass)}
                  >
                    ${wz.testing
                      ? localize('editor.dog_duty.scanning', lang, 'Scanning…')
                      : localize('editor.dog_duty.run_test', lang, 'Run test scan')}
                  </button>
                </div>
                ${wz.testResult
                  ? html`<div class="dog-duty-ok" style="margin-top:12px; white-space: pre-wrap;">${wz.testResult}</div>`
                  : nothing}
                ${wz.error ? html`<div class="dog-duty-err" style="margin-top:12px;">${wz.error}</div>` : nothing}
                <button
                  class="dog-duty-btn primary"
                  style="margin-top: 12px;"
                  @click=${() => {
                    updateModule({ setup_complete: true });
                    st.wizardCollapsed = true;
                    wz.message = localize(
                      'editor.dog_duty.setup_done',
                      lang,
                      'Setup complete. Detections will appear on the map.'
                    );
                    this.triggerPreviewUpdate();
                  }}
                >
                  ${localize('editor.dog_duty.finish', lang, 'Finish')}
                </button>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private async _wizardCheckPrereqs(
    m: DogDutyModule,
    hass: HomeAssistant,
    updateModule?: (updates: Partial<CardModule>) => void
  ): Promise<void> {
    const wz = this._ensureWizard(m.id);
    const lang = hass?.locale?.language || 'en';
    wz.checking = true;
    wz.error = '';
    wz.message = '';
    this.triggerPreviewUpdate();
    try {
      const result = await ucDogDutyService.detectLlmVision(hass);
      wz.llmInstalled = result.installed;
      wz.providers = result.providers;
      if (!result.installed) {
        wz.message = localize(
          'editor.dog_duty.llm_missing',
          lang,
          'LLM Vision is not installed. Install it via HACS, add the integration, then add a Provider with a vision model.'
        );
      } else if (!result.providers.length) {
        wz.message = localize(
          'editor.dog_duty.provider_missing',
          lang,
          'LLM Vision is installed, but no Provider is set up yet. Add Entry → Provider (e.g. Anthropic Claude), then check again. Do not use “LLM Vision Settings” as the provider.'
        );
        // Still allow continue — user can paste provider id manually
        wz.llmInstalled = true;
      } else {
        // Auto-select a real provider. Never keep "LLM Vision Settings" — that
        // entry_id causes invalid_model (ha-llmvision#653).
        const currentOk = result.providers.some(p => p.id === m.provider_id);
        if (!currentOk && updateModule) {
          const preferred =
            result.providers.find(p => /anthropic|claude|openai|google|gemini|ollama/i.test(p.title)) ||
            result.providers[0];
          if (preferred) {
            updateModule({ provider_id: preferred.id });
            wz.message = localize(
              'editor.dog_duty.provider_auto_selected',
              lang,
              'Selected provider: {name}'
            ).replace('{name}', preferred.title);
          }
        }
      }
    } catch (err: any) {
      wz.error = err?.message || String(err);
    } finally {
      wz.checking = false;
      this.triggerPreviewUpdate();
    }
  }

  private async _wizardCreateAutomation(
    m: DogDutyModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): Promise<void> {
    const wz = this._ensureWizard(m.id);
    const lang = hass?.locale?.language || 'en';
    wz.creating = true;
    wz.error = '';
    wz.message = '';
    this.triggerPreviewUpdate();

    const providerId = m.provider_id || wz.providers[0]?.id || '';
    if (!providerId) {
      wz.creating = false;
      wz.error = localize(
        'editor.dog_duty.need_provider',
        lang,
        'Select or paste an LLM Vision provider ID first.'
      );
      this.triggerPreviewUpdate();
      return;
    }

    const result = await ucDogDutyService.createOrUpdateAutomation(hass, {
      cameraEntity: m.camera_entity,
      todoEntity: m.todo_entity,
      providerId,
      triggerEntity: m.trigger_entity || undefined,
      cooldownMinutes: m.scan_cooldown_minutes ?? 10,
      intervalMinutes: m.scan_interval_minutes ?? 30,
      activeStart: m.scan_active_start || '07:00',
      activeEnd: m.scan_active_end || '21:00',
      automationId: m.automation_id || undefined,
      ...this._detectionOpts(m),
    });

    wz.creating = false;
    if (result.ok) {
      updateModule({
        automation_id: result.automationId,
        provider_id: providerId,
        setup_complete: true,
      });
      wz.message = localize(
        'editor.dog_duty.automation_created',
        lang,
        'Automation created: {id}. Reload automations if it does not appear immediately.'
      ).replace('{id}', result.automationId);
    } else {
      wz.error =
        result.error ||
        localize(
          'editor.dog_duty.automation_failed',
          lang,
          'Could not create the automation automatically. You may need admin permissions, or create it manually from the generated template.'
        );
    }
    this.triggerPreviewUpdate();
  }

  private async _wizardTestScan(m: DogDutyModule, hass: HomeAssistant): Promise<void> {
    const wz = this._ensureWizard(m.id);
    const lang = hass?.locale?.language || 'en';
    wz.testing = true;
    wz.error = '';
    wz.testResult = '';
    this.triggerPreviewUpdate();

    const result = await ucDogDutyService.scanNow(hass, {
      cameraEntity: m.camera_entity,
      todoEntity: m.todo_entity,
      providerId: m.provider_id || wz.providers[0]?.id || '',
      writeEvents: !!m.todo_entity,
      ...this._detectionOpts(m),
    });

    wz.testing = false;
    if (result.error) {
      wz.error = result.error;
    } else if (result.found) {
      wz.testResult = localize(
        'editor.dog_duty.test_found',
        lang,
        'Found {count} spot(s). Markers were added to the to-do list.'
      ).replace('{count}', String(result.spots.length));
      const st = this._ensurePreview(m);
      st.lastFetchedAt = 0;
    } else {
      wz.testResult = localize(
        'editor.dog_duty.test_none',
        lang,
        'No droppings detected in the current frame.'
      );
    }
    this.triggerPreviewUpdate();
  }

  // ── Preview / dashboard render ─────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as DogDutyModule;
    const lang = hass?.locale?.language || 'en';
    const st = this._ensurePreview(m);

    // Kick off async fetch (non-blocking)
    this._ensureEventsLoaded(m, hass);

    const lookbackMs = (m.lookback_hours || 48) * 3600 * 1000;
    const now = Date.now();
    const windowStart = now - lookbackMs;
    const scrubEnd = windowStart + st.scrubRatio * lookbackMs;

    const cameras = getDogDutyCameras(m);
    const primaryCamera = cameras[0] || m.camera_entity || '';
    const multiCam = cameras.length > 1;
    const layout = m.cameras_layout === 'grid' && multiCam ? 'grid' : 'stack';

    const inWindow = st.events.filter(e => e.detectedAt >= windowStart && e.detectedAt <= scrubEnd);
    const visibleAll = inWindow.filter(e => m.show_cleaned || !e.cleaned);
    const active = st.events.filter(
      e => !e.cleaned && e.detectedAt >= windowStart && e.detectedAt <= now
    );
    const weekAgo = now - 7 * 24 * 3600 * 1000;
    const weekEvents = st.events.filter(e => e.detectedAt >= weekAgo);
    const thisWeek = weekEvents.length;

    const title =
      m.title?.trim() ||
      localize('editor.dog_duty.default_title', lang, 'Dog Duty');

    const selected =
      visibleAll.find(e => e.uid === st.selectedUid) ||
      st.events.find(e => e.uid === st.selectedUid) ||
      null;

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div class="dog-duty-card" data-context=${previewContext || 'dashboard'}>
        ${m.show_title !== false
          ? html`<div class="dog-duty-header">
              <ha-icon icon="mdi:dog"></ha-icon>
              <span>${title}</span>
            </div>`
          : nothing}

        ${m.show_status_bar !== false
          ? html`
              <div class="dog-duty-status">
                <button
                  class="dog-duty-chip toggle ${st.listPanel === 'active' ? 'on' : ''}"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    st.listPanel = st.listPanel === 'active' ? null : 'active';
                    this.triggerPreviewUpdate(true);
                  }}
                  title=${localize('editor.dog_duty.chip_active_title', lang, 'View active detections')}
                >
                  ${active.length}
                  ${localize('editor.dog_duty.chip_active', lang, 'active')}
                </button>
                <button
                  class="dog-duty-chip toggle ${st.listPanel === 'week' ? 'on' : ''}"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    st.listPanel = st.listPanel === 'week' ? null : 'week';
                    this.triggerPreviewUpdate(true);
                  }}
                  title=${localize('editor.dog_duty.chip_week_title', lang, 'View this week’s detections')}
                >
                  ${thisWeek}
                  ${localize('editor.dog_duty.chip_week', lang, 'this week')}
                </button>
                <button
                  class="dog-duty-chip toggle ${st.showHeatmap ? 'on' : ''}"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    st.showHeatmap = !st.showHeatmap;
                    this.triggerPreviewUpdate(true);
                  }}
                  title=${localize('editor.dog_duty.heatmap_toggle', lang, 'Toggle heatmap')}
                >
                  <ha-icon icon="mdi:fire"></ha-icon>
                  ${localize('editor.dog_duty.heatmap', lang, 'Heatmap')}
                </button>
                ${m.show_scan_now !== false
                  ? html`<button
                      class="dog-duty-chip action"
                      ?disabled=${st.scanning || cameras.length === 0 || !m.provider_id}
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._scanNow(m, hass, st);
                      }}
                    >
                      <ha-icon icon=${st.scanning ? 'mdi:loading' : 'mdi:magnify-scan'}></ha-icon>
                      ${st.scanning
                        ? localize('editor.dog_duty.scanning', lang, 'Scanning…')
                        : localize('editor.dog_duty.scan_now', lang, 'Scan Now')}
                    </button>`
                  : nothing}
              </div>
            `
          : nothing}

        ${st.scanMessage
          ? html`<div class="dog-duty-scan-msg">${st.scanMessage}</div>`
          : nothing}

        ${st.listPanel
          ? this._renderEventList(
              m,
              hass,
              st,
              st.listPanel === 'active' ? active : weekEvents,
              cameras,
              lang
            )
          : nothing}

        <div class="dog-duty-maps ${layout}">
          ${(cameras.length ? cameras : ['']).map(cameraId => {
            const camEvents = visibleAll.filter(e =>
              eventMatchesCamera(e, cameraId, primaryCamera)
            );
            const camSelected =
              selected && eventMatchesCamera(selected, cameraId, primaryCamera)
                ? selected
                : null;
            const label = cameraFriendlyName(hass, cameraId);
            return html`
              <div class="dog-duty-map-wrap">
                ${multiCam && cameraId
                  ? html`<div class="dog-duty-cam-label">
                      <ha-icon icon="mdi:cctv"></ha-icon>
                      <span>${label}</span>
                    </div>`
                  : nothing}
                <div
                  class="dog-duty-map"
                  @click=${() => {
                    if (st.selectedUid) {
                      st.selectedUid = null;
                      this.triggerPreviewUpdate(true);
                    }
                  }}
                >
                  ${this._renderMapBackgroundForCamera(m, hass, lang, cameraId)}
                  ${this._renderRoiOverlay(m)}
                  ${st.showHeatmap ? this._renderHeatmap(camEvents) : nothing}
                  ${camEvents.map(ev => this._renderMarker(m, ev, st, lang))}
                  ${!st.loading && camEvents.length === 0 && m.todo_entity
                    ? html`<div class="dog-duty-empty">
                        ${multiCam
                          ? localize('editor.dog_duty.no_events_short', lang, 'No detections')
                          : localize(
                              'editor.dog_duty.no_events',
                              lang,
                              'No detections in this time window'
                            )}
                      </div>`
                    : nothing}
                  ${camSelected
                    ? this._renderDetailPopup(m, camSelected, hass, st, lang)
                    : nothing}
                </div>
              </div>
            `;
          })}
        </div>

        ${m.show_scrubber !== false
          ? this._renderScrubber(
              m,
              hass,
              st,
              m.show_cleaned ? st.events : st.events.filter(e => !e.cleaned),
              windowStart,
              now,
              lang
            )
          : nothing}

        ${!m.todo_entity || cameras.length === 0
          ? html`<div class="dog-duty-setup-hint">
              ${localize(
                'editor.dog_duty.setup_hint',
                lang,
                'Open the General tab and run the setup wizard to connect a camera, to-do list, and LLM Vision.'
              )}
            </div>`
          : nothing}
      </div>
    `;
  }

  private _renderEventList(
    m: DogDutyModule,
    hass: HomeAssistant,
    st: PreviewState,
    events: DogDutyEvent[],
    cameras: string[],
    lang: string
  ): TemplateResult {
    const multiCam = cameras.length > 1;
    const sorted = [...events].sort((a, b) => {
      switch (st.listSort) {
        case 'camera': {
          const ca = a.payload.camera || '';
          const cb = b.payload.camera || '';
          return ca.localeCompare(cb) || b.detectedAt - a.detectedAt;
        }
        case 'confidence': {
          const ca = a.payload.confidence ?? -1;
          const cb = b.payload.confidence ?? -1;
          return cb - ca || b.detectedAt - a.detectedAt;
        }
        case 'status': {
          const sa = a.cleaned ? 1 : 0;
          const sb = b.cleaned ? 1 : 0;
          return sa - sb || b.detectedAt - a.detectedAt;
        }
        case 'time':
        default:
          return b.detectedAt - a.detectedAt;
      }
    });

    const title =
      st.listPanel === 'active'
        ? localize('editor.dog_duty.list_active_title', lang, 'Active detections')
        : localize('editor.dog_duty.list_week_title', lang, 'This week');

    return html`
      <div class="dog-duty-list-panel" @click=${(e: Event) => e.stopPropagation()}>
        <div class="dog-duty-list-header">
          <strong>${title}</strong>
          <button
            class="dog-duty-icon-btn"
            @click=${() => {
              st.listPanel = null;
              this.triggerPreviewUpdate(true);
            }}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <div class="dog-duty-list-sorts">
          ${(
            [
              ['time', localize('editor.dog_duty.sort_time', lang, 'Time')],
              ...(multiCam
                ? [['camera', localize('editor.dog_duty.sort_camera', lang, 'Camera')] as const]
                : []),
              ['confidence', localize('editor.dog_duty.sort_confidence', lang, 'Confidence')],
              ['status', localize('editor.dog_duty.sort_status', lang, 'Status')],
            ] as Array<[PreviewState['listSort'], string]>
          ).map(
            ([key, label]) => html`
              <button
                class="dog-duty-sort-btn ${st.listSort === key ? 'on' : ''}"
                @click=${() => {
                  st.listSort = key;
                  this.triggerPreviewUpdate(true);
                }}
              >
                ${label}
              </button>
            `
          )}
        </div>
        <div class="dog-duty-list-scroll">
          ${sorted.length === 0
            ? html`<div class="dog-duty-list-empty">
                ${localize('editor.dog_duty.list_empty', lang, 'No detections in this list.')}
              </div>`
            : sorted.map(ev => {
                const conf =
                  typeof ev.payload.confidence === 'number'
                    ? `${Math.round(ev.payload.confidence * 100)}%`
                    : '—';
                const place = `${Math.round(clamp01(ev.payload.x) * 100)}%, ${Math.round(clamp01(ev.payload.y) * 100)}%`;
                const cam = ev.payload.camera
                  ? cameraFriendlyName(hass, ev.payload.camera)
                  : cameras[0]
                    ? cameraFriendlyName(hass, cameras[0])
                    : '—';
                return html`
                  <button
                    class="dog-duty-list-row ${ev.cleaned ? 'cleaned' : ''} ${st.selectedUid === ev.uid ? 'selected' : ''}"
                    @click=${() => {
                      st.selectedUid = ev.uid;
                      st.listPanel = null;
                      this.triggerPreviewUpdate(true);
                    }}
                  >
                    <div class="dog-duty-list-row-main">
                      <span class="dog-duty-list-summary">${ev.summary}</span>
                      <span class="dog-duty-list-status ${ev.cleaned ? 'ok' : 'active'}">
                        ${ev.cleaned
                          ? localize('editor.dog_duty.cleaned', lang, 'Cleaned')
                          : localize('editor.dog_duty.status_active', lang, 'Still there')}
                      </span>
                    </div>
                    <div class="dog-duty-list-row-meta">
                      <span>${formatRelativeTime(ev.detectedAt, lang)}</span>
                      <span
                        >${localize('editor.dog_duty.placement', lang, 'Placement')}:
                        ${place}</span
                      >
                      <span
                        >${localize('editor.dog_duty.confidence', lang, 'Confidence')}:
                        ${conf}</span
                      >
                      ${multiCam ? html`<span>${cam}</span>` : nothing}
                    </div>
                  </button>
                `;
              })}
        </div>
      </div>
    `;
  }

  private _renderMarker(
    m: DogDutyModule,
    ev: DogDutyEvent,
    st: PreviewState,
    lang: string
  ): TemplateResult {
    const left = `${clamp01(ev.payload.x) * 100}%`;
    const top = `${clamp01(ev.payload.y) * 100}%`;
    const selected = st.selectedUid === ev.uid;
    const style = m.marker_style || 'x';

    let glyph: TemplateResult;
    if (ev.cleaned) {
      glyph = html`<ha-icon icon="mdi:check-circle"></ha-icon>`;
    } else if (style === 'emoji') {
      glyph = html`<span class="dog-duty-emoji">💩</span>`;
    } else if (style === 'pin') {
      glyph = html`<ha-icon icon="mdi:map-marker"></ha-icon>`;
    } else {
      glyph = html`<span class="dog-duty-x">✕</span>`;
    }

    return html`
      <button
        class="dog-duty-marker ${ev.cleaned ? 'cleaned' : ''} ${selected ? 'selected' : ''}"
        style="left:${left};top:${top};"
        title=${ev.summary}
        @click=${(e: Event) => {
          e.stopPropagation();
          st.selectedUid = selected ? null : ev.uid;
          this.triggerPreviewUpdate(true);
        }}
      >
        <span class="dog-duty-zone" aria-hidden="true"></span>
        <span class="dog-duty-glyph" aria-label=${localize('editor.dog_duty.marker', lang, 'Marker')}
          >${glyph}</span
        >
      </button>
    `;
  }

  private _renderHeatmap(events: DogDutyEvent[]): TemplateResult {
    // Simple radial density blobs at each event position
    return html`
      <div class="dog-duty-heatmap" aria-hidden="true">
        ${events.map(ev => {
          const left = `${clamp01(ev.payload.x) * 100}%`;
          const top = `${clamp01(ev.payload.y) * 100}%`;
          return html`<span class="dog-duty-heat" style="left:${left};top:${top};"></span>`;
        })}
      </div>
    `;
  }

  private _renderDetailPopup(
    m: DogDutyModule,
    ev: DogDutyEvent,
    hass: HomeAssistant,
    st: PreviewState,
    lang: string
  ): TemplateResult {
    const ago = formatRelativeTime(ev.detectedAt, lang);
    const conf =
      typeof ev.payload.confidence === 'number'
        ? `${Math.round(ev.payload.confidence * 100)}%`
        : null;
    const snap = ev.payload.snapshot
      ? resolveMediaPath(ev.payload.snapshot)
      : null;

    return html`
      <div
        class="dog-duty-popup"
        @click=${(e: Event) => e.stopPropagation()}
      >
        <div class="dog-duty-popup-header">
          <strong>${ev.summary}</strong>
          <button
            class="dog-duty-icon-btn"
            @click=${() => {
              st.selectedUid = null;
              this.triggerPreviewUpdate(true);
            }}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        ${snap
          ? html`<img class="dog-duty-popup-snap" src=${snap} alt="" />`
          : nothing}
        <div class="dog-duty-popup-meta">
          <span>${ago}</span>
          ${conf
            ? html`<span
                >${localize('editor.dog_duty.confidence', lang, 'Confidence')}:
                ${conf}</span
              >`
            : nothing}
          ${ev.cleaned
            ? html`<span class="cleaned-tag"
                >${localize('editor.dog_duty.cleaned', lang, 'Cleaned')}</span
              >`
            : nothing}
        </div>
        ${ev.payload.description
          ? html`<div class="dog-duty-popup-desc">${ev.payload.description}</div>`
          : nothing}
        <div class="dog-duty-popup-actions">
          ${!ev.cleaned
            ? html`<button
                class="dog-duty-btn primary"
                @click=${async () => {
                  try {
                    await ucDogDutyService.markCleaned(hass, m.todo_entity, ev.uid);
                  } catch (err) {
                    console.warn('[UltraCard] Dog Duty mark cleaned failed', err);
                  }
                  // Optimistic local update so the pin leaves the map immediately
                  const target = st.events.find(e => e.uid === ev.uid);
                  if (target) {
                    target.cleaned = true;
                    target.status = 'completed';
                  }
                  ev.cleaned = true;
                  ev.status = 'completed';
                  st.selectedUid = null;
                  st.lastFetchedAt = 0;
                  this.triggerPreviewUpdate(true);
                  this._ensureEventsLoaded(m, hass);
                }}
              >
                ${localize('editor.dog_duty.mark_cleaned', lang, 'Mark as cleaned')}
              </button>`
            : html`<button
                class="dog-duty-btn"
                @click=${async () => {
                  try {
                    await ucDogDutyService.markNeedsAction(hass, m.todo_entity, ev.uid);
                  } catch (err) {
                    console.warn('[UltraCard] Dog Duty mark active failed', err);
                  }
                  const target = st.events.find(e => e.uid === ev.uid);
                  if (target) {
                    target.cleaned = false;
                    target.status = 'needs_action';
                  }
                  ev.cleaned = false;
                  ev.status = 'needs_action';
                  st.lastFetchedAt = 0;
                  this.triggerPreviewUpdate(true);
                  this._ensureEventsLoaded(m, hass);
                }}
              >
                ${localize('editor.dog_duty.mark_active', lang, 'Mark active')}
              </button>`}
          <button
            class="dog-duty-btn danger"
            @click=${async () => {
              try {
                await ucDogDutyService.removeEvent(hass, m.todo_entity, ev.uid);
              } catch (err) {
                console.warn('[UltraCard] Dog Duty remove failed', err);
              }
              st.events = st.events.filter(e => e.uid !== ev.uid);
              st.selectedUid = null;
              st.lastFetchedAt = 0;
              this.triggerPreviewUpdate(true);
              this._ensureEventsLoaded(m, hass);
            }}
          >
            ${localize('editor.dog_duty.false_alarm', lang, 'False alarm')}
          </button>
        </div>
      </div>
    `;
  }

  private _renderScrubber(
    m: DogDutyModule,
    hass: HomeAssistant,
    st: PreviewState,
    events: DogDutyEvent[],
    windowStart: number,
    now: number,
    lang: string
  ): TemplateResult {
    const span = Math.max(1, now - windowStart);
    const lookbackHours = m.lookback_hours || 48;
    const scrubMs = windowStart + st.scrubRatio * span;
    const active = st.scrubRatio < 0.995;
    const playheadPct = active ? st.scrubRatio * 100 : 100;

    const markers = events
      .filter(e => e.detectedAt >= windowStart && e.detectedAt <= now)
      .map(e => ({
        pct: ((e.detectedAt - windowStart) / span) * 100,
        cleaned: e.cleaned,
        title: `${e.summary} · ${formatClockTime(e.detectedAt, hass)}`,
      }));

    const tickCount = lookbackHours <= 6 ? 6 : lookbackHours <= 24 ? 8 : lookbackHours <= 48 ? 8 : 7;

    return html`
      <div class="dog-duty-scrubber ${active ? 'scrubbing' : ''}">
        <div class="dog-duty-scrub-header">
          <div class="dog-duty-scrub-status">
            <span class="dog-duty-scrub-dot ${active ? 'past' : 'live'}"></span>
            <div class="dog-duty-scrub-time">
              <span class="dog-duty-scrub-clock">
                ${active
                  ? html`<span class="dog-duty-scrub-day">${formatScrubDay(scrubMs, lang)}</span>
                      ${formatClockTime(scrubMs, hass)}`
                  : localize('editor.dog_duty.live', lang, 'Live')}
              </span>
              <span class="dog-duty-scrub-delta">
                ${active
                  ? formatScrubDelta(now - scrubMs, lang)
                  : markers.length > 0
                    ? localize(
                        'editor.dog_duty.scrub_events',
                        lang,
                        '{count} detection(s) in window'
                      ).replace('{count}', String(markers.length))
                    : localize(
                        'editor.dog_duty.scrub_live_desc',
                        lang,
                        'Showing current yard view'
                      )}
              </span>
            </div>
          </div>
          ${active
            ? html`
                <button
                  class="dog-duty-scrub-live-btn"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    st.scrubRatio = 1;
                    this.triggerPreviewUpdate(true);
                  }}
                >
                  <ha-icon icon="mdi:fast-forward"></ha-icon>
                  ${localize('editor.dog_duty.return_to_live', lang, 'Return to live')}
                </button>
              `
            : nothing}
        </div>

        <div
          class="dog-duty-scrub-track"
          role="slider"
          tabindex="0"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow=${Math.round(playheadPct)}
          aria-label=${localize('editor.dog_duty.scrubber', lang, 'Time scrubber')}
          @pointerdown=${(e: PointerEvent) => this._onScrubPointerDown(e, m, st)}
          @pointermove=${(e: PointerEvent) => this._onScrubPointerMove(e, m, st)}
          @pointerup=${(e: PointerEvent) => this._onScrubPointerUp(e)}
          @pointercancel=${(e: PointerEvent) => this._onScrubPointerUp(e)}
          @keydown=${(e: KeyboardEvent) => this._onScrubKeydown(e, st)}
        >
          ${Array.from({ length: tickCount - 1 }, (_, i) => {
            const pct = ((i + 1) / tickCount) * 100;
            return html`<span class="dog-duty-scrub-tick" style="left:${pct}%"></span>`;
          })}
          ${markers.map(
            mk => html`<span
              class="dog-duty-scrub-marker ${mk.cleaned ? 'cleaned' : ''}"
              style="left:${mk.pct}%"
              title=${mk.title}
            ></span>`
          )}
          ${active
            ? html`<span class="dog-duty-scrub-shade" style="width:${100 - playheadPct}%"></span>`
            : nothing}
          <span class="dog-duty-scrub-playhead" style="left:${playheadPct}%"></span>
          <span class="dog-duty-scrub-handle" style="left:${playheadPct}%"></span>
        </div>

        <div class="dog-duty-scrub-axis">
          <span>−${lookbackHours}h</span>
          <span>${localize('editor.dog_duty.now', lang, 'Now')}</span>
        </div>
      </div>
    `;
  }

  private _scrubFromPointer(e: PointerEvent, st: PreviewState): void {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    st.scrubRatio = frac >= 0.995 ? 1 : frac;
    this.triggerPreviewUpdate(true);
  }

  private _onScrubPointerDown(e: PointerEvent, _m: DogDutyModule, st: PreviewState): void {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
    this._scrubFromPointer(e, st);
  }

  private _onScrubPointerMove(e: PointerEvent, _m: DogDutyModule, st: PreviewState): void {
    const el = e.currentTarget as HTMLElement;
    if (!el.hasPointerCapture(e.pointerId)) return;
    this._scrubFromPointer(e, st);
  }

  private _onScrubPointerUp(e: PointerEvent): void {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  }

  private _onScrubKeydown(e: KeyboardEvent, st: PreviewState): void {
    const step = e.shiftKey ? 0.05 : 0.02;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      st.scrubRatio = Math.max(0, st.scrubRatio - step);
      this.triggerPreviewUpdate(true);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      st.scrubRatio = Math.min(1, st.scrubRatio + step);
      this.triggerPreviewUpdate(true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      st.scrubRatio = 0;
      this.triggerPreviewUpdate(true);
    } else if (e.key === 'End') {
      e.preventDefault();
      st.scrubRatio = 1;
      this.triggerPreviewUpdate(true);
    }
  }

  // ── Data helpers ───────────────────────────────────────────────────────────

  private _ensurePreview(m: DogDutyModule): PreviewState {
    let st = this._preview.get(m.id);
    if (!st) {
      st = {
        events: [],
        loading: false,
        scrubRatio: 1,
        selectedUid: null,
        scanning: false,
        scanMessage: '',
        lastFetchedAt: 0,
        showHeatmap: !!m.show_heatmap,
        listPanel: null,
        listSort: 'time',
        wizardCollapsed: !!m.setup_complete,
      };
      this._preview.set(m.id, st);
    }
    return st;
  }

  private _ensureWizard(moduleId: string): WizardState {
    let wz = this._wizard.get(moduleId);
    if (!wz) {
      wz = {
        step: 1,
        checking: false,
        llmInstalled: false,
        providers: [],
        creating: false,
        message: '',
        error: '',
        testing: false,
        testResult: '',
      };
      this._wizard.set(moduleId, wz);
    }
    return wz;
  }

  private _ensureEventsLoaded(m: DogDutyModule, hass: HomeAssistant): void {
    if (!m.todo_entity || !hass) return;
    const st = this._ensurePreview(m);
    const now = Date.now();
    if (st.loading) return;
    if (st.lastFetchedAt > 0 && now - st.lastFetchedAt < 2000) return;
    st.loading = true;

    ucDogDutyService
      .getEvents(hass, m.todo_entity, () => {
        // Live update from todo state_changed — force a refresh, keep UI state
        const cur = this._preview.get(m.id);
        if (cur) cur.lastFetchedAt = 0;
        this._ensureEventsLoaded(m, hass);
      })
      .then(events => {
        const cur = this._ensurePreview(m);
        cur.events = events;
        cur.loading = false;
        cur.lastFetchedAt = Date.now();
        this.triggerPreviewUpdate(true);
      })
      .catch(() => {
        const cur = this._ensurePreview(m);
        cur.loading = false;
        cur.lastFetchedAt = Date.now();
      });
  }

  private async _scanNow(m: DogDutyModule, hass: HomeAssistant, st: PreviewState): Promise<void> {
    const lang = hass?.locale?.language || 'en';
    if (st.scanning) return;
    const cameras = getDogDutyCameras(m);
    if (!cameras.length || !m.provider_id) return;

    st.scanning = true;
    st.scanMessage = '';
    this.triggerPreviewUpdate(true);

    let totalSpots = 0;
    let lastError = '';
    for (const cameraEntity of cameras) {
      const result: DogDutyScanResult = await ucDogDutyService.scanNow(hass, {
        cameraEntity,
        todoEntity: m.todo_entity,
        providerId: m.provider_id || '',
        writeEvents: true,
        ...this._detectionOpts(m),
      });
      if (result.error) lastError = result.error;
      if (result.found) totalSpots += result.spots.length;
    }

    st.scanning = false;
    if (totalSpots > 0) {
      st.scanMessage = localize(
        'editor.dog_duty.scan_found',
        lang,
        'Found {count} spot(s)'
      ).replace('{count}', String(totalSpots));
      st.lastFetchedAt = 0;
      this._ensureEventsLoaded(m, hass);
    } else if (lastError) {
      st.scanMessage = lastError;
    } else {
      st.scanMessage = localize(
        'editor.dog_duty.scan_none',
        lang,
        'No droppings detected'
      );
    }
    this.triggerPreviewUpdate(true);
  }

  private _renderMapBackgroundForCamera(
    m: DogDutyModule,
    hass: HomeAssistant,
    lang: string,
    cameraEntity: string
  ): TemplateResult {
    const useLiveCamera =
      (m.background_mode || 'live_snapshot') !== 'reference' && !!cameraEntity && !!hass;

    if (useLiveCamera) {
      return html`
        <hui-image
          class="dog-duty-bg dog-duty-bg-camera"
          .hass=${hass}
          .cameraImage=${cameraEntity}
          .cameraView=${'auto'}
        ></hui-image>
      `;
    }

    const bgUrl = this._backgroundUrl(m, hass);
    if (bgUrl) {
      return html`<img class="dog-duty-bg" src=${bgUrl} alt="" draggable="false" />`;
    }

    return html`<div class="dog-duty-bg-placeholder">
      <ha-icon icon="mdi:cctv-off"></ha-icon>
      <span
        >${localize(
          'editor.dog_duty.no_camera',
          lang,
          'Select a yard camera to show the map'
        )}</span
      >
    </div>`;
  }

  private _renderMapBackground(
    m: DogDutyModule,
    hass: HomeAssistant,
    lang: string,
    _bgUrl: string
  ): TemplateResult {
    return this._renderMapBackgroundForCamera(m, hass, lang, m.camera_entity);
  }

  private _backgroundUrl(m: DogDutyModule, hass: HomeAssistant): string {
    if (m.background_mode === 'reference' && m.reference_image) {
      return resolveMediaPath(m.reference_image);
    }
    if (m.camera_entity && hass) {
      const state = hass.states?.[m.camera_entity];
      const accessToken = state?.attributes?.access_token;
      const t = Math.floor(Date.now() / 30000);
      let path = `/api/camera_proxy/${m.camera_entity}?t=${t}`;
      if (accessToken) {
        path += `&token=${encodeURIComponent(String(accessToken))}`;
      }
      const hassUrlFn = (hass as any).hassUrl;
      if (typeof hassUrlFn === 'function') {
        try {
          return hassUrlFn(path);
        } catch {
          /* fall through */
        }
      }
      return path;
    }
    return '';
  }

  private renderProLockUI(lang: string): TemplateResult {
    return html`
      <div
        class="pro-lock-container"
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          text-align: center;
          background: var(--secondary-background-color);
          border-radius: 12px;
          margin: 16px;
        "
      >
        <ha-icon
          icon="mdi:lock"
          style="color: var(--primary-color); --mdi-icon-size: 48px; margin-bottom: 16px;"
        ></ha-icon>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
          ${localize('editor.pro.feature_locked', lang, 'Pro Feature')}
        </div>
        <div
          style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 16px; max-width: 320px;"
        >
          ${localize(
            'editor.dog_duty.pro_description',
            lang,
            'Dog Duty is a Pro feature that uses your yard camera and LLM Vision to mark where the dog went, with a scrubber and cleanup tracking.'
          )}
        </div>
        <a
          href="https://ultracard.io/pro"
          target="_blank"
          style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--primary-color);
            color: var(--text-primary-color, white);
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
          "
        >
          <ha-icon icon="mdi:crown" style="--mdi-icon-size: 20px;"></ha-icon>
          ${localize('editor.pro.upgrade_button', lang, 'Upgrade to Pro')}
        </a>
      </div>
    `;
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}

      .dog-duty-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        min-width: 0;
      }

      .dog-duty-maps {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        min-width: 0;
      }
      .dog-duty-maps.grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px;
      }
      .dog-duty-map-wrap {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
      }
      .dog-duty-cam-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .dog-duty-cam-label ha-icon {
        --mdc-icon-size: 16px;
      }

      .dog-duty-list-panel {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        max-height: 280px;
      }
      .dog-duty-list-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .dog-duty-list-sorts {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .dog-duty-sort-btn {
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--secondary-text-color);
        border-radius: 999px;
        padding: 3px 10px;
        font: inherit;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
      }
      .dog-duty-sort-btn.on {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .dog-duty-list-scroll {
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-height: 0;
        flex: 1;
        -webkit-overflow-scrolling: touch;
      }
      .dog-duty-list-empty {
        font-size: 12px;
        color: var(--secondary-text-color);
        padding: 8px 2px;
      }
      .dog-duty-list-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: left;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        border-radius: 10px;
        padding: 8px 10px;
        cursor: pointer;
        font: inherit;
        color: inherit;
      }
      .dog-duty-list-row.selected {
        border-color: var(--primary-color);
      }
      .dog-duty-list-row.cleaned {
        opacity: 0.72;
      }
      .dog-duty-list-row-main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .dog-duty-list-summary {
        font-weight: 600;
        font-size: 13px;
      }
      .dog-duty-list-status {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        flex-shrink: 0;
      }
      .dog-duty-list-status.active {
        background: color-mix(in srgb, var(--warning-color, #ff9800) 18%, transparent);
        color: var(--warning-color, #ff9800);
      }
      .dog-duty-list-status.ok {
        background: color-mix(in srgb, var(--success-color, #4caf50) 18%, transparent);
        color: var(--success-color, #4caf50);
      }
      .dog-duty-list-row-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 12px;
        font-size: 11px;
        color: var(--secondary-text-color);
      }

      .dog-duty-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 700;
        color: var(--primary-text-color);
      }
      .dog-duty-header ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 22px;
      }

      .dog-duty-status {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }

      .dog-duty-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
      }
      .dog-duty-chip.toggle,
      .dog-duty-chip.action {
        cursor: pointer;
        font: inherit;
      }
      .dog-duty-chip.toggle.on {
        background: color-mix(in srgb, var(--primary-color) 22%, transparent);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
      .dog-duty-chip.action {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: transparent;
      }
      .dog-duty-chip.action:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .dog-duty-chip ha-icon {
        --mdc-icon-size: 14px;
      }

      .dog-duty-scan-msg {
        font-size: 12px;
        color: var(--secondary-text-color);
        padding: 0 2px;
      }

      .dog-duty-map {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 10;
        border-radius: 12px;
        overflow: hidden;
        background: var(--disabled-text-color, #333);
        isolation: isolate;
      }

      .dog-duty-roi-mask {
        position: absolute;
        z-index: 1;
        pointer-events: none;
        border: 2px solid rgba(64, 180, 255, 0.85);
        border-radius: 4px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);
      }
      .dog-duty-roi-mask.editing {
        border-color: var(--primary-color, #03a9f4);
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
      }
      .dog-duty-roi-mask.empty {
        inset: 0;
        border: 2px dashed rgba(255, 255, 255, 0.35);
        box-shadow: none;
        border-radius: 0;
      }

      .dog-duty-roi-canvas {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 10;
        border-radius: 12px;
        overflow: hidden;
        background: var(--disabled-text-color, #333);
        touch-action: none;
        cursor: crosshair;
        user-select: none;
      }
      .dog-duty-roi-hint {
        position: absolute;
        left: 8px;
        bottom: 8px;
        z-index: 3;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        pointer-events: none;
      }
      .dog-duty-roi-summary {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .dog-duty-link-btn {
        border: 1px solid color-mix(in srgb, var(--primary-color) 45%, transparent);
        background: color-mix(in srgb, var(--primary-color) 12%, transparent);
        color: var(--primary-text-color);
        border-radius: 8px;
        padding: 6px 10px;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }
      .dog-duty-link-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .dog-duty-warn .dog-duty-link-btn {
        margin-left: auto;
        flex-shrink: 0;
      }

      .dog-duty-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        user-select: none;
        pointer-events: none;
        z-index: 0;
      }

      /* Live camera via hui-image (authenticated) */
      hui-image.dog-duty-bg-camera {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        pointer-events: none;
        z-index: 0;
        --ha-camera-border-radius: 0;
        border-radius: 0;
        overflow: hidden;
      }
      hui-image.dog-duty-bg-camera img,
      hui-image.dog-duty-bg-camera video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
      .dog-duty-bg-placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--secondary-text-color);
        font-size: 13px;
        padding: 16px;
        text-align: center;
        z-index: 0;
      }
      .dog-duty-bg-placeholder ha-icon {
        --mdc-icon-size: 36px;
        opacity: 0.7;
      }

      .dog-duty-heatmap {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1;
      }
      .dog-duty-heat {
        position: absolute;
        width: 72px;
        height: 72px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 80, 0, 0.45) 0%, rgba(255, 80, 0, 0) 70%);
        filter: blur(2px);
      }

      .dog-duty-marker {
        position: absolute;
        transform: translate(-50%, -50%);
        z-index: 2;
        width: 36px;
        height: 36px;
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
        display: grid;
        place-items: center;
      }
      .dog-duty-zone {
        position: absolute;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 2px solid rgba(255, 64, 64, 0.55);
        background: rgba(255, 64, 64, 0.12);
        animation: dog-duty-pulse 2s ease-in-out infinite;
      }
      .dog-duty-marker.cleaned .dog-duty-zone {
        border-color: rgba(76, 175, 80, 0.5);
        background: rgba(76, 175, 80, 0.12);
        animation: none;
      }
      .dog-duty-glyph {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.55);
        color: #ff5252;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        font-size: 16px;
        font-weight: 800;
        line-height: 1;
      }
      .dog-duty-marker.cleaned .dog-duty-glyph {
        color: #81c784;
        opacity: 0.85;
      }
      .dog-duty-marker.selected .dog-duty-glyph {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      .dog-duty-emoji {
        font-size: 16px;
      }
      .dog-duty-x {
        font-size: 18px;
        font-weight: 900;
      }
      .dog-duty-glyph ha-icon {
        --mdc-icon-size: 18px;
      }

      @keyframes dog-duty-pulse {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.15); opacity: 0.55; }
      }

      .dog-duty-empty {
        position: absolute;
        left: 50%;
        bottom: 10px;
        transform: translateX(-50%);
        z-index: 3;
        padding: 5px 12px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        font-size: 11px;
        line-height: 1.35;
        max-width: calc(100% - 32px);
        width: max-content;
        text-align: center;
        pointer-events: none;
      }

      .dog-duty-popup {
        position: absolute;
        z-index: 5;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(280px, calc(100% - 16px));
        /* Stay inside the map (overflow: hidden) so edges never get clipped */
        max-height: calc(100% - 16px);
        overflow-y: auto;
        box-sizing: border-box;
        background: var(--card-background-color, #1c1c1c);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .dog-duty-popup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 14px;
      }
      .dog-duty-popup-snap {
        width: 100%;
        border-radius: 8px;
        max-height: 140px;
        object-fit: cover;
      }
      .dog-duty-popup-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .dog-duty-popup-meta .cleaned-tag {
        color: var(--success-color, #4caf50);
        font-weight: 700;
      }
      .dog-duty-popup-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
        max-height: 60px;
        overflow: auto;
      }
      .dog-duty-popup-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .dog-duty-icon-btn {
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 2px;
        display: inline-flex;
      }
      .dog-duty-icon-btn ha-icon { --mdc-icon-size: 18px; }

      .dog-duty-btn {
        appearance: none;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .dog-duty-btn.primary {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: transparent;
      }
      .dog-duty-btn.danger {
        background: transparent;
        color: var(--error-color, #f44336);
        border-color: color-mix(in srgb, var(--error-color, #f44336) 40%, transparent);
      }
      .dog-duty-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .dog-duty-scrubber {
        display: flex;
        flex-direction: column;
        gap: 0;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        transition: border-color 0.2s ease;
      }
      .dog-duty-scrubber.scrubbing {
        border-color: var(--primary-color);
      }
      .dog-duty-scrub-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }
      .dog-duty-scrub-status {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .dog-duty-scrub-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .dog-duty-scrub-dot.live {
        background: var(--success-color, #4caf50);
        animation: dog-duty-scrub-pulse 2s ease-in-out infinite;
      }
      .dog-duty-scrub-dot.past {
        background: var(--primary-color);
      }
      @keyframes dog-duty-scrub-pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }
      .dog-duty-scrub-time {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .dog-duty-scrub-clock {
        font-size: 18px;
        font-weight: 700;
        color: var(--primary-text-color);
        line-height: 1.2;
        white-space: nowrap;
      }
      .dog-duty-scrubber.scrubbing .dog-duty-scrub-clock {
        color: var(--primary-color);
        font-size: 20px;
      }
      .dog-duty-scrub-day {
        margin-right: 6px;
      }
      .dog-duty-scrub-delta {
        font-size: 11px;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .dog-duty-scrub-live-btn {
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
      .dog-duty-scrub-live-btn ha-icon {
        --mdc-icon-size: 15px;
      }
      .dog-duty-scrub-track {
        position: relative;
        height: 40px;
        border-radius: 8px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        cursor: ew-resize;
        touch-action: none;
        user-select: none;
        overflow: visible;
        outline: none;
      }
      .dog-duty-scrub-track:focus-visible {
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 55%, transparent);
      }
      .dog-duty-scrub-tick {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--divider-color);
        pointer-events: none;
      }
      .dog-duty-scrub-marker {
        position: absolute;
        top: 7px;
        bottom: 7px;
        width: 2px;
        border-radius: 1px;
        background: #ff5252;
        opacity: 0.85;
        pointer-events: none;
        transform: translateX(-50%);
      }
      .dog-duty-scrub-marker.cleaned {
        background: var(--success-color, #4caf50);
        opacity: 0.55;
      }
      .dog-duty-scrub-shade {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        background: var(--primary-color);
        opacity: 0.08;
        border-radius: 0 8px 8px 0;
        pointer-events: none;
      }
      .dog-duty-scrub-playhead {
        position: absolute;
        top: -3px;
        bottom: -3px;
        width: 2px;
        margin-left: -1px;
        background: var(--primary-color);
        pointer-events: none;
      }
      .dog-duty-scrub-handle {
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
      .dog-duty-scrub-axis {
        display: flex;
        justify-content: space-between;
        margin-top: 6px;
        font-size: 10px;
        color: var(--secondary-text-color);
        opacity: 0.8;
      }

      .dog-duty-setup-hint {
        font-size: 12px;
        color: var(--secondary-text-color);
        padding: 4px 2px 0;
      }

      /* Wizard */
      .dog-duty-wizard-steps {
        display: flex;
        align-items: center;
        gap: 0;
        margin-bottom: 16px;
      }
      .dog-duty-step {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 12px;
        font-weight: 700;
        background: var(--divider-color);
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }
      .dog-duty-step.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .dog-duty-step-line {
        flex: 1;
        height: 2px;
        background: var(--divider-color);
      }
      .dog-duty-wizard-body {
        margin-top: 4px;
      }
      .dog-duty-ok,
      .dog-duty-warn,
      .dog-duty-err {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-top: 10px;
        font-size: 13px;
        padding: 8px 10px;
        border-radius: 8px;
      }
      .dog-duty-ok {
        background: color-mix(in srgb, var(--success-color, #4caf50) 15%, transparent);
        color: var(--success-color, #4caf50);
      }
      .dog-duty-warn {
        background: color-mix(in srgb, var(--warning-color, #ff9800) 15%, transparent);
        color: var(--warning-color, #ff9800);
        flex-wrap: wrap;
      }
      .dog-duty-warn a {
        color: inherit;
        font-weight: 700;
      }
      .dog-duty-err {
        background: color-mix(in srgb, var(--error-color, #f44336) 15%, transparent);
        color: var(--error-color, #f44336);
      }
      .dog-duty-ok ha-icon,
      .dog-duty-warn ha-icon,
      .dog-duty-err ha-icon {
        --mdc-icon-size: 18px;
        flex-shrink: 0;
      }

      .dog-duty-setup-guide {
        margin: 0 0 14px;
        padding: 12px 14px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
        border: 1px solid color-mix(in srgb, var(--primary-color) 28%, transparent);
        font-size: 13px;
        color: var(--primary-text-color);
      }
      .dog-duty-setup-guide-title {
        font-weight: 700;
        margin-bottom: 8px;
      }
      .dog-duty-setup-guide ol {
        margin: 0 0 10px;
        padding-left: 18px;
      }
      .dog-duty-setup-guide li {
        margin-bottom: 6px;
        line-height: 1.35;
      }
      .dog-duty-setup-guide-note {
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      @media (max-width: 480px) {
        .dog-duty-map {
          aspect-ratio: 4 / 3;
        }
        .dog-duty-popup {
          width: calc(100% - 16px);
        }
      }
    `;
  }
}

// ── module-local helpers ─────────────────────────────────────────────────────

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function getDogDutyCameras(m: DogDutyModule): string[] {
  const out: string[] = [];
  if (m.camera_entity) out.push(m.camera_entity);
  for (const c of m.camera_entities || []) {
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

function eventMatchesCamera(
  ev: DogDutyEvent,
  cameraId: string,
  primaryCamera: string
): boolean {
  if (!cameraId) return true;
  const cam = ev.payload.camera;
  if (!cam) return cameraId === primaryCamera;
  return cam === cameraId;
}

function cameraFriendlyName(hass: HomeAssistant | undefined, entityId: string): string {
  if (!entityId) return '—';
  return hass?.states?.[entityId]?.attributes?.friendly_name || entityId.replace(/^camera\./, '');
}

function resolveMediaPath(path: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/api/') || path.startsWith('/local/')) {
    return path;
  }
  if (path.startsWith('/config/www/')) {
    return `/local/${path.slice('/config/www/'.length)}`;
  }
  if (path.startsWith('www/')) {
    return `/local/${path.slice('www/'.length)}`;
  }
  return path;
}

function formatRelativeTime(ts: number, _lang: string): string {
  const diff = Date.now() - ts;
  if (!Number.isFinite(diff) || diff < 0) return 'just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatScrubDay(epochMs: number, lang: string): string {
  const d = new Date(epochMs);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) {
    return lang.startsWith('en') ? 'Today' : d.toLocaleDateString(lang, { weekday: 'short' });
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return lang.startsWith('en') ? 'Yesterday' : d.toLocaleDateString(lang, { weekday: 'short' });
  }
  return d.toLocaleDateString(lang, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatClockTime(epochMs: number, hass?: HomeAssistant): string {
  const lang = hass?.locale?.language || 'en';
  return new Date(epochMs).toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' });
}

function formatScrubDelta(deltaMs: number, _lang: string): string {
  if (!Number.isFinite(deltaMs) || deltaMs < 60_000) return 'Just now';
  const mins = Math.floor(deltaMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours < 48) return rem ? `${hours}h ${rem}m ago` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

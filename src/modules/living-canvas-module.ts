import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, LivingCanvasModule, LivingCanvasPreset, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';
import { getLivingCanvasPresetColors } from '../utils/uc-living-canvas-colors';
import '../components/ultra-color-picker';
const PRESETS: { value: LivingCanvasPreset; labelKey: string; fallback: string }[] = [
  { value: 'aurora', labelKey: 'editor.living_canvas.preset_aurora', fallback: 'Aurora' },
  { value: 'plasma', labelKey: 'editor.living_canvas.preset_plasma', fallback: 'Plasma' },
  { value: 'particles', labelKey: 'editor.living_canvas.preset_particles', fallback: 'Particles' },
  { value: 'mesh', labelKey: 'editor.living_canvas.preset_mesh', fallback: 'Mesh gradient' },
];

export class UltraLivingCanvasModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'living_canvas',
    title: 'Living Canvas',
    description: 'View-wide WebGL background art (like Dynamic Weather), with presets and optional entity drivers',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:palette-swatch',
    category: 'media',
    tags: ['pro', 'premium', 'canvas', 'webgl', 'animated', 'art', 'ambient', 'three'],
  };

  createDefault(id?: string, _hass?: HomeAssistant): LivingCanvasModule {
    return {
      id: id || this.generateId('living_canvas'),
      type: 'living_canvas',
      enabled: true,
      position: 'background',
      opacity: 100,
      enable_on_mobile: true,
      preset: 'aurora',      speed: 1,
      intensity: 70,
      respect_reduced_motion: true,
      quality: 'medium',
      driver_entity_a: '',
      driver_entity_b: '',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    const lc = module as LivingCanvasModule;
    const errors = [...base.errors];
    const presets: LivingCanvasPreset[] = ['aurora', 'plasma', 'particles', 'mesh'];
    if (lc.preset && !presets.includes(lc.preset)) {
      errors.push('Invalid Living Canvas preset');
    }
    const sp = lc.speed;
    if (sp !== undefined && (sp < 0.25 || sp > 3)) {
      errors.push('Living Canvas speed must be between 0.25 and 3');
    }
    const inten = lc.intensity;
    if (inten !== undefined && (inten < 0 || inten > 100)) {
      errors.push('Living Canvas intensity must be 0–100');
    }
    const op = lc.opacity;
    if (op !== undefined && (op < 0 || op > 100)) {
      errors.push('Living Canvas opacity must be 0–100');
    }
    return { valid: errors.length === 0, errors };
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as LivingCanvasModule, hass, u => updateModule(u));
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as LivingCanvasModule, hass, u => updateModule(u));
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const lc = module as LivingCanvasModule;
    const lang = hass?.locale?.language || 'en';

    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    if (!isPro) {
      return this._renderProLockUI(lang);
    }

    return html`
      <div class="uc-living-canvas-settings">
        ${this.injectUcFormStyles()}
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <ha-icon
              icon="mdi:palette-swatch"
              style="color: var(--primary-color); --mdi-icon-size: 32px;"
            ></ha-icon>
            <div>
              <div style="font-size: 18px; font-weight: 700;">
                ${localize('editor.living_canvas.title', lang, 'Living Canvas')} (Pro)
              </div>
              <div style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.45;">
                ${localize(
                  'editor.living_canvas.intro',
                  lang,
                  'Renders as a full-view WebGL layer (like Dynamic Weather), not inside the card. Adjust canvas opacity and colors so the dashboard stays readable.'
                )}
              </div>
            </div>
          </div>
          <div
            style="padding: 12px; background: rgba(var(--rgb-info-color), 0.1); border-radius: 6px; border-left: 4px solid var(--info-color); font-size: 12px; line-height: 1.45;"
          >
            ${localize(
              'editor.living_canvas.view_note',
              lang,
              'Only one winning module runs per view (logic + order). Open the live dashboard to see the effect; the preview below is a summary.'
            )}
          </div>
        </div>

        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.living_canvas.enable', lang, 'Enable Living Canvas'),
            description: localize(
              'editor.living_canvas.enable_desc',
              lang,
              'Turn the view-wide canvas on or off'
            ),
            hass,
            data: { enabled: lc.enabled !== false },
            schema: [this.booleanField('enabled')],
            onChange: (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
          },
        ])}

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            ${localize('editor.living_canvas.display_section', lang, 'Display')}
          </div>
          ${this.renderFieldSection(
            localize('editor.living_canvas.position', lang, 'Position'),
            localize(
              'editor.living_canvas.position_desc',
              lang,
              'Background sits above the static background module but behind cards; foreground draws on top of cards.'
            ),
            hass,
            { position: lc.position || 'background' },
            [
              this.selectField('position', [
                { value: 'background', label: localize('editor.living_canvas.position_bg', lang, 'Background (behind cards)') },
                { value: 'foreground', label: localize('editor.living_canvas.position_fg', lang, 'Foreground (above cards)') },
              ]),
            ],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}
          ${this.renderSliderField(
            localize('editor.living_canvas.canvas_opacity', lang, 'Canvas Opacity'),
            localize(
              'editor.living_canvas.canvas_opacity_desc',
              lang,
              'Fades only the WebGL canvas (default 100%). Does not change your Ultra Card or other cards on the view.'
            ),
            lc.opacity ?? 100,
            100, 0, 100, 1,
            (v: number) => { if (!isNaN(v)) updateModule({ opacity: v }); },
            '%'
          )}
        </div>

        ${this.renderFieldSection(
          localize('editor.living_canvas.preset', lang, 'Preset'),
          localize('editor.living_canvas.preset_desc', lang, 'Choose a visual style'),
          hass,
          { preset: lc.preset || 'aurora' },
          [
            this.selectField(
              'preset',
              PRESETS.map(p => ({
                value: p.value,
                label: localize(p.labelKey, lang, p.fallback),
              }))
            ),
          ],
          (e: CustomEvent) => {
            updateModule(e.detail.value);
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${(() => {
          const preset = lc.preset || 'aurora';
          const defs = getLivingCanvasPresetColors(preset);
          return html`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
            >
              <div
                class="section-title"
                style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px;"
              >
                ${localize('editor.living_canvas.colors_section', lang, 'Colors')}
              </div>
              <div
                style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; line-height: 1.45;"
              >
                ${localize(
                  'editor.living_canvas.colors_section_desc',
                  lang,
                  'Each preset has a default palette. Override colors here (hex, theme vars, or favorites). Changing preset updates the suggested defaults in the pickers.'
                )}
              </div>
              <div style="margin-bottom: 16px;">
                <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                  ${localize('editor.living_canvas.color_background', lang, 'Background / base')}
                </div>
                <ultra-color-picker
                  .label=${localize('editor.living_canvas.color_background', lang, 'Background / base')}
                  .value=${lc.canvas_color_background || ''}
                  .defaultValue=${defs.background}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent<{ value: string }>) => {
                    updateModule({ canvas_color_background: e.detail.value });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>
              <div style="margin-bottom: 16px;">
                <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                  ${localize('editor.living_canvas.color_primary', lang, 'Primary accent')}
                </div>
                <ultra-color-picker
                  .label=${localize('editor.living_canvas.color_primary', lang, 'Primary accent')}
                  .value=${lc.canvas_color_primary || ''}
                  .defaultValue=${defs.primary}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent<{ value: string }>) => {
                    updateModule({ canvas_color_primary: e.detail.value });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>
              <div style="margin-bottom: 8px;">
                <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 6px;">
                  ${localize('editor.living_canvas.color_secondary', lang, 'Secondary accent')}
                </div>
                <ultra-color-picker
                  .label=${localize('editor.living_canvas.color_secondary', lang, 'Secondary accent')}
                  .value=${lc.canvas_color_secondary || ''}
                  .defaultValue=${defs.secondary}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent<{ value: string }>) => {
                    updateModule({ canvas_color_secondary: e.detail.value });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>
            </div>
          `;
        })()}

        ${this.renderFieldSection(
          localize('editor.living_canvas.speed', lang, 'Speed'),
          localize('editor.living_canvas.speed_desc', lang, 'Animation speed (0.25–3)'),
          hass,
          { speed: lc.speed ?? 1 },
          [this.numberField('speed', 0.25, 3, 0.05)],
          (e: CustomEvent) => {
            updateModule(e.detail.value);
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${this.renderFieldSection(
          localize('editor.living_canvas.intensity', lang, 'Intensity'),
          localize('editor.living_canvas.intensity_desc', lang, 'Brightness of the effect (0–100)'),
          hass,
          { intensity: lc.intensity ?? 70 },
          [this.numberField('intensity', 0, 100, 1)],
          (e: CustomEvent) => {
            updateModule(e.detail.value);
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${this.renderFieldSection(
          localize('editor.living_canvas.quality', lang, 'Quality'),
          localize('editor.living_canvas.quality_desc', lang, 'Pixel ratio cap for performance'),
          hass,
          { quality: lc.quality || 'medium' },
          [
            this.selectField('quality', [
              { value: 'low', label: localize('editor.living_canvas.quality_low', lang, 'Low') },
              { value: 'medium', label: localize('editor.living_canvas.quality_medium', lang, 'Medium') },
              { value: 'high', label: localize('editor.living_canvas.quality_high', lang, 'High') },
            ]),
          ],
          (e: CustomEvent) => {
            updateModule(e.detail.value);
            setTimeout(() => this.triggerPreviewUpdate(true), 50);
          }
        )}

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            ${localize('editor.living_canvas.mobile_section', lang, 'Mobile')}
          </div>
          ${this.renderSettingsSection('', '', [
            {
              title: localize('editor.living_canvas.enable_on_mobile', lang, 'Enable on mobile'),
              description: localize(
                'editor.living_canvas.enable_on_mobile_desc',
                lang,
                'When off, the canvas is hidden on small screens to save battery'
              ),
              hass,
              data: { enable_on_mobile: lc.enable_on_mobile !== false },
              schema: [this.booleanField('enable_on_mobile')],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
          ])}
        </div>

        ${this.renderSettingsSection(
          localize('editor.living_canvas.accessibility', lang, 'Accessibility'),
          '',
          [
            {
              title: localize(
                'editor.living_canvas.respect_reduced_motion',
                lang,
                'Respect reduced motion'
              ),
              description: localize(
                'editor.living_canvas.respect_reduced_motion_desc',
                lang,
                'When the OS requests reduced motion, the canvas is hidden for this view'
              ),
              hass,
              data: { respect_reduced_motion: lc.respect_reduced_motion !== false },
              schema: [this.booleanField('respect_reduced_motion')],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
          ]
        )}

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            style="font-size: 16px; font-weight: 600; margin-bottom: 10px; color: var(--primary-color);"
          >
            ${localize('editor.living_canvas.drivers_heading', lang, 'Optional drivers')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 10px; line-height: 1.5;"
          >
            ${localize(
              'editor.living_canvas.drivers_help',
              lang,
              'Drivers feed live entity values into the shader as two extra 0–1 controls (Driver A and Driver B).'
            )}
          </div>
          <div
            style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 20px; line-height: 1.55; padding: 10px 12px; background: rgba(var(--rgb-primary-color), 0.06); border-radius: 6px;"
          >
            ${localize(
              'editor.living_canvas.drivers_detail',
              lang,
              'How it works: each frame we read the selected entity state. Numbers between 0 and 1 are used as-is. Numbers from 0–100 are divided by 100. on/off map to 1 and 0. Other numbers are softly mapped so graphs still react. Each preset uses A/B differently (glow mix, line weight, color accents). Leave a driver empty to disable it.'
            )}
          </div>
          <div style="margin-bottom: 24px;">
            ${this.renderEntityPickerWithVariables(
              hass,
              config,
              'driver_entity_a',
              lc.driver_entity_a || '',
              v => updateModule({ driver_entity_a: v }),
              undefined,
              localize('editor.living_canvas.driver_a', lang, 'Driver A')
            )}
          </div>
          <div style="margin-bottom: 8px;">
            ${this.renderEntityPickerWithVariables(
              hass,
              config,
              'driver_entity_b',
              lc.driver_entity_b || '',
              v => updateModule({ driver_entity_b: v }),
              undefined,
              localize('editor.living_canvas.driver_b', lang, 'Driver B')
            )}
          </div>
        </div>
      </div>
    `;
  }

  private _renderProLockUI(lang: string): TemplateResult {
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
            'editor.living_canvas.pro_description',
            lang,
            'Living Canvas is a Pro feature: a full-view WebGL background with presets and optional entity drivers. Upgrade to use it like Dynamic Weather.'
          )}
        </div>
        <a
          href="https://ultracard.io/pro"
          target="_blank"
          rel="noopener noreferrer"
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

  /**
   * View-wide effect: real render is handled by ucLivingCanvasService from UltraCard.
   */
  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    _config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const lc = module as LivingCanvasModule;
    const lang = hass?.locale?.language || 'en';

    const isEditMode = (() => {
      if (previewContext === 'dashboard') return true;
      try {
        return new URLSearchParams(window.location.search).get('edit') === '1';
      } catch {
        return false;
      }
    })();

    const showPlaceholder =
      previewContext === 'live' ||
      previewContext === 'ha-preview' ||
      previewContext === 'dashboard' ||
      isEditMode;

    if (showPlaceholder) {
      const pMeta = PRESETS.find(p => p.value === (lc.preset || 'aurora'));
      const presetLabel = pMeta
        ? localize(pMeta.labelKey, lang, pMeta.fallback)
        : lc.preset || 'aurora';
      return this.wrapWithAnimation(html`
        <div
          style="padding: 16px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 8px; border: 2px dashed var(--divider-color);"
        >
          <ha-icon
            icon="mdi:palette-swatch"
            style="--mdi-icon-size: 48px; color: var(--primary-color); margin-bottom: 8px;"
          ></ha-icon>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.living_canvas.title', lang, 'Living Canvas')}
          </div>
          <div style="font-size: 12px;">
            ${lc.enabled === false
              ? localize('editor.living_canvas.preview_disabled', lang, 'Disabled')
              : `${localize('editor.living_canvas.preview_preset', lang, 'Preset')}: ${presetLabel} · ${(lc.position || 'background') === 'foreground' ? localize('editor.living_canvas.position_fg', lang, 'Foreground') : localize('editor.living_canvas.position_bg', lang, 'Background')} · ${localize('editor.living_canvas.preview_opacity', lang, 'Canvas opacity')} ${lc.opacity ?? 100}%`}
          </div>
          <div style="font-size: 11px; margin-top: 8px; opacity: 0.75; line-height: 1.4;">
            ${localize(
              'editor.living_canvas.preview_hint',
              lang,
              'Rendered as a full-view layer. Open the dashboard to see it; registration uses this card instance.'
            )}
          </div>
        </div>
      `, module, hass);
    }

    return html``;
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}

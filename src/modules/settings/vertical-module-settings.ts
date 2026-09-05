import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraVerticalModule } from '../vertical-module';
import { installSettingsMethods } from '../uc-lazy-settings';
import { CardModule, VerticalModule, UltraCardConfig } from '../../types';
import { localize } from '../../localize/localize';
import '../../components/ultra-color-picker';

/**
 * Vertical module settings UI. Lives in the `core-settings` chunk (see
 * uc-lazy-settings.ts) so dashboards never download it. Declared as a subclass
 * so the moved code keeps `this.` access to the module helpers; it is never
 * instantiated, the module calls the method with itself as `this`.
 */
export class UltraVerticalModuleSettings extends UltraVerticalModule {
  renderGeneralTabContent(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const verticalModule = module as VerticalModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Layout Configuration Section -->
        ${this.renderSettingsSection(
          localize('editor.vertical.layout.title', lang, 'Layout Configuration'),
          localize(
            'editor.vertical.layout.desc',
            lang,
            'Configure alignment and spacing for items in a single column.'
          ),
          [
            {
              title: localize('editor.vertical.alignment.horizontal', lang, 'Horizontal Alignment'),
              description: localize(
                'editor.vertical.alignment.horizontal_desc',
                lang,
                'Choose how items are aligned horizontally within the column.'
              ),
              hass,
              data: { horizontal_alignment: verticalModule.horizontal_alignment || 'stretch' },
              schema: [
                this.selectField('horizontal_alignment', [
                  { value: 'left', label: localize('editor.common.left', lang, 'Left') },
                  { value: 'center', label: localize('editor.common.center', lang, 'Center') },
                  { value: 'right', label: localize('editor.common.right', lang, 'Right') },
                  { value: 'stretch', label: localize('editor.common.stretch', lang, 'Stretch') },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.horizontal_alignment;
                const prev = verticalModule.horizontal_alignment || 'stretch';
                if (next === prev) return;
                updateModule(e.detail.value);
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
            {
              title: localize('editor.vertical.alignment.vertical', lang, 'Vertical Distribution'),
              description: localize(
                'editor.vertical.alignment.vertical_desc',
                lang,
                'How items are distributed along the vertical axis.'
              ),
              hass,
              data: { alignment: verticalModule.alignment || 'center' },
              schema: [
                this.selectField('alignment', [
                  { value: 'top', label: localize('editor.common.top', lang, 'Top') },
                  { value: 'center', label: localize('editor.common.center', lang, 'Center') },
                  { value: 'bottom', label: localize('editor.common.bottom', lang, 'Bottom') },
                  {
                    value: 'space-between',
                    label: localize('editor.common.space_between', lang, 'Space Between'),
                  },
                  {
                    value: 'space-around',
                    label: localize('editor.common.space_around', lang, 'Space Around'),
                  },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.alignment;
                const prev = verticalModule.alignment || 'center';
                if (next === prev) return;
                updateModule(e.detail.value);
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
          ]
        )}

        <!-- Gap Between Items Field with Custom Slider -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.vertical.gap.title', lang, 'Gap Configuration')}
          </div>

          ${(() => {
            // Backward compat: if gap_unit is not stored, the value was rem (old behavior)
            const unit: string = (verticalModule as any).gap_unit || 'rem';
            const isPx = unit === 'px';
            const isRem = unit === 'rem' || unit === 'em';
            const defaultVal = isPx ? 8 : 1.2;
            const gapNum =
              verticalModule.gap !== undefined && verticalModule.gap !== null
                ? Number(verticalModule.gap)
                : defaultVal;
            const sliderMin = isPx ? -100 : -10;
            const sliderMax = isPx ? 100 : 10;
            const sliderStep = isPx ? 1 : 0.1;
            const disabled =
              verticalModule.alignment === 'space-between' ||
              verticalModule.alignment === 'space-around';

            const convertGap = (fromUnit: string, toUnit: string, val: number): number => {
              if (fromUnit === toUnit) return val;
              const toPx = (v: number, u: string) =>
                u === 'px' ? v : u === '%' ? v : u === 'vw' ? v : u === 'vh' ? v : v * 16;
              const fromPx = (v: number, u: string) =>
                u === 'px'
                  ? v
                  : u === '%'
                    ? v
                    : u === 'vw'
                      ? v
                      : u === 'vh'
                        ? v
                        : Math.round((v / 16) * 10) / 10;
              return fromPx(toPx(val, fromUnit), toUnit);
            };

            const unitOptions = [
              { value: 'px', label: 'px' },
              { value: 'rem', label: 'rem' },
              { value: 'em', label: 'em' },
              { value: '%', label: '%' },
              { value: 'vw', label: 'vw' },
              { value: 'vh', label: 'vh' },
            ];

            return html`
              <div
                style="margin-bottom: 8px; ${disabled ? 'opacity: 0.5; pointer-events: none;' : ''}"
              >
                ${this.renderGapWithUnitField(
                  localize('editor.vertical.gap.between_items', lang, 'Gap Between Items'),
                  localize(
                    'editor.vertical.gap.desc',
                    lang,
                    'Set the spacing between vertical items. Use negative values to overlap items. Note: Gap is disabled when using Space Between or Space Around distribution.'
                  ),
                  hass,
                  gapNum,
                  defaultVal,
                  sliderMin,
                  sliderMax,
                  sliderStep,
                  unit,
                  unitOptions,
                  next => updateModule({ gap: next }),
                  (newUnit, currentValue) => {
                    const converted = convertGap(unit, newUnit, currentValue);
                    updateModule({ gap: converted, gap_unit: newUnit } as any);
                  }
                )}
              </div>
            `;
          })()}
        </div>
      </div>
    `;
  }
}

installSettingsMethods(UltraVerticalModule, UltraVerticalModuleSettings);

export function renderVerticalGeneralTab(
  host: UltraVerticalModule,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  return UltraVerticalModuleSettings.prototype.renderGeneralTabContent.call(
    host as UltraVerticalModuleSettings,
    module,
    hass,
    config,
    updateModule
  );
}

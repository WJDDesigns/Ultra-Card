import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraHorizontalModule } from '../horizontal-module';
import { installSettingsMethods } from '../uc-lazy-settings';
import { CardModule, HorizontalModule, UltraCardConfig } from '../../types';
import { localize } from '../../localize/localize';
import '../../components/ultra-color-picker';

/**
 * Horizontal module settings UI. Lives in the `core-settings` chunk (see
 * uc-lazy-settings.ts) so dashboards never download it. Declared as a subclass
 * so the moved code keeps `this.` access to the module helpers; it is never
 * instantiated, the module calls the method with itself as `this`.
 */
export class UltraHorizontalModuleSettings extends UltraHorizontalModule {
  renderGeneralTabContent(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const horizontalModule = module as HorizontalModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Layout Configuration Section -->
        ${this.renderSettingsSection(
          localize('editor.horizontal.layout.title', lang, 'Layout Configuration'),
          localize(
            'editor.horizontal.layout.desc',
            lang,
            'Configure how items are arranged horizontally within the container.'
          ),
          [
            {
              title: localize(
                'editor.horizontal.alignment.horizontal',
                lang,
                'Horizontal Alignment'
              ),
              description: localize(
                'editor.horizontal.alignment.horizontal_desc',
                lang,
                'Choose how items are aligned horizontally within the container.'
              ),
              hass,
              data: horizontalModule,
              schema: [
                this.selectField('alignment', [
                  { value: 'left', label: localize('editor.common.left', lang, 'Left') },
                  { value: 'center', label: localize('editor.common.center', lang, 'Center') },
                  { value: 'right', label: localize('editor.common.right', lang, 'Right') },
                  {
                    value: 'space-between',
                    label: localize('editor.common.space_between', lang, 'Space Between'),
                  },
                  {
                    value: 'space-around',
                    label: localize('editor.common.space_around', lang, 'Space Around'),
                  },
                  { value: 'justify', label: localize('editor.common.justify', lang, 'Justify') },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.alignment;
                const prev = horizontalModule.alignment;
                if (next === prev) return;

                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.horizontal.alignment.vertical', lang, 'Vertical Alignment'),
            description: localize(
              'editor.horizontal.alignment.vertical_desc',
              lang,
              'Choose how items are aligned vertically within the container.'
            ),
            hass,
            data: { vertical_alignment: horizontalModule.vertical_alignment || '' },
            schema: [
              this.selectField('vertical_alignment', [
                { value: '', label: localize('editor.common.default', lang, 'Default') },
                { value: 'top', label: localize('editor.common.top', lang, 'Top') },
                { value: 'center', label: localize('editor.common.center', lang, 'Center') },
                { value: 'bottom', label: localize('editor.common.bottom', lang, 'Bottom') },
                { value: 'stretch', label: localize('editor.common.stretch', lang, 'Stretch') },
                { value: 'baseline', label: localize('editor.common.baseline', lang, 'Baseline') },
              ]),
            ],
            onChange: (e: CustomEvent) => {
              const raw = e.detail.value?.vertical_alignment;
              if (raw === undefined) return;
              // Empty string = "Default" option → store undefined so flexbox works naturally
              const next = raw === '' ? undefined : raw;
              if (next === horizontalModule.vertical_alignment) return;

              updateModule({ vertical_alignment: next });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
          },
        ])}

        <!-- Allow Wrapping Toggle -->
        ${this.renderSettingsSection(
          localize('editor.horizontal.wrapping.title', lang, 'Allow Wrapping'),
          localize(
            'editor.horizontal.wrapping.desc',
            lang,
            'Allow items to wrap to the next line when they exceed the container width.'
          ),
          [
            {
              title: '',
              description: '',
              hass,
              data: { wrap: horizontalModule.wrap || false },
              schema: [this.booleanField('wrap')],
              onChange: (e: CustomEvent) => {
                updateModule({ wrap: e.detail.value.wrap });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
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
            ${localize('editor.horizontal.gap.title', lang, 'Gap Configuration')}
          </div>

          <div style="margin-bottom: 24px;">
            ${(() => {
              const unit: string = (horizontalModule as any).gap_unit || 'rem';
              const isPx = unit === 'px';
              const defaultVal = isPx ? 8 : 0.7;
              const gapNum =
                horizontalModule.gap !== undefined && horizontalModule.gap !== null
                  ? horizontalModule.gap
                  : defaultVal;
              const sliderMin = isPx ? -100 : -10;
              const sliderMax = isPx ? 100 : 10;
              const sliderStep = isPx ? 1 : 0.1;

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

              return this.renderGapWithUnitField(
                localize('editor.horizontal.gap.between_items', lang, 'Gap Between Items'),
                localize(
                  'editor.horizontal.gap.desc',
                  lang,
                  'Set the spacing between horizontal items. Use negative values to overlap items.'
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
              );
            })()}
          </div>
        </div>
      </div>
    `;
  }
}

installSettingsMethods(UltraHorizontalModule, UltraHorizontalModuleSettings);

export function renderHorizontalGeneralTab(
  host: UltraHorizontalModule,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  return UltraHorizontalModuleSettings.prototype.renderGeneralTabContent.call(
    host as UltraHorizontalModuleSettings,
    module,
    hass,
    config,
    updateModule
  );
}

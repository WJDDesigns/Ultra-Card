import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraButtonModule } from '../button-module';
import { installSettingsMethods } from '../uc-lazy-settings';
import { CardModule, ButtonModule, UltraCardConfig } from '../../types';
import { localize } from '../../localize/localize';
import '../../components/ultra-color-picker';

/**
 * Button module settings UI. Lives in the `core-settings` chunk (see
 * uc-lazy-settings.ts) so dashboards never download it. Declared as a subclass
 * so the moved code keeps `this.` access to the module helpers; it is never
 * instantiated, the module calls the method with itself as `this`.
 */
export class UltraButtonModuleSettings extends UltraButtonModule {
  private getButtonStyles(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'flat', label: localize('editor.button.styles.flat', lang, 'Flat (Default)') },
      { value: 'glossy', label: localize('editor.button.styles.glossy', lang, 'Glossy') },
      { value: 'embossed', label: localize('editor.button.styles.embossed', lang, 'Embossed') },
      { value: 'inset', label: localize('editor.button.styles.inset', lang, 'Inset') },
      {
        value: 'gradient-overlay',
        label: localize('editor.button.styles.gradient_overlay', lang, 'Gradient Overlay'),
      },
      { value: 'neon-glow', label: localize('editor.button.styles.neon_glow', lang, 'Neon Glow') },
      { value: 'outline', label: localize('editor.button.styles.outline', lang, 'Outline') },
      { value: 'glass', label: localize('editor.button.styles.glass', lang, 'Glass') },
      { value: 'metallic', label: localize('editor.button.styles.metallic', lang, 'Metallic') },
    ];
  }

  private getAlignmentOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'left', label: localize('editor.button.align.left', lang, 'Left') },
      { value: 'center', label: localize('editor.button.align.center', lang, 'Center') },
      { value: 'right', label: localize('editor.button.align.right', lang, 'Right') },
      {
        value: 'justify',
        label: localize('editor.button.align.justify', lang, 'Justify (Full Width)'),
      },
    ];
  }

  private getIconPositionOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'before', label: localize('editor.button.icon.before', lang, 'Before Text') },
      { value: 'after', label: localize('editor.button.icon.after', lang, 'After Text') },
    ];
  }

  renderGeneralTabContent(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const buttonModule = module as ButtonModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Basic Settings -->
        ${this.renderSettingsSection(
          localize('editor.button.basic.title', lang, 'Basic Settings'),
          localize(
            'editor.button.basic.desc',
            lang,
            'Configure the button appearance and text content.'
          ),
          [
            {
              title: localize('editor.button.text.title', lang, 'Button Text'),
              description: localize(
                'editor.button.text.desc',
                lang,
                'Text to display on the button (leave blank for icon-only).'
              ),
              hass,
              data: buttonModule,
              schema: [this.textField('label')],
              onChange: (e: CustomEvent) => {
                updateModule(e.detail.value);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.button.style.title', lang, 'Button Style'),
              description: localize('editor.button.style.desc', lang, 'Visual style of the button'),
              hass,
              data: { style: buttonModule.style || 'flat' },
              schema: [this.selectField('style', this.getButtonStyles(lang))],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.style;
                const prev = buttonModule.style || 'flat';
                if (next === prev) return;
                updateModule(e.detail.value);
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
            {
              title: localize('editor.button.alignment.title', lang, 'Alignment'),
              description: localize(
                'editor.button.alignment.desc',
                lang,
                'How the button is aligned within its container'
              ),
              hass,
              data: { alignment: buttonModule.alignment || 'center' },
              schema: [this.selectField('alignment', this.getAlignmentOptions(lang))],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.alignment;
                const prev = buttonModule.alignment || 'center';
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

        <!-- Icon Settings -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.button.icon.title', lang, 'Icon Settings')}
          </div>

          <!-- Icon Field - Always visible -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.button.icon_field', lang, 'Icon'),
              localize(
                'editor.button.icon_desc',
                lang,
                'Icon to display (e.g., mdi:home). Selecting an icon will automatically enable icon display.'
              ),
              hass,
              { icon: buttonModule.icon || '' },
              [this.iconField('icon')],
              (e: CustomEvent) => {
                const updates = e.detail.value;
                // Auto-enable icon display when an icon is selected
                if (updates.icon && updates.icon.trim()) {
                  updates.show_icon = true;
                  // Set default icon position if not already set
                  if (!buttonModule.icon_position) {
                    updates.icon_position = 'before';
                  }
                } else if (!updates.icon || !updates.icon.trim()) {
                  // Auto-disable icon display when icon is cleared
                  updates.show_icon = false;
                }
                updateModule(updates);
                this.triggerPreviewUpdate();
              }
            )}
          </div>

          ${buttonModule.show_icon && buttonModule.icon
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.button.icon_position', lang, 'Icon Position'),
                    localize(
                      'editor.button.icon_position_desc',
                      lang,
                      'Position of the icon relative to text'
                    ),
                    hass,
                    { icon_position: buttonModule.icon_position || 'before' },
                    [this.selectField('icon_position', this.getIconPositionOptions(lang))],
                    (e: CustomEvent) => {
                      const next = e.detail.value.icon_position;
                      const prev = buttonModule.icon_position || 'before';
                      if (next === prev) return;
                      updateModule(e.detail.value);
                      // Trigger re-render to update dropdown UI
                      setTimeout(() => {
                        this.triggerPreviewUpdate();
                      }, 50);
                    }
                  )}
                </div>

                <div class="field-container" style="margin-bottom: 16px;">
                  ${this.renderSliderField(
                    localize('editor.button.icon_size', lang, 'Icon Size'),
                    localize('editor.button.icon_size_desc', lang, 'Size of the icon in pixels'),
                    typeof buttonModule.icon_size === 'number'
                      ? buttonModule.icon_size
                      : parseInt(String(buttonModule.icon_size || '24').replace('px', '')) || 24,
                    24,
                    12,
                    64,
                    1,
                    (v: number) => {
                      updateModule({ icon_size: `${v}px` });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }
                  )}
                </div>
              `
            : ''}
        </div>

        <!-- Colors -->
        <div class="settings-section">
          <div class="section-title">${localize('editor.button.colors.title', lang, 'Colors')}</div>

          <!-- Entity-based Background Color Toggle -->
          <div class="field-group" style="margin-top: 16px; margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.button.use_entity_color', lang, 'Use Entity Color'),
              localize(
                'editor.button.use_entity_color_desc',
                lang,
                'Change button background color based on entity state'
              ),
              hass,
              { use_entity_color: buttonModule.use_entity_color || false },
              [this.booleanField('use_entity_color')],
              (e: CustomEvent) => {
                const enabled = e.detail.value.use_entity_color;
                updateModule({
                  use_entity_color: enabled,
                  // Clear entity if disabling
                  background_color_entity: enabled ? buttonModule.background_color_entity : '',
                });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )}
          </div>

          ${buttonModule.use_entity_color
            ? html`
                <!-- Entity Picker -->
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderEntityPickerWithVariables(
                    hass,
                    config,
                    'background_color_entity',
                    buttonModule.background_color_entity || '',
                    (value: string) => {
                      updateModule({ background_color_entity: value });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    },
                    undefined,
                    localize('editor.button.background_color_entity', lang, 'Entity')
                  )}
                </div>

                <!-- State Colors Mapping -->
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 8px;"
                  >
                    ${localize('editor.button.state_colors', lang, 'State Colors')}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
                  >
                    ${localize(
                      'editor.button.state_colors_desc',
                      lang,
                      'Optional: Map specific entity states to colors (e.g., on: green, off: gray). If not set, will use entity RGB color or state-based defaults.'
                    )}
                  </div>
                  ${this.renderStateColorsEditor(
                    buttonModule.background_state_colors || {},
                    hass,
                    lang,
                    (stateColors: { [state: string]: string }) => {
                      updateModule({ background_state_colors: stateColors });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }
                  )}
                </div>
              `
            : html`
                <!-- Static Background Color -->
                <div class="color-controls">
                  <ultra-color-picker
                    .label=${localize('editor.button.colors.background', lang, 'Background Color')}
                    .value=${buttonModule.background_color || 'var(--primary-color)'}
                    .defaultValue=${'var(--primary-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      updateModule({ background_color: e.detail.value });
                      this.triggerPreviewUpdate();
                    }}
                  ></ultra-color-picker>
                </div>
              `}

          <!-- Text Color (always visible) -->
          <div class="color-controls" style="margin-top: 16px;">
            <ultra-color-picker
              .label=${localize('editor.button.colors.text', lang, 'Text Color')}
              .value=${buttonModule.text_color || 'white'}
              .defaultValue=${'white'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ text_color: e.detail.value });
                this.triggerPreviewUpdate();
              }}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Actions Setup Guide -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.button.actions.title', lang, 'Button Actions')}
          </div>
          <div
            class="section-description"
            style="margin-bottom: 16px; color: var(--secondary-text-color); font-size: 14px;"
          >
            ${localize(
              'editor.button.actions.desc',
              lang,
              'Configure what happens when users tap, hold, or double-tap this button.'
            )}
          </div>
          <ha-button
            raised
            style="width: 100%; --mdc-theme-primary: var(--primary-color);"
            @click=${() => {
              // Dispatch a custom event to switch to actions tab
              const event = new CustomEvent('switch-to-actions-tab', {
                bubbles: true,
                composed: true,
                detail: { tab: 'actions' },
              });
              document.dispatchEvent(event);
            }}
          >
            <ha-icon icon="mdi:gesture-tap" slot="icon"></ha-icon>
            ${localize('editor.button.actions.setup', lang, 'Set up button actions')}
          </ha-button>
        </div>
      </div>
    `;
  }

  // Render state colors editor
  private renderStateColorsEditor(
    stateColors: { [state: string]: string },
    hass: HomeAssistant,
    lang: string,
    onUpdate: (stateColors: { [state: string]: string }) => void
  ): TemplateResult {
    return html`
      <div class="state-color-editor">
        ${Object.entries(stateColors).map(
          ([state, color]) => html`
            <div
              class="state-color-row"
              style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; min-width: 0; overflow: hidden;"
            >
              <input
                type="text"
                class="state-color-input"
                placeholder="State (e.g., on, off)"
                .value=${state}
                style="flex: 0 0 120px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); flex-shrink: 0;"
                @input=${(e: Event) => {
                  const newState = (e.target as HTMLInputElement).value;
                  const updated = { ...stateColors };
                  delete updated[state];
                  if (newState.trim()) {
                    updated[newState.trim()] = color;
                  }
                  onUpdate(updated);
                }}
              />
              <div style="flex: 1; min-width: 0; overflow: hidden;">
                <ultra-color-picker
                  .label=${''}
                  .value=${color}
                  .defaultValue=${'gray'}
                  .hass=${hass}
                  style="width: 100%;"
                  @value-changed=${(e: CustomEvent) => {
                    const updated = { ...stateColors, [state]: e.detail.value };
                    onUpdate(updated);
                  }}
                ></ultra-color-picker>
              </div>
              <ha-icon
                icon="mdi:delete"
                style="cursor: pointer; color: var(--error-color); margin-left: 8px; flex-shrink: 0;"
                @click=${() => {
                  const updated = { ...stateColors };
                  delete updated[state];
                  onUpdate(updated);
                }}
              ></ha-icon>
            </div>
          `
        )}
        <button
          class="add-state-color-btn"
          style="margin-top: 8px; padding: 8px 16px; background: var(--primary-color); color: var(--text-primary-color, #fff); border: none; border-radius: 4px; cursor: pointer; font-size: 14px;"
          @click=${() => {
            const updated = { ...stateColors, new_state: 'gray' };
            onUpdate(updated);
          }}
        >
          <ha-icon icon="mdi:plus" style="margin-right: 4px;"></ha-icon>
          ${localize('editor.button.add_state_color', lang, 'Add State Color')}
        </button>
      </div>
    `;
  }
}

installSettingsMethods(UltraButtonModule, UltraButtonModuleSettings);

export function renderButtonGeneralTab(
  host: UltraButtonModule,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  return UltraButtonModuleSettings.prototype.renderGeneralTabContent.call(
    host as UltraButtonModuleSettings,
    module,
    hass,
    config,
    updateModule
  );
}

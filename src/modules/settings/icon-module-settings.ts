import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraIconModule, ICON_TEMPLATE_KEYS } from '../icon-module';
import { installSettingsMethods } from '../uc-lazy-settings';
import { CardModule, IconModule, IconConfig, UltraCardConfig } from '../../types';
import { localize } from '../../localize/localize';
import { renderUserVisibilitySection } from '../../tabs/uc-user-visibility-section';
import { EntityIconService } from '../../services/entity-icon-service';
import '../../components/ultra-color-picker';

type IconAnimation = NonNullable<IconConfig['active_icon_animation']>;
type IconBackgroundShape = NonNullable<IconConfig['active_icon_background']>;

/**
 * Icon module settings UI. Lives in the `core-settings` chunk (see
 * uc-lazy-settings.ts) so dashboards never download it. Declared as a subclass
 * so the moved code keeps `this.` access to the module helpers; it is never
 * instantiated, the module calls the method with itself as `this`.
 */
export class UltraIconModuleSettings extends UltraIconModule {
  /**
   * Read form value from ha-form value-changed event.
   * Supports both e.detail.value[field] and e.detail[field] for HA version differences.
   * Use this before calling _updateIcon to avoid writing undefined (which would delete the key in the editor).
   */
  private _formValue(e: CustomEvent, field: string): unknown {
    return (
      (e.detail?.value as Record<string, unknown>)?.[field] ??
      (e.detail as Record<string, unknown>)?.[field]
    );
  }

  renderGeneralTabContent(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const iconModule = module as IconModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings icon-module-general-settings">
        <!-- Module-Wide Size Controls -->
        <div class="settings-section" style="margin-bottom: 32px;">
          <div class="section-title">SIZE CONTROLS</div>
          <div class="section-description" style="margin-bottom: 16px;">
            Control the default text and icon sizes for this module. Design tab overrides these
            settings.
          </div>

          <!-- Text Size Control -->
          <div class="field-container" style="margin-bottom: 16px;">
            ${this.renderSliderField(
              `Text Size (${iconModule.text_size || 16}px)`,
              'Default size for all text elements (name, state)',
              iconModule.text_size || 16,
              16,
              10,
              48,
              1,
              (v: number) => {
                const updatedIcons = iconModule.icons.map((ic: any) => ({
                  ...ic,
                  text_size: v,
                  active_text_size: v,
                  inactive_text_size: v,
                }));
                updateModule({ text_size: v, icons: updatedIcons });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )}
          </div>

          <!-- Icon Size Control -->
          <div class="field-container" style="margin-bottom: 16px;">
            ${this.renderSliderField(
              `Icon Size (${iconModule.icon_size || 24}px)`,
              'Default size for all icons',
              iconModule.icon_size || 24,
              24,
              12,
              64,
              1,
              (v: number) => {
                const updatedIcons = iconModule.icons.map((ic: any) => ({
                  ...ic,
                  icon_size: v,
                  active_icon_size: v,
                  inactive_icon_size: v,
                }));
                updateModule({ icon_size: v, icons: updatedIcons });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )}
          </div>
        </div>

        <!-- Layout Controls -->
        <div class="settings-section" style="margin-bottom: 32px;">
          <div class="section-title">${localize('editor.icon.layout.title', lang, 'LAYOUT')}</div>
          <div class="section-description" style="margin-bottom: 16px;">
            ${localize(
              'editor.icon.layout.desc',
              lang,
              'Control how icons are arranged in the grid.'
            )}
          </div>

          <div class="field-container" style="margin-bottom: 16px;">
            ${this.renderSliderField(
              localize('editor.icon.layout.columns', lang, 'Columns'),
              localize('editor.icon.layout.columns_desc', lang, 'Number of icons per row'),
              iconModule.columns || 3,
              3,
              1,
              6,
              1,
              (v: number) => {
                updateModule({ columns: v });
              },
              ''
            )}
          </div>

          <div class="field-container" style="margin-bottom: 16px;">
            ${this.renderSliderField(
              localize('editor.icon.layout.gap', lang, 'Gap'),
              localize('editor.icon.layout.gap_desc', lang, 'Spacing between icons'),
              iconModule.gap ?? 16,
              16,
              0,
              50,
              1,
              (v: number) => {
                updateModule({ gap: v });
              }
            )}
          </div>

          ${this.renderFieldSection(
            localize('editor.icon.layout.alignment', lang, 'Alignment'),
            localize(
              'editor.icon.layout.alignment_desc',
              lang,
              'Horizontal alignment of the icon grid'
            ),
            hass,
            { alignment: iconModule.alignment || 'center' },
            [
              this.selectField('alignment', [
                { value: 'left', label: localize('editor.icon.layout.align_left', lang, 'Left') },
                {
                  value: 'center',
                  label: localize('editor.icon.layout.align_center', lang, 'Center'),
                },
                {
                  value: 'right',
                  label: localize('editor.icon.layout.align_right', lang, 'Right'),
                },
                {
                  value: 'space-between',
                  label: localize('editor.icon.layout.align_space_between', lang, 'Space Between'),
                },
                {
                  value: 'space-around',
                  label: localize('editor.icon.layout.align_space_around', lang, 'Space Around'),
                },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.alignment;
              if (!next || next === (iconModule.alignment || 'center')) return;
              updateModule({ alignment: next });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}
          ${this.renderFieldSection(
            localize('editor.icon.layout.allow_wrap', lang, 'Allow Wrapping'),
            localize(
              'editor.icon.layout.allow_wrap_desc',
              lang,
              'Allow icons to wrap onto new rows when they exceed the column count'
            ),
            hass,
            { allow_wrap: iconModule.allow_wrap !== false },
            [this.booleanField('allow_wrap')],
            (e: CustomEvent) => {
              updateModule({ allow_wrap: e.detail.value.allow_wrap });
              this.triggerPreviewUpdate();
            }
          )}
          ${this.renderSegmentedField(
            localize('editor.icon.layout.icon_position', lang, 'Icon Position'),
            localize(
              'editor.icon.layout.icon_position_desc',
              lang,
              'Position the icon relative to the name and state (left, top, right, or bottom)'
            ),
            iconModule.icon_position || 'top',
            [
              {
                value: 'left',
                label: localize('editor.icon.layout.pos_left', lang, 'Left'),
                icon: 'mdi:arrow-left',
              },
              {
                value: 'top',
                label: localize('editor.icon.layout.pos_top', lang, 'Top'),
                icon: 'mdi:arrow-up',
              },
              {
                value: 'right',
                label: localize('editor.icon.layout.pos_right', lang, 'Right'),
                icon: 'mdi:arrow-right',
              },
              {
                value: 'bottom',
                label: localize('editor.icon.layout.pos_bottom', lang, 'Bottom'),
                icon: 'mdi:arrow-down',
              },
            ],
            next => updateModule({ icon_position: next as IconModule['icon_position'] }),
            2
          )}
          ${this.renderSegmentedField(
            localize('editor.icon.layout.content_distribution', lang, 'Content Distribution'),
            localize(
              'editor.icon.layout.content_distribution_desc',
              lang,
              'Control how the icon and text are distributed inside each item'
            ),
            iconModule.content_distribution || 'normal',
            [
              {
                value: 'normal',
                label: localize('editor.icon.layout.dist_normal', lang, 'Normal'),
                icon: 'mdi:format-align-left',
              },
              {
                value: 'space-between',
                label: localize('editor.icon.layout.dist_space_between', lang, 'Space Between'),
                icon: 'mdi:arrow-left-right',
              },
              {
                value: 'space-around',
                label: localize('editor.icon.layout.dist_space_around', lang, 'Space Around'),
                icon: 'mdi:arrow-expand-horizontal',
              },
              {
                value: 'space-evenly',
                label: localize('editor.icon.layout.dist_space_evenly', lang, 'Space Evenly'),
                icon: 'mdi:arrow-expand-all',
              },
            ],
            next =>
              updateModule({ content_distribution: next as IconModule['content_distribution'] }),
            2
          )}
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;"
          >
            ${this.renderSegmentedField(
              localize('editor.icon.layout.overall_alignment', lang, 'Overall Alignment'),
              localize(
                'editor.icon.layout.overall_alignment_desc',
                lang,
                'Align each item within its grid cell'
              ),
              iconModule.overall_alignment || 'center',
              [
                {
                  value: 'left',
                  label: localize('editor.icon.layout.align_left', lang, 'Left'),
                  icon: 'mdi:format-align-left',
                },
                {
                  value: 'center',
                  label: localize('editor.icon.layout.align_center', lang, 'Center'),
                  icon: 'mdi:format-align-center',
                },
                {
                  value: 'right',
                  label: localize('editor.icon.layout.align_right', lang, 'Right'),
                  icon: 'mdi:format-align-right',
                },
              ],
              next => updateModule({ overall_alignment: next as IconModule['overall_alignment'] })
            )}
            ${this.renderSegmentedField(
              localize('editor.icon.layout.name_alignment', lang, 'Text Alignment'),
              localize(
                'editor.icon.layout.name_alignment_desc',
                lang,
                'Align the name and state text within the item'
              ),
              iconModule.name_alignment || 'center',
              [
                {
                  value: 'start',
                  label: localize('editor.icon.layout.text_start', lang, 'Start'),
                  icon: 'mdi:format-align-left',
                },
                {
                  value: 'center',
                  label: localize('editor.icon.layout.text_center', lang, 'Center'),
                  icon: 'mdi:format-align-center',
                },
                {
                  value: 'end',
                  label: localize('editor.icon.layout.text_end', lang, 'End'),
                  icon: 'mdi:format-align-right',
                },
              ],
              next => updateModule({ name_alignment: next as IconModule['name_alignment'] })
            )}
          </div>
        </div>

        ${iconModule.icons.map(
          (icon, index) => html`
            <ha-expansion-panel
              .outlined=${true}
              .expanded=${iconModule.icons.length === 1}
              class="icon-item-panel ${this._draggedIconIndex === index ? 'dragging' : ''} ${this
                ._dragOverIconIndex === index
                ? 'drag-over'
                : ''}"
            >
              <div
                slot="header"
                class="icon-item-header"
                draggable="true"
                @dragstart=${(e: DragEvent) => this._onIconDragStart(e, index)}
                @dragover=${(e: DragEvent) => this._onIconDragOver(e, index)}
                @dragend=${() => this._onIconDragEnd()}
                @drop=${(e: DragEvent) => this._onIconDrop(e, index, iconModule, updateModule)}
              >
                <div class="icon-item-drag-handle" @click=${(e: Event) => e.stopPropagation()}>
                  <ha-icon icon="mdi:drag"></ha-icon>
                </div>
                <div class="icon-item-badge">
                  <ha-icon icon="${this._iconHeaderIcon(icon, hass)}"></ha-icon>
                </div>
                <div class="icon-item-info">
                  <div class="icon-item-title">
                    ${this._iconHeaderTitle(icon, index, hass, lang)}
                  </div>
                  <div class="icon-item-subtitle">
                    ${this._iconHeaderSubtitle(icon, index, lang)}
                  </div>
                </div>
                <button
                  class="remove-icon-btn"
                  ?disabled=${iconModule.icons.length <= 1}
                  style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 1px solid var(--divider-color); border-radius: 6px; background: transparent; color: var(--error-color); cursor: pointer; flex-shrink: 0;"
                  title="${localize('editor.icon.remove_icon', lang, 'Remove Icon')}"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this._removeIcon(iconModule, index, updateModule);
                  }}
                >
                  <ha-icon icon="mdi:delete" style="--mdc-icon-size: 18px;"></ha-icon>
                </button>
              </div>
              <div class="icon-settings-container">
                <!-- Internal Name (editor-only organizational label) -->
                <div class="field-container" style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.icon.internal_name', lang, 'Name'),
                    localize(
                      'editor.icon.internal_name_desc',
                      lang,
                      'Editor-only label to keep icons organized. Never shown on the card.'
                    ),
                    hass,
                    { internal_name: icon.internal_name || '' },
                    [this.textField('internal_name')],
                    (e: CustomEvent) => {
                      this._updateIcon(
                        iconModule,
                        index,
                        { internal_name: e.detail.value.internal_name },
                        updateModule
                      );
                    }
                  )}
                </div>

                ${renderUserVisibilitySection(icon.user_visibility, hass, next => {
                  this._updateIcon(iconModule, index, { user_visibility: next }, updateModule);
                })}

                <!-- Icon Mode Selector -->
                <div class="settings-section" style="margin-bottom: 24px;">
                  <div class="section-title">
                    ${localize('editor.icon.icon_mode.title', lang, 'ICON MODE')}
                  </div>
                  <div
                    class="section-description"
                    style="margin-bottom: 16px; font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;"
                  >
                    ${localize(
                      'editor.icon.icon_mode.desc',
                      lang,
                      'Choose between an entity-connected icon or a static standalone icon'
                    )}
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button
                      style="
                      flex: 1;
                      padding: 12px 16px;
                      border: 2px solid ${(icon.icon_mode || 'entity') === 'entity'
                        ? 'var(--primary-color)'
                        : 'var(--divider-color)'};
                      border-radius: 8px;
                      background: ${(icon.icon_mode || 'entity') === 'entity'
                        ? 'var(--primary-color)'
                        : 'transparent'};
                      color: ${(icon.icon_mode || 'entity') === 'entity'
                        ? 'var(--text-primary-color, #fff)'
                        : 'var(--primary-text-color)'};
                      font-weight: 500;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 8px;
                    "
                      @click=${() => {
                        this._updateIcon(iconModule, index, { icon_mode: 'entity' }, updateModule);
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }}
                    >
                      <ha-icon icon="mdi:link-variant" style="--mdc-icon-size: 20px;"></ha-icon>
                      ${localize('editor.icon.icon_mode.entity', lang, 'Entity-Based')}
                    </button>
                    <button
                      style="
                      flex: 1;
                      padding: 12px 16px;
                      border: 2px solid ${icon.icon_mode === 'static'
                        ? 'var(--primary-color)'
                        : 'var(--divider-color)'};
                      border-radius: 8px;
                      background: ${icon.icon_mode === 'static'
                        ? 'var(--primary-color)'
                        : 'transparent'};
                      color: ${icon.icon_mode === 'static'
                        ? 'var(--text-primary-color, #fff)'
                        : 'var(--primary-text-color)'};
                      font-weight: 500;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 8px;
                    "
                      @click=${() => {
                        this._updateIcon(iconModule, index, { icon_mode: 'static' }, updateModule);
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }}
                    >
                      <ha-icon icon="mdi:image-outline" style="--mdc-icon-size: 20px;"></ha-icon>
                      ${localize('editor.icon.icon_mode.static', lang, 'Static')}
                    </button>
                  </div>
                </div>

                ${icon.icon_mode === 'static'
                  ? html`
                      <!-- Static Icon Configuration -->
                      ${this._renderStaticIconSettings(
                        icon,
                        index,
                        iconModule,
                        hass,
                        lang,
                        updateModule
                      )}
                    `
                  : html`
                      <!-- Entity Configuration (single settings-section box with title,
                         entity picker, and active/inactive state fields all inside) -->
                      <div
                        class="settings-section"
                        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
                      >
                        <div
                          class="section-title"
                          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
                        >
                          ${localize(
                            'editor.icon.entity_config.title',
                            lang,
                            'Entity Configuration'
                          )}
                        </div>
                        <div
                          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                        >
                          ${localize(
                            'editor.icon.entity_config.desc',
                            lang,
                            'Configure the entity and active/inactive states'
                          )}
                        </div>
                        ${this.renderEntityPickerWithVariables(
                          hass,
                          config,
                          'entity',
                          icon.entity || '',
                          (value: string) =>
                            this._handleEntitySelection(
                              icon,
                              index,
                              iconModule,
                              value,
                              hass,
                              updateModule,
                              config
                            ),
                          undefined,
                          localize('editor.icon.entity', lang, 'Entity')
                        )}
                        ${this.renderFieldSection(
                          localize('editor.icon.inactive_state', lang, 'Inactive State'),
                          localize(
                            'editor.icon.inactive_state_desc',
                            lang,
                            'State value considered "inactive" (leave blank to use actual entity state)'
                          ),
                          hass,
                          { inactive_state: icon.inactive_state || '' },
                          [this.textField('inactive_state')],
                          (e: CustomEvent) =>
                            this._updateIcon(
                              iconModule,
                              index,
                              { inactive_state: e.detail.value.inactive_state },
                              updateModule
                            )
                        )}
                        ${this.renderFieldSection(
                          localize('editor.icon.active_state', lang, 'Active State'),
                          localize(
                            'editor.icon.active_state_desc',
                            lang,
                            'State value considered "active" (leave blank to use actual entity state)'
                          ),
                          hass,
                          { active_state: icon.active_state || '' },
                          [this.textField('active_state')],
                          (e: CustomEvent) =>
                            this._updateIcon(
                              iconModule,
                              index,
                              { active_state: e.detail.value.active_state },
                              updateModule
                            )
                        )}
                      </div>

                      <!-- Attributes Section -->
                      <div class="settings-section" style="margin-bottom: 24px;">
                        <div class="section-title">
                          ${localize('editor.icon.attributes_section.title', lang, 'ATTRIBUTES')}
                        </div>
                        <div
                          class="section-description"
                          style="margin-bottom: 16px; font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;"
                        >
                          ${localize(
                            'editor.icon.attributes_section.desc',
                            lang,
                            'Select entity attributes to use instead of the main entity state for determining active/inactive conditions'
                          )}
                        </div>

                        <!-- Display Attribute (simple override) -->
                        <div class="field-container" style="margin-bottom: 16px;">
                          <div class="field-title">
                            ${localize('editor.icon.display_attribute', lang, 'Display Attribute')}
                          </div>
                          <div class="field-description">
                            ${localize(
                              'editor.icon.display_attribute_desc',
                              lang,
                              'Select an attribute to display instead of the entity state. For separate active/inactive attributes, use the options below.'
                            )}
                          </div>
                          ${this.renderUcForm(
                            hass,
                            { display_attribute: icon.display_attribute || '' },
                            [
                              this.selectField(
                                'display_attribute',
                                this._getEntityAttributes(icon.entity, hass, config)
                              ),
                            ],
                            (e: CustomEvent) => {
                              const next = e.detail.value.display_attribute;
                              const prev = iconModule.icons[index].display_attribute || '';
                              if (next === prev) return;
                              this._updateIcon(
                                iconModule,
                                index,
                                { display_attribute: next },
                                updateModule
                              );
                              setTimeout(() => {
                                this.triggerPreviewUpdate();
                              }, 50);
                            },
                            false
                          )}
                        </div>

                        <!-- Inactive Attribute -->
                        <div class="field-container" style="margin-bottom: 16px;">
                          <div class="field-title">
                            ${localize(
                              'editor.icon.inactive_attribute',
                              lang,
                              'Inactive Attribute'
                            )}
                          </div>
                          <div class="field-description">
                            ${localize(
                              'editor.icon.inactive_attribute_desc',
                              lang,
                              'Entity attribute to check for inactive state (e.g., "condition" for weather)'
                            )}
                          </div>
                          ${this.renderUcForm(
                            hass,
                            { inactive_attribute: icon.inactive_attribute || '' },
                            [
                              this.selectField(
                                'inactive_attribute',
                                this._getEntityAttributes(icon.entity, hass, config)
                              ),
                            ],
                            (e: CustomEvent) => {
                              const next = e.detail.value.inactive_attribute;
                              const prev = iconModule.icons[index].inactive_attribute || '';
                              if (next === prev) return;
                              this._updateIcon(
                                iconModule,
                                index,
                                { inactive_attribute: next },
                                updateModule
                              );
                              setTimeout(() => {
                                this.triggerPreviewUpdate();
                              }, 50);
                            },
                            false
                          )}
                        </div>

                        <!-- Active Attribute -->
                        <div class="field-container">
                          <div class="field-title">
                            ${localize('editor.icon.active_attribute', lang, 'Active Attribute')}
                          </div>
                          <div class="field-description">
                            ${localize(
                              'editor.icon.active_attribute_desc',
                              lang,
                              'Entity attribute to check for active state (e.g., "condition" for weather)'
                            )}
                          </div>
                          ${this.renderUcForm(
                            hass,
                            { active_attribute: icon.active_attribute || '' },
                            [
                              this.selectField(
                                'active_attribute',
                                this._getEntityAttributes(icon.entity, hass, config)
                              ),
                            ],
                            (e: CustomEvent) => {
                              const next = e.detail.value.active_attribute;
                              const prev = iconModule.icons[index].active_attribute || '';
                              if (next === prev) return;
                              this._updateIcon(
                                iconModule,
                                index,
                                { active_attribute: next },
                                updateModule
                              );
                              setTimeout(() => {
                                this.triggerPreviewUpdate();
                              }, 50);
                            },
                            false
                          )}
                        </div>
                      </div>

                      <!-- Icon Section -->
                      <div class="settings-section" style="margin-bottom: 24px;">
                        <div class="section-title">
                          <span>${localize('editor.icon.icon_section.title', lang, 'Icon')}</span>
                        </div>
                        ${this.renderFieldSection(
                          localize('editor.icon.icon_section.show_icon', lang, 'Show Icon'),
                          '',
                          hass,
                          {
                            show_icon_enabled:
                              icon.show_icon_when_active !== false &&
                              icon.show_icon_when_inactive !== false,
                          },
                          [this.booleanField('show_icon_enabled')],
                          (e: CustomEvent) => {
                            const enabled = e.detail.value.show_icon_enabled;
                            this._updateIcon(
                              iconModule,
                              index,
                              { show_icon_when_active: enabled, show_icon_when_inactive: enabled },
                              updateModule
                            );
                          }
                        )}
                        ${this.renderFieldSection(
                          localize(
                            'editor.icon.icon_section.show_entity_picture',
                            lang,
                            'Show Entity Picture'
                          ),
                          localize(
                            'editor.icon.icon_section.show_entity_picture_desc',
                            lang,
                            'When enabled, entity_picture replaces the configured icon when available.'
                          ),
                          hass,
                          { show_entity_picture: icon.show_entity_picture !== false },
                          [this.booleanField('show_entity_picture')],
                          (e: CustomEvent) => {
                            this._updateIcon(
                              iconModule,
                              index,
                              { show_entity_picture: e.detail.value.show_entity_picture },
                              updateModule
                            );
                          }
                        )}
                        ${icon.show_icon_when_active !== false ||
                        icon.show_icon_when_inactive !== false
                          ? html`
                              <!-- Inactive Icon Section -->
                              <div style="margin-top: 16px;">
                                <details
                                  data-uc-role="pane" style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--uc-pane-bg, var(--card-background-color));"
                                  @toggle=${(e: Event) => {
                                    const details = e.target as HTMLDetailsElement;
                                    const icon = details.querySelector('ha-icon') as HTMLElement;
                                    if (icon) {
                                      icon.style.transform = details.open
                                        ? 'rotate(90deg)'
                                        : 'rotate(0deg)';
                                    }
                                  }}
                                >
                                  <summary
                                    style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                  >
                                    <ha-icon
                                      icon="mdi:chevron-right"
                                      style="transition: transform 0.2s;"
                                    ></ha-icon>
                                    ${localize('editor.icon.inactive_icon', lang, 'Inactive Icon')}
                                  </summary>
                                  <div style="padding: 16px;">
                                    ${this.renderSettingsSection(
                                      localize(
                                        'editor.icon.inactive_icon_config',
                                        lang,
                                        'Inactive Icon Configuration'
                                      ),
                                      localize(
                                        'editor.icon.inactive_icon_config_desc',
                                        lang,
                                        'Configure the inactive icon settings'
                                      ),
                                      [
                                        {
                                          title: localize(
                                            'editor.icon.inactive_icon',
                                            lang,
                                            'Inactive Icon'
                                          ),
                                          description: localize(
                                            'editor.icon.inactive_icon_desc',
                                            lang,
                                            'Icon to show when inactive'
                                          ),
                                          hass,
                                          data: { icon_inactive: icon.icon_inactive || '' },
                                          schema: [this.iconField('icon_inactive')],
                                          onChange: (e: CustomEvent) =>
                                            this._updateIconWithLockSync(
                                              iconModule,
                                              index,
                                              'icon_inactive',
                                              e.detail.value.icon_inactive,
                                              updateModule
                                            ),
                                        },
                                      ]
                                    )}

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.inactive_icon_color',
                                          lang,
                                          'Inactive Icon Color'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.icon_color_inactive',
                                          lang,
                                          'Color when inactive'
                                        )}
                                      </div>
                                      <ultra-color-picker
                                        .value=${icon.inactive_icon_color ||
                                        'var(--secondary-text-color)'}
                                        @value-changed=${(e: CustomEvent) =>
                                          this._debouncedUpdateIconWithLockSync(
                                            iconModule,
                                            index,
                                            'inactive_icon_color',
                                            e.detail.value,
                                            updateModule,
                                            50
                                          )}
                                      ></ultra-color-picker>
                                    </div>

                                    ${this.renderFieldSection(
                                      localize(
                                        'editor.icon.use_state_color_inactive',
                                        lang,
                                        'Use State Color'
                                      ),
                                      localize(
                                        'editor.icon.use_state_color_inactive_desc',
                                        lang,
                                        'Use the entity state color (RGB attributes) for inactive icon color'
                                      ),
                                      hass,
                                      {
                                        use_state_color_for_inactive_icon:
                                          icon.use_state_color_for_inactive_icon || false,
                                      },
                                      [this.booleanField('use_state_color_for_inactive_icon')],
                                      (e: CustomEvent) =>
                                        this._updateIcon(
                                          iconModule,
                                          index,
                                          {
                                            use_state_color_for_inactive_icon:
                                              e.detail.value.use_state_color_for_inactive_icon,
                                          },
                                          updateModule
                                        )
                                    )}
                                    ${this.renderSettingsSection(
                                      localize(
                                        'editor.icon.background_section.title',
                                        lang,
                                        'Inactive Background'
                                      ),
                                      localize(
                                        'editor.icon.background_section.desc',
                                        lang,
                                        'Configure the inactive background settings'
                                      ),
                                      [
                                        {
                                          title: localize(
                                            'editor.icon.inactive_icon_background',
                                            lang,
                                            'Inactive Background Shape'
                                          ),
                                          description: localize(
                                            'editor.icon.background_shape_inactive',
                                            lang,
                                            'Background shape when inactive'
                                          ),
                                          hass,
                                          data: {
                                            inactive_icon_background:
                                              icon.inactive_icon_background || 'none',
                                          },
                                          schema: [
                                            this.selectField('inactive_icon_background', [
                                              { value: 'none', label: 'None' },
                                              { value: 'circle', label: 'Circle' },
                                              { value: 'square', label: 'Square' },
                                              { value: 'rounded-square', label: 'Rounded Square' },
                                            ]),
                                          ],
                                          onChange: (e: CustomEvent) => {
                                            const raw = this._formValue(
                                              e,
                                              'inactive_icon_background'
                                            );
                                            if (raw === undefined) return;
                                            const next = String(raw);
                                            const prev =
                                              iconModule.icons[index].inactive_icon_background ||
                                              'none';
                                            if (next === prev) return;
                                            const updates: any = {
                                              inactive_icon_background: next,
                                            };
                                            if (next && next !== 'none') {
                                              updates.inactive_icon_background_color =
                                                'var(--divider-color)';
                                            }
                                            this._updateIcon(
                                              iconModule,
                                              index,
                                              updates,
                                              updateModule
                                            );
                                          },
                                        },
                                      ]
                                    )}

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.inactive_icon_background_color',
                                          lang,
                                          'Inactive Background Color'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.background_color_inactive',
                                          lang,
                                          'Background color when inactive'
                                        )}
                                      </div>
                                      <ultra-color-picker
                                        .value=${icon.inactive_icon_background_color ||
                                        'transparent'}
                                        @value-changed=${(e: CustomEvent) =>
                                          this._debouncedUpdateIconWithLockSync(
                                            iconModule,
                                            index,
                                            'inactive_icon_background_color',
                                            e.detail.value,
                                            updateModule,
                                            50
                                          )}
                                      ></ultra-color-picker>
                                    </div>

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.inactive_icon_background_padding',
                                          lang,
                                          'Inactive Background Padding'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.background_padding_inactive',
                                          lang,
                                          'Padding between icon and background when inactive'
                                        )}
                                      </div>
                                      ${this._renderSizeControl(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'inactive_icon_background_padding',
                                        icon.inactive_icon_background_padding ?? 8,
                                        0,
                                        50,
                                        8
                                      )}
                                    </div>

                                    <div class="field-container">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.inactive_icon_size',
                                          lang,
                                          'Inactive Icon Size'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.icon_size_inactive',
                                          lang,
                                          'Icon size when inactive'
                                        )}
                                      </div>
                                      ${this._renderSizeControl(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'inactive_icon_size',
                                        icon.inactive_icon_size || 26,
                                        0,
                                        200,
                                        26
                                      )}
                                    </div>
                                  </div>
                                </details>
                              </div>

                              <!-- Active Icon Section -->
                              <div style="margin-top: 16px;">
                                <details
                                  style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--uc-pane-bg, var(--card-background-color));"
                                  @toggle=${(e: Event) => {
                                    const details = e.target as HTMLDetailsElement;
                                    const icon = details.querySelector('ha-icon') as HTMLElement;
                                    if (icon) {
                                      icon.style.transform = details.open
                                        ? 'rotate(90deg)'
                                        : 'rotate(0deg)';
                                    }
                                  }}
                                >
                                  <summary
                                    style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                  >
                                    <ha-icon
                                      icon="mdi:chevron-right"
                                      style="transition: transform 0.2s;"
                                    ></ha-icon>
                                    ${localize('editor.icon.active_icon', lang, 'Active Icon')}
                                  </summary>
                                  <div style="padding: 16px;">
                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize('editor.icon.active_icon', lang, 'Active Icon')}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.active_icon_desc',
                                          lang,
                                          'Icon to show when active'
                                        )}
                                      </div>
                                      ${this._renderFieldWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'active_icon_locked',
                                        'icon_active',
                                        'icon_inactive',
                                        icon.icon_active || icon.icon_inactive || '',
                                        'icon',
                                        hass
                                      )}
                                    </div>

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.active_icon_color',
                                          lang,
                                          'Active Icon Color'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.icon_color_active',
                                          lang,
                                          'Color when active'
                                        )}
                                      </div>
                                      ${this._renderFieldWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'active_icon_color_locked',
                                        'active_icon_color',
                                        'inactive_icon_color',
                                        icon.active_icon_color || 'var(--primary-color)',
                                        'color',
                                        hass
                                      )}
                                    </div>

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.use_state_color_active',
                                          lang,
                                          'Use State Color'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.use_state_color_active_desc',
                                          lang,
                                          'Use the entity state color (RGB attributes) for active icon color'
                                        )}
                                      </div>
                                      ${this._renderFieldWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'active_state_color_locked',
                                        'use_state_color_for_active_icon',
                                        'use_state_color_for_inactive_icon',
                                        icon.use_state_color_for_active_icon || false,
                                        'toggle',
                                        hass
                                      )}
                                    </div>

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.active_icon_background',
                                          lang,
                                          'Active Background Shape'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.background_shape_active',
                                          lang,
                                          'Background shape when active'
                                        )}
                                      </div>
                                      ${this._renderFieldWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'active_icon_background_locked',
                                        'active_icon_background',
                                        'inactive_icon_background',
                                        icon.active_icon_background || 'none',
                                        'select',
                                        hass,
                                        [
                                          { value: 'none', label: 'None' },
                                          { value: 'circle', label: 'Circle' },
                                          { value: 'square', label: 'Square' },
                                          { value: 'rounded-square', label: 'Rounded Square' },
                                        ]
                                      )}
                                    </div>

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.active_icon_background_color',
                                          lang,
                                          'Active Background Color'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.background_color_active',
                                          lang,
                                          'Background color when active'
                                        )}
                                      </div>
                                      ${this._renderFieldWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'active_icon_background_color_locked',
                                        'active_icon_background_color',
                                        'inactive_icon_background_color',
                                        icon.active_icon_background_color || 'transparent',
                                        'color',
                                        hass
                                      )}
                                    </div>

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.active_icon_background_padding',
                                          lang,
                                          'Active Background Padding'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.background_padding_active',
                                          lang,
                                          'Padding between icon and background when active'
                                        )}
                                      </div>
                                      ${this._renderSizeControlWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'active_icon_background_padding_locked',
                                        'active_icon_background_padding',
                                        'inactive_icon_background_padding',
                                        icon.active_icon_background_padding ?? 8,
                                        0,
                                        50,
                                        8
                                      )}
                                    </div>

                                    <div class="field-container">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.active_icon_size',
                                          lang,
                                          'Active Icon Size'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.icon_size_active',
                                          lang,
                                          'Icon size when active'
                                        )}
                                      </div>
                                      ${this._renderSizeControlWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'icon_size',
                                        'active_icon_size',
                                        'inactive_icon_size',
                                        icon.active_icon_size || 26,
                                        0,
                                        200,
                                        26
                                      )}
                                    </div>
                                  </div>
                                </details>
                              </div>
                            `
                          : ''}
                      </div>

                      <!-- Name Section -->
                      <div class="settings-section" style="margin-bottom: 24px;">
                        <div class="section-title">
                          <span>${localize('editor.icon.name_section.title', lang, 'Name')}</span>
                        </div>
                        ${this.renderFieldSection(
                          localize('editor.icon.name_section.show_name', lang, 'Show Name'),
                          '',
                          hass,
                          {
                            show_name_enabled:
                              icon.show_name_when_active !== false &&
                              icon.show_name_when_inactive !== false,
                          },
                          [this.booleanField('show_name_enabled')],
                          (e: CustomEvent) => {
                            const enabled = e.detail.value.show_name_enabled;
                            this._updateIcon(
                              iconModule,
                              index,
                              { show_name_when_active: enabled, show_name_when_inactive: enabled },
                              updateModule
                            );
                          }
                        )}
                        ${icon.show_name_when_active !== false ||
                        icon.show_name_when_inactive !== false
                          ? html`
                              <!-- Inactive Name Section -->
                              <div style="margin-top: 16px;">
                                <details
                                  style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--uc-pane-bg, var(--card-background-color));"
                                  @toggle=${(e: Event) => {
                                    const details = e.target as HTMLDetailsElement;
                                    const icon = details.querySelector('ha-icon') as HTMLElement;
                                    if (icon) {
                                      icon.style.transform = details.open
                                        ? 'rotate(90deg)'
                                        : 'rotate(0deg)';
                                    }
                                  }}
                                >
                                  <summary
                                    style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                  >
                                    <ha-icon
                                      icon="mdi:chevron-right"
                                      style="transition: transform 0.2s;"
                                    ></ha-icon>
                                    ${localize('editor.icon.inactive_name', lang, 'Inactive Name')}
                                  </summary>
                                  <div style="padding: 16px;">
                                    ${this.renderSettingsSection(
                                      localize(
                                        'editor.icon.inactive_name_config',
                                        lang,
                                        'Inactive Name Configuration'
                                      ),
                                      localize(
                                        'editor.icon.inactive_name_config_desc',
                                        lang,
                                        'Configure the inactive name settings'
                                      ),
                                      [
                                        {
                                          title: localize(
                                            'editor.icon.custom_inactive_name',
                                            lang,
                                            'Custom Inactive Name'
                                          ),
                                          description: localize(
                                            'editor.icon.custom_inactive_name_desc',
                                            lang,
                                            'Override entity name when inactive (leave empty to use entity name)'
                                          ),
                                          hass,
                                          data: {
                                            custom_inactive_name_text:
                                              icon.custom_inactive_name_text || '',
                                          },
                                          schema: [this.textField('custom_inactive_name_text')],
                                          onChange: (e: CustomEvent) =>
                                            this._updateIcon(
                                              iconModule,
                                              index,
                                              {
                                                custom_inactive_name_text:
                                                  e.detail.value.custom_inactive_name_text,
                                              },
                                              updateModule
                                            ),
                                        },
                                      ]
                                    )}

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.inactive_name_color',
                                          lang,
                                          'Inactive Name Color'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.name_color_inactive',
                                          lang,
                                          'Name color when inactive'
                                        )}
                                      </div>
                                      <ultra-color-picker
                                        .value=${icon.inactive_name_color ||
                                        'var(--primary-text-color)'}
                                        @value-changed=${(e: CustomEvent) =>
                                          this._debouncedUpdateIconWithLockSync(
                                            iconModule,
                                            index,
                                            'inactive_name_color',
                                            e.detail.value,
                                            updateModule,
                                            50
                                          )}
                                      ></ultra-color-picker>
                                    </div>

                                    <div class="field-container">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.inactive_name_size',
                                          lang,
                                          'Inactive Name Size'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.name_size_inactive',
                                          lang,
                                          'Name text size when inactive'
                                        )}
                                      </div>
                                      ${this._renderSizeControl(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'inactive_text_size',
                                        icon.inactive_text_size || 14,
                                        0,
                                        50,
                                        14
                                      )}
                                    </div>
                                  </div>
                                </details>
                              </div>

                              <!-- Active Name Section -->
                              <div style="margin-top: 16px;">
                                <details
                                  style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--uc-pane-bg, var(--card-background-color));"
                                  @toggle=${(e: Event) => {
                                    const details = e.target as HTMLDetailsElement;
                                    const icon = details.querySelector('ha-icon') as HTMLElement;
                                    if (icon) {
                                      icon.style.transform = details.open
                                        ? 'rotate(90deg)'
                                        : 'rotate(0deg)';
                                    }
                                  }}
                                >
                                  <summary
                                    style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                  >
                                    <ha-icon
                                      icon="mdi:chevron-right"
                                      style="transition: transform 0.2s;"
                                    ></ha-icon>
                                    ${localize('editor.icon.active_name', lang, 'Active Name')}
                                  </summary>
                                  <div style="padding: 16px;">
                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.custom_active_name',
                                          lang,
                                          'Custom Active Name'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.custom_active_name_desc',
                                          lang,
                                          'Override entity name when active (leave empty to use entity name)'
                                        )}
                                      </div>
                                      ${this._renderFieldWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'active_name_locked',
                                        'custom_active_name_text',
                                        'custom_inactive_name_text',
                                        icon.custom_active_name_text || '',
                                        'text',
                                        hass
                                      )}
                                    </div>

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.active_name_color',
                                          lang,
                                          'Active Name Color'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.name_color_active',
                                          lang,
                                          'Name color when active'
                                        )}
                                      </div>
                                      ${this._renderFieldWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'active_name_color_locked',
                                        'active_name_color',
                                        'inactive_name_color',
                                        icon.active_name_color || 'var(--primary-text-color)',
                                        'color',
                                        hass
                                      )}
                                    </div>

                                    <div class="field-container">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.active_name_size',
                                          lang,
                                          'Active Name Size'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.name_size_active',
                                          lang,
                                          'Name text size when active'
                                        )}
                                      </div>
                                      ${this._renderSizeControlWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'text_size',
                                        'active_text_size',
                                        'inactive_text_size',
                                        icon.active_text_size || icon.inactive_text_size || 14,
                                        0,
                                        50,
                                        12
                                      )}
                                    </div>
                                  </div>
                                </details>
                              </div>
                            `
                          : ''}
                      </div>

                      <!-- State Section -->
                      <div class="settings-section" style="margin-bottom: 24px;">
                        <div class="section-title">
                          <span>${localize('editor.icon.state_section.title', lang, 'State')}</span>
                        </div>
                        ${this.renderFieldSection(
                          localize('editor.icon.state_section.show_state', lang, 'Show State'),
                          '',
                          hass,
                          {
                            show_state_enabled:
                              icon.show_state_when_active !== false &&
                              icon.show_state_when_inactive !== false,
                          },
                          [this.booleanField('show_state_enabled')],
                          (e: CustomEvent) => {
                            const enabled = e.detail.value.show_state_enabled;
                            this._updateIcon(
                              iconModule,
                              index,
                              {
                                show_state_when_active: enabled,
                                show_state_when_inactive: enabled,
                              },
                              updateModule
                            );
                          }
                        )}
                        ${icon.show_state_when_active !== false ||
                        icon.show_state_when_inactive !== false
                          ? html`
                              <!-- Inactive State Section -->
                              <div style="margin-top: 16px;">
                                <details
                                  style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--uc-pane-bg, var(--card-background-color));"
                                  @toggle=${(e: Event) => {
                                    const details = e.target as HTMLDetailsElement;
                                    const icon = details.querySelector('ha-icon') as HTMLElement;
                                    if (icon) {
                                      icon.style.transform = details.open
                                        ? 'rotate(90deg)'
                                        : 'rotate(0deg)';
                                    }
                                  }}
                                >
                                  <summary
                                    style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                  >
                                    <ha-icon
                                      icon="mdi:chevron-right"
                                      style="transition: transform 0.2s;"
                                    ></ha-icon>
                                    ${localize(
                                      'editor.icon.inactive_state',
                                      lang,
                                      'Inactive State'
                                    )}
                                  </summary>
                                  <div style="padding: 16px;">
                                    ${this.renderSettingsSection(
                                      localize(
                                        'editor.icon.inactive_state_config',
                                        lang,
                                        'Inactive State Configuration'
                                      ),
                                      localize(
                                        'editor.icon.inactive_state_config_desc',
                                        lang,
                                        'Configure the inactive state settings'
                                      ),
                                      [
                                        {
                                          title: localize(
                                            'editor.icon.custom_inactive_state',
                                            lang,
                                            'Custom Inactive State'
                                          ),
                                          description: localize(
                                            'editor.icon.custom_inactive_state_desc',
                                            lang,
                                            'Custom text when inactive (leave empty to use actual state)'
                                          ),
                                          hass,
                                          data: {
                                            custom_inactive_state_text:
                                              icon.custom_inactive_state_text || '',
                                          },
                                          schema: [this.textField('custom_inactive_state_text')],
                                          onChange: (e: CustomEvent) =>
                                            this._updateIcon(
                                              iconModule,
                                              index,
                                              {
                                                custom_inactive_state_text:
                                                  e.detail.value.custom_inactive_state_text,
                                              },
                                              updateModule
                                            ),
                                        },
                                      ]
                                    )}

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.inactive_state_color',
                                          lang,
                                          'Inactive State Color'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.state_color_inactive',
                                          lang,
                                          'State color when inactive'
                                        )}
                                      </div>
                                      <ultra-color-picker
                                        .value=${icon.inactive_state_color ||
                                        'var(--secondary-text-color)'}
                                        @value-changed=${(e: CustomEvent) =>
                                          this._debouncedUpdateIconWithLockSync(
                                            iconModule,
                                            index,
                                            'inactive_state_color',
                                            e.detail.value,
                                            updateModule,
                                            50
                                          )}
                                      ></ultra-color-picker>
                                    </div>

                                    <div class="field-container">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.inactive_state_size',
                                          lang,
                                          'Inactive State Size'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.state_size_inactive',
                                          lang,
                                          'State text size when inactive'
                                        )}
                                      </div>
                                      ${this._renderSizeControl(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'inactive_state_size',
                                        icon.inactive_state_size || 10,
                                        0,
                                        50,
                                        10
                                      )}
                                    </div>
                                  </div>
                                </details>
                              </div>

                              <!-- Active State Section -->
                              <div style="margin-top: 16px;">
                                <details
                                  style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--uc-pane-bg, var(--card-background-color));"
                                  @toggle=${(e: Event) => {
                                    const details = e.target as HTMLDetailsElement;
                                    const icon = details.querySelector('ha-icon') as HTMLElement;
                                    if (icon) {
                                      icon.style.transform = details.open
                                        ? 'rotate(90deg)'
                                        : 'rotate(0deg)';
                                    }
                                  }}
                                >
                                  <summary
                                    style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                                  >
                                    <ha-icon
                                      icon="mdi:chevron-right"
                                      style="transition: transform 0.2s;"
                                    ></ha-icon>
                                    ${localize('editor.icon.active_state', lang, 'Active State')}
                                  </summary>
                                  <div style="padding: 16px;">
                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.custom_active_state',
                                          lang,
                                          'Custom Active State'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.custom_active_state_desc',
                                          lang,
                                          'Custom text when active (leave empty to use actual state)'
                                        )}
                                      </div>
                                      ${this._renderFieldWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'active_state_locked',
                                        'custom_active_state_text',
                                        'custom_inactive_state_text',
                                        icon.custom_active_state_text || '',
                                        'text',
                                        hass
                                      )}
                                    </div>

                                    <div class="field-container" style="margin-bottom: 16px;">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.active_state_color',
                                          lang,
                                          'Active State Color'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.state_color_active',
                                          lang,
                                          'State color when active'
                                        )}
                                      </div>
                                      ${this._renderFieldWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'active_state_color_locked',
                                        'active_state_color',
                                        'inactive_state_color',
                                        icon.active_state_color || 'var(--secondary-text-color)',
                                        'color',
                                        hass
                                      )}
                                    </div>

                                    <div class="field-container">
                                      <div class="field-title">
                                        ${localize(
                                          'editor.icon.active_state_size',
                                          lang,
                                          'Active State Size'
                                        )}
                                      </div>
                                      <div class="field-description">
                                        ${localize(
                                          'editor.icon.state_size_active',
                                          lang,
                                          'State text size when active'
                                        )}
                                      </div>
                                      ${this._renderSizeControlWithLock(
                                        iconModule,
                                        index,
                                        updateModule,
                                        'state_size',
                                        'active_state_size',
                                        'inactive_state_size',
                                        icon.active_state_size || 10,
                                        0,
                                        50,
                                        10
                                      )}
                                    </div>
                                  </div>
                                </details>
                              </div>
                            `
                          : ''}
                      </div>

                      <!-- Unified Template Section -->
                      <div class="template-section" style="margin-bottom: 24px;">
                        <div class="template-header">
                          <div class="switch-container">
                            <div class="switch-label-row">
                              <label class="switch-label"
                                >${localize(
                                  'editor.icon.unified_template_section.title',
                                  lang,
                                  'Template Mode'
                                )}</label
                              >
                              <button
                                class="help-btn"
                                style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;background:var(--primary-color, #03a9f4);border:none;color:var(--text-primary-color, #fff);cursor:pointer;border-radius:50%;line-height:0;"
                                title="${localize(
                                  'editor.icon.template_cheatsheet',
                                  lang,
                                  'Template Cheatsheet'
                                )}"
                                @click=${(e: Event) => {
                                  (e.currentTarget as HTMLElement).dispatchEvent(
                                    new CustomEvent('uc-open-template-cheatsheet', {
                                      detail: { module: 'icon' },
                                      bubbles: true,
                                      composed: true,
                                    })
                                  );
                                }}
                              >
                                <ha-icon
                                  icon="mdi:help-circle"
                                  style="--mdc-icon-size:18px;width:18px;height:18px;color:var(--text-primary-color, #fff);"
                                ></ha-icon>
                              </button>
                            </div>
                            ${this.renderUcForm(
                              hass,
                              { unified_template_mode: icon.unified_template_mode || false },
                              [this.booleanField('unified_template_mode')],
                              (e: CustomEvent) =>
                                this._updateIcon(
                                  iconModule,
                                  index,
                                  { unified_template_mode: e.detail.value.unified_template_mode },
                                  updateModule
                                )
                            )}
                          </div>
                          <div class="template-description">
                            ${localize(
                              'editor.icon.unified_template_section.desc',
                              lang,
                              'Use Jinja2 templates to control icon and color dynamically. Return simple string for icon-only, or JSON object for multiple properties. Uses entity context variables (entity, state, name, attributes) for seamless entity remapping.'
                            )}
                          </div>
                        </div>

                        ${icon.unified_template_mode
                          ? html`
                              <!-- Ignore Entity State Config Toggle -->
                              <div
                                style="margin-bottom: 16px; padding: 12px; background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.1); border-radius: 8px; border-left: 4px solid var(--warning-color, #FF9800);"
                              >
                                ${this.renderFieldSection(
                                  localize(
                                    'editor.icon.ignore_entity_state',
                                    lang,
                                    'Ignore Entity State Config'
                                  ),
                                  localize(
                                    'editor.icon.ignore_entity_state_desc',
                                    lang,
                                    'When enabled, entity state settings above will be ignored and template will control active/inactive state for animations'
                                  ),
                                  hass,
                                  {
                                    ignore_entity_state_config:
                                      icon.ignore_entity_state_config || false,
                                  },
                                  [this.booleanField('ignore_entity_state_config')],
                                  (e: CustomEvent) =>
                                    this._updateIcon(
                                      iconModule,
                                      index,
                                      {
                                        ignore_entity_state_config:
                                          e.detail.value.ignore_entity_state_config,
                                      },
                                      updateModule
                                    )
                                )}
                              </div>

                              <div
                                class="template-content"
                                @mousedown=${(e: Event) => {
                                  // Only stop propagation for drag operations, not clicks on the editor
                                  const target = e.target as HTMLElement;
                                  if (
                                    !target.closest('ultra-template-editor') &&
                                    !target.closest('.cm-editor')
                                  ) {
                                    e.stopPropagation();
                                  }
                                }}
                                @dragstart=${(e: Event) => e.stopPropagation()}
                                @insert-snippet=${(e: CustomEvent) => {
                                  const editor = (e.currentTarget as HTMLElement).querySelector(
                                    'ultra-template-editor'
                                  );
                                  (editor as any)?.insertAtCursor?.(e.detail?.value ?? '');
                                }}
                              >
                                <ultra-template-editor
                                  .hass=${hass}
                                  .value=${icon.unified_template || ''}
                                  .placeholder=${'{% set level = state | int %}\n{\n  "icon": "mdi:battery-{{ (level / 10) | round(0) * 10 }}",\n  "icon_color": "{% if level <= 20 %}red{% else %}green{% endif %}"\n}'}
                                  .minHeight=${200}
                                  .maxHeight=${500}
                                  @value-changed=${(e: CustomEvent) => {
                                    this._updateIcon(
                                      iconModule,
                                      index,
                                      { unified_template: e.detail.value },
                                      updateModule
                                    );
                                  }}
                                ></ultra-template-editor>
                                ${this.renderTemplateKeyWarning(
                                  icon.unified_template,
                                  ICON_TEMPLATE_KEYS,
                                  lang
                                )}
                                <div class="template-help">
                                  <p><strong>Return simple string for icon-only:</strong></p>
                                  <ul>
                                    <li><code>mdi:fire</code> → Changes icon only</li>
                                    <li>
                                      <code
                                        >{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{%
                                        endif %}</code
                                      >
                                    </li>
                                  </ul>
                                  <p><strong>Return JSON for multiple properties:</strong></p>
                                  <ul>
                                    <li>
                                      <code>{ "icon": "mdi:fire", "icon_color": "#FF0000" }</code>
                                    </li>
                                    <li>
                                      Available properties: <code>icon</code>,
                                      <code>icon_color</code>, <code>name</code>,
                                      <code>name_color</code>, <code>state_text</code>,
                                      <code>state_color</code>,
                                      <code>container_background_color</code>, <code>active</code>
                                    </li>
                                  </ul>
                                  <p>
                                    <strong
                                      >Entity context variables (no need to hardcode entity
                                      ID):</strong
                                    >
                                  </p>
                                  <ul>
                                    <li><code>entity</code> → Entity ID (${icon.entity})</li>
                                    <li><code>state</code> → Current state value</li>
                                    <li><code>name</code> → Entity name</li>
                                    <li><code>attributes</code> → All entity attributes</li>
                                    <li><code>unit</code> → Unit of measurement</li>
                                    <li>
                                      <code>domain</code> → Entity domain (e.g., 'sensor', 'light')
                                    </li>
                                    <li><code>device_class</code> → Device class</li>
                                  </ul>
                                  <p><strong>Example - Works with ANY battery entity:</strong></p>
                                  <code
                                    style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px;"
                                  >
                                    {% set level = state | int %}<br />
                                    {<br />
                                    &nbsp;&nbsp;"icon": "mdi:battery-{{ (level / 10) | round(0) * 10
                                    }}",<br />
                                    &nbsp;&nbsp;"icon_color": "{% if level <= 20 %}#FF0000{% elif
                                    level <= 50 %}#FF8800{% else %}#00CC00{% endif %}"<br />
                                    }
                                  </code>
                                </div>
                              </div>
                            `
                          : ''}
                      </div>

                      <!-- Icon Animation Section -->
                      ${this.renderSettingsSection(
                        localize('editor.icon.animation_section.title', lang, 'Icon Animation'),
                        localize(
                          'editor.icon.animation_section.desc',
                          lang,
                          'Configure animations for active and inactive states'
                        ),
                        [
                          {
                            title: localize(
                              'editor.icon.active_animation',
                              lang,
                              'Active Animation'
                            ),
                            description: localize(
                              'editor.icon.active_animation_desc',
                              lang,
                              'Animation when icon is active'
                            ),
                            hass,
                            data: { active_icon_animation: icon.active_icon_animation || 'none' },
                            schema: [
                              this.selectField('active_icon_animation', [
                                {
                                  value: 'none',
                                  label: localize('editor.icon.animation_none', lang, 'None'),
                                },
                                {
                                  value: 'pulse',
                                  label: localize('editor.icon.animation_pulse', lang, 'Pulse'),
                                },
                                {
                                  value: 'spin',
                                  label: localize('editor.icon.animation_spin', lang, 'Spin'),
                                },
                                {
                                  value: 'bounce',
                                  label: localize('editor.icon.animation_bounce', lang, 'Bounce'),
                                },
                                {
                                  value: 'flash',
                                  label: localize('editor.icon.animation_flash', lang, 'Flash'),
                                },
                                {
                                  value: 'shake',
                                  label: localize('editor.icon.animation_shake', lang, 'Shake'),
                                },
                                {
                                  value: 'vibrate',
                                  label: localize('editor.icon.animation_vibrate', lang, 'Vibrate'),
                                },
                                {
                                  value: 'rotate-left',
                                  label: localize(
                                    'editor.icon.animation_rotate_left',
                                    lang,
                                    'Rotate Left'
                                  ),
                                },
                                {
                                  value: 'rotate-right',
                                  label: localize(
                                    'editor.icon.animation_rotate_right',
                                    lang,
                                    'Rotate Right'
                                  ),
                                },
                                {
                                  value: 'fade',
                                  label: localize('editor.icon.animation_fade', lang, 'Fade'),
                                },
                                {
                                  value: 'scale',
                                  label: localize('editor.icon.animation_scale', lang, 'Scale'),
                                },
                                {
                                  value: 'tada',
                                  label: localize('editor.icon.animation_tada', lang, 'Tada'),
                                },
                              ]),
                            ],
                            onChange: (e: CustomEvent) => {
                              const raw = this._formValue(e, 'active_icon_animation');
                              if (raw === undefined) return;
                              const next = String(raw) as IconAnimation;
                              const prev = iconModule.icons[index].active_icon_animation || 'none';
                              if (next === prev) return;
                              this._updateIcon(
                                iconModule,
                                index,
                                { active_icon_animation: next },
                                updateModule
                              );
                              // Trigger re-render to update dropdown UI
                              setTimeout(() => {
                                this.triggerPreviewUpdate();
                              }, 50);
                            },
                          },
                          {
                            title: localize(
                              'editor.icon.inactive_animation',
                              lang,
                              'Inactive Animation'
                            ),
                            description: localize(
                              'editor.icon.inactive_animation_desc',
                              lang,
                              'Animation when icon is inactive'
                            ),
                            hass,
                            data: {
                              inactive_icon_animation: icon.inactive_icon_animation || 'none',
                            },
                            schema: [
                              this.selectField('inactive_icon_animation', [
                                {
                                  value: 'none',
                                  label: localize('editor.icon.animation_none', lang, 'None'),
                                },
                                {
                                  value: 'pulse',
                                  label: localize('editor.icon.animation_pulse', lang, 'Pulse'),
                                },
                                {
                                  value: 'spin',
                                  label: localize('editor.icon.animation_spin', lang, 'Spin'),
                                },
                                {
                                  value: 'bounce',
                                  label: localize('editor.icon.animation_bounce', lang, 'Bounce'),
                                },
                                {
                                  value: 'flash',
                                  label: localize('editor.icon.animation_flash', lang, 'Flash'),
                                },
                                {
                                  value: 'shake',
                                  label: localize('editor.icon.animation_shake', lang, 'Shake'),
                                },
                                {
                                  value: 'vibrate',
                                  label: localize('editor.icon.animation_vibrate', lang, 'Vibrate'),
                                },
                                {
                                  value: 'rotate-left',
                                  label: localize(
                                    'editor.icon.animation_rotate_left',
                                    lang,
                                    'Rotate Left'
                                  ),
                                },
                                {
                                  value: 'rotate-right',
                                  label: localize(
                                    'editor.icon.animation_rotate_right',
                                    lang,
                                    'Rotate Right'
                                  ),
                                },
                                {
                                  value: 'fade',
                                  label: localize('editor.icon.animation_fade', lang, 'Fade'),
                                },
                                {
                                  value: 'scale',
                                  label: localize('editor.icon.animation_scale', lang, 'Scale'),
                                },
                                {
                                  value: 'tada',
                                  label: localize('editor.icon.animation_tada', lang, 'Tada'),
                                },
                              ]),
                            ],
                            onChange: (e: CustomEvent) => {
                              const raw = this._formValue(e, 'inactive_icon_animation');
                              if (raw === undefined) return;
                              const next = String(raw) as IconAnimation;
                              const prev =
                                iconModule.icons[index].inactive_icon_animation || 'none';
                              if (next === prev) return;
                              this._updateIcon(
                                iconModule,
                                index,
                                { inactive_icon_animation: next },
                                updateModule
                              );
                              // Trigger re-render to update dropdown UI
                              setTimeout(() => {
                                this.triggerPreviewUpdate();
                              }, 50);
                            },
                          },
                        ]
                      )}
                    `}
              </div>
            </ha-expansion-panel>
          `
        )}

        <!-- Add Icon -->
        <button
          class="add-icon-btn"
          style="width: 100%; padding: 12px; border: 2px dashed var(--divider-color); border-radius: 8px; background: transparent; color: var(--primary-text-color); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 500; transition: all 0.2s ease;"
          @click=${() => this._addIcon(iconModule, updateModule)}
        >
          <ha-icon icon="mdi:plus" style="--mdc-icon-size: 20px;"></ha-icon>
          ${localize('editor.icon.add_icon', lang, 'Add Icon')}
        </button>
      </div>
    `;
  }

  /**
   * Render simplified settings for static icons (no entity connection)
   * Static icons show only: icon, size, color, background, animation, hover
   */
  private _renderStaticIconSettings(
    icon: IconConfig,
    index: number,
    iconModule: IconModule,
    hass: HomeAssistant,
    lang: string,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return html`
      <!-- Static Icon Settings -->
      <div class="settings-section" style="margin-bottom: 24px;">
        <div class="section-title">
          ${localize('editor.icon.static_icon_settings.title', lang, 'ICON SETTINGS')}
        </div>
        <div
          class="section-description"
          style="margin-bottom: 16px; font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;"
        >
          ${localize(
            'editor.icon.static_icon_settings.desc',
            lang,
            'Configure the appearance of this static icon'
          )}
        </div>

        <!-- Icon Picker -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">${localize('editor.icon.icon', lang, 'Icon')}</div>
          <div class="field-description">
            ${localize('editor.icon.icon_desc', lang, 'Select an MDI icon')}
          </div>
          ${this.renderUcForm(
            hass,
            { icon_inactive: icon.icon_inactive || 'mdi:star' },
            [this.iconField('icon_inactive')],
            (e: CustomEvent) => {
              const newIcon = e.detail.value.icon_inactive;
              // For static icons, sync both active and inactive icons
              this._updateIcon(
                iconModule,
                index,
                { icon_inactive: newIcon, icon_active: newIcon },
                updateModule
              );
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
            false
          )}
        </div>

        <!-- Icon Size -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">${localize('editor.icon.icon_size', lang, 'Icon Size')}</div>
          <div class="field-description">
            ${localize('editor.icon.icon_size_desc', lang, 'Size of the icon in pixels')}
          </div>
          ${this._renderSizeControl(
            iconModule,
            index,
            updateModule,
            'inactive_icon_size',
            icon.inactive_icon_size || 26,
            0,
            100,
            26
          )}
        </div>

        <!-- Icon Color -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">${localize('editor.icon.icon_color', lang, 'Icon Color')}</div>
          <div class="field-description">
            ${localize('editor.icon.icon_color_desc', lang, 'Color of the icon')}
          </div>
          <ultra-color-picker
            .value=${icon.inactive_icon_color || 'var(--primary-color)'}
            @value-changed=${(e: CustomEvent) => {
              // For static icons, sync both active and inactive colors
              this._updateIcon(
                iconModule,
                index,
                {
                  inactive_icon_color: e.detail.value,
                  active_icon_color: e.detail.value,
                },
                updateModule
              );
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }}
          ></ultra-color-picker>
        </div>

        <!-- Background Shape -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">
            ${localize('editor.icon.background_shape', lang, 'Background Shape')}
          </div>
          <div class="field-description">
            ${localize('editor.icon.background_shape_desc', lang, 'Shape behind the icon')}
          </div>
          ${this.renderUcForm(
            hass,
            { inactive_icon_background: icon.inactive_icon_background || 'none' },
            [
              this.selectField('inactive_icon_background', [
                { value: 'none', label: localize('editor.icon.shape_none', lang, 'None') },
                { value: 'circle', label: localize('editor.icon.shape_circle', lang, 'Circle') },
                { value: 'square', label: localize('editor.icon.shape_square', lang, 'Square') },
                {
                  value: 'rounded-square',
                  label: localize('editor.icon.shape_rounded', lang, 'Rounded Square'),
                },
              ]),
            ],
            (e: CustomEvent) => {
              const raw = this._formValue(e, 'inactive_icon_background');
              if (raw === undefined) return;
              const next = String(raw) as IconBackgroundShape;
              const prev = iconModule.icons[index].inactive_icon_background || 'none';
              if (next === prev) return;
              // For static icons, sync both active and inactive backgrounds
              const updates: Partial<IconConfig> = {
                inactive_icon_background: next,
                active_icon_background: next,
              };
              if (next && next !== 'none') {
                updates.inactive_icon_background_color = 'var(--divider-color)';
                updates.active_icon_background_color = 'var(--divider-color)';
              }
              this._updateIcon(iconModule, index, updates, updateModule);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
            false
          )}
        </div>

        <!-- Background Color (only show if background shape is not 'none') -->
        ${icon.inactive_icon_background && icon.inactive_icon_background !== 'none'
          ? html`
              <div class="field-container" style="margin-bottom: 16px;">
                <div class="field-title">
                  ${localize('editor.icon.background_color', lang, 'Background Color')}
                </div>
                <div class="field-description">
                  ${localize(
                    'editor.icon.background_color_desc',
                    lang,
                    'Color of the background shape'
                  )}
                </div>
                <ultra-color-picker
                  .value=${icon.inactive_icon_background_color || 'var(--divider-color)'}
                  @value-changed=${(e: CustomEvent) => {
                    // For static icons, sync both active and inactive background colors
                    this._updateIcon(
                      iconModule,
                      index,
                      {
                        inactive_icon_background_color: e.detail.value,
                        active_icon_background_color: e.detail.value,
                      },
                      updateModule
                    );
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>

              <!-- Background Padding -->
              <div class="field-container" style="margin-bottom: 16px;">
                <div class="field-title">
                  ${localize('editor.icon.background_padding', lang, 'Background Padding')}
                </div>
                <div class="field-description">
                  ${localize(
                    'editor.icon.background_padding_desc',
                    lang,
                    'Distance from the icon to the background edge'
                  )}
                </div>
                ${this._renderBackgroundPaddingControl(
                  iconModule,
                  index,
                  updateModule,
                  icon.inactive_icon_background_padding ?? 8
                )}
              </div>
            `
          : ''}

        <!-- Animation -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">${localize('editor.icon.animation', lang, 'Animation')}</div>
          <div class="field-description">
            ${localize('editor.icon.animation_desc', lang, 'Continuous animation for the icon')}
          </div>
          ${this.renderUcForm(
            hass,
            { inactive_icon_animation: icon.inactive_icon_animation || 'none' },
            [
              this.selectField('inactive_icon_animation', [
                { value: 'none', label: localize('editor.icon.animation_none', lang, 'None') },
                { value: 'pulse', label: localize('editor.icon.animation_pulse', lang, 'Pulse') },
                { value: 'spin', label: localize('editor.icon.animation_spin', lang, 'Spin') },
                {
                  value: 'bounce',
                  label: localize('editor.icon.animation_bounce', lang, 'Bounce'),
                },
                { value: 'flash', label: localize('editor.icon.animation_flash', lang, 'Flash') },
                { value: 'shake', label: localize('editor.icon.animation_shake', lang, 'Shake') },
                {
                  value: 'vibrate',
                  label: localize('editor.icon.animation_vibrate', lang, 'Vibrate'),
                },
                {
                  value: 'rotate-left',
                  label: localize('editor.icon.animation_rotate_left', lang, 'Rotate Left'),
                },
                {
                  value: 'rotate-right',
                  label: localize('editor.icon.animation_rotate_right', lang, 'Rotate Right'),
                },
                { value: 'fade', label: localize('editor.icon.animation_fade', lang, 'Fade') },
                { value: 'scale', label: localize('editor.icon.animation_scale', lang, 'Scale') },
                { value: 'tada', label: localize('editor.icon.animation_tada', lang, 'Tada') },
              ]),
            ],
            (e: CustomEvent) => {
              const raw = this._formValue(e, 'inactive_icon_animation');
              if (raw === undefined) return;
              const next = String(raw) as IconAnimation;
              const prev = iconModule.icons[index].inactive_icon_animation || 'none';
              if (next === prev) return;
              // For static icons, sync both active and inactive animations
              this._updateIcon(
                iconModule,
                index,
                { inactive_icon_animation: next, active_icon_animation: next },
                updateModule
              );
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
            false
          )}
        </div>

        <!-- Hover Effect -->
        ${this.renderFieldSection(
          localize('editor.icon.hover_effect', lang, 'Hover Effect'),
          localize('editor.icon.hover_effect_desc', lang, 'Enable hover animation on mouse over'),
          hass,
          { enable_hover_effect: icon.enable_hover_effect || false },
          [this.booleanField('enable_hover_effect')],
          (e: CustomEvent) => {
            this._updateIcon(
              iconModule,
              index,
              { enable_hover_effect: e.detail.value.enable_hover_effect },
              updateModule
            );
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}
      </div>
    `;
  }

  private _addIcon(
    iconModule: IconModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const newIcon: IconConfig = {
      id: this.generateId('icon-item'),
      icon_mode: 'entity', // 'entity' = connected to HA entity, 'static' = standalone icon
      entity: 'weather.forecast_home',
      name: '',
      icon_inactive: 'mdi:weather-partly-cloudy',
      icon_active: 'mdi:weather-partly-cloudy',
      inactive_state: '',
      active_state: '',
      inactive_attribute: '',
      active_attribute: '',
      display_attribute: '',
      custom_inactive_state_text: '',
      custom_active_state_text: '',
      custom_inactive_name_text: '',
      custom_active_name_text: '',

      // Entity color options
      use_entity_color_for_icon: false,
      use_state_color_for_inactive_icon: false,
      use_state_color_for_active_icon: false,

      // Color configuration
      color_inactive: 'var(--secondary-text-color)',
      color_active: 'var(--primary-color)',
      inactive_icon_color: 'var(--secondary-text-color)',
      active_icon_color: 'var(--primary-color)',
      inactive_name_color: 'var(--primary-text-color)',
      active_name_color: 'var(--primary-text-color)',
      inactive_state_color: 'var(--secondary-text-color)',
      active_state_color: 'var(--secondary-text-color)',

      // Display toggles
      show_name_when_inactive: true,
      show_state_when_inactive: true,
      show_icon_when_inactive: true,
      show_name_when_active: true,
      show_state_when_active: true,
      show_icon_when_active: true,
      show_entity_picture: true,

      // Legacy (backward compatibility)
      show_state: true,
      show_name: true,

      // Sizing
      icon_size: 26,
      text_size: 14,
      name_icon_gap: 8,
      name_state_gap: 2,
      icon_state_gap: 4,

      // Active/Inactive specific sizing
      active_icon_size: 26,
      inactive_icon_size: 26,
      active_text_size: 14,
      inactive_text_size: 14,
      state_size: 14,
      active_state_size: 14,
      inactive_state_size: 14,

      // Icon background
      icon_background: 'none',
      use_entity_color_for_icon_background: false,
      icon_background_color: 'transparent',

      // Active/Inactive specific icon backgrounds
      active_icon_background: 'none',
      inactive_icon_background: 'none',
      active_icon_background_color: 'transparent',
      inactive_icon_background_color: 'transparent',

      // Icon background padding
      icon_background_padding: 8,
      inactive_icon_background_padding: 8,
      active_icon_background_padding: 8,
      active_icon_background_padding_locked: true,

      // Individual size lock mechanism
      icon_size_locked: true,
      text_size_locked: true,
      state_size_locked: true,

      // Field lock mechanism (active fields inherit from inactive by default)
      active_icon_locked: true,
      active_icon_color_locked: false,
      active_icon_background_locked: true,
      active_icon_background_color_locked: true,
      active_name_locked: true,
      active_name_color_locked: true,
      active_state_locked: false,
      active_state_color_locked: true,

      // Animations
      inactive_icon_animation: 'none',
      active_icon_animation: 'none',

      // Other display options
      show_units: true,

      // Container appearance
      vertical_alignment: 'center',
      container_width: undefined,
      container_background_shape: 'none',
      container_background_color: '#808080',

      // Ultra Link Actions
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },

      // Legacy actions (backward compatibility)
      click_action: 'toggle',
      double_click_action: 'none',
      hold_action_legacy: 'none',
      navigation_path: '',
      url: '',
      service: '',
      service_data: {},

      // Unified template system
      unified_template_mode: false,
      unified_template: '',
      ignore_entity_state_config: false,
    };

    const updatedIcons = [...iconModule.icons, newIcon];

    // If this is the first icon and no module-level tap action is set, auto-set it
    const moduleUpdates: Partial<IconModule> = { icons: updatedIcons };
    // Do not auto-set module-level tap_action; leave as undefined (Default) unless user specifies.

    updateModule(moduleUpdates);
    this.triggerPreviewUpdate();
  }

  private _removeIcon(
    iconModule: IconModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    if (iconModule.icons.length <= 1) return;

    const updatedIcons = iconModule.icons.filter((_, i) => i !== index);
    updateModule({ icons: updatedIcons });
    this.triggerPreviewUpdate();
  }

  /** Title shown in the collapsed icon panel header. */
  private _iconHeaderTitle(
    icon: IconConfig,
    index: number,
    hass: HomeAssistant,
    lang: string
  ): string {
    const fallback = localize('editor.icon.icon_row_title', lang, 'Icon {number}').replace(
      '{number}',
      String(index + 1)
    );
    if (icon.internal_name) return icon.internal_name;
    if (icon.icon_mode === 'static') return icon.icon_inactive || fallback;
    return (
      icon.name ||
      (icon.entity && hass?.states?.[icon.entity]?.attributes?.friendly_name) ||
      icon.entity ||
      fallback
    );
  }

  /** Subtitle (position + source) shown in the collapsed icon panel header. */
  private _iconHeaderSubtitle(icon: IconConfig, index: number, lang: string): string {
    const num = localize('editor.icon.icon_row_title', lang, 'Icon {number}').replace(
      '{number}',
      String(index + 1)
    );
    if (icon.icon_mode === 'static') {
      return `${num} · ${localize('editor.icon.icon_mode.static', lang, 'Static')}`;
    }
    return icon.entity ? `${num} · ${icon.entity}` : num;
  }

  /** Icon glyph shown in the collapsed panel header badge. */
  private _iconHeaderIcon(icon: IconConfig, hass: HomeAssistant): string {
    return (
      icon.icon_inactive ||
      (icon.entity && hass?.states?.[icon.entity]?.attributes?.icon) ||
      'mdi:shape-outline'
    );
  }

  // Drag and drop reordering of icons in the editor
  private _onIconDragStart(e: DragEvent, index: number): void {
    this._draggedIconIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
  }

  private _onIconDragOver(e: DragEvent, index: number): void {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    this._dragOverIconIndex = index;
  }

  private _onIconDragEnd(): void {
    this._draggedIconIndex = null;
    this._dragOverIconIndex = null;
  }

  private _onIconDrop(
    e: DragEvent,
    targetIndex: number,
    iconModule: IconModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    e.preventDefault();
    const sourceIndex = this._draggedIconIndex;

    if (sourceIndex === null || sourceIndex === targetIndex) {
      this._onIconDragEnd();
      return;
    }

    const icons = [...iconModule.icons];
    const [moved] = icons.splice(sourceIndex, 1);
    icons.splice(targetIndex, 0, moved);

    updateModule({ icons });
    this.triggerPreviewUpdate();
    this._onIconDragEnd();
  }

  private _updateIcon(
    iconModule: IconModule,
    index: number,
    updates: Partial<IconConfig>,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const updatedIcons = iconModule.icons.map((icon, i) =>
      i === index ? { ...icon, ...updates } : icon
    );
    updateModule({ icons: updatedIcons });
    // Keep the live preview in sync for all editor callbacks that route through here.
    // triggerPreviewUpdate is globally debounced, so callers that already trigger
    // their own update simply coalesce with this one.
    this.triggerPreviewUpdate();
  }

  /**
   * Keep module-level entity actions aligned with the primary icon entity.
   * This prevents duplicated modules from keeping stale action entities.
   */
  private _syncPrimaryEntityActions(
    iconModule: IconModule,
    moduleUpdates: Record<string, unknown>,
    primaryEntity: string
  ): void {
    const syncAction = (action: any): any => {
      if (!action || typeof action !== 'object') return action;
      if (action.target) return action;
      if (
        action.action === 'more-info' ||
        action.action === 'toggle' ||
        action.action === 'default'
      ) {
        return { ...action, entity: primaryEntity };
      }
      return action;
    };

    const tapSource =
      moduleUpdates.tap_action !== undefined
        ? moduleUpdates.tap_action
        : (iconModule as any).tap_action;
    const holdSource =
      moduleUpdates.hold_action !== undefined
        ? moduleUpdates.hold_action
        : (iconModule as any).hold_action;
    const doubleTapSource =
      moduleUpdates.double_tap_action !== undefined
        ? moduleUpdates.double_tap_action
        : (iconModule as any).double_tap_action;

    const tapAction = syncAction(tapSource);
    const holdAction = syncAction(holdSource);
    const doubleTapAction = syncAction(doubleTapSource);

    if (tapAction !== (iconModule as any).tap_action) {
      moduleUpdates.tap_action = tapAction;
    }
    if (holdAction !== (iconModule as any).hold_action) {
      moduleUpdates.hold_action = holdAction;
    }
    if (doubleTapAction !== (iconModule as any).double_tap_action) {
      moduleUpdates.double_tap_action = doubleTapAction;
    }
  }

  /**
   * Handle entity selection from both variable chips and entity picker
   * Centralizes all entity change logic (auto-populate icon, states, etc.)
   */
  private _handleEntitySelection(
    icon: IconConfig,
    index: number,
    iconModule: IconModule,
    entityId: string,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    config?: UltraCardConfig
  ): void {
    const updates: Partial<IconConfig> = { entity: entityId };

    // Resolve $variable references for state lookups while storing the raw value
    const resolvedEntityId = this.resolveEntity(entityId, config) || entityId;

    // Auto-populate from entity when switching
    if (resolvedEntityId && hass?.states[resolvedEntityId]) {
      // Use the centralized icon service
      const entityIcon = EntityIconService.getEntityIcon(resolvedEntityId, hass);

      // Always update icon when switching entities if available
      if (entityIcon) {
        updates.icon_inactive = entityIcon;
        // If icon is locked (default), also update active icon
        const currentIcon = iconModule.icons[index];
        if (currentIcon.active_icon_locked !== false) {
          updates.icon_active = entityIcon;
        }
      }
    }

    // Auto-populate states for binary entities
    if (resolvedEntityId && this._isBinaryEntity(resolvedEntityId)) {
      // Only set default states if both are currently empty
      const currentIcon = iconModule.icons[index];
      if (!currentIcon.active_state && !currentIcon.inactive_state) {
        updates.active_state = 'on';
        updates.inactive_state = 'off';
      }
    }

    // Per-icon actions implicitly follow this icon's entity. Sync them when
    // the entity changes so duplicated modules don't keep stale click targets
    // (issue #89). Explicit target-based actions are left untouched.
    if (entityId) {
      const syncIconAction = (action: any): any => {
        if (!action || typeof action !== 'object') return action;
        if (action.target) return action;
        if (
          action.action === 'more-info' ||
          action.action === 'toggle' ||
          action.action === 'default'
        ) {
          return { ...action, entity: entityId };
        }
        return action;
      };
      const currentIconCfg = iconModule.icons[index] as any;
      const syncedTap = syncIconAction(currentIconCfg?.tap_action);
      const syncedHold = syncIconAction(currentIconCfg?.hold_action);
      const syncedDoubleTap = syncIconAction(currentIconCfg?.double_tap_action);
      if (syncedTap !== currentIconCfg?.tap_action) (updates as any).tap_action = syncedTap;
      if (syncedHold !== currentIconCfg?.hold_action) (updates as any).hold_action = syncedHold;
      if (syncedDoubleTap !== currentIconCfg?.double_tap_action)
        (updates as any).double_tap_action = syncedDoubleTap;
    }

    // Update icon in the icons array
    const updatedIcons = iconModule.icons.map((ic, i) =>
      i === index ? { ...ic, ...updates } : ic
    );
    const moduleUpdates: any = { icons: updatedIcons };

    // Module-level actions on icon modules implicitly follow the first icon.
    // Sync action entities when the primary icon entity changes.
    if (index === 0 && entityId) {
      this._syncPrimaryEntityActions(iconModule, moduleUpdates, entityId);
    }

    // Apply all updates in one call to avoid race conditions
    updateModule(moduleUpdates);

    // Force UI refresh
    setTimeout(() => {
      try {
        this.triggerPreviewUpdate();
      } catch (_) {}

      window.dispatchEvent(
        new CustomEvent('ultra-card-actions-refresh', {
          detail: { moduleId: iconModule.id },
          bubbles: true,
          composed: true,
        })
      );
    }, 50);

    // Clear attribute cache for this entity to refresh dropdowns
    const oldCacheKey = `${icon.entity}_attributes`;
    const newCacheKey = `${entityId}_attributes`;
    this._attributeCache.delete(oldCacheKey);
    this._attributeCache.delete(newCacheKey);
  }

  private _debouncedUpdateIcon(
    iconModule: IconModule,
    index: number,
    updates: Partial<IconConfig>,
    updateModule: (updates: Partial<CardModule>) => void,
    delay = 100
  ): void {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }

    this._updateTimeout = setTimeout(() => {
      this._updateIcon(iconModule, index, updates, updateModule);
    }, delay);
  }

  private _updateIconWithLockSync(
    iconModule: IconModule,
    index: number,
    property: string,
    value: any,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const icon = iconModule.icons[index];
    const updates: any = { [property]: value };

    // Sync locked active properties when their inactive counterpart changes
    const lockMapping = {
      icon_inactive: { active: 'icon_active', lock: 'active_icon_locked' },
      inactive_icon_size: { active: 'active_icon_size', lock: 'icon_size_locked' },
      inactive_text_size: { active: 'active_text_size', lock: 'text_size_locked' },
      inactive_state_size: { active: 'active_state_size', lock: 'state_size_locked' },
      inactive_icon_color: { active: 'active_icon_color', lock: 'active_icon_color_locked' },
      inactive_name_color: { active: 'active_name_color', lock: 'active_name_color_locked' },
      inactive_state_color: { active: 'active_state_color', lock: 'active_state_color_locked' },
      inactive_icon_background: {
        active: 'active_icon_background',
        lock: 'active_icon_background_locked',
      },
      inactive_icon_background_color: {
        active: 'active_icon_background_color',
        lock: 'active_icon_background_color_locked',
      },
      use_state_color_for_inactive_icon: {
        active: 'use_state_color_for_active_icon',
        lock: 'active_state_color_locked',
      },
    };

    const mapping = lockMapping[property as keyof typeof lockMapping];
    if (mapping && icon[mapping.lock as keyof typeof icon] !== false) {
      updates[mapping.active] = value;
    }

    this._updateIcon(iconModule, index, updates, updateModule);
  }

  private _debouncedUpdateIconWithLockSync(
    iconModule: IconModule,
    index: number,
    property: string,
    value: any,
    updateModule: (updates: Partial<CardModule>) => void,
    delay = 50
  ): void {
    if (this._updateTimeout) {
      clearTimeout(this._updateTimeout);
    }

    this._updateTimeout = setTimeout(() => {
      this._updateIconWithLockSync(iconModule, index, property, value, updateModule);
    }, delay);
  }

  private _renderSizeControl(
    iconModule: IconModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void,
    property: string,
    value: number,
    min: number,
    max: number,
    defaultValue: number
  ): TemplateResult {
    return this.renderSliderField('', '', value, defaultValue, min, max, 1, (v: number) => {
      this._updateIconWithLockSync(iconModule, index, property, v, updateModule);
    });
  }

  // Background padding control for static icons (syncs both active and inactive)
  private _renderBackgroundPaddingControl(
    iconModule: IconModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void,
    value: number
  ): TemplateResult {
    const defaultValue = 8;

    const updateBothPaddings = (newValue: number) => {
      this._updateIcon(
        iconModule,
        index,
        {
          inactive_icon_background_padding: newValue,
          active_icon_background_padding: newValue,
          icon_background_padding: newValue,
        },
        updateModule
      );
      setTimeout(() => this.triggerPreviewUpdate(), 50);
    };

    return this.renderSliderField('', '', value, defaultValue, 0, 50, 1, updateBothPaddings);
  }

  private _renderFieldWithLock(
    iconModule: IconModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void,
    lockProperty: string,
    activeProperty: string,
    inactiveProperty: string,
    value: any,
    fieldType: 'icon' | 'color' | 'select' | 'text' | 'toggle',
    hass: HomeAssistant,
    selectOptions?: { value: string | undefined; label: string }[]
  ): TemplateResult {
    const icon = iconModule.icons[index];
    const isLocked = icon[lockProperty as keyof typeof icon] !== false;
    const displayValue = isLocked ? icon[inactiveProperty as keyof typeof icon] || value : value;

    return html`
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="flex: 1;">
          ${fieldType === 'icon'
            ? html`
                <div
                  style="opacity: ${isLocked ? '0.5' : '1'}; pointer-events: ${isLocked
                    ? 'none'
                    : 'auto'};"
                >
                  ${this.renderUcForm(
                    hass,
                    { [activeProperty]: displayValue },
                    [this.iconField(activeProperty)],
                    (e: CustomEvent) => {
                      if (!isLocked) {
                        const raw = this._formValue(e, activeProperty);
                        if (raw === undefined) return;
                        this._updateIcon(
                          iconModule,
                          index,
                          { [activeProperty]: raw },
                          updateModule
                        );
                      }
                    },
                    false
                  )}
                </div>
              `
            : fieldType === 'color'
              ? html`
                  <ultra-color-picker
                    .value=${displayValue}
                    .disabled=${isLocked}
                    @value-changed=${(e: CustomEvent) => {
                      if (!isLocked) {
                        const val =
                          e.detail && 'value' in e.detail
                            ? (e.detail as { value: unknown }).value
                            : undefined;
                        if (val === undefined) return;
                        this._updateIcon(
                          iconModule,
                          index,
                          { [activeProperty]: val },
                          updateModule
                        );
                      }
                    }}
                  ></ultra-color-picker>
                `
              : fieldType === 'select'
                ? html`
                    <div
                      style="opacity: ${isLocked ? '0.5' : '1'}; pointer-events: ${isLocked
                        ? 'none'
                        : 'auto'};"
                    >
                      ${this.renderUcForm(
                        hass,
                        { [activeProperty]: displayValue },
                        [this.selectField(activeProperty, selectOptions || [])],
                        (e: CustomEvent) => {
                          const raw = this._formValue(e, activeProperty);
                          if (raw === undefined) return;
                          const next = String(raw);
                          const prev = (icon as any)[activeProperty];
                          if (next === prev) return;
                          this._updateIcon(
                            iconModule,
                            index,
                            { [activeProperty]: next },
                            updateModule
                          );
                        },
                        false
                      )}
                    </div>
                  `
                : fieldType === 'toggle'
                  ? html`
                      <div
                        style="opacity: ${isLocked ? '0.5' : '1'}; pointer-events: ${isLocked
                          ? 'none'
                          : 'auto'};"
                      >
                        ${this.renderUcForm(
                          hass,
                          { [activeProperty]: !!displayValue },
                          [this.booleanField(activeProperty)],
                          (e: CustomEvent) => {
                            if (isLocked) return;
                            this._updateIcon(
                              iconModule,
                              index,
                              { [activeProperty]: !!e.detail.value[activeProperty] },
                              updateModule
                            );
                          }
                        )}
                      </div>
                    `
                  : html`
                      <div
                        style="opacity: ${isLocked ? '0.5' : '1'}; pointer-events: ${isLocked
                          ? 'none'
                          : 'auto'};"
                      >
                        ${this.renderUcForm(
                          hass,
                          { [activeProperty]: displayValue },
                          [this.textField(activeProperty)],
                          (e: CustomEvent) => {
                            const raw = this._formValue(e, activeProperty);
                            if (raw === undefined) return;
                            const next = typeof raw === 'string' ? raw : String(raw);
                            const prev = (icon as any)[activeProperty];
                            if (next === prev) return;
                            this._updateIcon(
                              iconModule,
                              index,
                              { [activeProperty]: next },
                              updateModule
                            );
                          },
                          false
                        )}
                      </div>
                    `}
        </div>
        <button
          class="lock-btn ${isLocked ? 'locked' : 'unlocked'}"
          @click=${() => {
            const newLockState = !isLocked;
            const updates: any = { [lockProperty]: newLockState };

            // If locking, sync active to inactive value
            if (newLockState) {
              updates[activeProperty] = icon[inactiveProperty as keyof typeof icon];
            }

            this._updateIcon(iconModule, index, updates, updateModule);
          }}
          title="${isLocked
            ? 'Unlock to customize this field independently'
            : 'Lock to inherit from inactive state'}"
        >
          <ha-icon icon="${isLocked ? 'mdi:lock' : 'mdi:lock-open'}"></ha-icon>
        </button>
      </div>
    `;
  }

  private _renderSizeControlWithLock(
    iconModule: IconModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void,
    lockProperty: string,
    activeProperty: string,
    inactiveProperty: string,
    value: number,
    min: number,
    max: number,
    defaultValue: number
  ): TemplateResult {
    const icon = iconModule.icons[index];
    const lockPropertyName = `${lockProperty}_locked` as keyof typeof icon;
    const isLocked = icon[lockPropertyName] !== false;

    // If locked, display the inactive value, otherwise display the active value
    const displayValue = isLocked
      ? (icon[inactiveProperty as keyof typeof icon] as number) || defaultValue
      : value;

    return html`
      <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
        <ha-slider
          class="uc-ha-slider"
          style="flex: 1;"
          labeled
          pin
          .min=${min}
          .max=${max}
          .step=${1}
          .value=${displayValue}
          .disabled=${isLocked}
          @change=${(e: Event) => {
            if (isLocked) return;
            const v = Number((e.target as HTMLInputElement).value);
            if (!isNaN(v)) {
              this._updateIcon(iconModule, index, { [activeProperty]: v }, updateModule);
            }
          }}
        ></ha-slider>
        <input
          type="number"
          class="gap-input"
          min="${min}"
          max="${max}"
          step="1"
          .value="${displayValue}"
          .disabled=${isLocked}
          @input=${(e: Event) => {
            if (!isLocked) {
              const target = e.target as HTMLInputElement;
              const newValue = Number(target.value);
              if (!isNaN(newValue) && newValue >= min && newValue <= max) {
                this._updateIcon(iconModule, index, { [activeProperty]: newValue }, updateModule);
              }
            }
          }}
          @keydown=${(e: KeyboardEvent) => {
            if (!isLocked && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
              e.preventDefault();
              const target = e.target as HTMLInputElement;
              const currentValue = Number(target.value) || defaultValue;
              const increment = e.key === 'ArrowUp' ? 1 : -1;
              const newValue = Math.max(min, Math.min(max, currentValue + increment));
              this._updateIcon(iconModule, index, { [activeProperty]: newValue }, updateModule);
            }
          }}
        />
        <button
          class="reset-btn"
          type="button"
          @click=${() => {
            if (!isLocked) {
              this._updateIcon(iconModule, index, { [activeProperty]: defaultValue }, updateModule);
            }
          }}
          title="Reset to default (${defaultValue})"
          .disabled=${isLocked}
        >
          <ha-icon icon="mdi:refresh"></ha-icon>
        </button>
        <button
          class="lock-btn ${isLocked ? 'locked' : 'unlocked'}"
          @click=${() => {
            const newLockState = !isLocked;
            const updates: any = { [lockPropertyName]: newLockState };

            // If locking, sync active to inactive value
            if (newLockState) {
              updates[activeProperty] = icon[inactiveProperty as keyof typeof icon] || defaultValue;
            }

            this._updateIcon(iconModule, index, updates, updateModule);
          }}
          title="${isLocked
            ? 'Unlock to set different sizes for active/inactive'
            : 'Lock to use same size for both states'}"
        >
          <ha-icon icon="${isLocked ? 'mdi:lock' : 'mdi:lock-open'}"></ha-icon>
        </button>
      </div>
    `;
  }
}

installSettingsMethods(UltraIconModule, UltraIconModuleSettings);

export function renderIconGeneralTab(
  host: UltraIconModule,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  return UltraIconModuleSettings.prototype.renderGeneralTabContent.call(
    host as UltraIconModuleSettings,
    module,
    hass,
    config,
    updateModule
  );
}

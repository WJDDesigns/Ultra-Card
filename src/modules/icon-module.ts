import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, IconModule, IconConfig, UltraCardConfig } from '../types';
import { UltraLinkComponent, UltraLinkConfig } from '../components/ultra-link';
import { FormUtils } from '../utils/form-utils';
import '../components/ultra-color-picker';

export class UltraIconModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'icon',
    title: 'Icons',
    description: 'Interactive icon buttons',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:circle',
    category: 'interactive',
    tags: ['icon', 'button', 'interactive', 'control'],
  };

  createDefault(id?: string): IconModule {
    return {
      id: id || this.generateId('icon'),
      type: 'icon',
      icons: [
        {
          id: this.generateId('icon-item'),
          entity: 'weather.forecast_home',
          name: 'Forecast',
          icon_inactive: 'mdi:weather-partly-cloudy',
          icon_active: 'mdi:weather-partly-cloudy',
          inactive_state: 'off',
          active_state: 'on',
          custom_inactive_state_text: '',
          custom_active_state_text: '',

          // Template modes
          inactive_template_mode: false,
          inactive_template: '',
          active_template_mode: false,
          active_template: '',

          // Entity color options
          use_entity_color_for_icon: false,

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

          // Legacy (backward compatibility)
          show_state: true,
          show_name: true,

          // Other display options
          show_units: false,

          // Sizing
          icon_size: 24,
          text_size: 12,

          // Icon background
          icon_background: 'none',
          use_entity_color_for_icon_background: false,
          icon_background_color: 'transparent',

          // Animations
          inactive_icon_animation: 'none',
          active_icon_animation: 'none',

          // Container appearance
          vertical_alignment: 'center',
          container_width: undefined,
          container_background_shape: 'none',

          // Ultra Link Actions
          tap_action: { action: 'toggle' },
          hold_action: { action: 'default' },
          double_tap_action: { action: 'default' },

          // Legacy actions (backward compatibility)
          click_action: 'toggle',
          double_click_action: 'none',
          hold_action_legacy: 'none',
          navigation_path: '',
          url: '',
          service: '',
          service_data: {},

          // Legacy template support
          template_mode: false,
          template: '',

          // Dynamic templates
          dynamic_icon_template_mode: false,
          dynamic_icon_template: '',
          dynamic_color_template_mode: false,
          dynamic_color_template: '',
        },
      ],
      alignment: 'center',
      vertical_alignment: 'center',
      columns: 3,
      gap: 16,
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const iconModule = module as IconModule;

    return html`
      ${FormUtils.injectCleanFormStyles()}
      <div class="module-general-settings">
        ${iconModule.icons.map(
          (icon, index) => html`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
            >
              <!-- Entity Selection -->
              ${FormUtils.renderField(
                'Entity',
                'Select the Home Assistant entity this icon will represent. Icon will auto-select from entity if available.',
                hass,
                { entity: icon.entity || '' },
                [FormUtils.createSchemaItem('entity', { entity: {} })],
                (e: CustomEvent) => {
                  const entityId = e.detail.value.entity;
                  const updates: Partial<IconConfig> = { entity: entityId };

                  // Auto-select icon from entity if available
                  if (entityId && hass?.states[entityId]) {
                    const entityState = hass.states[entityId];
                    const entityIcon = entityState.attributes?.icon;

                    // Always update icon if entity has one, or if current is default
                    if (
                      entityIcon &&
                      (!icon.icon_inactive ||
                        icon.icon_inactive === 'mdi:lightbulb-outline' ||
                        icon.icon_inactive === 'mdi:weather-partly-cloudy')
                    ) {
                      updates.icon_inactive = entityIcon;
                      updates.icon_active = entityIcon;
                    }

                    // Auto-set friendly name if not customized
                    if (
                      entityState.attributes?.friendly_name &&
                      (!icon.name ||
                        icon.name === 'Sample Icon' ||
                        icon.name === 'Forecast' ||
                        icon.name === 'Icon')
                    ) {
                      updates.name = entityState.attributes.friendly_name;
                    }
                  }

                  this._updateIcon(iconModule, index, updates, updateModule);
                }
              )}

              <!-- Active State Section -->
              <div style="margin-top: 24px;">
                <details
                  style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                  open
                >
                  <summary
                    style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                  >
                    <ha-icon icon="mdi:chevron-right" style="transition: transform 0.2s;"></ha-icon>
                    Active State
                  </summary>
                  <div style="padding: 16px;">
                    <!-- Active State Field -->
                    ${FormUtils.renderField(
                      'Active State',
                      'Define when this icon should be considered "active"',
                      hass,
                      { active_state: icon.active_state || 'on' },
                      [FormUtils.createSchemaItem('active_state', { text: {} })],
                      (e: CustomEvent) =>
                        this._updateIcon(
                          iconModule,
                          index,
                          { active_state: e.detail.value.active_state },
                          updateModule
                        )
                    )}

                    <!-- Active Icon Picker -->
                    <div style="margin-top: 16px;">
                      ${FormUtils.renderField(
                        'Active Icon',
                        'Icon to show when the entity is in the active state',
                        hass,
                        { icon_active: icon.icon_active || 'mdi:lightbulb' },
                        [FormUtils.createSchemaItem('icon_active', { icon: {} })],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { icon_active: e.detail.value.icon_active },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Custom Active State Text -->
                    <div style="margin-top: 16px;">
                      ${FormUtils.renderField(
                        'Custom Active State Text',
                        'Override the displayed state text when active',
                        hass,
                        { custom_active_state_text: icon.custom_active_state_text || '' },
                        [FormUtils.createSchemaItem('custom_active_state_text', { text: {} })],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { custom_active_state_text: e.detail.value.custom_active_state_text },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Show Toggles -->
                    <div
                      style="margin-top: 16px; display: flex; flex-direction: column; gap: 16px;"
                    >
                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show Name When Active
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the entity name when active
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          ${FormUtils.renderField(
                            '',
                            '',
                            hass,
                            { show_name_when_active: icon.show_name_when_active !== false },
                            [FormUtils.createSchemaItem('show_name_when_active', { boolean: {} })],
                            (e: CustomEvent) =>
                              this._updateIcon(
                                iconModule,
                                index,
                                { show_name_when_active: e.detail.value.show_name_when_active },
                                updateModule
                              )
                          )}
                        </div>
                      </div>

                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show State When Active
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the entity state when active
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          ${FormUtils.renderField(
                            '',
                            '',
                            hass,
                            { show_state_when_active: icon.show_state_when_active !== false },
                            [FormUtils.createSchemaItem('show_state_when_active', { boolean: {} })],
                            (e: CustomEvent) =>
                              this._updateIcon(
                                iconModule,
                                index,
                                { show_state_when_active: e.detail.value.show_state_when_active },
                                updateModule
                              )
                          )}
                        </div>
                      </div>

                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show Icon When Active
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the icon when active
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          ${FormUtils.renderField(
                            '',
                            '',
                            hass,
                            { show_icon_when_active: icon.show_icon_when_active !== false },
                            [FormUtils.createSchemaItem('show_icon_when_active', { boolean: {} })],
                            (e: CustomEvent) =>
                              this._updateIcon(
                                iconModule,
                                index,
                                { show_icon_when_active: e.detail.value.show_icon_when_active },
                                updateModule
                              )
                          )}
                        </div>
                      </div>
                    </div>

                    <!-- Icon Animation -->
                    <div style="margin-top: 16px;">
                      ${FormUtils.renderField(
                        'Icon Animation',
                        'Animation to apply to the icon when active',
                        hass,
                        { active_icon_animation: icon.active_icon_animation || 'none' },
                        [
                          FormUtils.createSchemaItem('active_icon_animation', {
                            select: {
                              options: [
                                { value: 'none', label: 'None' },
                                { value: 'pulse', label: 'Pulse' },
                                { value: 'spin', label: 'Spin' },
                                { value: 'bounce', label: 'Bounce' },
                                { value: 'flash', label: 'Flash' },
                                { value: 'shake', label: 'Shake' },
                                { value: 'vibrate', label: 'Vibrate' },
                                { value: 'rotate-left', label: 'Rotate Left' },
                                { value: 'rotate-right', label: 'Rotate Right' },
                                { value: 'fade', label: 'Fade' },
                                { value: 'scale', label: 'Scale' },
                                { value: 'tada', label: 'Tada' },
                              ],
                            },
                          }),
                        ],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { active_icon_animation: e.detail.value.active_icon_animation },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Template Mode -->
                    <div style="margin-top: 16px;">
                      ${FormUtils.renderField(
                        'Template Mode',
                        'Use a template to determine when this icon should be active. Templates allow you to use Home Assistant templating syntax for complex conditions. (This disables regular state condition)',
                        hass,
                        { active_template_mode: icon.active_template_mode || false },
                        [FormUtils.createSchemaItem('active_template_mode', { boolean: {} })],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { active_template_mode: e.detail.value.active_template_mode },
                            updateModule
                          )
                      )}
                      ${icon.active_template_mode
                        ? this.renderConditionalFieldsGroup(
                            'Active Template Settings',
                            html`
                              ${FormUtils.renderField(
                                'Active Template',
                                'Enter template code that returns true/false to determine active state',
                                hass,
                                { active_template: icon.active_template || '' },
                                [
                                  FormUtils.createSchemaItem('active_template', {
                                    text: { multiline: true },
                                  }),
                                ],
                                (e: CustomEvent) =>
                                  this._updateIcon(
                                    iconModule,
                                    index,
                                    { active_template: e.detail.value.active_template },
                                    updateModule
                                  )
                              )}
                            `
                          )
                        : ''}
                    </div>

                    <!-- Icon Size -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Active Icon Size
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Size of the icon when active (in pixels)
                      </div>
                      ${FormUtils.renderField(
                        '',
                        '',
                        hass,
                        { active_icon_size: icon.active_icon_size || 24 },
                        [
                          FormUtils.createSchemaItem('active_icon_size', {
                            number: { min: 12, max: 72, step: 2, mode: 'slider' },
                          }),
                        ],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { active_icon_size: Number(e.detail.value.active_icon_size) },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Icon Background Shape -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Active Icon Background Shape
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Shape and style of the icon background when active
                      </div>
                      ${FormUtils.renderField(
                        '',
                        '',
                        hass,
                        { active_icon_background: icon.active_icon_background || 'none' },
                        [
                          FormUtils.createSchemaItem('active_icon_background', {
                            select: {
                              options: [
                                { value: 'none', label: 'None' },
                                { value: 'rounded-square', label: 'Rounded Square' },
                                { value: 'circle', label: 'Circle' },
                              ],
                            },
                          }),
                        ],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { active_icon_background: e.detail.value.active_icon_background },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Use Entity Color for Icon -->
                    <div style="margin-top: 16px;">
                      ${FormUtils.renderField(
                        'Use Entity Color for Icon',
                        'Use the color provided by the entity instead of custom colors',
                        hass,
                        {
                          use_entity_color_for_icon: icon.use_entity_color_for_icon || false,
                        },
                        [FormUtils.createSchemaItem('use_entity_color_for_icon', { boolean: {} })],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { use_entity_color_for_icon: e.detail.value.use_entity_color_for_icon },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Color Pickers (if not using entity color) -->
                    ${!icon.use_entity_color_for_icon
                      ? this.renderConditionalFieldsGroup(
                          'Active Color Settings',
                          html`
                            <div style="display: flex; flex-direction: column; gap: 16px;">
                              <ultra-color-picker
                                .label=${'Active Icon Color'}
                                .value=${icon.active_icon_color || 'var(--primary-color)'}
                                .defaultValue=${'var(--primary-color)'}
                                .hass=${hass}
                                @value-changed=${(e: CustomEvent) =>
                                  this._updateIcon(
                                    iconModule,
                                    index,
                                    { active_icon_color: e.detail.value },
                                    updateModule
                                  )}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${'Active Name Color'}
                                .value=${icon.active_name_color || 'var(--primary-text-color)'}
                                .defaultValue=${'var(--primary-text-color)'}
                                .hass=${hass}
                                @value-changed=${(e: CustomEvent) =>
                                  this._updateIcon(
                                    iconModule,
                                    index,
                                    { active_name_color: e.detail.value },
                                    updateModule
                                  )}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${'Active State Color'}
                                .value=${icon.active_state_color || 'var(--secondary-text-color)'}
                                .defaultValue=${'var(--secondary-text-color)'}
                                .hass=${hass}
                                @value-changed=${(e: CustomEvent) =>
                                  this._updateIcon(
                                    iconModule,
                                    index,
                                    { active_state_color: e.detail.value },
                                    updateModule
                                  )}
                              ></ultra-color-picker>
                            </div>

                            <!-- Icon Background Color -->
                            ${icon.active_icon_background !== 'none'
                              ? html`
                                  <div style="margin-top: 16px;">
                                    <ultra-color-picker
                                      .label=${'Active Icon Background Color'}
                                      .value=${icon.active_icon_background_color ||
                                      'var(--card-background-color)'}
                                      .defaultValue=${'var(--card-background-color)'}
                                      .hass=${hass}
                                      @value-changed=${(e: CustomEvent) =>
                                        this._updateIcon(
                                          iconModule,
                                          index,
                                          { active_icon_background_color: e.detail.value },
                                          updateModule
                                        )}
                                    ></ultra-color-picker>
                                  </div>
                                `
                              : ''}
                          `
                        )
                      : ''}
                  </div>
                </details>
              </div>

              <!-- Inactive State Section -->
              <div style="margin-top: 16px;">
                <details
                  style="border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color);"
                >
                  <summary
                    style="padding: 16px; font-size: 16px; font-weight: 600; color: var(--primary-color); cursor: pointer; background: var(--secondary-background-color); border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 8px;"
                  >
                    <ha-icon icon="mdi:chevron-right" style="transition: transform 0.2s;"></ha-icon>
                    Inactive State
                  </summary>
                  <div style="padding: 16px;">
                    <!-- Inactive State Field -->
                    ${FormUtils.renderField(
                      'Inactive State',
                      'Define when this icon should be considered "inactive"',
                      hass,
                      { inactive_state: icon.inactive_state || 'off' },
                      [FormUtils.createSchemaItem('inactive_state', { text: {} })],
                      (e: CustomEvent) =>
                        this._updateIcon(
                          iconModule,
                          index,
                          { inactive_state: e.detail.value.inactive_state },
                          updateModule
                        )
                    )}

                    <!-- Inactive Icon Picker -->
                    <div style="margin-top: 16px;">
                      ${FormUtils.renderField(
                        'Inactive Icon',
                        'Icon to show when the entity is in the inactive state',
                        hass,
                        { icon_inactive: icon.icon_inactive || 'mdi:lightbulb-outline' },
                        [FormUtils.createSchemaItem('icon_inactive', { icon: {} })],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { icon_inactive: e.detail.value.icon_inactive },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Custom Inactive State Text -->
                    <div style="margin-top: 16px;">
                      ${FormUtils.renderField(
                        'Custom Inactive State Text',
                        'Override the displayed state text when inactive',
                        hass,
                        { custom_inactive_state_text: icon.custom_inactive_state_text || '' },
                        [FormUtils.createSchemaItem('custom_inactive_state_text', { text: {} })],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            {
                              custom_inactive_state_text: e.detail.value.custom_inactive_state_text,
                            },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Show Toggles -->
                    <div
                      style="margin-top: 16px; display: flex; flex-direction: column; gap: 16px;"
                    >
                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show Name When Inactive
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the entity name when inactive
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          ${FormUtils.renderField(
                            '',
                            '',
                            hass,
                            {
                              show_name_when_inactive: icon.show_name_when_inactive !== false,
                            },
                            [
                              FormUtils.createSchemaItem('show_name_when_inactive', {
                                boolean: {},
                              }),
                            ],
                            (e: CustomEvent) =>
                              this._updateIcon(
                                iconModule,
                                index,
                                { show_name_when_inactive: e.detail.value.show_name_when_inactive },
                                updateModule
                              )
                          )}
                        </div>
                      </div>

                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show State When Inactive
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the entity state when inactive
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          ${FormUtils.renderField(
                            '',
                            '',
                            hass,
                            {
                              show_state_when_inactive: icon.show_state_when_inactive !== false,
                            },
                            [
                              FormUtils.createSchemaItem('show_state_when_inactive', {
                                boolean: {},
                              }),
                            ],
                            (e: CustomEvent) =>
                              this._updateIcon(
                                iconModule,
                                index,
                                {
                                  show_state_when_inactive: e.detail.value.show_state_when_inactive,
                                },
                                updateModule
                              )
                          )}
                        </div>
                      </div>

                      <div
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;"
                      >
                        <div style="flex: 1;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            Show Icon When Inactive
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; opacity: 0.8; line-height: 1.4;"
                          >
                            Display the icon when inactive
                          </div>
                        </div>
                        <div style="margin-left: 16px;">
                          ${FormUtils.renderField(
                            '',
                            '',
                            hass,
                            {
                              show_icon_when_inactive: icon.show_icon_when_inactive !== false,
                            },
                            [
                              FormUtils.createSchemaItem('show_icon_when_inactive', {
                                boolean: {},
                              }),
                            ],
                            (e: CustomEvent) =>
                              this._updateIcon(
                                iconModule,
                                index,
                                { show_icon_when_inactive: e.detail.value.show_icon_when_inactive },
                                updateModule
                              )
                          )}
                        </div>
                      </div>
                    </div>

                    <!-- Icon Animation -->
                    <div style="margin-top: 16px;">
                      ${FormUtils.renderField(
                        'Icon Animation',
                        'Animation to apply to the icon when inactive',
                        hass,
                        { inactive_icon_animation: icon.inactive_icon_animation || 'none' },
                        [
                          FormUtils.createSchemaItem('inactive_icon_animation', {
                            select: {
                              options: [
                                { value: 'none', label: 'None' },
                                { value: 'pulse', label: 'Pulse' },
                                { value: 'spin', label: 'Spin' },
                                { value: 'bounce', label: 'Bounce' },
                                { value: 'flash', label: 'Flash' },
                                { value: 'shake', label: 'Shake' },
                                { value: 'vibrate', label: 'Vibrate' },
                                { value: 'rotate-left', label: 'Rotate Left' },
                                { value: 'rotate-right', label: 'Rotate Right' },
                                { value: 'fade', label: 'Fade' },
                                { value: 'scale', label: 'Scale' },
                                { value: 'tada', label: 'Tada' },
                              ],
                            },
                          }),
                        ],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { inactive_icon_animation: e.detail.value.inactive_icon_animation },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Template Mode -->
                    <div style="margin-top: 16px;">
                      ${FormUtils.renderField(
                        'Template Mode',
                        'Use a template to determine when this icon should be inactive. Templates allow you to use Home Assistant templating syntax for complex conditions. (This disables regular state condition)',
                        hass,
                        { inactive_template_mode: icon.inactive_template_mode || false },
                        [FormUtils.createSchemaItem('inactive_template_mode', { boolean: {} })],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { inactive_template_mode: e.detail.value.inactive_template_mode },
                            updateModule
                          )
                      )}
                      ${icon.inactive_template_mode
                        ? this.renderConditionalFieldsGroup(
                            'Inactive Template Settings',
                            html`
                              ${FormUtils.renderField(
                                'Inactive Template',
                                'Enter template code that returns true/false to determine inactive state',
                                hass,
                                { inactive_template: icon.inactive_template || '' },
                                [
                                  FormUtils.createSchemaItem('inactive_template', {
                                    text: { multiline: true },
                                  }),
                                ],
                                (e: CustomEvent) =>
                                  this._updateIcon(
                                    iconModule,
                                    index,
                                    { inactive_template: e.detail.value.inactive_template },
                                    updateModule
                                  )
                              )}
                            `
                          )
                        : ''}
                    </div>

                    <!-- Icon Size -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Inactive Icon Size
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Size of the icon when inactive (in pixels)
                      </div>
                      ${FormUtils.renderField(
                        '',
                        '',
                        hass,
                        { inactive_icon_size: icon.inactive_icon_size || 24 },
                        [
                          FormUtils.createSchemaItem('inactive_icon_size', {
                            number: { min: 12, max: 72, step: 2, mode: 'slider' },
                          }),
                        ],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { inactive_icon_size: Number(e.detail.value.inactive_icon_size) },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Icon Background Shape -->
                    <div style="margin-top: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        Inactive Icon Background Shape
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                      >
                        Shape and style of the icon background when inactive
                      </div>
                      ${FormUtils.renderField(
                        '',
                        '',
                        hass,
                        { inactive_icon_background: icon.inactive_icon_background || 'none' },
                        [
                          FormUtils.createSchemaItem('inactive_icon_background', {
                            select: {
                              options: [
                                { value: 'none', label: 'None' },
                                { value: 'rounded-square', label: 'Rounded Square' },
                                { value: 'circle', label: 'Circle' },
                              ],
                            },
                          }),
                        ],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { inactive_icon_background: e.detail.value.inactive_icon_background },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Use Entity Color for Icon -->
                    <div style="margin-top: 16px;">
                      ${FormUtils.renderField(
                        'Use Entity Color for Icon',
                        'Use the color provided by the entity instead of custom colors',
                        hass,
                        {
                          use_entity_color_for_icon: icon.use_entity_color_for_icon || false,
                        },
                        [FormUtils.createSchemaItem('use_entity_color_for_icon', { boolean: {} })],
                        (e: CustomEvent) =>
                          this._updateIcon(
                            iconModule,
                            index,
                            { use_entity_color_for_icon: e.detail.value.use_entity_color_for_icon },
                            updateModule
                          )
                      )}
                    </div>

                    <!-- Color Pickers (if not using entity color) -->
                    ${!icon.use_entity_color_for_icon
                      ? this.renderConditionalFieldsGroup(
                          'Inactive Color Settings',
                          html`
                            <div style="display: flex; flex-direction: column; gap: 16px;">
                              <ultra-color-picker
                                .label=${'Inactive Icon Color'}
                                .value=${icon.inactive_icon_color || 'var(--secondary-text-color)'}
                                .defaultValue=${'var(--secondary-text-color)'}
                                .hass=${hass}
                                @value-changed=${(e: CustomEvent) =>
                                  this._updateIcon(
                                    iconModule,
                                    index,
                                    { inactive_icon_color: e.detail.value },
                                    updateModule
                                  )}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${'Inactive Name Color'}
                                .value=${icon.inactive_name_color || 'var(--primary-text-color)'}
                                .defaultValue=${'var(--primary-text-color)'}
                                .hass=${hass}
                                @value-changed=${(e: CustomEvent) =>
                                  this._updateIcon(
                                    iconModule,
                                    index,
                                    { inactive_name_color: e.detail.value },
                                    updateModule
                                  )}
                              ></ultra-color-picker>

                              <ultra-color-picker
                                .label=${'Inactive State Color'}
                                .value=${icon.inactive_state_color || 'var(--secondary-text-color)'}
                                .defaultValue=${'var(--secondary-text-color)'}
                                .hass=${hass}
                                @value-changed=${(e: CustomEvent) =>
                                  this._updateIcon(
                                    iconModule,
                                    index,
                                    { inactive_state_color: e.detail.value },
                                    updateModule
                                  )}
                              ></ultra-color-picker>
                            </div>

                            <!-- Icon Background Color -->
                            ${icon.inactive_icon_background !== 'none'
                              ? html`
                                  <div style="margin-top: 16px;">
                                    <ultra-color-picker
                                      .label=${'Inactive Icon Background Color'}
                                      .value=${icon.inactive_icon_background_color ||
                                      'var(--card-background-color)'}
                                      .defaultValue=${'var(--card-background-color)'}
                                      .hass=${hass}
                                      @value-changed=${(e: CustomEvent) =>
                                        this._updateIcon(
                                          iconModule,
                                          index,
                                          { inactive_icon_background_color: e.detail.value },
                                          updateModule
                                        )}
                                    ></ultra-color-picker>
                                  </div>
                                `
                              : ''}
                          `
                        )
                      : ''}
                  </div>
                </details>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const iconModule = module as IconModule;

    return html`
      <div class="module-actions-settings">
        ${iconModule.icons.map(
          (icon, index) => html`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
            >
              ${UltraLinkComponent.render(
                hass,
                {
                  tap_action: icon.tap_action || { action: 'default' },
                  hold_action: icon.hold_action || { action: 'default' },
                  double_tap_action: icon.double_tap_action || { action: 'default' },
                },
                (updates: Partial<UltraLinkConfig>) => {
                  const iconUpdates: Partial<IconConfig> = {};
                  if (updates.tap_action) iconUpdates.tap_action = updates.tap_action;
                  if (updates.hold_action) iconUpdates.hold_action = updates.hold_action;
                  if (updates.double_tap_action)
                    iconUpdates.double_tap_action = updates.double_tap_action;
                  this._updateIcon(iconModule, index, iconUpdates, updateModule);
                },
                'Link Configuration'
              )}
            </div>
          `
        )}
      </div>
    `;
  }

  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const iconModule = module as IconModule;

    return html`
      ${FormUtils.injectCleanFormStyles()}
      <div class="module-other-settings">
        ${iconModule.icons.map(
          (icon, index) => html`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
            >
              <!-- Show Units Toggle -->
              <div class="settings-section" style="margin-bottom: 24px;">
                <div
                  class="field-title"
                  style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                >
                  Show Units
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                >
                  Display the units of measurement alongside the entity state.
                </div>
                ${FormUtils.renderField(
                  '',
                  '',
                  hass,
                  { show_units: icon.show_units || false },
                  [FormUtils.createSchemaItem('show_units', { boolean: {} })],
                  (e: CustomEvent) =>
                    this._updateIcon(
                      iconModule,
                      index,
                      { show_units: e.detail.value.show_units },
                      updateModule
                    )
                )}
              </div>

              <!-- Container Style Section -->
              <div
                class="settings-section"
                style="margin-bottom: 24px; padding: 16px; background: var(--card-background-color); border-radius: 8px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                >
                  Container Style
                </div>

                <!-- Vertical Alignment -->
                <div class="settings-section" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                  >
                    Vertical Alignment
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    How to align the icon within the container
                  </div>
                  ${FormUtils.renderField(
                    '',
                    '',
                    hass,
                    { vertical_alignment: icon.vertical_alignment || 'center' },
                    [
                      FormUtils.createSchemaItem('vertical_alignment', {
                        select: {
                          options: [
                            { value: 'top', label: 'Top' },
                            { value: 'center', label: 'Center' },
                            { value: 'bottom', label: 'Bottom' },
                          ],
                        },
                      }),
                    ],
                    (e: CustomEvent) =>
                      this._updateIcon(
                        iconModule,
                        index,
                        { vertical_alignment: e.detail.value.vertical_alignment },
                        updateModule
                      )
                  )}
                </div>

                <!-- Container Width -->
                <div class="settings-section" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                  >
                    Container Width
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Maximum width of the icon container in pixels
                  </div>
                  ${FormUtils.renderField(
                    '',
                    '',
                    hass,
                    { container_width: icon.container_width || 80 },
                    [
                      FormUtils.createSchemaItem('container_width', {
                        number: { min: 40, max: 200, step: 5, mode: 'slider' },
                      }),
                    ],
                    (e: CustomEvent) =>
                      this._updateIcon(
                        iconModule,
                        index,
                        { container_width: Number(e.detail.value.container_width) },
                        updateModule
                      )
                  )}
                </div>

                <!-- Container Background Shape -->
                <div class="settings-section" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                  >
                    Container Background Shape
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Shape of the icon container background
                  </div>
                  ${FormUtils.renderField(
                    '',
                    '',
                    hass,
                    { container_background_shape: icon.container_background_shape || 'none' },
                    [
                      FormUtils.createSchemaItem('container_background_shape', {
                        select: {
                          options: [
                            { value: 'none', label: 'None' },
                            { value: 'rounded', label: 'Rounded' },
                            { value: 'square', label: 'Square' },
                            { value: 'circle', label: 'Circle' },
                          ],
                        },
                      }),
                    ],
                    (e: CustomEvent) =>
                      this._updateIcon(
                        iconModule,
                        index,
                        { container_background_shape: e.detail.value.container_background_shape },
                        updateModule
                      )
                  )}
                </div>
              </div>

              <!-- Dynamic Templates Section -->
              <div
                class="settings-section"
                style="margin-bottom: 24px; padding: 16px; background: var(--card-background-color); border-radius: 8px;"
              >
                <div
                  class="section-title"
                  style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                >
                  Dynamic Templates
                </div>

                <!-- Dynamic Icon Template -->
                <div class="settings-section" style="margin-bottom: 24px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                  >
                    Dynamic Icon Template
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Use a template to dynamically select the icon based on entity states or
                    conditions.
                  </div>
                  ${FormUtils.renderField(
                    '',
                    '',
                    hass,
                    {
                      dynamic_icon_template_mode: icon.dynamic_icon_template_mode || false,
                    },
                    [FormUtils.createSchemaItem('dynamic_icon_template_mode', { boolean: {} })],
                    (e: CustomEvent) =>
                      this._updateIcon(
                        iconModule,
                        index,
                        { dynamic_icon_template_mode: e.detail.value.dynamic_icon_template_mode },
                        updateModule
                      )
                  )}
                  ${icon.dynamic_icon_template_mode
                    ? this.renderConditionalFieldsGroup(
                        'Dynamic Icon Template Settings',
                        html`
                          <div class="settings-section">
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                            >
                              Template Code
                            </div>
                            <div
                              class="field-description"
                              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                            >
                              Enter the Jinja2 template code that returns an icon name (e.g.,
                              mdi:lightbulb).
                            </div>
                            ${FormUtils.renderField(
                              '',
                              '',
                              hass,
                              { dynamic_icon_template: icon.dynamic_icon_template || '' },
                              [
                                FormUtils.createSchemaItem('dynamic_icon_template', {
                                  text: { multiline: true },
                                }),
                              ],
                              (e: CustomEvent) =>
                                this._updateIcon(
                                  iconModule,
                                  index,
                                  { dynamic_icon_template: e.detail.value.dynamic_icon_template },
                                  updateModule
                                )
                            )}
                          </div>
                        `
                      )
                    : ''}
                </div>

                <!-- Dynamic Color Template -->
                <div class="settings-section" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                  >
                    Dynamic Color Template
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                  >
                    Use a template to dynamically set the icon color based on entity states or
                    values.
                  </div>
                  ${FormUtils.renderField(
                    '',
                    '',
                    hass,
                    {
                      dynamic_color_template_mode: icon.dynamic_color_template_mode || false,
                    },
                    [FormUtils.createSchemaItem('dynamic_color_template_mode', { boolean: {} })],
                    (e: CustomEvent) =>
                      this._updateIcon(
                        iconModule,
                        index,
                        {
                          dynamic_color_template_mode: e.detail.value.dynamic_color_template_mode,
                        },
                        updateModule
                      )
                  )}
                  ${icon.dynamic_color_template_mode
                    ? this.renderConditionalFieldsGroup(
                        'Dynamic Color Template Settings',
                        html`
                          <div class="settings-section">
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                            >
                              Template Code
                            </div>
                            <div
                              class="field-description"
                              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                            >
                              Enter the Jinja2 template code that returns a color value (e.g.,
                              #ff0000, rgb(255,0,0), var(--primary-color)).
                            </div>
                            ${FormUtils.renderField(
                              '',
                              '',
                              hass,
                              { dynamic_color_template: icon.dynamic_color_template || '' },
                              [
                                FormUtils.createSchemaItem('dynamic_color_template', {
                                  text: { multiline: true },
                                }),
                              ],
                              (e: CustomEvent) =>
                                this._updateIcon(
                                  iconModule,
                                  index,
                                  { dynamic_color_template: e.detail.value.dynamic_color_template },
                                  updateModule
                                )
                            )}
                          </div>
                        `
                      )
                    : ''}
                </div>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const iconModule = module as IconModule;

    // Apply design properties with priority
    const moduleWithDesign = iconModule as any;

    // Container styles for design system
    const containerStyles = {
      padding:
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${moduleWithDesign.padding_top || '8'}px ${moduleWithDesign.padding_right || '0'}px ${moduleWithDesign.padding_bottom || '8'}px ${moduleWithDesign.padding_left || '0'}px`
          : '8px 0',
      margin:
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${moduleWithDesign.margin_top || '0'}px ${moduleWithDesign.margin_right || '0'}px ${moduleWithDesign.margin_bottom || '0'}px ${moduleWithDesign.margin_left || '0'}px`
          : '0',
      background: moduleWithDesign.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(moduleWithDesign, hass),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      border:
        moduleWithDesign.border_style && moduleWithDesign.border_style !== 'none'
          ? `${moduleWithDesign.border_width || '1px'} ${moduleWithDesign.border_style} ${moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius: this.addPixelUnit(moduleWithDesign.border_radius) || '0',
      position: moduleWithDesign.position || 'relative',
      top: moduleWithDesign.top || 'auto',
      bottom: moduleWithDesign.bottom || 'auto',
      left: moduleWithDesign.left || 'auto',
      right: moduleWithDesign.right || 'auto',
      zIndex: moduleWithDesign.z_index || 'auto',
      width: moduleWithDesign.width || '100%',
      height: moduleWithDesign.height || 'auto',
      maxWidth: moduleWithDesign.max_width || '100%',
      maxHeight: moduleWithDesign.max_height || 'none',
      minWidth: moduleWithDesign.min_width || 'none',
      minHeight: moduleWithDesign.min_height || 'auto',
      overflow: moduleWithDesign.overflow || 'visible',
      clipPath: moduleWithDesign.clip_path || 'none',
      backdropFilter: moduleWithDesign.backdrop_filter || 'none',
      boxShadow:
        moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
          ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
    };

    return html`
      <div class="icon-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div class="icon-module-preview">
          <div
            class="icon-grid"
            style="
            display: grid;
            grid-template-columns: repeat(${Math.min(
              iconModule.columns || 3,
              iconModule.icons.length
            )}, 1fr);
            gap: ${iconModule.gap || 16}px;
            justify-content: ${iconModule.alignment || 'center'};
          "
          >
            ${iconModule.icons.slice(0, 6).map(icon => {
              const entityState = hass?.states[icon.entity];
              const currentState = entityState?.state || 'unknown';
              const isActive = currentState === icon.active_state;

              // Determine what to show based on state
              const shouldShowIcon = isActive
                ? icon.show_icon_when_active !== false
                : icon.show_icon_when_inactive !== false;
              const shouldShowName = isActive
                ? icon.show_name_when_active !== false
                : icon.show_name_when_inactive !== false;
              const shouldShowState = isActive
                ? icon.show_state_when_active !== false
                : icon.show_state_when_inactive !== false;

              // Get display values based on state - prioritize entity icon for dynamic updates
              let displayIcon = isActive
                ? icon.icon_active || icon.icon_inactive
                : icon.icon_inactive;

              // Use entity's current icon if available (for dynamic weather icons, etc.)
              if (entityState?.attributes?.icon) {
                displayIcon = entityState.attributes.icon;
              }

              const displayColor = icon.use_entity_color_for_icon
                ? entityState?.attributes?.rgb_color
                  ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                  : isActive
                    ? icon.active_icon_color
                    : icon.inactive_icon_color
                : isActive
                  ? icon.active_icon_color
                  : icon.inactive_icon_color;

              const nameColor = isActive ? icon.active_name_color : icon.inactive_name_color;
              const stateColor = isActive ? icon.active_state_color : icon.inactive_state_color;

              const displayName =
                icon.name || entityState?.attributes?.friendly_name || icon.entity;

              const displayState = isActive
                ? icon.custom_active_state_text || currentState
                : icon.custom_inactive_state_text || currentState;

              // Icon background styles - use active/inactive specific properties
              const iconBackground = isActive
                ? icon.active_icon_background || icon.icon_background
                : icon.inactive_icon_background || icon.icon_background;

              const iconBackgroundColor = isActive
                ? icon.active_icon_background_color || icon.icon_background_color
                : icon.inactive_icon_background_color || icon.icon_background_color;

              const iconBackgroundStyle =
                iconBackground !== 'none'
                  ? {
                      backgroundColor: icon.use_entity_color_for_icon_background
                        ? entityState?.attributes?.rgb_color
                          ? `rgb(${entityState.attributes.rgb_color.join(',')})`
                          : iconBackgroundColor
                        : iconBackgroundColor,
                      borderRadius:
                        iconBackground === 'circle'
                          ? '50%'
                          : iconBackground === 'rounded-square'
                            ? '8px'
                            : '0',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  : {};

              // Animation classes
              const animationClass = isActive
                ? icon.active_icon_animation !== 'none'
                  ? `icon-animation-${icon.active_icon_animation}`
                  : ''
                : icon.inactive_icon_animation !== 'none'
                  ? `icon-animation-${icon.inactive_icon_animation}`
                  : '';

              // Container styles
              const containerStyles = {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: icon.vertical_alignment || 'center',
                gap: '4px',
                padding: '8px',
                borderRadius:
                  icon.container_background_shape === 'circle'
                    ? '50%'
                    : icon.container_background_shape === 'rounded'
                      ? '8px'
                      : icon.container_background_shape === 'square'
                        ? '0'
                        : '8px',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: icon.container_width ? `${icon.container_width}px` : 'auto',
                minWidth: '60px',
              };

              return html`
                <div
                  class="icon-item-preview ${animationClass}"
                  style=${this.styleObjectToCss(containerStyles)}
                >
                  ${shouldShowIcon
                    ? html`
                        <div style=${this.styleObjectToCss(iconBackgroundStyle)}>
                          <ha-icon
                            icon="${displayIcon || 'mdi:help-circle'}"
                            style="
                      color: ${displayColor || 'var(--secondary-text-color)'};
                      font-size: ${Number(
                              isActive
                                ? icon.active_icon_size || icon.icon_size
                                : icon.inactive_icon_size || icon.icon_size
                            ) || 24}px;
                      --mdc-icon-size: ${Number(
                              isActive
                                ? icon.active_icon_size || icon.icon_size
                                : icon.inactive_icon_size || icon.icon_size
                            ) || 24}px;
                      width: ${Number(
                              isActive
                                ? icon.active_icon_size || icon.icon_size
                                : icon.inactive_icon_size || icon.icon_size
                            ) || 24}px;
                      height: ${Number(
                              isActive
                                ? icon.active_icon_size || icon.icon_size
                                : icon.inactive_icon_size || icon.icon_size
                            ) || 24}px;
                    "
                          ></ha-icon>
                        </div>
                      `
                    : ''}
                  ${shouldShowName
                    ? html`
                        <div
                          class="icon-name"
                          style="
                      font-size: ${icon.text_size || 12}px;
                        color: ${nameColor || 'var(--primary-text-color)'};
                      text-align: center;
                      line-height: 1.2;
                        max-width: 80px;
                      word-wrap: break-word;
                    "
                        >
                          ${displayName}
                        </div>
                      `
                    : ''}
                  ${shouldShowState
                    ? html`
                        <div
                          class="icon-state"
                          style="
                      font-size: ${Math.max((icon.text_size || 12) - 2, 10)}px;
                        color: ${stateColor || 'var(--secondary-text-color)'};
                      text-align: center;
                    "
                        >
                          ${displayState}
                        </div>
                      `
                    : ''}
                </div>
              `;
            })}
            ${iconModule.icons.length > 6
              ? html`
                  <div
                    class="more-icons"
                    style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
                color: var(--secondary-text-color);
                font-size: 12px;
                font-style: italic;
              "
                  >
                    +${iconModule.icons.length - 6} more
                  </div>
                `
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const iconModule = module as IconModule;
    const errors = [...baseValidation.errors];

    if (!iconModule.icons || iconModule.icons.length === 0) {
      errors.push('At least one icon is required');
    }

    iconModule.icons.forEach((icon, index) => {
      if (!icon.entity || icon.entity.trim() === '') {
        errors.push(`Icon ${index + 1}: Entity ID is required`);
      }

      if (!icon.icon_inactive || icon.icon_inactive.trim() === '') {
        errors.push(`Icon ${index + 1}: Inactive icon is required`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getStyles(): string {
    return `
      .icon-module-preview {
        padding: 8px;
        min-height: 60px;
      }
      
      .icon-grid {
        width: 100%;
      }
      
      .icon-item-preview:hover {
        background: var(--primary-color) !important;
        color: white;
        transform: scale(1.05);
      }
      
      .icon-item-preview:hover ha-icon {
        color: white !important;
      }
      
      .icon-item-preview:hover .icon-name,
      .icon-item-preview:hover .icon-state {
        color: white !important;
      }
      
      /* Field styling */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
        color: var(--primary-text-color) !important;
        margin-bottom: 4px !important;
        display: block !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        display: block !important;
        opacity: 0.8 !important;
        line-height: 1.4 !important;
      }

      .section-title {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--primary-color) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }

      .settings-section {
        margin-bottom: 16px;
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Conditional Fields Grouping CSS */
      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        overflow: hidden;
        transition: all 0.2s ease;
        animation: slideInFromLeft 0.3s ease-out;
      }

      .conditional-fields-group:hover {
        background: rgba(var(--rgb-primary-color), 0.12);
      }

      .conditional-fields-header {
        background: rgba(var(--rgb-primary-color), 0.15);
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .conditional-fields-content {
        padding: 16px;
      }

      .conditional-fields-content > .field-title:first-child {
        margin-top: 0 !important;
      }

      @keyframes slideInFromLeft {
        from { 
          opacity: 0; 
          transform: translateX(-10px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      }

      /* Expandable details styling */
      details > summary {
        list-style: none;
      }

      details > summary::-webkit-details-marker {
        display: none;
      }

      details[open] > summary ha-icon {
        transform: rotate(90deg);
      }

      details > summary:hover {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
      }

      /* Icon animations */
      .icon-animation-pulse {
        animation: iconPulse 2s ease-in-out infinite;
      }

      .icon-animation-spin {
        animation: iconSpin 2s linear infinite;
      }

      .icon-animation-bounce {
        animation: iconBounce 1s ease-in-out infinite;
      }

      .icon-animation-flash {
        animation: iconFlash 1s ease-in-out infinite;
      }

      .icon-animation-shake {
        animation: iconShake 0.5s ease-in-out infinite;
      }

      @keyframes iconPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }

      @keyframes iconSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes iconBounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }

      @keyframes iconFlash {
        0%, 50%, 100% { opacity: 1; }
        25%, 75% { opacity: 0.3; }
      }

      @keyframes iconShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
      }

      /* Add icon button styling */
      .add-icon-btn:hover {
        background: var(--primary-color);
        color: white;
      }
      
      /* Remove icon button styling */
      .remove-icon-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      /* Icon picker specific styling */
      ha-icon-picker {
        --ha-icon-picker-width: 100%;
        --ha-icon-picker-height: 56px;
      }

      /* Text field and select consistency */
      ha-textfield,
      ha-select {
        --mdc-shape-small: 8px;
        --mdc-theme-primary: var(--primary-color);
      }

      /* Grid styling for layout options */
      .settings-section[style*="grid"] > div {
        min-width: 0;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .settings-section[style*="grid-template-columns: 1fr 1fr 1fr"] {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }

        .settings-section[style*="grid-template-columns: 1fr 1fr"] {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }

        .conditional-fields-group {
          border-left-width: 3px;
        }
        
        .conditional-fields-header {
          padding: 10px 12px;
          font-size: 13px;
        }
        
        .conditional-fields-content {
        padding: 12px;
        }
      }

      /* Ensure form elements don't overflow */
      .settings-section ha-form {
        max-width: 100%;
        overflow: visible;
      }

      /* Color picker adjustments */
      .settings-section ha-form[data-field*="color"] {
        min-height: 56px;
      }

      /* Boolean toggle adjustments */
      .settings-section ha-form[data-field*="mode"] {
        display: flex;
        align-items: center;
        min-height: auto;
      }

      /* Number slider adjustments */
      .settings-section ha-form[data-field*="size"] .mdc-slider,
      .settings-section ha-form[data-field*="gap"] .mdc-slider,
      .settings-section ha-form[data-field*="columns"] .mdc-slider {
        width: 100%;
        max-width: 100%;
      }
    `;
  }

  private _addIcon(
    iconModule: IconModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const newIcon: IconConfig = {
      id: this.generateId('icon-item'),
      entity: 'weather.forecast_home',
      name: 'Forecast',
      icon_inactive: 'mdi:weather-partly-cloudy',
      icon_active: 'mdi:weather-partly-cloudy',
      inactive_state: 'off',
      active_state: 'on',
      custom_inactive_state_text: '',
      custom_active_state_text: '',

      // Template modes
      inactive_template_mode: false,
      inactive_template: '',
      active_template_mode: false,
      active_template: '',

      // Entity color options
      use_entity_color_for_icon: false,

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

      // Legacy (backward compatibility)
      show_state: true,
      show_name: true,

      // Sizing
      icon_size: 24,
      text_size: 12,

      // Active/Inactive specific sizing
      active_icon_size: 24,
      inactive_icon_size: 24,

      // Icon background
      icon_background: 'none',
      use_entity_color_for_icon_background: false,
      icon_background_color: 'transparent',

      // Active/Inactive specific icon backgrounds
      active_icon_background: 'none',
      inactive_icon_background: 'none',
      active_icon_background_color: 'transparent',
      inactive_icon_background_color: 'transparent',

      // Animations
      inactive_icon_animation: 'none',
      active_icon_animation: 'none',

      // Other display options
      show_units: false,

      // Container appearance
      vertical_alignment: 'center',
      container_width: undefined,
      container_background_shape: 'none',

      // Ultra Link Actions
      tap_action: { action: 'toggle' },
      hold_action: { action: 'default' },
      double_tap_action: { action: 'default' },

      // Legacy actions (backward compatibility)
      click_action: 'toggle',
      double_click_action: 'none',
      hold_action_legacy: 'none',
      navigation_path: '',
      url: '',
      service: '',
      service_data: {},

      // Legacy template support
      template_mode: false,
      template: '',

      // Dynamic templates
      dynamic_icon_template_mode: false,
      dynamic_icon_template: '',
      dynamic_color_template_mode: false,
      dynamic_color_template: '',
    };

    const updatedIcons = [...iconModule.icons, newIcon];
    updateModule({ icons: updatedIcons });
  }

  private _removeIcon(
    iconModule: IconModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    if (iconModule.icons.length <= 1) return;

    const updatedIcons = iconModule.icons.filter((_, i) => i !== index);
    updateModule({ icons: updatedIcons });
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
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    if (
      !moduleWithDesign.background_image_type ||
      moduleWithDesign.background_image_type === 'none'
    ) {
      return 'none';
    }

    switch (moduleWithDesign.background_image_type) {
      case 'upload':
      case 'url':
        if (moduleWithDesign.background_image) {
          return `url("${moduleWithDesign.background_image}")`;
        }
        break;

      case 'entity':
        if (
          moduleWithDesign.background_image_entity &&
          hass?.states[moduleWithDesign.background_image_entity]
        ) {
          const entityState = hass.states[moduleWithDesign.background_image_entity];
          let imageUrl = '';

          // Try to get image from entity
          if (entityState.attributes?.entity_picture) {
            imageUrl = entityState.attributes.entity_picture;
          } else if (entityState.attributes?.image) {
            imageUrl = entityState.attributes.image;
          } else if (entityState.state && typeof entityState.state === 'string') {
            // Handle cases where state itself is an image path
            if (entityState.state.startsWith('/') || entityState.state.startsWith('http')) {
              imageUrl = entityState.state;
            }
          }

          if (imageUrl) {
            // Handle Home Assistant local paths
            if (imageUrl.startsWith('/local/') || imageUrl.startsWith('/media/')) {
              imageUrl = imageUrl;
            } else if (imageUrl.startsWith('/')) {
              imageUrl = imageUrl;
            }
            return `url("${imageUrl}")`;
          }
        }
        break;
    }

    return 'none';
  }

  private styleObjectToCss(styleObj: Record<string, string>): string {
    return Object.entries(styleObj)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        return `${kebabKey}: ${value}`;
      })
      .join('; ');
  }

  // Helper method to ensure border radius values have proper units
  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;

    // If value is just a number or contains only numbers, add px
    if (/^\d+$/.test(value)) {
      return `${value}px`;
    }

    // If value is a multi-value (like "5 10 15 20"), add px to each number
    if (/^[\d\s]+$/.test(value)) {
      return value
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }

    // Otherwise return as-is (already has units like px, em, %, etc.)
    return value;
  }
}

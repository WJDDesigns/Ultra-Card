import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, InfoModule, InfoEntityConfig, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';

export class UltraInfoModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'info',
    title: 'Info Items',
    description: 'Show entity information values',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:information',
    category: 'data',
    tags: ['info', 'entity', 'data', 'sensors'],
  };

  createDefault(id?: string): InfoModule {
    return {
      id: id || this.generateId('info'),
      type: 'info',
      info_entities: [
        {
          id: this.generateId('entity'),
          entity: '',
          name: 'Entity Name',
          icon: '',
          show_icon: true,
          show_name: true,
          text_size: 14,
          name_size: 12,
          icon_size: 18,
          text_bold: false,
          text_italic: false,
          text_uppercase: false,
          text_strikethrough: false,
          name_bold: false,
          name_italic: false,
          name_uppercase: false,
          name_strikethrough: false,
          icon_color: 'var(--primary-color)',
          name_color: 'var(--secondary-text-color)',
          text_color: 'var(--primary-text-color)',
          click_action: 'more-info',
          navigation_path: '',
          url: '',
          service: '',
          service_data: {},
          template_mode: false,
          template: '',
          dynamic_icon_template_mode: false,
          dynamic_icon_template: '',
          dynamic_color_template_mode: false,
          dynamic_color_template: '',
          // Icon positioning and alignment
          icon_position: 'left',
          icon_alignment: 'center',
          content_alignment: 'start',
          overall_alignment: 'center',
          icon_gap: 8,
        },
      ],
      alignment: 'left',
      vertical_alignment: 'center',
      columns: 1,
      gap: 12,
      allow_wrap: true,
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const infoModule = module as InfoModule;
    const entity = infoModule.info_entities[0] || this.createDefault().info_entities[0];

    return html`
      <div class="module-general-settings">
        <!-- Entity Configuration -->
        <div class="settings-section">
          <ha-form
            .hass=${hass}
            .data=${{ entity: entity.entity || '' }}
            .schema=${[
              {
                name: 'entity',
                label: 'Entity',
                description: 'Select the entity to display',
                selector: { entity: {} },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label || schema.name}
            .computeDescription=${(schema: any) => schema.description || ''}
            @value-changed=${(e: CustomEvent) =>
              this._handleEntityChange(infoModule, 0, e.detail.value.entity, hass, updateModule)}
          ></ha-form>
        </div>

        <!-- Custom Name -->
        <div class="settings-section">
          <ha-form
            .hass=${hass}
            .data=${{ name: entity.name || '' }}
            .schema=${[
              {
                name: 'name',
                label: 'Name',
                description: 'Custom display name for this entity',
                selector: { text: {} },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label || schema.name}
            .computeDescription=${(schema: any) => schema.description || ''}
            @value-changed=${(e: CustomEvent) =>
              this._updateEntity(infoModule, 0, { name: e.detail.value.name }, updateModule)}
          ></ha-form>
        </div>

        <!-- Show Icon -->
        <div class="settings-section">
          <ha-form
            .hass=${hass}
            .data=${{ show_icon: entity.show_icon !== false }}
            .schema=${[
              {
                name: 'show_icon',
                label: 'Show Icon',
                description: 'Display an icon next to the entity value',
                selector: { boolean: {} },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label || schema.name}
            .computeDescription=${(schema: any) => schema.description || ''}
            @value-changed=${(e: CustomEvent) =>
              this._updateEntity(
                infoModule,
                0,
                { show_icon: e.detail.value.show_icon },
                updateModule
              )}
          ></ha-form>
        </div>

        <!-- Icon Selection -->
        ${entity.show_icon !== false
          ? html`
              <div class="settings-section">
                <ha-form
                  .hass=${hass}
                  .data=${{ icon: entity.icon || '' }}
                  .schema=${[
                    {
                      name: 'icon',
                      label: 'Icon',
                      description: 'Choose an icon to display',
                      selector: { icon: {} },
                    },
                  ]}
                  .computeLabel=${(schema: any) => schema.label || schema.name}
                  .computeDescription=${(schema: any) => schema.description || ''}
                  @value-changed=${(e: CustomEvent) =>
                    this._updateEntity(infoModule, 0, { icon: e.detail.value.icon }, updateModule)}
                ></ha-form>
              </div>
            `
          : ''}

        <!-- Show Name -->
        <div class="settings-section">
          <ha-form
            .hass=${hass}
            .data=${{ show_name: entity.show_name !== false }}
            .schema=${[
              {
                name: 'show_name',
                label: 'Show Name',
                description: 'Display the entity name above the value',
                selector: { boolean: {} },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label || schema.name}
            .computeDescription=${(schema: any) => schema.description || ''}
            @value-changed=${(e: CustomEvent) =>
              this._updateEntity(
                infoModule,
                0,
                { show_name: e.detail.value.show_name },
                updateModule
              )}
          ></ha-form>
        </div>

        <!-- Click Action -->
        <div class="settings-section">
          <ha-form
            .hass=${hass}
            .data=${{ click_action: entity.click_action || 'more-info' }}
            .schema=${[
              {
                name: 'click_action',
                label: 'Click Action',
                description: 'Action to perform when clicking the entity',
                selector: {
                  select: {
                    options: [
                      { value: 'none', label: 'No Action' },
                      { value: 'more-info', label: 'More Info' },
                      { value: 'toggle', label: 'Toggle' },
                      { value: 'navigate', label: 'Navigate' },
                      { value: 'url', label: 'Open URL' },
                      { value: 'service', label: 'Call Service' },
                    ],
                    mode: 'dropdown',
                  },
                },
              },
            ]}
            .computeLabel=${(schema: any) => schema.label || schema.name}
            .computeDescription=${(schema: any) => schema.description || ''}
            @value-changed=${(e: CustomEvent) =>
              this._updateEntity(
                infoModule,
                0,
                { click_action: e.detail.value.click_action },
                updateModule
              )}
          ></ha-form>
        </div>

        <!-- Icon Color -->
        ${entity.show_icon !== false
          ? html`
              <div class="settings-section">
                <div
                  class="field-title"
                  style="font-size: 16px !important; font-weight: 600 !important;"
                >
                  Icon Color
                </div>
                <ultra-color-picker
                  .value=${entity.icon_color || ''}
                  .defaultValue=${'var(--primary-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    this._updateEntity(infoModule, 0, { icon_color: e.detail.value }, updateModule)}
                ></ultra-color-picker>
              </div>
            `
          : ''}

        <!-- Entity Color -->
        <div class="settings-section">
          <div class="field-title" style="font-size: 16px !important; font-weight: 600 !important;">
            Entity Color
          </div>
          <ultra-color-picker
            .value=${entity.text_color || ''}
            .defaultValue=${'var(--primary-text-color)'}
            .hass=${hass}
            @value-changed=${(e: CustomEvent) =>
              this._updateEntity(infoModule, 0, { text_color: e.detail.value }, updateModule)}
          ></ultra-color-picker>
        </div>

        <!-- Template Mode Section -->
        <div
          class="settings-section template-mode-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            Template Mode
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            Use a template to format the entity value. Templates allow you to use Home Assistant
            templating syntax for complex formatting.
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ template_mode: entity.template_mode || false }}
              .schema=${[
                {
                  name: 'template_mode',
                  label: 'Template Mode',
                  description: 'Use Home Assistant templating syntax to format the value',
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                this._updateEntity(
                  infoModule,
                  0,
                  { template_mode: e.detail.value.template_mode },
                  updateModule
                )}
            ></ha-form>
          </div>

          ${entity.template_mode
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  <ha-form
                    .hass=${hass}
                    .data=${{ template: entity.template || '' }}
                    .schema=${[
                      {
                        name: 'template',
                        label: 'Value Template',
                        description: 'Template to format the entity value using Jinja2 syntax',
                        selector: { text: { multiline: true } },
                      },
                    ]}
                    .computeLabel=${(schema: any) => schema.label || schema.name}
                    .computeDescription=${(schema: any) => schema.description || ''}
                    @value-changed=${(e: CustomEvent) =>
                      this._updateEntity(
                        infoModule,
                        0,
                        { template: e.detail.value.template },
                        updateModule
                      )}
                  ></ha-form>
                </div>

                <div class="template-examples">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    Common Examples:
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      {{ states('sensor.${entity.entity?.split('.')[1] || 'example'}') }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      Basic value
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      {{ states('sensor.${entity.entity?.split('.')[1] || 'example'}') | float(0) }}
                      km
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      With units
                    </div>
                  </div>

                  <div class="example-item" style="margin-bottom: 16px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; margin-bottom: 8px;"
                    >
                      {{ states('sensor.${entity.entity?.split('.')[1] || 'example'}') | float(0) |
                      round(1) }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 12px; color: var(--secondary-text-color);"
                    >
                      Round to 1 decimal
                    </div>
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Size Settings -->
        <div
          class="settings-section size-settings"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            Size Settings
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${entity.show_icon !== false
              ? html`
                  <div class="field-group">
                    <ha-form
                      .hass=${hass}
                      .data=${{ icon_size: Number(entity.icon_size) || 18 }}
                      .schema=${[
                        {
                          name: 'icon_size',
                          label: 'Icon Size',
                          description: 'Size of the icon in pixels',
                          selector: { number: { min: 12, max: 48, step: 1, mode: 'slider' } },
                        },
                      ]}
                      .computeLabel=${(schema: any) => schema.label || schema.name}
                      .computeDescription=${(schema: any) => schema.description || ''}
                      @value-changed=${(e: CustomEvent) =>
                        this._updateEntity(
                          infoModule,
                          0,
                          { icon_size: Number(e.detail.value.icon_size) },
                          updateModule
                        )}
                    ></ha-form>
                  </div>
                `
              : ''}
            ${entity.show_name !== false
              ? html`
                  <div class="field-group">
                    <ha-form
                      .hass=${hass}
                      .data=${{ name_size: entity.name_size || 12 }}
                      .schema=${[
                        {
                          name: 'name_size',
                          label: 'Name Size',
                          description: 'Size of the entity name text in pixels',
                          selector: { number: { min: 8, max: 32, step: 1, mode: 'slider' } },
                        },
                      ]}
                      .computeLabel=${(schema: any) => schema.label || schema.name}
                      .computeDescription=${(schema: any) => schema.description || ''}
                      @value-changed=${(e: CustomEvent) =>
                        this._updateEntity(
                          infoModule,
                          0,
                          { name_size: e.detail.value.name_size },
                          updateModule
                        )}
                    ></ha-form>
                  </div>
                `
              : ''}

            <div class="field-group">
              <ha-form
                .hass=${hass}
                .data=${{ text_size: entity.text_size || 14 }}
                .schema=${[
                  {
                    name: 'text_size',
                    label: 'Value Size',
                    description: 'Size of the entity value text in pixels',
                    selector: { number: { min: 8, max: 32, step: 1, mode: 'slider' } },
                  },
                ]}
                .computeLabel=${(schema: any) => schema.label || schema.name}
                .computeDescription=${(schema: any) => schema.description || ''}
                @value-changed=${(e: CustomEvent) =>
                  this._updateEntity(
                    infoModule,
                    0,
                    { text_size: e.detail.value.text_size },
                    updateModule
                  )}
              ></ha-form>
            </div>

            ${entity.show_icon !== false
              ? html`
                  <div class="field-group">
                    <ha-form
                      .hass=${hass}
                      .data=${{ icon_gap: entity.icon_gap || 8 }}
                      .schema=${[
                        {
                          name: 'icon_gap',
                          label: 'Icon Gap',
                          description: 'Space between the icon and content in pixels',
                          selector: { number: { min: 0, max: 32, step: 1, mode: 'slider' } },
                        },
                      ]}
                      .computeLabel=${(schema: any) => schema.label || schema.name}
                      .computeDescription=${(schema: any) => schema.description || ''}
                      @value-changed=${(e: CustomEvent) =>
                        this._updateEntity(
                          infoModule,
                          0,
                          { icon_gap: e.detail.value.icon_gap },
                          updateModule
                        )}
                    ></ha-form>
                  </div>
                `
              : ''}
          </div>
        </div>

        <!-- Layout & Positioning Section -->
        <div
          class="settings-section layout-positioning-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            Layout & Positioning
          </div>

          <!-- Icon Position -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              Icon Position
            </div>
            <div
              class="control-button-group"
              style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0px; max-width: 240px;"
            >
              ${[
                { value: 'left', icon: 'mdi:format-align-left' },
                { value: 'top', icon: 'mdi:format-align-top' },
                { value: 'right', icon: 'mdi:format-align-right' },
                { value: 'bottom', icon: 'mdi:format-align-bottom' },
              ].map(
                position => html`
                  <button
                    type="button"
                    class="control-btn ${(entity.icon_position || 'left') === position.value
                      ? 'active'
                      : ''}"
                    @click=${() =>
                      this._updateEntity(
                        infoModule,
                        0,
                        { icon_position: position.value as any },
                        updateModule
                      )}
                    title="${position.value.charAt(0).toUpperCase() + position.value.slice(1)}"
                  >
                    <ha-icon icon="${position.icon}"></ha-icon>
                  </button>
                `
              )}
            </div>
          </div>

          <!-- Overall Alignment -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              Overall Alignment
            </div>
            <div
              class="control-button-group"
              style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0px; max-width: 180px;"
            >
              ${[
                { value: 'left', icon: 'mdi:format-align-left' },
                { value: 'center', icon: 'mdi:format-align-center' },
                { value: 'right', icon: 'mdi:format-align-right' },
              ].map(
                alignment => html`
                  <button
                    type="button"
                    class="control-btn ${(entity.overall_alignment || 'center') === alignment.value
                      ? 'active'
                      : ''}"
                    @click=${() =>
                      this._updateEntity(
                        infoModule,
                        0,
                        { overall_alignment: alignment.value as any },
                        updateModule
                      )}
                    title="${alignment.value.charAt(0).toUpperCase() + alignment.value.slice(1)}"
                  >
                    <ha-icon icon="${alignment.icon}"></ha-icon>
                  </button>
                `
              )}
            </div>
          </div>

          <!-- Icon and Content Alignment Side by Side -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
            <!-- Icon Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                Icon Alignment
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0px;"
              >
                ${[
                  { value: 'start', icon: 'mdi:format-align-left' },
                  { value: 'center', icon: 'mdi:format-align-center' },
                  { value: 'end', icon: 'mdi:format-align-right' },
                ].map(
                  alignment => html`
                    <button
                      type="button"
                      class="control-btn ${(entity.icon_alignment || 'center') === alignment.value
                        ? 'active'
                        : ''}"
                      @click=${() =>
                        this._updateEntity(
                          infoModule,
                          0,
                          { icon_alignment: alignment.value as any },
                          updateModule
                        )}
                      title="${alignment.value.charAt(0).toUpperCase() + alignment.value.slice(1)}"
                    >
                      <ha-icon icon="${alignment.icon}"></ha-icon>
                    </button>
                  `
                )}
              </div>
            </div>

            <!-- Content Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                Content Alignment
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0px;"
              >
                ${[
                  { value: 'start', icon: 'mdi:format-align-left' },
                  { value: 'center', icon: 'mdi:format-align-center' },
                  { value: 'end', icon: 'mdi:format-align-right' },
                ].map(
                  alignment => html`
                    <button
                      type="button"
                      class="control-btn ${(entity.content_alignment || 'start') === alignment.value
                        ? 'active'
                        : ''}"
                      @click=${() =>
                        this._updateEntity(
                          infoModule,
                          0,
                          { content_alignment: alignment.value as any },
                          updateModule
                        )}
                      title="${alignment.value.charAt(0).toUpperCase() + alignment.value.slice(1)}"
                    >
                      <ha-icon icon="${alignment.icon}"></ha-icon>
                    </button>
                  `
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const infoModule = module as InfoModule;

    // Apply design properties with priority
    const moduleWithDesign = infoModule as any;

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
      <div class="info-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div class="info-module-preview">
          <div
            class="info-entities"
            style="
            display: grid;
            grid-template-columns: repeat(${infoModule.columns || 1}, 1fr);
            gap: ${infoModule.gap || 12}px;
            justify-content: ${infoModule.alignment || 'left'};
          "
          >
            ${infoModule.info_entities.slice(0, 3).map(entity => {
              const entityState = hass?.states[entity.entity];
              const displayValue = entityState ? entityState.state : 'N/A';
              const displayName =
                entity.name || entityState?.attributes?.friendly_name || entity.entity;
              const displayIcon = entity.icon || entityState?.attributes?.icon || 'mdi:help-circle';

              const iconPosition = entity.icon_position || 'left';
              const iconAlignment = entity.icon_alignment || 'center';
              const contentAlignment = entity.content_alignment || 'start';
              const overallAlignment = entity.overall_alignment || 'center';
              const iconGap = entity.icon_gap || 8;

              const iconElement = entity.show_icon
                ? html`
                    <ha-icon
                      icon="${displayIcon}"
                      class="entity-icon"
                      style="color: ${entity.icon_color ||
                      'var(--primary-color)'}; font-size: ${Number(entity.icon_size) || 18}px;"
                    ></ha-icon>
                  `
                : '';

              const contentElement = html`
                <div
                  class="entity-content"
                  style="
                  align-items: ${contentAlignment === 'start'
                    ? 'flex-start'
                    : contentAlignment === 'end'
                      ? 'flex-end'
                      : 'center'};
                  text-align: ${contentAlignment === 'start'
                    ? 'left'
                    : contentAlignment === 'end'
                      ? 'right'
                      : 'center'};
                "
                >
                  ${entity.show_name
                    ? html`
                        <div
                          class="entity-name"
                          style="
                    color: ${entity.name_color || 'var(--secondary-text-color)'};
                    font-size: ${entity.name_size || 12}px;
                    font-weight: ${entity.name_bold ? 'bold' : 'normal'};
                    font-style: ${entity.name_italic ? 'italic' : 'normal'};
                    text-transform: ${entity.name_uppercase ? 'uppercase' : 'none'};
                    text-decoration: ${entity.name_strikethrough ? 'line-through' : 'none'};
                  "
                        >
                          ${displayName}
                        </div>
                      `
                    : ''}

                  <div
                    class="entity-value"
                    style="
                  color: ${entity.text_color || 'var(--primary-text-color)'};
                  font-size: ${entity.text_size || 14}px;
                  font-weight: ${entity.text_bold ? 'bold' : 'normal'};
                  font-style: ${entity.text_italic ? 'italic' : 'normal'};
                  text-transform: ${entity.text_uppercase ? 'uppercase' : 'none'};
                  text-decoration: ${entity.text_strikethrough ? 'line-through' : 'none'};
                "
                  >
                    ${displayValue}${entityState?.attributes?.unit_of_measurement || ''}
                  </div>
                </div>
              `;

              return html`
                <div
                  class="info-entity-item position-${iconPosition}"
                  style="
                  display: flex;
                  flex-direction: ${iconPosition === 'top' || iconPosition === 'bottom'
                    ? 'column'
                    : 'row'};
                  align-items: ${iconAlignment === 'start'
                    ? 'flex-start'
                    : iconAlignment === 'end'
                      ? 'flex-end'
                      : 'center'};
                  justify-content: ${overallAlignment === 'left'
                    ? 'flex-start'
                    : overallAlignment === 'right'
                      ? 'flex-end'
                      : 'center'};
                  gap: ${iconGap}px;
                  padding: 4px;
                  border-radius: 4px;
                "
                >
                  ${iconPosition === 'left' || iconPosition === 'top'
                    ? html`${iconElement}${contentElement}`
                    : html`${contentElement}${iconElement}`}
                </div>
              `;
            })}
            ${infoModule.info_entities.length > 3
              ? html`
                  <div class="more-entities">+${infoModule.info_entities.length - 3} more</div>
                `
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const infoModule = module as InfoModule;
    const errors = [...baseValidation.errors];

    if (!infoModule.info_entities || infoModule.info_entities.length === 0) {
      errors.push('At least one info entity is required');
    }

    infoModule.info_entities.forEach((entity, index) => {
      if (!entity.entity || entity.entity.trim() === '') {
        errors.push(`Entity ${index + 1}: Entity ID is required`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getStyles(): string {
    return `
      .info-module-preview {
        padding: 8px;
        min-height: 40px;
      }
      
      .info-entities {
        width: 100%;
      }
      
      .info-entity-item {
        min-width: 0;
        flex: 1;
      }
      
      .entity-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1;
      }
      
      .entity-icon {
        flex-shrink: 0;
      }
      
      .entity-name {
        font-size: 12px;
        line-height: 1.2;
      }
      
      .entity-value {
        font-size: 14px;
        font-weight: 500;
        line-height: 1.2;
      }
      
      .more-entities {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        color: var(--secondary-text-color);
        font-size: 12px;
        font-style: italic;
      }
      
      .info-entities-section,
      .layout-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      
      .info-entities-section:first-child {
        margin-top: 0;
        padding-top: 0;
        border-top: none;
      }
      
      .info-entities-section h4,
      .layout-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      
      .entity-item {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        background: var(--card-background-color);
      }
      
      .entity-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 500;
        font-size: 14px;
      }
      
      .remove-entity-btn {
        background: none;
        border: none;
        color: var(--error-color);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .remove-entity-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      
      .add-entity-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px;
        border: 2px dashed var(--primary-color);
        border-radius: 8px;
        background: none;
        color: var(--primary-color);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      }
      
      .add-entity-btn:hover {
        background: var(--primary-color);
        color: white;
      }
      
      .entity-display-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin: 8px 0;
      }
      
      /* Control button styles */
      .control-btn {
        padding: 8px 4px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        user-select: none;
        font-size: 10px;
      }
      
      .control-btn:hover:not(.active) {
        border-color: var(--primary-color) !important;
        background: var(--primary-color) !important;
        color: white !important;
        opacity: 0.8;
      }
      
      .control-btn.active {
        border-color: var(--primary-color);
        background: var(--primary-color);
        color: white;
      }
      
      .control-btn ha-icon {
        font-size: 14px;
      }
      
      .control-button-group {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        overflow: hidden;
      }
      
      .control-button-group .control-btn:not(:last-child) {
        border-right: none;
      }
      
      .control-button-group .control-btn:first-child {
        border-radius: 4px 0 0 4px;
      }
      
      .control-button-group .control-btn:last-child {
        border-radius: 0 4px 4px 0;
      }
      
      .control-button-group .control-btn:only-child {
        border-radius: 4px;
      }
      
      /* Position-specific layout styles */
      .position-left {
        flex-direction: row;
      }
      
      .position-right {
        flex-direction: row-reverse;
      }
      
      .position-top {
        flex-direction: column;
      }
      
      .position-bottom {
        flex-direction: column-reverse;
      }
    `;
  }

  private _addEntity(
    infoModule: InfoModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const newEntity: InfoEntityConfig = {
      id: this.generateId('entity'),
      entity: '',
      name: 'Entity Name',
      icon: '',
      show_icon: true,
      show_name: true,
      text_size: 14,
      name_size: 12,
      icon_size: 18,
      text_bold: false,
      text_italic: false,
      text_uppercase: false,
      text_strikethrough: false,
      name_bold: false,
      name_italic: false,
      name_uppercase: false,
      name_strikethrough: false,
      icon_color: 'var(--primary-color)',
      name_color: 'var(--secondary-text-color)',
      text_color: 'var(--primary-text-color)',
      click_action: 'more-info',
      navigation_path: '',
      url: '',
      service: '',
      service_data: {},
      template_mode: false,
      template: '',
      dynamic_icon_template_mode: false,
      dynamic_icon_template: '',
      dynamic_color_template_mode: false,
      dynamic_color_template: '',
      // Icon positioning and alignment
      icon_position: 'left',
      icon_alignment: 'center',
      content_alignment: 'start',
      overall_alignment: 'center',
      icon_gap: 8,
    };

    const updatedEntities = [...infoModule.info_entities, newEntity];
    updateModule({ info_entities: updatedEntities });
  }

  private _removeEntity(
    infoModule: InfoModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    if (infoModule.info_entities.length <= 1) return;

    const updatedEntities = infoModule.info_entities.filter((_, i) => i !== index);
    updateModule({ info_entities: updatedEntities });
  }

  private _handleEntityChange(
    infoModule: InfoModule,
    index: number,
    entityId: string,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const updates: Partial<InfoEntityConfig> = { entity: entityId };

    // Auto-populate name from entity's friendly name if name is empty or default
    if (entityId && hass?.states[entityId]) {
      const entityState = hass.states[entityId];
      const friendlyName = entityState.attributes?.friendly_name || entityId.split('.').pop() || '';

      // Get current entity to check if name should be updated
      const currentEntity = infoModule.info_entities?.[index];
      if (
        !currentEntity?.name ||
        currentEntity.name === 'Entity Name' ||
        currentEntity.name === currentEntity.entity
      ) {
        updates.name = friendlyName;
      }
    }

    this._updateEntity(infoModule, index, updates, updateModule);
  }

  private _updateEntity(
    infoModule: InfoModule,
    index: number,
    updates: Partial<InfoEntityConfig>,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    // Ensure we have at least one entity
    if (!infoModule.info_entities || infoModule.info_entities.length === 0) {
      const defaultEntity = this.createDefault().info_entities[0];
      infoModule.info_entities = [{ ...defaultEntity, ...updates }];
      updateModule({ info_entities: infoModule.info_entities });
      return;
    }

    // Ensure the entity at the index exists
    if (index >= infoModule.info_entities.length) {
      const defaultEntity = this.createDefault().info_entities[0];
      while (infoModule.info_entities.length <= index) {
        infoModule.info_entities.push({ ...defaultEntity });
      }
    }

    const updatedEntities = infoModule.info_entities.map((entity, i) =>
      i === index ? { ...entity, ...updates } : entity
    );
    updateModule({ info_entities: updatedEntities });
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

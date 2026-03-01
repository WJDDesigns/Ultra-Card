import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, DynamicListModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { TemplateService } from '../services/template-service';
import { preprocessTemplateVariables } from '../utils/uc-template-processor';
import { getModuleRegistry } from './module-registry';
import { logicService } from '../services/logic-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';

import '../components/ultra-template-editor';

// ─── Example templates ───────────────────────────────────────────────────────

const EXAMPLE_DOORS_WINDOWS = `{# Doors & Windows — shows open/closed with color-coded icon #}
{% set sensors = [
  {'entity': 'binary_sensor.front_door',        'name': 'Front Door',        'icon_on': 'mdi:door-open',    'icon_off': 'mdi:door-closed'},
  {'entity': 'binary_sensor.back_door',         'name': 'Back Door',         'icon_on': 'mdi:door-open',    'icon_off': 'mdi:door-closed'},
  {'entity': 'binary_sensor.garage_door',       'name': 'Garage',            'icon_on': 'mdi:garage-open',  'icon_off': 'mdi:garage'},
  {'entity': 'binary_sensor.living_room_window','name': 'Living Room Window','icon_on': 'mdi:window-open',  'icon_off': 'mdi:window-closed'},
  {'entity': 'binary_sensor.bedroom_window',   'name': 'Bedroom Window',    'icon_on': 'mdi:window-open',  'icon_off': 'mdi:window-closed'}
] %}
{% set ns = namespace(mods=[]) %}
{% for s in sensors %}
  {% set is_open = states(s.entity) == 'on' %}
  {% set icon_item = {
    'id': 'ii_' ~ loop.index,
    'icon_mode': 'entity',
    'entity': s.entity,
    'name': s.name,
    'icon_inactive': s.icon_off,
    'icon_active':   s.icon_on,
    'active_state':  'on',
    'inactive_icon_color': '#4caf50',
    'active_icon_color':   '#f44336',
    'show_name_when_inactive': true, 'show_state_when_inactive': true, 'show_icon_when_inactive': true,
    'show_name_when_active':   true, 'show_state_when_active':   true, 'show_icon_when_active':   true
  } %}
  {% set mod = {'id': 'dw_' ~ loop.index, 'type': 'icon', 'icons': [icon_item], 'display_mode': 'always', 'display_conditions': []} %}
  {% set ns.mods = ns.mods + [mod] %}
{% endfor %}
{{ ns.mods | tojson }}`;

const EXAMPLE_TIRE_PRESSURE = `{# Tire Pressure — bar per wheel, color changes at thresholds #}
{% set wheels = [
  {'entity': 'sensor.car_tyre_pressure_front_left',  'name': 'Front Left'},
  {'entity': 'sensor.car_tyre_pressure_front_right', 'name': 'Front Right'},
  {'entity': 'sensor.car_tyre_pressure_rear_left',   'name': 'Rear Left'},
  {'entity': 'sensor.car_tyre_pressure_rear_right',  'name': 'Rear Right'}
] %}
{% set ns = namespace(mods=[]) %}
{% for w in wheels %}
  {% set psi = states(w.entity) | float(0) | round(1) %}
  {% set color = '#f44336' if psi < 30 or psi > 38 else ('#ff9800' if psi < 32 or psi > 36 else '#4caf50') %}
  {% set mod = {
    'id': 'tyre_' ~ loop.index,
    'type': 'bar',
    'entity': w.entity,
    'name': w.name ~ ' (' ~ psi ~ ' psi)',
    'bar_color': color,
    'display_mode': 'always',
    'display_conditions': []
  } %}
  {% set ns.mods = ns.mods + [mod] %}
{% endfor %}
{{ ns.mods | tojson }}`;

const EXAMPLE_LIGHTS = `{# Lights — icon shows on/off, dimmer % shown in state text #}
{% set lights = [
  {'entity': 'light.living_room', 'name': 'Living Room'},
  {'entity': 'light.kitchen',     'name': 'Kitchen'},
  {'entity': 'light.bedroom',     'name': 'Bedroom'},
  {'entity': 'light.hallway',     'name': 'Hallway'}
] %}
{% set ns = namespace(mods=[]) %}
{% for l in lights %}
  {% set is_on = states(l.entity) == 'on' %}
  {% set brightness = (state_attr(l.entity, 'brightness') | int(0) / 255 * 100) | round(0) %}
  {% set state_label = brightness ~ '%' if is_on else 'Off' %}
  {% set icon_item = {
    'id': 'li_' ~ loop.index,
    'icon_mode': 'entity',
    'entity': l.entity,
    'name': l.name,
    'icon_inactive': 'mdi:lightbulb-outline',
    'icon_active':   'mdi:lightbulb',
    'active_state':  'on',
    'inactive_icon_color': '#9e9e9e',
    'active_icon_color':   '#ffc107',
    'show_name_when_inactive': true, 'show_state_when_inactive': true, 'show_icon_when_inactive': true,
    'show_name_when_active':   true, 'show_state_when_active':   true, 'show_icon_when_active':   true
  } %}
  {% set mod = {'id': 'lt_' ~ loop.index, 'type': 'icon', 'icons': [icon_item], 'display_mode': 'always', 'display_conditions': []} %}
  {% set ns.mods = ns.mods + [mod] %}
{% endfor %}
{{ ns.mods | tojson }}`;

const EXAMPLE_TEMPERATURE = `{# Temperature sensors — text with hot/cold color coding #}
{% set sensors = [
  {'entity': 'sensor.living_room_temperature', 'name': 'Living Room'},
  {'entity': 'sensor.bedroom_temperature',     'name': 'Bedroom'},
  {'entity': 'sensor.outdoor_temperature',     'name': 'Outdoor'},
  {'entity': 'sensor.garage_temperature',      'name': 'Garage'}
] %}
{% set ns = namespace(mods=[]) %}
{% for s in sensors %}
  {% set temp = states(s.entity) | float(0) | round(1) %}
  {% set unit = state_attr(s.entity, 'unit_of_measurement') | default('°') %}
  {% set color = '#f44336' if temp > 26 else ('#2196f3' if temp < 18 else '#4caf50') %}
  {% set mod = {
    'id': 'temp_' ~ loop.index,
    'type': 'text',
    'text': s.name ~ ':  ' ~ temp ~ unit,
    'color': color,
    'display_mode': 'always',
    'display_conditions': []
  } %}
  {% set ns.mods = ns.mods + [mod] %}
{% endfor %}
{{ ns.mods | tojson }}`;

const EXAMPLE_CPU_MEMORY = `{# CPU & Memory bars — red above 80%, orange above 50% #}
{% set sensors = [
  {'entity': 'sensor.processor_use',    'name': 'CPU'},
  {'entity': 'sensor.memory_use_percent','name': 'Memory'},
  {'entity': 'sensor.disk_use_percent', 'name': 'Disk'}
] %}
{% set ns = namespace(mods=[]) %}
{% for s in sensors %}
  {% set val = states(s.entity) | float(0) | round(1) %}
  {% set color = '#f44336' if val > 80 else ('#ff9800' if val > 50 else '#4caf50') %}
  {% set mod = {
    'id': 'sys_' ~ loop.index,
    'type': 'bar',
    'entity': s.entity,
    'name': s.name ~ ' — ' ~ val ~ '%',
    'bar_color': color,
    'display_mode': 'always',
    'display_conditions': []
  } %}
  {% set ns.mods = ns.mods + [mod] %}
{% endfor %}
{{ ns.mods | tojson }}`;

// ─── Shared card styles for example blocks ────────────────────────────────────
const EXAMPLE_HEADER_STYLE = `
  background: rgba(var(--rgb-primary-color, 33,150,243), 0.1);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;
const EXAMPLE_PRE_STYLE = `
  margin: 0;
  padding: 12px 14px;
  font-size: 11px;
  line-height: 1.6;
  background: var(--code-editor-background-color, #1e1e1e);
  color: var(--code-editor-text-color, #d4d4d4);
  font-family: 'Fira Code', Consolas, monospace;
  overflow-x: auto;
  white-space: pre-wrap;
`;
const USE_BTN_STYLE = `
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
`;

export class UltraDynamicListModule extends BaseUltraModule {
  private _templateService: TemplateService | null = null;

  private _hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash).toString(36);
  }

  metadata: ModuleMetadata = {
    type: 'dynamic-list',
    title: 'Dynamic List',
    description: 'Generate a list of modules dynamically using a Jinja2 template',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:code-braces',
    category: 'layout',
    tags: ['dynamic', 'template', 'jinja2', 'list', 'loop', 'layout'],
  };

  createDefault(id?: string): DynamicListModule {
    return {
      id: id || this.generateId('dynamic-list'),
      type: 'dynamic-list',
      dynamic_template: EXAMPLE_DOORS_WINDOWS,
      direction: 'horizontal',
      gap: 8,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const dynModule = module as DynamicListModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">

        <!-- Template Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:code-braces" style="--mdc-icon-size: 20px;"></ha-icon>
            Jinja2 Template
          </div>
          <div
            class="field-description"
            style="font-size: 12px; margin-bottom: 16px; color: var(--secondary-text-color); line-height: 1.5;"
          >
            Write a Jinja2 template that outputs a <strong>JSON array</strong> of module config
            objects using <code>| tojson</code>. Each object must have a unique
            <code>id</code>, a <code>type</code> (e.g. <code>text</code>, <code>icon</code>,
            <code>bar</code>), and any fields that module supports.
          </div>
          <div class="field-group">
            <div
              class="field-title"
              style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
            >
              ${localize('editor.dynamic_list.template_label', lang, 'Template')}
            </div>
            <div
              @mousedown=${(e: Event) => {
                const target = e.target as HTMLElement;
                if (!target.closest('ultra-template-editor') && !target.closest('.cm-editor')) {
                  e.stopPropagation();
                }
              }}
              @dragstart=${(e: Event) => e.stopPropagation()}
            >
              <ultra-template-editor
                .hass=${hass}
                .value=${dynModule.dynamic_template || ''}
                .placeholder=${EXAMPLE_DOORS_WINDOWS}
                .minHeight=${220}
                .maxHeight=${500}
                @value-changed=${(e: CustomEvent) => {
                  updateModule({ dynamic_template: e.detail.value } as Partial<CardModule>);
                }}
              ></ultra-template-editor>
            </div>
          </div>
        </div>

        <!-- Layout Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            Layout
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ direction: dynModule.direction || 'vertical' }}
              .schema=${[
                {
                  name: 'direction',
                  label: localize('editor.dynamic_list.direction', lang, 'Direction'),
                  description: localize(
                    'editor.dynamic_list.direction_desc',
                    lang,
                    'How generated modules are stacked'
                  ),
                  selector: {
                    select: {
                      options: [
                        { value: 'vertical', label: 'Vertical (stacked)' },
                        { value: 'horizontal', label: 'Horizontal (side by side)' },
                      ],
                    },
                  },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ direction: e.detail.value.direction } as Partial<CardModule>)}
            ></ha-form>
          </div>

          <div class="field-group">
            <ha-form
              .hass=${hass}
              .data=${{ gap: dynModule.gap ?? 8 }}
              .schema=${[
                {
                  name: 'gap',
                  label: localize('editor.dynamic_list.gap', lang, 'Gap (px)'),
                  description: localize(
                    'editor.dynamic_list.gap_desc',
                    lang,
                    'Space between generated modules in pixels'
                  ),
                  selector: {
                    number: { min: 0, max: 64, step: 1, unit_of_measurement: 'px', mode: 'slider' },
                  },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ gap: e.detail.value.gap } as Partial<CardModule>)}
            ></ha-form>
          </div>
        </div>

        <!-- Examples Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px;"
          >
            Examples
          </div>
          <div class="field-description" style="font-size: 12px; margin-bottom: 16px; color: var(--secondary-text-color); line-height: 1.5;">
            Click <strong>Use</strong> to load an example into the editor above, then swap in your own entity IDs. Each example is fully working — just replace the entity names.
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">

            ${([
              { title: 'Doors & Windows', desc: 'Binary sensors — icon changes open/closed, color-coded green/red', tpl: EXAMPLE_DOORS_WINDOWS },
              { title: 'Tire Pressure', desc: 'Bar per wheel — red if under/over-inflated, orange near threshold', tpl: EXAMPLE_TIRE_PRESSURE },
              { title: 'Lights', desc: 'Icon per light — shows dimmer % when on, grey when off', tpl: EXAMPLE_LIGHTS },
              { title: 'Temperature Sensors', desc: 'Text per sensor — blue when cold, red when hot, green when comfortable', tpl: EXAMPLE_TEMPERATURE },
              { title: 'CPU / Memory / Disk', desc: 'Bar per system metric — color shifts at 50% and 80%', tpl: EXAMPLE_CPU_MEMORY },
            ] as const).map(ex => html`
              <details style="border: 1px solid var(--divider-color); border-radius: 8px; overflow: hidden;">
                <summary style="${EXAMPLE_HEADER_STYLE} list-style: none; cursor: pointer;">
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 13px; font-weight: 600; color: var(--primary-text-color);">${ex.title}</div>
                    <div style="font-size: 11px; color: var(--secondary-text-color); margin-top: 2px;">${ex.desc}</div>
                  </div>
                  <button
                    style="${USE_BTN_STYLE}"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      updateModule({ dynamic_template: ex.tpl } as Partial<CardModule>);
                    }}
                  >Use</button>
                </summary>
                <pre style="${EXAMPLE_PRE_STYLE}">${ex.tpl}</pre>
              </details>
            `)}

          </div>
        </div>

        <!-- Reference / Key Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px;"
          >
            Reference & Key
          </div>
          <div class="field-description" style="font-size: 12px; margin-bottom: 16px; color: var(--secondary-text-color); line-height: 1.5;">
            Every template follows the same three-step pattern. Below is a complete reference for beginners and advanced users.
          </div>

          <!-- Pattern -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-text-color); margin-bottom: 8px;">The 3-step pattern</div>
            <pre style="${EXAMPLE_PRE_STYLE}">{% set ns = namespace(mods=[]) %}    {# Step 1 — create an empty list #}
{% for item in my_list %}              {# Step 2 — loop over your data  #}
  {% set mod = { 'id': 'mod_' ~ loop.index, 'type': 'text', 'text': item } %}
  {% set ns.mods = ns.mods + [mod] %}
{% endfor %}
{{ ns.mods | tojson }}                {# Step 3 — output as JSON        #}</pre>
          </div>

          <!-- Jinja2 helpers -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-text-color); margin-bottom: 8px;">Jinja2 helpers</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              ${([
                ['states(entity)', 'Current state string, e.g. "on", "22.5"'],
                ['state_attr(entity, attr)', 'Single attribute, e.g. brightness, friendly_name'],
                ['is_state(entity, value)', 'Returns true/false — great for if conditions'],
                ['loop.index', '1-based counter inside a {% for %} loop'],
                ['loop.index0', '0-based counter inside a {% for %} loop'],
                ['value | float(0)', 'Convert state to number, fallback 0 if unavailable'],
                ['value | round(1)', 'Round to 1 decimal place'],
                ['value | title', 'Capitalise first letter — "on" → "On"'],
                ['value | default("N/A")', 'Use fallback if value is undefined/none'],
                ['A ~ B', 'Concatenate strings — equivalent to A + B'],
              ] as const).map(([k, v]) => html`
                <div style="background: rgba(0,0,0,0.15); border-radius: 6px; padding: 8px 10px;">
                  <code style="font-size: 11px; color: var(--primary-color); font-family: 'Fira Code', Consolas, monospace; display: block; margin-bottom: 3px;">${k}</code>
                  <span style="font-size: 11px; color: var(--secondary-text-color);">${v}</span>
                </div>
              `)}
            </div>
          </div>

          <!-- Module type fields -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-text-color); margin-bottom: 8px;">Module type fields</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">

              <details style="border: 1px solid var(--divider-color); border-radius: 6px; overflow: hidden;">
                <summary style="padding: 8px 12px; cursor: pointer; font-size: 12px; font-weight: 600; background: rgba(0,0,0,0.1); color: var(--primary-text-color); list-style: none;">
                  text — plain text with optional color
                </summary>
                <pre style="${EXAMPLE_PRE_STYLE}">{'id': 'unique_id', 'type': 'text',
 'text': 'Hello World',       {# required — the string to display     #}
 'color': '#4caf50',          {# optional — any CSS color             #}
 'display_mode': 'always', 'display_conditions': []}</pre>
              </details>

              <details style="border: 1px solid var(--divider-color); border-radius: 6px; overflow: hidden;">
                <summary style="padding: 8px 12px; cursor: pointer; font-size: 12px; font-weight: 600; background: rgba(0,0,0,0.1); color: var(--primary-text-color); list-style: none;">
                  icon — entity-linked icon with active/inactive states
                </summary>
                <pre style="${EXAMPLE_PRE_STYLE}">{'id': 'unique_id', 'type': 'icon',
 'icons': [{
   'id': 'icon_item_1',
   'icon_mode': 'entity',         {# 'entity' = HA-linked, 'static' = standalone #}
   'entity': 'binary_sensor.door',
   'name': 'Front Door',          {# label shown below/beside the icon            #}
   'icon_inactive': 'mdi:door-closed',
   'icon_active':   'mdi:door-open',
   'active_state':  'on',         {# state value that triggers the active style    #}
   'inactive_icon_color': '#4caf50',
   'active_icon_color':   '#f44336',
   'show_name_when_inactive': true, 'show_state_when_inactive': true,
   'show_name_when_active':   true, 'show_state_when_active':   true
 }],
 'display_mode': 'always', 'display_conditions': []}</pre>
              </details>

              <details style="border: 1px solid var(--divider-color); border-radius: 6px; overflow: hidden;">
                <summary style="padding: 8px 12px; cursor: pointer; font-size: 12px; font-weight: 600; background: rgba(0,0,0,0.1); color: var(--primary-text-color); list-style: none;">
                  bar — horizontal progress bar
                </summary>
                <pre style="${EXAMPLE_PRE_STYLE}">{'id': 'unique_id', 'type': 'bar',
 'entity': 'sensor.cpu_percent',  {# entity whose state drives the bar value  #}
 'name':   'CPU',                 {# label shown above the bar                #}
 'bar_color': '#4caf50',          {# optional — bar fill color                #}
 'display_mode': 'always', 'display_conditions': []}</pre>
              </details>

            </div>
          </div>

          <!-- Common required fields -->
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--primary-text-color); margin-bottom: 8px;">Fields every module needs</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              ${([
                ['id', 'Must be unique per item — use loop.index to guarantee this'],
                ['type', 'Module type: text, icon, bar, gauge, markdown …'],
                ['display_mode', 'Always set to "always" unless using visibility conditions'],
                ['display_conditions', 'Always set to [] unless using visibility conditions'],
              ] as const).map(([k, v]) => html`
                <div style="background: rgba(0,0,0,0.15); border-radius: 6px; padding: 8px 10px;">
                  <code style="font-size: 11px; color: var(--primary-color); font-family: 'Fira Code', Consolas, monospace; display: block; margin-bottom: 3px;">${k}</code>
                  <span style="font-size: 11px; color: var(--secondary-text-color);">${v}</span>
                </div>
              `)}
            </div>
          </div>

        </div>

      </div>
    `;
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    _config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as any, hass, updates => updateModule(updates));
  }

  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    _config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const dynModule = module as DynamicListModule;

    if (!dynModule.dynamic_template || dynModule.dynamic_template.trim() === '') {
      return this.renderGradientErrorState(
        'Add a Jinja2 Template',
        'Enter a template in the General tab to generate modules dynamically',
        'mdi:code-braces'
      );
    }

    if (!hass) {
      return this.renderGradientErrorState(
        'Waiting for Home Assistant',
        'This module requires a live connection',
        'mdi:loading'
      );
    }

    // Initialize template service
    if (!this._templateService) {
      this._templateService = new TemplateService(hass);
    }

    if (!hass.__uvc_template_strings) {
      hass.__uvc_template_strings = {};
    }

    const processedTemplate = preprocessTemplateVariables(
      dynModule.dynamic_template,
      hass,
      config
    );
    const templateHash = this._hashString(processedTemplate);
    const templateKey = `layout_mods_dynlist_${dynModule.id}_${templateHash}`;

    if (!this._templateService.hasTemplateSubscription(templateKey)) {
      this._templateService.subscribeToTemplate(
        processedTemplate,
        templateKey,
        () => {
          if (typeof window !== 'undefined') {
            if (!window._ultraCardUpdateTimer) {
              window._ultraCardUpdateTimer = setTimeout(() => {
                window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                window._ultraCardUpdateTimer = null;
              }, 50);
            }
          }
        },
        {},
        config
      );
    }

    const raw = hass.__uvc_template_strings?.[templateKey];

    if (!raw) {
      return html`
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            color: var(--secondary-text-color);
            font-size: 13px;
          "
        >
          <ha-icon icon="mdi:loading" style="--mdc-icon-size: 16px; animation: spin 1s linear infinite;"></ha-icon>
          Evaluating template…
        </div>
      `;
    }

    let generatedModules: CardModule[] = [];
    // HA's WebSocket may return the result as an already-parsed JS array/object
    // (when the template output is valid JSON, HA deserializes it before sending).
    // Handle both cases: raw array/object and raw JSON string.
    if (Array.isArray(raw)) {
      generatedModules = raw as CardModule[];
    } else if (raw !== null && typeof raw === 'object') {
      // Shouldn't happen for a list template, but guard anyway
      generatedModules = [];
    } else {
      try {
        const parsed = JSON.parse(String(raw).trim());
        generatedModules = Array.isArray(parsed) ? (parsed as CardModule[]) : [];
      } catch (e) {
        console.error('[UltraCard] Dynamic List: failed to parse template output:', raw, e);
        return this.renderGradientErrorState(
          'Invalid Template Output',
          'Template must output a JSON array. End your template with {{ ns.mods | tojson }}.',
          'mdi:alert-circle-outline'
        );
      }
    }

    if (generatedModules.length === 0) {
      return html`
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            color: var(--secondary-text-color);
            font-size: 13px;
          "
        >
          <ha-icon icon="mdi:playlist-remove" style="--mdc-icon-size: 16px;"></ha-icon>
          Template returned an empty list
        </div>
      `;
    }

    const registry = getModuleRegistry();
    const direction = dynModule.direction || 'vertical';
    const gap = dynModule.gap ?? 8;

    const renderedModules = generatedModules.map(childModule => {
      // Evaluate child visibility
      const shouldShow = logicService.evaluateModuleVisibility(childModule);
      if (!shouldShow) return html``;

      const moduleHandler = registry.getModule(childModule.type);
      if (!moduleHandler) {
        return html`<div style="font-size:11px; color: var(--warning-color); padding: 4px;">Unknown module type: ${childModule.type}</div>`;
      }

      // Check Pro access for generated child modules
      const isProModule =
        moduleHandler.metadata?.tags?.includes('pro') ||
        moduleHandler.metadata?.tags?.includes('premium') ||
        false;

      let hasProAccess = false;
      const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
      if (
        integrationUser?.subscription?.tier === 'pro' &&
        integrationUser?.subscription?.status === 'active'
      ) {
        hasProAccess = true;
      } else if (ucCloudAuthService.isAuthenticated()) {
        const cloudUser = ucCloudAuthService.getCurrentUser();
        if (
          cloudUser?.subscription?.tier === 'pro' &&
          cloudUser?.subscription?.status === 'active'
        ) {
          hasProAccess = true;
        }
      }

      if (isProModule && !hasProAccess) {
        return html`<div style="font-size:11px; color: var(--warning-color); padding: 4px;">🔒 Pro module</div>`;
      }

      return moduleHandler.renderPreview(childModule, hass, config, previewContext);
    });

    return html`
      <div
        style="
          display: flex;
          flex-direction: ${direction === 'horizontal' ? 'row' : 'column'};
          gap: ${gap}px;
          width: 100%;
        "
      >
        ${renderedModules}
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const dynModule = module as DynamicListModule;
    const errors: string[] = [];
    if (!dynModule.dynamic_template || dynModule.dynamic_template.trim() === '') {
      errors.push('dynamic_template is required');
    }
    return { valid: errors.length === 0, errors };
  }
}

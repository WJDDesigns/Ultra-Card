import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, DynamicListModule, DynamicListActionSource, TodoItemTemplate, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { TemplateService } from '../services/template-service';
import { UltraCardTodoService, TodoItem } from '../services/uc-todo-service';
import { preprocessTemplateVariables } from '../utils/uc-template-processor';
import { computeMultiEntitySignature } from '../utils/template-context';
import { getModuleRegistry } from './module-registry';
import { logicService } from '../services/logic-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { ucModulePreviewService } from '../services/uc-module-preview-service';
import { localize } from '../localize/localize';
import { autoMigrateCardModule } from '../utils/template-migration';

import '../components/ultra-template-editor';
import '../components/ultra-color-picker';

// ─── Todo-template example ────────────────────────────────────────────────────
const EXAMPLE_TODO_TEMPLATE = `{# Todo Template — full control over how each item renders.
   Available variables:
     items   — list of todo item objects with keys:
                 summary, status, due, description, uid, entity_id
   Output a JSON array of module configs via | tojson. #}
{% set ns = namespace(mods=[]) %}
{% for item in items %}
  {% set is_done = item.status == 'completed' %}
  {% set color = '#9e9e9e' if is_done else 'var(--primary-text-color)' %}
  {% set icon  = 'mdi:checkbox-marked-circle' if is_done else 'mdi:checkbox-blank-circle-outline' %}
  {% set label = item.summary ~ (' ✓' if is_done else '') %}
  {% set label = label ~ (' — ' ~ item.due if item.due else '') %}
  {% set mod = {
    'id': 'todo_tpl_' ~ loop.index,
    'type': 'text',
    'text': label,
    'color': color,
    'icon': icon,
    'icon_position': 'before',
    'display_mode': 'always', 'display_conditions': []
  } %}
  {% set ns.mods = ns.mods + [mod] %}
{% endfor %}
{{ ns.mods | tojson }}`;

// ─── Action-source example ────────────────────────────────────────────────────
const EXAMPLE_ACTION_TEMPLATE = `{# Action Template — build modules from a HA service response.
   'response' holds the raw return value of your configured action.
   For todo.get_items with entity_id 'todo.shopping' the structure is:
     response['todo.shopping']['items']  — list of items

   Adapt the path below to match your own service response shape. #}
{% set entity = 'todo.shopping' %}
{% set raw = response.get(entity, {}).get('items', []) %}
{% set ns = namespace(mods=[]) %}
{% for item in raw %}
  {% set is_done = item.status == 'completed' %}
  {% set mod = {
    'id': 'act_' ~ loop.index,
    'type': 'text',
    'text': item.summary ~ (' ✓' if is_done else ''),
    'color': '#4caf50' if is_done else 'var(--primary-text-color)',
    'display_mode': 'always', 'display_conditions': []
  } %}
  {% set ns.mods = ns.mods + [mod] %}
{% endfor %}
{{ ns.mods | tojson }}`;

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

// ─── Pagination / show-more button styles ─────────────────────────────────────
const BTN_STYLE = `
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 8px 12px;
  background: rgba(var(--rgb-primary-color, 33,150,243), 0.12);
  color: var(--primary-color);
  border: 1px solid rgba(var(--rgb-primary-color, 33,150,243), 0.3);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;
const PAGE_BAR_STYLE = `
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 4px 0;
`;
const PAGE_BTN_STYLE = `
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--rgb-primary-color, 33,150,243), 0.12);
  color: var(--primary-color);
  border: 1px solid rgba(var(--rgb-primary-color, 33,150,243), 0.3);
  border-radius: 6px;
  padding: 4px;
  cursor: pointer;
`;

export class UltraDynamicListModule extends BaseUltraModule {
  private _templateService: TemplateService | null = null;
  private _todoService: UltraCardTodoService | null = null;
  private _prevHass: HomeAssistant | null = null;
  // Per-module-instance state for show-more and pagination
  private _expandedModules: Map<string, boolean> = new Map();
  private _currentPage: Map<string, number> = new Map();
  // Action source: cache & debounce timer per module id
  private _actionCache: Map<string, unknown> = new Map();
  private _actionFetching: Set<string> = new Set();
  private _actionTimers: Map<string, ReturnType<typeof setInterval>> = new Map();

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
      source_type: 'template',
      dynamic_template: EXAMPLE_DOORS_WINDOWS,
      todo_entity: undefined,
      todo_entities: [],
      todo_statuses: [],
      todo_item_template: {
        module_type: 'text',
        primary_field: 'summary',
        secondary_field: 'due',
        icon: 'mdi:checkbox-marked-circle-outline',
      },
      todo_dynamic_template: EXAMPLE_TODO_TEMPLATE,
      action_source: { domain: 'todo', service: 'get_items', service_data: {}, watch_entities: [], refresh_interval: 0 },
      action_template: EXAMPLE_ACTION_TEMPLATE,
      direction: 'horizontal',
      gap: 8,
      wrap: true,
      columns: 4,
      rows: 0,
      limit: 0,
      limit_behavior: 'show_more',
      align_h: 'center',
      align_v: 'center',
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

    const sourceType = (() => {
      const raw = String(dynModule.source_type || 'template').toLowerCase();
      if (raw === 'todo') return 'todo';
      if (raw === 'todo-template') return 'todo-template';
      if (raw === 'action') return 'action';
      return 'template';
    })();
    const isTodo = sourceType === 'todo';
    const isTodoTemplate = sourceType === 'todo-template';
    const isAction = sourceType === 'action';
    const isTemplate = sourceType === 'template';
    const todoTpl = dynModule.todo_item_template || {
      module_type: 'text',
      primary_field: 'summary',
      secondary_field: 'due',
      icon: 'mdi:checkbox-marked-circle-outline',
    };

    return html`
      ${this.injectUcFormStyles()}
      <style>
        .dynamic-list-editor ha-form { display: block; }
        .dynamic-list-editor ha-form .form-group { margin-bottom: 8px; }
        .dynamic-list-editor ha-form ha-select,
        .dynamic-list-editor ha-form .mdc-select { min-height: 40px; height: auto; }
        .dynamic-list-editor ha-form ha-select .mdc-select__anchor { min-height: 40px; }
      </style>
      <div class="module-general-settings ultra-clean-form dynamic-list-editor">

        <!-- Source type: Template vs Todo List (dropdown) -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 12px; letter-spacing: 0.5px;"
          >
            Source
          </div>
          <div class="field-group" style="margin-bottom: 0;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">List source</label>
            <ha-selector
              .hass=${hass}
              .selector=${{ select: { options: [
                { value: 'template', label: 'Jinja2 Template' },
                { value: 'todo', label: 'Todo List (field mapping)' },
                { value: 'todo-template', label: 'Todo List + Jinja2 Template' },
                { value: 'action', label: 'HA Action / Service call' },
              ] } }}
              .value=${sourceType}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ source_type: (e.detail.value || 'template') as 'template' | 'todo' | 'todo-template' | 'action' } as Partial<CardModule>)}
            ></ha-selector>
          </div>
        </div>

        ${isTodo ? html`
        <!-- ── Todo List (field mapping) source ─────────────────────────────── -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:format-list-checks" style="--mdc-icon-size: 20px;"></ha-icon>
            Todo List
          </div>
          <div
            class="field-description"
            style="font-size: 12px; margin-bottom: 12px; color: var(--secondary-text-color); line-height: 1.5;"
          >
            Use one or more to-do list entities (e.g. Local Todo, M365). Items are fetched via <code>todo.get_items</code>. Combine multiple lists (e.g. M365 sub-lists) by adding them in "Also include".
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Todo list</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: '', label: 'Default (first available)' },
                    ...(hass.states
                      ? Object.keys(hass.states)
                          .filter((id) => id.startsWith('todo.'))
                          .map((id) => ({
                            value: id,
                            label: (hass.states[id]?.attributes?.friendly_name as string) || id,
                          }))
                      : []),
                  ],
                },
              }}
              .value=${dynModule.todo_entity ?? ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ todo_entity: (e.detail.value || undefined) as string | undefined } as Partial<CardModule>)}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Also include</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  multiple: true,
                  options: [
                    { value: '', label: 'Default (first available)' },
                    ...(hass.states
                      ? Object.keys(hass.states)
                          .filter((id) => id.startsWith('todo.'))
                          .map((id) => ({
                            value: id,
                            label: (hass.states[id]?.attributes?.friendly_name as string) || id,
                          }))
                      : []),
                  ],
                },
              }}
              .value=${dynModule.todo_entities || []}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ todo_entities: Array.isArray(e.detail.value) ? e.detail.value : [] } as Partial<CardModule>)}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Show statuses</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'both', label: 'Both' },
                    { value: 'needs_action', label: 'Needs action only' },
                    { value: 'completed', label: 'Completed only' },
                  ],
                },
              }}
              .value=${(() => {
                const s = dynModule.todo_statuses || [];
                if (s.length === 0 || s.length === 2) return 'both';
                return s[0] === 'completed' ? 'completed' : 'needs_action';
              })()}
              @value-changed=${(e: CustomEvent) => {
                const v = e.detail.value;
                const statuses: ('needs_action' | 'completed')[] =
                  v === 'both' ? [] : v === 'completed' ? ['completed'] : ['needs_action'];
                updateModule({ todo_statuses: statuses } as Partial<CardModule>);
              }}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 8px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Item display</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'text', label: 'Text (primary + secondary)' },
                    { value: 'icon', label: 'Icon' },
                    { value: 'bar', label: 'Bar' },
                  ],
                },
              }}
              .value=${todoTpl.module_type || 'text'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({
                  todo_item_template: { ...todoTpl, module_type: (e.detail.value || 'text') as 'text' | 'icon' | 'bar' },
                } as Partial<CardModule>)}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 8px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Primary field</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'summary', label: 'Summary' },
                    { value: 'description', label: 'Description' },
                    { value: 'due', label: 'Due date' },
                    { value: 'status', label: 'Status' },
                  ],
                },
              }}
              .value=${todoTpl.primary_field || 'summary'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({
                  todo_item_template: { ...todoTpl, primary_field: (e.detail.value || 'summary') as TodoItemTemplate['primary_field'] },
                } as Partial<CardModule>)}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 8px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Secondary field</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'none', label: 'None' },
                    { value: 'summary', label: 'Summary' },
                    { value: 'description', label: 'Description' },
                    { value: 'due', label: 'Due date' },
                    { value: 'status', label: 'Status' },
                  ],
                },
              }}
              .value=${todoTpl.secondary_field ?? 'due'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({
                  todo_item_template: { ...todoTpl, secondary_field: (e.detail.value === 'none' ? undefined : e.detail.value) as TodoItemTemplate['secondary_field'] },
                } as Partial<CardModule>)}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon (default / fallback)</label>
            <ha-icon-picker
              .hass=${hass}
              .value=${todoTpl.icon || 'mdi:checkbox-marked-circle-outline'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({
                  todo_item_template: { ...todoTpl, icon: e.detail.value || 'mdi:checkbox-marked-circle-outline' },
                } as Partial<CardModule>)}
            ></ha-icon-picker>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon when incomplete</label>
            <ha-icon-picker
              .hass=${hass}
              .value=${todoTpl.icon_incomplete ?? todoTpl.icon ?? 'mdi:checkbox-marked-circle-outline'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({
                  todo_item_template: { ...todoTpl, icon_incomplete: e.detail.value || undefined },
                } as Partial<CardModule>)}
            ></ha-icon-picker>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon color when incomplete</label>
            <ultra-color-picker
              .hass=${hass}
              .value=${todoTpl.icon_color_incomplete ?? ''}
              .defaultValue=${'var(--secondary-text-color)'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({
                  todo_item_template: { ...todoTpl, icon_color_incomplete: e.detail.value ?? undefined },
                } as Partial<CardModule>)}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon when completed</label>
            <ha-icon-picker
              .hass=${hass}
              .value=${todoTpl.icon_completed ?? todoTpl.icon ?? 'mdi:checkbox-marked-circle'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({
                  todo_item_template: { ...todoTpl, icon_completed: e.detail.value || undefined },
                } as Partial<CardModule>)}
            ></ha-icon-picker>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon color when completed</label>
            <ultra-color-picker
              .hass=${hass}
              .value=${todoTpl.icon_color_completed ?? ''}
              .defaultValue=${'var(--primary-color)'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({
                  todo_item_template: { ...todoTpl, icon_color_completed: e.detail.value ?? undefined },
                } as Partial<CardModule>)}
            ></ultra-color-picker>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Icon position</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'before', label: 'Before text' },
                    { value: 'after', label: 'After text' },
                    { value: 'none', label: 'None (hide icon)' },
                  ],
                },
              }}
              .value=${todoTpl.icon_position ?? 'before'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({
                  todo_item_template: { ...todoTpl, icon_position: (e.detail.value || 'before') as 'before' | 'after' | 'none' },
                } as Partial<CardModule>)}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Text alignment</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                    { value: 'justify', label: 'Justify' },
                  ],
                },
              }}
              .value=${todoTpl.alignment ?? 'left'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({
                  todo_item_template: { ...todoTpl, alignment: (e.detail.value || 'left') as 'left' | 'center' | 'right' | 'justify' },
                } as Partial<CardModule>)}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <ha-form
              .hass=${hass}
              .data=${{ allow_tap_to_complete: todoTpl.allow_tap_to_complete === true }}
              .schema=${[
                {
                  name: 'allow_tap_to_complete',
                  label: 'Allow tap to complete',
                  description: 'Tap a row to toggle completed/needs action (shows checkbox icon; tap toggles status).',
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({
                  todo_item_template: { ...todoTpl, allow_tap_to_complete: e.detail.value?.allow_tap_to_complete === true },
                } as Partial<CardModule>)}
            ></ha-form>
          </div>
          <div
            class="field-description"
            style="font-size: 11px; margin-top: 12px; padding: 8px; background: rgba(0,0,0,0.15); border-radius: 6px; color: var(--secondary-text-color); line-height: 1.4;"
          >
            <strong>Description JSON (Local Todo, etc.):</strong> You can put JSON in an item’s description to override display or define multiple modules. Object (e.g. <code>{"color": "#f00", "text": "Custom"}</code>) is merged into the row. Array of module configs shows multiple modules for that one item.
          </div>
        </div>

        ` : isTodoTemplate ? html`
        <!-- ── Todo List + Jinja2 Template source ────────────────────────────── -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:format-list-checks" style="--mdc-icon-size: 20px;"></ha-icon>
            Todo List
          </div>
          <div
            class="field-description"
            style="font-size: 12px; margin-bottom: 12px; color: var(--secondary-text-color); line-height: 1.5;"
          >
            Choose one or more todo lists. Items are fetched and injected into your template as <code>items</code> — a list of objects with keys <code>summary</code>, <code>status</code>, <code>due</code>, <code>description</code>, <code>uid</code>, and <code>entity_id</code>.
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Todo list</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: '', label: 'Default (first available)' },
                    ...(hass.states
                      ? Object.keys(hass.states)
                          .filter((id) => id.startsWith('todo.'))
                          .map((id) => ({
                            value: id,
                            label: (hass.states[id]?.attributes?.friendly_name as string) || id,
                          }))
                      : []),
                  ],
                },
              }}
              .value=${dynModule.todo_entity ?? ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ todo_entity: (e.detail.value || undefined) as string | undefined } as Partial<CardModule>)}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 12px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Also include</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  multiple: true,
                  options: [
                    { value: '', label: 'Default (first available)' },
                    ...(hass.states
                      ? Object.keys(hass.states)
                          .filter((id) => id.startsWith('todo.'))
                          .map((id) => ({
                            value: id,
                            label: (hass.states[id]?.attributes?.friendly_name as string) || id,
                          }))
                      : []),
                  ],
                },
              }}
              .value=${dynModule.todo_entities || []}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ todo_entities: Array.isArray(e.detail.value) ? e.detail.value : [] } as Partial<CardModule>)}
            ></ha-selector>
          </div>
          <div class="field-group" style="margin-bottom: 0;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Show statuses</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'both', label: 'Both' },
                    { value: 'needs_action', label: 'Needs action only' },
                    { value: 'completed', label: 'Completed only' },
                  ],
                },
              }}
              .value=${(() => {
                const s = dynModule.todo_statuses || [];
                if (s.length === 0 || s.length === 2) return 'both';
                return s[0] === 'completed' ? 'completed' : 'needs_action';
              })()}
              @value-changed=${(e: CustomEvent) => {
                const v = e.detail.value;
                const statuses: ('needs_action' | 'completed')[] =
                  v === 'both' ? [] : v === 'completed' ? ['completed'] : ['needs_action'];
                updateModule({ todo_statuses: statuses } as Partial<CardModule>);
              }}
            ></ha-selector>
          </div>
        </div>

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
            Write a Jinja2 template that receives <code>items</code> (your fetched todo items) and outputs a <strong>JSON array</strong> of module configs via <code>| tojson</code>. Each item has: <code>summary</code>, <code>status</code>, <code>due</code>, <code>description</code>, <code>uid</code>, <code>entity_id</code>.
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Template</div>
            <div
              @mousedown=${(e: Event) => {
                const target = e.target as HTMLElement;
                if (!target.closest('ultra-template-editor') && !target.closest('.cm-editor')) e.stopPropagation();
              }}
              @dragstart=${(e: Event) => e.stopPropagation()}
            >
              <ultra-template-editor
                .hass=${hass}
                .value=${dynModule.todo_dynamic_template || ''}
                .placeholder=${EXAMPLE_TODO_TEMPLATE}
                .minHeight=${220}
                .maxHeight=${500}
                @value-changed=${(e: CustomEvent) =>
                  updateModule({ todo_dynamic_template: e.detail.value } as Partial<CardModule>)}
              ></ultra-template-editor>
            </div>
          </div>
        </div>

        ` : isAction ? html`
        <!-- ── Action / Service source ───────────────────────────────────────── -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:lightning-bolt" style="--mdc-icon-size: 20px;"></ha-icon>
            Action / Service Call
          </div>
          <div
            class="field-description"
            style="font-size: 12px; margin-bottom: 12px; color: var(--secondary-text-color); line-height: 1.5;"
          >
            Call any HA service with <code>return_response: true</code>. The response is injected into your template as <code>response</code>. Use <strong>Watch entities</strong> to re-fetch when state changes, or set a <strong>Refresh interval</strong> for periodic polling.
          </div>

          ${((): TemplateResult => {
            const act: DynamicListActionSource = dynModule.action_source || { domain: '', service: '', service_data: {}, watch_entities: [], refresh_interval: 0 };
            const updateAction = (patch: Partial<DynamicListActionSource>) =>
              updateModule({ action_source: { ...act, ...patch } } as Partial<CardModule>);
            return html`
              <div class="field-group" style="margin-bottom: 12px;">
                <ha-form
                  .hass=${hass}
                  .data=${{ domain: act.domain || '', service: act.service || '' }}
                  .schema=${[
                    { name: 'domain', label: 'Domain', description: 'e.g. todo, weather, calendar', selector: { text: {} } },
                    { name: 'service', label: 'Service', description: 'e.g. get_items, get_forecasts', selector: { text: {} } },
                  ]}
                  .computeLabel=${(s: any) => s.label || s.name}
                  .computeDescription=${(s: any) => s.description || ''}
                  @value-changed=${(e: CustomEvent) => {
                    if (e.detail.value?.domain !== undefined) updateAction({ domain: e.detail.value.domain });
                    if (e.detail.value?.service !== undefined) updateAction({ service: e.detail.value.service });
                  }}
                ></ha-form>
              </div>
              <div class="field-group" style="margin-bottom: 12px;">
                <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Service data (JSON)</label>
                <div class="field-description" style="font-size: 11px; color: var(--secondary-text-color); margin-bottom: 8px;">
                  Passed as <code>service_data</code>. You may use <code>$variable</code> syntax. E.g. <code>{"entity_id": "todo.shopping"}</code>
                </div>
                <ultra-template-editor
                  .hass=${hass}
                  .value=${JSON.stringify(act.service_data ?? {}, null, 2)}
                  .placeholder=${'{\n  "entity_id": "todo.shopping"\n}'}
                  .minHeight=${80}
                  .maxHeight=${200}
                  @value-changed=${(e: CustomEvent) => {
                    try {
                      const parsed = JSON.parse(e.detail.value || '{}');
                      updateAction({ service_data: typeof parsed === 'object' && parsed !== null ? parsed : {} });
                    } catch { /* keep previous value until JSON is valid */ }
                  }}
                ></ultra-template-editor>
              </div>
              <div class="field-group" style="margin-bottom: 12px;">
                <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 6px;">Watch entities (state changed refresh)</label>
                <ha-selector
                  .hass=${hass}
                  .selector=${{ entity: { multiple: true } }}
                  .value=${act.watch_entities || []}
                  @value-changed=${(e: CustomEvent) =>
                    updateAction({ watch_entities: Array.isArray(e.detail.value) ? e.detail.value : [] })}
                ></ha-selector>
              </div>
              <div class="field-group" style="margin-bottom: 0;">
                <ha-form
                  .hass=${hass}
                  .data=${{ refresh_interval: act.refresh_interval ?? 0 }}
                  .schema=${[{
                    name: 'refresh_interval',
                    label: 'Refresh interval (seconds)',
                    description: '0 = no polling (rely on watch entities only)',
                    selector: { number: { min: 0, max: 3600, step: 5, mode: 'box' } },
                  }]}
                  .computeLabel=${(s: any) => s.label || s.name}
                  .computeDescription=${(s: any) => s.description || ''}
                  @value-changed=${(e: CustomEvent) => updateAction({ refresh_interval: e.detail.value?.refresh_interval ?? 0 })}
                ></ha-form>
              </div>
            `;
          })()}
        </div>

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:code-braces" style="--mdc-icon-size: 20px;"></ha-icon>
            Result Template
          </div>
          <div
            class="field-description"
            style="font-size: 12px; margin-bottom: 16px; color: var(--secondary-text-color); line-height: 1.5;"
          >
            Write a Jinja2 template that processes <code>response</code> (the raw service response object) and outputs a <strong>JSON array</strong> of module configs via <code>| tojson</code>.
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Template</div>
            <div
              @mousedown=${(e: Event) => {
                const target = e.target as HTMLElement;
                if (!target.closest('ultra-template-editor') && !target.closest('.cm-editor')) e.stopPropagation();
              }}
              @dragstart=${(e: Event) => e.stopPropagation()}
            >
              <ultra-template-editor
                .hass=${hass}
                .value=${dynModule.action_template || ''}
                .placeholder=${EXAMPLE_ACTION_TEMPLATE}
                .minHeight=${220}
                .maxHeight=${500}
                @value-changed=${(e: CustomEvent) =>
                  updateModule({ action_template: e.detail.value } as Partial<CardModule>)}
              ></ultra-template-editor>
            </div>
          </div>
        </div>

        ` : html`
        <!-- ── Jinja2 Template source ─────────────────────────────────────────── -->
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
        `}

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
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">${localize('editor.dynamic_list.direction', lang, 'Direction')}</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'horizontal', label: 'Horizontal (side by side)' },
                    { value: 'vertical', label: 'Vertical (stacked)' },
                  ],
                },
              }}
              .value=${dynModule.direction || 'horizontal'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ direction: (e.detail.value || 'horizontal') as 'horizontal' | 'vertical' } as Partial<CardModule>)}
            ></ha-selector>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ wrap: dynModule.wrap !== false }}
              .schema=${[
                {
                  name: 'wrap',
                  label: 'Auto Wrap',
                  description: 'Automatically wrap items onto new rows or columns when they run out of space',
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ wrap: e.detail.value.wrap } as Partial<CardModule>)}
            ></ha-form>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ columns: dynModule.columns ?? 0 }}
              .schema=${[
                {
                  name: 'columns',
                  label: 'Columns',
                  description: (dynModule.direction || 'horizontal') === 'horizontal'
                    ? 'Columns per row — items fill left to right then wrap (0 = auto size)'
                    : 'Columns in the grid — items fill top to bottom per column (0 = single stack)',
                  selector: { number: { min: 0, max: 12, step: 1, mode: 'slider' } },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ columns: e.detail.value.columns } as Partial<CardModule>)}
            ></ha-form>
          </div>

          ${(dynModule.direction || 'horizontal') === 'horizontal' ? html`
          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ rows: dynModule.rows ?? 0 }}
              .schema=${[
                {
                  name: 'rows',
                  label: 'Max Rows',
                  description: 'Maximum rows in horizontal wrap layout (0 = unlimited). Works best with Columns set.',
                  selector: { number: { min: 0, max: 20, step: 1, mode: 'slider' } },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ rows: e.detail.value.rows } as Partial<CardModule>)}
            ></ha-form>
          </div>` : ''}

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ gap: dynModule.gap ?? 8 }}
              .schema=${[
                {
                  name: 'gap',
                  label: localize('editor.dynamic_list.gap', lang, 'Gap (px)'),
                  description: localize('editor.dynamic_list.gap_desc', lang, 'Space between generated modules in pixels'),
                  selector: { number: { min: 0, max: 64, step: 1, unit_of_measurement: 'px', mode: 'slider' } },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ gap: e.detail.value.gap } as Partial<CardModule>)}
            ></ha-form>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Horizontal Alignment</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'start', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'end', label: 'Right' },
                    { value: 'space-between', label: 'Space Between' },
                    { value: 'space-around', label: 'Space Around' },
                    { value: 'stretch', label: 'Stretch' },
                  ],
                },
              }}
              .value=${dynModule.align_h || 'center'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ align_h: (e.detail.value || 'center') as DynamicListModule['align_h'] } as Partial<CardModule>)}
            ></ha-selector>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Vertical Alignment</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'start', label: 'Top' },
                    { value: 'center', label: 'Center' },
                    { value: 'end', label: 'Bottom' },
                    { value: 'stretch', label: 'Stretch' },
                  ],
                },
              }}
              .value=${dynModule.align_v || 'center'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ align_v: (e.detail.value || 'center') as DynamicListModule['align_v'] } as Partial<CardModule>)}
            ></ha-selector>
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Sort by</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'default', label: 'Default (source order)' },
                    { value: 'summary', label: 'Summary / name (A–Z or Z–A)' },
                    { value: 'due', label: 'Due date (todo only)' },
                    { value: 'status', label: 'Status (todo: incomplete first/last)' },
                  ],
                },
              }}
              .value=${dynModule.sort_by ?? 'default'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ sort_by: (e.detail.value || 'default') as DynamicListModule['sort_by'] } as Partial<CardModule>)}
            ></ha-selector>
          </div>

          ${(dynModule.sort_by && dynModule.sort_by !== 'default') ? html`
          <div class="field-group" style="margin-bottom: 16px;">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Sort direction</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'asc', label: 'Ascending (A→Z, oldest first, incomplete first)' },
                    { value: 'desc', label: 'Descending (Z→A, newest first, completed first)' },
                  ],
                },
              }}
              .value=${dynModule.sort_direction ?? 'asc'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ sort_direction: (e.detail.value || 'asc') as DynamicListModule['sort_direction'] } as Partial<CardModule>)}
            ></ha-selector>
          </div>` : ''}

          <div class="field-group" style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ limit: dynModule.limit ?? 0 }}
              .schema=${[
                {
                  name: 'limit',
                  label: 'Show Only (items)',
                  description: 'Show only the first N items initially. 0 = show all. Set above 0 to enable Show More or Pagination.',
                  selector: { number: { min: 0, max: 100, step: 1, mode: 'slider' } },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ limit: e.detail.value.limit } as Partial<CardModule>)}
            ></ha-form>
          </div>

          ${(dynModule.limit ?? 0) > 0 ? html`
          <div class="field-group">
            <label class="field-title" style="display:block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">When limit reached</label>
            <ha-selector
              .hass=${hass}
              .selector=${{
                select: {
                  options: [
                    { value: 'show_more', label: 'Show More / Show Less button' },
                    { value: 'paginate', label: 'Paginate (prev / next)' },
                  ],
                },
              }}
              .value=${dynModule.limit_behavior || 'show_more'}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ limit_behavior: (e.detail.value || 'show_more') as 'show_more' | 'paginate' } as Partial<CardModule>)}
            ></ha-selector>
          </div>` : ''}
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

        <!-- Domain Cheat Sheet Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 4px; letter-spacing: 0.5px;"
          >
            Domain Cheat Sheet
          </div>
          <div class="field-description" style="font-size: 12px; margin-bottom: 16px; color: var(--secondary-text-color); line-height: 1.5;">
            These templates loop over <strong>every entity</strong> in a domain automatically — no hardcoded entity IDs needed. New entities appear on the card instantly. Replace <code>states.light</code> with any domain below.
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${([
              {
                domain: 'light',
                label: 'All Lights',
                icon_on: 'mdi:lightbulb',
                icon_off: 'mdi:lightbulb-outline',
                active_state: 'on',
                icon_color_on: '#ffc107',
                icon_color_off: '#9e9e9e',
              },
              {
                domain: 'switch',
                label: 'All Switches',
                icon_on: 'mdi:toggle-switch',
                icon_off: 'mdi:toggle-switch-off-outline',
                active_state: 'on',
                icon_color_on: '#4caf50',
                icon_color_off: '#9e9e9e',
              },
              {
                domain: 'binary_sensor',
                label: 'All Binary Sensors',
                icon_on: 'mdi:checkbox-marked-circle',
                icon_off: 'mdi:checkbox-blank-circle-outline',
                active_state: 'on',
                icon_color_on: '#f44336',
                icon_color_off: '#4caf50',
              },
              {
                domain: 'cover',
                label: 'All Covers (Blinds / Garage)',
                icon_on: 'mdi:window-shutter-open',
                icon_off: 'mdi:window-shutter',
                active_state: 'open',
                icon_color_on: '#ff9800',
                icon_color_off: '#4caf50',
              },
              {
                domain: 'fan',
                label: 'All Fans',
                icon_on: 'mdi:fan',
                icon_off: 'mdi:fan-off',
                active_state: 'on',
                icon_color_on: '#2196f3',
                icon_color_off: '#9e9e9e',
              },
              {
                domain: 'media_player',
                label: 'All Media Players',
                icon_on: 'mdi:play-circle',
                icon_off: 'mdi:stop-circle-outline',
                active_state: 'playing',
                icon_color_on: '#9c27b0',
                icon_color_off: '#9e9e9e',
              },
              {
                domain: 'climate',
                label: 'All Climate / Thermostats',
                icon_on: 'mdi:thermostat',
                icon_off: 'mdi:thermostat',
                active_state: 'heat',
                icon_color_on: '#f44336',
                icon_color_off: '#2196f3',
              },
              {
                domain: 'person',
                label: 'All People (Presence)',
                icon_on: 'mdi:home-account',
                icon_off: 'mdi:account-arrow-right',
                active_state: 'home',
                icon_color_on: '#4caf50',
                icon_color_off: '#9e9e9e',
              },
              {
                domain: 'sensor',
                label: 'All Sensors (text)',
                icon_on: '', icon_off: '', active_state: '', icon_color_on: '', icon_color_off: '',
              },
            ] as const).map(d => {
              const isSensor = d.domain === 'sensor';
              const tpl = isSensor
                ? `{% set ns = namespace(mods=[]) %}
{% for entity in states.${d.domain} %}
  {% set mod = {
    'id': '${d.domain}_' ~ loop.index,
    'type': 'text',
    'text': entity.name ~ ': ' ~ entity.state,
    'display_mode': 'always', 'display_conditions': []
  } %}
  {% set ns.mods = ns.mods + [mod] %}
{% endfor %}
{{ ns.mods | tojson }}`
                : `{% set ns = namespace(mods=[]) %}
{% for entity in states.${d.domain} %}
  {% set icon_item = {
    'id': '${d.domain}_ii_' ~ loop.index,
    'icon_mode': 'entity',
    'entity': entity.entity_id,
    'name': entity.name,
    'icon_inactive': '${d.icon_off}',
    'icon_active':   '${d.icon_on}',
    'active_state':  '${d.active_state}',
    'inactive_icon_color': '${d.icon_color_off}',
    'active_icon_color':   '${d.icon_color_on}',
    'show_name_when_inactive': true, 'show_state_when_inactive': true, 'show_icon_when_inactive': true,
    'show_name_when_active':   true, 'show_state_when_active':   true, 'show_icon_when_active':   true
  } %}
  {% set mod = {'id': '${d.domain}_' ~ loop.index, 'type': 'icon', 'icons': [icon_item], 'display_mode': 'always', 'display_conditions': []} %}
  {% set ns.mods = ns.mods + [mod] %}
{% endfor %}
{{ ns.mods | tojson }}`;

              return html`
                <details style="border: 1px solid var(--divider-color); border-radius: 8px; overflow: hidden;">
                  <summary style="${EXAMPLE_HEADER_STYLE} list-style: none; cursor: pointer;">
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-size: 13px; font-weight: 600; color: var(--primary-text-color);">${d.label}</div>
                      <div style="font-size: 11px; color: var(--secondary-text-color); margin-top: 2px;">
                        <code>states.${d.domain}</code>
                      </div>
                    </div>
                    <button
                      style="${USE_BTN_STYLE}"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        updateModule({ dynamic_template: tpl } as Partial<CardModule>);
                      }}
                    >Use</button>
                  </summary>
                  <pre style="${EXAMPLE_PRE_STYLE}">${tpl}</pre>
                </details>
              `;
            })}
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

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    _config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as any, hass, updates => updateModule(updates));
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    _config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  /**
   * Try to parse todo item description as JSON. Returns null if not valid JSON.
   * Supports: object (merge into module) or array of objects (multiple modules per item).
   */
  private _parseDescriptionJson(description: string | undefined): Record<string, unknown> | unknown[] | null {
    if (!description || typeof description !== 'string') return null;
    const raw = description.trim();
    if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
      try {
        const parsed = JSON.parse(raw);
        return typeof parsed === 'object' && parsed !== null ? parsed : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Map todo items to CardModule[] using todo_item_template. If an item's description
   * is valid JSON, it can override module fields (object) or define multiple modules (array).
   * itemsWithEntity: list of { item, entityId } so multiple lists can be combined.
   */
  private _mapTodoItemsToModules(
    itemsWithEntity: { item: TodoItem; entityId: string }[],
    statuses: ('needs_action' | 'completed')[] | undefined,
    tpl: TodoItemTemplate,
    moduleIdPrefix: string
  ): CardModule[] {
    const filtered =
      Array.isArray(statuses) && statuses.length > 0
        ? itemsWithEntity.filter((e) => statuses.includes(e.item.status))
        : itemsWithEntity;
    const primaryField = (item: TodoItem) => {
      const f = tpl.primary_field || 'summary';
      if (f === 'summary') return item.summary || '';
      if (f === 'description') return item.description || '';
      if (f === 'due') return item.due || '';
      if (f === 'status') return item.status === 'completed' ? 'Done' : 'To do';
      return item.summary || '';
    };
    const secondaryField = (item: TodoItem) => {
      const f = tpl.secondary_field;
      if (!f || f === 'none') return '';
      if (f === 'summary') return item.summary || '';
      if (f === 'description') return item.description || '';
      if (f === 'due') return item.due || '';
      if (f === 'status') return item.status === 'completed' ? 'Done' : 'To do';
      return '';
    };
    const defaultIcon = tpl.icon || 'mdi:checkbox-marked-circle-outline';
    const iconIncomplete = tpl.icon_incomplete ?? tpl.icon ?? defaultIcon;
    const iconCompleted = tpl.icon_completed ?? tpl.icon ?? 'mdi:checkbox-marked-circle';
    const out: CardModule[] = [];
    filtered.forEach(({ item, entityId: todoEntity }, idx) => {
      const baseId = `${moduleIdPrefix}_todo_${idx}_${(item.uid || idx).toString().slice(0, 8)}`;
      const primary = primaryField(item);
      const secondary = secondaryField(item);
      const name = primary;
      const descJson = this._parseDescriptionJson(item.description);

      // Description as array of module configs: one item → multiple modules (e.g. parsed from JSON).
      if (Array.isArray(descJson) && descJson.length > 0) {
        descJson.forEach((entry, i) => {
          if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
            const obj = entry as Record<string, unknown>;
            const id = (obj.id as string) || `${baseId}_${i}`;
            const mod = {
              ...obj,
              id: typeof id === 'string' ? id : `${baseId}_${i}`,
              display_mode: (obj.display_mode as 'always') || 'always',
              display_conditions: Array.isArray(obj.display_conditions) ? obj.display_conditions : [],
            } as CardModule;
            out.push(mod);
          }
        });
        return;
      }

      // Single module per item (default or merged with description object).
      let mod: CardModule;
      if (tpl.module_type === 'icon') {
        const isCompleted = item.status === 'completed';
        mod = {
          id: baseId,
          type: 'icon',
          icons: [
            {
              id: `${baseId}_icon`,
              icon_mode: 'static',
              entity: todoEntity,
              name,
              icon_inactive: isCompleted ? iconCompleted : iconIncomplete,
              icon_active: iconCompleted,
              inactive_icon_color: isCompleted ? (tpl.icon_color_completed ?? 'var(--primary-color)') : (tpl.icon_color_incomplete ?? 'var(--secondary-text-color)'),
              active_icon_color: tpl.icon_color_completed ?? 'var(--primary-color)',
              show_name_when_inactive: true,
              show_state_when_inactive: false,
              show_icon_when_inactive: true,
              show_name_when_active: true,
              show_state_when_active: false,
              show_icon_when_active: true,
            },
          ],
          display_mode: 'always' as const,
          display_conditions: [],
        } as CardModule;
      } else {
        const textLine = secondary ? `${primary} — ${secondary}` : primary;
        const isCompleted = item.status === 'completed';
        const textMod: CardModule = {
          id: baseId,
          type: 'text',
          text: textLine,
          display_mode: 'always' as const,
          display_conditions: [],
          icon: isCompleted ? iconCompleted : iconIncomplete,
          icon_color: isCompleted ? tpl.icon_color_completed : tpl.icon_color_incomplete,
          icon_position: (tpl.icon_position === 'none' ? 'none' : tpl.icon_position) || 'before',
          alignment: tpl.alignment || 'left',
        } as CardModule;
        if (tpl.allow_tap_to_complete && item.uid) {
          (textMod as any).tap_action = {
            action: 'perform-action',
            service: 'todo.update_item',
            target: { entity_id: todoEntity },
            service_data: { item: item.uid, status: isCompleted ? 'needs_action' : 'completed' },
          };
        }
        mod = textMod;
      }
      // If description is a JSON object, merge its keys into the module (override/add fields).
      if (descJson && !Array.isArray(descJson) && typeof descJson === 'object') {
        const overrides = descJson as Record<string, unknown>;
        const merged = { ...mod, ...overrides } as CardModule;
        if (!merged.id) merged.id = mod.id;
        if (!merged.display_mode) merged.display_mode = 'always';
        if (merged.display_conditions === undefined) merged.display_conditions = [];
        out.push(merged);
      } else {
        out.push(mod);
      }
    });
    return out;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const dynModule = module as DynamicListModule;
    const lang = hass?.locale?.language || 'en';
    const sourceType = (() => {
      const raw = String(dynModule.source_type || 'template').toLowerCase();
      if (raw === 'todo') return 'todo';
      if (raw === 'todo-template') return 'todo-template';
      if (raw === 'action') return 'action';
      return 'template';
    })();

    if (!hass) {
      return this.renderGradientErrorState(
        localize('editor.dynamic_list.error_waiting_ha', lang, 'Waiting for Home Assistant'),
        localize('editor.dynamic_list.error_waiting_ha_desc', lang, 'This module requires a live connection'),
        'mdi:loading'
      );
    }

    // Carry over todo cache when HA replaces the hass object (it does so on
    // every entity state change).  Without this, the cache written by an
    // in-flight getItems() call is lost on the old object and the card gets
    // stuck showing "Loading todo items…" indefinitely.
    if (this._prevHass && this._prevHass !== hass && (this._prevHass as any).__uvc_todo_cache) {
      if (!(hass as any).__uvc_todo_cache) {
        (hass as any).__uvc_todo_cache = Object.create(null);
      }
      Object.assign((hass as any).__uvc_todo_cache, (this._prevHass as any).__uvc_todo_cache);
    }
    this._prevHass = hass;

    let generatedModules: CardModule[] = [];

    // ─── Todo list source ───────────────────────────────────────────────────
    if (sourceType === 'todo') {
      const firstTodoEntity =
        hass.states &&
        Object.keys(hass.states).find((id) => id.startsWith('todo.'));
      const resolve = (e: string) => (e?.trim() || firstTodoEntity || '').trim();
      const primaryEntity = resolve(dynModule.todo_entity ?? '');
      const extraEntities = (dynModule.todo_entities || [])
        .map((e) => resolve(e))
        .filter((e) => e && e !== primaryEntity);
      const entityIds = primaryEntity
        ? [primaryEntity, ...extraEntities]
        : extraEntities.length
          ? extraEntities
          : firstTodoEntity
            ? [firstTodoEntity]
            : [];
      if (entityIds.length === 0) {
        return this.renderGradientErrorState(
          localize('editor.dynamic_list.error_no_todo', lang, 'No Todo List'),
          localize('editor.dynamic_list.error_no_todo_desc', lang, 'Add a to-do list (e.g. Local Todo) or choose one in the General tab. Use "Default (first available)" when you have at least one todo entity.'),
          'mdi:format-list-checks'
        );
      }
      if (!this._todoService) {
        this._todoService = new UltraCardTodoService();
      }
      const cache = (hass as any).__uvc_todo_cache as { [entityId: string]: TodoItem[] } | undefined;
      const onUpdate = () => {
        this.triggerPreviewUpdate();
      };
      let anyMissing = false;
      for (const eid of entityIds) {
        if (cache?.[eid] === undefined) {
          anyMissing = true;
          this._todoService.getItems(hass, eid, onUpdate);
        }
      }
      if (anyMissing) {
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
            Loading todo items…
          </div>
        `;
      }
      const itemsWithEntity: { item: TodoItem; entityId: string }[] = [];
      entityIds.forEach((eid) => {
        const items = cache?.[eid] || [];
        items.forEach((item) => itemsWithEntity.push({ item, entityId: eid }));
      });
      const sortBy = dynModule.sort_by || 'default';
      const sortDir = dynModule.sort_direction || 'asc';
      if (sortBy !== 'default') {
        const mult = sortDir === 'asc' ? 1 : -1;
        itemsWithEntity.sort((a, b) => {
          if (sortBy === 'summary') {
            const sa = (a.item.summary || '').toLowerCase();
            const sb = (b.item.summary || '').toLowerCase();
            return mult * (sa < sb ? -1 : sa > sb ? 1 : 0);
          }
          if (sortBy === 'due') {
            const da = a.item.due || '';
            const db = b.item.due || '';
            const ta = da ? new Date(da).getTime() : 0;
            const tb = db ? new Date(db).getTime() : 0;
            return mult * (ta - tb);
          }
          if (sortBy === 'status') {
            const order = (s: string) => (s === 'completed' ? 1 : 0);
            return mult * (order(a.item.status) - order(b.item.status));
          }
          return 0;
        });
      }
      const tpl = dynModule.todo_item_template || {
        module_type: 'text',
        primary_field: 'summary',
        secondary_field: 'due',
        icon: 'mdi:checkbox-marked-circle-outline',
      };
      generatedModules = this._mapTodoItemsToModules(
        itemsWithEntity,
        dynModule.todo_statuses,
        tpl,
        dynModule.id
      );
    } else if (sourceType === 'todo-template') {
      // ─── Todo-template source: fetch items then run a Jinja2 template ─────────
      const firstTodoEntity =
        hass.states && Object.keys(hass.states).find((id) => id.startsWith('todo.'));
      const resolve = (e: string) => (e?.trim() || firstTodoEntity || '').trim();
      const primaryEntity = resolve(dynModule.todo_entity ?? '');
      const extraEntities = (dynModule.todo_entities || [])
        .map((e) => resolve(e))
        .filter((e) => e && e !== primaryEntity);
      const entityIds = primaryEntity
        ? [primaryEntity, ...extraEntities]
        : extraEntities.length ? extraEntities : firstTodoEntity ? [firstTodoEntity] : [];

      if (entityIds.length === 0) {
        return this.renderGradientErrorState(
          localize('editor.dynamic_list.error_no_todo', lang, 'No Todo List'),
          localize('editor.dynamic_list.error_no_todo_entity_desc', lang, 'Choose a to-do list entity in the General tab.'),
          'mdi:format-list-checks'
        );
      }

      const tplStr = dynModule.todo_dynamic_template?.trim();
      if (!tplStr) {
        return this.renderGradientErrorState(
          localize('editor.dynamic_list.error_add_template', lang, 'Add a Template'),
          localize('editor.dynamic_list.error_add_template_todo_desc', lang, 'Enter a Jinja2 template in the General tab to map your todo items to modules.'),
          'mdi:code-braces'
        );
      }

      if (!this._todoService) this._todoService = new UltraCardTodoService();
      const cache = (hass as any).__uvc_todo_cache as { [entityId: string]: TodoItem[] } | undefined;
      const onUpdate = () => {
        this.triggerPreviewUpdate();
      };
      let anyMissing = false;
      for (const eid of entityIds) {
        if (cache?.[eid] === undefined) {
          anyMissing = true;
          this._todoService.getItems(hass, eid, onUpdate);
        }
      }
      if (anyMissing) {
        return html`
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;color:var(--secondary-text-color);font-size:13px;">
            <ha-icon icon="mdi:loading" style="--mdc-icon-size:16px;animation:spin 1s linear infinite;"></ha-icon>
            Loading todo items…
          </div>`;
      }

      // Build the flat items array with entity_id added
      const statuses = dynModule.todo_statuses;
      const allItems: Record<string, unknown>[] = [];
      entityIds.forEach((eid) => {
        const items = cache?.[eid] || [];
        items.forEach((item) => {
          if (!statuses || statuses.length === 0 || statuses.includes(item.status)) {
            allItems.push({ ...item, entity_id: eid });
          }
        });
      });

      // Serialise items to JSON and embed as a Jinja2 variable assignment prefix
      const itemsJson = JSON.stringify(allItems);
      const prefixedTemplate = `{% set items = ${itemsJson} %}\n${tplStr}`;

      if (!this._templateService) {
        this._templateService = new TemplateService(hass);
      } else {
        this._templateService.updateHass(hass);
      }
      if (!hass.__uvc_template_strings) hass.__uvc_template_strings = {};

      const processedTpl = preprocessTemplateVariables(prefixedTemplate, hass, config);
      const tKey = `layout_mods_dynlist_todotpl_${dynModule.id}`;
      const entitySig = `${computeMultiEntitySignature(entityIds, hass)}|n:${allItems.length}|j:${this._hashString(itemsJson)}`;

      this._templateService.subscribeToTemplate(
        processedTpl,
        tKey,
        onUpdate,
        {},
        config,
        entitySig
      );
      const rawTodo = hass.__uvc_template_strings?.[tKey];
      if (!rawTodo) {
        return html`
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;color:var(--secondary-text-color);font-size:13px;">
            <ha-icon icon="mdi:loading" style="--mdc-icon-size:16px;animation:spin 1s linear infinite;"></ha-icon>
            Evaluating template…
          </div>`;
      }
      try {
        const parsed = Array.isArray(rawTodo) ? rawTodo : JSON.parse(String(rawTodo).trim());
        generatedModules = Array.isArray(parsed) ? (parsed as CardModule[]) : [];
      } catch (e) {
        console.error('[UltraCard] Dynamic List (todo-template): parse error', rawTodo, e);
        return this.renderGradientErrorState(
          localize('editor.dynamic_list.error_invalid_template', lang, 'Invalid Template Output'),
          localize('editor.dynamic_list.error_invalid_template_desc', lang, 'Template must output a JSON array via {{ ns.mods | tojson }}.'),
          'mdi:alert-circle-outline'
        );
      }

    } else if (sourceType === 'action') {
      // ─── Action source: call a HA service, inject response into a Jinja2 template
      const actCfg = dynModule.action_source;
      if (!actCfg?.domain || !actCfg?.service) {
        return this.renderGradientErrorState(
          localize('editor.dynamic_list.error_configure_action', lang, 'Configure an Action'),
          localize('editor.dynamic_list.error_configure_action_desc', lang, 'Set the Domain and Service in the General tab.'),
          'mdi:lightning-bolt'
        );
      }
      const tplStr = dynModule.action_template?.trim();
      if (!tplStr) {
        return this.renderGradientErrorState(
          localize('editor.dynamic_list.error_add_template', lang, 'Add a Template'),
          localize('editor.dynamic_list.error_add_template_action_desc', lang, 'Enter a Jinja2 template in the General tab to map the service response to modules.'),
          'mdi:code-braces'
        );
      }

      const cacheKey = `__uvc_action_${dynModule.id}`;
      const cachedResponse = this._actionCache.get(cacheKey);

      const onUpdate = () => {
        this.triggerPreviewUpdate();
      };

      const fetchAction = async () => {
        if (this._actionFetching.has(cacheKey)) return;
        this._actionFetching.add(cacheKey);
        try {
          const serviceData = actCfg.service_data ? { ...actCfg.service_data } : {};
          const result = await (hass as any).callService(
            actCfg.domain,
            actCfg.service,
            serviceData,
            undefined,
            true,
            true
          );
          this._actionCache.set(cacheKey, result?.response ?? result ?? {});
        } catch (err) {
          console.warn('[UltraCard] Dynamic List action source failed:', err);
          this._actionCache.set(cacheKey, {});
        } finally {
          this._actionFetching.delete(cacheKey);
          onUpdate();
        }
      };

      if (cachedResponse === undefined) {
        fetchAction();
        return html`
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;color:var(--secondary-text-color);font-size:13px;">
            <ha-icon icon="mdi:loading" style="--mdc-icon-size:16px;animation:spin 1s linear infinite;"></ha-icon>
            Calling action…
          </div>`;
      }

      // Set up watch entity subscriptions (once per module instance)
      const watchKey = `__uvc_action_watch_${dynModule.id}`;
      if (!(window as any)[watchKey] && (actCfg.watch_entities?.length ?? 0) > 0) {
        (window as any)[watchKey] = true;
        const connection = (hass as any).connection;
        connection?.subscribeEvents?.((ev: { data: { entity_id: string } }) => {
          if (actCfg.watch_entities?.includes(ev?.data?.entity_id)) fetchAction();
        }, 'state_changed').catch(() => {});
      }

      // Set up periodic refresh (once per module instance)
      const interval = actCfg.refresh_interval ?? 0;
      if (interval > 0 && !this._actionTimers.has(cacheKey)) {
        const timer = setInterval(fetchAction, interval * 1000);
        this._actionTimers.set(cacheKey, timer);
      }

      // Serialise response and inject as Jinja2 variable
      const responseJson = JSON.stringify(cachedResponse);
      const prefixedTemplate = `{% set response = ${responseJson} %}\n${tplStr}`;

      if (!this._templateService) {
        this._templateService = new TemplateService(hass);
      } else {
        this._templateService.updateHass(hass);
      }
      if (!hass.__uvc_template_strings) hass.__uvc_template_strings = {};

      const processedTpl = preprocessTemplateVariables(prefixedTemplate, hass, config);
      const tKey = `layout_mods_dynlist_action_${dynModule.id}`;
      const watchList = actCfg.watch_entities || [];
      const entitySig = `${computeMultiEntitySignature(watchList, hass)}|r:${this._hashString(responseJson)}`;

      this._templateService.subscribeToTemplate(
        processedTpl,
        tKey,
        onUpdate,
        {},
        config,
        entitySig
      );
      const rawAction = hass.__uvc_template_strings?.[tKey];
      if (!rawAction) {
        return html`
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;color:var(--secondary-text-color);font-size:13px;">
            <ha-icon icon="mdi:loading" style="--mdc-icon-size:16px;animation:spin 1s linear infinite;"></ha-icon>
            Evaluating template…
          </div>`;
      }
      try {
        const parsed = Array.isArray(rawAction) ? rawAction : JSON.parse(String(rawAction).trim());
        generatedModules = Array.isArray(parsed) ? (parsed as CardModule[]) : [];
      } catch (e) {
        console.error('[UltraCard] Dynamic List (action): parse error', rawAction, e);
        return this.renderGradientErrorState(
          localize('editor.dynamic_list.error_invalid_template', lang, 'Invalid Template Output'),
          localize('editor.dynamic_list.error_invalid_template_action_desc', lang, 'Template must output a JSON array via {{ ns.mods | tojson }}.'),
          'mdi:alert-circle-outline'
        );
      }

    } else {
      // ─── Template source ──────────────────────────────────────────────────
      if (!dynModule.dynamic_template || dynModule.dynamic_template.trim() === '') {
        return this.renderGradientErrorState(
          localize('editor.dynamic_list.error_add_jinja_template', lang, 'Add a Jinja2 Template'),
          localize('editor.dynamic_list.error_add_jinja_template_desc', lang, 'Enter a template in the General tab to generate modules dynamically'),
          'mdi:code-braces'
        );
      }
      if (!this._templateService) {
        this._templateService = new TemplateService(hass);
      } else {
        this._templateService.updateHass(hass);
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

      this._templateService.subscribeToTemplate(
        processedTemplate,
        templateKey,
        () => {
          this.triggerPreviewUpdate();
        },
        {},
        config
      );

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

      if (Array.isArray(raw)) {
        generatedModules = raw as CardModule[];
      } else if (raw !== null && typeof raw === 'object') {
        generatedModules = [];
      } else {
        try {
          const parsed = JSON.parse(String(raw).trim());
          generatedModules = Array.isArray(parsed) ? (parsed as CardModule[]) : [];
        } catch (e) {
          console.error('[UltraCard] Dynamic List: failed to parse template output:', raw, e);
          return this.renderGradientErrorState(
            localize('editor.dynamic_list.error_invalid_template', lang, 'Invalid Template Output'),
            localize('editor.dynamic_list.error_invalid_template_jinja_desc', lang, 'Template must output a JSON array. End your template with {{ ns.mods | tojson }}.'),
            'mdi:alert-circle-outline'
          );
        }
      }
      const sortByTpl = dynModule.sort_by || 'default';
      const sortDirTpl = dynModule.sort_direction || 'asc';
      if (sortByTpl === 'summary' && generatedModules.length > 0) {
        const mult = sortDirTpl === 'asc' ? 1 : -1;
        const label = (m: CardModule) =>
          ((m as any).text ?? (m as any).name ?? (m as any).icons?.[0]?.name ?? '').toString().toLowerCase();
        generatedModules = [...generatedModules].sort((a, b) => mult * (label(a) < label(b) ? -1 : label(a) > label(b) ? 1 : 0));
      }
    }

    if (generatedModules.length === 0) {
      const isTodoEmpty = sourceType === 'todo' || sourceType === 'todo-template';
      const emptyMsg = isTodoEmpty ? 'No to-do items' : 'Template returned an empty list';
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
          <ha-icon icon="${isTodoEmpty ? 'mdi:format-list-checks' : 'mdi:playlist-remove'}" style="--mdc-icon-size: 16px;"></ha-icon>
          ${emptyMsg}
        </div>
      `;
    }

    const registry = getModuleRegistry();
    const direction = dynModule.direction || 'horizontal';
    const gap = dynModule.gap ?? 8;
    const wrap = dynModule.wrap !== false;
    const cols = dynModule.columns ?? 4;
    const maxRows = dynModule.rows ?? 0;
    const limit = dynModule.limit ?? 0;
    const limitBehavior = dynModule.limit_behavior || 'show_more';
    const alignH = dynModule.align_h || 'center';
    const alignV = dynModule.align_v || 'center';
    const moduleId = dynModule.id;

    // ── Apply max-rows cap (horizontal grid only) ────────────────────────────
    let cappedModules = generatedModules;
    if (maxRows > 0 && direction === 'horizontal') {
      const maxItems = cols > 0 ? maxRows * cols : maxRows;
      cappedModules = generatedModules.slice(0, maxItems);
    }

    // ── Apply limit + show-more / pagination ─────────────────────────────────
    const hasLimit = limit > 0 && limit < cappedModules.length;
    let visibleModules = cappedModules;
    let paginationBar: TemplateResult = html``;

    if (hasLimit) {
      if (limitBehavior === 'show_more') {
        const expanded = this._expandedModules.get(moduleId) ?? false;
        visibleModules = expanded ? cappedModules : cappedModules.slice(0, limit);
        const remaining = cappedModules.length - limit;
        paginationBar = expanded
          ? html`
              <button style="${BTN_STYLE}" @click=${() => {
                this._expandedModules.set(moduleId, false);
                this.triggerPreviewUpdate();
              }}>
                <ha-icon icon="mdi:chevron-up" style="--mdc-icon-size:16px;"></ha-icon>
                Show less
              </button>`
          : html`
              <button style="${BTN_STYLE}" @click=${() => {
                this._expandedModules.set(moduleId, true);
                this.triggerPreviewUpdate();
              }}>
                <ha-icon icon="mdi:chevron-down" style="--mdc-icon-size:16px;"></ha-icon>
                Show ${remaining} more
              </button>`;
      } else {
        // Paginate
        const totalPages = Math.ceil(cappedModules.length / limit);
        const page = Math.min(this._currentPage.get(moduleId) ?? 0, totalPages - 1);
        visibleModules = cappedModules.slice(page * limit, page * limit + limit);
        paginationBar = html`
          <div style="${PAGE_BAR_STYLE}">
            <button
              style="${PAGE_BTN_STYLE}${page === 0 ? 'opacity:0.35;pointer-events:none;' : ''}"
              @click=${() => {
                this._currentPage.set(moduleId, Math.max(0, page - 1));
                this.triggerPreviewUpdate();
              }}
            ><ha-icon icon="mdi:chevron-left" style="--mdc-icon-size:18px;"></ha-icon></button>
            <span style="font-size:12px;color:var(--secondary-text-color);">${page + 1} / ${totalPages}</span>
            <button
              style="${PAGE_BTN_STYLE}${page >= totalPages - 1 ? 'opacity:0.35;pointer-events:none;' : ''}"
              @click=${() => {
                this._currentPage.set(moduleId, Math.min(totalPages - 1, page + 1));
                this.triggerPreviewUpdate();
              }}
            ><ha-icon icon="mdi:chevron-right" style="--mdc-icon-size:18px;"></ha-icon></button>
          </div>`;
      }
    }

    // ── Container CSS ─────────────────────────────────────────────────────────
    // Use CSS grid when a column count is fixed; flex for everything else
    const useGrid = cols > 0;
    const containerStyle = useGrid
      ? `display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap}px;width:100%;justify-items:${alignH === 'space-between' || alignH === 'space-around' ? 'center' : alignH};align-items:${alignV};`
      : direction === 'horizontal'
      ? `display:flex;flex-direction:row;flex-wrap:${wrap ? 'wrap' : 'nowrap'};gap:${gap}px;width:100%;justify-content:${alignH};align-items:${alignV};`
      : `display:flex;flex-direction:column;gap:${gap}px;width:100%;align-items:${alignH === 'space-between' || alignH === 'space-around' ? 'center' : alignH};justify-content:${alignV};`;

    // Child wrapper style — only needed in flex-horizontal without grid.
    // flex: 0 0 auto keeps each item at its natural width so wrap triggers correctly.
    const needsChildWrapper = !useGrid && direction === 'horizontal';
    const childFlexStyle = `flex: 0 0 auto; min-width: 0;`;

    const renderedModules = visibleModules.map(childModule => {
      // Evaluate child visibility
      const shouldShow = logicService.evaluateModuleVisibility(childModule);
      if (!shouldShow) return html``;

      const moduleHandler = registry.getModule(childModule.type);
      if (!moduleHandler) {
        return ucModulePreviewService.renderModuleLoadingState(childModule);
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

      // Apply dynamic-list design to child so Design tab on the list affects each row.
      // Include both module.design and legacy top-level props (font_size, color, etc.) from the list.
      const parentDesign = {
        ...(dynModule.design || {}),
        ...((dynModule as any).font_size !== undefined && (dynModule as any).font_size !== null && { font_size: (dynModule as any).font_size }),
        ...((dynModule as any).color !== undefined && (dynModule as any).color !== null && { color: (dynModule as any).color }),
        ...((dynModule as any).font_family !== undefined && (dynModule as any).font_family != null && { font_family: (dynModule as any).font_family }),
      };
      const moduleWithDesign = {
        ...childModule,
        design: { ...parentDesign, ...((childModule as any).design || {}) },
      };
      const content = moduleHandler.renderPreview(
        autoMigrateCardModule(moduleWithDesign as CardModule),
        hass,
        config,
        previewContext
      );
      // When vertical list and align_h is center/end, wrap so the list block shrinks and centers (or aligns end)
      const centerListBlock = !useGrid && direction === 'vertical' && (alignH === 'center' || alignH === 'end');
      const wrapStyle = centerListBlock
        ? `width: fit-content; max-width: 100%; align-self: ${alignH === 'center' ? 'center' : 'flex-end'};`
        : '';
      const wrapped = wrapStyle ? html`<div style="${wrapStyle}">${content}</div>` : content;
      return needsChildWrapper ? html`<div style="${childFlexStyle}">${wrapped}</div>` : wrapped;
    });

    return this.wrapWithAnimation(html`
      <div style="display:flex;flex-direction:column;gap:8px;width:100%;">
        <div style="${containerStyle}">${renderedModules}</div>
        ${paginationBar}
      </div>
    `, module, hass);
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const dynModule = module as DynamicListModule;
    const errors: string[] = [];
    const src = String(dynModule.source_type || 'template').toLowerCase();
    if (src === 'todo') {
      if (!dynModule.todo_entity || !dynModule.todo_entity.trim()) {
        errors.push('todo_entity is required when source is Todo List');
      }
    } else if (src === 'todo-template') {
      if (!dynModule.todo_dynamic_template || !dynModule.todo_dynamic_template.trim()) {
        errors.push('todo_dynamic_template is required when source is Todo List + Template');
      }
    } else if (src === 'action') {
      if (!dynModule.action_source?.domain || !dynModule.action_source?.service) {
        errors.push('action_source.domain and action_source.service are required when source is Action');
      }
      if (!dynModule.action_template || !dynModule.action_template.trim()) {
        errors.push('action_template is required when source is Action');
      }
    } else {
      if (!dynModule.dynamic_template || dynModule.dynamic_template.trim() === '') {
        errors.push('dynamic_template is required when source is Template');
      }
    }
    return { valid: errors.length === 0, errors };
  }
}

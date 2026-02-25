/**
 * Ultra Card Hub – Templates tab (unified template system cheatsheet).
 */
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { panelStyles } from '../panel-styles';

/** Modules that accept the unified template system ($vars + Jinja). Keep in sync with modules that use template-service / unified_template. */
const TEMPLATE_CAPABLE_MODULES: { type: string; title: string }[] = [
  { type: 'text', title: 'Text Module' },
  { type: 'info', title: 'Info' },
  { type: 'markdown', title: 'Markdown' },
  { type: 'icon', title: 'Icon' },
  { type: 'bar', title: 'Bars' },
  { type: 'graphs', title: 'Graphs' },
  { type: 'camera', title: 'Camera' },
  { type: 'spinbox', title: 'Spinbox' },
  { type: 'toggle', title: 'Toggle' },
  { type: 'dropdown', title: 'Dropdown' },
  { type: 'gauge', title: 'Gauge' },
  { type: 'display_conditions', title: 'Display conditions' },
];

interface CopyableExample {
  title: string;
  code: string;
  description?: string;
}

@customElement('hub-templates-tab')
export class HubTemplatesTab extends LitElement {
  @state() private _copiedId: string | null = null;
  private _copyTimeout: ReturnType<typeof setTimeout> | null = null;

  static styles = [
    panelStyles,
    css`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      .templates-intro {
        padding: 20px 0 24px;
        margin-bottom: 24px;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
      }

      .templates-intro h2 {
        margin: 0 0 12px 0;
        font-size: 20px;
        font-weight: 700;
        color: var(--primary-text-color);
      }

      .templates-intro p {
        margin: 0;
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.6;
      }

      .section {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .section h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .section h3 ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .section .section-desc {
        margin: 0 0 16px 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      .example-block {
        margin-bottom: 20px;
      }

      .example-block:last-child {
        margin-bottom: 0;
      }

      .example-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 6px;
      }

      .example-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .code-wrap {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
      }

      .code-wrap pre {
        margin: 0;
        padding: 14px 16px;
        font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
        font-size: 13px;
        line-height: 1.5;
        color: var(--primary-text-color);
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .copy-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        border: none;
        border-radius: 6px;
        background: var(--primary-color);
        color: white;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .copy-btn:hover {
        opacity: 0.9;
      }

      .copy-btn.copied {
        background: var(--success-color, #4caf50);
      }

      .copy-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      .bullet-list {
        margin: 0 0 16px 0;
        padding-left: 20px;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.6;
      }

      .bullet-list li {
        margin-bottom: 4px;
      }

      .inline-code {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 12px;
        padding: 2px 6px;
        background: rgba(0, 0, 0, 0.06);
        border-radius: 4px;
        color: var(--primary-text-color);
      }

      .module-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 20px;
      }

      .module-chip {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.25);
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-color);
      }

      .module-chip ha-icon {
        --mdc-icon-size: 14px;
        margin-right: 4px;
      }
    `,
  ];

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._copyTimeout) clearTimeout(this._copyTimeout);
  }

  private _copyExample(id: string, code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this._copiedId = id;
      if (this._copyTimeout) clearTimeout(this._copyTimeout);
      this._copyTimeout = setTimeout(() => {
        this._copiedId = null;
        this._copyTimeout = null;
      }, 2000);
    });
  }

  private _renderExample(id: string, ex: CopyableExample): unknown {
    const copied = this._copiedId === id;
    return html`
      <div class="example-block">
        ${ex.title ? html`<div class="example-title">${ex.title}</div>` : ''}
        ${ex.description ? html`<div class="example-desc">${ex.description}</div>` : ''}
        <div class="code-wrap">
          <button
            type="button"
            class="copy-btn ${copied ? 'copied' : ''}"
            @click=${() => this._copyExample(id, ex.code)}
          >
            <ha-icon icon=${copied ? 'mdi:check' : 'mdi:content-copy'}></ha-icon>
            ${copied ? 'Copied' : 'Copy'}
          </button>
          <pre>${ex.code}</pre>
        </div>
      </div>
    `;
  }

  render() {
    const customVarExamples: CopyableExample[] = [
      {
        title: 'Use a variable in text',
        description: 'Define the variable in the Variables tab (e.g. name = sensor.temperature), then use it anywhere in your card.',
        code: '$living_room_temp',
      },
      {
        title: 'Use in a Jinja expression',
        description: 'Variables are replaced before Jinja runs, so you can mix $variables with {{ }}.',
        code: '{{ $my_sensor | float * 2 }}',
      },
      {
        title: 'Escape a dollar sign',
        description: 'Use $$ to output a literal $.',
        code: 'Price: $$99',
      },
    ];

    const jinjaExamples: CopyableExample[] = [
      {
        title: 'Entity state',
        description: 'Current state of an entity.',
        code: "{{ states('sensor.temperature') }}",
      },
      {
        title: 'Entity attribute',
        description: 'Get an attribute (e.g. unit_of_measurement, friendly_name).',
        code: "{{ state_attr('sensor.temperature', 'unit_of_measurement') }}",
      },
      {
        title: 'Friendly name',
        description: 'Human-readable name of the entity.',
        code: "{{ states('sensor.temperature') }} {{ state_attr('sensor.temperature', 'unit_of_measurement') }}",
      },
      {
        title: 'Conditional text',
        description: 'Show different text based on state.',
        code: "{% if states('binary_sensor.door') == 'on' %}Open{% else %}Closed{% endif %}",
      },
      {
        title: 'Numeric formatting',
        description: 'Round or format numbers.',
        code: "{{ states('sensor.temperature') | float(0) | round(1) }}°",
      },
      {
        title: 'Relative time',
        description: 'Time since a timestamp (e.g. last changed).',
        code: "{{ as_timestamp(state_attr('sensor.last_updated', 'last_updated')) | timestamp_custom('%H:%M') }}",
      },
      {
        title: 'Display condition (show/hide)',
        description: 'In Display conditions, use type "Template" and a template that returns true/false. Module is visible when true.',
        code: "{{ states('binary_sensor.door') == 'on' }}",
      },
      {
        title: 'is_state / is_state_attr',
        description: 'Check state or attribute (returns true/false).',
        code: "{{ is_state('sensor.mode', 'home') and state_attr('sensor.temperature', 'unit_of_measurement') == '°C' }}",
      },
      {
        title: 'now() and relative time',
        description: 'Current time and format.',
        code: "{{ now().strftime('%H:%M') }}",
      },
    ];

    const unifiedJsonExamples: CopyableExample[] = [
      {
        title: 'Text / content (text, markdown)',
        description: 'Return content and optional color. Simple string is also valid.',
        code: '{"content": "Hello {{ states(\'sensor.name\') }}", "color": "var(--primary-color)"}',
      },
      {
        title: 'Icon / info module (name, state, icon, colors)',
        description: 'Full set of display properties for icon and info modules.',
        code: `{"name": "Living Room", "state_text": "{{ states('sensor.temperature') }}°", "icon": "mdi:thermometer", "icon_color": "#2196f3", "name_color": "#333", "state_color": "#666", "container_background_color": "rgba(0,0,0,0.05)"}`,
      },
      {
        title: 'Bar module (value and label)',
        description: 'Value can be number or string; label appears beside the bar.',
        code: '{"value": {{ states("sensor.battery") | float(0) }}, "label": "{{ states(\'sensor.battery\') }}%"}',
      },
      {
        title: 'Gauge color override',
        description: 'Unified template can return gauge_color to override color mode.',
        code: '{"value": {{ states("sensor.level") | float(0) }}, "gauge_color": "#4caf50"}',
      },
      {
        title: 'Camera module (entity, overlay, visibility)',
        description: 'Return camera entity ID, overlay text/color, and visible boolean.',
        code: '{"entity": "camera.front_door", "overlay_text": "{{ states(\'sensor.door\') }}", "overlay_color": "#fff", "visible": true}',
      },
      {
        title: 'Simple string (icon name)',
        description: 'Returning a plain string is valid; in icon module it is used as the icon name.',
        code: "mdi:lightbulb-on",
      },
    ];

    return html`
      <div class="templates-intro">
        <h2>Unified template system</h2>
        <p>
          Ultra Card supports <strong>custom variables</strong> (<span class="inline-code">$name</span>)
          and <strong>Home Assistant Jinja2</strong> templates. Use variables from the Variables tab or
          Card Settings, and combine them with <span class="inline-code">{{ states('entity_id') }}</span>,
          filters, and conditionals. Variables are replaced first, then the result is evaluated as Jinja2.
        </p>
      </div>

      <div class="section">
        <h3><ha-icon icon="mdi:view-module"></ha-icon> Modules that accept templates</h3>
        <p class="section-desc">
          These modules support the unified template system (custom variables and/or Jinja2). Display conditions (show/hide by template) are available on every module.
        </p>
        <div class="module-chips">
          ${TEMPLATE_CAPABLE_MODULES.map(
            c =>
              html`<span class="module-chip" title="Accepts templates">
                <ha-icon icon=${c.type === 'display_conditions' ? 'mdi:eye-check' : 'mdi:code-tags'}></ha-icon>
                ${c.title}
              </span>`
          )}
        </div>
      </div>

      <div class="section">
        <h3><ha-icon icon="mdi:variable"></ha-icon> Custom variables</h3>
        <p class="section-desc">
          Create variables in the <strong>Variables</strong> tab (global) or in each card’s
          <strong>Card Settings</strong> (card-only). Reference them with <span class="inline-code">$variable_name</span> (letters, numbers, underscores).
        </p>
        <ul class="bullet-list">
          <li>Global variables: available in all Ultra Cards (Hub → Variables).</li>
          <li>Card variables: only in that card (Card Settings → Card Variables).</li>
          <li>Use <span class="inline-code">$$</span> to output a literal dollar sign.</li>
        </ul>
        ${customVarExamples.map((ex, i) => this._renderExample(`custom-${i}`, ex))}
      </div>

      <div class="section">
        <h3><ha-icon icon="mdi:code-tags"></ha-icon> Jinja2 examples</h3>
        <p class="section-desc">
          Home Assistant’s template engine. Use <span class="inline-code">states('entity_id')</span>,
          <span class="inline-code">state_attr('entity_id', 'attribute')</span>, filters like
          <span class="inline-code">| float</span>, <span class="inline-code">| round(1)</span>, and
          <span class="inline-code">{% if %} ... {% endif %}</span>. These run after your $variables are replaced.
        </p>
        ${jinjaExamples.map((ex, i) => this._renderExample(`jinja-${i}`, ex))}
      </div>

      <div class="section">
        <h3><ha-icon icon="mdi:json"></ha-icon> Unified template JSON format</h3>
        <p class="section-desc">
          Many modules use a <strong>unified template</strong> that can return a JSON object. $variables are replaced first, then Jinja runs. The result can be a simple string (e.g. icon name) or a JSON object with keys like <span class="inline-code">content</span>, <span class="inline-code">name</span>, <span class="inline-code">state_text</span>, <span class="inline-code">icon</span>, <span class="inline-code">icon_color</span>, <span class="inline-code">value</span>, <span class="inline-code">label</span>, <span class="inline-code">gauge_color</span>, <span class="inline-code">container_background_color</span>, <span class="inline-code">entity</span>, <span class="inline-code">overlay_text</span>, <span class="inline-code">visible</span>, etc. Supported keys depend on the module.
        </p>
        ${unifiedJsonExamples.map((ex, i) => this._renderExample(`unified-${i}`, ex))}
      </div>

      <div class="section">
        <h3><ha-icon icon="mdi:lightbulb-outline"></ha-icon> Where templates work</h3>
        <p class="section-desc">
          Most text and URL fields in modules support templates: entity IDs, labels, subtitles, image URLs,
          action URLs, and many design fields. If a field accepts an entity, it often also accepts a template
          that returns a value. Try <span class="inline-code">$my_var</span> or
          <span class="inline-code">{{ states('sensor.x') }}</span> in any text box.
        </p>
      </div>
    `;
  }
}

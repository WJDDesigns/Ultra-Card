import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Z_INDEX } from '../utils/uc-z-index';
import { ucToastService } from '../services/uc-toast-service';

const UC_OPEN_CHEATSHEET = 'uc-open-template-cheatsheet';

export interface CheatsheetEntry {
  key: string;
  type: string;
  description: string;
  snippet: string;
  modules: string[];
}

type CheatsheetTab = 'context' | 'properties';

/** Context variables available in all unified templates (from template-context.ts) */
const CONTEXT_VARIABLES: Omit<CheatsheetEntry, 'modules'>[] = [
  { key: 'entity', type: 'string', description: 'Entity ID (e.g., sensor.temperature)', snippet: '{{ entity }}' },
  { key: 'state', type: 'string', description: 'Current entity state value', snippet: '{{ state }}' },
  { key: 'name', type: 'string', description: 'Custom name or friendly name', snippet: '{{ name }}' },
  { key: 'friendly_name', type: 'string', description: "Entity's friendly_name attribute", snippet: '{{ friendly_name }}' },
  { key: 'attributes', type: 'object', description: 'All entity attributes', snippet: '{{ attributes }}' },
  { key: 'unit', type: 'string', description: 'Unit of measurement (e.g., °C, %)', snippet: '{{ unit }}' },
  { key: 'domain', type: 'string', description: 'Entity domain (sensor, light, switch, etc.)', snippet: '{{ domain }}' },
  { key: 'device_class', type: 'string', description: 'Device class attribute', snippet: '{{ device_class }}' },
  { key: 'state_number', type: 'number', description: 'Parsed numeric state value', snippet: '{{ state_number }}' },
  { key: 'state_boolean', type: 'boolean', description: 'Boolean interpretation of state (on/true/yes)', snippet: '{{ state_boolean }}' },
  { key: 'config', type: 'object', description: 'Config object passed to template', snippet: '{{ config }}' },
];

/** Return properties the template can output (from template-parser.ts UnifiedTemplateResult) */
const RETURN_PROPERTIES: CheatsheetEntry[] = [
  { key: 'icon', type: 'string', description: 'Icon name (e.g., mdi:fire)', snippet: '"icon": "mdi:fire"', modules: ['icon', 'info'] },
  { key: 'icon_color', type: 'string', description: 'Icon color (CSS color value)', snippet: '"icon_color": "red"', modules: ['icon', 'info'] },
  { key: 'container_background_color', type: 'string', description: 'Container background color', snippet: '"container_background_color": "rgba(255,0,0,0.1)"', modules: ['icon', 'info', 'markdown', 'text'] },
  { key: 'name', type: 'string', description: 'Display name text', snippet: '"name": "{{ friendly_name }}"', modules: ['icon', 'info'] },
  { key: 'name_color', type: 'string', description: 'Name text color', snippet: '"name_color": "var(--primary-color)"', modules: ['icon', 'info'] },
  { key: 'state_text', type: 'string', description: 'State value text', snippet: '"state_text": "{{ state }} {{ unit }}"', modules: ['icon', 'info'] },
  { key: 'state_color', type: 'string', description: 'State text color', snippet: '"state_color": "green"', modules: ['icon', 'info'] },
  { key: 'content', type: 'string', description: 'Text or markdown body', snippet: '"content": "{{ state }}"', modules: ['text', 'markdown'] },
  {
    key: 'color',
    type: 'string',
    description: 'Text or status color (CSS color)',
    snippet: '"color": "#333"',
    modules: ['text', 'markdown', 'status_summary'],
  },
  { key: 'value', type: 'number | string', description: 'Bar value', snippet: '"value": {{ state_number }}', modules: ['bar'] },
  { key: 'label', type: 'string', description: 'Bar label text', snippet: '"label": "{{ name }}"', modules: ['bar'] },
  { key: 'gauge_color', type: 'string', description: 'Gauge color', snippet: '"gauge_color": "red"', modules: ['gauge'] },
  { key: 'colors', type: 'string[]', description: 'Array of colors for graphs', snippet: '"colors": ["red","green"]', modules: ['graphs'] },
  { key: 'global_color', type: 'string', description: 'Single color for all graph entities', snippet: '"global_color": "blue"', modules: ['graphs'] },
  { key: 'fill_area', type: 'boolean', description: 'Control line chart area fill', snippet: '"fill_area": true', modules: ['graphs'] },
  { key: 'pie_fill', type: 'number | string', description: 'Pie/donut slice fill percentage', snippet: '"pie_fill": 0.8', modules: ['graphs'] },
  { key: 'button_background_color', type: 'string', description: 'Spinbox button background', snippet: '"button_background_color": "#333"', modules: ['spinbox'] },
  { key: 'button_text_color', type: 'string', description: 'Spinbox button text color', snippet: '"button_text_color": "#fff"', modules: ['spinbox'] },
  { key: 'value_color', type: 'string', description: 'Spinbox value text color', snippet: '"value_color": "#000"', modules: ['spinbox'] },
  { key: 'entity', type: 'string', description: 'Camera entity ID', snippet: '"entity": "camera.front_door"', modules: ['camera'] },
  {
    key: 'visible',
    type: 'boolean',
    description: 'Camera stream visibility',
    snippet: '"visible": true',
    modules: ['camera'],
  },
  {
    key: 'visible',
    type: 'boolean',
    description: 'Layout row/column visibility (unified template on row or column)',
    snippet: '"visible": {{ states(\'input_boolean.show_section\') == \'on\' }}',
    modules: ['layout'],
  },
  { key: 'overlay_text', type: 'string', description: 'Camera overlay text', snippet: '"overlay_text": "Live"', modules: ['camera'] },
  { key: 'overlay_color', type: 'string', description: 'Camera overlay text color', snippet: '"overlay_color": "white"', modules: ['camera'] },
  {
    key: 'match',
    type: 'boolean | string',
    description: 'When true (or on/yes/1) this toggle point is selected',
    snippet: '"match": "{{ states(\'light.kitchen\') == \'on\' }}"',
    modules: ['toggle'],
  },
  {
    key: 'qr_content',
    type: 'string',
    description: 'URL or text encoded in the QR code',
    snippet: '"qr_content": "{{ states(\'input_text.guest_wifi\') }}"',
    modules: ['qr'],
  },
];

/** Full example templates by module */
const EXAMPLE_TEMPLATES: Record<string, { label: string; code: string }[]> = {
  icon: [
    {
      label: 'Simple icon by temperature',
      code: '{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %}',
    },
    {
      label: 'Battery icon and color',
      code: `{% set level = state | int %}
{
  "icon": "mdi:battery-{{ (level / 10) | round(0) * 10 }}",
  "icon_color": "{% if level <= 20 %}#FF0000{% elif level <= 50 %}#FF8800{% else %}#00CC00{% endif %}"
}`,
    },
  ],
  info: [
    {
      label: 'Icon and color by state',
      code: `{
  "icon": "{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %}",
  "icon_color": "{% if state|int > 25 %}red{% else %}blue{% endif %}",
  "state_text": "{{ state }} {{ unit }}"
}`,
    },
    {
      label: 'Full styling',
      code: `{
  "name": "{{ friendly_name }}",
  "state_text": "{{ state }}°F",
  "icon_color": "{% if state|int > 75 %}#FF0000{% else %}#00FF00{% endif %}",
  "container_background_color": "rgba(255, 0, 0, 0.1)"
}`,
    },
  ],
  text: [
    {
      label: 'Dynamic text with unit',
      code: '{{ friendly_name }}: {{ state }} {{ unit }}',
    },
    {
      label: 'Styled text via JSON',
      code: `{
  "content": "{{ friendly_name }}: {{ state }}{{ unit }}",
  "color": "{% if state_number > 30 %}#FF4444{% else %}var(--primary-text-color){% endif %}"
}`,
    },
    {
      label: 'Multi-entity summary',
      code: `{% set temp = states('sensor.temperature') %}
{% set hum = states('sensor.humidity') %}
{
  "content": "🌡 {{ temp }}° · 💧 {{ hum }}%",
  "color": "{% if temp|float > 30 %}red{% else %}var(--primary-text-color){% endif %}"
}`,
    },
  ],
  markdown: [
    {
      label: 'Status dashboard',
      code: `{
  "content": "## Status\\n\\n- **Temp:** {{ states('sensor.temp') }}°\\n- **Mode:** {{ states('climate.home') }}"
}`,
    },
    {
      label: 'Styled markdown with background',
      code: `{
  "content": "### {{ friendly_name }}\\n\\nCurrent: **{{ state }}{{ unit }}**\\n\\nLast updated: {{ as_timestamp(states.sensor.temp.last_changed) | timestamp_custom('%H:%M') }}",
  "color": "{% if state_number > 25 %}#FF6B6B{% else %}var(--primary-text-color){% endif %}",
  "container_background_color": "rgba(0,0,0,0.05)"
}`,
    },
  ],
  bar: [
    {
      label: 'Battery percentage with label',
      code: `{% set level = state | float %}
{
  "value": {{ level }},
  "label": "{{ friendly_name }} — {{ level | round(0) }}%"
}`,
    },
    {
      label: 'Disk usage with color thresholds',
      code: `{% set used = state | float %}
{
  "value": {{ used }},
  "label": "{{ friendly_name }}: {{ used | round(1) }}%",
  "color": "{% if used > 90 %}#FF0000{% elif used > 70 %}#FF8800{% else %}#4CAF50{% endif %}"
}`,
    },
  ],
  gauge: [
    {
      label: 'Temperature gauge with color',
      code: `{% set temp = state | float %}
{
  "value": {{ temp }},
  "gauge_color": "{% if temp > 25 %}#FF4444{% elif temp > 20 %}#FF8800{% else %}#00CC00{% endif %}"
}`,
    },
    {
      label: 'Humidity gauge',
      code: `{% set hum = state | float %}
{
  "value": {{ hum }},
  "gauge_color": "{% if hum > 70 %}#2196F3{% elif hum > 40 %}#4CAF50{% else %}#FF9800{% endif %}"
}`,
    },
  ],
  graphs: [
    {
      label: 'Color line by current value',
      code: `{
  "global_color": "{% if state_number > 25 %}#FF4444{% elif state_number > 15 %}#FF8800{% else %}#4CAF50{% endif %}"
}`,
    },
    {
      label: 'Multi-entity colors with fill',
      code: `{
  "colors": ["#2196F3", "#4CAF50", "#FF9800"],
  "fill_area": {{ states('input_boolean.show_fill') == 'on' }}
}`,
    },
    {
      label: 'Pie chart fill from state',
      code: `{% set pct = state | float / 100 %}
{
  "pie_fill": {{ pct | round(2) }},
  "global_color": "{% if pct > 0.8 %}#4CAF50{% elif pct > 0.5 %}#FF9800{% else %}#F44336{% endif %}"
}`,
    },
  ],
  spinbox: [
    {
      label: 'Color buttons by temperature',
      code: `{% set temp = state | float %}
{
  "button_background_color": "{% if temp > 25 %}#FF4444{% elif temp > 18 %}#FF8800{% else %}#2196F3{% endif %}",
  "button_text_color": "white",
  "value_color": "{% if temp > 25 %}#FF4444{% else %}var(--primary-text-color){% endif %}"
}`,
    },
    {
      label: 'Dimmer-style styling',
      code: `{% set level = state | int %}
{
  "button_background_color": "{% if level > 0 %}var(--primary-color){% else %}var(--disabled-color){% endif %}",
  "button_text_color": "var(--text-primary-color)",
  "value_color": "{% if level > 0 %}var(--primary-text-color){% else %}var(--disabled-text-color){% endif %}"
}`,
    },
  ],
  camera: [
    {
      label: 'Switch camera by weather',
      code: "{{ 'camera.outdoor' if is_state('weather.home', 'sunny') else 'camera.indoor' }}",
    },
    {
      label: 'Camera with overlay',
      code: `{
  "entity": "camera.front_door",
  "overlay_text": "{{ now().strftime('%H:%M') }}",
  "overlay_color": "white"
}`,
    },
  ],
  toggle: [
    {
      label: 'Match by numeric range',
      code: `{
  "match": "{{ state_attr('cover.garage', 'current_position') | int >= 15 and state_attr('cover.garage', 'current_position') | int <= 25 }}"
}`,
    },
    {
      label: 'Plain boolean Jinja',
      code: "{{ states('climate.hvac') == 'heat' and state_attr('climate.hvac', 'temperature') | float > 20 }}",
    },
  ],
  qr: [
    {
      label: 'Guest Wi\u2011Fi from helper',
      code: `{
  "qr_content": "{{ states('input_text.guest_wifi_password') }}"
}`,
    },
    {
      label: 'Plain URL string',
      code: "{{ 'https://' + states('sensor.door_url_suffix') }}",
    },
  ],
  status_summary: [
    {
      label: 'Color by entity state',
      code: `{
  "color": "{% if is_state(entity, 'on') %}#4caf50{% else %}var(--disabled-text-color){% endif %}"
}`,
    },
    {
      label: 'Plain color string',
      code: '{{ \'#2196f3\' if state|float > 25 else \'#ff9800\' }}',
    },
  ],
  layout: [
    {
      label: 'Boolean visible from helper',
      code: `{
  "visible": {{ states('input_boolean.show_section') == 'on' }}
}`,
    },
    {
      label: 'Plain true/false string',
      code: "{{ 'true' if states('sensor.count') | int > 0 else 'false' }}",
    },
  ],
};

@customElement('uc-template-cheatsheet')
export class UcTemplateCheatsheet extends LitElement {
  @property({ type: String }) public module:
    | 'icon'
    | 'info'
    | 'text'
    | 'markdown'
    | 'bar'
    | 'gauge'
    | 'graphs'
    | 'spinbox'
    | 'camera'
    | 'toggle'
    | 'qr'
    | 'status_summary'
    | 'layout' = 'info';
  @property({ type: Boolean }) public open = false;

  /**
   * When true, renders as an inline sub-pane (absolute positioned within a
   * panel) with a back-button header instead of a fixed viewport overlay.
   */
  @property({ type: Boolean }) public pane = false;

  @state() private _activeTab: CheatsheetTab = 'context';
  @state() private _copiedKey: string | null = null;

  private _escapeKeyHandler = (ev: KeyboardEvent): void => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      ev.stopPropagation();
      this._close();
    }
  };

  private _openCheatsheetHandler = (e: Event): void => {
    if (this.pane) return;
    const detail = ((e as CustomEvent).detail || {}) as { module?: string };
    this.module = (detail.module ?? 'info') as UcTemplateCheatsheet['module'];
    this.open = true;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.pane) {
      document.addEventListener(UC_OPEN_CHEATSHEET, this._openCheatsheetHandler);
    }
  }

  override disconnectedCallback(): void {
    if (!this.pane) {
      document.removeEventListener(UC_OPEN_CHEATSHEET, this._openCheatsheetHandler);
    }
    window.removeEventListener('keydown', this._escapeKeyHandler, true);
    super.disconnectedCallback();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has('open')) {
      if (this.open) {
        window.addEventListener('keydown', this._escapeKeyHandler, true);
        requestAnimationFrame(() => {
          const closeBtn = this.shadowRoot?.querySelector<HTMLElement>('.close-btn, .pane-back-btn');
          closeBtn?.focus();
        });
      } else {
        window.removeEventListener('keydown', this._escapeKeyHandler, true);
      }
    }
  }

  protected override render(): TemplateResult {
    if (!this.open) return html``;

    const filteredProperties = RETURN_PROPERTIES.filter(
      p => p.modules.includes(this.module)
    );
    const examples = EXAMPLE_TEMPLATES[this.module] || [];

    const body = html`
      ${this._activeTab === 'context'
        ? html`
            <p class="section-desc">
              Use these variables inside <code>{{ }}</code> or <code>{% %}</code> in your template.
            </p>
            <div class="entries">
              ${CONTEXT_VARIABLES.map(
                v =>
                  html`
                    <div class="entry">
                      <div class="entry-top">
                        <div class="entry-main">
                          <code class="chip">${v.key}</code>
                          <span class="type">${v.type}</span>
                        </div>
                        <div class="entry-actions">
                          <button
                            class="action-btn"
                            @click=${() => this._copyOnly(v.snippet, v.key)}
                            title="Copy to clipboard"
                          >
                            <span class="action-btn-icon"><ha-icon icon="mdi:content-copy"></ha-icon></span>
                            <span class="action-btn-text">${this._copiedKey === v.key ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            class="action-btn insert-btn"
                            @click=${() => this._insertSnippet(v.snippet)}
                            title="Insert into active field"
                          >
                            <span class="action-btn-icon"><ha-icon icon="mdi:arrow-expand-down"></ha-icon></span>
                            <span class="action-btn-text">Insert</span>
                          </button>
                        </div>
                      </div>
                      <div class="entry-desc">${v.description}</div>
                      <div class="entry-snippet"><code>${v.snippet}</code></div>
                    </div>
                  `
              )}
            </div>
          `
        : html`
            <p class="section-desc">
              Return these properties in a JSON object from your template.
            </p>
            <div class="entries">
              ${filteredProperties.map(
                p =>
                  html`
                    <div class="entry">
                      <div class="entry-top">
                        <div class="entry-main">
                          <code class="chip">${p.key}</code>
                          <span class="type">${p.type}</span>
                        </div>
                        <div class="entry-actions">
                          <button
                            class="action-btn"
                            @click=${() => this._copyOnly(p.snippet, p.key)}
                            title="Copy to clipboard"
                          >
                            <span class="action-btn-icon"><ha-icon icon="mdi:content-copy"></ha-icon></span>
                            <span class="action-btn-text">${this._copiedKey === p.key ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            class="action-btn insert-btn"
                            @click=${() => this._insertSnippet(p.snippet)}
                            title="Insert into active field"
                          >
                            <span class="action-btn-icon"><ha-icon icon="mdi:arrow-expand-down"></ha-icon></span>
                            <span class="action-btn-text">Insert</span>
                          </button>
                        </div>
                      </div>
                      <div class="entry-desc">${p.description}</div>
                      <div class="entry-snippet"><code>${p.snippet}</code></div>
                    </div>
                  `
              )}
            </div>
          `}

      ${examples.length > 0
        ? html`
            <div class="examples-section">
              <h4>Example Templates</h4>
              ${examples.map(
                ex =>
                  html`
                    <div class="example-block">
                      <div class="example-label">${ex.label}</div>
                      <div class="example-code">
                        <pre><code>${ex.code}</code></pre>
                        <div class="example-code-actions">
                          <button
                            class="copy-full-btn"
                            @click=${() => this._copyOnly(ex.code, `example-${ex.label}`)}
                          >
                            <span class="action-btn-icon"><ha-icon icon="mdi:content-copy"></ha-icon></span>
                            <span>${this._copiedKey === `example-${ex.label}` ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            class="copy-full-btn insert-full-btn"
                            @click=${() => this._insertSnippet(ex.code)}
                          >
                            <span class="action-btn-icon"><ha-icon icon="mdi:arrow-expand-down"></ha-icon></span>
                            <span>Insert</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  `
              )}
            </div>
          `
        : ''}
    `;

    if (this.pane) {
      return html`
        <div class="cheatsheet-pane">
          <div class="pane-header">
            <button class="pane-back-btn" @click=${this._close} aria-label="Back">
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <h3 class="pane-title">Template Cheatsheet</h3>
          </div>

          <div class="pane-tabs">
            <button
              class="tab ${this._activeTab === 'context' ? 'active' : ''}"
              @click=${() => (this._activeTab = 'context')}
            >
              Context Variables
            </button>
            <button
              class="tab ${this._activeTab === 'properties' ? 'active' : ''}"
              @click=${() => (this._activeTab = 'properties')}
            >
              Return Properties
            </button>
          </div>

          <div class="pane-body">
            ${body}
          </div>
        </div>
      `;
    }

    return html`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div class="dialog-content" role="dialog" aria-modal="true" aria-label="Template Cheatsheet" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <h3>Template Cheatsheet</h3>
            <button class="close-btn" @click=${this._close} aria-label="Close">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="tabs">
            <button
              class="tab ${this._activeTab === 'context' ? 'active' : ''}"
              @click=${() => (this._activeTab = 'context')}
            >
              Context Variables
            </button>
            <button
              class="tab ${this._activeTab === 'properties' ? 'active' : ''}"
              @click=${() => (this._activeTab = 'properties')}
            >
              Return Properties
            </button>
          </div>

          <div class="dialog-body">
            ${body}
          </div>
        </div>
      </div>
    `;
  }

  private _handleOverlayClick(e: Event): void {
    if (e.target === e.currentTarget) {
      this._close();
    }
  }

  private _close(): void {
    this.open = false;
    this._copiedKey = null;
    window.removeEventListener('keydown', this._escapeKeyHandler, true);
    this.dispatchEvent(new CustomEvent('close'));
  }

  private async _copyOnly(text: string, key: string): Promise<void> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      this._copiedKey = key;
      ucToastService.success('Copied to clipboard');
      setTimeout(() => (this._copiedKey = null), 1500);
    } catch (err) {
      console.warn('[UltraCard] Failed to copy:', err);
      ucToastService.info('Could not copy — try selecting manually');
    }
  }

  private _insertSnippet(text: string): void {
    // In pane mode the cheatsheet lives at the panel level, so walk up to
    // the settings panel and find the template editor inside the tab content.
    const panel = this.pane ? this.parentElement : null;
    if (panel) {
      const editor = panel.querySelector('ultra-template-editor') as any;
      if (editor?.insertAtCursor) {
        editor.insertAtCursor(text);
        ucToastService.success('Inserted into template');
        return;
      }
    }

    // Fallback: dispatch a bubbling event (works when cheatsheet is inline)
    this.dispatchEvent(
      new CustomEvent('insert-snippet', {
        detail: { value: text },
        bubbles: true,
        composed: true,
      })
    );
  }

  static override styles = css`
    :host {
      display: contents;
    }

    /* ── Pane mode (absolute within a positioned panel) ── */

    .cheatsheet-pane {
      position: absolute;
      inset: 0;
      z-index: 100;
      display: flex;
      flex-direction: column;
      background: var(--card-background-color);
      animation: ucCheatsheetIn 200ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes ucCheatsheetIn {
      from { opacity: 0; transform: translateX(16px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .pane-header {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--divider-color);
      flex-shrink: 0;
    }

    .pane-back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: none;
      border: none;
      cursor: pointer;
      border-radius: 50%;
      color: var(--primary-text-color);
      padding: 0;
      transition: background 0.15s ease;
    }

    .pane-back-btn:hover {
      background: var(--secondary-background-color);
    }

    .pane-back-btn ha-icon {
      --mdc-icon-size: 24px;
    }

    .pane-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .pane-tabs {
      display: flex;
      gap: 0;
      padding: 0 16px;
      border-bottom: 1px solid var(--divider-color);
      flex-shrink: 0;
    }

    .pane-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    /* ── Dialog overlay mode (legacy / Hub) ── */

    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: ${Z_INDEX.DIALOG_OVERLAY};
      padding: 16px;
    }

    .dialog-content {
      background: var(--card-background-color);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      z-index: ${Z_INDEX.DIALOG_CONTENT};
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--divider-color);
      flex-shrink: 0;
    }

    .dialog-header h3 {
      margin: 0;
      font-size: 17px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      color: var(--secondary-text-color);
      border-radius: 4px;
      opacity: 0.8;
    }

    .close-btn:hover {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      opacity: 1;
    }

    .close-btn ha-icon {
      width: 20px;
      height: 20px;
    }

    .tabs, .pane-tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid var(--divider-color);
      flex-shrink: 0;
    }

    .tabs {
      padding: 0 20px;
    }

    .tab {
      background: none;
      border: none;
      padding: 12px 16px;
      font-size: 13px;
      color: var(--secondary-text-color);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 0.15s ease;
    }

    .tab:hover {
      color: var(--primary-text-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
      font-weight: 500;
    }

    .dialog-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px 20px;
    }

    /* ── Shared content styles ── */

    .section-desc {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin: 0 0 14px;
      line-height: 1.5;
    }

    .section-desc code {
      background: rgba(var(--rgb-primary-color), 0.08);
      padding: 2px 5px;
      border-radius: 3px;
      font-family: ui-monospace, monospace;
      font-size: 11px;
    }

    .entries {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .entry {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px 12px;
      background: var(--secondary-background-color);
      border-radius: 6px;
      border: 1px solid transparent;
      transition: background 0.15s ease;
    }

    .entry:hover {
      background: rgba(var(--rgb-primary-color), 0.06);
    }

    .entry-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-width: 0;
    }

    .entry-main {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .chip {
      background: rgba(var(--rgb-primary-color), 0.12);
      padding: 3px 7px;
      border-radius: 4px;
      font-family: ui-monospace, monospace;
      font-size: 12px;
      font-weight: 500;
      color: var(--primary-color);
    }

    .type {
      font-size: 11px;
      color: var(--secondary-text-color);
      opacity: 0.9;
    }

    .entry-desc {
      font-size: 12px;
      color: var(--primary-text-color);
      line-height: 1.4;
      margin: 0;
    }

    .entry-snippet {
      font-size: 11px;
      margin: 0;
    }

    .entry-snippet code {
      background: var(--code-editor-background-color, #1a1a1a);
      padding: 8px 10px;
      border-radius: 4px;
      display: block;
      overflow-x: auto;
      font-family: ui-monospace, monospace;
      font-size: 11px;
      color: var(--primary-text-color);
      line-height: 1.4;
    }

    .entry-actions {
      flex-shrink: 0;
      display: flex;
      gap: 4px;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 11px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.15s ease;
      box-sizing: border-box;
      overflow: hidden;
    }

    .action-btn.insert-btn {
      background: transparent;
      color: var(--primary-color);
      border: 1px solid var(--primary-color);
    }

    .action-btn.insert-btn:hover {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
      opacity: 1;
    }

    .action-btn:hover {
      opacity: 0.92;
    }

    .action-btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 14px;
      height: 14px;
      line-height: 0;
      overflow: hidden;
    }

    .action-btn-icon ha-icon {
      --mdc-icon-size: 14px;
      width: 14px !important;
      height: 14px !important;
      min-width: 14px;
      min-height: 14px;
      max-width: 14px;
      max-height: 14px;
      display: block;
    }

    .action-btn-text {
      white-space: nowrap;
    }

    .examples-section {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--divider-color);
    }

    .examples-section h4 {
      margin: 0 0 10px;
      font-size: 13px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .example-block {
      margin-bottom: 14px;
    }

    .example-block:last-child {
      margin-bottom: 0;
    }

    .example-label {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }

    .example-code pre {
      margin: 0;
      padding: 10px 12px;
      background: var(--code-editor-background-color, #1a1a1a);
      border-radius: 6px 6px 0 0;
      overflow-x: auto;
      font-size: 11px;
      font-family: ui-monospace, monospace;
      color: var(--primary-text-color);
      line-height: 1.45;
    }

    .example-code-actions {
      display: flex;
      justify-content: flex-end;
      gap: 4px;
      padding: 6px 8px;
      background: var(--code-editor-background-color, #1a1a1a);
      border-radius: 0 0 6px 6px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .copy-full-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      font-size: 11px;
      background: rgba(255, 255, 255, 0.08);
      color: var(--primary-text-color);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .copy-full-btn:hover {
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border-color: var(--primary-color);
    }

    .insert-full-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .insert-full-btn:hover {
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border-color: var(--primary-color);
    }

    .copy-full-btn .action-btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      line-height: 0;
    }

    .copy-full-btn .action-btn-icon ha-icon {
      width: 12px !important;
      height: 12px !important;
      min-width: 12px;
      min-height: 12px;
      display: block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-template-cheatsheet': UcTemplateCheatsheet;
  }
}

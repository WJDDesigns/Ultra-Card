import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Z_INDEX } from '../utils/uc-z-index';

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
  { key: 'container_background_color', type: 'string', description: 'Container background color', snippet: '"container_background_color": "rgba(255,0,0,0.1)"', modules: ['icon', 'info'] },
  { key: 'name', type: 'string', description: 'Display name text', snippet: '"name": "{{ friendly_name }}"', modules: ['icon', 'info'] },
  { key: 'name_color', type: 'string', description: 'Name text color', snippet: '"name_color": "var(--primary-color)"', modules: ['icon', 'info'] },
  { key: 'state_text', type: 'string', description: 'State value text', snippet: '"state_text": "{{ state }} {{ unit }}"', modules: ['icon', 'info'] },
  { key: 'state_color', type: 'string', description: 'State text color', snippet: '"state_color": "green"', modules: ['icon', 'info'] },
  { key: 'content', type: 'string', description: 'Text content (text module)', snippet: '"content": "{{ state }}"', modules: ['text'] },
  { key: 'color', type: 'string', description: 'Text color (text module)', snippet: '"color": "#333"', modules: ['text'] },
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
  { key: 'visible', type: 'boolean', description: 'Camera visibility', snippet: '"visible": true', modules: ['camera'] },
  { key: 'overlay_text', type: 'string', description: 'Camera overlay text', snippet: '"overlay_text": "Live"', modules: ['camera'] },
  { key: 'overlay_color', type: 'string', description: 'Camera overlay text color', snippet: '"overlay_color": "white"', modules: ['camera'] },
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
};

@customElement('uc-template-cheatsheet')
export class UcTemplateCheatsheet extends LitElement {
  @property({ type: String }) public module: 'icon' | 'info' | 'text' | 'bar' | 'gauge' | 'graphs' | 'spinbox' | 'camera' = 'info';
  @property({ type: Boolean }) public open = false;

  @state() private _activeTab: CheatsheetTab = 'context';
  @state() private _copiedKey: string | null = null;

  private _openCheatsheetHandler = (e: Event): void => {
    const detail = (e as CustomEvent).detail;
    this.module = detail?.module ?? 'info';
    this.open = true;
  };

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener(UC_OPEN_CHEATSHEET, this._openCheatsheetHandler);
  }

  disconnectedCallback(): void {
    document.removeEventListener(UC_OPEN_CHEATSHEET, this._openCheatsheetHandler);
    super.disconnectedCallback();
  }

  protected render(): TemplateResult {
    if (!this.open) return html``;

    const filteredProperties = RETURN_PROPERTIES.filter(
      p => p.modules.includes(this.module)
    );
    const examples = EXAMPLE_TEMPLATES[this.module] || [];

    return html`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div class="dialog-content" @click=${(e: Event) => e.stopPropagation()}>
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
                                  @click=${() => this._copyOrInsert(v.snippet, v.key)}
                                  title="Copy to clipboard"
                                >
                                  <span class="action-btn-icon"><ha-icon icon="mdi:content-copy"></ha-icon></span>
                                  <span class="action-btn-text">${this._copiedKey === v.key ? 'Copied!' : 'Copy'}</span>
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
                    Return these properties in a JSON object from your template (Info/Icon modules).
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
                                  @click=${() => this._copyOrInsert(p.snippet, p.key)}
                                  title="Copy to clipboard"
                                >
                                  <span class="action-btn-icon"><ha-icon icon="mdi:content-copy"></ha-icon></span>
                                  <span class="action-btn-text">${this._copiedKey === p.key ? 'Copied!' : 'Copy'}</span>
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
                              <button
                                class="copy-full-btn"
                                @click=${() => this._copyOrInsert(ex.code, `example-${ex.label}`)}
                              >
                                <span class="action-btn-icon"><ha-icon icon="mdi:content-copy"></ha-icon></span>
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>
                        `
                    )}
                  </div>
                `
              : ''}
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
    this.dispatchEvent(new CustomEvent('close'));
  }

  private async _copyOrInsert(text: string, key: string): Promise<void> {
    try {
      // Type assertion for clipboard API
      const nav = navigator as any;
      if (nav.clipboard && nav.clipboard.writeText) {
        await nav.clipboard.writeText(text);
      }
      this._copiedKey = key;
      setTimeout(() => (this._copiedKey = null), 1500);
      this.dispatchEvent(
        new CustomEvent('insert-snippet', {
          detail: { value: text },
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      console.warn('[UltraCard] Failed to copy:', err);
    }
  }

  static styles = css`
    :host {
      display: contents;
    }

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

    .tabs {
      display: flex;
      gap: 0;
      padding: 0 20px;
      border-bottom: 1px solid var(--divider-color);
      flex-shrink: 0;
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

    .example-code {
      position: relative;
    }

    .example-code pre {
      margin: 0;
      padding: 10px 12px 10px 10px;
      padding-right: 56px;
      background: var(--code-editor-background-color, #1a1a1a);
      border-radius: 6px;
      overflow-x: auto;
      font-size: 11px;
      font-family: ui-monospace, monospace;
      color: var(--primary-text-color);
      line-height: 1.45;
    }

    .copy-full-btn {
      position: absolute;
      top: 6px;
      right: 6px;
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

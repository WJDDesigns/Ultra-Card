import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { ULTRA_DASHBOARD_STYLES, DEFAULT_DASHBOARD_STYLE } from './uc-dashboard-styles';
import type { UltraDashboardStrategyConfig, UltraDashboardStyleId } from './types';

/**
 * Config editor Home Assistant shows in the dashboard settings dialog for a
 * dashboard that uses `custom:ultra-dashboard`. Style is a visual picker; the
 * rest is an `ha-form` so area/entity selectors match the core dialogs.
 */

type FormData = {
  group_by: 'area' | 'floor';
  areas: string[];
  exclude_areas: string[];
  weather_entity: string;
  home_view: boolean;
  show_people: boolean;
  show_alerts: boolean;
  show_batteries: boolean;
  show_updates: boolean;
};

const FORM_DEFAULTS: FormData = {
  group_by: 'area',
  areas: [],
  exclude_areas: [],
  weather_entity: '',
  home_view: true,
  show_people: true,
  show_alerts: true,
  show_batteries: true,
  show_updates: true,
};

const LABELS: Record<string, string> = {
  group_by: 'Pages',
  areas: 'Only these areas',
  exclude_areas: 'Hide these areas',
  weather_entity: 'Weather',
  home_view: 'Home overview page',
  show_people: 'People',
  show_alerts: 'Alerts',
  show_batteries: 'Batteries',
  show_updates: 'Updates',
};

const DESCRIPTIONS: Record<string, string> = {
  group_by: 'One page per area, or one page per floor with every room on it.',
  areas: 'Leave empty to include every area that has devices.',
  weather_entity: 'Shown in the Home header. Defaults to your first weather entity.',
};

const SCHEMA = [
  {
    name: 'group_by',
    selector: {
      select: {
        mode: 'dropdown',
        options: [
          { value: 'area', label: 'A page for each area' },
          { value: 'floor', label: 'A page for each floor' },
        ],
      },
    },
  },
  { name: 'areas', selector: { area: { multiple: true } } },
  { name: 'exclude_areas', selector: { area: { multiple: true } } },
  { name: 'weather_entity', selector: { entity: { domain: 'weather' } } },
  {
    type: 'expandable',
    name: '',
    title: 'Home page',
    iconPath: 'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z',
    schema: [
      { name: 'home_view', selector: { boolean: {} } },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'show_people', selector: { boolean: {} } },
          { name: 'show_alerts', selector: { boolean: {} } },
          { name: 'show_batteries', selector: { boolean: {} } },
          { name: 'show_updates', selector: { boolean: {} } },
        ],
      },
    ],
  },
];

@customElement('ultra-dashboard-strategy-editor')
export class UltraDashboardStrategyEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config: UltraDashboardStrategyConfig = { type: 'custom:ultra-dashboard' };

  public setConfig(config: UltraDashboardStrategyConfig): void {
    this._config = { ...config };
  }

  private get _style(): UltraDashboardStyleId {
    return this._config.style ?? DEFAULT_DASHBOARD_STYLE;
  }

  private get _formData(): FormData {
    const c = this._config;
    return {
      group_by: c.group_by ?? FORM_DEFAULTS.group_by,
      areas: c.areas ?? FORM_DEFAULTS.areas,
      exclude_areas: c.exclude_areas ?? FORM_DEFAULTS.exclude_areas,
      weather_entity: c.weather_entity ?? FORM_DEFAULTS.weather_entity,
      home_view: c.home_view ?? FORM_DEFAULTS.home_view,
      show_people: c.show_people ?? FORM_DEFAULTS.show_people,
      show_alerts: c.show_alerts ?? FORM_DEFAULTS.show_alerts,
      show_batteries: c.show_batteries ?? FORM_DEFAULTS.show_batteries,
      show_updates: c.show_updates ?? FORM_DEFAULTS.show_updates,
    };
  }

  private _emit(next: UltraDashboardStrategyConfig): void {
    // Drop values that equal the defaults so the stored YAML stays short.
    const cleaned: UltraDashboardStrategyConfig & Record<string, unknown> = { type: next.type };
    for (const [key, value] of Object.entries(next)) {
      if (key === 'type') continue;
      const def = (FORM_DEFAULTS as Record<string, unknown>)[key];
      if (value === undefined || value === '' || value === def) continue;
      if (Array.isArray(value) && value.length === 0) continue;
      if (key === 'style' && value === DEFAULT_DASHBOARD_STYLE) continue;
      cleaned[key] = value;
    }
    this._config = cleaned;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        bubbles: true,
        composed: true,
        detail: { config: this._config },
      })
    );
  }

  private _pickStyle(style: UltraDashboardStyleId): void {
    if (style === this._style) return;
    this._emit({ ...this._config, style });
  }

  private _formChanged(e: CustomEvent): void {
    e.stopPropagation();
    const value = e.detail.value as FormData;
    this._emit({ ...this._config, ...value });
  }

  protected override render(): TemplateResult {
    return html`
      <div class="section-title">Style</div>
      <div class="styles" role="radiogroup" aria-label="Dashboard style">
        ${ULTRA_DASHBOARD_STYLES.map(
          s => html`
            <button
              type="button"
              role="radio"
              class="style ${s.id === this._style ? 'selected' : ''}"
              aria-checked=${s.id === this._style}
              @click=${() => this._pickStyle(s.id)}
            >
              <ha-icon .icon=${s.icon}></ha-icon>
              <span class="name">${s.name}</span>
              <span class="desc">${s.description}</span>
            </button>
          `
        )}
      </div>

      ${this.hass
        ? html`
            <ha-form
              .hass=${this.hass}
              .data=${this._formData}
              .schema=${SCHEMA}
              .computeLabel=${(s: { name: string }) => LABELS[s.name] ?? s.name}
              .computeHelper=${(s: { name: string }) => DESCRIPTIONS[s.name] ?? ''}
              @value-changed=${this._formChanged}
            ></ha-form>
          `
        : nothing}

      <p class="hint">
        Every card on the generated dashboard is a regular Ultra Card. Use
        <b>Take control</b> in the dashboard menu to edit cards in the visual editor.
      </p>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }
    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin: 4px 0 8px;
    }
    .styles {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px;
      margin-bottom: 20px;
    }
    .style {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      text-align: left;
      cursor: pointer;
      font: inherit;
      transition:
        border-color 120ms ease,
        box-shadow 120ms ease;
    }
    .style:hover {
      border-color: var(--primary-color);
    }
    .style.selected {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px var(--primary-color) inset;
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
    }
    .style ha-icon {
      --mdc-icon-size: 22px;
      color: var(--primary-color);
    }
    .style .name {
      font-weight: 500;
    }
    .style .desc {
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.35;
    }
    .hint {
      margin: 16px 0 0;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'ultra-dashboard-strategy-editor': UltraDashboardStrategyEditor;
  }
}

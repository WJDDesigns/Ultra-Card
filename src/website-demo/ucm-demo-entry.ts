/**
 * ultracard.io module directory — real module previews.
 *
 * Exposes <uc-module-demo type="gauge"> which renders the ACTUAL Ultra Card
 * module implementation (createDefault + renderPreview from this repo) against
 * a simulated Home Assistant, so what visitors see is pixel-identical to what
 * the module looks like on a dashboard.
 *
 * Build: npx webpack -c webpack.demo.config.js  →  dist-demo/ultra-card-demo.js
 */
import { render, html, TemplateResult } from 'lit';
import { getMdiSheet } from './ha-shims';
import { getModuleRegistry } from '../modules';
import { createDemoHass } from './demo-hass';
import { VERSION } from '../version';

const registry = getModuleRegistry();
const demoHass = createDemoHass();

// Alias entities some modules reference by hard-coded default id.
demoHass.states['weather.forecast_home'] = {
  ...demoHass.states['weather.home'],
  entity_id: 'weather.forecast_home',
};

/**
 * Per-type config overrides applied on top of createDefault() so every demo
 * is bound to a live demo entity instead of an empty "pick an entity" state.
 * Shapes mirror each module's real config schema.
 */
/** Create a fully-defaulted child module of a given type (for layout demos). */
function mk(type: string, extra: Record<string, any> = {}): any {
  const h = registry.getModule(type);
  const base = h ? h.createDefault(`demo_child_${type}_${Math.random().toString(36).slice(2, 7)}`, demoHass) : { type };
  DEMO_TWEAKS[type]?.(base);
  return Object.assign(base, extra);
}

const DEMO_TWEAKS: Record<string, (cfg: any) => void> = {
  gauge: c => (c.entity = c.entity || 'sensor.speed_test'),
  text: c => {
    c.text = 'Good evening, Wayne';
    c.font_size = 20;
  },
  info: c => {
    if (Array.isArray(c.info_entities) && c.info_entities.length) {
      c.info_entities[0].entity = 'sensor.living_room_temperature';
      c.info_entities[0].name = 'Living Room';
      c.info_entities.push({
        ...c.info_entities[0],
        id: 'demo_info_2',
        entity: 'sensor.living_room_humidity',
        name: 'Humidity',
        icon: 'mdi:water-percent',
      });
    }
  },
  markdown: c => {
    c.markdown_content =
      '### Morning briefing\n\n- Today: **sunny, 74°**\n- Trash pickup *tomorrow*\n- EV charged to **100%** ✓';
  },
  button: c => {
    c.label = 'Good Night scene';
    c.show_icon = true;
    c.icon = 'mdi:weather-night';
  },
  icon: c => {
    if (Array.isArray(c.icons) && c.icons.length) {
      c.icons[0].entity = 'light.living_room';
    }
  },
  horizontal: c => {
    c.modules = [
      mk('icon'),
      mk('text', { text: 'Living Room', font_size: 16 }),
      mk('button', { label: 'All off', icon: 'mdi:lightbulb-off' }),
    ];
  },
  vertical: c => {
    c.modules = [mk('text', { text: 'Living Room', font_size: 16 }), mk('bar'), mk('button', { label: 'Scene' })];
  },
  stack: c => {
    c.modules = [mk('image'), mk('text', { text: 'Backyard cam', font_size: 14 })];
  },
  grid_layout: c => {
    c.modules = [mk('icon'), mk('icon'), mk('icon'), mk('icon')];
    c.columns = 2;
  },
  accordion: c => {
    c.modules = [mk('info')];
    c.default_open = true;
    c.title_text = 'Climate';
  },
  tabs: c => {
    if (Array.isArray(c.sections) && c.sections.length >= 2) {
      c.sections[0].title = 'Home';
      c.sections[0].modules = [mk('info')];
      c.sections[1].title = 'Energy';
      c.sections[1].modules = [mk('bar')];
    }
  },
  popup: c => {
    c.modules = [mk('info')];
    c.trigger_button_text = 'Open climate popup';
  },
  flip_card: c => {
    c.modules = [mk('text', { text: '72.4° — tap to flip', font_size: 18 }), mk('markdown')];
  },
  drawer: c => {
    c.modules = [mk('text', { text: 'Quick actions', font_size: 15 }), mk('button', { label: 'Good Night' })];
    c.trigger_label = 'Open drawer';
  },
  scroll_row: c => {
    c.modules = [mk('icon'), mk('icon'), mk('icon'), mk('icon')];
  },
  state_switcher: c => {
    c.modules = [mk('text', { text: 'Everyone home — comfort mode', font_size: 15 })];
    c.fallback_mode = 'first';
  },
  slider: c => {
    c.modules = [
      mk('text', { text: 'Page one', font_size: 18 }),
      mk('pagebreak'),
      mk('text', { text: 'Page two', font_size: 18 }),
    ];
  },
  bar: c => {
    if (Array.isArray(c.bars) && c.bars.length) c.bars[0].entity = c.bars[0].entity || 'sensor.phone_battery';
    if ('entity' in c && !c.entity) c.entity = 'sensor.phone_battery';
  },
  light: c => (c.entity = c.entity || 'light.living_room'),
  slider_control: c => (c.entity = c.entity || 'light.living_room'),
  climate: c => (c.entity = c.entity || 'climate.downstairs'),
  humidifier: c => (c.entity = c.entity || 'humidifier.bedroom'),
  media_player: c => (c.entity = c.entity || 'media_player.kitchen_speaker'),
  camera: c => (c.entity = c.entity || 'camera.front_door'),
  cover: c => (c.entity = c.entity || 'cover.living_room_blinds'),
  fan: c => (c.entity = c.entity || 'fan.ceiling_fan'),
  lock: c => (c.entity = c.entity || 'lock.front_door'),
  vacuum: c => (c.entity = c.entity || 'vacuum.robot'),
  alarm_panel: c => (c.entity = c.entity || 'alarm_control_panel.home'),
  timer: c => (c.entity = c.entity || 'timer.pizza'),
  todo_list: c => (c.entity = c.entity || 'todo.groceries'),
  weather: c => (c.entity = c.entity || 'weather.home'),
  animated_weather: c => (c.weather_entity = c.weather_entity || c.entity || 'weather.home'),
  animated_forecast: c => (c.weather_entity = c.weather_entity || c.entity || 'weather.home'),
  dynamic_weather: c => (c.weather_entity = c.weather_entity || c.entity || 'weather.home'),
  solar_analytics: c => {
    c.solar_entity = 'sensor.solar_power';
    c.grid_entity = 'sensor.grid_power';
    c.battery_entity = 'sensor.home_battery_soc';
    c.home_entity = 'sensor.power_usage';
    c.solar_energy_entity = 'sensor.energy_today';
  },
  sports_score: c => {
    c.league = 'nba';
    c.team_id = 'bos';
    c.team_name = 'Celtics';
  },
  calendar: c => {
    if (Array.isArray(c.calendars) && c.calendars.length) {
      c.calendars[0].entity = 'calendar.family';
      c.calendars[0].name = 'Family';
    }
  },
  text_input: c => (c.entity = c.entity || 'input_text.guest_wifi'),
  number_input: c => (c.entity = c.entity || 'input_number.ev_charge_limit'),
  slider_input: c => (c.entity = c.entity || 'input_number.ev_charge_limit'),
  datetime_input: c => (c.entity = c.entity || 'input_datetime.wake_up'),
  select_input: c => (c.entity = c.entity || 'input_select.house_mode'),
  boolean_input: c => (c.entity = c.entity || 'input_boolean.guest'),
  button_input: c => (c.entity = c.entity || 'input_button.doorbell_test'),
  counter_input: c => (c.entity = c.entity || 'counter.coffee'),
  color_input: c => (c.entity = c.entity || 'light.kitchen'),
};

/** HA default dark-theme variables so modules look like a real dashboard. */
const THEME_CSS = `
:host{
  --card-background-color:#1c1c1c;
  --ha-card-background:#1c1c1c;
  --primary-background-color:#111111;
  --secondary-background-color:#282828;
  --primary-text-color:#e1e1e1;
  --secondary-text-color:#9b9b9b;
  --disabled-text-color:#6f6f6f;
  --primary-color:#03a9f4;
  --accent-color:#ff9800;
  --divider-color:rgba(225,225,225,.12);
  --state-icon-color:#9da0a2;
  --paper-item-icon-color:#9da0a2;
  --paper-item-icon-active-color:#fdd835;
  --error-color:#db4437;
  --warning-color:#ffa600;
  --success-color:#43a047;
  --info-color:#039be5;
  --ha-card-border-radius:12px;
  --ha-card-border-width:1px;
  --ha-card-border-color:rgba(225,225,225,.08);
  --ha-card-box-shadow:none;
  --mdc-icon-size:24px;
  --card-primary-font-size:14px;
  display:block;
  color:var(--primary-text-color);
  font-family:Roboto,'Open Sans',system-ui,sans-serif;
  font-size:14px;
  line-height:1.4;
}
.ucd-card{
  background:var(--card-background-color);
  border-radius:var(--ha-card-border-radius);
  border:1px solid var(--ha-card-border-color);
  padding:12px;
  box-sizing:border-box;
  width:100%;
  overflow:hidden;
}
.ucd-error{color:#9b9b9b;font-size:12px;text-align:center;padding:18px 10px}
`;

class UcModuleDemo extends HTMLElement {
  static get observedAttributes() {
    return ['type'];
  }
  private _root: ShadowRoot;
  private _holder: HTMLDivElement;
  private _unsub?: () => void;
  private _module?: any;
  private _handler?: any;
  private _raf = 0;
  private _tplListener = () => this._scheduleRender();

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = THEME_CSS;
    this._root.appendChild(style);
    this._holder = document.createElement('div');
    this._holder.className = 'ucd-card';
    this._root.appendChild(this._holder);
  }

  connectedCallback() {
    // Modules announce async data (calendars, sports, templates) via this
    // window event — same mechanism the real card listens to.
    window.addEventListener('ultra-card-template-update', this._tplListener);
    window.addEventListener('uc-qr-data-ready', this._tplListener);
    this._boot();
  }
  attributeChangedCallback(_n: string, oldV: string | null, newV: string | null) {
    if (oldV !== null && oldV !== newV) this._boot();
  }
  disconnectedCallback() {
    window.removeEventListener('ultra-card-template-update', this._tplListener);
    window.removeEventListener('uc-qr-data-ready', this._tplListener);
    this._unsub?.();
    this._unsub = undefined;
  }

  private async _boot() {
    const type = this.getAttribute('type');
    if (!type) return;
    try {
      const [, sheet] = await Promise.all([
        registry.ensureModuleLoaded(type),
        getMdiSheet().catch(() => null),
      ]);
      if (sheet) this._root.adoptedStyleSheets = [sheet];
      const handler = registry.getModule(type);
      if (!handler) throw new Error(`module "${type}" not found`);
      this._handler = handler;

      const mod = handler.createDefault(`demo_${type}`, demoHass);
      DEMO_TWEAKS[type]?.(mod);
      this._module = mod;

      // Real per-module styles from the module implementation itself.
      const styles = (handler.getStyles?.() || '') + '\n' + registry.getAllModuleStyles();
      const styleEl = document.createElement('style');
      styleEl.textContent = styles;
      this._root.appendChild(styleEl);

      this._unsub?.();
      this._unsub = demoHass.__subscribe(() => this._scheduleRender());
      this._renderNow();
    } catch (err) {
      this._holder.innerHTML = `<div class="ucd-error">Preview unavailable — see this module live on your own dashboard.</div>`;
      // eslint-disable-next-line no-console
      console.warn(`[uc-module-demo] ${type}:`, err);
    }
  }

  private _scheduleRender() {
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => this._renderNow());
  }

  private _renderNow() {
    if (!this._handler || !this._module) return;
    try {
      const tpl: TemplateResult = this._handler.renderPreview(
        this._module,
        demoHass,
        undefined,
        'live'
      );
      render(html`${tpl}`, this._holder);
    } catch (err) {
      this._holder.innerHTML = `<div class="ucd-error">Preview unavailable — see this module live on your own dashboard.</div>`;
      // eslint-disable-next-line no-console
      console.warn(`[uc-module-demo] render ${this.getAttribute('type')}:`, err);
    }
  }
}

if (!customElements.get('uc-module-demo')) {
  customElements.define('uc-module-demo', UcModuleDemo);
}

(window as any).UCDemo = {
  version: VERSION,
  hass: demoHass,
  registry,
  lit: { render, html },
  types: () => registry.getAllModuleMetadata(),
};

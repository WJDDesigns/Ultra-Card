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

/**
 * Register every module implementation up front. The bundle is eager, so this
 * is instant — and it guarantees child modules inside layout containers render
 * for real instead of as loading skeletons.
 */
const allModulesReady: Promise<void> = Promise.all(
  registry.getAllModuleMetadata().map(m => registry.ensureModuleLoaded(m.type).catch(() => {}))
).then(() => undefined);

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

const CAR_IMG = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=640&q=80';
const EARTH_GIF = 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif';

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
    c.modules = [
      mk('image', { image_type: 'url', image_url: CAR_IMG, height: '190px' }),
      mk('text', { text: 'Garage · Model S', font_size: 16, color: '#ffffff' }),
    ];
    c.aspect_ratio = '16:9';
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
    c.modules = [mk('text', { text: 'Living Room · 72.4°', font_size: 18 }), mk('markdown')];
  },
  drawer: c => {
    c.modules = [mk('text', { text: 'Quick actions', font_size: 15 }), mk('button', { label: 'Good Night' })];
    c.trigger_label = 'Open drawer';
  },
  scroll_row: c => {
    c.modules = [mk('icon'), mk('icon'), mk('icon'), mk('icon'), mk('icon'), mk('icon')];
    c.item_width = '38%';
    c.fade_edges = true;
    c.show_arrows = true;
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
  light: c => {
    // Show real preset control buttons, not the unconfigured state.
    const mk3 = (name: string, icon: string, extra: any) => ({
      id: 'demo_preset_' + name.toLowerCase().replace(/\s/g, '_'),
      name,
      icon,
      action: 'turn_on',
      entities: ['light.living_room', 'light.kitchen'],
      brightness: 255,
      rgb_color: [255, 255, 255],
      text_color: 'var(--text-primary-color)',
      icon_color: 'var(--primary-color)',
      button_color: 'var(--primary-color)',
      use_light_color_for_button: true,
      ...extra,
    });
    c.presets = [
      mk3('Bright', 'mdi:brightness-7', { brightness: 255, rgb_color: [255, 244, 224] }),
      mk3('Movie', 'mdi:movie-open', { brightness: 90, rgb_color: [128, 23, 162] }),
      mk3('All Off', 'mdi:power', { action: 'turn_off' }),
    ];
  },
  slider_control: c => {
    c.auto_contrast = true;
    c.name_color = '#0d1117';
    c.value_color = '#0d1117';
    if (Array.isArray(c.bars)) c.bars.forEach((b: any) => (b.entity = b.entity || 'light.living_room'));
  },
  camera: c => {
    c.entity = c.entity || 'camera.front_door';
    c.view_mode = 'live';
    c.camera_name = 'Koala Cam';
    c.show_name = true;
  },
  graphs: c => {
    c.entities = [
      { id: 'demo_g1', entity: 'sensor.living_room_temperature', name: 'Living Room', color: '#29b6f6' },
      { id: 'demo_g2', entity: 'sensor.living_room_humidity', name: 'Humidity', color: '#b44ce0' },
    ];
    c.title = 'Temperature · 24h';
    c.chart_height = 170;
  },
  background: c => {
    c.background_type = 'image';
    c.background_image = EARTH_GIF;
    c.background_size = 'cover';
    c.background_position = 'center';
  },
  status_summary: c => {
    c.enable_auto_filter = false;
    c.entities = [
      { id: 'demo_ss1', entity: 'binary_sensor.front_door' },
      { id: 'demo_ss2', entity: 'binary_sensor.garage_motion' },
      { id: 'demo_ss3', entity: 'lock.front_door' },
      { id: 'demo_ss4', entity: 'switch.washer_power' },
    ];
    c.max_items_to_show = 4;
  },
  navigation: c => {
    c.nav_routes = [
      { id: 'demo_n1', icon: 'mdi:home', label: 'Home', selected: true },
      { id: 'demo_n2', icon: 'mdi:lightbulb', label: 'Lights' },
      { id: 'demo_n3', icon: 'mdi:thermostat', label: 'Climate' },
      { id: 'demo_n4', icon: 'mdi:shield-home', label: 'Security' },
      { id: 'demo_n5', icon: 'mdi:cog', label: 'More' },
    ];
  },
  people: c => (c.person_entity = 'person.tony'),
  'dynamic-list': c => {
    c.source_type = 'todo';
    c.todo_entity = 'todo.groceries';
  },
  area_summary: c => {
    c.area_id = 'living_room';
    c.temperature_entity = 'sensor.living_room_temperature';
    c.humidity_entity = 'sensor.living_room_humidity';
  },
  auto_entity_list: c => {
    c.include_domains = ['light'];
    c.max_items = 3;
  },
  washer: c => {
    Object.assign(c, {
      entity: 'sensor.washer_machine_state',
      name: 'Washer',
      power_switch_entity: 'switch.washer_power',
      machine_state_entity: 'sensor.washer_machine_state',
      job_state_entity: 'sensor.washer_job_state',
      completion_time_entity: 'sensor.washer_completion_time',
      power_entity: 'sensor.washer_power',
      energy_entity: 'sensor.washer_energy',
      door_entity: 'binary_sensor.washer_door',
    });
  },
  dryer: c => {
    Object.assign(c, {
      entity: 'sensor.dryer_machine_state',
      name: 'Dryer',
      power_switch_entity: 'switch.dryer_power',
      machine_state_entity: 'sensor.dryer_machine_state',
      job_state_entity: 'sensor.dryer_job_state',
      completion_time_entity: 'sensor.dryer_completion_time',
      power_entity: 'sensor.dryer_power_w',
    });
  },
  dishwasher: c => {
    Object.assign(c, {
      entity: 'sensor.dishwasher_machine_state',
      name: 'Dishwasher',
      power_switch_entity: 'switch.dishwasher_power',
      machine_state_entity: 'sensor.dishwasher_machine_state',
      job_state_entity: 'sensor.dishwasher_job_state',
      completion_time_entity: 'sensor.dishwasher_completion_time',
    });
  },
  fridge: c => {
    Object.assign(c, {
      entity: 'sensor.fridge_temp',
      name: 'Refrigerator',
      fridge_door_entity: 'binary_sensor.fridge_door',
      freezer_door_entity: 'binary_sensor.freezer_door',
      fridge_temp_entity: 'sensor.fridge_temp',
      freezer_temp_entity: 'sensor.freezer_temp',
      fridge_setpoint_entity: 'sensor.fridge_setpoint',
      freezer_setpoint_entity: 'sensor.freezer_setpoint',
    });
  },
  range: c => {
    Object.assign(c, {
      entity: 'sensor.oven_temp',
      name: 'Range',
      oven_mode_entity: 'sensor.oven_mode',
      oven_temp_entity: 'sensor.oven_temp',
      oven_setpoint_entity: 'sensor.oven_setpoint',
    });
  },
  climate: c => (c.entity = c.entity || 'climate.downstairs'),
  humidifier: c => (c.entity = c.entity || 'humidifier.bedroom'),
  media_player: c => (c.entity = c.entity || 'media_player.kitchen_speaker'),
  cover: c => (c.entity = c.entity || 'cover.living_room_blinds'),
  fan: c => (c.entity = c.entity || 'fan.ceiling_fan'),
  lock: c => (c.entity = c.entity || 'lock.front_door'),
  vacuum: c => (c.entity = c.entity || 'vacuum.robot'),
  alarm_panel: c => (c.entity = c.entity || 'alarm_control_panel.home'),
  timer: c => (c.entity = c.entity || 'timer.pizza'),
  todo_list: c => (c.entity = c.entity || 'todo.groceries'),
  weather: c => (c.weather_entity = c.weather_entity || 'weather.home'),
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
  text_input: c => {
    c.entity = c.entity || 'input_text.guest_wifi';
    c.placeholder = 'Enter text here';
    c.label = 'Guest Wi-Fi Name';
  },
  number_input: c => (c.entity = c.entity || 'input_number.ev_charge_limit'),
  slider_input: c => (c.entity = c.entity || 'input_number.ev_charge_limit'),
  datetime_input: c => (c.entity = c.entity || 'input_datetime.wake_up'),
  select_input: c => (c.entity = c.entity || 'input_select.house_mode'),
  boolean_input: c => (c.entity = c.entity || 'input_boolean.guest'),
  button_input: c => (c.entity = c.entity || 'input_button.doorbell_test'),
  counter_input: c => (c.entity = c.entity || 'counter.coffee'),
  color_input: c => {
    c.entity = 'input_text.accent_color';
    c.show_hex_input = true;
    c.show_preview = true;
  },
};

/**
 * Post-render staging: put certain modules into their "open"/mid-action state
 * so a static (non-interactive) preview still shows what they do.
 * Runs once per element, ~400ms after first render.
 */
function clickFirst(holder: HTMLElement, selectors: string[]): boolean {
  for (const sel of selectors) {
    const el = holder.querySelector(sel) as HTMLElement | null;
    if (el) {
      el.click();
      return true;
    }
  }
  return false;
}

const DEMO_STAGE: Record<string, (holder: HTMLElement) => void> = {
  dropdown: holder => {
    clickFirst(holder, ['.dropdown-selected', '.custom-dropdown', 'select', 'button']);
  },
  drawer: holder => {
    clickFirst(holder, ['.drawer-trigger-btn', '[class*="trigger"]', 'button', '[role="button"]']);
    // The drawer portals a fixed full-viewport overlay to document.body —
    // pull it into the preview card so it displays inline and cannot block the page.
    setTimeout(() => {
      const portal = document.querySelector('.ultra-drawer-portal') as HTMLElement;
      if (portal && !holder.contains(portal)) {
        holder.style.position = 'relative';
        holder.style.minHeight = '170px';
        holder.appendChild(portal);
        portal.style.position = 'absolute';
        portal.style.inset = '0';
        portal.style.zIndex = '5';
        portal.style.pointerEvents = 'none';
      }
    }, 300);
  },
  popup: holder => {
    clickFirst(holder, ['[class*="trigger"]', 'button', '[role="button"]']);
    // The popup portals a fixed-position overlay to document.body — pull it
    // into the preview so it displays inside the card instead of the page.
    setTimeout(() => {
      const overlay = document.querySelector('.ultra-popup-overlay') as HTMLElement;
      if (overlay && !holder.contains(overlay)) {
        holder.style.position = 'relative';
        holder.appendChild(overlay);
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.zIndex = '5';
        const dialog = overlay.firstElementChild as HTMLElement;
        if (dialog) {
          dialog.style.maxWidth = '92%';
          dialog.style.maxHeight = '92%';
        }
      }
    }, 250);
  },
  flip_card: holder => {
    const flipper = holder.querySelector('.flip-card-inner, [style*="preserve-3d"]') as HTMLElement;
    if (flipper) {
      flipper.style.transition = 'none';
      flipper.style.transform = 'rotateY(38deg)';
      (holder.style as any).perspective = '700px';
    }
  },
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
        allModulesReady,
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

      const stage = DEMO_STAGE[type];
      if (stage) setTimeout(() => { try { stage(this._holder); } catch (e) { /* staging is best-effort */ } }, 400);
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
    const type = this.getAttribute('type') || '';
    // Navigation and Background produce view-wide chrome that is invisible
    // inside a single card, so their demos stage the module's EFFECT: a mini
    // dashboard view with the navbar dock / view background applied, built
    // from the module's real config.
    if (type === 'navigation') {
      const routes: any[] = (this._module.nav_routes || []).slice(0, 5);
      this._holder.innerHTML = `
        <div style="position:relative;height:150px;border-radius:10px;overflow:hidden;background:var(--primary-background-color)">
          <div style="position:absolute;inset:10px 10px 58px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div style="background:var(--card-background-color);border-radius:10px"></div>
            <div style="background:var(--card-background-color);border-radius:10px"></div>
          </div>
          <div style="position:absolute;left:12px;right:12px;bottom:10px;display:flex;justify-content:space-around;align-items:center;
            padding:7px 6px;background:rgba(28,28,28,.85);border-radius:14px;border:1px solid rgba(255,255,255,.08);
            backdrop-filter:blur(16px) saturate(180%);box-shadow:0 8px 24px rgba(0,0,0,.16)">
            ${routes
              .map(
                (r, i) => `
              <div style="text-align:center;color:${i === 0 ? 'var(--primary-color)' : 'var(--secondary-text-color)'}">
                <ha-icon icon="${r.icon || 'mdi:circle'}" style="--mdc-icon-size:20px"></ha-icon>
                <div style="font-size:9px;font-weight:600">${r.label || ''}</div>
              </div>`
              )
              .join('')}
          </div>
        </div>`;
      return;
    }
    if (type === 'background') {
      this._holder.innerHTML = `
        <div style="position:relative;height:160px;border-radius:10px;overflow:hidden;
          background-image:url('${EARTH_GIF}');background-size:cover;background-position:center">
          <div style="position:absolute;inset:0;background:rgba(0,0,0,.25)"></div>
          <div style="position:absolute;left:12px;top:12px;right:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div style="background:rgba(28,28,28,.82);border-radius:10px;padding:10px;color:var(--primary-text-color);font-size:12px">
              <b>Living Room</b><br><span style="color:var(--secondary-text-color)">72.4 °F · 41 %</span></div>
            <div style="background:rgba(28,28,28,.82);border-radius:10px;padding:10px;color:var(--primary-text-color);font-size:12px">
              <b>3 lights on</b><br><span style="color:var(--secondary-text-color)">house locked</span></div>
          </div>
          <div style="position:absolute;bottom:8px;right:10px;font-size:9.5px;color:rgba(255,255,255,.8);background:rgba(0,0,0,.4);padding:2px 8px;border-radius:99px">
            View background · applied behind your cards</div>
        </div>`;
      return;
    }
    try {
      // A few other modules render view-wide effects on the dashboard, so they
      // use the 'live' editor representation instead.
      const ctxOverrides: Record<string, 'live' | 'dashboard'> = {
        video_bg: 'live',
        screensaver: 'live',
        dynamic_weather: 'live',
        living_canvas: 'live',
      };
      const tpl: TemplateResult = this._handler.renderPreview(
        this._module,
        demoHass,
        undefined,
        ctxOverrides[type] || 'dashboard'
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

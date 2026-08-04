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
    const batteryBar = mk('bar');
    if (Array.isArray(batteryBar.bars) && batteryBar.bars.length) {
      batteryBar.bars = [batteryBar.bars[0]];
      batteryBar.bars[0].entity = 'sensor.home_battery_soc';
      batteryBar.bars[0].name = 'Battery';
    }
    if ('entity' in batteryBar) batteryBar.entity = 'sensor.home_battery_soc';
    c.modules = [
      mk('image', { image_type: 'url', image_url: CAR_IMG, height: '190px' }),
      mk('vertical', {
        modules: [mk('text', { text: 'Garage · Model S', font_size: 15, color: '#ffffff' }), batteryBar],
      }),
    ];
    c.aspect_ratio = '16:9';
  },
  grid: c => {
    c.entities = [
      { id: 'demo_ge1', entity: 'light.living_room' },
      { id: 'demo_ge2', entity: 'light.kitchen' },
      { id: 'demo_ge3', entity: 'switch.guest_mode' },
      { id: 'demo_ge4', entity: 'cover.living_room_blinds' },
      { id: 'demo_ge5', entity: 'fan.ceiling_fan' },
      { id: 'demo_ge6', entity: 'lock.front_door' },
    ];
    c.columns = 3;
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
      mk3('Bright', 'mdi:brightness-7', { brightness: 255, rgb_color: [255, 244, 224], text_color: '#1a1a1a', icon_color: '#1a1a1a' }),
      mk3('Movie', 'mdi:movie-open', { brightness: 90, rgb_color: [128, 23, 162], text_color: '#ffffff', icon_color: '#ffffff' }),
      mk3('All Off', 'mdi:power', { action: 'turn_off', text_color: '#1a1a1a', icon_color: '#1a1a1a' }),
    ];
  },
  slider_control: c => {
    c.auto_contrast = false;
    c.name_color = '#1c1c1c';
    c.value_color = '#1c1c1c';
    (c as any).icon_color = '#1c1c1c';
    if (Array.isArray(c.bars) && c.bars.length) {
      const pick = c.bars.find((b: any) => b.type === 'color_temp') || c.bars[0];
      pick.entity = pick.entity || 'light.living_room';
      c.bars = [pick];
    }
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
    c.style_preset = 'photo_overlay';
    c.room_background_type = 'url';
    (c as any).room_background_url = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=75';
    c.room_background_image = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=75';
    c.room_background_overlay = 65;
  },
  auto_entity_list: c => {
    c.include_domains = ['light'];
    c.max_items = 3;
  },
  laundry_tracker: c => {
    c.appliances = [
      { id: 'demo_lt_w', kind: 'washer', name: 'Washer', power_entity: 'sensor.washer_power' },
      { id: 'demo_lt_d', kind: 'dryer', name: 'Dryer', power_entity: 'sensor.dryer_power_w' },
    ];
  },
  plant_care: c => {
    c.todo_entity = 'todo.groceries';
    c.plants = [
      { id: 'demo_p1', name: 'Monstera', icon: 'mdi:leaf', location: 'Living Room', moisture_entity: 'sensor.monstera_moisture', water_interval_days: 7 },
      { id: 'demo_p2', name: 'Snake Plant', icon: 'mdi:sprout', location: 'Office', moisture_entity: 'sensor.snake_plant_moisture', water_interval_days: 14 },
      { id: 'demo_p3', name: 'Basil', icon: 'mdi:flower', location: 'Kitchen', moisture_entity: 'sensor.basil_moisture', water_interval_days: 30 },
    ];
    c.columns = 3;
    c.show_photos = false;
  },
  vampire_power: c => {
    c.discovery_mode = 'manual';
    c.entities = ['sensor.tv_standby', 'sensor.console_standby', 'sensor.desktop_standby'];
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
  media_player: c => {
    c.entity = c.entity || 'media_player.kitchen_speaker';
    c.card_size = 150;
  },
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
  screensaver: c => {
    c.weather_entity = 'weather.home';
    c.overlay_style = 'classic';
    c.show_clock = true;
    c.show_date = true;
    c.show_weather = true;
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
  accordion: holder => {
    // Open and close on a relaxed loop.
    const header = holder.querySelector('button') as HTMLElement | null;
    if (header) {
      const id = setInterval(() => {
        if (!holder.isConnected) {
          clearInterval(id);
          return;
        }
        (holder.querySelector('button') as HTMLElement | null)?.click();
      }, 3600);
    }
  },
  tabs: holder => {
    let idx = 1;
    const id = setInterval(() => {
      if (!holder.isConnected) {
        clearInterval(id);
        return;
      }
      const tabBtns = Array.from(holder.querySelectorAll('button')).slice(0, 2) as HTMLElement[];
      if (tabBtns.length >= 2) {
        tabBtns[idx % 2].click();
        idx++;
      }
    }, 4000);
  },
  __unused_popup: holder => {
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
  screensaver: holder => {
    // The overlay normally fills the viewport when idle — contain it in-card.
    const ss = holder.querySelector('[class*="uc-ss"]') as HTMLElement | null;
    const target = ss ? (ss.closest('[class*="overlay"]') as HTMLElement) || ss : null;
    const root = (target?.parentElement?.closest('div') as HTMLElement) || target;
    [target, root].forEach(el => {
      if (!el) return;
      el.style.position = 'relative';
      el.style.inset = 'auto';
      el.style.width = '100%';
      el.style.height = '170px';
      el.style.borderRadius = '10px';
      el.style.overflow = 'hidden';
    });
  },
  flip_card: holder => {
    const flipper = holder.querySelector('.flip-card-inner, [style*="preserve-3d"]') as HTMLElement;
    if (flipper) {
      flipper.style.transition = 'none';
      flipper.style.animation = 'ucdFlip 9s ease-in-out infinite';
      (holder.style as any).perspective = '800px';
      holder.querySelectorAll('.flip-card-front, .flip-card-back').forEach(el => {
        const f = el as HTMLElement;
        f.style.display = 'flex';
        f.style.alignItems = 'center';
        f.style.justifyContent = 'center';
      });
    }
  },
  stack: holder => {
    // Darken the photo layer so overlaid text stays readable.
    const img = holder.querySelector('img') as HTMLElement | null;
    if (img) img.style.filter = 'brightness(.55)';
  },
  slider: holder => {
    // Cycle pages so the slideshow is visibly working.
    let i = 1;
    const id = setInterval(() => {
      if (!holder.isConnected) { clearInterval(id); return; }
      const dots = holder.querySelectorAll('.pagination-dot, [class*="pagination"] button, [class*="dot"]');
      if (dots.length >= 2) { (dots[i % dots.length] as HTMLElement).click(); i++; }
    }, 3500);
  },
};

/* ──────────────────────────────────────────────────────────────────────────
 * Ambient demo animation: entity values ease up and down on a loop so bars,
 * sliders, steppers and toggles move like a living home. Starts once.
 * ────────────────────────────────────────────────────────────────────────── */
let demoLoopStarted = false;
function tween(
  entityId: string,
  opts: { attr?: string; from: number; to: number; ms: number; decimals?: number }
) {
  const steps = Math.max(2, Math.round(opts.ms / 90));
  let i = 0;
  const id = setInterval(() => {
    i++;
    const t = i / steps;
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
    const raw = opts.from + (opts.to - opts.from) * e;
    const v = opts.decimals !== undefined ? Number(raw.toFixed(opts.decimals)) : Math.round(raw);
    const st = demoHass.states[entityId];
    if (!st) {
      clearInterval(id);
      return;
    }
    if (opts.attr) demoHass.__setState(entityId, st.state, { [opts.attr]: v });
    else demoHass.__setState(entityId, String(v));
    if (i >= steps) clearInterval(id);
  }, 90);
}
function startDemoLoop() {
  if (demoLoopStarted) return;
  demoLoopStarted = true;
  let phase = 0;
  const cycle = () => {
    if (document.hidden || !((window as any).__ucdVisible > 0)) return;
    const up = phase % 2 === 0;
    tween('sensor.phone_battery', { from: up ? 82 : 58, to: up ? 58 : 82, ms: 2600 });
    tween('sensor.speed_test', { from: up ? 62 : 85, to: up ? 85 : 62, ms: 2600 });
    tween('sensor.power_usage', { from: up ? 1240 : 2150, to: up ? 2150 : 1240, ms: 2600 });
    tween('sensor.living_room_temperature', { from: up ? 72.4 : 73.8, to: up ? 73.8 : 72.4, ms: 2600, decimals: 1 });
    tween('light.living_room', { attr: 'brightness', from: up ? 178 : 70, to: up ? 70 : 178, ms: 2600 });
    tween('input_number.ev_charge_limit', { from: up ? 80 : 60, to: up ? 60 : 80, ms: 2600 });
    tween('humidifier.bedroom', { attr: 'humidity', from: up ? 45 : 55, to: up ? 55 : 45, ms: 2600 });
    tween('cover.living_room_blinds', { attr: 'current_position', from: up ? 40 : 80, to: up ? 80 : 40, ms: 2600 });
    tween('fan.ceiling_fan', { attr: 'percentage', from: up ? 66 : 33, to: up ? 33 : 66, ms: 2600 });
    tween('sensor.home_battery_soc', { from: up ? 84 : 64, to: up ? 64 : 84, ms: 2600 });
    const coffee = Number(demoHass.states['counter.coffee']?.state || 3);
    demoHass.__setState('counter.coffee', String(coffee >= 6 ? 3 : coffee + 1));
    if (phase % 2 === 1) {
      const b = demoHass.states['input_boolean.guest'];
      if (b) demoHass.__setState('input_boolean.guest', b.state === 'on' ? 'off' : 'on');
    }
    const sel = demoHass.states['input_select.house_mode'];
    if (sel) {
      const options: string[] = sel.attributes.options || [];
      const next = options[(options.indexOf(sel.state) + 1) % options.length];
      if (next) demoHass.__setState('input_select.house_mode', next);
    }
    phase++;
  };
  setTimeout(cycle, 1200);
  setInterval(cycle, 4200);
}

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
/* Fallback range-input styling so slider tracks are always visible outside HA.
   Module-provided styles load after this sheet and win where they exist. */
input[type=range]{-webkit-appearance:none;appearance:none;height:18px;background:transparent}
input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:rgba(255,255,255,.22)}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;
  background:var(--primary-color,#03a9f4);margin-top:-5px;box-shadow:0 1px 4px rgba(0,0,0,.4)}
input[type=range]::-moz-range-track{height:6px;border-radius:3px;background:rgba(255,255,255,.22)}
input[type=range]::-moz-range-thumb{width:16px;height:16px;border:0;border-radius:50%;background:var(--primary-color,#03a9f4)}
/* keyframes for staged effect demos (must live in this shadow scope) */
@keyframes ucdRain{to{transform:translateY(220px)}}
@keyframes ucdDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(8px,-5px)}}
@keyframes ucdAurora{0%,100%{transform:translateX(-10%) skewX(-5deg) scale(1)}50%{transform:translateX(10%) skewX(5deg) scale(1.08)}}
@keyframes ucdFogA{0%,100%{transform:translateX(0)}50%{transform:translateX(26%)}}
@keyframes ucdFogB{0%,100%{transform:translateX(0)}50%{transform:translateX(-24%)}}
@keyframes ucdFogBigA{0%,100%{transform:translate(-14%,0) scale(1)}50%{transform:translate(34%,-8%) scale(1.15)}}
@keyframes ucdFogBigB{0%,100%{transform:translate(10%,4%) scale(1.1)}50%{transform:translate(-30%,-4%) scale(1)}}
@keyframes ucdAuroraBig{0%,100%{transform:translate(-16%,-4%) rotate(-4deg) scale(1)}50%{transform:translate(16%,6%) rotate(5deg) scale(1.18)}}
@keyframes ucdDrawerSlide{0%,12%{transform:translateX(105%)}26%,72%{transform:translateX(0)}86%,100%{transform:translateX(105%)}}
@keyframes ucdFlip{0%,32%{transform:rotateY(0)}45%,82%{transform:rotateY(180deg)}95%,100%{transform:rotateY(360deg)}}
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
  private _visible = true;
  private _vio?: IntersectionObserver;
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
    this._vio = new IntersectionObserver(entries => {
      const was = this._visible;
      this._visible = entries[0]?.isIntersecting ?? true;
      const w = window as any;
      w.__ucdVisible = (w.__ucdVisible || 0) + (this._visible ? 1 : 0) - (was ? 1 : 0);
      if (this._visible && !was) this._scheduleRender();
    }, { rootMargin: '120px' });
    this._vio.observe(this);
    startDemoLoop();
    this._boot();
  }
  attributeChangedCallback(_n: string, oldV: string | null, newV: string | null) {
    if (oldV !== null && oldV !== newV) this._boot();
  }
  disconnectedCallback() {
    window.removeEventListener('ultra-card-template-update', this._tplListener);
    window.removeEventListener('uc-qr-data-ready', this._tplListener);
    if (this._visible) {
      const w = window as any;
      w.__ucdVisible = Math.max(0, (w.__ucdVisible || 0) - 1);
      this._visible = false;
    }
    this._vio?.disconnect();
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
    if (!this._visible) return;
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
    if (type === 'popup') {
      // Inline sample: the real popup portals a fixed overlay over the page.
      this._holder.innerHTML = `
        <div style="position:relative;height:170px;border-radius:10px;overflow:hidden;background:var(--primary-background-color)">
          <div style="position:absolute;inset:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;filter:brightness(.45)">
            <div style="background:var(--card-background-color);border-radius:10px"></div>
            <div style="background:var(--card-background-color);border-radius:10px"></div>
          </div>
          <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:76%;background:var(--card-background-color);
            border:1px solid rgba(255,255,255,.12);border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.6);padding:12px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;color:var(--primary-text-color);font-size:13px;font-weight:700">
              Climate <ha-icon icon="mdi:close" style="--mdc-icon-size:16px;color:var(--secondary-text-color)"></ha-icon></div>
            <div style="display:flex;gap:10px;align-items:center;color:var(--primary-text-color);font-size:12px">
              <ha-icon icon="mdi:thermometer" style="--mdc-icon-size:18px;color:var(--primary-color)"></ha-icon>
              <div><b>Living Room</b><div style="color:var(--secondary-text-color);font-size:11px">Heating to 72°F</div></div>
              <b style="margin-left:auto;font-size:15px">73.3°F</b></div>
          </div>
        </div>`;
      return;
    }
    if (type === 'drawer') {
      // The real drawer portals a full-viewport overlay — stage its effect
      // inline instead so it never covers the page.
      this._holder.innerHTML = `
        <div style="position:relative;height:170px;border-radius:10px;overflow:hidden;background:var(--primary-background-color)">
          <div style="position:absolute;inset:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;filter:brightness(.55)">
            <div style="background:var(--card-background-color);border-radius:10px"></div>
            <div style="background:var(--card-background-color);border-radius:10px"></div>
          </div>
          <div style="position:absolute;top:0;right:0;bottom:0;width:58%;background:var(--card-background-color);
            border-left:1px solid rgba(255,255,255,.1);box-shadow:-12px 0 30px rgba(0,0,0,.45);padding:12px;display:flex;flex-direction:column;gap:8px;
            animation:ucdDrawerSlide 7s ease-in-out infinite">
            <div style="display:flex;justify-content:space-between;align-items:center;color:var(--primary-text-color);font-size:13px;font-weight:700">
              Quick actions <ha-icon icon="mdi:close" style="--mdc-icon-size:16px;color:var(--secondary-text-color)"></ha-icon></div>
            <div style="display:flex;gap:8px;align-items:center;background:rgba(255,255,255,.05);border-radius:8px;padding:8px;color:var(--primary-text-color);font-size:12px">
              <ha-icon icon="mdi:weather-night" style="--mdc-icon-size:17px;color:var(--primary-color)"></ha-icon> Good Night</div>
            <div style="display:flex;gap:8px;align-items:center;background:rgba(255,255,255,.05);border-radius:8px;padding:8px;color:var(--primary-text-color);font-size:12px">
              <ha-icon icon="mdi:lock" style="--mdc-icon-size:17px;color:var(--primary-color)"></ha-icon> Lock up</div>
            <div style="display:flex;gap:8px;align-items:center;background:rgba(255,255,255,.05);border-radius:8px;padding:8px;color:var(--primary-text-color);font-size:12px">
              <ha-icon icon="mdi:lightbulb-off" style="--mdc-icon-size:17px;color:var(--primary-color)"></ha-icon> All off</div>
          </div>
        </div>`;
      return;
    }
    if (type === 'screensaver') {
      // Replica of the classic screensaver overlay (clock, date, weather, hint).
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      this._holder.innerHTML = `
        <div style="position:relative;height:180px;border-radius:10px;overflow:hidden;background:#000;display:flex;align-items:center;justify-content:center">
          <div style="text-align:center">
            <div class="ucd-ss-clock" style="font-size:44px;font-weight:300;color:rgba(255,255,255,.95);letter-spacing:.02em;line-height:1">${time}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:6px">${date}</div>
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;color:rgba(255,255,255,.85)">
              <ha-icon icon="mdi:weather-partly-cloudy" style="--mdc-icon-size:22px"></ha-icon>
              <span style="font-size:16px">74°F</span></div>
          </div>
          <div style="position:absolute;bottom:10px;left:0;right:0;text-align:center;font-size:10px;color:rgba(255,255,255,.35)">Tap anywhere to dismiss</div>
        </div>`;
      const clock = this._holder.querySelector('.ucd-ss-clock') as HTMLElement;
      const tick = setInterval(() => {
        if (!this._holder.isConnected) {
          clearInterval(tick);
          return;
        }
        if (clock) clock.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      }, 15000);
      return;
    }
    if (type === 'dynamic_weather') {
      const drops = Array.from({ length: 44 }, () =>
        `<span style="position:absolute;left:${Math.round(Math.random() * 98)}%;top:${-Math.round(Math.random() * 100) - 10}%;width:2px;height:${10 + Math.round(Math.random() * 8)}px;border-radius:2px;background:rgba(140,200,255,.7);animation:ucdRain ${(0.7 + Math.random() * 0.7).toFixed(2)}s linear ${(Math.random() * 1.4).toFixed(2)}s infinite"></span>`
      ).join('');
      this._holder.innerHTML = `
        <div style="position:relative;height:170px;border-radius:10px;overflow:hidden;background:linear-gradient(180deg,#141d2b,#0b111c)">
          ${drops}
          <div style="position:absolute;left:12px;right:12px;bottom:10px;display:flex;justify-content:space-between;align-items:center;background:rgba(15,20,28,.6);backdrop-filter:blur(3px);border-radius:9px;padding:8px 12px;color:var(--primary-text-color);font-size:11.5px">
            <span>Rain effect · view-wide</span><b style="color:#6fd4ff">66°</b></div>
        </div>`;
      return;
    }
    if (type === 'video_bg') {
      this._holder.innerHTML = `
        <div style="position:relative;height:170px;border-radius:10px;overflow:hidden;background:#05070d">
          <div style="position:absolute;inset:-45%;filter:blur(22px);opacity:.95;animation:ucdAuroraBig 6s ease-in-out infinite;
            background:radial-gradient(40% 55% at 30% 40%,rgba(41,182,246,.7),transparent 65%),
                       radial-gradient(45% 50% at 72% 55%,rgba(128,23,162,.75),transparent 65%),
                       radial-gradient(30% 45% at 50% 25%,rgba(255,45,120,.5),transparent 60%)"></div>
          <div style="position:absolute;top:10px;left:12px;display:flex;align-items:center;gap:6px;color:rgba(255,255,255,.8);font-size:10.5px">
            <ha-icon icon="mdi:play-circle-outline" style="--mdc-icon-size:16px"></ha-icon> ambient_loop.mp4 · when weather = rain</div>
          <div style="position:absolute;bottom:10px;left:12px;right:12px;background:rgba(15,20,28,.55);backdrop-filter:blur(4px);border-radius:9px;padding:8px 12px;color:var(--primary-text-color);font-size:11.5px">
            Your modules float above the video</div>
        </div>`;
      return;
    }
    if (type === 'living_canvas') {
      this._holder.innerHTML = `
        <div style="position:relative;height:170px;border-radius:10px;overflow:hidden;background:linear-gradient(180deg,#0c1118,#05070d)">
          <span style="position:absolute;left:-30%;top:30%;width:90%;height:60%;border-radius:50%;background:rgba(200,215,235,.10);filter:blur(22px);animation:ucdFogBigA 8s ease-in-out infinite"></span>
          <span style="position:absolute;left:20%;top:45%;width:85%;height:55%;border-radius:50%;background:rgba(180,200,225,.08);filter:blur(26px);animation:ucdFogBigB 10s ease-in-out infinite"></span>
          <span style="position:absolute;left:-10%;top:60%;width:80%;height:50%;border-radius:50%;background:rgba(220,230,245,.07);filter:blur(20px);animation:ucdFogBigA 7s 2s ease-in-out infinite"></span>
          <div style="position:absolute;top:10px;left:12px;color:rgba(255,255,255,.7);font-size:10.5px">WebGL · preset: Fog</div>
          <div style="position:absolute;bottom:10px;left:12px;right:12px;background:rgba(15,20,28,.5);backdrop-filter:blur(3px);border-radius:9px;padding:8px 12px;color:var(--primary-text-color);font-size:11.5px">
            Full-view canvas · reacts to time and weather</div>
        </div>`;
      return;
    }
    if (type === 'dog_duty') {
      this._holder.innerHTML = `
        <div style="position:relative;height:180px;border-radius:10px;overflow:hidden;background:linear-gradient(165deg,#2c4a22,#1c3316 55%,#142610)">
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(100deg,rgba(255,255,255,.03) 0 26px,transparent 26px 52px)"></div>
          <div style="position:absolute;left:6%;top:10%;right:6%;bottom:24%;border:1.5px dashed rgba(160,220,140,.35);border-radius:8px"></div>
          <span class="dog-duty-emoji" style="position:absolute;left:24%;top:34%;font-size:20px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))">💩</span>
          <span class="dog-duty-emoji" style="position:absolute;left:58%;top:52%;font-size:20px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))">💩</span>
          <span class="dog-duty-emoji" style="position:absolute;left:40%;top:62%;font-size:17px;opacity:.85;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))">💩</span>
          <span style="position:absolute;right:14%;top:22%;font-size:22px;animation:ucdDrift 5s ease-in-out infinite">🐕</span>
          <div style="position:absolute;left:10px;top:8px;display:flex;gap:6px">
            <span style="background:rgba(0,0,0,.5);border-radius:99px;padding:3px 9px;font-size:10px;color:#ffd28a;font-weight:700">3 active</span>
            <span style="background:rgba(0,0,0,.5);border-radius:99px;padding:3px 9px;font-size:10px;color:#cbe6c0">this week</span>
          </div>
          <div style="position:absolute;left:12px;right:12px;bottom:8px;display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.5);border-radius:9px;padding:6px 10px">
            <ha-icon icon="mdi:history" style="--mdc-icon-size:14px;color:#cbe6c0"></ha-icon>
            <div style="flex:1;height:4px;border-radius:99px;background:rgba(255,255,255,.2);position:relative">
              <span style="position:absolute;left:70%;top:-4px;width:12px;height:12px;border-radius:50%;background:#fff"></span></div>
            <span style="font-size:9.5px;color:#cbe6c0">now</span>
          </div>
        </div>`;
      return;
    }
    if (type === 'cleaning_zones') {
      this._holder.innerHTML = `
        <div style="position:relative;height:180px;border-radius:10px;overflow:hidden;background:#0e1626">
          <div style="position:absolute;inset:0;background:
            linear-gradient(rgba(90,130,190,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(90,130,190,.10) 1px,transparent 1px);background-size:18px 18px"></div>
          <div style="position:absolute;left:5%;top:8%;right:5%;bottom:8%;border:2px solid rgba(140,180,235,.5)"></div>
          <div style="position:absolute;left:5%;top:8%;width:44%;height:46%;border-right:2px solid rgba(140,180,235,.5);border-bottom:2px solid rgba(140,180,235,.5)"></div>
          <div style="position:absolute;left:49%;top:8%;width:23%;height:46%;border-right:2px solid rgba(140,180,235,.5)"></div>
          <div style="position:absolute;left:5%;bottom:8%;width:60%;height:38%;border-right:2px solid rgba(140,180,235,.5)"></div>
          ${[
            ['7%','11%','38%','38%','rgba(255,82,82,.20)','#ff8a80','Kitchen · 6d'],
            ['50%','11%','20%','38%','rgba(255,171,64,.20)','#ffcf86','Bath · 3d'],
            ['7%','56%','55%','32%','rgba(74,222,128,.16)','#9de8b4','Living · today'],
            ['74%','11%','19%','77%','rgba(41,182,246,.15)','#8fd4ff','Bed · 1d'],
          ]
            .map(
              ([l, t2, w, h, bg, tc, n]) => `
            <div style="position:absolute;left:${l};top:${t2};width:${w};height:${h};background:${bg};border:1px solid ${tc}55;display:flex;align-items:flex-end;padding:4px">
              <span style="font-size:9px;color:${tc};background:rgba(0,0,0,.5);padding:1px 6px;border-radius:99px">${n}</span></div>`
            )
            .join('')}
          <div style="position:absolute;top:6px;right:8px;font-size:9px;color:#ffcf86;background:rgba(0,0,0,.5);padding:2px 8px;border-radius:99px">heatmap: days since cleaned</div>
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
        screensaver: 'live',
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

setInterval(() => {
  document
    .querySelectorAll('body > .ultra-popup-portal, body > .ultra-drawer-portal')
    .forEach(el => el.remove());
}, 1500);

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

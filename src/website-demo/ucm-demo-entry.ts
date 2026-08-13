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
import { renderTemplate as renderDemoTemplate } from './demo-jinja';
import { buildEntityContext } from '../utils/template-context';
import {
  CONTEXT_VARIABLES,
  EXAMPLE_TEMPLATES,
  RETURN_PROPERTIES,
  TEMPLATE_SCOPES,
} from '../components/uc-template-cheatsheet-data';
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

/** One icon tile bound to one entity — layout containers use these as children
 *  (the standalone Icons module shows three, which looked duplicated nested). */
function mkIcon(entity: string, on: string, off: string, name: string): any {
  const base = mk('icon');
  const proto = (base.icons && base.icons[0]) || {};
  base.icons = [{ ...proto, id: 'demo_i_' + entity.replace(/\W/g, '_'), icon_mode: 'entity', entity, name, icon_active: on, icon_inactive: off }];
  return base;
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
      const base = c.icons[0];
      const make = (entity: string, on: string, off: string, name: string) => ({
        ...base,
        id: 'demo_icon_' + entity.replace(/\W/g, '_'),
        icon_mode: 'entity',
        entity,
        name,
        icon_active: on,
        icon_inactive: off,
      });
      c.icons = [
        make('light.living_room', 'mdi:lightbulb', 'mdi:lightbulb-outline', 'Living Room'),
        make('light.kitchen', 'mdi:ceiling-light', 'mdi:ceiling-light-outline', 'Kitchen'),
        make('lock.front_door', 'mdi:lock', 'mdi:lock-open-variant', 'Front Door'),
      ];
    }
  },
  horizontal: c => {
    c.modules = [
      mkIcon('light.living_room', 'mdi:lightbulb', 'mdi:lightbulb-outline', 'Living'),
      mkIcon('light.kitchen', 'mdi:ceiling-light', 'mdi:ceiling-light-outline', 'Kitchen'),
      mkIcon('lock.front_door', 'mdi:lock', 'mdi:lock-open-variant', 'Door'),
    ];
    c.gap = 6;
  },
  vertical: c => {
    c.modules = [mk('text', { text: 'Living Room', font_size: 15 }), mk('bar'), mk('button', { label: 'Scene' })];
    c.gap = 6;
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
    c.modules = [
      mkIcon('light.living_room', 'mdi:lightbulb', 'mdi:lightbulb-outline', 'Living'),
      mkIcon('light.kitchen', 'mdi:ceiling-light', 'mdi:ceiling-light-outline', 'Kitchen'),
      mkIcon('lock.front_door', 'mdi:lock', 'mdi:lock-open-variant', 'Door'),
      mkIcon('fan.ceiling_fan', 'mdi:fan', 'mdi:fan-off', 'Fan'),
    ];
    c.columns = 2;
    c.gap = 8;
    // The module collapses to mobile_columns below a 600px breakpoint, and the
    // capture stage is 420px wide, so the grid read as a plain stack.
    c.mobile_columns = 2;
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
    c.modules = [
      mkIcon('light.living_room', 'mdi:lightbulb', 'mdi:lightbulb-outline', 'Living'),
      mkIcon('light.kitchen', 'mdi:ceiling-light', 'mdi:ceiling-light-outline', 'Kitchen'),
      mkIcon('lock.front_door', 'mdi:lock', 'mdi:lock-open-variant', 'Door'),
      mkIcon('fan.ceiling_fan', 'mdi:fan', 'mdi:fan-off', 'Fan'),
      mkIcon('switch.guest_mode', 'mdi:account-check', 'mdi:account-off', 'Guest'),
      mkIcon('cover.living_room_blinds', 'mdi:blinds-open', 'mdi:blinds', 'Blinds'),
    ];
    c.item_width = '34%';
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
    c.direction = 'vertical';
    c.columns = 1;
    c.gap = 6;
    c.limit = 4;
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
    c.todo_entity = 'todo.plant_care';
    c.plants = [
      { id: 'demo_p1', name: 'Monstera', icon: 'mdi:leaf', location: 'Living Room', moisture_entity: 'sensor.monstera_moisture', water_interval_days: 7 },
      { id: 'demo_p2', name: 'Snake Plant', icon: 'mdi:sprout', location: 'Office', moisture_entity: 'sensor.snake_plant_moisture', water_interval_days: 14 },
      { id: 'demo_p3', name: 'Basil', icon: 'mdi:flower', location: 'Kitchen', moisture_entity: 'sensor.basil_moisture', water_interval_days: 30 },
    ];
    c.columns = 3;
    c.show_photos = false;
  },
  vehicle_maintenance: c => {
    c.vehicle_name = 'Model Y';
    c.odometer_entity = 'sensor.ev_odometer';
    c.battery_entity = 'sensor.home_battery_soc';
    c.todo_entity = 'todo.plant_care';
  },
  vampire_power: c => {
    c.discovery_mode = 'manual';
    c.entities = ['sensor.tv_standby', 'sensor.console_standby', 'sensor.desktop_standby'];
    c.max_items = 3;
  },
  unifi: c => {
    c.view = 'rack';
    // Skip first-run curation so the demo rack renders instantly with every
    // device visible in a deliberate top-to-bottom order.
    c.curation_seeded = true;
    c.hidden_device_ids = [];
    c.device_order = [
      'ucd_unifi_gw',
      'ucd_unifi_sw_hd24',
      'ucd_unifi_sw_e8',
      'ucd_unifi_nvr',
      'ucd_unifi_ap_max2',
      'ucd_unifi_ap_maxb',
      'ucd_unifi_ap_wall',
      'ucd_unifi_cam_drive',
      'ucd_unifi_cam_door',
    ];
    c.setup_dismissed = true;
    c.include_clients = true;
    c.client_ids = ['ucd_unifi_cl_mac', 'ucd_unifi_cl_ps5'];
    c.animation_intensity = 'full';
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
      machine_state_entity: 'sensor.range_machine_state',
      job_state_entity: 'sensor.oven_mode',
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
  timer: c => {
    c.timer_entity = 'timer.pizza';
    c.duration_seconds = 180;
  },
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
  clock: c => {
    c.show_seconds = true;
  },
  animated_clock: c => {
    c.show_seconds = true;
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
  toggle: c => {
    c.tracking_entity = 'input_boolean.guest';
    // The module defaults to the IEC power symbols, a bare circle and a bare
    // bar, which read as punctuation at thumbnail size rather than as icons.
    if (Array.isArray(c.toggle_points) && c.toggle_points.length >= 2) {
      c.toggle_points[0].icon = 'mdi:toggle-switch-off-outline';
      c.toggle_points[1].icon = 'mdi:toggle-switch';
    }
  },
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
/** Modules render controls as <button> OR <ha-button> — collect both. */
function controls(holder: HTMLElement): HTMLElement[] {
  return Array.from(holder.querySelectorAll('button, ha-button, [role="button"]')) as HTMLElement[];
}

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

/** Hand-staged HTML previews: render ONCE so their CSS animations keep running
 *  (re-rendering resets every animation to 0% and looks frozen). */
const STATIC_DEMOS = new Set([
  'navigation','background','drawer','popup','dynamic_weather','video_bg',
  'living_canvas','dog_duty','cleaning_zones','pagebreak',
]);

/** Visuals that depend on wall-clock time: re-render every second. */
const TIME_MODULES = new Set(['clock','animated_clock','screensaver','media_player','calendar','timer','laundry_tracker']);

/** Config-level animators: mutate the module's own config on a loop. */
const DEMO_ANIMATE: Record<string, (el: any) => void> = {
  text: el => {
    const phrases = ['Good evening, Wayne', 'House is locked', '3 lights on', 'Nest set to 72°'];
    let pi = 0, ci = 0, holdFor = 0;
    el._addTimer(setInterval(() => {
      const full = phrases[pi % phrases.length];
      if (holdFor > 0) { holdFor--; if (holdFor === 0) { pi++; ci = 0; } return; }
      ci++;
      el._module.text = full.slice(0, ci) + (ci < full.length ? '▍' : '');
      if (ci >= full.length) holdFor = 18;
      el._scheduleRender();
    }, 90));
  },
  spinbox: el => {
    let v = 50, dir = 1;
    el._addTimer(setInterval(() => {
      v += dir * 2;
      if (v >= 74) dir = -1;
      if (v <= 30) dir = 1;
      el._module.value = v;
      el._scheduleRender();
    }, 700));
  },
};

const DEMO_STAGE: Record<string, (holder: HTMLElement, el: any) => void> = {
  dropdown: (holder, el) => {
    // The module pins its menu to the viewport with `position: fixed` so it can
    // escape a dashboard's stacking contexts; in a demo card that leaves the
    // menu floating free of the card it belongs to. Re-anchor it to the trigger
    // and reserve the room it needs. The selector has to outrank the module's
    // own `[data-preview-context]` rule, hence the `.ucd-card` prefix.
    holder.style.minHeight = '152px';
    const style = document.createElement('style');
    style.textContent = `
      .ucd-card .dropdown-module-container[data-preview-context] .dropdown-options{
        position: absolute !important;
        top: 100% !important; bottom: auto !important; margin-top: 6px !important;
        left: 0 !important; right: 0 !important; width: auto !important;
        background: var(--card-background-color, #1c1c1c) !important;
        border: 1px solid var(--divider-color, rgba(255,255,255,.14)) !important;
        border-radius: 10px !important;
        box-shadow: 0 12px 30px rgba(0,0,0,.55) !important;
        overflow: hidden !important;
        z-index: 4 !important;
      }
      .custom-dropdown{ position: relative !important; }`;
    holder.appendChild(style);
    // Open straight away: the still frame is captured before the first interval
    // tick, and a closed selector says nothing about what the module does.
    const toggle = () =>
      clickFirst(holder, ['.dropdown-selected', '.custom-dropdown', 'select', 'button', 'ha-button']);
    toggle();
    el._addTimer(setInterval(toggle, 2600));
  },
  accordion: (holder, el) => {
    el._addTimer(setInterval(() => { controls(holder)[0]?.click(); }, 3000));
  },
  tabs: (holder, el) => {
    let idx = 1;
    el._addTimer(setInterval(() => {
      const tabBtns = controls(holder).slice(0, 2);
      if (tabBtns.length >= 2) { tabBtns[idx % 2].click(); idx++; }
    }, 3200));
  },
  scroll_row: (holder, el) => {
    let dir = 1;
    el._addTimer(setInterval(() => {
      const track = (Array.from(holder.querySelectorAll('*')) as HTMLElement[])
        .find(n => n.scrollWidth > n.clientWidth + 8) || null;
      if (!track) return;
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 4) return;
      const next = track.scrollLeft + dir * Math.max(60, track.clientWidth * 0.45);
      if (next >= max - 2) dir = -1;
      if (next <= 2) dir = 1;
      track.scrollTo({ left: Math.max(0, Math.min(max, next)), behavior: 'smooth' });
    }, 2200));
  },
  graphs: holder => {
    // Draw the series in each time the card scrolls into view.
    holder.querySelectorAll('svg path, svg polyline').forEach(node => {
      const el2 = node as SVGPathElement;
      if (!el2.getAttribute('stroke') || el2.getAttribute('stroke') === 'none') return;
      let len = 600;
      try { len = (el2 as any).getTotalLength() || 600; } catch (e) { /* ignore */ }
      el2.style.strokeDasharray = String(len);
      el2.style.strokeDashoffset = String(len);
      el2.style.animation = 'ucdDraw 1.6s ease-out forwards';
    });
  },
  time_machine: (holder, el) => {
    let v = 24, dir = -1;
    el._addTimer(setInterval(() => {
      const r = holder.querySelector('input[type="range"]') as HTMLInputElement | null;
      if (!r) return;
      v += dir * 2;
      if (v <= 2) dir = 1;
      if (v >= 24) dir = -1;
      r.value = String(v);
      r.dispatchEvent(new Event('input', { bubbles: true }));
      r.dispatchEvent(new Event('change', { bubbles: true }));
    }, 900));
  },
  alarm_panel: (holder, el) => {
    // Tap a few keypad digits, then arm/disarm, on a loop.
    let step = 0;
    el._addTimer(setInterval(() => {
      const btns = controls(holder);
      if (!btns.length) return;
      const digits = btns.filter(b => /^[0-9]$/.test((b.textContent || '').trim()));
      const action = btns.find(b => /arm|disarm/i.test(b.textContent || ''));
      if (step < 4 && digits.length) digits[(step * 3) % digits.length].click();
      else if (action) action.click();
      step = (step + 1) % 6;
    }, 1100));
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
  slider: (holder, el) => {
    // Page back and forth so the slideshow is visibly working.
    let i = 0, dir = 1;
    el._addTimer(setInterval(() => {
      const dots = Array.from(
        holder.querySelectorAll('.pagination-dot, [class*="pagination"] button, [class*="pagination"] span, [class*="dot"]')
      ) as HTMLElement[];
      if (dots.length >= 2) {
        i += dir;
        if (i >= dots.length - 1) dir = -1;
        if (i <= 0) dir = 1;
        dots[Math.max(0, Math.min(dots.length - 1, i))].click();
        return;
      }
      // No dots: use the next/prev arrows instead.
      const arrows = controls(holder).filter(b =>
        /arrow|next|prev|chevron/i.test(b.className + (b.getAttribute('aria-label') || '') + b.innerHTML)
      );
      if (arrows.length >= 2) { arrows[dir > 0 ? 1 : 0].click(); i += dir; if (i > 1) dir = -1; if (i < 1) dir = 1; }
    }, 2800));
  },
  state_switcher: (holder, el) => {
    const modes = ['Home', 'Away', 'Guest', 'Vacation'];
    let i = 0;
    el._addTimer(setInterval(() => {
      i = (i + 1) % modes.length;
      demoHass.__setState('input_select.house_mode', modes[i]);
    }, 2600));
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

    // On/off state changes: icons, toggles, grid tiles, alert center.
    const flip = (id: string, a = 'on', b = 'off') => {
      const st2 = demoHass.states[id];
      if (st2) demoHass.__setState(id, st2.state === a ? b : a);
    };
    flip('light.kitchen');
    flip('switch.guest_mode');
    if (phase % 2 === 0) flip('light.desk_lamp');
    if (phase % 2 === 1) flip('binary_sensor.garage_motion');
    if (phase % 3 === 0) flip('binary_sensor.front_door');
    if (phase % 3 === 1) flip('binary_sensor.leak_laundry');
    if (phase % 4 === 0) {
      const lk = demoHass.states['lock.front_door'];
      if (lk) demoHass.__setState('lock.front_door', lk.state === 'locked' ? 'unlocked' : 'locked');
    }

    // People move between home and away.
    const per = demoHass.states['person.tony'];
    if (per) demoHass.__setState('person.tony', per.state === 'home' ? 'not_home' : 'home');

    // Alarm cycles through its states.
    const alarmStates = ['disarmed', 'arming', 'armed_home', 'armed_away'];
    const al = demoHass.states['alarm_control_panel.home'];
    if (al) demoHass.__setState('alarm_control_panel.home', alarmStates[phase % alarmStates.length]);

    // Colour input walks the brand palette.
    const palette = ['#8017A2', '#29b6f6', '#ff2d78', '#4ade80', '#ffc233'];
    demoHass.__setState('input_text.accent_color', palette[phase % palette.length]);

    // Oven heats and settles.
    tween('sensor.oven_temp', { from: up ? 348 : 425, to: up ? 425 : 348, ms: 2600 });
    tween('light.living_room', { attr: 'color_temp_kelvin', from: up ? 2700 : 5200, to: up ? 5200 : 2700, ms: 2600 });
    const rng = demoHass.states['sensor.range_machine_state'];
    if (rng) demoHass.__setState('sensor.range_machine_state', phase % 3 === 0 ? 'idle' : 'run');

    phase++;
  };
  setTimeout(cycle, 1200);
  setInterval(cycle, 4200);

  // Restart the pizza timer whenever it winds down, so it always counts.
  setInterval(() => {
    const t = demoHass.states['timer.pizza'];
    if (!t) return;
    const started = new Date(t.last_changed).getTime();
    if (Date.now() - started > 175000) {
      demoHass.__setState('timer.pizza', 'active', {
        remaining: '0:03:00',
        finishes_at: new Date(Date.now() + 180000).toISOString(),
      });
    }
  }, 5000);

  // Media playback position advances in real time.
  setInterval(() => {
    if (document.hidden || !((window as any).__ucdVisible > 0)) return;
    const mp = demoHass.states['media_player.kitchen_speaker'];
    if (!mp) return;
    const dur = mp.attributes.media_duration || 243;
    const pos = ((mp.attributes.media_position || 0) + 1) % dur;
    demoHass.__setState('media_player.kitchen_speaker', mp.state, {
      media_position: pos,
      media_position_updated_at: new Date().toISOString(),
    });
  }, 1000);
}

/** HA default dark-theme variables so modules look like a real dashboard. */
const THEME_VARS = `
  --card-background-color:#1c1c1c;
  --ha-card-background:#1c1c1c;
  --primary-background-color:#111111;
  --secondary-background-color:#282828;
  --primary-text-color:#e1e1e1;
  --secondary-text-color:#9b9b9b;
  --disabled-text-color:#6f6f6f;
  --primary-color:#03a9f4;
  --rgb-primary-color:3,169,244;
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
`;

const THEME_CSS = `
:host{
${THEME_VARS}
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
input[type=range]{-webkit-appearance:none;appearance:none;height:18px;background:transparent;
  display:block;margin:0;vertical-align:middle;align-self:center}
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
@keyframes ucdDraw{to{stroke-dashoffset:0}}
@keyframes ucdNavActive{0%,4%{color:var(--primary-color);transform:translateY(-2px)}22%,100%{color:var(--secondary-text-color);transform:none}}
@keyframes ucdScrub{0%{left:0}92%,100%{left:calc(100% - 12px)}}
@keyframes ucdSpotIn{0%,8%{opacity:0;transform:scale(.5)}14%,92%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.5)}}
@keyframes ucdZoneAge{0%,6%{background:rgba(74,222,128,.20)}40%{background:rgba(255,171,64,.20)}75%,100%{background:rgba(255,82,82,.22)}}
@keyframes ucdLabelFresh{0%,10%{opacity:1}22%,100%{opacity:0}}
@keyframes ucdLabelStale{0%,20%{opacity:0}34%,100%{opacity:1}}
@keyframes ucdPopup{0%,8%{opacity:0;transform:translate(-50%,-38%) scale(.92)}18%,72%{opacity:1;transform:translate(-50%,-50%) scale(1)}86%,100%{opacity:0;transform:translate(-50%,-38%) scale(.92)}}
`;

/**
 * Modules that float UI above the card (dropdown menus, popups, drawers,
 * screensavers, toasts) portal it to document.body so it escapes clipping.
 * That lands it outside our shadow root, where the :host variables above no
 * longer reach it — and the module styles read them without fallbacks, so an
 * unthemed overlay paints fully transparent with black text. Declaring the
 * same variables on body keeps portaled content themed. Only custom properties
 * are set, so nothing on the host page changes unless it reads an HA var name.
 */
let themeVarsInjected = false;
function injectPortalThemeVars(): void {
  if (themeVarsInjected) return;
  themeVarsInjected = true;
  const style = document.createElement('style');
  style.id = 'ucd-portal-theme-vars';
  style.textContent = `body{${THEME_VARS}}`;
  document.head.appendChild(style);
}

/**
 * Merge a config patch into a live module config. Arrays merge element-wise by
 * index so a patch can reach into `icons[0]` or `info_entities[0]` — which is
 * where those modules keep their per-item template.
 */
function deepPatch(target: any, patch: any): void {
  if (!target || !patch || typeof patch !== 'object') return;
  for (const [key, value] of Object.entries(patch)) {
    if (Array.isArray(value)) {
      if (!Array.isArray(target[key])) target[key] = [];
      value.forEach((item, i) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          if (!target[key][i] || typeof target[key][i] !== 'object') target[key][i] = {};
          deepPatch(target[key][i], item);
        } else {
          target[key][i] = item;
        }
      });
    } else if (value && typeof value === 'object') {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      deepPatch(target[key], value);
    } else {
      target[key] = value;
    }
  }
}

class UcModuleDemo extends HTMLElement {
  static get observedAttributes() {
    return ['type'];
  }
  private _root: ShadowRoot;
  private _holder: HTMLDivElement;
  private _unsub: (() => void) | undefined;
  private _module?: any;
  private _handler?: any;
  private _raf = 0;
  private _timers: number[] = [];
  private _staticDone = false;
  private _visible = false;
  private _vio?: IntersectionObserver;
  private _tplListener = () => this._scheduleRender();
  private _patch?: Record<string, any> | undefined;
  private _configure?: ((mod: any) => void) | undefined;
  private _styleEl?: HTMLStyleElement;

  /**
   * Extra config merged over the module's demo default. The Template Mode
   * playground uses this to switch `unified_template_mode` on and feed the
   * template the visitor is editing.
   *
   * Arrays merge element-wise by index, so a patch can reach `icons[0]` without
   * restating the rest of the item. To restructure a config — replacing an array
   * outright, say — use `configure` instead.
   */
  set config(patch: Record<string, any> | undefined) {
    this._patch = patch;
    if (this._module && patch) {
      deepPatch(this._module, patch);
      this._staticDone = false;
      this._renderNow();
    }
  }

  get config(): Record<string, any> | undefined {
    return this._patch;
  }

  /**
   * Shape the whole config after the demo defaults are applied. Runs on every
   * boot and receives the live config to mutate, so a page can replace arrays
   * or derive items from the defaults.
   */
  set configure(fn: ((mod: any) => void) | undefined) {
    this._configure = fn;
    if (this._module) this._boot();
  }

  /** The resolved module config, for pages that want to show the YAML. */
  get moduleConfig(): any {
    return this._module;
  }

  constructor() {
    super();
    injectPortalThemeVars();
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
      // Count only real transitions — elements must start uncounted or the
      // global visible-counter drifts negative and the ambient loop never runs.
      const was = this._visible;
      const now = entries[0]?.isIntersecting ?? true;
      if (now !== was) {
        const w = window as any;
        w.__ucdVisible = Math.max(0, (w.__ucdVisible || 0) + (now ? 1 : -1));
        this._visible = now;
        if (now) this._scheduleRender();
      }
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
    this._clearTimers();
    this._unsub?.();
    this._unsub = undefined;
  }

  /** Register an interval owned by this element (auto-cleared on reboot/unmount). */
  _addTimer(id: any) {
    this._timers.push(id as number);
  }
  private _clearTimers() {
    this._timers.forEach(t => clearInterval(t));
    this._timers = [];
    if (this._pending) { clearTimeout(this._pending); this._pending = 0; }
  }

  private async _boot() {
    const type = this.getAttribute('type');
    if (!type) return;
    this._clearTimers();
    this._staticDone = false;
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
      if (this._patch) deepPatch(mod, this._patch);
      this._configure?.(mod);
      this._module = mod;

      // Real per-module styles from the module implementation itself.
      const styles = (handler.getStyles?.() || '') + '\n' + registry.getAllModuleStyles();
      // Reuse one style element: `configure` can re-boot, and a fresh element
      // per boot would pile up thousands of identical sheets in the playground.
      if (!this._styleEl) {
        this._styleEl = document.createElement('style');
        this._root.appendChild(this._styleEl);
      }
      this._styleEl.textContent = styles;

      this._unsub?.();
      this._unsub = demoHass.__subscribe(() => this._scheduleRender());
      this._renderNow();

      // The Template Mode playground opts out: staging and the config animators
      // rewrite the very fields a template is supposed to be driving (the text
      // typewriter, the spinbox value), which reads as the template flickering.
      const ambient = !this.hasAttribute('no-animate');

      const stage = DEMO_STAGE[type];
      if (stage && ambient) setTimeout(() => { try { stage(this._holder, this); } catch (e) { /* staging is best-effort */ } }, 400);

      // Wall-clock modules tick every second so the time is always real.
      if (TIME_MODULES.has(type)) this._addTimer(setInterval(() => this._scheduleRender(), 1000));

      // Config-level animators (typewriter text, stepper values, ...).
      const animate = DEMO_ANIMATE[type];
      if (animate && ambient) setTimeout(() => { try { animate(this); } catch (e) { /* best-effort */ } }, 500);
    } catch (err) {
      this._holder.innerHTML = `<div class="ucd-error">Preview unavailable — see this module live on your own dashboard.</div>`;
      // eslint-disable-next-line no-console
      console.warn(`[uc-module-demo] ${type}:`, err);
    }
  }

  private _lastRender = 0;
  private _pending = 0;
  /** Repaint at most ~4x/sec: state tweens fire every 90ms, and repainting that
   *  often restarts CSS animations inside modules (the "flashing"). */
  private _scheduleRender() {
    if (!this._visible) return;
    const MIN_MS = 260;
    const since = Date.now() - this._lastRender;
    if (since >= MIN_MS) {
      cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(() => { this._lastRender = Date.now(); this._renderNow(); });
      return;
    }
    if (this._pending) return;
    this._pending = setTimeout(() => {
      this._pending = 0;
      this._lastRender = Date.now();
      this._renderNow();
    }, MIN_MS - since) as any;
  }

  private _renderNow() {
    if (!this._handler || !this._module) return;
    const type = this.getAttribute('type') || '';
    // Staged HTML demos paint once — re-painting restarts their CSS animations.
    if (STATIC_DEMOS.has(type)) {
      if (this._staticDone) return;
      this._staticDone = true;
    }
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
              <div style="text-align:center;color:var(--secondary-text-color);
                animation:ucdNavActive ${routes.length * 1.6}s ease-in-out ${(i * 1.6).toFixed(1)}s infinite">
                <ha-icon icon="${r.icon || 'mdi:circle'}" style="--mdc-icon-size:20px"></ha-icon>
                <div style="font-size:9px;font-weight:600">${r.label || ''}</div>
              </div>`
              )
              .join('')}
          </div>
        </div>`;
      return;
    }
    if (type === 'pagebreak') {
      this._holder.innerHTML = `
        <div style="height:170px;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:0 8px">
          <div style="background:var(--card-background-color);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 12px;color:var(--primary-text-color);font-size:12px">
            <b>Page 1</b><div style="color:var(--secondary-text-color);font-size:11px">Living room controls</div></div>
          <div style="display:flex;align-items:center;gap:8px;color:#6fd4ff;font-size:9.5px;font-weight:800;letter-spacing:.14em">
            <span style="flex:1;height:2px;background:repeating-linear-gradient(90deg,#29b6f6 0 8px,transparent 8px 15px)"></span>
            PAGE BREAK
            <span style="flex:1;height:2px;background:repeating-linear-gradient(90deg,#29b6f6 0 8px,transparent 8px 15px)"></span></div>
          <div style="background:var(--card-background-color);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 12px;color:var(--primary-text-color);font-size:12px">
            <b>Page 2</b><div style="color:var(--secondary-text-color);font-size:11px">Energy &amp; climate</div></div>
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
          <div style="position:absolute;left:50%;top:50%;width:76%;background:var(--card-background-color);
            border:1px solid rgba(255,255,255,.12);border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.6);padding:12px;
            animation:ucdPopup 6s ease-in-out infinite">
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
      const drops = Array.from({ length: 60 }, () => {
        const dur = (0.75 + Math.random() * 0.6).toFixed(2);
        return `<span style="position:absolute;left:${(Math.random() * 99).toFixed(1)}%;top:-14px;z-index:2;
          width:2px;height:${11 + Math.round(Math.random() * 9)}px;border-radius:2px;
          background:linear-gradient(rgba(150,205,255,0),rgba(165,215,255,.95));
          animation:ucdRain ${dur}s linear ${(Math.random() * 1.6).toFixed(2)}s infinite"></span>`;
      }).join('');
      this._holder.innerHTML = `
        <div style="position:relative;height:170px;border-radius:10px;overflow:hidden;background:linear-gradient(180deg,#141d2b,#0b111c)">
          ${drops}
          <div style="position:absolute;z-index:3;left:12px;right:12px;bottom:10px;display:flex;justify-content:space-between;align-items:center;background:rgba(15,20,28,.6);backdrop-filter:blur(3px);border-radius:9px;padding:8px 12px;color:var(--primary-text-color);font-size:11.5px">
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
      const YARD = 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=70';
      // Each marker fades in as the scrubber sweeps past its position.
      const spots = [
        { x: 26, y: 46, at: 1.4 },
        { x: 58, y: 62, at: 3.2 },
        { x: 42, y: 74, at: 5.0 },
      ];
      const markers = spots.map(sp => `
        <span style="position:absolute;left:${sp.x}%;top:${sp.y}%;z-index:3;font-size:19px;opacity:0;
          filter:drop-shadow(0 2px 4px rgba(0,0,0,.7));
          animation:ucdSpotIn 8s ease-out ${sp.at}s infinite">💩</span>`).join('');
      this._holder.innerHTML = `
        <div style="position:relative;height:180px;border-radius:10px;overflow:hidden;
          background:linear-gradient(rgba(8,20,6,.45),rgba(8,20,6,.55)),url('${YARD}') center/cover">
          <div style="position:absolute;left:6%;top:9%;right:6%;bottom:26%;border:1.5px dashed rgba(190,240,170,.45);border-radius:8px"></div>
          ${markers}
          <div style="position:absolute;left:10px;top:8px;z-index:4;display:flex;gap:6px">
            <span style="background:rgba(0,0,0,.55);border-radius:99px;padding:3px 9px;font-size:10px;color:#ffd28a;font-weight:700">3 detected</span>
            <span style="background:rgba(0,0,0,.55);border-radius:99px;padding:3px 9px;font-size:10px;color:#cbe6c0">last 7 days</span>
          </div>
          <div style="position:absolute;z-index:4;left:12px;right:12px;bottom:8px;display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.55);border-radius:9px;padding:6px 10px">
            <ha-icon icon="mdi:history" style="--mdc-icon-size:14px;color:#cbe6c0"></ha-icon>
            <div style="flex:1;height:4px;border-radius:99px;background:rgba(255,255,255,.22);position:relative">
              <span style="position:absolute;top:-4px;left:0;width:12px;height:12px;border-radius:50%;background:#fff;
                box-shadow:0 0 8px rgba(255,255,255,.6);animation:ucdScrub 8s linear infinite"></span></div>
            <span style="font-size:9.5px;color:#cbe6c0">now</span>
          </div>
        </div>`;
      return;
    }
    if (type === 'cleaning_zones') {
      // Each zone ages from fresh to stale on its own schedule; the label
      // cross-fades between "just cleaned" and its staleness.
      const zones = [
        ['7%','11%','38%','38%','Kitchen','0s'],
        ['50%','11%','20%','38%','Bath','2.1s'],
        ['7%','56%','55%','32%','Living','4.2s'],
        ['74%','11%','19%','77%','Bedroom','6.3s'],
      ].map(([l,t2,w,h,name,delay]) => `
        <div style="position:absolute;left:${l};top:${t2};width:${w};height:${h};
          border:1px solid rgba(255,255,255,.14);display:flex;align-items:flex-end;padding:4px;
          animation:ucdZoneAge 8.4s ease-in-out ${delay} infinite">
          <span style="position:relative;font-size:9px;background:rgba(0,0,0,.55);padding:1px 6px;border-radius:99px;color:#dfe5ee">
            ${name} ·
            <span style="animation:ucdLabelFresh 8.4s ease-in-out ${delay} infinite">today</span><span
              style="position:absolute;right:6px;animation:ucdLabelStale 8.4s ease-in-out ${delay} infinite">6d</span>
          </span></div>`).join('');
      this._holder.innerHTML = `
        <div style="position:relative;height:180px;border-radius:10px;overflow:hidden;background:#0e1626">
          <div style="position:absolute;inset:0;background:
            linear-gradient(rgba(90,130,190,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(90,130,190,.10) 1px,transparent 1px);background-size:18px 18px"></div>
          <div style="position:absolute;left:5%;top:8%;right:5%;bottom:8%;border:2px solid rgba(140,180,235,.5)"></div>
          <div style="position:absolute;left:5%;top:8%;width:44%;height:46%;border-right:2px solid rgba(140,180,235,.5);border-bottom:2px solid rgba(140,180,235,.5)"></div>
          <div style="position:absolute;left:49%;top:8%;width:23%;height:46%;border-right:2px solid rgba(140,180,235,.5)"></div>
          <div style="position:absolute;left:5%;bottom:8%;width:60%;height:38%;border-right:2px solid rgba(140,180,235,.5)"></div>
          ${zones}
          <div style="position:absolute;top:6px;right:8px;font-size:9px;color:#ffcf86;background:rgba(0,0,0,.55);padding:2px 8px;border-radius:99px">heatmap: days since cleaned</div>
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
        // Dashboard context portals the open menu to document.body, where it
        // escapes both the card and this element's styles. The editor-preview
        // path keeps it in place, which is what the staging above dresses up.
        dropdown: 'live',
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

/* Modules that portal UI to document.body have no way to clean it up when their
 * demo is swapped out, and an escapee outlives the card it belongs to — on this
 * page it lands on top of unrelated demos. Sweep anything left behind. */
setInterval(() => {
  document
    .querySelectorAll(
      'body > .ultra-popup-portal, body > .ultra-drawer-portal, body > [id^="portaled-dropdown-"]'
    )
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

  /**
   * Template Mode reference data — the same arrays that drive the in-app
   * Template Cheatsheet, so the website page cannot drift from the card.
   */
  templates: {
    contextVariables: CONTEXT_VARIABLES,
    returnProperties: RETURN_PROPERTIES,
    examples: EXAMPLE_TEMPLATES,
    scopes: TEMPLATE_SCOPES,
  },

  /** Render a template the way the demo websocket does (Jinja + literal_eval). */
  renderTemplate: (template: string, variables?: Record<string, any>) =>
    renderDemoTemplate(template, demoHass, variables || {}),

  /** The context variables a module bound to `entityId` would receive. */
  entityContext: (entityId: string, config?: any) =>
    buildEntityContext(entityId, demoHass as any, config),

  /** Drive a demo entity, e.g. from a playground slider. */
  setState: (entityId: string, state: string, attributes?: Record<string, any>) =>
    demoHass.__setState(entityId, state, attributes),

  /** Called on every demo state change. Returns an unsubscribe function. */
  subscribe: (listener: () => void) => demoHass.__subscribe(listener),
};

window.dispatchEvent(new CustomEvent('uc-demo-ready'));

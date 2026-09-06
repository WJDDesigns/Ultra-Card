import { describe, it, expect, beforeAll } from 'vitest';
import { generateUltraDashboard, generateUltraAreaView } from '../uc-dashboard-generator';
import { getDashboardStyle } from '../uc-dashboard-styles';
import { CORE_MANIFESTS, isProModule } from '../../modules/module-manifest-data';
import type { LovelaceCardRawConfig, LovelaceViewRawConfig } from '../types';

/**
 * The Ultra Dashboard strategy composes a whole sections dashboard from the
 * area/floor registries. These tests run the generator against a small fake
 * home and check the shape Home Assistant will receive.
 */

function state(entity_id: string, s: string, attributes: Record<string, unknown> = {}) {
  return {
    entity_id,
    state: s,
    attributes: { friendly_name: entity_id.split('.')[1], ...attributes },
  };
}

function makeHass() {
  const states: Record<string, unknown> = {};
  const add = (id: string, s = 'on', attrs: Record<string, unknown> = {}) =>
    (states[id] = state(id, s, attrs));

  // Kitchen: lights, a temperature sensor, a door sensor, a diagnostic entity.
  add('light.kitchen_ceiling', 'on', { supported_color_modes: ['brightness'] });
  add('light.kitchen_counter', 'off', { supported_color_modes: ['brightness'] });
  add('sensor.kitchen_temperature', '21.5', { device_class: 'temperature' });
  // Sorts before "kitchen_temperature" by name, so a naive first-match would pick it.
  add('sensor.fridge_temperature', '4', {
    device_class: 'temperature',
    friendly_name: 'Fridge temperature',
  });
  add('sensor.kitchen_humidity', 'unavailable', { device_class: 'humidity' });
  add('binary_sensor.kitchen_door', 'off', { device_class: 'door' });
  add('sensor.kitchen_hub_rssi', '-60', { device_class: 'signal_strength' });
  // Living room: media player, climate, cover, camera.
  add('media_player.living_tv', 'playing');
  add('climate.living', 'heat');
  add('cover.living_blinds', 'open');
  add('camera.living', 'idle');
  // Garage: only a switch (via device area), plus a fan.
  add('switch.garage_outlet', 'off');
  add('switch.garage_heater', 'unavailable');
  add('fan.garage', 'off');
  // Office: a WLED strip (main light + segments on one device), a light group
  // over two bulbs, a scene, an illuminance sensor, a diagnostic uptime sensor
  // that HA would list in the area, and a plain on/off light.
  add('light.desk_strip', 'on', { friendly_name: 'Desk strip', supported_color_modes: ['rgb'] });
  add('light.desk_strip_segment_001', 'off', { friendly_name: 'Desk strip Segment 001' });
  add('light.desk_strip_segment_002', 'off', { friendly_name: 'Desk strip Segment 002' });
  add('light.office_lamps', 'on', {
    friendly_name: 'Office lamps',
    entity_id: ['light.lamp_left', 'light.lamp_right'],
    supported_color_modes: ['color_temp'],
  });
  add('light.lamp_left', 'on', {
    friendly_name: 'Lamp left',
    supported_color_modes: ['color_temp'],
  });
  add('light.lamp_right', 'on', {
    friendly_name: 'Lamp right',
    supported_color_modes: ['color_temp'],
  });
  add('light.office_closet', 'off', { friendly_name: 'Closet', supported_color_modes: ['onoff'] });
  add('scene.office_focus', 'scening', { friendly_name: 'Focus' });
  add('sensor.office_lux', '320', { device_class: 'illuminance', unit_of_measurement: 'lx' });
  add('sensor.office_ap_uptime', '4 days', { friendly_name: 'AP uptime' });
  add('sensor.wayne_phone_steps', '4021', { unit_of_measurement: 'steps' });
  // Misc: two utility sensors and nothing to control; not worth a page.
  add('sensor.grid_co2_intensity', '400', { unit_of_measurement: 'g/kWh' });
  add('sensor.grid_fossil_pct', '58', { unit_of_measurement: '%' });
  // Attic: an empty area.
  // Ungrouped things for the Home page.
  add('person.wayne', 'home');
  add('person.guest', 'not_home');
  add('weather.home', 'sunny');
  add('update.core', 'off');
  add('sensor.remote_battery', '42', { device_class: 'battery' });

  return {
    states,
    panelUrl: 'ultra-dash',
    areas: {
      kitchen: { area_id: 'kitchen', name: 'Kitchen', icon: 'mdi:stove', floor_id: 'ground' },
      living: { area_id: 'living', name: 'Living Room', floor_id: 'ground' },
      garage: { area_id: 'garage', name: 'Garage', floor_id: null },
      office: { area_id: 'office', name: 'Office', floor_id: 'upstairs' },
      misc: { area_id: 'misc', name: 'Misc', floor_id: null },
      attic: { area_id: 'attic', name: 'Attic', floor_id: 'upstairs' },
    },
    floors: {
      ground: { floor_id: 'ground', name: 'Ground Floor', level: 0 },
      upstairs: { floor_id: 'upstairs', name: 'Upstairs', level: 1 },
    },
    devices: {
      dev_garage: { id: 'dev_garage', area_id: 'garage' },
      dev_wled: { id: 'dev_wled', area_id: 'office', name: 'WLED', name_by_user: 'Desk strip' },
    },
    entities: {
      'light.kitchen_ceiling': { entity_id: 'light.kitchen_ceiling', area_id: 'kitchen' },
      'light.kitchen_counter': { entity_id: 'light.kitchen_counter', area_id: 'kitchen' },
      'sensor.kitchen_temperature': { entity_id: 'sensor.kitchen_temperature', area_id: 'kitchen' },
      'sensor.fridge_temperature': { entity_id: 'sensor.fridge_temperature', area_id: 'kitchen' },
      'sensor.kitchen_humidity': { entity_id: 'sensor.kitchen_humidity', area_id: 'kitchen' },
      'binary_sensor.kitchen_door': { entity_id: 'binary_sensor.kitchen_door', area_id: 'kitchen' },
      'sensor.kitchen_hub_rssi': {
        entity_id: 'sensor.kitchen_hub_rssi',
        area_id: 'kitchen',
        entity_category: 'diagnostic',
      },
      'media_player.living_tv': { entity_id: 'media_player.living_tv', area_id: 'living' },
      'climate.living': { entity_id: 'climate.living', area_id: 'living' },
      'cover.living_blinds': { entity_id: 'cover.living_blinds', area_id: 'living' },
      'camera.living': { entity_id: 'camera.living', area_id: 'living' },
      'switch.garage_outlet': { entity_id: 'switch.garage_outlet', device_id: 'dev_garage' },
      'switch.garage_heater': { entity_id: 'switch.garage_heater', device_id: 'dev_garage' },
      'fan.garage': { entity_id: 'fan.garage', device_id: 'dev_garage' },
      'light.hidden_one': { entity_id: 'light.hidden_one', area_id: 'kitchen', hidden: true },
      'light.desk_strip': { entity_id: 'light.desk_strip', device_id: 'dev_wled' },
      'light.desk_strip_segment_001': {
        entity_id: 'light.desk_strip_segment_001',
        device_id: 'dev_wled',
      },
      'light.desk_strip_segment_002': {
        entity_id: 'light.desk_strip_segment_002',
        device_id: 'dev_wled',
      },
      'light.office_lamps': { entity_id: 'light.office_lamps', area_id: 'office' },
      'light.lamp_left': { entity_id: 'light.lamp_left', area_id: 'office' },
      'light.lamp_right': { entity_id: 'light.lamp_right', area_id: 'office' },
      'light.office_closet': { entity_id: 'light.office_closet', area_id: 'office' },
      'scene.office_focus': { entity_id: 'scene.office_focus', area_id: 'office' },
      'sensor.office_lux': { entity_id: 'sensor.office_lux', area_id: 'office' },
      'sensor.office_ap_uptime': {
        entity_id: 'sensor.office_ap_uptime',
        area_id: 'office',
        entity_category: 'diagnostic',
      },
      'sensor.wayne_phone_steps': {
        entity_id: 'sensor.wayne_phone_steps',
        area_id: 'office',
        platform: 'mobile_app',
      },
      'sensor.grid_co2_intensity': { entity_id: 'sensor.grid_co2_intensity', area_id: 'misc' },
      'sensor.grid_fossil_pct': { entity_id: 'sensor.grid_fossil_pct', area_id: 'misc' },
    },
    callWS: async () => {
      throw new Error('sync registries should be used');
    },
    localize: (k: string) => k,
  } as any;
}

function allCards(view: LovelaceViewRawConfig): LovelaceCardRawConfig[] {
  return (view.sections ?? []).flatMap(s => s.cards);
}

function ultraCards(view: LovelaceViewRawConfig): any[] {
  return allCards(view).filter(c => c.type === 'custom:ultra-card');
}

function walkModules(modules: any[], out: any[] = []): any[] {
  for (const m of modules) {
    out.push(m);
    if (Array.isArray(m.modules)) walkModules(m.modules, out);
  }
  return out;
}

function modulesOf(card: any): any[] {
  return walkModules(
    card.layout.rows.flatMap((r: any) => r.columns.flatMap((c: any) => c.modules))
  );
}

describe('generateUltraDashboard', () => {
  let hass: any;
  beforeAll(() => {
    hass = makeHass();
  });

  it('builds a Home page plus one page per area that has entities', async () => {
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, hass);
    expect(dash.views.map(v => v.title)).toEqual([
      'Home',
      'Garage',
      'Kitchen',
      'Living Room',
      'Office',
    ]);
    expect(dash.views.map(v => v.path)).toEqual(['home', 'garage', 'kitchen', 'living', 'office']);
    expect(dash.views.every(v => v.type === 'sections')).toBe(true);
    // The Attic has no entities, so it gets no page. Misc has two utility
    // sensors and nothing to control: a bucket, not a room, so no page either.
    expect(dash.views.some(v => v.title === 'Attic')).toBe(false);
    expect(dash.views.some(v => v.title === 'Misc')).toBe(false);
    // ...unless it is asked for by name.
    const withMisc = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', areas: ['misc'], home_view: false },
      hass
    );
    expect(withMisc.views.map(v => v.title)).toEqual(['Misc']);
    // Area icon flows through to the tab.
    expect(dash.views.find(v => v.title === 'Kitchen')?.icon).toBe('mdi:stove');
  });

  it('puts only Ultra Cards (and section headings) on the dashboard, using Free modules', async () => {
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, hass);
    const proTypes = new Set(CORE_MANIFESTS.filter(isProModule).map(m => m.type));
    const seenTypes = new Set<string>();
    for (const view of dash.views) {
      for (const c of allCards(view)) {
        expect(['custom:ultra-card', 'heading']).toContain(c.type);
        if (c.type !== 'custom:ultra-card') continue;
        for (const m of modulesOf(c)) {
          seenTypes.add(m.type);
          expect(proTypes.has(m.type)).toBe(false);
        }
      }
    }
    expect(seenTypes).toContain('area_summary');
    // Rooms are composed from the module that suits each thing, not one list.
    for (const t of ['light', 'slider_control', 'icon', 'graphs', 'native_card', 'bar']) {
      expect(seenTypes).toContain(t);
    }
  });

  it('gives every module and row a unique id', async () => {
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, hass);
    const ids: string[] = [];
    for (const view of dash.views) {
      for (const c of ultraCards(view)) {
        for (const r of c.layout.rows) {
          ids.push(r.id);
          for (const col of r.columns) ids.push(col.id);
        }
        for (const m of modulesOf(c)) ids.push(m.id);
      }
    }
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('composes each room from the modules that suit its content', async () => {
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, hass);
    const headingsOf = (v: LovelaceViewRawConfig) =>
      allCards(v)
        .filter(c => c.type === 'heading')
        .map(c => c.heading);

    const kitchen = dash.views.find(v => v.title === 'Kitchen')!;
    expect(headingsOf(kitchen)).toEqual(['Lights', 'Climate', 'Security']);
    // Two dimmable lights: scene buttons over one slider per light.
    const lightTypes = modulesOf(ultraCards(kitchen)[1]).map(m => m.type);
    expect(lightTypes).toEqual(['light', 'slider_control']);
    const scenes = modulesOf(ultraCards(kitchen)[1])[0];
    expect(scenes.presets.map((p: any) => p.name)).toEqual(['Bright', 'Dim', 'Off']);
    expect(scenes.presets[0].entities).toEqual(['light.kitchen_ceiling', 'light.kitchen_counter']);
    const sliders = modulesOf(ultraCards(kitchen)[1])[1];
    expect(sliders.bars.map((b: any) => b.entity)).toEqual([
      'light.kitchen_ceiling',
      'light.kitchen_counter',
    ]);
    // Temperature and humidity become a 24h chart, not a list of rows.
    const chart = modulesOf(ultraCards(kitchen)[2])[0];
    expect(chart.type).toBe('graphs');
    expect(chart.time_period).toBe('24h');
    expect(chart.entities.map((e: any) => e.entity)).toEqual(['sensor.kitchen_temperature']);
    // The door sensor is a status row with its last change.
    const security = modulesOf(ultraCards(kitchen)[3])[0];
    expect(security.type).toBe('status_summary');
    expect(security.entities.map((e: any) => e.entity)).toEqual(['binary_sensor.kitchen_door']);

    const living = dash.views.find(v => v.title === 'Living Room')!;
    expect(headingsOf(living)).toEqual(['Climate', 'Media', 'Covers', 'Cameras']);
    const livingTypes = ultraCards(living).flatMap(c => modulesOf(c).map(m => m.type));
    // The thermostat is Home Assistant's own thermostat card inside an Ultra Card.
    const thermostat = ultraCards(living)
      .flatMap(c => modulesOf(c))
      .find(m => m.type === 'native_card');
    expect(thermostat.card_config).toEqual({ type: 'thermostat', entity: 'climate.living' });
    // A lone media player gets the full card layout.
    const media = ultraCards(living)
      .flatMap(c => modulesOf(c))
      .find(m => m.type === 'media_player');
    expect(media.layout).toBe('card');
    expect(livingTypes).toContain('cover');
    expect(livingTypes).toContain('camera');

    // A single switch is a tap grid, not a list.
    const garage = dash.views.find(v => v.title === 'Garage')!;
    const garageTypes = ultraCards(garage).flatMap(c => modulesOf(c).map(m => m.type));
    expect(garageTypes).toEqual(['area_summary', 'fan', 'icon', 'accordion', 'auto_entity_list']);
    const toggles = modulesOf(ultraCards(garage)[2])[0].icons;
    expect(toggles.map((i: any) => i.entity)).toEqual(['switch.garage_outlet']);
    expect(toggles[0].tap_action).toEqual({ action: 'toggle', entity: 'switch.garage_outlet' });
    // The unavailable heater is not a dead button; it is listed under More.
    const more = modulesOf(ultraCards(garage)[3]).find(m => m.type === 'auto_entity_list');
    expect(more.include_domains).toContain('switch');
    expect(more.hidden_entities).toContain('switch.garage_outlet');
    expect(more.hidden_entities).not.toContain('switch.garage_heater');
  });

  it('shows the lights a person reaches for: groups over members, one light per strip', async () => {
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, hass);
    const office = dash.views.find(v => v.title === 'Office')!;
    const headings = allCards(office)
      .filter(c => c.type === 'heading')
      .map(c => c.heading);
    expect(headings).toEqual(['Lights', 'Scenes', 'Environment']);

    const lights = modulesOf(ultraCards(office)[1]);
    const scenes = lights.find(m => m.type === 'light');
    // Segments hide behind the strip; the two lamps hide behind their group.
    expect(scenes.presets[0].entities).toEqual([
      'light.office_closet',
      'light.desk_strip',
      'light.office_lamps',
    ]);
    const sliders = lights.find(m => m.type === 'slider_control');
    expect(sliders.bars.map((b: any) => b.entity)).toEqual([
      'light.desk_strip',
      'light.office_lamps',
    ]);
    // The on/off closet light is a toggle, not a brightness slider.
    const toggles = lights.find(m => m.type === 'icon');
    expect(toggles.icons.map((i: any) => i.entity)).toEqual(['light.office_closet']);

    // Scenes run rather than toggle.
    const scene = modulesOf(ultraCards(office)[2])[0].icons[0];
    expect(scene.tap_action).toMatchObject({
      action: 'perform-action',
      perform_action: 'scene.turn_on',
      target: { entity_id: 'scene.office_focus' },
    });

    // Illuminance is a level bar with a short label; the diagnostic uptime
    // sensor is nowhere on the page.
    const env = modulesOf(ultraCards(office)[3]);
    const bar = env.find(m => m.type === 'bar');
    expect(bar).toMatchObject({
      entity: 'sensor.office_lux',
      left_title: 'Light level',
      left_entity: 'sensor.office_lux',
      percentage_max: 1000,
    });
    // Nor is the phone that happens to live in the office a room sensor.
    const everyEntity = JSON.stringify(office).replace(/"hidden_entities":\[[^\]]*\]/g, '');
    expect(everyEntity).not.toContain('sensor.office_ap_uptime');
    expect(everyEntity).not.toContain('sensor.wayne_phone_steps');
  });

  it('gives each room its own accent in styles without a fixed one', async () => {
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, hass);
    const accents = dash.views
      .slice(1)
      .map(v => modulesOf(ultraCards(v)[0])[0].accent_color as string);
    expect(accents.every(Boolean)).toBe(true);
    expect(new Set(accents).size).toBe(accents.length);
    // The slider fill and scene buttons follow the room accent.
    const kitchen = dash.views.find(v => v.title === 'Kitchen')!;
    const kitchenAccent = modulesOf(ultraCards(kitchen)[0])[0].accent_color;
    const sliders = modulesOf(ultraCards(kitchen)[1]).find(m => m.type === 'slider_control');
    expect(sliders.slider_fill_color).toBe(kitchenAccent);

    const bold = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', style: 'bold' },
      hass
    );
    const boldAccents = bold.views.slice(1).map(v => modulesOf(ultraCards(v)[0])[0].accent_color);
    expect(new Set(boldAccents)).toEqual(new Set(['var(--primary-color)']));
  });

  it('keeps auto lists in step with the generator', async () => {
    // Many switches fall back to a list; it must hide the room's diagnostic
    // entities and list unavailable ones instead of showing "No entities match".
    const many = makeHass();
    for (let i = 0; i < 10; i++) {
      many.states[`switch.office_plug_${i}`] = state(`switch.office_plug_${i}`, 'off');
      many.entities[`switch.office_plug_${i}`] = {
        entity_id: `switch.office_plug_${i}`,
        area_id: 'office',
      };
    }
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, many);
    const office = dash.views.find(v => v.title === 'Office')!;
    const list = ultraCards(office)
      .flatMap(c => modulesOf(c))
      .find(m => m.type === 'auto_entity_list');
    expect(list.include_domains).toEqual(['switch', 'input_boolean']);
    expect(list.show_unavailable).toBe(true);
    expect(list.hidden_entities).toContain('sensor.office_ap_uptime');
  });

  it('points the room tile at a live, room-like temperature sensor', async () => {
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, hass);
    const kitchen = dash.views.find(v => v.title === 'Kitchen')!;
    const tile = modulesOf(ultraCards(kitchen)[0])[0];
    expect(tile.type).toBe('area_summary');
    // Not the fridge probe (appliance) and not the unavailable humidity sensor.
    expect(tile.temperature_entity).toBe('sensor.kitchen_temperature');
    expect(tile.humidity_entity || undefined).toBeUndefined();
    // Room pages show every quick action; Home tiles are capped for even heights.
    expect(tile.max_quick_actions).not.toBe(3);
    const homeTile = modulesOf(
      ultraCards(dash.views[0]).find(c => modulesOf(c)[0]?.area_id === 'kitchen')!
    )[0];
    expect(homeTile.max_quick_actions).toBe(3);
  });

  it('lays out the Home page with a header, rooms per floor, people, alerts, batteries and updates', async () => {
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, hass);
    const home = dash.views[0];
    expect(home.max_columns).toBe(4);
    const headings = allCards(home)
      .filter(c => c.type === 'heading')
      .map(c => c.heading);
    expect(headings).toEqual([
      'Upstairs',
      'Ground Floor',
      'Other rooms',
      'People',
      'Alerts',
      'Batteries',
      'Updates',
    ]);

    const header = ultraCards(home)[0];
    expect(header.card_transparent).toBe(true);
    const headerTypes = modulesOf(header).map(m => m.type);
    expect(headerTypes).toEqual(['horizontal', 'clock', 'weather']);
    expect(modulesOf(header).find(m => m.type === 'weather').weather_entity).toBe('weather.home');

    // Room tiles are half-width and navigate to the area page of this dashboard.
    const tiles = ultraCards(home).filter(c => modulesOf(c)[0]?.type === 'area_summary');
    expect(tiles).toHaveLength(4);
    expect(tiles.every(t => t.grid_options?.columns === 6)).toBe(true);
    const kitchenTile = modulesOf(tiles.find(t => modulesOf(t)[0].area_id === 'kitchen'))[0];
    expect(kitchenTile.tap_action).toEqual({
      action: 'navigate',
      navigation_path: '/ultra-dash/kitchen',
    });

    const people = modulesOf(ultraCards(home).find(c => c.card_name === 'People')!);
    expect(people.filter(m => m.type === 'people').map(m => m.person_entity)).toEqual([
      'person.guest',
      'person.wayne',
    ]);
  });

  it('honours the Home page toggles and skips blocks with nothing to show', async () => {
    const dash = await generateUltraDashboard(
      {
        type: 'custom:ultra-dashboard',
        show_people: false,
        show_alerts: false,
        show_batteries: false,
        show_updates: false,
      },
      hass
    );
    const headings = allCards(dash.views[0])
      .filter(c => c.type === 'heading')
      .map(c => c.heading);
    expect(headings).toEqual(['Upstairs', 'Ground Floor', 'Other rooms']);

    const noHome = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', home_view: false },
      hass
    );
    expect(noHome.views[0].title).toBe('Garage');
  });

  it('points every content card at the chosen theme instead of baking chrome', async () => {
    const dash = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', style: 'glass' },
      hass
    );
    const glass = getDashboardStyle('glass');
    expect(glass.themeId).toBe('glass');
    for (const view of dash.views) {
      for (const c of ultraCards(view)) {
        expect(c.uc_theme).toBe('glass');
        // Chrome comes from the theme at render time so a later re-theme sticks.
        expect(c.card_border_radius).toBeUndefined();
        expect(c.card_background).toBeUndefined();
      }
    }
    const tile = modulesOf(ultraCards(dash.views[1])[0])[0];
    expect(tile.style_preset).toBe('theme');
    // Unknown style falls back to the default rather than failing.
    const fallback = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', style: 'neon' as never },
      hass
    );
    expect(fallback.views[1].sections![0].cards[0].uc_theme).toBe(
      getDashboardStyle(undefined).themeId
    );
  });

  it('filters areas with include and exclude lists', async () => {
    const only = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', areas: ['kitchen', 'attic'], home_view: false },
      hass
    );
    expect(only.views.map(v => v.title)).toEqual(['Kitchen']);

    const without = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', exclude_areas: ['kitchen'], home_view: false },
      hass
    );
    expect(without.views.map(v => v.title)).toEqual(['Garage', 'Living Room', 'Office']);
  });

  it('groups by floor when asked, with an Other page for areas without a floor', async () => {
    const dash = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', group_by: 'floor' },
      hass
    );
    expect(dash.views.map(v => v.title)).toEqual(['Home', 'Upstairs', 'Ground Floor', 'Other']);
    expect(dash.views[2].icon).toBe('mdi:home-floor-0');
    // One section per area, each starting with its heading and tile.
    const ground = dash.views[2];
    expect(ground.sections!.map(s => s.cards[0].heading)).toEqual(['Kitchen', 'Living Room']);
    expect(ground.sections!.every(s => modulesOf(s.cards[1])[0].type === 'area_summary')).toBe(
      true
    );
    // Blocks are introduced by subtitle headings inside the area's section.
    const kitchenSub = ground.sections![0].cards[2];
    expect(kitchenSub).toMatchObject({
      type: 'heading',
      heading: 'Lights',
      heading_style: 'subtitle',
    });
    // Home tiles navigate to the floor page.
    const tiles = ultraCards(dash.views[0]).filter(c => modulesOf(c)[0]?.type === 'area_summary');
    const garageTile = modulesOf(tiles.find(t => modulesOf(t)[0].area_id === 'garage'))[0];
    expect(garageTile.tap_action.navigation_path).toBe('/ultra-dash/other');
  });

  it('keeps the dashboard title only when the strategy config sets one', async () => {
    const untitled = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, hass);
    expect('title' in untitled).toBe(false);
    const titled = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', title: 'Casa' },
      hass
    );
    expect(titled.title).toBe('Casa');
  });

  it('explains what to do when there are no areas with entities', async () => {
    const empty = { ...makeHass(), areas: {}, entities: {}, devices: {} };
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, empty);
    // The Home page is still useful (header, people, alerts...), so it stays,
    // with a hint where the rooms would have been.
    expect(dash.views).toHaveLength(1);
    const hint = allCards(dash.views[0]).find(c => c.type === 'markdown');
    expect(String(hint?.content)).toContain('areas');

    const noHome = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', home_view: false },
      empty
    );
    expect(noHome.views).toHaveLength(1);
    expect(noHome.views[0].sections![0].cards[0].type).toBe('markdown');
  });

  it('falls back to the websocket registries when hass has no sync registries', async () => {
    const base = makeHass();
    const calls: string[] = [];
    const wsHass = {
      ...base,
      areas: undefined,
      floors: undefined,
      devices: undefined,
      entities: undefined,
      callWS: async ({ type }: { type: string }) => {
        calls.push(type);
        switch (type) {
          case 'config/area_registry/list':
            return Object.values(base.areas);
          case 'config/device_registry/list':
            return Object.values(base.devices);
          case 'config/entity_registry/list':
            return Object.values(base.entities);
          case 'config/floor_registry/list':
            throw new Error('unsupported');
          default:
            throw new Error(type);
        }
      },
    };
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, wsHass);
    expect(calls).toContain('config/entity_registry/list');
    expect(dash.views.map(v => v.title)).toEqual([
      'Home',
      'Garage',
      'Kitchen',
      'Living Room',
      'Office',
    ]);
    // No floors -> a single "Rooms" heading on the Home page.
    expect(allCards(dash.views[0]).find(c => c.type === 'heading')?.heading).toBe('Rooms');
  });
});

describe('generateUltraAreaView', () => {
  it('generates a single area page for the view strategy', async () => {
    const hass = makeHass();
    const view = await generateUltraAreaView(
      { type: 'custom:ultra-dashboard-area', area: 'kitchen', style: 'bold' },
      hass
    );
    expect(view.type).toBe('sections');
    const tile = modulesOf(view.sections![0].cards[0])[0];
    expect(tile.type).toBe('area_summary');
    expect(tile.area_id).toBe('kitchen');
    expect(tile.accent_color).toBe('var(--primary-color)');
  });

  it('reports an unknown area instead of throwing', async () => {
    const view = await generateUltraAreaView(
      { type: 'custom:ultra-dashboard-area', area: 'nope' },
      makeHass()
    );
    expect(view.sections![0].cards[0].type).toBe('markdown');
  });
});

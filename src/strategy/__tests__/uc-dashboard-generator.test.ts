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
  add('light.kitchen_ceiling');
  add('light.kitchen_counter', 'off');
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
  add('fan.garage', 'off');
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
      attic: { area_id: 'attic', name: 'Attic', floor_id: 'upstairs' },
    },
    floors: {
      ground: { floor_id: 'ground', name: 'Ground Floor', level: 0 },
      upstairs: { floor_id: 'upstairs', name: 'Upstairs', level: 1 },
    },
    devices: {
      dev_garage: { id: 'dev_garage', area_id: 'garage' },
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
      'fan.garage': { entity_id: 'fan.garage', device_id: 'dev_garage' },
      'light.hidden_one': { entity_id: 'light.hidden_one', area_id: 'kitchen', hidden: true },
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
    expect(dash.views.map(v => v.title)).toEqual(['Home', 'Garage', 'Kitchen', 'Living Room']);
    expect(dash.views.map(v => v.path)).toEqual(['home', 'garage', 'kitchen', 'living']);
    expect(dash.views.every(v => v.type === 'sections')).toBe(true);
    // The Attic has no entities, so it gets no page.
    expect(dash.views.some(v => v.title === 'Attic')).toBe(false);
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
    expect(seenTypes).toContain('auto_entity_list');
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

  it('classifies the room content into blocks', async () => {
    const dash = await generateUltraDashboard({ type: 'custom:ultra-dashboard' }, hass);
    const kitchen = dash.views.find(v => v.title === 'Kitchen')!;
    const headings = allCards(kitchen)
      .filter(c => c.type === 'heading')
      .map(c => c.heading);
    expect(headings).toEqual(['Lights', 'Climate', 'Security']);

    const lights = modulesOf(ultraCards(kitchen)[1])[0];
    expect(lights.type).toBe('auto_entity_list');
    expect(lights.include_areas).toEqual(['kitchen']);
    expect(lights.include_domains).toEqual(['light']);
    expect(lights.show_title).toBe(false);

    const living = dash.views.find(v => v.title === 'Living Room')!;
    const livingHeadings = allCards(living)
      .filter(c => c.type === 'heading')
      .map(c => c.heading);
    expect(livingHeadings).toEqual(['Climate', 'Media', 'Covers', 'Cameras']);
    const types = ultraCards(living).flatMap(c => modulesOf(c).map(m => m.type));
    expect(types).toContain('media_player');
    expect(types).toContain('cover');
    expect(types).toContain('camera');

    // Diagnostic and hidden registry entries never reach a room page.
    const garage = dash.views.find(v => v.title === 'Garage')!;
    const garageTypes = ultraCards(garage).flatMap(c => modulesOf(c).map(m => m.type));
    expect(garageTypes).toEqual(['area_summary', 'fan', 'auto_entity_list']);
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
    expect(tiles).toHaveLength(3);
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
    expect(headings).toEqual(['Ground Floor', 'Other rooms']);

    const noHome = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', home_view: false },
      hass
    );
    expect(noHome.views[0].title).toBe('Garage');
  });

  it('applies the chosen style chrome to every content card', async () => {
    const dash = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', style: 'glass' },
      hass
    );
    const glass = getDashboardStyle('glass');
    for (const view of dash.views) {
      for (const c of ultraCards(view)) {
        if (c.card_transparent) continue;
        expect(c.card_border_radius).toBe(glass.card.card_border_radius);
        expect(c.card_background).toBe(glass.card.card_background);
      }
    }
    const tile = modulesOf(ultraCards(dash.views[1])[0])[0];
    expect(tile.style_preset).toBe(glass.areaSummaryPreset);
    // Unknown style falls back to the default rather than failing.
    const fallback = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', style: 'neon' as never },
      hass
    );
    expect(fallback.views[1].sections![0].cards[0].card_border_radius).toBe(
      getDashboardStyle(undefined).card.card_border_radius
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
    expect(without.views.map(v => v.title)).toEqual(['Garage', 'Living Room']);
  });

  it('groups by floor when asked, with an Other page for areas without a floor', async () => {
    const dash = await generateUltraDashboard(
      { type: 'custom:ultra-dashboard', group_by: 'floor' },
      hass
    );
    expect(dash.views.map(v => v.title)).toEqual(['Home', 'Ground Floor', 'Other']);
    expect(dash.views[1].icon).toBe('mdi:home-floor-0');
    // One section per area, each starting with its heading and tile.
    const ground = dash.views[1];
    expect(ground.sections!.map(s => s.cards[0].heading)).toEqual(['Kitchen', 'Living Room']);
    expect(ground.sections!.every(s => modulesOf(s.cards[1])[0].type === 'area_summary')).toBe(
      true
    );
    // Lists carry their own titles because there are no per-block headings here.
    const kitchenList = modulesOf(ground.sections![0].cards[2])[0];
    expect(kitchenList.type).toBe('auto_entity_list');
    expect(kitchenList.show_title).toBe(true);
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
    expect(dash.views.map(v => v.title)).toEqual(['Home', 'Garage', 'Kitchen', 'Living Room']);
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

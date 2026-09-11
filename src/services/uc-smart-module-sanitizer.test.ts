// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  buildComposedEntityModules,
  buildModulesFromCompositionPlan,
  deriveTitleFromPrompt,
  sanitizeSmartLayout,
  sanitizeSmartModule,
  sanitizeSmartModules,
  selectEntitiesForPrompt,
} from './uc-smart-module-sanitizer';
import { parseSmartCompositionPlan } from './uc-smart-composition-planner';

const hass = {
  states: {
    'light.kitchen': { attributes: { friendly_name: 'Kitchen' }, state: 'on' },
    'lock.front_door': { attributes: { friendly_name: 'Front Door' }, state: 'locked' },
    'weather.home': {
      attributes: { friendly_name: 'Home Weather', temperature: 72, temperature_unit: '°F' },
      state: 'partlycloudy',
    },
    'climate.living_room': { attributes: { friendly_name: 'Living Room' }, state: 'heat' },
    'cover.garage': { attributes: { friendly_name: 'Garage' }, state: 'closed' },
    'fan.bedroom': { attributes: { friendly_name: 'Bedroom Fan' }, state: 'off' },
    'lock.back_door': { attributes: { friendly_name: 'Back Door' }, state: 'unlocked' },
    'sensor.temperature': { attributes: { friendly_name: 'Temperature' }, state: '72' },
    'sensor.humidity': { attributes: { friendly_name: 'Humidity' }, state: '45' },
    'binary_sensor.motion': { attributes: { friendly_name: 'Motion' }, state: 'off' },
    'media_player.speaker': { attributes: { friendly_name: 'Speaker', media_title: 'Song' }, state: 'playing' },
  },
};

const freeContext = { tier: 'free' as const, prompt: 'control lights' };
const proContext = { tier: 'pro' as const, prompt: 'climate control', allowProModules: true };

describe('uc-smart-module-sanitizer', () => {
  it('rejects unknown module types', () => {
    const modules = sanitizeSmartModules(
      [{ type: 'unknown_widget', entity: 'light.kitchen' }],
      hass,
      freeContext,
      'test'
    );
    expect(modules).toHaveLength(0);
  });

  it('swaps unknown entities for the best real one of the same kind', () => {
    const module = sanitizeSmartModule(
      {
        type: 'light',
        presets: [{ name: 'On', action: 'turn_on', entities: ['light.missing'] }],
      },
      hass,
      freeContext,
      'test-light'
    );
    expect(module).toMatchObject({
      type: 'light',
      presets: [expect.objectContaining({ entities: ['light.kitchen'] })],
    });
  });

  it('rejects modules whose kind of entity does not exist in the home', () => {
    const module = sanitizeSmartModule(
      { type: 'vacuum', entity: 'vacuum.missing' },
      hass,
      freeContext,
      'test-vacuum'
    );
    expect(module).toBeNull();
  });

  it('sanitizes nested layout rows and strips invalid children', () => {
    const layout = sanitizeSmartLayout(
      hass,
      {
        rows: [
          {
            id: 'row-1',
            column_layout: '1-col',
            columns: [
              {
                id: 'col-1',
                modules: [
                  {
                    type: 'horizontal',
                    modules: [
                      { type: 'icon', icons: [{ entity: 'weather.home' }] },
                      { type: 'info', info_entities: [{ entity: 'weather.missing' }] },
                    ],
                  },
                  { type: 'light', presets: [{ name: 'On', entities: ['light.kitchen'], action: 'turn_on' }] },
                ],
              },
            ],
          },
        ],
      },
      freeContext,
      'plan'
    );

    const modules = layout?.rows[0].columns[0].modules || [];
    expect(modules).toHaveLength(2);
    expect(modules[0]).toMatchObject({ type: 'horizontal' });
    expect((modules[0] as { modules: unknown[] }).modules).toHaveLength(1);
    expect(modules[1]).toMatchObject({ type: 'light' });
  });

  it('downgrades pro climate modules to info on free tier', () => {
    const module = sanitizeSmartModule(
      { type: 'climate', entity: 'climate.living_room' },
      hass,
      freeContext,
      'climate-1'
    );
    expect(module).toMatchObject({
      type: 'info',
      info_entities: [expect.objectContaining({ entity: 'climate.living_room' })],
    });
  });

  it('keeps climate modules for pro tier', () => {
    const module = sanitizeSmartModule(
      { type: 'climate', entity: 'climate.living_room' },
      hass,
      proContext,
      'climate-1'
    );
    expect(module).toMatchObject({ type: 'climate', entity: 'climate.living_room' });
  });

  it('blocks markdown unless prompt explicitly asks for text content', () => {
    const blocked = sanitizeSmartModule(
      { type: 'markdown', content: 'Hello world' },
      hass,
      freeContext,
      'md-1'
    );
    expect(blocked).toBeNull();

    const allowed = sanitizeSmartModule(
      { type: 'markdown', content: 'Hello world' },
      hass,
      { tier: 'free', prompt: 'write markdown notes for my dashboard' },
      'md-2'
    );
    expect(allowed).toMatchObject({ type: 'markdown', content: 'Hello world' });
  });

  it('sanitizes domain-specific modules for cover, fan, and media_player', () => {
    expect(
      sanitizeSmartModule({ type: 'cover', entity: 'cover.garage' }, hass, freeContext, 'cover-1')
    ).toMatchObject({ type: 'cover', entity: 'cover.garage' });
    expect(
      sanitizeSmartModule({ type: 'fan', entity: 'fan.bedroom' }, hass, freeContext, 'fan-1')
    ).toMatchObject({ type: 'fan', entity: 'fan.bedroom' });
    expect(
      sanitizeSmartModule({ type: 'media_player', entity: 'media_player.speaker' }, hass, freeContext, 'media-1')
    ).toMatchObject({ type: 'media_player', entity: 'media_player.speaker' });
  });

  it('builds fan toggle rows and sensor grid from composition plan', () => {
    const plan = parseSmartCompositionPlan('fan on button then grid of sensors', hass);
    const modules = buildModulesFromCompositionPlan('smart', plan, 'clean', hass, {
      tier: 'free',
      prompt: 'fan on button then grid of sensors',
    });

    expect(modules).toHaveLength(1);
    expect(modules[0]).toMatchObject({ type: 'vertical' });
    const stack = modules[0] as { modules: unknown[] };
    expect(stack.modules[0]).toMatchObject({
      type: 'horizontal',
      modules: [
        expect.objectContaining({ type: 'icon' }),
        expect.objectContaining({
          type: 'button',
          tap_action: expect.objectContaining({ action: 'toggle', entity: 'fan.bedroom' }),
        }),
      ],
    });
    expect(stack.modules[1]).toMatchObject({
      type: 'grid',
      entities: expect.arrayContaining([
        expect.objectContaining({ entity: 'sensor.temperature' }),
      ]),
    });
  });

  it('builds weather header above light detail list via composition recipes', () => {
    const prompt =
      'Weather on top with icon and temp, then list lights and status with brightness and color.';
    const modules = buildComposedEntityModules(
      'smart',
      [
        { entityId: 'weather.home', name: 'Home Weather', domain: 'weather' },
        { entityId: 'light.kitchen', name: 'Kitchen', domain: 'light' },
      ],
      'clean',
      hass,
      { tier: 'free', prompt }
    );

    expect(modules[0]).toMatchObject({
      type: 'vertical',
      modules: [
        expect.objectContaining({
          type: 'horizontal',
          modules: [
            expect.objectContaining({ type: 'icon' }),
            expect.objectContaining({
              type: 'info',
              info_entities: [expect.objectContaining({ attribute: 'temperature' })],
            }),
          ],
        }),
        expect.objectContaining({
          type: 'vertical',
          modules: [
            expect.objectContaining({
              type: 'horizontal',
              modules: [
                expect.objectContaining({ type: 'icon' }),
                expect.objectContaining({
                  type: 'info',
                  info_entities: expect.arrayContaining([
                    expect.objectContaining({ attribute: 'brightness' }),
                    expect.objectContaining({ attribute: 'rgb_color' }),
                  ]),
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  it('keeps lock modules flat for lock status prompts', () => {
    const modules = buildComposedEntityModules(
      'smart',
      [
        { entityId: 'lock.front_door', name: 'Front Door', domain: 'lock' },
        { entityId: 'lock.back_door', name: 'Back Door', domain: 'lock' },
      ],
      'clean',
      hass,
      { tier: 'free', prompt: 'show only locks with status' }
    );

    expect(modules).toHaveLength(2);
    expect(modules[0]).toMatchObject({ type: 'lock', entity: 'lock.front_door' });
    expect(modules[1]).toMatchObject({ type: 'lock', entity: 'lock.back_door' });
  });

  it('builds weather header, light grid, and fuel gauge from stacked prompt', () => {
    const richHass = {
      states: {
        ...hass.states,
        'light.a': { attributes: { friendly_name: 'Light A' }, state: 'on' },
        'light.b': { attributes: { friendly_name: 'Light B' }, state: 'off' },
        'light.c': { attributes: { friendly_name: 'Light C' }, state: 'on' },
        'light.d': { attributes: { friendly_name: 'Light D' }, state: 'off' },
        'sensor.car_fuel_level': {
          attributes: { friendly_name: 'Car Fuel Level', device_class: 'fuel', unit_of_measurement: '%' },
          state: '62',
        },
      },
    };
    const prompt =
      'weather icon on top with temp in large text size and below that show 4 lights and below that a gauge showing fuel left in my car';
    const modules = buildComposedEntityModules('smart', [], 'clean', richHass, {
      tier: 'free',
      prompt,
    });

    expect(modules[0]).toMatchObject({ type: 'vertical' });
    const stack = modules[0] as { modules: Array<Record<string, unknown>> };
    expect(stack.modules[0]).toMatchObject({
      type: 'horizontal',
      modules: [
        expect.objectContaining({ type: 'icon' }),
        expect.objectContaining({ type: 'info', text_size: 36 }),
      ],
    });
    expect(stack.modules[1]).toMatchObject({ type: 'grid' });
    expect((stack.modules[1] as { entities: unknown[] }).entities).toHaveLength(4);
    expect(stack.modules[2]).toMatchObject({
      type: 'gauge',
      entity: 'sensor.car_fuel_level',
    });
  });

  it('uses horizontal composition when prompt asks for side-by-side controls', () => {
    const modules = buildComposedEntityModules(
      'smart',
      [],
      'clean',
      hass,
      {
        tier: 'free',
        prompt: 'show lock controls beside media controls in one row',
      }
    );

    expect(modules).toHaveLength(1);
    expect(modules[0]).toMatchObject({
      type: 'horizontal',
      modules: expect.arrayContaining([
        expect.objectContaining({ type: 'lock', entity: 'lock.front_door' }),
        expect.objectContaining({ type: 'media_player', entity: 'media_player.speaker' }),
      ]),
    });
  });

  it('builds clock and weather row above light list for mixed dashboard prompts', () => {
    const prompt = 'Make a clock and weather card with a list of lights below';
    const modules = buildComposedEntityModules('smart', [], 'clean', hass, {
      tier: 'free',
      prompt,
    });

    expect(modules[0]).toMatchObject({ type: 'vertical' });
    const stack = modules[0] as { modules: Array<Record<string, unknown>> };
    expect(stack.modules[0]).toMatchObject({
      type: 'horizontal',
      modules: [
        expect.objectContaining({ type: 'clock' }),
        expect.objectContaining({
          type: 'horizontal',
          modules: [
            expect.objectContaining({ type: 'icon' }),
            expect.objectContaining({ type: 'info' }),
          ],
        }),
      ],
    });
    expect(stack.modules.some(module => module.type === 'separator')).toBe(false);
    expect(stack.modules[1]).toMatchObject({
      type: 'vertical',
      modules: expect.arrayContaining([
        expect.objectContaining({
          type: 'horizontal',
          modules: [
            expect.objectContaining({ type: 'icon' }),
            expect.objectContaining({ type: 'info' }),
          ],
        }),
      ]),
    });
  });

  it('uses pro animated modules for pro tier clock and weather cards', () => {
    const prompt = 'Make a clock and weather card with a list of lights below';
    const modules = buildComposedEntityModules('smart', [], 'clean', hass, {
      tier: 'pro',
      prompt,
      allowProModules: true,
    });

    const stack = modules[0] as { modules: Array<Record<string, unknown>> };
    const topRow = stack.modules[0] as { modules: Array<Record<string, unknown>> };
    expect(topRow.modules[0]).toMatchObject({ type: 'animated_clock' });
    expect(topRow.modules[1]).toMatchObject({
      type: 'horizontal',
      modules: [
        expect.objectContaining({ type: 'icon' }),
        expect.objectContaining({ type: 'info' }),
      ],
    });
  });

  it('builds icon + toggle rows with plug icons for switches', () => {
    const switchHass = {
      states: {
        'switch.kettle': { attributes: { friendly_name: 'Kettle', device_class: 'outlet' }, state: 'on' },
      },
    };
    const modules = buildComposedEntityModules('smart', [], 'clean', switchHass, {
      tier: 'free',
      prompt: 'kitchen plugs',
    });

    expect(modules).toHaveLength(1);
    expect(modules[0]).toMatchObject({
      type: 'horizontal',
      modules: [
        expect.objectContaining({
          type: 'icon',
          icons: [expect.objectContaining({ entity: 'switch.kettle', icon_active: 'mdi:power-plug' })],
        }),
        expect.objectContaining({
          type: 'button',
          tap_action: { action: 'toggle', entity: 'switch.kettle' },
        }),
      ],
    });
  });

  it('collapses presence prompts into a row of per-person people modules', () => {
    const peopleHass = {
      states: {
        'person.wayne': { attributes: { friendly_name: 'Wayne' }, state: 'home' },
        'person.sam': { attributes: { friendly_name: 'Sam' }, state: 'not_home' },
      },
    };
    const modules = buildComposedEntityModules('smart', [], 'clean', peopleHass, {
      tier: 'free',
      prompt: 'who is home',
    });

    // The people module renders one `person_entity`, so several people become a row.
    expect(modules).toHaveLength(1);
    expect(modules[0]).toMatchObject({
      type: 'horizontal',
      modules: [
        { type: 'people', person_entity: 'person.wayne', layout_style: 'compact' },
        { type: 'people', person_entity: 'person.sam', layout_style: 'compact' },
      ],
    });
  });

  it('emits configs the real modules read (person_entity, calendars, markers, bars)', () => {
    const richHass = {
      states: {
        'person.wayne': { attributes: { friendly_name: 'Wayne' }, state: 'home' },
        'calendar.family': { attributes: { friendly_name: 'Family' }, state: 'off' },
        'light.kitchen': { attributes: { friendly_name: 'Kitchen Light' }, state: 'on' },
        'sensor.phone_battery': {
          attributes: { friendly_name: 'Phone Battery', device_class: 'battery', unit_of_measurement: '%' },
          state: '55',
        },
      },
    };
    const context = { tier: 'pro' as const, prompt: 'test card', allowProModules: true };

    expect(sanitizeSmartModule({ type: 'people', entities: ['person.wayne'] }, richHass, context, 'p')).toMatchObject({
      type: 'people',
      person_entity: 'person.wayne',
    });
    expect(sanitizeSmartModule({ type: 'calendar', entities: ['calendar.family'], view: 'list' }, richHass, context, 'c')).toMatchObject({
      type: 'calendar',
      view_type: 'compact_list',
      calendars: [{ entity: 'calendar.family' }],
    });
    expect(sanitizeSmartModule({ type: 'map', entities: ['person.wayne'] }, richHass, context, 'm')).toMatchObject({
      type: 'map',
      markers: [{ type: 'entity', entity: 'person.wayne' }],
    });
    expect(sanitizeSmartModule({ type: 'slider_control', entity: 'light.kitchen' }, richHass, context, 's')).toMatchObject({
      type: 'slider_control',
      bars: [{ type: 'brightness', entity: 'light.kitchen' }],
    });
    expect(
      sanitizeSmartModule({ type: 'battery_monitor', entities: ['sensor.phone_battery'], style_preset: 'compact' }, richHass, context, 'b')
    ).toMatchObject({
      type: 'battery_monitor',
      discovery_mode: 'manual',
      style: 'list',
      entities: [{ entity: 'sensor.phone_battery' }],
    });
    expect(sanitizeSmartModule({ type: 'graphs', entities: ['sensor.phone_battery'] }, richHass, context, 'g')).toMatchObject({
      type: 'graphs',
      chart_type: 'line',
      time_period: '24h',
    });
    expect(sanitizeSmartModule({ type: 'separator', style: 'dots' }, richHass, context, 'sep')).toMatchObject({
      separator_style: 'dotted',
    });
  });

  it('auto-fills entity modules the AI left empty or pointed at a missing entity', () => {
    const homeHass = {
      states: {
        'person.wayne': { attributes: { friendly_name: 'Wayne' }, state: 'home' },
        'person.sam': { attributes: { friendly_name: 'Sam' }, state: 'not_home' },
        'light.kitchen': { attributes: { friendly_name: 'Kitchen Light' }, state: 'on' },
        'light.bedroom': { attributes: { friendly_name: 'Bedroom Light' }, state: 'off' },
      },
    };
    const context = { tier: 'free' as const, prompt: 'kitchen light and who is home' };

    // people with no entities at all -> every person in the home
    expect(sanitizeSmartModule({ type: 'people' }, homeHass, context, 'p')).toMatchObject({
      type: 'horizontal',
      modules: [{ person_entity: 'person.wayne' }, { person_entity: 'person.sam' }],
    });
    // light pointing at a hallucinated entity -> the light the request talks about
    expect(
      sanitizeSmartModule({ type: 'light', entity: 'light.does_not_exist', name: 'Kitchen' }, homeHass, context, 'l')
    ).toMatchObject({ type: 'light', presets: [expect.objectContaining({ entities: ['light.kitchen'] })] });
  });

  it('uses device-class icons and a single state readout for binary sensor status rows', () => {
    const doorHass = {
      states: {
        'binary_sensor.front_door': { attributes: { friendly_name: 'Front Door', device_class: 'door' }, state: 'off' },
      },
    };
    const modules = buildComposedEntityModules('smart', [], 'clean', doorHass, {
      tier: 'free',
      prompt: 'door status list',
    });

    const list = modules[0] as { type: string; modules: Array<Record<string, unknown>> };
    expect(list.type).toBe('vertical');
    expect(list.modules[0]).toMatchObject({
      type: 'horizontal',
      modules: [
        expect.objectContaining({
          type: 'icon',
          icons: [
            expect.objectContaining({
              icon_inactive: 'mdi:door-closed',
              icon_active: 'mdi:door-open',
              show_state_when_active: false,
            }),
          ],
        }),
        expect.objectContaining({
          type: 'info',
          info_entities: [expect.objectContaining({ entity: 'binary_sensor.front_door', show_name: false, show_state: true })],
        }),
      ],
    });
  });

  it('gives scenes an activate button that calls scene.turn_on', () => {
    const sceneHass = {
      states: {
        'scene.movie_night': { attributes: { friendly_name: 'Movie Night' }, state: 'unknown' },
      },
    };
    const modules = buildComposedEntityModules('smart', [], 'clean', sceneHass, {
      tier: 'free',
      prompt: 'scene buttons',
    });

    expect(modules[0]).toMatchObject({
      type: 'horizontal',
      modules: [
        expect.objectContaining({ type: 'icon' }),
        expect.objectContaining({
          type: 'button',
          label: 'Activate',
          tap_action: {
            action: 'perform-action',
            service: 'scene.turn_on',
            service_data: { entity_id: 'scene.movie_night' },
          },
        }),
      ],
    });
  });

  it('uses the vacuum module on pro and a status row on free', () => {
    const vacuumHass = {
      states: {
        'vacuum.roomba': { attributes: { friendly_name: 'Roomba' }, state: 'docked' },
      },
    };
    const pro = buildComposedEntityModules('smart', [], 'clean', vacuumHass, {
      tier: 'pro',
      prompt: 'vacuum',
      allowProModules: true,
    });
    expect(pro[0]).toMatchObject({ type: 'vacuum', entity: 'vacuum.roomba' });

    const free = buildComposedEntityModules('smart', [], 'clean', vacuumHass, {
      tier: 'free',
      prompt: 'vacuum',
    });
    expect(free[0]).toMatchObject({
      type: 'horizontal',
      modules: [
        expect.objectContaining({
          type: 'icon',
          icons: [expect.objectContaining({ entity: 'vacuum.roomba', icon_active: 'mdi:robot-vacuum' })],
        }),
        expect.objectContaining({ type: 'info' }),
      ],
    });
  });
});

describe('deriveTitleFromPrompt', () => {
  const titleHass = {
    states: {
      'light.kitchen_main': { attributes: { friendly_name: 'Kitchen Main' }, state: 'on' },
      'switch.kitchen_kettle': { attributes: { friendly_name: 'Kettle' }, state: 'on' },
      'climate.living_room': { attributes: { friendly_name: 'Living Room Thermostat' }, state: 'heat' },
      'media_player.living_room_tv': { attributes: { friendly_name: 'Living Room TV' }, state: 'off' },
    },
    areas: {
      kitchen: { area_id: 'kitchen', name: 'Kitchen' },
      living_room: { area_id: 'living_room', name: 'Living Room' },
    },
    devices: {},
    entities: {
      'light.kitchen_main': { entity_id: 'light.kitchen_main', area_id: 'kitchen' },
      'switch.kitchen_kettle': { entity_id: 'switch.kitchen_kettle', area_id: 'kitchen' },
      'climate.living_room': { entity_id: 'climate.living_room', area_id: 'living_room' },
      'media_player.living_room_tv': { entity_id: 'media_player.living_room_tv', area_id: 'living_room' },
    },
  };

  it('joins two or three domains into a short area-prefixed title', () => {
    const kitchen = selectEntitiesForPrompt(titleHass, 'kitchen lights and plugs');
    expect(deriveTitleFromPrompt('kitchen lights and plugs', kitchen, titleHass)).toBe('Kitchen Lights & Switches');

    const living = selectEntitiesForPrompt(titleHass, 'living room climate and tv');
    expect(deriveTitleFromPrompt('living room climate and tv', living, titleHass)).toBe('Living Room Climate & Media');
  });

  it('names the card after the single entity a domain-less prompt points at', () => {
    const entities = selectEntitiesForPrompt(titleHass, 'kettle');
    expect(entities.map(entity => entity.entityId)).toEqual(['switch.kitchen_kettle']);
    expect(deriveTitleFromPrompt('kettle', entities, titleHass)).toBe('Kettle');
  });
});

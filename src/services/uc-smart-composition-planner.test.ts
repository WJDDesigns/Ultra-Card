// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { parseSmartCompositionPlan } from './uc-smart-composition-planner';
// Registers module handlers (default builders) the same way the service does in production.
import './uc-smart-module-sanitizer';

const hass = {
  states: {
    'weather.home': {
      attributes: { friendly_name: 'Home Weather', temperature: 72 },
      state: 'partlycloudy',
    },
    'light.hall': { attributes: { friendly_name: 'Hall Light' }, state: 'on' },
    'light.desk': { attributes: { friendly_name: 'Desk Lamp' }, state: 'off' },
    'fan.bedroom': { attributes: { friendly_name: 'Bedroom Fan' }, state: 'off' },
    'lock.front_door': { attributes: { friendly_name: 'Front Door' }, state: 'locked' },
    'lock.back_door': { attributes: { friendly_name: 'Back Door' }, state: 'unlocked' },
    'sensor.temperature': { attributes: { friendly_name: 'Temperature' }, state: '72' },
    'sensor.humidity': { attributes: { friendly_name: 'Humidity' }, state: '45' },
    'binary_sensor.motion': { attributes: { friendly_name: 'Motion' }, state: 'off' },
  },
};

describe('uc-smart-composition-planner', () => {
  it('splits fan button controls and sensor grid sections from prompt order', () => {
    const plan = parseSmartCompositionPlan('fan on button then grid of sensors', hass);

    expect(plan.sections).toHaveLength(2);
    expect(plan.sections[0]).toMatchObject({
      recipe: 'controlList',
      domains: ['fan'],
      wantsButtons: true,
      entities: [expect.objectContaining({ entityId: 'fan.bedroom' })],
    });
    expect(plan.sections[1]).toMatchObject({
      recipe: 'entityGrid',
      entities: expect.arrayContaining([
        expect.objectContaining({ entityId: 'sensor.temperature' }),
        expect.objectContaining({ entityId: 'sensor.humidity' }),
        expect.objectContaining({ entityId: 'binary_sensor.motion' }),
      ]),
    });
  });

  it('builds weather header and light list sections for top/bottom prompts', () => {
    const plan = parseSmartCompositionPlan(
      'weather on top with icon and temp, then list lights with brightness and color',
      hass
    );

    expect(plan.sections.length).toBeGreaterThanOrEqual(2);
    expect(plan.sections[0]).toMatchObject({
      recipe: 'header',
      domains: expect.arrayContaining(['weather']),
      entities: [expect.objectContaining({ entityId: 'weather.home' })],
    });
    expect(plan.sections[1]).toMatchObject({
      recipe: 'entityList',
      domains: expect.arrayContaining(['light']),
      wantsDetails: true,
      detailAttributes: expect.arrayContaining(['brightness', 'rgb_color']),
    });
  });

  it('maps lock status prompts to domain modules', () => {
    const plan = parseSmartCompositionPlan('show only locks with status in a modern style', hass);

    expect(plan.sections).toHaveLength(1);
    expect(plan.sections[0]).toMatchObject({
      recipe: 'domainModule',
      domains: ['lock'],
      entities: [
        expect.objectContaining({ entityId: 'lock.front_door' }),
        expect.objectContaining({ entityId: 'lock.back_door' }),
      ],
    });
  });

  it('builds weather, light grid, and fuel gauge sections from stacked prompts', () => {
    const richHass = {
      states: {
        ...hass.states,
        'light.a': { attributes: { friendly_name: 'Light A' }, state: 'on' },
        'light.b': { attributes: { friendly_name: 'Light B' }, state: 'off' },
        'light.c': { attributes: { friendly_name: 'Light C' }, state: 'on' },
        'light.d': { attributes: { friendly_name: 'Light D' }, state: 'off' },
        'light.e': { attributes: { friendly_name: 'Light E' }, state: 'on' },
        'sensor.car_fuel_level': {
          attributes: { friendly_name: 'Car Fuel Level', device_class: 'fuel', unit_of_measurement: '%' },
          state: '62',
        },
      },
    };

    const prompt =
      'Make a card with weather icon showing on top with the temp next to it in large text size and below that show 4 lights in the house and below that a gauge showing the fuel left in my car.';
    const plan = parseSmartCompositionPlan(prompt, richHass);

    expect(plan.sections).toHaveLength(3);
    expect(plan.sections[0]).toMatchObject({
      recipe: 'header',
      wantsLargeText: true,
      entities: [expect.objectContaining({ entityId: 'weather.home' })],
    });
    expect(plan.sections[1]).toMatchObject({
      recipe: 'entityGrid',
      entityLimit: 4,
    });
    expect(plan.sections[1].entities).toHaveLength(4);
    expect(plan.sections[2]).toMatchObject({
      recipe: 'singleModule',
      forcedModuleType: 'gauge',
      entities: [expect.objectContaining({ entityId: 'sensor.car_fuel_level' })],
    });
  });

  it('marks sections as horizontal when prompt asks side-by-side', () => {
    const plan = parseSmartCompositionPlan(
      'show lock controls beside media controls in one row',
      {
        states: {
          'lock.front_door': { attributes: { friendly_name: 'Front Door' }, state: 'locked' },
          'media_player.speaker': { attributes: { friendly_name: 'Speaker' }, state: 'playing' },
        },
      }
    );

    expect(plan.sections).toHaveLength(1);
    expect(plan.sections[0]).toMatchObject({
      recipe: 'controlList',
      layoutPreference: 'horizontal',
      domains: expect.arrayContaining(['lock', 'media_player']),
    });
  });

  it('builds clock, weather, and light sections for mixed dashboard prompts', () => {
    const plan = parseSmartCompositionPlan(
      'Make a clock and weather card with a list of lights below',
      hass,
      'free'
    );

    expect(plan.sections).toHaveLength(2);
    expect(plan.sections[0]).toMatchObject({
      recipe: 'moduleRow',
      moduleIntents: ['clock', 'header'],
      domains: ['weather'],
    });
    expect(plan.sections[1]).toMatchObject({
      recipe: 'entityList',
      domains: ['light'],
      entities: expect.arrayContaining([
        expect.objectContaining({ entityId: 'light.hall' }),
        expect.objectContaining({ entityId: 'light.desk' }),
      ]),
    });
  });

  it('narrows lights to the area named in the prompt using the registries', () => {
    const areaHass = {
      states: {
        'light.lamp': { attributes: { friendly_name: 'Lamp' }, state: 'on' },
        'light.ceiling': { attributes: { friendly_name: 'Ceiling' }, state: 'off' },
        'light.kitchen': { attributes: { friendly_name: 'Kitchen' }, state: 'on' },
        'light.bedroom': { attributes: { friendly_name: 'Bedroom' }, state: 'off' },
      },
      areas: {
        living_room: { area_id: 'living_room', name: 'Living Room' },
        kitchen: { area_id: 'kitchen', name: 'Kitchen' },
      },
      devices: {},
      entities: {
        'light.lamp': { entity_id: 'light.lamp', area_id: 'living_room' },
        'light.ceiling': { entity_id: 'light.ceiling', area_id: 'living_room' },
        'light.kitchen': { entity_id: 'light.kitchen', area_id: 'kitchen' },
      },
    };

    const plan = parseSmartCompositionPlan('living room light buttons', areaHass);
    expect(plan.sections).toHaveLength(1);
    expect(plan.sections[0].recipe).toBe('controlList');
    expect(plan.sections[0].entities.map(entity => entity.entityId).sort()).toEqual(['light.ceiling', 'light.lamp']);
  });

  it('maps plugs and switches to a control list of switch entities', () => {
    const plan = parseSmartCompositionPlan('kitchen plugs', {
      states: {
        'switch.kitchen_kettle': { attributes: { friendly_name: 'Kitchen Kettle', device_class: 'outlet' }, state: 'on' },
        'switch.garage_pump': { attributes: { friendly_name: 'Garage Pump' }, state: 'off' },
        'light.kitchen': { attributes: { friendly_name: 'Kitchen' }, state: 'on' },
      },
    });

    expect(plan.sections).toHaveLength(1);
    expect(plan.sections[0]).toMatchObject({ recipe: 'controlList', domains: ['switch'] });
    expect(plan.sections[0].entities[0].entityId).toBe('switch.kitchen_kettle');
  });

  it('treats temperature and humidity without weather words as sensor targets', () => {
    const plan = parseSmartCompositionPlan('temperature and humidity readings', {
      states: {
        'weather.home': { attributes: { friendly_name: 'Home Weather' }, state: 'sunny' },
        'sensor.office_temperature': {
          attributes: { friendly_name: 'Office Temperature', device_class: 'temperature' },
          state: '21',
        },
        'sensor.office_humidity': {
          attributes: { friendly_name: 'Office Humidity', device_class: 'humidity' },
          state: '40',
        },
        'sensor.power': { attributes: { friendly_name: 'Power', device_class: 'power' }, state: '120' },
      },
    });

    expect(plan.sections).toHaveLength(1);
    expect(plan.sections[0].domains).toEqual(['sensor']);
    expect(plan.sections[0].targets?.[0].deviceClasses).toEqual(expect.arrayContaining(['temperature', 'humidity']));
    expect(plan.sections[0].entities.map(entity => entity.entityId).sort()).toEqual([
      'sensor.office_humidity',
      'sensor.office_temperature',
    ]);
  });

  it('uses door contact sensors for door prompts and falls back to locks when there are none', () => {
    const withSensors = parseSmartCompositionPlan('door and window status', {
      states: {
        'binary_sensor.front_door': { attributes: { friendly_name: 'Front Door', device_class: 'door' }, state: 'off' },
        'binary_sensor.kitchen_window': { attributes: { friendly_name: 'Kitchen Window', device_class: 'window' }, state: 'on' },
        'binary_sensor.motion': { attributes: { friendly_name: 'Motion', device_class: 'motion' }, state: 'off' },
        'lock.front_door': { attributes: { friendly_name: 'Front Door Lock' }, state: 'locked' },
      },
    });
    expect(withSensors.sections[0].domains).toEqual(['binary_sensor']);
    expect(withSensors.sections[0].entities.map(entity => entity.entityId).sort()).toEqual([
      'binary_sensor.front_door',
      'binary_sensor.kitchen_window',
    ]);

    const locksOnly = parseSmartCompositionPlan('front door status', {
      states: {
        'lock.front_door': { attributes: { friendly_name: 'Front Door' }, state: 'locked' },
      },
    });
    expect(locksOnly.sections[0].entities.map(entity => entity.entityId)).toEqual(['lock.front_door']);
  });

  it('routes presence prompts to a person domain module', () => {
    const plan = parseSmartCompositionPlan('who is home', {
      states: {
        'person.wayne': { attributes: { friendly_name: 'Wayne' }, state: 'home' },
        'person.sam': { attributes: { friendly_name: 'Sam' }, state: 'not_home' },
      },
    });

    expect(plan.sections[0]).toMatchObject({ recipe: 'domainModule', domains: ['person'] });
    expect(plan.sections[0].entities).toHaveLength(2);
  });

  it('treats a plain light prompt as controls rather than a status list', () => {
    const plan = parseSmartCompositionPlan('hall and desk lights', hass);
    expect(plan.sections).toHaveLength(1);
    expect(plan.sections[0]).toMatchObject({ recipe: 'controlList', domains: ['light'] });
    expect(plan.sections[0].entities.map(entity => entity.entityId).sort()).toEqual(['light.desk', 'light.hall']);
  });

  it('feeds every matching entity to multi-entity modules like the battery monitor', () => {
    const plan = parseSmartCompositionPlan('battery monitor of phones', {
      states: {
        'sensor.phone_battery': { attributes: { friendly_name: 'Phone Battery', device_class: 'battery' }, state: '80' },
        'sensor.tablet_battery': { attributes: { friendly_name: 'Tablet Battery', device_class: 'battery' }, state: '30' },
        'sensor.temperature': { attributes: { friendly_name: 'Temperature', device_class: 'temperature' }, state: '21' },
      },
    });

    expect(plan.sections[0]).toMatchObject({ recipe: 'singleModule', forcedModuleType: 'battery_monitor' });
    expect(plan.sections[0].entities.map(entity => entity.entityId).sort()).toEqual([
      'sensor.phone_battery',
      'sensor.tablet_battery',
    ]);
  });

  it('falls back to entities named in the prompt when no domain word is present', () => {
    const plan = parseSmartCompositionPlan('kettle', {
      states: {
        'switch.kitchen_kettle': { attributes: { friendly_name: 'Kettle' }, state: 'on' },
        'light.kitchen': { attributes: { friendly_name: 'Kitchen' }, state: 'on' },
      },
    });

    expect(plan.sections).toHaveLength(1);
    expect(plan.sections[0]).toMatchObject({ recipe: 'controlList', domains: ['switch'] });
    expect(plan.sections[0].entities.map(entity => entity.entityId)).toEqual(['switch.kitchen_kettle']);

    // Generic prompts still produce no sections so the service can use its summary fallback.
    expect(parseSmartCompositionPlan('make a useful dashboard card', hass).sections).toHaveLength(0);
  });

  it('uses pro clock and weather modules when tier is pro', () => {
    const plan = parseSmartCompositionPlan(
      'Make a clock and weather card with a list of lights below',
      hass,
      'pro'
    );

    expect(plan.sections[0].moduleIntents).toEqual(['animated_clock', 'header']);
  });
});

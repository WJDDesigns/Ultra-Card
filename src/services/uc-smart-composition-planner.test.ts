// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { parseSmartCompositionPlan } from './uc-smart-composition-planner';

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
      recipe: 'gaugeModule',
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
});

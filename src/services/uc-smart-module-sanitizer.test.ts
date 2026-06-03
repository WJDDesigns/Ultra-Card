// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  buildComposedEntityModules,
  buildModulesFromCompositionPlan,
  sanitizeSmartLayout,
  sanitizeSmartModule,
  sanitizeSmartModules,
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

  it('rejects modules referencing unknown entities', () => {
    const module = sanitizeSmartModule(
      {
        type: 'light',
        presets: [{ name: 'On', action: 'turn_on', entities: ['light.missing'] }],
      },
      hass,
      freeContext,
      'test-light'
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
});

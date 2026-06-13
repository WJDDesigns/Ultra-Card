// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ucSmartCardsService } from './uc-smart-cards-service';
import type { PresetDefinition } from '../types';

type HassLike = {
  callApi: (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: Record<string, unknown>
  ) => Promise<unknown>;
  callWS?: (msg: { type: string } & Record<string, unknown>) => Promise<unknown>;
  states?: Record<string, unknown>;
};

describe('uc-smart-cards-service', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes successful smart generation payloads from HA API', async () => {
    const hass = {
      callApi: vi.fn().mockResolvedValue({
        smart_preset: {
          id: 'smart-1',
          name: 'Morning',
          description: 'Morning routine',
          category: 'layouts',
          icon: 'mdi:brain',
          author: 'Ultra Card AI',
          version: '1.0.0',
          tags: ['smart', 'ai', 'free'],
          layout: { rows: [{ id: 'r1', column_layout: '1-col', columns: [] }] },
          metadata: { created: '2026-01-01T00:00:00Z', updated: '2026-01-01T00:00:00Z' },
        },
        generation: {
          connector_used: 'ha_assist',
          tier_required: 'free',
          warnings: [],
        },
        limits: {
          free_daily_generations: 5,
          free_remaining: 4,
          pro_unlimited: true,
        },
        tier_access: {
          can_generate_free: true,
          can_generate_pro: false,
          is_pro_user: false,
          free_daily_generations: 5,
          free_remaining: 4,
        },
      }),
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'build a morning dashboard',
      tier: 'free',
    });

    expect(result.smart_preset?.id).toBe('smart-1');
    expect(result.generation?.connector_used).toBe('ha_assist');
    expect(result.limits?.free_remaining).toBe(4);
    expect(result.tier_access?.can_generate_pro).toBe(false);
  });

  it('normalizes connector status including tier access and limits', async () => {
    const hass = {
      callApi: vi.fn().mockResolvedValue({
        available: { ha_assist: true, user_provider: true, cloud_default: false },
        default_connector: 'ha_assist',
        limits: { free_daily_generations: 5, free_remaining: 0, pro_unlimited: true },
        tier_access: {
          can_generate_free: true,
          can_generate_pro: false,
          is_pro_user: false,
          free_daily_generations: 5,
          free_remaining: 0,
        },
      }),
    } as unknown as HassLike;

    const status = await ucSmartCardsService.getConnectorStatus(hass);
    expect(status.default_connector).toBe('ha_assist');
    expect(status.limits?.free_remaining).toBe(0);
    expect(status.tier_access?.can_generate_pro).toBe(false);
  });

  it('falls back to native HA Assist when Smart endpoint is missing', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: 'Modern lock overview',
      }),
      states: {
        'ai_task.claude': {},
        'lock.front_door': { attributes: { friendly_name: 'Front Door' } },
        'lock.back_door': { attributes: { friendly_name: 'Back Door' } },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'show only locks with status in a modern style',
      tier: 'free',
    });

    expect(result.smart_preset?.author).toBe('Home Assistant Assist');
    expect(result.generation?.connector_used).toBe('ha_assist');
    expect(result.smart_preset?.name).toBe('Lock Status Overview');
    expect(result.smart_preset?.layout.rows[0].columns[0].modules).toHaveLength(2);
    expect(result.smart_preset?.layout.rows[0].columns[0].modules[0]).toMatchObject({
      type: 'lock',
      entity: 'lock.front_door',
      show_state: true,
    });
    expect(hass.callWS).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'call_service',
        domain: 'ai_task',
        service: 'generate_data',
        service_data: {
          task_name: 'Ultra Card Smart preset design',
          instructions: expect.stringContaining('Required JSON shape'),
          entity_id: 'ai_task.claude',
        },
        return_response: true,
      })
    );
  });

  it('rejects unknown AI modules and falls back to UC builders', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: {
          name: 'Broken Plan',
          modules: [{ type: 'custom_blob', entity: 'light.kitchen' }],
        },
      }),
      states: {
        'ai_task.claude': {},
        'light.kitchen': { attributes: { friendly_name: 'Kitchen' }, state: 'on' },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'kitchen light buttons',
      tier: 'free',
    });

    expect(result.generation?.fallback).toBe(true);
    expect(result.smart_preset?.layout.rows[0].columns[0].modules[0]).toMatchObject({
      type: 'horizontal',
    });
  });

  it('drops AI modules with unknown entities and falls back when plan is empty', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: {
          name: 'Missing Entities',
          modules: [
            {
              type: 'light',
              presets: [{ name: 'On', action: 'turn_on', entities: ['light.missing'] }],
            },
          ],
        },
      }),
      states: {
        'ai_task.claude': {},
        'light.kitchen': { attributes: { friendly_name: 'Kitchen' }, state: 'on' },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'kitchen light buttons',
      tier: 'free',
    });

    expect(result.generation?.fallback).toBe(true);
    expect(result.smart_preset?.layout.rows[0].columns[0].modules[0]).toMatchObject({
      type: 'horizontal',
      modules: expect.arrayContaining([
        expect.objectContaining({ type: 'icon' }),
        expect.objectContaining({ type: 'light' }),
      ]),
    });
  });

  it('sanitizes layout.rows from AI and rejects unknown entities inside nested containers', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: {
          name: 'Weather Header',
          layout: {
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
                          {
                            type: 'info',
                            info_entities: [{ entity: 'weather.missing', attribute: 'temperature' }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      }),
      states: {
        'ai_task.claude': {},
        'weather.home': {
          attributes: { friendly_name: 'Home Weather', temperature: 70, temperature_unit: '°F' },
          state: 'sunny',
        },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'weather header with icon and temp',
      tier: 'free',
    });

    expect(result.generation?.fallback).toBe(false);
    const row = result.smart_preset?.layout.rows[0].columns[0].modules[0] as {
      type: string;
      modules: unknown[];
    };
    expect(row.type).toBe('horizontal');
    expect(row.modules).toHaveLength(1);
    expect(row.modules[0]).toMatchObject({ type: 'icon' });
  });

  it('downgrades pro climate requests on free tier via fallback builders', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({ data: 'Thermostat card' }),
      states: {
        'ai_task.claude': {},
        'climate.living_room': { attributes: { friendly_name: 'Living Room' }, state: 'heat' },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'show thermostat climate control',
      tier: 'free',
    });

    expect(result.generation?.fallback).toBe(true);
    expect(result.smart_preset?.layout.rows[0].columns[0].modules[0]).toMatchObject({
      type: 'info',
      info_entities: [expect.objectContaining({ entity: 'climate.living_room' })],
    });
  });

  it('uses status_summary instead of markdown for generic fallback prompts', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({ data: 'Some conversational reply.' }),
      states: {
        'ai_task.claude': {},
        'sensor.temperature': { attributes: { friendly_name: 'Temperature' }, state: '72' },
        'binary_sensor.motion': { attributes: { friendly_name: 'Motion' }, state: 'off' },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'make a useful dashboard card',
      tier: 'free',
    });

    expect(result.smart_preset?.layout.rows[0].columns[0].modules[0]).toMatchObject({
      type: 'status_summary',
    });
    expect(result.smart_preset?.layout.rows[0].columns[0].modules.some(module => module.type === 'markdown')).toBe(
      false
    );
  });

  it('uses a validated structured AI plan when available', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: {
          name: 'Kitchen Lights',
          description: 'Quick controls for the kitchen lights.',
          modules: [
            {
              type: 'light',
              presets: [
                {
                  name: 'Kitchen On',
                  action: 'turn_on',
                  icon: 'mdi:lightbulb-on',
                  entities: ['light.kitchen'],
                  use_light_color_for_icon: true,
                  use_light_color_for_button: true,
                },
                {
                  name: 'Kitchen Off',
                  action: 'turn_off',
                  icon: 'mdi:lightbulb-off',
                  entities: ['light.kitchen'],
                },
              ],
              columns: 2,
            },
          ],
        },
      }),
      states: {
        'ai_task.claude': {},
        'light.kitchen': { attributes: { friendly_name: 'Kitchen' } },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'make light buttons',
      tier: 'free',
    });

    expect(result.smart_preset?.name).toBe('Kitchen Lights');
    expect(result.generation?.fallback).toBe(false);
    expect(result.smart_preset?.layout.rows[0].columns[0].modules[0]).toMatchObject({
      type: 'light',
      presets: [
        expect.objectContaining({ action: 'turn_on', entities: ['light.kitchen'] }),
        expect.objectContaining({ action: 'turn_off', entities: ['light.kitchen'] }),
      ],
    });
  });

  it('builds light rows with icons and on/off controls when AI returns prose', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: 'A clean list of light controls.',
      }),
      states: {
        'ai_task.claude': {},
        'light.hall': { state: 'on', attributes: { friendly_name: 'Hall Light' } },
        'light.desk': { state: 'off', attributes: { friendly_name: 'Desk Lamp' } },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'Show a list of lights with buttons for on and off and a light bulb icon.',
      tier: 'free',
      constraints: { style: 'clean' },
    });

    const modules = result.smart_preset?.layout.rows[0].columns[0].modules || [];
    expect(result.smart_preset?.name).toBe('Light Controls');
    expect(modules).toHaveLength(2);
    expect(modules[0]).toMatchObject({
      type: 'horizontal',
      modules: [
        expect.objectContaining({
          type: 'icon',
          icons: [expect.objectContaining({ entity: 'light.hall', icon_active: 'mdi:lightbulb' })],
        }),
        expect.objectContaining({
          type: 'light',
          presets: [
            expect.objectContaining({ action: 'turn_on', entities: ['light.hall'] }),
            expect.objectContaining({ action: 'turn_off', entities: ['light.hall'] }),
          ],
        }),
      ],
    });
  });

  it('builds weather header above light rows when prompt asks for both', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: 'Weather with light controls.',
      }),
      states: {
        'ai_task.claude': {},
        'weather.home': {
          state: 'partlycloudy',
          attributes: { friendly_name: 'Home Weather', temperature: 72, temperature_unit: '°F' },
        },
        'light.hall': { state: 'on', attributes: { friendly_name: 'Hall Light' } },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'Weather on top with icon and temp, then list lights and status.',
      tier: 'free',
      constraints: { style: 'clean' },
    });

    const modules = result.smart_preset?.layout.rows[0].columns[0].modules || [];
    expect(result.smart_preset?.name).toBe('Weather and Light Controls');
    expect(modules[0]).toMatchObject({
      type: 'vertical',
      modules: [
        expect.objectContaining({
          type: 'horizontal',
          modules: [
            expect.objectContaining({ type: 'icon' }),
            expect.objectContaining({
              type: 'info',
              info_entities: [expect.objectContaining({ entity: 'weather.home', attribute: 'temperature' })],
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
                expect.objectContaining({ type: 'info' }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  it('builds fan toggle button and sensor grid sections for mixed prompts', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({ data: 'Fan and sensors.' }),
      states: {
        'ai_task.claude': {},
        'fan.bedroom': { attributes: { friendly_name: 'Bedroom Fan' }, state: 'off' },
        'sensor.temperature': { attributes: { friendly_name: 'Temperature' }, state: '72' },
        'sensor.humidity': { attributes: { friendly_name: 'Humidity' }, state: '45' },
        'binary_sensor.motion': { attributes: { friendly_name: 'Motion' }, state: 'off' },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'fan on button then grid of sensors',
      tier: 'free',
      constraints: { style: 'clean' },
    });

    const modules = result.smart_preset?.layout.rows[0].columns[0].modules || [];
    expect(modules[0]).toMatchObject({
      type: 'vertical',
      modules: [
        expect.objectContaining({
          type: 'horizontal',
          modules: [
            expect.objectContaining({ type: 'icon' }),
            expect.objectContaining({
              type: 'button',
              tap_action: expect.objectContaining({ action: 'toggle', entity: 'fan.bedroom' }),
            }),
          ],
        }),
        expect.objectContaining({
          type: 'grid',
          entities: expect.arrayContaining([
            expect.objectContaining({ entity: 'sensor.temperature' }),
          ]),
        }),
      ],
    });
  });

  it('builds one weather header and light brightness/color status rows for mixed detail prompts', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({ data: 'Weather with light status.' }),
      states: {
        'ai_task.claude': {},
        'weather.ecobee': {
          state: 'cloudy',
          attributes: { friendly_name: 'ecobee', temperature: 80, temperature_unit: '°F' },
        },
        'weather.pirate': {
          state: 'sunny',
          attributes: { friendly_name: 'PirateWeather', temperature: 83, temperature_unit: '°F' },
        },
        'light.h607c': {
          state: 'on',
          attributes: { friendly_name: 'H607C', brightness: 128, rgb_color: [255, 120, 40] },
        },
        'sensor.temperature': {
          state: '72',
          attributes: { friendly_name: 'Temperature Sensor' },
        },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt:
        'weather on top showing a weather icon and temp to the side and under it show a list of lights and their status of color and brightness with bulb icon and name',
      tier: 'free',
      constraints: { style: 'dense' },
    });

    const modules = result.smart_preset?.layout.rows[0].columns[0].modules || [];
    expect(modules).toHaveLength(1);
    expect(modules[0]).toMatchObject({
      type: 'vertical',
      gap: 6,
      modules: [
        expect.objectContaining({
          type: 'horizontal',
          modules: [
            expect.objectContaining({
              type: 'icon',
              icons: [expect.objectContaining({ entity: 'weather.ecobee' })],
            }),
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
                expect.objectContaining({
                  type: 'icon',
                  icons: [expect.objectContaining({ entity: 'light.h607c' })],
                }),
                expect.objectContaining({
                  type: 'info',
                  info_entities: [
                    expect.objectContaining({ attribute: 'brightness' }),
                    expect.objectContaining({ attribute: 'rgb_color' }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    expect(JSON.stringify(modules)).not.toContain('sensor.temperature');
    expect(JSON.stringify(modules)).not.toContain('weather.pirate');
  });

  it('surfaces quota and lock errors from HA API payload', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({
        status: 429,
        body: {
          error: 'Daily free Smart generations reached. Upgrade to Pro for unlimited generations.',
        },
      }),
    } as unknown as HassLike;

    await expect(
      ucSmartCardsService.generatePreset(hass, {
        prompt: 'over quota',
        tier: 'free',
      })
    ).rejects.toThrow('Daily free Smart generations reached. Upgrade to Pro for unlimited generations.');
  });

  it('returns only valid preset candidates with layout rows', () => {
    const candidates = ucSmartCardsService.getPresetCandidates({
      smart_preset: {
        id: 'a',
        name: 'Valid',
        description: 'ok',
        category: 'layouts',
        icon: 'mdi:brain',
        author: 'AI',
        version: '1',
        tags: ['smart'],
        layout: { rows: [{ id: 'r1', column_layout: '1-col', columns: [] }] },
        metadata: { created: '2026-01-01', updated: '2026-01-01' },
      } as unknown as PresetDefinition,
      presets: [
        {
          id: 'b',
          name: 'Invalid',
          description: 'bad',
          category: 'layouts',
          icon: 'mdi:brain',
          author: 'AI',
          version: '1',
          tags: ['smart'],
          layout: { rows: [] },
          metadata: { created: '2026-01-01', updated: '2026-01-01' },
        } as unknown as PresetDefinition,
      ],
    });

    expect(candidates).toHaveLength(1);
    expect(candidates[0].id).toBe('a');
  });

  it('builds clock and weather row above compact light status rows', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({ data: 'Clock weather lights card.' }),
      states: {
        'ai_task.claude': {},
        'weather.home': {
          state: 'sunny',
          attributes: { friendly_name: 'Home Weather', temperature: 72, temperature_unit: '°F' },
        },
        'weather.ecobee': {
          state: 'windy',
          attributes: { friendly_name: 'ecobee', temperature: 82, temperature_unit: '°F' },
        },
        'light.hall': { state: 'on', attributes: { friendly_name: 'Hall Light' } },
        'light.desk': { state: 'off', attributes: { friendly_name: 'Desk Lamp' } },
      },
    } as unknown as HassLike;

    const prompt = 'vertical card with horizontal clock + weather, separator, then light status rows';
    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt,
      tier: 'free',
      constraints: { style: 'clean' },
    });

    const modules = result.smart_preset?.layout.rows[0].columns[0].modules || [];
    expect(result.smart_preset?.name).toBe('Clock and Weather');
    expect(JSON.stringify(modules)).toContain('"type":"clock"');
    expect(JSON.stringify(modules)).not.toContain('weather.ecobee');
    expect(modules[0]).toMatchObject({
      type: 'vertical',
      modules: [
        expect.objectContaining({
          type: 'horizontal',
          modules: [
            expect.objectContaining({ type: 'clock' }),
            expect.objectContaining({ type: 'horizontal' }),
          ],
        }),
        expect.objectContaining({ type: 'separator', separator_style: 'line' }),
        expect.objectContaining({ type: 'vertical' }),
      ],
    });
  });

  it('builds clock and weather row above light list for the regression prompt', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({ data: 'Clock weather lights card.' }),
      states: {
        'ai_task.claude': {},
        'weather.home': {
          state: 'sunny',
          attributes: { friendly_name: 'Home Weather', temperature: 72, temperature_unit: '°F' },
        },
        'light.hall': { state: 'on', attributes: { friendly_name: 'Hall Light' } },
        'light.desk': { state: 'off', attributes: { friendly_name: 'Desk Lamp' } },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'Make a clock and weather card with a list of lights below',
      tier: 'free',
      constraints: { style: 'clean' },
    });

    const modules = result.smart_preset?.layout.rows[0].columns[0].modules || [];
    expect(result.smart_preset?.name).toBe('Clock and Weather');
    expect(modules[0]).toMatchObject({
      type: 'vertical',
      modules: [
        expect.objectContaining({
          type: 'horizontal',
          modules: [
            expect.objectContaining({ type: 'clock' }),
            expect.objectContaining({ type: 'horizontal' }),
          ],
        }),
        expect.objectContaining({ type: 'separator' }),
        expect.objectContaining({ type: 'vertical' }),
      ],
    });
  });

  it('sanitizes cloud presets through local tier validation', async () => {
    const hass = {
      callApi: vi.fn().mockResolvedValue({
        smart_preset: {
          id: 'cloud-1',
          name: 'Pro Weather',
          description: 'Cloud generated',
          category: 'layouts',
          icon: 'mdi:brain',
          author: 'Cloud',
          version: '1.0.0',
          tags: ['smart', 'pro'],
          layout: {
            rows: [
              {
                id: 'r1',
                column_layout: '1-col',
                columns: [
                  {
                    id: 'c1',
                    modules: [
                      {
                        type: 'animated_clock',
                        format: '12h',
                        show_seconds: true,
                      },
                      {
                        type: 'animated_weather',
                        weather_entity: 'weather.home',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          metadata: { created: '2026-01-01', updated: '2026-01-01' },
        },
        generation: { connector_used: 'ha_assist', tier_required: 'free' },
      }),
      states: {
        'weather.home': {
          attributes: { friendly_name: 'Home Weather', temperature: 70 },
          state: 'sunny',
        },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'clock and weather card',
      tier: 'free',
      constraints: { allow_pro_modules: false },
    });

    const modules = result.smart_preset?.layout.rows[0].columns[0].modules || [];
    expect(modules.some(module => module.type === 'animated_clock')).toBe(false);
    expect(modules.some(module => module.type === 'animated_weather')).toBe(false);
    expect(modules.some(module => module.type === 'clock' || module.type === 'weather')).toBe(true);
  });
});

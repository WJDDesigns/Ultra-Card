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

/** Connect status when a paid cloud designer is available: the only case Connect generates. */
const CLOUD_STATUS = {
  available: { ha_assist: true, user_provider: false, cloud_default: true },
  default_connector: 'auto',
  limits: { free_daily_generations: 5, free_remaining: 3 },
  tier_access: {
    can_generate_free: true,
    can_generate_pro: false,
    is_pro_user: false,
    free_daily_generations: 5,
    free_remaining: 3,
  },
};

describe('uc-smart-cards-service', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes successful smart generation payloads from HA API', async () => {
    const hass = {
      callApi: vi.fn(async (method: string) => method === 'GET' ? CLOUD_STATUS : {
        smart_preset: {
          id: 'smart-1',
          name: 'Morning',
          description: 'Morning routine',
          category: 'layout',
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

    expect(hass.callApi).toHaveBeenCalledWith('POST', expect.stringContaining('smart/generate'), expect.anything());
    expect(result.smart_preset?.id).toBe('smart-1');
    expect(result.generation?.connector_used).toBe('ha_assist');
    expect(result.limits?.free_remaining).toBe(4);
    expect(result.tier_access?.can_generate_pro).toBe(false);
  });

  it('replaces the Connect built-in Assist stub with a composed card and keeps the quota fields', async () => {
    const hass = {
      states: {
        'person.wayne': { entity_id: 'person.wayne', state: 'home', attributes: { friendly_name: 'Wayne' } },
        'person.sam': { entity_id: 'person.sam', state: 'not_home', attributes: { friendly_name: 'Sam' } },
      },
      callWS: vi.fn(),
      callApi: vi.fn(async (method: string) => method === 'GET' ? CLOUD_STATUS : {
        smart_preset: {
          id: 'smart-local-abcd1234',
          name: 'Make a card that shows who is home and',
          description:
            "Sorry, I see you're referring to the people, but I didn't understand the whole request.",
          category: 'layouts',
          icon: 'mdi:brain',
          author: 'Home Assistant Assist',
          version: '1.0.0',
          tags: ['smart', 'assist', 'free'],
          layout: {
            rows: [
              {
                id: 'r',
                column_layout: '1-col',
                columns: [
                  {
                    id: 'c',
                    modules: [
                      { id: 't', type: 'text', text: 'Make a card that shows who is home and' },
                      { id: 'm', type: 'markdown', content: 'Home Assistant Assist response' },
                    ],
                  },
                ],
              },
            ],
          },
        },
        generation: { connector_used: 'ha_assist', tier_required: 'free', warnings: [] },
        limits: { free_daily_generations: 5, free_remaining: 3 },
        tier_access: {
          can_generate_free: true,
          can_generate_pro: false,
          is_pro_user: false,
          free_daily_generations: 5,
          free_remaining: 3,
        },
      }),
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'Make a card that shows who is home and who is away',
      tier: 'free',
      connector_preference: 'ha_assist',
    });
    const preset = ucSmartCardsService.getPresetCandidates(result)[0];
    const modules = preset.layout.rows[0].columns[0].modules as unknown as Array<Record<string, unknown>>;
    const people = modules.flatMap(module =>
      module.type === 'horizontal' ? (module.modules as Array<Record<string, unknown>>) : [module]
    );

    expect(preset.name).toBe('Who Is Home');
    expect(preset.description).toBe('Shows Wayne and Sam.');
    expect(people.map(module => module.type)).toEqual(['people', 'people']);
    expect(people.map(module => module.person_entity)).toEqual(['person.wayne', 'person.sam']);
    expect(result.limits?.free_remaining).toBe(3);
    expect(result.tier_access?.free_remaining).toBe(3);
    expect(hass.callWS).not.toHaveBeenCalled();
  });

  it('runs on the user\'s own AI without touching Connect or its quota', async () => {
    const hass = {
      states: {
        'ai_task.openai': { entity_id: 'ai_task.openai', state: 'unknown', attributes: { friendly_name: 'OpenAI' } },
        'lock.front_door': { entity_id: 'lock.front_door', state: 'locked', attributes: { friendly_name: 'Front Door' } },
      },
      callApi: vi.fn(async () => CLOUD_STATUS),
      callWS: vi.fn().mockResolvedValue({
        response: { data: { modules: [{ type: 'lock', entity: 'lock.front_door' }] } },
      }),
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, { prompt: 'front door lock', tier: 'free' });

    expect(hass.callApi).not.toHaveBeenCalledWith('POST', expect.anything(), expect.anything());
    expect(result.limits).toBeUndefined();
    expect(result.tier_access).toBeUndefined();
    expect(result.smart_preset?.layout.rows[0].columns[0].modules[0]).toMatchObject({ type: 'lock', entity: 'lock.front_door' });

    const status = await ucSmartCardsService.getConnectorStatus(hass);
    expect(status.available.ha_assist).toBe(true);
    expect(status.limits).toBeUndefined();
    expect(status.tier_access).toBeUndefined();
  });

  it('uses the local composer for free when Connect has no cloud designer, ignoring its quota', async () => {
    const hass = {
      states: {
        'person.wayne': { entity_id: 'person.wayne', state: 'home', attributes: { friendly_name: 'Wayne' } },
      },
      callApi: vi.fn(async () => ({
        ...CLOUD_STATUS,
        available: { ha_assist: true, user_provider: false, cloud_default: false },
        limits: { free_daily_generations: 5, free_remaining: 0 },
      })),
      callWS: vi.fn(),
    } as unknown as HassLike;

    const status = await ucSmartCardsService.getConnectorStatus(hass);
    expect(status.available.ha_assist).toBe(false);
    expect(status.limits).toBeUndefined();

    const result = await ucSmartCardsService.generatePreset(hass, { prompt: 'who is home', tier: 'free' });
    expect(hass.callApi).not.toHaveBeenCalledWith('POST', expect.anything(), expect.anything());
    expect(result.smart_preset?.layout.rows[0].columns[0].modules[0]).toMatchObject({
      type: 'people',
      person_entity: 'person.wayne',
    });
  });

  it('lists AI providers and designs with the one the user picked', async () => {
    const hass = {
      states: {
        'conversation.home_assistant': { entity_id: 'conversation.home_assistant', state: 'unknown', attributes: { friendly_name: 'Home Assistant' } },
        'conversation.claude': { entity_id: 'conversation.claude', state: 'unknown', attributes: { friendly_name: 'Claude' } },
        'ai_task.openai': { entity_id: 'ai_task.openai', state: 'unknown', attributes: { friendly_name: 'OpenAI' } },
        'lock.front_door': { entity_id: 'lock.front_door', state: 'locked', attributes: { friendly_name: 'Front Door' } },
      },
      callWS: vi.fn().mockResolvedValue({
        response: { response: { speech: { plain: { speech: '{"modules":[{"type":"lock","entity":"lock.front_door"}]}' } } } },
      }),
    } as unknown as HassLike;

    expect(ucSmartCardsService.listAiProviders(hass)).toEqual([
      { id: 'ai_task.openai', name: 'OpenAI', kind: 'ai_task' },
      { id: 'conversation.claude', name: 'Claude', kind: 'conversation' },
    ]);
    expect(ucSmartCardsService.resolveAiProvider(hass, 'conversation.nope')?.id).toBe('ai_task.openai');

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'front door lock',
      tier: 'free',
      ai_provider: 'conversation.claude',
    });

    expect(hass.callWS).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: 'conversation',
        service: 'process',
        service_data: expect.objectContaining({ agent_id: 'conversation.claude' }),
      })
    );
    expect(result.smart_preset?.layout.rows[0].columns[0].modules[0]).toMatchObject({ type: 'lock', entity: 'lock.front_door' });
  });

  it('does not count the ai_task service alone as an AI when no AI Task entity exists', () => {
    const hass = {
      services: { ai_task: { generate_data: {} } },
      states: { 'conversation.home_assistant': { entity_id: 'conversation.home_assistant', state: 'unknown', attributes: {} } },
    } as unknown as HassLike;

    expect(ucSmartCardsService.hasAiProvider(hass)).toBe(false);
  });

  it('hydrates generated modules with their full default config so they render', async () => {
    const hass = {
      states: {
        'person.wayne': { entity_id: 'person.wayne', state: 'home', attributes: { friendly_name: 'Wayne' } },
      },
      callWS: vi.fn(),
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'who is home',
      tier: 'free',
    });
    const preset = ucSmartCardsService.getPresetCandidates(result)[0];
    const modules = preset.layout.rows[0].columns[0].modules as unknown as Array<Record<string, unknown>>;
    const people = modules[0].type === 'horizontal'
      ? (modules[0].modules as Array<Record<string, unknown>>)[0]
      : modules[0];

    expect(people.type).toBe('people');
    expect(people.person_entity).toBe('person.wayne');
    // Keys the people module reads unconditionally in renderPreview.
    expect(people.name_settings).toBeTruthy();
    expect(people.avatar_settings).toBeTruthy();
    expect(Array.isArray(people.data_items)).toBe(true);
    // Planner choices survive hydration.
    expect(people.layout_style).toBe('horizontal_compact');
  });

  it('shows the whole household when the AI picked one person for a who-is-home prompt', async () => {
    const hass = {
      states: {
        'person.wayne': { entity_id: 'person.wayne', state: 'home', attributes: { friendly_name: 'Wayne' } },
        'person.gabe': { entity_id: 'person.gabe', state: 'not_home', attributes: { friendly_name: 'Gabe' } },
        'person.sam': { entity_id: 'person.sam', state: 'home', attributes: { friendly_name: 'Sam' } },
        'weather.home': { entity_id: 'weather.home', state: 'sunny', attributes: { friendly_name: 'Home' } },
        'ai_task.openai': { entity_id: 'ai_task.openai', state: 'unknown', attributes: {} },
      },
      callWS: vi.fn().mockResolvedValue({
        response: {
          data: {
            name: 'Weather & Home',
            description: 'Current weather conditions with home occupancy status.',
            modules: [
              { type: 'animated_weather', weather_entity: 'weather.home' },
              { type: 'people', person_entity: 'person.gabe', layout_style: 'banner' },
            ],
          },
        },
      }),
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'Make a card that shows the weather and who is home',
      tier: 'pro',
      constraints: { allow_pro_modules: true },
    });
    const preset = ucSmartCardsService.getPresetCandidates(result)[0];
    const modules = preset.layout.rows[0].columns[0].modules as unknown as Array<Record<string, unknown>>;
    const peopleRow = modules.find(module => module.type === 'horizontal') as Record<string, unknown>;
    const people = peopleRow.modules as Array<Record<string, unknown>>;

    expect(preset.name).toBe('Weather & Home');
    expect(modules[0].type).toBe('animated_weather');
    expect(people.map(module => module.person_entity)).toEqual(['person.wayne', 'person.gabe', 'person.sam']);
    // Grouped rows get the panel treatment; the self-styled weather module does not.
    expect((peopleRow.design as Record<string, string>).border_radius).toBe('14px');
    expect(modules[0].design).toBeUndefined();
  });

  it('keeps a single person when the prompt names them', async () => {
    const hass = {
      states: {
        'person.wayne': { entity_id: 'person.wayne', state: 'home', attributes: { friendly_name: 'Wayne' } },
        'person.gabe': { entity_id: 'person.gabe', state: 'not_home', attributes: { friendly_name: 'Gabe' } },
        'ai_task.openai': { entity_id: 'ai_task.openai', state: 'unknown', attributes: {} },
      },
      callWS: vi.fn().mockResolvedValue({
        response: { data: { modules: [{ type: 'people', person_entity: 'person.gabe' }] } },
      }),
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'is Gabe home',
      tier: 'pro',
    });
    const preset = ucSmartCardsService.getPresetCandidates(result)[0];
    const modules = preset.layout.rows[0].columns[0].modules as unknown as Array<Record<string, unknown>>;

    expect(modules).toHaveLength(1);
    expect(modules[0].type).toBe('people');
    expect(modules[0].person_entity).toBe('person.gabe');
  });

  it('understands occupancy wording as the household', async () => {
    const hass = {
      states: {
        'person.wayne': { entity_id: 'person.wayne', state: 'home', attributes: { friendly_name: 'Wayne' } },
        'person.gabe': { entity_id: 'person.gabe', state: 'not_home', attributes: { friendly_name: 'Gabe' } },
        'weather.home': { entity_id: 'weather.home', state: 'sunny', attributes: { friendly_name: 'Home' } },
      },
      callWS: vi.fn(),
    } as unknown as HassLike;

    for (const prompt of ['weather with home occupancy', 'show the weather and whether anyone is home']) {
      const result = await ucSmartCardsService.generatePreset(hass, { prompt, tier: 'pro' });
      const preset = ucSmartCardsService.getPresetCandidates(result)[0];
      const found: string[] = [];
      const walk = (modules: Array<Record<string, unknown>>) =>
        modules.forEach(module => {
          if (module.type === 'people') found.push(String(module.person_entity));
          if (Array.isArray(module.modules)) walk(module.modules as Array<Record<string, unknown>>);
        });
      walk(preset.layout.rows[0].columns[0].modules as unknown as Array<Record<string, unknown>>);
      expect(found, prompt).toEqual(['person.wayne', 'person.gabe']);
    }
  });

  it('builds an animated weather module for pro weather prompts without recursing', async () => {
    const hass = {
      states: {
        'weather.home': {
          entity_id: 'weather.home',
          state: 'sunny',
          attributes: { friendly_name: 'Home', temperature: 24 },
        },
      },
      callWS: vi.fn(),
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'weather with forecast',
      tier: 'pro',
      constraints: { allow_pro_modules: true },
    });
    const preset = ucSmartCardsService.getPresetCandidates(result)[0];
    const modules = preset.layout.rows[0].columns[0].modules as unknown as Array<Record<string, unknown>>;

    expect(modules[0].type).toBe('animated_weather');
    expect(modules[0].weather_entity).toBe('weather.home');
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

  it('recomposes when the AI answers an entity prompt with a text module echoing the prompt', async () => {
    const prompt = 'Can you make a who is home card?';
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: {
          name: prompt,
          description: 'Not any',
          modules: [{ type: 'text', text: prompt }],
        },
      }),
      states: {
        'ai_task.claude': {},
        'person.wayne': { attributes: { friendly_name: 'Wayne' }, state: 'home' },
        'person.sam': { attributes: { friendly_name: 'Sam' }, state: 'not_home' },
        'light.kitchen': { attributes: { friendly_name: 'Kitchen' }, state: 'on' },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, { prompt, tier: 'pro' });

    const modules = result.smart_preset?.layout.rows[0].columns[0].modules || [];
    expect(modules).toHaveLength(1);
    expect(modules[0]).toMatchObject({
      type: 'horizontal',
      modules: [
        expect.objectContaining({ type: 'people', person_entity: 'person.wayne' }),
        expect.objectContaining({ type: 'people', person_entity: 'person.sam' }),
      ],
    });
    expect(result.smart_preset?.name).toBe('Who Is Home');
    expect(result.smart_preset?.description).not.toBe('Not any');
    expect(result.generation?.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining('Recomposed layout')])
    );
  });

  it('fills in the people when the AI returns an empty people module wrapped in HA response envelope', async () => {
    const prompt = 'Can you make a "who is home" card?';
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      // Real HA `call_service` + return_response shape: { context, response: { conversation_id, data } }
      callWS: vi.fn().mockResolvedValue({
        context: { id: 'ctx', parent_id: null, user_id: 'u1' },
        response: {
          conversation_id: null,
          data: {
            name: prompt,
            description: 'Not any',
            modules: [{ type: 'people' }],
          },
        },
      }),
      states: {
        'ai_task.claude': {},
        'person.wayne': { attributes: { friendly_name: 'Wayne' }, state: 'home' },
        'person.sam': { attributes: { friendly_name: 'Sam' }, state: 'not_home' },
        'light.kitchen': { attributes: { friendly_name: 'Kitchen' }, state: 'on' },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, { prompt, tier: 'pro' });

    const modules = result.smart_preset?.layout.rows[0].columns[0].modules || [];
    expect(modules).toHaveLength(1);
    expect(modules[0]).toMatchObject({
      type: 'horizontal',
      modules: [
        expect.objectContaining({ type: 'people', person_entity: 'person.wayne' }),
        expect.objectContaining({ type: 'people', person_entity: 'person.sam' }),
      ],
    });
    expect(result.smart_preset?.name).toBe('Who Is Home');
    expect(result.smart_preset?.description).not.toBe('Not any');
    expect(result.smart_preset?.description).not.toMatch(/who is home" card\?/i);
  });

  it('keeps AI text modules when the prompt asks for text', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: {
          name: 'House Notes',
          description: 'A markdown note for the household.',
          modules: [{ type: 'markdown', content: 'Remember to water the plants.' }],
        },
      }),
      states: {
        'ai_task.claude': {},
        'light.kitchen': { attributes: { friendly_name: 'Kitchen' }, state: 'on' },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'a markdown note reminding us to water the plants',
      tier: 'pro',
    });

    expect(result.smart_preset?.layout.rows[0].columns[0].modules[0]).toMatchObject({ type: 'markdown' });
    expect(result.smart_preset?.name).toBe('House Notes');
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

  it('repairs AI modules that point at unknown entities using the real ones', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: {
          name: 'Kitchen Lights',
          description: 'Buttons for the kitchen light.',
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

    expect(result.generation?.fallback).toBeFalsy();
    expect(result.smart_preset?.name).toBe('Kitchen Lights');
    const modules = result.smart_preset?.layout.rows[0].columns[0].modules || [];
    expect(JSON.stringify(modules)).toContain('light.kitchen');
    expect(JSON.stringify(modules)).not.toContain('light.missing');
  });

  it('falls back to the local composer when the AI plan has nothing the home can show', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: {
          name: 'Missing Entities',
          modules: [{ type: 'vacuum', entity: 'vacuum.missing' }],
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
      callApi: vi.fn(async (method: string) => {
        if (method === 'GET') return CLOUD_STATUS;
        throw {
          status: 429,
          body: {
            error: 'Daily free Smart generations reached. Upgrade to Pro for unlimited generations.',
          },
        };
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
        category: 'layout',
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
          category: 'layout',
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

  it('builds clock and weather row above light list without dividers for the regression prompt', async () => {
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
        expect.objectContaining({ type: 'vertical' }),
      ],
    });
    expect(JSON.stringify(modules)).not.toContain('"type":"separator"');
  });

  it('drops dividers the AI added when the prompt did not ask for them', async () => {
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS: vi.fn().mockResolvedValue({
        data: JSON.stringify({
          name: 'Lights',
          description: 'Lights',
          layout: {
            rows: [
              {
                id: 'row-1',
                column_layout: '1-col',
                columns: [
                  {
                    id: 'col-1',
                    modules: [
                      { type: 'light', entity: 'light.hall' },
                      { type: 'separator', separator_style: 'line' },
                      { type: 'light', entity: 'light.desk' },
                    ],
                  },
                ],
              },
            ],
          },
        }),
      }),
      states: {
        'ai_task.claude': {},
        'light.hall': { state: 'on', attributes: { friendly_name: 'Hall Light' } },
        'light.desk': { state: 'off', attributes: { friendly_name: 'Desk Lamp' } },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'hall light and desk lamp controls',
      tier: 'free',
    });

    const json = JSON.stringify(result.smart_preset?.layout.rows[0].columns[0].modules || []);
    expect(json).toContain('light.hall');
    expect(json).toContain('light.desk');
    expect(json).not.toContain('"type":"separator"');
  });

  it('sanitizes cloud presets through local tier validation', async () => {
    const hass = {
      callApi: vi.fn(async (method: string) => method === 'GET' ? CLOUD_STATUS : {
        smart_preset: {
          id: 'cloud-1',
          name: 'Pro Weather',
          description: 'Cloud generated',
          category: 'layout',
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

  it('sends the AI a relevance-ranked, area-tagged inventory and names the mentioned area', async () => {
    const callWS = vi.fn().mockResolvedValue({ data: 'no plan' });
    const hass = {
      callApi: vi.fn().mockRejectedValue({ status: 404 }),
      callWS,
      states: {
        'ai_task.claude': {},
        'light.lamp': { attributes: { friendly_name: 'Lamp' }, state: 'on' },
        'light.kitchen': { attributes: { friendly_name: 'Kitchen' }, state: 'on' },
        'sensor.hub_rssi': { attributes: { friendly_name: 'Hub RSSI' }, state: '-50' },
        'sensor.lounge_temp': {
          attributes: { friendly_name: 'Lounge Temp', device_class: 'temperature', unit_of_measurement: '°C' },
          state: '21',
        },
      },
      areas: {
        living_room: { area_id: 'living_room', name: 'Living Room' },
        kitchen: { area_id: 'kitchen', name: 'Kitchen' },
      },
      devices: {},
      entities: {
        'light.lamp': { entity_id: 'light.lamp', area_id: 'living_room' },
        'light.kitchen': { entity_id: 'light.kitchen', area_id: 'kitchen' },
        'sensor.lounge_temp': { entity_id: 'sensor.lounge_temp', area_id: 'living_room' },
        'sensor.hub_rssi': { entity_id: 'sensor.hub_rssi', entity_category: 'diagnostic' },
      },
    } as unknown as HassLike;

    const result = await ucSmartCardsService.generatePreset(hass, {
      prompt: 'living room lights',
      tier: 'free',
    });

    const call = callWS.mock.calls[0]?.[0] as { service_data?: { instructions?: string } };
    const instructions = call?.service_data?.instructions || '';
    expect(instructions).toContain('The request mentions the area(s): Living Room');
    expect(instructions).toContain('- light.lamp (Lamp) [area: Living Room]');
    expect(instructions).not.toContain('light.kitchen');
    expect(instructions).not.toContain('sensor.hub_rssi');
    expect(instructions).toContain('[area: Living Room, temperature, °C]');
    expect(result.smart_preset?.name).toBe('Living Room Light Control');
    expect(result.smart_preset?.layout.rows[0].columns[0].modules).toHaveLength(1);
  });
});

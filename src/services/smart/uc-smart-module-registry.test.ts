// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { CORE_MANIFESTS } from '../../modules/module-manifest-data';
import { parseSmartCompositionPlan } from '../uc-smart-composition-planner';
import { sanitizeSmartModule } from '../uc-smart-module-sanitizer';
import { SMART_LIBRARY_ONLY_TYPES, getForcedModuleTypeFromPrompt, getSmartModuleSpec } from './uc-smart-module-registry';
import { SMART_MODULE_SPEC_DEFINITIONS } from './module-specs';

const hass = {
  states: {
    'sensor.car_fuel_level': {
      attributes: { friendly_name: 'Car Fuel Level', device_class: 'fuel', unit_of_measurement: '%' },
      state: '62',
    },
    'calendar.home': { attributes: { friendly_name: 'Home Calendar' }, state: 'on' },
    'camera.front_yard': { attributes: { friendly_name: 'Front Yard' }, state: 'idle' },
    'input_text.wifi_password': { attributes: { friendly_name: 'WiFi Password' }, state: 'secret' },
  },
};

describe('uc-smart-module-registry', () => {
  it('registers every manifest module', () => {
    const registered = new Set(SMART_MODULE_SPEC_DEFINITIONS.map(spec => spec.type));
    const missing = CORE_MANIFESTS.filter(manifest => !registered.has(manifest.type)).map(manifest => manifest.type);
    expect(missing).toEqual([]);
  });

  it('marks library-only modules as non-composable', () => {
    for (const type of SMART_LIBRARY_ONLY_TYPES) {
      const spec = getSmartModuleSpec(type);
      expect(spec?.isSmartComposable).toBe(false);
    }
  });

  it('routes explicit bar prompts to bar module type', () => {
    expect(getForcedModuleTypeFromPrompt('make a bar showing fuel left in my car')).toBe('bar');
  });

  it('routes explicit calendar prompts to calendar module type', () => {
    expect(getForcedModuleTypeFromPrompt('calendar for next 5 events')).toBe('calendar');
  });

  it('routes explicit qr code prompts to qr_code module type', () => {
    expect(getForcedModuleTypeFromPrompt('qr code for my wifi')).toBe('qr_code');
  });

  it('routes explicit battery monitor prompts', () => {
    expect(getForcedModuleTypeFromPrompt('battery monitor of phones')).toBe('battery_monitor');
  });

  it('maps image + camera intent to camera when camera is explicit', () => {
    expect(getForcedModuleTypeFromPrompt('show a camera of the front yard')).toBe('camera');
  });

  it('sanitizes bar modules for fuel sensors', () => {
    const module = sanitizeSmartModule(
      { type: 'bar', entity: 'sensor.car_fuel_level', name: 'Fuel Level' },
      hass,
      { tier: 'free', prompt: 'fuel bar' },
      'bar-test'
    );
    expect(module).toMatchObject({
      type: 'bar',
      entity: 'sensor.car_fuel_level',
      percentage_min: 0,
      percentage_max: 100,
    });
  });

  it('builds bar sections from stacked fuel bar prompts', () => {
    const plan = parseSmartCompositionPlan('show a bar for fuel left in my car', hass);
    expect(plan.sections[0]).toMatchObject({
      recipe: 'singleModule',
      forcedModuleType: 'bar',
      entities: [expect.objectContaining({ entityId: 'sensor.car_fuel_level' })],
    });
  });

  it('provides sanitize handlers for composable modules', () => {
    const composable = SMART_MODULE_SPEC_DEFINITIONS.filter(spec => spec.isSmartComposable);
    const missingSanitizer = composable
      .map(spec => spec.type)
      .filter(type => {
        const registered = getSmartModuleSpec(type);
        return !registered?.sanitize;
      });

    expect(missingSanitizer).toEqual([]);
  });
});

describe('registry prompt routing matrix', () => {
  const routingCases: Array<{ prompt: string; type: string }> = [
    { prompt: 'show a bar for fuel', type: 'bar' },
    { prompt: 'calendar for next 5 events', type: 'calendar' },
    { prompt: 'qr code for my wifi', type: 'qr_code' },
    { prompt: 'battery monitor of phones', type: 'battery_monitor' },
    { prompt: 'use a gauge for tank level', type: 'gauge' },
    { prompt: 'spinbox for volume', type: 'spinbox' },
    { prompt: 'dropdown for scenes', type: 'dropdown' },
    { prompt: 'toggle my switch', type: 'toggle' },
    { prompt: 'timer for 5 minutes', type: 'timer' },
    { prompt: 'people presence card', type: 'people' },
    { prompt: 'area summary for kitchen', type: 'area_summary' },
    { prompt: 'alert center for warnings', type: 'alert_center' },
    { prompt: 'animated clock on the card', type: 'animated_clock' },
    { prompt: 'graphs for temperature history', type: 'graphs' },
    { prompt: 'energy display for solar flow', type: 'energy_display' },
    { prompt: 'solar analytics dashboard widget', type: 'solar_analytics' },
    { prompt: 'sports score for my team', type: 'sports_score' },
    { prompt: 'vacuum control panel', type: 'vacuum' },
    { prompt: 'map with device trackers', type: 'map' },
    { prompt: 'auto entity list of lights', type: 'auto_entity_list' },
    { prompt: 'dynamic list from template', type: 'dynamic-list' },
    { prompt: 'text input helper field', type: 'text_input' },
    { prompt: 'number input helper', type: 'number_input' },
    { prompt: 'boolean input toggle helper', type: 'boolean_input' },
    { prompt: 'select input helper dropdown', type: 'select_input' },
    { prompt: 'datetime input helper picker', type: 'datetime_input' },
    { prompt: 'slider input helper range', type: 'slider_input' },
    { prompt: 'button input helper press', type: 'button_input' },
    { prompt: 'counter input helper', type: 'counter_input' },
    { prompt: 'color input helper picker', type: 'color_input' },
  ];

  it.each(routingCases)('matches "$prompt" to $type', ({ prompt, type }) => {
    expect(getForcedModuleTypeFromPrompt(prompt, 'pro')).toBe(type);
  });
});

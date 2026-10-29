import { describe, expect, it } from 'vitest';
import { getUltraCardEntitySuggestions } from './uc-entity-suggestions';
import { configValidationService } from './config-validation-service';

const st = (state: string, attributes: Record<string, unknown> = {}) => ({ state, attributes });

const hass = {
  states: {
    'light.desk': st('on', {
      friendly_name: 'Desk Lights',
      brightness: 255,
      supported_color_modes: ['color_temp', 'hs'],
    }),
    'light.porch': st('off', { friendly_name: 'Porch', supported_color_modes: ['onoff'] }),
    'switch.plug': st('on', { friendly_name: 'Plug' }),
    'input_boolean.guest': st('off', { friendly_name: 'Guest mode' }),
    'fan.bedroom': st('on', { friendly_name: 'Bedroom fan', percentage: 50 }),
    'cover.garage': st('closed', { friendly_name: 'Garage', current_position: 0 }),
    'lock.front': st('locked', { friendly_name: 'Front door' }),
    'climate.hall': st('heat', { friendly_name: 'Hall', temperature: 21 }),
    'humidifier.bath': st('on', { friendly_name: 'Bath' }),
    'vacuum.robot': st('docked', { friendly_name: 'Robot' }),
    'alarm_control_panel.home': st('disarmed', { friendly_name: 'Alarm' }),
    'media_player.tv': st('playing', { friendly_name: 'TV' }),
    'camera.door': st('idle', { friendly_name: 'Door cam' }),
    'weather.home': st('sunny', { friendly_name: 'Home' }),
    'person.sam': st('home', { friendly_name: 'Sam' }),
    'calendar.family': st('off', { friendly_name: 'Family' }),
    'todo.shopping': st('3', { friendly_name: 'Shopping' }),
    'scene.movie': st('unknown', { friendly_name: 'Movie' }),
    'script.goodnight': st('off', { friendly_name: 'Goodnight' }),
    'input_number.target': st('5', { friendly_name: 'Target', min: 1, max: 10, step: 0.5 }),
    'input_select.mode': st('Away', { friendly_name: 'Mode', options: ['Home', 'Away'] }),
    'counter.cups': st('2', { friendly_name: 'Cups' }),
    'input_button.ring': st('unknown', { friendly_name: 'Ring' }),
    'sensor.battery': st('80', { friendly_name: 'Phone battery', unit_of_measurement: '%', device_class: 'battery' }),
    'sensor.power': st('1200', { friendly_name: 'Power', unit_of_measurement: 'W' }),
    'sensor.status': st('ok', { friendly_name: 'Status' }),
    'binary_sensor.door': st('off', { friendly_name: 'Door', device_class: 'door' }),
    'update.core': st('off', { friendly_name: 'Core update' }),
  },
};

const labels = (entityId: string, pro = false) =>
  getUltraCardEntitySuggestions(hass, entityId, { pro }).map(s => s.label);

describe('getUltraCardEntitySuggestions', () => {
  it('returns nothing for unknown entities or a missing hass', () => {
    expect(getUltraCardEntitySuggestions(hass, 'light.nope')).toEqual([]);
    expect(getUltraCardEntitySuggestions(undefined, 'light.desk')).toEqual([]);
    expect(getUltraCardEntitySuggestions(hass, '')).toEqual([]);
  });

  it('offers light controls, with sliders only for dimmable lights', () => {
    expect(labels('light.desk')).toEqual(['Light buttons', 'Light sliders', 'Status']);
    expect(labels('light.porch')).toEqual(['Light buttons', 'Status']);
    const sliders = getUltraCardEntitySuggestions(hass, 'light.desk')[1].config as any;
    const bars = sliders.layout.rows[0].columns[0].modules[0].bars;
    expect(bars.map((b: any) => b.type)).toEqual(['brightness', 'rgb', 'color_temp']);
  });

  it('keeps Pro modules for Pro users only', () => {
    expect(labels('climate.hall')).toEqual(['Status']);
    expect(labels('climate.hall', true)).toEqual(['Thermostat', 'Status']);
    expect(labels('vacuum.robot')).toEqual(['Status']);
    expect(labels('calendar.family')).toEqual([]);
    expect(labels('calendar.family', true)).toEqual(['Calendar']);
  });

  it('only offers a gauge and bar for percentage sensors', () => {
    expect(labels('sensor.battery')).toEqual(['Status', 'Graph', 'Gauge', 'Bar']);
    expect(labels('sensor.power')).toEqual(['Status', 'Graph']);
    expect(labels('sensor.status')).toEqual(['Status']);
  });

  it('falls back to a status row for any other domain', () => {
    expect(labels('binary_sensor.door')).toEqual(['Status']);
    expect(labels('update.core')).toEqual(['Status']);
  });

  it('uses the helper range for number sliders', () => {
    const config = getUltraCardEntitySuggestions(hass, 'input_number.target')[0].config as any;
    const bar = config.layout.rows[0].columns[0].modules[0].bars[0];
    expect([bar.min_value, bar.max_value, bar.step]).toEqual([1, 10, 0.5]);
  });

  it('gives each call fresh module ids', () => {
    const a = getUltraCardEntitySuggestions(hass, 'switch.plug')[0].config as any;
    const b = getUltraCardEntitySuggestions(hass, 'switch.plug')[0].config as any;
    expect(a.layout.rows[0].columns[0].modules[0].id).not.toEqual(b.layout.rows[0].columns[0].modules[0].id);
  });

  it('produces configs the card accepts, for every domain', async () => {
    for (const entityId of Object.keys(hass.states)) {
      for (const suggestion of getUltraCardEntitySuggestions(hass, entityId, { pro: true })) {
        expect(suggestion.config.type).toBe('custom:ultra-card');
        expect(configValidationService.validateConfigStructure(suggestion.config)).toEqual([]);
        const result = await configValidationService.validateAndCorrectConfig(
          JSON.parse(JSON.stringify(suggestion.config))
        );
        expect({ entityId, label: suggestion.label, errors: result.errors }).toEqual({
          entityId,
          label: suggestion.label,
          errors: [],
        });
        const modules = result.correctedConfig!.layout.rows[0].columns[0].modules;
        expect(modules).toHaveLength(1);
      }
    }
  }, 60000);
});

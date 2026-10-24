import { describe, it, expect } from 'vitest';
import { UcFormUtils } from './uc-form-utils';

const hass = { states: { 'binary_sensor.window': { state: 'off' } } };

describe('UcFormUtils.conditionValue', () => {
  it('offers the state picker for = and != on a known entity', () => {
    expect(
      UcFormUtils.conditionValue('value', hass, { entity: 'binary_sensor.window', operator: '=' })
        .selector
    ).toEqual({
      state: { entity_id: 'binary_sensor.window' },
    });
    expect(
      UcFormUtils.conditionValue('value', hass, { entity: 'binary_sensor.window', operator: '!=' })
        .selector.state
    ).toBeTruthy();
  });

  it('passes the attribute through for attribute conditions', () => {
    const item = UcFormUtils.conditionValue('value', hass, {
      entity: 'binary_sensor.window',
      operator: '=',
      attribute: 'device_class',
    });
    expect(item.selector).toEqual({
      state: { entity_id: 'binary_sensor.window', attribute: 'device_class' },
    });
  });

  it('keeps a text box for numeric or text operators, unknown entities and variables', () => {
    expect(
      UcFormUtils.conditionValue('value', hass, { entity: 'binary_sensor.window', operator: '>' })
        .selector
    ).toEqual({ text: {} });
    expect(
      UcFormUtils.conditionValue('value', hass, {
        entity: 'binary_sensor.window',
        operator: 'contains',
      }).selector
    ).toEqual({ text: {} });
    expect(
      UcFormUtils.conditionValue('value', hass, { entity: 'sensor.missing', operator: '=' })
        .selector
    ).toEqual({ text: {} });
    expect(
      UcFormUtils.conditionValue('value', hass, { entity: '$window', operator: '=' }).selector
    ).toEqual({ text: {} });
    expect(
      UcFormUtils.conditionValue('value', hass, { entity: '', operator: '=' }).selector
    ).toEqual({ text: {} });
    expect(
      UcFormUtils.conditionValue('value', undefined, {
        entity: 'binary_sensor.window',
        operator: '=',
      }).selector
    ).toEqual({ text: {} });
  });
});

import { describe, it, expect } from 'vitest';
import { extractEntityIdsFromTemplate } from './uc-template-entity-ids';

describe('extractEntityIdsFromTemplate', () => {
  it('returns an empty list for empty input', () => {
    expect(extractEntityIdsFromTemplate(undefined)).toEqual([]);
    expect(extractEntityIdsFromTemplate('')).toEqual([]);
  });

  it('finds quoted entity ids in the Temperature Sensors example shape', () => {
    const tpl = `{% set sensors = [
  {'entity': 'sensor.living_room_temperature', 'name': 'Living Room'},
  {'entity': 'sensor.bedroom_temperature',     'name': 'Bedroom'}
] %}
{% set temp = states(s.entity) | float(0) %}`;
    expect(extractEntityIdsFromTemplate(tpl).sort()).toEqual([
      'sensor.bedroom_temperature',
      'sensor.living_room_temperature',
    ]);
  });

  it('finds states() and state_attr() arguments', () => {
    const tpl = `{{ states('sensor.outdoor') }} {{ state_attr("sensor.outdoor", "unit_of_measurement") }}`;
    expect(extractEntityIdsFromTemplate(tpl)).toEqual(['sensor.outdoor']);
  });

  it('finds states.domain.object form', () => {
    expect(extractEntityIdsFromTemplate('{{ states.light.kitchen.state }}')).toEqual([
      'light.kitchen',
    ]);
  });

  it('does not treat mdi icons or CSS as entity ids', () => {
    const tpl = `{'icon_on': 'mdi:door-open', 'color': '#f44336'}`;
    expect(extractEntityIdsFromTemplate(tpl)).toEqual([]);
  });
});

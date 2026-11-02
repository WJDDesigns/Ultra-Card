import { describe, it, expect, beforeEach } from 'vitest';
import { logicService } from '../services/logic-service';
import {
  STATE_COLOR_KIND,
  StateColorValue,
  collectStateColorEntities,
  hasStateColors,
  isStateColor,
  resolveStateColor,
  resolveStateColorsInConfig,
  toStateColor,
} from './uc-state-color';
import { collectConfigEntityIds } from './uc-config-entity-ids';

const hassWith = (states: Record<string, { state: string; attributes?: Record<string, unknown> }>) =>
  ({
    states: Object.fromEntries(
      Object.entries(states).map(([id, s]) => [id, { entity_id: id, attributes: {}, ...s }])
    ),
  }) as any;

const lightsAndRadiator: StateColorValue = {
  kind: STATE_COLOR_KIND,
  fallback: 'grey',
  rules: [
    {
      color: 'red',
      conditions: [
        {
          id: 'a',
          type: 'entity_attribute',
          entity: 'climate.bedroom',
          attribute: 'hvac_action',
          operator: '=',
          value: 'heating',
        },
      ],
    },
    {
      color: 'yellow',
      match: 'any',
      conditions: [
        { id: 'b', type: 'entity_state', entity: 'light.salt', operator: '=', value: 'on' },
        { id: 'c', type: 'entity_state', entity: 'light.string', operator: '=', value: 'on' },
      ],
    },
  ],
};

function setHass(hass: any) {
  logicService.setHass(hass);
  return hass;
}

describe('resolveStateColor', () => {
  beforeEach(() => logicService.setHass(undefined));

  it('passes plain colours through', () => {
    expect(resolveStateColor('#fff', setHass(hassWith({})))).toBe('#fff');
    expect(resolveStateColor(undefined, null)).toBeUndefined();
  });

  it('uses the first matching rule, then the fallback', () => {
    const off = setHass(
      hassWith({
        'climate.bedroom': { state: 'heat', attributes: { hvac_action: 'idle' } },
        'light.salt': { state: 'off' },
        'light.string': { state: 'off' },
      })
    );
    expect(resolveStateColor(lightsAndRadiator, off)).toBe('grey');

    const oneLight = setHass(
      hassWith({
        'climate.bedroom': { state: 'heat', attributes: { hvac_action: 'idle' } },
        'light.salt': { state: 'off' },
        'light.string': { state: 'on' },
      })
    );
    expect(resolveStateColor(lightsAndRadiator, oneLight)).toBe('yellow');

    const heating = setHass(
      hassWith({
        'climate.bedroom': { state: 'heat', attributes: { hvac_action: 'heating' } },
        'light.salt': { state: 'on' },
        'light.string': { state: 'on' },
      })
    );
    expect(resolveStateColor(lightsAndRadiator, heating)).toBe('red');
  });

  it('needs every condition by default', () => {
    const value: StateColorValue = {
      kind: STATE_COLOR_KIND,
      fallback: 'grey',
      rules: [{ color: 'yellow', conditions: lightsAndRadiator.rules[1].conditions }],
    };
    const one = setHass(hassWith({ 'light.salt': { state: 'on' }, 'light.string': { state: 'off' } }));
    expect(resolveStateColor(value, one)).toBe('grey');
    const both = setHass(hassWith({ 'light.salt': { state: 'on' }, 'light.string': { state: 'on' } }));
    expect(resolveStateColor(value, both)).toBe('yellow');
  });

  it('does not paint half-configured or unknown-entity rules', () => {
    const value: StateColorValue = {
      kind: STATE_COLOR_KIND,
      fallback: 'grey',
      rules: [
        { color: 'blue', conditions: [] },
        { color: 'green', conditions: [{ id: 'x', type: 'entity_state', entity: '', operator: '=', value: 'on' }] },
        {
          color: 'pink',
          conditions: [{ id: 'y', type: 'entity_state', entity: 'light.missing', operator: '=', value: 'on' }],
        },
      ],
    };
    expect(resolveStateColor(value, setHass(hassWith({})))).toBe('grey');
  });
});

describe('resolveStateColorsInConfig', () => {
  it('returns the same object when there is nothing to resolve', () => {
    const mod = { id: 'm', type: 'text', color: 'red', design: { background_color: 'blue' } };
    expect(resolveStateColorsInConfig(mod, hassWith({}))).toBe(mod);
    expect(hasStateColors(mod)).toBe(false);
  });

  it('resolves nested values, leaves child modules alone and keeps identity while colours hold', () => {
    const child = { id: 'c', type: 'text', color: toStateColor('pink') };
    const mod = {
      id: 'acc',
      type: 'accordion',
      design: { background_color: lightsAndRadiator, color: 'white' },
      sections: [{ title: 'x', icon_color: lightsAndRadiator }],
      modules: [child],
    };
    const off = setHass(hassWith({ 'light.salt': { state: 'off' } }));
    const a = resolveStateColorsInConfig(mod, off);
    expect(a).not.toBe(mod);
    expect(a.design.background_color).toBe('grey');
    expect(a.design.color).toBe('white');
    expect(a.sections[0].icon_color).toBe('grey');
    expect(a.modules[0]).toBe(child);
    expect(isStateColor(mod.design.background_color)).toBe(true); // original untouched

    expect(resolveStateColorsInConfig(mod, setHass(hassWith({ 'light.salt': { state: 'off' } })))).toBe(a);

    const on = setHass(hassWith({ 'light.salt': { state: 'on' } }));
    const b = resolveStateColorsInConfig(mod, on);
    expect(b).not.toBe(a);
    expect(b.design.background_color).toBe('yellow');
  });
});

describe('entity tracking', () => {
  it('collects rule entities so the card re-renders when they change', () => {
    const seen: string[] = [];
    collectStateColorEntities({ design: { background_color: lightsAndRadiator } }, e => seen.push(e));
    expect(seen.sort()).toEqual(['climate.bedroom', 'light.salt', 'light.string']);

    const { ids } = collectConfigEntityIds({
      type: 'custom:ultra-card',
      layout: {
        rows: [
          {
            id: 'r',
            columns: [
              {
                id: 'col',
                modules: [{ id: 'm', type: 'text', design: { border_color: lightsAndRadiator } } as any],
              },
            ],
          } as any,
        ],
      },
    } as any);
    expect(ids.has('light.string')).toBe(true);
    expect(ids.has('climate.bedroom')).toBe(true);
  });
});

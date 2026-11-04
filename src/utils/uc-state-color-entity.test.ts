import { describe, it, expect, afterEach } from 'vitest';
import { logicService } from '../services/logic-service';
import {
  STATE_COLOR_KIND,
  collectStateColorEntities,
  entityOwnColor,
  legacyEntityColorToStateColor,
  resolveStateColor,
} from './uc-state-color';
import { autoMigrateCardModule, autoMigrateCardModuleTree } from './template-migration';

const hassWith = (states: Record<string, { state: string; attributes?: Record<string, unknown> }>) =>
  ({
    states: Object.fromEntries(
      Object.entries(states).map(([id, s]) => [id, { entity_id: id, attributes: {}, ...s }])
    ),
  }) as any;

const use = (hass: any) => {
  logicService.setHass(hass);
  return hass;
};

describe('entity own colour', () => {
  afterEach(() => logicService.setHass(undefined));

  it('reads rgb, hs, colour name and domain defaults', () => {
    expect(entityOwnColor({ entity_id: 'light.a', state: 'on', attributes: { rgb_color: [1, 2, 3] } })).toBe(
      'rgb(1,2,3)'
    );
    expect(entityOwnColor({ entity_id: 'light.a', state: 'on', attributes: { hs_color: [0, 100] } })).toBe(
      'rgb(255,0,0)'
    );
    expect(entityOwnColor({ entity_id: 'light.a', state: 'off', attributes: {} })).toBe('#666666');
    expect(entityOwnColor({ entity_id: 'switch.a', state: 'on', attributes: {} })).toBe('#4CAF50');
    expect(entityOwnColor(undefined)).toBeNull();
  });

  it('rules win, then the entity colour, then the fallback', () => {
    const value = {
      kind: STATE_COLOR_KIND,
      fallback: 'grey',
      entity_color: 'light.bulb',
      rules: [
        {
          color: 'blue',
          conditions: [{ id: 'c', type: 'entity_state', entity: 'light.bulb', operator: '=', value: 'off' }],
        },
      ],
    } as any;
    let hass = use(hassWith({ 'light.bulb': { state: 'on', attributes: { rgb_color: [10, 20, 30] } } }));
    expect(resolveStateColor(value, hass)).toBe('rgb(10,20,30)');
    hass = use(hassWith({ 'light.bulb': { state: 'off' } }));
    expect(resolveStateColor(value, hass)).toBe('blue');
    hass = use(hassWith({}));
    expect(resolveStateColor(value, hass)).toBe('grey');
  });

  it('reports the entity so the card re-renders when it changes', () => {
    const seen: string[] = [];
    collectStateColorEntities(
      { background_color: { kind: STATE_COLOR_KIND, entity_color: 'light.bulb', rules: [] } },
      e => seen.push(e)
    );
    expect(seen).toContain('light.bulb');
  });
});

describe('old "Use Entity Color" toggle migration', () => {
  afterEach(() => logicService.setHass(undefined));

  it('builds one rule per state colour and keeps the old colour as fallback', () => {
    const v = legacyEntityColorToStateColor('red', 'light.a', { on: 'yellow', off: '', idle: 'grey' })!;
    expect(v.fallback).toBe('red');
    expect(v.entity_color).toBe('light.a');
    expect(v.rules.map(r => [r.color, r.conditions[0].value])).toEqual([
      ['yellow', 'on'],
      ['grey', 'idle'],
    ]);
    expect(legacyEntityColorToStateColor('red', '', { on: 'x' })).toBeUndefined();
  });

  it('converts Popup trigger button and icon settings', () => {
    const out = autoMigrateCardModule({
      id: 'p1',
      type: 'popup',
      trigger_button_background_color: 'var(--primary-color)',
      trigger_button_use_entity_color: true,
      trigger_button_color_entity: 'light.a',
      trigger_button_state_colors: { on: 'green' },
      trigger_icon_color: '',
      trigger_icon_use_entity_color: true,
      trigger_icon_color_entity: 'switch.b',
    } as any) as any;
    expect(out.trigger_button_use_entity_color).toBe(false);
    expect(out.trigger_button_color_entity).toBeUndefined();
    expect(out.trigger_button_state_colors).toBeUndefined();
    expect(out.trigger_button_background_color).toMatchObject({
      kind: STATE_COLOR_KIND,
      fallback: 'var(--primary-color)',
      entity_color: 'light.a',
    });
    expect(out.trigger_icon_color).toMatchObject({ kind: STATE_COLOR_KIND, entity_color: 'switch.b', rules: [] });

    const hass = use(hassWith({ 'light.a': { state: 'on' }, 'switch.b': { state: 'off' } }));
    expect(resolveStateColor(out.trigger_button_background_color, hass)).toBe('green');
    expect(resolveStateColor(out.trigger_icon_color, hass)).toBe('#666666');
    // Running again changes nothing.
    expect(autoMigrateCardModule(out)).toEqual(out);
  });

  it('converts Button into the field it renders from, including nested buttons', () => {
    const plain = autoMigrateCardModuleTree({
      id: 'v',
      type: 'vertical',
      modules: [
        { id: 'b1', type: 'button', background_color: 'red', use_entity_color: true, background_color_entity: 'light.a' },
      ],
    } as any) as any;
    expect(plain.modules[0].background_color).toMatchObject({ fallback: 'red', entity_color: 'light.a' });

    const withDesign = autoMigrateCardModule({
      id: 'b2',
      type: 'button',
      background_color: 'red',
      design: { background_color: 'blue' },
      use_entity_color: true,
      background_color_entity: 'light.a',
    } as any) as any;
    expect(withDesign.background_color).toBe('red');
    expect(withDesign.design.background_color).toMatchObject({ fallback: 'blue', entity_color: 'light.a' });
  });

  it('leaves modules with the toggle off alone', () => {
    const m = { id: 'b3', type: 'button', background_color: 'red', use_entity_color: false } as any;
    expect(autoMigrateCardModule(m)).toBe(m);
  });
});

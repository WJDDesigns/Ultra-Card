/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { logicService } from './logic-service';
import type { HomeAssistant } from '../ha/types';

function hassWithUser(id?: string): HomeAssistant {
  return {
    user: id ? { id, name: `User ${id}` } : undefined,
    states: {},
  } as unknown as HomeAssistant;
}

describe('LogicService consumer ref-count (multi-card)', () => {
  beforeEach(() => {
    logicService.cleanup();
    expect(logicService.activeConsumerCount).toBe(0);
  });

  it('increments and decrements activeConsumerCount', () => {
    logicService.registerConsumer();
    logicService.registerConsumer();
    expect(logicService.activeConsumerCount).toBe(2);
    logicService.unregisterConsumer();
    expect(logicService.activeConsumerCount).toBe(1);
    logicService.unregisterConsumer();
    expect(logicService.activeConsumerCount).toBe(0);
  });

  it('unregisterConsumer is safe when count is already zero', () => {
    logicService.unregisterConsumer();
    logicService.unregisterConsumer();
    expect(logicService.activeConsumerCount).toBe(0);
  });

  it('cleanup resets consumer count', () => {
    logicService.registerConsumer();
    logicService.registerConsumer();
    logicService.cleanup();
    expect(logicService.activeConsumerCount).toBe(0);
  });
});

describe('LogicService evaluateUserVisibility', () => {
  beforeEach(() => {
    logicService.cleanup();
  });

  it('returns true when filter is empty or omitted', () => {
    logicService.setHass(hassWithUser('alice'));
    expect(logicService.evaluateUserVisibility(undefined)).toBe(true);
    expect(logicService.evaluateUserVisibility(null)).toBe(true);
    expect(logicService.evaluateUserVisibility({})).toBe(true);
    expect(logicService.evaluateUserVisibility({ mode: 'show', users: [] })).toBe(true);
  });

  it('show mode: only listed users see the element', () => {
    logicService.setHass(hassWithUser('alice'));
    expect(
      logicService.evaluateUserVisibility({ mode: 'show', users: ['alice', 'bob'] })
    ).toBe(true);
    expect(logicService.evaluateUserVisibility({ mode: 'show', users: ['bob'] })).toBe(false);
    // Default mode is show
    expect(logicService.evaluateUserVisibility({ users: ['alice'] })).toBe(true);
    expect(logicService.evaluateUserVisibility({ users: ['bob'] })).toBe(false);
  });

  it('hide mode: listed users are hidden', () => {
    logicService.setHass(hassWithUser('alice'));
    expect(
      logicService.evaluateUserVisibility({ mode: 'hide', users: ['alice'] })
    ).toBe(false);
    expect(logicService.evaluateUserVisibility({ mode: 'hide', users: ['bob'] })).toBe(true);
  });

  it('fail-open when hass or current user id is missing', () => {
    logicService.cleanup();
    expect(
      logicService.evaluateUserVisibility({ mode: 'show', users: ['alice'] })
    ).toBe(true);

    logicService.setHass(hassWithUser(undefined));
    expect(
      logicService.evaluateUserVisibility({ mode: 'show', users: ['alice'] })
    ).toBe(true);
  });

  it('unknown current user id is treated as not in list', () => {
    logicService.setHass(hassWithUser('charlie'));
    expect(
      logicService.evaluateUserVisibility({ mode: 'show', users: ['alice', 'bob'] })
    ).toBe(false);
    expect(
      logicService.evaluateUserVisibility({ mode: 'hide', users: ['alice', 'bob'] })
    ).toBe(true);
  });

  it('is AND-ed into evaluateModuleVisibility', () => {
    logicService.setHass(hassWithUser('alice'));
    expect(
      logicService.evaluateModuleVisibility({
        display_mode: 'always',
        user_visibility: { mode: 'show', users: ['bob'] },
      })
    ).toBe(false);
    expect(
      logicService.evaluateModuleVisibility({
        display_mode: 'always',
        user_visibility: { mode: 'show', users: ['alice'] },
      })
    ).toBe(true);
  });
});

describe('LogicService evaluateOverlayModuleVisibility', () => {
  const nav = {
    id: 'nav1',
    type: 'navigation',
    display_mode: 'always',
    user_visibility: { mode: 'hide', users: ['pi'] },
  };

  beforeEach(() => {
    logicService.setHass(hassWithUser('pi'));
  });

  it('hides a module whose own user visibility excludes the current user', () => {
    expect(logicService.evaluateOverlayModuleVisibility(nav)).toBe(false);
    logicService.setHass(hassWithUser('admin'));
    expect(logicService.evaluateOverlayModuleVisibility(nav)).toBe(true);
  });

  it('honours user visibility on the parent row and column', () => {
    const plain = { id: 'bg1', type: 'background', display_mode: 'always' };
    const config = (rowVis?: object, colVis?: object) =>
      ({
        type: 'custom:ultra-card',
        layout: {
          rows: [
            {
              id: 'r1',
              user_visibility: rowVis,
              columns: [{ id: 'c1', user_visibility: colVis, modules: [plain] }],
            },
          ],
        },
      }) as any;

    expect(logicService.evaluateOverlayModuleVisibility(plain, config())).toBe(true);
    expect(
      logicService.evaluateOverlayModuleVisibility(plain, config({ mode: 'hide', users: ['pi'] }))
    ).toBe(false);
    expect(
      logicService.evaluateOverlayModuleVisibility(
        plain,
        config(undefined, { mode: 'show', users: ['admin'] })
      )
    ).toBe(false);
  });

  it('still applies display mode', () => {
    logicService.setHass(hassWithUser('admin'));
    expect(logicService.evaluateOverlayModuleVisibility({ ...nav, display_mode: 'never' })).toBe(
      false
    );
  });
});

describe('LogicService $variable condition entities', () => {
  it('resolves a global variable used as the condition entity', async () => {
    const { ucCustomVariablesService } = await import('./uc-custom-variables-service');
    const v = ucCustomVariablesService.addVariable('window_office', 'binary_sensor.office_window');
    logicService.setHass({
      states: { 'binary_sensor.office_window': { state: 'on', attributes: {} } },
    } as unknown as HomeAssistant);
    const cond = (value: string) => ({
      id: 'c1',
      type: 'entity_state' as const,
      entity: '$window_office',
      operator: '=' as const,
      value,
    });
    expect(logicService.evaluateDisplayConditions([cond('on')], 'every')).toBe(true);
    expect(logicService.evaluateDisplayConditions([cond('off')], 'every')).toBe(false);
    if (v) ucCustomVariablesService.deleteVariable(v.id);
  });

  it('prefers the card variable over a global one with the same name', () => {
    logicService.setHass({
      states: {
        'light.card': { state: 'on', attributes: {} },
      },
    } as unknown as HomeAssistant);
    logicService.setCardConfig({
      type: 'custom:ultra-card',
      layout: { rows: [] },
      _customVariables: [
        { id: 'x', name: 'lamp', entity: 'light.card', value_type: 'state', order: 0, created: '', isGlobal: false },
      ],
    } as any);
    const cond = (value: string) => ({ id: 'c', type: 'entity_state' as const, entity: '$lamp', operator: '=' as const, value });
    expect(logicService.evaluateDisplayConditions([cond('on')], 'every')).toBe(true);
    expect(logicService.evaluateDisplayConditions([cond('off')], 'every')).toBe(false);
    logicService.setCardConfig(undefined);
  });
});

describe('LogicService evaluateCardVisibility', () => {
  const hass = (state: string, userId = 'alice'): HomeAssistant =>
    ({
      user: { id: userId, name: userId },
      states: { 'input_boolean.guest_mode': { entity_id: 'input_boolean.guest_mode', state } },
    }) as unknown as HomeAssistant;

  const guestOn = {
    id: 'c1',
    type: 'entity_state' as const,
    entity: 'input_boolean.guest_mode',
    operator: '=' as const,
    value: 'on',
  };

  beforeEach(() => {
    logicService.cleanup();
  });

  it('shows the card when there is no config or no card logic', () => {
    logicService.setHass(hass('off'));
    expect(logicService.evaluateCardVisibility(undefined)).toBe(true);
    expect(logicService.evaluateCardVisibility({ type: 'custom:ultra-card' } as any)).toBe(true);
  });

  it('applies the card display conditions', () => {
    const config = {
      type: 'custom:ultra-card',
      display_mode: 'every',
      display_conditions: [guestOn],
    } as any;
    logicService.setHass(hass('off'));
    expect(logicService.evaluateCardVisibility(config)).toBe(false);
    logicService.setHass(hass('on'));
    expect(logicService.evaluateCardVisibility(config)).toBe(true);
  });

  it('ignores conditions while display mode is always', () => {
    logicService.setHass(hass('off'));
    expect(
      logicService.evaluateCardVisibility({
        type: 'custom:ultra-card',
        display_mode: 'always',
        display_conditions: [guestOn],
      } as any)
    ).toBe(true);
  });

  it('still applies the per-user filter', () => {
    logicService.setHass(hass('on', 'bob'));
    expect(
      logicService.evaluateCardVisibility({
        type: 'custom:ultra-card',
        user_visibility: { mode: 'show', users: ['alice'] },
      } as any)
    ).toBe(false);
  });
});

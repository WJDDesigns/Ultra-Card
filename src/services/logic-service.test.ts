/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { logicService } from './logic-service';
import type { HomeAssistant } from 'custom-card-helpers';

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

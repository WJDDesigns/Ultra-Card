import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TemplateService } from './template-service';
import { ucCustomVariablesService } from './uc-custom-variables-service';
import type { HomeAssistant } from 'custom-card-helpers';

/**
 * P1: every render_template subscription is a real backend task in HA, and the
 * subscription used to be torn down and rebuilt on every state change of the
 * module's entity — even for templates that never read the entity snapshot.
 * These tests pin down when a resubscribe actually happens.
 */

let subscribeCount = 0;
let unsubscribeCount = 0;
let lastPayload: Record<string, unknown> | undefined;

function makeHass(states: Record<string, { state: string; attributes?: object }>): HomeAssistant {
  return {
    states,
    connection: {
      subscribeMessage: (_cb: unknown, payload: Record<string, unknown>) => {
        subscribeCount++;
        lastPayload = payload;
        return Promise.resolve(async () => {
          unsubscribeCount++;
        });
      },
    },
  } as unknown as HomeAssistant;
}

/** Subscriptions are serialised through a promise chain, so let it drain. */
const settle = async (): Promise<void> => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
  await new Promise(resolve => setTimeout(resolve, 0));
};

beforeEach(() => {
  subscribeCount = 0;
  unsubscribeCount = 0;
  lastPayload = undefined;
  vi.restoreAllMocks();
});

describe('TemplateService subscription churn (P1)', () => {
  it('does not resubscribe a states()-based template when the entity changes', async () => {
    const hass = makeHass({ 'sensor.x': { state: '1' } });
    const service = new TemplateService(hass);
    const template = `{{ states('sensor.x') }}`;
    const variables = { entity: 'sensor.x', state: '1', attributes: {} };

    service.subscribeToTemplate(template, 'k1', undefined, variables, undefined, 'sensor.x|1|a');
    await settle();
    expect(subscribeCount).toBe(1);

    // Same template, new state snapshot: HA already tracks sensor.x itself.
    service.subscribeToTemplate(template, 'k1', undefined, variables, undefined, 'sensor.x|2|b');
    await settle();
    expect(subscribeCount).toBe(1);
    expect(unsubscribeCount).toBe(0);
  });

  it('does resubscribe when the template reads the snapshot', async () => {
    const hass = makeHass({ 'sensor.x': { state: '1' } });
    const service = new TemplateService(hass);
    const template = `{{ state }}`;
    const variables = { entity: 'sensor.x', state: '1' };

    service.subscribeToTemplate(template, 'k2', undefined, variables, undefined, 'sensor.x|1|a');
    await settle();
    expect(subscribeCount).toBe(1);

    service.subscribeToTemplate(template, 'k2', undefined, variables, undefined, 'sensor.x|2|b');
    await settle();
    expect(subscribeCount).toBe(2);
    expect(unsubscribeCount).toBe(1);
  });

  it('treats a snapshot read through a nested path as a read', async () => {
    const hass = makeHass({ 'sensor.x': { state: '1' } });
    const service = new TemplateService(hass);
    const template = `{{ attributes.temperature }}`;
    const variables = { attributes: { temperature: 20 } };

    service.subscribeToTemplate(template, 'k3', undefined, variables, undefined, 'sig-a');
    await settle();
    service.subscribeToTemplate(template, 'k3', undefined, variables, undefined, 'sig-b');
    await settle();
    expect(subscribeCount).toBe(2);
  });

  it('still subscribes only once when no signature is supplied at all', async () => {
    const hass = makeHass({});
    const service = new TemplateService(hass);
    service.subscribeToTemplate(`{{ now() }}`, 'k4', undefined, undefined, undefined, undefined);
    await settle();
    service.subscribeToTemplate(`{{ now() }}`, 'k4', undefined, undefined, undefined, undefined);
    await settle();
    expect(subscribeCount).toBe(1);
  });

  it('sends the template and variables through to render_template', async () => {
    const hass = makeHass({ 'sensor.x': { state: '1' } });
    const service = new TemplateService(hass);
    service.subscribeToTemplate(`{{ states('sensor.x') }}`, 'k5', undefined, { a: 1 });
    await settle();
    expect(lastPayload?.type).toBe('render_template');
    expect(lastPayload?.template).toContain('sensor.x');
    expect(lastPayload?.variables).toEqual({ a: 1 });
  });

  /**
   * `$var` values are substituted into the template text before it is sent, so a
   * changed variable needs a new subscription. Making state-only churn stop must
   * not take this with it.
   */
  it('resubscribes a snapshot-free template when a $variable value changes', async () => {
    const hass = makeHass({ 'sensor.x': { state: '1' } });
    const service = new TemplateService(hass);
    const resolve = vi
      .spyOn(ucCustomVariablesService, 'resolveVariable')
      .mockReturnValue('first');

    service.subscribeToTemplate(`{{ $power }} W`, 'k7', undefined, {}, undefined, 'sig-a');
    await settle();
    expect(subscribeCount).toBe(1);

    // Unrelated state change, same variable value: nothing to do.
    service.subscribeToTemplate(`{{ $power }} W`, 'k7', undefined, {}, undefined, 'sig-b');
    await settle();
    expect(subscribeCount).toBe(1);

    resolve.mockReturnValue('second');
    service.subscribeToTemplate(`{{ $power }} W`, 'k7', undefined, {}, undefined, 'sig-b');
    await settle();
    expect(subscribeCount).toBe(2);
    expect(unsubscribeCount).toBe(1);
  });

  it('tears everything down on unsubscribeAllTemplates', async () => {
    const hass = makeHass({ 'sensor.x': { state: '1' } });
    const service = new TemplateService(hass);
    service.subscribeToTemplate(`{{ states('sensor.x') }}`, 'k6', undefined, {});
    await settle();
    await service.unsubscribeAllTemplates();
    expect(unsubscribeCount).toBe(1);

    // A key reused after teardown must subscribe again rather than assume it is live.
    service.subscribeToTemplate(`{{ states('sensor.x') }}`, 'k6', undefined, {});
    await settle();
    expect(subscribeCount).toBe(2);
  });
});

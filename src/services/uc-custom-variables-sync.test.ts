/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const fresh = async () => {
  vi.resetModules();
  return (await import('./uc-custom-variables-service')).ucCustomVariablesService;
};

const variable = (name: string, entity: string) => ({
  id: `id_${name}`,
  name,
  entity,
  value_type: 'entity_id' as const,
  order: 0,
  created: '2026-10-25T00:00:00.000Z',
  isGlobal: true,
});

const hassWith = (remote: unknown) => {
  const calls: any[] = [];
  const hass = {
    callWS: vi.fn(async (msg: any) => {
      calls.push(msg);
      if (msg.type === 'frontend/get_user_data') return { value: remote };
      return null;
    }),
  } as any;
  return { hass, calls };
};

const flush = () => new Promise(r => setTimeout(r, 0));

describe('custom variables sync with Home Assistant user data', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.useRealTimers());

  it('takes the Home Assistant copy when it is newer', async () => {
    localStorage.setItem('ultra-card-custom-variables', JSON.stringify([variable('old', 'light.a')]));
    localStorage.setItem('ultra-card-custom-variables-updated', '100');
    const svc = await fresh();
    const { hass } = hassWith({ variables: [variable('hall', 'light.hall')], updated: 200 });

    svc.syncWithHomeAssistant(hass);
    await flush();

    expect(svc.getVariables().map(v => v.name)).toEqual(['hall']);
    expect(localStorage.getItem('ultra-card-custom-variables-updated')).toBe('200');
  });

  it('uploads a local-only copy when Home Assistant has none', async () => {
    localStorage.setItem('ultra-card-custom-variables', JSON.stringify([variable('hall', 'light.hall')]));
    const svc = await fresh();
    const { hass, calls } = hassWith(null);
    vi.useFakeTimers();

    svc.syncWithHomeAssistant(hass);
    await vi.runAllTimersAsync();

    const set = calls.find(c => c.type === 'frontend/set_user_data');
    expect(set?.value.variables.map((v: any) => v.name)).toEqual(['hall']);
  });

  it('pushes local edits after the first sync', async () => {
    const svc = await fresh();
    const { hass, calls } = hassWith(null);
    vi.useFakeTimers();
    svc.syncWithHomeAssistant(hass);
    await vi.runAllTimersAsync();

    svc.addVariable('porch', 'light.porch', 'entity_id');
    await vi.runAllTimersAsync();

    const sets = calls.filter(c => c.type === 'frontend/set_user_data');
    expect(sets[sets.length - 1]?.value.variables.map((v: any) => v.name)).toEqual(['porch']);
    expect(sets[sets.length - 1]?.value.updated).toBeGreaterThan(0);
  });

  it('keeps the local copy when it is newer than Home Assistant', async () => {
    localStorage.setItem('ultra-card-custom-variables', JSON.stringify([variable('mine', 'light.m')]));
    localStorage.setItem('ultra-card-custom-variables-updated', '500');
    const svc = await fresh();
    const { hass } = hassWith({ variables: [variable('theirs', 'light.t')], updated: 100 });

    svc.syncWithHomeAssistant(hass);
    await flush();

    expect(svc.getVariables().map(v => v.name)).toEqual(['mine']);
  });
});

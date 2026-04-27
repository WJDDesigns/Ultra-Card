/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { getModuleRegistry } from './module-registry';

describe('ModuleRegistry clearModuleLoadError (M2)', () => {
  beforeEach(() => {
    const r = getModuleRegistry() as unknown as { loadErrors: Map<string, Error> };
    r.loadErrors.delete('__test_fake_type__');
  });

  it('removes sticky load error so callers can retry', () => {
    const registry = getModuleRegistry();
    const r = registry as unknown as { loadErrors: Map<string, Error> };
    r.loadErrors.set('__test_fake_type__', new Error('simulated'));
    expect(registry.getModuleLoadError('__test_fake_type__')).toBeDefined();
    registry.clearModuleLoadError('__test_fake_type__');
    expect(registry.getModuleLoadError('__test_fake_type__')).toBeUndefined();
  });
});

/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { ucCustomVariablesService } from './uc-custom-variables-service';

describe('resolveModuleVariables structural sharing', () => {
  it('returns the same object when the module has no $variables', () => {
    const module = {
      id: 'm1',
      type: 'icon',
      icons: [{ id: 'i1', entity: 'light.kitchen', name: 'Kitchen' }],
      design: { padding: '4px' },
    };
    const resolved = ucCustomVariablesService.resolveModuleVariables(module, {} as any);
    expect(resolved).toBe(module);
  });

  it('copies only the branches that contain a $variable', () => {
    const module = {
      id: 'm1',
      type: 'icon',
      icons: [{ id: 'i1', entity: '$no_such_var' }],
      design: { padding: '4px' },
    };
    const resolved = ucCustomVariablesService.resolveModuleVariables(module, {} as any);
    // Unresolvable variables keep their raw value, so nothing changes.
    expect(resolved).toBe(module);
    expect(resolved.design).toBe(module.design);
  });
});

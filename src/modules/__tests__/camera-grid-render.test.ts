/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { getModuleRegistry } from '../module-registry';
import { coreLoaders } from '../module-loaders';
import { CORE_MANIFESTS } from '../module-manifest-data';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';

describe('camera grid module', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('camera_grid');
  });

  it('is registered as a free content module', () => {
    expect(coreLoaders.camera_grid).toBeTypeOf('function');
    const meta = CORE_MANIFESTS.find(m => m.type === 'camera_grid');
    expect(meta?.title).toBe('Camera Grid');
    expect(meta?.tags).not.toContain('pro');
  });

  it('renders an empty grid without throwing', () => {
    const reg = getModuleRegistry();
    const handler = reg.getModule('camera_grid')!;
    const module = handler.createDefault('cg-empty', mockHass as any);
    const preview = handler.renderPreview(
      module as any,
      mockHass,
      { type: 'custom:ultra-card', layout: { rows: [] } },
      'live'
    );
    expect(preview).toBeTruthy();
  });

  it('accepts camera tiles and reports their entities', () => {
    const reg = getModuleRegistry();
    const handler = reg.getModule('camera_grid')!;
    const module = {
      ...handler.createDefault('cg-cams', mockHass as any),
      tiles: [
        { id: 't1', type: 'camera', entity: 'camera.outdoor', view_mode: 'inherit' },
        { id: 't2', type: 'camera', entity: 'camera.indoor', view_mode: 'inherit' },
      ],
    };
    expect(handler.validate(module as any).valid).toBe(true);
    expect(handler.getRuntimeEntityIds?.(module as any)).toEqual([
      'camera.outdoor',
      'camera.indoor',
    ]);
  });
});

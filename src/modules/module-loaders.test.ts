/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { CORE_MANIFESTS } from './module-manifest-data';
import { coreLoaders } from './module-loaders';

describe('coreLoaders', () => {
  it('has a loader for every manifest module type', () => {
    for (const { type } of CORE_MANIFESTS) {
      expect(coreLoaders[type], `missing loader for ${type}`).toBeTypeOf('function');
    }
  });

  it('does not declare orphan loaders outside the manifest', () => {
    const manifest = new Set(CORE_MANIFESTS.map(m => m.type));
    for (const key of Object.keys(coreLoaders)) {
      expect(manifest.has(key), `orphan loader: ${key}`).toBe(true);
    }
  });
});

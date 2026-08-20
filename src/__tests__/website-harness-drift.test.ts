/**
 * Drift gates for the website harness.
 *
 * A new module category or template scope without its website metadata must
 * fail CI instead of silently degrading ultracard.io.
 */
import { describe, expect, it } from 'vitest';
import {
  CORE_MANIFESTS,
  MODULE_CATEGORIES,
  isProModule,
} from '../modules/module-manifest-data';
import { TEMPLATE_SCOPES } from '../components/uc-template-cheatsheet-data';
import { PLAYGROUND_SIM, PLAYGROUND_SOURCES } from '../website-demo/template-playground-data';
import { createDemoHass } from '../website-demo/demo-hass';

describe('website harness drift gates', () => {
  it('covers every module category with a MODULE_CATEGORIES entry', () => {
    const known = new Set(MODULE_CATEGORIES.map(c => c.id));
    const used = new Set(CORE_MANIFESTS.map(m => m.category));
    for (const cat of used) {
      expect(known.has(cat), `missing MODULE_CATEGORIES entry for "${cat}"`).toBe(true);
    }
  });

  it('keeps MODULE_CATEGORIES ids unique and ordered', () => {
    const ids = MODULE_CATEGORIES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const orders = MODULE_CATEGORIES.map(c => c.order);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });

  it('derives PRO from the pro tag via isProModule', () => {
    expect(isProModule({ tags: ['pro', 'premium'] })).toBe(true);
    expect(isProModule({ tags: ['layout'] })).toBe(false);
    expect(isProModule(undefined)).toBe(false);
  });

  it('gives every TEMPLATE_SCOPES entry a demo.builderKeys list', () => {
    for (const scope of TEMPLATE_SCOPES) {
      expect(scope.demo, `scope "${scope.id}" missing demo`).toBeTruthy();
      expect(
        Array.isArray(scope.demo?.builderKeys) && scope.demo!.builderKeys.length > 0,
        `scope "${scope.id}" missing demo.builderKeys`
      ).toBe(true);
    }
  });

  it('keeps playground entities present in the demo hass', () => {
    const hass = createDemoHass();
    const ids = new Set<string>();
    for (const s of PLAYGROUND_SIM) ids.add(s.id);
    for (const s of PLAYGROUND_SOURCES) ids.add(s.id);
    for (const scope of TEMPLATE_SCOPES) {
      if (scope.demo?.entity) ids.add(scope.demo.entity);
    }
    for (const id of ids) {
      expect(hass.states[id], `demo hass is missing playground entity "${id}"`).toBeTruthy();
    }
  });

  it('keeps playground sources aligned with SIM entities when they share an id', () => {
    const simIds = new Set(PLAYGROUND_SIM.map(s => s.id));
    for (const src of PLAYGROUND_SOURCES) {
      expect(simIds.has(src.id), `source "${src.id}" has no matching SIM control`).toBe(true);
    }
  });
});

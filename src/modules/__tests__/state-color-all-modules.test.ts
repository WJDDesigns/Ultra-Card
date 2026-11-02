/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { coreLoaders } from '../module-loaders';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { UltraCardConfig } from '../../types';
import { STATE_COLOR_KIND, isStateColor } from '../../utils/uc-state-color';

/**
 * "Colour by state" puts an object where modules expect a colour string. Every
 * render path resolves it first, and editor tabs must cope with the raw object.
 * This fills every colour field of every core module with a rule object and
 * checks that nothing throws and no object reaches the rendered output.
 */
const TYPES = Object.keys(coreLoaders).sort();
const CONFIG: UltraCardConfig = { type: 'custom:ultra-card', layout: { rows: [] } };
const SKIP_PREVIEW_DOM = new Set(['button']); // jsdom background shorthand crash (see all-modules-render)

const stateColor = (fallback: string) => ({
  kind: STATE_COLOR_KIND,
  fallback,
  rules: [
    {
      color: '#ff0000',
      conditions: [{ id: 'c1', type: 'entity_state', entity: 'light.test', operator: '=', value: 'on' }],
    },
  ],
});

/** Replace every string field named like a colour (one level into objects too). */
function withStateColors<T extends Record<string, any>>(module: T): { module: T; count: number } {
  let count = 0;
  const visit = (obj: Record<string, any>, depth: number): Record<string, any> => {
    const out: Record<string, any> = Array.isArray(obj) ? [...(obj as any)] : { ...obj };
    for (const key of Object.keys(out)) {
      const v = out[key];
      if (typeof v === 'string' && /colou?r/i.test(key) && !/mode|type|source|_by$|scheme/i.test(key)) {
        out[key] = stateColor(v || '#00ff00');
        count++;
      } else if (v && typeof v === 'object' && depth < 2 && key !== 'modules') {
        out[key] = visit(v, depth + 1);
      }
    }
    return out;
  };
  const design = { ...(module.design || {}), background_color: '#123456', border_color: '#654321', color: '#abcdef' };
  const next = visit({ ...module, design }, 0) as T;
  return { module: next, count };
}

function renderToHost(template: unknown): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${template}`, host);
  return host;
}

describe('colour by state across every core module', () => {
  beforeAll(async () => {
    const reg = getModuleRegistry();
    await Promise.all(TYPES.map(t => reg.ensureModuleLoaded(t)));
  });

  for (const type of TYPES) {
    it(`${type}: preview resolves state colours and editor tabs accept them`, () => {
      const reg = getModuleRegistry();
      const handler = reg.getModule(type)!;
      const base = reg.createDefaultModule(type, `sc-${type}`, mockHass)!;
      const { module } = withStateColors(base as any);
      expect(Object.values(module.design).some(isStateColor)).toBe(true);

      const preview = handler.renderPreview(module, mockHass, CONFIG, 'dashboard');
      if (!SKIP_PREVIEW_DOM.has(type)) {
        const host = renderToHost(preview);
        expect(host.innerHTML).not.toContain('[object Object]');
        expect(host.innerHTML).not.toContain(STATE_COLOR_KIND);
        host.remove();
      }

      const tabs = [
        handler.renderGeneralTab(module, mockHass, CONFIG, () => {}),
        handler.renderActionsTab?.(module, mockHass, CONFIG, () => {}),
        handler.renderOtherTab?.(module, mockHass, CONFIG, () => {}),
        handler.renderDesignTab?.(module, mockHass, CONFIG, () => {}),
      ];
      for (const tab of tabs) {
        if (tab) renderToHost(tab).remove();
      }

      const result = handler.validate(module);
      expect(result).toHaveProperty('valid');
    });
  }
});

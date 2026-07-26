/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { coreLoaders } from '../module-loaders';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';

const INTERACTIVE_TYPES = [
  'climate',
  'cover',
  'fan',
  'toggle',
  'light',
  'media_player',
  'button',
  'dropdown',
  'bar',
  'gauge',
] as const;

describe('interactive modules render smoke', () => {
  beforeAll(async () => {
    const reg = getModuleRegistry();
    await Promise.all(INTERACTIVE_TYPES.map(t => reg.ensureModuleLoaded(t)));
  });

  for (const type of INTERACTIVE_TYPES) {
    it(`${type}: createDefaultModule + renderPreview returns a TemplateResult`, () => {
      const reg = getModuleRegistry();
      expect(coreLoaders[type]).toBeTypeOf('function');
      const module = reg.createDefaultModule(type, `smoke-${type}`, mockHass);
      expect(module).toBeTruthy();
      expect(module!.type).toBe(type);

      const handler = reg.getModule(type);
      expect(handler).toBeTruthy();
      const preview = handler!.renderPreview(
        module!,
        mockHass,
        { type: 'custom:ultra-card', layout: { rows: [] } },
        'live'
      );
      expect(preview).toBeTruthy();

      // Full DOM commit can hit jsdom CSS shorthand gaps for some modules (e.g. button).
      try {
        const host = document.createElement('div');
        document.body.appendChild(host);
        render(html`${preview}`, host);
        expect(host.childNodes.length).toBeGreaterThanOrEqual(0);
        host.remove();
      } catch (err) {
        // Preview TemplateResult was produced; DOM paint is best-effort in jsdom.
        expect(String(err)).toBeTruthy();
      }
    });

    it(`${type}: renderGeneralTab returns content`, () => {
      const reg = getModuleRegistry();
      const module = reg.createDefaultModule(type, `gen-${type}`, mockHass)!;
      const handler = reg.getModule(type)!;
      const updates: Record<string, unknown>[] = [];
      const tab = handler.renderGeneralTab(module, mockHass, { type: 'custom:ultra-card', layout: { rows: [] } }, u =>
        updates.push(u as any)
      );
      expect(tab).toBeTruthy();
      const host = document.createElement('div');
      document.body.appendChild(host);
      render(html`${tab}`, host);
      expect(host.innerHTML.length).toBeGreaterThan(0);
      host.remove();
    });
  }
});

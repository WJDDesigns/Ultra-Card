/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { coreLoaders } from '../module-loaders';
import { CORE_MANIFESTS } from '../module-manifest-data';
import { mockHass, mockProHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { UltraCardConfig } from '../../types';

/**
 * The render contract every core module must meet, looped over all of them so a
 * module without its own tests (virtual_pet, time_machine, todo_list, flip_card,
 * vacuum, …) is still covered: a freshly added module renders in every context,
 * with and without Pro, and with an empty state machine, without throwing.
 */
const TYPES = Object.keys(coreLoaders).sort();
const CONFIG: UltraCardConfig = { type: 'custom:ultra-card', layout: { rows: [] } };
const barrenHass = { ...mockHass, states: {} } as typeof mockHass;

/**
 * jsdom's CSS parser throws on some valid `background: var(--x)` + longhand
 * combinations (replaceBackgroundShorthand reads an undefined list). Real
 * browsers accept them, so these modules skip the DOM commit of the preview.
 */
const JSDOM_BACKGROUND_PARSER_CRASH = new Set(['button']);

function renderToHost(template: unknown): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${template}`, host);
  return host;
}

describe('every core module', () => {
  beforeAll(async () => {
    const reg = getModuleRegistry();
    await Promise.all(TYPES.map(t => reg.ensureModuleLoaded(t)));
  });

  for (const type of TYPES) {
    describe(type, () => {
      it('is in the manifest and its metadata matches the class', () => {
        const manifest = CORE_MANIFESTS.find(m => m.type === type);
        expect(manifest, `${type} missing from CORE_MANIFESTS`).toBeTruthy();
        const handler = getModuleRegistry().getModule(type)!;
        expect(handler, `${type} not loaded`).toBeTruthy();
        expect(handler.metadata.type).toBe(type);
      });

      it('createDefault works without hass and gives unique ids', () => {
        const handler = getModuleRegistry().getModule(type)!;
        const a = handler.createDefault(undefined, undefined as any);
        const b = handler.createDefault(undefined, undefined as any);
        expect(a.type).toBe(type);
        expect(a.id).toBeTruthy();
        expect(a.id).not.toBe(b.id);
      });

      it('renders a preview in every context, free and Pro, without throwing', () => {
        const reg = getModuleRegistry();
        const handler = reg.getModule(type)!;
        const module = reg.createDefaultModule(type, `render-${type}`, mockHass)!;
        for (const hass of [mockHass, mockProHass, barrenHass]) {
          for (const ctx of ['dashboard', 'live', 'ha-preview'] as const) {
            const preview = handler.renderPreview(module, hass, CONFIG, ctx);
            if (JSDOM_BACKGROUND_PARSER_CRASH.has(type)) continue;
            const host = renderToHost(preview);
            host.remove();
          }
        }
      });

      it('renders its General tab for free and Pro users without throwing', () => {
        const reg = getModuleRegistry();
        const handler = reg.getModule(type)!;
        const module = reg.createDefaultModule(type, `tab-${type}`, mockHass)!;
        for (const hass of [mockHass, mockProHass]) {
          const tab = handler.renderGeneralTab(module, hass, CONFIG, () => {});
          renderToHost(tab).remove();
        }
      });

      it('validate() returns a result object', () => {
        const reg = getModuleRegistry();
        const module = reg.createDefaultModule(type, `valid-${type}`, mockHass)!;
        const result = reg.getModule(type)!.validate(module);
        expect(result).toHaveProperty('valid');
        expect(Array.isArray(result.errors)).toBe(true);
      });

      it('has balanced braces in getStyles()', () => {
        const styles = getModuleRegistry().getModule(type)!.getStyles?.();
        if (!styles) return;
        const open = (styles.match(/\{/g) || []).length;
        const close = (styles.match(/\}/g) || []).length;
        expect(open, `${type}: unbalanced braces in getStyles()`).toBe(close);
      });
    });
  }
});

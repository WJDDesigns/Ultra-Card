/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { coreLoaders } from '../module-loaders';
import { CORE_MANIFESTS } from '../module-manifest-data';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { UltraCardConfig } from '../../types';

/**
 * The Pro household modules are data-heavy and do real work on first paint
 * (recorder queries, to-do reads, geometry math). This suite pins down the
 * contract that matters most for them: a freshly-added module must render a
 * sensible empty state instead of throwing, both on a dashboard and in the
 * editor, with no configuration and no Pro subscription.
 */
const PRO_HOUSEHOLD_TYPES = [
  'cleaning_zones',
  'battery_fleet',
  'plant_care',
  'laundry_tracker',
  'vehicle_maintenance',
  'vampire_power',
] as const;

const CONFIG: UltraCardConfig = { type: 'custom:ultra-card', layout: { rows: [] } };

/** hass with no entities at all — the worst case a module can be handed. */
const barrenHass = { ...mockHass, states: {} } as typeof mockHass;

function renderToHost(template: unknown): HTMLElement {
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${template}`, host);
  return host;
}

describe('Pro household modules', () => {
  beforeAll(async () => {
    const reg = getModuleRegistry();
    await Promise.all(PRO_HOUSEHOLD_TYPES.map(t => reg.ensureModuleLoaded(t)));
  });

  for (const type of PRO_HOUSEHOLD_TYPES) {
    describe(type, () => {
      it('is registered in the manifest, loaders and registry', () => {
        expect(coreLoaders[type], `${type} missing from coreLoaders`).toBeTypeOf('function');
        const manifest = CORE_MANIFESTS.find(m => m.type === type);
        expect(manifest, `${type} missing from CORE_MANIFESTS`).toBeTruthy();
        expect(getModuleRegistry().getModule(type), `${type} not loaded`).toBeTruthy();
      });

      it('is tagged as a Pro module', () => {
        const manifest = CORE_MANIFESTS.find(m => m.type === type)!;
        expect(manifest.tags).toContain('pro');
        expect(manifest.tags).toContain('premium');
        // The selector's search relies on having real keywords beyond the tier tags.
        expect(manifest.tags.length).toBeGreaterThan(2);
      });

      it('manifest metadata matches the module class metadata', () => {
        const manifest = CORE_MANIFESTS.find(m => m.type === type)!;
        const handler = getModuleRegistry().getModule(type)!;
        expect(handler.metadata.type).toBe(manifest.type);
        expect(handler.metadata.title).toBe(manifest.title);
        expect(handler.metadata.icon).toBe(manifest.icon);
        expect(handler.metadata.category).toBe(manifest.category);
      });

      it('createDefault produces a valid module without hass', () => {
        const reg = getModuleRegistry();
        const module = reg.createDefaultModule(type, `default-${type}`, undefined as any);
        expect(module, `${type}: createDefault returned nothing`).toBeTruthy();
        expect(module!.type).toBe(type);
        expect(module!.id).toBe(`default-${type}`);
        // Every module opts into the shared action + visibility contract.
        expect(module!.display_mode).toBe('always');
        expect(module!.display_conditions).toEqual([]);
        expect((module as any).tap_action).toEqual({ action: 'nothing' });
        expect((module as any).hold_action).toEqual({ action: 'nothing' });
        expect((module as any).double_tap_action).toEqual({ action: 'nothing' });
      });

      it('generates a unique id when none is supplied', () => {
        const handler = getModuleRegistry().getModule(type)!;
        const a = handler.createDefault();
        const b = handler.createDefault();
        expect(a.id).toBeTruthy();
        expect(a.id).not.toBe(b.id);
      });

      it('renders a preview from the default config without throwing', () => {
        const reg = getModuleRegistry();
        const handler = reg.getModule(type)!;
        const module = reg.createDefaultModule(type, `preview-${type}`, mockHass)!;

        for (const ctx of ['dashboard', 'live', 'ha-preview'] as const) {
          const preview = handler.renderPreview(module, mockHass, CONFIG, ctx);
          expect(preview, `${type}: no preview for context ${ctx}`).toBeTruthy();
          const host = renderToHost(preview);
          expect(host.innerHTML.length, `${type}: empty preview markup (${ctx})`).toBeGreaterThan(0);
          host.remove();
        }
      });

      it('renders a preview when hass has no entities at all', () => {
        const reg = getModuleRegistry();
        const handler = reg.getModule(type)!;
        const module = reg.createDefaultModule(type, `barren-${type}`, mockHass)!;
        const preview = handler.renderPreview(module, barrenHass, CONFIG, 'dashboard');
        const host = renderToHost(preview);
        expect(host.innerHTML.length).toBeGreaterThan(0);
        host.remove();
      });

      it('renders the Pro lock in the general tab for non-Pro users', () => {
        const reg = getModuleRegistry();
        const handler = reg.getModule(type)!;
        const module = reg.createDefaultModule(type, `tab-${type}`, mockHass)!;
        // mockHass has no Ultra Card Connect sensor, so this is the locked path.
        const tab = handler.renderGeneralTab(module, mockHass, CONFIG, () => {});
        expect(tab).toBeTruthy();
        const host = renderToHost(tab);
        expect(host.innerHTML).toContain('mdi:lock');
        host.remove();
      });

      it('validate() reports missing required configuration without throwing', () => {
        const reg = getModuleRegistry();
        const handler = reg.getModule(type)!;
        const module = reg.createDefaultModule(type, `valid-${type}`, mockHass)!;
        const result = handler.validate(module);
        expect(result).toHaveProperty('valid');
        expect(Array.isArray(result.errors)).toBe(true);
      });

      it('exposes styles that can be parsed as CSS text', () => {
        const handler = getModuleRegistry().getModule(type)!;
        const styles = handler.getStyles?.();
        if (!styles) return;
        expect(typeof styles).toBe('string');
        // Balanced braces catch the most common template-literal slip.
        const open = (styles.match(/\{/g) || []).length;
        const close = (styles.match(/\}/g) || []).length;
        expect(open, `${type}: unbalanced braces in getStyles()`).toBe(close);
      });
    });
  }
});

import { describe, it, expect, beforeAll, vi } from 'vitest';
import {
  loadAllCoreModules,
  mountTemplateInDom,
  mockHass,
  mockProHass,
  findFirstInteractableDeep,
  fireInteractFirstControl,
} from './layout-tab-harness';
import { getModuleRegistry } from '../../../modules/module-registry';
import { coreLoaders } from '../../../modules/module-loaders';
import type { UltraModule } from '../../../modules/base-module';
import { BaseUltraModule } from '../../../modules/base-module';
import type { UltraCardConfig } from '../../../types';

/**
 * Modules whose General tab cannot be exercised by the jsdom stubs. Every entry
 * says why. This was a 46-entry list; most entries only needed a Pro hass (Pro
 * editors rendered the upgrade card) or support for the shared ultra-* fields.
 */
const EMPTY_GENERAL_TAB = new Set<string>([
  // Default General tab is only HA pickers (ha-form / ha-selector / entity picker),
  // which the jsdom stubs do not expand into native controls.
  'markdown',
  'stack',
  'external_card',
  'native_card',
  'cover',
  'fan',
  'lock',
  'dynamic-list',
  'alarm_panel',
  'solar_analytics',
  // Static: nothing to configure.
  'pagebreak',
  // The first control is editor-local state (marker draft / timer test controls),
  // not a config field, so it does not call updateModule by design.
  'map',
  'timer',
]);

const CONFIG: UltraCardConfig = {
  type: 'custom:ultra-card',
  layout: { rows: [] },
};

describe('all modules: general tab invokes updateModule', () => {
  beforeAll(loadAllCoreModules);

  const types = Object.keys(coreLoaders);

  for (const type of types) {
    it(`general tab: ${type}`, async () => {
      const reg = getModuleRegistry();
      const handler = reg.getModule(type) as UltraModule | undefined;
      expect(handler, `missing module ${type}`).toBeTruthy();
      const module = reg.createDefaultModule(type, `id-${type}`, mockProHass);
      expect(module, `createDefault failed for ${type}`).toBeTruthy();
      const spy = vi.fn();
      const tr = handler!.renderGeneralTab(module!, mockProHass, CONFIG, spy);
      if (tr === null) {
        return;
      }
      if (EMPTY_GENERAL_TAB.has(type)) {
        const host = mountTemplateInDom(tr);
        await new Promise<void>(r => requestAnimationFrame(() => r()));
        host.remove();
        return;
      }
      const host = mountTemplateInDom(tr);
      await new Promise<void>(r => requestAnimationFrame(() => r()));
      await new Promise<void>(r => requestAnimationFrame(() => r()));
      const ctrl = findFirstInteractableDeep(host);
      if (!ctrl) {
        throw new Error(
          `${type}: no interactable control in renderGeneralTab — add to EMPTY_GENERAL_TAB or extend stubs`
        );
      }
      fireInteractFirstControl(ctrl);
      expect(spy).toHaveBeenCalled();
      host.remove();
    });
  }
});

describe('modules overriding optional tabs still call updateModule', () => {
  beforeAll(loadAllCoreModules);

  function hasOverride(
    handler: UltraModule,
    key: 'renderActionsTab' | 'renderOtherTab' | 'renderDesignTab' | 'renderYamlTab'
  ): boolean {
    const proto = BaseUltraModule.prototype as any;
    return typeof (handler as any)[key] === 'function' && (handler as any)[key] !== proto[key];
  }

  const types = Object.keys(coreLoaders);

  for (const type of types) {
    it(`optional tab overrides: ${type}`, async () => {
      const reg = getModuleRegistry();
      const handler = reg.getModule(type) as UltraModule;
      const module = reg.createDefaultModule(type, `tab-${type}`, mockHass)!;

      for (const method of [
        'renderActionsTab',
        'renderOtherTab',
        'renderDesignTab',
        'renderYamlTab',
      ] as const) {
        if (!hasOverride(handler, method)) continue;
        const spy = vi.fn();
        const fn = (handler as any)[method] as Function;
        const tr =
          method === 'renderYamlTab'
            ? fn.call(handler, module, mockHass, CONFIG, spy)
            : method === 'renderActionsTab'
              ? fn.call(handler, module, mockHass, CONFIG, spy, undefined)
              : fn.call(handler, module, mockHass, CONFIG, spy);
        if (tr === null || tr === undefined) continue;
        const host = mountTemplateInDom(tr);
        await new Promise<void>(r => requestAnimationFrame(() => r()));
        const ctrl = findFirstInteractableDeep(host);
        if (!ctrl) {
          host.remove();
          continue;
        }
        fireInteractFirstControl(ctrl);
        expect(spy, `${type}.${method} should invoke updateModule`).toHaveBeenCalled();
        host.remove();
      }
    });
  }
});

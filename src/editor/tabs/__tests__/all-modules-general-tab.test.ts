import { describe, it, expect, beforeAll, vi } from 'vitest';
import {
  loadAllCoreModules,
  mountTemplateInDom,
  mockHass,
  findFirstInteractableDeep,
  fireInteractFirstControl,
} from './layout-tab-harness';
import { getModuleRegistry } from '../../../modules/module-registry';
import { coreLoaders } from '../../../modules/module-loaders';
import type { UltraModule } from '../../../modules/base-module';
import { BaseUltraModule } from '../../../modules/base-module';
import type { UltraCardConfig } from '../../../types';

/** Modules whose general tab is static or uses HA form elements without native inputs in test stubs. */
const EMPTY_GENERAL_TAB = new Set([
  'pagebreak',
  'image',
  'gauge',
  // Default config renders only label/info pickers without a directly-interactable
  // primitive control after the renderUcForm/booleanField + select migrations.
  'dropdown',
  'markdown',
  'button',
  'stack',
  'popup',
  'map',
  'background',
  'badge_of_honor',
  'sports_score',
  'timer',
  'cover',
  'fan',
  'lock',
  'dynamic-list',
  'dynamic_weather',
  'qr_code',
  'energy_display',
  'living_canvas',
  'alarm_panel',
  'solar_analytics',
  'external_card',
  'native_card',
  'video_bg',
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
      const module = reg.createDefaultModule(type, `id-${type}`, mockHass);
      expect(module, `createDefault failed for ${type}`).toBeTruthy();
      const spy = vi.fn();
      const tr = handler!.renderGeneralTab(module!, mockHass, CONFIG, spy);
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

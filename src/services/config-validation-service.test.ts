import { describe, it, expect } from 'vitest';
import { configValidationService } from './config-validation-service';
import { UltraCardConfig } from '../types';

function makeConfig(): UltraCardConfig {
  return {
    type: 'custom:ultra-card',
    layout: {
      rows: [
        {
          id: 'row-1',
          columns: [
            {
              id: 'col-1',
              modules: [
                { id: 'icon-1', type: 'icon' } as any,
                {
                  id: 'layout-1',
                  type: 'horizontal',
                  modules: [{ id: 'nested-1', type: 'text' } as any],
                } as any,
                {
                  id: 'popup-1',
                  type: 'popup',
                  trigger_module_id: 'icon-1',
                } as any,
                {
                  id: 'button-1',
                  type: 'button',
                  tap_action: { action: 'open-popup', popup_id: 'popup-1' },
                } as any,
              ],
            },
          ],
        },
      ],
    },
  } as any;
}

describe('collectAllModuleIds', () => {
  it('collects module IDs including nested layout modules', () => {
    const ids = configValidationService.collectAllModuleIds(makeConfig());
    expect(ids).toEqual(new Set(['icon-1', 'layout-1', 'nested-1', 'popup-1', 'button-1']));
  });

  it('returns an empty set for configs without layout', () => {
    const ids = configValidationService.collectAllModuleIds({} as any);
    expect(ids.size).toBe(0);
  });
});

describe('regenerateModuleIds (issue #103 cross-card heal)', () => {
  it('regenerates only the requested IDs, including nested modules', () => {
    const config = makeConfig();
    const result = configValidationService.regenerateModuleIds(
      config,
      new Set(['icon-1', 'nested-1'])
    );

    const newIds = configValidationService.collectAllModuleIds(result);
    expect(newIds.has('icon-1')).toBe(false);
    expect(newIds.has('nested-1')).toBe(false);
    // Untouched modules keep their IDs
    expect(newIds.has('layout-1')).toBe(true);
    expect(newIds.has('popup-1')).toBe(true);
    expect(newIds.has('button-1')).toBe(true);
    expect(newIds.size).toBe(5);
  });

  it('rewrites trigger_module_id references to regenerated IDs', () => {
    const config = makeConfig();
    const result = configValidationService.regenerateModuleIds(config, new Set(['icon-1']));

    const modules = (result as any).layout.rows[0].columns[0].modules;
    const icon = modules[0];
    const popup = modules[2];
    expect(icon.id).not.toBe('icon-1');
    expect(popup.trigger_module_id).toBe(icon.id);
  });

  it('rewrites popup_id action references to regenerated popup IDs', () => {
    const config = makeConfig();
    const result = configValidationService.regenerateModuleIds(config, new Set(['popup-1']));

    const modules = (result as any).layout.rows[0].columns[0].modules;
    const popup = modules[2];
    const button = modules[3];
    expect(popup.id).not.toBe('popup-1');
    expect(button.tap_action.popup_id).toBe(popup.id);
  });

  it('does not mutate the original config', () => {
    const config = makeConfig();
    configValidationService.regenerateModuleIds(config, new Set(['icon-1', 'popup-1']));

    const modules = (config as any).layout.rows[0].columns[0].modules;
    expect(modules[0].id).toBe('icon-1');
    expect(modules[2].id).toBe('popup-1');
    expect(modules[3].tap_action.popup_id).toBe('popup-1');
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { releaseUnusedModuleInstances } from './uc-module-lifecycle-service';
import { ucCardInstanceRegistry } from './uc-card-instance-registry';
import { getModuleRegistry } from '../modules/module-registry';
import type { UltraCardConfig } from '../types';

/** Minimal module implementation with a spyable destroy(). */
function makeModule(type: string, withDestroy = true) {
  const destroy = vi.fn();
  const module: any = {
    metadata: { type, title: type, description: '', author: '', version: '1', icon: '', category: 'content', tags: [] },
    createDefault: () => ({ id: 'x', type }),
    renderPreview: () => null,
    renderGeneralTab: () => null,
  };
  if (withDestroy) module.destroy = destroy;
  return { module, destroy };
}

function configWithTypes(...types: string[]): UltraCardConfig {
  return {
    type: 'custom:ultra-card',
    layout: {
      rows: [
        {
          id: 'row-1',
          columns: [
            {
              id: 'col-1',
              modules: types.map((t, i) => ({ id: `mod-${i}`, type: t })),
            },
          ],
        },
      ],
    },
  } as unknown as UltraCardConfig;
}

function registerCard(element: Element, config: UltraCardConfig | undefined) {
  ucCardInstanceRegistry.register({
    element,
    getInstanceId: () => 'instance',
    getConfig: () => config,
    getRawConfigJson: () => undefined,
    isEditorPreview: () => false,
  });
}

describe('releaseUnusedModuleInstances', () => {
  const registered: string[] = [];

  function addModule(type: string, withDestroy = true) {
    const { module, destroy } = makeModule(type, withDestroy);
    getModuleRegistry().registerModule(module);
    registered.push(type);
    return destroy;
  }

  beforeEach(() => {
    for (const entry of ucCardInstanceRegistry.getAll()) {
      ucCardInstanceRegistry.unregister(entry.element);
    }
  });

  afterEach(() => {
    for (const type of registered.splice(0)) {
      getModuleRegistry().unregisterModule(type);
    }
    for (const entry of ucCardInstanceRegistry.getAll()) {
      ucCardInstanceRegistry.unregister(entry.element);
    }
  });

  it('destroys a module type that no live card uses', () => {
    const destroy = addModule('uc-test-orphan');

    releaseUnusedModuleInstances();

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('does not destroy a module type a live card still uses', () => {
    const destroy = addModule('uc-test-inuse');
    registerCard(document.createElement('div'), configWithTypes('uc-test-inuse'));

    releaseUnusedModuleInstances();

    expect(destroy).not.toHaveBeenCalled();
  });

  it('keeps a module alive while any sibling card still uses it', () => {
    // The reason teardown cannot live in a single card's disconnectedCallback:
    // module implementations are singletons shared across every card.
    const destroy = addModule('uc-test-shared');
    const cardA = document.createElement('div');
    const cardB = document.createElement('div');
    registerCard(cardA, configWithTypes('uc-test-shared'));
    registerCard(cardB, configWithTypes('uc-test-shared'));

    ucCardInstanceRegistry.unregister(cardA);
    releaseUnusedModuleInstances();
    expect(destroy).not.toHaveBeenCalled();

    ucCardInstanceRegistry.unregister(cardB);
    releaseUnusedModuleInstances();
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('finds module types nested inside layout containers', () => {
    const destroy = addModule('uc-test-nested');
    const config = {
      type: 'custom:ultra-card',
      layout: {
        rows: [
          {
            id: 'row-1',
            columns: [
              {
                id: 'col-1',
                modules: [
                  {
                    id: 'h-1',
                    type: 'horizontal',
                    modules: [{ id: 'n-1', type: 'uc-test-nested' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    } as unknown as UltraCardConfig;
    registerCard(document.createElement('div'), config);

    releaseUnusedModuleInstances();

    expect(destroy).not.toHaveBeenCalled();
  });

  it('ignores modules that do not implement destroy', () => {
    addModule('uc-test-no-destroy', false);

    expect(() => releaseUnusedModuleInstances()).not.toThrow();
  });

  it('keeps going when one module throws during destroy', () => {
    const failing = addModule('uc-test-throws');
    failing.mockImplementation(() => {
      throw new Error('boom');
    });
    const healthy = addModule('uc-test-healthy');
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => releaseUnusedModuleInstances()).not.toThrow();
    expect(healthy).toHaveBeenCalledTimes(1);
  });

  /**
   * P2: 11 of the 13 modules that own a TemplateService had no teardown hook, so
   * their render_template subscriptions — real backend tasks in HA — accumulated
   * for the lifetime of the tab.
   */
  describe('template subscription release', () => {
    function addModuleWithTemplateService(type: string, extra: Record<string, unknown> = {}) {
      const unsubscribeAllTemplates = vi.fn().mockResolvedValue(undefined);
      const { module } = makeModule(type, false);
      module._templateService = { unsubscribeAllTemplates };
      Object.assign(module, extra);
      getModuleRegistry().registerModule(module);
      registered.push(type);
      return { module, unsubscribeAllTemplates };
    }

    it('releases subscriptions for a module with no teardown hook', () => {
      const { module, unsubscribeAllTemplates } = addModuleWithTemplateService('uc-test-tpl');

      releaseUnusedModuleInstances();

      expect(unsubscribeAllTemplates).toHaveBeenCalledTimes(1);
      // Cleared so the next render rebuilds it — every module creates the service
      // lazily behind `if (!this._templateService)`.
      expect(module._templateService).toBeUndefined();
    });

    it('leaves subscriptions alone while a card still uses the module', () => {
      const { unsubscribeAllTemplates } = addModuleWithTemplateService('uc-test-tpl-inuse');
      registerCard(document.createElement('div'), configWithTypes('uc-test-tpl-inuse'));

      releaseUnusedModuleInstances();

      expect(unsubscribeAllTemplates).not.toHaveBeenCalled();
    });

    it('runs the older cleanup() hook as well as releasing subscriptions', () => {
      const cleanup = vi.fn();
      const { unsubscribeAllTemplates } = addModuleWithTemplateService('uc-test-cleanup', {
        cleanup,
      });

      releaseUnusedModuleInstances();

      expect(cleanup).toHaveBeenCalledTimes(1);
      expect(unsubscribeAllTemplates).toHaveBeenCalled();
    });

    it('prefers destroy() over cleanup() when a module has both', () => {
      const cleanup = vi.fn();
      const destroy = vi.fn();
      addModuleWithTemplateService('uc-test-both', { cleanup, destroy });

      releaseUnusedModuleInstances();

      expect(destroy).toHaveBeenCalledTimes(1);
      expect(cleanup).not.toHaveBeenCalled();
    });

    it('survives a rejected unsubscribe without an unhandled rejection', async () => {
      const unsubscribeAllTemplates = vi.fn().mockRejectedValue(new Error('ws gone'));
      const { module } = makeModule('uc-test-tpl-reject', false);
      module._templateService = { unsubscribeAllTemplates };
      getModuleRegistry().registerModule(module);
      registered.push('uc-test-tpl-reject');

      expect(() => releaseUnusedModuleInstances()).not.toThrow();
      await Promise.resolve();
      expect(unsubscribeAllTemplates).toHaveBeenCalled();
    });

    it('is safe to call twice', () => {
      const { unsubscribeAllTemplates } = addModuleWithTemplateService('uc-test-tpl-twice');

      releaseUnusedModuleInstances();
      releaseUnusedModuleInstances();

      expect(unsubscribeAllTemplates).toHaveBeenCalledTimes(1);
    });
  });

  it('treats a card with no config as using no module types', () => {
    const destroy = addModule('uc-test-noconfig');
    registerCard(document.createElement('div'), undefined);

    releaseUnusedModuleInstances();

    expect(destroy).toHaveBeenCalledTimes(1);
  });
});

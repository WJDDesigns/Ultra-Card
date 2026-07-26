/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { LayoutConfigWriter } from './layout-config-writer';
import type { UltraCardConfig } from '../../types';

function makeHost(initial: UltraCardConfig) {
  let config = initial;
  const dispatched: UltraCardConfig[] = [];
  return {
    host: {
      getConfig: () => config,
      setConfig: (c: UltraCardConfig) => {
        config = c;
      },
      dispatchConfigChanged: (c: UltraCardConfig) => {
        dispatched.push(c);
      },
      onAfterConfigUpdate: vi.fn(),
      onTemplateUpdate: vi.fn(),
    },
    getConfig: () => config,
    dispatched,
  };
}

describe('LayoutConfigWriter', () => {
  it('updateConfig merges, sets local config, and dispatches once', () => {
    const { host, getConfig, dispatched } = makeHost({
      type: 'custom:ultra-card',
      layout: { rows: [] },
    });
    const writer = new LayoutConfigWriter(host);
    writer.updateConfig({ card_background: 'red' } as any);
    expect((getConfig() as any).card_background).toBe('red');
    expect(dispatched).toHaveLength(1);
    expect(dispatched[0]).toBe(getConfig());
    expect(host.onAfterConfigUpdate).toHaveBeenCalled();
    expect(host.onTemplateUpdate).toHaveBeenCalled();
  });

  it('updateLayout pushes undo and clears redo', () => {
    const { host } = makeHost({
      type: 'custom:ultra-card',
      layout: { rows: [{ id: 'r1', columns: [] }] },
    });
    const writer = new LayoutConfigWriter(host);
    writer.updateLayout({ rows: [{ id: 'r2', columns: [] } as any] });
    expect(writer.canUndo()).toBe(true);
    expect(writer.undoStack[0].rows[0].id).toBe('r1');
    expect(writer.canRedo()).toBe(false);
  });

  it('undo and redo restore rows', () => {
    const { host, getConfig } = makeHost({
      type: 'custom:ultra-card',
      layout: { rows: [{ id: 'r1', columns: [] }] },
    });
    const writer = new LayoutConfigWriter(host);
    writer.updateLayout({ rows: [{ id: 'r2', columns: [] } as any] });
    expect(getConfig().layout!.rows[0].id).toBe('r2');
    expect(writer.undo()).toBe(true);
    expect(getConfig().layout!.rows[0].id).toBe('r1');
    expect(writer.redo()).toBe(true);
    expect(getConfig().layout!.rows[0].id).toBe('r2');
  });
});

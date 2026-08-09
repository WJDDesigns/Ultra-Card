import { describe, it, expect } from 'vitest';
import type { LayoutConfig } from '../types';
import {
  moduleRequiresBroadHassUpdates,
  layoutRequiresBroadHassUpdates,
} from './uc-broad-hass-updates';

function layoutOf(modules: unknown[]): LayoutConfig {
  return {
    rows: [{ id: 'r1', columns: [{ id: 'c1', modules: modules as never }] }],
  } as unknown as LayoutConfig;
}

describe('moduleRequiresBroadHassUpdates', () => {
  it('flags modules that always scan the whole state machine', () => {
    for (const type of ['alert_center', 'auto_entity_list', 'update_monitor', 'appliance']) {
      expect(moduleRequiresBroadHassUpdates({ id: 'm', type } as never)).toBe(true);
    }
  });

  it('flags embedded third-party cards, which decide relevance themselves', () => {
    expect(moduleRequiresBroadHassUpdates({ id: 'm', type: 'external_card' } as never)).toBe(true);
  });

  it('flags auto-filtering modules only when auto-filter is enabled', () => {
    expect(
      moduleRequiresBroadHassUpdates({ id: 'm', type: 'grid', enable_auto_filter: true } as never)
    ).toBe(true);
    expect(
      moduleRequiresBroadHassUpdates({ id: 'm', type: 'grid', enable_auto_filter: false } as never)
    ).toBe(false);
    expect(moduleRequiresBroadHassUpdates({ id: 'm', type: 'grid' } as never)).toBe(false);
  });

  it('treats discovery modules as broad unless explicitly set to manual', () => {
    expect(moduleRequiresBroadHassUpdates({ id: 'm', type: 'battery_monitor' } as never)).toBe(true);
    expect(
      moduleRequiresBroadHassUpdates({
        id: 'm',
        type: 'battery_monitor',
        discovery_mode: 'manual',
      } as never)
    ).toBe(false);
  });

  it('does not flag templated markdown, which is driven by its subscription', () => {
    expect(
      moduleRequiresBroadHassUpdates({
        id: 'm',
        type: 'markdown',
        markdown_content: '{{ states("sensor.x") }}',
      } as never)
    ).toBe(false);
    expect(
      moduleRequiresBroadHassUpdates({
        id: 'm',
        type: 'markdown',
        unified_template_mode: true,
        unified_template: '{{ 1 }}',
      } as never)
    ).toBe(false);
  });

  it('does not flag ordinary presentational modules', () => {
    for (const type of ['text', 'separator', 'image', 'icon', 'button', 'spacer']) {
      expect(moduleRequiresBroadHassUpdates({ id: 'm', type } as never)).toBe(false);
    }
  });
});

describe('layoutRequiresBroadHassUpdates', () => {
  it('returns false for a purely decorative layout', () => {
    expect(layoutRequiresBroadHassUpdates(layoutOf([{ id: 'm', type: 'text' }]))).toBe(false);
  });

  it('finds a broad module nested inside a container', () => {
    const layout = layoutOf([
      {
        id: 'h',
        type: 'horizontal',
        modules: [{ id: 'inner', type: 'alert_center' }],
      },
    ]);
    expect(layoutRequiresBroadHassUpdates(layout)).toBe(true);
  });

  it('finds a broad module nested inside tab sections', () => {
    const layout = layoutOf([
      {
        id: 't',
        type: 'tabs',
        sections: [{ modules: [{ id: 'inner', type: 'auto_entity_list' }] }],
      },
    ]);
    expect(layoutRequiresBroadHassUpdates(layout)).toBe(true);
  });

  it('flags time-based display conditions, which no entity change would catch', () => {
    const rowLevel = {
      rows: [
        {
          id: 'r1',
          display_conditions: [{ type: 'time' }],
          columns: [{ id: 'c1', modules: [{ id: 'm', type: 'text' }] }],
        },
      ],
    } as unknown as LayoutConfig;
    expect(layoutRequiresBroadHassUpdates(rowLevel)).toBe(true);

    const moduleLevel = layoutOf([
      { id: 'm', type: 'text', display_conditions: [{ type: 'time' }] },
    ]);
    expect(layoutRequiresBroadHassUpdates(moduleLevel)).toBe(true);
  });

  it('does not flag entity-based display conditions, whose entities are tracked', () => {
    const layout = layoutOf([
      { id: 'm', type: 'text', display_conditions: [{ type: 'entity_state', entity: 'light.a' }] },
    ]);
    expect(layoutRequiresBroadHassUpdates(layout)).toBe(false);
  });

  it('handles an empty or missing layout', () => {
    expect(layoutRequiresBroadHassUpdates(undefined)).toBe(false);
    expect(layoutRequiresBroadHassUpdates(null)).toBe(false);
    expect(layoutRequiresBroadHassUpdates({ rows: [] } as unknown as LayoutConfig)).toBe(false);
  });
});

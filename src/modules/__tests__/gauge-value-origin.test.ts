/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { getModuleRegistry } from '../module-registry';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';

/** Flatten lit TemplateResult strings/values into searchable text (jsdom-safe). */
function flattenTemplate(node: unknown, depth = 0): string {
  if (node === null || node === undefined || depth > 8) return '';
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(n => flattenTemplate(n, depth + 1)).join('');
  }
  if (typeof node === 'object') {
    const t = node as { strings?: TemplateStringsArray; values?: unknown[] };
    if (t.strings && t.values) {
      let out = '';
      for (let i = 0; i < t.strings.length; i++) {
        out += t.strings[i];
        if (i < t.values.length) out += flattenTemplate(t.values[i], depth + 1);
      }
      return out;
    }
  }
  return '';
}

const gaugeHass = {
  ...mockHass,
  states: {
    'sensor.temp': {
      entity_id: 'sensor.temp',
      state: '23.8',
      attributes: { unit_of_measurement: '°C' },
    },
  },
};

describe('gauge centered value origin', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('gauge');
  });

  it('keeps default centered values optically centered', () => {
    const handler = getModuleRegistry().getModule('gauge')!;
    const module = {
      ...handler.createDefault('gauge-default', gaugeHass),
      entity: 'sensor.temp',
      show_value: true,
      value_position: 'center',
    };

    const markup = flattenTemplate(
      handler.renderPreview(
        module as any,
        gaugeHass,
        { type: 'custom:ultra-card', layout: { rows: [] } },
        'live'
      )
    );

    expect(markup).toContain('uc-gauge-value-center');
    expect(markup).toMatch(/top:\s*50%/);
    expect(markup).not.toContain('top: calc(50% - 15px)');
  });

  it('preserves the 3.10 origin when a custom y offset is set', () => {
    const handler = getModuleRegistry().getModule('gauge')!;
    const module = {
      ...handler.createDefault('gauge-overlay', gaugeHass),
      entity: 'sensor.temp',
      show_value: true,
      value_position: 'center',
      value_y_offset: 25,
    };

    const markup = flattenTemplate(
      handler.renderPreview(
        module as any,
        gaugeHass,
        { type: 'custom:ultra-card', layout: { rows: [] } },
        'live'
      )
    );

    expect(markup).toContain('top: calc(50% - 15px)');
    expect(markup).toContain('translate(calc(-50% + 0px), calc(-50% + 25px))');
  });
});

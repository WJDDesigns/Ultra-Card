/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import {
  resolveHorizontalMainAxisAlignment,
  shouldClusterOverlappingHorizontalChildren,
} from '../horizontal-module';
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

describe('horizontal overlap clustering', () => {
  it('keeps space-between when gap is zero or positive', () => {
    expect(resolveHorizontalMainAxisAlignment('space-between', 0)).toBe('space-between');
    expect(resolveHorizontalMainAxisAlignment('space-between', 8)).toBe('space-between');
    expect(resolveHorizontalMainAxisAlignment('space-around', 12)).toBe('space-around');
    expect(shouldClusterOverlappingHorizontalChildren(8)).toBe(false);
  });

  it('clusters overlapping children instead of spreading them', () => {
    expect(resolveHorizontalMainAxisAlignment('space-between', -97)).toBe('center');
    expect(resolveHorizontalMainAxisAlignment('space-around', -8)).toBe('center');
    expect(resolveHorizontalMainAxisAlignment('center', -97)).toBe('center');
    expect(resolveHorizontalMainAxisAlignment('left', -97)).toBe('left');
    expect(shouldClusterOverlappingHorizontalChildren(-97)).toBe(true);
  });

  it('renders overlap class and centered justify for the HVAC overlay pattern', async () => {
    const reg = getModuleRegistry();
    await Promise.all(['horizontal', 'text'].map(t => reg.ensureModuleLoaded(t)));

    const handler = reg.getModule('horizontal')!;
    const textA = { ...reg.createDefaultModule('text', 'text-off', mockHass)!, text: 'Off' };
    const textB = { ...reg.createDefaultModule('text', 'text-chevron', mockHass)!, text: 'v' };
    const module = {
      ...handler.createDefault('hvac-overlay', mockHass),
      alignment: 'space-between' as const,
      gap: -97,
      gap_unit: 'px' as const,
      modules: [textA, textB],
    };

    const markup = flattenTemplate(
      handler.renderPreview(
        module as any,
        mockHass,
        { type: 'custom:ultra-card', layout: { rows: [] } },
        'live'
      )
    );

    expect(markup).toContain('justify-content: center');
    expect(markup).not.toMatch(/horizontal-preview-content[^>]*justify-content:\s*space-between/);
    const styles = handler.getStyles?.() ?? '';
    expect(styles).toContain('.child-module-preview.uc-overlap-child');
    expect(styles).toContain('width: max-content');
  });

  it('still spreads children when space-between has a positive gap', async () => {
    const reg = getModuleRegistry();
    await Promise.all(['horizontal', 'text'].map(t => reg.ensureModuleLoaded(t)));

    const handler = reg.getModule('horizontal')!;
    const textA = { ...reg.createDefaultModule('text', 'text-a', mockHass)!, text: 'Left' };
    const textB = { ...reg.createDefaultModule('text', 'text-b', mockHass)!, text: 'Right' };
    const module = {
      ...handler.createDefault('spread-row', mockHass),
      alignment: 'space-between' as const,
      gap: 8,
      gap_unit: 'px' as const,
      modules: [textA, textB],
    };

    const markup = flattenTemplate(
      handler.renderPreview(
        module as any,
        mockHass,
        { type: 'custom:ultra-card', layout: { rows: [] } },
        'live'
      )
    );

    expect(markup).toContain('justify-content: space-between');
  });
});

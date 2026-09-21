/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { getModuleRegistry } from '../module-registry';
import { isVisuallyBlankLabel } from '../dropdown-module';
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

describe('dropdown blank closed titles', () => {
  it('treats spaces and Braille blanks as visually empty', () => {
    expect(isVisuallyBlankLabel(undefined)).toBe(true);
    expect(isVisuallyBlankLabel('')).toBe(true);
    expect(isVisuallyBlankLabel('   ')).toBe(true);
    expect(isVisuallyBlankLabel('\u2800\u2800\u2800\u2800\u2800\u2800')).toBe(true);
    expect(isVisuallyBlankLabel('Off')).toBe(false);
    expect(isVisuallyBlankLabel('\u2800Off')).toBe(false);
  });

  it('does not render Braille spacer titles next to the chevron', async () => {
    const reg = getModuleRegistry();
    await reg.ensureModuleLoaded('dropdown');
    const handler = reg.getModule('dropdown')!;
    const module = {
      ...handler.createDefault('hvac-mode', mockHass),
      closed_title_mode: 'custom' as const,
      closed_title_custom: '\u2800\u2800\u2800\u2800\u2800\u2800',
      control_alignment: 'center' as const,
      control_icon_side: 'right' as const,
    };

    const markup = flattenTemplate(
      handler.renderPreview(
        module as any,
        mockHass,
        { type: 'custom:ultra-card', layout: { rows: [] } },
        'live'
      )
    );

    expect(markup).toContain('uc-blank-closed-title');
    expect(markup).toContain('dropdown-chevron');
    expect(markup).toContain('padding: 8px 2px');
    expect(markup).not.toContain('\u2800');
  });
});

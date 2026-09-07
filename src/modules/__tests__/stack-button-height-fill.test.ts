/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { getModuleRegistry } from '../module-registry';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';

/** Flatten lit TemplateResult strings/values into searchable text (jsdom-safe). */
function flattenTemplate(node: unknown, depth = 0): string {
  if (node == null || depth > 8) return '';
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

/**
 * Regression for #132: Button height:100% inside a fixed-height Stack Overlay
 * must preserve the percentage through the container → preview → button chain
 * instead of forcing height:auto on the outer wrapper.
 */
describe('Stack Overlay + Button height fill (#132)', () => {
  beforeAll(async () => {
    const reg = getModuleRegistry();
    await Promise.all(['button', 'stack'].map(t => reg.ensureModuleLoaded(t)));
  });

  it('stack styles force button wrappers to fill the layer', () => {
    const stack = getModuleRegistry().getModule('stack')!;
    expect(stack.getStyles).toBeTypeOf('function');
    const css = stack.getStyles!();
    expect(css).toContain('.stack-layer-child .button-module-container');
    expect(css).toContain('.stack-layer-child .button-module-preview');
    expect(css).toContain('.stack-layer-child .ultra-button');
    expect(css).toMatch(/\.button-module-container[\s\S]*height:\s*100%\s*!important/);
    expect(css).toMatch(/\.ultra-button[\s\S]*height:\s*100%\s*!important/);
  });

  it('button with design.height 100% does not force container height:auto', () => {
    const reg = getModuleRegistry();
    const handler = reg.getModule('button')!;
    const module = {
      ...reg.createDefaultModule('button', 'btn-fill', mockHass)!,
      design: {
        width: '100%',
        height: '100%',
        min_width: '100%',
        min_height: '100%',
      },
    };

    const markup = flattenTemplate(
      handler.renderPreview(
        module,
        mockHass,
        { type: 'custom:ultra-card', layout: { rows: [] } },
        'live'
      )
    );

    expect(markup).toContain('button-module-container');
    // Container must carry the explicit height, not wipe it with auto.
    expect(markup).toMatch(/button-module-container[^>]*(?<![\w-])height:\s*100%/);
    expect(markup).not.toMatch(/button-module-container[^>]*(?<![\w-])height:\s*auto/);
    // Preview must propagate height so the <button> percentage can resolve.
    expect(markup).toMatch(/button-module-preview[^>]*(?<![\w-])height:\s*100%/);
  });

  it('button without explicit height omits container height so stack CSS can fill', () => {
    const reg = getModuleRegistry();
    const handler = reg.getModule('button')!;
    const module = reg.createDefaultModule('button', 'btn-natural', mockHass)!;

    const markup = flattenTemplate(
      handler.renderPreview(
        module,
        mockHass,
        { type: 'custom:ultra-card', layout: { rows: [] } },
        'live'
      )
    );

    expect(markup).toContain('button-module-container');
    // Prefer omitting height entirely (min-height:auto is fine and expected).
    expect(markup).not.toMatch(/button-module-container[^>]*(?<![\w-])height:\s*auto/);
  });
});

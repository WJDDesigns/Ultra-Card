import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Ensures Design tab native <select> elements are migrated to UcFormUtils,
 * except allowlisted font_family (optgroup) and the disabled entity placeholder.
 */
describe('global-design-tab select migration', () => {
  const source = readFileSync(
    resolve(__dirname, 'global-design-tab.ts'),
    'utf8'
  );

  it('has no raw <select> except allowlisted cases', () => {
    const lines = source.split('\n');
    const selectLines: { line: number; text: string }[] = [];
    lines.forEach((text, i) => {
      // Match actual tags only — not JSDoc mentions of "<select>"
      if (/^\s*<select[\s>]/.test(text)) {
        selectLines.push({ line: i + 1, text: text.trim() });
      }
    });

    const unexpected = selectLines.filter(({ line }) => {
      const ctx = lines.slice(Math.max(0, line - 12), line + 25).join('\n');
      if (ctx.includes('font_family') && ctx.includes('optgroup')) return false;
      if (/<select[^>]*\bdisabled\b/.test(ctx)) return false;
      return true;
    });

    expect(
      unexpected,
      `Unexpected raw <select> at lines: ${unexpected.map(s => s.line).join(', ')}`
    ).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Regression: selecting a long custom icon id (e.g. advanced-camera-card:frigate)
 * used to expand ha-icon-picker and push the section title input out of view.
 */
describe('tabs module section row layout', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'tabs-module.ts'), 'utf8');

  function cssBlock(selector: string): string {
    const re = new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([\\s\\S]*?)\\}`);
    const match = source.match(re);
    if (!match) {
      throw new Error(`Missing CSS block for ${selector}`);
    }
    return match[1];
  }

  it('keeps the title input flexible with a usable minimum width', () => {
    const block = cssBlock('.section-title-input');
    expect(block).toContain('flex: 1 1 0%');
    expect(block).toContain('min-width: 4.5rem');
  });

  it('caps the icon picker so long icon ids cannot steal the title space', () => {
    const block = cssBlock('.section-icon-picker');
    expect(block).toContain('flex: 0 0 48px');
    expect(block).toContain('max-width: 48px');
    expect(block).toContain('overflow: hidden');
  });
});

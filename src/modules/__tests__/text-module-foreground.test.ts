/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { TextModule } from '../../types';

const hass: any = {
  ...mockHass,
  localize: (key: string) => key,
};

const CARD = { type: 'custom:ultra-card', layout: { rows: [] } } as any;
const GRADIENT = 'linear-gradient(90deg, #ff0000 0%, #ffff00 100%)';

function renderText(overrides: Partial<TextModule>): HTMLElement {
  const reg = getModuleRegistry();
  const module = reg.createDefaultModule('text', 't1', hass)! as TextModule;
  Object.assign(module, overrides);
  const handler = reg.getModule('text')!;
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${handler.renderPreview(module, hass, CARD, 'live')}`, host);
  return host;
}

describe('text module: colors, icon alignment, gradients', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('text');
  });

  it('clips gradient text color onto the content', () => {
    const host = renderText({
      rich_text_content: '<p>Hello</p>',
      color: GRADIENT,
    });
    const content = host.querySelector<HTMLElement>('.rich-text-content')!;
    expect(content.style.background).toContain('linear-gradient');
    expect(content.style.backgroundClip || content.style.webkitBackgroundClip).toBe('text');
    expect(content.style.color).toBe('transparent');
    host.remove();
  });

  it('paints gradient icon color on the icon wrapper', () => {
    const host = renderText({
      rich_text_content: '<p>Hello</p>',
      icon: 'mdi:information',
      icon_color: GRADIENT,
    });
    const wrap = host.querySelector<HTMLElement>('.text-module-icon')!;
    expect(wrap.classList.contains('text-module-icon-gradient')).toBe(true);
    expect(wrap.style.background).toContain('linear-gradient');
    host.remove();
  });

  it('vertically centers the icon with the text', () => {
    const host = renderText({
      rich_text_content: '<p>Test</p>',
      icon: 'mdi:camera-iris',
      icon_position: 'after',
    });
    const preview = host.querySelector<HTMLElement>('.text-module-preview')!;
    expect(preview.style.alignItems).toBe('center');
    const icon = host.querySelector<HTMLElement>('.text-module-icon')!;
    expect(icon.style.display).toBe('inline-flex');
    expect(icon.style.alignItems).toBe('center');
    host.remove();
  });
});

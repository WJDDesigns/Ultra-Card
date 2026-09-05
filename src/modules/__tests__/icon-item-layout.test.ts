/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { IconModule } from '../../types';

/**
 * Issue #125: the Icon module gets the Info module's layout controls
 * (icon position, distribution, overall and text alignment). Defaults must keep
 * the classic centered icon-above-text arrangement.
 */

const hass: any = {
  ...mockHass,
  localize: (key: string) => key,
  states: {
    'light.kitchen': {
      entity_id: 'light.kitchen',
      state: 'on',
      attributes: { friendly_name: 'Kitchen' },
    },
  },
};

function renderIconModule(overrides: Partial<IconModule>): HTMLElement {
  const reg = getModuleRegistry();
  const module = reg.createDefaultModule('icon', 'i1', hass)! as IconModule;
  module.icons[0].entity = 'light.kitchen';
  Object.assign(module, overrides);
  const handler = reg.getModule('icon')!;
  // resolveEntity reaches for a runtime require() that vitest's ESM loader
  // cannot satisfy; identity is the right answer for a plain entity id anyway.
  (handler as any).resolveEntity = (v: string) => v;
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(
    html`${handler.renderPreview(
      module,
      hass,
      { type: 'custom:ultra-card', layout: { rows: [] } },
      'live'
    )}`,
    host
  );
  return host;
}

function itemStyle(host: HTMLElement): CSSStyleDeclaration {
  const item = host.querySelector<HTMLElement>('.icon-item-preview');
  expect(item).toBeTruthy();
  return item!.style;
}

describe('icon module: item layout', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('icon');
  });

  it('defaults to a centered column with the icon above the text', () => {
    const host = renderIconModule({});
    const style = itemStyle(host);
    expect(style.flexDirection).toBe('column');
    expect(style.alignItems).toBe('center');
    expect(style.margin).toBe('0px auto');
    const text = host.querySelector<HTMLElement>('.icon-text');
    expect(text).toBeTruthy();
    expect(text!.style.textAlign).toBe('center');
    host.remove();
  });

  it('places the icon beside the text for left/right and reverses for right/bottom', () => {
    expect(itemStyle(renderIconModule({ icon_position: 'left' })).flexDirection).toBe('row');
    expect(itemStyle(renderIconModule({ icon_position: 'right' })).flexDirection).toBe(
      'row-reverse'
    );
    expect(itemStyle(renderIconModule({ icon_position: 'bottom' })).flexDirection).toBe(
      'column-reverse'
    );
  });

  it('applies distribution, overall alignment and text alignment', () => {
    const host = renderIconModule({
      icon_position: 'left',
      content_distribution: 'space-between',
      overall_alignment: 'left',
      name_alignment: 'end',
    });
    const style = itemStyle(host);
    expect(style.justifyContent).toBe('space-between');
    expect(style.margin).toBe('0px auto 0px 0px');
    const text = host.querySelector<HTMLElement>('.icon-text')!;
    expect(text.style.alignItems).toBe('flex-end');
    expect(text.style.textAlign).toBe('right');
    expect(host.querySelector<HTMLElement>('.icon-name')!.style.textAlign).toBe('right');
    host.remove();
  });

  it('keeps the icon-to-text spacing as a flex gap so it works in every direction', () => {
    const host = renderIconModule({ icon_position: 'left' });
    const style = itemStyle(host);
    expect(style.gap).toBe('8px');
    host.remove();
  });
});

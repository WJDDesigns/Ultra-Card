/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { DrawerModule } from '../../types';

const hass: any = {
  ...mockHass,
  localize: (key: string) => key,
};

const CARD = { type: 'custom:ultra-card', layout: { rows: [] } } as any;

function renderTrigger(overrides: Partial<DrawerModule>): HTMLElement {
  const reg = getModuleRegistry();
  const module = reg.createDefaultModule('drawer', 'd1', hass)! as DrawerModule;
  Object.assign(module, { trigger_style: 'icon' }, overrides);
  const handler = reg.getModule('drawer')!;
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${handler.renderPreview(module, hass, CARD, 'live')}`, host);
  return host;
}

describe('drawer module: trigger icon styling', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('drawer');
  });

  afterEach(() => {
    document.querySelectorAll('.uc-drawer-portal').forEach(p => p.remove());
  });

  it('keeps a circle background for existing icon triggers without an explicit shape', () => {
    const host = renderTrigger({
      trigger_background: 'rgb(255, 0, 0)',
    });
    const trigger = host.querySelector<HTMLElement>('.drawer-trigger-icon-btn')!;
    expect(trigger).toBeTruthy();
    expect(trigger.style.borderRadius).toBe('50%');
    expect(trigger.style.padding).toBe('8px');
    expect(trigger.style.background).toContain('rgb(255, 0, 0)');
    host.remove();
  });

  it('does not paint a background when icon background is none', () => {
    const host = renderTrigger({
      trigger_icon_background: 'none',
      trigger_background: 'rgb(255, 0, 0)',
    });
    const trigger = host.querySelector<HTMLElement>('.drawer-trigger-icon-btn')!;
    const css = trigger.getAttribute('style') || '';
    expect(css).toMatch(/background:\s*transparent/);
    expect(trigger.style.padding).toBe('0px');
    expect(trigger.style.borderRadius).toBe('0px');
    host.remove();
  });

  it('sizes the circle from icon size plus padding like the popup trigger', () => {
    const host = renderTrigger({
      trigger_icon_background: 'circle',
      trigger_background: 'rgb(1, 2, 3)',
      trigger_icon_background_padding: 1,
      trigger_icon_size: 24,
    });
    const trigger = host.querySelector<HTMLElement>('.drawer-trigger-icon-btn')!;
    expect(trigger.style.borderRadius).toBe('50%');
    expect(trigger.style.padding).toBe('1px');
    expect(trigger.style.width).toBe('');
    expect(trigger.style.height).toBe('');
    expect(trigger.style.background).toContain('rgb(1, 2, 3)');
    const icon = trigger.querySelector<HTMLElement>('ha-icon')!;
    expect(icon.style.getPropertyValue('--mdc-icon-size')).toBe('24px');
    host.remove();
  });
});

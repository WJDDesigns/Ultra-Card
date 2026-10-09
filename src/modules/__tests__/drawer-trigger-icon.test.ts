/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { DRAWER_ICON_TRIGGER_DEFAULT_PX } from '../drawer-module';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { DrawerModule } from '../../types';
import { ucTriggerAlignStyle } from '../../utils/uc-trigger-icon';

/**
 * Drawer trigger alignment + Popup-style icon chrome (size, colour, background
 * shape). Not a copy of the Icon module tab.
 */

const hass: any = {
  ...mockHass,
  localize: (key: string) => key,
  states: {},
};

const CARD = { type: 'custom:ultra-card', layout: { rows: [] } } as any;

function renderDrawer(overrides: Partial<DrawerModule>): HTMLElement {
  const reg = getModuleRegistry();
  const module = reg.createDefaultModule('drawer', overrides.id || 'd1', hass)! as DrawerModule;
  Object.assign(module, overrides);
  const handler = reg.getModule('drawer')!;
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${handler.renderPreview(module, hass, CARD, 'live')}`, host);
  return host;
}

describe('drawer module: trigger alignment and icon chrome', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('drawer');
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('keeps the 42px box for icon triggers without an icon size', () => {
    const host = renderDrawer({ id: 'd-default-box', trigger_style: 'icon' });
    const wrapper = host.querySelector<HTMLElement>('.drawer-trigger-wrapper')!;
    expect(wrapper.style.width).toBe(`${DRAWER_ICON_TRIGGER_DEFAULT_PX}px`);
    expect(wrapper.style.height).toBe(`${DRAWER_ICON_TRIGGER_DEFAULT_PX}px`);
  });

  it('defaults to left alignment so existing cards do not jump', () => {
    const host = renderDrawer({ id: 'd-align-default', trigger_style: 'icon' });
    const align = host.querySelector<HTMLElement>('.drawer-trigger-align')!;
    expect(align).toBeTruthy();
    expect(align.getAttribute('style')).toBe(ucTriggerAlignStyle('left', 'left'));
    expect(align.style.justifyContent).toBe('flex-start');
    expect(align.style.width).toBe('100%');
  });

  it('aligns the icon trigger to the right of the module', () => {
    const host = renderDrawer({
      id: 'd-align-right',
      trigger_style: 'icon',
      trigger_alignment: 'right',
    });
    const align = host.querySelector<HTMLElement>('.drawer-trigger-align')!;
    expect(align.style.justifyContent).toBe('flex-end');
    expect(align.style.width).toBe('100%');
    expect(align.style.display).toBe('flex');
  });

  it('aligns left and center with a full-width flex row', () => {
    const left = renderDrawer({
      id: 'd-align-left',
      trigger_style: 'icon',
      trigger_alignment: 'left',
    });
    expect(left.querySelector<HTMLElement>('.drawer-trigger-align')!.style.justifyContent).toBe(
      'flex-start'
    );

    const center = renderDrawer({
      id: 'd-align-center',
      trigger_style: 'icon',
      trigger_alignment: 'center',
    });
    expect(center.querySelector<HTMLElement>('.drawer-trigger-align')!.style.justifyContent).toBe(
      'center'
    );
  });

  it('keeps the default button full-bleed (left + width 100%)', () => {
    const host = renderDrawer({ id: 'd-btn-left' });
    const wrapper = host.querySelector<HTMLElement>('.drawer-trigger-wrapper')!;
    expect(wrapper.style.width).toBe('100%');
    expect(wrapper.classList.contains('drawer-trigger-hug')).toBe(false);
    expect(host.querySelector('.drawer-trigger-btn')).toBeTruthy();
  });

  it('hugs button content when alignment is center or right', () => {
    const host = renderDrawer({ id: 'd-btn-center', trigger_alignment: 'center' });
    const wrapper = host.querySelector<HTMLElement>('.drawer-trigger-wrapper')!;
    expect(wrapper.classList.contains('drawer-trigger-hug')).toBe(true);
    expect(
      host.querySelector<HTMLElement>('.drawer-trigger-align')!.style.justifyContent
    ).toBe('center');
  });

  it('keeps a circle background for existing icon triggers without an explicit shape', () => {
    const host = renderDrawer({
      trigger_style: 'icon',
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
    const host = renderDrawer({
      trigger_style: 'icon',
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
    const host = renderDrawer({
      trigger_style: 'icon',
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


  it('draws a circle well with padding from the shared chrome helper', () => {
    const host = renderDrawer({
      id: 'd-circle',
      trigger_style: 'icon',
      trigger_icon_background: 'circle',
      trigger_icon_background_color: 'rgb(1, 2, 3)',
      trigger_icon_background_padding: 12,
      trigger_icon_size: 24,
    });
    const btn = host.querySelector<HTMLElement>('.drawer-trigger-icon-btn')!;
    expect(btn.style.borderRadius).toBe('50%');
    expect(btn.style.padding).toBe('12px');
    expect(btn.style.background).toContain('rgb(1, 2, 3)');
    expect(host.querySelector<HTMLElement>('.drawer-trigger-wrapper')!.style.width).toBe('48px');
    const icon = btn.querySelector<HTMLElement>('ha-icon')!;
    expect(icon.style.getPropertyValue('--mdc-icon-size')).toBe('24px');
  });

  it('draws a rounded-square well', () => {
    const host = renderDrawer({
      id: 'd-rounded',
      trigger_style: 'icon',
      trigger_icon_background: 'rounded-square',
      trigger_background: 'rgb(9, 9, 9)',
    });
    const btn = host.querySelector<HTMLElement>('.drawer-trigger-icon-btn')!;
    expect(btn.style.borderRadius).toBe('var(--uc-r-8, 8px)');
    expect(btn.style.background).toContain('rgb(9, 9, 9)');
  });

  it('sizes the default circle from icon size instead of 42px', () => {
    const host = renderDrawer({
      id: 'd-icon-size',
      trigger_style: 'icon',
      trigger_icon_size: 32,
    });
    const wrapper = host.querySelector<HTMLElement>('.drawer-trigger-wrapper')!;
    expect(wrapper.style.width).toBe('48px');
    expect(wrapper.style.height).toBe('48px');
  });
});

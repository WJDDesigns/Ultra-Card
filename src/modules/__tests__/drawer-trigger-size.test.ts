/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import {
  applyDrawerTriggerDesignDefaults,
  DRAWER_ICON_TRIGGER_DEFAULT_PX,
} from '../drawer-module';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { DrawerModule } from '../../types';

/**
 * Discord: switching a Drawer trigger to Icon Only looked like Design tab
 * width/height "reset" because the icon button was hardcoded to 42px.
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

describe('applyDrawerTriggerDesignDefaults', () => {
  it('defaults icon-only to 42px when Design size is empty', () => {
    const styles = applyDrawerTriggerDesignDefaults('icon', {});
    expect(styles.width).toBe(`${DRAWER_ICON_TRIGGER_DEFAULT_PX}px`);
    expect(styles.height).toBe(`${DRAWER_ICON_TRIGGER_DEFAULT_PX}px`);
  });

  it('keeps Design tab width and height on icon-only', () => {
    const styles = applyDrawerTriggerDesignDefaults('icon', {
      width: '1000px',
      height: '1000px',
    });
    expect(styles.width).toBe('1000px');
    expect(styles.height).toBe('1000px');
  });

  it('does not invent a size for the button trigger', () => {
    const styles = applyDrawerTriggerDesignDefaults('button', {});
    expect(styles.width).toBeUndefined();
    expect(styles.height).toBeUndefined();
  });

  it('sizes from icon size instead of 42px when Design is empty', () => {
    const styles = applyDrawerTriggerDesignDefaults('icon', {}, { iconSize: 32 });
    expect(styles.width).toBe('32px');
    expect(styles.height).toBe('32px');
  });

  it('adds well padding to the intrinsic size for a shaped background', () => {
    const styles = applyDrawerTriggerDesignDefaults(
      'icon',
      {},
      { iconSize: 24, background: 'circle', backgroundPadding: 8 }
    );
    expect(styles.width).toBe('40px');
    expect(styles.height).toBe('40px');
  });

  it('keeps Design size even when icon size is set', () => {
    const styles = applyDrawerTriggerDesignDefaults(
      'icon',
      { width: '1000px', height: '1000px' },
      { iconSize: 24, background: 'circle' }
    );
    expect(styles.width).toBe('1000px');
    expect(styles.height).toBe('1000px');
  });
});

describe('drawer module: icon-only trigger size', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('drawer');
  });

  it('does not hardcode 42px on the icon button class', () => {
    const css = getModuleRegistry().getModule('drawer')!.getStyles!();
    const iconBtnBlock = css.match(/\.drawer-trigger-icon-btn\s*\{[^}]+\}/)?.[0] ?? '';
    expect(iconBtnBlock).toContain('width: 100%');
    expect(iconBtnBlock).toContain('height: 100%');
    expect(iconBtnBlock).not.toMatch(/min-width:/);
    expect(iconBtnBlock).not.toMatch(/(?:^|[^\w-])width:\s*42px/);
  });

  it('sizes the inner ha-svg-icon to the ha-icon box so the glyph can centre', () => {
    const css = getModuleRegistry().getModule('drawer')!.getStyles!();
    const haIconBlock = css.match(/\.drawer-trigger-icon-btn ha-icon\s*\{[^}]+\}/)?.[0] ?? '';
    expect(haIconBlock).toContain('display: flex');
    expect(haIconBlock).toContain('align-items: center');
    expect(haIconBlock).toContain('--mdc-icon-size: 100%');
    expect(haIconBlock).not.toMatch(/--mdc-icon-size:\s*60%/);
  });

  it('renders Design tab size on the icon-only wrapper', () => {
    const host = renderDrawer({
      id: 'd-sized',
      trigger_style: 'icon',
      design: { width: '1000', height: '1000' } as any,
    });
    const wrapper = host.querySelector<HTMLElement>('.drawer-trigger-wrapper')!;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.width).toBe('1000px');
    expect(wrapper.style.height).toBe('1000px');
    expect(host.querySelector('.drawer-trigger-icon-btn')).toBeTruthy();
    host.remove();
  });

  it('defaults the icon-only wrapper to 42px when size is unset', () => {
    const host = renderDrawer({ id: 'd-default', trigger_style: 'icon' });
    const wrapper = host.querySelector<HTMLElement>('.drawer-trigger-wrapper')!;
    expect(wrapper.style.width).toBe(`${DRAWER_ICON_TRIGGER_DEFAULT_PX}px`);
    expect(wrapper.style.height).toBe(`${DRAWER_ICON_TRIGGER_DEFAULT_PX}px`);
    host.remove();
  });
});

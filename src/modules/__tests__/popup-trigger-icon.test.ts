/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { PopupModule } from '../../types';

/**
 * Issue #128: the popup trigger icon gets the Icon module's background and
 * entity-colour options, and the open animation gets speed / easing / from-edge
 * controls.
 */

const hass: any = {
  ...mockHass,
  localize: (key: string) => key,
  states: {
    'light.kitchen': {
      entity_id: 'light.kitchen',
      state: 'on',
      attributes: { friendly_name: 'Kitchen', rgb_color: [255, 0, 0] },
    },
  },
};

const CARD = { type: 'custom:ultra-card', layout: { rows: [] } } as any;

function renderTrigger(overrides: Partial<PopupModule>): HTMLElement {
  const reg = getModuleRegistry();
  const module = reg.createDefaultModule('popup', 'p1', hass)! as PopupModule;
  Object.assign(module, { trigger_type: 'icon' }, overrides);
  const handler = reg.getModule('popup')!;
  (handler as any).resolveEntity = (v: string) => v;
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${handler.renderPreview(module, hass, CARD, 'live')}`, host);
  return host;
}

describe('popup module: trigger icon styling', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('popup');
  });

  afterEach(() => {
    document.querySelectorAll('.ultra-popup-portal').forEach(p => p.remove());
  });

  it('renders a bare icon by default', () => {
    const host = renderTrigger({});
    const trigger = host.querySelector<HTMLElement>('.popup-trigger')!;
    expect(trigger).toBeTruthy();
    expect(trigger.style.background).toBe('');
    expect(trigger.style.borderRadius).toBe('');
    const icon = trigger.querySelector<HTMLElement>('ha-icon')!;
    expect(icon.getAttribute('icon')).toBe('mdi:information');
    expect(icon.style.color).toBe('var(--primary-color)');
    host.remove();
  });

  it('draws a circle background with padding and colour', () => {
    const host = renderTrigger({
      trigger_icon_background: 'circle',
      trigger_icon_background_color: 'rgb(1, 2, 3)',
      trigger_icon_background_padding: 12,
    });
    const trigger = host.querySelector<HTMLElement>('.popup-trigger')!;
    expect(trigger.style.borderRadius).toBe('50%');
    expect(trigger.style.padding).toBe('12px');
    expect(trigger.style.background).toContain('rgb(1, 2, 3)');
    host.remove();
  });

  it('colours the icon from the entity when enabled, honouring state colours first', () => {
    const fromRgb = renderTrigger({
      trigger_icon_use_entity_color: true,
      trigger_icon_color_entity: 'light.kitchen',
      trigger_icon_color: 'blue',
    });
    expect(fromRgb.querySelector<HTMLElement>('.popup-trigger ha-icon')!.style.color).toBe(
      'rgb(255, 0, 0)'
    );
    fromRgb.remove();

    const fromMap = renderTrigger({
      trigger_icon_use_entity_color: true,
      trigger_icon_color_entity: 'light.kitchen',
      trigger_icon_state_colors: { on: 'green' },
    });
    expect(fromMap.querySelector<HTMLElement>('.popup-trigger ha-icon')!.style.color).toBe('green');
    fromMap.remove();
  });

  it('aligns the trigger to the right of the module, not the left', () => {
    const host = renderTrigger({ id: 'p-right', trigger_alignment: 'right' });
    const align = host.querySelector<HTMLElement>('.popup-trigger-align')!;
    expect(align).toBeTruthy();
    expect(align.style.display).toBe('flex');
    expect(align.style.width).toBe('100%');
    expect(align.style.justifyContent).toBe('flex-end');
    host.remove();
  });

  it('aligns left and center with a full-width flex row', () => {
    const left = renderTrigger({ id: 'p-left', trigger_alignment: 'left' });
    expect(left.querySelector<HTMLElement>('.popup-trigger-align')!.style.justifyContent).toBe(
      'flex-start'
    );
    expect(left.querySelector<HTMLElement>('.popup-trigger-align')!.style.width).toBe('100%');
    left.remove();

    const center = renderTrigger({ id: 'p-center', trigger_alignment: 'center' });
    expect(center.querySelector<HTMLElement>('.popup-trigger-align')!.style.justifyContent).toBe(
      'center'
    );
    expect(center.querySelector<HTMLElement>('.popup-trigger-align')!.style.width).toBe('100%');
    center.remove();
  });
});

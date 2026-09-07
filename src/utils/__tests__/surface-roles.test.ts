/** @vitest-environment jsdom */
/**
 * Every module that paints a surface announces it with `data-uc-role`
 * (and `data-uc-surface` for controls). Theme CSS targets these attributes,
 * so they are part of the theme contract.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../../modules/module-registry';
import { BaseUltraModule } from '../../modules/base-module';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import { ucThemeService } from '../../services/uc-theme-service';

(BaseUltraModule.prototype as any).resolveEntity = (v: string | undefined) => v;

const hass = {
  ...mockHass,
  states: {
    'sensor.level': { entity_id: 'sensor.level', state: '55', attributes: { unit_of_measurement: '%' } },
    'light.lamp': { entity_id: 'light.lamp', state: 'on', attributes: { brightness: 140, friendly_name: 'Lamp' } },
    'switch.fan': { entity_id: 'switch.fan', state: 'off', attributes: { friendly_name: 'Fan' } },
  },
} as any;

function paint(type: string, patch: Record<string, unknown>, uc_theme?: string): HTMLElement {
  const reg = getModuleRegistry();
  const module = { ...reg.createDefaultModule(type, `r-${type}`, hass)!, ...patch };
  const config = { type: 'custom:ultra-card', layout: { rows: [] }, uc_theme } as any;
  const host = document.createElement('div');
  document.body.appendChild(host);
  render(html`${reg.getModule(type)!.renderPreview(module as any, hass, config, 'live')}`, host);
  return host;
}

describe('surface role hooks', () => {
  beforeAll(async () => {
    const reg = getModuleRegistry();
    await Promise.all(
      ['bar', 'slider_control', 'button', 'spinbox', 'popup', 'tabs', 'grid', 'auto_entity_list', 'activity_feed'].map(t =>
        reg.ensureModuleLoaded(t)
      )
    );
    ucThemeService.setGlobalDefault(null);
  });

  it('control and track surfaces carry role + surface', () => {
    const bar = paint('bar', { entity: 'sensor.level', bar_style: 'glass' });
    expect(bar.querySelector('[data-uc-role="track"]')?.getAttribute('data-uc-surface')).toBe('glass');
    expect(bar.querySelector('[data-uc-role="fill"]')?.getAttribute('data-uc-surface')).toBe('glass');
    const btn = paint('button', { style: 'neumorphic', label: 'Go', background_color: '#2196f3' });
    expect(btn.querySelector('[data-uc-role="control"]')?.getAttribute('data-uc-surface')).toBe('neumorphic');
    const spin = paint('spinbox', { button_style: 'glossy', entity: 'sensor.level' });
    expect(spin.querySelectorAll('[data-uc-role="control"][data-uc-surface="glossy"]')).toHaveLength(2);
    const slider = paint('slider_control', { bars: [{ id: 'b', entity: 'light.lamp', slider_style: 'inset' }] });
    expect(slider.querySelector('[data-uc-role="track"]')?.getAttribute('data-uc-surface')).toBe('inset');
  });

  it('bar without a style (legacy config) reads as flat', () => {
    const bar = paint('bar', { entity: 'sensor.level', bar_style: undefined });
    expect(bar.querySelector('[data-uc-role="track"]')?.getAttribute('data-uc-surface')).toBe('flat');
  });

  it('tabs: switch track is a pane, active tab is a control that only changes under a themed recipe', () => {
    const sections = [
      { id: 'a', title: 'One' },
      { id: 'b', title: 'Two' },
    ];
    const plain = paint('tabs', { style: 'switch_1', sections, default_tab: 'a' });
    const header = plain.querySelector<HTMLElement>('[data-uc-role="pane"]')!;
    expect(header.className).toContain('ultra-tabs-header');
    expect(header.getAttribute('style')).toContain('var(--uc-pane-bg, var(--secondary-background-color))');
    const active = plain.querySelector<HTMLElement>('.ultra-tab-btn.active')!;
    expect(active.getAttribute('data-uc-role')).toBe('control');
    expect(active.getAttribute('data-uc-surface')).toBe('flat');
    expect(active.getAttribute('style')).not.toContain('backdrop-filter');

    // Glass theme: controls derive to glass, so the active tab gets the recipe.
    const themed = paint('tabs', { style: 'switch_1', sections, default_tab: 'a' }, 'glass');
    const themedActive = themed.querySelector<HTMLElement>('.ultra-tab-btn.active')!;
    expect(themedActive.getAttribute('data-uc-surface')).toBe('glass');
    expect(themedActive.getAttribute('style')).toContain('backdrop-filter');

    // Layout styles that draw their own chrome stay out of it.
    const simple = paint('tabs', { style: 'simple', sections, default_tab: 'a' }, 'glass');
    expect(simple.querySelector<HTMLElement>('[data-uc-role="pane"]')!.getAttribute('style')).not.toContain('--uc-pane-border');
  });

  it('grid tiles are panes and keep user colours', () => {
    const entities = [{ id: 'e1', entity: 'switch.fan' }];
    const grid = paint('grid', { grid_style: 'style_1', entities });
    const tile = grid.querySelector<HTMLElement>('.uc-grid-item')!;
    expect(tile.getAttribute('data-uc-role')).toBe('pane');
    expect(tile.getAttribute('style')).toContain('var(--uc-pane-bg, var(--card-background-color))');
    expect(tile.getAttribute('style')).toContain('border: var(--uc-pane-border, none)');
    expect(tile.getAttribute('style')).not.toContain('box-shadow');

    const custom = paint('grid', { grid_style: 'style_1', entities, global_background_color: '#123456' });
    const s = custom.querySelector<HTMLElement>('.uc-grid-item')!.getAttribute('style')!;
    expect(s).toContain('background: #123456');
    expect(s).not.toContain('--uc-pane-border');

    const own = paint('grid', { grid_style: 'style_16', entities });
    expect(own.querySelector<HTMLElement>('.uc-grid-item')!.getAttribute('style')).not.toContain('--uc-pane-border');
  });

  it('auto-entity rows and feed cards are panes', () => {
    const ael = paint('auto_entity_list', {
      pinned_entities: ['light.lamp', 'switch.fan'],
      include_domains: ['light', 'switch'],
      row_style: 'compact',
    });
    expect(ael.querySelectorAll('.uc-ael-row[data-uc-role="pane"]').length).toBeGreaterThan(0);
  });
});

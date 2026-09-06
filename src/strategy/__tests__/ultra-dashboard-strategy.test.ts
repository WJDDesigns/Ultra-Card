/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  registerUltraDashboardStrategy,
  UltraDashboardStrategy,
  UltraDashboardAreaViewStrategy,
  ULTRA_DASHBOARD_STRATEGY_TYPE,
  __resetUltraDashboardStrategyLoaderForTests,
} from '../ultra-dashboard-strategy';
import '../ultra-dashboard-strategy-editor';
import type { UltraDashboardStrategyConfig } from '../types';

describe('Ultra Dashboard strategy registration', () => {
  beforeEach(() => {
    window.customStrategies = [];
    __resetUltraDashboardStrategyLoaderForTests();
  });

  it('defines the dashboard and view strategy elements and announces the dashboard once', () => {
    registerUltraDashboardStrategy();
    registerUltraDashboardStrategy();
    expect(customElements.get('ll-strategy-dashboard-ultra-dashboard')).toBe(
      UltraDashboardStrategy
    );
    expect(customElements.get('ll-strategy-view-ultra-dashboard-area')).toBe(
      UltraDashboardAreaViewStrategy
    );
    expect(window.customStrategies).toHaveLength(1);
    expect(window.customStrategies![0]).toMatchObject({
      type: ULTRA_DASHBOARD_STRATEGY_TYPE,
      strategyType: 'dashboard',
      name: 'Ultra Dashboard',
    });
  });

  it('works with no configuration and suggests a title and icon for the create dialog', () => {
    expect(UltraDashboardStrategy.configRequired).toBe(false);
    expect(UltraDashboardStrategy.getCreateSuggestions()).toEqual({
      title: 'Ultra Dashboard',
      icon: 'mdi:view-dashboard-variant',
    });
  });

  it('hands off generate() and getConfigElement() to the lazy chunk', async () => {
    const hass: any = {
      states: {},
      areas: {},
      floors: {},
      devices: {},
      entities: {},
      localize: (k: string) => k,
    };
    const dash = await UltraDashboardStrategy.generate({ type: 'custom:ultra-dashboard' }, hass);
    expect(dash.views).toHaveLength(1);
    const editor = await UltraDashboardStrategy.getConfigElement();
    expect(editor.tagName.toLowerCase()).toBe('ultra-dashboard-strategy-editor');
  });
});

describe('ultra-dashboard-strategy-editor', () => {
  let el: HTMLElement & {
    setConfig(c: UltraDashboardStrategyConfig): void;
    hass?: unknown;
    updateComplete: Promise<unknown>;
    shadowRoot: ShadowRoot;
  };

  beforeEach(async () => {
    el = document.createElement('ultra-dashboard-strategy-editor') as typeof el;
    document.body.appendChild(el);
    el.setConfig({ type: 'custom:ultra-dashboard', style: 'glass', areas: ['kitchen'] });
    await el.updateComplete;
  });

  afterEach(() => {
    el.remove();
  });

  it('shows the four styles with the configured one selected', () => {
    const buttons = Array.from(el.shadowRoot.querySelectorAll<HTMLButtonElement>('.style'));
    expect(buttons.map(b => b.querySelector('.name')?.textContent?.trim())).toEqual([
      'Classic',
      'Soft',
      'Glass',
      'Bold',
    ]);
    expect(buttons.find(b => b.classList.contains('selected'))?.textContent).toContain('Glass');
  });

  it('emits config-changed with the new style and keeps the rest of the config', async () => {
    const onChange = vi.fn();
    el.addEventListener('config-changed', onChange);
    el.shadowRoot.querySelectorAll<HTMLButtonElement>('.style')[3].click();
    await el.updateComplete;
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].detail.config).toEqual({
      type: 'custom:ultra-dashboard',
      style: 'bold',
      areas: ['kitchen'],
    });
    // Picking the already-selected style is a no-op.
    el.shadowRoot.querySelectorAll<HTMLButtonElement>('.style')[3].click();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('drops values equal to the defaults so the stored config stays short', async () => {
    const onChange = vi.fn();
    el.addEventListener('config-changed', onChange);
    // Simulate ha-form reporting every field, most of them at their defaults.
    (el as any)._formChanged(
      new CustomEvent('value-changed', {
        detail: {
          value: {
            group_by: 'floor',
            areas: [],
            exclude_areas: ['garage'],
            weather_entity: '',
            home_view: true,
            show_people: false,
            show_alerts: true,
            show_batteries: true,
            show_updates: true,
          },
        },
      })
    );
    expect(onChange.mock.calls[0][0].detail.config).toEqual({
      type: 'custom:ultra-dashboard',
      style: 'glass',
      group_by: 'floor',
      exclude_areas: ['garage'],
      show_people: false,
    });
  });
});
